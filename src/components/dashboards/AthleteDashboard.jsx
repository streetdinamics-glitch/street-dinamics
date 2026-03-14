/**
 * Athlete Dashboard
 * Sponsorship earnings, performance, and growth metrics
 */

import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, Target, Users, Zap } from 'lucide-react';
import EarningsChart from './charts/EarningsChart';
import CampaignPerformanceChart from './charts/CampaignPerformanceChart';
import ReachTrendChart from './charts/ReachTrendChart';
import DashboardMetricCard from './DashboardMetricCard';

export default function AthleteDashboard() {
  const [timeRange, setTimeRange] = useState('6m');

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: deals = [] } = useQuery({
    queryKey: ['athlete-deals', user?.email],
    queryFn: () =>
      user?.email
        ? base44.entities.SponsorshipDeal.filter({
            athlete_email: user.email,
            status: 'accepted',
          })
        : Promise.resolve([]),
    enabled: !!user?.email,
    initialData: [],
  });

  const { data: escrows = [] } = useQuery({
    queryKey: ['athlete-escrows', user?.email],
    queryFn: () =>
      user?.email
        ? base44.entities.EscrowAccount.filter({ athlete_email: user.email })
        : Promise.resolve([]),
    enabled: !!user?.email,
    initialData: [],
  });

  const { data: distributions = [] } = useQuery({
    queryKey: ['athlete-distributions', user?.email],
    queryFn: () =>
      user?.email
        ? base44.entities.RoyaltyDistribution.filter({ athlete_email: user.email })
        : Promise.resolve([]),
    enabled: !!user?.email,
    initialData: [],
  });

  // Calculate metrics
  const totalEarnings = escrows.reduce((sum, e) => sum + e.released_amount, 0);
  const totalBudget = deals.reduce((sum, d) => sum + d.budget, 0);
  const activeCampaigns = deals.filter((d) => new Date(d.end_date) > new Date()).length;
  const totalReach = distributions.reduce((sum, d) => sum + (d.token_holders_pool || 0), 0);
  const avgValue =
    deals.length > 0 ? Math.round(totalBudget / deals.length) : 0;

  const earnings30d = distributions
    .filter(
      (d) =>
        new Date(d.distribution_date) >
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    )
    .reduce((sum, d) => sum + d.athlete_share, 0);

  const growthRate =
    earnings30d > 0 && totalEarnings > 0
      ? Math.round(((earnings30d / totalEarnings) * 100 * 12) / 30) // Annualized
      : 0;

  return (
    <div className="min-h-screen bg-cyber-void text-foreground p-6">
      <div className="cyber-grid" />
      <div className="cyber-scanlines" />
      <div className="cyber-vignette" />

      <div className="relative z-10 max-w-[1600px] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="heading-fire text-[clamp(40px,7vw,80px)] leading-none font-black mb-2">
            EARNINGS DASHBOARD
          </h1>
          <p className="font-mono text-[10px] tracking-[7px] uppercase text-fire-3/60">
            // ATHLETE PERFORMANCE //
          </p>
        </motion.div>

        {/* Time Range Selector */}
        <div className="flex gap-2 mb-8">
          {['1m', '3m', '6m', '1y', 'all'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded font-orbitron text-xs font-bold tracking-[1px] uppercase border transition-all ${
                timeRange === range
                  ? 'border-fire-3 bg-fire-3/20 text-fire-5'
                  : 'border-fire-3/20 bg-fire-3/5 text-fire-3/60 hover:border-fire-3/40'
              }`}
            >
              {range.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Metrics Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8"
        >
          <DashboardMetricCard
            icon={DollarSign}
            label="Total Earnings"
            value={`€${totalEarnings.toFixed(2)}`}
            color="fire"
            delay={0}
          />

          <DashboardMetricCard
            icon={TrendingUp}
            label="30d Growth"
            value={`${growthRate}%`}
            color="green"
            delay={0.05}
          />

          <DashboardMetricCard
            icon={Zap}
            label="Active Campaigns"
            value={activeCampaigns}
            color="cyan"
            delay={0.1}
          />

          <DashboardMetricCard
            icon={Target}
            label="Total Budget"
            value={`€${totalBudget}`}
            color="purple"
            delay={0.15}
          />

          <DashboardMetricCard
            icon={Users}
            label="Avg Deal Value"
            value={`€${avgValue}`}
            color="orange"
            delay={0.2}
          />
        </motion.div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <EarningsChart deals={deals} distributions={distributions} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <CampaignPerformanceChart deals={deals} />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <ReachTrendChart distributions={distributions} />
        </motion.div>
      </div>
    </div>
  );
}