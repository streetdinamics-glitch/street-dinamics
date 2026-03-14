import { ethers } from 'npm:ethers@6.11.0';

const ATHLETE_TOKEN_ADDRESS = Deno.env.get('ATHLETE_TOKEN_ADDRESS');
const NFT_CLIPS_ADDRESS = Deno.env.get('NFT_CLIPS_ADDRESS');
const PRIVATE_KEY = Deno.env.get('MINTING_PRIVATE_KEY');
const POLYGON_RPC = Deno.env.get('POLYGON_RPC') || 'https://polygon-rpc.com';

const ATHLETE_TOKEN_ABI = [
  'function mint(address to, string memory athleteName, string memory tokenURI, address royaltyReceiver, uint96 royaltyPercentage) returns (uint256)',
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

    const { athleteName, metadataURI, royaltyPercentage = 1000 } = await req.json();

    if (!athleteName || !metadataURI) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Initialize provider and signer
    const provider = new ethers.JsonRpcProvider(POLYGON_RPC);
    const signer = new ethers.Wallet(PRIVATE_KEY, provider);

    // Create contract instance
    const contract = new ethers.Contract(ATHLETE_TOKEN_ADDRESS, ATHLETE_TOKEN_ABI, signer);

    // Execute mint
    const tx = await contract.mint(
      user.email, // recipient
      athleteName,
      metadataURI,
      user.email, // royalty receiver
      royaltyPercentage
    );

    const receipt = await tx.wait();

    // Log mint in database
    await base44.asServiceRole.entities.NFTOwnership.create({
      nft_id: `athlete-${receipt.hash}`,
      athlete_name: athleteName,
      card_number: 0,
      serial_number: 1,
      rarity: 'legendary',
      purchase_price: 0,
      purchase_type: 'airdrop',
      buyer_email: user.email,
      minted_at: new Date().toISOString(),
      transaction_hash: receipt.hash,
    });

    return Response.json({
      success: true,
      tokenId: receipt.logs[0]?.topics[1],
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      polygonScanUrl: `https://polygonscan.com/tx/${receipt.hash}`,
    });
  } catch (error) {
    console.error('Minting error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});