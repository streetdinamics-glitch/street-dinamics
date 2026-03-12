import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '../../lib/translations';

const SD_LOGO_LARGE = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69b2e24ee21bc949528cccdd/5d1be983b_photo_2026-03-11_15-56-46.jpg";

export default function HeroSection({ onScrollTo, lang }) {
  const t = useTranslation(lang);
  return (
    <section id="hero" className="relative z-10 min-h-screen flex flex-col items-center justify-center text-center px-5 pt-[90px] pb-[60px] overflow-hidden">
      {/* Hex pattern */}
      <div className="absolute inset-0 pointer-events-none hex-pattern" />

      {/* Eyebrow */}
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.8 }}
        className="font-mono text-xs tracking-[7px] uppercase text-fire-3/40 mb-6"
      >
        {t('hero_eyebrow')}
      </motion.p>

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.55, y: 60 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative mb-2"
      >
        <div className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyber-cyan to-transparent opacity-30 pointer-events-none" style={{ animation: 'card-scan 3s ease-in-out infinite' }} />
        <img
          src={SD_LOGO_LARGE}
          alt="Street Dinamics"
          className="w-[min(380px,70vw)] h-auto rounded-2xl"
          style={{ animation: 'logo-pulse 4s ease-in-out infinite', filter: 'drop-shadow(0 0 30px rgba(255,100,0,0.8))' }}
        />
      </motion.div>

      {/* Tagline */}
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1, duration: 0.8 }}
        className="font-orbitron text-[clamp(13px,1.8vw,16px)] font-normal tracking-[6px] uppercase text-fire-3/30 mb-12"
      >
        {t('hero_tagline')}
      </motion.p>

      {/* CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4, duration: 0.8 }}
        className="flex gap-3.5 flex-wrap justify-center mb-5"
      >
        <button
          onClick={() => onScrollTo?.('events')}
          className="btn-fire text-[clamp(11px,1.5vw,13px)] tracking-[3px] px-8 py-3.5"
        >
          {t('hero_cta_athlete')}
        </button>
        <button
          onClick={() => onScrollTo?.('events')}
          className="btn-ghost text-[clamp(11px,1.5vw,13px)] tracking-[3px] px-8 py-3.5"
        >
          {t('hero_cta_spectator')}
        </button>
        <button
          onClick={() => onScrollTo?.('tokens')}
          className="btn-ghost text-[clamp(11px,1.5vw,13px)] tracking-[3px] px-8 py-3.5"
        >
          {t('hero_cta_tokens')}
        </button>
      </motion.div>

      {/* Scroll hint */}
      <p className="absolute bottom-7 left-1/2 -translate-x-1/2 font-mono text-[9px] tracking-[5px] uppercase text-fire-3/25" style={{ animation: 'breathe 2.5s ease-in-out infinite' }}>
        {t('hero_scroll')}
      </p>
    </section>
  );
}