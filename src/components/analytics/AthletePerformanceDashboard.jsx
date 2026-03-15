import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Award, Target, Activity, BarChart3, LineChart, Users } from 'lucide-react';
import { LineChart as RechartsLine, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

export default function AthletePerformanceDashboard({ lang = 'en' }) {
  const [selectedAthlete, setSelectedAthlete] = useState(null);
  const [timeRange, setTimeRange] = useState('all');

  const { data: registrations = [] } = useQuery({
    queryKey: ['athlete-registrations'],
    queryFn: () => base44.entities.Registration.filter({ type: 'athlete', status: 'confirmed' }),
    initialData: [],
  });

  const { data: events = [] } = useQuery({
    queryKey: ['events-performance'],
    queryFn: () => base44.entities.Event.list('-date', 100),
    initialData: [],
  });

  const { data: performanceScores = [] } = useQuery({
    queryKey: ['performance-scores'],
    queryFn: () => base44.entities.AthletePerformanceScore.list('-created_date', 500),
    initialData: [],
  });

  const { data: bets = [] } = useQuery({
    queryKey: ['all-bets'],
    queryFn: () => base44.entities.Bet.list('-placed_at', 1000),
    initialData: [],
  });

  // Aggregate athlete stats
  const athleteStats = useMemo(() => {
    const statsMap = new Map();

    registrations.forEach(reg => {
      if (!statsMap.has(reg.email)) {
        statsMap.set(reg.email, {
          email: reg.email,
          name: `${reg.first_name} ${reg.last_name}`,
          sport: reg.sport,
          eventsParticipated: 0,
          performances: [],
          avgScore: 0,
          bestScore: 0,
          worstScore: 0,
          trend: 0,
          betsPlaced: 0,
          winRate: 0,
        });
      }
      const athlete = statsMap.get(reg.email);
      athlete.eventsParticipated++;
    });

    performanceScores.forEach(score => {
      if (statsMap.has(score.athlete_email)) {
        const athlete = statsMap.get(score.athlete_email);
        athlete.performances.push({
          eventId: score.event_id,
          score: score.total_score,
          date: score.created_date,
          breakdown: score.score_breakdown,
        });
      }
    });

    // Calculate aggregated metrics
    statsMap.forEach((athlete, email) => {
      if (athlete.performances.length > 0) {
        const scores = athlete.performances.map(p => p.total_score);
        athlete.avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
        athlete.bestScore = Math.max(...scores);
        athlete.worstScore = Math.min(...scores);

        // Calculate trend (last 3 vs first 3 performances)
        if (athlete.performances.length >= 3) {
          const recent = athlete.performances.slice(0, 3).map(p => p.total_score);
          const early = athlete.performances.slice(-3).map(p => p.total_score);
          const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
          const earlyAvg = early.reduce((a, b) => a + b, 0) / early.length;
          athlete.trend = ((recentAvg - earlyAvg) / earlyAvg) * 100;
        }
      }

      // Bet statistics
      const athleteBets = bets.filter(b => {
        const event = events.find(e => e.id === b.event_id);
        return event && registrations.some(r => r.event_id === event.id && r.email === email);
      });
      athlete.betsPlaced = athleteBets.length;
      const wonBets = athleteBets.filter(b => b.result === 'won').length;
      athlete.winRate = athleteBets.length > 0 ? (wonBets / athleteBets.length) * 100 : 0;
    });

    return Array.from(statsMap.values())
      .filter(a => a.performances.length > 0)
      .sort((a, b) => b.avgScore - a.avgScore);
  }, [registrations, performanceScores, bets, events]);

  const topAthletes = athleteStats.slice(0, 10);
  const selectedAthleteData = selectedAthlete ? athleteStats.find(a => a.email === selectedAthlete) : null;

  // Historical chart data
  const historicalData = useMemo(() => {
    if (!selectedAthleteData) return [];
    return selectedAthleteData.performances
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map((p, i) => ({
        event: `Event ${i + 1}`,
        score: p.score,
        date: new Date(p.date).toLocaleDateString(),
      }));
  }, [selectedAthleteData]);

  // Performance breakdown radar data
  const radarData = useMemo(() => {
    if (!selectedAthleteData || selectedAthleteData.performances.length === 0) return [];
    const latestPerformance = selectedAthleteData.performances[0];
    if (!latestPerformance.breakdown) return [];
    
    return Object.entries(latestPerformance.breakdown).map(([key, value]) => ({
      category: key.replace(/_/g, ' ').toUpperCase(),
      value: value,
    }));
  }, [selectedAthleteData]);

  return (
    <section className="section-container">
      <p className="font-mono text-[10px] tracking-[7px] uppercase text-fire-3 text-center mb-2">
        ATHLETE INSIGHTS
      </p>
      <h2 className="heading-fire text-[clamp(36px,7vw,88px)] text-center leading-none mb-4 font-black">
        PERFORMANCE DASHBOARD
      </h2>

      <p className="text-center font-rajdhani text-lg text-fire-4/70 max-w-3xl mx-auto mb-8">
        Analyze athlete statistics, trends, and performance history to make informed betting decisions
      </p>

      {/* Time Range Filter */}
      <div className="flex justify-center gap-2 mb-8">
        {['all', '30d', '90d', '6m'].map(range => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-4 py-2 font-mono text-xs tracking-[1px] uppercase border transition-all ${
              timeRange === range
                ? 'border-fire-3 bg-fire-3/20 text-fire-4'
                : 'border-fire-3/20 text-fire-3/40 hover:border-fire-3/40'
            }`}
          >
            {range === 'all' ? 'All Time' : range}
          </button>
        ))}
      </div>

      {/* Top Athletes Leaderboard */}
      <div className="mb-12">
        <h3 className="font-orbitron font-bold text-2xl text-fire-5 mb-6 flex items-center gap-2">
          <Award size={24} className="text-fire-3" />
          Top Performers
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topAthletes.map((athlete, i) => (
            <motion.div
              key={athlete.email}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setSelectedAthlete(athlete.email)}
              className={`bg-gradient-to-br from-[rgba(10,4,18,0.98)] to-[rgba(4,2,8,1)] border ${
                selectedAthlete === athlete.email ? 'border-fire-3' : 'border-fire-3/20'
              } p-5 clip-cyber cursor-pointer hover:border-fire-3/60 transition-all`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-orbitron font-bold text-lg text-fire-5">{athlete.name}</div>
                  <div className="font-mono text-xs text-fire-3/60">{athlete.sport}</div>
                </div>
                <div className="font-orbitron text-2xl font-black text-fire-3">#{i + 1}</div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="bg-fire-3/5 border border-fire-3/10 p-2">
                  <div className="font-mono text-[8px] text-fire-3/40 tracking-[1px] mb-1">AVG SCORE</div>
                  <div className="font-orbitron font-bold text-fire-4">{athlete.avgScore.toFixed(1)}</div>
                </div>
                <div className="bg-fire-3/5 border border-fire-3/10 p-2">
                  <div className="font-mono text-[8px] text-fire-3/40 tracking-[1px] mb-1">EVENTS</div>
                  <div className="font-orbitron font-bold text-fire-4">{athlete.eventsParticipated}</div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {athlete.trend > 0 ? (
                    <TrendingUp size={16} className="text-green-400" />
                  ) : (
                    <TrendingDown size={16} className="text-red-400" />
                  )}
                  <span className={`font-mono text-xs ${athlete.trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {athlete.trend > 0 ? '+' : ''}{athlete.trend.toFixed(1)}%
                  </span>
                </div>
                <div className="font-mono text-xs text-fire-3/60">
                  Win Rate: {athlete.winRate.toFixed(0)}%
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Detailed Athlete Analysis */}
      {selectedAthleteData && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h3 className="font-orbitron font-bold text-2xl text-fire-5 mb-6 flex items-center gap-2">
            <Activity size={24} className="text-cyan" />
            Detailed Analysis: {selectedAthleteData.name}
          </h3>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-br from-fire-3/10 to-transparent border border-fire-3/30 p-4 clip-cyber">
              <div className="font-mono text-[10px] tracking-[2px] uppercase text-fire-3/60 mb-1">Best Score</div>
              <div className="font-orbitron text-3xl font-bold text-fire-5">{selectedAthleteData.bestScore}</div>
            </div>
            <div className="bg-gradient-to-br from-cyan/10 to-transparent border border-cyan/30 p-4 clip-cyber">
              <div className="font-mono text-[10px] tracking-[2px] uppercase text-cyan/60 mb-1">Average</div>
              <div className="font-orbitron text-3xl font-bold text-cyan">{selectedAthleteData.avgScore.toFixed(1)}</div>
            </div>
            <div className="bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/30 p-4 clip-cyber">
              <div className="font-mono text-[10px] tracking-[2px] uppercase text-purple-500/60 mb-1">Events</div>
              <div className="font-orbitron text-3xl font-bold text-purple-400">{selectedAthleteData.eventsParticipated}</div>
            </div>
            <div className="bg-gradient-to-br from-green-500/10 to-transparent border border-green-500/30 p-4 clip-cyber">
              <div className="font-mono text-[10px] tracking-[2px] uppercase text-green-500/60 mb-1">Win Rate</div>
              <div className="font-orbitron text-3xl font-bold text-green-400">{selectedAthleteData.winRate.toFixed(0)}%</div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Historical Performance Line Chart */}
            <div className="bg-gradient-to-br from-[rgba(10,4,18,0.98)] to-[rgba(4,2,8,1)] border border-fire-3/20 p-6 clip-cyber">
              <h4 className="font-orbitron font-bold text-fire-4 mb-4 flex items-center gap-2">
                <LineChart size={18} />
                Performance Trend
              </h4>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={historicalData}>
                  <defs>
                    <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ff6600" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#ff6600" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,100,0,0.1)" />
                  <XAxis dataKey="event" stroke="#ff6600" style={{ fontSize: 10 }} />
                  <YAxis stroke="#ff6600" style={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#080512', border: '1px solid rgba(255,100,0,0.3)' }}
                    labelStyle={{ color: '#ff9900' }}
                  />
                  <Area type="monotone" dataKey="score" stroke="#ff6600" fillOpacity={1} fill="url(#scoreGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Performance Breakdown Radar */}
            {radarData.length > 0 && (
              <div className="bg-gradient-to-br from-[rgba(10,4,18,0.98)] to-[rgba(4,2,8,1)] border border-cyan/20 p-6 clip-cyber">
                <h4 className="font-orbitron font-bold text-cyan mb-4 flex items-center gap-2">
                  <Target size={18} />
                  Latest Performance Breakdown
                </h4>
                <ResponsiveContainer width="100%" height={250}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="rgba(0,255,238,0.2)" />
                    <PolarAngleAxis dataKey="category" stroke="#00ffee" style={{ fontSize: 9 }} />
                    <PolarRadiusAxis stroke="#00ffee" style={{ fontSize: 9 }} />
                    <Radar name="Score" dataKey="value" stroke="#00ffee" fill="#00ffee" fillOpacity={0.3} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#080512', border: '1px solid rgba(0,255,238,0.3)' }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Sport-wise Performance Comparison */}
      <div>
        <h3 className="font-orbitron font-bold text-2xl text-fire-5 mb-6 flex items-center gap-2">
          <BarChart3 size={24} className="text-purple-400" />
          Sport Performance Overview
        </h3>
        <div className="bg-gradient-to-br from-[rgba(10,4,18,0.98)] to-[rgba(4,2,8,1)] border border-fire-3/20 p-6 clip-cyber">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={Object.entries(
              athleteStats.reduce((acc, athlete) => {
                if (!acc[athlete.sport]) acc[athlete.sport] = { sport: athlete.sport, avgScore: 0, count: 0 };
                acc[athlete.sport].avgScore += athlete.avgScore;
                acc[athlete.sport].count++;
                return acc;
              }, {})
            ).map(([sport, data]) => ({
              sport,
              avgScore: (data.avgScore / data.count).toFixed(1),
              athletes: data.count,
            }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,100,0,0.1)" />
              <XAxis dataKey="sport" stroke="#ff6600" style={{ fontSize: 10 }} />
              <YAxis stroke="#ff6600" style={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#080512', border: '1px solid rgba(255,100,0,0.3)' }}
              />
              <Legend />
              <Bar dataKey="avgScore" fill="#ff6600" name="Avg Score" />
              <Bar dataKey="athletes" fill="#9b00ff" name="Athletes" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}