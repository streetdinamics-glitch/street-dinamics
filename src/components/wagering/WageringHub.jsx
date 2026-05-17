import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { Shield, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import WagerCard from './WagerCard';
import { useTranslation } from '../translations';

export default function WageringHub({ lang = 'it' }) {
  const t = useTranslation(lang);
  const { isConnected } = useAccount();
  const [filter, setFilter] = useState('all');

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: liveEvents = [] } = useQuery({
    queryKey: ['live-events'],
    queryFn: () => base44.entities.Event.filter({ status: 'live' }),
    initialData: [],
    refetchInterval: 30000,
  });

  const { data: upcomingEvents = [] } = useQuery({
    queryKey: ['upcoming-events'],
    queryFn: () => base44.entities.Event.filter({ status: 'upcoming' }),
    initialData: [],
  });

  const { data: myTokens = [] } = useQuery({
    queryKey: ['wager-tokens', user?.email],
    queryFn: () => base44.entities.TokenOwnership.filter({ user_email: user.email }),
    enabled: !!user?.email,
    initialData: [],
  });

  const events = [...liveEvents, ...upcomingEvents].slice(0, 6);
  const myAthletes = myTokens.map(t => t.athlete_name);

  // Build mock match pairs from events (in real app, from TournamentMatch entity)
  const matchPairs = events.map((event, i) => ({
    match: { id: event.id, title: event.title },
    athleteA: { name: 'Athlete A', discipline: event.sport, avatar: '🏆', tokenId: 1 },
    athleteB: { name: 'Athlete B', discipline: event.sport, avatar: '⚔️', tokenId: 2 },
  }));

  return (
    <div className="mb-8">
      {/* Section header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="font-mono text-[9px] tracking-[5px] uppercase text-fire-3/40">PILLAR I</p>
          <h3 className="font-orbitron font-black text-xl text-fire-4 mt-0.5">{t('wag_p1_title')}</h3>
          <p className="font-rajdhani text-sm text-white/40 mt-1">{t('wag_p1_desc')}</p>
        </div>
        <div className="flex items-center gap-2 font-mono text-[8px] text-white/25 border border-white/8 px-3 py-2">
          <Shield size={11} className="text-fire-3/60" />
          {t('wag_p1_sub')}
        </div>
      </div>

      {/* My tokens summary */}
      {myAthletes.length > 0 && (
        <div className="mb-4 px-4 py-3 border border-fire-3/15 bg-fire-3/5 flex items-center gap-3 flex-wrap">
          <div className="font-mono text-[9px] text-fire-3/50 uppercase tracking-[2px]">{t('wag_your_athletes')}</div>
          {myAthletes.slice(0, 5).map((name, i) => (
            <span key={i} className="font-orbitron text-[10px] text-fire-4 border border-fire-3/20 px-2 py-0.5">{name}</span>
          ))}
          {myAthletes.length > 5 && (
            <span className="font-mono text-[9px] text-white/30">+{myAthletes.length - 5} {t('wag_more')}</span>
          )}
        </div>
      )}

      {/* Wallet required */}
      {!isConnected && (
        <div className="mb-5 px-5 py-4 border border-yellow-500/25 bg-yellow-500/5 text-center">
          <p className="font-orbitron text-sm text-yellow-400 mb-1">{t('wag_token_req')}</p>
          <p className="font-rajdhani text-sm text-white/40">{t('wag_token_req_desc')}</p>
        </div>
      )}

      {/* Match cards grid */}
      {matchPairs.length === 0 ? (
        <div className="border border-white/5 p-8 text-center">
          <Zap size={24} className="text-fire-3/20 mx-auto mb-2" />
          <p className="font-rajdhani text-white/25 text-sm">{t('wag_no_matches')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {matchPairs.map((pair, i) => (
            <motion.div key={pair.match.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
              <WagerCard match={pair.match} athleteA={pair.athleteA} athleteB={pair.athleteB} existingWager={null} onWagerCreated={(data) => console.log('Wager created', data)} />
            </motion.div>
          ))}
        </div>
      )}

      {/* How it works */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-4 gap-0">
        {[
          { n: '01', title: t('wag_step1_t'), d: t('wag_step1_d') },
          { n: '02', title: t('wag_step2_t'), d: t('wag_step2_d') },
          { n: '03', title: t('wag_step3_t'), d: t('wag_step3_d') },
          { n: '04', title: t('wag_step4_t'), d: t('wag_step4_d') },
        ].map((s, i) => (
          <div key={i} className="flex-1 p-4 bg-black/30 border border-fire-3/8 border-r-0 last:border-r">
            <div className="font-orbitron font-black text-xl text-fire-3/15 mb-1">{s.n}</div>
            <div className="font-orbitron text-xs text-fire-4/60 mb-1">{s.title}</div>
            <div className="font-rajdhani text-xs text-white/30">{s.d}</div>
          </div>
        ))}
      </div>
    </div>
  );
}