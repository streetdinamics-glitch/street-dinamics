import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Award, TrendingUp, Star, Calendar, Target, Zap } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useLang } from '../components/useLang';

export default function AthleteProfilePage() {
  const { athleteEmail } = useParams();
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [lang, setLang] = useLang();

  // Fetch athlete info
  const { data: athlete } = useQuery({
    queryKey: ['athlete', athleteEmail],
    queryFn: () => base44.auth.me(),
  });

  // Fetch performance scores
  const { data: performanceScores = [] } = useQuery({
    queryKey: ['athlete-performance', athleteEmail],
    queryFn: () => base44.entities.AthletePerformanceScore.filter({ athlete_email: athleteEmail || athlete?.email }),
    enabled: !!athlete,
    initialData: [],
  });

  // Fetch event scores
  const { data: eventScores = [] } = useQuery({
    queryKey: ['athlete-events', athleteEmail],
    queryFn: () => base44.entities.EventScore.filter({ athlete_email: athleteEmail || athlete?.email }),
    enabled: !!athlete,
    initialData: [],
  });

  // Fetch badges
  const { data: badges = [] } = useQuery({
    queryKey: ['athlete-badges', athleteEmail],
    queryFn: () => base44.entities.AthleteBadge.filter({ athlete_email: athleteEmail || athlete?.email }),
    enabled: !!athlete,
    initialData: [],
  });

  // Calculate career stats
  const careerStats = {
    totalEvents: eventScores.length,
    avgScore: eventScores.length > 0 
      ? (eventScores.reduce((sum, s) => sum + s.score, 0) / eventScores.length).toFixed(1)
      : 0,
    bestScore: eventScores.length > 0
      ? Math.max(...eventScores.map(s => s.score))
      : 0,
    totalBadges: badges.length,
    universalScore: performanceScores.length > 0
      ? Math.round(performanceScores[performanceScores.length - 1].total_score)
      : 0,
  };

  // Score history for chart
  const scoreHistory = performanceScores
    .sort((a, b) => new Date(a.score_date) - new Date(b.score_date))
    .map(score => ({
      date: new Date(score.score_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      score: Math.round(score.total_score),
    }));

  return (
    <div className="min-h-screen bg-cyber-void text-[var(--text-main)] pt-[80px] pb-20">
      {/* Header */}
      <div className="bg-gradient-to-b from-fire-3/10 to-transparent border-b border-fire-3/20">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="heading-fire text-5xl font-black mb-2">
              {athlete?.full_name || 'Athlete Profile'}
            </h1>
            <p className="font-mono text-fire-3/60 tracking-[2px]">
              CAREER SNAPSHOT • UNIVERSAL RANKING SYSTEM
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12 space-y-12">
        {/* Career Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
        >
          {[
            { label: 'Total Events', value: careerStats.totalEvents, icon: Calendar, color: 'fire-3' },
            { label: 'Best Score', value: careerStats.bestScore, icon: Star, color: 'fire-5' },
            { label: 'Avg Score', value: careerStats.avgScore, icon: TrendingUp, color: 'cyan' },
            { label: 'Badges Earned', value: careerStats.totalBadges, icon: Award, color: 'fire-4' },
            { label: 'Universal Score', value: careerStats.universalScore, icon: Zap, color: 'purple-400' },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className={`bg-gradient-to-br from-${stat.color}/10 to-${stat.color}/5 border border-${stat.color}/20 p-4 rounded-lg text-center`}
            >
              <stat.icon className={`text-${stat.color} mx-auto mb-2`} size={20} />
              <div className={`font-orbitron font-black text-2xl text-${stat.color} mb-1`}>
                {stat.value}
              </div>
              <div className="font-mono text-xs text-fire-3/60 uppercase tracking-[1px]">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Score History Chart */}
        {scoreHistory.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-[rgba(10,4,18,0.98)] to-[rgba(4,2,8,1)] border border-fire-3/20 p-6 rounded-lg"
          >
            <h2 className="heading-fire text-2xl font-black mb-6 flex items-center gap-3">
              <TrendingUp size={24} className="text-fire-3" />
              Universal Score Evolution
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={scoreHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,80,0,0.1)" />
                <XAxis dataKey="date" stroke="#ff6600" style={{ fontSize: 12 }} />
                <YAxis stroke="#ff6600" style={{ fontSize: 12 }} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(4,2,8,0.95)',
                    border: '1px solid rgba(255,100,0,0.3)',
                    fontFamily: 'monospace',
                    fontSize: 11,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#ff6600"
                  dot={{ fill: '#ffcc00', r: 4 }}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Badges Section */}
        {badges.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-[rgba(10,4,18,0.98)] to-[rgba(4,2,8,1)] border border-fire-4/20 p-6 rounded-lg"
          >
            <h2 className="heading-fire text-2xl font-black mb-6 flex items-center gap-3">
              <Award size={24} className="text-fire-4" />
              Achievements ({badges.length})
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {badges.map((badge, idx) => (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-black/40 border border-fire-4/20 p-4 rounded-lg text-center hover:border-fire-4/40 transition-all"
                >
                  <div className="text-3xl mb-2">{badge.badge_icon || '🏆'}</div>
                  <h4 className="font-rajdhani font-bold text-fire-4 text-sm mb-1">
                    {badge.badge_name}
                  </h4>
                  <p className="font-mono text-xs text-fire-3/60">
                    {new Date(badge.earned_date).toLocaleDateString()}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Event Performances */}
        {eventScores.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-[rgba(10,4,18,0.98)] to-[rgba(4,2,8,1)] border border-cyan/20 p-6 rounded-lg"
          >
            <h2 className="heading-fire text-2xl font-black mb-6 flex items-center gap-3">
              <Calendar size={24} className="text-cyan" />
              Event History
            </h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {eventScores
                .sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at))
                .map((event, idx) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-black/40 border border-cyan/10 p-4 rounded flex items-center justify-between hover:border-cyan/30 transition-all"
                  >
                    <div>
                      <h4 className="font-rajdhani font-bold text-cyan mb-1">
                        {event.event_id}
                      </h4>
                      <p className="font-mono text-xs text-cyan/60">
                        {new Date(event.submitted_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-orbitron font-black text-2xl text-cyan">
                        {event.score.toFixed(1)}
                      </div>
                      <div className="font-mono text-xs text-cyan/40">Points</div>
                    </div>
                  </motion.div>
                ))}
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {eventScores.length === 0 && badges.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <Star size={48} className="text-fire-3/30 mx-auto mb-4" />
            <p className="font-mono text-sm tracking-[2px] text-fire-3/40">
              NO EVENT HISTORY YET. CHECK BACK AFTER COMPETING IN EVENTS.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}