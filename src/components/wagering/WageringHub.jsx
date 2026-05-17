import React from 'react';
import { Shield } from 'lucide-react';
import { useTranslation } from '../translations';

export default function WageringHub({ lang = 'it' }) {
  const t = useTranslation(lang);

  return (
    <div className="mb-8">
      {/* Section header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="font-mono text-[9px] tracking-[5px] uppercase text-fire-3/40">PILLAR I</p>
          <h3 className="font-orbitron font-black text-xl text-fire-4 mt-0.5">{t('wag_p1_title')}</h3>
          <p className="font-rajdhani text-sm text-white/40 mt-1">{t('wag_p1_desc')}</p>
        </div>
        <div className="flex items-center gap-2 font-mono text-[8px] text-white/25 border border-white/8 px-3 py-2">
          <Shield size={11} className="text-fire-3/60" />
          {t('wag_p1_sub')}
        </div>
      </div>

      {/* Coming Soon Banner */}
      <div className="mb-6 px-5 py-5 border border-fire-3/20 bg-fire-3/5 text-center"
        style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))' }}>
        <p className="font-orbitron text-sm text-fire-4 mb-1">🚧 COMING SOON</p>
        <p className="font-rajdhani text-sm text-white/40">Il sistema P2P Wagering sarà disponibile al lancio ufficiale della piattaforma.</p>
      </div>

      {/* How it works */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-0">
        {[
          { n: '01', title: t('wag_step1_t'), d: t('wag_step1_d') },
          { n: '02', title: t('wag_step2_t'), d: t('wag_step2_d') },
          { n: '03', title: t('wag_step3_t'), d: t('wag_step3_d') },
          { n: '04', title: t('wag_step4_t'), d: t('wag_step4_d') },
        ].map((s, i) => (
          <div key={i} className="flex-1 p-4 bg-black/30 border border-fire-3/8 border-r-0 last:border-r">
            <div className="font-orbitron font-black text-xl text-fire-3/15 mb-1">{s.n}</div>
            <div className="font-orbitron text-xs text-fire-4/60 mb-1">{s.title}</div>
            <div className="font-rajdhani text-xs text-white/30">{s.d}</div>
          </div>
        ))}
      </div>
    </div>
  );
}