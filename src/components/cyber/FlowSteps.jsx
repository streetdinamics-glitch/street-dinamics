import React from 'react';
import { useTranslation } from '../../components/translations';

export default function FlowSteps({ lang }) {
  const t = useTranslation(lang);
  
  const steps = [
    { label: t('reg_step_info'), num: 1 },
    { label: 'GDPR', num: 2 },
    { label: t('reg_step_contract'), num: 3 },
    { label: t('reg_step_signature'), num: 4 },
  ];

  return (
    <div className="flex justify-center items-center gap-0 mb-12 flex-wrap">
      {steps.map((step, i) => (
        <div key={step.num} className="flex items-center">
          <div className="flex items-center gap-2 px-3 py-2">
            <div className="w-7 h-7 rounded-full border border-fire-3/30 bg-fire-3/5 flex items-center justify-center font-orbitron text-xs font-bold text-fire-4/40">
              {step.num}
            </div>
            <span className="font-mono text-[10px] tracking-[2px] uppercase text-fire-3/30">{step.label}</span>
          </div>
          {i < steps.length - 1 && <div className="text-fire-3/20 hidden sm:inline">→</div>}
        </div>
      ))}
    </div>
  );
}