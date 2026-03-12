import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

const SD_LOGO = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 40'%3E%3Crect width='120' height='40' fill='%23000' rx='2'/%3E%3Ctext x='10' y='30' font-family='monospace' font-size='28' font-weight='bold' fill='%23ff6600'%3ESD%3C/text%3E%3C/svg%3E";

export default function Navbar({ onScrollTo }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [time, setTime] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString('en-US', { hour12: false }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { label: 'Events', id: 'events' },
    { label: '🎫 Tokens', id: 'tokens' },
    { label: '🎯 Bet', id: 'gamification' },
    { label: '🔗 Social', id: 'social' },
  ];

  return (
    <>
      {/* Main Nav */}
      <nav className="fixed top-0 left-0 right-0 z-[200] h-[58px] flex items-center justify-between px-4 md:px-9 bg-[rgba(4,2,10,0.92)] border-b border-fire-3/20 backdrop-blur-md">
        <div className="absolute bottom-[-1px] left-0 right-0 h-[1px] fire-line" />
        
        <img
          src={SD_LOGO}
          alt="SD"
          className="h-[38px] cursor-pointer drop-shadow-[0_0_8px_rgba(255,100,0,0.8)] hover:drop-shadow-[0_0_16px_rgba(255,150,0,1)] transition-all"
          onClick={() => onScrollTo?.('hero')}
        />

        <div className="hidden lg:block absolute left-1/2 -translate-x-1/2 font-orbitron text-[11px] font-bold tracking-[6px] text-fire-3/30 uppercase">
          STREET<span className="text-fire-3">//</span>DINAMICS
        </div>

        <div className="hidden md:flex items-center gap-2.5">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => onScrollTo?.(item.id)}
              className="font-orbitron text-[9px] font-semibold tracking-[2px] uppercase bg-transparent border border-fire-3/20 text-fire-3/40 px-3.5 py-1.5 cursor-pointer transition-all hover:border-fire-3 hover:text-fire-4 hover:bg-fire-3/5 clip-btn"
            >
              {item.label}
            </button>
          ))}
        </div>

        <button
          className="md:hidden flex flex-col gap-1 p-1.5 border border-fire-3/20 bg-transparent"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={18} className="text-fire-3" /> : <Menu size={18} className="text-fire-3" />}
        </button>
      </nav>

      {/* HUD Bar */}
      <div className="fixed top-[58px] left-0 right-0 z-[199] h-[22px] bg-[rgba(4,2,10,0.85)] border-b border-fire-3/10 flex items-center px-4 md:px-9 gap-6 font-mono text-[9px] tracking-[2px] text-fire-3/30 uppercase">
        <div className="flex items-center gap-1.5">
          <div className="w-1 h-1 rounded-full bg-fire-3" style={{ animation: 'blink 2s ease-in-out infinite' }} />
          <span className="text-fire-3">System Online</span>
        </div>
        <span className="hidden sm:inline">AI Secretary: Active</span>
        <span className="ml-auto text-fire-4/40">{time}</span>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="fixed top-[52px] left-0 right-0 z-[198] bg-[rgba(4,2,10,0.98)] border-b border-fire-3/20 flex flex-col p-2.5 gap-2 backdrop-blur-xl md:hidden">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => { onScrollTo?.(item.id); setMobileOpen(false); }}
              className="font-orbitron text-[10px] font-bold tracking-[2px] uppercase bg-transparent border border-fire-3/20 text-fire-3/60 py-2.5 px-3.5 text-left transition-all hover:border-fire-3 hover:text-fire-3"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </>
  );
}