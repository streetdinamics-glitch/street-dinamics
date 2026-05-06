import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart2, Globe, Zap } from 'lucide-react';
import NativePredictionMarket from './NativePredictionMarket';
import ExternalMarketsFeed from './ExternalMarketsFeed';

const SOURCES = [
  { id: 'native',     label: 'SD Native',  icon: Zap,      desc: 'On-chain AMM markets on Polygon' },
  { id: 'polymarket', label: 'Polymarket', icon: Globe,     desc: 'External market signals' },
  { id: 'kalshi',     label: 'Kalshi',     icon: BarChart2, desc: 'Regulated prediction exchange' },
];

export default function PredictionMarketPanel({ lang = 'it' }) {
  const [activeSource, setActiveSource] = useState('native');

  return (
    <div className="mb-8">
      {/* Section header */}
      <div className="mb-5">
        <p className="font-mono text-[9px] tracking-[5px] uppercase text-fire-3/40">PILLAR II</p>
        <h3 className="font-orbitron font-black text-xl text-fire-4 mt-0.5">PREDICTION MARKETS</h3>
        <p className="font-rajdhani text-sm text-white/40 mt-1">
          Trade YES/NO shares on match outcomes · Native on-chain + external market signals
        </p>
      </div>

      {/* Source tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {SOURCES.map(s => {
          const Icon = s.icon;
          return (
            <button
              key={s.id}
              onClick={() => setActiveSource(s.id)}
              className={`flex items-center gap-2 px-4 py-2.5 border transition-all ${
                activeSource === s.id
                  ? 'border-fire-3/60 bg-fire-3/10 text-fire-4'
                  : 'border-white/10 text-white/40 hover:border-fire-3/30 hover:text-fire-3/70'
              }`}
              style={{ clipPath: 'polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)' }}
            >
              <Icon size={13} className={activeSource === s.id ? 'text-fire-3' : 'text-white/30'} />
              <div className="text-left">
                <div className="font-orbitron text-[10px] font-bold">{s.label}</div>
                <div className="font-mono text-[7px] opacity-60 hidden sm:block">{s.desc}</div>
              </div>
              {activeSource === s.id && (
                <span className="w-1.5 h-1.5 rounded-full bg-fire-3 ml-1" />
              )}
            </button>
          );
        })}
      </div>

      {/* Panel content */}
      <div className="border border-fire-3/12 bg-gradient-to-br from-[rgba(10,4,18,0.97)] to-[rgba(4,2,8,1)] p-5"
        style={{ clipPath: 'polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSource}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.2 }}
          >
            {activeSource === 'native' ? (
              <NativePredictionMarket />
            ) : (
              <ExternalMarketsFeed defaultSource={activeSource} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}