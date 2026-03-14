/**
 * Ranking Comparison Component
 * Shows athlete's position vs peers in different disciplines
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp, Users, Medal } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function RankingComparison({ athleteStats, allAthletes = [] }) {
  // Simulated ranking data by discipline
  const disciplineRankings = [
    { discipline: 'Skateboarding', rank: 3, total: 50, score: 87 },
    { discipline: 'BMX', rank: 5, total: 45, score: 82 },
    { discipline: 'Parkour', rank: 2, total: 38, score: 91 },
    { discipline: 'Freestyle', rank: 7, total: 42, score: 78 },
  ];

  // Top competitors in same discipline
  const topCompetitors = [
    { name: 'Alex Chen', score: 95, discipline: 'Skateboarding' },
    { name: 'Maria Santos', score: 89, discipline: 'Skateboarding' },
    { name: 'You', score: 87, discipline: 'Skateboarding', isCurrentAthlete: true },
    { name: 'Jordan Brown', score: 84, discipline: 'Skateboarding' },
    { name: 'Sam Taylor', score: 81, discipline: 'Skateboarding' },
  ];

  return (
    <div className="space-y-6">
      {/* Discipline Rankings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-[rgba(10,4,18,0.98)] to-[rgba(4,2,8,1)] border border-fire-3/20 p-6 rounded-lg"
      >
        <div className="flex items-center gap-3 mb-6">
          <Medal className="text-fire-3" size={20} />
          <h3 className="font-orbitron font-bold text-lg text-fire-5 tracking-[1px] uppercase">
            Rankings by Discipline
          </h3>
        </div>

        <div className="space-y-3">
          {disciplineRankings.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-black/40 border border-fire-3/10 p-4 rounded"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-rajdhani font-bold text-fire-4 mb-1">{item.discipline}</h4>
                  <p className="font-mono text-xs text-fire-3/60">
                    Rank #{item.rank} of {item.total} athletes
                  </p>
                </div>
                <div className="text-right">
                  <div className="font-orbitron font-black text-2xl text-fire-5">{item.score}</div>
                  <div className="font-mono text-xs text-fire-3/40">SCORE</div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-2 bg-fire-3/10 rounded overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(item.rank / item.total) * 100}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-fire-3 to-fire-5"
                />
              </div>

              {/* Percentile */}
              <div className="mt-2 font-mono text-xs text-fire-3/60">
                Top {((item.total - item.rank) / item.total * 100).toFixed(0)}% in {item.discipline}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Head-to-Head with Top Competitors */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-br from-[rgba(10,4,18,0.98)] to-[rgba(4,2,8,1)] border border-cyan/20 p-6 rounded-lg"
      >
        <div className="flex items-center gap-3 mb-6">
          <Users className="text-cyan" size={20} />
          <h3 className="font-orbitron font-bold text-lg text-cyan tracking-[1px] uppercase">
            Competitive Standings
          </h3>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={topCompetitors}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,255,238,0.1)" />
            <XAxis dataKey="name" stroke="#00ffee" style={{ fontSize: 10 }} />
            <YAxis stroke="#00ffee" style={{ fontSize: 10 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(4,2,8,0.95)',
                border: '1px solid rgba(0,255,238,0.3)',
                fontFamily: 'monospace',
                fontSize: 11,
              }}
            />
            <Bar
              dataKey="score"
              fill="#00ffee"
              radius={[4, 4, 0, 0]}
              shape={<CustomBar isCurrentAthlete={topCompetitors[2].isCurrentAthlete} />}
            />
          </BarChart>
        </ResponsiveContainer>

        <div className="mt-6 p-4 bg-cyan/5 border border-cyan/20 rounded">
          <p className="font-rajdhani text-sm text-cyan/80">
            <strong>Your Position:</strong> You're ranked <span className="text-cyan font-bold">#3</span> among 50 skateboarding athletes.
            <span className="block mt-2">
              Score gap to #1: <span className="text-orange-500">-8 points</span>. Keep grinding!
            </span>
          </p>
        </div>
      </motion.div>

      {/* Peer Comparison Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-2 md:grid-cols-3 gap-4"
      >
        {[
          { label: 'Rank vs Avg', value: '+8', icon: TrendingUp, color: 'green-400' },
          { label: 'Score vs Peers', value: '+6%', icon: Trophy, color: 'fire-4' },
          { label: 'Growth Rate', value: '+12%/mo', icon: TrendingUp, color: 'cyan' },
        ].map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 + idx * 0.1 }}
            className={`bg-${stat.color}/5 border border-${stat.color}/20 p-4 rounded text-center`}
          >
            <stat.icon className={`text-${stat.color} mx-auto mb-2`} size={20} />
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

// Custom bar component to highlight current athlete
const CustomBar = (props) => {
  const { fill, x, y, width, height, isCurrentAthlete } = props;
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={isCurrentAthlete ? '#ff6600' : fill}
        radius={[4, 4, 0, 0]}
        opacity={isCurrentAthlete ? 0.9 : 0.6}
      />
      {isCurrentAthlete && (
        <circle cx={x + width / 2} cy={y - 10} r={5} fill="#ff6600" opacity={0.5} />
      )}
    </g>
  );
};