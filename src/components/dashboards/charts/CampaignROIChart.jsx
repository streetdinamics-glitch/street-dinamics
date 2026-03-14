/**
 * Campaign ROI Chart
 * Return on investment by campaign
 */

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { motion } from 'framer-motion';

export default function CampaignROIChart({ campaigns }) {
  const roiData = campaigns.slice(0, 8).map((c) => ({
    name: c.campaign_title.substring(0, 12),
    budget: c.budget,
    roi: Math.round(Math.random() * 150 + 50), // Simulated ROI %
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-[rgba(10,4,18,0.98)] to-[rgba(4,2,8,1)] border border-green-500/20 rounded-lg p-6"
    >
      <h3 className="font-orbitron font-bold text-lg text-green-400 mb-4">
        CAMPAIGN ROI ANALYSIS
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={roiData || []}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,255,136,0.1)" />
          <XAxis dataKey="name" stroke="#00ff88" style={{ fontSize: 12 }} />
          <YAxis yAxisId="left" stroke="#00ff88" style={{ fontSize: 12 }} />
          <YAxis yAxisId="right" orientation="right" stroke="#ff6600" style={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(4,2,8,0.95)',
              border: '1px solid rgba(0,255,136,0.3)',
            }}
          />
          <Legend />
          <Bar yAxisId="left" dataKey="budget" fill="#00ff88" name="Budget (€)" />
          <Bar yAxisId="right" dataKey="roi" fill="#ff6600" name="ROI (%)" />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}