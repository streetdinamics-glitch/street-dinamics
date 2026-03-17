import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, polygon, arbitrum, optimism, base } from 'wagmi/chains';

export const web3Config = getDefaultConfig({
  appName: 'Street Dinamics',
  projectId: '2f05ae7f1116030fde2d36508f472bfb', // WalletConnect Cloud project ID
  chains: [mainnet, polygon, arbitrum, optimism, base],
  ssr: false,
});

// Smart contract addresses (deploy your contracts and update these)
export const CONTRACT_ADDRESSES = {
  athleteTokenNFT: {
    [mainnet.id]: '0x0000000000000000000000000000000000000000',
    [polygon.id]: '0x0000000000000000000000000000000000000000',
  },
  marketplace: {
    [mainnet.id]: '0x0000000000000000000000000000000000000000',
    [polygon.id]: '0x0000000000000000000000000000000000000000',
  },
};

// Token tier prices in Wei (1 ETH = 10^18 Wei)
export const TOKEN_TIER_PRICES = {
  common: '50000000000000000', // 0.05 ETH
  uncommon: '100000000000000000', // 0.1 ETH
  rare: '250000000000000000', // 0.25 ETH
  legendary: '500000000000000000', // 0.5 ETH
};