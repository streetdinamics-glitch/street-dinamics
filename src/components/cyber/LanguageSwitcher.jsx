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
    <div className="flex items-center gap-1 border border-fire-3/20 bg-fire-3/5 flex-wrap">
      {langs.map(lang => (
        <button
          key={lang.code}
          onClick={() => onSwitch(lang.code)}
          className={`font-orbitron text-[9px] font-bold tracking-[1px] px-2 py-1 transition-all ${
            currentLang === lang.code
              ? 'bg-fire-3 text-black'
              : 'bg-transparent text-fire-3/40 hover:text-fire-3'
          }`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}