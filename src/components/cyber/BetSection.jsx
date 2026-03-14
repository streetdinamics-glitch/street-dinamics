import React from 'react';
import { useTranslation } from '../translations';

export default function BetSection({ hasToken, onScrollToTokens, onScrollToSocial, lang }) {
  const t = useTranslation(lang);

  if (!hasToken) {
    return (
      <section id="gamification" className="section-container">
        <p className="font-mono text-[9px] tracking-[6px] uppercase text-fire-3/40 text-center mb-3.5">{t('bet_subtitle')}</p>
        <h2 className="text-fire-gradient font-orbitron font-black text-[clamp(28px,5vw,56px)] tracking-[3px] text-center mb-8 leading-tight">{t('bet_title')}</h2>

        {/* Locked */}
        <div className="flex flex-col items-center justify-center text-center py-10 px-5 max-w-[600px] mx-auto">
          <div className="w-20 h-20 mb-4 rounded-full border-4 border-fire-3/30 flex items-center justify-center">
            <div className="w-8 h-10 border-4 border-fire-3 rounded-md relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-6 h-6 border-4 border-fire-3 rounded-full" />
            </div>
          </div>
          <div className="font-orbitron font-black text-lg tracking-[3px] uppercase text-fire-4 mb-2.5">{t('bet_locked_title')}</div>
          <div className="font-rajdhani text-base text-fire-4/50 mb-6 leading-relaxed">
            {t('bet_locked_msg')}
          </div>
          <button onClick={onScrollToTokens} className="btn-fire text-[11px] py-3 px-6 mb-3">{t('bet_locked_cta')}</button>
        </div>

        {/* Spectator alternative */}
        <div className="max-w-[700px] mx-auto bg-gradient-to-br from-purple-500/5 to-fire-3/5 border border-purple-500/20 p-6 text-center">
          <div className="font-orbitron font-black text-sm tracking-[3px] uppercase text-purple-300 mb-2">{t('social_rewards_title')}</div>
          <div className="font-rajdhani text-base text-fire-4/60 leading-relaxed mb-4">
            {t('social_rewards_msg')}
          </div>
          <div className="font-mono text-sm text-fire-4/40 mb-5 whitespace-pre-line leading-loose">
            {t('social_rewards_list')}
          </div>
          <button onClick={onScrollToSocial} className="btn-ghost text-[10px] py-2.5 px-5">{t('social_rewards_cta')}</button>
        </div>
      </section>
    );
  }

  return (
    <section id="gamification" className="section-container">
      <p className="font-mono text-[9px] tracking-[6px] uppercase text-fire-3/40 text-center mb-3.5">{t('bet_subtitle')}</p>
      <h2 className="text-fire-gradient font-orbitron font-black text-[clamp(28px,5vw,56px)] tracking-[3px] text-center mb-8 leading-tight">{t('bet_title')}</h2>

      <div className="max-w-[1060px] mx-auto mb-12">
        <div className="flex items-baseline justify-between mb-4 border-b border-cyber-cyan/10 pb-3">
          <div className="font-orbitron font-extrabold text-[13px] tracking-[3px] uppercase text-cyber-cyan">{t('bet_my_bets')}</div>
        </div>
        <div className="text-center py-10">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full border-2 border-fire-3/20 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-fire-3/10 border-2 border-fire-3/40" />
          </div>
          <div className="font-mono text-xs tracking-[2px] text-fire-3/30 leading-loose">
            {t('bet_empty')}
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-stretch gap-0 max-w-[1060px] mx-auto mb-7">
        {[t('bet_how_1'), t('bet_how_2'), t('bet_how_3'), t('bet_how_4')].map((step, i) => (
          <React.Fragment key={i}>
            <div className="flex-1 p-5 bg-black/30 border border-fire-3/10">
              <div className="font-orbitron font-black text-xl text-fire-3/25 mb-2">0{i + 1}</div>
              <div className="font-rajdhani text-[15px] text-fire-4/50 leading-relaxed">{step}</div>
            </div>
            {i < 3 && <div className="hidden md:flex items-center px-2 font-orbitron text-lg text-fire-3/20">→</div>}
          </React.Fragment>
        ))}
      </div>

      <div className="max-w-[860px] mx-auto font-mono text-[11px] tracking-[1px] text-white/15 text-center leading-loose p-4 border border-dashed border-white/5">
        {t('bet_disclaimer')}
      </div>
    </section>
  );
}