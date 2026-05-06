import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccount, useWriteContract, useReadContract } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { TrendingUp, TrendingDown, CheckCircle, AlertTriangle } from 'lucide-react';
import { CONTRACT_ADDRESSES } from '../web3/web3Config';
import { polygon } from 'wagmi/chains';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const MARKET_ABI = [
  { name: 'buyShares', type: 'function', inputs: [
    { name: 'marketId', type: 'uint256' }, { name: 'side', type: 'uint8' }, { name: 'amount', type: 'uint256' }
  ], stateMutability: 'nonpayable' },
  { name: 'redeem', type: 'function', inputs: [{ name: 'marketId', type: 'uint256' }], stateMutability: 'nonpayable' },
  { name: 'markets', type: 'function', inputs: [{ name: 'marketId', type: 'uint256' }], outputs: [{
    components: [
      { name: 'matchId', type: 'bytes32' }, { name: 'question', type: 'string' },
      { name: 'yesPool', type: 'uint256' }, { name: 'noPool', type: 'uint256' },
      { name: 'status', type: 'uint8' }, { name: 'result', type: 'uint8' },
      { name: 'closesAt', type: 'uint256' },
    ], type: 'tuple'
  }], stateMutability: 'view' },
];

// Simulated market data for demo (replace with on-chain reads in prod)
const DEMO_MARKETS = [
  { id: 1, question: 'Will Athlete A win the MMA bout?',     yesPool: 1240, noPool: 860,  status: 0, closesIn: '2h 14m' },
  { id: 2, question: 'Will Skate Final reach sudden death?', yesPool: 580,  noPool: 1100, status: 0, closesIn: '5h 30m' },
  { id: 3, question: 'Will Rap Battle go to tiebreak?',      yesPool: 920,  noPool: 740,  status: 0, closesIn: '1h 05m' },
];

function getImpliedProb(yesPool, noPool, side) {
  const total = yesPool + noPool;
  if (total === 0) return 50;
  return side === 'yes' ? Math.round((yesPool / total) * 100) : Math.round((noPool / total) * 100);
}

function PoolBar({ yesPool, noPool }) {
  const total = yesPool + noPool || 1;
  const yesPct = (yesPool / total) * 100;
  return (
    <div className="w-full h-2 bg-white/5 flex overflow-hidden rounded-full">
      <div className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-500" style={{ width: `${yesPct}%` }} />
      <div className="h-full bg-gradient-to-r from-red-500 to-red-400 transition-all duration-500 flex-1" />
    </div>
  );
}

function MarketRow({ market, onBuy }) {
  const [buying, setBuying] = useState(null); // 'yes' | 'no'
  const [amount, setAmount] = useState('20');
  const yesProb = getImpliedProb(market.yesPool, market.noPool, 'yes');
  const noProb  = 100 - yesProb;

  return (
    <div className="border border-white/8 bg-white/[0.02] p-4"
      style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))' }}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <p className="font-rajdhani font-semibold text-sm text-white/80">{market.question}</p>
          <div className="flex items-center gap-3 mt-1">
            <span className="font-mono text-[8px] text-white/25">Pool: {(market.yesPool + market.noPool).toLocaleString()} $SD</span>
            <span className="font-mono text-[8px] text-yellow-400/60">Closes: {market.closesIn}</span>
          </div>
        </div>
      </div>

      <PoolBar yesPool={market.yesPool} noPool={market.noPool} />

      <div className="grid grid-cols-2 gap-2 mt-3">
        <button onClick={() => setBuying(buying === 'yes' ? null : 'yes')}
          className={`flex items-center justify-between px-3 py-2 border transition-all ${
            buying === 'yes' ? 'border-green-500 bg-green-500/15' : 'border-green-500/25 bg-green-500/5 hover:border-green-500/50'
          }`} style={{ clipPath: 'polygon(5px 0%, 100% 0%, calc(100% - 5px) 100%, 0% 100%)' }}>
          <div className="flex items-center gap-1.5">
            <TrendingUp size={12} className="text-green-400" />
            <span className="font-orbitron text-xs text-green-400 font-bold">YES</span>
          </div>
          <span className="font-orbitron text-sm text-green-400 font-black">{yesProb}%</span>
        </button>

        <button onClick={() => setBuying(buying === 'no' ? null : 'no')}
          className={`flex items-center justify-between px-3 py-2 border transition-all ${
            buying === 'no' ? 'border-red-500 bg-red-500/15' : 'border-red-500/25 bg-red-500/5 hover:border-red-500/50'
          }`} style={{ clipPath: 'polygon(5px 0%, 100% 0%, calc(100% - 5px) 100%, 0% 100%)' }}>
          <div className="flex items-center gap-1.5">
            <TrendingDown size={12} className="text-red-400" />
            <span className="font-orbitron text-xs text-red-400 font-bold">NO</span>
          </div>
          <span className="font-orbitron text-sm text-red-400 font-black">{noProb}%</span>
        </button>
      </div>

      <AnimatePresence>
        {buying && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mt-3">
            <div className="flex gap-2 items-center">
              <input type="number" min="1" value={amount} onChange={e => setAmount(e.target.value)}
                className="cyber-input w-24 text-center font-orbitron text-sm" />
              <span className="font-mono text-xs text-white/30">$SD</span>
              <div className="flex-1 text-right font-mono text-[9px] text-white/40">
                ≈ {Math.floor(parseFloat(amount) * (buying === 'yes' ? market.noPool : market.yesPool) / ((buying === 'yes' ? market.yesPool : market.noPool) + parseFloat(amount)))} shares
              </div>
            </div>
            <button
              onClick={() => { onBuy?.(market.id, buying, amount); setBuying(null); }}
              className={`mt-2 w-full py-2 font-orbitron text-[10px] tracking-[2px] border transition-all ${
                buying === 'yes'
                  ? 'border-green-500/50 bg-green-500/10 text-green-400 hover:bg-green-500/20'
                  : 'border-red-500/50 bg-red-500/10 text-red-400 hover:bg-red-500/20'
              }`}>
              BUY {buying.toUpperCase()} — {amount} $SD
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function NativePredictionMarket() {
  const { isConnected } = useAccount();

  const handleBuy = (marketId, side, amount) => {
    console.log('Buy shares', { marketId, side, amount });
    // TODO: connect to SDPredictionMarket.sol buyShares()
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="font-mono text-[8px] text-fire-3/40 uppercase tracking-[3px]">SD NATIVE</p>
          <p className="font-orbitron text-sm text-fire-4">On-Chain AMM Markets</p>
        </div>
        <span className="font-mono text-[8px] text-cyan-400/60 border border-cyan-400/20 px-2 py-1">Polygon PoS</span>
      </div>

      {!isConnected && (
        <div className="mb-3 px-4 py-2 border border-yellow-500/20 bg-yellow-500/5 text-center">
          <p className="font-mono text-[9px] text-yellow-400">Connect wallet to buy prediction shares</p>
        </div>
      )}

      <div className="space-y-3">
        {DEMO_MARKETS.map(m => <MarketRow key={m.id} market={m} onBuy={handleBuy} />)}
      </div>

      <p className="font-mono text-[7px] text-white/15 text-center mt-3">
        AMM constant-product model · 1.5% platform fee · Resolved by SD oracle
      </p>
    </div>
  );
}