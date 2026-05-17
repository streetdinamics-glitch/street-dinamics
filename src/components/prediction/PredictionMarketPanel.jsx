import React from 'react';
import { useTranslation } from '../translations';
import SDPredictionHub from './SDPredictionHub';

export default function PredictionMarketPanel({ lang = 'it' }) {
  const t = useTranslation(lang);

  return (
    <div className="mb-8">
      {/* Section header */}
      <div className="mb-5">
        <p className="font-mono text-[9px] tracking-[5px] uppercase text-fire-3/40">PILLAR II</p>
        <h3 className="font-orbitron font-black text-xl text-fire-4 mt-0.5">{t('wag_p2_title')}</h3>
        <p className="font-rajdhani text-sm text-white/40 mt-1">{t('wag_p2_trade')}</p>
      </div>

      {/* Panel content */}
      <div className="border border-fire-3/12 bg-gradient-to-br from-[rgba(10,4,18,0.97)] to-[rgba(4,2,8,1)] p-5"
        style={{ clipPath: 'polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))' }}>
        <SDPredictionHub />
      </div>
    </div>
  );
}