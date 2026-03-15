import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Trophy, RefreshCw, Search, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

const TIER_CONFIG = {
  rookie: { color: 'text-slate-400', label: 'Rookie' },
  enthusiast: { color: 'text-purple-400', label: 'Enthusiast' },
  superfan: { color: 'text-cyan', label: 'Superfan' },
  legend: { color: 'text-fire-4', label: 'Legend' },
  hall_of_fame: { color: 'text-yellow-400', label: 'Hall of Fame' },
};

export default function FanStatusManager() {
  const queryClient = useQueryClient();
  const [searchEmail, setSearchEmail] = useState('');

  const { data: allFanStatus = [] } = useQuery({
    queryKey: ['all-fan-status'],
    queryFn: () => base44.entities.FanStatus.list('-total_tokens_spent', 100),
    initialData: [],
  });

  const recalculateMutation = useMutation({
    mutationFn: async (userEmail) => {
      return base44.functions.invoke('updateFanStatus', { userEmail });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-fan-status'] });
      toast.success('Fan status recalculated');
    },
    onError: () => {
      toast.error('Failed to recalculate');
    },
  });

  const recalculateAllMutation = useMutation({
    mutationFn: async () => {
      const results = await Promise.allSettled(
        allFanStatus.map(status => 
          base44.functions.invoke('updateFanStatus', { userEmail: status.user_email })
        )
      );
      const successful = results.filter(r => r.status === 'fulfilled').length;
      return successful;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ['all-fan-status'] });
      toast.success(`Recalculated ${count} fan statuses`);
    },
  });

  const filteredStatus = searchEmail
    ? allFanStatus.filter(s => s.user_email.toLowerCase().includes(searchEmail.toLowerCase()) || s.user_name.toLowerCase().includes(searchEmail.toLowerCase()))
    : allFanStatus;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Trophy size={28} className="text-fire-5" />
          <h2 className="font-orbitron font-black text-2xl text-fire-gradient">FAN STATUS MANAGER</h2>
        </div>
        <button
          onClick={() => recalculateAllMutation.mutate()}
          disabled={recalculateAllMutation.isPending}
          className="btn-fire text-[10px] py-2 px-4 flex items-center gap-2"
        >
          <RefreshCw size={14} className={recalculateAllMutation.isPending ? 'animate-spin' : ''} />
          Recalculate All
        </button>
      </div>

      {/* Search */}
      <div className="mb-6 relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-fire-3/40" />
        <input
          type="text"
          placeholder="Search by email or name..."
          value={searchEmail}
          onChange={(e) => setSearchEmail(e.target.value)}
          className="cyber-input pl-10"
        />
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        {Object.entries(TIER_CONFIG).map(([tier, config]) => {
          const count = allFanStatus.filter(s => s.current_tier === tier).length;
          return (
            <div key={tier} className="bg-fire-3/5 border border-fire-3/20 p-3 text-center">
              <div className={`font-orbitron font-bold text-2xl ${config.color}`}>{count}</div>
              <div className="font-mono text-[9px] text-fire-3/60 uppercase mt-1">{config.label}</div>
            </div>
          );
        })}
      </div>

      {/* Fan Status List */}
      <div className="space-y-3 max-h-[500px] overflow-y-auto">
        {filteredStatus.map((status, i) => {
          const tierConfig = TIER_CONFIG[status.current_tier];
          return (
            <motion.div
              key={status.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-fire-3/5 border border-fire-3/10 p-4 flex items-center justify-between"
            >
              <div className="flex-1">
                <div className="font-orbitron font-bold text-fire-5">{status.user_name}</div>
                <div className="font-mono text-xs text-fire-3/60">{status.user_email}</div>
                <div className="flex items-center gap-4 mt-2">
                  <div>
                    <span className="font-mono text-[9px] text-fire-3/60">TIER: </span>
                    <span className={`font-mono text-xs font-bold ${tierConfig.color}`}>{tierConfig.label}</span>
                  </div>
                  <div>
                    <span className="font-mono text-[9px] text-fire-3/60">SPENT: </span>
                    <span className="font-mono text-xs text-fire-4">{status.total_tokens_spent?.toLocaleString() || 0}</span>
                  </div>
                  <div>
                    <span className="font-mono text-[9px] text-fire-3/60">MULTIPLIER: </span>
                    <span className="font-mono text-xs text-cyan">{status.current_multiplier}x</span>
                  </div>
                  <div>
                    <span className="font-mono text-[9px] text-fire-3/60">RARITY: </span>
                    <span className="font-mono text-xs text-purple-400">{status.rarity_score || 0}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => recalculateMutation.mutate(status.user_email)}
                disabled={recalculateMutation.isPending}
                className="btn-cyan text-[9px] py-2 px-3"
              >
                <RefreshCw size={12} />
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}