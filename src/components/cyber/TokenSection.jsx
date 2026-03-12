import React from 'react';
import { useTranslation } from '../translations';

export default function TokenSection({ lang, onScrollToSocial }) {
  const t = useTranslation(lang);

  return (
    <section id="tokens" className="section-container">
      <p className="font-mono text-[10px] tracking-[7px] uppercase text-fire-3 text-center mb-2">{t('tokens_subtitle')}</p>
      <h2 className="heading-fire text-[clamp(36px,7vw,88px)] text-center leading-none mb-14 font-black">{t('tokens_title')}</h2>

      <div className="max-w-[860px] mx-auto text-center mb-10">
        <p className="font-rajdhani text-lg text-fire-4/60 leading-relaxed mb-6">
          {t('tokens_intro')}
        </p>
        <div className="bg-gradient-to-br from-cyber-cyan/5 to-cyber-purple/5 border border-cyber-cyan/15 p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyber-cyan to-transparent fire-line" />
          <div className="font-orbitron font-black text-sm tracking-[4px] uppercase text-cyber-cyan mb-4">
            🎫 {t('tokens_title')}
          </div>
          <p className="font-rajdhani text-base text-fire-4/50 mb-6 leading-relaxed">
            {t('tokens_soon')}
          </p>
          <button onClick={onScrollToSocial} className="btn-cyan text-[9px] px-5 py-2.5">
            {t('tokens_cta')}
          </button>
        </div>
      </div>
    </section>
  );
}