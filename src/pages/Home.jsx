import React, { useState, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from '../components/translations';
import CyberOverlays from '../components/cyber/CyberOverlays';
import Navbar from '../components/cyber/Navbar';
import HeroSection from '../components/cyber/HeroSection';
import FireRule from '../components/cyber/FireRule';
import FlowSteps from '../components/cyber/FlowSteps';
import EventCard from '../components/cyber/EventCard';
import RegistrationModal from '../components/cyber/RegistrationModal';
import SuccessModal from '../components/cyber/SuccessModal';
import SponsorSection from '../components/cyber/SponsorSection';
import BetSection from '../components/cyber/BetSection';
import TokenSection from '../components/cyber/TokenSection';
import SocialLinksModal from '../components/cyber/SocialLinksModal';
import Footer from '../components/cyber/Footer';

export default function Home() {
  const [lang, setLang] = useState('en');
  const t = useTranslation(lang);
  const queryClient = useQueryClient();
  const [regModal, setRegModal] = useState(null);
  const [successModal, setSuccessModal] = useState(null);
  const [socialOpen, setSocialOpen] = useState(false);

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
    setRegModal(null);
    setSuccessModal(data);
  };

  return (
    <div className="relative min-h-screen bg-cyber-void text-[var(--text-main)]">
      <CyberOverlays />
      <Navbar onScrollTo={scrollTo} lang={lang} onLangSwitch={setLang} />

      <HeroSection onScrollTo={scrollTo} lang={lang} />
      <FireRule />

      {/* Events Section */}
      <section id="events" className="section-container">
        <p className="font-mono text-[10px] tracking-[7px] uppercase text-fire-3 text-center mb-2 opacity-0 animate-[fadeUp_0.7s_ease_forwards]">
          {t('events_subtitle')}
        </p>
        <h2 className="heading-fire text-[clamp(36px,7vw,88px)] text-center leading-none mb-14 font-black opacity-0 animate-[fadeUp_0.8s_ease_0.1s_forwards]">
          {t('events_title')}
        </h2>

        <FlowSteps lang={lang} />

        {eventsLoading ? (
          <div className="text-center font-mono text-fire-3/30 text-sm tracking-[2px] py-20">{t('events_loading')}</div>
        ) : events.length === 0 ? (
          <div className="text-center py-20">
            <span className="text-4xl block mb-3">🔥</span>
            <p className="font-mono text-sm tracking-[2px] text-fire-3/30">{t('events_empty')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {events.map((ev, i) => (
              <EventCard
                key={ev.id}
                event={ev}
                index={i}
                lang={lang}
                onRegisterAthlete={(e) => setRegModal({ event: e, type: 'athlete' })}
                onRegisterSpectator={(e) => setRegModal({ event: e, type: 'spectator' })}
              />
            ))}
          </div>
        )}
      </section>

      <FireRule />
      <SponsorSection lang={lang} />
      <FireRule />
      <BetSection
        hasToken={hasToken}
        onScrollToTokens={() => scrollTo('tokens')}
        onScrollToSocial={() => scrollTo('social')}
        lang={lang}
      />
      <FireRule />
      <TokenSection lang={lang} onScrollToSocial={() => scrollTo('social')} />
      <Footer lang={lang} />

      {/* Modals */}
      {regModal && (
        <RegistrationModal
          event={regModal.event}
          type={regModal.type}
          lang={lang}
          onClose={() => setRegModal(null)}
          onSuccess={handleRegSuccess}
        />
      )}
      {successModal && (
        <SuccessModal
          registration={successModal}
          lang={lang}
          onClose={() => setSuccessModal(null)}
        />
      )}
      {socialOpen && (
        <SocialLinksModal lang={lang} onClose={() => setSocialOpen(false)} />
      )}
    </div>
  );
}