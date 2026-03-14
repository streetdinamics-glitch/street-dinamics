import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Clock, CheckCircle } from 'lucide-react';

export default function TournamentBracket({ tournament, matches }) {
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
    const remaining = totalRounds - roundInt + 1;
    
    if (roundInt === totalRounds) return 'FINAL';
    if (roundInt === totalRounds - 1) return 'SEMI-FINAL';
    if (roundInt === totalRounds - 2) return 'QUARTER-FINAL';
    return `ROUND ${roundInt}`;
  };

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-8 min-w-max">
        {roundNumbers.map((roundNum, roundIndex) => (
          <div key={roundNum} className="flex-shrink-0" style={{ width: '280px' }}>
            <div className="mb-4">
              <h3 className="font-orbitron font-bold text-lg text-fire-5 tracking-[2px] mb-1">
                {getRoundName(roundNum)}
              </h3>
              <p className="font-mono text-[9px] text-fire-3/40 tracking-[1px]">
                {parseInt(roundNum) === tournament.current_round ? 'CURRENT' : ''}
              </p>
            </div>

            <div className="space-y-4">
              {rounds[roundNum].sort((a, b) => a.match_number - b.match_number).map((match, matchIndex) => (
                <motion.div
                  key={match.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: roundIndex * 0.1 + matchIndex * 0.05 }}
                  className={`bg-gradient-to-br from-[rgba(10,4,18,0.97)] to-[rgba(4,2,8,0.99)] border p-4 relative ${
                    match.status === 'completed' 
                      ? 'border-green-500/30' 
                      : match.status === 'in_progress'
                      ? 'border-fire-3/40'
                      : 'border-fire-3/20'
                  }`}
                >
                  {/* Match Number */}
                  <div className="absolute top-2 right-2 font-mono text-[8px] text-fire-3/30 tracking-[1px]">
                    M{match.match_number}
                  </div>

                  {/* Participant 1 */}
                  <div className={`flex items-center justify-between mb-2 pb-2 border-b ${
                    match.winner_email === match.participant1_email
                      ? 'border-fire-5/40 bg-fire-5/5'
                      : 'border-fire-3/10'
                  } px-2 py-1.5 rounded`}>
                    <span className={`font-rajdhani text-sm ${
                      match.winner_email === match.participant1_email
                        ? 'text-fire-5 font-bold'
                        : 'text-fire-4/70'
                    }`}>
                      {match.participant1_name || 'TBD'}
                    </span>
                    {match.winner_email === match.participant1_email && (
                      <CheckCircle className="w-4 h-4 text-fire-5" />
                    )}
                  </div>

                  {/* VS Divider */}
                  <div className="text-center font-mono text-[8px] text-fire-3/30 tracking-[2px] mb-2">
                    VS
                  </div>

                  {/* Participant 2 */}
                  <div className={`flex items-center justify-between ${
                    match.winner_email === match.participant2_email
                      ? 'border border-fire-5/40 bg-fire-5/5'
                      : ''
                  } px-2 py-1.5 rounded`}>
                    <span className={`font-rajdhani text-sm ${
                      match.winner_email === match.participant2_email
                        ? 'text-fire-5 font-bold'
                        : 'text-fire-4/70'
                    }`}>
                      {match.participant2_name || 'TBD'}
                    </span>
                    {match.winner_email === match.participant2_email && (
                      <CheckCircle className="w-4 h-4 text-fire-5" />
                    )}
                  </div>

                  {/* Score */}
                  {match.score && (
                    <div className="mt-2 text-center font-mono text-xs text-fire-4/60">
                      {match.score}
                    </div>
                  )}

                  {/* Status indicator */}
                  <div className={`mt-2 text-center font-mono text-[9px] tracking-[1px] ${
                    match.status === 'completed' ? 'text-green-400' :
                    match.status === 'in_progress' ? 'text-fire-3' :
                    'text-fire-3/40'
                  }`}>
                    {match.status === 'completed' ? '✓ COMPLETE' :
                     match.status === 'in_progress' ? '● LIVE' :
                     'PENDING'}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}