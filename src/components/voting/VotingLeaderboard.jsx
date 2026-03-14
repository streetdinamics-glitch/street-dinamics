import React, { useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Crown, Medal } from 'lucide-react';

export default function VotingLeaderboard({ eventId }) {
  // Fetch all votes for the event
  const { data: allVotes = [] } = useQuery({
    queryKey: ['event-votes', eventId],
    queryFn: () => base44.entities.UserVote.filter({ event_id: eventId }),
    refetchInterval: 5000,
  });

  // Calculate leaderboard
  const leaderboard = useMemo(() => {
    const voterStats = {};

    allVotes.forEach(vote => {
      if (!voterStats[vote.voter_email]) {
        voterStats[vote.voter_email] = {
          name: vote.voter_name,
          email: vote.voter_email,
          totalPower: 0,
          voteCount: 0,
        };
      }
      voterStats[vote.voter_email].totalPower += vote.vote_power;
      voterStats[vote.voter_email].voteCount += 1;
    });

    return Object.values(voterStats)
      .sort((a, b) => b.totalPower - a.totalPower)
      .slice(0, 10);
  }, [allVotes]);

  const medals = [
    { color: 'from-yellow-500 to-yellow-600', text: 'text-yellow-400', icon: Crown },
    { color: 'from-slate-400 to-slate-500', text: 'text-slate-400', icon: Medal },
    { color: 'from-orange-600 to-orange-700', text: 'text-orange-400', icon: Medal },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-[rgba(10,4,18,0.99)] to-[rgba(4,2,8,1)] border border-fire-3/20 p-8"
    >
      <h2 className="font-orbitron font-black text-2xl text-fire-5 mb-6">Voting Leaderboard</h2>

      {leaderboard.length === 0 ? (
        <div className="text-center py-12">
          <p className="font-mono text-sm text-fire-3/40">No votes yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {leaderboard.map((voter, i) => {
            const medal = i < 3 ? medals[i] : null;
            const MedalIcon = medal?.icon;

            return (
              <motion.div
                key={voter.email}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`flex items-center gap-4 p-4 border transition-all ${
                  medal
                    ? `bg-gradient-to-r ${medal.color}/10 border-${medal.color}/30`
                    : 'bg-fire-3/5 border-fire-3/10 hover:border-fire-3/20'
                }`}
              >
                {/* Rank */}
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-fire-3/20 border border-fire-3/30 flex items-center justify-center">
                  {medal ? (
                    <MedalIcon size={24} className={medal.text} />
                  ) : (
                    <span className="font-orbitron font-bold text-fire-5">#{i + 1}</span>
                  )}
                </div>

                {/* Voter Info */}
                <div className="flex-1">
                  <div className="font-orbitron font-bold text-fire-4">{voter.name}</div>
                  <p className="font-mono text-[9px] text-fire-3/60">{voter.email}</p>
                </div>

                {/* Stats */}
                <div className="flex gap-6 text-right">
                  <div>
                    <p className="font-mono text-[9px] text-fire-3/60 mb-1">Vote Power</p>
                    <p className="font-orbitron text-lg text-fire-5">{voter.totalPower}</p>
                  </div>
                  <div>
                    <p className="font-mono text-[9px] text-fire-3/60 mb-1">Votes</p>
                    <p className="font-orbitron text-lg text-cyan">{voter.voteCount}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Stats Summary */}
      <div className="mt-6 grid grid-cols-3 gap-4 pt-6 border-t border-fire-3/10">
        <div className="text-center">
          <p className="font-mono text-[9px] text-fire-3/60 mb-1">Total Votes</p>
          <p className="font-orbitron text-2xl text-fire-5">{allVotes.length}</p>
        </div>
        <div className="text-center">
          <p className="font-mono text-[9px] text-fire-3/60 mb-1">Total Power</p>
          <p className="font-orbitron text-2xl text-fire-5">
            {allVotes.reduce((sum, v) => sum + v.vote_power, 0)}
          </p>
        </div>
        <div className="text-center">
          <p className="font-mono text-[9px] text-fire-3/60 mb-1">Voters</p>
          <p className="font-orbitron text-2xl text-fire-5">
            {new Set(allVotes.map(v => v.voter_email)).size}
          </p>
        </div>
      </div>
    </motion.div>
  );
}