/**
 * Live Scoring Panel
 * Organizers input live performance data during tournaments
 */

import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Send, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function LiveScoringPanel({ event, tournament }) {
  const [selectedAthlete, setSelectedAthlete] = useState(null);
  const [scoreData, setScoreData] = useState({
    difficulty: 0,
    execution: 0,
    style: 0,
    consistency: 0,
    notes: '',
    round: 1,
  });
  const [lastSubmitted, setLastSubmitted] = useState(null);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: participants = [] } = useQuery({
    queryKey: ['tournament-participants', tournament?.id],
    queryFn: () =>
      tournament?.id
        ? base44.entities.TournamentParticipant.filter({ tournament_id: tournament.id })
        : Promise.resolve([]),
    initialData: [],
  });

  const { data: currentScores = [] } = useQuery({
    queryKey: ['event-scores', event.id],
    queryFn: () => base44.entities.EventScore.filter({ event_id: event.id }),
    initialData: [],
    refetchInterval: 2000, // Refresh every 2 seconds
  });

  const submitScoreMutation = useMutation({
    mutationFn: async (data) => {
      const totalScore =
        (data.difficulty + data.execution + data.style + data.consistency) / 4;

      return await base44.entities.EventScore.create({
        event_id: event.id,
        tournament_id: tournament?.id,
        athlete_email: selectedAthlete.user_email,
        athlete_name: selectedAthlete.user_name,
        score: totalScore,
        performance_metrics: {
          difficulty: data.difficulty,
          execution: data.execution,
          style: data.style,
          consistency: data.consistency,
        },
        round: data.round,
        submitted_by: user?.email,
        notes: data.notes,
        submitted_at: new Date().toISOString(),
      });
    },
    onSuccess: (result) => {
      setLastSubmitted({
        athlete: selectedAthlete.user_name,
        score: result.score,
        timestamp: new Date(),
      });

      // Invalidate queries to trigger real-time updates
      queryClient.invalidateQueries({ queryKey: ['event-scores'] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard', event.id] });

      toast.success(`Score submitted for ${selectedAthlete.user_name}!`);

      // Reset form
      setScoreData({
        difficulty: 0,
        execution: 0,
        style: 0,
        consistency: 0,
        notes: '',
        round: scoreData.round,
      });
      setSelectedAthlete(null);
    },
    onError: () => {
      toast.error('Failed to submit score');
    },
  });

  const handleSubmitScore = async (e) => {
    e.preventDefault();
    if (!selectedAthlete) {
      toast.error('Select an athlete first');
      return;
    }
    submitScoreMutation.mutate(scoreData);
  };

  const avgScore = scoreData.difficulty + scoreData.execution + scoreData.style + scoreData.consistency;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-orbitron font-bold text-2xl text-fire-5">LIVE SCORING</h2>
        {lastSubmitted && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded text-green-400 font-rajdhani text-sm"
          >
            <CheckCircle size={16} />
            Last: {lastSubmitted.athlete} • {lastSubmitted.score.toFixed(1)} pts
          </motion.div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Athlete Selection */}
        <div className="lg:col-span-1">
          <h3 className="font-orbitron font-bold text-lg text-fire-4 mb-4">SELECT ATHLETE</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {participants.map((participant) => (
              <motion.button
                key={participant.id}
                onClick={() => setSelectedAthlete(participant)}
                whileHover={{ scale: 1.02 }}
                className={`w-full text-left p-3 rounded border-2 transition-all ${
                  selectedAthlete?.id === participant.id
                    ? 'border-fire-3 bg-fire-3/20'
                    : 'border-fire-3/20 bg-fire-3/5 hover:border-fire-3/40'
                }`}
              >
                <p className="font-rajdhani font-bold text-fire-4 text-sm">
                  {participant.user_name}
                </p>
                <p className="font-mono text-xs text-fire-3/60">
                  {participant.discipline}
                </p>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Scoring Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmitScore} className="space-y-6">
            {/* Selected Athlete Display */}
            {selectedAthlete && (
              <div className="bg-gradient-to-br from-fire-3/10 to-fire-3/5 border border-fire-3/20 p-4 rounded-lg">
                <p className="font-orbitron font-bold text-lg text-fire-5 mb-1">
                  {selectedAthlete.user_name}
                </p>
                <p className="font-rajdhani text-sm text-fire-4/70">
                  {selectedAthlete.discipline} • {selectedAthlete.experience_level}
                </p>
              </div>
            )}

            {/* Score Inputs */}
            <div className="space-y-4">
              <h4 className="font-orbitron font-bold text-fire-4 text-sm uppercase tracking-[1px]">
                Performance Metrics
              </h4>

              {[
                { label: 'Difficulty', key: 'difficulty', color: 'fire-4' },
                { label: 'Execution', key: 'execution', color: 'cyan' },
                { label: 'Style', key: 'style', color: 'purple-400' },
                { label: 'Consistency', key: 'consistency', color: 'green-400' },
              ].map((metric) => (
                <div key={metric.key}>
                  <div className="flex items-center justify-between mb-2">
                    <label className={`font-rajdhani font-bold text-${metric.color} text-sm`}>
                      {metric.label}
                    </label>
                    <span className={`font-orbitron font-black text-lg text-${metric.color}`}>
                      {scoreData[metric.key].toFixed(1)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.5"
                    value={scoreData[metric.key]}
                    onChange={(e) =>
                      setScoreData({
                        ...scoreData,
                        [metric.key]: parseFloat(e.target.value),
                      })
                    }
                    className="w-full h-2 bg-fire-3/20 rounded-lg appearance-none cursor-pointer accent-fire-3"
                  />
                </div>
              ))}
            </div>

            {/* Round Selector */}
            <div>
              <label className="block font-rajdhani font-bold text-fire-4 text-sm mb-2">
                Round
              </label>
              <select
                value={scoreData.round}
                onChange={(e) => setScoreData({ ...scoreData, round: parseInt(e.target.value) })}
                className="w-full bg-fire-3/5 border border-fire-3/20 px-3 py-2 text-fire-4 font-rajdhani rounded focus:outline-none focus:border-fire-3/40"
              >
                {[1, 2, 3, 4, 5].map((r) => (
                  <option key={r} value={r}>
                    Round {r}
                  </option>
                ))}
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="block font-rajdhani font-bold text-fire-4 text-sm mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={scoreData.notes}
                onChange={(e) => setScoreData({ ...scoreData, notes: e.target.value })}
                placeholder="Exceptional flip, minor balance issue..."
                rows={2}
                className="w-full bg-fire-3/5 border border-fire-3/20 px-3 py-2 text-fire-4 placeholder-fire-3/30 font-rajdhani rounded focus:outline-none focus:border-fire-3/40"
              />
            </div>

            {/* Average Score Display */}
            <div className="bg-gradient-to-r from-fire-3/10 to-cyan/10 border border-fire-3/20 p-4 rounded-lg">
              <p className="font-mono text-xs text-fire-3/60 uppercase tracking-[1px] mb-2">
                Average Score
              </p>
              <p className="font-orbitron font-black text-3xl text-fire-5">
                {(avgScore / 4).toFixed(2)}/10
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!selectedAthlete || submitScoreMutation.isPending}
              className="w-full bg-gradient-to-r from-fire-3 to-fire-4 text-black font-orbitron font-bold py-3 rounded hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Send size={18} />
              {submitScoreMutation.isPending ? 'SUBMITTING...' : 'SUBMIT SCORE'}
            </button>
          </form>
        </div>
      </div>

      {/* Recent Submissions */}
      {currentScores.length > 0 && (
        <div className="bg-gradient-to-br from-[rgba(10,4,18,0.98)] to-[rgba(4,2,8,1)] border border-fire-3/20 p-6 rounded-lg">
          <h3 className="font-orbitron font-bold text-lg text-fire-5 mb-4">
            Recent Scores (Round {scoreData.round})
          </h3>
          <div className="space-y-2">
            {currentScores
              .filter((s) => s.round === scoreData.round)
              .sort((a, b) => b.score - a.score)
              .slice(0, 5)
              .map((score, idx) => (
                <motion.div
                  key={score.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center justify-between bg-black/30 p-3 rounded"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <span className="font-orbitron font-black text-fire-5 text-lg w-8">
                      #{idx + 1}
                    </span>
                    <div>
                      <p className="font-rajdhani font-bold text-fire-4">{score.athlete_name}</p>
                      <p className="font-mono text-xs text-fire-3/60">
                        {new Date(score.submitted_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-orbitron font-black text-2xl text-fire-6">
                      {score.score.toFixed(2)}
                    </p>
                  </div>
                </motion.div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}