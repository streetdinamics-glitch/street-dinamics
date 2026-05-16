import { ethers } from 'ethers';

// ── SDAthleteNFT ERC-1155 ABI (matches SDAthleteNFT.sol) ─────────────────────
export const ATHLETE_TOKEN_ABI = [
  // Mint (user pays ETH, backend wallet signs)
  'function mint(address to, uint256 tokenId, uint256 amount, string athleteName) payable returns (uint256)',
  // Admin free mint (rewards, UGC prizes, Last Man Standing)
  'function adminMint(address to, uint256 tokenId, uint256 amount, string athleteName) returns (uint256)',
  // Read
  'function balanceOf(address account, uint256 id) view returns (uint256)',
  'function availableSupply(uint256 tokenId) view returns (uint256)',
  'function tierPrice(uint256 tokenId) view returns (uint256)',
  'function totalMinted(uint256 tokenId) view returns (uint256)',
  // Events
  'event AthleteCardMinted(address indexed recipient, uint256 indexed tokenId, uint256 amount, string athleteName, uint256 serialStart)',
  'event TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 value)',
];

// Tier → ERC-1155 token ID mapping (matches contract constants)
export const TIER_TOKEN_ID = {
  rising_star:     1,
  breakout_talent: 2,
  elite_performer: 3,
  living_legend:   4,
};

// Tier labels for display
export const TIER_LABELS = {
  rising_star:     'Rising Star',
  breakout_talent: 'Breakout Talent',
  elite_performer: 'Elite Performer',
  living_legend:   'Living Legend',
};

// Tier colors
export const TIER_COLORS = {
  rising_star:     '#00ffee',
  breakout_talent: '#9b00ff',
  elite_performer: '#ff9900',
  living_legend:   '#ff1a00',
};

// Convert EUR to ETH (uses live-ish rate; swap for Chainlink oracle in prod)
export const eurToEth = (eurAmount, ethPriceInEur = 2500) => {
  return (eurAmount / ethPriceInEur).toFixed(6);
};

// Convert MATIC wei to MATIC
export const weiToMatic = (wei) => {
  try { return parseFloat(ethers.formatEther(wei)).toFixed(4); }
  catch { return '0'; }
};

// Format ETH value
export const formatEther = (value) => {
  try { return ethers.formatEther(value); }
  catch { return '0'; }
};

export const parseEther = (value) => {
  try { return ethers.parseEther(value.toString()); }
  catch { return ethers.parseEther('0'); }
};

// Generate NFT metadata (for IPFS upload)
export const generateTokenMetadata = (token) => ({
  name: `${token.athlete_name} — ${TIER_LABELS[token.token_tier] || token.token_tier}`,
  description: token.bio || `Official SD Athlete Card for ${token.athlete_name}`,
  image: token.avatar_url || token.image_url || '',
  external_url: `https://streetdinamics.ae/athlete/${token.athlete_email}`,
  attributes: [
    { trait_type: 'Athlete',        value: token.athlete_name },
    { trait_type: 'Sport',          value: token.sport },
    { trait_type: 'Tier',           value: TIER_LABELS[token.token_tier] || token.token_tier },
    { trait_type: 'Card Number',    value: String(token.card_number) },
    { trait_type: 'Revenue Share',  value: `${token.revenue_share_percentage || 0}%` },
    { trait_type: 'Voting Power',   value: String(token.voting_power || 1) },
    { trait_type: 'Event Moment',   value: token.event_moment || '' },
  ],
});

// Verify transaction confirmed
export const verifyTransaction = async (txHash, provider) => {
  try {
    const receipt = await provider.getTransactionReceipt(txHash);
    return receipt && receipt.status === 1;
  } catch {
    return false;
  }
};

// Short address display
export const shortAddress = (addr) =>
  addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : '';

// Explorer URL (Polygon)
export const explorerTxUrl = (txHash) =>
  `https://polygonscan.com/tx/${txHash}`;

export const explorerAddressUrl = (address) =>
  `https://polygonscan.com/address/${address}`;