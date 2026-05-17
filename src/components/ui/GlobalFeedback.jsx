import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Info, Loader2 } from 'lucide-react';

// Spinner centralizzato riusabile
export function CyberSpinner({ size = 'md', text = '' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' };
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-8">
      <div className={`${sizes[size]} border-2 border-fire-3/20 border-t-fire-3 rounded-full animate-spin`} />
      {text && <p className="font-mono text-[9px] tracking-[2px] uppercase text-fire-3/40">{text}</p>}
    </div>
  );
}

// Empty state
export function CyberEmpty({ icon = '🔥', title = 'Nessun dato', subtitle = '', action = null }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <span className="text-4xl block mb-3">{icon}</span>
      <p className="font-orbitron text-sm font-bold text-fire-3/40 tracking-[2px] uppercase mb-1">{title}</p>
      {subtitle && <p className="font-rajdhani text-sm text-white/20 mb-4">{subtitle}</p>}
      {action && (
        <button onClick={action.onClick} className="btn-fire text-[10px] tracking-[2px] mt-2">
          {action.label}
        </button>
      )}
    </div>
  );
}

// Inline alert banner
export function CyberAlert({ type = 'info', message, onDismiss }) {
  const configs = {
    success: { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30' },
    error: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
    warning: { icon: AlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
    info: { icon: Info, color: 'text-cyan/70', bg: 'bg-cyan/5', border: 'border-cyan/20' },
  };
  const cfg = configs[type] || configs.info;
  const Icon = cfg.icon;

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className={`flex items-start gap-3 px-4 py-3 ${cfg.bg} border ${cfg.border}`}
        >
          <Icon size={14} className={`${cfg.color} mt-0.5 flex-shrink-0`} />
          <p className={`font-rajdhani text-sm ${cfg.color} flex-1`}>{message}</p>
          {onDismiss && (
            <button onClick={onDismiss} className={`${cfg.color} opacity-50 hover:opacity-100 text-sm leading-none`}>✕</button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Page loading overlay
export function CyberPageLoader({ text = 'Caricamento...' }) {
  return (
    <div className="fixed inset-0 z-[9998] bg-black/80 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-2 border-fire-3/20 border-t-fire-3 rounded-full animate-spin" />
        <p className="font-mono text-[10px] tracking-[4px] uppercase text-fire-3/50">{text}</p>
      </div>
    </div>
  );
}