/**
 * Token Staking Dashboard
 * Visualize staking rewards, APR, and project earnings
 */

import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { TrendingUp, Zap, Calculator, DollarSign } from 'lucide-react';
import StakingRewardsChart from './StakingRewardsChart';
import APRTracker from './APRTracker';
import StakingCalculator from './StakingCalculator';

export default function TokenStakingDashboard({ athleteEmail }) {
  const [showCalculator, setShowCalculator] = useState(false);

  const { data: tokenOwnership = [] } = useQuery({
    queryKey: ['token-ownership', athleteEmail],
    queryFn: () => base44.entities.TokenOwnership.filter({ 
      holder_email: athleteEmail 
    }),
    initialData: [],
  });

  const { data: athleteTokens = [] } = useQuery({
    queryKey: ['athlete-tokens', athleteEmail],
    queryFn: () => base44.entities.AthleteToken.filter({
      athlete_email: athleteEmail
    }),
    initialData: [],
  });

  const { data: stakingRewards = [] } = useQuery({
    queryKey: ['staking-rewards', athleteEmail],
    queryFn: async () => {
      // Query TokenTransaction records where user is holder and transaction is staking reward
      const transactions = await base44.entities.TokenTransaction.filter({
        holder_email: athleteEmail
      });
      return transactions.filter(t => t.transaction_type === 'staking_reward');
    },
    initialData: [],
  });

  // Calculate total staked and current rewards
  const totalStaked = tokenOwnership.reduce((sum, t) => sum + t.quantity, 0);
  const totalRewardsEarned = stakingRewards.reduce((sum, r) => sum + (r.amount || 0), 0);
  
  // Calculate APR based on recent rewards (last 30 days)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const recentRewards = stakingRewards.filter(r => 
    new Date(r.created_date) > thirtyDaysAgo
  );
  const monthlyRewards = recentRewards.reduce((sum, r) => sum + (r.amount || 0), 0);
  const currentAPR = totalStaked > 0 ? ((monthlyRewards * 12 / totalStaked) * 100) : 0;

  // Average token price from owned tokens
  const avgTokenPrice = athleteTokens.length > 0
    ? athleteTokens.reduce((sum, t) => sum + (t.current_price || t.base_price || 0), 0) / athleteTokens.length
    : 0;

  const totalStakedValue = totalStaked * avgTokenPrice;

  return (
    <div className="space-y-8">
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[rgba(10,4,18,0.98)] to-[rgba(4,2,8,1)] border border-cyan/20 p-6 rounded-lg"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="font-mono text-xs text-cyan/60 uppercase tracking-[1px]">Total Staked</p>
            <Zap size={18} className="text-cyan" />
          </div>
          <p className="font-orbitron font-black text-3xl text-cyan mb-1">
            {totalStaked.toLocaleString()}
          </p>
          <p className="font-rajdhani text-xs text-cyan/50">
            ≈ €{totalStakedValue.toFixed(2)}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-[rgba(10,4,18,0.98)] to-[rgba(4,2,8,1)] border border-green-500/20 p-6 rounded-lg"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="font-mono text-xs text-green-400/60 uppercase tracking-[1px]">Total Rewards</p>
            <DollarSign size={18} className="text-green-400" />
          </div>
          <p className="font-orbitron font-black text-3xl text-green-400 mb-1">
            €{totalRewardsEarned.toFixed(2)}
          </p>
          <p className="font-rajdhani text-xs text-green-400/50">
            {stakingRewards.length} reward transactions
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-[rgba(10,4,18,0.98)] to-[rgba(4,2,8,1)] border border-fire-3/20 p-6 rounded-lg"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="font-mono text-xs text-fire-3/60 uppercase tracking-[1px]">Current APR</p>
            <TrendingUp size={18} className="text-fire-3" />
          </div>
          <p className="font-orbitron font-black text-3xl text-fire-5 mb-1">
            {currentAPR.toFixed(2)}%
          </p>
          <p className="font-rajdhani text-xs text-fire-3/50">
            Last 30 days annualized
          </p>
        </motion.div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Staking Rewards Chart */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gradient-to-br from-[rgba(10,4,18,0.98)] to-[rgba(4,2,8,1)] border border-cyan/20 p-6 rounded-lg"
        >
          <h3 className="font-orbitron font-bold text-lg text-cyan mb-4 flex items-center gap-2">
            <TrendingUp size={20} />
            Rewards History
          </h3>
          <StakingRewardsChart rewards={stakingRewards} />
        </motion.div>

        {/* APR Tracker */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gradient-to-br from-[rgba(10,4,18,0.98)] to-[rgba(4,2,8,1)] border border-purple-500/20 p-6 rounded-lg"
        >
          <h3 className="font-orbitron font-bold text-lg text-purple-400 mb-4 flex items-center gap-2">
            <Zap size={20} />
            Network Activity
          </h3>
          <APRTracker 
            currentAPR={currentAPR}
            networkActivityLevel="moderate"
          />
        </motion.div>
      </div>

      {/* Staking Calculator */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-[rgba(10,4,18,0.98)] to-[rgba(4,2,8,1)] border border-green-500/20 p-6 rounded-lg"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-orbitron font-bold text-lg text-green-400 flex items-center gap-2">
            <Calculator size={20} />
            Earnings Projector
          </h3>
          <button
            onClick={() => setShowCalculator(!showCalculator)}
            className="px-4 py-2 bg-green-500/10 border border-green-500/30 text-green-400 font-orbitron text-xs font-bold rounded hover:bg-green-500/20 transition-all"
          >
            {showCalculator ? 'HIDE' : 'SHOW'}
          </button>
        </div>

        {showCalculator && (
          <StakingCalculator 
            totalStaked={totalStaked}
            currentAPR={currentAPR}
            avgTokenPrice={avgTokenPrice}
          />
        )}
      </motion.div>

      {/* Info Box */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-cyan/5 border border-cyan/20 p-4 rounded-lg"
      >
        <p className="font-rajdhani text-sm text-cyan/70">
          💡 <strong>How Staking Works:</strong> Stake your athlete tokens to earn a share of platform rewards. APR varies based on total network staking activity and reward pool distribution. Unstake anytime with no lock-in period.
        </p>
      </motion.div>
    </div>
  );
}