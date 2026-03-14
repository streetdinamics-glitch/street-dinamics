import React from 'react';

export default function LanguageSwitcher({ currentLang, onSwitch }) {
  const langs = [
    { code: 'en', label: 'EN' },
    { code: 'it', label: 'IT' },
    { code: 'es', label: 'ES' },
    { code: 'fr', label: 'FR' },
    { code: 'de', label: 'DE' },
    { code: 'ar', label: 'AR' },
  ];

  return (
    <div className="flex items-center border border-fire-3/20 bg-fire-3/5 overflow-hidden">
      {langs.map(lang => (
        <button
          key={lang.code}
          onClick={() => onSwitch(lang.code)}
          className={`font-orbitron text-[9px] font-bold tracking-[1px] px-2.5 py-1.5 transition-all border-r border-fire-3/10 last:border-r-0 ${
            currentLang === lang.code
              ? 'bg-fire-3 text-black'
              : 'bg-transparent text-fire-3/40 hover:text-fire-3 hover:bg-fire-3/10'
          }`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}