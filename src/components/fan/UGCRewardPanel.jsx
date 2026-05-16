import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Camera, Video, FileText, Star, Sparkles, Trophy, ChevronDown, ChevronUp, Check, X } from 'lucide-react';
import { toast } from 'sonner';

const RARITY_CONFIG = {
  rising_star:     { label: 'Rising Star',     color: 'text-slate-400', bg: 'from-slate-600 to-slate-800', border: 'border-slate-500/40', points: 50 },
  breakout_talent: { label: 'Breakout Talent', color: 'text-purple-400', bg: 'from-blue-600 to-purple-700', border: 'border-purple-500/40', points: 150 },
  elite_performer: { label: 'Elite Performer', color: 'text-cyan',       bg: 'from-cyan-500 to-cyan-700',   border: 'border-cyan/40', points: 400 },
  living_legend:   { label: 'Living Legend',   color: 'text-fire-5',     bg: 'from-yellow-500 via-orange-500 to-red-600', border: 'border-fire-3/50', points: 1000 },
};

const UGC_REWARDS = [
  {
    id: 'photo_event',
    type: 'photo',
    icon: Camera,
    title: 'Foto all\'Evento',
    desc: 'Scatta e carica una foto dell\'evento con l\'hashtag ufficiale',
    reward_rarity: 'rising_star',
    color: 'from-slate-700/30 to-slate-900/30',
    border: 'border-slate-500/30',
  },
  {
    id: 'reel_athlete',
    type: 'reel',
    icon: Video,
    title: 'Reel dell\'Atleta',
    desc: 'Crea un reel su TikTok/Instagram taggando l\'atleta e SD',
    reward_rarity: 'breakout_talent',
    color: 'from-purple-900/30 to-blue-900/30',
    border: 'border-purple-500/30',
  },
  {
    id: 'video_trick',
    type: 'video',
    icon: Video,
    title: 'Video Momento Epico',
    desc: 'Cattura un trick o momento spettacolare durante la gara',
    reward_rarity: 'elite_performer',
    color: 'from-cyan-900/30 to-cyan-800/30',
    border: 'border-cyan/30',
  },
  {
    id: 'featured_post',
    type: 'post',
    icon: Star,
    title: 'Post Virale',
    desc: 'Post con +1000 engagement che tagga SD e l\'atleta',
    reward_rarity: 'living_legend',
    color: 'from-fire-3/20 to-fire-4/10',
    border: 'border-fire-3/40',
  },
];

function RewardBadge({ rarity }) {
  const cfg = RARITY_CONFIG[rarity];
  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-1 bg-gradient-to-r ${cfg.bg} border ${cfg.border} clip-btn`}>
      <Sparkles size={10} className={cfg.color} />
      <span className={`font-orbitron text-[8px] tracking-[1px] uppercase ${cfg.color}`}>{cfg.label}</span>
      <span className="font-mono text-[8px] text-white/40">NFT</span>
    </div>
  );
}

export default function UGCRewardPanel({ lang = 'it' }) {
  const queryClient = useQueryClient();
  const [expandedId, setExpandedId] = useState(null);
  const [formData, setFormData] = useState({ title: '', media_url: '', description: '', social_link: '', athlete_name: '' });
  const [submitting, setSubmitting] = useState(null);

  const { data: user } = useQuery({ queryKey: ['current-user'], queryFn: () => base44.auth.me() });

  const { data: mySubmissions = [] } = useQuery({
    queryKey: ['my-ugc', user?.email],
    queryFn: () => base44.entities.UGCSubmission.filter({ creator_email: user.email }),
    enabled: !!user,
    initialData: [],
  });

  const { data: myNFTs = [] } = useQuery({
    queryKey: ['my-nfts', user?.email],
    queryFn: () => base44.entities.NFTOwnership.filter({ buyer_email: user.email }),
    enabled: !!user,
    initialData: [],
  });

  const submitMutation = useMutation({
    mutationFn: async ({ ugcType, rewardRarity }) => {
      if (!user) throw new Error('Not authenticated');
      if (!formData.title || !formData.media_url) throw new Error('Compila tutti i campi');

      const sub = await base44.entities.UGCSubmission.create({
        event_id: 'pending',
        creator_email: user.email,
        creator_name: user.full_name,
        type: ugcType,
        title: formData.title,
        description: formData.description,
        media_url: formData.media_url,
        athlete_name: formData.athlete_name || undefined,
        social_links: formData.social_link ? { url: formData.social_link } : {},
        reward_type: 'nft_card',
        reward_nft_rarity: rewardRarity,
        reward_issued: false,
        submitted_at: new Date().toISOString(),
      });

      // Notify admin
      await base44.entities.Notification.create({
        user_email: user.email,
        type: 'milestone',
        title: '📤 UGC inviato!',
        message: `Il tuo contenuto "${formData.title}" è in revisione. Se approvato riceverai una NFT card ${RARITY_CONFIG[rewardRarity].label}!`,
        related_entity_id: sub.id,
        related_entity_type: 'UGCSubmission',
        is_read: false,
        created_at: new Date().toISOString(),
      });

      return sub;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-ugc'] });
      setExpandedId(null);
      setFormData({ title: '', media_url: '', description: '', social_link: '', athlete_name: '' });
      setSubmitting(null);
      toast.success('Contenuto inviato! Riceverai una NFT card quando approvato 🎴');
    },
    onError: (e) => toast.error(e.message || 'Errore invio'),
  });

  const nftEarned = myNFTs.filter(n => n.purchase_type === 'ugc_reward').length;
  const pendingApproval = mySubmissions.filter(s => !s.approved && !s.reward_issued).length;

  return (
    <section className="section-container">
      <p className="font-mono text-[10px] tracking-[7px] uppercase text-fire-3 text-center mb-2">CREA & GUADAGNA</p>
      <h2 className="heading-fire text-[clamp(32px,6vw,72px)] text-center leading-none mb-3 font-black">
        NFT CREATOR REWARDS
      </h2>
      <p className="text-center font-rajdhani text-lg text-fire-4/70 max-w-2xl mx-auto mb-10">
        Crea contenuti sugli atleti, fatti approvare e ottieni <span className="text-fire-5 font-bold">NFT card esclusive</span> direttamente nel tuo wallet.
      </p>

      {/* Stats bar */}
      {user && (
        <div className="max-w-2xl mx-auto grid grid-cols-3 gap-3 mb-10">
          {[
            { label: 'NFT Guadagnate', value: nftEarned, color: 'text-fire-5' },
            { label: 'In revisione', value: pendingApproval, color: 'text-fire-3' },
            { label: 'Approvati', value: mySubmissions.filter(s => s.approved).length, color: 'text-cyan' },
          ].map(s => (
            <div key={s.label} className="border border-fire-3/20 bg-fire-3/5 p-3 text-center">
              <div className={`font-orbitron text-2xl font-black ${s.color}`}>{s.value}</div>
              <div className="font-mono text-[9px] tracking-[1px] uppercase text-fire-3/40 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* UGC Mission cards */}
      <div className="max-w-3xl mx-auto space-y-3">
        {UGC_REWARDS.map((mission, i) => {
          const Icon = mission.icon;
          const rCfg = RARITY_CONFIG[mission.reward_rarity];
          const alreadySubmitted = mySubmissions.some(s => s.type === mission.type && !s.reward_issued);
          const isOpen = expandedId === mission.id;

          return (
            <motion.div
              key={mission.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`border ${mission.border} bg-gradient-to-r ${mission.color} overflow-hidden`}
            >
              {/* Header row */}
              <button
                onClick={() => setExpandedId(isOpen ? null : mission.id)}
                className="w-full flex items-center gap-4 p-4 text-left hover:bg-white/5 transition-colors"
              >
                <div className={`w-10 h-10 flex items-center justify-center border ${mission.border} flex-shrink-0`}>
                  <Icon size={18} className={rCfg.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-orbitron font-bold text-sm text-fire-5 mb-1">{mission.title}</div>
                  <div className="font-rajdhani text-xs text-fire-4/60 leading-snug">{mission.desc}</div>
                </div>
                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  <RewardBadge rarity={mission.reward_rarity} />
                  {alreadySubmitted && (
                    <span className="font-mono text-[8px] text-fire-3/50 tracking-[1px]">IN REVISIONE</span>
                  )}
                </div>
                {isOpen ? <ChevronUp size={14} className="text-fire-3/40 flex-shrink-0" /> : <ChevronDown size={14} className="text-fire-3/40 flex-shrink-0" />}
              </button>

              {/* Expanded form */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-5 space-y-3 border-t border-white/5 pt-4">
                      {/* Reward preview */}
                      <div className={`flex items-center gap-3 p-3 bg-gradient-to-r ${rCfg.bg} bg-opacity-10 border ${rCfg.border}`}>
                        <Trophy size={20} className={rCfg.color} />
                        <div>
                          <div className={`font-orbitron text-xs font-bold ${rCfg.color}`}>Reward: {rCfg.label} NFT Card</div>
                          <div className="font-mono text-[9px] text-white/40">Inviata dopo approvazione admin · solo {RARITY_CONFIG[mission.reward_rarity].points} slot disponibili/stagione</div>
                        </div>
                      </div>

                      {!user ? (
                        <p className="font-mono text-xs text-fire-3/40 text-center py-2">Accedi per partecipare</p>
                      ) : (
                        <div className="space-y-2">
                          <input
                            className="cyber-input text-sm"
                            placeholder="Titolo del contenuto *"
                            value={formData.title}
                            onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
                          />
                          <input
                            className="cyber-input text-sm"
                            placeholder="URL media (link Insta/TikTok/Drive) *"
                            value={formData.media_url}
                            onChange={e => setFormData(p => ({ ...p, media_url: e.target.value }))}
                          />
                          <input
                            className="cyber-input text-sm"
                            placeholder="Nome atleta taggato (opzionale)"
                            value={formData.athlete_name}
                            onChange={e => setFormData(p => ({ ...p, athlete_name: e.target.value }))}
                          />
                          <textarea
                            className="cyber-input text-sm resize-none h-16"
                            placeholder="Descrizione breve..."
                            value={formData.description}
                            onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                          />
                          <div className="flex gap-2 pt-1">
                            <button
                              onClick={() => { setSubmitting(mission.id); submitMutation.mutate({ ugcType: mission.type, rewardRarity: mission.reward_rarity }); }}
                              disabled={submitMutation.isPending || alreadySubmitted}
                              className="btn-fire flex-1 text-xs flex items-center justify-center gap-1"
                            >
                              <Upload size={12} />
                              {alreadySubmitted ? 'Già inviato' : submitMutation.isPending && submitting === mission.id ? 'Invio...' : 'Invia per approvazione'}
                            </button>
                            <button onClick={() => setExpandedId(null)} className="btn-ghost px-3 text-xs">
                              <X size={14} />
                            </button>
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

      {/* My earned NFTs from UGC */}
      {nftEarned > 0 && (
        <div className="max-w-3xl mx-auto mt-12">
          <h3 className="font-orbitron font-bold text-xl text-fire-5 mb-4 flex items-center gap-2">
            <Sparkles size={20} className="text-fire-3" /> NFT Guadagnate via UGC
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {myNFTs.filter(n => n.purchase_type === 'ugc_reward').map(nft => {
              const rc = RARITY_CONFIG[nft.rarity] || RARITY_CONFIG.rising_star;
              return (
                <div key={nft.id} className={`bg-gradient-to-br ${rc.bg} p-[1px] clip-cyber`}>
                  <div className="bg-[rgba(4,2,10,0.96)] p-3 clip-cyber text-center h-full">
                    <div className="font-mono text-[8px] text-fire-3/40 mb-1">#{nft.serial_number}</div>
                    <div className="font-orbitron text-xs font-bold text-fire-5 mb-1">{nft.athlete_name}</div>
                    <div className={`font-mono text-[8px] uppercase tracking-[1px] ${rc.color}`}>{rc.label}</div>
                    <div className="font-mono text-[7px] text-white/20 mt-1">via UGC ✓</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}