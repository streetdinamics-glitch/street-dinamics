import React, { useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp, Zap, Crown, Star, Gift, Clock, Sparkles } from 'lucide-react';

const TIER_CONFIG = {
  rookie: {
    name: 'Rookie',
    icon: Star,
    color: 'from-slate-500 to-slate-700',
    border: 'border-slate-500/40',
    accent: 'text-slate-400',
    glow: 'rgba(148, 163, 184, 0.3)',
    multiplier: 1.0,
    requirement: 0,
    perks: ['Base token earnings', 'Access to public drops']
  },
  enthusiast: {
    name: 'Enthusiast',
    icon: Zap,
    color: 'from-blue-500 to-purple-600',
    border: 'border-purple-500/40',
    accent: 'text-purple-400',
    glow: 'rgba(147, 51, 234, 0.4)',
    multiplier: 1.25,
    requirement: 1000,
    perks: ['1.25x token earnings', '10% discount on rewards', 'Priority support']
  },
  superfan: {
    name: 'Superfan',
    icon: TrendingUp,
    color: 'from-cyan-500 to-cyan-700',
    border: 'border-cyan/40',
    accent: 'text-cyan',
    glow: 'rgba(0, 255, 238, 0.5)',
    multiplier: 1.5,
    requirement: 5000,
    perks: ['1.5x token earnings', '20% discount on rewards', 'Early access (24h)', 'Exclusive badge']
  },
  legend: {
    name: 'Legend',
    icon: Trophy,
    color: 'from-orange-500 to-red-600',
    border: 'border-fire-3/40',
    accent: 'text-fire-4',
    glow: 'rgba(255, 100, 0, 0.6)',
    multiplier: 2.0,
    requirement: 15000,
    perks: ['2x token earnings', '30% discount on rewards', 'Early access (48h)', 'VIP events access', 'Custom profile badge']
  },
  hall_of_fame: {
    name: 'Hall of Fame',
    icon: Crown,
    color: 'from-yellow-400 via-yellow-500 to-orange-600',
    border: 'border-yellow-500/50',
    accent: 'text-yellow-400',
    glow: 'rgba(255, 215, 0, 0.7)',
    multiplier: 3.0,
    requirement: 50000,
    perks: ['3x token earnings', '50% discount on rewards', 'Early access (72h)', 'VIP events + Meet & Greet', 'Lifetime exclusive NFTs', 'Governance voting rights']
  }
};

export default function FanStatusDashboard({ lang = 'en' }) {
  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: fanStatus } = useQuery({
    queryKey: ['fan-status', user?.email],
    queryFn: async () => {
      const status = await base44.entities.FanStatus.filter({ user_email: user.email });
      if (status.length === 0) {
        return await base44.entities.FanStatus.create({
          user_email: user.email,
          user_name: user.full_name,
          current_tier: 'rookie',
          total_tokens_spent: 0,
          total_tokens_earned: 0,
          current_multiplier: 1.0,
          rarity_score: 0,
          early_access_enabled: false,
        });
      }
      return status[0];
    },
    enabled: !!user,
  });

  const { data: inventory = [] } = useQuery({
    queryKey: ['user-inventory', user?.email],
    queryFn: () => base44.entities.UserInventory.filter({ user_email: user?.email }),
    enabled: !!user,
    initialData: [],
  });

  const { data: nftOwnership = [] } = useQuery({
    queryKey: ['nft-ownership', user?.email],
    queryFn: () => base44.entities.NFTOwnership.filter({ created_by: user?.email }),
    enabled: !!user,
    initialData: [],
  });

  const { data: tokenOwnership = [] } = useQuery({
    queryKey: ['token-ownership', user?.email],
    queryFn: () => base44.entities.TokenOwnership.filter({ created_by: user?.email }),
    enabled: !!user,
    initialData: [],
  });

  const rarityScore = useMemo(() => {
    const rarityPoints = {
      rising_star: 1,
      breakout_talent: 5,
      elite_performer: 15,
      living_legend: 50,
    };
    const nftScore = nftOwnership.reduce((sum, nft) => sum + (rarityPoints[nft.rarity] || 0), 0);
    const tokenScore = tokenOwnership.reduce((sum, token) => sum + (rarityPoints[token.rarity] || 0), 0);
    return nftScore + tokenScore;
  }, [nftOwnership, tokenOwnership]);

  const currentTier = fanStatus?.current_tier || 'rookie';
  const tierConfig = TIER_CONFIG[currentTier];
  const tierList = Object.keys(TIER_CONFIG);
  const currentTierIndex = tierList.indexOf(currentTier);
  const nextTier = tierList[currentTierIndex + 1];
  const nextTierConfig = nextTier ? TIER_CONFIG[nextTier] : null;

  const progress = useMemo(() => {
    if (!nextTierConfig) return 100;
    const spent = fanStatus?.total_tokens_spent || 0;
    const current = tierConfig.requirement;
    const next = nextTierConfig.requirement;
    return Math.min(((spent - current) / (next - current)) * 100, 100);
  }, [fanStatus, tierConfig, nextTierConfig]);

  const TierIcon = tierConfig.icon;

  if (!user) {
    return (
      <section className="section-container text-center py-20">
        <p className="font-mono text-sm text-fire-3/40">Login to view your fan status</p>
      </section>
    );
  }

  return (
    <section className="section-container">
      <p className="font-mono text-[10px] tracking-[7px] uppercase text-fire-3 text-center mb-2">
        FAN PROGRESSION
      </p>
      <h2 className="heading-fire text-[clamp(36px,7vw,88px)] text-center leading-none mb-4 font-black">
        YOUR STATUS
      </h2>

      <p className="text-center font-rajdhani text-lg text-fire-4/70 max-w-3xl mx-auto mb-12">
        Earn tokens, collect NFTs, and unlock exclusive perks as you progress through the tiers
      </p>

      {/* Current Tier Display */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`max-w-4xl mx-auto mb-12 bg-gradient-to-br ${tierConfig.color} p-1 clip-cyber relative overflow-hidden`}
      >
        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 0%, ${tierConfig.glow}, transparent 70%)` }} />
        
        <div className="bg-gradient-to-br from-[rgba(10,4,18,0.95)] to-[rgba(4,2,8,0.98)] p-8 clip-cyber relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${tierConfig.color} flex items-center justify-center`}>
                <TierIcon size={40} className="text-white" />
              </div>
              <div>
                <div className="font-orbitron text-3xl font-black text-white mb-1">{tierConfig.name}</div>
                <div className={`font-mono text-sm ${tierConfig.accent}`}>Level {currentTierIndex + 1} of {tierList.length}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-mono text-xs text-fire-3/60 mb-1">EARNINGS MULTIPLIER</div>
              <div className="font-orbitron text-4xl font-black text-fire-5">{tierConfig.multiplier}x</div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-fire-3/10 border border-fire-3/20 p-3">
              <div className="font-mono text-[8px] tracking-[1px] uppercase text-fire-3/60 mb-1">Tokens Spent</div>
              <div className="font-orbitron font-bold text-fire-5">{(fanStatus?.total_tokens_spent || 0).toLocaleString()}</div>
            </div>
            <div className="bg-fire-3/10 border border-fire-3/20 p-3">
              <div className="font-mono text-[8px] tracking-[1px] uppercase text-fire-3/60 mb-1">Rarity Score</div>
              <div className="font-orbitron font-bold text-cyan">{rarityScore}</div>
            </div>
            <div className="bg-fire-3/10 border border-fire-3/20 p-3">
              <div className="font-mono text-[8px] tracking-[1px] uppercase text-fire-3/60 mb-1">NFTs Owned</div>
              <div className="font-orbitron font-bold text-purple-400">{nftOwnership.length}</div>
            </div>
            <div className="bg-fire-3/10 border border-fire-3/20 p-3">
              <div className="font-mono text-[8px] tracking-[1px] uppercase text-fire-3/60 mb-1">Rewards</div>
              <div className="font-orbitron font-bold text-fire-4">{inventory.length}</div>
            </div>
          </div>

          {/* Progress to Next Tier */}
          {nextTierConfig && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs text-fire-3/60">Progress to {nextTierConfig.name}</span>
                <span className="font-mono text-xs text-fire-4">{progress.toFixed(0)}%</span>
              </div>
              <div className="h-3 bg-black/40 border border-fire-3/20 overflow-hidden mb-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                  className={`h-full bg-gradient-to-r ${nextTierConfig.color}`}
                />
              </div>
              <div className="font-mono text-xs text-fire-3/40">
                {nextTierConfig.requirement - (fanStatus?.total_tokens_spent || 0)} tokens until {nextTierConfig.name}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Active Perks */}
      <div className="max-w-4xl mx-auto mb-12">
        <h3 className="font-orbitron font-bold text-2xl text-fire-5 mb-6 flex items-center gap-2">
          <Gift size={24} className="text-fire-3" />
          Active Perks
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {tierConfig.perks.map((perk, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-gradient-to-br from-fire-3/10 to-transparent border border-fire-3/30 p-4 flex items-center gap-3"
            >
              <Sparkles size={16} className="text-fire-3 flex-shrink-0" />
              <span className="font-rajdhani text-fire-4">{perk}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* All Tiers Overview */}
      <div className="max-w-6xl mx-auto">
        <h3 className="font-orbitron font-bold text-2xl text-fire-5 mb-6 flex items-center gap-2">
          <Trophy size={24} className="text-cyan" />
          All Tiers
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(TIER_CONFIG).map(([tier, config], i) => {
            const Icon = config.icon;
            const isUnlocked = tierList.indexOf(tier) <= currentTierIndex;
            const isCurrent = tier === currentTier;

            return (
              <motion.div
                key={tier}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className={`bg-gradient-to-br from-[rgba(10,4,18,0.98)] to-[rgba(4,2,8,1)] border ${
                  isCurrent ? config.border : 'border-fire-3/20'
                } p-5 clip-cyber relative ${!isUnlocked && 'opacity-50'}`}
              >
                {isCurrent && (
                  <div className="absolute top-3 right-3 px-2 py-1 bg-fire-3/20 border border-fire-3/40 font-mono text-[8px] tracking-[1px] uppercase text-fire-3">
                    Current
                  </div>
                )}

                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${config.color} flex items-center justify-center`}>
                    <Icon size={24} className="text-white" />
                  </div>
                  <div>
                    <div className={`font-orbitron font-bold text-lg ${config.accent}`}>{config.name}</div>
                    <div className="font-mono text-xs text-fire-3/60">{config.multiplier}x multiplier</div>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="font-mono text-[9px] text-fire-3/60 mb-2">REQUIREMENT</div>
                  <div className="font-rajdhani text-sm text-fire-4">
                    {config.requirement === 0 ? 'Starting tier' : `${config.requirement.toLocaleString()} tokens spent`}
                  </div>
                </div>

                <div>
                  <div className="font-mono text-[9px] text-fire-3/60 mb-2">PERKS</div>
                  <ul className="space-y-1">
                    {config.perks.slice(0, 3).map((perk, j) => (
                      <li key={j} className="font-mono text-xs text-fire-4/70 flex items-start gap-1.5">
                        <span className="text-fire-3/40">•</span>
                        <span className="line-clamp-1">{perk}</span>
                      </li>
                    ))}
                    {config.perks.length > 3 && (
                      <li className="font-mono text-xs text-fire-3/40">+{config.perks.length - 3} more...</li>
                    )}
                  </ul>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}