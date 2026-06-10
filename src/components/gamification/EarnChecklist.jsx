import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ChevronDown, ChevronUp, Zap, Star } from 'lucide-react';

/**
 * Scaletta unificata di tutte le azioni che guadagnano XP e/o Street Cred.
 * Mostra ON = completata / OFF = da fare, con i punti di entrambe le valute.
 */

const ACTIONS = [
  // ── SOCIAL ──
  {
    id: 'follow_instagram',
    category: 'Social',
    label: 'Segui su Instagram',
    desc: 'Segui @streetdinamics su Instagram',
    xp: 0,
    sc: 100,
    check: (cred) => !!cred?.actions?.instagram,
  },
  {
    id: 'follow_tiktok',
    category: 'Social',
    label: 'Segui su TikTok',
    desc: 'Segui @streetdinamics su TikTok',
    xp: 0,
    sc: 100,
    check: (cred) => !!cred?.actions?.tiktok,
  },
  {
    id: 'follow_youtube',
    category: 'Social',
    label: 'Iscriviti su YouTube',
    desc: 'Iscriviti al canale YouTube di SD',
    xp: 0,
    sc: 80,
    check: (cred) => !!cred?.actions?.youtube,
  },
  {
    id: 'follow_kick',
    category: 'Social',
    label: 'Segui su Kick',
    desc: 'Segui il canale live Kick di SD',
    xp: 0,
    sc: 80,
    check: (cred) => !!cred?.actions?.kick,
  },
  {
    id: 'follow_snapchat',
    category: 'Social',
    label: 'Aggiungi su Snapchat',
    desc: 'Aggiungi SD su Snapchat',
    xp: 0,
    sc: 60,
    check: (cred) => !!cred?.actions?.snapchat,
  },
  // ── COMMUNITY ──
  {
    id: 'share_event',
    category: 'Community',
    label: 'Condividi un evento',
    desc: '+50 SC per ogni condivisione (ripetibile)',
    xp: 50,
    sc: 50,
    repeatable: true,
    check: (cred) => (cred?.actions?.share_event || 0) > 0,
    count: (cred) => cred?.actions?.share_event || 0,
  },
  {
    id: 'referral',
    category: 'Community',
    label: 'Porta un amico all\'evento',
    desc: '+200 SC quando il tuo referral partecipa',
    xp: 200,
    sc: 200,
    repeatable: true,
    check: (cred) => (cred?.actions?.referrals || 0) > 0,
    count: (cred) => cred?.actions?.referrals || 0,
  },
  // ── EVENTI ──
  {
    id: 'attend_event',
    category: 'Evento',
    label: 'Partecipa a un evento',
    desc: '+150 SC + XP per ogni check-in validato',
    xp: 300,
    sc: 150,
    repeatable: true,
    check: (cred) => (cred?.actions?.attended_events || 0) > 0,
    count: (cred) => cred?.actions?.attended_events || 0,
  },
  // ── CONTENUTI ──
  {
    id: 'ugc_submit',
    category: 'Contenuti',
    label: 'Invia un contenuto UGC',
    desc: 'Carica foto/video di un evento SD (approvazione admin)',
    xp: 500,
    sc: 0,
    check: (_cred, ugcCount) => ugcCount > 0,
    count: (_cred, ugcCount) => ugcCount,
  },
  {
    id: 'ugc_featured',
    category: 'Contenuti',
    label: 'Contenuto in evidenza',
    desc: 'Il tuo UGC viene selezionato dalla redazione',
    xp: 1000,
    sc: 0,
    check: (_cred, _ugcCount, featuredCount) => featuredCount > 0,
    count: (_cred, _ugcCount, featuredCount) => featuredCount,
  },
  // ── ASSET ──
  {
    id: 'own_token',
    category: 'Asset',
    label: 'Possiedi un Athlete Token',
    desc: 'Acquista il token di un atleta SD',
    xp: 500,
    sc: 0,
    check: (_cred, _u, _f, tokenCount) => tokenCount > 0,
    count: (_cred, _u, _f, tokenCount) => tokenCount,
  },
  {
    id: 'own_nft',
    category: 'Asset',
    label: 'Possiedi un NFT Clip',
    desc: 'Ricevi o acquista un NFT Snapshot',
    xp: 300,
    sc: 0,
    check: (_cred, _u, _f, _t, nftCount) => nftCount > 0,
    count: (_cred, _u, _f, _t, nftCount) => nftCount,
  },
  // ── WAGERING ──
  {
    id: 'first_bet',
    category: 'Wagering',
    label: 'Piazza la prima scommessa',
    desc: 'Partecipa al sistema di fan challenge',
    xp: 200,
    sc: 0,
    check: (_cred, _u, _f, _t, _n, betCount) => betCount > 0,
    count: (_cred, _u, _f, _t, _n, betCount) => betCount,
  },
];

const CATEGORIES = ['Social', 'Community', 'Evento', 'Contenuti', 'Asset', 'Wagering'];

const CAT_COLORS = {
  Social:    'text-pink-400 border-pink-400/30',
  Community: 'text-purple-400 border-purple-400/30',
  Evento:    'text-fire-3 border-fire-3/30',
  Contenuti: 'text-cyan border-cyan/30',
  Asset:     'text-yellow-400 border-yellow-400/30',
  Wagering:  'text-blue-400 border-blue-400/30',
};

export default function EarnChecklist({ compact = false }) {
  const [openCats, setOpenCats] = useState(new Set(CATEGORIES));

  const { data: user } = useQuery({ queryKey: ['current-user'], queryFn: () => base44.auth.me() });

  const { data: cred } = useQuery({
    queryKey: ['street-cred', user?.email],
    queryFn: () => base44.entities.StreetCred.filter({ user_email: user.email }).then(r => r[0] || null),
    enabled: !!user?.email,
  });

  const { data: ugcItems = [] } = useQuery({
    queryKey: ['ugc-user', user?.email],
    queryFn: () => base44.entities.UGCSubmission.filter({ creator_email: user.email }),
    enabled: !!user?.email,
    initialData: [],
  });

  const { data: tokens = [] } = useQuery({
    queryKey: ['tokens-user', user?.email],
    queryFn: () => base44.entities.TokenOwnership.filter({ created_by: user?.email }),
    enabled: !!user?.email,
    initialData: [],
  });

  const { data: nfts = [] } = useQuery({
    queryKey: ['nfts-user', user?.email],
    queryFn: () => base44.entities.NFTOwnership.filter({ created_by: user?.email }),
    enabled: !!user?.email,
    initialData: [],
  });

  const { data: bets = [] } = useQuery({
    queryKey: ['bets-user', user?.email],
    queryFn: () => base44.entities.Bet.filter({ user_email: user?.email }).catch(() => []),
    enabled: !!user?.email,
    initialData: [],
  });

  const ugcCount = ugcItems.length;
  const featuredCount = ugcItems.filter(u => u.featured).length;
  const tokenCount = tokens.length;
  const nftCount = nfts.length;
  const betCount = bets.length;

  const checkAction = (action) =>
    action.check(cred, ugcCount, featuredCount, tokenCount, nftCount, betCount);
  const countAction = (action) =>
    action.count ? action.count(cred, ugcCount, featuredCount, tokenCount, nftCount, betCount) : null;

  const toggleCat = (cat) => {
    setOpenCats(prev => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  };

  const totalXP = ACTIONS.filter(a => checkAction(a)).reduce((s, a) => s + a.xp, 0);
  const totalSC = ACTIONS.filter(a => checkAction(a)).reduce((s, a) => s + a.sc, 0);
  const done = ACTIONS.filter(a => checkAction(a)).length;

  return (
    <div className="w-full">
      {/* Header summary */}
      {!compact && (
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="flex items-center gap-2 px-4 py-2 border border-fire-3/25 bg-fire-3/5">
            <Zap size={14} className="text-fire-4" />
            <div>
              <div className="font-mono text-[8px] uppercase tracking-[2px] text-fire-3/50">XP guadagnati</div>
              <div className="font-orbitron font-black text-fire-5 text-sm">{totalXP.toLocaleString()}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 border border-purple-400/25 bg-purple-400/5">
            <Star size={14} className="text-purple-400" />
            <div>
              <div className="font-mono text-[8px] uppercase tracking-[2px] text-purple-400/50">Street Cred</div>
              <div className="font-orbitron font-black text-purple-400 text-sm">{totalSC.toLocaleString()}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 border border-white/8 bg-white/[0.02]">
            <div>
              <div className="font-mono text-[8px] uppercase tracking-[2px] text-white/30">Completate</div>
              <div className="font-orbitron font-black text-white/60 text-sm">{done}/{ACTIONS.length}</div>
            </div>
          </div>
        </div>
      )}

      {/* Checklist by category */}
      <div className="space-y-3">
        {CATEGORIES.map(cat => {
          const catActions = ACTIONS.filter(a => a.category === cat);
          const catDone = catActions.filter(a => checkAction(a)).length;
          const isOpen = openCats.has(cat);
          const [colorClass, borderClass] = CAT_COLORS[cat].split(' ');

          return (
            <div key={cat} className={`border ${borderClass} bg-black/30`}
              style={{ clipPath: 'polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,10px 100%,0 calc(100% - 10px))' }}>
              {/* Category header */}
              <button
                onClick={() => toggleCat(cat)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className={`font-orbitron text-[10px] font-bold uppercase tracking-[2px] ${colorClass}`}>{cat}</span>
                  <span className="font-mono text-[8px] text-white/25">{catDone}/{catActions.length}</span>
                </div>
                <div className="flex items-center gap-2">
                  {/* Mini progress */}
                  <div className="w-20 h-1 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${colorClass.replace('text-', 'bg-')}`}
                      style={{ width: `${catActions.length ? (catDone / catActions.length) * 100 : 0}%` }}
                    />
                  </div>
                  {isOpen ? <ChevronUp size={12} className="text-white/25" /> : <ChevronDown size={12} className="text-white/25" />}
                </div>
              </button>

              {/* Actions list */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-white/5 divide-y divide-white/[0.04]">
                      {catActions.map(action => {
                        const done = checkAction(action);
                        const cnt = countAction(action);

                        return (
                          <div
                            key={action.id}
                            className={`flex items-center gap-3 px-4 py-3 transition-all ${
                              done ? 'bg-white/[0.025]' : 'opacity-60 hover:opacity-80'
                            }`}
                          >
                            {/* Toggle indicator */}
                            <div className={`w-8 h-5 rounded-full border flex items-center transition-all duration-300 flex-shrink-0 ${
                              done
                                ? `bg-green-500/30 border-green-500/60 justify-end pr-0.5`
                                : 'bg-white/5 border-white/15 justify-start pl-0.5'
                            }`}>
                              <div className={`w-4 h-4 rounded-full transition-all duration-300 ${
                                done ? 'bg-green-400' : 'bg-white/20'
                              }`} />
                            </div>

                            {/* Label */}
                            <div className="flex-1 min-w-0">
                              <div className={`font-orbitron text-[10px] font-bold truncate ${done ? 'text-white/80' : 'text-white/40'}`}>
                                {action.label}
                                {action.repeatable && cnt > 0 && (
                                  <span className={`ml-2 font-mono text-[8px] ${colorClass}`}>×{cnt}</span>
                                )}
                              </div>
                              <div className="font-mono text-[8px] text-white/20 mt-0.5 truncate">{action.desc}</div>
                            </div>

                            {/* Rewards */}
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {action.xp > 0 && (
                                <div className={`flex items-center gap-1 font-mono text-[8px] ${done ? 'text-fire-4' : 'text-white/20'}`}>
                                  <Zap size={9} />
                                  +{action.xp}
                                </div>
                              )}
                              {action.sc > 0 && (
                                <div className={`flex items-center gap-1 font-mono text-[8px] ${done ? 'text-purple-400' : 'text-white/20'}`}>
                                  <Star size={9} />
                                  +{action.sc}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-1.5 font-mono text-[8px] text-white/20">
          <Zap size={9} className="text-fire-3/40" /> XP = progressione tier
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[8px] text-white/20">
          <Star size={9} className="text-purple-400/40" /> SC = Street Cred (perk evento)
        </div>
      </div>
    </div>
  );
}