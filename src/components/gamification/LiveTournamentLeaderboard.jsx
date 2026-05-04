import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const MEDAL = ['🥇', '🥈', '🥉'];

const LABELS = {
  it: { title: 'CLASSIFICA LIVE', noTournament: 'Nessun torneo live al momento.', wins: 'Vinte', losses: 'Perse', pts: 'PTS' },
  en: { title: 'LIVE LEADERBOARD', noTournament: 'No live tournament right now.', wins: 'Wins', losses: 'Losses', pts: 'PTS' },
  es: { title: 'CLASIFICACIÓN LIVE', noTournament: 'No hay torneo en vivo ahora.', wins: 'Ganadas', losses: 'Perdidas', pts: 'PTS' },
  fr: { title: 'CLASSEMENT LIVE', noTournament: 'Pas de tournoi en direct pour l\'instant.', wins: 'Victoires', losses: 'Défaites', pts: 'PTS' },
  ar: { title: 'الترتيب المباشر', noTournament: 'لا توجد بطولة مباشرة الآن.', wins: 'انتصارات', losses: 'خسائر', pts: 'PTS' },
  de: { title: 'LIVE-RANGLISTE', noTournament: 'Aktuell kein Live-Turnier.', wins: 'Siege', losses: 'Niederlagen', pts: 'PTS' },
};

function buildLeaderboard(matches) {
  const map = {};
  for (const m of matches) {
    if (m.status !== 'completed') continue;
    for (const key of ['participant1', 'participant2']) {
      const email = m[`${key}_email`];
      const name = m[`${key}_name`] || email;
      if (!email) continue;
      if (!map[email]) map[email] = { email, name, wins: 0, losses: 0 };
    }
    if (m.winner_email) {
      if (map[m.winner_email]) map[m.winner_email].wins++;
      const loserEmail = m.winner_email === m.participant1_email ? m.participant2_email : m.participant1_email;
      if (loserEmail && map[loserEmail]) map[loserEmail].losses++;
    }
  }
  return Object.values(map)
    .map(p => ({ ...p, pts: p.wins * 3 - p.losses }))
    .sort((a, b) => b.pts - a.pts || b.wins - a.wins);
}

export default function LiveTournamentLeaderboard({ lang = 'it' }) {
  const L = LABELS[lang] || LABELS.it;
  const [prevBoard, setPrevBoard] = useState([]);

  const { data: events = [] } = useQuery({
    queryKey: ['live-events'],
    queryFn: () => base44.entities.Event.filter({ status: 'live' }),
    initialData: [],
    refetchInterval: 20000,
  });

  const liveEvent = events[0];

  const { data: tournaments = [] } = useQuery({
    queryKey: ['tournaments', liveEvent?.id],
    queryFn: () => base44.entities.Tournament.filter({ event_id: liveEvent.id }),
    enabled: !!liveEvent,
    initialData: [],
    refetchInterval: 15000,
  });

  const tournament = tournaments[0];

  const { data: matches = [] } = useQuery({
    queryKey: ['tournament-matches', tournament?.id],
    queryFn: () => base44.entities.TournamentMatch.filter({ tournament_id: tournament.id }),
    enabled: !!tournament,
    initialData: [],
    refetchInterval: 10000,
  });

  const leaderboard = buildLeaderboard(matches);
  const leaderboardKey = JSON.stringify(leaderboard.map(p => p.email + p.pts));

  // Detect rank changes — store previous board before it changes
  useEffect(() => {
    setPrevBoard(prev => {
      if (prev.length === 0 && leaderboard.length > 0) return leaderboard;
      if (JSON.stringify(prev.map(p => p.email + p.pts)) !== leaderboardKey && leaderboard.length > 0) {
        return prev; // keep old for comparison, update happens next tick
      }
      return prev;
    });
    const timer = setTimeout(() => {
      if (leaderboard.length > 0) setPrevBoard(leaderboard);
    }, 3000);
    return () => clearTimeout(timer);
  }, [leaderboardKey]);

  const getRankChange = (email, idx) => {
    const prevIdx = prevBoard.findIndex(p => p.email === email);
    if (prevIdx === -1 || prevIdx === idx) return null;
    return prevIdx > idx ? 'up' : 'down';
  };

  if (!liveEvent) {
    return (
      <div className="mb-8">
        <p className="font-mono text-[9px] tracking-[5px] uppercase text-fire-3/40 mb-3">{L.title}</p>
        <div className="border border-white/5 bg-white/2 p-6 text-center">
          <p className="font-rajdhani text-white/25 text-sm">{L.noTournament}</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <p className="font-mono text-[9px] tracking-[5px] uppercase text-fire-3/40">{L.title}</p>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          <span className="font-mono text-[9px] text-red-400 uppercase">LIVE</span>
          <span className="font-rajdhani text-xs text-white/30 ml-1">{liveEvent.title}</span>
        </div>
      </div>

      {leaderboard.length === 0 ? (
        <div className="border border-white/5 p-5 text-center">
          <p className="font-mono text-[10px] text-white/25">{L.noTournament}</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          <AnimatePresence>
            {leaderboard.slice(0, 10).map((p, idx) => {
              const change = getRankChange(p.email, idx);
              return (
                <motion.div
                  key={p.email}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.04 }}
                  className={`flex items-center gap-3 px-4 py-3 border transition-all ${
                    idx === 0 ? 'border-yellow-500/40 bg-yellow-500/5 shadow-[0_0_16px_rgba(255,204,0,0.08)]' :
                    idx === 1 ? 'border-gray-400/30 bg-gray-500/5' :
                    idx === 2 ? 'border-orange-500/30 bg-orange-500/5' :
                    'border-white/5 bg-white/2'
                  }`}
                >
                  {/* Rank */}
                  <div className="w-8 text-center flex-shrink-0">
                    {idx < 3 ? (
                      <span className="text-lg">{MEDAL[idx]}</span>
                    ) : (
                      <span className="font-orbitron text-sm text-white/30">{idx + 1}</span>
                    )}
                  </div>

                  {/* Name */}
                  <div className="flex-1 min-w-0">
                    <div className="font-orbitron text-sm text-white/80 truncate">{p.name}</div>
                  </div>

                  {/* Rank change indicator */}
                  {change && (
                    <span className={`font-mono text-[10px] ${change === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                      {change === 'up' ? '▲' : '▼'}
                    </span>
                  )}

                  {/* Stats */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-center">
                      <div className="font-orbitron text-xs text-green-400">{p.wins}W</div>
                    </div>
                    <div className="text-center">
                      <div className="font-orbitron text-xs text-red-400/60">{p.losses}L</div>
                    </div>
                    <div className="px-2 py-1 border border-fire-3/30 bg-fire-3/5 min-w-[3rem] text-center"
                      style={{ clipPath: 'polygon(4px 0%, 100% 0%, calc(100% - 4px) 100%, 0% 100%)' }}>
                      <div className="font-orbitron font-bold text-sm text-fire-4">{p.pts}</div>
                      <div className="font-mono text-[7px] text-fire-3/30">{L.pts}</div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}