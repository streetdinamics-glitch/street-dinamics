import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { BarChart3, Vote, DollarSign } from 'lucide-react';
import CyberOverlays from '../components/cyber/CyberOverlays';
import ParticleField from '../components/cyber/ParticleField';
import Navbar from '../components/cyber/Navbar';
import FireRule from '../components/cyber/FireRule';
import EngagementAnalyticsDashboard from '../components/analytics/EngagementAnalyticsDashboard';
import VotingAnalyticsDashboard from '../components/analytics/VotingAnalyticsDashboard';
import BettingAnalyticsDashboard from '../components/analytics/BettingAnalyticsDashboard';
import { useLang } from '../components/useLang';

export default function Analytics() {
  const [activeTab, setActiveTab] = useState('engagement');
  const [lang, setLang] = useLang();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const isAdmin = user?.role === 'admin';

  return (
    <div className="relative min-h-screen bg-cyber-void text-[var(--text-main)]">
      <CyberOverlays />
      <ParticleField />
      <Navbar onScrollTo={() => {}} lang={lang} onLangSwitch={setLang} onProfileClick={() => {}} onWatchlistClick={() => {}} />

      <div className="section-container pt-32">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <p className="font-mono text-[10px] tracking-[7px] uppercase text-fire-3 mb-2">
            {isAdmin ? 'ADMIN ANALYTICS' : 'PERSONAL ANALYTICS'}
          </p>
          <h1 className="heading-fire text-[clamp(36px,7vw,88px)] leading-none mb-4 font-black">
            PERFORMANCE METRICS
          </h1>
          <p className="font-rajdhani text-lg text-fire-4/70 max-w-2xl mx-auto">
            {isAdmin 
              ? 'Monitor platform-wide engagement, voting trends, and betting performance' 
              : 'Track your engagement, voting accuracy, and betting performance over time'}
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {[
            { id: 'engagement', label: 'Engagement', icon: BarChart3 },
            { id: 'voting', label: 'Voting', icon: Vote },
            { id: 'betting', label: 'Betting', icon: DollarSign },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 font-orbitron text-[11px] tracking-[2px] uppercase border-2 transition-all clip-btn flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-fire-3 bg-fire-3/10 text-fire-4'
                    : 'border-fire-3/20 text-fire-3/60 hover:border-fire-3/40'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        <FireRule />

        {/* Dashboard Content */}
        <div className="mt-12">
          {activeTab === 'engagement' && <EngagementAnalyticsDashboard isAdmin={isAdmin} />}
          {activeTab === 'voting' && <VotingAnalyticsDashboard isAdmin={isAdmin} />}
          {activeTab === 'betting' && <BettingAnalyticsDashboard isAdmin={isAdmin} />}
        </div>
      </div>
    </div>
  );
}