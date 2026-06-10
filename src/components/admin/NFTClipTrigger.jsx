/**
 * NFTClipTrigger — Admin panel to:
 * 2. Manually trigger NFT Clip snapshot for a completed tournament
 * 2b. Check distribution status of clips per tournament
 */
import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Play, CheckCircle2, Clock, AlertTriangle, RefreshCw, ImagePlay } from 'lucide-react';
import { toast } from 'sonner';

export default function NFTClipTrigger() {
  const queryClient = useQueryClient();
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);

  const { data: tournaments = [] } = useQuery({
    queryKey: ['admin-tournaments-clip'],
    queryFn: () => base44.entities.Tournament.list('-created_date', 100),
    initialData: [],
  });

  const { data: events = [] } = useQuery({
    queryKey: ['admin-events-clip'],
    queryFn: () => base44.entities.Event.list('-created_date', 200),
    initialData: [],
  });

  const { data: snapshots = [] } = useQuery({
    queryKey: ['tournament-snapshots'],
    queryFn: () => base44.entities.TournamentSnapshot.list('-snapshot_date', 50),
    initialData: [],
  });

  const { data: clips = [] } = useQuery({
    queryKey: ['all-nft-clips-admin'],
    queryFn: () => base44.entities.NFTClip.list('-created_at', 200),
    initialData: [],
  });

  const getEventTitle = (eventId) => events.find(e => e.id === eventId)?.title || eventId;

  const handleExecuteSnapshot = async (tournament) => {
    if (!confirm(`Eseguire snapshot NFT Clip per questo torneo? Tutti i detentori di card riceveranno il loro Clip.`)) return;
    setIsExecuting(true);
    try {
      await base44.functions.invoke('executeTournamentSnapshot', { tournamentId: tournament.id });
      queryClient.invalidateQueries({ queryKey: ['admin-tournaments-clip'] });
      queryClient.invalidateQueries({ queryKey: ['tournament-snapshots'] });
      queryClient.invalidateQueries({ queryKey: ['all-nft-clips-admin'] });
      toast.success('✅ Snapshot eseguito! NFT Clips in distribuzione...');
    } catch (e) {
      toast.error('Errore snapshot: ' + e.message);
    } finally {
      setIsExecuting(false);
    }
  };

  const getSnapshotForTournament = (tId) => snapshots.find(s => s.tournament_id === tId);
  const getClipsForTournament = (tId) => clips.filter(c => c.tournament_id === tId);

  const completedTournaments = tournaments.filter(t => t.status === 'completed');
  const pendingSnapshot = completedTournaments.filter(t => !t.snapshot_completed);
  const doneSnapshot = completedTournaments.filter(t => t.snapshot_completed);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ImagePlay size={26} className="text-purple-400" />
        <h2 className="font-orbitron font-black text-2xl" style={{ background: 'linear-gradient(135deg,#a855f7,#00ffee)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
          NFT CLIP TRIGGER
        </h2>
        <div className="ml-auto flex gap-3 font-mono text-[10px]">
          <span className="text-yellow-400">{pendingSnapshot.length} in attesa</span>
          <span className="text-green-400">{doneSnapshot.length} completati</span>
        </div>
      </div>

      {/* Pending snapshot */}
      <div>
        <div className="font-mono text-[10px] tracking-[3px] uppercase text-yellow-400/60 mb-3">⚠ SNAPSHOT DA ESEGUIRE</div>
        {pendingSnapshot.length === 0 ? (
          <p className="font-mono text-xs text-white/20 text-center py-6 border border-white/5">
            Nessun torneo completato in attesa di snapshot
          </p>
        ) : (
          <div className="space-y-3">
            {pendingSnapshot.map(t => (
              <div key={t.id} className="p-4 border border-yellow-500/25 bg-yellow-500/5 flex items-center justify-between gap-4"
                style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))' }}>
                <div>
                  <div className="font-orbitron text-sm text-fire-5">{getEventTitle(t.event_id)}</div>
                  <div className="font-mono text-[10px] text-white/30">
                    Formato: {t.format} · Round: {t.current_round}/{t.total_rounds}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Clock size={10} className="text-yellow-400" />
                    <span className="font-mono text-[9px] text-yellow-400">Snapshot non ancora eseguito</span>
                  </div>
                </div>
                <button
                  onClick={() => handleExecuteSnapshot(t)}
                  disabled={isExecuting}
                  className="btn-fire text-[10px] py-2 px-5 flex items-center gap-1.5 flex-shrink-0 disabled:opacity-40"
                >
                  {isExecuting ? <RefreshCw size={12} className="animate-spin" /> : <Play size={12} />}
                  Esegui Snapshot
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Done snapshots with clip stats */}
      {doneSnapshot.length > 0 && (
        <div>
          <div className="font-mono text-[10px] tracking-[3px] uppercase text-green-400/60 mb-3">✓ SNAPSHOT COMPLETATI</div>
          <div className="space-y-2">
            {doneSnapshot.map(t => {
              const snap = getSnapshotForTournament(t.id);
              const tClips = getClipsForTournament(t.id);
              return (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-4 border border-green-500/15 bg-green-500/5 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2 size={16} className="text-green-400 flex-shrink-0" />
                    <div>
                      <div className="font-orbitron text-sm text-fire-5">{getEventTitle(t.event_id)}</div>
                      <div className="font-mono text-[9px] text-white/30">
                        {snap?.snapshot_date ? new Date(snap.snapshot_date).toLocaleDateString('it') : '—'}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-4 font-mono text-[10px]">
                    <div className="text-right">
                      <div className="text-purple-400 font-bold">{tClips.length}</div>
                      <div className="text-white/25">clip dist.</div>
                    </div>
                    {snap && (
                      <div className="text-right">
                        <div className="text-cyan font-bold">{snap.total_cardholders || 0}</div>
                        <div className="text-white/25">cardholders</div>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Clip Totali', value: clips.length, color: '#a855f7' },
          { label: 'Tornei Completati', value: completedTournaments.length, color: '#00ffee' },
          { label: 'In Attesa', value: pendingSnapshot.length, color: '#fbbf24' },
        ].map(s => (
          <div key={s.label} className="border border-white/6 bg-black/40 p-3 text-center"
            style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))' }}>
            <div className="font-orbitron font-black text-2xl" style={{ color: s.color }}>{s.value}</div>
            <div className="font-mono text-[9px] text-white/30">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}