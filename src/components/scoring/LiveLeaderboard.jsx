/**
 * Live Leaderboard
 * Real-time ranking updates during tournament
 */

import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { TrendingUp, Trophy } from 'lucide-react';

export default function LiveLeaderboard({ event, tournament }) {
  const [selectedRound, setSelectedRound] = useState(1);

  const { data: scores = [] } = useQuery({
    queryKey: ['event-scores', event.id, selectedRound],
    queryFn: () =>
      base44.entities.EventScore.filter({ event_id: event.id, round: selectedRound }),
    initialData: [],
    refetchInterval: 2000, // Real-time updates every 2 seconds
  });

  // Subscribe to score updates for real-time changes
  useEffect(() => {
    const unsubscribe = base44.entities.EventScore.subscribe((event) => {
      if (event.data?.event_id === event.id && event.data?.round === selectedRound) {
        // Scores updated, component will re-render via query
      }
    });

    return unsubscribe;
  }, [event.id, selectedRound]);

  // Group and rank scores
  const ranking = scores
    .reduce((acc, score) => {
      const existing = acc.find((s) => s.athlete_email === score.athlete_email);
      if (existing) {
        existing.scores.push(score);
        existing.bestScore = Math.max(existing.bestScore, score.score);
        existing.avgScore = (existing.bestScore + (existing.scores.length > 1 ? score.score : 0)) / existing.scores.length;
      } else {
        acc.push({
          athlete_email: score.athlete_email,
          athlete_name: score.athlete_name,
          bestScore: score.score,
          avgScore: score.score,
          scores: [score],
        });
      }
      return acc;
    }, [])
    .sort((a, b) => b.bestScore - a.bestScore);

  const rounds = tournament ? [1, 2, 3, 4, 5] : [1];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-orbitron font-bold text-2xl text-fire-5 flex items-center gap-2">
          <Trophy size={28} className="text-fire-5" />
          LIVE LEADERBOARD
        </h2>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 px-3 py-1 bg-green-500/10 border border-green-500/30 rounded text-xs font-mono">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            LIVE
          </span>
        </div>
      </div>

      {/* Round Selector */}
      {tournament && (
        <div className="flex gap-2">
          {rounds.map((round) => (
            <button
              key={round}
              onClick={() => setSelectedRound(round)}
              className={`px-4 py-2 rounded font-orbitron font-bold text-xs tracking-[1px] uppercase border transition-all ${
                selectedRound === round
                  ? 'border-fire-3 bg-fire-3/20 text-fire-5'
                  : 'border-fire-3/20 bg-fire-3/5 text-fire-3/60 hover:border-fire-3/40'
              }`}
            >
              Round {round}
            </button>
          ))}
        </div>
      )}

      {/* Leaderboard */}
      <div className="bg-gradient-to-br from-[rgba(10,4,18,0.98)] to-[rgba(4,2,8,1)] border border-fire-3/20 rounded-lg overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 bg-fire-3/10 p-4 border-b border-fire-3/20 font-orbitron font-bold text-xs text-fire-3/60 uppercase tracking-[1px]">
          <div className="col-span-1">RANK</div>
          <div className="col-span-5">ATHLETE</div>
          <div className="col-span-2 text-right">BEST</div>
          <div className="col-span-2 text-right">AVG</div>
          <div className="col-span-2 text-right">TRIES</div>
        </div>

        {/* Rankings */}
        <div className="divide-y divide-fire-3/10">
          {ranking.length === 0 ? (
            <div className="p-8 text-center">
              <TrendingUp className="text-fire-3/20 mx-auto mb-3" size={40} />
              <p className="font-mono text-sm text-fire-3/40">
                Scores will appear here as they're submitted
              </p>
            </div>
          ) : (
            ranking.map((athlete, idx) => (
              <motion.div
                key={athlete.athlete_email}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-fire-3/5 transition-all"
              >
                {/* Rank */}
                <div className="col-span-1">
                  <div className="flex items-center justify-center">
                    {idx === 0 && <span className="text-2xl">🥇</span>}
                    {idx === 1 && <span className="text-2xl">🥈</span>}
                    {idx === 2 && <span className="text-2xl">🥉</span>}
                    {idx > 2 && (
                      <span className="font-orbitron font-black text-lg text-fire-4">
                        #{idx + 1}
                      </span>
                    )}
                  </div>
                </div>

                {/* Athlete Name */}
                <div className="col-span-5">
                  <p className="font-rajdhani font-bold text-fire-4">
                    {athlete.athlete_name}
                  </p>
                </div>

                {/* Best Score */}
                <div className="col-span-2 text-right">
                  <p className="font-orbitron font-black text-xl text-fire-6">
                    {athlete.bestScore.toFixed(2)}
                  </p>
                </div>

                {/* Average Score */}
                <div className="col-span-2 text-right">
                  <p className="font-orbitron font-bold text-cyan">
                    {athlete.avgScore.toFixed(2)}
                  </p>
                </div>

                {/* Number of Tries */}
                <div className="col-span-2 text-right">
                  <p className="font-mono text-sm text-fire-3/60">
                    {athlete.scores.length}
                  </p>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Top Performer Card */}
      {ranking.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-fire-3/20 to-fire-3/10 border border-fire-3/30 p-6 rounded-lg"
        >
          <p className="font-mono text-xs text-fire-3/60 uppercase tracking-[1px] mb-3">
            🔥 LEADING
          </p>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-orbitron font-black text-2xl text-fire-5">
                {ranking[0].athlete_name}
              </p>
              <p className="font-mono text-xs text-fire-3/60 mt-1">
                {ranking[0].scores.length} attempt{ranking[0].scores.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="text-right">
              <p className="font-orbitron font-black text-4xl text-fire-6">
                {ranking[0].bestScore.toFixed(2)}
              </p>
              <p className="font-mono text-xs text-fire-3/60">POINTS</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}