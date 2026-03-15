import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Zap, Share2, Video, Aperture, Users, TrendingUp, Gift, Star } from 'lucide-react';
import { toast } from 'sonner';
import ModernAchievementBadge from './ModernAchievementBadge';
import AchievementClaimModal from './AchievementClaimModal';

export default function UpgradedGamificationHub({ eventId, lang = 'en' }) {
  const [activeTab, setActiveTab] = useState('tasks');
  const [claimingTask, setClaimingTask] = useState(null);
  const [claimModal, setClaimModal] = useState(null);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: fanPoints = {} } = useQuery({
    queryKey: ['fan-points', eventId, user?.email],
    queryFn: () => base44.entities.FanPoints.filter({ event_id: eventId, fan_email: user?.email }).then(r => r[0] || {}),
    enabled: !!user && !!eventId,
    staleTime: 60000,
  });

  const { data: ugcSubmissions = [] } = useQuery({
    queryKey: ['ugc-submissions', user?.email],
    queryFn: () => base44.entities.UGCSubmission.filter({ creator_email: user?.email }),
    enabled: !!user,
    staleTime: 60000,
  });

  // Track referral conversions
  const { data: referralStats = { total: 0, successful: 0 } } = useQuery({
    queryKey: ['referral-stats', user?.email],
    queryFn: async () => {
      const registrations = await base44.entities.Registration.filter({ referral_source_detail: user?.email });
      return {
        total: registrations.length,
        successful: registrations.filter(r => r.status === 'confirmed').length,
      };
    },
    enabled: !!user?.email,
    staleTime: 60000,
  });

  const claimTaskMutation = useMutation({
    mutationFn: async (task) => {
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
      toast.success(`+${task.points} points awarded`);
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
      description: 'Record and submit a 15-30s reaction or highlight clip',
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
      title: 'Visual Storyteller',
      description: 'Submit 3 unique photos from the live event',
      points: 200,
      point_type: 'chat_points',
      claimed: ugcSubmissions.filter(s => s.type === 'photo').length >= 3,
      progress: Math.min(ugcSubmissions.filter(s => s.type === 'photo').length / 3, 1),
      color: 'from-fire-5/20 to-fire-5/5',
      borderColor: 'border-fire-5/30',
      tier: 'premium',
    },
    {
      id: 'ugc-series-builder',
      icon: <Video size={20} />,
      title: 'Content Series Creator',
      description: 'Submit 5 total UGC posts across different types',
      points: 350,
      point_type: 'chat_points',
      claimed: ugcSubmissions.length >= 5,
      progress: Math.min(ugcSubmissions.length / 5, 1),
      color: 'from-orange-500/20 to-orange-500/5',
      borderColor: 'border-orange-500/30',
      tier: 'premium',
    },
    {
      id: 'content-viral',
      icon: <TrendingUp size={20} />,
      title: 'Engagement Magnet',
      description: 'Achieve 50+ engagement on a single UGC post',
      points: 400,
      point_type: 'chat_points',
      claimed: ugcSubmissions.some(s => (s.engagement_count || 0) >= 50),
      progress: Math.min(ugcSubmissions.filter(s => (s.engagement_count || 0) >= 50).length / 1, 1),
      color: 'from-cyan/20 to-cyan/5',
      borderColor: 'border-cyan/30',
      tier: 'elite',
    },
    {
      id: 'ugc-engagement-master',
      icon: <TrendingUp size={20} />,
      title: 'Engagement Optimizer',
      description: 'Accumulate 500+ total engagement across all UGC',
      points: 600,
      point_type: 'chat_points',
      claimed: ugcSubmissions.reduce((sum, s) => sum + (s.engagement_count || 0), 0) >= 500,
      progress: Math.min(ugcSubmissions.reduce((sum, s) => sum + (s.engagement_count || 0), 0) / 500, 1),
      color: 'from-red-500/20 to-red-500/5',
      borderColor: 'border-red-500/30',
      tier: 'elite',
    },
    {
      id: 'hashtag-campaign',
      icon: <Share2 size={20} />,
      title: 'Social Amplifier',
      description: 'Share event content 10 times across platforms',
      points: 300,
      point_type: 'chat_points',
      claimed: ugcSubmissions.filter(s => s.social_links && Object.keys(s.social_links).length > 0).length >= 10,
      progress: Math.min(ugcSubmissions.filter(s => s.social_links && Object.keys(s.social_links).length > 0).length / 10, 1),
      color: 'from-green-500/20 to-green-500/5',
      borderColor: 'border-green-500/30',
      tier: 'premium',
    },
    {
      id: 'referral-network',
      icon: <Users size={20} />,
      title: 'Affiliate Recruiter',
      description: 'Bring 5 successful referrals to the event',
      points: 500,
      point_type: 'chat_points',
      claimed: referralStats.successful >= 5,
      progress: Math.min(referralStats.successful / 5, 1),
      color: 'from-purple-500/20 to-purple-500/5',
      borderColor: 'border-purple-500/30',
      tier: 'elite',
    },
    {
      id: 'multi-referral-expert',
      icon: <Users size={20} />,
      title: 'Network Influence',
      description: 'Refer 10+ users to the platform',
      points: 700,
      point_type: 'chat_points',
      claimed: referralStats.total >= 10,
      progress: Math.min(referralStats.total / 10, 1),
      color: 'from-cyan/20 to-cyan/5',
      borderColor: 'border-cyan/30',
      tier: 'elite',
    },
    {
      id: 'prediction-streak',
      icon: <Zap size={20} />,
      title: 'Prediction Master',
      description: 'Achieve 5 consecutive correct predictions',
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
    { id: 'founder', unlocked: ugcSubmissions.length >= 5, progress: Math.min(ugcSubmissions.length / 5, 1) },
    { id: 'ambassador', unlocked: referralStats.successful >= 5, progress: Math.min(referralStats.successful / 5, 1) },
    { id: 'curator', unlocked: (fanPoints.total_points || 0) >= 250, progress: Math.min((fanPoints.total_points || 0) / 250, 1) },
    { id: 'trailblazer', unlocked: ugcSubmissions.some(s => (s.engagement_count || 0) >= 100), progress: Math.min(ugcSubmissions.filter(s => (s.engagement_count || 0) >= 100).length / 3, 1) },
    { id: 'catalyst', unlocked: ugcSubmissions.reduce((sum, s) => sum + (s.engagement_count || 0), 0) >= 500, progress: Math.min(ugcSubmissions.reduce((sum, s) => sum + (s.engagement_count || 0), 0) / 500, 1) },
    { id: 'luminary', unlocked: (fanPoints.total_points || 0) >= 1000, progress: Math.min((fanPoints.total_points || 0) / 1000, 1) },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-3 gap-4"
      >
        <div className="bg-gradient-to-br from-cyan/10 to-transparent border border-cyan/30 p-4 clip-cyber">
          <div className="font-mono text-[10px] tracking-[2px] uppercase text-cyan/60 mb-1">Content Submitted</div>
          <div className="font-orbitron text-3xl font-bold text-cyan">{ugcSubmissions.length}</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/30 p-4 clip-cyber">
          <div className="font-mono text-[10px] tracking-[2px] uppercase text-purple-500/60 mb-1">Referrals Active</div>
          <div className="font-orbitron text-3xl font-bold text-purple-400">{referralStats.total}</div>
        </div>
        <div className="bg-gradient-to-br from-fire-3/10 to-transparent border border-fire-3/30 p-4 clip-cyber">
          <div className="font-mono text-[10px] tracking-[2px] uppercase text-fire-3/60 mb-1">Total Points</div>
          <div className="font-orbitron text-3xl font-bold text-fire-5">{fanPoints.total_points || 0}</div>
        </div>
      </motion.div>

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

      {activeTab === 'badges' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {achievements.map((ach) => (
            <ModernAchievementBadge
              key={ach.id}
              badgeId={ach.id}
              unlocked={ach.unlocked}
              progress={ach.progress}
              onClaim={(achievement) => setClaimModal(achievement)}
            />
          ))}
        </div>
      )}

      {claimModal && (
        <AchievementClaimModal
          achievement={claimModal}
          onClose={() => setClaimModal(null)}
        />
      )}

      <div className="border border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-transparent p-6 clip-cyber">
        <h3 className="font-orbitron font-bold text-purple-400 mb-2">Referral Program</h3>
        <p className="font-mono text-[10px] text-purple-500/60 mb-3">Share your link and earn rewards for each successful referral</p>
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
              toast.success('Referral link copied');
            }}
            className="btn-fire py-2 px-4 text-[10px]"
          >
            Copy Link
          </button>
        </div>
      </div>
    </div>
  );
}