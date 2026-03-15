import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

function pad(n) { return String(n).padStart(2, '0'); }

export default function EventCountdown({ date, compact = false }) {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    if (!date) return;
    const target = new Date(date).getTime();

    const calc = () => {
      const diff = target - Date.now();
      if (diff <= 0) { setTimeLeft(null); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft({ d, h, m, s, diff });
    };

    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [date]);

  if (!timeLeft) return null;

  if (compact) {
    return (
      <span className="flex items-center gap-1 font-mono text-[9px] text-fire-4/70 tracking-[1px]">
        <Clock size={9} className="text-fire-3" />
        {timeLeft.d > 0 ? `${timeLeft.d}d ` : ''}{pad(timeLeft.h)}:{pad(timeLeft.m)}:{pad(timeLeft.s)}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <Clock size={11} className="text-fire-3/60 flex-shrink-0" />
      {timeLeft.d > 0 && (
        <Seg value={timeLeft.d} label="D" />
      )}
      <Seg value={timeLeft.h} label="H" />
      <span className="font-mono text-fire-3/40 text-xs">:</span>
      <Seg value={timeLeft.m} label="M" />
      <span className="font-mono text-fire-3/40 text-xs">:</span>
      <Seg value={timeLeft.s} label="S" />
    </div>
  );
}

function Seg({ value, label }) {
  return (
    <div className="flex flex-col items-center">
      <span className="font-orbitron font-bold text-xs text-fire-5 leading-none">{pad(value)}</span>
      <span className="font-mono text-[7px] text-fire-3/30 tracking-[1px]">{label}</span>
    </div>
  );
}