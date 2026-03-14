/**
 * Campaign Performance Chart
 * Budget vs deals breakdown
 */

import React from 'react';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

export default function CampaignPerformanceChart({ deals }) {
  const data = deals.slice(0, 5).map((d) => ({
    name: d.campaign_title.substring(0, 15),
    value: d.budget,
  }));

  const colors = ['#ff6600', '#ff9900', '#ffcc00', '#ffe566', '#ff4400'];

  if (data.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-[rgba(10,4,18,0.98)] to-[rgba(4,2,8,1)] border border-fire-3/20 rounded-lg p-6 text-center"
      >
        <h3 className="font-orbitron font-bold text-lg text-fire-5 mb-4">
          CAMPAIGN BREAKDOWN
        </h3>
        <p className="font-rajdhani text-fire-3/40">No active campaigns</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-[rgba(10,4,18,0.98)] to-[rgba(4,2,8,1)] border border-cyan/20 rounded-lg p-6"
    >
      <h3 className="font-orbitron font-bold text-lg text-cyan mb-4">
        CAMPAIGN BREAKDOWN
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value }) => `${name}: €${value}`}
            outerRadius={80}
            fill="#00ffee"
            dataKey="value"
          >
            {data.map((entry, idx) => (
              <Cell key={`cell-${idx}`} fill={colors[idx % colors.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => `€${value}`}
            contentStyle={{
              backgroundColor: 'rgba(4,2,8,0.95)',
              border: '1px solid rgba(0,255,238,0.3)',
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </motion.div>
  );
}