import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Check, Lock, ChevronRight } from 'lucide-react';

const SOCIALS = [
  { id: 'instagram', label: 'Instagram', handle: '@streetdinamics',      followUrl: 'https://www.instagram.com/streetdinamics/', icon: '📸', accent: '#E1306C', followers: '12K' },
  { id: 'tiktok',    label: 'TikTok',    handle: '@streetdinamics',      followUrl: 'https://tiktok.com/@streetdinamics',         icon: '🎵', accent: '#ee1d52', followers: '28K' },
  { id: 'youtube',   label: 'YouTube',   handle: '@StreetDinamics',      followUrl: 'https://youtube.com/@StreetDinamics',        icon: '▶️', accent: '#FF0000', followers: '8K' },
  { id: 'kick',      label: 'Kick',      handle: 'kick.com/streetdinamics', followUrl: 'https://kick.com/streetdinamics',         icon: '🟢', accent: '#53fc18', followers: '5K' },
  { id: 'spotify',   label: 'Spotify',   handle: 'SD Talks Podcast',     followUrl: 'https://open.spotify.com/show/streetdinamics', icon: '🎧', accent: '#1DB954', followers: '3K' },
];

const LABELS = {
  it: {
    step: 'STEP 1 DI 4 — COMMUNITY',
    title: 'ENTRA NELLA\nCOMMUNITY',
    sub: 'Segui tutti gli account per sbloccare il prossimo step.',
    hint: '💡 Clicca "Segui", poi torna qui e conferma.',
    follow: 'Segui',
    followed: 'Seguito ✓',
    locked: 'confermati',
    continue: 'Continua →',
    confirm: '✓ Ho seguito — Confermo',
    openAgain: 'Riapri',
    whyLabel: 'Perché?',
    whyText: 'La community SD è il cuore del sistema. Seguici per non perdere nulla.',
  },
  en: {
    step: 'STEP 1 OF 4 — COMMUNITY',
    title: 'JOIN THE\nCOMMUNITY',
    sub: 'Follow all accounts to unlock the next step.',
    hint: '💡 Click Follow, then come back here and confirm.',
    follow: 'Follow',
    followed: 'Followed ✓',
    locked: 'confirmed',
    continue: 'Continue →',
    confirm: '✓ I followed — Confirm',
    openAgain: 'Open again',
    whyLabel: 'Why?',
    whyText: 'The SD community is the heart of the system. Follow us to never miss anything.',
  },
  es: {
    step: 'PASO 1 DE 4 — COMUNIDAD',
    title: 'ÚNETE A LA\nCOMUNIDAD',
    sub: 'Sigue todas las cuentas para desbloquear el siguiente paso.',
    hint: '💡 Haz clic en Seguir, luego vuelve y confirma.',
    follow: 'Seguir', followed: 'Siguiendo ✓', locked: 'confirmados',
    continue: 'Continuar →', confirm: '✓ Seguí — Confirmar', openAgain: 'Abrir de nuevo',
    whyLabel: '¿Por qué?', whyText: 'La comunidad SD es el corazón del sistema.',
  },
  fr: {
    step: 'ÉTAPE 1 SUR 4 — COMMUNAUTÉ',
    title: 'REJOINS LA\nCOMMUNAUTÉ',
    sub: 'Suis tous les comptes pour débloquer la prochaine étape.',
    hint: '💡 Clique Suivre, puis reviens et confirme.',
    follow: 'Suivre', followed: 'Suivi ✓', locked: 'confirmés',
    continue: 'Continuer →', confirm: "✓ J'ai suivi — Confirmer", openAgain: 'Ouvrir à nouveau',
    whyLabel: 'Pourquoi ?', whyText: 'La communauté SD est le cœur du système.',
  },
  ar: {
    step: 'الخطوة 1 من 4 — المجتمع',
    title: 'انضم إلى\nالمجتمع',
    sub: 'تابع جميع الحسابات لفتح الخطوة التالية.',
    hint: '💡 انقر متابعة، ثم ارجع وأكد.',
    follow: 'متابعة', followed: 'تمت المتابعة ✓', locked: 'مؤكد',
    continue: 'استمر →', confirm: '✓ تابعت — تأكيد', openAgain: 'افتح مجدداً',
    whyLabel: 'لماذا؟', whyText: 'مجتمع SD هو قلب النظام.',
  },
  de: {
    step: 'SCHRITT 1 VON 4 — COMMUNITY',
    title: 'TRITT DER\nCOMMUNITY BEI',
    sub: 'Folge allen Konten, um den nächsten Schritt freizuschalten.',
    hint: '💡 Klicke Folgen, komm zurück und bestätige.',
    follow: 'Folgen', followed: 'Gefolgt ✓', locked: 'bestätigt',
    continue: 'Weiter →', confirm: '✓ Gefolgt — Bestätigen', openAgain: 'Erneut öffnen',
    whyLabel: 'Warum?', whyText: 'Die SD-Community ist das Herz des Systems.',
  },
};

export default function OnboardingStep2Social({ onNext, lang = 'it' }) {
  const L = LABELS[lang] || LABELS.it;
  const [opened, setOpened] = useState({});
  const [confirmed, setConfirmed] = useState({});
  const [showWhy, setShowWhy] = useState(false);

  const allDone = SOCIALS.every(s => confirmed[s.id]);
  const doneCount = SOCIALS.filter(s => confirmed[s.id]).length;
  const pct = Math.round((doneCount / SOCIALS.length) * 100);

  const handleOpen = (social) => {
    window.open(social.followUrl, '_blank', 'noopener,noreferrer');
    setTimeout(() => setOpened(prev => ({ ...prev, [social.id]: true })), 600);
  };

  return (
    <div className="relative z-10 flex flex-col items-center justify-start min-h-full px-5 py-8 text-center max-w-xl mx-auto w-full">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-4 w-full">
        <p className="font-mono text-[8px] tracking-[5px] uppercase text-fire-3/40 mb-2">{L.step}</p>
        <h2 className="heading-fire text-[clamp(26px,6vw,48px)] font-black leading-none mb-2 whitespace-pre-line">
          {L.title}
        </h2>
        <p className="font-rajdhani text-sm text-white/50 mb-1">{L.sub}</p>

        {/* Why button */}
        <button onClick={() => setShowWhy(s => !s)}
          className="font-mono text-[9px] text-fire-3/40 underline underline-offset-2 hover:text-fire-3/70 transition-colors">
          {L.whyLabel}
        </button>
        <AnimatePresence>
          {showWhy && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mt-2">
              <p className="font-mono text-[9px] text-white/30 bg-fire-3/5 border border-fire-3/15 px-3 py-2 text-left">
                {L.whyText}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Progress */}
      <div className="w-full max-w-sm mb-4">
        <div className="flex justify-between font-mono text-[9px] mb-1">
          <span className="text-fire-3/50">{doneCount}/{SOCIALS.length} {L.locked}</span>
          <span className={`font-bold ${allDone ? 'text-green-400' : 'text-fire-3/60'}`}>{pct}%</span>
        </div>
        <div className="h-1.5 bg-white/5 w-full rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full transition-all duration-500 ${allDone ? 'bg-green-400' : 'bg-gradient-to-r from-fire-3 to-fire-5'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Hint */}
      <p className="font-mono text-[9px] text-white/25 mb-4 tracking-[1px]">{L.hint}</p>

      {/* Social list */}
      <div className="w-full space-y-2 mb-6">
        {SOCIALS.map((social, i) => (
          <motion.div
            key={social.id}
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            className="w-full"
          >
            {confirmed[social.id] ? (
              <div className="w-full flex items-center justify-between px-4 py-3 border border-green-500/40 bg-green-500/8"
                style={{ clipPath: 'polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)' }}>
                <div className="flex items-center gap-3">
                  <span className="text-lg">{social.icon}</span>
                  <div className="text-left">
                    <span className="font-orbitron font-bold text-sm text-green-400">{social.label}</span>
                    <span className="font-mono text-[8px] text-green-400/40 ml-2">{social.handle}</span>
                  </div>
                </div>
                <Check size={16} className="text-green-400" />
              </div>
            ) : opened[social.id] ? (
              <div className="w-full border border-fire-3/30 bg-[rgba(6,2,10,0.95)] overflow-hidden"
                style={{ clipPath: 'polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)' }}>
                <div className="flex items-center justify-between px-4 py-2.5">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{social.icon}</span>
                    <div className="text-left">
                      <div className="font-orbitron font-bold text-sm text-fire-4">{social.label}</div>
                      <div className="font-mono text-[8px] text-white/25">{social.handle}</div>
                    </div>
                  </div>
                  <button onClick={() => handleOpen(social)} className="font-mono text-[8px] text-white/30 underline flex items-center gap-1">
                    <ExternalLink size={9} /> {L.openAgain}
                  </button>
                </div>
                <button onClick={() => setConfirmed(p => ({ ...p, [social.id]: true }))}
                  className="w-full py-2.5 bg-fire-3/10 border-t border-fire-3/20 font-orbitron text-[10px] tracking-[2px] text-fire-4 hover:bg-fire-3/20 transition-all flex items-center justify-center gap-2">
                  <Check size={12} /> {L.confirm}
                </button>
              </div>
            ) : (
              <button onClick={() => handleOpen(social)}
                className="w-full flex items-center justify-between px-4 py-3.5 border border-fire-3/15 bg-[rgba(6,2,10,0.8)] hover:border-fire-3/40 hover:bg-fire-3/5 transition-all active:scale-[0.99]"
                style={{ clipPath: 'polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)' }}>
                <div className="flex items-center gap-3">
                  <span className="text-lg">{social.icon}</span>
                  <div className="text-left">
                    <div className="font-orbitron font-bold text-sm text-fire-4">{social.label}</div>
                    <div className="font-mono text-[8px] text-white/25">{social.handle}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[8px] text-white/20">{social.followers}</span>
                  <span
                    className="flex items-center gap-1.5 font-orbitron text-[9px] tracking-[1px] px-3 py-1.5"
                    style={{ color: social.accent, border: `1px solid ${social.accent}44`, clipPath: 'polygon(4px 0%, 100% 0%, calc(100% - 4px) 100%, 0% 100%)' }}
                  >
                    <ExternalLink size={10} /> {L.follow}
                  </span>
                </div>
              </button>
            )}
          </motion.div>
        ))}
      </div>

      {/* CTA */}
      <motion.button
        animate={{ opacity: allDone ? 1 : 0.35, scale: allDone ? 1 : 0.98 }}
        transition={{ duration: 0.3 }}
        onClick={allDone ? onNext : undefined}
        disabled={!allDone}
        className={`btn-fire text-[12px] tracking-[3px] px-10 py-3.5 transition-all flex items-center gap-2 ${!allDone ? 'cursor-not-allowed' : ''}`}
        whileHover={allDone ? { scale: 1.04 } : {}}
        whileTap={allDone ? { scale: 0.97 } : {}}
      >
        {allDone ? (
          <><Check size={14} /> {L.continue}</>
        ) : (
          <><Lock size={13} /> {doneCount}/{SOCIALS.length} {L.locked}</>
        )}
      </motion.button>

      <div className="h-8" />
    </div>
  );
}