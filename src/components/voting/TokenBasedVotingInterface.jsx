import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Lock } from 'lucide-react';
import { toast } from 'sonner';

export default function TokenBasedVotingInterface({ campaign, eventId }) {
  const queryClient = useQueryClient();
  const [selectedOption, setSelectedOption] = useState(null);
  const [votePower, setVotePower] = useState(1);

  // Get current user
  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  // Fetch user's token holdings
  const { data: userTokens = [] } = useQuery({
    queryKey: ['user-tokens', user?.email],
    queryFn: () => base44.entities.TokenOwnership.filter({ buyer_email: user?.email }),
    enabled: !!user?.email,
  });

  // Fetch all votes for this campaign
  const { data: votes = [] } = useQuery({
    queryKey: ['campaign-votes', campaign.id],
    queryFn: () => base44.entities.UserVote.filter({ campaign_id: campaign.id }),
    refetchInterval: 3000, // Real-time polling
  });

  // Check if user already voted
  const userVote = votes.find(v => v.voter_email === user?.email);

  // Calculate total tokens held
  const totalTokensHeld = userTokens.length;

  // Cast vote mutation
  const castVote = useMutation({
    mutationFn: async (option) => {
      if (totalTokensHeld < votePower) {
        throw new Error('Insufficient tokens');
      }
      return base44.entities.UserVote.create({
        campaign_id: campaign.id,
        event_id: eventId,
        voter_email: user.email,
        voter_name: user.full_name,
        selected_option: option,
        vote_power: votePower,
        tokens_used: votePower,
        created_at: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign-votes', campaign.id] });
      toast.success(`Vote cast with ${votePower} token power!`);
      setSelectedOption(null);
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  // Calculate results
  const results = useMemo(() => {
    const res = {};
    campaign.options.forEach(opt => {
      res[opt] = { votes: 0, power: 0, percentage: 0 };
    });

    let totalPower = 0;
    votes.forEach(vote => {
      res[vote.selected_option].votes += 1;
      res[vote.selected_option].power += vote.vote_power;
      totalPower += vote.vote_power;
    });

    Object.keys(res).forEach(opt => {
      res[opt].percentage = totalPower > 0 ? (res[opt].power / totalPower) * 100 : 0;
    });

    return res;
  }, [votes, campaign.options]);

  if (userVote) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/30 p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <CheckCircle size={24} className="text-green-400" />
          <div>
            <h3 className="font-orbitron font-bold text-green-400">Vote Submitted</h3>
            <p className="font-mono text-xs text-green-400/60">You voted for <strong>{userVote.selected_option}</strong></p>
          </div>
        </div>
        <p className="font-mono text-sm text-green-400/80">Vote Power: <strong>{userVote.vote_power} tokens</strong></p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Campaign Info */}
      <div className="bg-gradient-to-br from-fire-3/10 to-fire-3/5 border border-fire-3/20 p-5">
        <h3 className="font-orbitron font-bold text-xl text-fire-4 mb-2">{campaign.title}</h3>
        <p className="font-rajdhani text-sm text-fire-3/80 mb-3">{campaign.description}</p>
        <div className="flex items-center gap-4">
          <div>
            <p className="font-mono text-[9px] text-fire-3/60 mb-1">Your Token Balance</p>
            <p className="font-orbitron text-xl text-fire-5">{totalTokensHeld}</p>
          </div>
          <div>
            <p className="font-mono text-[9px] text-fire-3/60 mb-1">Total Votes Cast</p>
            <p className="font-orbitron text-xl text-fire-5">{votes.length}</p>
          </div>
          <div>
            <p className="font-mono text-[9px] text-fire-3/60 mb-1">Total Vote Power</p>
            <p className="font-orbitron text-xl text-fire-5">{votes.reduce((sum, v) => sum + v.vote_power, 0)}</p>
          </div>
        </div>
      </div>

      {/* Vote Power Slider */}
      <div className="bg-fire-3/5 border border-fire-3/10 p-4">
        <div className="flex items-center justify-between mb-3">
          <label className="font-mono text-[9px] text-fire-3/60 uppercase tracking-[1px]">
            Vote Power (Tokens to Use)
          </label>
          <span className="font-orbitron text-lg text-fire-5">{votePower}</span>
        </div>
        <input
          type="range"
          min="1"
          max={totalTokensHeld || 1}
          value={votePower}
          onChange={(e) => setVotePower(Number(e.target.value))}
          className="w-full accent-fire-3"
        />
        <p className="font-mono text-[8px] text-fire-3/40 mt-2">Max: {totalTokensHeld} tokens</p>
      </div>

      {/* Voting Options */}
      <div className="space-y-3">
        {campaign.options.map((option, i) => {
          const optionResult = results[option];
          const isSelected = selectedOption === option;

          return (
            <motion.button
              key={i}
              onClick={() => {
                if (totalTokensHeld === 0) {
                  toast.error('You need tokens to vote');
                  return;
                }
                castVote.mutate(option);
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={castVote.isPending || totalTokensHeld === 0}
              className={`w-full p-4 border transition-all text-left group ${
                totalTokensHeld === 0
                  ? 'opacity-50 cursor-not-allowed border-gray-500/20 bg-gray-500/5'
                  : isSelected
                  ? 'border-fire-3 bg-fire-3/20'
                  : 'border-fire-3/20 hover:border-fire-3 hover:bg-fire-3/10'
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="font-orbitron font-bold text-fire-4 mb-2">{option}</div>
                  <div className="w-full h-2 bg-fire-3/10 rounded overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${optionResult.percentage}%` }}
                      className="h-full bg-gradient-to-r from-fire-3 to-fire-5"
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="font-mono text-[9px] text-fire-3/60">{optionResult.votes} votes</span>
                    <span className="font-mono text-[9px] text-fire-5">{optionResult.percentage.toFixed(1)}%</span>
                  </div>
                </div>
                {totalTokensHeld > 0 && (
                  <div className="flex-shrink-0">
                    {castVote.isPending && isSelected ? (
                      <div className="w-6 h-6 border-2 border-fire-3/30 border-t-fire-3 rounded-full animate-spin" />
                    ) : (
                      <div className="w-6 h-6 rounded border-2 border-fire-3/40 group-hover:border-fire-3 transition-all" />
                    )}
                  </div>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      {totalTokensHeld === 0 && (
        <div className="flex items-center gap-3 p-4 bg-yellow-500/10 border border-yellow-500/30">
          <Lock size={16} className="text-yellow-400" />
          <p className="font-mono text-sm text-yellow-400">Hold tokens to participate in voting</p>
        </div>
      )}
    </div>
  );
}