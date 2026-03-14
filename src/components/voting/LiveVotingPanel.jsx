import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Lock, BarChart3 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTranslation } from '../translations';

export default function LiveVotingPanel({ event, lang }) {
  const t = useTranslation(lang);
  const queryClient = useQueryClient();
  const [selectedChoice, setSelectedChoice] = useState(null);

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

  const { data: votes = [] } = useQuery({
    queryKey: ['live-votes', event.id],
    queryFn: () => base44.entities.EventVote.filter({ event_id: event.id, status: 'live' }),
    initialData: [],
    refetchInterval: 3000, // Real-time updates
  });

  const { data: myVotes = [] } = useQuery({
    queryKey: ['my-votes', user?.email],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.UserVote.filter({ user_email: user.email });
    },
    enabled: !!user,
    initialData: [],
  });

  const castVote = useMutation({
    mutationFn: async ({ voteId, choiceIndex }) => {
      const user = await base44.auth.me();
      
      // Record user vote
      await base44.entities.UserVote.create({
        vote_id: voteId,
        user_email: user.email,
        choice_index: choiceIndex,
        voted_at: new Date().toISOString()
      });

      // Update vote counts
      const vote = votes.find(v => v.id === voteId);
      const updatedChoices = vote.choices.map((choice, i) => 
        i === choiceIndex ? { ...choice, votes: (choice.votes || 0) + 1 } : choice
      );

      await base44.entities.EventVote.update(voteId, {
        choices: updatedChoices,
        total_votes: (vote.total_votes || 0) + 1
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['live-votes'] });
      queryClient.invalidateQueries({ queryKey: ['my-votes'] });
      toast.success('Vote recorded!');
      setSelectedChoice(null);
    },
  });

  const hasToken = tokens.length > 0;

  if (votes.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <div className="flex items-center gap-3 mb-4">
        <BarChart3 className="w-6 h-6 text-cyan" />
        <h3 className="font-orbitron font-bold text-xl text-cyan tracking-[2px] uppercase">
          LIVE FAN VOTING
        </h3>
      </div>

      <AnimatePresence>
        {votes.map((vote) => {
          const hasVoted = myVotes.some(v => v.vote_id === vote.id);
          
          return (
            <motion.div
              key={vote.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-gradient-to-br from-cyan/10 to-purple-500/5 border border-cyan/20 clip-cyber p-6 mb-4"
            >
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan to-transparent" />
              
              <h4 className="font-orbitron font-black text-xl text-cyan mb-1">
                {vote.question}
              </h4>
              <p className="font-mono text-[10px] text-cyan/40 tracking-[2px] uppercase mb-4">
                {vote.total_votes || 0} Total Votes
              </p>

              {!hasToken ? (
                <div className="text-center py-8 bg-black/40 border border-fire-3/10">
                  <Lock className="w-12 h-12 text-fire-3/30 mx-auto mb-3" />
                  <p className="font-mono text-sm text-fire-3/40 tracking-[1px]">
                    Token holders only
                  </p>
                </div>
              ) : hasVoted ? (
                <div>
                  <div className="flex items-center gap-2 mb-4 text-green-400 font-mono text-sm">
                    <CheckCircle size={16} />
                    You voted!
                  </div>
                  <div className="space-y-2">
                    {vote.choices?.map((choice, i) => {
                      const percentage = vote.total_votes > 0 
                        ? ((choice.votes || 0) / vote.total_votes * 100).toFixed(1)
                        : 0;
                      const myChoice = myVotes.find(v => v.vote_id === vote.id)?.choice_index === i;
                      
                      return (
                        <div 
                          key={i} 
                          className={`bg-black/60 p-4 border ${myChoice ? 'border-cyan/40 bg-cyan/5' : 'border-fire-3/10'}`}
                        >
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-rajdhani text-base text-fire-4/90">{choice.label}</span>
                            <span className="font-mono text-sm text-cyan">{percentage}%</span>
                          </div>
                          <div className="h-2 bg-fire-3/10 relative overflow-hidden">
                            <motion.div
                              className="h-full bg-gradient-to-r from-cyan to-cyan/50"
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ duration: 0.8 }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {vote.choices?.map((choice, i) => (
                    <motion.button
                      key={i}
                      onClick={() => castVote.mutate({ voteId: vote.id, choiceIndex: i })}
                      disabled={castVote.isPending}
                      className="w-full p-4 bg-gradient-to-r from-cyan/5 to-purple-500/5 border border-cyan/20 text-left font-rajdhani text-lg text-fire-4 hover:border-cyan/50 hover:bg-cyan/10 transition-all disabled:opacity-40"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {choice.label}
                    </motion.button>
                  ))}
                </div>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </motion.div>
  );
}