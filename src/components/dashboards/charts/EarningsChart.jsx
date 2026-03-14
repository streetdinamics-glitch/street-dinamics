/**
 * Earnings Chart
 * Monthly earnings progression
 */

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { motion } from 'framer-motion';

export default function EarningsChart({ deals, distributions }) {
  // Generate monthly earnings data
  const monthlyData = {};
  distributions.forEach((d) => {
    const date = new Date(d.distribution_date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    monthlyData[monthKey] = (monthlyData[monthKey] || 0) + d.athlete_share;
  });

  const chartData = Object.entries(monthlyData)
    .sort()
    .map(([month, earnings]) => ({
      month: new Date(month + '-01').toLocaleDateString('en-US', {
        month: 'short',
        year: '2-digit',
      }),
      earnings: Math.round(earnings),
    }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-[rgba(10,4,18,0.98)] to-[rgba(4,2,8,1)] border border-fire-3/20 rounded-lg p-6"
    >
      <h3 className="font-orbitron font-bold text-lg text-fire-5 mb-4">EARNINGS TIMELINE</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData || []}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,102,0,0.1)" />
          <XAxis dataKey="month" stroke="#ff6600" style={{ fontSize: 12 }} />
          <YAxis stroke="#ff6600" style={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(4,2,8,0.95)',
              border: '1px solid rgba(255,102,0,0.3)',
              borderRadius: '4px',
            }}
            formatter={(value) => `€${value}`}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="earnings"
            stroke="#ff6600"
            strokeWidth={2}
            dot={{ fill: '#ff6600', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
}