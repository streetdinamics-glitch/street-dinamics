import { createClientFromRequest } from 'npm:@base44/sdk@0.8.0'; // FIX #13: consistent version
import { ethers } from 'npm:ethers@6.11.0';

// ── Env vars ──────────────────────────────────────────────────────────────────
const NFT_CLIPS_ADDRESS = Deno.env.get('NFT_CLIPS_ADDRESS');
const PRIVATE_KEY       = Deno.env.get('MINTING_PRIVATE_KEY');
const POLYGON_RPC       = Deno.env.get('POLYGON_RPC'); // FIX #1: no silent fallback

// FIX #2: validate at startup
if (!NFT_CLIPS_ADDRESS || !PRIVATE_KEY || !POLYGON_RPC) {
  console.error('[mintNFTClip] FATAL: Missing required env vars: NFT_CLIPS_ADDRESS, MINTING_PRIVATE_KEY, POLYGON_RPC');
}

// ── ABI ───────────────────────────────────────────────────────────────────────
const NFT_CLIPS_ABI = [
  'function createDrop(string uri, uint256 maxSupply, address royaltyReceiver, uint96 royaltyBps) returns (uint256 dropId)',
  'function mint(address to, uint256 dropId, uint256 amount, bytes data)',
  'event DropCreated(uint256 indexed dropId, string uri, uint256 maxSupply)',
  'event TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 value)',
];

// ── Constants ─────────────────────────────────────────────────────────────────
const MIN_CONFIRMATIONS = 3;  // FIX #11: reorg safety on Polygon
const MAX_MINT_AMOUNT   = 100;
const ROYALTY_BPS       = 1000; // 10%

// ── Types ─────────────────────────────────────────────────────────────────────
interface RequestBody {
  nftCardId:        string;
  recipientAddress: string;
  recipientEmail:   string;
  amount?:          number;
}

interface NFTCollectionCard {
  id:                 string;
  athlete_name:       string;
  event_moment?:      string;
  card_number:        string | number;
  rarity:             string;
  status:             string;
  total_supply:       number;
  minted_count:       number;
  mint_price?:        number;
  metadata_uri?:      string;
  image_url?:         string;
  royalty_address?:   string;
  on_chain_drop_id?:  string | number | null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

// FIX #5: safe drop ID extraction — never fall back to raw topic bytes
function extractDropId(
  receipt:  ethers.TransactionReceipt,
  contract: ethers.Contract,
): string {
  for (const log of receipt.logs) {
    try {
      const parsed = contract.interface.parseLog(log);
      if (parsed?.name === 'DropCreated') {
        return parsed.args.dropId.toString();
      }
    } catch {
      // not this log
    }
  }
  throw new Error('DropCreated event not found in transaction receipt — cannot determine on-chain drop ID');
}

// ── Main Handler ──────────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  // FIX #2: fail fast if blockchain not configured
  if (!NFT_CLIPS_ADDRESS || !PRIVATE_KEY || !POLYGON_RPC) {
    return Response.json({
      error: 'Blockchain not configured. Set NFT_CLIPS_ADDRESS, MINTING_PRIVATE_KEY, and POLYGON_RPC.',
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

    // FIX #14: safe body parse
    let body: RequestBody;
    try {
      body = await req.json();
    } catch {
      return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { nftCardId, recipientAddress, recipientEmail, amount = 1 } = body;

    if (!nftCardId || !recipientAddress || !recipientEmail) {
      return Response.json({
        error: 'Missing required fields: nftCardId, recipientAddress, recipientEmail',
      }, { status: 400 });
    }

    // FIX #8: validate wallet address before any DB or chain work
    if (!ethers.isAddress(recipientAddress)) {
      return Response.json({ error: `Invalid Ethereum address: ${recipientAddress}` }, { status: 400 });
    }

    // FIX #7: validate amount
    if (!Number.isInteger(amount) || amount < 1 || amount > MAX_MINT_AMOUNT) {
      return Response.json({
        error: `amount must be an integer between 1 and ${MAX_MINT_AMOUNT}`,
      }, { status: 400 });
    }

    // Load card record
    const cardRecords: NFTCollectionCard[] = await base44.asServiceRole.entities.NFTCollectionCard.filter({
      id: nftCardId,
    });
    const card = cardRecords?.[0];
    if (!card) {
      return Response.json({ error: 'NFT card not found' }, { status: 404 });
    }
    if (card.status !== 'live') {
      return Response.json({ error: 'Drop is not live' }, { status: 400 });
    }

    // FIX #12: check remaining supply accounts for requested amount
    const remaining = (card.total_supply ?? 0) - (card.minted_count ?? 0);
    if (remaining <= 0) {
      return Response.json({ error: 'Sold out' }, { status: 409 });
    }
    if (remaining < amount) {
      return Response.json({
        error: `Insufficient supply. Requested: ${amount}, Remaining: ${remaining}`,
      }, { status: 409 });
    }

    // FIX #9: idempotency — block duplicate mint for same card + recipient
    const existingOwnership = await base44.asServiceRole.entities.NFTOwnership.filter({
      nft_id:      nftCardId,
      buyer_email: recipientEmail,
    });
    if (existingOwnership?.length > 0) {
      return Response.json({
        error:          'This recipient already owns this NFT clip. Duplicate mint blocked.',
        existingTxHash: existingOwnership[0].transaction_hash,
      }, { status: 409 });
    }

    // FIX #19: require metadata URI — never create a drop with empty URI
    const metadataUri = card.metadata_uri || card.image_url;
    if (!metadataUri) {
      return Response.json({
        error: 'NFT card has no metadata_uri or image_url — cannot create on-chain drop',
      }, { status: 422 });
    }

    // ── Blockchain setup ──────────────────────────────────────────────────────
    const provider = new ethers.JsonRpcProvider(POLYGON_RPC);
    const signer   = new ethers.Wallet(PRIVATE_KEY, provider);
    const contract = new ethers.Contract(NFT_CLIPS_ADDRESS, NFT_CLIPS_ABI, signer);

    // FIX #18: normalise on_chain_drop_id — treat 0 as valid, only null/undefined triggers create
    let onChainDropId: string | null =
      card.on_chain_drop_id != null ? String(card.on_chain_drop_id) : null;

    // ── Create on-chain drop if needed ────────────────────────────────────────
    // FIX #4: check again inside the request — still a narrow race window but best-effort
    if (onChainDropId === null) {
      const royaltyAddress = card.royalty_address || signer.address;

      // FIX #10: estimate gas before sending
      let createGas: bigint;
      try {
        createGas = await contract.createDrop.estimateGas(
          metadataUri, card.total_supply, royaltyAddress, ROYALTY_BPS
        );
      } catch (gasErr: unknown) {
        const msg = gasErr instanceof Error ? gasErr.message : 'Unknown error';
        return Response.json({ error: `createDrop would fail: ${msg}` }, { status: 422 });
      }

      let createTx;
      try {
        createTx = await contract.createDrop(
          metadataUri,
          card.total_supply,
          royaltyAddress,
          ROYALTY_BPS,
          { gasLimit: (createGas * 120n) / 100n },
        );
      } catch (txErr: unknown) {
        const msg = txErr instanceof Error ? txErr.message : 'Unknown error';
        return Response.json({ error: `createDrop transaction failed: ${msg}` }, { status: 502 });
      }

      let createReceipt: ethers.TransactionReceipt;
      try {
        createReceipt = await createTx.wait(MIN_CONFIRMATIONS); // FIX #11
      } catch (waitErr: unknown) {
        const msg = waitErr instanceof Error ? waitErr.message : 'Unknown error';
        return Response.json({
          error:  `createDrop reverted or timed out: ${msg}`,
          txHash: createTx.hash,
        }, { status: 502 });
      }

      // FIX #5: safe drop ID extraction — throws if event not found
      try {
        onChainDropId = extractDropId(createReceipt, contract);
      } catch (parseErr: unknown) {
        const msg = parseErr instanceof Error ? parseErr.message : 'Unknown error';
        console.error('[mintNFTClip] CRITICAL: Drop created on-chain but event not parseable:', parseErr);
        return Response.json({
          error:        `Drop created on-chain but drop ID could not be read: ${msg}`,
          createTxHash: createTx.hash,
        }, { status: 502 });
      }

      // Persist on-chain drop ID so subsequent mints skip this step
      await base44.asServiceRole.entities.NFTCollectionCard.update(nftCardId, {
        on_chain_drop_id: onChainDropId,
      });
    }

    // ── Mint edition to buyer ─────────────────────────────────────────────────
    // FIX #10: estimate gas before minting
    let mintGas: bigint;
    try {
      mintGas = await contract.mint.estimateGas(recipientAddress, onChainDropId, amount, '0x');
    } catch (gasErr: unknown) {
      const msg = gasErr instanceof Error ? gasErr.message : 'Unknown error';
      return Response.json({ error: `mint would fail: ${msg}` }, { status: 422 });
    }

    let mintTx;
    try {
      mintTx = await contract.mint(
        recipientAddress, onChainDropId, amount, '0x',
        { gasLimit: (mintGas * 120n) / 100n },
      );
    } catch (txErr: unknown) {
      const msg = txErr instanceof Error ? txErr.message : 'Unknown error';
      return Response.json({ error: `mint transaction failed to send: ${msg}` }, { status: 502 });
    }

    let mintReceipt: ethers.TransactionReceipt;
    try {
      mintReceipt = await mintTx.wait(MIN_CONFIRMATIONS); // FIX #11
    } catch (waitErr: unknown) {
      const msg = waitErr instanceof Error ? waitErr.message : 'Unknown error';
      console.error('[mintNFTClip] Mint transaction reverted or timed out:', waitErr);
      return Response.json({
        error:  `Mint reverted or timed out: ${msg}`,
        txHash: mintTx.hash,
      }, { status: 502 });
    }

    // ── DB writes (post-chain confirmation) ───────────────────────────────────
    // FIX #3: use card.minted_count from the single read — minimise race window
    const baseMintedCount = card.minted_count ?? 0;
    const newMintedCount  = baseMintedCount + amount;

    try {
      // FIX #15 & #16: one NFTOwnership record per edition minted
      const ownershipCreates = Array.from({ length: amount }, (_, i) =>
        base44.asServiceRole.entities.NFTOwnership.create({
          nft_id:            nftCardId,
          athlete_name:      card.athlete_name,
          card_number:       card.card_number,
          serial_number:     baseMintedCount + i + 1, // FIX #15: unique serial per edition
          rarity:            card.rarity,
          purchase_price:    card.mint_price ?? null,  // FIX #17: explicit null, not undefined
          purchase_type:     'mint',
          buyer_email:       recipientEmail,
          minted_at:         new Date().toISOString(),
          transaction_hash:  mintReceipt.hash,
          chain:             'polygon',
          contract_address:  NFT_CLIPS_ADDRESS,
          token_id_on_chain: onChainDropId,
        })
      );
      await Promise.all(ownershipCreates);

      await base44.asServiceRole.entities.NFTCollectionCard.update(nftCardId, {
        minted_count: newMintedCount,
        status:       newMintedCount >= card.total_supply ? 'sold_out' : 'live',
      });

    } catch (dbErr: unknown) {
      // FIX #6: on-chain succeeded but DB failed — log loudly for manual recovery
      const msg = dbErr instanceof Error ? dbErr.message : 'Unknown error';
      console.error(
        `[mintNFTClip] CRITICAL: Mint succeeded on-chain (txHash: ${mintReceipt.hash}) but DB write failed: ${msg}`,
        dbErr,
      );
      return Response.json({
        success:  true,
        warning:  'NFT minted on-chain but DB record failed to save. Manual intervention required.',
        txHash:   mintReceipt.hash,
        dbError:  msg,
      }, { status: 207 }); // 207 Multi-Status
    }

    return Response.json({
      success:       true,
      athleteName:   card.athlete_name,
      eventMoment:   card.event_moment,
      rarity:        card.rarity,
      onChainDropId: onChainDropId.toString(),
      serialNumbers: Array.from({ length: amount }, (_, i) => baseMintedCount + i + 1),
      amount,
      recipient:     recipientAddress,
      txHash:        mintReceipt.hash,
      blockNumber:   mintReceipt.blockNumber,
      polygonScanUrl: `https://polygonscan.com/tx/${mintReceipt.hash}`,
    });

  } catch (error: unknown) {
    // FIX #20: typed error handling
    const message = error instanceof Error ? error.message : 'Unknown error';
    const name    = error instanceof Error ? error.name    : 'Error';
    console.error(`[mintNFTClip] ${name}:`, error);
    return Response.json({ error: message, type: name }, { status: 500 });
  }
});
