import React from 'react';
import { motion } from 'framer-motion';

const SD_LOGO = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69b2e24ee21bc949528cccdd/5d1be983b_photo_2026-03-11_15-56-46.jpg";

export default function OnboardingStep1Splash({ onNext }) {
  return (
    <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 text-center">
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.6, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="mb-8"
      >
        <img
          src={SD_LOGO}
          alt="Street Dinamics"
          className="w-[min(280px,65vw)] h-auto rounded-2xl"
          style={{ filter: 'drop-shadow(0 0 40px rgba(255,100,0,0.9)) drop-shadow(0 0 80px rgba(255,150,0,0.5))' }}
        />
      </motion.div>

      {/* Brand name */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        className="mb-4"
      >
        <p className="font-mono text-[10px] tracking-[8px] uppercase text-fire-3/50 mb-2">
          STREET // DINAMICS
        </p>
        <h1 className="heading-fire text-[clamp(32px,8vw,72px)] font-black leading-none">
          SISTEMA
        </h1>
      </motion.div>

      {/* Tagline */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.8 }}
        className="font-rajdhani text-[clamp(16px,3vw,22px)] font-semibold text-fire-4/70 mb-3 max-w-md"
      >
        Prima di entrare, devi fare parte della community.
      </motion.p>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="font-mono text-xs text-white/30 mb-12 max-w-sm"
      >
        Non è un sito. È un sistema. Segui la procedura.
      </motion.p>

      {/* CTA */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.6 }}
        whileHover={{ scale: 1.05, boxShadow: '0 8px 40px rgba(255,100,0,0.6)' }}
        whileTap={{ scale: 0.97 }}
        onClick={onNext}
        className="btn-fire text-[clamp(12px,1.8vw,14px)] tracking-[4px] px-10 py-4"
      >
        Inizia →
      </motion.button>

      {/* Animated fire line at bottom */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 1.8, duration: 1.2 }}
        className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-fire-3 to-transparent"
      />
    </div>
  );
}