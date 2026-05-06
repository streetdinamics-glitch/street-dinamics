/**
 * SD3PillarsHub
 * 
 * Master component unifying all three pillars of the Street Dinamics
 * wagering & prediction economy. Replaces the old EthicBettingPanel / BetSection.
 * 
 * Pillar I  — P2P Athlete Token Wagering (AthleteWager.sol)
 * Pillar II — Prediction Markets (Native AMM + Polymarket/Kalshi signals)
 * Pillar III — Token & Card Economy (rarity tiers, champion flags)
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, BarChart2, Layers } from 'lucide-react';
import WageringHub from './WageringHub';
import PredictionMarketPanel from '../prediction/PredictionMarketPanel';
import AthleteTokenEconomy from './AthleteTokenEconomy';

const PILLARS = [
  {
    id: 'wager',
    num: 'I',
    label: 'P2P Wagers',
    sublabel: 'Token-gated · On-chain escrow',
    icon: Shield,
    accentClass: 'border-fire-3/60 text-fire-4',
    activeBg: 'bg-fire-3/8',
  },
  {
    id: 'prediction',
    num: 'II',
    label: 'Prediction Markets',
    sublabel: 'AMM + Polymarket + Kalshi',
    icon: BarChart2,
    accentClass: 'border-cyan-400/60 text-cyan-400',
    activeBg: 'bg-cyan-400/8',
  },
  {
    id: 'economy',
    num: 'III',
    label: 'Card Economy',
    sublabel: '4 tiers · Champion flags',
    icon: Layers,
    accentClass: 'border-purple-400/60 text-purple-400',
    activeBg: 'bg-purple-400/8',
  },
];

export default function SD3PillarsHub({ lang = 'it' }) {
  const [active, setActive] = useState('wager');

  return (
    <section id="gamification" className="section-container">
      {/* Header */}
      <div className="text-center mb-10">
        <p className="font-mono text-[9px] tracking-[8px] uppercase text-fire-3/40 mb-3">STREET DINAMICS</p>
        <h2 className="heading-fire text-[clamp(28px,5vw,56px)] font-black leading-none mb-3">
          WAGERING SYSTEM
        </h2>
        <p className="font-rajdhani text-base text-white/40 max-w-xl mx-auto">
          Three independent pillars. All on-chain. All non-custodial. Polygon PoS.
        </p>
      </div>

      {/* Pillar selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
        {PILLARS.map(p => {
          const Icon = p.icon;
          const isActive = active === p.id;
          return (
            <button
              key={p.id}
              onClick={() => setActive(p.id)}
              className={`relative p-5 border text-left transition-all duration-200 ${
                isActive
                  ? `${p.accentClass} ${p.activeBg} shadow-[0_0_20px_rgba(255,102,0,0.1)]`
                  : 'border-white/8 bg-white/[0.02] text-white/40 hover:border-white/20'
              }`}
              style={{ clipPath: 'polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))' }}
            >
              {isActive && <div className="absolute top-0 left-0 right-0 fire-line" />}
              <div className="flex items-start gap-3">
                <div className={`font-orbitron font-black text-2xl leading-none ${isActive ? '' : 'opacity-20'}`}>
                  {p.num}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon size={14} className={isActive ? '' : 'opacity-30'} />
                    <span className="font-orbitron font-bold text-sm">{p.label}</span>
                  </div>
                  <div className="font-mono text-[8px] opacity-50 uppercase tracking-[1px]">{p.sublabel}</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active pillar content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
        >
          {active === 'wager'      && <WageringHub lang={lang} />}
          {active === 'prediction' && <PredictionMarketPanel lang={lang} />}
          {active === 'economy'    && <AthleteTokenEconomy lang={lang} />}
        </motion.div>
      </AnimatePresence>

      {/* Global disclaimer */}
      <div className="mt-8 border border-dashed border-white/5 px-5 py-3 text-center">
        <p className="font-mono text-[7px] text-white/15 leading-loose">
          All wagers and predictions use $SD utility tokens or on-chain Polygon transactions.
          No fiat currency. No custodial wallets. Smart contracts are non-upgradeable by users.
          Operated by Entretain Holding FZE — IFZA Business Park, Dubai, UAE.
        </p>
      </div>
    </section>
  );
}