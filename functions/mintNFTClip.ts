import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import { ethers } from 'npm:ethers@6.11.0';

const NFT_CLIPS_ADDRESS = Deno.env.get('NFT_CLIPS_ADDRESS');
const PRIVATE_KEY = Deno.env.get('MINTING_PRIVATE_KEY');
const POLYGON_RPC = Deno.env.get('POLYGON_RPC') || 'https://polygon-rpc.com';

// ERC-1155 NFT Clip Drop contract ABI
// Each unique clip/moment has its own tokenId (created per drop).
// Fans buy editions (amount > 1) of the same clip NFT.
const NFT_CLIPS_ABI = [
  'function createDrop(string uri, uint256 maxSupply, address royaltyReceiver, uint96 royaltyBps) returns (uint256 dropId)',
  'function mint(address to, uint256 dropId, uint256 amount, bytes data)',
  'event DropCreated(uint256 indexed dropId, string uri, uint256 maxSupply)',
  'event TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 value)',
];

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin only' }, { status: 403 });
    }

    const {
      nftCardId,          // DB record id from NFTCollectionCard
      recipientAddress,   // Buyer wallet address
      recipientEmail,     // Buyer email for DB
      amount = 1,
    } = await req.json();

    if (!nftCardId || !recipientAddress || !recipientEmail) {
      return Response.json({ error: 'Missing required fields: nftCardId, recipientAddress, recipientEmail' }, { status: 400 });
    }

    // Load the NFTCollectionCard record
    const cardRecords = await base44.asServiceRole.entities.NFTCollectionCard.filter({ id: nftCardId });
    const card = cardRecords[0];
    if (!card) return Response.json({ error: 'NFT card not found' }, { status: 404 });
    if (card.status !== 'live') return Response.json({ error: 'Drop is not live' }, { status: 400 });
    if (card.minted_count >= card.total_supply) return Response.json({ error: 'Sold out' }, { status: 400 });

    if (!NFT_CLIPS_ADDRESS || !PRIVATE_KEY) {
      return Response.json({ error: 'Blockchain not configured. Set NFT_CLIPS_ADDRESS and MINTING_PRIVATE_KEY.' }, { status: 503 });
    }

    const provider = new ethers.JsonRpcProvider(POLYGON_RPC);
    const signer = new ethers.Wallet(PRIVATE_KEY, provider);
    const contract = new ethers.Contract(NFT_CLIPS_ADDRESS, NFT_CLIPS_ABI, signer);

    let onChainDropId = card.on_chain_drop_id;

    // If the drop hasn't been created on-chain yet, create it now
    if (!onChainDropId) {
      const metadataUri = card.metadata_uri || card.image_url || '';
      const athleteRoyaltyAddress = card.royalty_address || signer.address;
      const royaltyBps = 1000; // 10% per the business plan

      const createTx = await contract.createDrop(metadataUri, card.total_supply, athleteRoyaltyAddress, royaltyBps);
      const createReceipt = await createTx.wait();

      // Parse DropCreated event to get on-chain dropId
      const dropCreatedLog = createReceipt.logs.find(log => {
        try { return contract.interface.parseLog(log)?.name === 'DropCreated'; } catch { return false; }
      });
      const parsed = dropCreatedLog ? contract.interface.parseLog(dropCreatedLog) : null;
      onChainDropId = parsed ? parsed.args.dropId.toString() : createReceipt.logs[0]?.topics[1];

      // Persist on-chain dropId so subsequent mints skip this step
      await base44.asServiceRole.entities.NFTCollectionCard.update(nftCardId, { on_chain_drop_id: onChainDropId });
    }

    // Mint edition to buyer
    const mintTx = await contract.mint(recipientAddress, onChainDropId, amount, '0x');
    const mintReceipt = await mintTx.wait();

    const newMintedCount = card.minted_count + amount;

    // Log ownership record
    await base44.asServiceRole.entities.NFTOwnership.create({
      nft_id: nftCardId,
      athlete_name: card.athlete_name,
      card_number: card.card_number,
      serial_number: newMintedCount,
      rarity: card.rarity,
      purchase_price: card.mint_price,
      purchase_type: 'mint',
      buyer_email: recipientEmail,
      minted_at: new Date().toISOString(),
      transaction_hash: mintReceipt.hash,
      chain: 'polygon',
      contract_address: NFT_CLIPS_ADDRESS,
      token_id_on_chain: onChainDropId,
    });

    // Update minted count and status
    await base44.asServiceRole.entities.NFTCollectionCard.update(nftCardId, {
      minted_count: newMintedCount,
      status: newMintedCount >= card.total_supply ? 'sold_out' : 'live',
    });

    return Response.json({
      success: true,
      athleteName: card.athlete_name,
      eventMoment: card.event_moment,
      rarity: card.rarity,
      onChainDropId: onChainDropId.toString(),
      serialNumber: newMintedCount,
      amount,
      recipient: recipientAddress,
      txHash: mintReceipt.hash,
      blockNumber: mintReceipt.blockNumber,
      polygonScanUrl: `https://polygonscan.com/tx/${mintReceipt.hash}`,
    });
  } catch (error) {
    console.error('NFT clip mint error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});