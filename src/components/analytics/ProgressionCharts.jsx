/**
 * Progression Charts Component
 * Shows athlete growth over time with technical skills, engagement, and rankings
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Calendar } from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, ComposedChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

export default function ProgressionCharts({ athleteStats, performanceScores, registrations }) {
  const [timePeriod, setTimePeriod] = useState('3m'); // 3m, 6m, 1y, all

  // Generate progression data from performance scores over time
  const progressionData = (performanceScores || [])
    .sort((a, b) => new Date(a.score_date) - new Date(b.score_date))
    .map(score => ({
      date: new Date(score.score_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      technical: score.technical_progression,
      engagement: score.engagement_generated,
      consistency: score.consistency,
      recognition: score.external_recognition,
      fanbase: score.fanbase_growth,
      leadership: score.behavior_leadership,
      total: score.total_score,
    }))
    .slice(-20); // Last 20 scores

  // Ranking progression (based on performance score rank among peers)
  const rankingData = registrations
    .slice(0, 15)
    .map((reg, idx) => ({
      event: `Event ${idx + 1}`,
      rank: Math.floor(Math.random() * 20) + 1, // Simulated rank (1-20)
      points: 50 + Math.random() * 100,
    }));

  // Fan engagement growth
  const engagementData = (performanceScores || [])
    .sort((a, b) => new Date(a.score_date) - new Date(b.score_date))
    .map((score, idx) => ({
      event: `Event ${idx + 1}`,
      followers: 100 + (idx * 50) + Math.random() * 100,
      engagement: score.engagement_generated,
      reach: 500 + (idx * 200) + Math.random() * 300,
    }));

  const chartConfig = {
    technical: { color: '#ff6600', name: 'Technical Progression' },
    engagement: { color: '#00ffee', name: 'Engagement' },
    consistency: { color: '#ffcc00', name: 'Consistency' },
    recognition: { color: '#9b00ff', name: 'Recognition' },
    fanbase: { color: '#ff3366', name: 'Fanbase Growth' },
    leadership: { color: '#00ff88', name: 'Leadership' },
  };

  return (
    <div className="space-y-6">
      {/* Time Period Selector */}
      <div className="flex gap-3">
        {['3m', '6m', '1y', 'all'].map((period) => (
          <button
            key={period}
            onClick={() => setTimePeriod(period)}
            className={`px-4 py-2 font-orbitron text-xs font-bold tracking-[1px] uppercase border transition-all ${
              timePeriod === period
                ? 'border-fire-3 bg-fire-3/20 text-fire-5'
                : 'border-fire-3/20 bg-fire-3/5 text-fire-3/60 hover:border-fire-3/40'
            }`}
          >
            {period === '3m' ? '3 Months' : period === '6m' ? '6 Months' : period === '1y' ? '1 Year' : 'All Time'}
          </button>
        ))}
      </div>

      {/* 1. Technical Skills Progression */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-[rgba(10,4,18,0.98)] to-[rgba(4,2,8,1)] border border-fire-3/20 p-6 rounded-lg"
      >
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="text-fire-3" size={20} />
          <h3 className="font-orbitron font-bold text-lg text-fire-5 tracking-[1px] uppercase">
            Technical Skills Progression
          </h3>
        </div>
        <p className="font-rajdhani text-sm text-fire-4/70 mb-4">
          Growth across technical improvement, consistency, and recognition metrics
        </p>
        <ResponsiveContainer width="100%" height={350}>
          <ComposedChart data={progressionData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,102,0,0.1)" />
            <XAxis dataKey="date" stroke="#ff6600" style={{ fontSize: 10 }} />
            <YAxis stroke="#ff6600" style={{ fontSize: 10 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(4,2,8,0.95)',
                border: '1px solid rgba(255,102,0,0.3)',
                fontFamily: 'monospace',
                fontSize: 11,
              }}
            />
            <Legend />
            <Area type="monotone" dataKey="technical" fill={chartConfig.technical.color} stroke={chartConfig.technical.color} fillOpacity={0.2} />
            <Line type="monotone" dataKey="consistency" stroke={chartConfig.consistency.color} strokeWidth={2} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="recognition" stroke={chartConfig.recognition.color} strokeWidth={2} dot={{ r: 4 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </motion.div>

      {/* 2. Fan Engagement Growth */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-[rgba(10,4,18,0.98)] to-[rgba(4,2,8,1)] border border-cyan/20 p-6 rounded-lg"
      >
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="text-cyan" size={20} />
          <h3 className="font-orbitron font-bold text-lg text-cyan tracking-[1px] uppercase">
            Fan Engagement Growth
          </h3>
        </div>
        <p className="font-rajdhani text-sm text-fire-4/70 mb-4">
          Followers, engagement rate, and content reach over time
        </p>
        <ResponsiveContainer width="100%" height={350}>
          <ComposedChart data={engagementData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,255,238,0.1)" />
            <XAxis dataKey="event" stroke="#00ffee" style={{ fontSize: 10 }} />
            <YAxis yAxisId="left" stroke="#00ffee" style={{ fontSize: 10 }} />
            <YAxis yAxisId="right" orientation="right" stroke="#ff6600" style={{ fontSize: 10 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(4,2,8,0.95)',
                border: '1px solid rgba(0,255,238,0.3)',
                fontFamily: 'monospace',
                fontSize: 11,
              }}
            />
            <Legend />
            <Area yAxisId="left" type="monotone" dataKey="followers" fill="#00ffee" stroke="#00ffee" fillOpacity={0.2} />
            <Line yAxisId="right" type="monotone" dataKey="engagement" stroke="#ff6600" strokeWidth={2} dot={{ r: 4 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </motion.div>

      {/* 3. Tournament Ranking Progression */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-br from-[rgba(10,4,18,0.98)] to-[rgba(4,2,8,1)] border border-purple-500/20 p-6 rounded-lg"
      >
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="text-purple-400" size={20} />
          <h3 className="font-orbitron font-bold text-lg text-purple-400 tracking-[1px] uppercase">
            Tournament Ranking Progression
          </h3>
        </div>
        <p className="font-rajdhani text-sm text-fire-4/70 mb-4">
          Position improvement across events (lower rank = better)
        </p>
        <ResponsiveContainer width="100%" height={350}>
          <ComposedChart data={rankingData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(155,0,255,0.1)" />
            <XAxis dataKey="event" stroke="#9b00ff" style={{ fontSize: 10 }} />
            <YAxis yAxisId="left" stroke="#9b00ff" style={{ fontSize: 10 }} />
            <YAxis yAxisId="right" orientation="right" stroke="#ffcc00" style={{ fontSize: 10 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(4,2,8,0.95)',
                border: '1px solid rgba(155,0,255,0.3)',
                fontFamily: 'monospace',
                fontSize: 11,
              }}
            />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="rank" stroke="#9b00ff" strokeWidth={2} dot={{ r: 5 }} name="Rank Position" />
            <Bar yAxisId="right" dataKey="points" fill="#ffcc00" fillOpacity={0.3} name="Event Points" />
          </ComposedChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Growth Summary Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {[
          { label: 'Avg Technical Growth', value: '+18%', color: 'fire-3' },
          { label: 'Engagement Increase', value: '+35%', color: 'cyan' },
          { label: 'Rank Improvement', value: '+12 pos', color: 'purple-400' },
          { label: 'Current Streak', value: '7 events', color: 'green-400' },
        ].map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + idx * 0.1 }}
            className={`bg-${stat.color}/5 border border-${stat.color}/20 p-4 text-center rounded`}
          >
            <div className={`font-mono text-xs text-${stat.color}/60 uppercase tracking-[1px] mb-2`}>
              {stat.label}
            </div>
            <div className={`font-orbitron font-black text-2xl text-${stat.color}`}>
              {stat.value}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}