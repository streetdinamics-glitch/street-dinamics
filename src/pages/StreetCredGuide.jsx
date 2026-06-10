import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import CyberOverlays from '../components/cyber/CyberOverlays';
import Navbar from '../components/cyber/Navbar';
import Footer from '../components/cyber/Footer';
import FireRule from '../components/cyber/FireRule';
import { useLang } from '../components/useLang';
import {
  Wifi, MapPin, Star, Zap, TrendingUp, Trophy, Crown,
  Instagram, Youtube, Ticket, ShoppingBag, CheckSquare,
  Users, Image, BarChart2, Coins, MessageSquare, Repeat2,
  CalendarCheck, Flame, Lock, ChevronRight
} from 'lucide-react';

// ── LEVEL CONFIG ──────────────────────────────────────────────────────────────
const LEVELS = [
  {
    key: 'newcomer',
    name: 'Newcomer',
    icon: Star,
    color: 'from-slate-500 to-slate-700',
    accent: '#94a3b8',
    border: 'border-slate-500/40',
    requirement: 0,
    multiplier: '1.0x',
    cashback: '—',
    perks: ['Accesso ai drop pubblici', 'Guadagna NFT Rising Star via UGC', 'Mercato secondario NFT'],
  },
  {
    key: 'follower',
    name: 'Follower',
    icon: Zap,
    color: 'from-blue-500 to-purple-600',
    accent: '#a855f7',
    border: 'border-purple-500/40',
    requirement: 500,
    multiplier: '1.1x',
    cashback: '1%',
    perks: ['1.1x moltiplicatore punti', '1% cashback reward store', 'Early access drop (−12h)', 'Raffle entry esclusivo'],
  },
  {
    key: 'hype_beast',
    name: 'Hype Beast',
    icon: TrendingUp,
    color: 'from-cyan-500 to-cyan-700',
    accent: '#00ffee',
    border: 'border-cyan/40',
    requirement: 2000,
    multiplier: '1.25x',
    cashback: '1.5%',
    perks: ['1.25x moltiplicatore punti', '1.5% cashback', 'Early access drop (−24h)', 'Badge esclusivo profilo', 'Free drink in arena'],
  },
  {
    key: 'street_legend',
    name: 'Street Legend',
    icon: Trophy,
    color: 'from-orange-500 to-red-600',
    accent: '#ff6600',
    border: 'border-fire-3/50',
    requirement: 5000,
    multiplier: '1.5x',
    cashback: '2%',
    perks: ['1.5x moltiplicatore punti', '2% cashback su tutto', 'Early access drop (−48h)', 'VIP Pass annuale', 'Merch SD gratuito', 'Royalty 0.5% su rivendite NFT'],
  },
  {
    key: 'sd_icon',
    name: 'SD Icon',
    icon: Crown,
    color: 'from-yellow-400 via-yellow-500 to-orange-500',
    accent: '#fbbf24',
    border: 'border-yellow-400/60',
    requirement: 15000,
    multiplier: '2.0x',
    cashback: '5%',
    perks: ['2x moltiplicatore punti', '5% cashback su tutto', 'Early access drop (−72h) + drop esclusivi', 'VIP + Meet & Greet atleti', 'Accesso backstage', 'Governance voting rights', 'Royalty 1% su tutte le rivendite', 'Card 1-of-1 esclusiva ogni stagione'],
  },
];

// ── ONLINE ACTIONS ────────────────────────────────────────────────────────────
const ONLINE_ACTIONS = [
  { icon: Instagram,    label: 'Follow Instagram SD',    points: 100, tag: 'una tantum',  color: '#e1306c' },
  { icon: Instagram,    label: 'Follow TikTok SD',       points: 100, tag: 'una tantum',  color: '#010101' },
  { icon: Youtube,      label: 'Follow YouTube SD',      points: 80,  tag: 'una tantum',  color: '#ff0000' },
  { icon: Flame,        label: 'Follow Kick SD',         points: 80,  tag: 'una tantum',  color: '#53fc18' },
  { icon: MessageSquare,label: 'Follow Snapchat SD',     points: 60,  tag: 'una tantum',  color: '#fffc00' },
  { icon: Image,        label: 'Contenuto UGC approvato',points: 75,  tag: 'per contenuto', color: '#00ffee' },
  { icon: CheckSquare,  label: 'Voto governance/atleta', points: 20,  tag: 'per voto',    color: '#a855f7' },
  { icon: Repeat2,      label: 'Trade marketplace',      points: 120, tag: 'per trade',   color: '#f0b90b' },
  { icon: Coins,        label: 'Acquisto token atleta',  points: 150, tag: 'per acquisto',color: '#8247e5' },
  { icon: BarChart2,    label: 'Acquisto NFT card',      points: 200, tag: 'per acquisto',color: '#ff6600' },
  { icon: Users,        label: 'Referral amico registrato', points: 250, tag: 'per referral', color: '#22c55e' },
  { icon: CalendarCheck,label: 'Iscrizione evento',      points: 50,  tag: 'per iscrizione', color: '#3b82f6' },
  { icon: BarChart2,    label: 'Scommessa piazzata',     points: 30,  tag: 'per scommessa', color: '#f97316' },
  { icon: Flame,        label: 'Accesso giornaliero',    points: 10,  tag: 'max 1/giorno',  color: '#fbbf24' },
  { icon: Flame,        label: 'Streak 7 giorni',        points: 100, tag: 'bonus',        color: '#fbbf24' },
  { icon: Crown,        label: 'Streak 30 giorni',       points: 500, tag: 'bonus',        color: '#fbbf24' },
];

// ── OFFLINE ACTIONS ───────────────────────────────────────────────────────────
const OFFLINE_ACTIONS = [
  { icon: MapPin,      label: 'Check-in in arena (QR)',    points: 150, tag: 'per evento',  color: '#ff4400' },
  { icon: Ticket,      label: 'Side event / workshop',     points: 100, tag: 'per evento',  color: '#06b6d4' },
  { icon: ShoppingBag, label: 'Merch acquistato in loco',  points: 120, tag: 'per acquisto',color: '#8b5cf6' },
  { icon: Users,       label: 'Meet & greet atleta',       points: 80,  tag: 'per sessione',color: '#ec4899' },
  { icon: CalendarCheck,label:'Volontariato evento',       points: 200, tag: 'per evento',  color: '#22c55e' },
];

// ── COMPONENTS ────────────────────────────────────────────────────────────────

function ActionRow({ icon: Icon, label, points, tag, color, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      className="flex items-center gap-3 p-3 border border-white/5 bg-black/30 hover:border-white/15 hover:bg-white/3 transition-all group"
    >
      <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 rounded"
        style={{ background: `${color}18`, border: `1px solid ${color}44` }}>
        <Icon size={14} style={{ color }} />
      </div>
      <span className="font-rajdhani text-sm text-white/70 flex-1 group-hover:text-white/90 transition-colors">{label}</span>
      <span className="font-mono text-[9px] text-white/25 mr-2 hidden sm:block">{tag}</span>
      <span className="font-orbitron font-bold text-sm flex-shrink-0" style={{ color }}>+{points}</span>
      <span className="font-mono text-[8px] text-white/30 flex-shrink-0">SC</span>
    </motion.div>
  );
}

function LevelCard({ level, isUnlocked, isCurrent, userPoints }) {
  const Icon = level.icon;
  const prev = LEVELS[LEVELS.indexOf(level) - 1];
  const progressFromPrev = prev
    ? Math.min(100, Math.max(0, ((userPoints - prev.requirement) / (level.requirement - prev.requirement)) * 100))
    : 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative bg-gradient-to-br from-[rgba(10,4,18,0.98)] to-[rgba(4,2,8,1)] border ${level.border} clip-cyber overflow-hidden`}
      style={{ opacity: isUnlocked ? 1 : 0.5 }}
    >
      {/* Glow top bar */}
      <div className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: `linear-gradient(90deg, transparent, ${level.accent}, transparent)` }} />

      {/* Current badge */}
      {isCurrent && (
        <div className="absolute top-3 right-3 px-2 py-0.5 font-mono text-[8px] tracking-[2px] uppercase"
          style={{ background: `${level.accent}22`, border: `1px solid ${level.accent}66`, color: level.accent }}>
          IL TUO LIVELLO
        </div>
      )}

      {/* Lock overlay */}
      {!isUnlocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-10">
          <Lock size={32} className="text-white/20" />
        </div>
      )}

      <div className="p-5">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${level.color} flex items-center justify-center flex-shrink-0`}>
            <Icon size={22} className="text-white" />
          </div>
          <div>
            <div className="font-orbitron font-black text-lg" style={{ color: level.accent }}>{level.name}</div>
            <div className="font-mono text-[10px] text-white/30">
              {level.requirement === 0 ? 'Livello iniziale' : `${level.requirement.toLocaleString()} SC richiesti`}
            </div>
          </div>
        </div>

        {/* Progress bar (only if current or next) */}
        {isCurrent && prev && (
          <div className="mb-4">
            <div className="flex justify-between font-mono text-[9px] text-white/30 mb-1">
              <span>{prev.requirement.toLocaleString()} SC</span>
              <span>{level.requirement.toLocaleString()} SC</span>
            </div>
            <div className="h-2 bg-white/5 overflow-hidden">
              <motion.div className="h-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressFromPrev}%` }}
                transition={{ duration: 1, delay: 0.4 }}
                style={{ background: `linear-gradient(90deg, ${level.accent}88, ${level.accent})` }}
              />
            </div>
          </div>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="p-2 bg-white/3 border border-white/5 text-center">
            <div className="font-mono text-[8px] text-white/25 mb-0.5">MOLTIPLICATORE</div>
            <div className="font-orbitron font-bold text-base" style={{ color: level.accent }}>{level.multiplier}</div>
          </div>
          <div className="p-2 bg-white/3 border border-white/5 text-center">
            <div className="font-mono text-[8px] text-white/25 mb-0.5">CASHBACK</div>
            <div className="font-orbitron font-bold text-base" style={{ color: level.accent }}>{level.cashback}</div>
          </div>
        </div>

        {/* Perks */}
        <ul className="space-y-1.5">
          {level.perks.map((perk, i) => (
            <li key={i} className="flex items-start gap-2 font-rajdhani text-sm text-white/60">
              <ChevronRight size={12} className="flex-shrink-0 mt-0.5" style={{ color: level.accent }} />
              {perk}
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}

// ── PAGE ──────────────────────────────────────────────────────────────────────
export default function StreetCredGuide() {
  const [lang, setLang] = useLang();
  const [activeTab, setActiveTab] = useState('levels'); // 'levels' | 'online' | 'offline'

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: streetCredList = [] } = useQuery({
    queryKey: ['street-cred-guide', user?.email],
    queryFn: () => base44.entities.StreetCred.filter({ user_email: user.email }),
    enabled: !!user,
    initialData: [],
  });
  const sc = streetCredList[0];
  const userPoints = sc?.total_points || 0;
  const currentLevel = sc?.level || 'newcomer';
  const currentLevelIndex = LEVELS.findIndex(l => l.key === currentLevel);

  const TABS = [
    { key: 'levels',  label: 'Livelli & Perks',    icon: Trophy },
    { key: 'online',  label: 'Azioni Online',       icon: Wifi },
    { key: 'offline', label: 'Azioni Offline',      icon: MapPin },
  ];

  return (
    <div className="relative min-h-screen bg-cyber-void text-[var(--text-main)]">
      <CyberOverlays />
      <Navbar onScrollTo={() => {}} lang={lang} onLangSwitch={setLang} onProfileClick={() => {}} />

      <div className="pt-[80px] section-container max-w-5xl">

        {/* Header */}
        <div className="mb-10 text-center">
          <p className="font-mono text-[10px] tracking-[7px] uppercase text-fire-3/40 mb-2">// SISTEMA DI REPUTAZIONE //</p>
          <h1 className="heading-fire text-[clamp(36px,7vw,80px)] font-black leading-none mb-3">
            Street Cred
          </h1>
          <p className="font-rajdhani text-lg text-white/40 max-w-2xl mx-auto">
            Accumula punti completando azioni online e offline. Più punti guadagni, più sali di livello e sblocchi vantaggi esclusivi.
          </p>
        </div>

        {/* User current status banner */}
        {user && sc && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 border border-fire-3/20 bg-fire-3/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            style={{ clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))' }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-fire-3 to-fire-5 flex items-center justify-center">
                {React.createElement(LEVELS[currentLevelIndex]?.icon || Star, { size: 18, className: 'text-black' })}
              </div>
              <div>
                <div className="font-orbitron font-bold text-fire-5">{user.full_name}</div>
                <div className="font-mono text-[10px] text-white/30">
                  {LEVELS[currentLevelIndex]?.name} · {userPoints.toLocaleString()} SC totali
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="flex-1 sm:w-48">
                <div className="flex justify-between font-mono text-[9px] text-white/25 mb-1">
                  <span>Prossimo livello</span>
                  <span>{sc.next_level_progress || 0}%</span>
                </div>
                <div className="h-1.5 bg-white/5 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-fire-3 to-fire-5 transition-all duration-700"
                    style={{ width: `${sc.next_level_progress || 0}%` }} />
                </div>
              </div>
              <Link to="/dashboard-fan" className="btn-ghost text-[10px] py-2 px-4 whitespace-nowrap flex-shrink-0">
                Dashboard →
              </Link>
            </div>
          </motion.div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-8 border-b border-white/8">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-5 py-3 font-mono text-[11px] tracking-[1px] uppercase transition-all border-b-2 -mb-px ${
                  active
                    ? 'border-fire-4 text-fire-4'
                    : 'border-transparent text-white/30 hover:text-white/60'
                }`}
              >
                <Icon size={13} />
                <span className="hidden sm:block">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ── LEVELS TAB ── */}
        {activeTab === 'levels' && (
          <>
            {/* Visual progression bar */}
            <div className="mb-10 relative">
              <div className="flex items-center justify-between relative z-10">
                {LEVELS.map((level, i) => {
                  const Icon = level.icon;
                  const unlocked = i <= currentLevelIndex;
                  const isCur = level.key === currentLevel;
                  return (
                    <div key={level.key} className="flex flex-col items-center gap-2 flex-1">
                      <motion.div
                        animate={isCur ? { scale: [1, 1.12, 1] } : {}}
                        transition={{ repeat: Infinity, duration: 2.5 }}
                        className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                          isCur ? 'shadow-lg' : ''
                        }`}
                        style={{
                          background: unlocked ? `linear-gradient(135deg, ${level.accent}88, ${level.accent}44)` : 'rgba(255,255,255,0.04)',
                          borderColor: unlocked ? level.accent : 'rgba(255,255,255,0.08)',
                          boxShadow: isCur ? `0 0 20px ${level.accent}66` : 'none',
                        }}
                      >
                        <Icon size={16} style={{ color: unlocked ? level.accent : 'rgba(255,255,255,0.2)' }} />
                      </motion.div>
                      <span className="font-mono text-[8px] tracking-[1px] text-center hidden sm:block"
                        style={{ color: unlocked ? level.accent : 'rgba(255,255,255,0.2)' }}>
                        {level.name}
                      </span>
                      <span className="font-mono text-[7px] text-center hidden sm:block"
                        style={{ color: 'rgba(255,255,255,0.2)' }}>
                        {level.requirement === 0 ? '0' : `${level.requirement.toLocaleString()}`} SC
                      </span>
                    </div>
                  );
                })}
              </div>
              {/* connector line */}
              <div className="absolute top-5 left-[5%] right-[5%] h-[2px] -z-0 bg-white/5" />
              <div className="absolute top-5 left-[5%] h-[2px] -z-0 bg-gradient-to-r from-fire-3 to-fire-5 transition-all duration-700"
                style={{ width: `${(currentLevelIndex / (LEVELS.length - 1)) * 90}%` }} />
            </div>

            {/* Level cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {LEVELS.map((level, i) => (
                <LevelCard
                  key={level.key}
                  level={level}
                  isUnlocked={i <= currentLevelIndex}
                  isCurrent={level.key === currentLevel}
                  userPoints={userPoints}
                />
              ))}
            </div>
          </>
        )}

        {/* ── ONLINE ACTIONS TAB ── */}
        {activeTab === 'online' && (
          <div>
            <div className="mb-6 p-4 bg-cyan/5 border border-cyan/20 flex items-start gap-3">
              <Wifi size={16} className="text-cyan flex-shrink-0 mt-0.5" />
              <p className="font-rajdhani text-sm text-white/60">
                Le azioni online vengono tracciate automaticamente dalla piattaforma. I punti vengono accreditati in tempo reale sul tuo profilo Street Cred.
              </p>
            </div>
            <div className="space-y-1.5">
              {ONLINE_ACTIONS.map((action, i) => (
                <ActionRow key={i} index={i} {...action} />
              ))}
            </div>
          </div>
        )}

        {/* ── OFFLINE ACTIONS TAB ── */}
        {activeTab === 'offline' && (
          <div>
            <div className="mb-6 p-4 bg-fire-3/5 border border-fire-3/20 flex items-start gap-3">
              <MapPin size={16} className="text-fire-4 flex-shrink-0 mt-0.5" />
              <p className="font-rajdhani text-sm text-white/60">
                Le azioni offline vengono registrate tramite QR code in arena o dallo staff durante gli eventi. Porta la tua app con te agli eventi SD per guadagnare più punti.
              </p>
            </div>
            <div className="space-y-1.5">
              {OFFLINE_ACTIONS.map((action, i) => (
                <ActionRow key={i} index={i} {...action} />
              ))}
            </div>

            {/* Offline CTA */}
            <div className="mt-8 p-6 border border-fire-3/20 bg-fire-3/5 text-center"
              style={{ clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))' }}>
              <div className="text-3xl mb-3">📍</div>
              <p className="font-orbitron font-bold text-fire-5 mb-2">Vieni agli eventi live</p>
              <p className="font-rajdhani text-sm text-white/40 mb-4 max-w-md mx-auto">
                Registrati a un evento SD e usa il QR check-in all'ingresso per guadagnare fino a <span className="text-fire-4 font-bold">200 SC</span> in una sola giornata.
              </p>
              <Link to="/Home" className="btn-fire text-[11px] py-3 px-8 inline-block">
                VEDI EVENTI →
              </Link>
            </div>
          </div>
        )}

        {/* Bottom CTA */}
        <div className="mt-14 mb-6 text-center">
          <p className="font-mono text-[10px] text-white/20 mb-4">Già {userPoints.toLocaleString()} SC accumulati</p>
          <Link to="/dashboard-fan" className="btn-fire text-[11px] py-3 px-10 inline-block">
            VAI AL TUO DASHBOARD →
          </Link>
        </div>
      </div>

      <FireRule />
      <Footer lang={lang} />
    </div>
  );
}