import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { TrendingUp, Users, Trophy, DollarSign, Activity, Star, Target, Zap } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import ProgressionCharts from '../components/analytics/ProgressionCharts';
import RankingComparison from '../components/analytics/RankingComparison';

export default function Analytics() {
  const [selectedAthlete, setSelectedAthlete] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  // Calculate selected athlete email early
  const selectedAthleteEmail = selectedAthlete?.email || user?.email;

  const { data: athletes = [] } = useQuery({
    queryKey: ['athlete-users'],
    queryFn: async () => {
      const users = await base44.entities.User.list();
      return users.filter(u => u.role === 'athlete');
    },
    initialData: [],
  });

  const { data: tokens = [] } = useQuery({
    queryKey: ['athlete-tokens'],
    queryFn: () => base44.entities.AthleteToken.list(),
    initialData: [],
  });

  const { data: stats = [] } = useQuery({
    queryKey: ['athlete-stats'],
    queryFn: () => base44.entities.AthleteStats.list(),
    initialData: [],
  });

  const { data: registrations = [] } = useQuery({
    queryKey: ['athlete-registrations'],
    queryFn: () => base44.entities.Registration.filter({ type: 'athlete' }),
    initialData: [],
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ['token-transactions'],
    queryFn: () => base44.entities.TokenTransaction.list(),
    initialData: [],
  });

  const { data: badges = [] } = useQuery({
    queryKey: ['athlete-badges'],
    queryFn: () => base44.entities.AthleteBadge.list(),
    initialData: [],
  });

  const { data: performanceScores = [] } = useQuery({
    queryKey: ['performance-scores'],
    queryFn: () => base44.entities.AthletePerformanceScore.filter({ athlete_email: selectedAthleteEmail }),
    enabled: !!selectedAthleteEmail,
    initialData: [],
  });
  const athleteStats = stats.find(s => s.athlete_email === selectedAthleteEmail) || {};
  const athleteToken = tokens.find(t => t.athlete_email === selectedAthleteEmail);
  const athleteRegistrations = registrations.filter(r => r.email === selectedAthleteEmail);
  const athleteTransactions = transactions.filter(t => t.token_id === athleteToken?.id);
  const athleteBadges = badges.filter(b => b.athlete_email === selectedAthleteEmail);

  // Performance over time data
  const performanceData = athleteRegistrations.map((reg, i) => ({
    event: `Event ${i + 1}`,
    performance: 50 + Math.random() * 50,
    fanGrowth: 10 + Math.random() * 40,
    earnings: 100 + Math.random() * 500,
  }));

  // Token sales over time
  const tokenSalesData = athleteTransactions.slice(0, 10).map((tx, i) => ({
    date: new Date(tx.created_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    sales: tx.quantity,
    revenue: tx.total_amount,
  }));

  // Universal Performance Score radar data (6 criteria)
  const skillsData = performanceScores.length > 0
    ? [
        { skill: 'Technical', value: performanceScores[0]?.technical_progression || 0 },
        { skill: 'Engagement', value: performanceScores[0]?.engagement_generated || 0 },
        { skill: 'Consistency', value: performanceScores[0]?.consistency || 0 },
        { skill: 'Recognition', value: performanceScores[0]?.external_recognition || 0 },
        { skill: 'Fanbase', value: performanceScores[0]?.fanbase_growth || 0 },
        { skill: 'Leadership', value: performanceScores[0]?.behavior_leadership || 0 },
      ]
    : [
        { skill: 'Technical', value: 0 },
        { skill: 'Engagement', value: 0 },
        { skill: 'Consistency', value: 0 },
        { skill: 'Recognition', value: 0 },
        { skill: 'Fanbase', value: 0 },
        { skill: 'Leadership', value: 0 },
      ];

  const StatCard = ({ icon: Icon, label, value, trend, color }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative bg-gradient-to-br from-[rgba(10,4,18,0.98)] to-[rgba(4,2,8,1)] border border-fire-3/20 p-5 clip-cyber group hover:border-fire-3/40 transition-all"
    >
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-fire-3/30 to-transparent" />
      <div className={`absolute top-2 right-2 w-8 h-8 rounded-full bg-${color}/10 flex items-center justify-center`}>
        <Icon size={16} className={`text-${color}`} />
      </div>
      <div className="font-mono text-[9px] tracking-[2px] uppercase text-fire-3/40 mb-2">{label}</div>
      <div className="font-orbitron font-black text-3xl text-fire-5 mb-1">{value}</div>
      {trend && (
        <div className={`font-mono text-[10px] tracking-[1px] ${trend > 0 ? 'text-green-400' : 'text-red-400'} flex items-center gap-1`}>
          <TrendingUp size={12} />
          {trend > 0 ? '+' : ''}{trend}%
        </div>
      )}
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-cyber-void text-[var(--text-main)] p-6">
      {/* Background effects */}
      <div className="cyber-grid" />
      <div className="cyber-scanlines" />
      <div className="cyber-vignette" />

      <div className="relative z-10 max-w-[1600px] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <p className="font-mono text-[10px] tracking-[7px] uppercase text-fire-3/40 mb-2">// ANALYTICS MODULE //</p>
          <h1 className="heading-fire text-[clamp(36px,6vw,72px)] leading-none font-black mb-4">
            PERFORMANCE DASHBOARD
          </h1>
          <div className="h-[2px] bg-gradient-to-r from-fire-3 via-fire-5 to-transparent" />
        </motion.div>

        {/* Athlete Selector (for admins) */}
        {user?.role === 'admin' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 bg-gradient-to-br from-[rgba(10,4,18,0.98)] to-[rgba(4,2,8,1)] border border-cyan/20"
          >
            <label className="font-mono text-[11px] tracking-[2px] uppercase text-cyan/60 block mb-3">Select Athlete</label>
            <select
              value={selectedAthlete?.email || ''}
              onChange={(e) => setSelectedAthlete(athletes.find(a => a.email === e.target.value))}
              className="w-full bg-black/50 border border-cyan/20 text-cyan font-mono text-sm p-3 outline-none focus:border-cyan transition-all"
            >
              <option value="">-- Current User --</option>
              {athletes.map(athlete => (
                <option key={athlete.email} value={athlete.email}>
                  {athlete.full_name} ({athlete.email})
                </option>
              ))}
            </select>
          </motion.div>
        )}

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={Users}
            label="Total Fans"
            value={athleteStats.fan_count || 0}
            trend={12}
            color="cyan"
          />
          <StatCard
            icon={Trophy}
            label="Events Participated"
            value={athleteStats.events_participated || 0}
            trend={8}
            color="fire-4"
          />
          <StatCard
            icon={DollarSign}
            label="Total Earnings"
            value={`€${(athleteStats.total_earnings || 0).toFixed(0)}`}
            trend={15}
            color="green-400"
          />
          <StatCard
            icon={Star}
            label="Performance Score"
            value={athleteStats.performance_rating || 0}
            trend={5}
            color="purple-400"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Performance Timeline */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gradient-to-br from-[rgba(10,4,18,0.98)] to-[rgba(4,2,8,1)] border border-fire-3/20 p-6 clip-cyber"
          >
            <div className="flex items-center gap-3 mb-6">
              <Activity className="text-fire-3" size={20} />
              <h3 className="font-orbitron font-bold text-lg text-fire-5 tracking-[1px] uppercase">Performance Timeline</h3>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="colorPerformance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff6600" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ff6600" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,102,0,0.1)" />
                <XAxis dataKey="event" stroke="#ff6600" style={{ fontSize: 10, fontFamily: 'monospace' }} />
                <YAxis stroke="#ff6600" style={{ fontSize: 10, fontFamily: 'monospace' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(4,2,8,0.95)', border: '1px solid rgba(255,102,0,0.3)', fontFamily: 'monospace', fontSize: 11 }}
                />
                <Area type="monotone" dataKey="performance" stroke="#ff6600" fillOpacity={1} fill="url(#colorPerformance)" />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Token Sales Chart */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gradient-to-br from-[rgba(10,4,18,0.98)] to-[rgba(4,2,8,1)] border border-cyan/20 p-6 clip-cyber"
          >
            <div className="flex items-center gap-3 mb-6">
              <Zap className="text-cyan" size={20} />
              <h3 className="font-orbitron font-bold text-lg text-cyan tracking-[1px] uppercase">Token Sales</h3>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={tokenSalesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,255,238,0.1)" />
                <XAxis dataKey="date" stroke="#00ffee" style={{ fontSize: 10, fontFamily: 'monospace' }} />
                <YAxis stroke="#00ffee" style={{ fontSize: 10, fontFamily: 'monospace' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(4,2,8,0.95)', border: '1px solid rgba(0,255,238,0.3)', fontFamily: 'monospace', fontSize: 11 }}
                />
                <Bar dataKey="sales" fill="#00ffee" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Skills Radar & Badges */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Universal Performance Score Radar */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-[rgba(10,4,18,0.98)] to-[rgba(4,2,8,1)] border border-purple-500/20 p-6 clip-cyber"
          >
            <div className="flex items-center gap-3 mb-6">
              <Target className="text-purple-400" size={20} />
              <h3 className="font-orbitron font-bold text-lg text-purple-400 tracking-[1px] uppercase">Universal Score (6 Criteria)</h3>
              {performanceScores.length > 0 && (
                <span className="ml-auto font-orbitron text-2xl font-black text-purple-300">
                  {performanceScores[0]?.total_score.toFixed(1)} / 100
                </span>
              )}
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={skillsData}>
                <PolarGrid stroke="rgba(155,0,255,0.2)" />
                <PolarAngleAxis dataKey="skill" stroke="#9b00ff" style={{ fontSize: 11, fontFamily: 'monospace' }} />
                <PolarRadiusAxis stroke="#9b00ff" />
                <Radar name="Skills" dataKey="value" stroke="#9b00ff" fill="#9b00ff" fillOpacity={0.3} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(4,2,8,0.95)', border: '1px solid rgba(155,0,255,0.3)', fontFamily: 'monospace', fontSize: 11 }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Badges Display */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-[rgba(10,4,18,0.98)] to-[rgba(4,2,8,1)] border border-fire-3/20 p-6 clip-cyber"
          >
            <div className="flex items-center gap-3 mb-6">
              <Trophy className="text-fire-4" size={20} />
              <h3 className="font-orbitron font-bold text-lg text-fire-5 tracking-[1px] uppercase">Achievements</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {athleteBadges.length > 0 ? (
                athleteBadges.map((badge, i) => (
                  <motion.div
                    key={badge.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-fire-3/5 border border-fire-3/20 p-3 text-center group hover:border-fire-3/40 transition-all"
                  >
                    <div className="text-3xl mb-2">{badge.badge_icon}</div>
                    <div className="font-orbitron text-xs font-bold text-fire-5 mb-1">{badge.badge_name}</div>
                    <div className="font-mono text-[8px] text-fire-3/40 tracking-[1px] uppercase">{badge.rarity}</div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-2 text-center py-8">
                  <Trophy size={48} className="text-fire-3/20 mx-auto mb-3" />
                  <p className="font-mono text-xs text-fire-3/30 tracking-[1px]">No badges earned yet</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Stats Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[rgba(10,4,18,0.98)] to-[rgba(4,2,8,1)] border border-fire-3/20 p-6 clip-cyber mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <Activity className="text-fire-3" size={20} />
            <h3 className="font-orbitron font-bold text-lg text-fire-5 tracking-[1px] uppercase">Detailed Statistics</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-fire-3/5 border border-fire-3/10">
              <div className="font-mono text-[9px] text-fire-3/40 tracking-[1px] uppercase mb-2">Wins</div>
              <div className="font-orbitron font-black text-2xl text-green-400">{athleteStats.wins || 0}</div>
            </div>
            <div className="p-4 bg-fire-3/5 border border-fire-3/10">
              <div className="font-mono text-[9px] text-fire-3/40 tracking-[1px] uppercase mb-2">Podiums</div>
              <div className="font-orbitron font-black text-2xl text-fire-4">{athleteStats.podium_finishes || 0}</div>
            </div>
            <div className="p-4 bg-fire-3/5 border border-fire-3/10">
              <div className="font-mono text-[9px] text-fire-3/40 tracking-[1px] uppercase mb-2">Social Score</div>
              <div className="font-orbitron font-black text-2xl text-purple-400">{athleteStats.social_score || 0}</div>
            </div>
            <div className="p-4 bg-fire-3/5 border border-fire-3/10">
              <div className="font-mono text-[9px] text-fire-3/40 tracking-[1px] uppercase mb-2">Token Value</div>
              <div className="font-orbitron font-black text-2xl text-cyan">
                €{athleteToken ? (athleteToken.current_price || athleteToken.base_price) : 0}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Advanced Analytics */}
        <div className="space-y-8">
          {/* Progression Charts Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="font-mono text-[10px] tracking-[7px] uppercase text-fire-3/40 mb-4">// PROGRESSION ANALYSIS //</p>
            <ProgressionCharts
              athleteStats={athleteStats}
              performanceScores={performanceScores}
              registrations={athleteRegistrations}
            />
          </motion.div>

          {/* Ranking Comparison Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <p className="font-mono text-[10px] tracking-[7px] uppercase text-fire-3/40 mb-4">// COMPETITIVE ANALYSIS //</p>
            <RankingComparison athleteStats={athleteStats} allAthletes={athletes} />
          </motion.div>
        </div>
      </div>
    </div>
  );
}