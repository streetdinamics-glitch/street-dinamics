import React from 'react';
import { motion } from 'framer-motion';

const SD_LOGO_LARGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 460 120'%3E%3Crect width='460' height='120' fill='none'/%3E%3Ctext x='30' y='95' font-family='monospace' font-size='90' font-weight='900' fill='%23ff6600' style='filter:drop-shadow(0 0 20px rgba(255,100,0,0.8))'%3ESTREET%3C/text%3E%3Ctext x='30' y='115' font-family='monospace' font-size='14' letter-spacing='12' fill='%23664422'%3EDINAMICS%3C/text%3E%3C/svg%3E";

export default function HeroSection({ onScrollTo }) {
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
        // Italy's Street Sports Circuit //
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
          className="w-[min(460px,78vw)] h-auto"
          style={{ animation: 'logo-pulse 4s ease-in-out infinite' }}
        />
      </motion.div>

      {/* Tagline */}
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1, duration: 0.8 }}
        className="font-orbitron text-[clamp(13px,1.8vw,16px)] font-normal tracking-[6px] uppercase text-fire-3/30 mb-12"
      >
        Tournaments · Scouting · Community · 13–30
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
          JOIN AS ATHLETE
        </button>
        <button
          onClick={() => onScrollTo?.('events')}
          className="btn-ghost text-[clamp(11px,1.5vw,13px)] tracking-[3px] px-8 py-3.5"
        >
          WATCH AS SPECTATOR
        </button>
        <button
          onClick={() => onScrollTo?.('tokens')}
          className="btn-ghost text-[clamp(11px,1.5vw,13px)] tracking-[3px] px-8 py-3.5"
        >
          🎫 GET ATHLETE TOKENS
        </button>
      </motion.div>

      {/* Scroll hint */}
      <p className="absolute bottom-7 left-1/2 -translate-x-1/2 font-mono text-[9px] tracking-[5px] uppercase text-fire-3/25" style={{ animation: 'breathe 2.5s ease-in-out infinite' }}>
        ↓ SCROLL FOR EVENTS
      </p>
    </section>
  );
}