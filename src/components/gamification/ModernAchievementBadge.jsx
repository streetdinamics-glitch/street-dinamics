import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Heart, Share2, Compass, TrendingUp, Award } from 'lucide-react';

const badgeStyles = {
  'founder': { icon: <Zap size={24} />, color: 'from-fire-3 to-fire-5', label: 'FOUNDER', desc: '5+ content pieces' },
  'ambassador': { icon: <TrendingUp size={24} />, color: 'from-cyan to-purple-500', label: 'AMBASSADOR', desc: '5 successful referrals' },
  'curator': { icon: <Heart size={24} />, color: 'from-fire-5 to-red-500', label: 'CURATOR', desc: '250+ points earned' },
  'trailblazer': { icon: <Share2 size={24} />, color: 'from-green-500 to-cyan', label: 'TRAILBLAZER', desc: '100+ engagement reach' },
  'catalyst': { icon: <Compass size={24} />, color: 'from-purple-500 to-pink-500', label: 'CATALYST', desc: '500+ total engagement' },
  'luminary': { icon: <Award size={24} />, color: 'from-yellow-400 to-fire-3', label: 'LUMINARY', desc: '1000+ points mastery' },
};

export default function ModernAchievementBadge({ badgeId, unlocked = false, progress = 0, onClaim }) {
  const badge = badgeStyles[badgeId] || badgeStyles['superfan'];
  const canClaim = !unlocked && progress >= 0.95;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="group relative"
    >
      <button
        onClick={canClaim ? () => onClaim?.({ id: badgeId, name: badge.label, description: badge.desc }) : undefined}
        disabled={!canClaim}
        className={`w-28 h-28 rounded-lg border-2 ${unlocked ? 'border-fire-3/60' : canClaim ? 'border-fire-5 animate-pulse' : 'border-fire-3/20'} bg-gradient-to-br ${badge.color} p-0.5 transition-all ${unlocked ? 'shadow-[0_0_20px_rgba(255,100,0,0.6)]' : canClaim ? 'shadow-[0_0_30px_rgba(255,200,0,0.8)] cursor-pointer hover:scale-105' : 'opacity-40'}`}
      >
        <div className={`w-full h-full rounded-lg flex flex-col items-center justify-center gap-1 text-white font-orbitron ${unlocked ? 'bg-gradient-to-br from-black/40 to-black/60' : 'bg-black/80'}`}>
          {badge.icon}
          <span className="text-[8px] font-bold tracking-[1px] text-center leading-tight px-1">{badge.label}</span>
        </div>
      </button>
      
      {!unlocked && (
        <div className="absolute inset-0 rounded-lg flex items-center justify-center">
          <div className="relative w-20 h-20 flex items-center justify-center">
            <svg className="transform -rotate-90 w-20 h-20">
              <circle cx="40" cy="40" r="35" fill="none" stroke="rgba(255,100,0,0.1)" strokeWidth="3" />
              <circle
                cx="40"
                cy="40"
                r="35"
                fill="none"
                stroke="rgba(255,100,0,0.6)"
                strokeWidth="3"
                strokeDasharray={`${2 * Math.PI * 35}`}
                strokeDashoffset={`${2 * Math.PI * 35 * (1 - progress)}`}
                className="transition-all duration-300"
              />
            </svg>
            <span className="absolute text-[10px] font-mono text-fire-3 font-bold">{Math.round(progress * 100)}%</span>
          </div>
        </div>
      )}

      <div className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-[100] transition-opacity">
        <div className="bg-black/95 border border-fire-3/40 rounded px-3 py-2 text-center whitespace-nowrap">
          <p className="font-orbitron text-[10px] font-bold text-fire-4">{badge.label}</p>
          <p className="font-mono text-[8px] text-fire-3/60">{badge.desc}</p>
          {canClaim && (
            <p className="font-mono text-[8px] text-fire-5 mt-1 font-bold">Click to claim!</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}