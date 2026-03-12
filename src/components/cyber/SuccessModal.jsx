import React from 'react';
import { motion } from 'framer-motion';

export default function SuccessModal({ registration, onClose }) {
  const isAthlete = registration?.type === 'athlete';

  return (
    <div className="fixed inset-0 z-[500] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.96, opacity: 0, y: 24 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-[500px] bg-gradient-to-br from-[rgba(10,4,18,0.99)] to-[rgba(4,2,8,1)] border border-fire-3/20 clip-cyber p-8 text-center"
      >
        <div className="absolute top-0 left-0 right-0 fire-line" />

        <motion.span
          initial={{ scale: 0, rotate: -12 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-6xl block mb-3"
        >
          {isAthlete ? '🔥' : '🎉'}
        </motion.span>

        <h2 className="text-fire-gradient font-orbitron font-black text-2xl tracking-[3px] mb-2">
          {isAthlete ? "YOU'RE IN THE FIRE" : "SEE YOU IN THE FIRE"}
        </h2>

        <p className="text-base text-fire-4/60 mb-4 leading-relaxed">
          {isAthlete
            ? 'Registration confirmed. Check your email within 48h. The stage is yours.'
            : 'Your spot is locked in. Check your email for all details.'}
        </p>

        {registration?.ticket_code && (
          <div className="bg-black/50 border border-fire-3/15 p-4 mb-4">
            <div className="font-mono text-[9px] tracking-[2px] text-fire-3/40 mb-1">TICKET ID</div>
            <div className="font-orbitron font-bold text-lg text-fire-5 tracking-[3px]">{registration.ticket_code}</div>
            <div className="font-mono text-[9px] tracking-[2px] text-fire-3/40 mt-2 mb-1">SEAT / ZONE</div>
            <div className="font-orbitron font-bold text-2xl text-fire-gradient tracking-[2px]">{registration.seat_zone}</div>
          </div>
        )}

        <button onClick={onClose} className="btn-fire text-[13px] py-3 px-8 mt-2">
          CLOSE
        </button>
      </motion.div>
    </div>
  );
}