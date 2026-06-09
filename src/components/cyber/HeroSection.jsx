import React, { useRef, memo } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../translations';

const SD_LOGO_LARGE = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69b2e24ee21bc949528cccdd/5d1be983b_photo_2026-03-11_15-56-46.jpg";

function HeroSection({ onScrollTo, lang }) {
  const t = useTranslation(lang);
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <section id="hero" ref={containerRef} className="relative z-10 min-h-screen flex flex-col items-center justify-center text-center px-5 pt-[90px] pb-[60px] overflow-hidden">
      {/* Hex pattern — GPU layer, no repaints */}
      <motion.div
        className="absolute inset-0 pointer-events-none hex-pattern"
        style={{ y, opacity, willChange: 'transform, opacity' }} />

      {/* Eyebrow */}
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.7 }}
        className="font-mono text-xs tracking-[7px] uppercase text-fire-3/40 mb-6">
        {t('hero_eyebrow')}
      </motion.p>

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.6, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        whileHover={{ scale: 1.04, transition: { duration: 0.25, ease: 'easeOut' } }}
        transition={{ delay: 0.1, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="relative mb-2"
        style={{ willChange: 'transform' }}>

        {/* Scan line — CPU-light: no blur, opacity only */}
        <motion.div
          className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyber-cyan/50 to-transparent pointer-events-none"
          animate={{ y: [-20, 420], opacity: [0, 0.8, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'linear' }} />

        <img
          src={SD_LOGO_LARGE}
          alt="Street Dinamics"
          className="w-[min(420px,75vw)] h-auto rounded-2xl relative"
          style={{
            boxShadow: '0 0 40px rgba(255,100,0,0.6), 0 0 80px rgba(255,140,0,0.25)',
            willChange: 'auto'
          }} />

        {/* Glow overlay — CSS animation, no JS */}
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(255,100,0,0.12), transparent 65%)',
            animation: 'breathe 3s ease-in-out infinite'
          }} />
      </motion.div>

      {/* Tagline */}
      <motion.p
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0, duration: 0.7 }}
        className="font-orbitron text-[clamp(14px,2vw,18px)] font-semibold tracking-[8px] uppercase text-fire-4/50 mb-12"
        style={{ textShadow: '0 0 20px rgba(255,100,0,0.35)' }}>
        {t('hero_tagline')}
      </motion.p>

      {/* CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.25, duration: 0.7 }}
        className="flex gap-4 flex-wrap justify-center mb-5">

        <motion.button
          onClick={() => onScrollTo?.('events')}
          className="btn-fire text-[clamp(11px,1.5vw,13px)] tracking-[3px] px-8 py-3.5"
          whileHover={{ scale: 1.06, boxShadow: '0 8px 32px rgba(255,100,0,0.5)' }}
          whileTap={{ scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 380, damping: 20 }}>
          {t('hero_cta_athlete')}
        </motion.button>

        <motion.button
          onClick={() => onScrollTo?.('events')}
          className="btn-ghost text-[clamp(11px,1.5vw,13px)] tracking-[3px] px-8 py-3.5"
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 380, damping: 20 }}>
          {t('hero_cta_spectator')}
        </motion.button>

        <motion.button
          onClick={() => navigate('/UserProfile')}
          className="btn-ghost text-[clamp(11px,1.5vw,13px)] tracking-[3px] px-8 py-3.5"
          whileHover={{ scale: 1.06, borderColor: 'rgba(0,255,238,0.5)', color: 'rgba(0,255,238,0.9)' }}
          whileTap={{ scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 380, damping: 20 }}>
          {t('hero_cta_tokens')}
        </motion.button>
      </motion.div>

      {/* Scroll hint */}
      <motion.div
        className="absolute bottom-7 right-8 flex flex-col items-center gap-1"
        animate={{ y: [0, 5, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}>
        <div className="w-3 h-5 border border-fire-3/30 rounded-full flex justify-center pt-1">
          <motion.div
            className="w-0.5 h-0.5 bg-fire-3 rounded-full"
            animate={{ y: [0, 5, 0], opacity: [1, 0.3, 1] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }} />
        </div>
        <p className="font-mono text-[6px] tracking-[3px] uppercase text-fire-3/25">{t('hero_scroll')}</p>
      </motion.div>
    </section>
  );
}

export default memo(HeroSection);