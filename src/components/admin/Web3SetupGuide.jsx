import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChainId } from 'wagmi';
import { CONTRACT_ADDRESSES, isContractDeployed, TIER_PRICES_MATIC } from '../web3/web3Config';
import { CheckCircle, XCircle, Copy, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';

const ENV_GUIDE = [
  {
    key: 'VITE_NFT_CONTRACT_POLYGON',
    label: 'NFT Contract — Polygon Mainnet',
    desc: 'Indirizzo del contratto SDAthleteNFT.sol deployato su Polygon Mainnet (chain 137)',
    required: true,
  },
  {
    key: 'VITE_NFT_CONTRACT_POLYGON_AMOY',
    label: 'NFT Contract — Amoy Testnet',
    desc: 'Indirizzo del contratto SDAthleteNFT.sol su Amoy (chain 80002) — per testing',
    required: false,
  },
  {
    key: 'VITE_WAGER_CONTRACT_POLYGON',
    label: 'Wager Contract — Polygon Mainnet',
    desc: 'Indirizzo del contratto AthleteWager.sol (P2P escrow)',
    required: false,
  },
  {
    key: 'VITE_PREDICTION_CONTRACT_POLYGON',
    label: 'Prediction Market — Polygon Mainnet',
    desc: 'Indirizzo del contratto SDPredictionMarket.sol',
    required: false,
  },
  {
    key: 'VITE_SD_TOKEN_POLYGON',
    label: '$SD Token — Polygon Mainnet',
    desc: 'Indirizzo del token ERC-20 $SD',
    required: false,
  },
  {
    key: 'PRIVATE_KEY',
    label: 'Backend Minting Private Key',
    desc: 'Chiave privata del wallet admin per minting server-side (solo backend, NON prefissare con VITE_)',
    required: true,
    backend: true,
  },
  {
    key: 'RPC_URL_POLYGON',
    label: 'RPC URL Polygon',
    desc: 'URL del nodo RPC (es. Alchemy, Infura) per Polygon Mainnet — solo backend',
    required: true,
    backend: true,
  },
];

const DEPLOY_STEPS = [
  { n: 1, title: 'Installa Hardhat', code: 'npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox' },
  { n: 2, title: 'Configura hardhat.config.js', code: `require("@nomicfoundation/hardhat-toolbox");
module.exports = {
  solidity: "0.8.20",
  networks: {
    polygon: {
      url: process.env.RPC_URL_POLYGON,
      accounts: [process.env.PRIVATE_KEY]
    },
    amoy: {
      url: "https://rpc-amoy.polygon.technology/",
      accounts: [process.env.PRIVATE_KEY]
    }
  }
};` },
  { n: 3, title: 'Deploy su Amoy (testnet)', code: 'npx hardhat run scripts/deploy.js --network amoy' },
  { n: 4, title: 'Deploy su Polygon Mainnet', code: 'npx hardhat run scripts/deploy.js --network polygon' },
  { n: 5, title: 'Incolla gli indirizzi nelle ENV VARS', code: '# Dashboard → Settings → Environment Variables' },
];

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button onClick={copy} className="p-1.5 text-white/30 hover:text-fire-3 transition-colors">
      {copied ? <CheckCircle size={12} className="text-green-400" /> : <Copy size={12} />}
    </button>
  );
}

export default function Web3SetupGuide() {
  const chainId = useChainId();
  const [openStep, setOpenStep] = useState(null);

  const contracts = [
    { key: 'athleteTokenNFT', name: 'SDAthleteNFT', critical: true },
    { key: 'athleteWager', name: 'AthleteWager', critical: false },
    { key: 'predictionMarket', name: 'SDPredictionMarket', critical: false },
    { key: 'sdToken', name: '$SD Token', critical: false },
  ];

  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <div className="bg-[rgba(10,4,18,0.95)] border border-fire-3/20 clip-cyber p-6">
        <p className="font-mono text-[9px] tracking-[3px] uppercase text-fire-3/40 mb-1">STATUS</p>
        <h3 className="font-orbitron font-black text-xl text-fire-4 mb-4">Contratti Smart</h3>
        <div className="grid grid-cols-2 gap-3">
          {contracts.map(c => {
            const deployed = isContractDeployed(chainId, c.key);
            const addr = CONTRACT_ADDRESSES[c.key]?.[chainId];
            return (
              <div key={c.key} className={`p-3 border ${deployed ? 'border-green-500/30 bg-green-500/5' : c.critical ? 'border-red-500/30 bg-red-500/5' : 'border-white/10 bg-white/[0.02]'}`}>
                <div className="flex items-center gap-2 mb-1">
                  {deployed
                    ? <CheckCircle size={12} className="text-green-400 flex-shrink-0" />
                    : <XCircle size={12} className={`${c.critical ? 'text-red-400' : 'text-white/20'} flex-shrink-0`} />
                  }
                  <span className={`font-orbitron text-[10px] font-bold ${deployed ? 'text-green-300' : c.critical ? 'text-red-300' : 'text-white/30'}`}>
                    {c.name}
                  </span>
                  {c.critical && !deployed && (
                    <span className="ml-auto font-mono text-[7px] text-red-400/70">RICHIESTO</span>
                  )}
                </div>
                {deployed && addr && (
                  <div className="flex items-center gap-1">
                    <code className="font-mono text-[8px] text-white/25 break-all">
                      {addr.slice(0, 10)}...{addr.slice(-6)}
                    </code>
                    <a href={`https://polygonscan.com/address/${addr}`} target="_blank" rel="noopener noreferrer"
                      className="text-cyan/40 hover:text-cyan transition-colors">
                      <ExternalLink size={9} />
                    </a>
                  </div>
                )}
                {!deployed && (
                  <p className="font-mono text-[8px] text-white/20 mt-1">Non configurato</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Tier Prices */}
      <div className="bg-[rgba(10,4,18,0.95)] border border-cyan/15 clip-cyber p-5">
        <p className="font-mono text-[9px] tracking-[3px] uppercase text-cyan/40 mb-3">PREZZI TIER (MATIC)</p>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(TIER_PRICES_MATIC).map(([tier, price]) => (
            <div key={tier} className="flex justify-between items-center px-3 py-2 bg-white/[0.03] border border-white/5">
              <span className="font-mono text-[9px] text-fire-3/60 capitalize">{tier.replace(/_/g, ' ')}</span>
              <span className="font-orbitron text-sm font-bold text-fire-5">{price} MATIC</span>
            </div>
          ))}
        </div>
      </div>

      {/* Deploy Guide */}
      <div className="bg-[rgba(10,4,18,0.95)] border border-fire-3/20 clip-cyber p-5">
        <p className="font-mono text-[9px] tracking-[3px] uppercase text-fire-3/40 mb-3">GUIDA DEPLOY</p>
        <div className="space-y-2">
          {DEPLOY_STEPS.map(step => (
            <div key={step.n} className="border border-white/8">
              <button
                onClick={() => setOpenStep(openStep === step.n ? null : step.n)}
                className="w-full flex items-center gap-3 p-3 text-left hover:bg-white/[0.02] transition-colors"
              >
                <span className="w-6 h-6 rounded-full border border-fire-3/40 flex items-center justify-center font-mono text-[10px] text-fire-3 flex-shrink-0">
                  {step.n}
                </span>
                <span className="font-rajdhani font-semibold text-sm text-white/70">{step.title}</span>
                <span className="ml-auto text-white/20">
                  {openStep === step.n ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                </span>
              </button>
              <AnimatePresence>
                {openStep === step.n && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="relative p-3 border-t border-white/5 bg-black/30">
                      <CopyBtn text={step.code} />
                      <pre className="font-mono text-[10px] text-green-400/70 whitespace-pre-wrap break-all leading-relaxed pr-6">
                        {step.code}
                      </pre>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      {/* Environment Variables */}
      <div className="bg-[rgba(10,4,18,0.95)] border border-purple-500/20 clip-cyber p-5">
        <p className="font-mono text-[9px] tracking-[3px] uppercase text-purple-400/40 mb-3">VARIABILI D'AMBIENTE</p>
        <div className="space-y-3">
          {ENV_GUIDE.map(v => (
            <div key={v.key} className={`p-3 border ${v.required ? 'border-fire-3/20' : 'border-white/8'}`}>
              <div className="flex items-start gap-2 mb-1">
                <code className="font-mono text-[10px] text-cyan/70 flex-1 break-all">{v.key}</code>
                <CopyBtn text={v.key} />
                {v.required && <span className="font-mono text-[8px] text-red-400/70 mt-0.5 flex-shrink-0">*</span>}
                {v.backend && <span className="font-mono text-[8px] text-purple-400/60 mt-0.5 flex-shrink-0">backend</span>}
              </div>
              <p className="font-rajdhani text-xs text-white/30 leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
        <p className="font-mono text-[8px] text-white/20 mt-3 leading-relaxed">
          * Dashboard Base44 → Settings → Environment Variables
        </p>
      </div>
    </div>
  );
}