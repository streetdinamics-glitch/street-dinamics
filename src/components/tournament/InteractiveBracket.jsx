import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Clock, CheckCircle, Zap, Edit2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import MatchUpdateForm from './MatchUpdateForm';

export default function InteractiveBracket({ tournament, matches: initialMatches, onMatchUpdate }) {
  const [matches, setMatches] = useState(initialMatches || []);
  const [editingMatch, setEditingMatch] = useState(null);
  const [realtimeSubscription, setRealtimeSubscription] = useState(null);

  // Real-time subscription to match updates
  useEffect(() => {
    if (!tournament?.id) return;

    const unsubscribe = base44.entities.TournamentMatch.subscribe((event) => {
      if (event.data?.tournament_id === tournament.id) {
        if (event.type === 'create' || event.type === 'update') {
          setMatches(prev => {
            const exists = prev.find(m => m.id === event.data.id);
            if (exists) {
              return prev.map(m => m.id === event.data.id ? event.data : m);
            }
            return [...prev, event.data];
          });
        } else if (event.type === 'delete') {
          setMatches(prev => prev.filter(m => m.id !== event.id));
        }
      }
    });

    setRealtimeSubscription(() => unsubscribe);
    return () => unsubscribe?.();
  }, [tournament?.id]);

  if (!tournament || !matches || matches.length === 0) {
    return (
      <div className="text-center py-12 bg-fire-3/5 border border-fire-3/10">
        <Trophy className="w-12 h-12 text-fire-3/30 mx-auto mb-3" />
        <p className="font-mono text-sm text-fire-3/30 tracking-[2px]">NO TOURNAMENT BRACKET</p>
      </div>
    );
  }

  // Group matches by round
  const rounds = {};
  matches.forEach(match => {
    if (!rounds[match.round_number]) {
      rounds[match.round_number] = [];
    }
    rounds[match.round_number].push(match);
  });

  const roundNumbers = Object.keys(rounds).sort((a, b) => parseInt(a) - parseInt(b));
  const totalRounds = tournament.total_rounds || roundNumbers.length;

  const getRoundName = (roundNum) => {
    const roundInt = parseInt(roundNum);
    if (roundInt === totalRounds) return 'FINAL';
    if (roundInt === totalRounds - 1) return 'SEMI-FINAL';
    if (roundInt === totalRounds - 2) return 'QUARTER-FINAL';
    return `ROUND ${roundInt}`;
  };

  const handleMatchUpdate = (matchId, result) => {
    setEditingMatch(null);
    if (onMatchUpdate) {
      onMatchUpdate(matchId, result);
    }
  };

  // Calculate match progression and next round mapping
  const getNextRoundMatch = (currentMatch) => {
    if (currentMatch.status !== 'completed' || !currentMatch.winner_email) return null;
    
    const nextRound = currentMatch.round_number + 1;
    const nextRoundMatches = rounds[nextRound] || [];
    
    // Determine next match position
    const matchPosition = Math.floor((currentMatch.match_number - 1) / 2);
    return nextRoundMatches[matchPosition];
  };

  return (
    <div className="space-y-6">
      {/* Tournament Header */}
      <div className="flex items-center justify-between bg-gradient-to-r from-fire-3/10 to-fire-3/5 border border-fire-3/20 p-4">
        <div>
          <h3 className="font-orbitron font-bold text-2xl text-fire-5 tracking-[2px] mb-1">
            {tournament.format.replace('_', ' ').toUpperCase()} BRACKET
          </h3>
          <p className="font-mono text-xs text-fire-3/60">Round {tournament.current_round} of {totalRounds}</p>
        </div>
        <div className="text-right">
          <div className={`px-3 py-1 rounded border font-mono text-xs tracking-[1px] ${
            tournament.status === 'completed' ? 'border-green-500/40 bg-green-500/5 text-green-400' :
            tournament.status === 'in_progress' ? 'border-fire-3/40 bg-fire-3/5 text-fire-3' :
            'border-fire-3/20 bg-fire-3/5 text-fire-3/60'
          }`}>
            {tournament.status.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Bracket Visualization */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-8 min-w-max">
          {roundNumbers.map((roundNum, roundIndex) => (
            <div key={roundNum} className="flex-shrink-0" style={{ width: '320px' }}>
              {/* Round Header */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: roundIndex * 0.1 }}
                className="mb-4 sticky top-0 z-10 bg-gradient-to-b from-cyber-void to-transparent pt-2"
              >
                <h3 className="font-orbitron font-bold text-lg text-fire-5 tracking-[2px] mb-1">
                  {getRoundName(roundNum)}
                </h3>
                <div className="flex items-center gap-2">
                  {parseInt(roundNum) === tournament.current_round && (
                    <div className="flex items-center gap-1 text-fire-3">
                      <Zap size={12} />
                      <span className="font-mono text-[8px] tracking-[1px]">ACTIVE</span>
                    </div>
                  )}
                  <p className="font-mono text-[9px] text-fire-3/40 tracking-[1px]">
                    {rounds[roundNum].length} MATCHES
                  </p>
                </div>
              </motion.div>

              {/* Matches */}
              <div className="space-y-3">
                {rounds[roundNum]
                  .sort((a, b) => a.match_number - b.match_number)
                  .map((match, matchIndex) => {
                    const nextMatch = getNextRoundMatch(match);
                    const isCompleted = match.status === 'completed';
                    const isLive = match.status === 'in_progress';

                    return (
                      <motion.div
                        key={match.id}
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: roundIndex * 0.1 + matchIndex * 0.08 }}
                        whileHover={{ scale: 1.02 }}
                        className={`relative rounded-lg border transition-all cursor-pointer ${
                          isCompleted
                            ? 'border-green-500/40 bg-gradient-to-br from-green-500/10 to-green-500/5 shadow-lg shadow-green-500/20'
                            : isLive
                            ? 'border-fire-3/60 bg-gradient-to-br from-fire-3/20 to-fire-3/10 shadow-lg shadow-fire-3/30'
                            : 'border-fire-3/20 bg-gradient-to-br from-[rgba(10,4,18,0.97)] to-[rgba(4,2,8,0.99)]'
                        }`}
                        onClick={() => !isCompleted && setEditingMatch(match)}
                      >
                        {/* Match Header */}
                        <div className="absolute top-2 right-2 flex items-center gap-1">
                          <span className="font-mono text-[8px] text-fire-3/30 tracking-[1px]">M{match.match_number}</span>
                          {!isCompleted && (
                            <Edit2 className="w-3 h-3 text-fire-3/40 hover:text-fire-3" />
                          )}
                        </div>

                        {/* Match Content */}
                        <div className="p-4 pt-6">
                          {/* Participant 1 */}
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: roundIndex * 0.1 + matchIndex * 0.08 + 0.1 }}
                            className={`flex items-center justify-between mb-2 pb-3 border-b transition-all ${
                              match.winner_email === match.participant1_email
                                ? 'border-fire-5/40 bg-fire-5/10 px-2 py-2 rounded mb-3'
                                : 'border-fire-3/10'
                            }`}
                          >
                            <span
                              className={`font-rajdhani text-sm font-semibold truncate ${
                                match.winner_email === match.participant1_email
                                  ? 'text-fire-5'
                                  : 'text-fire-4/70'
                              }`}
                            >
                              {match.participant1_name || 'TBD'}
                            </span>
                            <AnimatePresence>
                              {match.winner_email === match.participant1_email && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  exit={{ scale: 0 }}
                                  transition={{ type: 'spring', stiffness: 200 }}
                                >
                                  <CheckCircle className="w-4 h-4 text-fire-5 flex-shrink-0" />
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>

                          {/* VS Divider with Score */}
                          <div className="text-center my-2">
                            {match.score ? (
                              <div className="font-mono text-lg font-bold text-fire-3 tracking-[2px]">
                                {match.score}
                              </div>
                            ) : (
                              <div className="font-mono text-[8px] text-fire-3/30 tracking-[2px]">VS</div>
                            )}
                          </div>

                          {/* Participant 2 */}
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: roundIndex * 0.1 + matchIndex * 0.08 + 0.15 }}
                            className={`flex items-center justify-between transition-all ${
                              match.winner_email === match.participant2_email
                                ? 'border border-fire-5/40 bg-fire-5/10 px-2 py-2 rounded'
                                : ''
                            }`}
                          >
                            <span
                              className={`font-rajdhani text-sm font-semibold truncate ${
                                match.winner_email === match.participant2_email
                                  ? 'text-fire-5'
                                  : 'text-fire-4/70'
                              }`}
                            >
                              {match.participant2_name || 'TBD'}
                            </span>
                            <AnimatePresence>
                              {match.winner_email === match.participant2_email && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  exit={{ scale: 0 }}
                                  transition={{ type: 'spring', stiffness: 200 }}
                                >
                                  <CheckCircle className="w-4 h-4 text-fire-5 flex-shrink-0" />
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>

                          {/* Status Badge */}
                          <div
                            className={`mt-3 text-center font-mono text-[9px] tracking-[1px] px-2 py-1 rounded font-bold ${
                              match.status === 'completed'
                                ? 'bg-green-500/10 text-green-400'
                                : match.status === 'in_progress'
                                ? 'bg-fire-3/10 text-fire-3 animate-pulse'
                                : 'bg-fire-3/5 text-fire-3/40'
                            }`}
                          >
                            {match.status === 'completed'
                              ? '✓ COMPLETE'
                              : match.status === 'in_progress'
                              ? '● LIVE'
                              : 'PENDING'}
                          </div>

                          {/* Next Round Arrow */}
                          {nextMatch && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: roundIndex * 0.1 + matchIndex * 0.08 + 0.2 }}
                              className="mt-2 text-center"
                            >
                              <div className="font-mono text-[7px] text-fire-3/30">→ ADVANCES</div>
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Match Update Modal */}
      <AnimatePresence>
        {editingMatch && (
          <MatchUpdateForm
            match={editingMatch}
            onSubmit={handleMatchUpdate}
            onCancel={() => setEditingMatch(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}