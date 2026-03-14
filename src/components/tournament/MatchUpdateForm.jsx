import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, CheckCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function MatchUpdateForm({ match, onSubmit, onCancel }) {
  const [winner, setWinner] = useState(match.winner_email || '');
  const [score, setScore] = useState(match.score || '');
  const [status, setStatus] = useState(match.status || 'pending');

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      const result = await base44.entities.TournamentMatch.update(match.id, data);
      return result;
    },
    onSuccess: () => {
      toast.success('Match updated successfully!');
      onSubmit(match.id, {
        winner_email: winner,
        winner_name: winner === match.participant1_email ? match.participant1_name : match.participant2_name,
        score,
        status,
      });
    },
    onError: () => {
      toast.error('Failed to update match');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!winner) {
      toast.error('Please select a winner');
      return;
    }

    if (!score) {
      toast.error('Please enter the match score');
      return;
    }

    const updateData = {
      winner_email: winner,
      winner_name: winner === match.participant1_email ? match.participant1_name : match.participant2_name,
      score,
      status: 'completed',
    };

    updateMutation.mutate(updateData);
  };

  return (
    <div className="fixed inset-0 z-[500] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-gradient-to-br from-[rgba(10,4,18,0.99)] to-[rgba(4,2,8,1)] border border-fire-3/20 rounded-lg p-8 relative"
      >
        {/* Close Button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-2 hover:bg-fire-3/10 rounded transition-all"
        >
          <X size={20} className="text-fire-3/60" />
        </button>

        {/* Header */}
        <h2 className="text-fire-gradient font-orbitron font-black text-2xl tracking-[2px] mb-6">
          UPDATE MATCH
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Participants Display */}
          <div className="space-y-2 bg-fire-3/5 border border-fire-3/10 p-4 rounded">
            <p className="font-mono text-xs text-fire-3/60 tracking-[1px] uppercase mb-3">Match Participants</p>
            <div className="space-y-2 font-rajdhani text-sm">
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  id="p1"
                  name="winner"
                  value={match.participant1_email}
                  checked={winner === match.participant1_email}
                  onChange={(e) => setWinner(e.target.value)}
                  className="w-4 h-4 accent-fire-3"
                />
                <label htmlFor="p1" className="text-fire-4 cursor-pointer">
                  {match.participant1_name || 'TBD'}
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  id="p2"
                  name="winner"
                  value={match.participant2_email}
                  checked={winner === match.participant2_email}
                  onChange={(e) => setWinner(e.target.value)}
                  className="w-4 h-4 accent-fire-3"
                />
                <label htmlFor="p2" className="text-fire-4 cursor-pointer">
                  {match.participant2_name || 'TBD'}
                </label>
              </div>
            </div>
          </div>

          {/* Score Input */}
          <div>
            <label className="font-orbitron text-xs tracking-[2px] text-fire-4 block mb-2 uppercase">
              Match Score
            </label>
            <input
              type="text"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              placeholder="e.g., 3-1, 2-0, etc."
              className="w-full bg-fire-3/5 border border-fire-3/20 rounded px-4 py-2 text-fire-4 placeholder-fire-3/30 font-mono text-sm focus:outline-none focus:border-fire-3/40"
            />
            <p className="font-mono text-[10px] text-fire-3/40 mt-1">Enter the final score of the match</p>
          </div>

          {/* Status */}
          <div>
            <p className="font-mono text-xs text-fire-3/60 tracking-[1px] uppercase mb-2">Status</p>
            <div className="p-3 bg-fire-3/5 border border-fire-3/10 rounded font-mono text-sm text-fire-4">
              This match will be marked as COMPLETED
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-fire-3/10 border border-fire-3/20 text-fire-3 font-orbitron font-bold text-sm tracking-[1px] py-2.5 rounded hover:bg-fire-3/20 transition-all"
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="flex-1 bg-gradient-to-r from-fire-3 to-fire-4 text-black font-orbitron font-bold text-sm tracking-[1px] py-2.5 rounded hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <CheckCircle size={16} />
              {updateMutation.isPending ? 'UPDATING...' : 'CONFIRM'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}