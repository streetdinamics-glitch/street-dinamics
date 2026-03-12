import React from 'react';
import { useTranslation } from '../translations';

const links = [
  { icon: '📸', label: 'social_instagram', url: 'https://instagram.com/streetdinamics' },
  { icon: '🎵', label: 'social_tiktok', url: 'https://tiktok.com/@streetdinamics' },
  { icon: '▶️', label: 'social_youtube', url: 'https://youtube.com/@streetdinamics' },
  { icon: '🟢', label: 'social_kick', url: 'https://kick.com/streetdinamics' },
  { icon: '👻', label: 'social_snapchat', url: 'https://snapchat.com/add/streetdinamics' },
];

export default function SocialLinksModal({ onClose, lang }) {
  const t = useTranslation(lang);

  return (
    <div className="fixed inset-0 z-[600] bg-black/95 backdrop-blur-xl flex items-center justify-center p-5">
      <div className="relative bg-gradient-to-br from-[rgba(10,4,18,0.99)] to-[rgba(4,2,8,1)] border border-fire-3/20 clip-cyber p-8 md:p-10 max-w-[460px] w-full text-center">
        <div className="absolute top-0 left-0 right-0 fire-line" />
        <div className="absolute top-0 right-0 w-[22px] h-[22px] bg-gradient-to-bl from-fire-5 to-fire-2" style={{ clipPath: 'polygon(100% 0,100% 100%,0 0)' }} />

        <button onClick={onClose} className="absolute top-3 right-4 font-mono text-[10px] tracking-[2px] text-fire-3/30 hover:text-fire-3 cursor-pointer bg-transparent border-none">{t('reg_close')}</button>

        <div className="font-orbitron font-black text-xl tracking-[3px] text-fire-gradient mb-0.5">{t('social_modal_title')}</div>
        <div className="font-mono text-[9px] tracking-[4px] uppercase text-fire-3/30 mb-6">{t('social_modal_subtitle')}</div>

        <div className="flex flex-col gap-2.5">
          {links.map(link => (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-fire-3/5 border border-fire-3/15 py-3 px-4 font-rajdhani font-bold text-[17px] tracking-[2px] uppercase text-fire-4/60 no-underline transition-all hover:bg-fire-3/15 hover:border-fire-3 hover:text-fire-5 hover:translate-x-1 clip-btn"
            >
              <span className="text-lg w-[26px] text-center">{link.icon}</span>
              <span className="flex-1 text-left">{t(link.label)}</span>
              <span className="text-fire-3 opacity-60 text-[13px]">→</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}