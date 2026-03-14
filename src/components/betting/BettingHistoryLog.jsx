import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Clock, CheckCircle, XCircle } from 'lucide-react';

export default function BettingHistoryLog() {
  const [sortBy, setSortBy] = useState('recent');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: bets = [] } = useQuery({
    queryKey: ['user-betting-history', user?.email],
    queryFn: async () => {
      const allBets = await base44.entities.Bet.filter({ created_by: user?.email }).catch(() => []);
      return allBets.sort((a, b) => new Date(b.placed_at) - new Date(a.placed_at));
    },
    enabled: !!user?.email,
    staleTime: 60000,
  });

  const stats = useMemo(() => {
    const active = bets.filter(b => b.status === 'active');
    const settled = bets.filter(b => b.status === 'settled');
    const won = settled.filter(b => b.result === 'won');
    const lost = settled.filter(b => b.result === 'lost');

    const totalWagered = bets.reduce((sum, b) => sum + (b.amount || 0), 0);
    const totalWon = won.reduce((sum, b) => sum + (b.potential_winnings || 0), 0);
    const roi = totalWagered > 0 ? (((totalWon - totalWagered) / totalWagered) * 100).toFixed(1) : 0;

    return {
      totalBets: bets.length,
      activeBets: active.length,
      winRate: bets.length > 0 ? ((won.length / settled.length) * 100 || 0).toFixed(1) : 0,
      totalWagered,
      totalWon,
      roi,
    };
  }, [bets]);

  const filteredBets = useMemo(() => {
    let filtered = bets;
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(b => b.status === statusFilter);
    }

    if (sortBy === 'recent') {
      return filtered.sort((a, b) => new Date(b.placed_at) - new Date(a.placed_at));
    } else if (sortBy === 'amount') {
      return filtered.sort((a, b) => (b.amount || 0) - (a.amount || 0));
    } else if (sortBy === 'odds') {
      return filtered.sort((a, b) => (b.odds || 0) - (a.odds || 0));
    }
    return filtered;
  }, [bets, sortBy, statusFilter]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Total Bets', value: stats.totalBets, icon: TrendingUp, color: 'fire-3' },
          { label: 'Active', value: stats.activeBets, icon: Clock, color: 'cyan' },
          { label: 'Win Rate', value: `${stats.winRate}%`, icon: CheckCircle, color: 'green-500' },
          { label: 'Wagered', value: stats.totalWagered, icon: TrendingDown, color: 'purple-500' },
          { label: 'Won', value: stats.totalWon, icon: TrendingUp, color: 'fire-5' },
          { label: 'ROI', value: `${stats.roi}%`, icon: TrendingUp, color: 'yellow-500' },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`bg-gradient-to-br from-${stat.color}/10 to-transparent border border-${stat.color}/20 p-3 text-center clip-cyber`}
            >
              <Icon size={16} className={`text-${stat.color} mx-auto mb-2 opacity-60`} />
              <p className="font-mono text-[9px] text-fire-3/60 mb-1">{stat.label}</p>
              <p className={`font-orbitron font-bold text-sm text-${stat.color}`}>{stat.value}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-2">
          {['active', 'settled', 'all'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-2 text-xs font-mono tracking-[1px] uppercase border transition-all ${
                statusFilter === status
                  ? 'border-fire-3 bg-fire-3/10 text-fire-4'
                  : 'border-fire-3/20 text-fire-3/60 hover:border-fire-3/40'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-2 text-xs font-mono bg-fire-3/10 border border-fire-3/20 text-fire-4 cursor-pointer hover:border-fire-3/40"
        >
          <option value="recent">Most Recent</option>
          <option value="amount">Highest Amount</option>
          <option value="odds">Best Odds</option>
        </select>
      </div>

      {/* Bets Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-fire-3/20">
              <th className="px-4 py-3 text-left font-mono text-[10px] text-fire-3/60 tracking-[1px]">Event</th>
              <th className="px-4 py-3 text-left font-mono text-[10px] text-fire-3/60 tracking-[1px]">Outcome</th>
              <th className="px-4 py-3 text-center font-mono text-[10px] text-fire-3/60 tracking-[1px]">Amount</th>
              <th className="px-4 py-3 text-center font-mono text-[10px] text-fire-3/60 tracking-[1px]">Odds</th>
              <th className="px-4 py-3 text-center font-mono text-[10px] text-fire-3/60 tracking-[1px]">Potential</th>
              <th className="px-4 py-3 text-center font-mono text-[10px] text-fire-3/60 tracking-[1px]">Status</th>
              <th className="px-4 py-3 text-center font-mono text-[10px] text-fire-3/60 tracking-[1px]">Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredBets.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-4 py-8 text-center text-fire-3/40">
                  No bets found
                </td>
              </tr>
            ) : (
              filteredBets.map((bet, i) => {
                const statusColor = bet.status === 'active' ? 'text-yellow-400' : 
                                   bet.result === 'won' ? 'text-green-400' : 'text-red-400';
                const statusIcon = bet.status === 'active' ? <Clock size={14} /> :
                                  bet.result === 'won' ? <CheckCircle size={14} /> : <XCircle size={14} />;

                return (
                  <motion.tr
                    key={bet.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="border-b border-fire-3/10 hover:bg-fire-3/5 transition-colors"
                  >
                    <td className="px-4 py-3 text-fire-4 font-mono text-xs truncate max-w-xs">
                      {bet.event_id.substring(0, 12)}...
                    </td>
                    <td className="px-4 py-3 text-fire-3/80 text-xs font-mono uppercase">
                      {bet.outcome.replace('_', ' ')}
                    </td>
                    <td className="px-4 py-3 text-center text-cyan font-bold text-xs">
                      {bet.amount}
                    </td>
                    <td className="px-4 py-3 text-center text-purple-400 font-bold text-xs">
                      {bet.odds}x
                    </td>
                    <td className="px-4 py-3 text-center text-fire-5 font-bold text-xs">
                      {bet.potential_winnings || 0}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className={`flex items-center justify-center gap-1 ${statusColor}`}>
                        {statusIcon}
                        <span className="text-xs font-mono uppercase">{bet.status}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-fire-3/60 text-xs font-mono">
                      {new Date(bet.placed_at).toLocaleDateString()}
                    </td>
                  </motion.tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}