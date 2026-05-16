import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { ethers } from 'npm:ethers@6.11.0';

// ── Env vars ──────────────────────────────────────────────────────────────────
const CONTRACT_ADDRESS = Deno.env.get('ATHLETE_TOKEN_ADDRESS');
const PRIVATE_KEY      = Deno.env.get('MINTING_PRIVATE_KEY');
const POLYGON_RPC      = Deno.env.get('POLYGON_RPC');

// ── ABI (SDAthleteNFT.sol — ERC-1155) ────────────────────────────────────────
const NFT_ABI = [
  'function mint(address to, uint256 tokenId, uint256 amount, string athleteName) payable returns (uint256)',
  'function adminMint(address to, uint256 tokenId, uint256 amount, string athleteName) returns (uint256)',
  'function availableSupply(uint256 tokenId) view returns (uint256)',
  'function tierPrice(uint256 tokenId) view returns (uint256)',
  'function totalMinted(uint256 tokenId) view returns (uint256)',
  'event AthleteCardMinted(address indexed recipient, uint256 indexed tokenId, uint256 amount, string athleteName, uint256 serialStart)',
];

const TIER_TOKEN_ID = {
  rising_star:     1,
  breakout_talent: 2,
  elite_performer: 3,
  living_legend:   4,
};

const MIN_CONFIRMATIONS = 2;

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  if (!CONTRACT_ADDRESS || !PRIVATE_KEY || !POLYGON_RPC) {
    return Response.json({
      error: 'Blockchain not configured. Set ATHLETE_TOKEN_ADDRESS, MINTING_PRIVATE_KEY, POLYGON_RPC in env vars.',
    }, { status: 503 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const user   = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { athleteTokenId, recipientAddress, recipientEmail, amount = 1, adminFree = false } = body;

    if (!athleteTokenId || !recipientAddress || !recipientEmail) {
      return Response.json({ error: 'Missing: athleteTokenId, recipientAddress, recipientEmail' }, { status: 400 });
    }

    if (!ethers.isAddress(recipientAddress)) {
      return Response.json({ error: `Invalid wallet address: ${recipientAddress}` }, { status: 400 });
    }

    // Admin-free minting requires admin role
    if (adminFree && user.role !== 'admin') {
      return Response.json({ error: 'Free minting requires admin role' }, { status: 403 });
    }

    // Load token record
    const records = await base44.asServiceRole.entities.AthleteToken.filter({ id: athleteTokenId });
    const token   = records?.[0];
    if (!token) return Response.json({ error: 'Athlete token not found' }, { status: 404 });

    if (token.available_supply <= 0 || token.status === 'sold_out') {
      return Response.json({ error: 'Token is sold out' }, { status: 409 });
    }
    if (token.available_supply < amount) {
      return Response.json({ error: `Only ${token.available_supply} left` }, { status: 409 });
    }

    const tokenId = TIER_TOKEN_ID[token.token_tier];
    if (!tokenId) return Response.json({ error: `Unknown tier: ${token.token_tier}` }, { status: 400 });

    // Idempotency check
    const existing = await base44.asServiceRole.entities.NFTOwnership.filter({
      nft_id: athleteTokenId, buyer_email: recipientEmail,
    });
    if (existing?.length > 0) {
      return Response.json({
        error: 'Already owns this token',
        txHash: existing[0].transaction_hash,
      }, { status: 409 });
    }

    // ── Blockchain mint ───────────────────────────────────────────────────────
    const provider = new ethers.JsonRpcProvider(POLYGON_RPC);
    const signer   = new ethers.Wallet(PRIVATE_KEY, provider);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, NFT_ABI, signer);

    // Get on-chain price
    const pricePerToken = await contract.tierPrice(tokenId);
    const totalValue    = pricePerToken * BigInt(amount);

    // Gas estimate
    let gasEstimate;
    try {
      if (adminFree) {
        gasEstimate = await contract.adminMint.estimateGas(recipientAddress, tokenId, amount, token.athlete_name);
      } else {
        gasEstimate = await contract.mint.estimateGas(
          recipientAddress, tokenId, amount, token.athlete_name,
          { value: totalValue }
        );
      }
    } catch (e) {
      return Response.json({ error: `Contract call would fail: ${e.message}` }, { status: 422 });
    }

    const gasLimit = (gasEstimate * 130n) / 100n;

    // Send transaction
    let tx;
    try {
      if (adminFree) {
        tx = await contract.adminMint(recipientAddress, tokenId, amount, token.athlete_name, { gasLimit });
      } else {
        tx = await contract.mint(
          recipientAddress, tokenId, amount, token.athlete_name,
          { value: totalValue, gasLimit }
        );
      }
    } catch (e) {
      return Response.json({ error: `TX send failed: ${e.message}` }, { status: 502 });
    }

    // Wait for confirmations
    let receipt;
    try {
      receipt = await tx.wait(MIN_CONFIRMATIONS);
    } catch (e) {
      return Response.json({ error: `TX reverted: ${e.message}`, txHash: tx.hash }, { status: 502 });
    }

    // ── DB writes ─────────────────────────────────────────────────────────────
    const serialStart = (token.total_supply - token.available_supply) + 1;
    try {
      const creates = Array.from({ length: amount }, (_, i) =>
        base44.asServiceRole.entities.NFTOwnership.create({
          nft_id:            athleteTokenId,
          athlete_name:      token.athlete_name,
          card_number:       token.card_number,
          serial_number:     serialStart + i,
          rarity:            token.token_tier,
          purchase_price:    token.current_price ?? token.base_price,
          purchase_type:     adminFree ? 'reward' : 'mint',
          buyer_email:       recipientEmail,
          minted_at:         new Date().toISOString(),
          transaction_hash:  receipt.hash,
          chain:             'polygon',
          contract_address:  CONTRACT_ADDRESS,
          token_id_on_chain: tokenId,
          wallet_address:    recipientAddress,
        })
      );
      await Promise.all(creates);

      const newSupply = token.available_supply - amount;
      await base44.asServiceRole.entities.AthleteToken.update(athleteTokenId, {
        available_supply: newSupply,
        status: newSupply <= 0 ? 'sold_out' : 'active',
      });
    } catch (dbErr) {
      console.error(`CRITICAL: mint succeeded (${receipt.hash}) but DB write failed:`, dbErr.message);
      return Response.json({
        success: true,
        warning: 'Minted on-chain but DB record failed. Manual fix needed.',
        txHash:  receipt.hash,
      }, { status: 207 });
    }

    return Response.json({
      success:        true,
      athleteName:    token.athlete_name,
      tier:           token.token_tier,
      tokenId,
      amount,
      serialStart,
      recipient:      recipientAddress,
      txHash:         receipt.hash,
      blockNumber:    receipt.blockNumber,
      explorerUrl:    `https://polygonscan.com/tx/${receipt.hash}`,
    });

  } catch (error) {
    console.error('[mintAthleteToken]', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});