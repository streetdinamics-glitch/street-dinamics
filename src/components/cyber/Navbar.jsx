import React, { useState, useEffect } from 'react';
import { Menu, X, User, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslation } from '../translations';
import WalletConnectButton from '../web3/WalletConnectButton';

const SD_LOGO = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69b2e24ee21bc949528cccdd/5d1be983b_photo_2026-03-11_15-56-46.jpg";

export default function Navbar({ onScrollTo, lang, onLangSwitch, onProfileClick }) {
  const t = useTranslation(lang);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [time, setTime] = useState('');
  const [watchlistOpen, setWatchlistOpen] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString('en-US', { hour12: false }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { label: t('nav_events'), id: 'events' },
    { label: t('nav_tokens'), id: 'tokens' },
    { label: t('nav_bet'), id: 'gamification' },
    { label: t('nav_social'), id: 'social' },
  ];
  
  const navLinks = user?.role === 'athlete' || user?.role === 'admin' ? [
    { label: '📊 Analytics', path: '/Analytics' },
    { label: '💎 NFT Portfolio', path: '/NFTDashboard' },
  ] : [];

  const userNavLinks = user ? [
    { label: '💎 NFT Portfolio', path: '/NFTDashboard' },
  ] : [];

  return (
    <>
      {/* Main Nav */}
      <nav className="fixed top-0 left-0 right-0 z-[200] h-[58px] flex items-center justify-between px-4 md:px-9 bg-[rgba(4,2,10,0.92)] border-b border-fire-3/20 backdrop-blur-md">
        <div className="absolute bottom-[-1px] left-0 right-0 h-[1px] fire-line" />
        
        <img
          src={SD_LOGO}
          alt="Street Dinamics"
          className="h-[42px] w-[42px] object-cover rounded-md cursor-pointer drop-shadow-[0_0_12px_rgba(255,100,0,0.9)] hover:drop-shadow-[0_0_20px_rgba(255,150,0,1)] transition-all"
          onClick={() => onScrollTo?.('hero')}
        />

        <div className="hidden lg:block absolute left-1/2 -translate-x-1/2 font-orbitron text-[11px] font-bold tracking-[6px] text-fire-3/30 uppercase">
          STREET<span className="text-fire-3">//</span>DINAMICS
        </div>

        <div className="hidden md:flex items-center gap-2">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => onScrollTo?.(item.id)}
              className="font-orbitron text-[9px] font-semibold tracking-[2px] uppercase bg-transparent border border-fire-3/20 text-fire-3/40 px-3 py-1.5 cursor-pointer transition-all hover:border-fire-3 hover:text-fire-4 hover:bg-fire-3/5 clip-btn whitespace-nowrap"
            >
              {item.label}
            </button>
          ))}
          <div className="h-5 w-[1px] bg-fire-3/20" />
          <WalletConnectButton minimal={true} />
          <LanguageSwitcher currentLang={lang} onSwitch={onLangSwitch} />
          {user && (
            <button
              onClick={() => setWatchlistOpen(true)}
              className="flex items-center gap-1.5 font-orbitron text-[9px] font-semibold tracking-[2px] uppercase bg-transparent border border-fire-3/20 text-fire-3/40 px-3 py-1.5 cursor-pointer transition-all hover:border-fire-3 hover:text-fire-4 hover:bg-fire-3/5 clip-btn"
            >
              <Star size={12} />
              WATCHLIST
            </button>
          )}
          {user && (
            <>
              <div className="h-5 w-[1px] bg-fire-3/20" />
              <button
                onClick={onProfileClick}
                className="flex items-center gap-1.5 font-orbitron text-[9px] font-semibold tracking-[2px] uppercase bg-transparent border border-fire-3/20 text-fire-3/40 px-3 py-1.5 cursor-pointer transition-all hover:border-fire-3 hover:text-fire-4 hover:bg-fire-3/5 clip-btn whitespace-nowrap"
              >
                <User size={12} />
                PROFILE
              </button>
              {(user?.role === 'admin' ? navLinks : userNavLinks).map(link => (
                <Link
                  key={link.path}
                  to={createPageUrl(link.path.replace('/', ''))}
                  className="font-orbitron text-[9px] font-semibold tracking-[2px] uppercase bg-transparent border border-fire-3/20 text-fire-3/40 px-3 py-1.5 cursor-pointer transition-all hover:border-fire-3 hover:text-fire-4 hover:bg-fire-3/5 clip-btn no-underline flex items-center whitespace-nowrap"
                >
                  {link.label}
                </Link>
              ))}
              {user.role === 'admin' && (
                <Link
                  to={createPageUrl('Admin')}
                  className="font-orbitron text-[9px] font-semibold tracking-[2px] uppercase bg-transparent border border-green-500/40 text-green-400 px-3 py-1.5 cursor-pointer transition-all hover:border-green-500 hover:bg-green-500/5 clip-btn no-underline flex items-center whitespace-nowrap"
                >
                  ADMIN
                </Link>
              )}
            </>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          {user && (
            <button onClick={onProfileClick} className="p-2 border border-fire-3/20 bg-transparent hover:bg-fire-3/5 transition-all">
              <User size={16} className="text-fire-3" />
            </button>
          )}
          <button
            className="p-2 border border-fire-3/20 bg-transparent hover:bg-fire-3/5 transition-all"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={16} className="text-fire-3" /> : <Menu size={16} className="text-fire-3" />}
          </button>
        </div>
      </nav>

      {/* HUD Bar */}
      <div className="fixed top-[58px] left-0 right-0 z-[199] h-[22px] bg-[rgba(4,2,10,0.85)] border-b border-fire-3/10 flex items-center px-4 md:px-9 gap-6 font-mono text-[9px] tracking-[2px] text-fire-3/30 uppercase">
        <div className="flex items-center gap-1.5">
          <div className="w-1 h-1 rounded-full bg-fire-3" style={{ animation: 'blink 2s ease-in-out infinite' }} />
          <span className="text-fire-3">{t('hud_system')}</span>
        </div>
        <span className="hidden sm:inline">{t('hud_ai')}</span>
        <span className="ml-auto text-fire-4/40">{time}</span>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="fixed top-[80px] left-0 right-0 bottom-0 z-[198] bg-black/95 backdrop-blur-xl md:hidden overflow-y-auto">
          <div className="p-4 space-y-3">
            {/* Navigation Section */}
            <div className="mb-4">
              <div className="font-mono text-[9px] tracking-[2px] uppercase text-fire-3/40 mb-2 px-2">Navigation</div>
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => { onScrollTo?.(item.id); setMobileOpen(false); }}
                  className="font-orbitron text-sm font-bold tracking-[1px] uppercase bg-gradient-to-r from-fire-3/10 to-transparent border-l-2 border-fire-3/40 text-fire-4 py-3 px-4 text-left transition-all hover:border-fire-3 hover:from-fire-3/20 hover:text-fire-5 w-full mb-2"
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Wallet & Language Section */}
            <div className="mb-4">
              <div className="font-mono text-[9px] tracking-[2px] uppercase text-fire-3/40 mb-2 px-2">Settings</div>
              <div className="bg-fire-3/5 border border-fire-3/20 p-3 mb-2">
                <div className="font-mono text-[9px] tracking-[1px] uppercase text-fire-3/60 mb-2">Wallet</div>
                <WalletConnectButton minimal={false} />
              </div>
              <div className="bg-fire-3/5 border border-fire-3/20 p-3">
                <div className="font-mono text-[9px] tracking-[1px] uppercase text-fire-3/60 mb-2">Language</div>
                <LanguageSwitcher currentLang={lang} onSwitch={onLangSwitch} />
              </div>
            </div>

            {/* User Actions Section */}
            {user && (
              <div className="mb-4">
                <div className="font-mono text-[9px] tracking-[2px] uppercase text-fire-3/40 mb-2 px-2">Account</div>
                {(user?.role === 'admin' ? navLinks : userNavLinks).map(link => (
                  <Link
                    key={link.path}
                    to={createPageUrl(link.path.replace('/', ''))}
                    className="font-orbitron text-sm font-bold tracking-[1px] uppercase bg-gradient-to-r from-cyan/10 to-transparent border-l-2 border-cyan/40 text-cyan py-3 px-4 text-left transition-all hover:border-cyan hover:from-cyan/20 w-full no-underline block mb-2"
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                {user.role === 'admin' && (
                  <Link
                    to={createPageUrl('Admin')}
                    className="font-orbitron text-sm font-bold tracking-[1px] uppercase bg-gradient-to-r from-green-500/10 to-transparent border-l-2 border-green-500/40 text-green-400 py-3 px-4 text-left transition-all hover:border-green-500 hover:from-green-500/20 w-full no-underline block"
                    onClick={() => setMobileOpen(false)}
                  >
                    🔧 ADMIN PANEL
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Watchlist Modal */}
      {watchlistOpen && (
        <>
          <div
            className="fixed inset-0 z-[399] bg-black/40"
            onClick={() => setWatchlistOpen(false)}
          />
          <div className="fixed inset-0 z-[400] overflow-y-auto">
            {/* Lazy load WatchlistPanel */}
            <div className="flex items-start justify-center p-4 min-h-screen">
              <div className="w-full max-w-3xl">
                {typeof window !== 'undefined' && (
                  <React.Suspense fallback={null}>
                    {(() => {
                      const { default: WatchlistPanel } = require('@/components/watchlist/WatchlistPanel');
                      return <WatchlistPanel lang={lang} onClose={() => setWatchlistOpen(false)} />;
                    })()}
                  </React.Suspense>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}