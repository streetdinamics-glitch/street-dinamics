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
  Gem, BarChart2, ShoppingBag, User, Swords, ExternalLink,
  Play, Lock, Gift, Sparkles, ArrowUpRight, ImagePlay
} from 'lucide-react';

const LEVEL_CONFIG = {
  newcomer:      { name: 'Newcomer',      icon: Star,       color: '#94a3b8', next: 500 },
  follower:      { name: 'Follower',      icon: Zap,        color: '#a855f7', next: 2000 },
  hype_beast:    { name: 'Hype Beast',    icon: TrendingUp, color: '#00ffee', next: 5000 },
  street_legend: { name: 'Street Legend',icon: Trophy,     color: '#ff6600', next: 15000 },
  sd_icon:       { name: 'SD Icon',       icon: Crown,      color: '#fbbf24', next: null },
};

const TIER_COLORS = {
  rising_star:     { color: '#94a3b8', label: 'Rising Star',     glow: 'rgba(148,163,184,0.3)' },
  breakout_talent: { color: '#22c55e', label: 'Breakout Talent', glow: 'rgba(34,197,94,0.3)' },
  elite_performer: { color: '#3b82f6', label: 'Elite Performer', glow: 'rgba(59,130,246,0.3)' },
  living_legend:   { color: '#fbbf24', label: 'Living Legend',   glow: 'rgba(251,191,36,0.4)' },
};

const NAV_ITEMS = [
  { key: 'overview',    label: 'Hub',           icon: LayoutDashboard },
  { key: 'collection',  label: 'Le mie Card',   icon: Gem },
  { key: 'clips',       label: 'NFT Clips',     icon: ImagePlay },
  { key: 'ugc',         label: 'Earn & Create', icon: ShoppingBag },
  { key: 'markets',     label: 'Mercati',       icon: BarChart2 },
  { key: 'events',      label: 'Tornei',        icon: Ticket },
];

function SCLevelBadge({ level, points, progress }) {
  const cfg = LEVEL_CONFIG[level] || LEVEL_CONFIG.newcomer;
  const Icon = cfg.icon;
  return (
    <div className="relative overflow-hidden p-4 border"
      style={{ borderColor: `${cfg.color}44`, background: `linear-gradient(135deg, ${cfg.color}10, transparent)` }}>
      <div className="absolute top-0 left-0 right-0 h-[1px]"
        style={{ background: `linear-gradient(90deg, transparent, ${cfg.color}, transparent)` }} />
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
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

// Card NFT posseduta con atleta + stato clip
function OwnedCardRow({ token, clips = [] }) {
  const tier = TIER_COLORS[token.token_tier] || { color: '#94a3b8', label: token.token_tier, glow: 'rgba(148,163,184,0.2)' };
  const cardClips = clips.filter(c => c.card_id_linked === token.id || c.athlete_email === token.athlete_email);
  const hasClips = cardClips.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
      className="relative overflow-hidden border bg-black/50 hover:bg-black/70 transition-all group cursor-pointer"
      style={{ borderColor: `${tier.color}33`, clipPath: 'polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))' }}>
      {/* glow top line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] opacity-60 group-hover:opacity-100 transition-opacity"
        style={{ background: `linear-gradient(90deg, transparent, ${tier.color}, transparent)` }} />

      <div className="p-4 flex items-center gap-4">
        {/* Avatar placeholder con tier color */}
        <div className="w-14 h-14 flex-shrink-0 flex items-center justify-center text-2xl relative"
          style={{ background: `${tier.color}12`, border: `1px solid ${tier.color}44`, boxShadow: `0 0 20px ${tier.glow}` }}>
          {token.avatar_url
            ? <img src={token.avatar_url} alt={token.athlete_name} className="w-full h-full object-cover" />
            : <span>🃏</span>}
          {/* tier badge */}
          <div className="absolute -bottom-1 -right-1 px-1.5 py-0.5 font-mono text-[7px] font-bold"
            style={{ background: tier.color, color: '#000' }}>
            {tier.label.split(' ')[0].toUpperCase()}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <div className="font-orbitron font-bold text-base text-white/90 truncate">{token.athlete_name}</div>
            <div className="font-mono text-[8px] px-1.5 py-0.5 border flex-shrink-0"
              style={{ borderColor: `${tier.color}44`, color: tier.color }}>#{token.card_number}</div>
          </div>
          <div className="font-mono text-[10px] text-white/35">{token.sport || '—'} · Torneo #{token.tournament_id?.slice(-6) || '—'}</div>
          <div className="flex items-center gap-3 mt-2">
            {/* Clip status */}
            {hasClips ? (
              <div className="flex items-center gap-1.5 px-2 py-1 bg-purple-500/10 border border-purple-500/30">
                <Play size={9} className="text-purple-400" />
                <span className="font-mono text-[9px] text-purple-400">{cardClips.length} NFT Clip</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-2 py-1 bg-white/3 border border-white/8">
                <Lock size={9} className="text-white/25" />
                <span className="font-mono text-[9px] text-white/25">Clip: in attesa</span>
              </div>
            )}
            {/* Rarity */}
            <div className="font-mono text-[9px] text-white/25">{token.rarity || tier.label}</div>
          </div>
        </div>

        {/* Price */}
        <div className="text-right flex-shrink-0">
          <div className="font-orbitron font-bold text-lg" style={{ color: tier.color }}>
            €{token.current_price || token.purchase_price || '—'}
          </div>
          <div className="font-mono text-[9px] text-white/25">valore attuale</div>
          <Link to="/marketplace" className="mt-1 flex items-center gap-1 justify-end font-mono text-[9px] text-white/30 hover:text-white/60 transition-colors">
            Vendi <ArrowUpRight size={9} />
          </Link>
        </div>
      </div>

      {/* Se ci sono clip — mostrali sotto */}
      {hasClips && (
        <div className="border-t border-purple-500/15 px-4 py-2 flex items-center gap-3 bg-purple-500/5">
          <ImagePlay size={11} className="text-purple-400 flex-shrink-0" />
          <span className="font-mono text-[9px] text-purple-300/70 flex-1">
            {cardClips.map(c => c.title || 'NFT Clip').join(' · ')}
          </span>
          <Link to="/NFTDashboard" className="font-mono text-[9px] text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors">
            Vedi <ExternalLink size={9} />
          </Link>
        </div>
      )}
    </motion.div>
  );
}

// Sezione "Prossima ricompensa" — cosa fare per guadagnare di più
function EngagementCTA({ votes, tokens, registrations, onNavigate }) {
  const actions = [
    { done: votes.length > 0,         icon: Vote,    label: 'Vota un atleta',        desc: '+50 SC',   to: '/VotingHub',   color: '#a855f7' },
    { done: tokens.length > 0,        icon: CreditCard, label: 'Possiedi una Card',  desc: '+200 SC',  to: '/marketplace', color: '#00ffee' },
    { done: registrations.length > 0, icon: Ticket,  label: 'Iscriviti a un evento', desc: '+100 SC',  to: '/Home',        color: '#ff6600' },
    { done: false,                     icon: ShoppingBag, label: 'Crea UGC',          desc: '+150 SC',  to: null, onClick: () => onNavigate('ugc'), color: '#fbbf24' },
  ];
  const next = actions.find(a => !a.done) || actions[actions.length - 1];

  return (
    <div className="relative overflow-hidden border border-fire-5/20 bg-gradient-to-r from-fire-3/8 via-fire-4/5 to-transparent p-4"
      style={{ clipPath: 'polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 0 100%)' }}>
      <div className="absolute top-0 left-0 right-0 h-[1px]"
        style={{ background: 'linear-gradient(90deg, transparent, #ff9900, transparent)' }} />
      <div className="flex items-center gap-3 mb-3">
        <Gift size={16} className="text-fire-5" />
        <span className="font-orbitron font-bold text-sm text-fire-5">Prossima ricompensa</span>
        <span className="ml-auto font-mono text-[9px] text-white/30">{actions.filter(a => a.done).length}/{actions.length} completate</span>
      </div>
      {/* mini progress dots */}
      <div className="flex gap-1.5 mb-3">
        {actions.map((a, i) => (
          <div key={i} className="flex-1 h-1" style={{ background: a.done ? a.color : 'rgba(255,255,255,0.08)' }} />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div>
          <div className="font-rajdhani font-semibold text-sm text-white/70">{next.label}</div>
          <div className="font-mono text-[10px] text-fire-5/70">{next.desc} · fai subito</div>
        </div>
        {next.to ? (
          <Link to={next.to} className="btn-fire text-[10px] py-1.5 px-4 flex items-center gap-1.5">
            <Sparkles size={11} /> Vai
          </Link>
        ) : (
          <button onClick={next.onClick} className="btn-fire text-[10px] py-1.5 px-4 flex items-center gap-1.5">
            <Sparkles size={11} /> Vai
          </button>
        )}
      </div>
    </div>
  );
}

function QuickAction({ to, onClick, icon: Icon, label, color }) {
  const cls = "flex items-center gap-2.5 p-3 border border-white/6 bg-black/30 hover:border-white/20 hover:bg-white/3 transition-all group w-full text-left";
  const style = { clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))' };
  const inner = (
    <>
      <div className="w-7 h-7 flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}18`, border: `1px solid ${color}44` }}>
        <Icon size={13} style={{ color }} />
      </div>
      <span className="font-orbitron text-[11px]" style={{ color }}>{label}</span>
      <ChevronRight size={12} className="ml-auto text-white/20 group-hover:text-white/50 transition-colors" />
    </>
  );
  if (to) return <Link to={to} className={cls} style={style}>{inner}</Link>;
  return <button onClick={onClick} className={cls} style={style}>{inner}</button>;
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
  const { data: clips = [] } = useQuery({
    queryKey: ['fan-clips', user?.email],
    queryFn: () => base44.entities.NFTClip.filter({ recipient_email: user.email }),
    enabled: !!user, initialData: [],
  });

  const sc = streetCredList[0];
  const totalSC    = sc?.total_points || 0;
  const currentTier = sc?.level || 'newcomer';
  const scProgress  = sc?.next_level_progress || 0;

  return (
    <div className="relative min-h-screen bg-cyber-void text-[var(--text-main)]">
      <CyberOverlays />
      <Navbar onScrollTo={() => {}} lang={lang} onLangSwitch={setLang} onProfileClick={() => {}} />

      <div className="pt-[80px]">
        {/* Hero strip */}
        <div className="relative border-b border-fire-3/10 bg-gradient-to-r from-black via-fire-3/5 to-black px-6 py-5">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="font-mono text-[9px] tracking-[6px] uppercase text-fire-3/40 mb-1">// FAN HUB //</p>
              <h1 className="font-orbitron font-black text-[clamp(22px,4vw,38px)] leading-none mb-1">
                <span className="heading-fire">Benvenuto</span>
                <span className="text-white/60 ml-3 text-[65%]">{user?.full_name || 'Fan'}</span>
              </h1>
              <p className="font-rajdhani text-sm text-white/35">
                {tokens.length > 0
                  ? `${tokens.length} card · ${clips.length} NFT Clip · ${totalSC.toLocaleString()} SC`
                  : 'Inizia la tua collezione'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/UserProfile" className="btn-ghost text-[10px] py-2 px-4 flex items-center gap-1.5">
                <User size={12} /> Profilo
              </Link>
              <Link to="/marketplace" className="btn-fire text-[10px] py-2 px-4 flex items-center gap-1.5">
                <CreditCard size={12} /> Compra Card
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex gap-6">

          {/* SIDEBAR */}
          <aside className="hidden lg:flex flex-col gap-3 w-52 flex-shrink-0">
            <nav className="space-y-0.5">
              {NAV_ITEMS.map(item => {
                const Icon = item.icon;
                const active = activeSection === item.key;
                return (
                  <button key={item.key} onClick={() => setActiveSection(item.key)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 font-mono text-[11px] tracking-[1px] uppercase transition-all text-left ${
                      active ? 'bg-fire-3/15 text-fire-4 border-l-2 border-fire-4' : 'text-white/30 hover:text-white/60 hover:bg-white/3 border-l-2 border-transparent'
                    }`}>
                    <Icon size={13} />
                    <span>{item.label}</span>
                    {item.key === 'clips' && clips.length > 0 && (
                      <span className="ml-auto font-mono text-[9px] px-1.5 py-0.5 bg-purple-500/20 text-purple-400 rounded-full">{clips.length}</span>
                    )}
                    {item.key === 'collection' && tokens.length > 0 && (
                      <span className="ml-auto font-mono text-[9px] px-1.5 py-0.5 bg-fire-3/20 text-fire-4 rounded-full">{tokens.length}</span>
                    )}
                  </button>
                );
              })}
            </nav>

            <div className="mt-1">
              <SCLevelBadge level={currentTier} points={totalSC} progress={scProgress} />
            </div>

            <div className="space-y-1.5 mt-1">
              <p className="font-mono text-[8px] tracking-[3px] uppercase text-white/18 px-1 mb-2">Azioni rapide</p>
              <QuickAction to="/VotingHub"    icon={Vote}        label="Vota ora"      color="#a855f7" />
              <QuickAction to="/marketplace"  icon={CreditCard}  label="Marketplace"   color="#00ffee" />
              <QuickAction to="/NFTDashboard" icon={Gem}         label="NFT Portfolio" color="#f0b90b" />
            </div>
          </aside>

          {/* MAIN */}
          <main className="flex-1 min-w-0">
            <AnimatePresence mode="wait">

              {/* ── OVERVIEW / HUB ── */}
              {activeSection === 'overview' && (
                <motion.div key="overview" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-6">

                  {/* Mobile SC */}
                  <div className="lg:hidden">
                    <SCLevelBadge level={currentTier} points={totalSC} progress={scProgress} />
                  </div>

                  {/* CTA prossima ricompensa */}
                  <EngagementCTA votes={votes} tokens={tokens} registrations={registrations} onNavigate={setActiveSection} />

                  {/* LE MIE CARD — sempre in primo piano */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Gem size={14} className="text-fire-4" />
                        <p className="font-mono text-[10px] tracking-[4px] uppercase text-fire-3/60">Le mie Card Atleta</p>
                        {tokens.length > 0 && (
                          <span className="font-mono text-[9px] px-2 py-0.5 bg-fire-3/15 text-fire-4">{tokens.length}</span>
                        )}
                      </div>
                      <button onClick={() => setActiveSection('collection')} className="font-mono text-[10px] text-fire-3/40 hover:text-fire-4 transition-colors">
                        vedi tutte →
                      </button>
                    </div>

                    {tokens.length === 0 ? (
                      <div className="border border-fire-3/10 bg-black/30 p-8 text-center"
                        style={{ clipPath: 'polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))' }}>
                        <div className="text-4xl mb-3">🃏</div>
                        <p className="font-orbitron font-bold text-white/40 mb-1">Nessuna card ancora</p>
                        <p className="font-rajdhani text-sm text-white/25 mb-4">
                          Compra la card di un atleta per ricevere NFT Clip se vince e sale di livello
                        </p>
                        <Link to="/marketplace" className="btn-fire text-[11px] py-2 px-8 inline-flex items-center gap-2">
                          <CreditCard size={13} /> ESPLORA CARD
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {tokens.slice(0, 4).map(tok => (
                          <OwnedCardRow key={tok.id} token={tok} clips={clips} />
                        ))}
                        {tokens.length > 4 && (
                          <button onClick={() => setActiveSection('collection')}
                            className="w-full py-2 border border-fire-3/10 font-mono text-[10px] text-white/25 hover:text-fire-4 hover:border-fire-3/30 transition-all">
                            + {tokens.length - 4} altre card →
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* NFT CLIPS */}
                  {clips.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <ImagePlay size={14} className="text-purple-400" />
                          <p className="font-mono text-[10px] tracking-[4px] uppercase text-purple-400/60">NFT Clips ricevuti</p>
                          <span className="font-mono text-[9px] px-2 py-0.5 bg-purple-500/15 text-purple-400">{clips.length}</span>
                        </div>
                        <button onClick={() => setActiveSection('clips')} className="font-mono text-[10px] text-purple-400/40 hover:text-purple-400 transition-colors">
                          vedi tutti →
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {clips.slice(0, 2).map(clip => (
                          <div key={clip.id} className="border border-purple-500/20 bg-purple-500/5 p-3 flex items-center gap-3"
                            style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)' }}>
                            <div className="w-10 h-10 flex items-center justify-center bg-purple-500/15 border border-purple-500/30 flex-shrink-0">
                              <Play size={16} className="text-purple-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-orbitron text-xs text-purple-300 truncate">{clip.title}</div>
                              <div className="font-mono text-[9px] text-white/30">{clip.athlete_name} · {clip.rarity?.toUpperCase()}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Stats mini */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Iscrizioni',  value: registrations.length, color: '#ff6600', icon: Ticket },
                      { label: 'Voti cast',   value: votes.length,          color: '#a855f7', icon: Vote },
                      { label: 'NFT Clips',   value: clips.length,          color: '#a855f7', icon: ImagePlay },
                    ].map(s => {
                      const Icon = s.icon;
                      return (
                        <div key={s.label} className="border border-white/6 bg-black/40 p-3 text-center"
                          style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))' }}>
                          <Icon size={13} className="mx-auto mb-1" style={{ color: s.color }} />
                          <div className="font-orbitron font-black text-xl" style={{ color: s.color }}>{s.value}</div>
                          <div className="font-mono text-[9px] text-white/30">{s.label}</div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Leaderboard tornei */}
                  <LiveTournamentLeaderboard lang={lang} />
                </motion.div>
              )}

              {/* ── LE MIE CARD ── */}
              {activeSection === 'collection' && (
                <motion.div key="collection" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
                  <FanNFTCollection lang={lang} />
                </motion.div>
              )}

              {/* ── NFT CLIPS ── */}
              {activeSection === 'clips' && (
                <motion.div key="clips" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="font-orbitron font-bold text-xl text-purple-400">NFT Clips ricevuti</h2>
                    <span className="font-mono text-[10px] text-white/30">{clips.length} totali</span>
                  </div>
                  {clips.length === 0 ? (
                    <div className="border border-white/5 p-10 text-center">
                      <div className="text-5xl mb-4">🎬</div>
                      <p className="font-orbitron font-bold text-white/40 mb-2">Nessun NFT Clip</p>
                      <p className="font-rajdhani text-sm text-white/25 mb-1">
                        Gli NFT Clip si sbloccano automaticamente<br/>
                        quando un atleta di cui possiedi la card <strong className="text-white/50">vince e sale di livello</strong>
                      </p>
                      <p className="font-mono text-[10px] text-white/20 mt-3">Solo i detentori della card ricevono il Clip</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {clips.map(clip => (
                        <div key={clip.id} className="border border-purple-500/25 bg-purple-500/5 p-4 hover:border-purple-500/50 transition-all"
                          style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))' }}>
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 flex items-center justify-center bg-purple-500/15 border border-purple-500/30 flex-shrink-0">
                              <Play size={20} className="text-purple-400" />
                            </div>
                            <div>
                              <div className="font-orbitron font-bold text-sm text-purple-300">{clip.title}</div>
                              <div className="font-mono text-[10px] text-white/35">{clip.athlete_name}</div>
                            </div>
                            <div className="ml-auto">
                              <span className="font-mono text-[9px] px-2 py-1 border border-purple-500/30 text-purple-400">
                                {clip.rarity?.toUpperCase()}
                              </span>
                            </div>
                          </div>
                          {clip.description && (
                            <p className="font-rajdhani text-xs text-white/30">{clip.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* ── EARN & CREATE (UGC) ── */}
              {activeSection === 'ugc' && (
                <motion.div key="ugc" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
                  <UGCRewardPanel lang={lang} />
                </motion.div>
              )}

              {/* ── MERCATI ── */}
              {activeSection === 'markets' && (
                <motion.div key="markets" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
                  <LiveMarketsFeed />
                </motion.div>
              )}

              {/* ── TORNEI ── */}
              {activeSection === 'events' && (
                <motion.div key="events" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="font-orbitron font-bold text-xl text-fire-5">Miei tornei</h2>
                    <Link to="/Home" className="btn-fire text-[10px] py-2 px-5">+ Iscriviti →</Link>
                  </div>
                  {registrations.length === 0 ? (
                    <div className="border border-white/5 p-10 text-center">
                      <div className="text-4xl mb-4">🎟️</div>
                      <p className="font-orbitron font-bold text-white/40 mb-2">Nessuna iscrizione</p>
                      <Link to="/Home" className="btn-fire text-[11px] py-2.5 px-8 inline-block mt-3">ESPLORA EVENTI</Link>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {registrations.map(r => (
                        <div key={r.id} className="flex items-center justify-between p-4 border border-white/6 bg-black/30 hover:border-fire-3/30 transition-all"
                          style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))' }}>
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{r.type === 'athlete' ? '⚔️' : '👁️'}</span>
                            <div>
                              <div className="font-orbitron text-sm text-fire-4">{r.type === 'athlete' ? 'Atleta' : 'Spettatore'}</div>
                              <div className="font-mono text-[10px] text-white/25">{r.sport || '—'} · {r.attendance_mode || 'in-person'}</div>
                            </div>
                          </div>
                          <span className={`font-mono text-[10px] px-2 py-1 border ${
                            r.status === 'confirmed' ? 'border-green-500/40 text-green-400 bg-green-500/5' :
                            r.status === 'rejected'  ? 'border-red-500/40 text-red-400 bg-red-500/5' :
                            'border-yellow-500/40 text-yellow-400 bg-yellow-500/5'
                          }`}>{r.status?.toUpperCase()}</span>
                        </div>
                      ))}
                    </div>
                  )}
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