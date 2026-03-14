import React from 'react';
import { useTranslation } from '../../components/translations';

export default function SponsorSection({ lang }) {
  const t = useTranslation(lang);

  return (
    <section id="sponsor" className="section-container">
      <p className="font-mono text-[10px] tracking-[7px] uppercase text-fire-3 text-center mb-2">{t('sponsor_subtitle')}</p>
      <h2 className="heading-fire text-[clamp(36px,7vw,88px)] text-center leading-none mb-14 font-black">{t('sponsor_title')}</h2>

      <div className="max-w-[860px] mx-auto bg-gradient-to-br from-[rgba(10,4,18,0.97)] to-[rgba(4,2,8,0.99)] border border-fire-3/18 clip-cyber p-8 md:p-10 relative">
        <div className="absolute top-0 left-0 right-0 fire-line" />
        <div className="absolute top-0 right-0 w-[18px] h-[18px] bg-gradient-to-bl from-fire-5 to-fire-2" style={{ clipPath: 'polygon(100% 0,100% 100%,0 0)' }} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-fire-3/5 border border-fire-3/10">
            <div className="font-orbitron font-bold text-3xl text-fire-4 mb-1">13-30</div>
            <div className="font-mono text-xs text-fire-3/40 tracking-[1px]">High-Value Youth Demographics</div>
          </div>
          <div className="p-4 bg-fire-3/5 border border-fire-3/10">
            <div className="font-orbitron font-bold text-2xl text-fire-4 mb-1">ONLINE & IRL</div>
            <div className="font-mono text-xs text-fire-3/40 tracking-[1px]">Multiplatform Presence</div>
          </div>
          <div className="p-4 bg-fire-3/5 border border-fire-3/10">
            <div className="font-orbitron font-bold text-3xl text-fire-4 mb-1">GLOBAL</div>
            <div className="font-mono text-xs text-fire-3/40 tracking-[1px]">Worldwide Presence</div>
          </div>
        </div>

        <div className="mb-6 space-y-3">
          <div className="flex items-start gap-3 p-3 bg-fire-3/10 border-l-2 border-fire-3">
            <span className="text-fire-3 text-lg">⚡</span>
            <div>
              <h4 className="font-orbitron font-bold text-sm text-fire-4 mb-1">MULTI-PLATFORM VISIBILITY</h4>
              <p className="font-rajdhani text-sm text-fire-4/60">Brand exposure across live events, digital streams, and social media channels</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-fire-3/10 border-l-2 border-fire-3">
            <span className="text-fire-3 text-lg">🎯</span>
            <div>
              <h4 className="font-orbitron font-bold text-sm text-fire-4 mb-1">DIRECT YOUTH ENGAGEMENT</h4>
              <p className="font-rajdhani text-sm text-fire-4/60">Authentic connection with 13-30 year-old athletes and fans who drive culture</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-fire-3/10 border-l-2 border-fire-3">
            <span className="text-fire-3 text-lg">🌍</span>
            <div>
              <h4 className="font-orbitron font-bold text-sm text-fire-4 mb-1">GLOBAL REACH</h4>
              <p className="font-rajdhani text-sm text-fire-4/60">Presence in UAE, Europe, and expanding international markets with high engagement</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-fire-3/10 border-l-2 border-fire-3">
            <span className="text-fire-3 text-lg">💎</span>
            <div>
              <h4 className="font-orbitron font-bold text-sm text-fire-4 mb-1">NFT & TOKEN INTEGRATION</h4>
              <p className="font-rajdhani text-sm text-fire-4/60">Innovative digital assets that keep your brand at the forefront of Web3 culture</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <span className="font-mono text-sm text-fire-3/30">→</span>
          <a href={`mailto:${t('sponsor_cta')}`} className="font-orbitron font-bold text-base text-fire-4 hover:text-fire-5 transition-colors no-underline">
            {t('sponsor_cta')}
          </a>
        </div>

        <p className="font-mono text-xs text-fire-3/25 tracking-[1px] leading-loose">
          {t('sponsor_note')}
        </p>
      </div>
    </section>
  );
}