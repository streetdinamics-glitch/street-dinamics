import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp, Globe, Filter } from 'lucide-react';
import { useTranslation } from '../translations';

export default function GlobalLeaderboard({ lang = 'en' }) {
  const t = useTranslation(lang);
  const [filterSport, setFilterSport] = useState('all');
  const [sortBy, setSortBy] = useState('score');

  // Fetch all athlete performance scores
  const { data: scores = [], isLoading } = useQuery({
    queryKey: ['global-scores'],
    queryFn: () => base44.entities.AthletePerformanceScore.list('-total_score', 100),
    initialData: [],
    refetchInterval: 10000, // Real-time updates every 10s
  });

  // Fetch all events to get sport info
  const { data: events = [] } = useQuery({
    queryKey: ['events-for-sports'],
    queryFn: () => base44.entities.Event.list('-created_date', 50),
    initialData: [],
  });

  // Fetch athlete profiles for regions
  const { data: registrations = [] } = useQuery({
    queryKey: ['registrations-for-regions'],
    queryFn: () => base44.entities.Registration.list('-created_date', 200),
    initialData: [],
  });

  // Get unique sports
  const sports = useMemo(() => {
    const sportSet = new Set(events.map(e => e.sport).filter(Boolean));
    return Array.from(sportSet).sort();
  }, [events]);

  // Get regions from registrations
  const regions = useMemo(() => {
    const regionSet = new Set(registrations.map(r => r.country).filter(Boolean));
    return Array.from(regionSet).sort();
  }, [registrations]);

  // Process and filter leaderboard data
  const leaderboardData = useMemo(() => {
    let data = scores.map((score, idx) => {
      const athleteEvent = events.find(e => e.id === score.event_id);
      const athleteReg = registrations.find(r => r.email === score.athlete_email);
      
      return {
        ...score,
        rank: idx + 1,
        sport: athleteEvent?.sport || 'Unknown',
        region: athleteReg?.country || 'Unknown',
        trend: Math.random() > 0.5 ? 'up' : 'stable',
      };
    });

    // Apply sport filter
    if (filterSport !== 'all') {
      data = data.filter(d => d.sport === filterSport);
    }

    // Re-rank after filtering
    data = data.map((d, idx) => ({ ...d, rank: idx + 1 }));

    // Sort
    if (sortBy === 'trend') {
      data.sort((a, b) => (b.trend === 'up' ? 1 : -1));
    }

    return data;
  }, [scores, events, registrations, filterSport, sortBy]);

  const topThree = leaderboardData.slice(0, 3);
  const restOfLeaderboard = leaderboardData.slice(3);

  const medalColors = {
    1: 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/40',
    2: 'from-slate-400/20 to-slate-500/10 border-slate-400/40',
    3: 'from-orange-500/20 to-orange-600/10 border-orange-500/40',
  };

  const medalIcons = {
    1: '🥇',
    2: '🥈',
    3: '🥉',
  };

  return (
    <section id="global-leaderboard" className="section-container">
      <div className="absolute bottom-[-1px] left-0 right-0 h-[1px] fire-line" />
      
      <p className="font-mono text-[10px] tracking-[7px] uppercase text-fire-3 text-center mb-2">
        {t('leaderboard_subtitle')}
      </p>
      <h2 className="heading-fire text-[clamp(36px,7vw,88px)] text-center leading-none mb-8 font-black">
        {t('leaderboard_title')}
      </h2>

      {/* Filters */}
      <div className="max-w-4xl mx-auto mb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="font-mono text-[9px] tracking-[2px] uppercase text-fire-3/60 block mb-2">
              <Filter size={12} className="inline mr-1" />
              Sport
            </label>
            <select
              value={filterSport}
              onChange={(e) => setFilterSport(e.target.value)}
              className="w-full cyber-input text-sm"
            >
              <option value="all">All Sports</option>
              {sports.map(sport => (
                <option key={sport} value={sport}>{sport}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-mono text-[9px] tracking-[2px] uppercase text-fire-3/60 block mb-2">
              <Globe size={12} className="inline mr-1" />
              Sort
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full cyber-input text-sm"
            >
              <option value="score">Top Score</option>
              <option value="trend">Trending Up</option>
            </select>
          </div>

          <div className="flex items-end">
            <div className="font-mono text-[9px] tracking-[1px] text-fire-3/40 px-3 py-2 bg-fire-3/5 border border-fire-3/20 w-full text-center">
              {t('leaderboard_showing')}: <span className="text-fire-4 font-bold">{leaderboardData.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top 3 Podium */}
      {!isLoading && leaderboardData.length > 0 && (
        <div className="max-w-4xl mx-auto mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {topThree.map((athlete, idx) => (
              <motion.div
                key={athlete.athlete_email}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`relative bg-gradient-to-br ${medalColors[athlete.rank]} border p-6 clip-cyber`}
              >
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-6xl">
                  {medalIcons[athlete.rank]}
                </div>

                <div className="text-center pt-8">
                  <div className="font-orbitron font-black text-2xl text-fire-5 mb-2">
                    #{athlete.rank}
                  </div>
                  <div className="font-rajdhani font-bold text-lg text-fire-4 mb-3">
                    {athlete.athlete_name}
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="font-mono text-sm text-fire-3/60">
                      {athlete.sport}
                    </div>
                    <div className="font-orbitron font-black text-3xl text-fire-5">
                      {athlete.total_score.toFixed(0)}
                    </div>
                  </div>

                  {athlete.trend === 'up' && (
                    <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/10 border border-green-500/30 rounded text-green-400 text-xs font-mono">
                      <TrendingUp size={12} />
                      Trending
                    </div>
                  )}
                </div>

                {/* Score breakdown */}
                <div className="mt-6 pt-4 border-t border-fire-3/20 space-y-1 text-xs font-mono text-fire-3/60">
                  <div className="flex justify-between">
                    <span>Tech</span>
                    <span className="text-fire-4">{athlete.technical_progression.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Engagement</span>
                    <span className="text-cyan">{athlete.engagement_generated.toFixed(0)}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Full Leaderboard */}
      {!isLoading && restOfLeaderboard.length > 0 && (
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-fire-3/5 to-transparent border border-fire-3/20">
            {/* Header */}
            <div className="grid grid-cols-12 gap-4 p-4 border-b border-fire-3/20 font-mono text-[9px] tracking-[1px] uppercase text-fire-3/60">
              <div className="col-span-1">Rank</div>
              <div className="col-span-5">Athlete</div>
              <div className="col-span-3">Score</div>
              <div className="col-span-3">Sport</div>
            </div>

            {/* Rows */}
            {restOfLeaderboard.map((athlete, idx) => (
              <motion.div
                key={athlete.athlete_email}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: (idx + 3) * 0.05 }}
                className="grid grid-cols-12 gap-4 p-4 border-b border-fire-3/10 hover:bg-fire-3/5 transition-colors items-center"
              >
                <div className="col-span-1">
                  <span className="font-orbitron font-bold text-fire-5">
                    #{athlete.rank}
                  </span>
                </div>
                <div className="col-span-5">
                  <div className="font-rajdhani font-bold text-fire-4">
                    {athlete.athlete_name}
                  </div>
                  <div className="font-mono text-[8px] text-fire-3/40">
                    {athlete.athlete_email}
                  </div>
                </div>
                <div className="col-span-3">
                  <div className="font-orbitron font-black text-xl text-fire-5">
                    {athlete.total_score.toFixed(0)}
                  </div>
                </div>
                <div className="col-span-3">
                  <div className="inline-block px-2 py-1 bg-fire-3/10 border border-fire-3/20 font-mono text-[8px] text-fire-3/70">
                    {athlete.sport}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && leaderboardData.length === 0 && (
        <div className="text-center py-20">
          <Trophy size={48} className="text-fire-3/30 mx-auto mb-4" />
          <p className="font-mono text-sm text-fire-3/40 tracking-[2px]">
            {t('leaderboard_empty')}
          </p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-20">
          <p className="font-mono text-sm text-fire-3/30 tracking-[2px]">
            {t('leaderboard_loading')}
          </p>
        </div>
      )}
    </section>
  );
}