import { ethers } from 'ethers';

// ABI for Athlete Token NFT Contract
export const ATHLETE_TOKEN_ABI = [
  'function mintToken(address to, string memory athleteName, string memory tier) public payable returns (uint256)',
  'function balanceOf(address owner) public view returns (uint256)',
  'function tokenOfOwnerByIndex(address owner, uint256 index) public view returns (uint256)',
  'function tokenURI(uint256 tokenId) public view returns (string memory)',
  'function ownerOf(uint256 tokenId) public view returns (address)',
  'function transferFrom(address from, address to, uint256 tokenId) public',
  'function approve(address to, uint256 tokenId) public',
  'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
  'event TokenMinted(address indexed owner, uint256 indexed tokenId, string athleteName, string tier)',
];

// Format ETH values
export const formatEther = (value) => {
  try {
    return ethers.formatEther(value);
  } catch {
    return '0';
  }
};

export const parseEther = (value) => {
  try {
    return ethers.parseEther(value.toString());
  } catch {
    return ethers.parseEther('0');
  }
};

// Convert EUR to ETH (simplified - in production use real-time oracle)
export const eurToEth = (eurAmount, ethPriceInEur = 2500) => {
  return (eurAmount / ethPriceInEur).toFixed(6);
};

// Generate token metadata
export const generateTokenMetadata = (token) => {
  return {
    name: `${token.athlete_name} - ${token.token_tier}`,
    description: token.bio || `Official ${token.token_tier} tier token for ${token.athlete_name}`,
    image: token.avatar_url || '',
    attributes: [
      { trait_type: 'Athlete', value: token.athlete_name },
      { trait_type: 'Sport', value: token.sport },
      { trait_type: 'Tier', value: token.token_tier },
      { trait_type: 'Revenue Share', value: `${token.revenue_share_percentage}%` },
      { trait_type: 'Voting Power', value: token.voting_power.toString() },
    ],
  };
};

// Verify transaction
export const verifyTransaction = async (txHash, provider) => {
  try {
    const receipt = await provider.getTransactionReceipt(txHash);
    return receipt && receipt.status === 1;
  } catch {
    return false;
  }
};