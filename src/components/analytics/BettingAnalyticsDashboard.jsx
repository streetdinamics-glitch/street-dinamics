import React, { useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DollarSign, TrendingUp, Target, Activity } from 'lucide-react';

export default function BettingAnalyticsDashboard({ isAdmin = false }) {
  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: bets = [] } = useQuery({
    queryKey: isAdmin ? ['all-bets'] : ['user-bets-analytics', user?.email],
    queryFn: () => isAdmin
      ? base44.entities.Bet.list('-placed_at', 1000).catch(() => [])
      : base44.entities.Bet.filter({ created_by: user?.email }).catch(() => []),
    enabled: isAdmin || !!user?.email,
  });

  // Betting timeline
  const bettingTimeline = useMemo(() => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return date.toISOString().split('T')[0];
    });

    return last30Days.map(date => {
      const dayBets = bets.filter(b => b.placed_at?.startsWith(date));
      const totalWagered = dayBets.reduce((sum, b) => sum + (b.amount || 0), 0);
      const totalWon = dayBets.filter(b => b.result === 'won').reduce((sum, b) => sum + (b.potential_winnings || 0), 0);
      
      return {
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        wagered: totalWagered,
        won: totalWon,
        profit: totalWon - totalWagered,
      };
    });
  }, [bets]);

  // Outcome distribution
  const outcomeDistribution = useMemo(() => {
    const settled = bets.filter(b => b.status === 'settled');
    const won = settled.filter(b => b.result === 'won').length;
    const lost = settled.filter(b => b.result === 'lost').length;
    
    return [
      { name: 'Won', value: won, color: '#00ffee' },
      { name: 'Lost', value: lost, color: '#ff1a00' },
      { name: 'Active', value: bets.filter(b => b.status === 'active').length, color: '#ffcc00' },
    ];
  }, [bets]);

  // Bet size distribution
  const betSizeDistribution = useMemo(() => {
    const ranges = {
      'Small (10-50)': 0,
      'Medium (51-100)': 0,
      'Large (101-200)': 0,
      'Huge (201+)': 0,
    };

    bets.forEach(b => {
      const amt = b.amount || 0;
      if (amt <= 50) ranges['Small (10-50)']++;
      else if (amt <= 100) ranges['Medium (51-100)']++;
      else if (amt <= 200) ranges['Large (101-200)']++;
      else ranges['Huge (201+)']++;
    });

    return Object.entries(ranges).map(([name, value]) => ({ name, value }));
  }, [bets]);

  // Calculate stats
  const stats = useMemo(() => {
    const settled = bets.filter(b => b.status === 'settled');
    const won = settled.filter(b => b.result === 'won');
    const totalWagered = bets.reduce((sum, b) => sum + (b.amount || 0), 0);
    const totalWon = won.reduce((sum, b) => sum + (b.potential_winnings || 0), 0);
    const roi = totalWagered > 0 ? (((totalWon - totalWagered) / totalWagered) * 100).toFixed(1) : 0;
    const winRate = settled.length > 0 ? ((won.length / settled.length) * 100).toFixed(1) : 0;
    const avgBet = bets.length > 0 ? Math.round(totalWagered / bets.length) : 0;

    return {
      totalBets: bets.length,
      totalWagered,
      totalWon,
      roi,
      winRate,
      avgBet,
    };
  }, [bets]);

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Bets', value: stats.totalBets, icon: Activity, color: 'cyan' },
          { label: 'Total Wagered', value: stats.totalWagered, icon: DollarSign, color: 'fire-3' },
          { label: 'Win Rate', value: `${stats.winRate}%`, icon: Target, color: 'purple-500' },
          { label: 'ROI', value: `${stats.roi}%`, icon: TrendingUp, color: stats.roi >= 0 ? 'fire-5' : 'red-500' },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`bg-gradient-to-br from-${stat.color}/10 to-transparent border border-${stat.color}/20 p-4 clip-cyber`}
            >
              <Icon size={20} className={`text-${stat.color} mb-2`} />
              <p className="font-mono text-xs text-fire-3/60 mb-1">{stat.label}</p>
              <p className={`font-orbitron text-2xl font-bold text-${stat.color}`}>{stat.value}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Betting Performance Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-[rgba(10,4,18,0.98)] to-[rgba(4,2,8,1)] border border-fire-3/20 p-6 clip-cyber"
      >
        <h3 className="font-orbitron font-bold text-xl text-fire-4 mb-6">30-DAY BETTING PERFORMANCE</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={bettingTimeline}>
            <defs>
              <linearGradient id="colorWagered" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ff6600" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#ff6600" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorWon" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00ffee" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#00ffee" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,100,0,0.1)" />
            <XAxis dataKey="date" stroke="#ff6600" style={{ fontSize: '10px', fontFamily: 'monospace' }} />
            <YAxis stroke="#ff6600" style={{ fontSize: '10px', fontFamily: 'monospace' }} />
            <Tooltip contentStyle={{ background: '#080512', border: '1px solid rgba(255,100,0,0.3)', borderRadius: '0', fontFamily: 'monospace' }} />
            <Legend wrapperStyle={{ fontFamily: 'monospace', fontSize: '11px' }} />
            <Area type="monotone" dataKey="wagered" stroke="#ff6600" fillOpacity={1} fill="url(#colorWagered)" />
            <Area type="monotone" dataKey="won" stroke="#00ffee" fillOpacity={1} fill="url(#colorWon)" />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Outcome Distribution */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gradient-to-br from-[rgba(10,4,18,0.98)] to-[rgba(4,2,8,1)] border border-fire-3/20 p-6 clip-cyber"
        >
          <h3 className="font-orbitron font-bold text-lg text-fire-4 mb-6">BET OUTCOMES</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={outcomeDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {outcomeDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#080512', border: '1px solid rgba(255,100,0,0.3)', fontFamily: 'monospace' }} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Bet Size Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gradient-to-br from-[rgba(10,4,18,0.98)] to-[rgba(4,2,8,1)] border border-fire-3/20 p-6 clip-cyber"
        >
          <h3 className="font-orbitron font-bold text-lg text-fire-4 mb-6">BET SIZE BREAKDOWN</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={betSizeDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,100,0,0.1)" />
              <XAxis dataKey="name" stroke="#ff6600" style={{ fontSize: '9px', fontFamily: 'monospace' }} />
              <YAxis stroke="#ff6600" style={{ fontSize: '10px', fontFamily: 'monospace' }} />
              <Tooltip contentStyle={{ background: '#080512', border: '1px solid rgba(255,100,0,0.3)', fontFamily: 'monospace' }} />
              <Bar dataKey="value" fill="#9b00ff" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
}