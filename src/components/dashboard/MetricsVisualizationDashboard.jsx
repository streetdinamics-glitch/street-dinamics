import React, { useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { TrendingUp, Zap, Users, Trophy } from 'lucide-react';

export default function MetricsVisualizationDashboard({ lang = 'en' }) {
  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: fanPoints = [] } = useQuery({
    queryKey: ['fan-points'],
    queryFn: async () => {
      if (!user?.email) return [];
      return base44.entities.FanPoints.filter({ fan_email: user.email });
    },
    enabled: !!user?.email,
  });

  const { data: registrations = [] } = useQuery({
    queryKey: ['registrations'],
    queryFn: async () => {
      if (!user?.email) return [];
      return base44.entities.Registration.filter({ email: user.email });
    },
    enabled: !!user?.email,
  });

  const { data: events = [] } = useQuery({
    queryKey: ['events'],
    queryFn: () => base44.entities.Event.list('-created_date', 50),
  });

  const { data: tokens = [] } = useQuery({
    queryKey: ['my-tokens'],
    queryFn: async () => {
      if (!user?.email) return [];
      return base44.entities.TokenOwnership.filter({ created_by: user.email });
    },
    enabled: !!user?.email,
  });

  // Chart data: User engagement trend (simulated from registrations)
  const engagementTrend = useMemo(() => {
    const monthlyData = {};
    registrations.forEach((reg) => {
      const date = new Date(reg.registration_date || reg.created_date);
      const month = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      monthlyData[month] = (monthlyData[month] || 0) + 1;
    });
    return Object.entries(monthlyData)
      .slice(-6)
      .map(([month, count]) => ({ month, registrations: count }));
  }, [registrations]);

  // Chart data: Fan points breakdown
  const fanPointsBreakdown = useMemo(() => {
    if (fanPoints.length === 0) return [];
    const data = fanPoints[0];
    return [
      { name: 'Chat', value: data.chat_points || 0 },
      { name: 'Votes', value: data.vote_points || 0 },
      { name: 'Predictions', value: data.prediction_points || 0 },
    ];
  }, [fanPoints]);

  // Chart data: Event attendance
  const eventAttendance = useMemo(() => {
    return events.slice(0, 6).map((ev) => {
      const attending = registrations.filter((r) => r.event_id === ev.id).length;
      return {
        name: ev.name?.substring(0, 10) || 'Event',
        attendees: attending,
        capacity: ev.max_participants || 100,
      };
    });
  }, [events, registrations]);

  // KPI Cards
  const metrics = [
    {
      label: 'Total Points',
      value: fanPoints[0]?.total_points || 0,
      icon: Zap,
      color: 'text-fire-3',
    },
    {
      label: 'Events Attended',
      value: registrations.length,
      icon: Users,
      color: 'text-cyan',
    },
    {
      label: 'Tokens Owned',
      value: tokens.length,
      icon: Trophy,
      color: 'text-purple-400',
    },
    {
      label: 'Ranking',
      value: fanPoints[0]?.rank || 'N/A',
      icon: TrendingUp,
      color: 'text-fire-5',
    },
  ];

  const chartColors = {
    primary: '#ff4400',
    secondary: '#00ffee',
    tertiary: '#9b00ff',
  };

  return (
    <section className="section-container mt-16">
      <div className="absolute bottom-[-1px] left-0 right-0 h-[1px] fire-line" />

      <h2 className="heading-fire text-4xl font-black mb-12 text-center">
        YOUR METRICS
      </h2>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {metrics.map((metric, i) => {
          const Icon = metric.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-gradient-to-br from-fire-3/10 to-fire-3/5 border border-fire-3/20 p-5 text-center"
            >
              <Icon size={24} className={`${metric.color} mx-auto mb-3`} />
              <div className="font-mono text-xs text-fire-3/60 mb-1 uppercase tracking-[1px]">
                {metric.label}
              </div>
              <div className="font-orbitron font-black text-3xl text-fire-5">
                {metric.value}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Engagement Trend */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-fire-3/10 to-fire-3/5 border border-fire-3/20 p-6"
        >
          <h3 className="font-orbitron font-bold text-xl text-fire-5 mb-4">
            Event Registrations
          </h3>
          {engagementTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={engagementTrend}>
                <defs>
                  <linearGradient id="colorReg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartColors.primary} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={chartColors.primary} stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,68,0,0.1)" />
                <XAxis dataKey="month" stroke={chartColors.primary} />
                <YAxis stroke={chartColors.primary} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(4,2,10,0.95)',
                    border: `1px solid ${chartColors.primary}`,
                    borderRadius: '4px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="registrations"
                  stroke={chartColors.primary}
                  fillOpacity={1}
                  fill="url(#colorReg)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-fire-3/30 font-mono text-sm">
              No registration data yet
            </div>
          )}
        </motion.div>

        {/* Fan Points Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-cyan/10 to-cyan/5 border border-cyan/20 p-6"
        >
          <h3 className="font-orbitron font-bold text-xl text-cyan mb-4">
            Points Breakdown
          </h3>
          {fanPointsBreakdown.length > 0 && fanPointsBreakdown.some(p => p.value > 0) ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={fanPointsBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  <Cell fill={chartColors.primary} />
                  <Cell fill={chartColors.secondary} />
                  <Cell fill={chartColors.tertiary} />
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(4,2,10,0.95)',
                    border: `1px solid ${chartColors.secondary}`,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-cyan/30 font-mono text-sm">
              No points earned yet
            </div>
          )}
        </motion.div>

        {/* Event Attendance */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20 p-6 lg:col-span-2"
        >
          <h3 className="font-orbitron font-bold text-xl text-purple-400 mb-4">
            Event Capacity Overview
          </h3>
          {eventAttendance.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={eventAttendance}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(155,0,255,0.1)" />
                <XAxis dataKey="name" stroke={chartColors.tertiary} />
                <YAxis stroke={chartColors.tertiary} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(4,2,10,0.95)',
                    border: `1px solid ${chartColors.tertiary}`,
                  }}
                />
                <Legend />
                <Bar dataKey="attendees" fill={chartColors.secondary} name="Attendees" />
                <Bar dataKey="capacity" fill={chartColors.tertiary} opacity={0.5} name="Capacity" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-purple-400/30 font-mono text-sm">
              No event data yet
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}