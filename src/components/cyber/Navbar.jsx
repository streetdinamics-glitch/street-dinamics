import React, { useState, useEffect, Suspense } from 'react';
import { Menu, X, User, Star, ChevronDown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslation } from '../translations';
import WalletConnectButton from '../web3/WalletConnectButton';
import WatchlistPanel from '../watchlist/WatchlistPanel';
import NotificationDashboard from '../notifications/NotificationDashboard';
import { Bell } from 'lucide-react';

const SD_LOGO = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69b2e24ee21bc949528cccdd/5d1be983b_photo_2026-03-11_15-56-46.jpg";

export default function Navbar({ onScrollTo, lang, onLangSwitch, onProfileClick }) {
  const t = useTranslation(lang);
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [time, setTime] = useState('');
  const [watchlistOpen, setWatchlistOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', user?.email],
    queryFn: () => base44.entities.Notification.filter({ user_email: user.email }, '-created_date', 50),
    enabled: !!user,
    initialData: [],
    refetchInterval: 30000,
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString('en-US', { hour12: false }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { label: t('nav_events'), id: 'events' },
    { label: t('nav_bet'), id: 'gamification' },
    { label: t('nav_social'), id: 'social' },
  ];

  const infoLinks = [
    { label: '🃏 ' + (t('nav_how_it_works') || 'Come Funziona'), path: '/come-funziona' },
    { label: '🏆 ' + (t('nav_disciplines') || 'Discipline'), path: '/discipline' },
    { label: '📋 ' + (t('nav_event_format') || 'Formato Evento'), path: '/formato-evento' },
    { label: '👑 ' + (t('nav_window_challenge') || 'Window Challenge'), path: '/window-challenge' },
    { label: '📊 ' + (t('nav_scarcity') || 'Scarsità & Investimento'), path: '/scarsita' },
  ];
  
  const navLinks = user?.role === 'athlete' || user?.role === 'admin' ? [
    { label: `📊 ${t('nav_analytics')}`, path: '/Analytics' },
    { label: `💎 ${t('nav_nft_portfolio')}`, path: '/NFTDashboard' },
    { label: `⛓️ ${t('nav_web3')}`, path: '/Web3' },
  ] : [];

  const userNavLinks = user ? [
    { label: `💎 ${t('nav_nft_portfolio')}`, path: '/NFTDashboard' },
    { label: `⛓️ ${t('nav_web3')}`, path: '/Web3' },
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

        <div className="hidden md:flex items-center gap-1">
          {/* Explore Dropdown */}
          <div className="relative group">
            <button className="flex items-center gap-1.5 font-orbitron text-[9px] font-semibold tracking-[2px] uppercase bg-transparent border border-fire-3/20 text-fire-3/40 px-3 py-1.5 cursor-pointer transition-all hover:border-fire-3 hover:text-fire-4 hover:bg-fire-3/5 clip-btn whitespace-nowrap group-hover:border-fire-3 group-hover:text-fire-4 group-hover:bg-fire-3/5">
              {t('nav_explore')}
              <ChevronDown size={10} className="transition-transform group-hover:rotate-180" />
            </button>
            <div className="absolute top-full left-0 mt-1 w-56 bg-black/95 border border-fire-3/30 clip-cyber opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[300]">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => { onScrollTo?.(item.id); }}
                  className="w-full text-left px-4 py-2.5 font-rajdhani text-sm text-fire-3/70 hover:bg-fire-3/10 hover:text-fire-3 transition-colors border-b border-fire-3/10"
                >
                  {item.label}
                </button>
              ))}
              <div className="px-3 py-1.5 font-mono text-[8px] tracking-[1px] uppercase text-fire-3/30 border-b border-fire-3/10">INFO</div>
              {infoLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="w-full text-left px-4 py-2 font-rajdhani text-sm text-fire-3/60 hover:bg-fire-3/10 hover:text-fire-3 transition-colors border-b border-fire-3/10 last:border-b-0 no-underline block"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="h-5 w-[1px] bg-fire-3/20" />

          {/* Tools Dropdown */}
          <div className="relative group">
            <button className="flex items-center gap-1.5 font-orbitron text-[9px] font-semibold tracking-[2px] uppercase bg-transparent border border-fire-3/20 text-fire-3/40 px-3 py-1.5 cursor-pointer transition-all hover:border-fire-3 hover:text-fire-4 hover:bg-fire-3/5 clip-btn whitespace-nowrap group-hover:border-fire-3 group-hover:text-fire-4 group-hover:bg-fire-3/5">
              {t('nav_tools')}
              <ChevronDown size={10} className="transition-transform group-hover:rotate-180" />
            </button>
            <div className="absolute top-full left-0 mt-1 w-48 bg-black/95 border border-fire-3/30 clip-cyber opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[300]">
              <div className="px-3 py-2 font-mono text-[9px] tracking-[1px] uppercase text-fire-3/40 border-b border-fire-3/10">{t('nav_language')}</div>
              <div className="p-2">
                <LanguageSwitcher currentLang={lang} onSwitch={onLangSwitch} />
              </div>
            </div>
          </div>

          {user && (
            <>
              <div className="h-5 w-[1px] bg-fire-3/20" />

              {/* Account Dropdown */}
              <div className="relative group">
                <button className="flex items-center gap-1.5 font-orbitron text-[9px] font-semibold tracking-[2px] uppercase bg-transparent border border-fire-3/20 text-fire-3/40 px-3 py-1.5 cursor-pointer transition-all hover:border-fire-3 hover:text-fire-4 hover:bg-fire-3/5 clip-btn group-hover:border-fire-3 group-hover:text-fire-4 group-hover:bg-fire-3/5">
                  <User size={12} />
                  {t('nav_account')}
                  <ChevronDown size={10} className="transition-transform group-hover:rotate-180" />
                </button>
                <div className="absolute top-full right-0 mt-1 w-56 bg-black/95 border border-fire-3/30 clip-cyber opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[300]">
                 <Link
                   to={user?.role === 'admin' ? '/dashboard-admin' : user?.role === 'athlete' ? '/dashboard-atleta' : '/dashboard-fan'}
                   className="w-full text-left px-4 py-2.5 font-rajdhani text-sm text-fire-5 hover:bg-fire-3/15 hover:text-fire-5 transition-colors border-b border-fire-3/20 no-underline block font-bold"
                 >
                   🏠 Dashboard
                 </Link>
                 <Link
                   to="/UserProfile"
                   className="w-full text-left px-4 py-2.5 font-rajdhani text-sm text-fire-3/70 hover:bg-fire-3/10 hover:text-fire-3 transition-colors border-b border-fire-3/10 no-underline block"
                 >
                   👤 {t('nav_my_profile')}
                 </Link>
                  <button
                    onClick={() => setWatchlistOpen(true)}
                    className="w-full text-left px-4 py-2.5 font-rajdhani text-sm text-fire-3/70 hover:bg-fire-3/10 hover:text-fire-3 transition-colors border-b border-fire-3/10"
                  >
                    ⭐ {t('nav_watchlist')}
                  </button>
                  <button
                    onClick={() => setNotificationsOpen(true)}
                    className="w-full text-left px-4 py-2.5 font-rajdhani text-sm text-fire-3/70 hover:bg-fire-3/10 hover:text-fire-3 transition-colors border-b border-fire-3/10 relative"
                  >
                    🔔 {t('nav_notifications')}
                    {unreadCount > 0 && (
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 px-2 py-0.5 bg-fire-3 text-black text-[9px] font-bold rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                  {(user?.role === 'admin' ? navLinks : userNavLinks).map(link => (
                    <Link
                      key={link.path}
                      to={createPageUrl(link.path.replace('/', ''))}
                      className="w-full text-left px-4 py-2.5 font-rajdhani text-sm text-cyan/70 hover:bg-cyan/10 hover:text-cyan transition-colors border-b border-fire-3/10 no-underline block"
                    >
                      {link.label}
                    </Link>
                  ))}
                  {user.role === 'admin' && (
                    <Link
                      to={createPageUrl('Admin')}
                      className="w-full text-left px-4 py-2.5 font-rajdhani text-sm text-green-400/70 hover:bg-green-500/10 hover:text-green-400 transition-colors no-underline block"
                    >
                      🔧 {t('nav_admin')}
                      </Link>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          {user && (
            <>
              <button onClick={() => navigate('/UserProfile')} className="p-2 border border-fire-3/20 bg-transparent hover:bg-fire-3/5 transition-all">
                <User size={16} className="text-fire-3" />
              </button>
              <button
                onClick={() => setWatchlistOpen(true)}
                className="p-2 border border-fire-3/20 bg-transparent hover:bg-fire-3/5 transition-all"
              >
                <Star size={16} className="text-fire-3" />
              </button>
              <button
                onClick={() => setNotificationsOpen(true)}
                className="p-2 border border-fire-3/20 bg-transparent hover:bg-fire-3/5 transition-all relative"
              >
                <Bell size={16} className="text-fire-3" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-fire-3 text-black text-[8px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            </>
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
              <div className="font-mono text-[9px] tracking-[2px] uppercase text-fire-3/40 mb-2 px-2">{t('nav_navigation')}</div>
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

            {/* Info Pages */}
            <div className="mb-4">
              <div className="font-mono text-[9px] tracking-[2px] uppercase text-fire-3/40 mb-2 px-2">INFO</div>
              {infoLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="font-orbitron text-sm font-bold tracking-[1px] uppercase bg-gradient-to-r from-fire-3/10 to-transparent border-l-2 border-fire-3/40 text-fire-4 py-3 px-4 text-left transition-all hover:border-fire-3 hover:from-fire-3/20 hover:text-fire-5 w-full no-underline block mb-2"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Wallet & Language Section */}
            <div className="mb-4">
              <div className="font-mono text-[9px] tracking-[2px] uppercase text-fire-3/40 mb-2 px-2">{t('nav_settings')}</div>
              <div className="bg-fire-3/5 border border-fire-3/20 p-3">
                <div className="font-mono text-[9px] tracking-[1px] uppercase text-fire-3/60 mb-2">{t('nav_language')}</div>
                <LanguageSwitcher currentLang={lang} onSwitch={onLangSwitch} />
              </div>
            </div>

            {/* User Actions Section */}
            {user && (
              <div className="mb-4">
                <div className="font-mono text-[9px] tracking-[2px] uppercase text-fire-3/40 mb-2 px-2">{t('nav_account')}</div>
                <Link
                  to={user?.role === 'admin' ? '/dashboard-admin' : user?.role === 'athlete' ? '/dashboard-atleta' : '/dashboard-fan'}
                  className="font-orbitron text-sm font-bold tracking-[1px] uppercase bg-gradient-to-r from-fire-5/15 to-transparent border-l-2 border-fire-5/60 text-fire-5 py-3 px-4 text-left transition-all hover:border-fire-5 hover:from-fire-5/25 w-full no-underline block mb-2"
                  onClick={() => setMobileOpen(false)}
                >
                  🏠 Dashboard
                </Link>
                <Link
                  to="/UserProfile"
                  className="font-orbitron text-sm font-bold tracking-[1px] uppercase bg-gradient-to-r from-fire-3/10 to-transparent border-l-2 border-fire-3/40 text-fire-4 py-3 px-4 text-left transition-all hover:border-fire-3 hover:from-fire-3/20 w-full no-underline block mb-2"
                  onClick={() => setMobileOpen(false)}
                >
                  👤 {t('nav_my_profile')}
                </Link>
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
                    🔧 {t('nav_admin')}
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
          <Suspense fallback={null}>
            <WatchlistPanel lang={lang} onClose={() => setWatchlistOpen(false)} />
          </Suspense>
        </>
      )}

      {/* Notification Dashboard */}
      {notificationsOpen && (
        <NotificationDashboard onClose={() => setNotificationsOpen(false)} />
      )}
    </>
  );
}