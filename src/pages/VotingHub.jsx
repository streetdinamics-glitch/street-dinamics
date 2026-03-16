import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import VotingCampaignManager from '../components/voting/VotingCampaignManager';
import TokenBasedVotingInterface from '../components/voting/TokenBasedVotingInterface';
import VotingLeaderboard from '../components/voting/VotingLeaderboard';
import { useLang } from '../components/useLang';
import { useTranslation } from '../components/translations';

export default function VotingHub() {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [activeTab, setActiveTab] = useState('vote');
  const [lang, setLang] = useLang();
  const t = useTranslation(lang);

  // Fetch current user
  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  // Fetch live events
  const { data: events = [] } = useQuery({
    queryKey: ['live-events'],
    queryFn: () => base44.entities.Event.filter({ status: 'live' }),
  });

  // Fetch campaigns for selected event
  const { data: campaigns = [] } = useQuery({
    queryKey: ['voting-campaigns', selectedEvent?.id],
    queryFn: () => base44.entities.EventVote.filter({ event_id: selectedEvent?.id, status: 'active' }),
    enabled: !!selectedEvent?.id,
  });

  const isAthlete = user?.role === 'athlete' || user?.athlete_profile?.verification_status === 'verified';

  if (!selectedEvent) {
    return (
      <div className="min-h-screen bg-cyber-void p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="font-orbitron font-black text-3xl text-fire-5 mb-8">{t('voting_hub_title')}</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="font-mono text-fire-3/40">{t('voting_no_live')}</p>
              </div>
            ) : (
              events.map((event) => (
                <motion.button
                  key={event.id}
                  onClick={() => setSelectedEvent(event)}
                  whileHover={{ scale: 1.05 }}
                  className="text-left bg-gradient-to-br from-fire-3/10 to-fire-3/5 border border-fire-3/20 hover:border-fire-3 p-6 transition-all clip-cyber"
                >
                  <h3 className="font-orbitron font-bold text-lg text-fire-5 mb-2">{event.title}</h3>
                  <p className="font-mono text-sm text-fire-3/60 mb-3">{event.sport}</p>
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-1 text-[8px] font-mono tracking-[1px] uppercase border border-green-500/40 bg-green-500/10 text-green-400">
                      🔴 LIVE
                    </span>
                    <span className="text-xs font-rajdhani text-fire-4">{t('voting_view')}</span>
                  </div>
                </motion.button>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cyber-void p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => setSelectedEvent(null)}
            className="font-mono text-xs text-fire-3/60 hover:text-fire-3 mb-4"
          >
            {t('voting_back')}
          </button>
          <h1 className="font-orbitron font-black text-3xl text-fire-5 mb-2">{selectedEvent.title}</h1>
          <p className="font-mono text-sm text-fire-3/60">{selectedEvent.sport} • {selectedEvent.location}</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-fire-3/10">
          <button
            onClick={() => setActiveTab('vote')}
            className={`px-4 py-3 font-orbitron text-sm font-bold tracking-[1px] uppercase border-b-2 transition-all ${
              activeTab === 'vote'
                ? 'border-fire-3 text-fire-4'
                : 'border-transparent text-fire-3/60 hover:text-fire-3'
            }`}
          >
            {t('voting_campaigns')}
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`px-4 py-3 font-orbitron text-sm font-bold tracking-[1px] uppercase border-b-2 transition-all ${
              activeTab === 'leaderboard'
                ? 'border-fire-3 text-fire-4'
                : 'border-transparent text-fire-3/60 hover:text-fire-3'
            }`}
          >
            {t('voting_leaderboard')}
          </button>
          {isAthlete && (
            <button
              onClick={() => setActiveTab('manage')}
              className={`px-4 py-3 font-orbitron text-sm font-bold tracking-[1px] uppercase border-b-2 transition-all ${
                activeTab === 'manage'
                  ? 'border-fire-3 text-fire-4'
                  : 'border-transparent text-fire-3/60 hover:text-fire-3'
              }`}
            >
              {t('voting_manage')}
            </button>
          )}
        </div>

        {/* Content */}
        {activeTab === 'vote' && (
          <div className="space-y-6">
            {campaigns.length === 0 ? (
              <div className="text-center py-12 bg-fire-3/5 border border-fire-3/10">
                <p className="font-mono text-fire-3/40">{t('voting_no_campaigns')}</p>
              </div>
            ) : (
              campaigns.map((campaign) => (
                <TokenBasedVotingInterface
                  key={campaign.id}
                  campaign={campaign}
                  eventId={selectedEvent.id}
                />
              ))
            )}
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <VotingLeaderboard eventId={selectedEvent.id} />
        )}

        {activeTab === 'manage' && isAthlete && (
          <VotingCampaignManager eventId={selectedEvent.id} />
        )}
      </div>
    </div>
  );
}