import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, RefreshCw, TrendingUp, Activity } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

// Polymarket & Kalshi feeds — these are reference data widgets.
// In production, hit the Kalshi REST API and Polymarket Graph subgraph.
// Below uses realistic-looking mock data that would be replaced with live API calls.

const MOCK_KALSHI = [
  { id: 'k1', question: 'MMA Championship: Fighter A wins?', yesPrice: 0.62, noPrice: 0.38, volume: '$42.1K', url: 'https://kalshi.com' },
  { id: 'k2', question: 'Street Dance Battle: tie in final round?', yesPrice: 0.28, noPrice: 0.72, volume: '$18.7K', url: 'https://kalshi.com' },
];

const MOCK_POLYMARKET = [
  { id: 'p1', question: 'SD Skate Open: Will new world record be set?', outc: [{ label: 'Yes', prob: 0.34 }, { label: 'No', prob: 0.66 }], volume: '$61K', liquidity: '$12K', url: 'https://polymarket.com' },
  { id: 'p2', question: 'SD Rap Battle: Freestyle round added?',        outc: [{ label: 'Yes', prob: 0.51 }, { label: 'No', prob: 0.49 }], volume: '$29K', liquidity: '$8K',  url: 'https://polymarket.com' },
];

function KalshiCard({ market }) {
  return (
    <div className="p-3 border border-blue-500/15 bg-blue-500/[0.04]"
      style={{ clipPath: 'polygon(5px 0%, 100% 0%, calc(100% - 5px) 100%, 0% 100%)' }}>
      <div className="flex items-start justify-between mb-2">
        <p className="font-rajdhani text-sm text-white/70 flex-1 pr-2">{market.question}</p>
        <a href={market.url} target="_blank" rel="noopener noreferrer" className="text-blue-400/60 hover:text-blue-400">
          <ExternalLink size={11} />
        </a>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div className="h-full bg-green-400 transition-all" style={{ width: `${market.yesPrice * 100}%` }} />
        </div>
        <span className="font-orbitron text-xs text-green-400 font-bold">{Math.round(market.yesPrice * 100)}¢</span>
        <span className="font-mono text-[8px] text-white/20">Vol: {market.volume}</span>
      </div>
    </div>
  );
}

function PolymarketCard({ market }) {
  return (
    <div className="p-3 border border-purple-500/15 bg-purple-500/[0.04]"
      style={{ clipPath: 'polygon(5px 0%, 100% 0%, calc(100% - 5px) 100%, 0% 100%)' }}>
      <div className="flex items-start justify-between mb-2">
        <p className="font-rajdhani text-sm text-white/70 flex-1 pr-2">{market.question}</p>
        <a href={market.url} target="_blank" rel="noopener noreferrer" className="text-purple-400/60 hover:text-purple-400">
          <ExternalLink size={11} />
        </a>
      </div>
      <div className="flex items-center gap-2 mb-1.5">
        {market.outc.map(o => (
          <div key={o.label} className="flex items-center gap-1">
            <span className="font-orbitron text-[9px] text-white/40">{o.label}</span>
            <span className={`font-orbitron text-xs font-bold ${o.label === 'Yes' ? 'text-green-400' : 'text-red-400'}`}>
              {Math.round(o.prob * 100)}%
            </span>
          </div>
        ))}
        <span className="ml-auto font-mono text-[7px] text-white/20">Liq: {market.liquidity}</span>
      </div>
    </div>
  );
}

export default function ExternalMarketsFeed() {
  const [source, setSource] = useState('polymarket'); // 'kalshi' | 'polymarket'

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="font-mono text-[8px] text-fire-3/40 uppercase tracking-[3px]">EXTERNAL SIGNALS</p>
          <p className="font-orbitron text-sm text-fire-4">Market Reference Data</p>
        </div>
        <div className="flex gap-1">
          {[
            { id: 'polymarket', label: 'Polymarket', color: 'purple' },
            { id: 'kalshi',     label: 'Kalshi',     color: 'blue' },
          ].map(s => (
            <button key={s.id} onClick={() => setSource(s.id)}
              className={`font-mono text-[9px] uppercase tracking-[1px] px-3 py-1.5 border transition-all ${
                source === s.id
                  ? s.color === 'purple' ? 'border-purple-500/50 bg-purple-500/10 text-purple-300'
                                         : 'border-blue-500/50 bg-blue-500/10 text-blue-300'
                  : 'border-white/10 text-white/30 hover:border-white/25'
              }`}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <motion.div key={source} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
        className="space-y-2">
        {source === 'kalshi'
          ? MOCK_KALSHI.map(m => <KalshiCard key={m.id} market={m} />)
          : MOCK_POLYMARKET.map(m => <PolymarketCard key={m.id} market={m} />)
        }
      </motion.div>

      <div className="mt-3 px-3 py-2 border border-white/5 bg-white/[0.01]">
        <p className="font-mono text-[7px] text-white/20 text-center">
          Reference data only · {source === 'kalshi' ? 'Kalshi REST API' : 'Polymarket / The Graph'} · Not financial advice
        </p>
      </div>
    </div>
  );
}