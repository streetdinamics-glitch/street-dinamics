import React from 'react';
import UserProfileDashboard from '../components/profile/UserProfileDashboard';
import MetricsVisualizationDashboard from '../components/dashboard/MetricsVisualizationDashboard';
import FanStatusDashboard from '../components/progression/FanStatusDashboard';
import TokenMarketplace from '../components/marketplace/TokenMarketplace';
import NFTMarketplace from '../components/nft/NFTMarketplace';
import SecondaryMarket from '../components/marketplace/SecondaryMarket';
import TokenStore from '../components/store/TokenStore';
import GlobalLeaderboard from '../components/leaderboard/GlobalLeaderboard';
import FireRule from '../components/cyber/FireRule';
import CyberOverlays from '../components/cyber/CyberOverlays';
import Navbar from '../components/cyber/Navbar';
import Footer from '../components/cyber/Footer';
import { useLang } from '../components/useLang';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

export default function UserProfile() {
  const [lang, setLang] = useLang();

  const { data: events = [] } = useQuery({
    queryKey: ['events'],
    queryFn: () => base44.entities.Event.list('-created_date', 50),
    initialData: [],
  });

  return (
    <div className="relative min-h-screen bg-cyber-void text-[var(--text-main)]">
      <CyberOverlays />
      <Navbar lang={lang} onLangSwitch={setLang} />

      <div className="min-h-screen p-6">
        <div className="max-w-6xl mx-auto">
          <div className="absolute top-0 left-0 right-0 fire-line" />
          <UserProfileDashboard lang={lang} />
        </div>
      </div>

      <FireRule />
      <MetricsVisualizationDashboard lang={lang} />
      <FireRule />
      <FanStatusDashboard lang={lang} />
      <FireRule />
      <AthletePerformanceDashboard lang={lang} />
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
      {events.length > 0 && (
        <>
          <FireRule />
          <SpectatorGamificationHub eventId={events[0]?.id} lang={lang} />
        </>
      )}
      <FireRule />
      <Footer lang={lang} />
    </div>
  );
}