import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Trophy, RefreshCw, Search } from 'lucide-react';
import { toast } from 'sonner';

const TIER_CONFIG = {
  newcomer:      { color: 'text-slate-400',  label: 'Newcomer' },
  follower:      { color: 'text-purple-400', label: 'Follower' },
  hype_beast:    { color: 'text-cyan',        label: 'Hype Beast' },
  street_legend: { color: 'text-fire-4',      label: 'Street Legend' },
  sd_icon:       { color: 'text-yellow-400', label: 'SD Icon' },
};

export default function FanStatusManager() {
  const queryClient = useQueryClient();
  const [searchEmail, setSearchEmail] = useState('');

  const { data: allStreetCred = [] } = useQuery({
    queryKey: ['all-street-cred'],
    queryFn: () => base44.entities.StreetCred.list('-total_points', 100),
    initialData: [],
  });

  const recalculateMutation = useMutation({
    mutationFn: async (userEmail) => {
      return base44.functions.invoke('syncStreetCred', { user_email: userEmail });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-street-cred'] });
      toast.success('Street Cred ricalcolato');
    },
    onError: () => toast.error('Errore nel ricalcolo'),
  });

  const recalculateAllMutation = useMutation({
    mutationFn: async () => {
      const results = await Promise.allSettled(
        allStreetCred.map(s =>
          base44.functions.invoke('syncStreetCred', { user_email: s.user_email })
        )
      );
      return results.filter(r => r.status === 'fulfilled').length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ['all-street-cred'] });
      toast.success(`Ricalcolati ${count} profili`);
    },
  });

  const filtered = searchEmail
    ? allStreetCred.filter(s =>
        s.user_email?.toLowerCase().includes(searchEmail.toLowerCase()) ||
        s.user_name?.toLowerCase().includes(searchEmail.toLowerCase())
      )
    : allStreetCred;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Trophy size={28} className="text-fire-5" />
          <h2 className="font-orbitron font-black text-2xl text-fire-gradient">STREET CRED MANAGER</h2>
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
          placeholder="Cerca per email o nome..."
          value={searchEmail}
          onChange={(e) => setSearchEmail(e.target.value)}
          className="cyber-input pl-10"
        />
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        {Object.entries(TIER_CONFIG).map(([tier, config]) => {
          const count = allStreetCred.filter(s => s.level === tier).length;
          return (
            <div key={tier} className="bg-fire-3/5 border border-fire-3/20 p-3 text-center">
              <div className={`font-orbitron font-bold text-2xl ${config.color}`}>{count}</div>
              <div className="font-mono text-[9px] text-fire-3/60 uppercase mt-1">{config.label}</div>
            </div>
          );
        })}
      </div>

      {/* Street Cred List */}
      <div className="space-y-3 max-h-[500px] overflow-y-auto">
        {filtered.map((status, i) => {
          const tc = TIER_CONFIG[status.level] || TIER_CONFIG['newcomer'];
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
                <div className="flex items-center gap-4 mt-2 flex-wrap">
                  <div>
                    <span className="font-mono text-[9px] text-fire-3/60">LEVEL: </span>
                    <span className={`font-mono text-xs font-bold ${tc.color}`}>{tc.label}</span>
                  </div>
                  <div>
                    <span className="font-mono text-[9px] text-fire-3/60">SC: </span>
                    <span className="font-mono text-xs text-fire-4">{status.total_points?.toLocaleString() || 0}</span>
                  </div>
                  <div>
                    <span className="font-mono text-[9px] text-fire-3/60">MULT: </span>
                    <span className="font-mono text-xs text-cyan">{status.current_multiplier || 1}x</span>
                  </div>
                  <div>
                    <span className="font-mono text-[9px] text-fire-3/60">CASHBACK: </span>
                    <span className="font-mono text-xs text-purple-400">{((status.cashback_rate || 0) * 100).toFixed(1)}%</span>
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
        {filtered.length === 0 && (
          <p className="font-mono text-xs text-fire-3/30 text-center py-8">Nessun utente trovato</p>
        )}
      </div>
    </div>
  );
}