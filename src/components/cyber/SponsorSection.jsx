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

        <p className="font-rajdhani text-base text-fire-4/50 leading-relaxed mb-5">
          Multi-platform visibility • Live event activation • NFT integration • Authentic Gen-Z engagement • Online streaming & IRL events worldwide
        </p>

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