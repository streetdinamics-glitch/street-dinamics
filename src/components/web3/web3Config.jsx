import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { polygon, polygonAmoy } from 'wagmi/chains';

// Street Dinamics uses Polygon for low-cost NFT minting
// polygonAmoy = testnet for dev/staging
export const web3Config = getDefaultConfig({
  appName: 'Street Dinamics',
  projectId: '2f05ae7f1116030fde2d36508f472bfb', // WalletConnect Cloud
  chains: [polygon, polygonAmoy],
  ssr: false,
});

// ── Contract addresses ────────────────────────────────────────────────────────
// After deploying SDAthleteNFT.sol, paste the addresses here.
// Deploy command: npx hardhat run scripts/deploy.js --network polygon
export const CONTRACT_ADDRESSES = {
  // SDAthleteNFT.sol (ERC-1155) — primary athlete card contract
  athleteTokenNFT: {
    [polygon.id]:      import.meta.env.VITE_NFT_CONTRACT_POLYGON      || '0x0000000000000000000000000000000000000000',
    [polygonAmoy.id]:  import.meta.env.VITE_NFT_CONTRACT_POLYGON_AMOY || '0x0000000000000000000000000000000000000000',
  },
  // AthleteWager.sol (P2P escrow)
  athleteWager: {
    [polygon.id]:      import.meta.env.VITE_WAGER_CONTRACT_POLYGON      || '0x0000000000000000000000000000000000000000',
    [polygonAmoy.id]:  import.meta.env.VITE_WAGER_CONTRACT_POLYGON_AMOY || '0x0000000000000000000000000000000000000000',
  },
  // SDPredictionMarket.sol
  predictionMarket: {
    [polygon.id]:      import.meta.env.VITE_PREDICTION_CONTRACT_POLYGON      || '0x0000000000000000000000000000000000000000',
    [polygonAmoy.id]:  import.meta.env.VITE_PREDICTION_CONTRACT_POLYGON_AMOY || '0x0000000000000000000000000000000000000000',
  },
  // $SD ERC-20 utility token
  sdToken: {
    [polygon.id]:      import.meta.env.VITE_SD_TOKEN_POLYGON      || '0x0000000000000000000000000000000000000000',
    [polygonAmoy.id]:  import.meta.env.VITE_SD_TOKEN_POLYGON_AMOY || '0x0000000000000000000000000000000000000000',
  },
};

// ── Tier prices (MATIC, mirrors SDAthleteNFT.sol defaults) ───────────────────
export const TIER_PRICES_MATIC = {
  rising_star:     '20',   // 20 MATIC
  breakout_talent: '50',   // 50 MATIC
  elite_performer: '150',  // 150 MATIC
  living_legend:   '300',  // 300 MATIC
};

// Helper: check if contract is deployed (non-zero address)
export const isContractDeployed = (chainId, contractKey) => {
  const addr = CONTRACT_ADDRESSES[contractKey]?.[chainId];
  return addr && addr !== '0x0000000000000000000000000000000000000000';
};

// Supported chain IDs
export const SUPPORTED_CHAIN_IDS = [polygon.id, polygonAmoy.id];