/**
 * APR Tracker
 * Display current APR and network activity level
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Activity, TrendingUp, Zap } from 'lucide-react';

export default function APRTracker({ currentAPR = 0, networkActivityLevel = 'moderate' }) {
  const activityLevels = {
    low: { color: 'orange', icon: Activity, label: 'Low Activity', description: 'Lower reward distribution' },
    moderate: { color: 'cyan', icon: Zap, label: 'Moderate Activity', description: 'Stable rewards' },
    high: { color: 'green-400', icon: TrendingUp, label: 'High Activity', description: 'Boosted rewards' },
  };

  const activity = activityLevels[networkActivityLevel] || activityLevels.moderate;
  const ActivityIcon = activity.icon;

  // Simulate historical APR trend (last 30 days)
  const aprHistory = [
    { day: '7d ago', apr: currentAPR * 0.85 },
    { day: '6d ago', apr: currentAPR * 0.9 },
    { day: '5d ago', apr: currentAPR * 0.95 },
    { day: '4d ago', apr: currentAPR },
    { day: '3d ago', apr: currentAPR * 1.05 },
    { day: '2d ago', apr: currentAPR * 1.02 },
    { day: 'Today', apr: currentAPR },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Current APR Display */}
      <div className="bg-black/40 border border-purple-500/20 p-6 rounded-lg text-center">
        <p className="font-mono text-xs text-purple-400/60 uppercase tracking-[1px] mb-2">
          Estimated Annual Rate
        </p>
        <p className="font-orbitron font-black text-5xl text-purple-300 mb-2">
          {currentAPR.toFixed(2)}%
        </p>
        <p className="font-rajdhani text-sm text-purple-400/70">
          Based on current network activity
        </p>
      </div>

      {/* Activity Level */}
      <div className={`bg-${activity.color}/5 border border-${activity.color}/20 p-4 rounded-lg flex items-center gap-3`}>
        <ActivityIcon size={24} className={`text-${activity.color}`} />
        <div>
          <p className={`font-rajdhani font-bold text-${activity.color}`}>
            {activity.label}
          </p>
          <p className={`font-rajdhani text-xs text-${activity.color}/60`}>
            {activity.description}
          </p>
        </div>
      </div>

      {/* APR Trend */}
      <div>
        <p className="font-mono text-xs text-purple-400/60 uppercase tracking-[1px] mb-3">
          7-Day APR Trend
        </p>
        <div className="space-y-2">
          {aprHistory.map((point, idx) => {
            const percentOfMax = (point.apr / Math.max(...aprHistory.map(p => p.apr))) * 100;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center gap-3"
              >
                <span className="font-mono text-xs text-purple-400/60 w-12">
                  {point.day}
                </span>
                <div className="flex-1 bg-purple-500/10 rounded overflow-hidden h-6">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentOfMax}%` }}
                    transition={{ duration: 0.6, delay: idx * 0.05 }}
                    className="h-full bg-gradient-to-r from-purple-500 to-purple-400"
                  />
                </div>
                <span className="font-orbitron font-bold text-purple-300 w-16 text-right">
                  {point.apr.toFixed(2)}%
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Info */}
      <div className="bg-purple-500/5 border border-purple-500/10 p-3 rounded text-center">
        <p className="font-rajdhani text-xs text-purple-400/70">
          APR fluctuates based on platform staking volume and reward distribution. Higher activity = Higher rewards.
        </p>
      </div>
    </motion.div>
  );
}