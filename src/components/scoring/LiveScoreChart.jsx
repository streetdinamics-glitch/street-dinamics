/**
 * Live Score Chart
 * Real-time visualization of athlete performance during tournament
 */

import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function LiveScoreChart({ event, selectedAthlete, round }) {
  const { data: scores = [] } = useQuery({
    queryKey: ['athlete-scores', selectedAthlete?.user_email, event.id],
    queryFn: () =>
      selectedAthlete?.user_email
        ? base44.entities.EventScore.filter({
            event_id: event.id,
            athlete_email: selectedAthlete.user_email,
          })
        : Promise.resolve([]),
    initialData: [],
    refetchInterval: 2000,
  });

  if (!selectedAthlete || scores.length === 0) {
    return (
      <div className="bg-fire-3/5 border border-fire-3/20 p-8 rounded-lg text-center">
        <p className="font-mono text-sm text-fire-3/40">
          Select an athlete to view their performance chart
        </p>
      </div>
    );
  }

  // Format data for line chart (progression)
  const progressionData = scores
    .filter((s) => s.round === round)
    .map((score, idx) => ({
      attempt: idx + 1,
      score: score.score,
      difficulty: score.performance_metrics?.difficulty || 0,
      execution: score.performance_metrics?.execution || 0,
      style: score.performance_metrics?.style || 0,
      consistency: score.performance_metrics?.consistency || 0,
    }));

  // Format data for metrics breakdown
  const metricsData = scores
    .filter((s) => s.round === round)
    .map((score, idx) => ({
      attempt: `Attempt ${idx + 1}`,
      difficulty: score.performance_metrics?.difficulty || 0,
      execution: score.performance_metrics?.execution || 0,
      style: score.performance_metrics?.style || 0,
      consistency: score.performance_metrics?.consistency || 0,
    }));

  return (
    <div className="space-y-6">
      {/* Performance Progression */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-[rgba(10,4,18,0.98)] to-[rgba(4,2,8,1)] border border-fire-3/20 p-6 rounded-lg"
      >
        <h3 className="font-orbitron font-bold text-lg text-fire-5 mb-4">
          Performance Progression (Round {round})
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={progressionData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,102,0,0.1)" />
            <XAxis dataKey="attempt" stroke="#ff6600" style={{ fontSize: 12 }} />
            <YAxis stroke="#ff6600" style={{ fontSize: 12 }} domain={[0, 10]} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(4,2,8,0.95)',
                border: '1px solid rgba(255,102,0,0.3)',
                fontFamily: 'monospace',
              }}
            />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#ff6600"
              strokeWidth={2}
              dot={{ r: 6, fill: '#ff6600' }}
              animationDuration={500}
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Metrics Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-[rgba(10,4,18,0.98)] to-[rgba(4,2,8,1)] border border-cyan/20 p-6 rounded-lg"
      >
        <h3 className="font-orbitron font-bold text-lg text-cyan mb-4">
          Performance Metrics Breakdown
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={metricsData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,255,238,0.1)" />
            <XAxis dataKey="attempt" stroke="#00ffee" style={{ fontSize: 12 }} />
            <YAxis stroke="#00ffee" style={{ fontSize: 12 }} domain={[0, 10]} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(4,2,8,0.95)',
                border: '1px solid rgba(0,255,238,0.3)',
                fontFamily: 'monospace',
              }}
            />
            <Legend />
            <Bar dataKey="difficulty" fill="#ff6600" radius={[4, 4, 0, 0]} />
            <Bar dataKey="execution" fill="#00ffee" radius={[4, 4, 0, 0]} />
            <Bar dataKey="style" fill="#9b00ff" radius={[4, 4, 0, 0]} />
            <Bar dataKey="consistency" fill="#00ff88" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Best Attempt */}
      {progressionData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-fire-3/20 to-fire-3/10 border border-fire-3/30 p-6 rounded-lg"
        >
          <p className="font-mono text-xs text-fire-3/60 uppercase tracking-[1px] mb-3">
            BEST ATTEMPT THIS ROUND
          </p>
          <div className="flex items-end gap-6">
            <div>
              <p className="font-orbitron font-black text-4xl text-fire-5 mb-2">
                {Math.max(...progressionData.map((d) => d.score)).toFixed(2)}
              </p>
              <p className="font-rajdhani text-sm text-fire-4/70">
                Average: {(progressionData.reduce((sum, d) => sum + d.score, 0) / progressionData.length).toFixed(2)}
              </p>
            </div>
            <div className="flex-1 h-24 bg-black/30 rounded p-3">
              <ResponsiveContainer width="100%" height={80}>
                <BarChart data={progressionData}>
                  <Bar dataKey="score" fill="#ff6600" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}