import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { DollarSign, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function BetSettlementPanel({ event, onClose }) {
  const queryClient = useQueryClient();
  const [selectedOutcome, setSelectedOutcome] = useState(null);

  const { data: bets = [] } = useQuery({
    queryKey: ['event-bets-admin', event.id],
    queryFn: () => base44.entities.Bet.filter({ event_id: event.id, status: 'active' }),
  });

  const settleBetsMutation = useMutation({
    mutationFn: async (winningOutcome) => {
      return base44.functions.invoke('settleBets', {
        eventId: event.id,
        winningOutcome,
      });
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['event-bets-admin'] });
      queryClient.invalidateQueries({ queryKey: ['user-bets'] });
      queryClient.invalidateQueries({ queryKey: ['token-balance'] });
      toast.success(`Settled ${response.data.settledCount} bets. Paid out ${response.data.paidOut} tokens.`);
      onClose();
    },
    onError: (error) => {
      toast.error('Failed to settle bets');
    },
  });

  const totalByOutcome = {
    team_a: bets.filter(b => b.outcome === 'team_a').reduce((sum, b) => sum + b.amount, 0),
    team_b: bets.filter(b => b.outcome === 'team_b').reduce((sum, b) => sum + b.amount, 0),
    draw: bets.filter(b => b.outcome === 'draw').reduce((sum, b) => sum + b.amount, 0),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <DollarSign size={28} className="text-fire-5" />
        <h2 className="font-orbitron font-black text-2xl text-fire-gradient">SETTLE BETS</h2>
      </div>

      <div className="p-4 bg-fire-3/10 border border-fire-3/20">
        <div className="font-mono text-xs text-fire-3/60 mb-2">Event: {event.title}</div>
        <div className="font-orbitron text-lg text-fire-4">Active Bets: {bets.length}</div>
      </div>

      <div>
        <h3 className="font-orbitron font-bold text-lg text-fire-4 mb-4">SELECT WINNING OUTCOME</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { id: 'team_a', label: 'Team A', color: 'from-cyan/20 to-cyan/5', border: 'border-cyan/30' },
            { id: 'draw', label: 'Draw', color: 'from-purple-500/20 to-purple-500/5', border: 'border-purple-500/30' },
            { id: 'team_b', label: 'Team B', color: 'from-fire-3/20 to-fire-3/5', border: 'border-fire-3/30' },
          ].map(outcome => (
            <motion.button
              key={outcome.id}
              onClick={() => setSelectedOutcome(outcome.id)}
              className={`p-5 border-2 bg-gradient-to-br ${outcome.color} transition-all ${
                selectedOutcome === outcome.id 
                  ? 'border-fire-5 ring-2 ring-fire-5/50' 
                  : `${outcome.border} hover:border-fire-3/50`
              }`}
            >
              <div className="font-orbitron font-bold text-fire-5 mb-2">{outcome.label}</div>
              <div className="text-xs text-fire-3/60">{totalByOutcome[outcome.id]} tokens</div>
              <div className="text-[9px] text-fire-3/40">{bets.filter(b => b.outcome === outcome.id).length} bets</div>
            </motion.button>
          ))}
        </div>
      </div>

      {selectedOutcome && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 bg-green-500/10 border border-green-500/30"
        >
          <div className="flex items-start gap-3 mb-4">
            <CheckCircle size={20} className="text-green-400 flex-shrink-0 mt-1" />
            <div>
              <div className="font-orbitron font-bold text-green-400 mb-2">Ready to Settle</div>
              <div className="font-mono text-xs text-green-400/70">
                This will mark all bets as settled and credit winnings to winners.
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              if (confirm(`Settle all bets with ${selectedOutcome.replace('_', ' ').toUpperCase()} as winner?`)) {
                settleBetsMutation.mutate(selectedOutcome);
              }
            }}
            disabled={settleBetsMutation.isPending}
            className="btn-fire w-full py-3 disabled:opacity-50"
          >
            {settleBetsMutation.isPending ? 'Settling...' : 'Settle All Bets'}
          </button>
        </motion.div>
      )}
    </div>
  );
}