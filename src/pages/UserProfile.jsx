import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Trophy, Star, Download, Heart, Eye } from 'lucide-react';
import UserProfileDashboard from '../components/profile/UserProfileDashboard';
import MetricsVisualizationDashboard from '../components/dashboard/MetricsVisualizationDashboard';
import FanStatusDashboard from '../components/progression/FanStatusDashboard';
import TokenMarketplace from '../components/marketplace/TokenMarketplace';
import NFTMarketplace from '../components/nft/NFTMarketplace';
import SecondaryMarket from '../components/marketplace/SecondaryMarket';
import TokenStore from '../components/store/TokenStore';
import GlobalLeaderboard from '../components/leaderboard/GlobalLeaderboard';
import BetSection from '../components/cyber/BetSection';
import BettingHistoryLog from '../components/betting/BettingHistoryLog';

import FireRule from '../components/cyber/FireRule';
import CyberOverlays from '../components/cyber/CyberOverlays';
import Navbar from '../components/cyber/Navbar';
import Footer from '../components/cyber/Footer';
import { useLang } from '../components/useLang';
import { useTranslation } from '../components/translations';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'badges', label: 'Badge' },
  { id: 'betting', label: 'Scommesse' },
  { id: 'ugc', label: 'Contenuti' },
];

export default function UserProfile() {
  const [lang, setLang] = useLang();
  const t = useTranslation(lang);
  const [activeTab, setActiveTab] = useState('overview');

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: tokens = [] } = useQuery({
    queryKey: ['my-tokens'],
    queryFn: async () => {
      const u = await base44.auth.me();
      return base44.entities.TokenOwnership.filter({ created_by: u.email });
    },
    initialData: [],
  });

  const { data: userStats = {} } = useQuery({
    queryKey: ['user-stats', user?.email],
    queryFn: async () => {
      if (!user?.email) return {};
      const [ugc, rewards, fanPoints, bets] = await Promise.all([
        base44.entities.UGCSubmission.filter({ creator_email: user.email }).catch(() => []),
        base44.entities.FanReward.filter({ fan_email: user.email }).catch(() => []),
        base44.entities.FanPoints.filter({ fan_email: user.email }).catch(() => []),
        base44.entities.Bet.filter({ user_email: user.email }).catch(() => []),
      ]);
      return {
        ugcCount: ugc.length,
        totalEngagement: ugc.reduce((s, u) => s + (u.engagement_count || 0), 0),
        rewardsUnlocked: rewards.length,
        totalPoints: fanPoints.reduce((s, p) => s + (p.total_points || 0), 0),
        tokenCount: tokens.length,
        betCount: bets.length,
        ugcItems: ugc.sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at)),
      };
    },
    enabled: !!user?.email,
    staleTime: 60000,
  });

  const { data: badges = [] } = useQuery({
    queryKey: ['user-badges', user?.email],
    queryFn: () => base44.entities.AthleteBadge.filter({ athlete_email: user.email }).catch(() => []),
    enabled: !!user?.email,
  });

  const hasToken = tokens.length > 0;

  return (
    <div className="relative min-h-screen bg-cyber-void text-[var(--text-main)]">
      <CyberOverlays />
      <Navbar lang={lang} onLangSwitch={setLang} onScrollTo={() => {}} />

      {/* Profile header with quick stats */}
      {user && (
        <div className="pt-[80px] px-6">
          <div className="max-w-6xl mx-auto pt-8">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-[rgba(10,4,18,0.99)] to-[rgba(4,2,8,1)] border border-fire-3/20 p-6 clip-cyber relative overflow-hidden mb-6"
            >
              <div className="absolute top-0 left-0 right-0 fire-line" />
              <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-fire-3 to-fire-5 p-1 flex-shrink-0">
                  <div className="w-full h-full rounded-full bg-black flex items-center justify-center font-orbitron text-3xl font-black text-fire-5">
                    {user.full_name?.[0] || '?'}
                  </div>
                </div>
                <div className="flex-1">
                  <h1 className="text-fire-gradient font-orbitron font-black text-3xl mb-1">{user.full_name}</h1>
                  <p className="font-mono text-fire-3/40 text-sm mb-3">{user.email}</p>
                  <div className="flex flex-wrap gap-4">
                    {[
                      { label: 'Contenuti', value: userStats.ugcCount || 0, Icon: Download },
                      { label: 'Engagement', value: userStats.totalEngagement || 0, Icon: Heart },
                      { label: 'Punti', value: userStats.totalPoints || 0, Icon: Star },
                      { label: 'Token', value: userStats.tokenCount || 0, Icon: Trophy },
                    ].map(({ label, value, Icon }) => (
                      <div key={label} className="flex items-center gap-2">
                        <Icon size={15} className="text-fire-3" />
                        <div>
                          <p className="font-mono text-[9px] text-fire-3/50 uppercase">{label}</p>
                          <p className="font-orbitron font-bold text-fire-5 text-sm">{value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex flex-wrap gap-1 mt-5 border-t border-fire-3/10 pt-4">
                {TABS.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 font-orbitron text-[10px] tracking-[2px] uppercase border transition-all ${
                      activeTab === tab.id
                        ? 'border-fire-3 text-fire-4 bg-fire-3/10'
                        : 'border-transparent text-fire-3/40 hover:text-fire-3'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Tab content */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {[
                  { label: 'Creator Level', value: 'Intermediate', color: 'from-cyan/20 to-cyan/5' },
                  { label: 'Engagement Score', value: userStats.totalEngagement || 0, color: 'from-fire-3/20 to-fire-3/5' },
                  { label: 'Ricompense sbloccate', value: userStats.rewardsUnlocked || 0, color: 'from-purple-500/20 to-purple-500/5' },
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
            )}

            {activeTab === 'badges' && (
              <div className="mb-6">
                {badges.length === 0 ? (
                  <div className="border border-white/5 p-8 text-center">
                    <p className="font-rajdhani text-white/30">Nessun badge ancora. Partecipa agli eventi per guadagnarli!</p>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {badges.map(b => (
                      <div key={b.id} className="px-3 py-2 border border-fire-3/30 bg-fire-3/5 flex items-center gap-2" title={b.badge_description}>
                        <span className="text-lg">{b.badge_icon || '🏅'}</span>
                        <div>
                          <div className="font-orbitron text-[11px] text-fire-4">{b.badge_name}</div>
                          <div className={`font-mono text-[8px] ${
                            b.rarity === 'legendary' ? 'text-yellow-400' :
                            b.rarity === 'epic' ? 'text-purple-400' :
                            b.rarity === 'rare' ? 'text-blue-400' : 'text-gray-400'
                          }`}>{b.rarity?.toUpperCase()} · {b.earned_date}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'betting' && (
              <div className="mb-6">
                <BettingHistoryLog />
              </div>
            )}

            {activeTab === 'ugc' && (
              <div className="mb-6">
                {(!userStats.ugcItems || userStats.ugcItems.length === 0) ? (
                  <div className="border border-white/5 p-8 text-center">
                    <p className="font-rajdhani text-white/30">Nessun contenuto ancora.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {userStats.ugcItems.map((ugc, i) => (
                      <div key={ugc.id} className="bg-fire-3/5 border border-fire-3/20 p-4 clip-cyber">
                        {ugc.media_url && <img src={ugc.media_url} alt={ugc.title} className="w-full h-32 object-cover mb-3 border border-fire-3/20" />}
                        <h3 className="font-orbitron font-bold text-fire-4 text-sm mb-2">{ugc.title}</h3>
                        <div className="flex items-center gap-2 text-xs text-fire-3/70">
                          <Eye size={14} />
                          <span>{ugc.engagement_count || 0} engagement</span>
                        </div>
                        <p className="font-mono text-[9px] text-fire-3/40 mt-2">{new Date(ugc.submitted_at).toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="px-6">
        <div className="max-w-6xl mx-auto">
          <UserProfileDashboard lang={lang} />
        </div>
      </div>

      <FireRule />
      <MetricsVisualizationDashboard lang={lang} />
      <FireRule />
      <FanStatusDashboard lang={lang} />
      <FireRule />
      <TokenMarketplace lang={lang} />
      <FireRule />
      <NFTMarketplace lang={lang} />
      <FireRule />
      <SecondaryMarket lang={lang} />
      <FireRule />
      <TokenStore lang={lang} />
      <FireRule />
      <GlobalLeaderboard lang={lang} />
      <FireRule />
      <BetSection hasToken={hasToken} onScrollToTokens={() => {}} onScrollToSocial={() => {}} lang={lang} />
      <FireRule />
      <Footer lang={lang} />
    </div>
  );
}