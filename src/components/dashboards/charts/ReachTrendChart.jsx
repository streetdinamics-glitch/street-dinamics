/**
 * Reach Trend Chart
 * Audience reach growth over time
 */

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { motion } from 'framer-motion';

export default function ReachTrendChart({ distributions }) {
  const reachData = distributions
    .sort((a, b) => new Date(a.distribution_date) - new Date(b.distribution_date))
    .slice(-12)
    .map((d) => ({
      date: new Date(d.distribution_date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      reach: d.token_holders_pool || 0,
      revenue: d.total_revenue || 0,
    }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-[rgba(10,4,18,0.98)] to-[rgba(4,2,8,1)] border border-purple-500/20 rounded-lg p-6"
    >
      <h3 className="font-orbitron font-bold text-lg text-purple-400 mb-4">
        REACH & REVENUE TREND
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={reachData || []}>
          <defs>
            <linearGradient id="colorReach" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#9b00ff" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#9b00ff" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(155,0,255,0.1)" />
          <XAxis dataKey="date" stroke="#9b00ff" style={{ fontSize: 12 }} />
          <YAxis stroke="#9b00ff" style={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(4,2,8,0.95)',
              border: '1px solid rgba(155,0,255,0.3)',
            }}
          />
          <Area
            type="monotone"
            dataKey="reach"
            stroke="#9b00ff"
            fillOpacity={1}
            fill="url(#colorReach)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}