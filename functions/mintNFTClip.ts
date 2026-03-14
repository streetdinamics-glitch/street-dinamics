import { ethers } from 'npm:ethers@6.11.0';

const NFT_CLIPS_ADDRESS = Deno.env.get('NFT_CLIPS_ADDRESS');
const PRIVATE_KEY = Deno.env.get('MINTING_PRIVATE_KEY');
const POLYGON_RPC = Deno.env.get('POLYGON_RPC') || 'https://polygon-rpc.com';

const NFT_CLIPS_ABI = [
  'function mint(address to, uint256 tokenId, uint256 amount)',
  'function createClip(string uri, uint256 maxSupply, address royaltyReceiver, uint96 royaltyPercentage) returns (uint256)',
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

    const { clipTokenId, amount = 1, metadataURI, maxSupply } = await req.json();

    const provider = new ethers.JsonRpcProvider(POLYGON_RPC);
    const signer = new ethers.Wallet(PRIVATE_KEY, provider);
    const contract = new ethers.Contract(NFT_CLIPS_ADDRESS, NFT_CLIPS_ABI, signer);

    let clipId = clipTokenId;

    // Create clip if metadataURI provided
    if (metadataURI && maxSupply) {
      const createTx = await contract.createClip(
        metadataURI,
        maxSupply,
        user.email,
        1000 // 10% royalty
      );
      const createReceipt = await createTx.wait();
      clipId = createReceipt.logs[0]?.topics[1];
    }

    // Mint to user
    const tx = await contract.mint(user.email, clipId, amount);
    const receipt = await tx.wait();

    return Response.json({
      success: true,
      clipId: clipId.toString(),
      amount,
      txHash: receipt.hash,
      polygonScanUrl: `https://polygonscan.com/tx/${receipt.hash}`,
    });
  } catch (error) {
    console.error('NFT clip mint error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});