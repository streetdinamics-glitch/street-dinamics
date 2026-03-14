/**
 * Athlete Coverage Chart
 * Athlete distribution and coverage
 */

import React from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { motion } from 'framer-motion';

export default function AthleteCoverageChart({ campaigns }) {
  const athleteData = campaigns.map((c) => ({
    name: c.athlete_name.split(' ')[0],
    budget: c.budget,
    duration: c.duration_days,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-[rgba(10,4,18,0.98)] to-[rgba(4,2,8,1)] border border-orange-500/20 rounded-lg p-6"
    >
      <h3 className="font-orbitron font-bold text-lg text-orange-400 mb-4">
        ATHLETE PORTFOLIO
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,153,0,0.1)" />
          <XAxis
            type="number"
            dataKey="budget"
            stroke="#ff9900"
            name="Budget"
            style={{ fontSize: 12 }}
          />
          <YAxis
            type="number"
            dataKey="duration"
            stroke="#ff9900"
            name="Duration (days)"
            style={{ fontSize: 12 }}
          />
          <Tooltip
            cursor={{ strokeDasharray: '3 3' }}
            contentStyle={{
              backgroundColor: 'rgba(4,2,8,0.95)',
              border: '1px solid rgba(255,153,0,0.3)',
            }}
            formatter={(value, name) => {
              if (name === 'budget') return [`€${value}`, 'Budget'];
              return [`${value} days`, 'Duration'];
            }}
          />
          <Scatter name="Athletes" data={athleteData} fill="#ff9900" />
        </ScatterChart>
      </ResponsiveContainer>
    </motion.div>
  );
}