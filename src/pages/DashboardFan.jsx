import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import CyberOverlays from '../components/cyber/CyberOverlays';
import Navbar from '../components/cyber/Navbar';
import Footer from '../components/cyber/Footer';
import FireRule from '../components/cyber/FireRule';
import { useLang } from '../components/useLang';
import { useTranslation } from '../components/translations';
import EthicBettingPanel from '../components/gamification/EthicBettingPanel';
import LiveTournamentLeaderboard from '../components/gamification/LiveTournamentLeaderboard';

const DASH_LABELS = {
  it: { subtitle: 'il tuo spazio', lastEvents: 'ULTIMI EVENTI', noReg: 'Nessuna registrazione ancora.', explore: 'Esplora gli eventi →', quickAccess: 'ACCESSO RAPIDO', links: [
    { to: '/Home', emoji: '⚽', label: 'Prossimi eventi', desc: 'Registrati come atleta o spettatore' },
    { to: '/come-funziona', emoji: '🃏', label: 'Come funziona', desc: 'Capire il sistema delle card' },
    { to: '/discipline', emoji: '🏆', label: 'Discipline', desc: 'Regole e Window Challenge' },
    { to: '/scarsita', emoji: '📊', label: 'Simulatore', desc: 'Calcola il potenziale delle tue card' },
    { to: '/NFTDashboard', emoji: '💎', label: 'NFT & Token', desc: 'Il tuo portfolio digitale' },
    { to: '/window-challenge', emoji: '👑', label: 'Window Challenge', desc: 'La finestra dei campioni' },
    { to: '/VotingHub', emoji: '🗳️', label: 'Vota', desc: 'Esprimi il tuo voto sugli eventi live' },
    { to: '/UserProfile', emoji: '👤', label: 'Il mio profilo', desc: 'Badge, punti, cronologia' },
  ]},
  en: { subtitle: 'your space', lastEvents: 'RECENT EVENTS', noReg: 'No registrations yet.', explore: 'Explore events →', quickAccess: 'QUICK ACCESS', links: [
    { to: '/Home', emoji: '⚽', label: 'Upcoming events', desc: 'Register as athlete or spectator' },
    { to: '/come-funziona', emoji: '🃏', label: 'How it works', desc: 'Understand the card system' },
    { to: '/discipline', emoji: '🏆', label: 'Disciplines', desc: 'Rules and Window Challenge' },
    { to: '/scarsita', emoji: '📊', label: 'Simulator', desc: 'Calculate your card potential' },
    { to: '/NFTDashboard', emoji: '💎', label: 'NFT & Tokens', desc: 'Your digital portfolio' },
    { to: '/window-challenge', emoji: '👑', label: 'Window Challenge', desc: 'The champion window' },
    { to: '/VotingHub', emoji: '🗳️', label: 'Vote', desc: 'Vote on live events' },
    { to: '/UserProfile', emoji: '👤', label: 'My profile', desc: 'Badges, points, history' },
  ]},
  es: { subtitle: 'tu espacio', lastEvents: 'ÚLTIMOS EVENTOS', noReg: 'Sin registros aún.', explore: 'Explorar eventos →', quickAccess: 'ACCESO RÁPIDO', links: [
    { to: '/Home', emoji: '⚽', label: 'Próximos eventos', desc: 'Regístrate como atleta o espectador' },
    { to: '/come-funziona', emoji: '🃏', label: 'Cómo funciona', desc: 'Entiende el sistema de cards' },
    { to: '/discipline', emoji: '🏆', label: 'Disciplinas', desc: 'Reglas y Window Challenge' },
    { to: '/scarsita', emoji: '📊', label: 'Simulador', desc: 'Calcula el potencial de tus cards' },
    { to: '/NFTDashboard', emoji: '💎', label: 'NFT & Tokens', desc: 'Tu portfolio digital' },
    { to: '/window-challenge', emoji: '👑', label: 'Window Challenge', desc: 'La ventana del campeón' },
    { to: '/VotingHub', emoji: '🗳️', label: 'Votar', desc: 'Vota en eventos en vivo' },
    { to: '/UserProfile', emoji: '👤', label: 'Mi perfil', desc: 'Badges, puntos, historial' },
  ]},
  fr: { subtitle: 'ton espace', lastEvents: 'DERNIERS ÉVÉNEMENTS', noReg: 'Aucune inscription encore.', explore: 'Explorer les événements →', quickAccess: 'ACCÈS RAPIDE', links: [
    { to: '/Home', emoji: '⚽', label: 'Prochains événements', desc: 'Inscris-toi comme athlète ou spectateur' },
    { to: '/come-funziona', emoji: '🃏', label: 'Comment ça marche', desc: 'Comprendre le système des cards' },
    { to: '/discipline', emoji: '🏆', label: 'Disciplines', desc: 'Règles et Window Challenge' },
    { to: '/scarsita', emoji: '📊', label: 'Simulateur', desc: 'Calcule le potentiel de tes cards' },
    { to: '/NFTDashboard', emoji: '💎', label: 'NFT & Tokens', desc: 'Ton portfolio digital' },
    { to: '/window-challenge', emoji: '👑', label: 'Window Challenge', desc: 'La fenêtre des champions' },
    { to: '/VotingHub', emoji: '🗳️', label: 'Voter', desc: 'Vote sur les événements en direct' },
    { to: '/UserProfile', emoji: '👤', label: 'Mon profil', desc: 'Badges, points, historique' },
  ]},
  ar: { subtitle: 'مساحتك', lastEvents: 'آخر الأحداث', noReg: 'لا تسجيلات بعد.', explore: 'استكشف الأحداث →', quickAccess: 'وصول سريع', links: [
    { to: '/Home', emoji: '⚽', label: 'الأحداث القادمة', desc: 'سجّل كرياضي أو متفرج' },
    { to: '/come-funziona', emoji: '🃏', label: 'كيف يعمل', desc: 'افهم نظام البطاقات' },
    { to: '/discipline', emoji: '🏆', label: 'التخصصات', desc: 'القواعد وتحدي النافذة' },
    { to: '/scarsita', emoji: '📊', label: 'محاكي', desc: 'احسب إمكانية بطاقاتك' },
    { to: '/NFTDashboard', emoji: '💎', label: 'NFT والرموز', desc: 'محفظتك الرقمية' },
    { to: '/window-challenge', emoji: '👑', label: 'تحدي النافذة', desc: 'نافذة البطل' },
    { to: '/VotingHub', emoji: '🗳️', label: 'تصويت', desc: 'صوّت على الأحداث المباشرة' },
    { to: '/UserProfile', emoji: '👤', label: 'ملفي', desc: 'الشارات والنقاط والتاريخ' },
  ]},
  de: { subtitle: 'dein Bereich', lastEvents: 'LETZTE EVENTS', noReg: 'Noch keine Registrierungen.', explore: 'Events erkunden →', quickAccess: 'SCHNELLZUGRIFF', links: [
    { to: '/Home', emoji: '⚽', label: 'Bevorstehende Events', desc: 'Melde dich als Athlet oder Zuschauer an' },
    { to: '/come-funziona', emoji: '🃏', label: 'Wie es funktioniert', desc: 'Das Card-System verstehen' },
    { to: '/discipline', emoji: '🏆', label: 'Disziplinen', desc: 'Regeln und Window Challenge' },
    { to: '/scarsita', emoji: '📊', label: 'Simulator', desc: 'Berechne das Potenzial deiner Cards' },
    { to: '/NFTDashboard', emoji: '💎', label: 'NFT & Tokens', desc: 'Dein digitales Portfolio' },
    { to: '/window-challenge', emoji: '👑', label: 'Window Challenge', desc: 'Das Championsfenster' },
    { to: '/VotingHub', emoji: '🗳️', label: 'Abstimmen', desc: 'Stimme bei Live-Events ab' },
    { to: '/UserProfile', emoji: '👤', label: 'Mein Profil', desc: 'Badges, Punkte, Verlauf' },
  ]},
};

function StatCard({ emoji, label, value, sub, color = 'fire-3' }) {
  return (
    <div className="border border-fire-3/15 bg-black/40 p-4" style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))' }}>
      <div className="text-2xl mb-2">{emoji}</div>
      <div className="font-orbitron font-bold text-2xl text-fire-4">{value}</div>
      <div className="font-rajdhani text-sm text-white/50">{label}</div>
      {sub && <div className="font-mono text-[10px] text-white/30 mt-1">{sub}</div>}
    </div>
  );
}

function QuickLink({ to, emoji, label, desc }) {
  return (
    <Link
      to={to}
      className="flex gap-3 p-4 border border-fire-3/10 bg-black/30 hover:border-fire-3/40 hover:bg-fire-3/5 transition-all no-underline block"
      style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))' }}
    >
      <span className="text-2xl flex-shrink-0">{emoji}</span>
      <div>
        <div className="font-orbitron text-sm text-fire-4">{label}</div>
        <div className="font-rajdhani text-xs text-white/40">{desc}</div>
      </div>
    </Link>
  );
}

export default function DashboardFan() {
  const [lang, setLang] = useLang();
  const DL = DASH_LABELS[lang] || DASH_LABELS.it;

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: registrations = [] } = useQuery({
    queryKey: ['fan-registrations', user?.email],
    queryFn: () => base44.entities.Registration.filter({ email: user.email }),
    enabled: !!user,
    initialData: [],
  });

  const { data: bets = [] } = useQuery({
    queryKey: ['fan-bets', user?.email],
    queryFn: () => base44.entities.Bet.filter({ user_email: user.email }),
    enabled: !!user,
    initialData: [],
  });

  const { data: votes = [] } = useQuery({
    queryKey: ['fan-votes', user?.email],
    queryFn: () => base44.entities.UserVote.filter({ user_email: user.email }),
    enabled: !!user,
    initialData: [],
  });

  const { data: tokens = [] } = useQuery({
    queryKey: ['fan-tokens', user?.email],
    queryFn: () => base44.entities.TokenOwnership.filter({ user_email: user?.email }),
    enabled: !!user,
    initialData: [],
  });

  const wonBets = bets.filter(b => b.result === 'won').length;
  const activeBets = bets.filter(b => b.status === 'active').length;

  return (
    <div className="relative min-h-screen bg-cyber-void text-[var(--text-main)]">
      <CyberOverlays />
      <Navbar onScrollTo={() => {}} lang={lang} onLangSwitch={setLang} onProfileClick={() => {}} />

      <div className="pt-[80px] section-container max-w-4xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <p className="font-mono text-[10px] tracking-[7px] uppercase text-fire-3/40 mb-1">DASHBOARD</p>
          <h1 className="heading-fire text-[clamp(32px,6vw,64px)] font-black leading-none mb-1">FAN ZONE</h1>
          <p className="font-rajdhani text-base text-white/40">👋 <span className="text-fire-4">{user?.full_name || 'Fan'}</span> — {DL.subtitle}</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <StatCard emoji="🎟️" label="Registrazioni" value={registrations.length} sub="eventi" />
          <StatCard emoji="🎲" label="Scommesse attive" value={activeBets} sub={`${wonBets} vinte`} />
          <StatCard emoji="🗳️" label="Voti espressi" value={votes.length} />
          <StatCard emoji="🃏" label="Card possedute" value={tokens.length} />
        </div>

        {/* Ethical Betting */}
        <EthicBettingPanel lang={lang} userEmail={user?.email} />

        {/* Live Tournament Leaderboard */}
        <LiveTournamentLeaderboard lang={lang} />

        {/* Recent registrations */}
        <div className="mb-8">
          <p className="font-mono text-[10px] tracking-[5px] uppercase text-fire-3/40 mb-4">{DL.lastEvents}</p>
          {registrations.length === 0 ? (
            <div className="border border-white/5 bg-white/2 p-6 text-center">
              <p className="font-rajdhani text-white/30">{DL.noReg} <Link to="/Home" className="text-fire-3 hover:text-fire-4">{DL.explore}</Link></p>
            </div>
          ) : (
            <div className="space-y-2">
              {registrations.slice(0, 5).map(r => (
                <div key={r.id} className="flex items-center justify-between p-3 border border-white/5 bg-white/2">
                  <div>
                    <div className="font-orbitron text-sm text-fire-4">{r.type === 'athlete' ? '⚔️ Atleta' : '👁️ Spettatore'}</div>
                    <div className="font-mono text-[10px] text-white/30">{r.sport || '—'} · {r.attendance_mode || 'in-person'}</div>
                  </div>
                  <span className={`font-mono text-[10px] px-2 py-1 border ${
                    r.status === 'confirmed' ? 'border-green-500/40 text-green-400' :
                    r.status === 'rejected' ? 'border-red-500/40 text-red-400' :
                    'border-yellow-500/40 text-yellow-400'
                  }`}>{r.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick links */}
        <div className="mb-8">
          <p className="font-mono text-[10px] tracking-[5px] uppercase text-fire-3/40 mb-4">{DL.quickAccess}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {DL.links.map(l => <QuickLink key={l.to} to={l.to} emoji={l.emoji} label={l.label} desc={l.desc} />)}
          </div>
        </div>
      </div>

      <FireRule />
      <Footer lang={lang} />
    </div>
  );
}