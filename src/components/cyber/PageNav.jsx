import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';

/**
 * Percorso canonico del sistema SD.
 * Ogni pagina informativa conosce il suo posto nella sequenza.
 */
const PATH = [
  { path: '/come-funziona',   label: 'IL PATTO',         icon: '🃏' },
  { path: '/discipline',      label: 'LE DISCIPLINE',    icon: '⚔️' },
  { path: '/formato-evento',  label: 'IL FORMATO',       icon: '🗓️' },
  { path: '/window-challenge',label: 'WINDOW CHALLENGE', icon: '👑' },
  { path: '/scarsita',        label: 'LA MATEMATICA',    icon: '📊' },
];

export default function PageNav({ currentPath }) {
  const idx = PATH.findIndex(p => p.path === currentPath);
  const prev = idx > 0 ? PATH[idx - 1] : null;
  const next = idx < PATH.length - 1 ? PATH[idx + 1] : null;

  return (
    <div className="relative z-10 border-t border-fire-3/10 mt-16">
      {/* Progress bar */}
      <div className="h-[2px] bg-white/5">
        <div
          className="h-full bg-gradient-to-r from-fire-3 to-fire-5 transition-all duration-700"
          style={{ width: `${((idx + 1) / PATH.length) * 100}%` }}
        />
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 flex items-center justify-between gap-4">
        {/* Prev */}
        {prev ? (
          <Link
            to={prev.path}
            className="group flex items-center gap-3 border border-fire-3/20 bg-fire-3/5 hover:border-fire-3/60 hover:bg-fire-3/10 transition-all px-4 py-3 no-underline"
            style={{ clipPath: 'polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)' }}
          >
            <ArrowLeft size={14} className="text-fire-3/50 group-hover:text-fire-3 transition-colors" />
            <div>
              <div className="font-mono text-[8px] uppercase tracking-[2px] text-fire-3/30 mb-0.5">Precedente</div>
              <div className="font-orbitron text-xs font-bold text-fire-4 group-hover:text-fire-5 transition-colors">
                {prev.icon} {prev.label}
              </div>
            </div>
          </Link>
        ) : (
          <Link
            to="/Home"
            className="group flex items-center gap-3 border border-white/10 hover:border-fire-3/40 transition-all px-4 py-3 no-underline"
            style={{ clipPath: 'polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)' }}
          >
            <ArrowLeft size={14} className="text-white/20 group-hover:text-fire-3 transition-colors" />
            <div className="font-orbitron text-xs font-bold text-white/30 group-hover:text-fire-4 transition-colors">
              ← HOME
            </div>
          </Link>
        )}

        {/* Step indicator */}
        <div className="flex items-center gap-2">
          {PATH.map((p, i) => (
            <Link key={p.path} to={p.path} title={p.label}>
              <div className={`w-1.5 h-1.5 rounded-full transition-all ${
                i === idx ? 'bg-fire-3 scale-150' :
                i < idx ? 'bg-fire-3/40' : 'bg-white/10'
              }`} />
            </Link>
          ))}
        </div>

        {/* Next */}
        {next ? (
          <Link
            to={next.path}
            className="group flex items-center gap-3 border border-fire-3/30 bg-fire-3/8 hover:border-fire-3 hover:bg-fire-3/15 transition-all px-4 py-3 no-underline"
            style={{ clipPath: 'polygon(0% 0%, calc(100% - 8px) 0%, 100% 100%, 8px 100%)' }}
          >
            <div className="text-right">
              <div className="font-mono text-[8px] uppercase tracking-[2px] text-fire-3/40 mb-0.5">Prossimo</div>
              <div className="font-orbitron text-xs font-bold text-fire-4 group-hover:text-fire-5 transition-colors">
                {next.icon} {next.label}
              </div>
            </div>
            <ArrowRight size={14} className="text-fire-3/50 group-hover:text-fire-3 transition-colors" />
          </Link>
        ) : (
          <Link
            to="/Home"
            className="group flex items-center gap-3 border border-fire-5/30 bg-fire-5/5 hover:border-fire-5 hover:bg-fire-5/15 transition-all px-5 py-3 no-underline"
            style={{ clipPath: 'polygon(0% 0%, calc(100% - 8px) 0%, 100% 100%, 8px 100%)' }}
          >
            <div className="text-right">
              <div className="font-mono text-[8px] uppercase tracking-[2px] text-fire-5/40 mb-0.5">Sei pronto</div>
              <div className="font-orbitron text-xs font-bold text-fire-5 group-hover:text-fire-6 transition-colors">
                ⚡ ENTRA NEL SISTEMA
              </div>
            </div>
            <ArrowRight size={14} className="text-fire-5/50 group-hover:text-fire-5 transition-colors" />
          </Link>
        )}
      </div>
    </div>
  );
}