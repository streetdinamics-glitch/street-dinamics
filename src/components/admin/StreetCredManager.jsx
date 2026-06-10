/**
 * StreetCredManager — Admin panel to:
 * 1. Manually award / deduct Street Cred points to any user
 * 2. Manually change a user's level
 * 3. Register offline actions (check-in, side events, merch, volunteering)
 */
import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Search, Plus, Minus, Star, TrendingUp, Save, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

const LEVELS = ['newcomer', 'follower', 'hype_beast', 'street_legend', 'sd_icon'];

const OFFLINE_ACTIONS = [
  { key: 'events_attended',       label: 'Evento fisico',        points: 150 },
  { key: 'side_events_attended',  label: 'Side Event',           points: 75 },
  { key: 'merch_purchases',       label: 'Acquisto Merch',       points: 50 },
  { key: 'checkins',              label: 'Check-in QR',          points: 25 },
];

export default function StreetCredManager() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [pointsAmount, setPointsAmount] = useState(100);
  const [reason, setReason] = useState('');
  const [newLevel, setNewLevel] = useState('');
  const [offlineAction, setOfflineAction] = useState('events_attended');

  const { data: allSC = [] } = useQuery({
    queryKey: ['all-street-cred'],
    queryFn: () => base44.entities.StreetCred.list('-total_points', 200),
    initialData: [],
  });

  const filtered = allSC.filter(sc =>
    sc.user_name?.toLowerCase().includes(search.toLowerCase()) ||
    sc.user_email?.toLowerCase().includes(search.toLowerCase())
  );

  const updateSCMutation = useMutation({
    mutationFn: async ({ id, data }) => base44.entities.StreetCred.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-street-cred'] });
      toast.success('Street Cred aggiornato!');
      setSelectedUser(null);
      setPointsAmount(100);
      setReason('');
      setNewLevel('');
    },
    onError: () => toast.error('Errore aggiornamento'),
  });

  const handleAwardPoints = (sign) => {
    if (!selectedUser) return;
    const delta = sign * pointsAmount;
    const newTotal = Math.max(0, (selectedUser.total_points || 0) + delta);
    const history = [...(selectedUser.level_history || []), {
      action: sign > 0 ? 'manual_award' : 'manual_deduct',
      delta,
      reason: reason || 'Admin manual',
      date: new Date().toISOString(),
      admin: true,
    }];
    updateSCMutation.mutate({
      id: selectedUser.id,
      data: { total_points: newTotal, level_history: history, last_points_earned_at: new Date().toISOString() },
    });
  };

  const handleChangeLevel = () => {
    if (!selectedUser || !newLevel) return;
    updateSCMutation.mutate({
      id: selectedUser.id,
      data: {
        level: newLevel,
        level_unlocked_at: new Date().toISOString(),
        level_history: [...(selectedUser.level_history || []), {
          action: 'manual_level_change',
          from: selectedUser.level,
          to: newLevel,
          date: new Date().toISOString(),
          admin: true,
        }],
      },
    });
  };

  const handleOfflineAction = () => {
    if (!selectedUser) return;
    const actionCfg = OFFLINE_ACTIONS.find(a => a.key === offlineAction);
    const currentActions = selectedUser.actions_offline || {};
    const newCount = (currentActions[offlineAction] || 0) + 1;
    const newTotal = (selectedUser.total_points || 0) + actionCfg.points;
    updateSCMutation.mutate({
      id: selectedUser.id,
      data: {
        total_points: newTotal,
        actions_offline: { ...currentActions, [offlineAction]: newCount },
        last_points_earned_at: new Date().toISOString(),
        level_history: [...(selectedUser.level_history || []), {
          action: 'offline_action',
          type: offlineAction,
          delta: actionCfg.points,
          date: new Date().toISOString(),
          admin: true,
        }],
      },
    });
  };

  const LEVEL_COLOR = {
    newcomer: '#94a3b8', follower: '#a855f7', hype_beast: '#00ffee',
    street_legend: '#ff6600', sd_icon: '#fbbf24',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Star size={26} className="text-fire-5" />
        <h2 className="font-orbitron font-black text-2xl text-fire-gradient">STREET CRED MANAGER</h2>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-fire-3/40" />
        <input
          className="cyber-input pl-9"
          placeholder="Cerca utente per nome o email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User list */}
        <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
          {filtered.length === 0 && (
            <p className="font-mono text-xs text-fire-3/30 text-center py-8">Nessun risultato</p>
          )}
          {filtered.map(sc => (
            <motion.button
              key={sc.id}
              onClick={() => { setSelectedUser(sc); setNewLevel(sc.level); }}
              className={`w-full text-left p-3 border transition-all ${
                selectedUser?.id === sc.id
                  ? 'border-fire-4/60 bg-fire-3/10'
                  : 'border-white/8 bg-black/30 hover:border-white/20'
              }`}
              style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))' }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-orbitron text-sm text-fire-5">{sc.user_name || sc.user_email}</div>
                  <div className="font-mono text-[9px] text-white/30">{sc.user_email}</div>
                </div>
                <div className="text-right">
                  <div className="font-orbitron font-bold" style={{ color: LEVEL_COLOR[sc.level] || '#ff6600' }}>
                    {(sc.total_points || 0).toLocaleString()} SC
                  </div>
                  <div className="font-mono text-[9px] text-white/30">{sc.level?.replace(/_/g,' ')}</div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Action panel */}
        {selectedUser ? (
          <div className="space-y-4 p-5 border border-fire-3/20 bg-fire-3/5">
            <div>
              <div className="font-orbitron font-bold text-fire-5">{selectedUser.user_name}</div>
              <div className="font-mono text-[10px] text-white/30">{selectedUser.user_email}</div>
              <div className="font-orbitron font-black text-2xl mt-1" style={{ color: LEVEL_COLOR[selectedUser.level] }}>
                {(selectedUser.total_points || 0).toLocaleString()} SC · {selectedUser.level?.replace(/_/g,' ')}
              </div>
            </div>

            {/* Award/Deduct points */}
            <div className="border border-white/8 p-4 space-y-3">
              <div className="font-mono text-[10px] tracking-[2px] uppercase text-white/40">Assegna / Deduci Punti</div>
              <div className="flex gap-2">
                <input
                  type="number"
                  min={1}
                  value={pointsAmount}
                  onChange={e => setPointsAmount(Number(e.target.value))}
                  className="cyber-input flex-1"
                  placeholder="Punti"
                />
              </div>
              <input
                className="cyber-input"
                placeholder="Motivo (es. Premio speciale, Evento offline...)"
                value={reason}
                onChange={e => setReason(e.target.value)}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => handleAwardPoints(1)}
                  disabled={updateSCMutation.isPending}
                  className="btn-fire text-[10px] py-2 px-4 flex items-center gap-1.5 disabled:opacity-30"
                >
                  <Plus size={13} /> +{pointsAmount} SC
                </button>
                <button
                  onClick={() => handleAwardPoints(-1)}
                  disabled={updateSCMutation.isPending}
                  className="btn-ghost text-[10px] py-2 px-4 flex items-center gap-1.5 disabled:opacity-30"
                >
                  <Minus size={13} /> -{pointsAmount} SC
                </button>
              </div>
            </div>

            {/* Offline action */}
            <div className="border border-cyan/15 p-4 space-y-3">
              <div className="font-mono text-[10px] tracking-[2px] uppercase text-cyan/40">Registra Azione Offline</div>
              <select
                className="cyber-input"
                value={offlineAction}
                onChange={e => setOfflineAction(e.target.value)}
              >
                {OFFLINE_ACTIONS.map(a => (
                  <option key={a.key} value={a.key}>{a.label} (+{a.points} SC)</option>
                ))}
              </select>
              <button
                onClick={handleOfflineAction}
                disabled={updateSCMutation.isPending}
                className="btn-cyan text-[10px] py-2 px-4 flex items-center gap-1.5 disabled:opacity-30"
              >
                <RefreshCw size={13} /> Registra
              </button>
            </div>

            {/* Change level */}
            <div className="border border-purple-500/20 p-4 space-y-3">
              <div className="font-mono text-[10px] tracking-[2px] uppercase text-purple-400/40">Forza Livello</div>
              <select
                className="cyber-input"
                value={newLevel}
                onChange={e => setNewLevel(e.target.value)}
              >
                {LEVELS.map(l => (
                  <option key={l} value={l}>{l.replace(/_/g,' ')}</option>
                ))}
              </select>
              <button
                onClick={handleChangeLevel}
                disabled={updateSCMutation.isPending || newLevel === selectedUser.level}
                className="btn-ghost text-[10px] py-2 px-4 flex items-center gap-1.5 disabled:opacity-30 border-purple-500/40 text-purple-400"
              >
                <TrendingUp size={13} /> Cambia livello
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-40 border border-white/5 bg-black/20">
            <p className="font-mono text-xs text-white/20">← Seleziona un utente</p>
          </div>
        )}
      </div>
    </div>
  );
}