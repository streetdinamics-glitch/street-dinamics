import React from 'react';

export default function LanguageSwitcher({ currentLang, onSwitch }) {
  return (
    <div className="flex items-center gap-1 border border-fire-3/20 bg-fire-3/5">
      <button
        onClick={() => onSwitch('en')}
        className={`font-orbitron text-[9px] font-bold tracking-[1px] px-2.5 py-1 transition-all ${
          currentLang === 'en' 
            ? 'bg-fire-3 text-black' 
            : 'bg-transparent text-fire-3/40 hover:text-fire-3'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => onSwitch('it')}
        className={`font-orbitron text-[9px] font-bold tracking-[1px] px-2.5 py-1 transition-all ${
          currentLang === 'it' 
            ? 'bg-fire-3 text-black' 
            : 'bg-transparent text-fire-3/40 hover:text-fire-3'
        }`}
      >
        IT
      </button>
    </div>
  );
}