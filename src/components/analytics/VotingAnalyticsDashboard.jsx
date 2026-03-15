import React, { useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Vote, TrendingUp, Users, Award } from 'lucide-react';

export default function VotingAnalyticsDashboard({ isAdmin = false }) {
  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: eventVotes = [] } = useQuery({
    queryKey: ['all-event-votes'],
    queryFn: () => base44.entities.EventVote?.list?.('-created_date', 200).catch(() => []) || [],
  });

  const { data: userVotes = [] } = useQuery({
    queryKey: ['user-votes', user?.email],
    queryFn: () => base44.entities.UserVote?.filter?.({ created_by: user?.email }).catch(() => []) || [],
    enabled: !!user?.email,
  });

  const { data: matchupVotes = [] } = useQuery({
    queryKey: isAdmin ? ['all-matchup-votes'] : ['user-matchup-votes', user?.email],
    queryFn: () => isAdmin
      ? base44.entities.MatchupVote?.list?.('-created_date', 500).catch(() => []) || []
      : base44.entities.MatchupVote?.filter?.({ created_by: user?.email }).catch(() => []) || [],
    enabled: isAdmin || !!user?.email,
  });

  // Voting participation over time
  const votingTimeline = useMemo(() => {
    const last14Days = Array.from({ length: 14 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (13 - i));
      return date.toISOString().split('T')[0];
    });

    return last14Days.map(date => {
      const dayVotes = isAdmin 
        ? [...matchupVotes, ...userVotes].filter(v => v.created_date?.startsWith(date))
        : userVotes.filter(v => v.created_date?.startsWith(date));
      
      return {
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        votes: dayVotes.length,
        participation: dayVotes.length * 10,
      };
    });
  }, [matchupVotes, userVotes, isAdmin]);

  // Campaign status breakdown
  const campaignStatus = useMemo(() => {
    const statuses = { active: 0, closed: 0, upcoming: 0 };
    eventVotes.forEach(v => {
      statuses[v.status] = (statuses[v.status] || 0) + 1;
    });
    return [
      { name: 'Active', value: statuses.active, color: '#00ffee' },
      { name: 'Closed', value: statuses.closed, color: '#9b00ff' },
      { name: 'Upcoming', value: statuses.upcoming, color: '#ff6600' },
    ];
  }, [eventVotes]);

  // Top voted campaigns
  const topCampaigns = useMemo(() => {
    return eventVotes
      .sort((a, b) => (b.total_votes || 0) - (a.total_votes || 0))
      .slice(0, 8)
      .map(c => ({
        name: c.campaign_name?.substring(0, 20) || 'Campaign',
        votes: c.total_votes || 0,
        participants: c.unique_voters || 0,
      }));
  }, [eventVotes]);

  // Voting accuracy (for user)
  const votingAccuracy = useMemo(() => {
    if (isAdmin) return null;
    const total = userVotes.length;
    const correct = userVotes.filter(v => v.is_correct).length;
    return total > 0 ? ((correct / total) * 100).toFixed(1) : 0;
  }, [userVotes, isAdmin]);

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: isAdmin ? 'Total Campaigns' : 'Votes Cast', value: isAdmin ? eventVotes.length : userVotes.length, icon: Vote, color: 'cyan' },
          { label: isAdmin ? 'Total Votes' : 'Accuracy', value: isAdmin ? matchupVotes.length + userVotes.length : `${votingAccuracy}%`, icon: TrendingUp, color: 'fire-3' },
          { label: isAdmin ? 'Avg Participation' : 'Campaigns Joined', value: isAdmin ? Math.round(eventVotes.reduce((sum, v) => sum + (v.total_votes || 0), 0) / (eventVotes.length || 1)) : new Set(userVotes.map(v => v.campaign_id)).size, icon: Users, color: 'purple-500' },
          { label: isAdmin ? 'Active Campaigns' : 'Wins', value: isAdmin ? campaignStatus[0]?.value || 0 : userVotes.filter(v => v.is_correct).length, icon: Award, color: 'fire-5' },
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

      {/* Voting Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-[rgba(10,4,18,0.98)] to-[rgba(4,2,8,1)] border border-fire-3/20 p-6 clip-cyber"
      >
        <h3 className="font-orbitron font-bold text-xl text-fire-4 mb-6">14-DAY VOTING ACTIVITY</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={votingTimeline}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,100,0,0.1)" />
            <XAxis dataKey="date" stroke="#ff6600" style={{ fontSize: '10px', fontFamily: 'monospace' }} />
            <YAxis stroke="#ff6600" style={{ fontSize: '10px', fontFamily: 'monospace' }} />
            <Tooltip contentStyle={{ background: '#080512', border: '1px solid rgba(255,100,0,0.3)', borderRadius: '0', fontFamily: 'monospace' }} />
            <Legend wrapperStyle={{ fontFamily: 'monospace', fontSize: '11px' }} />
            <Line type="monotone" dataKey="votes" stroke="#00ffee" strokeWidth={2} dot={{ fill: '#00ffee', r: 4 }} />
            <Line type="monotone" dataKey="participation" stroke="#9b00ff" strokeWidth={2} strokeDasharray="5 5" />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Campaign Status */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gradient-to-br from-[rgba(10,4,18,0.98)] to-[rgba(4,2,8,1)] border border-fire-3/20 p-6 clip-cyber"
        >
          <h3 className="font-orbitron font-bold text-lg text-fire-4 mb-6">CAMPAIGN STATUS</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={campaignStatus}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {campaignStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#080512', border: '1px solid rgba(255,100,0,0.3)', fontFamily: 'monospace' }} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Top Campaigns */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gradient-to-br from-[rgba(10,4,18,0.98)] to-[rgba(4,2,8,1)] border border-fire-3/20 p-6 clip-cyber"
        >
          <h3 className="font-orbitron font-bold text-lg text-fire-4 mb-6">TOP CAMPAIGNS</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={topCampaigns}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,100,0,0.1)" />
              <XAxis dataKey="name" stroke="#ff6600" style={{ fontSize: '8px', fontFamily: 'monospace' }} angle={-45} textAnchor="end" height={80} />
              <YAxis stroke="#ff6600" style={{ fontSize: '10px', fontFamily: 'monospace' }} />
              <Tooltip contentStyle={{ background: '#080512', border: '1px solid rgba(255,100,0,0.3)', fontFamily: 'monospace' }} />
              <Bar dataKey="votes" fill="#00ffee" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
}