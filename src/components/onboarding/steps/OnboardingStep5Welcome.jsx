import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SLIDES = [
  {
    emoji: '🃏',
    title: 'La Card',
    text: 'Ogni atleta ha una card — come una figurina Panini. La compri, la tieni, e quando l\'atleta vince, vale di più.',
  },
  {
    emoji: '💰',
    title: 'Le Royalty',
    text: 'Ogni sponsorizzazione che l\'atleta prende, il 50% va agli holder delle sue card. Automaticamente.',
  },
  {
    emoji: '👑',
    title: 'Window Challenge',
    text: 'Chi vince un torneo può sfidare il campione. Tu segui la storia in tempo reale — e la tua card si muove con essa.',
  },
];

const SD_LOGO = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69b2e24ee21bc949528cccdd/5d1be983b_photo_2026-03-11_15-56-46.jpg";

export default function OnboardingStep5Welcome({ userData, onFinish }) {
  const { nome, role } = userData;
  const [slide, setSlide] = useState(0);
  const [allSeen, setAllSeen] = useState(false);

  useEffect(() => {
    if (slide >= SLIDES.length - 1) setAllSeen(true);
  }, [slide]);

  const nextSlide = () => {
    if (slide < SLIDES.length - 1) setSlide(s => s + 1);
  };

  return (
    <div className="relative z-10 flex flex-col items-center justify-center min-h-full px-5 py-12 max-w-lg mx-auto w-full text-center">
      {/* Welcome header */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="mb-8"
      >
        <motion.img
          src={SD_LOGO}
          alt="SD"
          className="w-20 h-20 rounded-xl object-cover mx-auto mb-4"
          style={{ filter: 'drop-shadow(0 0 20px rgba(255,100,0,0.7))' }}
          animate={{ filter: [
            'drop-shadow(0 0 20px rgba(255,100,0,0.7))',
            'drop-shadow(0 0 35px rgba(255,150,0,1))',
            'drop-shadow(0 0 20px rgba(255,100,0,0.7))',
          ]}}
          transition={{ duration: 2.5, repeat: Infinity }}
        />
        <p className="font-mono text-[9px] tracking-[6px] uppercase text-fire-3/40 mb-2">BENVENUTO</p>
        <h2 className="heading-fire text-[clamp(28px,6vw,52px)] font-black leading-none mb-2">
          {nome ? `CIAO, ${nome.toUpperCase()}!` : 'SEI DENTRO!'}
        </h2>
        <p className="font-rajdhani text-base text-white/50">
          {role === 'atleta'
            ? 'Il tuo profilo atleta è attivo. Ti avviseremo via WhatsApp per i prossimi eventi.'
            : 'Sei nel sistema. Ti terremo aggiornato sugli eventi SD.'}
        </p>
      </motion.div>

      {/* Card slides */}
      <div className="w-full max-w-sm mb-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.35 }}
            className="border border-fire-3/20 bg-fire-3/5 p-6"
            style={{ clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))' }}
          >
            <div className="text-4xl mb-3">{SLIDES[slide].emoji}</div>
            <h3 className="font-orbitron font-bold text-lg text-fire-4 mb-2">{SLIDES[slide].title}</h3>
            <p className="font-rajdhani text-base text-white/60 leading-relaxed">{SLIDES[slide].text}</p>
          </motion.div>
        </AnimatePresence>

        {/* Slide controls */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex gap-2">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => { setSlide(i); if (i >= slide) setAllSeen(i === SLIDES.length - 1); }}
                className={`w-6 h-1 transition-all duration-300 ${i === slide ? 'bg-fire-3' : i < slide ? 'bg-fire-3/40' : 'bg-white/10'}`}
              />
            ))}
          </div>
          {slide < SLIDES.length - 1 && (
            <button onClick={nextSlide} className="btn-ghost text-[10px] tracking-[2px] px-4 py-2">
              Prossima →
            </button>
          )}
        </div>
      </div>

      {/* Enter button */}
      <motion.div
        animate={{ opacity: allSeen ? 1 : 0.3 }}
        transition={{ duration: 0.5 }}
      >
        <motion.button
          onClick={allSeen ? onFinish : undefined}
          disabled={!allSeen}
          className={`btn-fire text-[13px] tracking-[4px] px-12 py-4 ${!allSeen ? 'opacity-30 cursor-not-allowed' : ''}`}
          whileHover={allSeen ? { scale: 1.05, boxShadow: '0 8px 40px rgba(255,100,0,0.6)' } : {}}
          whileTap={allSeen ? { scale: 0.97 } : {}}
        >
          🔥 Entra nella Piattaforma
        </motion.button>
      </motion.div>

      {!allSeen && (
        <p className="font-mono text-[9px] text-white/20 mt-3">Scorri tutte e 3 le slide per continuare</p>
      )}
    </div>
  );
}