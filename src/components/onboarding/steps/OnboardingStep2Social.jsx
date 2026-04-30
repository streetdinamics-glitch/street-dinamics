import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Check, Lock } from 'lucide-react';

const SOCIALS = [
  {
    id: 'instagram',
    label: 'Instagram',
    handle: '@streetdinamics',
    followUrl: 'https://www.instagram.com/streetdinamics/',
    icon: '📸',
    accent: '#E1306C',
  },
  {
    id: 'tiktok',
    label: 'TikTok',
    handle: '@streetdinamics',
    followUrl: 'https://tiktok.com/@streetdinamics',
    icon: '🎵',
    accent: '#ee1d52',
  },
  {
    id: 'youtube',
    label: 'YouTube',
    handle: '@StreetDinamics',
    followUrl: 'https://youtube.com/@StreetDinamics',
    icon: '▶️',
    accent: '#FF0000',
  },
  {
    id: 'kick',
    label: 'Kick',
    handle: 'kick.com/streetdinamics',
    followUrl: 'https://kick.com/streetdinamics',
    icon: '🟢',
    accent: '#53fc18',
  },
  {
    id: 'spotify',
    label: 'Spotify',
    handle: 'SD Talks Podcast',
    followUrl: 'https://open.spotify.com/show/streetdinamics',
    icon: '🎧',
    accent: '#1DB954',
  },
];

const LABELS = {
  it: {
    step: 'STEP 1 DI 4',
    title: 'ENTRA NELLA\nCOMMUNITY',
    sub: 'Segui tutti gli account — non si salta.',
    hint: 'Clicca "Segui", poi torna qui e conferma.',
    follow: 'Segui',
    followed: 'Seguito ✓',
    locked: 'confermati',
    continue: 'Continua →',
    confirm: '✓ Ho seguito — Confermo',
    openAgain: 'Riapri',
  },
  en: {
    step: 'STEP 1 OF 4',
    title: 'JOIN THE\nCOMMUNITY',
    sub: 'Follow all accounts — no skipping.',
    hint: 'Click Follow, then come back here and confirm.',
    follow: 'Follow',
    followed: 'Followed ✓',
    locked: 'confirmed',
    continue: 'Continue →',
    confirm: '✓ I followed — Confirm',
    openAgain: 'Open again',
  },
  es: {
    step: 'PASO 1 DE 4',
    title: 'ÚNETE A LA\nCOMUNIDAD',
    sub: 'Sigue todas las cuentas — sin saltar.',
    hint: 'Haz clic en Seguir, luego vuelve y confirma.',
    follow: 'Seguir',
    followed: 'Siguiendo ✓',
    locked: 'confirmados',
    continue: 'Continuar →',
    confirm: '✓ Seguí — Confirmar',
    openAgain: 'Abrir de nuevo',
  },
  fr: {
    step: 'ÉTAPE 1 SUR 4',
    title: 'REJOINS LA\nCOMMUNAUTÉ',
    sub: 'Suis tous les comptes — sans sauter.',
    hint: 'Clique Suivre, puis reviens et confirme.',
    follow: 'Suivre',
    followed: 'Suivi ✓',
    locked: 'confirmés',
    continue: 'Continuer →',
    confirm: '✓ J\'ai suivi — Confirmer',
    openAgain: 'Ouvrir à nouveau',
  },
  ar: {
    step: 'الخطوة 1 من 4',
    title: 'انضم إلى\nالمجتمع',
    sub: 'تابع جميع الحسابات — لا تقفز.',
    hint: 'انقر متابعة، ثم ارجع وأكد.',
    follow: 'متابعة',
    followed: 'تمت المتابعة ✓',
    locked: 'مؤكد',
    continue: 'استمر →',
    confirm: '✓ تابعت — تأكيد',
    openAgain: 'افتح مجدداً',
  },
  de: {
    step: 'SCHRITT 1 VON 4',
    title: 'TRITT DER\nCOMMUNITY BEI',
    sub: 'Folge allen Konten — kein Überspringen.',
    hint: 'Klicke Folgen, komm zurück und bestätige.',
    follow: 'Folgen',
    followed: 'Gefolgt ✓',
    locked: 'bestätigt',
    continue: 'Weiter →',
    confirm: '✓ Gefolgt — Bestätigen',
    openAgain: 'Erneut öffnen',
  },
};

export default function OnboardingStep2Social({ onNext, lang = 'it' }) {
  const L = LABELS[lang] || LABELS.it;
  const [opened, setOpened] = useState({});
  const [confirmed, setConfirmed] = useState({});

  const allDone = SOCIALS.every(s => confirmed[s.id]);
  const doneCount = SOCIALS.filter(s => confirmed[s.id]).length;

  const handleOpen = (social) => {
    window.open(social.followUrl, '_blank', 'noopener,noreferrer');
    setTimeout(() => setOpened(prev => ({ ...prev, [social.id]: true })), 600);
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

      {/* Progress bar */}
      <div className="w-full max-w-sm my-4">
        <div className="flex justify-between font-mono text-[9px] text-fire-3/40 mb-1">
          <span>{doneCount}/{SOCIALS.length} {L.locked}</span>
          <span>{Math.round((doneCount / SOCIALS.length) * 100)}%</span>
        </div>
        <div className="h-1 bg-white/5 w-full">
          <div
            className="h-full bg-gradient-to-r from-fire-3 to-fire-5 transition-all duration-500"
            style={{ width: `${(doneCount / SOCIALS.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="w-full space-y-2.5 my-4">
        {SOCIALS.map((social, i) => (
          <motion.div
            key={social.id}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.07 }}
            className="w-full"
          >
            {confirmed[social.id] ? (
              /* Confirmed */
              <div
                className="w-full flex items-center justify-between px-4 py-3 border border-green-500/40 bg-green-500/8 opacity-75"
                style={{ clipPath: 'polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)' }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{social.icon}</span>
                  <span className="font-orbitron font-bold text-sm tracking-[1px] text-green-400">{social.label}</span>
                  <span className="font-mono text-[10px] text-green-400/50">{social.handle}</span>
                </div>
                <span className="font-mono text-[10px] text-green-400 flex items-center gap-1">
                  <Check size={13} /> {L.followed}
                </span>
              </div>
            ) : opened[social.id] ? (
              /* Opened — awaiting confirm */
              <div
                className="w-full border border-fire-3/30 bg-[rgba(6,2,10,0.95)] overflow-hidden"
                style={{ clipPath: 'polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)' }}
              >
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{social.icon}</span>
                    <div className="text-left">
                      <div className="font-orbitron font-bold text-sm tracking-[1px] text-fire-4">{social.label}</div>
                      <div className="font-mono text-[10px] text-white/30">{social.handle}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleOpen(social)}
                    className="font-mono text-[8px] text-white/30 underline flex items-center gap-1"
                  >
                    <ExternalLink size={10} /> {L.openAgain}
                  </button>
                </div>
                <button
                  onClick={() => handleConfirm(social.id)}
                  className="w-full py-2.5 bg-fire-3/10 border-t border-fire-3/20 font-orbitron text-[10px] tracking-[2px] text-fire-4 hover:bg-fire-3/20 transition-all"
                >
                  {L.confirm}
                </button>
              </div>
            ) : (
              /* Default */
              <button
                onClick={() => handleOpen(social)}
                className="w-full flex items-center justify-between px-4 py-3.5 border border-fire-3/15 bg-[rgba(6,2,10,0.8)] hover:border-fire-3/40 hover:bg-fire-3/5 transition-all active:scale-[0.99]"
                style={{ clipPath: 'polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)' }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{social.icon}</span>
                  <div className="text-left">
                    <div className="font-orbitron font-bold text-sm tracking-[1px] text-fire-4">{social.label}</div>
                    <div className="font-mono text-[10px] text-white/30">{social.handle}</div>
                  </div>
                </div>
                <span
                  className="flex items-center gap-1.5 font-orbitron text-[9px] tracking-[1px] px-3 py-1.5"
                  style={{ color: social.accent, border: `1px solid ${social.accent}44`, clipPath: 'polygon(4px 0%, 100% 0%, calc(100% - 4px) 100%, 0% 100%)' }}
                >
                  <ExternalLink size={11} /> {L.follow}
                </span>
              </button>
            )}
          </motion.div>
        ))}
      </div>

      <p className="font-mono text-[9px] text-white/20 mb-5 tracking-[1px]">{L.hint}</p>

      <motion.div animate={{ opacity: allDone ? 1 : 0.35 }}>
        <button
          onClick={allDone ? onNext : undefined}
          disabled={!allDone}
          className={`btn-fire text-[12px] tracking-[3px] px-10 py-3.5 transition-all ${!allDone ? 'cursor-not-allowed' : ''}`}
        >
          {allDone ? L.continue : (
            <span className="flex items-center gap-2">
              <Lock size={13} />
              {doneCount}/{SOCIALS.length} {L.locked}
            </span>
          )}
        </button>
      </motion.div>
    </div>
  );
}