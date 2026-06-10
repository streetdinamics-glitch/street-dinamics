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
import AthleteStreetCredBar from '../components/gamification/AthleteXPBar';
import LiveTournamentLeaderboard from '../components/gamification/LiveTournamentLeaderboard';
import PushPermissionBanner from '../components/notifications/PushPermissionBanner';
import { usePushNotifications } from '../components/notifications/usePushNotifications';
import {
  LayoutDashboard, Trophy, CreditCard, BarChart2, Medal,
  ChevronRight, TrendingUp, Users, Coins, ExternalLink,
  Calendar, Swords, User, Zap, CheckCircle, Clock, XCircle
} from 'lucide-react';

const NAV_ITEMS = [
  { key: 'overview',   label: 'Overview',      icon: LayoutDashboard },
  { key: 'cards',      label: 'Le mie card',   icon: CreditCard },
  { key: 'badges',     label: 'Badge',         icon: Medal },
  { key: 'events',     label: 'Tornei',        icon: Calendar },
  { key: 'leaderboard',label: 'Leaderboard',   icon: Trophy },
];

const TIER_COLORS = {
  rising_star:     { color: '#94a3b8', label: 'Rising Star' },
  breakout_talent: { color: '#22c55e', label: 'Breakout Talent' },
  elite_performer: { color: '#3b82f6', label: 'Elite Performer' },
  living_legend:   { color: '#fbbf24', label: 'Living Legend' },
};

const RARITY_COLORS = {
  legendary: '#fbbf24',
  epic:      '#a855f7',
  rare:      '#3b82f6',
  common:    '#6b7280',
};

function KpiCard({ icon: Icon, label, value, sub, color = '#00ffee', trend }) {
  return (
    <div className="border bg-black/50 p-4 relative overflow-hidden group hover:scale-[1.02] transition-all"
      style={{ borderColor: `${color}33`, clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))' }}>
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ background: `radial-gradient(circle at 50% 0%, ${color}0a, transparent 70%)` }} />
      <div className="absolute top-0 left-0 right-0 h-[1px]"
        style={{ background: `linear-gradient(90deg, transparent, ${color}66, transparent)`, opacity: 0.6 }} />
      <div className="flex items-start justify-between mb-2">
        <Icon size={16} style={{ color }} />
        {trend !== undefined && (
          <span className={`font-mono text-[9px] flex items-center gap-0.5 ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            <TrendingUp size={9} /> {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <div className="font-orbitron font-black text-2xl mb-0.5" style={{ color }}>{value}</div>
      <div className="font-rajdhani text-sm text-white/50">{label}</div>
      {sub && <div className="font-mono text-[9px] text-white/25 mt-1">{sub}</div>}
    </div>
  );
}

function QuickAction({ to, icon: Icon, label, desc, color }) {
  return (
    <Link to={to} className="flex items-center gap-3 p-3 border border-white/6 bg-black/30 hover:border-white/20 hover:bg-white/3 transition-all group"
      style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))' }}>
      <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 rounded"
        style={{ background: `${color}18`, border: `1px solid ${color}44` }}>
        <Icon size={14} style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-orbitron text-[11px]" style={{ color }}>{label}</div>
        {desc && <div className="font-mono text-[9px] text-white/25 truncate">{desc}</div>}
      </div>
      <ChevronRight size={12} className="text-white/20 group-hover:text-white/50 transition-colors flex-shrink-0" />
    </Link>
  );
}

function TokenCard({ tok }) {
  const tierCfg = TIER_COLORS[tok.token_tier] || { color: '#ffffff', label: tok.token_tier };
  const soldPct = tok.total_supply > 0 ? Math.round(((tok.total_supply - (tok.available_supply || 0)) / tok.total_supply) * 100) : 0;
  return (
    <div className="border bg-black/40 p-4 hover:border-white/20 transition-all"
      style={{ borderColor: `${tierCfg.color}33`, clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))' }}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="font-orbitron font-bold text-base text-white/90">{tok.athlete_name}</div>
          <div className="font-mono text-[9px] tracking-[1px]" style={{ color: tierCfg.color }}>
            {tierCfg.label} · #{tok.card_number}
          </div>
        </div>
        <div className="text-right">
          <div className="font-orbitron font-bold text-xl" style={{ color: tierCfg.color }}>€{tok.current_price || tok.base_price}</div>
          <div className="font-mono text-[9px] text-white/25">prezzo attuale</div>
        </div>
      </div>
      <div className="flex justify-between font-mono text-[9px] text-white/30 mb-1">
        <span>Vendute</span>
        <span>{tok.total_supply - (tok.available_supply || 0)} / {tok.total_supply}</span>
      </div>
      <div className="h-1.5 bg-white/5 overflow-hidden">
        <div className="h-full transition-all" style={{ width: `${soldPct}%`, background: `linear-gradient(90deg, ${tierCfg.color}88, ${tierCfg.color})` }} />
      </div>
      <div className="flex justify-between mt-2 font-mono text-[9px]">
        <span style={{ color: tierCfg.color }}>{soldPct}% venduto</span>
        <span className="text-white/25">{tok.available_supply || 0} disponibili</span>
      </div>
    </div>
  );
}

export default function DashboardAtleta() {
  const [lang, setLang] = useLang();
  const t = useTranslation(lang);
  const [activeSection, setActiveSection] = useState('overview');

  const { data: user } = useQuery({ queryKey: ['current-user'], queryFn: () => base44.auth.me() });
  const { requestPermission, isSupported, permission } = usePushNotifications(user);

  const { data: stats = [] } = useQuery({
    queryKey: ['athlete-stats', user?.email],
    queryFn: () => base44.entities.AthleteStats.filter({ athlete_email: user.email }),
    enabled: !!user, initialData: [],
  });
  const { data: badges = [] } = useQuery({
    queryKey: ['athlete-badges', user?.email],
    queryFn: () => base44.entities.AthleteBadge.filter({ athlete_email: user.email }),
    enabled: !!user, initialData: [],
  });
  const { data: tokens = [] } = useQuery({
    queryKey: ['athlete-tokens', user?.email],
    queryFn: () => base44.entities.AthleteToken.filter({ athlete_email: user.email }),
    enabled: !!user, initialData: [],
  });
  const { data: registrations = [] } = useQuery({
    queryKey: ['athlete-registrations', user?.email],
    queryFn: () => base44.entities.Registration.filter({ email: user.email, type: 'athlete' }),
    enabled: !!user, initialData: [],
  });

  const latestStats = stats[0];
  const totalTokens = tokens.reduce((sum, t) => sum + (t.total_supply || 0), 0);
  const soldTokens  = tokens.reduce((sum, t) => sum + ((t.total_supply || 0) - (t.available_supply || 0)), 0);
  const totalRevenue = tokens.reduce((sum, t) => sum + (((t.total_supply || 0) - (t.available_supply || 0)) * (t.current_price || t.base_price || 0)), 0);

  return (
    <div className="relative min-h-screen bg-cyber-void text-[var(--text-main)]">
      <CyberOverlays />
      <Navbar onScrollTo={() => {}} lang={lang} onLangSwitch={setLang} onProfileClick={() => {}} />

      <div className="pt-[80px]">
        {/* Hero strip — cyan theme for athletes */}
        <div className="relative border-b border-cyan-500/10 bg-gradient-to-r from-black via-cyan-500/5 to-black px-6 py-6">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="font-mono text-[9px] tracking-[6px] uppercase text-cyan-400/40 mb-1">// ATHLETE COMMAND CENTER //</p>
              <h1 className="font-orbitron font-black text-[clamp(24px,4vw,42px)] leading-none mb-1">
                <span style={{ background: 'linear-gradient(135deg, #00ffee, #0099ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Dashboard
                </span>
                <span className="text-white/60 ml-3 text-[70%]">{user?.full_name || 'Atleta'}</span>
              </h1>
              <p className="font-rajdhani text-sm text-white/35">Il tuo quartier generale nello sport di strada</p>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/AthleteProfile" className="btn-ghost text-[10px] py-2 px-5 flex items-center gap-2" style={{ borderColor: 'rgba(0,255,238,0.3)', color: '#00ffee' }}>
                <User size={13} /> Profilo
              </Link>
              <Link to="/Home" className="text-[10px] py-2 px-5 flex items-center gap-2 font-orbitron font-bold tracking-widest uppercase transition-all"
                style={{ background: 'linear-gradient(135deg, #00ffee, #0099ff)', color: '#000', clipPath: 'polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)' }}>
                <Swords size={13} /> Torna in gara
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex gap-6">

          {/* ── SIDEBAR ── */}
          <aside className="hidden lg:flex flex-col gap-3 w-52 flex-shrink-0">
            <nav className="space-y-1">
              {NAV_ITEMS.map(item => {
                const Icon = item.icon;
                const active = activeSection === item.key;
                return (
                  <button key={item.key} onClick={() => setActiveSection(item.key)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 font-mono text-[11px] tracking-[1px] uppercase transition-all text-left ${
                      active ? 'bg-cyan-500/10 text-cyan-400 border-l-2 border-cyan-400' : 'text-white/30 hover:text-white/60 hover:bg-white/3 border-l-2 border-transparent'
                    }`}>
                    <Icon size={13} />
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {/* Quick stats */}
            <div className="mt-2 p-3 border border-cyan-500/20 bg-cyan-500/5">
              <p className="font-mono text-[8px] tracking-[2px] uppercase text-cyan-400/50 mb-3">Stats rapide</p>
              <div className="space-y-2">
                {[
                  { label: 'Vittorie',  value: latestStats?.wins || 0,             color: '#fbbf24' },
                  { label: 'Podi',      value: latestStats?.podium_finishes || 0,   color: '#00ffee' },
                  { label: 'Card emesse',value: totalTokens,                        color: '#a855f7' },
                  { label: 'Badge',     value: badges.length,                       color: '#22c55e' },
                ].map(s => (
                  <div key={s.label} className="flex justify-between items-center">
                    <span className="font-rajdhani text-xs text-white/40">{s.label}</span>
                    <span className="font-orbitron font-bold text-sm" style={{ color: s.color }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick actions */}
            <div className="space-y-1.5">
              <p className="font-mono text-[8px] tracking-[3px] uppercase text-white/20 px-1 mb-2">Accesso rapido</p>
              <QuickAction to="/Analytics"    icon={BarChart2}   label="Analytics"        desc="Performance & trend"       color="#00ffee" />
              <QuickAction to="/NFTDashboard" icon={CreditCard}  label="NFT & Card"       desc="Gestisci le tue card"      color="#a855f7" />
              <QuickAction to="/Analytics"    icon={Coins}       label="Revenue"          desc="Royalty e guadagni"        color="#fbbf24" />
              <QuickAction to="/window-challenge" icon={Trophy}  label="Window Challenge" desc="Sfida il campione"         color="#ff6600" />
            </div>
          </aside>

          {/* ── MAIN CONTENT ── */}
          <main className="flex-1 min-w-0">
            <AnimatePresence mode="wait">

              {/* OVERVIEW */}
              {activeSection === 'overview' && (
                <motion.div key="overview" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-6">

                  {/* Street Cred XP bar */}
                  <AthleteStreetCredBar stats={latestStats} badges={badges} tokens={tokens} />

                  {/* KPI grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <KpiCard icon={Swords}    label="Tornei"        value={latestStats?.events_participated || registrations.length} sub="partecipazioni" color="#00ffee" />
                    <KpiCard icon={Trophy}    label="Vittorie"      value={latestStats?.wins || 0}            sub={`${latestStats?.podium_finishes || 0} podi`} color="#fbbf24" />
                    <KpiCard icon={CreditCard}label="Card vendute"  value={soldTokens}                       sub={`di ${totalTokens} emesse`}              color="#a855f7" />
                    <KpiCard icon={Coins}     label="Revenue €"     value={`€${totalRevenue.toFixed(0)}`}    sub="dalle card vendute"                       color="#22c55e" />
                  </div>

                  {/* Mobile quick actions */}
                  <div className="lg:hidden grid grid-cols-2 gap-2">
                    <QuickAction to="/Analytics"    icon={BarChart2}  label="Analytics"    color="#00ffee" />
                    <QuickAction to="/NFTDashboard" icon={CreditCard} label="NFT & Card"   color="#a855f7" />
                    <QuickAction to="/window-challenge" icon={Trophy} label="Window Chall" color="#ff6600" />
                    <QuickAction to="/AthleteProfile"   icon={User}   label="Profilo"      color="#94a3b8" />
                  </div>

                  {/* Cards highlight */}
                  {tokens.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <p className="font-mono text-[10px] tracking-[4px] uppercase text-cyan-400/40">Le mie Card</p>
                        <button onClick={() => setActiveSection('cards')} className="font-mono text-[10px] text-cyan-400/50 hover:text-cyan-400 transition-colors">
                          vedi tutte →
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {tokens.slice(0, 2).map(tok => <TokenCard key={tok.id} tok={tok} />)}
                      </div>
                    </div>
                  )}

                  {/* Badges highlight */}
                  {badges.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <p className="font-mono text-[10px] tracking-[4px] uppercase text-cyan-400/40">Ultimi Badge</p>
                        <button onClick={() => setActiveSection('badges')} className="font-mono text-[10px] text-cyan-400/50 hover:text-cyan-400 transition-colors">
                          vedi tutti →
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {badges.slice(0, 6).map(b => (
                          <div key={b.id} className="px-3 py-1.5 border flex items-center gap-2 hover:border-white/30 transition-all"
                            style={{ borderColor: `${RARITY_COLORS[b.rarity] || '#6b7280'}44`, background: `${RARITY_COLORS[b.rarity] || '#6b7280'}08` }}>
                            <span className="text-base">{b.badge_icon || '🏅'}</span>
                            <div>
                              <div className="font-orbitron text-[10px]" style={{ color: RARITY_COLORS[b.rarity] || '#94a3b8' }}>{b.badge_name}</div>
                              <div className="font-mono text-[8px] text-white/25">{b.rarity?.toUpperCase()}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Leaderboard */}
                  <LiveTournamentLeaderboard lang={lang} />
                </motion.div>
              )}

              {/* CARDS */}
              {activeSection === 'cards' && (
                <motion.div key="cards" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="font-orbitron font-bold text-xl text-cyan-400">Le mie Card</h2>
                    <Link to="/NFTDashboard" className="font-mono text-[10px] text-cyan-400/50 hover:text-cyan-400 flex items-center gap-1 transition-colors">
                      Gestisci <ExternalLink size={10} />
                    </Link>
                  </div>
                  {tokens.length === 0 ? (
                    <div className="border border-white/5 p-10 text-center">
                      <div className="text-4xl mb-4">🃏</div>
                      <p className="font-orbitron font-bold text-white/40 mb-2">Nessuna card emessa</p>
                      <p className="font-rajdhani text-sm text-white/25 mb-5">Crea la tua prima card atleta</p>
                      <Link to="/NFTDashboard" className="inline-block text-[11px] py-2.5 px-8 font-orbitron font-bold uppercase tracking-widest"
                        style={{ background: 'linear-gradient(135deg, #00ffee, #0099ff)', color: '#000', clipPath: 'polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)' }}>
                        CREA CARD
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {tokens.map(tok => <TokenCard key={tok.id} tok={tok} />)}
                    </div>
                  )}
                </motion.div>
              )}

              {/* BADGES */}
              {activeSection === 'badges' && (
                <motion.div key="badges" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-4">
                  <h2 className="font-orbitron font-bold text-xl text-cyan-400">Badge conquistati</h2>
                  {badges.length === 0 ? (
                    <div className="border border-white/5 p-10 text-center">
                      <div className="text-4xl mb-4">🎖️</div>
                      <p className="font-orbitron font-bold text-white/40">Nessun badge ancora</p>
                      <p className="font-rajdhani text-sm text-white/25 mt-2">Partecipa agli eventi per guadagnare badge</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {badges.map(b => (
                        <div key={b.id} className="p-4 border flex items-center gap-4 hover:border-white/20 transition-all"
                          style={{ borderColor: `${RARITY_COLORS[b.rarity] || '#6b7280'}44`, background: `${RARITY_COLORS[b.rarity] || '#6b7280'}06`, clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))' }}>
                          <span className="text-3xl flex-shrink-0">{b.badge_icon || '🏅'}</span>
                          <div className="flex-1 min-w-0">
                            <div className="font-orbitron font-bold text-sm" style={{ color: RARITY_COLORS[b.rarity] || '#94a3b8' }}>{b.badge_name}</div>
                            {b.badge_description && <div className="font-rajdhani text-xs text-white/40 mt-0.5">{b.badge_description}</div>}
                            <div className="flex items-center gap-2 mt-1">
                              <span className="font-mono text-[8px] px-1.5 py-0.5 border" style={{ color: RARITY_COLORS[b.rarity], borderColor: `${RARITY_COLORS[b.rarity]}44` }}>
                                {b.rarity?.toUpperCase()}
                              </span>
                              {b.earned_date && <span className="font-mono text-[8px] text-white/20">{b.earned_date}</span>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* EVENTS / TORNEI */}
              {activeSection === 'events' && (
                <motion.div key="events" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="font-orbitron font-bold text-xl text-cyan-400">Tornei</h2>
                    <Link to="/Home" className="font-mono text-[10px] text-cyan-400/50 hover:text-cyan-400 flex items-center gap-1 transition-colors">
                      + Iscriviti <ExternalLink size={10} />
                    </Link>
                  </div>
                  {registrations.length === 0 ? (
                    <div className="border border-white/5 p-10 text-center">
                      <div className="text-4xl mb-4">⚔️</div>
                      <p className="font-orbitron font-bold text-white/40 mb-2">Nessun torneo</p>
                      <p className="font-rajdhani text-sm text-white/25 mb-5">Registrati al prossimo evento SD</p>
                      <Link to="/Home" className="inline-block text-[11px] py-2.5 px-8 font-orbitron font-bold uppercase tracking-widest"
                        style={{ background: 'linear-gradient(135deg, #00ffee, #0099ff)', color: '#000', clipPath: 'polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)' }}>
                        TROVA EVENTI
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {registrations.map(r => {
                        const statusIcon = r.status === 'confirmed' ? <CheckCircle size={14} className="text-green-400" /> :
                                           r.status === 'rejected'  ? <XCircle size={14} className="text-red-400" /> :
                                           <Clock size={14} className="text-yellow-400" />;
                        return (
                          <div key={r.id} className="p-4 border border-cyan-500/10 bg-black/30 hover:border-cyan-500/30 transition-all"
                            style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))' }}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <span className="text-xl">⚔️</span>
                                <div>
                                  <div className="font-orbitron text-sm text-cyan-400">Atleta registrato</div>
                                  <div className="font-mono text-[10px] text-white/30">{r.sport || '—'} · {r.attendance_mode || 'in-person'}</div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {statusIcon}
                                <span className="font-mono text-[10px] text-white/40">{r.status?.toUpperCase()}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              )}

              {/* LEADERBOARD */}
              {activeSection === 'leaderboard' && (
                <motion.div key="leaderboard" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
                  <LiveTournamentLeaderboard lang={lang} />
                </motion.div>
              )}

            </AnimatePresence>
          </main>
        </div>
      </div>

      <FireRule />
      <Footer lang={lang} />
      {isSupported && <PushPermissionBanner onRequestPermission={requestPermission} permission={permission} />}
    </div>
  );
}