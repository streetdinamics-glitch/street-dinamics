import React, { useState, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useTranslation } from '../components/translations';
import CyberOverlays from '../components/cyber/CyberOverlays';
import ParticleField from '../components/cyber/ParticleField';
import Navbar from '../components/cyber/Navbar';
import HeroSection from '../components/cyber/HeroSection';
import FireRule from '../components/cyber/FireRule';
import FlowSteps from '../components/cyber/FlowSteps';
import EventCard from '../components/cyber/EventCard';
import RegistrationModal from '../components/cyber/RegistrationModal';
import SuccessModal from '../components/cyber/SuccessModal';
import SponsorSection from '../components/cyber/SponsorSection';
import BetSection from '../components/cyber/BetSection';
import TokenMarketplace from '../components/marketplace/TokenMarketplace';
import MetricsVisualizationDashboard from '../components/dashboard/MetricsVisualizationDashboard';
import TournamentSection from '../components/cyber/TournamentSection';
import AthletePerformanceDashboard from '../components/analytics/AthletePerformanceDashboard';
import LiveVotingPanel from '../components/voting/LiveVotingPanel';
import EventChatRoom from '../components/chat/EventChatRoom';
import FanVotingModule from '../components/fan/FanVotingModule';
import FanLeaderboard from '../components/fan/FanLeaderboard';
import NFTMarketplace from '../components/nft/NFTMarketplace';
import SecondaryMarket from '../components/marketplace/SecondaryMarket';
import GlobalLeaderboard from '../components/leaderboard/GlobalLeaderboard';
import TokenStore from '../components/store/TokenStore';
import SocialLinksModal from '../components/cyber/SocialLinksModal';
import OnboardingFlow from '../components/onboarding/OnboardingFlow';
import UserProfile from '../components/profile/UserProfile';
import Footer from '../components/cyber/Footer';
import SpectatorTypeModal from '../components/cyber/SpectatorTypeModal';
import SpectatorGamificationHub from '../components/gamification/SpectatorGamificationHub';
import WatchlistPanel from '../components/watchlist/WatchlistPanel';
import { useNotifications } from '../components/notifications/NotificationHook';
import FanStatusDashboard from '../components/progression/FanStatusDashboard';
import { useLang } from '../components/useLang';
import LiveEventSidebar from '../components/chat/LiveEventSidebar';
import { useSubscriptions } from '../components/subscriptions/useSubscriptions';
import MySubscriptionsPanel from '../components/subscriptions/MySubscriptionsPanel';
import EventCountdown from '../components/subscriptions/EventCountdown';


export default function Home() {
  useNotifications();
  
  const [lang, setLang] = useLang();
  const t = useTranslation(lang);
  const queryClient = useQueryClient();
  const [regModal, setRegModal] = useState(null);
  const [successModal, setSuccessModal] = useState(null);
  const [socialOpen, setSocialOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [spectatorTypeModal, setSpectatorTypeModal] = useState(null);
  const [watchlistOpen, setWatchlistOpen] = useState(false);
  const [subscriptionsOpen, setSubscriptionsOpen] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: events = [], isLoading: eventsLoading } = useQuery({
    queryKey: ['events'],
    queryFn: () => base44.entities.Event.list('-created_date', 50),
    initialData: [],
  });

  const { data: registrations = [] } = useQuery({
    queryKey: ['registrations'],
    queryFn: () => base44.entities.Registration.list('-created_date', 100),
    initialData: [],
  });

  // Check if user owns any tokens
  const subs = useSubscriptions(user, events);

  const { data: tokens = [] } = useQuery({
    queryKey: ['my-tokens'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.TokenOwnership.filter({ created_by: user.email });
    },
    initialData: [],
  });
  const hasToken = tokens.length > 0;

  const scrollTo = useCallback((id) => {
    if (id === 'social') {
      setSocialOpen(true);
      return;
    }
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const handleRegSuccess = (data) => {
    const event = events.find(e => e.id === data.event_id);
    setRegModal(null);
    setSuccessModal({ registration: data, event });
  };

  const handleRegisterClick = (event, type) => {
    // Direct registration without authentication
    if (type === 'spectator') {
      setSpectatorTypeModal(event);
    } else {
      setRegModal({ event, type });
    }
  };

  const handleSpectatorTypeSelect = (attendanceMode) => {
    if (!spectatorTypeModal) return;
    setSpectatorTypeModal(null);
    setRegModal({ 
      event: spectatorTypeModal, 
      type: 'spectator',
      attendanceMode 
    });
  };

  // Auto-open registration after onboarding completes
  const handleOnboardingComplete = () => {
    queryClient.invalidateQueries({ queryKey: ['current-user'] });
    setOnboardingOpen(false);
    
    // Check for pending registration
    const pending = sessionStorage.getItem('pendingRegistration');
    if (pending) {
      try {
        const { event, type } = JSON.parse(pending);
        sessionStorage.removeItem('pendingRegistration');
        if (type === 'spectator') {
          setTimeout(() => setSpectatorTypeModal(event), 300);
        } else {
          setTimeout(() => setRegModal({ event, type }), 300);
        }
      } catch (err) {
        console.error('Failed to restore pending registration');
      }
    }
  };

  return (
    <div className="relative min-h-screen bg-cyber-void text-[var(--text-main)]">
      <CyberOverlays />
      <ParticleField />
      <Navbar onScrollTo={scrollTo} lang={lang} onLangSwitch={setLang} onProfileClick={() => setProfileOpen(true)} onWatchlistClick={() => setWatchlistOpen(true)} />

      <HeroSection onScrollTo={scrollTo} lang={lang} />
      <FireRule />

      {/* Events Section */}
      <section id="events" className="section-container">
        <p className="font-mono text-[10px] tracking-[7px] uppercase text-fire-3 text-center mb-2 opacity-0 animate-[fadeUp_0.7s_ease_forwards]">
          {t('events_subtitle')}
        </p>
        <h2 className="heading-fire text-[clamp(36px,7vw,88px)] text-center leading-none mb-6 font-black opacity-0 animate-[fadeUp_0.8s_ease_0.1s_forwards]">
          {t('events_title')}
        </h2>

        {/* My Subscriptions toggle */}
        {user && (
          <div className="flex justify-center mb-10">
            <button
              onClick={() => setSubscriptionsOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 hover:border-purple-400/60 transition-all font-orbitron text-[10px] tracking-[2px] uppercase text-purple-300"
              style={{ clipPath: 'polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)' }}
            >
              <span className="text-sm">🔔</span>
              My Subscriptions
              {subs.subscriptions.length > 0 && (
                <span className="bg-purple-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                  {subs.subscriptions.length}
                </span>
              )}
            </button>
          </div>
        )}

        <FlowSteps lang={lang} />

        {eventsLoading ? (
          <div className="text-center font-mono text-fire-3/30 text-sm tracking-[2px] py-20">{t('events_loading')}</div>
        ) : events.length === 0 ? (
          <div className="text-center py-20">
            <span className="text-4xl block mb-3">🔥</span>
            <p className="font-mono text-sm tracking-[2px] text-fire-3/30">{t('events_empty')}</p>
          </div>
        ) : (
          <div className="space-y-12">
            {events.map((ev, i) => (
              <div key={ev.id} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  <div className="relative">
                    <EventCard
                      event={ev}
                      index={i}
                      lang={lang}
                      onRegisterAthlete={(e) => handleRegisterClick(e, 'athlete')}
                      onRegisterSpectator={(e) => handleRegisterClick(e, 'spectator')}
                    />
                    {ev.status === 'upcoming' && ev.date && (
                      <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/70 border border-fire-3/20">
                        <EventCountdown date={ev.date} compact />
                      </div>
                    )}
                  </div>
                </div>
                <TournamentSection event={ev} />
                <FanVotingModule event={ev} />
                <LiveVotingPanel event={ev} lang={lang} />
                <EventChatRoom event={ev} lang={lang} />
                {ev.status === 'live' && (
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8 mb-12"
                  >
                    <h3 className="heading-fire text-3xl mb-6 font-black">FAN LEADERBOARD</h3>
                    <FanLeaderboard event={ev} />
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <FireRule />
      <BetSection
        hasToken={hasToken}
        onScrollToTokens={() => scrollTo('marketplace')}
        onScrollToSocial={() => scrollTo('social')}
        lang={lang}
      />
      <FireRule />
      {user && <MetricsVisualizationDashboard lang={lang} />}
      <FireRule />
      <AthletePerformanceDashboard lang={lang} />
      <FireRule />
      <FanStatusDashboard lang={lang} />
      <FireRule />
      <TokenMarketplace lang={lang} />
      <FireRule />
      <NFTMarketplace />
      <FireRule />
      <SecondaryMarket />
      <FireRule />
      <TokenStore />
      <FireRule />
      <GlobalLeaderboard lang={lang} />
      <FireRule />
      {events.length > 0 && (
        <>
          <SpectatorGamificationHub eventId={events[0]?.id} lang={lang} />
          <FireRule />
        </>
      )}
      <SponsorSection lang={lang} />
      <Footer lang={lang} />

      {/* Modals */}
      {spectatorTypeModal && (
        <SpectatorTypeModal
          event={spectatorTypeModal}
          onClose={() => setSpectatorTypeModal(null)}
          onSelectType={handleSpectatorTypeSelect}
          lang={lang}
        />
      )}
      {regModal && (
        <RegistrationModal
          event={regModal.event}
          type={regModal.type}
          attendanceMode={regModal.attendanceMode}
          lang={lang}
          onClose={() => setRegModal(null)}
          onSuccess={handleRegSuccess}
        />
      )}
      {successModal && (
        <SuccessModal
          registration={successModal.registration}
          event={successModal.event}
          lang={lang}
          onClose={() => setSuccessModal(null)}
        />
      )}
      {socialOpen && (
        <SocialLinksModal lang={lang} onClose={() => setSocialOpen(false)} />
      )}
      {onboardingOpen && (
        <OnboardingFlow
          user={user}
          lang={lang}
          onComplete={handleOnboardingComplete}
        />
      )}
      {profileOpen && (
        <UserProfile lang={lang} onClose={() => setProfileOpen(false)} />
      )}
      {watchlistOpen && (
        <WatchlistPanel lang={lang} onClose={() => setWatchlistOpen(false)} />
      )}

      {/* Live event sidebar — shows for the first live event found */}
      {events.filter(e => e.status === 'live').map(liveEvent => (
        <LiveEventSidebar key={liveEvent.id} event={liveEvent} />
      )).slice(0, 1)}
    </div>
  );
}