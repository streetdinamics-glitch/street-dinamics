/**
 * DisputeResolutionPanel — Admin panel to:
 * 7. Manage marketplace and sponsorship disputes
 */
import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Scale, AlertTriangle, CheckCircle2, Clock, ChevronDown, ChevronUp, Send } from 'lucide-react';
import { toast } from 'sonner';

const STATUS_CONFIG = {
  opened:           { color: '#fbbf24', label: 'Aperta' },
  under_review:     { color: '#f97316', label: 'In Revisione' },
  awaiting_evidence:{ color: '#a855f7', label: 'Attende Prove' },
  mediating:        { color: '#3b82f6', label: 'Mediazione' },
  resolved:         { color: '#22c55e', label: 'Risolta' },
  appealed:         { color: '#ef4444', label: 'In Appello' },
  closed:           { color: '#6b7280', label: 'Chiusa' },
};

const RESOLUTIONS = [
  { key: 'full_refund_buyer',      label: 'Rimborso completo acquirente' },
  { key: 'full_payment_seller',    label: 'Pagamento completo venditore' },
  { key: 'partial_refund',         label: 'Rimborso parziale' },
  { key: 'split_50_50',            label: 'Split 50/50' },
  { key: 'custom_split',           label: 'Split personalizzato' },
  { key: 'rejected',               label: 'Disputa rigettata' },
];

export default function DisputeResolutionPanel() {
  const queryClient = useQueryClient();
  const [expandedId, setExpandedId] = useState(null);
  const [resolutionForm, setResolutionForm] = useState({});
  const [filterStatus, setFilterStatus] = useState('all');

  const { data: disputes = [] } = useQuery({
    queryKey: ['admin-disputes'],
    queryFn: () => base44.entities.Dispute.list('-created_at', 100),
    initialData: [],
    refetchInterval: 30000,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Dispute.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-disputes'] });
      toast.success('Disputa aggiornata!');
      setExpandedId(null);
      setResolutionForm({});
    },
    onError: () => toast.error('Errore aggiornamento'),
  });

  const handleStatusChange = (dispute, newStatus) => {
    updateMutation.mutate({
      id: dispute.id,
      data: { status: newStatus, updated_at: new Date().toISOString() },
    });
  };

  const handleResolve = (dispute) => {
    const form = resolutionForm[dispute.id] || {};
    if (!form.resolution) { toast.error('Seleziona una risoluzione'); return; }
    updateMutation.mutate({
      id: dispute.id,
      data: {
        status: 'resolved',
        resolution: form.resolution,
        resolution_amount: form.resolution_amount ? Number(form.resolution_amount) : undefined,
        resolution_notes: form.notes || '',
        resolved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    });
  };

  const filtered = filterStatus === 'all' ? disputes : disputes.filter(d => d.status === filterStatus);
  const openCount = disputes.filter(d => !['resolved','closed'].includes(d.status)).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Scale size={26} className="text-fire-4" />
        <h2 className="font-orbitron font-black text-2xl text-fire-gradient">DISPUTE RESOLUTION</h2>
        <div className="ml-auto flex gap-3 font-mono text-[10px]">
          <span className="text-yellow-400">{openCount} aperte</span>
          <span className="text-white/30">{disputes.length} totali</span>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-1.5 flex-wrap">
        {['all', 'opened', 'under_review', 'mediating', 'resolved', 'closed'].map(s => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`font-mono text-[9px] tracking-[1px] uppercase px-3 py-1.5 border transition-all ${
              filterStatus === s ? 'border-fire-4/60 bg-fire-3/15 text-fire-5' : 'border-white/8 text-white/30 hover:border-white/20'
            }`}
          >
            {s === 'all' ? 'Tutte' : (STATUS_CONFIG[s]?.label || s)}
            {s !== 'all' && <span className="ml-1">({disputes.filter(d => d.status === s).length})</span>}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <p className="font-mono text-xs text-white/20 text-center py-10">Nessuna disputa</p>
        )}
        {filtered.map(dispute => {
          const sc = STATUS_CONFIG[dispute.status] || { color: '#fff', label: dispute.status };
          const isExpanded = expandedId === dispute.id;
          const form = resolutionForm[dispute.id] || {};
          const isResolved = dispute.status === 'resolved' || dispute.status === 'closed';

          return (
            <motion.div key={dispute.id} layout className="border bg-black/30"
              style={{ borderColor: `${sc.color}25` }}>
              {/* Header */}
              <div
                className="p-4 cursor-pointer flex items-center gap-3 hover:bg-white/2 transition-colors"
                onClick={() => setExpandedId(isExpanded ? null : dispute.id)}
              >
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: sc.color, boxShadow: `0 0 8px ${sc.color}` }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-orbitron text-sm text-fire-5">
                      {dispute.dispute_type === 'marketplace' ? '🛒' : '🤝'} Disputa #{dispute.id.slice(-6)}
                    </span>
                    <span className="font-mono text-[9px] px-2 py-0.5 border" style={{ borderColor: `${sc.color}40`, color: sc.color }}>
                      {sc.label}
                    </span>
                    <span className="font-mono text-[9px] text-white/25">
                      €{dispute.amount_disputed}
                    </span>
                  </div>
                  <div className="font-mono text-[9px] text-white/30 mt-0.5">
                    {dispute.initiator_role} vs {dispute.respondent_role} · {dispute.reason?.replace(/_/g,' ')}
                  </div>
                </div>
                <div className="text-white/30 flex-shrink-0">
                  {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </div>
              </div>

              {/* Detail */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-white/5"
                  >
                    <div className="p-4 space-y-4">
                      {/* Description */}
                      <div>
                        <div className="font-mono text-[9px] uppercase text-white/30 mb-1">Descrizione</div>
                        <p className="font-rajdhani text-sm text-white/60">{dispute.description}</p>
                      </div>

                      {/* Parties */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 border border-yellow-500/15 bg-yellow-500/5">
                          <div className="font-mono text-[9px] text-yellow-400/60 mb-0.5">INIZIATORE</div>
                          <div className="font-orbitron text-xs text-white/80">{dispute.initiator_email}</div>
                          <div className="font-mono text-[9px] text-white/30">{dispute.initiator_role}</div>
                        </div>
                        <div className="p-3 border border-blue-500/15 bg-blue-500/5">
                          <div className="font-mono text-[9px] text-blue-400/60 mb-0.5">RISPONDENTE</div>
                          <div className="font-orbitron text-xs text-white/80">{dispute.respondent_email}</div>
                          <div className="font-mono text-[9px] text-white/30">{dispute.respondent_role}</div>
                        </div>
                      </div>

                      {/* Status change */}
                      {!isResolved && (
                        <div className="flex gap-2 flex-wrap">
                          {['under_review', 'awaiting_evidence', 'mediating'].map(s => (
                            <button key={s}
                              onClick={() => handleStatusChange(dispute, s)}
                              disabled={dispute.status === s || updateMutation.isPending}
                              className="btn-ghost text-[9px] py-1.5 px-3 disabled:opacity-30"
                              style={{ borderColor: `${STATUS_CONFIG[s]?.color}40`, color: STATUS_CONFIG[s]?.color }}
                            >
                              → {STATUS_CONFIG[s]?.label}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Resolution form */}
                      {!isResolved && (
                        <div className="border border-green-500/20 p-4 space-y-3 bg-green-500/5">
                          <div className="font-mono text-[10px] tracking-[2px] uppercase text-green-400/60">RISOLUZIONE FINALE</div>
                          <select
                            className="cyber-input"
                            value={form.resolution || ''}
                            onChange={e => setResolutionForm(prev => ({ ...prev, [dispute.id]: { ...prev[dispute.id], resolution: e.target.value } }))}
                          >
                            <option value="">— Seleziona risoluzione —</option>
                            {RESOLUTIONS.map(r => <option key={r.key} value={r.key}>{r.label}</option>)}
                          </select>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="font-mono text-[9px] text-white/30 block mb-1">Importo risoluzione (€)</label>
                              <input
                                type="number"
                                className="cyber-input"
                                placeholder="0.00"
                                value={form.resolution_amount || ''}
                                onChange={e => setResolutionForm(prev => ({ ...prev, [dispute.id]: { ...prev[dispute.id], resolution_amount: e.target.value } }))}
                              />
                            </div>
                          </div>
                          <textarea
                            className="cyber-input"
                            rows={2}
                            placeholder="Note della decisione..."
                            value={form.notes || ''}
                            onChange={e => setResolutionForm(prev => ({ ...prev, [dispute.id]: { ...prev[dispute.id], notes: e.target.value } }))}
                          />
                          <button
                            onClick={() => handleResolve(dispute)}
                            disabled={updateMutation.isPending || !form.resolution}
                            className="btn-fire text-[10px] py-2 px-5 flex items-center gap-2 disabled:opacity-30"
                          >
                            <Scale size={13} /> Risolvi Disputa
                          </button>
                        </div>
                      )}

                      {/* Resolved info */}
                      {isResolved && (
                        <div className="flex items-center gap-2 p-3 border border-green-500/20 bg-green-500/5">
                          <CheckCircle2 size={14} className="text-green-400" />
                          <div>
                            <div className="font-orbitron text-xs text-green-400">{dispute.resolution?.replace(/_/g,' ')}</div>
                            {dispute.resolution_notes && (
                              <div className="font-mono text-[9px] text-white/40">{dispute.resolution_notes}</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}