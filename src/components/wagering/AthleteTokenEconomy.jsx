import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Shield, Crown, Star, Zap } from 'lucide-react';

const TIERS = [
  { id: 'rising_star',      label: 'Rising Star',      color: 'text-gray-400',    border: 'border-gray-400/25',  bg: 'bg-gray-400/5',    icon: Star,   wagerAccess: true,  winRate: '—',    benefit: 'Base token gating' },
  { id: 'breakout_talent',  label: 'Breakout Talent',  color: 'text-blue-400',    border: 'border-blue-400/25',  bg: 'bg-blue-400/5',    icon: Zap,    wagerAccess: true,  winRate: '+1.5x', benefit: 'Priority match access' },
  { id: 'elite_performer',  label: 'Elite Performer',  color: 'text-purple-400',  border: 'border-purple-500/30', bg: 'bg-purple-500/5', icon: Shield, wagerAccess: true,  winRate: '+2x',  benefit: 'Royalty share on sponsorships' },
  { id: 'living_legend',    label: 'Living Legend',    color: 'text-yellow-400',  border: 'border-yellow-400/40', bg: 'bg-yellow-400/8', icon: Crown,  wagerAccess: true,  winRate: '+3x',  benefit: 'Champion status + Window Challenge access' },
];

function TierCard({ tier, count = 0 }) {
  const Icon = tier.icon;
  return (
    <div className={`p-4 border ${tier.border} ${tier.bg} relative overflow-hidden`}
      style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))' }}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon size={16} className={tier.color} />
          <div>
            <div className={`font-orbitron font-bold text-xs ${tier.color}`}>{tier.label}</div>
            {tier.id === 'living_legend' && (
              <div className="font-mono text-[7px] text-yellow-400/60 uppercase tracking-[1px]">Champion Eligible</div>
            )}
          </div>
        </div>
        {count > 0 && (
          <span className={`font-orbitron text-sm font-black ${tier.color}`}>{count}</span>
        )}
      </div>
      <div className="space-y-1.5">
        <div className="flex justify-between">
          <span className="font-mono text-[8px] text-white/25">P2P Wager Access</span>
          <span className="font-mono text-[8px] text-green-400">✓ Enabled</span>
        </div>
        <div className="flex justify-between">
          <span className="font-mono text-[8px] text-white/25">Multiplier</span>
          <span className={`font-mono text-[8px] ${tier.color}`}>{tier.winRate}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-mono text-[8px] text-white/25">Benefit</span>
          <span className={`font-mono text-[8px] ${tier.color} text-right max-w-[120px]`}>{tier.benefit}</span>
        </div>
      </div>
    </div>
  );
}

export default function AthleteTokenEconomy({ lang = 'it' }) {
  const { data: user } = useQuery({ queryKey: ['current-user'], queryFn: () => base44.auth.me() });

  const { data: myTokens = [] } = useQuery({
    queryKey: ['my-token-economy', user?.email],
    queryFn: () => base44.entities.TokenOwnership.filter({ user_email: user.email }),
    enabled: !!user?.email,
    initialData: [],
  });

  const { data: athletes = [] } = useQuery({
    queryKey: ['athlete-tokens-market'],
    queryFn: () => base44.entities.AthleteToken.list('-current_price', 20),
    initialData: [],
  });

  const tierCounts = TIERS.reduce((acc, t) => {
    acc[t.id] = myTokens.filter(tok => tok.rarity === t.id).length;
    return acc;
  }, {});

  const champions = athletes.filter(a => a.attributes?.isChampion);

  return (
    <div className="mb-8">
      {/* Section header */}
      <div className="mb-5">
        <p className="font-mono text-[9px] tracking-[5px] uppercase text-fire-3/40">PILLAR III</p>
        <h3 className="font-orbitron font-black text-xl text-fire-4 mt-0.5">TOKEN & CARD ECONOMY</h3>
        <p className="font-rajdhani text-sm text-white/40 mt-1">
          4 rarity tiers · Token gating for P2P wagers · Champion cards flagged on-chain
        </p>
      </div>

      {/* Tier grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {TIERS.map(tier => (
          <motion.div key={tier.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: TIERS.indexOf(tier) * 0.07 }}>
            <TierCard tier={tier} count={tierCounts[tier.id]} />
          </motion.div>
        ))}
      </div>

      {/* Champion cards */}
      {champions.length > 0 && (
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-3">
            <Crown size={14} className="text-yellow-400" />
            <p className="font-mono text-[9px] uppercase tracking-[3px] text-yellow-400/60">Active Champions</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {champions.map(a => (
              <div key={a.id} className="flex items-center gap-2 px-3 py-2 border border-yellow-400/30 bg-yellow-400/5"
                style={{ clipPath: 'polygon(5px 0%, 100% 0%, calc(100% - 5px) 100%, 0% 100%)' }}>
                <Crown size={11} className="text-yellow-400" />
                <span className="font-orbitron text-xs text-yellow-400">{a.athlete_name}</span>
                <span className="font-mono text-[8px] text-yellow-400/40">{a.sport}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* My portfolio summary */}
      {myTokens.length > 0 && (
        <div className="border border-fire-3/15 bg-fire-3/5 p-4"
          style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 100%, 12px 100%, 0 100%)' }}>
          <div className="flex items-center justify-between mb-3">
            <p className="font-mono text-[9px] uppercase tracking-[3px] text-fire-3/50">Your Collection</p>
            <span className="font-orbitron font-bold text-fire-4">{myTokens.length} cards</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {myTokens.slice(0, 8).map(tok => (
              <div key={tok.id} className="flex items-center gap-1.5 px-2 py-1 border border-fire-3/15 bg-black/30">
                <span className="font-mono text-[8px] text-white/50">{tok.athlete_name}</span>
                <span className={`font-mono text-[7px] uppercase ${
                  tok.rarity === 'living_legend' ? 'text-yellow-400' :
                  tok.rarity === 'elite_performer' ? 'text-purple-400' :
                  tok.rarity === 'breakout_talent' ? 'text-blue-400' : 'text-gray-400'
                }`}>{tok.rarity?.replace(/_/g, ' ')}</span>
              </div>
            ))}
            {myTokens.length > 8 && (
              <div className="flex items-center px-2 py-1 border border-white/5">
                <span className="font-mono text-[8px] text-white/25">+{myTokens.length - 8} more</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* On-chain metadata notice */}
      <div className="mt-4 px-4 py-3 border border-white/5 bg-white/[0.01]">
        <p className="font-mono text-[7px] text-white/20">
          Card metadata: athlete stats · tournament history · win rate · wager availability · isChampion flag
          updated on-chain each tournament cycle via oracle transaction
        </p>
      </div>
    </div>
  );
}