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

const ADMIN_LABELS = {
  it: { recentEvents: 'EVENTI RECENTI', tools: 'STRUMENTI ADMIN', noEvents: 'Nessun evento.', createFirst: 'Crea il primo →', subtitle: 'Controllo totale del sistema SD' },
  en: { recentEvents: 'RECENT EVENTS', tools: 'ADMIN TOOLS', noEvents: 'No events.', createFirst: 'Create the first →', subtitle: 'Full system control' },
  es: { recentEvents: 'EVENTOS RECIENTES', tools: 'HERRAMIENTAS ADMIN', noEvents: 'Sin eventos.', createFirst: 'Crear el primero →', subtitle: 'Control total del sistema' },
  fr: { recentEvents: 'ÉVÉNEMENTS RÉCENTS', tools: 'OUTILS ADMIN', noEvents: 'Aucun événement.', createFirst: 'Créer le premier →', subtitle: 'Contrôle total du système' },
  ar: { recentEvents: 'الأحداث الأخيرة', tools: 'أدوات الإدارة', noEvents: 'لا أحداث.', createFirst: 'أنشئ الأول →', subtitle: 'السيطرة الكاملة على النظام' },
  de: { recentEvents: 'AKTUELLE EVENTS', tools: 'ADMIN-WERKZEUGE', noEvents: 'Keine Events.', createFirst: 'Erstes erstellen →', subtitle: 'Vollständige Systemkontrolle' },
};

function StatCard({ emoji, label, value, sub, color = 'green' }) {
  const colors = {
    green: 'border-green-500/20 bg-green-500/5 text-green-400',
    fire: 'border-fire-3/20 bg-fire-3/5 text-fire-4',
    yellow: 'border-yellow-500/20 bg-yellow-500/5 text-yellow-400',
    red: 'border-red-500/20 bg-red-500/5 text-red-400',
  };
  return (
    <div className={`border p-4 ${colors[color]}`} style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))' }}>
      <div className="text-2xl mb-2">{emoji}</div>
      <div className={`font-orbitron font-bold text-2xl ${colors[color].split(' ').pop()}`}>{value}</div>
      <div className="font-rajdhani text-sm text-white/50">{label}</div>
      {sub && <div className="font-mono text-[10px] text-white/30 mt-1">{sub}</div>}
    </div>
  );
}

function AdminLink({ to, emoji, label, desc, color = 'green' }) {
  const styles = {
    green: 'border-green-500/15 hover:border-green-500/50 hover:bg-green-500/5 text-green-400',
    fire: 'border-fire-3/15 hover:border-fire-3/50 hover:bg-fire-3/5 text-fire-4',
    yellow: 'border-yellow-500/15 hover:border-yellow-500/50 hover:bg-yellow-500/5 text-yellow-400',
    red: 'border-red-500/15 hover:border-red-500/50 hover:bg-red-500/5 text-red-400',
    purple: 'border-purple-500/15 hover:border-purple-500/50 hover:bg-purple-500/5 text-purple-400',
  };
  return (
    <Link
      to={to}
      className={`flex gap-3 p-4 border bg-black/30 transition-all no-underline block ${styles[color]}`}
      style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))' }}
    >
      <span className="text-2xl flex-shrink-0">{emoji}</span>
      <div>
        <div className={`font-orbitron text-sm ${styles[color].split(' ').pop()}`}>{label}</div>
        <div className="font-rajdhani text-xs text-white/40">{desc}</div>
      </div>
    </Link>
  );
}

export default function DashboardAdmin() {
  const [lang, setLang] = useLang();
  const AL = ADMIN_LABELS[lang] || ADMIN_LABELS.it;

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: events = [] } = useQuery({
    queryKey: ['all-events'],
    queryFn: () => base44.entities.Event.list('-created_date', 50),
    initialData: [],
  });

  const { data: registrations = [] } = useQuery({
    queryKey: ['all-registrations'],
    queryFn: () => base44.entities.Registration.list('-created_date', 200),
    initialData: [],
  });

  const { data: sponsors = [] } = useQuery({
    queryKey: ['all-sponsors'],
    queryFn: () => base44.entities.Sponsor.list(),
    initialData: [],
  });

  const { data: disputes = [] } = useQuery({
    queryKey: ['all-disputes'],
    queryFn: () => base44.entities.Dispute.filter({ status: 'open' }),
    initialData: [],
  });

  const liveEvents = events.filter(e => e.status === 'live').length;
  const upcomingEvents = events.filter(e => e.status === 'upcoming').length;
  const pendingRegs = registrations.filter(r => r.status === 'pending').length;
  const activeSponsors = sponsors.filter(s => s.status === 'active').length;

  return (
    <div className="relative min-h-screen bg-cyber-void text-[var(--text-main)]">
      <CyberOverlays />
      <Navbar onScrollTo={() => {}} lang={lang} onLangSwitch={setLang} onProfileClick={() => {}} />

      <div className="pt-[80px] section-container max-w-5xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <p className="font-mono text-[10px] tracking-[7px] uppercase text-green-500/40 mb-1">DASHBOARD</p>
          <h1 className="font-orbitron font-black text-[clamp(32px,6vw,64px)] leading-none mb-1 text-green-400">ADMIN</h1>
          <p className="font-rajdhani text-base text-white/40">{AL.subtitle} — <span className="text-green-400">{user?.full_name}</span></p>
        </motion.div>

        {/* System stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <StatCard emoji="🔴" label="Live ora" value={liveEvents} color="red" />
          <StatCard emoji="📅" label="Prossimi eventi" value={upcomingEvents} color="fire" />
          <StatCard emoji="⏳" label="Registrazioni pending" value={pendingRegs} color="yellow" />
          <StatCard emoji="🤝" label="Sponsor attivi" value={activeSponsors} color="green" />
        </div>

        {/* Alerts */}
        {(pendingRegs > 0 || disputes.length > 0) && (
          <div className="mb-8 space-y-2">
            {pendingRegs > 0 && (
              <div className="flex items-center justify-between p-3 border border-yellow-500/40 bg-yellow-500/10">
                <div className="flex items-center gap-2">
                  <span className="text-yellow-400 text-lg">⚠️</span>
                  <span className="font-orbitron text-sm text-yellow-400">{pendingRegs} registrazioni in attesa di approvazione</span>
                </div>
                <Link to="/Admin" className="font-mono text-[10px] text-yellow-400 border border-yellow-500/40 px-3 py-1 hover:bg-yellow-500/20 transition-all no-underline">GESTISCI</Link>
              </div>
            )}
            {disputes.length > 0 && (
              <div className="flex items-center justify-between p-3 border border-red-500/40 bg-red-500/10">
                <div className="flex items-center gap-2">
                  <span className="text-red-400 text-lg">🚨</span>
                  <span className="font-orbitron text-sm text-red-400">{disputes.length} dispute aperte</span>
                </div>
                <Link to="/Admin" className="font-mono text-[10px] text-red-400 border border-red-500/40 px-3 py-1 hover:bg-red-500/20 transition-all no-underline">GESTISCI</Link>
              </div>
            )}
          </div>
        )}

        {/* Recent events summary */}
        <div className="mb-8">
          <p className="font-mono text-[10px] tracking-[5px] uppercase text-green-500/40 mb-4">{AL.recentEvents}</p>
          {events.length === 0 ? (
            <div className="border border-white/5 p-4 text-center">
              <p className="font-rajdhani text-white/30">{AL.noEvents} <Link to="/CreateEvent" className="text-green-400">{AL.createFirst}</Link></p>
            </div>
          ) : (
            <div className="space-y-2">
              {events.slice(0, 5).map(e => (
                <div key={e.id} className="flex items-center justify-between p-3 border border-white/5 bg-white/2">
                  <div>
                    <div className="font-orbitron text-sm text-white/80">{e.title}</div>
                    <div className="font-mono text-[10px] text-white/30">{e.sport} · {e.date} · {e.location}</div>
                  </div>
                  <span className={`font-mono text-[10px] px-2 py-1 border ${
                    e.status === 'live' ? 'border-red-500/60 text-red-400 animate-pulse' :
                    e.status === 'upcoming' ? 'border-yellow-500/40 text-yellow-400' :
                    'border-white/20 text-white/30'
                  }`}>{e.status?.toUpperCase()}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick links grid */}
        <div className="mb-8">
          <p className="font-mono text-[10px] tracking-[5px] uppercase text-green-500/40 mb-4">{AL.tools}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <AdminLink to="/CreateEvent" emoji="➕" label="Crea evento" desc="Nuovo torneo SD" color="green" />
            <AdminLink to="/Admin" emoji="🔧" label="Pannello Admin" desc="Tutte le funzioni admin" color="green" />
            <AdminLink to="/Analytics" emoji="📊" label="Analytics" desc="Statistiche piattaforma" color="fire" />
            <AdminLink to="/NFTDashboard" emoji="💎" label="NFT & Card" desc="Gestione drop e token" color="purple" />
            <AdminLink to="/VotingHub" emoji="🗳️" label="Voting Hub" desc="Gestisci campagne di voto" color="yellow" />
            <AdminLink to="/Web3" emoji="⛓️" label="Web3" desc="Configurazione blockchain" color="purple" />
          </div>
        </div>
      </div>

      <FireRule />
      <Footer lang={lang} />
    </div>
  );
}