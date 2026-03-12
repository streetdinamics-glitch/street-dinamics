import React, { useState, useCallback, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
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
  const [regModal, setRegModal] = useState(null); // { event, type }
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

  const hasRegistration = registrations.length > 0;

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
      <Navbar onScrollTo={scrollTo} />

      <HeroSection onScrollTo={scrollTo} />
      <FireRule />

      {/* Events Section */}
      <section id="events" className="section-container">
        <p className="font-mono text-[10px] tracking-[7px] uppercase text-fire-3 text-center mb-2 opacity-0 animate-[fadeUp_0.7s_ease_forwards]">
          Live & Digital Circuit
        </p>
        <h2 className="heading-fire text-[clamp(36px,7vw,88px)] text-center leading-none mb-14 font-black opacity-0 animate-[fadeUp_0.8s_ease_0.1s_forwards]">
          EVENTS
        </h2>

        <FlowSteps />

        {eventsLoading ? (
          <div className="text-center font-mono text-fire-3/30 text-sm tracking-[2px] py-20">LOADING EVENTS...</div>
        ) : events.length === 0 ? (
          <div className="text-center py-20">
            <span className="text-4xl block mb-3">🔥</span>
            <p className="font-mono text-sm tracking-[2px] text-fire-3/30">No events yet. Stay tuned.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {events.map((ev, i) => (
              <EventCard
                key={ev.id}
                event={ev}
                index={i}
                onRegisterAthlete={(e) => setRegModal({ event: e, type: 'athlete' })}
                onRegisterSpectator={(e) => setRegModal({ event: e, type: 'spectator' })}
              />
            ))}
          </div>
        )}
      </section>

      <FireRule />
      <SponsorSection />
      <FireRule />
      <BetSection hasRegistration={hasRegistration} onScrollToEvents={() => scrollTo('events')} />
      <FireRule />
      <TokenSection />
      <Footer />

      {/* Modals */}
      {regModal && (
        <RegistrationModal
          event={regModal.event}
          type={regModal.type}
          onClose={() => setRegModal(null)}
          onSuccess={handleRegSuccess}
        />
      )}
      {successModal && (
        <SuccessModal
          registration={successModal}
          onClose={() => setSuccessModal(null)}
        />
      )}
      {socialOpen && (
        <SocialLinksModal onClose={() => setSocialOpen(false)} />
      )}
    </div>
  );
}