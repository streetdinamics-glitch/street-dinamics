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
import AthleteXPBar from '../components/gamification/AthleteXPBar';
import LiveTournamentLeaderboard from '../components/gamification/LiveTournamentLeaderboard';
import PushPermissionBanner from '../components/notifications/PushPermissionBanner';
import { usePushNotifications } from '../components/notifications/usePushNotifications';

const QUICK_LINKS = {
  it: [
    { to: '/AthleteProfile', emoji: '👤', label: 'Il mio profilo atleta', desc: 'Gestisci bio, sport, stats', color: 'cyan' },
    { to: '/Analytics', emoji: '📊', label: 'Analytics', desc: 'Performance, fan, revenue', color: 'cyan' },
    { to: '/NFTDashboard', emoji: '💎', label: 'NFT & Card', desc: 'Gestisci le tue card emesse', color: 'purple' },
    { to: '/window-challenge', emoji: '👑', label: 'Window Challenge', desc: 'Sfida il campione', color: 'fire' },
    { to: '/discipline', emoji: '🏆', label: 'Discipline', desc: 'Regole e formato degli eventi', color: 'fire' },
    { to: '/Home', emoji: '📅', label: 'Prossimi eventi', desc: 'Registrati al prossimo torneo', color: 'fire' },
    { to: '/come-funziona', emoji: '🃏', label: 'Come funziona', desc: 'Il sistema card e royalty', color: 'purple' },
    { to: '/formato-evento', emoji: '📋', label: 'Formato evento', desc: 'Come sono strutturati i tornei', color: 'fire' },
  ],
  en: [
    { to: '/AthleteProfile', emoji: '👤', label: 'My athlete profile', desc: 'Manage bio, sports, stats', color: 'cyan' },
    { to: '/Analytics', emoji: '📊', label: 'Analytics', desc: 'Performance, fans, revenue', color: 'cyan' },
    { to: '/NFTDashboard', emoji: '💎', label: 'NFT & Cards', desc: 'Manage your issued cards', color: 'purple' },
    { to: '/window-challenge', emoji: '👑', label: 'Window Challenge', desc: 'Challenge the champion', color: 'fire' },
    { to: '/discipline', emoji: '🏆', label: 'Disciplines', desc: 'Rules and event format', color: 'fire' },
    { to: '/Home', emoji: '📅', label: 'Upcoming events', desc: 'Register for the next tournament', color: 'fire' },
    { to: '/come-funziona', emoji: '🃏', label: 'How it works', desc: 'Cards and royalty system', color: 'purple' },
    { to: '/formato-evento', emoji: '📋', label: 'Event format', desc: 'How tournaments are structured', color: 'fire' },
  ],
  es: [
    { to: '/AthleteProfile', emoji: '👤', label: 'Mi perfil de atleta', desc: 'Gestiona bio, deporte, stats', color: 'cyan' },
    { to: '/Analytics', emoji: '📊', label: 'Analytics', desc: 'Rendimiento, fans, ingresos', color: 'cyan' },
    { to: '/NFTDashboard', emoji: '💎', label: 'NFT & Cards', desc: 'Gestiona tus cards emitidas', color: 'purple' },
    { to: '/window-challenge', emoji: '👑', label: 'Window Challenge', desc: 'Desafía al campeón', color: 'fire' },
    { to: '/discipline', emoji: '🏆', label: 'Disciplinas', desc: 'Reglas y formato del evento', color: 'fire' },
    { to: '/Home', emoji: '📅', label: 'Próximos eventos', desc: 'Regístrate en el próximo torneo', color: 'fire' },
    { to: '/come-funziona', emoji: '🃏', label: 'Cómo funciona', desc: 'Sistema de cards y regalías', color: 'purple' },
    { to: '/formato-evento', emoji: '📋', label: 'Formato del evento', desc: 'Cómo se estructuran los torneos', color: 'fire' },
  ],
  fr: [
    { to: '/AthleteProfile', emoji: '👤', label: 'Mon profil athlète', desc: 'Gérer bio, sport, stats', color: 'cyan' },
    { to: '/Analytics', emoji: '📊', label: 'Analytics', desc: 'Performance, fans, revenus', color: 'cyan' },
    { to: '/NFTDashboard', emoji: '💎', label: 'NFT & Cards', desc: 'Gérer tes cards émises', color: 'purple' },
    { to: '/window-challenge', emoji: '👑', label: 'Window Challenge', desc: 'Défie le champion', color: 'fire' },
    { to: '/discipline', emoji: '🏆', label: 'Disciplines', desc: 'Règles et format des événements', color: 'fire' },
    { to: '/Home', emoji: '📅', label: 'Prochains événements', desc: 'Inscris-toi au prochain tournoi', color: 'fire' },
    { to: '/come-funziona', emoji: '🃏', label: 'Comment ça marche', desc: 'Système de cards et royalties', color: 'purple' },
    { to: '/formato-evento', emoji: '📋', label: "Format d'événement", desc: 'Comment les tournois sont structurés', color: 'fire' },
  ],
  ar: [
    { to: '/AthleteProfile', emoji: '👤', label: 'ملفي الرياضي', desc: 'إدارة السيرة والرياضة والإحصاءات', color: 'cyan' },
    { to: '/Analytics', emoji: '📊', label: 'التحليلات', desc: 'الأداء والمشجعون والإيرادات', color: 'cyan' },
    { to: '/NFTDashboard', emoji: '💎', label: 'NFT والبطاقات', desc: 'إدارة بطاقاتك الصادرة', color: 'purple' },
    { to: '/window-challenge', emoji: '👑', label: 'تحدي النافذة', desc: 'تحدى البطل', color: 'fire' },
    { to: '/discipline', emoji: '🏆', label: 'التخصصات', desc: 'القواعد وتنسيق الأحداث', color: 'fire' },
    { to: '/Home', emoji: '📅', label: 'الأحداث القادمة', desc: 'سجّل في البطولة القادمة', color: 'fire' },
    { to: '/come-funziona', emoji: '🃏', label: 'كيف يعمل', desc: 'نظام البطاقات والإتاوات', color: 'purple' },
    { to: '/formato-evento', emoji: '📋', label: 'تنسيق الحدث', desc: 'كيف تُبنى البطولات', color: 'fire' },
  ],
  de: [
    { to: '/AthleteProfile', emoji: '👤', label: 'Mein Athletenprofil', desc: 'Bio, Sport, Stats verwalten', color: 'cyan' },
    { to: '/Analytics', emoji: '📊', label: 'Analytics', desc: 'Performance, Fans, Einnahmen', color: 'cyan' },
    { to: '/NFTDashboard', emoji: '💎', label: 'NFT & Cards', desc: 'Deine ausgegebenen Cards verwalten', color: 'purple' },
    { to: '/window-challenge', emoji: '👑', label: 'Window Challenge', desc: 'Den Champion herausfordern', color: 'fire' },
    { to: '/discipline', emoji: '🏆', label: 'Disziplinen', desc: 'Regeln und Eventformat', color: 'fire' },
    { to: '/Home', emoji: '📅', label: 'Bevorstehende Events', desc: 'Für das nächste Turnier anmelden', color: 'fire' },
    { to: '/come-funziona', emoji: '🃏', label: 'Wie es funktioniert', desc: 'Card- und Royalty-System', color: 'purple' },
    { to: '/formato-evento', emoji: '📋', label: 'Eventformat', desc: 'Wie Turniere aufgebaut sind', color: 'fire' },
  ],
};

function StatCard({ emoji, label, value, sub }) {
  return (
    <div className="border border-cyan-500/20 bg-cyan-500/5 p-4" style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))' }}>
      <div className="text-2xl mb-2">{emoji}</div>
      <div className="font-orbitron font-bold text-2xl text-cyan-400">{value}</div>
      <div className="font-rajdhani text-sm text-white/50">{label}</div>
      {sub && <div className="font-mono text-[10px] text-white/30 mt-1">{sub}</div>}
    </div>
  );
}

function QuickLink({ to, emoji, label, desc, color = 'fire' }) {
  const styles = {
    fire: 'border-fire-3/10 hover:border-fire-3/40 hover:bg-fire-3/5',
    cyan: 'border-cyan-500/15 hover:border-cyan-500/40 hover:bg-cyan-500/5',
    purple: 'border-purple-500/15 hover:border-purple-500/40 hover:bg-purple-500/5',
  };
  const labelStyles = { fire: 'text-fire-4', cyan: 'text-cyan-400', purple: 'text-purple-400' };
  return (
    <Link to={to} className={`flex gap-3 p-4 border bg-black/30 transition-all no-underline block ${styles[color]}`}
      style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))' }}>
      <span className="text-2xl flex-shrink-0">{emoji}</span>
      <div>
        <div className={`font-orbitron text-sm ${labelStyles[color]}`}>{label}</div>
        <div className="font-rajdhani text-xs text-white/40">{desc}</div>
      </div>
    </Link>
  );
}

export default function DashboardAtleta() {
  const [lang, setLang] = useLang();
  const t = useTranslation(lang);
  const links = QUICK_LINKS[lang] || QUICK_LINKS.en;

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
  const availableTokens = tokens.reduce((sum, t) => sum + (t.available_supply || 0), 0);

  return (
    <div className="relative min-h-screen bg-cyber-void text-[var(--text-main)]">
      <CyberOverlays />
      <Navbar onScrollTo={() => {}} lang={lang} onLangSwitch={setLang} onProfileClick={() => {}} />

      <div className="pt-[80px] section-container max-w-4xl">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <p className="font-mono text-[10px] tracking-[7px] uppercase text-cyan-400/40 mb-1">DASHBOARD</p>
          <h1 className="font-orbitron font-black text-[clamp(32px,6vw,64px)] leading-none mb-1" style={{ background: 'linear-gradient(135deg, #00ffee, #0099ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {t('dash_athlete_title')}
          </h1>
          <p className="font-rajdhani text-base text-white/40">👋 <span className="text-cyan-400">{user?.full_name || 'Atleta'}</span> — {t('dash_athlete_subtitle')}</p>
        </motion.div>

        <AthleteXPBar stats={latestStats} badges={badges} tokens={tokens} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <StatCard emoji="⚔️" label={t('dash_stat_events')} value={latestStats?.events_participated || registrations.length} />
          <StatCard emoji="🏆" label={t('dash_stat_wins')} value={latestStats?.wins || 0} sub={`${latestStats?.podium_finishes || 0} ${t('dash_stat_podium')}`} />
          <StatCard emoji="🎖️" label={t('dash_stat_badges')} value={badges.length} />
          <StatCard emoji="🃏" label={t('dash_stat_issued')} value={totalTokens} sub={`${availableTokens} ${t('dash_stat_avail')}`} />
        </div>

        {badges.length > 0 && (
          <div className="mb-8">
            <p className="font-mono text-[10px] tracking-[5px] uppercase text-cyan-400/40 mb-4">{t('dash_athlete_badges')}</p>
            <div className="flex flex-wrap gap-2">
              {badges.map(b => (
                <div key={b.id} className="px-3 py-1.5 border border-cyan-500/30 bg-cyan-500/5 flex items-center gap-2" title={b.badge_description}>
                  <span>{b.badge_icon || '🏅'}</span>
                  <span className="font-orbitron text-[10px] text-cyan-400">{b.badge_name}</span>
                  <span className={`font-mono text-[8px] ${b.rarity === 'legendary' ? 'text-yellow-400' : b.rarity === 'epic' ? 'text-purple-400' : b.rarity === 'rare' ? 'text-blue-400' : 'text-gray-400'}`}>{b.rarity?.toUpperCase()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tokens.length > 0 && (
          <div className="mb-8">
            <p className="font-mono text-[10px] tracking-[5px] uppercase text-cyan-400/40 mb-4">{t('dash_athlete_cards')}</p>
            <div className="space-y-2">
              {tokens.map(tok => {
                const tierColors = { rising_star: 'text-gray-400 border-gray-500/30', breakout_talent: 'text-green-400 border-green-500/30', elite_performer: 'text-blue-400 border-blue-500/30', living_legend: 'text-yellow-400 border-yellow-500/30' };
                const cls = tierColors[tok.token_tier] || 'text-white/60 border-white/10';
                return (
                  <div key={tok.id} className={`flex items-center justify-between p-3 border bg-black/30 ${cls}`}>
                    <div>
                      <div className="font-orbitron text-sm">{tok.athlete_name}</div>
                      <div className="font-mono text-[10px] text-white/30">{tok.token_tier?.replace(/_/g, ' ')} · #{tok.card_number}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-orbitron font-bold text-base">€{tok.current_price || tok.base_price}</div>
                      <div className="font-mono text-[10px] text-white/30">{tok.available_supply}/{tok.total_supply} {t('dash_stat_avail')}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <LiveTournamentLeaderboard lang={lang} />

        <div className="mb-8">
          <p className="font-mono text-[10px] tracking-[5px] uppercase text-cyan-400/40 mb-4">{t('dash_quick_access')}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {links.map(l => <QuickLink key={l.to} {...l} />)}
          </div>
        </div>
      </div>

      <FireRule />
      <Footer lang={lang} />

      {isSupported && <PushPermissionBanner onRequestPermission={requestPermission} permission={permission} />}
    </div>
  );
}