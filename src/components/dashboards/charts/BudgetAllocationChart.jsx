/**
 * Budget Allocation Chart
 * How brand spending is distributed
 */

import React from 'react';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

export default function BudgetAllocationChart({ campaigns }) {
  const allocData = campaigns.reduce((acc, c) => {
    const sport = c.sport || 'Other';
    const existing = acc.find((a) => a.name === sport);
    if (existing) {
      existing.value += c.budget;
    } else {
      acc.push({ name: sport, value: c.budget });
    }
    return acc;
  }, []);

  const colors = ['#00ffee', '#00ff88', '#ffcc00', '#ff9900', '#ff6600'];

  if (allocData.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-[rgba(10,4,18,0.98)] to-[rgba(4,2,8,1)] border border-cyan/20 rounded-lg p-6 text-center"
      >
        <h3 className="font-orbitron font-bold text-lg text-cyan mb-4">
          BUDGET ALLOCATION
        </h3>
        <p className="font-rajdhani text-cyan/40">No allocation data</p>
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
        BUDGET BY SPORT
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={allocData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value }) => `${name}: €${value}`}
            outerRadius={80}
            fill="#00ffee"
            dataKey="value"
          >
            {allocData.map((entry, idx) => (
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