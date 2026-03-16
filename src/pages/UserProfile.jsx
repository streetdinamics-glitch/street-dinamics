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


export default function UserProfile() {
  const [lang, setLang] = useLang();



  return (
    <div className="relative min-h-screen bg-cyber-void text-[var(--text-main)]">
      <CyberOverlays />
      <Navbar lang={lang} onLangSwitch={setLang} onScrollTo={() => {}} />

      <div className="pt-[80px] p-6">
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
      <Footer lang={lang} />
    </div>
  );
}