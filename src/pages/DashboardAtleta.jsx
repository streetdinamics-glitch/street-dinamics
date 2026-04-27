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
  const labelStyles = {
    fire: 'text-fire-4',
    cyan: 'text-cyan-400',
    purple: 'text-purple-400',
  };
  return (
    <Link
      to={to}
      className={`flex gap-3 p-4 border bg-black/30 transition-all no-underline block ${styles[color]}`}
      style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))' }}
    >
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

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: stats = [] } = useQuery({
    queryKey: ['athlete-stats', user?.email],
    queryFn: () => base44.entities.AthleteStats.filter({ athlete_email: user.email }),
    enabled: !!user,
    initialData: [],
  });

  const { data: badges = [] } = useQuery({
    queryKey: ['athlete-badges', user?.email],
    queryFn: () => base44.entities.AthleteBadge.filter({ athlete_email: user.email }),
    enabled: !!user,
    initialData: [],
  });

  const { data: tokens = [] } = useQuery({
    queryKey: ['athlete-tokens', user?.email],
    queryFn: () => base44.entities.AthleteToken.filter({ athlete_email: user.email }),
    enabled: !!user,
    initialData: [],
  });

  const { data: registrations = [] } = useQuery({
    queryKey: ['athlete-registrations', user?.email],
    queryFn: () => base44.entities.Registration.filter({ email: user.email, type: 'athlete' }),
    enabled: !!user,
    initialData: [],
  });

  const latestStats = stats[0];
  const totalTokens = tokens.reduce((sum, t) => sum + (t.total_supply || 0), 0);
  const availableTokens = tokens.reduce((sum, t) => sum + (t.available_supply || 0), 0);

  return (
    <div className="relative min-h-screen bg-cyber-void text-[var(--text-main)]">
      <CyberOverlays />
      <Navbar onScrollTo={() => {}} lang={lang} onLangSwitch={setLang} onProfileClick={() => {}} />

      <div className="pt-[80px] section-container max-w-4xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <p className="font-mono text-[10px] tracking-[7px] uppercase text-cyan-400/40 mb-1">DASHBOARD</p>
          <h1 className="font-orbitron font-black text-[clamp(32px,6vw,64px)] leading-none mb-1" style={{ background: 'linear-gradient(135deg, #00ffee, #0099ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            ATLETA
          </h1>
          <p className="font-rajdhani text-base text-white/40">Ciao, <span className="text-cyan-400">{user?.full_name || 'Atleta'}</span> — la tua carriera SD.</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <StatCard emoji="⚔️" label="Tornei partecipati" value={latestStats?.events_participated || registrations.length} />
          <StatCard emoji="🏆" label="Vittorie" value={latestStats?.wins || 0} sub={`${latestStats?.podium_finishes || 0} podi`} />
          <StatCard emoji="🎖️" label="Badge guadagnati" value={badges.length} />
          <StatCard emoji="🃏" label="Card emesse" value={totalTokens} sub={`${availableTokens} disponibili`} />
        </div>

        {/* Badges */}
        {badges.length > 0 && (
          <div className="mb-8">
            <p className="font-mono text-[10px] tracking-[5px] uppercase text-cyan-400/40 mb-4">I TUOI BADGE</p>
            <div className="flex flex-wrap gap-2">
              {badges.map(b => (
                <div key={b.id} className="px-3 py-1.5 border border-cyan-500/30 bg-cyan-500/5 flex items-center gap-2" title={b.badge_description}>
                  <span>{b.badge_icon || '🏅'}</span>
                  <span className="font-orbitron text-[10px] text-cyan-400">{b.badge_name}</span>
                  <span className={`font-mono text-[8px] ${
                    b.rarity === 'legendary' ? 'text-yellow-400' :
                    b.rarity === 'epic' ? 'text-purple-400' :
                    b.rarity === 'rare' ? 'text-blue-400' : 'text-gray-400'
                  }`}>{b.rarity?.toUpperCase()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Card emesse */}
        {tokens.length > 0 && (
          <div className="mb-8">
            <p className="font-mono text-[10px] tracking-[5px] uppercase text-cyan-400/40 mb-4">LE TUE CARD EMESSE</p>
            <div className="space-y-2">
              {tokens.map(t => {
                const tierColors = {
                  rising_star: 'text-gray-400 border-gray-500/30',
                  breakout_talent: 'text-green-400 border-green-500/30',
                  elite_performer: 'text-blue-400 border-blue-500/30',
                  living_legend: 'text-yellow-400 border-yellow-500/30',
                };
                const cls = tierColors[t.token_tier] || 'text-white/60 border-white/10';
                return (
                  <div key={t.id} className={`flex items-center justify-between p-3 border bg-black/30 ${cls}`}>
                    <div>
                      <div className="font-orbitron text-sm">{t.athlete_name}</div>
                      <div className="font-mono text-[10px] text-white/30">{t.token_tier?.replace(/_/g, ' ')} · #{t.card_number}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-orbitron font-bold text-base">€{t.current_price || t.base_price}</div>
                      <div className="font-mono text-[10px] text-white/30">{t.available_supply}/{t.total_supply} disponibili</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Quick links */}
        <div className="mb-8">
          <p className="font-mono text-[10px] tracking-[5px] uppercase text-cyan-400/40 mb-4">ACCESSO RAPIDO</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <QuickLink to="/AthleteProfile" emoji="👤" label="Il mio profilo atleta" desc="Gestisci bio, sport, stats" color="cyan" />
            <QuickLink to="/Analytics" emoji="📊" label="Analytics" desc="Performance, fan, revenue" color="cyan" />
            <QuickLink to="/NFTDashboard" emoji="💎" label="NFT & Card" desc="Gestisci le tue card emesse" color="purple" />
            <QuickLink to="/window-challenge" emoji="👑" label="Window Challenge" desc="Sfida il campione" color="fire" />
            <QuickLink to="/discipline" emoji="🏆" label="Discipline" desc="Regole e formato degli eventi" color="fire" />
            <QuickLink to="/Home" emoji="📅" label="Prossimi eventi" desc="Registrati al prossimo torneo" color="fire" />
          </div>
        </div>
      </div>

      <FireRule />
      <Footer lang={lang} />
    </div>
  );
}