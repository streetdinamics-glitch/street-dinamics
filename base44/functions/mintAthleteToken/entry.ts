import { createClientFromRequest } from 'npm:@base44/sdk@0.8.0'; // FIX #8: consistent version
import { ethers } from 'npm:ethers@6.11.0';

// ── Env vars ──────────────────────────────────────────────────────────────────
const ATHLETE_TOKEN_ADDRESS = Deno.env.get('ATHLETE_TOKEN_ADDRESS');
const PRIVATE_KEY           = Deno.env.get('MINTING_PRIVATE_KEY');
const POLYGON_RPC           = Deno.env.get('POLYGON_RPC'); // FIX #15: no silent fallback

// FIX #1: validate config at startup, not mid-request
if (!ATHLETE_TOKEN_ADDRESS || !PRIVATE_KEY || !POLYGON_RPC) {
  console.error('[mintAthleteToken] FATAL: Missing required env vars: ATHLETE_TOKEN_ADDRESS, MINTING_PRIVATE_KEY, POLYGON_RPC');
}

// ── ABI ───────────────────────────────────────────────────────────────────────
const ATHLETE_TOKEN_ABI = [
  'function mint(address to, uint256 tokenId, uint256 amount, bytes data)',
  'function uri(uint256 tokenId) view returns (string)',
  'event TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 value)',
];

// ── Constants ─────────────────────────────────────────────────────────────────
type TokenTier = 'rising_star' | 'breakout_talent' | 'elite_performer' | 'living_legend';

const TIER_TOKEN_ID: Record<TokenTier, number> = {
  rising_star:     1,
  breakout_talent: 2,
  elite_performer: 3,
  living_legend:   4,
};

const MIN_CONFIRMATIONS = 3; // FIX #13: reorg safety on Polygon
const MAX_MINT_AMOUNT   = 100;

// ── Types ─────────────────────────────────────────────────────────────────────
interface RequestBody {
  athleteTokenId:   string;
  recipientAddress: string;
  recipientEmail:   string;
  amount?:          number;
}

interface AthleteTokenRecord {
  id:               string;
  athlete_name:     string;
  card_number:      string | number;
  token_tier:       TokenTier;
  available_supply: number;
  total_supply:     number;
  current_price?:   number;
  base_price:       number;
  status:           string;
}

// ── Main Handler ──────────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  // FIX #1: fail fast if blockchain not configured
  if (!ATHLETE_TOKEN_ADDRESS || !PRIVATE_KEY || !POLYGON_RPC) {
    return Response.json({
      error: 'Blockchain not configured. Set ATHLETE_TOKEN_ADDRESS, MINTING_PRIVATE_KEY, and POLYGON_RPC.',
    }, { status: 503 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const user   = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin only' }, { status: 403 });
    }

    // Parse & validate body
    let body: RequestBody;
    try {
      body = await req.json();
    } catch {
      return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { athleteTokenId, recipientAddress, recipientEmail, amount = 1 } = body;

    if (!athleteTokenId || !recipientAddress || !recipientEmail) {
      return Response.json({ error: 'Missing required fields: athleteTokenId, recipientAddress, recipientEmail' }, { status: 400 });
    }

    // FIX #5: validate wallet address before touching the blockchain
    if (!ethers.isAddress(recipientAddress)) {
      return Response.json({ error: `Invalid Ethereum address: ${recipientAddress}` }, { status: 400 });
    }

    // FIX #6: validate amount
    if (!Number.isInteger(amount) || amount < 1 || amount > MAX_MINT_AMOUNT) {
      return Response.json({ error: `amount must be an integer between 1 and ${MAX_MINT_AMOUNT}` }, { status: 400 });
    }

    // Load AthleteToken record
    const tokenRecords: AthleteTokenRecord[] = await base44.asServiceRole.entities.AthleteToken.filter({
      id: athleteTokenId,
    });
    const tokenRecord = tokenRecords?.[0];
    if (!tokenRecord) {
      return Response.json({ error: 'Athlete token record not found' }, { status: 404 });
    }

    // FIX #10: check supply before doing anything on-chain
    const currentSupply = tokenRecord.available_supply ?? 0;
    if (currentSupply <= 0 || tokenRecord.status === 'sold_out') {
      return Response.json({ error: 'Token is sold out' }, { status: 409 });
    }
    if (currentSupply < amount) {
      return Response.json({
        error: `Insufficient supply. Requested: ${amount}, Available: ${currentSupply}`,
      }, { status: 409 });
    }

    const erc1155TokenId = TIER_TOKEN_ID[tokenRecord.token_tier];
    if (!erc1155TokenId) {
      return Response.json({ error: `Unknown token tier: ${tokenRecord.token_tier}` }, { status: 400 });
    }

    // FIX #16: idempotency check — prevent double-mint for same token + recipient
    const existingOwnership = await base44.asServiceRole.entities.NFTOwnership.filter({
      nft_id:      athleteTokenId,
      buyer_email: recipientEmail,
    });
    if (existingOwnership?.length > 0) {
      return Response.json({
        error: 'This recipient already owns this token. Duplicate mint blocked.',
        existingTxHash: existingOwnership[0].transaction_hash,
      }, { status: 409 });
    }

    // ── Blockchain mint ───────────────────────────────────────────────────────
    const provider = new ethers.JsonRpcProvider(POLYGON_RPC);
    const signer   = new ethers.Wallet(PRIVATE_KEY, provider);
    const contract = new ethers.Contract(ATHLETE_TOKEN_ADDRESS, ATHLETE_TOKEN_ABI, signer);

    // FIX #12: estimate gas before sending
    let gasEstimate: bigint;
    try {
      gasEstimate = await contract.mint.estimateGas(recipientAddress, erc1155TokenId, amount, '0x');
    } catch (gasErr: unknown) {
      const msg = gasErr instanceof Error ? gasErr.message : 'Unknown error';
      console.error('[mintAthleteToken] Gas estimation failed:', gasErr);
      return Response.json({ error: `Contract call would fail: ${msg}` }, { status: 422 });
    }

    // Add 20% gas buffer
    const gasLimit = (gasEstimate * 120n) / 100n;

    // FIX #7: separate tx send from receipt wait for clearer error handling
    let tx;
    try {
      tx = await contract.mint(recipientAddress, erc1155TokenId, amount, '0x', { gasLimit });
    } catch (txErr: unknown) {
      const msg = txErr instanceof Error ? txErr.message : 'Unknown error';
      console.error('[mintAthleteToken] Transaction send failed:', txErr);
      return Response.json({ error: `Transaction failed to send: ${msg}` }, { status: 502 });
    }

    // FIX #13: wait for MIN_CONFIRMATIONS
    let receipt;
    try {
      receipt = await tx.wait(MIN_CONFIRMATIONS);
    } catch (waitErr: unknown) {
      const msg = waitErr instanceof Error ? waitErr.message : 'Unknown error';
      console.error('[mintAthleteToken] Transaction reverted or timed out:', waitErr);
      return Response.json({
        error:  `Transaction reverted or timed out: ${msg}`,
        txHash: tx.hash, // FIX: return hash even on failure so it can be investigated
      }, { status: 502 });
    }

    // ── DB writes (post-chain confirmation) ───────────────────────────────────
    // FIX #9: correct serial_number = total_supply - available_supply + 1
    const totalSupply  = tokenRecord.total_supply  ?? 0;
    const serialNumber = totalSupply - currentSupply + 1;

    // FIX #4: wrap DB writes in try/catch independently — chain is already done
    try {
      // FIX #17: create one NFTOwnership record per token minted if amount > 1
      const ownershipCreates = Array.from({ length: amount }, (_, i) =>
        base44.asServiceRole.entities.NFTOwnership.create({
          nft_id:           athleteTokenId,
          athlete_name:     tokenRecord.athlete_name,
          card_number:      tokenRecord.card_number,
          serial_number:    serialNumber + i,
          rarity:           tokenRecord.token_tier,
          purchase_price:   tokenRecord.current_price ?? tokenRecord.base_price, // FIX #14: nullish coalescing
          purchase_type:    'mint',
          buyer_email:      recipientEmail,
          minted_at:        new Date().toISOString(),
          transaction_hash: receipt.hash,
          chain:            'polygon',
          contract_address: ATHLETE_TOKEN_ADDRESS,
          token_id_on_chain: erc1155TokenId,
        })
      );
      await Promise.all(ownershipCreates);

      // FIX #2 & #3: use values derived from the record we already read — no re-read race condition
      const newSupply = currentSupply - amount; // always >= 0 because we checked above
      await base44.asServiceRole.entities.AthleteToken.update(athleteTokenId, {
        available_supply: newSupply,
        status:           newSupply <= 0 ? 'sold_out' : 'active',
      });

    } catch (dbErr: unknown) {
      // FIX #4: chain tx confirmed but DB failed — log loudly for manual recovery
      const msg = dbErr instanceof Error ? dbErr.message : 'Unknown error';
      console.error(
        `[mintAthleteToken] CRITICAL: On-chain mint succeeded (txHash: ${receipt.hash}) but DB write failed: ${msg}`,
        dbErr
      );
      // Still return success with a warning so the admin knows the tx went through
      return Response.json({
        success:   true,
        warning:   'Token minted on-chain but DB record failed to save. Manual intervention required.',
        txHash:    receipt.hash,
        dbError:   msg,
      }, { status: 207 }); // 207 Multi-Status
    }

    return Response.json({
      success:         true,
      athleteName:     tokenRecord.athlete_name,
      tier:            tokenRecord.token_tier,
      erc1155TokenId,
      amount,
      recipient:       recipientAddress,
      txHash:          receipt.hash,
      blockNumber:     receipt.blockNumber,
      polygonScanUrl:  `https://polygonscan.com/tx/${receipt.hash}`,
      serialNumbers:   Array.from({ length: amount }, (_, i) => serialNumber + i),
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    const name    = error instanceof Error ? error.name    : 'Error';
    console.error(`[mintAthleteToken] ${name}:`, error);
    return Response.json({ error: message, type: name }, { status: 500 });
  }
});
