import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Trophy, Star, Download, Heart, Eye } from 'lucide-react';
import BettingHistoryLog from '../components/betting/BettingHistoryLog';
import ModernAchievementBadge from '../components/gamification/ModernAchievementBadge';
import { useLang } from '../components/useLang';
import { useTranslation } from '../components/translations';

export default function EnhancedUserProfile() {
  const [activeTab, setActiveTab] = useState('overview');
  const [lang, setLang] = useLang();
  const t = useTranslation(lang);

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: userStats = {} } = useQuery({
    queryKey: ['user-stats', user?.email],
    queryFn: async () => {
      if (!user?.email) return {};
      const [ugc, rewards, fanPoints, tokens, bets] = await Promise.all([
        base44.entities.UGCSubmission.filter({ creator_email: user.email }).catch(() => []),
        base44.entities.FanReward.filter({ fan_email: user.email }).catch(() => []),
        base44.entities.FanPoints.filter({ fan_email: user.email }).catch(() => []),
        base44.entities.TokenOwnership.filter({ created_by: user.email }).catch(() => []),
        base44.entities.Bet.filter({ created_by: user.email }).catch(() => []),
      ]);

      const totalEngagement = ugc.reduce((sum, u) => sum + (u.engagement_count || 0), 0);
      const totalPoints = fanPoints.reduce((sum, p) => sum + (p.total_points || 0), 0);

      return {
        ugcCount: ugc.length,
        totalEngagement,
        rewardsUnlocked: rewards.length,
        totalPoints,
        tokenCount: tokens.length,
        betCount: bets.length,
      };
    },
    enabled: !!user?.email,
    staleTime: 60000,
  });

  const { data: badges = [] } = useQuery({
    queryKey: ['user-badges', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const allBadges = await base44.entities.AthleteBadge?.filter?.({ athlete_email: user.email }).catch(() => []);
      return allBadges || [];
    },
    enabled: !!user?.email,
  });

  const { data: ugcHistory = [] } = useQuery({
    queryKey: ['user-ugc-history', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const submissions = await base44.entities.UGCSubmission.filter({ creator_email: user.email }).catch(() => []);
      return submissions.sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at));
    },
    enabled: !!user?.email,
    staleTime: 60000,
  });

  const { data: savedEvents = [] } = useQuery({
    queryKey: ['user-saved-events', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const watchlist = await base44.entities.UserWatchlist?.filter?.({ created_by: user.email }).catch(() => []);
      return watchlist || [];
    },
    enabled: !!user?.email,
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-cyber-void flex items-center justify-center p-4">
        <div className="text-center">
          <p className="font-mono text-fire-3/40 mb-4">{t('enhanced_loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cyber-void p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[rgba(10,4,18,0.99)] to-[rgba(4,2,8,1)] border border-fire-3/20 p-8 clip-cyber relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 fire-line" />
          
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-fire-3 to-fire-5 p-1">
              <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-4xl">
                {user.full_name?.[0] || '?'}
              </div>
            </div>
            <div className="flex-1">
              <h1 className="text-fire-gradient font-orbitron font-black text-4xl mb-2">
                {user.full_name}
              </h1>
              <p className="font-mono text-fire-3/60 mb-4">{user.email}</p>
              <div className="flex flex-wrap gap-4">
                {[
                  { label: t('enhanced_ugc_label'), value: userStats.ugcCount, icon: Download },
                  { label: t('enhanced_engagement_label'), value: userStats.totalEngagement, icon: Heart },
                  { label: t('enhanced_points_label'), value: userStats.totalPoints, icon: Star },
                  { label: t('enhanced_tokens_label'), value: userStats.tokenCount, icon: Trophy },
                ].map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.label} className="flex items-center gap-2">
                      <Icon size={16} className="text-fire-3" />
                      <div>
                        <p className="font-mono text-xs text-fire-3/60">{stat.label}</p>
                        <p className="font-orbitron font-bold text-fire-5">{stat.value}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-fire-3/10">
          {[
            { id: 'overview', label: t('enhanced_tab_overview') },
            { id: 'ugc', label: t('enhanced_tab_ugc') },
            { id: 'badges', label: t('enhanced_tab_badges') },
            { id: 'events', label: t('enhanced_tab_events') },
            { id: 'betting', label: t('enhanced_tab_betting') },
          ].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 font-orbitron text-[11px] tracking-[2px] uppercase border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-fire-3 text-fire-4'
                  : 'border-transparent text-fire-3/40 hover:text-fire-3'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {activeTab === 'overview' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: t('enhanced_creator_level'), value: 'Intermediate', color: 'from-cyan/20 to-cyan/5' },
                  { label: t('enhanced_engagement_score'), value: userStats.totalEngagement, color: 'from-fire-3/20 to-fire-3/5' },
                  { label: t('enhanced_rewards_unlocked'), value: userStats.rewardsUnlocked, color: 'from-purple-500/20 to-purple-500/5' },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`bg-gradient-to-br ${item.color} border border-fire-3/20 p-6 clip-cyber text-center`}
                  >
                    <p className="font-mono text-xs text-fire-3/60 mb-2">{item.label}</p>
                    <p className="font-orbitron text-3xl font-bold text-fire-5">{item.value}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'ugc' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="font-orbitron font-bold text-2xl text-fire-4 mb-6">{t('enhanced_ugc_title')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {ugcHistory.length === 0 ? (
                  <p className="text-fire-3/40">{t('enhanced_no_ugc')}</p>
                ) : (
                  ugcHistory.map((ugc, i) => (
                    <motion.div
                      key={ugc.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-gradient-to-br from-fire-3/10 to-fire-3/5 border border-fire-3/20 p-4 clip-cyber"
                    >
                      {ugc.media_url && (
                        <img src={ugc.media_url} alt={ugc.title} className="w-full h-32 object-cover mb-3 border border-fire-3/20" />
                      )}
                      <h3 className="font-orbitron font-bold text-fire-4 text-sm mb-2">{ugc.title}</h3>
                      <div className="flex items-center gap-2 text-xs text-fire-3/70 mb-2">
                        <Eye size={14} />
                        <span>{ugc.engagement_count || 0} engagement</span>
                      </div>
                      <p className="font-mono text-[9px] text-fire-3/60">
                        {ugc.approved ? '✓ Approved' : 'Pending'}
                      </p>
                      <p className="font-mono text-[9px] text-fire-3/40 mt-2">
                        {new Date(ugc.submitted_at).toLocaleDateString()}
                      </p>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'badges' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="font-orbitron font-bold text-2xl text-fire-4 mb-6">{t('enhanced_badges_title')}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                {['founder', 'ambassador', 'curator', 'trailblazer', 'catalyst', 'luminary'].map((badge, i) => (
                  <ModernAchievementBadge
                    key={badge}
                    badgeId={badge}
                    unlocked={Math.random() > 0.4}
                    progress={Math.random()}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'events' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="font-orbitron font-bold text-2xl text-fire-4 mb-6">{t('enhanced_events_title')}</h2>
              {savedEvents.length === 0 ? (
                <p className="text-fire-3/40">{t('enhanced_no_events')}</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {savedEvents.map((event, i) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="border border-fire-3/20 p-4 hover:bg-fire-3/5 transition-colors"
                    >
                      <p className="font-orbitron font-bold text-fire-4">{event.event_name}</p>
                      <p className="font-mono text-xs text-fire-3/60 mt-1">Added: {new Date(event.created_at).toLocaleDateString()}</p>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'betting' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <BettingHistoryLog />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}