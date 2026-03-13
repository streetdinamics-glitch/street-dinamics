import React from 'react';
import { useTranslation } from '../../components/translations';

export default function Footer({ lang }) {
  const t = useTranslation(lang);
  const SD_LOGO = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69b2e24ee21bc949528cccdd/5d1be983b_photo_2026-03-11_15-56-46.jpg";

  return (
    <footer className="relative z-10 text-center py-11 px-5 border-t border-fire-3/10">
      <img
        src={SD_LOGO}
        alt="Street Dinamics"
        className="w-16 h-16 object-cover rounded-lg mx-auto mb-3"
        style={{ filter: 'drop-shadow(0 0 12px rgba(255,100,0,0.5))' }}
      />
      <p className="font-mono text-[9px] tracking-[3px] uppercase text-fire-3/18 mb-2">
        {t('footer_rights')}
      </p>
      <p className="font-mono text-[8px] tracking-[2px] uppercase text-fire-3/12">
        Operated by Street Dynamics Holding FZE — IFZA Business Park, Dubai, UAE
      </p>
      <p className="font-mono text-[7px] tracking-[2px] text-fire-3/10 mt-1">
        License: [IFZA-TBD] • Global Platform • Blockchain-Powered
      </p>
    </footer>
  );
}