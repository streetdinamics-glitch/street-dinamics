/**
 * cryptoPaymentConfig.js
 * Configurazione centralizzata per tutti i metodi di pagamento crypto supportati.
 * Copre: CBDC, Stablecoin, Layer1, Layer2, Altcoin principali.
 */
import { polygon, polygonAmoy, mainnet, bsc, arbitrum, optimism, base, avalanche } from 'wagmi/chains';

// Gnosis Chain ID (no wagmi export needed, used as key only)
const gnosis_id = 100;

// ── CHAIN CONFIG ──────────────────────────────────────────────────────────────
export const SUPPORTED_CHAINS = [
  { chain: polygon,      label: 'Polygon',   symbol: 'MATIC', color: '#8247e5', icon: '🟣' },
  { chain: mainnet,      label: 'Ethereum',  symbol: 'ETH',   color: '#627eea', icon: '⬡' },
  { chain: bsc,          label: 'BNB Chain', symbol: 'BNB',   color: '#f0b90b', icon: '🟡' },
  { chain: arbitrum,     label: 'Arbitrum',  symbol: 'ETH',   color: '#28a0f0', icon: '🔵' },
  { chain: optimism,     label: 'Optimism',  symbol: 'ETH',   color: '#ff0420', icon: '🔴' },
  { chain: base,         label: 'Base',      symbol: 'ETH',   color: '#0052ff', icon: '🔷' },
  { chain: avalanche,    label: 'Avalanche', symbol: 'AVAX',  color: '#e84142', icon: '🔺' },
];

// ── TOKEN CONFIG PER CHAIN ────────────────────────────────────────────────────
// Ogni entry ha: id, label, symbol, icon, category, decimals, addresses{chainId: contractAddress}
export const PAYMENT_TOKENS = [

  // ── CBDC & Digital Euro ───────────────────────────────────────────────────
  {
    id: 'eure',
    label: 'Digital Euro (EURe)',
    symbol: 'EURe',
    icon: '🇪🇺',
    category: 'cbdc',
    decimals: 18,
    addresses: {
      [mainnet.id]:   '0x3231Cb76718CDeF2155FC47b5286d82e6eDA273f', // Monerium EURe
      [polygon.id]:   '0x18ec0A6E18E5bc3784fDd3a3634b31245ab704F6',
      [gnosis_id]:    '0xcB444e90D8198701b3Ba2a30A0093bF65e8F2AA7',
    },
    note: 'Monerium EURe — CBDC-backed digital Euro',
  },
  {
    id: 'eurc',
    label: 'Euro Coin (EURC)',
    symbol: 'EURC',
    icon: '💶',
    category: 'cbdc',
    decimals: 6,
    addresses: {
      [mainnet.id]:   '0x1aBaEA1f7C830bD89Acc67eC4af516284b1bC33c', // Circle EURC
      [base.id]:      '0x60a3e35cc302bfa44cb288bc5a4f316fdb1adb42',
      [avalanche.id]: '0xC891EB4cbdEFf6e073e859e987815Ed1505c2ACD',
    },
    note: 'Circle EURC — regulated Euro stablecoin',
  },

  // ── Stablecoin USD ────────────────────────────────────────────────────────
  {
    id: 'usdc',
    label: 'USD Coin',
    symbol: 'USDC',
    icon: '💵',
    category: 'stablecoin',
    decimals: 6,
    addresses: {
      [mainnet.id]:   '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      [polygon.id]:   '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
      [arbitrum.id]:  '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
      [optimism.id]:  '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
      [base.id]:      '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      [bsc.id]:       '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
      [avalanche.id]: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',
    },
  },
  {
    id: 'usdt',
    label: 'Tether USD',
    symbol: 'USDT',
    icon: '💲',
    category: 'stablecoin',
    decimals: 6,
    addresses: {
      [mainnet.id]:   '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      [polygon.id]:   '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
      [arbitrum.id]:  '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
      [bsc.id]:       '0x55d398326f99059fF775485246999027B3197955',
      [avalanche.id]: '0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7',
    },
  },
  {
    id: 'dai',
    label: 'Dai Stablecoin',
    symbol: 'DAI',
    icon: '🟡',
    category: 'stablecoin',
    decimals: 18,
    addresses: {
      [mainnet.id]:   '0x6B175474E89094C44Da98b954EedeAC495271d0F',
      [polygon.id]:   '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
      [arbitrum.id]:  '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
      [optimism.id]:  '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
      [base.id]:      '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb',
    },
  },

  // ── Layer 1 Native ────────────────────────────────────────────────────────
  {
    id: 'eth',
    label: 'Ethereum',
    symbol: 'ETH',
    icon: '⬡',
    category: 'native',
    decimals: 18,
    addresses: { native: true },
    chains: [mainnet.id, arbitrum.id, optimism.id, base.id],
  },
  {
    id: 'matic',
    label: 'Polygon',
    symbol: 'MATIC/POL',
    icon: '🟣',
    category: 'native',
    decimals: 18,
    addresses: { native: true },
    chains: [polygon.id],
  },
  {
    id: 'bnb',
    label: 'BNB',
    symbol: 'BNB',
    icon: '🟡',
    category: 'native',
    decimals: 18,
    addresses: { native: true },
    chains: [bsc.id],
  },
  {
    id: 'avax',
    label: 'Avalanche',
    symbol: 'AVAX',
    icon: '🔺',
    category: 'native',
    decimals: 18,
    addresses: { native: true },
    chains: [avalanche.id],
  },

  // ── Wrapped / Bridged ─────────────────────────────────────────────────────
  {
    id: 'weth',
    label: 'Wrapped ETH',
    symbol: 'WETH',
    icon: '♦',
    category: 'wrapped',
    decimals: 18,
    addresses: {
      [polygon.id]:   '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
      [bsc.id]:       '0x2170Ed0880ac9A755fd29B2688956BD959F933F8',
      [avalanche.id]: '0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB',
      [arbitrum.id]:  '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
    },
  },
  {
    id: 'wbtc',
    label: 'Wrapped Bitcoin',
    symbol: 'WBTC',
    icon: '₿',
    category: 'wrapped',
    decimals: 8,
    addresses: {
      [mainnet.id]:   '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
      [polygon.id]:   '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6',
      [arbitrum.id]:  '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f',
      [avalanche.id]: '0x152b9d0FdC40C096757F570A51E494bd4b943E50',
    },
  },

  // ── Altcoin principali ────────────────────────────────────────────────────
  {
    id: 'link',
    label: 'Chainlink',
    symbol: 'LINK',
    icon: '🔗',
    category: 'altcoin',
    decimals: 18,
    addresses: {
      [mainnet.id]:   '0x514910771AF9Ca656af840dff83E8264EcF986CA',
      [polygon.id]:   '0x53E0bca35eC356BD5ddDFebbD1Fc0fD03FaBad39',
      [bsc.id]:       '0x404460C6A5EdE2D891e8297795264fDe62ADBB75',
    },
  },
  {
    id: 'sand',
    label: 'The Sandbox',
    symbol: 'SAND',
    icon: '🏖',
    category: 'altcoin',
    decimals: 18,
    addresses: {
      [mainnet.id]:   '0x3845badAde8e6dFF049820680d1F14bD3903a5d0',
      [polygon.id]:   '0xBbba073C31bF03b8ACf7c28EF0738DeCF3695683',
    },
  },
  {
    id: 'mana',
    label: 'Decentraland',
    symbol: 'MANA',
    icon: '🌐',
    category: 'altcoin',
    decimals: 18,
    addresses: {
      [mainnet.id]:   '0x0F5D2fB29fb7d3CFeE444a200298f468908cC942',
      [polygon.id]:   '0xA1c57f48F0Deb89f569dFbE6E2B7f46D33606fD4',
    },
  },
];

// ── EUR reference price per tier ──────────────────────────────────────────────
export const TIER_EUR_PRICES = {
  rising_star:     20,
  breakout_talent: 50,
  elite_performer: 150,
  living_legend:   300,
};

// ── Category labels ───────────────────────────────────────────────────────────
export const CATEGORY_LABELS = {
  cbdc:       '🏦 CBDC / Digital Euro',
  stablecoin: '💰 Stablecoin',
  native:     '⚡ Native Coins',
  wrapped:    '🌉 Wrapped Assets',
  altcoin:    '🚀 Altcoin',
};

// Helper: get token by id
export const getTokenById = (id) => PAYMENT_TOKENS.find(t => t.id === id);

// Helper: get address for token on chain
export const getTokenAddress = (tokenId, chainId) => {
  const token = getTokenById(tokenId);
  if (!token) return null;
  if (token.addresses?.native) return null; // native coin
  return token.addresses?.[chainId] || null;
};

// Helper: group tokens by category
export const getTokensByCategory = () => {
  const grouped = {};
  for (const token of PAYMENT_TOKENS) {
    if (!grouped[token.category]) grouped[token.category] = [];
    grouped[token.category].push(token);
  }
  return grouped;
};