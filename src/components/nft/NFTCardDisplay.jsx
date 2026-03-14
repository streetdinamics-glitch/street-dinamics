import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, Trophy, Zap, Play } from 'lucide-react';

const TIER_CONFIG = {
  common: {
    gradient: 'from-slate-600 to-slate-800',
    glow: 'rgba(148, 163, 184, 0.4)',
    border: 'border-slate-500/30',
    accent: 'text-slate-400',
    badgeBg: 'bg-slate-500/20'
  },
  rare: {
    gradient: 'from-blue-600 to-purple-700',
    glow: 'rgba(147, 51, 234, 0.4)',
    border: 'border-purple-500/30',
    accent: 'text-purple-400',
    badgeBg: 'bg-purple-500/20'
  },
  epic: {
    gradient: 'from-cyan-500 to-cyan-700',
    glow: 'rgba(0, 255, 238, 0.4)',
    border: 'border-cyan/30',
    accent: 'text-cyan',
    badgeBg: 'bg-cyan/20'
  },
  legendary: {
    gradient: 'from-yellow-500 via-orange-500 to-red-600',
    glow: 'rgba(255, 150, 0, 0.6)',
    border: 'border-fire-3/40',
    accent: 'text-fire-5',
    badgeBg: 'bg-fire-3/30'
  }
};

export default function NFTCardDisplay({ nft, onMint, onAnalytics, onVideoPreview }) {
  const [showPaymentChoice, setShowPaymentChoice] = useState(false);
  const config = TIER_CONFIG[nft.rarity];
  const soldOutPercentage = ((nft.total_supply - nft.minted_count) / nft.total_supply) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`relative bg-gradient-to-br from-[rgba(10,4,18,0.98)] to-[rgba(4,2,8,1)] border ${config.border} clip-cyber overflow-hidden group`}
    >
      {/* Animated glow on hover */}
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 0%, ${config.glow}, transparent 70%)`
        }}
      />

      {/* Rarity badge */}
      <div className={`absolute top-3 right-3 z-10 font-orbitron text-[8px] font-black tracking-[2px] uppercase px-2.5 py-1 bg-gradient-to-r ${config.gradient} text-white clip-btn`}>
        {nft.rarity}
      </div>

      {/* Card image with video overlay option */}
      <div className="relative h-[220px] overflow-hidden">
        <img
          src={nft.image_url || 'https://via.placeholder.com/400x300?text=NFT'}
          alt={nft.event_moment}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(4,2,8,1)] via-transparent to-transparent" />
        
        {nft.video_url && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            onClick={() => onVideoPreview?.(nft)}
            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <div className="w-14 h-14 rounded-full bg-fire-3/80 flex items-center justify-center">
              <Play size={24} className="text-black fill-black" />
            </div>
          </motion.button>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-orbitron font-bold text-lg text-fire-5 mb-1">{nft.athlete_name}</h3>
        <p className="font-mono text-[10px] tracking-[2px] uppercase text-fire-3/40 mb-3">{nft.event_moment}</p>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-fire-3/5 border border-fire-3/10 p-2">
            <div className="flex items-center gap-1 mb-1">
              <Users size={12} className="text-fire-3/40" />
              <span className="font-mono text-[8px] text-fire-3/40 tracking-[1px]">SUPPLY</span>
            </div>
            <div className="font-orbitron font-bold text-sm text-fire-4">{nft.minted_count}/{nft.total_supply}</div>
          </div>
          <div className="bg-fire-3/5 border border-fire-3/10 p-2">
            <div className="flex items-center gap-1 mb-1">
              <TrendingUp size={12} className="text-fire-3/40" />
              <span className="font-mono text-[8px] text-fire-3/40 tracking-[1px]">FLOOR</span>
            </div>
            <div className="font-orbitron font-bold text-sm text-fire-4">€{nft.current_floor_price || nft.mint_price}</div>
          </div>
        </div>

        {/* Attributes */}
        {nft.attributes && Object.keys(nft.attributes).length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-1.5 mb-2">
              <Zap size={12} className="text-cyan" />
              <span className="font-mono text-[9px] tracking-[2px] uppercase text-cyan">Attributes</span>
            </div>
            <div className="space-y-1">
              {Object.entries(nft.attributes).slice(0, 3).map(([key, value]) => (
                <div key={key} className="font-rajdhani text-xs text-fire-4/40 flex items-center justify-between">
                  <span>{key}</span>
                  <span className={config.accent}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="font-mono text-[8px] text-fire-3/30 tracking-[1px]">MINTED</span>
            <span className="font-mono text-[8px] text-fire-3/30 tracking-[1px]">{soldOutPercentage.toFixed(0)}%</span>
          </div>
          <div className="h-1 bg-fire-3/10 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${soldOutPercentage}%` }}
              transition={{ duration: 1, delay: 0.3 }}
              className={`h-full bg-gradient-to-r ${config.gradient}`}
            />
          </div>
        </div>

        {/* Price and actions */}
        <div className="flex items-center justify-between">
          <div>
            <div className="font-mono text-[9px] text-fire-3/40 tracking-[1px] mb-0.5">MINT PRICE</div>
            <div className="font-orbitron font-black text-xl text-fire-5">€{nft.mint_price}</div>
          </div>

          {nft.status === 'sold_out' ? (
            <button disabled className="btn-ghost text-[10px] py-2.5 px-4 opacity-30 cursor-not-allowed">
              SOLD OUT
            </button>
          ) : nft.status === 'upcoming' ? (
            <button disabled className="btn-ghost text-[10px] py-2.5 px-4 opacity-40 cursor-not-allowed">
              COMING SOON
            </button>
          ) : showPaymentChoice ? (
            <div className="flex flex-col gap-1.5">
              <button
                onClick={() => { setShowPaymentChoice(false); onMint?.(nft, 'fiat'); }}
                className="btn-ghost text-[9px] py-1.5 px-3 border-fire-3/40"
              >
                💳 Fiat
              </button>
              <button
                onClick={() => { setShowPaymentChoice(false); onMint?.(nft, 'crypto'); }}
                className="btn-ghost text-[9px] py-1.5 px-3 border-cyan/40 text-cyan"
              >
                🔗 Web3
              </button>
            </div>
          ) : (
            <motion.button
              onClick={() => setShowPaymentChoice(true)}
              className="btn-fire text-[10px] py-2.5 px-5"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              MINT NOW
            </motion.button>
          )}
        </div>

        {/* Analytics link */}
        {nft.status === 'live' && (
          <button
            onClick={() => onAnalytics?.(nft)}
            className="w-full mt-3 py-2 text-[9px] font-mono tracking-[1px] uppercase border border-cyan/40 text-cyan hover:bg-cyan/10 transition-colors"
          >
            📊 View Analytics
          </button>
        )}
      </div>

      {/* Scan line effect */}
      <motion.div
        className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-fire-3/30 to-transparent pointer-events-none"
        animate={{ y: [0, 350] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
      />
    </motion.div>
  );
}