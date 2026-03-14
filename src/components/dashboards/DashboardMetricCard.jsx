/**
 * Dashboard Metric Card
 * Reusable metric card component
 */

import React from 'react';
import { motion } from 'framer-motion';

const colorMap = {
  fire: 'from-fire-3/20 to-fire-3/10 border-fire-3/30 text-fire-5',
  green: 'from-green-500/20 to-green-500/10 border-green-500/30 text-green-400',
  cyan: 'from-cyan/20 to-cyan/10 border-cyan/30 text-cyan',
  purple: 'from-purple-500/20 to-purple-500/10 border-purple-500/30 text-purple-400',
  orange: 'from-orange-500/20 to-orange-500/10 border-orange-500/30 text-orange-400',
  red: 'from-red-500/20 to-red-500/10 border-red-500/30 text-red-400',
};

export default function DashboardMetricCard({
  icon: Icon,
  label,
  value,
  color = 'fire',
  delay = 0,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`bg-gradient-to-br ${colorMap[color]} border p-4 rounded-lg backdrop-blur-sm`}
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-black/40">
          <Icon size={20} className="text-current" />
        </div>
        <div className="flex-1">
          <p className="font-mono text-xs text-current/60 uppercase tracking-[1px] mb-1">
            {label}
          </p>
          <p className="font-orbitron font-black text-2xl text-current">
            {value}
          </p>
        </div>
      </div>
    </motion.div>
  );
}