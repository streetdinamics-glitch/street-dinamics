import React from 'react';
import { motion } from 'framer-motion';

// XP thresholds per level
const LEVELS = [
  { level: 1, label: 'ROOKIE',       minXP: 0,    color: '#888', glow: 'rgba(136,136,136,0.4)' },
  { level: 2, label: 'CONTENDER',    minXP: 100,  color: '#00ffee', glow: 'rgba(0,255,238,0.4)' },
  { level: 3, label: 'COMPETITOR',   minXP: 300,  color: '#00cc88', glow: 'rgba(0,204,136,0.4)' },
  { level: 4, label: 'PRO',          minXP: 600,  color: '#ff9900', glow: 'rgba(255,153,0,0.5)' },
  { level: 5, label: 'ELITE',        minXP: 1000, color: '#ff6600', glow: 'rgba(255,102,0,0.6)' },
  { level: 6, label: 'LEGEND',       minXP: 1800, color: '#ff1a00', glow: 'rgba(255,26,0,0.6)' },
  { level: 7, label: 'HALL OF FAME', minXP: 3000, color: '#ffcc00', glow: 'rgba(255,204,0,0.8)' },
];

function calcXP({ wins = 0, events = 0, badges = 0, tokens = 0 }) {
  return wins * 80 + events * 20 + badges * 30 + tokens * 15;
}

function getCurrentLevel(xp) {
  let current = LEVELS[0];
  for (const lvl of LEVELS) {
    if (xp >= lvl.minXP) current = lvl;
    else break;
  }
  return current;
}

function getNextLevel(currentLevel) {
  return LEVELS.find(l => l.level === currentLevel.level + 1) || null;
}

export default function AthleteXPBar({ stats, badges = [], tokens = [] }) {
  const wins = stats?.wins || 0;
  const events = stats?.events_participated || 0;
  const xp = calcXP({ wins, events, badges: badges.length, tokens: tokens.length });
  const current = getCurrentLevel(xp);
  const next = getNextLevel(current);

  const progress = next
    ? Math.min(100, Math.round(((xp - current.minXP) / (next.minXP - current.minXP)) * 100))
    : 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8 p-5 border border-white/10 bg-black/40"
      style={{ clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))' }}
    >
      {/* Top row */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="font-mono text-[9px] tracking-[5px] uppercase mb-0.5" style={{ color: current.color }}>
            LVL {current.level} — {current.label}
          </p>
          <p className="font-orbitron font-black text-2xl" style={{ color: current.color, textShadow: `0 0 20px ${current.glow}` }}>
            {xp.toLocaleString()} XP
          </p>
        </div>
        <div className="text-right">
          {next ? (
            <>
              <p className="font-mono text-[9px] text-white/20">NEXT LEVEL</p>
              <p className="font-orbitron text-sm" style={{ color: next.color }}>{next.label}</p>
              <p className="font-mono text-[9px] text-white/30">{next.minXP - xp} XP remaining</p>
            </>
          ) : (
            <p className="font-orbitron text-sm text-yellow-400">MAX LEVEL 🏆</p>
          )}
        </div>
      </div>

      {/* XP Bar */}
      <div className="h-3 bg-white/5 w-full overflow-hidden relative" style={{ clipPath: 'polygon(4px 0%, 100% 0%, calc(100% - 4px) 100%, 0% 100%)' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="h-full"
          style={{ background: `linear-gradient(90deg, ${current.color}88, ${current.color})`, boxShadow: `0 0 12px ${current.glow}` }}
        />
      </div>
      <div className="flex justify-between mt-1">
        <span className="font-mono text-[8px] text-white/20">{current.minXP} XP</span>
        <span className="font-mono text-[8px] text-white/20">{progress}%</span>
        {next && <span className="font-mono text-[8px] text-white/20">{next.minXP} XP</span>}
      </div>

      {/* XP Breakdown */}
      <div className="flex gap-4 mt-4 flex-wrap">
        {[
          { label: 'Victories', val: wins, mult: 80, emoji: '⚔️' },
          { label: 'Events',    val: events, mult: 20, emoji: '📅' },
          { label: 'Badges',    val: badges.length, mult: 30, emoji: '🎖️' },
          { label: 'Cards',     val: tokens.length, mult: 15, emoji: '🃏' },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-1.5">
            <span className="text-sm">{item.emoji}</span>
            <div>
              <div className="font-orbitron text-[11px] text-white/60">{item.val} <span className="text-white/30">×{item.mult}</span></div>
              <div className="font-mono text-[8px] text-white/20">{item.label}</div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}