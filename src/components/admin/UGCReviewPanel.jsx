import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Eye, Sparkles, Video, Camera, FileText } from 'lucide-react';
import { toast } from 'sonner';

const RARITY_CONFIG = {
  rising_star:     { label: 'Rising Star',     color: 'text-slate-400',  border: 'border-slate-500/40' },
  breakout_talent: { label: 'Breakout Talent', color: 'text-purple-400', border: 'border-purple-500/40' },
  elite_performer: { label: 'Elite Performer', color: 'text-cyan',       border: 'border-cyan/40' },
  living_legend:   { label: 'Living Legend',   color: 'text-fire-5',     border: 'border-fire-3/50' },
};

const TYPE_ICONS = { video: Video, reel: Video, photo: Camera, post: FileText, story: Camera };

export default function UGCReviewPanel() {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState(null);
  const [notes, setNotes] = useState('');

  const { data: submissions = [] } = useQuery({
    queryKey: ['ugc-submissions-admin'],
    queryFn: () => base44.entities.UGCSubmission.list('-submitted_at', 100),
    refetchInterval: 30000,
    initialData: [],
  });

  const approveMutation = useMutation({
    mutationFn: async ({ id, approve }) => {
      await base44.entities.UGCSubmission.update(id, {
        approved: approve,
        // reward_issued will be set by the automation after approved=true
      });
    },
    onSuccess: (_, { approve }) => {
      queryClient.invalidateQueries({ queryKey: ['ugc-submissions-admin'] });
      setSelected(null);
      setNotes('');
      toast.success(approve ? '✅ Approvato! NFT reward in emissione automatica...' : '❌ Rifiutato');
    },
    onError: () => toast.error('Errore durante la revisione'),
  });

  const pending = submissions.filter(s => !s.approved && !s.reward_issued);
  const approved = submissions.filter(s => s.approved);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-orbitron font-bold text-2xl text-fire-4">UGC REVIEW</h2>
        <div className="flex gap-4 font-mono text-xs">
          <span className="text-yellow-400">{pending.length} in attesa</span>
          <span className="text-green-400">{approved.length} approvati</span>
        </div>
      </div>

      {/* Pending list */}
      <div className="space-y-3">
        {pending.length === 0 && (
          <p className="text-center font-mono text-xs text-fire-3/30 py-10">Nessuna submission in attesa</p>
        )}
        {pending.map((sub, i) => {
          const Icon = TYPE_ICONS[sub.type] || FileText;
          const rc = RARITY_CONFIG[sub.reward_nft_rarity];
          return (
            <motion.div
              key={sub.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-fire-3/5 border border-fire-3/20 p-4 clip-cyber"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 border border-fire-3/20 flex items-center justify-center flex-shrink-0">
                  <Icon size={14} className="text-fire-3/60" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <div className="font-orbitron text-sm text-fire-5">{sub.title}</div>
                      <div className="font-mono text-[9px] text-fire-3/40 mt-0.5">
                        {sub.creator_name} · {sub.type} · {sub.athlete_name ? `@${sub.athlete_name}` : 'no athlete'}
                      </div>
                    </div>
                    {rc && (
                      <div className={`font-mono text-[8px] tracking-[1px] uppercase px-2 py-0.5 border ${rc.border} ${rc.color} flex-shrink-0`}>
                        🎴 {rc.label}
                      </div>
                    )}
                  </div>
                  {sub.description && (
                    <p className="font-rajdhani text-xs text-fire-4/60 mt-1 line-clamp-2">{sub.description}</p>
                  )}
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {sub.media_url && (
                      <a href={sub.media_url} target="_blank" rel="noopener noreferrer"
                        className="font-mono text-[9px] text-cyan hover:text-cyan/80 underline">
                        Vedi media →
                      </a>
                    )}
                    {sub.social_links?.url && (
                      <a href={sub.social_links.url} target="_blank" rel="noopener noreferrer"
                        className="font-mono text-[9px] text-purple-400 hover:text-purple-300 underline">
                        Post social →
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button
                    onClick={() => approveMutation.mutate({ id: sub.id, approve: true })}
                    disabled={approveMutation.isPending}
                    className="p-2 border border-green-500/30 bg-green-500/10 hover:bg-green-500/20 transition-colors"
                    title="Approva e assegna NFT"
                  >
                    <CheckCircle size={14} className="text-green-400" />
                  </button>
                  <button
                    onClick={() => approveMutation.mutate({ id: sub.id, approve: false })}
                    disabled={approveMutation.isPending}
                    className="p-2 border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 transition-colors"
                    title="Rifiuta"
                  >
                    <XCircle size={14} className="text-red-400" />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Recently approved */}
      {approved.length > 0 && (
        <div>
          <div className="font-mono text-[9px] tracking-[2px] uppercase text-green-400/50 mb-3">APPROVATI RECENTI</div>
          <div className="space-y-2">
            {approved.slice(0, 5).map(sub => {
              const rc = RARITY_CONFIG[sub.reward_nft_rarity];
              return (
                <div key={sub.id} className="flex items-center gap-3 p-3 border border-green-500/10 bg-green-500/5">
                  <div className="flex-1 min-w-0">
                    <div className="font-orbitron text-xs text-fire-5">{sub.title}</div>
                    <div className="font-mono text-[8px] text-fire-3/30">{sub.creator_name}</div>
                  </div>
                  {rc && <div className={`font-mono text-[8px] uppercase ${rc.color}`}>{rc.label}</div>}
                  <div className="font-mono text-[8px] text-green-400">
                    {sub.reward_issued ? '✓ NFT emessa' : '⏳ emissione...'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}