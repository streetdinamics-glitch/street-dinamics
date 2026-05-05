import React, { useState } from 'react';
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
    sub: 'Non è un sito. È un sistema vivo. Segui la procedura.',
    cta: 'Inizia →',
    badges: ['🏆 Atleti Verificati', '🃏 Card & NFT', '💰 Royalty', '⚡ Live Events'],
    steps: ['Community', 'Profilo', 'WhatsApp', 'Benvenuto'],
  },
  en: {
    tagline: 'Before entering, you must be part of the community.',
    sub: 'This is not a website. It\'s a live system. Follow the process.',
    cta: 'Start →',
    badges: ['🏆 Verified Athletes', '🃏 Cards & NFTs', '💰 Royalties', '⚡ Live Events'],
    steps: ['Community', 'Profile', 'WhatsApp', 'Welcome'],
  },
  es: {
    tagline: 'Antes de entrar, debes ser parte de la comunidad.',
    sub: 'No es un sitio web. Es un sistema vivo. Sigue el proceso.',
    cta: 'Empezar →',
    badges: ['🏆 Atletas Verificados', '🃏 Cards & NFTs', '💰 Regalías', '⚡ Eventos Live'],
    steps: ['Comunidad', 'Perfil', 'WhatsApp', 'Bienvenida'],
  },
  fr: {
    tagline: "Avant d'entrer, tu dois faire partie de la communauté.",
    sub: "Ce n'est pas un site. C'est un système vivant. Suis la procédure.",
    cta: 'Commencer →',
    badges: ['🏆 Athlètes Vérifiés', '🃏 Cards & NFTs', '💰 Royalties', '⚡ Événements Live'],
    steps: ['Communauté', 'Profil', 'WhatsApp', 'Bienvenue'],
  },
  ar: {
    tagline: 'قبل الدخول، يجب أن تكون جزءاً من المجتمع.',
    sub: 'هذا ليس موقعاً. إنه نظام حي. اتبع الإجراءات.',
    cta: 'ابدأ →',
    badges: ['🏆 رياضيون موثقون', '🃏 بطاقات & NFT', '💰 إتاوات', '⚡ أحداث مباشرة'],
    steps: ['المجتمع', 'الملف', 'واتساب', 'مرحباً'],
  },
  de: {
    tagline: 'Bevor du eintrittst, musst du Teil der Community sein.',
    sub: 'Das ist keine Website. Es ist ein lebendiges System. Folge dem Verfahren.',
    cta: 'Starten →',
    badges: ['🏆 Verifizierte Athleten', '🃏 Cards & NFTs', '💰 Royalties', '⚡ Live Events'],
    steps: ['Community', 'Profil', 'WhatsApp', 'Willkommen'],
  },
};

export default function OnboardingStep1Splash({ onNext, lang = 'it', onLangChange }) {
  const L = LABELS[lang] || LABELS.it;
  const [badgeVisible, setBadgeVisible] = useState(false);

  return (
    <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 text-center overflow-hidden">

      {/* Language switcher top right */}
      {onLangChange && (
        <div className="absolute top-4 right-4 flex gap-1 z-20">
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
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        onAnimationComplete={() => setBadgeVisible(true)}
        className="mb-6"
      >
        <motion.img
          src={SD_LOGO}
          alt="Street Dinamics"
          className="w-[min(200px,52vw)] h-auto rounded-2xl"
          animate={{
            filter: [
              'drop-shadow(0 0 30px rgba(255,100,0,0.8)) drop-shadow(0 0 70px rgba(255,150,0,0.4))',
              'drop-shadow(0 0 50px rgba(255,130,0,1)) drop-shadow(0 0 110px rgba(255,160,0,0.6))',
              'drop-shadow(0 0 30px rgba(255,100,0,0.8)) drop-shadow(0 0 70px rgba(255,150,0,0.4))',
            ]
          }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      </motion.div>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="mb-3"
      >
        <p className="font-mono text-[9px] tracking-[8px] uppercase text-fire-3/40 mb-1">
          STREET // DINAMICS
        </p>
        <h1 className="heading-fire text-[clamp(36px,9vw,80px)] font-black leading-none">
          SISTEMA
        </h1>
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.7 }}
        className="font-rajdhani text-[clamp(15px,3vw,20px)] font-semibold text-fire-4/70 mb-2 max-w-sm"
      >
        {L.tagline}
      </motion.p>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1, duration: 0.7 }}
        className="font-mono text-[11px] text-white/30 mb-6 max-w-xs"
      >
        {L.sub}
      </motion.p>

      {/* Feature badges */}
      {badgeVisible && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="flex flex-wrap justify-center gap-2 mb-8 max-w-sm"
        >
          {L.badges.map((b, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.08 }}
              className="font-mono text-[9px] tracking-[1px] px-3 py-1.5 border border-fire-3/20 text-fire-3/60 bg-fire-3/5"
              style={{ clipPath: 'polygon(4px 0%, 100% 0%, calc(100% - 4px) 100%, 0% 100%)' }}
            >
              {b}
            </motion.span>
          ))}
        </motion.div>
      )}

      {/* Step preview */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.6 }}
        className="flex items-center gap-1 mb-8"
      >
        {L.steps.map((s, i) => (
          <React.Fragment key={i}>
            <span className="font-mono text-[8px] text-white/20 tracking-[1px]">{s}</span>
            {i < L.steps.length - 1 && <span className="text-fire-3/20 text-[9px]">›</span>}
          </React.Fragment>
        ))}
      </motion.div>

      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.3, duration: 0.6 }}
        whileHover={{ scale: 1.05, boxShadow: '0 8px 40px rgba(255,100,0,0.6)' }}
        whileTap={{ scale: 0.97 }}
        onClick={onNext}
        className="btn-fire text-[clamp(12px,1.8vw,14px)] tracking-[4px] px-12 py-4"
      >
        {L.cta}
      </motion.button>

      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 1.8, duration: 1.2 }}
        className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-fire-3 to-transparent"
      />
    </div>
  );
}