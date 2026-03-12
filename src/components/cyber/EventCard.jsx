import React from 'react';
import { format } from 'date-fns';

export default function EventCard({ event, index, onRegisterAthlete, onRegisterSpectator }) {
  const filled = event.filled_spots || 0;
  const max = event.max_spots || 32;
  const pct = Math.min((filled / max) * 100, 100);

  const statusBadge = () => {
    if (event.status === 'live') return (
      <div className="font-mono text-[8px] tracking-[3px] uppercase text-red-500 bg-red-500/10 border border-red-500/30 px-2.5 py-0.5 inline-flex items-center gap-1.5 mb-2">
        <span style={{ animation: 'blink 1s ease-in-out infinite' }}>●</span> LIVE NOW
      </div>
    );
    if (event.status === 'ended') return (
      <div className="font-mono text-[8px] tracking-[3px] uppercase text-purple-400 bg-purple-500/10 border border-purple-500/25 px-2.5 py-0.5 inline-block mb-2">
        📼 ENDED
      </div>
    );
    return null;
  };

  return (
    <div className="opacity-0 animate-[fadeUp_0.7s_ease_forwards]" style={{ animationDelay: `${index * 0.12}s` }}>
      <div className="event-card-shell group">
        {/* Top fire line */}
        <div className="absolute top-0 left-0 right-0 fire-line" style={{ animationDelay: `${-index}s` }} />
        {/* Corner cut accent */}
        <div className="absolute top-0 right-0 w-4 h-4 bg-gradient-to-bl from-fire-4 to-fire-2" style={{ clipPath: 'polygon(100% 0,100% 100%,0 0)' }} />
        {/* Scan line on hover */}
        <div className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyber-cyan/30 to-transparent top-[-100%] group-hover:animate-[card-scan_1.5s_ease-in-out_infinite] pointer-events-none" />

        <div className="p-5 relative z-[1] flex flex-col min-h-[380px]">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 font-mono text-[9px] tracking-[3px] uppercase text-fire-3 border border-fire-3/25 bg-fire-3/5 px-2.5 py-1 mb-3 self-start clip-btn">
            <div className="w-1.5 h-1.5 rounded-full bg-fire-3 shadow-[0_0_5px_var(--fire-3)]" style={{ animation: 'blink 2s ease-in-out infinite' }} />
            {event.sport || 'STREET SPORT'}
          </div>

          {statusBadge()}

          {/* Title */}
          <h3 className="font-orbitron font-extrabold text-[clamp(16px,2.6vw,26px)] leading-tight tracking-[1px] text-fire-6/90 mb-1">
            {event.title}
          </h3>

          {/* Date */}
          <p className="font-mono text-[13px] tracking-[2px] text-fire-5 mb-3">
            {event.date ? format(new Date(event.date), 'dd MMM yyyy').toUpperCase() : 'TBA'}
          </p>

          <div className="h-[1px] bg-gradient-to-r from-fire-2/40 to-fire-2/5 mb-3" />

          {/* Location */}
          <p className="text-sm font-semibold tracking-[1.5px] uppercase text-fire-4/60 mb-2.5">
            📍 {event.location}
          </p>

          {/* Description */}
          <p className="text-base font-normal leading-relaxed text-fire-4/35 flex-grow mb-3.5">
            {event.description}
          </p>

          {/* Spots bar */}
          <div className="mb-4">
            <div className="flex justify-between font-mono text-[11px] tracking-[2px] uppercase text-fire-3/30 mb-1.5">
              <span>SPOTS</span>
              <span>{filled} / {max}</span>
            </div>
            <div className="h-[2px] bg-fire-3/10 relative">
              <div
                className="h-full bg-gradient-to-r from-fire-2 to-fire-5 relative transition-all duration-1000"
                style={{ width: `${pct}%` }}
              >
                <div className="absolute right-[-4px] top-[-4px] w-2.5 h-2.5 rounded-full bg-fire-6 shadow-[0_0_10px_var(--fire-5)]" style={{ animation: 'spot-pulse 2s ease-in-out infinite' }} />
              </div>
            </div>
          </div>

          {/* Buttons */}
          {event.status !== 'ended' && (
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => onRegisterAthlete?.(event)} className="btn-fire text-[10px] py-2.5 px-2">
                🔥 ATHLETE
              </button>
              <button onClick={() => onRegisterSpectator?.(event)} className="btn-ghost text-[10px] py-2.5 px-2">
                👁 SPECTATOR
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}