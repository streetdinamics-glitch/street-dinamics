import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Zap, Trophy, Target, Flame, Star, Award, Clock, Gift } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from '../translations';
import ChallengeCard from './ChallengeCard';
import StreakTracker from './StreakTracker';
import AchievementBadges from './AchievementBadges';

export default function SpectatorGamificationHub({ eventId, lang = 'en' }) {
  const t = useTranslation(lang);
  const queryClient = useQueryClient();
  const [completedChallenges, setCompletedChallenges] = useState([]);

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  // Fetch daily challenges
  const { data: challenges = [] } = useQuery({
    queryKey: ['daily-challenges', eventId],
    queryFn: () => base44.entities.FanReward.filter({ 
      event_id: eventId,
      status: 'available'
    }),
    initialData: [],
  });

  // Fetch user achievements
  const { data: achievements = [] } = useQuery({
    queryKey: ['user-achievements', user?.email],
    queryFn: () => base44.entities.FanReward.filter({ 
      fan_email: user?.email,
      earned_at: { $exists: true }
    }),
    initialData: [],
  });

  // Complete challenge mutation
  const completeChallengesMutation = useMutation({
    mutationFn: async (challengeId) => {
      const challenge = challenges.find(c => c.id === challengeId);
      if (!challenge) throw new Error('Challenge not found');

      // Award points
      await base44.entities.FanPoints.update(user.email, {
        chat_points: challenge.points_required || 10,
        total_points: (user.total_points || 0) + (challenge.points_required || 10)
      });

      return { challengeId, points: challenge.points_required || 10 };
    },
    onSuccess: (data) => {
      setCompletedChallenges(prev => [...prev, data.challengeId]);
      toast.success(`+${data.points} Points! 🎉`);
      queryClient.invalidateQueries({ queryKey: ['daily-challenges'] });
      queryClient.invalidateQueries({ queryKey: ['user-achievements'] });
    },
  });

  // Quick action challenges (vote, chat, predict)
  const quickChallenges = [
    {
      id: 'vote-5',
      icon: <Target size={20} />,
      title: 'Cast 5 Votes',
      description: 'Vote on 5 live polls',
      points: 25,
      color: 'from-cyan/10 to-cyan/5',
      borderColor: 'border-cyan/30'
    },
    {
      id: 'chat-3',
      icon: <Zap size={20} />,
      title: 'Chat 3x',
      description: 'Post 3 messages in chat',
      points: 15,
      color: 'from-fire-3/10 to-fire-3/5',
      borderColor: 'border-fire-3/30'
    },
    {
      id: 'react-10',
      icon: <Flame size={20} />,
      title: 'React 10 Times',
      description: 'Use reaction buttons',
      points: 20,
      color: 'from-fire-5/10 to-fire-5/5',
      borderColor: 'border-fire-5/30'
    },
    {
      id: 'watch-30',
      icon: <Clock size={20} />,
      title: 'Watch 30 mins',
      description: 'Watch event for 30 min',
      points: 35,
      color: 'from-purple/10 to-purple/5',
      borderColor: 'border-purple/30'
    }
  ];

  const dailyChallenges = [
    {
      id: 'daily-voter',
      title: 'Daily Voter',
      description: 'Vote in every poll today',
      points: 50,
      icon: <Trophy size={20} />,
      rarity: 'common'
    },
    {
      id: 'social-butterfly',
      title: 'Social Butterfly',
      description: 'Share event 3 times',
      points: 40,
      icon: <Star size={20} />,
      rarity: 'uncommon'
    },
    {
      id: 'prediction-master',
      title: 'Prediction Master',
      description: '3 correct predictions',
      points: 60,
      icon: <Award size={20} />,
      rarity: 'rare'
    },
  ];

  return (
    <section className="section-container">
      <p className="font-mono text-[10px] tracking-[7px] uppercase text-fire-3 text-center mb-2">
        {t('gamification_subtitle') || 'Live & Earn'}
      </p>
      <h2 className="heading-fire text-[clamp(36px,7vw,88px)] text-center leading-none mb-4 font-black">
        SPECTATOR ARENA
      </h2>

      {user && (
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Streak Tracker */}
          <StreakTracker userEmail={user.email} />

          {/* Quick Action Challenges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="mb-6">
              <h3 className="heading-fire text-2xl font-bold mb-2">⚡ QUICK CHALLENGES</h3>
              <p className="font-mono text-xs text-fire-3/40">Complete in real-time</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickChallenges.map((challenge, i) => (
                <ChallengeCard
                  key={challenge.id}
                  challenge={challenge}
                  completed={completedChallenges.includes(challenge.id)}
                  onComplete={() => completeChallengesMutation.mutate(challenge.id)}
                  index={i}
                />
              ))}
            </div>
          </motion.div>

          {/* Daily Challenges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Gift size={20} className="text-fire-5" />
                <h3 className="heading-fire text-2xl font-bold">DAILY CHALLENGES</h3>
              </div>
              <p className="font-mono text-xs text-fire-3/40">Reset at midnight • Earn exclusive badges</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {dailyChallenges.map((challenge, i) => (
                <motion.div
                  key={challenge.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`bg-gradient-to-br ${challenge.rarity === 'rare' ? 'from-fire-5/10 to-fire-4/5' : challenge.rarity === 'uncommon' ? 'from-cyan/10 to-cyan/5' : 'from-fire-3/10 to-fire-3/5'} border ${challenge.rarity === 'rare' ? 'border-fire-5/30' : challenge.rarity === 'uncommon' ? 'border-cyan/30' : 'border-fire-3/30'} p-6 relative overflow-hidden`}
                >
                  <div className="absolute top-2 right-2">
                    <span className={`font-mono text-xs font-bold px-2 py-1 rounded ${challenge.rarity === 'rare' ? 'bg-fire-5/20 text-fire-5' : challenge.rarity === 'uncommon' ? 'bg-cyan/20 text-cyan' : 'bg-fire-3/20 text-fire-3'}`}>
                      {challenge.rarity.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded ${challenge.rarity === 'rare' ? 'bg-fire-5/20 text-fire-5' : challenge.rarity === 'uncommon' ? 'bg-cyan/20 text-cyan' : 'bg-fire-3/20 text-fire-3'}`}>
                      {challenge.icon}
                    </div>
                    <div>
                      <div className="font-orbitron font-bold text-fire-5">{challenge.title}</div>
                      <div className="font-rajdhani text-sm text-fire-3/60">{challenge.description}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-fire-3/20">
                    <div className="flex items-center gap-1">
                      <Zap size={14} className="text-fire-5" />
                      <span className="font-orbitron font-bold text-fire-5">{challenge.points}</span>
                    </div>
                    <button className="btn-cyan text-xs py-1 px-2">CLAIM</button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Achievements */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="mb-6">
              <h3 className="heading-fire text-2xl font-bold mb-2">🏆 ACHIEVEMENTS</h3>
              <p className="font-mono text-xs text-fire-3/40">{achievements.length} unlocked</p>
            </div>
            <AchievementBadges achievements={achievements} />
          </motion.div>
        </div>
      )}
    </section>
  );
}