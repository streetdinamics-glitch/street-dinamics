import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const SD_LOGO = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69b2e24ee21bc949528cccdd/5d1be983b_photo_2026-03-11_15-56-46.jpg";

const LANGS = [
  { code: 'it', flag: '🇮🇹', label: 'IT' },
  { code: 'en', flag: '🇬🇧', label: 'EN' },
  { code: 'es', flag: '🇪🇸', label: 'ES' },
  { code: 'fr', flag: '🇫🇷', label: 'FR' },
  { code: 'ar', flag: '🇸🇦', label: 'AR' },
  { code: 'de', flag: '🇩🇪', label: 'DE' },
];

const LABELS = {
  it: {
    tagline: 'Prima di entrare, devi fare parte della community.',
    sub: 'Non è un sito. È un sistema vivo.',
    cta: 'Inizia il processo',
    time: '~3 minuti',
    badges: ['🏆 Atleti Verificati', '🃏 Card & NFT', '💰 Royalty', '⚡ Live Events'],
    steps: ['Community', 'Profilo', 'WhatsApp', 'Benvenuto'],
    stepsLabel: '4 step:',
  },
  en: {
    tagline: 'Before entering, you must be part of the community.',
    sub: "This is not a website. It's a live system.",
    cta: 'Start the process',
    time: '~3 minutes',
    badges: ['🏆 Verified Athletes', '🃏 Cards & NFTs', '💰 Royalties', '⚡ Live Events'],
    steps: ['Community', 'Profile', 'WhatsApp', 'Welcome'],
    stepsLabel: '4 steps:',
  },
  es: {
    tagline: 'Antes de entrar, debes ser parte de la comunidad.',
    sub: 'No es un sitio web. Es un sistema vivo.',
    cta: 'Empezar el proceso',
    time: '~3 minutos',
    badges: ['🏆 Atletas Verificados', '🃏 Cards & NFTs', '💰 Regalías', '⚡ Eventos Live'],
    steps: ['Comunidad', 'Perfil', 'WhatsApp', 'Bienvenida'],
    stepsLabel: '4 pasos:',
  },
  fr: {
    tagline: "Avant d'entrer, tu dois faire partie de la communauté.",
    sub: "Ce n'est pas un site. C'est un système vivant.",
    cta: 'Commencer le processus',
    time: '~3 minutes',
    badges: ['🏆 Athlètes Vérifiés', '🃏 Cards & NFTs', '💰 Royalties', '⚡ Événements Live'],
    steps: ['Communauté', 'Profil', 'WhatsApp', 'Bienvenue'],
    stepsLabel: '4 étapes :',
  },
  ar: {
    tagline: 'قبل الدخول، يجب أن تكون جزءاً من المجتمع.',
    sub: 'هذا ليس موقعاً. إنه نظام حي.',
    cta: 'ابدأ العملية',
    time: '~3 دقائق',
    badges: ['🏆 رياضيون موثقون', '🃏 بطاقات & NFT', '💰 إتاوات', '⚡ أحداث مباشرة'],
    steps: ['المجتمع', 'الملف', 'واتساب', 'مرحباً'],
    stepsLabel: '4 خطوات:',
  },
  de: {
    tagline: 'Bevor du eintrittst, musst du Teil der Community sein.',
    sub: 'Das ist keine Website. Es ist ein lebendiges System.',
    cta: 'Prozess starten',
    time: '~3 Minuten',
    badges: ['🏆 Verifizierte Athleten', '🃏 Cards & NFTs', '💰 Royalties', '⚡ Live Events'],
    steps: ['Community', 'Profil', 'WhatsApp', 'Willkommen'],
    stepsLabel: '4 Schritte:',
  },
};

export default function OnboardingStep1Splash({ onNext, lang = 'it', onLangChange }) {
  const L = LABELS[lang] || LABELS.it;
  const [ready, setReady] = useState(false);

  // Mostra il CTA solo dopo che l'animazione iniziale è completata (~2s)
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 2000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 text-center overflow-hidden">

      {/* Language switcher */}
      {onLangChange && (
        <div className="absolute top-4 right-4 flex flex-wrap gap-1 z-20 justify-end max-w-[180px]">
          {LANGS.map(l => (
            <button
              key={l.code}
              onClick={() => onLangChange(l.code)}
              className={`px-2 py-1 font-mono text-[9px] tracking-[1px] border transition-all ${
                lang === l.code
                  ? 'border-fire-3 text-fire-4 bg-fire-3/10'
                  : 'border-white/10 text-white/30 hover:border-fire-3/40 hover:text-fire-3/60'
              }`}
            >
              {l.flag}
            </button>
          ))}
        </div>
      )}

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
        className="mb-5"
      >
        <motion.img
          src={SD_LOGO}
          alt="Street Dinamics"
          className="w-[min(160px,42vw)] h-auto rounded-2xl mx-auto"
          animate={{
            filter: [
              'drop-shadow(0 0 24px rgba(255,100,0,0.8)) drop-shadow(0 0 60px rgba(255,150,0,0.4))',
              'drop-shadow(0 0 44px rgba(255,130,0,1)) drop-shadow(0 0 100px rgba(255,160,0,0.6))',
              'drop-shadow(0 0 24px rgba(255,100,0,0.8)) drop-shadow(0 0 60px rgba(255,150,0,0.4))',
            ]
          }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      </motion.div>

      {/* Brand */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.7 }}
        className="mb-3"
      >
        <p className="font-mono text-[9px] tracking-[8px] uppercase text-fire-3/40 mb-1">
          STREET // DINAMICS
        </p>
        <h1 className="heading-fire text-[clamp(32px,8vw,72px)] font-black leading-none">
          SISTEMA
        </h1>
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.6 }}
        className="font-rajdhani text-[clamp(14px,3vw,18px)] font-semibold text-fire-4/70 mb-1 max-w-sm"
      >
        {L.tagline}
      </motion.p>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.5 }}
        className="font-mono text-[11px] text-white/30 mb-5 max-w-xs"
      >
        {L.sub}
      </motion.p>

      {/* Feature badges */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0, duration: 0.5 }}
        className="flex flex-wrap justify-center gap-2 mb-5 max-w-sm"
      >
        {L.badges.map((b, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.0 + i * 0.07 }}
            className="font-mono text-[9px] tracking-[1px] px-3 py-1.5 border border-fire-3/20 text-fire-3/60 bg-fire-3/5"
            style={{ clipPath: 'polygon(4px 0%, 100% 0%, calc(100% - 4px) 100%, 0% 100%)' }}
          >
            {b}
          </motion.span>
        ))}
      </motion.div>

      {/* Step preview + time estimate */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3, duration: 0.5 }}
        className="flex flex-col items-center gap-1.5 mb-6"
      >
        <div className="flex items-center gap-1">
          <span className="font-mono text-[8px] text-white/20 tracking-[1px]">{L.stepsLabel}</span>
          {L.steps.map((s, i) => (
            <React.Fragment key={i}>
              <span className="font-mono text-[8px] text-white/30 tracking-[1px]">{s}</span>
              {i < L.steps.length - 1 && <span className="text-fire-3/20 text-[9px]">›</span>}
            </React.Fragment>
          ))}
        </div>
        <span className="font-mono text-[8px] text-fire-3/30 border border-fire-3/15 px-2 py-0.5">
          ⏱ {L.time}
        </span>
      </motion.div>

      <motion.button
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: ready ? 1 : 0, y: ready ? 0 : 16 }}
        transition={{ duration: 0.5 }}
        whileHover={{ scale: 1.05, boxShadow: '0 8px 40px rgba(255,100,0,0.6)' }}
        whileTap={{ scale: 0.97 }}
        onClick={ready ? onNext : undefined}
        disabled={!ready}
        className="btn-fire text-[clamp(11px,1.6vw,13px)] tracking-[3px] px-10 py-4"
      >
        {L.cta} →
      </motion.button>

      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 1.6, duration: 1.0 }}
        className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-fire-3 to-transparent"
      />
    </div>
  );
}