import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Check, Lock } from 'lucide-react';

const SOCIALS = [
  {
    id: 'tiktok',
    label: 'TikTok',
    handle: '@streetdinamics',
    url: 'https://tiktok.com/@streetdinamics',
    color: 'border-pink-500/40 bg-pink-500/10 text-pink-400',
    icon: '🎵',
  },
  {
    id: 'instagram',
    label: 'Instagram',
    handle: '@street.dinamics',
    url: 'https://instagram.com/street.dinamics',
    color: 'border-purple-500/40 bg-purple-500/10 text-purple-400',
    icon: '📸',
  },
  {
    id: 'youtube',
    label: 'YouTube',
    handle: '@StreetDinamics',
    url: 'https://youtube.com/@StreetDinamics',
    color: 'border-red-500/40 bg-red-500/10 text-red-400',
    icon: '▶️',
  },
  {
    id: 'kick',
    label: 'Kick',
    handle: 'kick.com/streetdinamics',
    url: 'https://kick.com/streetdinamics',
    color: 'border-green-500/40 bg-green-500/10 text-green-400',
    icon: '🟢',
  },
  {
    id: 'spotify',
    label: 'Spotify',
    handle: 'SD Talks Podcast',
    url: 'https://open.spotify.com/show/streetdinamics',
    color: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400',
    icon: '🎧',
  },
];

export default function OnboardingStep2Social({ onNext }) {
  const [clicked, setClicked] = useState({});

  const allDone = SOCIALS.every(s => clicked[s.id]);

  const handleClick = (social) => {
    window.open(social.url, '_blank', 'noopener,noreferrer');
    setTimeout(() => {
      setClicked(prev => ({ ...prev, [social.id]: true }));
    }, 1500);
  };

  return (
    <div className="relative z-10 flex flex-col items-center justify-center min-h-full px-5 py-12 text-center max-w-xl mx-auto w-full">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-2"
      >
        <p className="font-mono text-[9px] tracking-[6px] uppercase text-fire-3/40 mb-3">STEP 1 DI 4</p>
        <h2 className="heading-fire text-[clamp(28px,6vw,52px)] font-black leading-none mb-3">
          ENTRA NELLA<br />COMMUNITY
        </h2>
        <p className="font-rajdhani text-base text-white/50 max-w-sm mx-auto">
          Segui tutti gli account per entrare nel sistema — non si salta.
        </p>
      </motion.div>

      {/* Social list */}
      <div className="w-full space-y-3 my-8">
        {SOCIALS.map((social, i) => (
          <motion.div
            key={social.id}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <button
              onClick={() => handleClick(social)}
              className={`w-full flex items-center justify-between px-4 py-3.5 border transition-all ${social.color} ${
                clicked[social.id]
                  ? 'opacity-60 cursor-default'
                  : 'hover:opacity-90 hover:scale-[1.01] active:scale-[0.99]'
              }`}
              style={{ clipPath: 'polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)' }}
              disabled={clicked[social.id]}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{social.icon}</span>
                <div className="text-left">
                  <div className="font-orbitron font-bold text-sm tracking-[1px]">{social.label}</div>
                  <div className="font-mono text-[10px] opacity-60">{social.handle}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {clicked[social.id] ? (
                  <span className="flex items-center gap-1 font-mono text-[10px] text-green-400">
                    <Check size={14} /> Seguito
                  </span>
                ) : (
                  <span className="flex items-center gap-1 font-mono text-[10px] opacity-60">
                    <ExternalLink size={12} /> Segui
                  </span>
                )}
              </div>
            </button>
          </motion.div>
        ))}
      </div>

      {/* Progress */}
      <div className="flex gap-2 mb-6">
        {SOCIALS.map(s => (
          <div
            key={s.id}
            className={`w-8 h-1 transition-all duration-500 ${clicked[s.id] ? 'bg-fire-3' : 'bg-white/10'}`}
          />
        ))}
      </div>

      {/* CTA */}
      <motion.div animate={{ opacity: allDone ? 1 : 0.3 }}>
        <button
          onClick={allDone ? onNext : undefined}
          disabled={!allDone}
          className={`btn-fire text-[12px] tracking-[3px] px-10 py-3.5 transition-all ${
            !allDone ? 'cursor-not-allowed opacity-30' : ''
          }`}
        >
          {allDone ? 'Continua →' : (
            <span className="flex items-center gap-2">
              <Lock size={13} />
              {Object.values(clicked).filter(Boolean).length}/{SOCIALS.length} seguiti
            </span>
          )}
        </button>
      </motion.div>

      {!allDone && (
        <p className="font-mono text-[9px] text-white/20 mt-3 tracking-[1px]">
          Clicca ogni account · Aspetta il click · Continua
        </p>
      )}
    </div>
  );
}