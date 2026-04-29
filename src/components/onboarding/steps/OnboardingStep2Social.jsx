import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Check, Lock } from 'lucide-react';

const SOCIALS = [
  {
    id: 'instagram',
    label: 'Instagram',
    handle: '@streetdinamics',
    url: 'https://www.instagram.com/streetdinamics/',
    color: 'border-purple-500/40 bg-purple-500/10 text-purple-400',
    icon: '📸',
    followUrl: 'https://www.instagram.com/streetdinamics/',
  },
  {
    id: 'tiktok',
    label: 'TikTok',
    handle: '@streetdinamics',
    url: 'https://tiktok.com/@streetdinamics',
    color: 'border-pink-500/40 bg-pink-500/10 text-pink-400',
    icon: '🎵',
    followUrl: 'https://tiktok.com/@streetdinamics',
  },
  {
    id: 'youtube',
    label: 'YouTube',
    handle: '@StreetDinamics',
    url: 'https://youtube.com/@StreetDinamics',
    color: 'border-red-500/40 bg-red-500/10 text-red-400',
    icon: '▶️',
    followUrl: 'https://youtube.com/@StreetDinamics',
  },
  {
    id: 'kick',
    label: 'Kick',
    handle: 'kick.com/streetdinamics',
    url: 'https://kick.com/streetdinamics',
    color: 'border-green-500/40 bg-green-500/10 text-green-400',
    icon: '🟢',
    followUrl: 'https://kick.com/streetdinamics',
  },
  {
    id: 'spotify',
    label: 'Spotify',
    handle: 'SD Talks Podcast',
    url: 'https://open.spotify.com/show/streetdinamics',
    color: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400',
    icon: '🎧',
    followUrl: 'https://open.spotify.com/show/streetdinamics',
  },
];

// Labels per lang
const LABELS = {
  it: {
    step: 'STEP 1 DI 4',
    title: 'ENTRA NELLA\nCOMMUNITY',
    sub: 'Segui tutti gli account — non si salta.',
    hint: 'Clicca "Segui" · Aspetta la conferma · Poi continua',
    follow: 'Segui',
    followed: 'Seguito ✓',
    locked: 'seguiti',
    continue: 'Continua →',
    verify: 'Clicca SEGUI poi torna qui e conferma',
    confirm: '✓ Confermo di aver seguito',
  },
  en: {
    step: 'STEP 1 OF 4',
    title: 'JOIN THE\nCOMMUNITY',
    sub: 'Follow all accounts — no skipping.',
    hint: 'Click Follow · Wait for confirmation · Then continue',
    follow: 'Follow',
    followed: 'Followed ✓',
    locked: 'followed',
    continue: 'Continue →',
    verify: 'Click FOLLOW then come back and confirm',
    confirm: '✓ I confirm I followed',
  },
  es: {
    step: 'PASO 1 DE 4',
    title: 'ÚNETE A LA\nCOMUNIDAD',
    sub: 'Sigue todas las cuentas — sin saltar.',
    hint: 'Haz clic en Seguir · Espera · Continúa',
    follow: 'Seguir',
    followed: 'Siguiendo ✓',
    locked: 'seguidos',
    continue: 'Continuar →',
    verify: 'Haz clic en SEGUIR, luego vuelve y confirma',
    confirm: '✓ Confirmo que seguí',
  },
  fr: {
    step: 'ÉTAPE 1 SUR 4',
    title: 'REJOINS LA\nCOMMUNAUTÉ',
    sub: 'Suis tous les comptes — sans sauter.',
    hint: 'Clique Suivre · Attends · Continue',
    follow: 'Suivre',
    followed: 'Suivi ✓',
    locked: 'suivis',
    continue: 'Continuer →',
    verify: 'Clique SUIVRE puis reviens et confirme',
    confirm: '✓ Je confirme avoir suivi',
  },
  ar: {
    step: 'الخطوة 1 من 4',
    title: 'انضم إلى\nالمجتمع',
    sub: 'تابع جميع الحسابات — لا تقفز.',
    hint: 'انقر متابعة · انتظر · ثم استمر',
    follow: 'متابعة',
    followed: 'تمت المتابعة ✓',
    locked: 'متابَع',
    continue: 'استمر →',
    verify: 'انقر متابعة ثم ارجع وأكد',
    confirm: '✓ أؤكد أنني تابعت',
  },
  de: {
    step: 'SCHRITT 1 VON 4',
    title: 'TRITT DER\nCOMMUNITY BEI',
    sub: 'Folge allen Konten — kein Überspringen.',
    hint: 'Klicke Folgen · Warte · Weiter',
    follow: 'Folgen',
    followed: 'Gefolgt ✓',
    locked: 'gefolgt',
    continue: 'Weiter →',
    verify: 'Klicke FOLGEN, komm zurück und bestätige',
    confirm: '✓ Ich bestätige, dass ich gefolgt bin',
  },
};

export default function OnboardingStep2Social({ onNext, lang = 'it' }) {
  const L = LABELS[lang] || LABELS.it;
  // opened[id] = true when link was opened
  const [opened, setOpened] = useState({});
  // confirmed[id] = true when user clicked "I confirm"
  const [confirmed, setConfirmed] = useState({});

  const allDone = SOCIALS.every(s => confirmed[s.id]);
  const doneCount = SOCIALS.filter(s => confirmed[s.id]).length;

  const handleOpen = (social) => {
    window.open(social.followUrl, '_blank', 'noopener,noreferrer');
    setTimeout(() => {
      setOpened(prev => ({ ...prev, [social.id]: true }));
    }, 800);
  };

  const handleConfirm = (id) => {
    setConfirmed(prev => ({ ...prev, [id]: true }));
  };

  return (
    <div className="relative z-10 flex flex-col items-center justify-center min-h-full px-5 py-10 text-center max-w-xl mx-auto w-full">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-2">
        <p className="font-mono text-[9px] tracking-[6px] uppercase text-fire-3/40 mb-3">{L.step}</p>
        <h2 className="heading-fire text-[clamp(28px,6vw,52px)] font-black leading-none mb-3 whitespace-pre-line">
          {L.title}
        </h2>
        <p className="font-rajdhani text-base text-white/50 max-w-sm mx-auto">{L.sub}</p>
      </motion.div>

      <div className="w-full space-y-3 my-6">
        {SOCIALS.map((social, i) => (
          <motion.div
            key={social.id}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="w-full"
          >
            {confirmed[social.id] ? (
              /* Confirmed state */
              <div
                className={`w-full flex items-center justify-between px-4 py-3 border border-green-500/40 bg-green-500/10 opacity-70`}
                style={{ clipPath: 'polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)' }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{social.icon}</span>
                  <div className="text-left">
                    <div className="font-orbitron font-bold text-sm tracking-[1px] text-green-400">{social.label}</div>
                    <div className="font-mono text-[10px] text-green-400/60">{social.handle}</div>
                  </div>
                </div>
                <span className="font-mono text-[10px] text-green-400 flex items-center gap-1">
                  <Check size={14} /> {L.followed}
                </span>
              </div>
            ) : opened[social.id] ? (
              /* Opened — needs confirmation */
              <div className={`border ${social.color} overflow-hidden`} style={{ clipPath: 'polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)' }}>
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{social.icon}</span>
                    <div className="text-left">
                      <div className="font-orbitron font-bold text-sm tracking-[1px]">{social.label}</div>
                      <div className="font-mono text-[10px] opacity-60">{social.handle}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleOpen(social)}
                    className="font-mono text-[9px] opacity-50 underline"
                  >
                    <ExternalLink size={11} className="inline mr-1" />{L.follow}
                  </button>
                </div>
                <button
                  onClick={() => handleConfirm(social.id)}
                  className="w-full py-2.5 bg-white/5 border-t border-white/10 font-orbitron text-[10px] tracking-[2px] text-green-400 hover:bg-green-500/15 transition-all"
                >
                  {L.confirm}
                </button>
              </div>
            ) : (
              /* Default — not yet opened */
              <button
                onClick={() => handleOpen(social)}
                className={`w-full flex items-center justify-between px-4 py-3.5 border transition-all hover:opacity-90 hover:scale-[1.01] active:scale-[0.99] ${social.color}`}
                style={{ clipPath: 'polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)' }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{social.icon}</span>
                  <div className="text-left">
                    <div className="font-orbitron font-bold text-sm tracking-[1px]">{social.label}</div>
                    <div className="font-mono text-[10px] opacity-60">{social.handle}</div>
                  </div>
                </div>
                <span className="flex items-center gap-1 font-mono text-[10px] opacity-60">
                  <ExternalLink size={12} /> {L.follow}
                </span>
              </button>
            )}
          </motion.div>
        ))}
      </div>

      {/* Progress */}
      <div className="flex gap-2 mb-6">
        {SOCIALS.map(s => (
          <div key={s.id} className={`w-8 h-1 transition-all duration-500 ${confirmed[s.id] ? 'bg-fire-3' : opened[s.id] ? 'bg-fire-3/40' : 'bg-white/10'}`} />
        ))}
      </div>

      <motion.div animate={{ opacity: allDone ? 1 : 0.3 }}>
        <button
          onClick={allDone ? onNext : undefined}
          disabled={!allDone}
          className={`btn-fire text-[12px] tracking-[3px] px-10 py-3.5 transition-all ${!allDone ? 'cursor-not-allowed opacity-30' : ''}`}
        >
          {allDone ? L.continue : (
            <span className="flex items-center gap-2">
              <Lock size={13} />
              {doneCount}/{SOCIALS.length} {L.locked}
            </span>
          )}
        </button>
      </motion.div>

      {!allDone && (
        <p className="font-mono text-[9px] text-white/20 mt-3 tracking-[1px]">{L.hint}</p>
      )}
    </div>
  );
}