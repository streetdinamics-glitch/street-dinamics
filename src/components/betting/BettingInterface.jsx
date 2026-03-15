import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { TrendingUp, Zap, DollarSign, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function BettingInterface({ eventId, lang = 'en' }) {
  const queryClient = useQueryClient();
  const [selectedOutcome, setSelectedOutcome] = useState(null);
  const [betAmount, setBetAmount] = useState(100);
  const [showConfirm, setShowConfirm] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: event } = useQuery({
    queryKey: ['event', eventId],
    queryFn: () => base44.entities.Event.filter({ id: eventId }).then(r => r[0]),
    enabled: !!eventId,
  });

  const { data: bets = [] } = useQuery({
    queryKey: ['event-bets', eventId],
    queryFn: () => base44.entities.Bet.filter({ event_id: eventId, status: 'active' }).catch(() => []),
    enabled: !!eventId,
    refetchInterval: 5000,
  });

  const { data: userBets = [] } = useQuery({
    queryKey: ['user-bets', user?.email],
    queryFn: () => base44.entities.Bet.filter({ created_by: user?.email }).catch(() => []),
    enabled: !!user?.email,
    staleTime: 30000,
  });

  const { data: tokenBalance } = useQuery({
    queryKey: ['token-balance', user?.email],
    queryFn: () => base44.entities.TokenBalance.filter({ user_email: user?.email }).then(r => r[0] || { total_tokens: 0 }),
    enabled: !!user?.email,
  });

  const userTokens = tokenBalance?.total_tokens || 0;

  const placeBetMutation = useMutation({
    mutationFn: async (betData) => {
      const bet = await base44.entities.Bet.create({
        ...betData,
        created_by: user.email,
      });
      
      // Deduct tokens
      await base44.functions.invoke('updateTokenBalance', {
        userEmail: user.email,
        userName: user.full_name,
        amount: -betData.amount,
        type: 'bet_placed',
        description: `Bet on ${betData.outcome.replace('_', ' ')}`,
        relatedEntityId: bet.id,
        relatedEntityType: 'Bet',
      });

      await base44.entities.Notification.create({
        user_email: user.email,
        type: 'deal',
        title: '✅ Bet Placed',
        message: `You wagered ${betData.amount} tokens on ${betData.outcome.replace('_', ' ').toUpperCase()}`,
        related_entity_id: bet.id,
        related_entity_type: 'Bet',
        is_read: false,
        created_at: new Date().toISOString(),
      });
      
      return bet;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-bets'] });
      queryClient.invalidateQueries({ queryKey: ['event-bets', eventId] });
      queryClient.invalidateQueries({ queryKey: ['token-balance'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success(`Bet placed: ${betAmount} tokens on ${selectedOutcome}`);
      setBetAmount(100);
      setSelectedOutcome(null);
      setShowConfirm(false);
    },
    onError: () => {
      toast.error('Failed to place bet');
    },
  });

  const calculateOdds = useMemo(() => {
    if (!bets.length || !event) return {};
    
    const outcomes = ['team_a', 'team_b', 'draw'];
    const odds = {};
    
    outcomes.forEach(outcome => {
      const totalOnOutcome = bets
        .filter(b => b.outcome === outcome)
        .reduce((sum, b) => sum + (b.amount || 0), 0);
      
      const totalBets = bets.reduce((sum, b) => sum + (b.amount || 0), 0);
      const probability = totalOnOutcome / (totalBets || 1);
      
      odds[outcome] = probability > 0 ? (1 / probability).toFixed(2) : 2.0;
    });
    
    return odds;
  }, [bets, event]);

  const potentialWinnings = useMemo(() => {
    if (!selectedOutcome || !betAmount) return 0;
    const odds = parseFloat(calculateOdds[selectedOutcome] || 2.0);
    return (betAmount * odds).toFixed(0);
  }, [selectedOutcome, betAmount, calculateOdds]);

  const handlePlaceBet = () => {
    if (!user) {
      toast.error('Please log in to place a bet');
      return;
    }
    if (betAmount > userTokens) {
      toast.error('Insufficient tokens');
      return;
    }
    if (betAmount < 10) {
      toast.error('Minimum bet is 10 tokens');
      return;
    }

    placeBetMutation.mutate({
      event_id: eventId,
      outcome: selectedOutcome,
      amount: betAmount,
      odds: calculateOdds[selectedOutcome],
      potential_winnings: potentialWinnings,
      status: 'active',
      placed_at: new Date().toISOString(),
    });
  };

  const totalPool = useMemo(() => {
    return bets.reduce((sum, b) => sum + (b.amount || 0), 0);
  }, [bets]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-fire-3/10 to-fire-3/5 border border-fire-3/20 p-4 clip-cyber">
          <div className="font-mono text-xs text-fire-3/60 mb-1">Total Pool</div>
          <div className="font-orbitron text-2xl font-bold text-fire-5">{totalPool}</div>
          <div className="font-mono text-[9px] text-fire-3/40 mt-2">tokens wagered</div>
        </div>
        <div className="bg-gradient-to-br from-cyan/10 to-cyan/5 border border-cyan/20 p-4 clip-cyber">
          <div className="font-mono text-xs text-cyan/60 mb-1">Your Balance</div>
          <div className="font-orbitron text-2xl font-bold text-cyan">{userTokens}</div>
          <div className="font-mono text-[9px] text-cyan/40 mt-2">tokens available</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20 p-4 clip-cyber">
          <div className="font-mono text-xs text-purple-500/60 mb-1">Active Bets</div>
          <div className="font-orbitron text-2xl font-bold text-purple-400">{userBets.filter(b => b.status === 'active').length}</div>
          <div className="font-mono text-[9px] text-purple-500/40 mt-2">pending resolution</div>
        </div>
      </div>

      {/* Betting Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-[rgba(10,4,18,0.98)] to-[rgba(4,2,8,1)] border border-fire-3/20 p-6 clip-cyber"
      >
        <h3 className="font-orbitron font-bold text-xl text-fire-4 mb-6">PLACE YOUR BET</h3>

        {event?.status !== 'live' && (
          <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 flex gap-2">
            <AlertCircle size={16} className="text-yellow-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-yellow-300">Event must be live to place bets</p>
          </div>
        )}

        {/* Outcomes Grid */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { id: 'team_a', label: 'Team A Wins', color: 'from-cyan/20 to-cyan/5' },
            { id: 'draw', label: 'Draw', color: 'from-purple-500/20 to-purple-500/5' },
            { id: 'team_b', label: 'Team B Wins', color: 'from-fire-3/20 to-fire-3/5' },
          ].map(outcome => (
            <motion.button
              key={outcome.id}
              onClick={() => setSelectedOutcome(outcome.id)}
              whileHover={{ scale: 1.02 }}
              className={`p-4 border-2 transition-all clip-cyber ${
                selectedOutcome === outcome.id
                  ? `border-fire-5 bg-gradient-to-br ${outcome.color} ring-2 ring-fire-5/50`
                  : 'border-fire-3/20 bg-gradient-to-br from-fire-3/5 to-transparent'
              }`}
            >
              <div className="text-xs font-mono tracking-[1px] uppercase text-fire-3/60 mb-2">
                {outcome.label}
              </div>
              <div className="font-orbitron text-xl font-bold text-fire-5">
                {calculateOdds[outcome.id] || 2.0}x
              </div>
              <div className="text-[9px] text-fire-3/40 mt-1">
                {bets.filter(b => b.outcome === outcome.id).reduce((sum, b) => sum + (b.amount || 0), 0)} tokens
              </div>
            </motion.button>
          ))}
        </div>

        {/* Bet Amount Slider */}
        <div className="mb-6">
          <label className="font-mono text-xs text-fire-3/60 tracking-[1px] uppercase block mb-2">
            Bet Amount: {betAmount} Tokens
          </label>
          <input
            type="range"
            min="10"
            max={userTokens}
            step="10"
            value={betAmount}
            onChange={(e) => setBetAmount(Number(e.target.value))}
            disabled={event?.status !== 'live'}
            className="w-full h-2 bg-fire-3/20 rounded cursor-pointer"
          />
          <div className="flex justify-between text-[9px] text-fire-3/40 mt-1 font-mono">
            <span>Min: 10</span>
            <span>Max: {userTokens}</span>
          </div>
        </div>

        {/* Potential Winnings */}
        {selectedOutcome && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-gradient-to-r from-fire-5/20 to-fire-3/10 border border-fire-5/30"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-xs text-fire-3/60 mb-1">Potential Winnings</p>
                <p className="font-orbitron text-2xl font-bold text-fire-5">{potentialWinnings} tokens</p>
              </div>
              <TrendingUp className="text-fire-5 opacity-30" size={32} />
            </div>
          </motion.div>
        )}

        {/* Confirm Button */}
        <button
          onClick={() => setShowConfirm(true)}
          disabled={!selectedOutcome || event?.status !== 'live' || placeBetMutation.isPending}
          className="w-full btn-fire py-3 font-bold disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {placeBetMutation.isPending ? 'Placing Bet...' : `Place ${betAmount} Token Bet`}
        </button>
      </motion.div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-[rgba(10,4,18,0.99)] to-[rgba(4,2,8,1)] border border-fire-3/40 p-6 clip-cyber max-w-md w-full"
          >
            <h3 className="font-orbitron font-bold text-xl text-fire-4 mb-4">Confirm Bet</h3>
            <div className="space-y-3 mb-6 font-mono text-sm text-fire-3/80">
              <div className="flex justify-between">
                <span>Outcome:</span>
                <span className="text-fire-5 font-bold">{selectedOutcome.replace('_', ' ').toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span>Amount:</span>
                <span className="text-cyan font-bold">{betAmount} tokens</span>
              </div>
              <div className="flex justify-between">
                <span>Odds:</span>
                <span className="text-purple-400 font-bold">{calculateOdds[selectedOutcome]}x</span>
              </div>
              <div className="border-t border-fire-3/20 pt-3 flex justify-between text-fire-5">
                <span>Potential Win:</span>
                <span className="font-bold">{potentialWinnings} tokens</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 btn-ghost py-2"
              >
                Cancel
              </button>
              <button
                onClick={handlePlaceBet}
                className="flex-1 btn-fire py-2"
              >
                Confirm Bet
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}