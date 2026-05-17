import React, { useState } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { isContractDeployed, CONTRACT_ADDRESSES } from './web3Config';
import { AlertTriangle, X, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

const ENV_VARS = [
  { key: 'VITE_NFT_CONTRACT_POLYGON', label: 'NFT Contract (Polygon Mainnet)', required: true },
  { key: 'VITE_NFT_CONTRACT_POLYGON_AMOY', label: 'NFT Contract (Amoy Testnet)', required: false },
  { key: 'VITE_WAGER_CONTRACT_POLYGON', label: 'Wager Contract (Polygon)', required: false },
  { key: 'VITE_PREDICTION_CONTRACT_POLYGON', label: 'Prediction Market (Polygon)', required: false },
  { key: 'VITE_SD_TOKEN_POLYGON', label: '$SD Token (Polygon)', required: false },
];

export default function Web3StatusBanner({ isAdmin }) {
  const chainId = useChainId();
  const { isConnected } = useAccount();
  const [dismissed, setDismissed] = useState(false);
  const [expanded, setExpanded] = useState(false);

  if (!isAdmin || dismissed) return null;

  const nftDeployed = isContractDeployed(chainId, 'athleteTokenNFT');
  const wagerDeployed = isContractDeployed(chainId, 'athleteWager');
  const predDeployed = isContractDeployed(chainId, 'predictionMarket');
  const sdDeployed = isContractDeployed(chainId, 'sdToken');
  const allDeployed = nftDeployed && wagerDeployed && predDeployed && sdDeployed;

  if (allDeployed) return null;

  const contracts = [
    { name: 'SDAthleteNFT (ERC-1155)', deployed: nftDeployed, critical: true },
    { name: 'AthleteWager (P2P Escrow)', deployed: wagerDeployed, critical: false },
    { name: 'SDPredictionMarket', deployed: predDeployed, critical: false },
    { name: '$SD Token (ERC-20)', deployed: sdDeployed, critical: false },
  ];

  return (
    <div className="fixed bottom-4 right-4 z-[500] w-[min(400px,calc(100vw-2rem))]">
      <div className="bg-[#0a0408] border border-orange-500/40 clip-cyber shadow-[0_0_30px_rgba(255,100,0,0.15)]">
        {/* Header */}
        <div className="flex items-center gap-3 p-3 border-b border-orange-500/20">
          <AlertTriangle size={16} className="text-orange-400 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-orbitron text-[9px] tracking-[2px] uppercase text-orange-400">Web3 Setup Incompleto</p>
            <p className="font-rajdhani text-xs text-white/40">
              {contracts.filter(c => !c.deployed).length} contratti non deployati
            </p>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setExpanded(e => !e)}
              className="p-1.5 hover:bg-white/5 transition-colors text-white/30 hover:text-white/60"
            >
              {expanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="p-1.5 hover:bg-white/5 transition-colors text-white/30 hover:text-white/60"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Contract Status */}
        <div className="p-3 space-y-1.5">
          {contracts.map(c => (
            <div key={c.name} className="flex items-center gap-2">
              <span className={`text-xs ${c.deployed ? 'text-green-400' : c.critical ? 'text-red-400' : 'text-yellow-400/60'}`}>
                {c.deployed ? '✓' : c.critical ? '✗' : '○'}
              </span>
              <span className={`font-mono text-[9px] ${c.deployed ? 'text-white/40' : c.critical ? 'text-orange-300' : 'text-white/25'}`}>
                {c.name}
              </span>
              {c.critical && !c.deployed && (
                <span className="font-mono text-[7px] text-red-400/70 ml-auto">RICHIESTO</span>
              )}
            </div>
          ))}
        </div>

        {/* Guide expandable */}
        {expanded && (
          <div className="border-t border-orange-500/10 p-3 space-y-3">
            <div>
              <p className="font-mono text-[8px] tracking-[2px] uppercase text-orange-400/60 mb-2">Variabili Ambiente Richieste</p>
              <div className="space-y-1">
                {ENV_VARS.map(v => (
                  <div key={v.key} className="flex items-start gap-2">
                    <code className="font-mono text-[8px] text-cyan/60 break-all leading-relaxed">{v.key}</code>
                    {v.required && <span className="font-mono text-[7px] text-red-400/70 mt-0.5 flex-shrink-0">*</span>}
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-orange-500/5 border border-orange-500/15 p-2">
              <p className="font-mono text-[8px] text-orange-400/60 leading-relaxed">
                1. Deploya i contratti su Polygon<br />
                2. Vai su Dashboard → Settings → Environment Variables<br />
                3. Inserisci gli indirizzi dei contratti<br />
                4. Riavvia l'app
              </p>
            </div>
            <a
              href="https://docs.polygon.technology/tools/smart-contracts/deploy/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 font-mono text-[8px] text-cyan/50 hover:text-cyan transition-colors"
            >
              <ExternalLink size={10} />
              Guida Deploy Polygon
            </a>
          </div>
        )}
      </div>
    </div>
  );
}