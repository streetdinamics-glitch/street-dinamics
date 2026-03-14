/**
 * Brand Dashboard
 * Campaign performance, ROI, and reach metrics
 */

import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, Users, Target, BarChart3 } from 'lucide-react';
import CampaignROIChart from './charts/CampaignROIChart';
import AthleteCoverageChart from './charts/AthleteCoverageChart';
import BudgetAllocationChart from './charts/BudgetAllocationChart';
import DashboardMetricCard from './DashboardMetricCard';

export default function BrandDashboard() {
  const [timeRange, setTimeRange] = useState('6m');

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: campaigns = [] } = useQuery({
    queryKey: ['brand-campaigns', user?.email],
    queryFn: () =>
      user?.email
        ? base44.entities.SponsorshipDeal.filter({
            brand_email: user.email,
            status: 'accepted',
          })
        : Promise.resolve([]),
    enabled: !!user?.email,
    initialData: [],
  });

  const { data: escrows = [] } = useQuery({
    queryKey: ['brand-escrows', user?.email],
    queryFn: () =>
      user?.email
        ? base44.entities.EscrowAccount.filter({ brand_email: user.email })
        : Promise.resolve([]),
    enabled: !!user?.email,
    initialData: [],
  });

  const { data: disputes = [] } = useQuery({
    queryKey: ['brand-disputes', user?.email],
    queryFn: () =>
      user?.email
        ? base44.entities.Dispute.filter({ brand_email: user.email })
        : Promise.resolve([]),
    enabled: !!user?.email,
    initialData: [],
  });

  // Calculate metrics
  const totalSpent = campaigns.reduce((sum, c) => sum + c.budget, 0);
  const activeCampaigns = campaigns.filter(
    (c) => new Date(c.end_date) > new Date()
  ).length;
  const completedCampaigns = campaigns.filter(
    (c) => new Date(c.end_date) < new Date()
  ).length;
  const totalAthletes = campaigns.length;
  const avgBudget = campaigns.length > 0 ? Math.round(totalSpent / campaigns.length) : 0;
  const disputeRate = campaigns.length > 0
    ? Math.round((disputes.length / campaigns.length) * 100)
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
            CAMPAIGN DASHBOARD
          </h1>
          <p className="font-mono text-[10px] tracking-[7px] uppercase text-fire-3/60">
            // BRAND PERFORMANCE //
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
            label="Total Invested"
            value={`€${totalSpent}`}
            color="fire"
            delay={0}
          />

          <DashboardMetricCard
            icon={TrendingUp}
            label="Active Campaigns"
            value={activeCampaigns}
            color="green"
            delay={0.05}
          />

          <DashboardMetricCard
            icon={Users}
            label="Athletes"
            value={totalAthletes}
            color="cyan"
            delay={0.1}
          />

          <DashboardMetricCard
            icon={Target}
            label="Completed"
            value={completedCampaigns}
            color="purple"
            delay={0.15}
          />

          <DashboardMetricCard
            icon={BarChart3}
            label="Dispute Rate"
            value={`${disputeRate}%`}
            color={disputeRate > 10 ? 'red' : 'orange'}
            delay={0.2}
          />
        </motion.div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <CampaignROIChart campaigns={campaigns} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <BudgetAllocationChart campaigns={campaigns} />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <AthleteCoverageChart campaigns={campaigns} />
        </motion.div>
      </div>
    </div>
  );
}