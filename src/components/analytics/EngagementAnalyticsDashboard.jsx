import React, { useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, MessageSquare, Vote, DollarSign } from 'lucide-react';

export default function EngagementAnalyticsDashboard({ isAdmin = false }) {
  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: chatMessages = [] } = useQuery({
    queryKey: ['all-chat-messages'],
    queryFn: () => base44.entities.ChatMessage.list('-timestamp', 1000).catch(() => []),
    enabled: isAdmin,
  });

  const { data: userChatMessages = [] } = useQuery({
    queryKey: ['user-chat-messages', user?.email],
    queryFn: () => base44.entities.ChatMessage.filter({ user_email: user?.email }).catch(() => []),
    enabled: !isAdmin && !!user?.email,
  });

  const { data: ugcSubmissions = [] } = useQuery({
    queryKey: isAdmin ? ['all-ugc'] : ['user-ugc', user?.email],
    queryFn: () => isAdmin 
      ? base44.entities.UGCSubmission.list('-submitted_at', 500).catch(() => [])
      : base44.entities.UGCSubmission.filter({ creator_email: user?.email }).catch(() => []),
    enabled: isAdmin || !!user?.email,
  });

  const { data: fanPoints = [] } = useQuery({
    queryKey: isAdmin ? ['all-fan-points'] : ['user-fan-points', user?.email],
    queryFn: () => isAdmin
      ? base44.entities.FanPoints.list('-total_points', 100).catch(() => [])
      : base44.entities.FanPoints.filter({ fan_email: user?.email }).catch(() => []),
    enabled: isAdmin || !!user?.email,
  });

  const messages = isAdmin ? chatMessages : userChatMessages;

  // Time-based engagement metrics
  const engagementTimeline = useMemo(() => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return date.toISOString().split('T')[0];
    });

    return last30Days.map(date => {
      const dayMessages = messages.filter(m => m.timestamp?.startsWith(date));
      const dayUGC = ugcSubmissions.filter(u => u.submitted_at?.startsWith(date));
      
      return {
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        messages: dayMessages.length,
        ugc: dayUGC.length,
        engagement: dayMessages.length + dayUGC.length * 5,
      };
    });
  }, [messages, ugcSubmissions]);

  // UGC type distribution
  const ugcTypeData = useMemo(() => {
    const types = { video: 0, photo: 0, post: 0 };
    ugcSubmissions.forEach(u => {
      types[u.type] = (types[u.type] || 0) + 1;
    });
    return [
      { name: 'Videos', value: types.video, color: '#ff6600' },
      { name: 'Photos', value: types.photo, color: '#00ffee' },
      { name: 'Posts', value: types.post, color: '#9b00ff' },
    ];
  }, [ugcSubmissions]);

  // Top performers
  const topPerformers = useMemo(() => {
    return fanPoints
      .sort((a, b) => (b.total_points || 0) - (a.total_points || 0))
      .slice(0, 10)
      .map(p => ({
        name: p.fan_name?.substring(0, 15) || 'Anonymous',
        points: p.total_points || 0,
        messages: p.messages_count || 0,
      }));
  }, [fanPoints]);

  // Engagement breakdown
  const engagementBreakdown = useMemo(() => {
    const totalMessages = messages.length;
    const totalUGC = ugcSubmissions.length;
    const totalEngagement = ugcSubmissions.reduce((sum, u) => sum + (u.engagement_count || 0), 0);
    
    return [
      { category: 'Chat Messages', value: totalMessages },
      { category: 'UGC Submissions', value: totalUGC },
      { category: 'Total Engagement', value: totalEngagement },
    ];
  }, [messages, ugcSubmissions]);

  const COLORS = ['#ff6600', '#00ffee', '#9b00ff', '#ffcc00'];

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Messages', value: messages.length, icon: MessageSquare, color: 'cyan' },
          { label: 'UGC Submissions', value: ugcSubmissions.length, icon: TrendingUp, color: 'fire-3' },
          { label: isAdmin ? 'Active Users' : 'Total Points', value: isAdmin ? fanPoints.length : fanPoints.reduce((sum, p) => sum + (p.total_points || 0), 0), icon: Users, color: 'purple-500' },
          { label: 'Avg Engagement', value: Math.round(ugcSubmissions.reduce((sum, u) => sum + (u.engagement_count || 0), 0) / (ugcSubmissions.length || 1)), icon: TrendingUp, color: 'fire-5' },
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

      {/* Engagement Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-[rgba(10,4,18,0.98)] to-[rgba(4,2,8,1)] border border-fire-3/20 p-6 clip-cyber"
      >
        <h3 className="font-orbitron font-bold text-xl text-fire-4 mb-6">30-DAY ENGAGEMENT TIMELINE</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={engagementTimeline}>
            <defs>
              <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ff6600" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#ff6600" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,100,0,0.1)" />
            <XAxis dataKey="date" stroke="#ff6600" style={{ fontSize: '10px', fontFamily: 'monospace' }} />
            <YAxis stroke="#ff6600" style={{ fontSize: '10px', fontFamily: 'monospace' }} />
            <Tooltip contentStyle={{ background: '#080512', border: '1px solid rgba(255,100,0,0.3)', borderRadius: '0', fontFamily: 'monospace' }} />
            <Legend wrapperStyle={{ fontFamily: 'monospace', fontSize: '11px' }} />
            <Area type="monotone" dataKey="engagement" stroke="#ff6600" fillOpacity={1} fill="url(#colorEngagement)" />
            <Area type="monotone" dataKey="messages" stroke="#00ffee" fill="#00ffee" fillOpacity={0.3} />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* UGC Type Distribution */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gradient-to-br from-[rgba(10,4,18,0.98)] to-[rgba(4,2,8,1)] border border-fire-3/20 p-6 clip-cyber"
        >
          <h3 className="font-orbitron font-bold text-lg text-fire-4 mb-6">UGC CONTENT TYPES</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={ugcTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {ugcTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#080512', border: '1px solid rgba(255,100,0,0.3)', fontFamily: 'monospace' }} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Top Performers */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gradient-to-br from-[rgba(10,4,18,0.98)] to-[rgba(4,2,8,1)] border border-fire-3/20 p-6 clip-cyber"
        >
          <h3 className="font-orbitron font-bold text-lg text-fire-4 mb-6">
            {isAdmin ? 'TOP PERFORMERS' : 'YOUR RANK'}
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={topPerformers} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,100,0,0.1)" />
              <XAxis type="number" stroke="#ff6600" style={{ fontSize: '10px', fontFamily: 'monospace' }} />
              <YAxis dataKey="name" type="category" stroke="#ff6600" style={{ fontSize: '9px', fontFamily: 'monospace' }} width={100} />
              <Tooltip contentStyle={{ background: '#080512', border: '1px solid rgba(255,100,0,0.3)', fontFamily: 'monospace' }} />
              <Bar dataKey="points" fill="#ff6600" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
}