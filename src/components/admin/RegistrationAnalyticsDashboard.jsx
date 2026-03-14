import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, Activity, Calendar } from 'lucide-react';

const COLORS = ['#ff4400', '#00ffee', '#9b00ff', '#ff9900', '#ffcc00'];
const AGE_RANGES = ['13-16', '17-19', '20-24', '25-30'];

export default function RegistrationAnalyticsDashboard() {
  const { data: registrations = [], isLoading } = useQuery({
    queryKey: ['admin-registrations'],
    queryFn: () => base44.entities.Registration.list('-created_date', 1000),
    initialData: [],
  });

  const { data: events = [] } = useQuery({
    queryKey: ['admin-events'],
    queryFn: () => base44.entities.Event.list('-created_date', 100),
    initialData: [],
  });

  // Process data for visualizations
  const analytics = useMemo(() => {
    if (!registrations.length) return null;

    // 1. Registration growth by date
    const growthByDate = {};
    registrations.forEach(reg => {
      const date = new Date(reg.created_date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
      growthByDate[date] = (growthByDate[date] || 0) + 1;
    });

    const growthData = Object.entries(growthByDate)
      .sort((a, b) => new Date(a[0]) - new Date(b[0]))
      .map(([date, count]) => ({ date, registrations: count }))
      .slice(-30); // Last 30 days

    // Calculate cumulative growth
    let cumulative = 0;
    const cumulativeGrowth = growthData.map(item => {
      cumulative += item.registrations;
      return { ...item, cumulative };
    });

    // 2. Athletes vs Spectators
    const athleteCount = registrations.filter(r => r.type === 'athlete').length;
    const spectatorCount = registrations.filter(r => r.type === 'spectator').length;
    const athleteSpectatorData = [
      { name: 'Athletes', value: athleteCount, fill: '#ff4400' },
      { name: 'Spectators', value: spectatorCount, fill: '#00ffee' },
    ];

    // 3. Age distribution
    const ageDistribution = { '13-16': 0, '17-19': 0, '20-24': 0, '25-30': 0, '30+': 0 };
    registrations.forEach(reg => {
      const age = reg.age_at_registration || 0;
      if (age < 17) ageDistribution['13-16']++;
      else if (age < 20) ageDistribution['17-19']++;
      else if (age < 25) ageDistribution['20-24']++;
      else if (age <= 30) ageDistribution['25-30']++;
      else ageDistribution['30+']++;
    });

    const ageData = Object.entries(ageDistribution).map(([range, count]) => ({
      range,
      count,
      fill: COLORS[Object.keys(ageDistribution).indexOf(range)],
    }));

    // 4. By event
    const byEvent = {};
    registrations.forEach(reg => {
      if (!byEvent[reg.event_id]) byEvent[reg.event_id] = { athletes: 0, spectators: 0 };
      if (reg.type === 'athlete') byEvent[reg.event_id].athletes++;
      else byEvent[reg.event_id].spectators++;
    });

    const eventData = events
      .filter(e => byEvent[e.id])
      .map(e => ({
        name: e.title || 'Unknown Event',
        athletes: byEvent[e.id].athletes,
        spectators: byEvent[e.id].spectators,
      }))
      .sort((a, b) => (b.athletes + b.spectators) - (a.athletes + a.spectators))
      .slice(0, 5);

    // 5. Attendance mode split (spectators only)
    const spectatorsByMode = registrations
      .filter(r => r.type === 'spectator')
      .reduce((acc, r) => {
        const mode = r.attendance_mode === 'in-person' ? 'In-Person' : 'Online';
        acc[mode] = (acc[mode] || 0) + 1;
        return acc;
      }, {});

    const attendanceModeData = Object.entries(spectatorsByMode).map(([mode, count]) => ({
      name: mode,
      value: count,
      fill: mode === 'In-Person' ? '#ff9900' : '#9b00ff',
    }));

    // 6. Minor vs Adult split
    const minorCount = registrations.filter(r => r.is_minor).length;
    const adultCount = registrations.length - minorCount;

    // 7. Referral source breakdown
    const bySource = {};
    registrations.forEach(reg => {
      const source = reg.referral_source || 'direct';
      if (!bySource[source]) bySource[source] = { athletes: 0, spectators: 0 };
      if (reg.type === 'athlete') bySource[source].athletes++;
      else bySource[source].spectators++;
    });

    const sourceData = Object.entries(bySource)
      .map(([source, data]) => ({
        source,
        count: data.athletes + data.spectators,
        athletes: data.athletes,
        spectators: data.spectators,
      }))
      .sort((a, b) => b.count - a.count);

    return {
      totalRegs: registrations.length,
      athleteCount,
      spectatorCount,
      minorCount,
      adultCount,
      cumulativeGrowth,
      athleteSpectatorData,
      ageData,
      eventData,
      attendanceModeData,
      sourceData,
      growthRate: registrations.length > 0 
        ? ((growthData.reduce((s, g) => s + g.registrations, 0) / registrations.length) * 100).toFixed(1)
        : 0,
    };
  }, [registrations, events]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-4 border-fire-3/20 border-t-fire-3 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="section-container text-center py-20">
        <p className="font-mono text-fire-3/30">No registration data available</p>
      </div>
    );
  }

  return (
    <div className="section-container space-y-8">
      {/* Header */}
      <div>
        <h2 className="heading-fire text-4xl font-black mb-2">Registration Analytics</h2>
        <p className="font-mono text-sm text-fire-3/60">Real-time registration insights and demographic trends</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Registrations', value: analytics.totalRegs, icon: Users, color: 'fire-3' },
          { label: 'Athletes', value: analytics.athleteCount, icon: Activity, color: 'fire-3' },
          { label: 'Spectators', value: analytics.spectatorCount, icon: Users, color: 'cyan' },
          { label: 'Growth Rate', value: `${analytics.growthRate}%`, icon: TrendingUp, color: 'fire-5' },
        ].map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`bg-gradient-to-br from-${kpi.color}/10 to-${kpi.color}/5 border border-${kpi.color}/20 p-5`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className={`font-mono text-xs tracking-[2px] uppercase text-${kpi.color}/60 mb-1`}>
                    {kpi.label}
                  </div>
                  <div className={`font-orbitron font-black text-3xl text-${kpi.color}`}>
                    {kpi.value}
                  </div>
                </div>
                <Icon size={20} className={`text-${kpi.color}/40`} />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Registration Growth */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-fire-3/10 to-fire-3/5 border border-fire-3/20 p-6"
        >
          <h3 className="font-orbitron font-bold text-lg text-fire-5 mb-4">Registration Growth</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.cumulativeGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,80,0,0.1)" />
              <XAxis dataKey="date" stroke="rgba(255,80,0,0.4)" style={{ fontSize: '11px' }} />
              <YAxis stroke="rgba(255,80,0,0.4)" style={{ fontSize: '11px' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,80,0,0.3)' }}
                labelStyle={{ color: '#ff9900' }}
              />
              <Line
                type="monotone"
                dataKey="cumulative"
                stroke="#ff4400"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Athletes vs Spectators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-cyan/10 to-cyan/5 border border-cyan/20 p-6"
        >
          <h3 className="font-orbitron font-bold text-lg text-cyan mb-4">Athletes vs Spectators</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics.athleteSpectatorData}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={120}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {analytics.athleteSpectatorData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(0,255,238,0.3)' }}
                labelStyle={{ color: '#00ffee' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Age Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20 p-6"
        >
          <h3 className="font-orbitron font-bold text-lg text-purple-400 mb-4">Age Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.ageData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(155,0,255,0.1)" />
              <XAxis dataKey="range" stroke="rgba(155,0,255,0.4)" style={{ fontSize: '11px' }} />
              <YAxis stroke="rgba(155,0,255,0.4)" style={{ fontSize: '11px' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(155,0,255,0.3)' }}
                labelStyle={{ color: '#9b00ff' }}
              />
              <Bar dataKey="count" fill="#9b00ff" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Attendance Mode (Spectators) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-br from-fire-5/10 to-fire-5/5 border border-fire-5/20 p-6"
        >
          <h3 className="font-orbitron font-bold text-lg text-fire-5 mb-4">Spectator Attendance Mode</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics.attendanceModeData}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={120}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {analytics.attendanceModeData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,200,0,0.3)' }}
                labelStyle={{ color: '#ffcc00' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Event Performance Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-gradient-to-br from-fire-3/10 to-fire-3/5 border border-fire-3/20 p-6"
      >
        <h3 className="font-orbitron font-bold text-lg text-fire-5 mb-4">Top Events by Registrations</h3>
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {analytics.eventData.length === 0 ? (
            <p className="text-fire-3/40 text-sm">No events with registrations</p>
          ) : (
            analytics.eventData.map((event, i) => (
              <div
                key={i}
                className="bg-black/40 border border-fire-3/10 p-3 flex items-center justify-between hover:border-fire-3/30 transition-all"
              >
                <div>
                  <div className="font-rajdhani font-bold text-fire-5">{event.name}</div>
                  <div className="font-mono text-xs text-fire-3/60">
                    {event.athletes + event.spectators} total registrations
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="text-right">
                    <div className="font-orbitron font-bold text-fire-3">{event.athletes}</div>
                    <div className="font-mono text-xs text-fire-3/50">athletes</div>
                  </div>
                  <div className="text-right">
                    <div className="font-orbitron font-bold text-cyan">{event.spectators}</div>
                    <div className="font-mono text-xs text-cyan/50">spectators</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>

      {/* Referral Source Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-gradient-to-br from-fire-3/10 to-fire-3/5 border border-fire-3/20 p-6"
      >
        <h3 className="font-orbitron font-bold text-lg text-fire-5 mb-4">Registration Source Breakdown</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {analytics.sourceData.map((source, i) => (
            <div key={i} className="bg-black/40 border border-fire-3/10 p-4">
              <div className="font-rajdhani font-bold text-sm text-fire-5 mb-1 capitalize">
                {source.source.replace('_', ' ')}
              </div>
              <div className="font-orbitron font-black text-2xl text-fire-3 mb-2">{source.count}</div>
              <div className="flex gap-2">
                <div className="text-xs text-fire-3/60">
                  <div className="font-mono">Athletes: {source.athletes}</div>
                  <div className="font-mono">Spectators: {source.spectators}</div>
                </div>
              </div>
              <div className="font-mono text-xs text-fire-4 mt-2">
                {((source.count / analytics.totalRegs) * 100).toFixed(1)}%
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Demographics Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <div className="bg-gradient-to-br from-cyan/10 to-cyan/5 border border-cyan/20 p-5">
          <div className="font-mono text-xs tracking-[2px] uppercase text-cyan/60 mb-2">Minor Registration</div>
          <div className="font-orbitron font-black text-3xl text-cyan mb-1">{analytics.minorCount}</div>
          <div className="font-mono text-xs text-cyan/50">
            {((analytics.minorCount / analytics.totalRegs) * 100).toFixed(1)}% of total
          </div>
        </div>
        <div className="bg-gradient-to-br from-fire-3/10 to-fire-3/5 border border-fire-3/20 p-5">
          <div className="font-mono text-xs tracking-[2px] uppercase text-fire-3/60 mb-2">Adult Registration</div>
          <div className="font-orbitron font-black text-3xl text-fire-3 mb-1">{analytics.adultCount}</div>
          <div className="font-mono text-xs text-fire-3/50">
            {((analytics.adultCount / analytics.totalRegs) * 100).toFixed(1)}% of total
          </div>
        </div>
      </motion.div>
    </div>
  );
}