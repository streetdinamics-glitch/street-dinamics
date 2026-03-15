import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Zap, TrendingUp, TrendingDown } from 'lucide-react';

export default function TokenBalanceWidget() {
  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: tokenBalance } = useQuery({
    queryKey: ['token-balance', user?.email],
    queryFn: () => base44.entities.TokenBalance.filter({ user_email: user?.email }).then(r => r[0]),
    enabled: !!user,
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ['recent-transactions', user?.email],
    queryFn: () => base44.entities.TokenTransaction.filter({ user_email: user?.email }).then(txs => txs.slice(0, 5)),
    enabled: !!user,
  });

  if (!tokenBalance) return null;

  const totalEarned = (tokenBalance.earned_from_points || 0) + (tokenBalance.earned_from_bets || 0) + (tokenBalance.earned_from_ownership || 0);
  const totalSpent = (tokenBalance.spent_on_rewards || 0) + (tokenBalance.spent_on_bets || 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-fire-3/10 to-transparent border border-fire-3/30 p-6 clip-cyber"
    >
      <div className="flex items-center gap-3 mb-4">
        <Zap size={28} className="text-fire-5" />
        <div>
          <div className="font-mono text-[10px] tracking-[2px] uppercase text-fire-3/60">Token Balance</div>
          <div className="font-orbitron text-3xl font-bold text-fire-5">{tokenBalance.total_tokens.toLocaleString()}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-green-500/10 border border-green-500/20 p-3">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={14} className="text-green-400" />
            <div className="font-mono text-[9px] text-green-400/60 uppercase">Earned</div>
          </div>
          <div className="font-orbitron text-lg font-bold text-green-400">{totalEarned}</div>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 p-3">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown size={14} className="text-red-400" />
            <div className="font-mono text-[9px] text-red-400/60 uppercase">Spent</div>
          </div>
          <div className="font-orbitron text-lg font-bold text-red-400">{totalSpent}</div>
        </div>
      </div>

      {transactions.length > 0 && (
        <div>
          <div className="font-mono text-[9px] tracking-[1px] uppercase text-fire-3/60 mb-2">Recent Activity</div>
          <div className="space-y-2">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between text-xs">
                <span className="font-mono text-fire-3/60">{tx.description}</span>
                <span className={`font-orbitron font-bold ${tx.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {tx.amount > 0 ? '+' : ''}{tx.amount}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}