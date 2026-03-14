import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Zap, Share2, Video, Aperture, Users, TrendingUp, Gift, Star } from 'lucide-react';
import { toast } from 'sonner';
import ModernAchievementBadge from './ModernAchievementBadge';

export default function UpgradedGamificationHub({ eventId, lang = 'en' }) {
  const [activeTab, setActiveTab] = useState('tasks');
  const [claimingTask, setClaimingTask] = useState(null);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: fanPoints = {} } = useQuery({
    queryKey: ['fan-points', eventId, user?.email],
    queryFn: () => base44.entities.FanPoints.filter({ event_id: eventId, fan_email: user?.email }).then(r => r[0] || {}),
    enabled: !!user && !!eventId,
  });

  const { data: ugcSubmissions = [] } = useQuery({
    queryKey: ['ugc-submissions', user?.email],
    queryFn: () => base44.entities.UGCSubmission.filter({ creator_email: user?.email }),
    enabled: !!user,
  });

  const claimTaskMutation = useMutation({
    mutationFn: async (task) => {
      // Award points
      const current = fanPoints[task.point_type] || 0;
      await base44.entities.FanPoints.update(fanPoints.id || await base44.entities.FanPoints.create({
        event_id: eventId,
        fan_email: user.email,
        fan_name: user.full_name,
        [task.point_type]: current + task.points,
      }).then(r => r.id), {
        [task.point_type]: current + task.points,
        total_points: (fanPoints.total_points || 0) + task.points,
        last_updated: new Date().toISOString(),
      });
      toast.success(`+${task.points} points! 🔥`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fan-points'] });
      setClaimingTask(null);
    },
  });

  const tasks = [
    {
      id: 'ugc-video-master',
      icon: <Video size={20} />,
      title: 'Video Creator',
      description: 'Record 15-30s reaction, highlight or hype clip',
      points: 250,
      point_type: 'chat_points',
      claimed: ugcSubmissions.some(s => s.type === 'video'),
      color: 'from-fire-3/20 to-fire-3/5',
      borderColor: 'border-fire-3/30',
      tier: 'premium',
    },
    {
      id: 'ugc-photo-streak',
      icon: <Aperture size={20} />,
      title: 'Moment Capture',
      description: 'Upload 3 unique photos from the event',
      points: 180,
      point_type: 'chat_points',
      claimed: ugcSubmissions.filter(s => s.type === 'photo').length >= 3,
      progress: Math.min(ugcSubmissions.filter(s => s.type === 'photo').length / 3, 1),
      color: 'from-fire-5/20 to-fire-5/5',
      borderColor: 'border-fire-5/30',
      tier: 'premium',
    },
    {
      id: 'content-viral',
      icon: <TrendingUp size={20} />,
      title: 'Viral Amplifier',
      description: 'Get your UGC featured with 50+ engagement',
      points: 400,
      point_type: 'chat_points',
      claimed: ugcSubmissions.some(s => (s.engagement_count || 0) >= 50),
      color: 'from-cyan/20 to-cyan/5',
      borderColor: 'border-cyan/30',
      tier: 'elite',
    },
    {
      id: 'referral-network',
      icon: <Users size={20} />,
      title: 'Network Builder',
      description: 'Invite 5 friends to register and attend',
      points: 500,
      point_type: 'chat_points',
      claimed: false,
      claimed_count: 0,
      progress: 0,
      color: 'from-purple-500/20 to-purple-500/5',
      borderColor: 'border-purple-500/30',
      tier: 'elite',
    },
    {
      id: 'hashtag-campaign',
      icon: <Share2 size={20} />,
      title: 'Hashtag Power',
      description: 'Post with event hashtag 10 times across platforms',
      points: 200,
      point_type: 'chat_points',
      claimed: false,
      progress: 0,
      color: 'from-green-500/20 to-green-500/5',
      borderColor: 'border-green-500/30',
      tier: 'premium',
    },
    {
      id: 'prediction-streak',
      icon: <Zap size={20} />,
      title: 'Prediction Prophet',
      description: 'Get 5 consecutive predictions correct',
      points: 300,
      point_type: 'prediction_points',
      claimed: (fanPoints.correct_predictions || 0) >= 5,
      progress: Math.min((fanPoints.correct_predictions || 0) / 5, 1),
      color: 'from-yellow-500/20 to-yellow-500/5',
      borderColor: 'border-yellow-500/30',
      tier: 'premium',
    },
  ];

  const achievements = [
    { id: 'content-master', unlocked: ugcSubmissions.length >= 5, progress: Math.min(ugcSubmissions.length / 5, 1) },
    { id: 'network-architect', unlocked: false, progress: 0.3 },
    { id: 'engagement-magnet', unlocked: (fanPoints.total_points || 0) >= 250, progress: Math.min((fanPoints.total_points || 0) / 250, 1) },
    { id: 'influence-nexus', unlocked: false, progress: 0.5 },
    { id: 'viral-catalyst', unlocked: ugcSubmissions.some(s => (s.engagement_count || 0) >= 100), progress: 0.8 },
    { id: 'legacy-builder', unlocked: (fanPoints.total_points || 0) >= 1000, progress: Math.min((fanPoints.total_points || 0) / 1000, 1) },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      {/* Header Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-3 gap-4"
      >
        <div className="bg-gradient-to-br from-fire-3/10 to-transparent border border-fire-3/30 p-4 clip-cyber">
          <div className="font-mono text-[10px] tracking-[2px] uppercase text-fire-3/60 mb-1">Total Points</div>
          <div className="font-orbitron text-3xl font-bold text-fire-5">{fanPoints.total_points || 0}</div>
        </div>
        <div className="bg-gradient-to-br from-cyan/10 to-transparent border border-cyan/30 p-4 clip-cyber">
          <div className="font-mono text-[10px] tracking-[2px] uppercase text-cyan/60 mb-1">UGC Submissions</div>
          <div className="font-orbitron text-3xl font-bold text-cyan">{ugcSubmissions.length}</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/30 p-4 clip-cyber">
          <div className="font-mono text-[10px] tracking-[2px] uppercase text-purple-500/60 mb-1">Rank</div>
          <div className="font-orbitron text-3xl font-bold text-purple-400">#{fanPoints.rank || '—'}</div>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-fire-3/10">
        {['tasks', 'badges'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 font-orbitron text-[11px] tracking-[2px] uppercase border-b-2 transition-all ${
              activeTab === tab
                ? 'border-fire-3 text-fire-4'
                : 'border-transparent text-fire-3/40 hover:text-fire-3'
            }`}
          >
            {tab === 'tasks' ? 'TASKS' : 'ACHIEVEMENTS'}
          </button>
        ))}
      </div>

      {/* Tasks Tab */}
      {activeTab === 'tasks' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tasks.map((task) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`border-2 ${task.borderColor} bg-gradient-to-br ${task.color} p-5 relative overflow-hidden group cursor-pointer hover:shadow-[0_0_20px_rgba(255,100,0,0.2)] transition-all clip-cyber`}
              onClick={() => !task.claimed && setClaimingTask(task)}
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-fire-3/10 to-transparent blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-3">
                  <div className="text-fire-3">{task.icon}</div>
                  <div className="font-orbitron text-lg font-bold text-fire-5">{task.points}</div>
                </div>
                <h3 className="font-orbitron font-bold text-fire-4 mb-1">{task.title}</h3>
                <p className="font-mono text-[10px] text-fire-3/60 mb-3">{task.description}</p>
                
                {task.progress !== undefined && (
                  <div className="mb-3">
                    <div className="w-full h-2 bg-black/40 border border-fire-3/20 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-fire-3 to-fire-5 transition-all"
                        style={{ width: `${task.progress * 100}%` }}
                      />
                    </div>
                  </div>
                )}
                
                <button
                  disabled={task.claimed}
                  className={`w-full py-2 text-[10px] font-mono tracking-[2px] uppercase border-2 transition-all ${
                    task.claimed
                      ? 'border-green-500/40 bg-green-500/10 text-green-400 cursor-not-allowed'
                      : 'border-fire-3/60 bg-fire-3/10 text-fire-3 hover:border-fire-3 hover:bg-fire-3/20'
                  }`}
                >
                  {task.claimed ? 'CLAIMED' : 'CLAIM'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Badges Tab */}
      {activeTab === 'badges' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {achievements.map((ach) => (
            <ModernAchievementBadge
              key={ach.id}
              badgeId={ach.id}
              unlocked={ach.unlocked}
              progress={ach.progress}
            />
          ))}
        </div>
      )}

      {/* Referral Link Section */}
      <div className="border border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-transparent p-6 clip-cyber">
        <h3 className="font-orbitron font-bold text-purple-400 mb-2">Your Referral Link</h3>
        <p className="font-mono text-[10px] text-purple-500/60 mb-3">Share & earn points for each friend who registers and attends</p>
        <div className="flex gap-2">
          <input
            type="text"
            readOnly
            value={`https://streetdinamics.com/events/${eventId}?ref=${user?.email}`}
            className="cyber-input text-sm flex-1"
          />
          <button
            onClick={() => {
              navigator.clipboard.writeText(`https://streetdinamics.com/events/${eventId}?ref=${user?.email}`);
              toast.success('Link copied!');
            }}
            className="btn-fire py-2 px-4 text-[10px]"
          >
            Copy
          </button>
        </div>
      </div>

      {/* Rewards Section */}
      <div className="border border-fire-3/30 bg-gradient-to-br from-fire-3/10 to-transparent p-6 clip-cyber">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-orbitron font-bold text-fire-4 mb-1">Rewards Marketplace</h3>
            <p className="font-mono text-[10px] text-fire-3/60">Redeem points for exclusive merch and NFT drops</p>
          </div>
          <button className="btn-fire py-2 px-6 text-[10px]">Coming Soon</button>
        </div>
      </div>
    </div>
  );
}