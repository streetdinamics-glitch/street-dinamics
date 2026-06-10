import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

/**
 * Barra di contesto universale: torna indietro + shortcut alle sezioni principali.
 * Usata nelle pagine secondarie per evitare vicoli ciechi.
 */
const QUICK_LINKS = [
  { to: '/Home',          label: '⚡ Home' },
  { to: '/NFTDashboard',  label: '💎 Wallet' },
  { to: '/marketplace',   label: '🛒 Market' },
  { to: '/UserProfile',   label: '👤 Profilo' },
];

export default function BackBar({ label }) {
  const navigate = useNavigate();

  return (
    <div className="relative z-10 border-b border-fire-3/10 bg-[rgba(4,2,10,0.7)] backdrop-blur-sm">
      <div className="max-w-[1400px] mx-auto px-4 h-10 flex items-center justify-between gap-4">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[2px] text-fire-3/40 hover:text-fire-3 transition-colors shrink-0"
        >
          <ArrowLeft size={12} />
          {label || 'Indietro'}
        </button>

        {/* Quick nav */}
        <div className="hidden sm:flex items-center gap-1 overflow-x-auto">
          {QUICK_LINKS.map(l => (
            <Link
              key={l.to}
              to={l.to}
              className="font-mono text-[8px] uppercase tracking-[1px] text-white/20 hover:text-fire-3 px-2 py-1 border border-transparent hover:border-fire-3/20 transition-all no-underline whitespace-nowrap"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}