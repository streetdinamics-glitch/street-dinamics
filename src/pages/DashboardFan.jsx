import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import CyberOverlays from '../components/cyber/CyberOverlays';
import Navbar from '../components/cyber/Navbar';
import Footer from '../components/cyber/Footer';
import FireRule from '../components/cyber/FireRule';
import { useLang } from '../components/useLang';
import { useTranslation } from '../components/translations';
import LiveTournamentLeaderboard from '../components/gamification/LiveTournamentLeaderboard';
import FanNFTCollection from '../components/fan/FanNFTCollection';
import UGCRewardPanel from '../components/fan/UGCRewardPanel';
import LiveMarketsFeed from '../components/prediction/LiveMarketsFeed';
import {
  Flame, Star, Zap, TrendingUp, Trophy, Crown,
  Ticket, Vote, CreditCard, ChevronRight, LayoutDashboard,
  Gem, BarChart2, ShoppingBag, User, Swords, ExternalLink
} from 'lucide-react';

// Level config for Street Cred display
const LEVEL_CONFIG = {
  newcomer:      { name: 'Newcomer',      icon: Star,        color: '#94a3b8', next: 500 },
  follower:      { name: 'Follower',       icon: Zap,         color: '#a855f7', next: 2000 },
  hype_beast:    { name: 'Hype Beast',     icon: TrendingUp,  color: '#00ffee', next: 5000 },
  street_legend: { name: 'Street Legend', icon: Trophy,      color: '#ff6600', next: 15000 },
  sd_icon:       { name: 'SD Icon',        icon: Crown,       color: '#fbbf24', next: null },
};

const NAV_ITEMS = [
  { key: 'overview',   label: 'Overview',      icon: LayoutDashboard },
  { key: 'events',     label: 'Miei eventi',   icon: Ticket },
  { key: 'collection', label: 'Collezione',    icon: Gem },
  { key: 'markets',    label: 'Mercati',       icon: BarChart2 },
  { key: 'ugc',        label: 'UGC Rewards',   icon: ShoppingBag },
];

function SCLevelBadge({ level, points, progress }) {
  const cfg = LEVEL_CONFIG[level] || LEVEL_CONFIG.newcomer;
  const Icon = cfg.icon;
  return (
    <div className="relative overflow-hidden p-4 border"
      style={{ borderColor: `${cfg.color}44`, background: `linear-gradient(135deg, ${cfg.color}12, transparent)` }}>
      <div className="absolute top-0 left-0 right-0 h-[1px]"
        style={{ background: `linear-gradient(90deg, transparent, ${cfg.color}, transparent)` }} />
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: `${cfg.color}22`, border: `2px solid ${cfg.color}66`, boxShadow: `0 0 16px ${cfg.color}44` }}>
          <Icon size={18} style={{ color: cfg.color }} />
        </div>
        <div>
          <div className="font-mono text-[9px] text-white/30 tracking-[2px] uppercase">Street Cred</div>
          <div className="font-orbitron font-bold text-base" style={{ color: cfg.color }}>{cfg.name}</div>
        </div>
        <div className="ml-auto text-right">
          <div className="font-orbitron font-black text-lg" style={{ color: cfg.color }}>{points.toLocaleString()}</div>
          <div className="font-mono text-[9px] text-white/30">SC totali</div>
        </div>
      </div>
      <div className="h-1.5 bg-white/5 overflow-hidden mb-1">
        <motion.div className="h-full"
          initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 1.2, delay: 0.3 }}
          style={{ background: `linear-gradient(90deg, ${cfg.color}88, ${cfg.color})` }} />
      </div>
      <div className="flex justify-between font-mono text-[9px] text-white/25">
        <span>{progress}% verso il prossimo livello</span>
        <Link to="/street-cred" className="hover:text-white/60 transition-colors flex items-center gap-1">
          Guida <ExternalLink size={9} />
        </Link>
      </div>
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, sub, color = '#ff6600' }) {
  return (
    <div className="border border-white/6 bg-black/40 p-4 relative overflow-hidden group hover:border-white/15 transition-all"
      style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))' }}>
      <div className="absolute bottom-0 right-0 w-16 h-16 rounded-full opacity-10 blur-xl transition-opacity group-hover:opacity-20"
        style={{ background: color }} />
      <Icon size={18} className="mb-2" style={{ color }} />
      <div className="font-orbitron font-black text-2xl mb-0.5" style={{ color }}>{value}</div>
      <div className="font-rajdhani text-sm text-white/50">{label}</div>
      {sub && <div className="font-mono text-[9px] text-white/25 mt-1">{sub}</div>}
    </div>
  );
}

function QuickAction({ to, icon: Icon, label, color }) {
  return (
    <Link to={to} className="flex items-center gap-2.5 p-3 border border-white/6 bg-black/30 hover:border-white/20 hover:bg-white/3 transition-all group"
      style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))' }}>
      <div className="w-7 h-7 flex items-center justify-center flex-shrink-0 rounded"
        style={{ background: `${color}18`, border: `1px solid ${color}44` }}>
        <Icon size={13} style={{ color }} />
      </div>
      <span className="font-orbitron text-[11px]" style={{ color }}>{label}</span>
      <ChevronRight size={12} className="ml-auto text-white/20 group-hover:text-white/50 transition-colors" />
    </Link>
  );
}

export default function DashboardFan() {
  const [lang, setLang] = useLang();
  const t = useTranslation(lang);
  const [activeSection, setActiveSection] = useState('overview');

  const { data: user } = useQuery({ queryKey: ['current-user'], queryFn: () => base44.auth.me() });

  const { data: registrations = [] } = useQuery({
    queryKey: ['fan-registrations', user?.email],
    queryFn: () => base44.entities.Registration.filter({ email: user.email }),
    enabled: !!user, initialData: [],
  });
  const { data: streetCredList = [] } = useQuery({
    queryKey: ['street-cred-dash', user?.email],
    queryFn: () => base44.entities.StreetCred.filter({ user_email: user.email }),
    enabled: !!user, initialData: [],
  });
  const { data: votes = [] } = useQuery({
    queryKey: ['fan-votes', user?.email],
    queryFn: () => base44.entities.UserVote.filter({ user_email: user.email }),
    enabled: !!user, initialData: [],
  });
  const { data: tokens = [] } = useQuery({
    queryKey: ['fan-tokens', user?.email],
    queryFn: () => base44.entities.NFTOwnership.filter({ buyer_email: user?.email }),
    enabled: !!user, initialData: [],
  });

  const sc = streetCredList[0];
  const totalSC = sc?.total_points || 0;
  const currentTier = sc?.level || 'newcomer';
  const scProgress = sc?.next_level_progress || 0;

  return (
    <div className="relative min-h-screen bg-cyber-void text-[var(--text-main)]">
      <CyberOverlays />
      <Navbar onScrollTo={() => {}} lang={lang} onLangSwitch={setLang} onProfileClick={() => {}} />

      <div className="pt-[80px]">
        {/* Hero strip */}
        <div className="relative border-b border-fire-3/10 bg-gradient-to-r from-black via-fire-3/5 to-black px-6 py-6">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="font-mono text-[9px] tracking-[6px] uppercase text-fire-3/40 mb-1">// FAN DASHBOARD //</p>
              <h1 className="font-orbitron font-black text-[clamp(24px,4vw,42px)] leading-none mb-1">
                <span className="heading-fire">Benvenuto</span>
                <span className="text-white/70 ml-3 text-[70%]">{user?.full_name || 'Fan'}</span>
              </h1>
              <p className="font-rajdhani text-sm text-white/35">La tua reputazione nella scena street sports</p>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/UserProfile" className="btn-ghost text-[10px] py-2 px-5 flex items-center gap-2">
                <User size={13} /> Profilo
              </Link>
              <Link to="/Home" className="btn-fire text-[10px] py-2 px-5 flex items-center gap-2">
                <Swords size={13} /> Prossimi eventi
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex gap-6">

          {/* ── SIDEBAR ── */}
          <aside className="hidden lg:flex flex-col gap-3 w-52 flex-shrink-0">
            {/* Nav */}
            <nav className="space-y-1">
              {NAV_ITEMS.map(item => {
                const Icon = item.icon;
                const active = activeSection === item.key;
                return (
                  <button key={item.key} onClick={() => setActiveSection(item.key)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 font-mono text-[11px] tracking-[1px] uppercase transition-all text-left ${
                      active ? 'bg-fire-3/15 text-fire-4 border-l-2 border-fire-4' : 'text-white/30 hover:text-white/60 hover:bg-white/3 border-l-2 border-transparent'
                    }`}>
                    <Icon size={13} />
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {/* Mini SC card */}
            <div className="mt-2">
              <SCLevelBadge level={currentTier} points={totalSC} progress={scProgress} />
            </div>

            {/* Quick actions */}
            <div className="space-y-1.5 mt-2">
              <p className="font-mono text-[8px] tracking-[3px] uppercase text-white/20 px-1 mb-2">Accesso rapido</p>
              <QuickAction to="/VotingHub"    icon={Vote}     label="Vota ora"         color="#a855f7" />
              <QuickAction to="/marketplace"  icon={CreditCard} label="Marketplace"   color="#00ffee" />
              <QuickAction to="/NFTDashboard" icon={Gem}      label="NFT Portfolio"   color="#f0b90b" />
              <QuickAction to="/street-cred"  icon={Flame}    label="Street Cred"     color="#ff6600" />
            </div>
          </aside>

          {/* ── MAIN CONTENT ── */}
          <main className="flex-1 min-w-0">
            <AnimatePresence mode="wait">

              {/* OVERVIEW */}
              {activeSection === 'overview' && (
                <motion.div key="overview" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-6">

                  {/* Mobile SC bar */}
                  <div className="lg:hidden">
                    <SCLevelBadge level={currentTier} points={totalSC} progress={scProgress} />
                  </div>

                  {/* KPI grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <KpiCard icon={Ticket}    label="Iscrizioni"    value={registrations.length} sub="tornei & eventi"     color="#ff6600" />
                    <KpiCard icon={Flame}     label="Street Cred"   value={totalSC.toLocaleString()} sub={currentTier.replace(/_/g, ' ')} color="#fbbf24" />
                    <KpiCard icon={Vote}      label="Voti"          value={votes.length}          sub="community votes"   color="#a855f7" />
                    <KpiCard icon={CreditCard}label="Card NFT"      value={tokens.length}         sub="nella collezione"  color="#00ffee" />
                  </div>

                  {/* Mobile quick actions */}
                  <div className="lg:hidden grid grid-cols-2 gap-2">
                    <QuickAction to="/VotingHub"    icon={Vote}     label="Vota ora"       color="#a855f7" />
                    <QuickAction to="/marketplace"  icon={CreditCard} label="Marketplace" color="#00ffee" />
                    <QuickAction to="/NFTDashboard" icon={Gem}      label="NFT Portfolio"  color="#f0b90b" />
                    <QuickAction to="/street-cred"  icon={Flame}    label="Street Cred"    color="#ff6600" />
                  </div>

                  {/* Leaderboard tornei */}
                  <LiveTournamentLeaderboard lang={lang} />

                  {/* Ultime iscrizioni */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-mono text-[10px] tracking-[4px] uppercase text-fire-3/40">Ultime Iscrizioni</p>
                      <button onClick={() => setActiveSection('events')} className="font-mono text-[10px] text-fire-3/50 hover:text-fire-4 transition-colors">
                        vedi tutte →
                      </button>
                    </div>
                    {registrations.length === 0 ? (
                      <div className="border border-white/5 p-6 text-center">
                        <p className="font-rajdhani text-white/30">Nessuna iscrizione ancora. <Link to="/Home" className="text-fire-3 hover:text-fire-4">Esplora eventi →</Link></p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {registrations.slice(0, 4).map(r => (
                          <div key={r.id} className="flex items-center justify-between p-3 border border-white/5 bg-black/30 hover:border-white/10 transition-all">
                            <div className="flex items-center gap-3">
                              <span className="text-lg">{r.type === 'athlete' ? '⚔️' : '👁️'}</span>
                              <div>
                                <div className="font-orbitron text-sm text-fire-4">{r.type === 'athlete' ? 'Atleta' : 'Spettatore'}</div>
                                <div className="font-mono text-[10px] text-white/25">{r.sport || '—'} · {r.attendance_mode || 'in-person'}</div>
                              </div>
                            </div>
                            <span className={`font-mono text-[10px] px-2 py-1 border ${
                              r.status === 'confirmed' ? 'border-green-500/40 text-green-400' :
                              r.status === 'rejected'  ? 'border-red-500/40 text-red-400' :
                              'border-yellow-500/40 text-yellow-400'
                            }`}>{r.status}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* EVENTS */}
              {activeSection === 'events' && (
                <motion.div key="events" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="font-orbitron font-bold text-xl text-fire-5">Miei eventi</h2>
                    <Link to="/Home" className="btn-fire text-[10px] py-2 px-5">+ Iscriviti →</Link>
                  </div>
                  {registrations.length === 0 ? (
                    <div className="border border-white/5 p-10 text-center">
                      <div className="text-4xl mb-4">🎟️</div>
                      <p className="font-orbitron font-bold text-white/40 mb-2">Nessun evento</p>
                      <p className="font-rajdhani text-sm text-white/25 mb-5">Inizia partecipando a un evento SD</p>
                      <Link to="/Home" className="btn-fire text-[11px] py-2.5 px-8 inline-block">ESPLORA EVENTI</Link>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {registrations.map(r => (
                        <div key={r.id} className="p-4 border border-white/6 bg-black/30 hover:border-fire-3/30 transition-all"
                          style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))' }}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-xl">{r.type === 'athlete' ? '⚔️' : '👁️'}</span>
                              <div>
                                <div className="font-orbitron text-sm text-fire-4">{r.type === 'athlete' ? 'Atleta registrato' : 'Spettatore registrato'}</div>
                                <div className="font-mono text-[10px] text-white/30">{r.sport || '—'} · {r.attendance_mode || 'in-person'} · {r.age_group || '—'}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`font-mono text-[10px] px-2 py-1 border ${
                                r.status === 'confirmed' ? 'border-green-500/40 text-green-400 bg-green-500/5' :
                                r.status === 'rejected'  ? 'border-red-500/40 text-red-400 bg-red-500/5' :
                                'border-yellow-500/40 text-yellow-400 bg-yellow-500/5'
                              }`}>{r.status?.toUpperCase()}</span>
                            </div>
                          </div>
                          {r.notes && <p className="font-rajdhani text-xs text-white/25 mt-2 pl-9">{r.notes}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* COLLECTION */}
              {activeSection === 'collection' && (
                <motion.div key="collection" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
                  <FanNFTCollection lang={lang} />
                </motion.div>
              )}

              {/* MARKETS */}
              {activeSection === 'markets' && (
                <motion.div key="markets" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
                  <LiveMarketsFeed />
                </motion.div>
              )}

              {/* UGC */}
              {activeSection === 'ugc' && (
                <motion.div key="ugc" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
                  <UGCRewardPanel lang={lang} />
                </motion.div>
              )}

            </AnimatePresence>
          </main>
        </div>
      </div>

      <FireRule />
      <Footer lang={lang} />
    </div>
  );
}