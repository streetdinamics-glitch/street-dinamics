import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Lock, TrendingUp, Flame, Crown, Award } from 'lucide-react';
import { toast } from 'sonner';

export default function FanVotingModule({ event }) {
  const [activeTab, setActiveTab] = useState('matchups');
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: tokens = [] } = useQuery({
    queryKey: ['my-tokens'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.TokenOwnership.filter({ created_by: user.email });
    },
    enabled: !!user,
    initialData: [],
  });

  const hasToken = tokens.length > 0;

  const { data: matchups = [] } = useQuery({
    queryKey: ['event-matchups', event.id],
    queryFn: () => base44.entities.EventMatchup.filter({ event_id: event.id }),
    initialData: [],
  });

  const { data: myMatchupVotes = [] } = useQuery({
    queryKey: ['my-matchup-votes', event.id],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.MatchupVote.filter({
        event_id: event.id,
        voter_email: user.email,
      });
    },
    enabled: !!user,
    initialData: [],
  });

  const { data: performanceNominees = [] } = useQuery({
    queryKey: ['performance-nominees', event.id],
    queryFn: () => base44.entities.PerformanceNominee.filter({ event_id: event.id }),
    initialData: [],
  });

  const { data: myPerformanceVote } = useQuery({
    queryKey: ['my-performance-vote', event.id],
    queryFn: async () => {
      const user = await base44.auth.me();
      const votes = await base44.entities.PerformanceVote.filter({
        event_id: event.id,
        voter_email: user.email,
      });
      return votes[0] || null;
    },
    enabled: !!user,
  });

  const voteMatchupMutation = useMutation({
    mutationFn: async ({ matchupId, athleteEmail }) => {
      const user = await base44.auth.me();
      
      const existingVote = myMatchupVotes.find(v => v.matchup_id === matchupId);
      
      if (existingVote) {
        if (existingVote.voted_athlete === athleteEmail) {
          toast.error('You already voted for this athlete!');
          return null;
        }
        
        await base44.entities.MatchupVote.update(existingVote.id, {
          voted_athlete: athleteEmail,
          voted_at: new Date().toISOString(),
        });
      } else {
        await base44.entities.MatchupVote.create({
          event_id: event.id,
          matchup_id: matchupId,
          voter_email: user.email,
          voted_athlete: athleteEmail,
          voted_at: new Date().toISOString(),
        });
      }

      const matchup = matchups.find(m => m.id === matchupId);
      const voteField = athleteEmail === matchup.athlete1_email ? 'athlete1_votes' : 'athlete2_votes';
      
      await base44.entities.EventMatchup.update(matchupId, {
        [voteField]: (matchup[voteField] || 0) + 1,
      });

      return { matchupId, athleteEmail };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-matchups'] });
      queryClient.invalidateQueries({ queryKey: ['my-matchup-votes'] });
      toast.success('Vote recorded!');
    },
    onError: () => {
      toast.error('Failed to record vote. Please try again.');
    },
  });

  const votePerformanceMutation = useMutation({
    mutationFn: async (nomineeId) => {
      const user = await base44.auth.me();
      
      if (myPerformanceVote) {
        if (myPerformanceVote.nominee_id === nomineeId) {
          toast.error('You already voted for this athlete!');
          return null;
        }
        
        const oldNominee = performanceNominees.find(n => n.id === myPerformanceVote.nominee_id);
        if (oldNominee) {
          await base44.entities.PerformanceNominee.update(oldNominee.id, {
            vote_count: Math.max(0, (oldNominee.vote_count || 0) - 1),
          });
        }
        
        await base44.entities.PerformanceVote.update(myPerformanceVote.id, {
          nominee_id: nomineeId,
          voted_at: new Date().toISOString(),
        });
      } else {
        await base44.entities.PerformanceVote.create({
          event_id: event.id,
          nominee_id: nomineeId,
          voter_email: user.email,
          voted_at: new Date().toISOString(),
        });
      }

      const nominee = performanceNominees.find(n => n.id === nomineeId);
      await base44.entities.PerformanceNominee.update(nomineeId, {
        vote_count: (nominee.vote_count || 0) + 1,
      });

      return nomineeId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['performance-nominees'] });
      queryClient.invalidateQueries({ queryKey: ['my-performance-vote'] });
      toast.success('Vote recorded for Performance of the Night!');
    },
    onError: () => {
      toast.error('Failed to record vote. Please try again.');
    },
  });

  const handleMatchupVote = (matchupId, athleteEmail) => {
    if (!hasToken) {
      toast.error('Purchase an athlete token to unlock voting!');
      return;
    }
    voteMatchupMutation.mutate({ matchupId, athleteEmail });
  };

  const handlePerformanceVote = (nomineeId) => {
    if (!hasToken) {
      toast.error('Purchase an athlete token to unlock voting!');
      return;
    }
    votePerformanceMutation.mutate(nomineeId);
  };

  if (matchups.length === 0 && performanceNominees.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <div className="flex items-center gap-3 mb-4">
        <Star className="w-6 h-6 text-fire-5" />
        <h3 className="font-orbitron font-bold text-xl text-fire-gradient tracking-[2px] uppercase">
          FAN VOTING
        </h3>
        {!hasToken && (
          <div className="ml-auto flex items-center gap-2 px-3 py-1.5 bg-fire-3/10 border border-fire-3/30 rounded">
            <Lock size={14} className="text-fire-3" />
            <span className="font-mono text-xs text-fire-3/60 tracking-[1px]">TOKEN HOLDERS ONLY</span>
          </div>
        )}
      </div>

      <div className="bg-gradient-to-br from-[rgba(10,4,18,0.97)] to-[rgba(4,2,8,0.99)] border border-fire-3/20 clip-cyber p-6">
        <div className="flex gap-2 mb-6 border-b border-fire-3/20 pb-4">
          {matchups.length > 0 && (
            <button
              onClick={() => setActiveTab('matchups')}
              className={`font-orbitron text-xs font-bold tracking-[2px] uppercase px-4 py-2 transition-all ${
                activeTab === 'matchups'
                  ? 'bg-fire-3/20 border border-fire-3/40 text-fire-5'
                  : 'bg-transparent border border-fire-3/10 text-fire-3/40 hover:border-fire-3/20 hover:text-fire-3'
              }`}
            >
              <Trophy size={14} className="inline mr-2" />
              MATCHUPS
            </button>
          )}
          {performanceNominees.length > 0 && event.status !== 'upcoming' && (
            <button
              onClick={() => setActiveTab('performance')}
              className={`font-orbitron text-xs font-bold tracking-[2px] uppercase px-4 py-2 transition-all ${
                activeTab === 'performance'
                  ? 'bg-fire-3/20 border border-fire-3/40 text-fire-5'
                  : 'bg-transparent border border-fire-3/10 text-fire-3/40 hover:border-fire-3/20 hover:text-fire-3'
              }`}
            >
              <Award size={14} className="inline mr-2" />
              PERFORMANCE OF THE NIGHT
            </button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'matchups' && (
            <motion.div
              key="matchups"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              {matchups.length === 0 ? (
                <div className="text-center py-12">
                  <Trophy size={48} className="text-fire-3/30 mx-auto mb-4" />
                  <p className="font-mono text-sm text-fire-3/40 tracking-[2px]">NO MATCHUPS AVAILABLE</p>
                </div>
              ) : (
                matchups.map((matchup) => {
                  const totalVotes = (matchup.athlete1_votes || 0) + (matchup.athlete2_votes || 0);
                  const athlete1Percentage = totalVotes > 0 ? ((matchup.athlete1_votes || 0) / totalVotes) * 100 : 50;
                  const athlete2Percentage = totalVotes > 0 ? ((matchup.athlete2_votes || 0) / totalVotes) * 100 : 50;
                  const myVote = myMatchupVotes.find(v => v.matchup_id === matchup.id);
                  const hasVoted = !!myVote;

                  return (
                    <motion.div
                      key={matchup.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-fire-3/5 border border-fire-3/20 p-5 relative overflow-hidden"
                    >
                      {matchup.matchup_title && (
                        <div className="text-center mb-4">
                          <h4 className="font-orbitron font-bold text-sm text-fire-4 tracking-[2px] uppercase">
                            {matchup.matchup_title}
                          </h4>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <motion.button
                          onClick={() => handleMatchupVote(matchup.id, matchup.athlete1_email)}
                          disabled={!hasToken || voteMatchupMutation.isPending}
                          whileHover={hasToken && !voteMatchupMutation.isPending ? { scale: 1.02 } : {}}
                          whileTap={hasToken && !voteMatchupMutation.isPending ? { scale: 0.98 } : {}}
                          className={`relative p-4 border transition-all ${
                            hasVoted && myVote.voted_athlete === matchup.athlete1_email
                              ? 'border-cyan bg-cyan/20'
                              : 'border-fire-3/30 bg-fire-3/5 hover:border-fire-3/50 hover:bg-fire-3/10'
                          } ${!hasToken ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          {hasVoted && myVote.voted_athlete === matchup.athlete1_email && (
                            <div className="absolute top-2 right-2">
                              <Crown size={20} className="text-cyan" />
                            </div>
                          )}
                          <div className="text-center mb-3">
                            <div className="font-orbitron font-black text-lg text-fire-5 mb-1">
                              {matchup.athlete1_name}
                            </div>
                            {matchup.athlete1_discipline && (
                              <div className="font-mono text-xs text-fire-3/60 tracking-[1px]">
                                {matchup.athlete1_discipline}
                              </div>
                            )}
                          </div>
                          
                          <div className="mb-2">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-mono text-xs text-fire-3/60">VOTES</span>
                              <span className="font-orbitron font-bold text-fire-5">
                                {matchup.athlete1_votes || 0}
                              </span>
                            </div>
                            <div className="h-2 bg-fire-3/10 rounded overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${athlete1Percentage}%` }}
                                transition={{ duration: 0.6, ease: 'easeOut' }}
                                className="h-full bg-gradient-to-r from-fire-3 to-fire-5"
                              />
                            </div>
                            <div className="text-center mt-1">
                              <span className="font-mono text-xs text-fire-4">
                                {athlete1Percentage.toFixed(1)}%
                              </span>
                            </div>
                          </div>

                          {!hasToken && (
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                              <Lock size={24} className="text-fire-3/40" />
                            </div>
                          )}
                        </motion.button>

                        <motion.button
                          onClick={() => handleMatchupVote(matchup.id, matchup.athlete2_email)}
                          disabled={!hasToken || voteMatchupMutation.isPending}
                          whileHover={hasToken && !voteMatchupMutation.isPending ? { scale: 1.02 } : {}}
                          whileTap={hasToken && !voteMatchupMutation.isPending ? { scale: 0.98 } : {}}
                          className={`relative p-4 border transition-all ${
                            hasVoted && myVote.voted_athlete === matchup.athlete2_email
                              ? 'border-cyan bg-cyan/20'
                              : 'border-fire-3/30 bg-fire-3/5 hover:border-fire-3/50 hover:bg-fire-3/10'
                          } ${!hasToken ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          {hasVoted && myVote.voted_athlete === matchup.athlete2_email && (
                            <div className="absolute top-2 right-2">
                              <Crown size={20} className="text-cyan" />
                            </div>
                          )}
                          <div className="text-center mb-3">
                            <div className="font-orbitron font-black text-lg text-fire-5 mb-1">
                              {matchup.athlete2_name}
                            </div>
                            {matchup.athlete2_discipline && (
                              <div className="font-mono text-xs text-fire-3/60 tracking-[1px]">
                                {matchup.athlete2_discipline}
                              </div>
                            )}
                          </div>
                          
                          <div className="mb-2">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-mono text-xs text-fire-3/60">VOTES</span>
                              <span className="font-orbitron font-bold text-fire-5">
                                {matchup.athlete2_votes || 0}
                              </span>
                            </div>
                            <div className="h-2 bg-fire-3/10 rounded overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${athlete2Percentage}%` }}
                                transition={{ duration: 0.6, ease: 'easeOut' }}
                                className="h-full bg-gradient-to-r from-fire-3 to-fire-5"
                              />
                            </div>
                            <div className="text-center mt-1">
                              <span className="font-mono text-xs text-fire-4">
                                {athlete2Percentage.toFixed(1)}%
                              </span>
                            </div>
                          </div>

                          {!hasToken && (
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                              <Lock size={24} className="text-fire-3/40" />
                            </div>
                          )}
                        </motion.button>
                      </div>

                      {totalVotes > 0 && (
                        <div className="mt-4 text-center">
                          <div className="flex items-center justify-center gap-2 font-mono text-xs text-fire-3/60">
                            <TrendingUp size={14} />
                            <span>{totalVotes} TOTAL VOTES</span>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })
              )}
            </motion.div>
          )}

          {activeTab === 'performance' && (
            <motion.div
              key="performance"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              {performanceNominees.length === 0 ? (
                <div className="text-center py-12">
                  <Award size={48} className="text-fire-3/30 mx-auto mb-4" />
                  <p className="font-mono text-sm text-fire-3/40 tracking-[2px]">NO NOMINEES YET</p>
                </div>
              ) : (
                <>
                  <div className="text-center mb-6">
                    <p className="font-rajdhani text-base text-fire-4/70">
                      Vote for the most impressive performance of the event
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {performanceNominees
                      .sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0))
                      .map((nominee, index) => {
                        const hasVoted = myPerformanceVote?.nominee_id === nominee.id;
                        const isLeader = index === 0 && (nominee.vote_count || 0) > 0;

                        return (
                          <motion.button
                            key={nominee.id}
                            onClick={() => handlePerformanceVote(nominee.id)}
                            disabled={!hasToken || votePerformanceMutation.isPending}
                            whileHover={hasToken && !votePerformanceMutation.isPending ? { scale: 1.03 } : {}}
                            whileTap={hasToken && !votePerformanceMutation.isPending ? { scale: 0.97 } : {}}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`relative p-5 border transition-all ${
                              hasVoted
                                ? 'border-cyan bg-cyan/20'
                                : isLeader
                                ? 'border-fire-5/50 bg-fire-5/10'
                                : 'border-fire-3/30 bg-fire-3/5 hover:border-fire-3/50 hover:bg-fire-3/10'
                            } ${!hasToken ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                          >
                            {isLeader && !hasVoted && (
                              <div className="absolute top-2 right-2">
                                <Flame size={20} className="text-fire-5" />
                              </div>
                            )}
                            
                            {hasVoted && (
                              <div className="absolute top-2 right-2">
                                <Crown size={20} className="text-cyan" />
                              </div>
                            )}

                            <div className="text-center mb-3">
                              <div className="font-orbitron font-black text-lg text-fire-5 mb-1">
                                {nominee.athlete_name}
                              </div>
                              <div className="font-mono text-xs text-fire-3/60 tracking-[1px]">
                                {nominee.discipline}
                              </div>
                            </div>

                            {nominee.performance_description && (
                              <p className="text-sm text-fire-4/60 font-rajdhani mb-3 line-clamp-2">
                                {nominee.performance_description}
                              </p>
                            )}

                            <div className="flex items-center justify-center gap-2 mb-2">
                              <Star className="w-5 h-5 text-fire-5" />
                              <span className="font-orbitron font-black text-2xl text-fire-5">
                                {nominee.vote_count || 0}
                              </span>
                            </div>
                            
                            <div className="font-mono text-xs text-fire-3/60 tracking-[1px] uppercase text-center">
                              {(nominee.vote_count || 0) === 1 ? 'VOTE' : 'VOTES'}
                            </div>

                            {!hasToken && (
                              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                                <Lock size={24} className="text-fire-3/40" />
                              </div>
                            )}
                          </motion.button>
                        );
                      })}
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {!hasToken && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 bg-fire-3/10 border border-fire-3/30 p-6 text-center"
          >
            <Lock size={32} className="text-fire-3 mx-auto mb-3" />
            <h4 className="font-orbitron font-bold text-fire-5 mb-2">UNLOCK VOTING</h4>
            <p className="font-rajdhani text-sm text-fire-4/70 mb-4">
              Purchase an athlete token to participate in fan voting and support your favorite athletes
            </p>
            <button
              onClick={() => {
                const marketplaceSection = document.getElementById('marketplace');
                marketplaceSection?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="btn-fire text-xs"
            >
              GET TOKENS
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}