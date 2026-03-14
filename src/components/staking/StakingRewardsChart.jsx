/**
 * Staking Rewards Chart
 * Visualize staking rewards history over time
 */

import React from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function StakingRewardsChart({ rewards = [] }) {
  // Group rewards by week
  const rewardsByWeek = rewards.reduce((acc, reward) => {
    const date = new Date(reward.created_date);
    const weekKey = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay())
      .toISOString()
      .split('T')[0];

    if (!acc[weekKey]) {
      acc[weekKey] = { week: weekKey, rewards: 0, count: 0 };
    }
    acc[weekKey].rewards += reward.amount || 0;
    acc[weekKey].count += 1;

    return acc;
  }, {});

  const chartData = Object.values(rewardsByWeek)
    .sort((a, b) => a.week.localeCompare(b.week))
    .slice(-12) // Last 12 weeks
    .map((week) => ({
      ...week,
      displayDate: new Date(week.week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    }));

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-black/40 border border-cyan/10 rounded">
        <p className="font-rajdhani text-cyan/50">No staking rewards yet. Start staking to earn!</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full"
    >
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorRewards" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00ffee" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#00ffee" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,255,238,0.1)" />
          <XAxis
            dataKey="displayDate"
            stroke="#00ffee"
            style={{ fontSize: 11, fontFamily: 'monospace' }}
          />
          <YAxis stroke="#00ffee" style={{ fontSize: 11, fontFamily: 'monospace' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(4,2,8,0.95)',
              border: '1px solid rgba(0,255,238,0.3)',
              fontFamily: 'monospace',
              fontSize: 11,
            }}
            formatter={(value) => ['€' + value.toFixed(2), 'Rewards']}
          />
          <Area
            type="monotone"
            dataKey="rewards"
            stroke="#00ffee"
            fillOpacity={1}
            fill="url(#colorRewards)"
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-3 mt-6">
        <div className="bg-cyan/5 border border-cyan/10 p-3 rounded">
          <p className="font-mono text-xs text-cyan/60 mb-1">Avg Weekly</p>
          <p className="font-orbitron font-bold text-cyan">
            €{(chartData.reduce((sum, d) => sum + d.rewards, 0) / chartData.length).toFixed(2)}
          </p>
        </div>
        <div className="bg-cyan/5 border border-cyan/10 p-3 rounded">
          <p className="font-mono text-xs text-cyan/60 mb-1">Best Week</p>
          <p className="font-orbitron font-bold text-cyan">
            €{Math.max(...chartData.map(d => d.rewards)).toFixed(2)}
          </p>
        </div>
      </div>
    </motion.div>
  );
}