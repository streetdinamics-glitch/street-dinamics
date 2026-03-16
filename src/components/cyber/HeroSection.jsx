import React, { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../translations';

const SD_LOGO_LARGE = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69b2e24ee21bc949528cccdd/5d1be983b_photo_2026-03-11_15-56-46.jpg";

export default function HeroSection({ onScrollTo, lang }) {
  const t = useTranslation(lang);
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section id="hero" ref={containerRef} className="relative z-10 min-h-screen flex flex-col items-center justify-center text-center px-5 pt-[90px] pb-[60px] overflow-hidden">
      {/* Animated 3D Hex pattern */}
      <motion.div
        className="absolute inset-0 pointer-events-none hex-pattern"
        style={{ y, opacity }} />


      {/* Eyebrow */}
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.8 }}
        className="font-mono text-xs tracking-[7px] uppercase text-fire-3/40 mb-6">

        {t('hero_eyebrow')}
      </motion.p>

      {/* Logo with 3D Transform */}
      <motion.div
        initial={{ opacity: 0, scale: 0.55, y: 60, rotateX: 25 }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
          rotateX: 0
        }}
        whileHover={{
          scale: 1.05,
          rotateY: 5,
          rotateX: -5,
          transition: { duration: 0.3 }
        }}
        transition={{ delay: 0.1, duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative mb-2"
        style={{
          perspective: '1000px',
          transformStyle: 'preserve-3d'
        }}>

        <motion.div
          className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyber-cyan to-transparent opacity-40 pointer-events-none blur-sm"
          animate={{
            y: [-20, 400],
            opacity: [0, 1, 0]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'linear'
          }} />

        <motion.img
          src={SD_LOGO_LARGE}
          alt="Street Dinamics"
          className="w-[min(420px,75vw)] h-auto rounded-2xl relative"
          style={{
            filter: 'drop-shadow(0 0 40px rgba(255,100,0,0.9)) drop-shadow(0 0 80px rgba(255,150,0,0.5))',
            transformStyle: 'preserve-3d'
          }}
          animate={{
            filter: [
            'drop-shadow(0 0 40px rgba(255,100,0,0.9)) drop-shadow(0 0 80px rgba(255,150,0,0.5))',
            'drop-shadow(0 0 60px rgba(255,130,0,1)) drop-shadow(0 0 120px rgba(255,180,0,0.7))',
            'drop-shadow(0 0 40px rgba(255,100,0,0.9)) drop-shadow(0 0 80px rgba(255,150,0,0.5))']

          }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} />

        <motion.div
          className="absolute inset-0 rounded-2xl"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(255,100,0,0.15), transparent 70%)',
            transform: 'translateZ(-30px)'
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} />

      </motion.div>

      {/* Tagline */}
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1, duration: 0.8 }}
        className="font-orbitron text-[clamp(14px,2vw,18px)] font-semibold tracking-[8px] uppercase text-fire-4/50 mb-12"
        style={{
          textShadow: '0 0 20px rgba(255,100,0,0.4), 0 0 40px rgba(255,100,0,0.2)'
        }}>

        ENERGY · VIBES · COMMUNITY · LIFE
      </motion.p>

      {/* CTAs with 3D Depth */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4, duration: 0.8 }}
        className="flex gap-4 flex-wrap justify-center mb-5"
        style={{ perspective: '1000px' }}>

        <motion.button
          onClick={() => onScrollTo?.('events')}
          className="btn-fire text-[clamp(11px,1.5vw,13px)] tracking-[3px] px-8 py-3.5 relative overflow-hidden"
          whileHover={{
            scale: 1.08,
            rotateX: -5,
            boxShadow: '0 8px 40px rgba(255,100,0,0.6)'
          }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}>

          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-fire-5 via-fire-3 to-fire-5"
            animate={{ x: [-200, 200] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            style={{ opacity: 0.3 }} />

          <span className="relative z-10">{t('hero_cta_athlete')}</span>
        </motion.button>
        <motion.button
          onClick={() => onScrollTo?.('events')}
          className="btn-ghost text-[clamp(11px,1.5vw,13px)] tracking-[3px] px-8 py-3.5 relative overflow-hidden"
          whileHover={{
            scale: 1.08,
            rotateX: -5,
            borderColor: 'rgba(255,150,0,0.7)'
          }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}>

          <span className="relative z-10">{t('hero_cta_spectator')}</span>
        </motion.button>
        <motion.button
          onClick={() => navigate('/UserProfile')}
          className="btn-ghost text-[clamp(11px,1.5vw,13px)] tracking-[3px] px-8 py-3.5 relative overflow-hidden"
          whileHover={{
            scale: 1.08,
            rotateX: -5,
            borderColor: 'rgba(0,255,238,0.5)',
            color: 'rgba(0,255,238,0.9)'
          }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}>

          <span className="relative z-10">{t('hero_cta_tokens')}</span>
        </motion.button>
      </motion.div>

      {/* Scroll hint with animation */}
      <motion.div className="ml-8 absolute bottom-7 right-8 flex flex-col items-center gap-1"

      animate={{ y: [0, 6, 0] }}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>

        <motion.div
          className="w-3 h-5 border border-fire-3/30 rounded-full flex justify-center pt-1"
          animate={{ borderColor: ['rgba(255,100,0,0.2)', 'rgba(255,100,0,0.5)', 'rgba(255,100,0,0.2)'] }}
          transition={{ duration: 2, repeat: Infinity }}>

          <motion.div
            className="w-0.5 h-0.5 bg-fire-3 rounded-full"
            animate={{ y: [0, 6, 0], opacity: [1, 0.3, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }} />

        </motion.div>
        <p className="font-mono text-[6px] tracking-[3px] uppercase text-fire-3/25">
          {t('hero_scroll')}
        </p>
      </motion.div>
    </section>);

}