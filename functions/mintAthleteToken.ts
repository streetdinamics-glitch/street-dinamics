import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import { ethers } from 'npm:ethers@6.11.0';

const ATHLETE_TOKEN_ADDRESS = Deno.env.get('ATHLETE_TOKEN_ADDRESS');
const PRIVATE_KEY = Deno.env.get('MINTING_PRIVATE_KEY');
const POLYGON_RPC = Deno.env.get('POLYGON_RPC') || 'https://polygon-rpc.com';

// ERC-1155 multi-edition Athlete Token Card ABI
// Each token_tier maps to a fixed tokenId (1=rising_star, 2=breakout_talent, 3=elite_performer, 4=living_legend)
const ATHLETE_TOKEN_ABI = [
  'function mint(address to, uint256 tokenId, uint256 amount, bytes data)',
  'function uri(uint256 tokenId) view returns (string)',
  'event TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 value)',
];

const TIER_TOKEN_ID = {
  rising_star: 1,
  breakout_talent: 2,
  elite_performer: 3,
  living_legend: 4,
};

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

    // Only admin can trigger minting
    if (user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin only' }, { status: 403 });
    }

    const { athleteTokenId, recipientAddress, recipientEmail, amount = 1 } = await req.json();

    if (!athleteTokenId || !recipientAddress || !recipientEmail) {
      return Response.json({ error: 'Missing required fields: athleteTokenId, recipientAddress, recipientEmail' }, { status: 400 });
    }

    // Load the AthleteToken record to determine tier and log correctly
    const tokenRecords = await base44.asServiceRole.entities.AthleteToken.filter({ id: athleteTokenId });
    const tokenRecord = tokenRecords[0];
    if (!tokenRecord) {
      return Response.json({ error: 'Athlete token record not found' }, { status: 404 });
    }

    const erc1155TokenId = TIER_TOKEN_ID[tokenRecord.token_tier];
    if (!erc1155TokenId) {
      return Response.json({ error: `Unknown token tier: ${tokenRecord.token_tier}` }, { status: 400 });
    }

    if (!ATHLETE_TOKEN_ADDRESS || !PRIVATE_KEY) {
      return Response.json({ error: 'Blockchain not configured. Set ATHLETE_TOKEN_ADDRESS and MINTING_PRIVATE_KEY.' }, { status: 503 });
    }

    // Initialize Polygon provider and signer
    const provider = new ethers.JsonRpcProvider(POLYGON_RPC);
    const signer = new ethers.Wallet(PRIVATE_KEY, provider);
    const contract = new ethers.Contract(ATHLETE_TOKEN_ADDRESS, ATHLETE_TOKEN_ABI, signer);

    // Mint ERC-1155 token to recipient wallet
    const tx = await contract.mint(recipientAddress, erc1155TokenId, amount, '0x');
    const receipt = await tx.wait();

    // Log ownership in DB
    await base44.asServiceRole.entities.NFTOwnership.create({
      nft_id: athleteTokenId,
      athlete_name: tokenRecord.athlete_name,
      card_number: tokenRecord.card_number,
      serial_number: (tokenRecord.available_supply || 0) + 1,
      rarity: tokenRecord.token_tier,
      purchase_price: tokenRecord.current_price || tokenRecord.base_price,
      purchase_type: 'mint',
      buyer_email: recipientEmail,
      minted_at: new Date().toISOString(),
      transaction_hash: receipt.hash,
      chain: 'polygon',
      contract_address: ATHLETE_TOKEN_ADDRESS,
      token_id_on_chain: erc1155TokenId,
    });

    // Decrement available supply
    await base44.asServiceRole.entities.AthleteToken.update(athleteTokenId, {
      available_supply: Math.max(0, (tokenRecord.available_supply || 0) - amount),
      status: (tokenRecord.available_supply - amount) <= 0 ? 'sold_out' : 'active',
    });

    return Response.json({
      success: true,
      athleteName: tokenRecord.athlete_name,
      tier: tokenRecord.token_tier,
      erc1155TokenId,
      amount,
      recipient: recipientAddress,
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      polygonScanUrl: `https://polygonscan.com/tx/${receipt.hash}`,
    });
  } catch (error) {
    console.error('Athlete token mint error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});