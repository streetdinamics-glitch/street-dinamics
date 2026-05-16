import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BellOff, X } from 'lucide-react';

const DISMISSED_KEY = 'sd_push_banner_dismissed';

export default function PushPermissionBanner({ onRequestPermission, permission }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (permission === 'granted' || permission === 'denied') return;
    const dismissed = localStorage.getItem(DISMISSED_KEY);
    if (!dismissed) {
      // Show after 3s delay so it doesn't interrupt page load
      const t = setTimeout(() => setVisible(true), 3000);
      return () => clearTimeout(t);
    }
  }, [permission]);

  const handleAccept = async () => {
    const granted = await onRequestPermission();
    setVisible(false);
    if (!granted) localStorage.setItem(DISMISSED_KEY, '1');
  };

  const handleDismiss = () => {
    setVisible(false);
    localStorage.setItem(DISMISSED_KEY, '1');
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 60 }}
          transition={{ type: 'spring', damping: 20 }}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9000] w-[calc(100%-2rem)] max-w-md"
        >
          <div
            className="relative bg-[rgba(6,2,12,0.97)] border border-fire-3/30 px-5 py-4"
            style={{ clipPath: 'polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))' }}
          >
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-fire-3 to-transparent opacity-60" />

            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 text-white/20 hover:text-white/50 transition-colors"
            >
              <X size={14} />
            </button>

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-fire-3/15 border border-fire-3/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bell size={16} className="text-fire-4" />
              </div>
              <div className="flex-1 pr-4">
                <p className="font-orbitron font-bold text-[11px] tracking-[1px] text-fire-5 mb-1">
                  ATTIVA LE NOTIFICHE PUSH
                </p>
                <p className="font-rajdhani text-sm text-white/50 leading-relaxed mb-3">
                  Ricevi avvisi istantanei quando la tua verifica atleta viene approvata o quando esce un nuovo evento.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleAccept}
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-fire-3/20 border border-fire-3/40 text-fire-4 font-orbitron text-[9px] tracking-[1px] uppercase hover:bg-fire-3/35 transition-all"
                    style={{ clipPath: 'polygon(4px 0%, 100% 0%, calc(100% - 4px) 100%, 0% 100%)' }}
                  >
                    <Bell size={11} />
                    Attiva
                  </button>
                  <button
                    onClick={handleDismiss}
                    className="flex items-center gap-1.5 px-4 py-1.5 border border-white/10 text-white/30 font-orbitron text-[9px] tracking-[1px] uppercase hover:border-white/20 hover:text-white/40 transition-all"
                    style={{ clipPath: 'polygon(4px 0%, 100% 0%, calc(100% - 4px) 100%, 0% 100%)' }}
                  >
                    <BellOff size={11} />
                    No grazie
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}