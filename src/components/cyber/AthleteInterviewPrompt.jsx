import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, X, CheckCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const STEPS = [
  { icon: '🎯', label: 'Confirm your sport discipline' },
  { icon: '🎥', label: 'Send a video proof (min 1 minute)' },
  { icon: '🏷️', label: 'Team name or competition nickname' },
  { icon: '✅', label: 'Instant approval decision' },
];

export default function AthleteInterviewPrompt({ registration, event, onClose }) {
  const whatsappLink = base44.agents.getWhatsAppConnectURL('athlete_secretary');

  return (
    <div className="fixed inset-0 z-[510] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-[520px] bg-gradient-to-br from-[rgba(10,4,18,0.99)] to-[rgba(4,2,8,1)] border border-fire-3/20 clip-cyber p-7"
      >
        <div className="absolute top-0 left-0 right-0 fire-line" />

        <button onClick={onClose} className="absolute top-3 right-4 text-fire-3/30 hover:text-fire-3 transition-colors">
          <X size={18} />
        </button>

        {/* Header */}
        <div className="text-center mb-5">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-green-500/20 to-green-500/10 border border-green-500/30 flex items-center justify-center text-3xl"
          >
            💬
          </motion.div>
          <h2 className="text-fire-gradient font-orbitron font-black text-xl tracking-[2px] mb-1 uppercase">
            AI Secretary Interview
          </h2>
          <p className="font-mono text-[10px] tracking-[4px] uppercase text-fire-3/30">
            Athlete Verification · WhatsApp
          </p>
        </div>

        {/* Application summary */}
        <div className="bg-fire-3/5 border border-fire-3/15 p-3 mb-4 grid grid-cols-3 gap-2 text-center">
          {[
            { label: 'Event', value: event?.title || '—' },
            { label: 'Athlete', value: `${registration?.first_name || ''} ${registration?.last_name || ''}`.trim() || '—' },
            { label: 'Sport', value: registration?.sport || '—' },
          ].map(item => (
            <div key={item.label}>
              <div className="font-mono text-[8px] text-fire-3/30 uppercase tracking-[1px]">{item.label}</div>
              <div className="font-rajdhani text-sm text-fire-4 font-semibold truncate">{item.value}</div>
            </div>
          ))}
        </div>

        {/* Steps */}
        <div className="border border-white/5 bg-white/2 p-4 mb-5 space-y-2">
          <p className="font-mono text-[9px] tracking-[3px] uppercase text-white/30 mb-3">Interview steps</p>
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-base w-6 text-center">{s.icon}</span>
              <span className="font-rajdhani text-sm text-white/60">{s.label}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3.5 bg-green-600 hover:bg-green-500 text-white font-orbitron text-[11px] tracking-[2px] uppercase transition-all no-underline mb-3"
          style={{ clipPath: 'polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)' }}
        >
          <MessageSquare size={15} />
          OPEN WHATSAPP INTERVIEW
        </a>

        <p className="font-mono text-[8px] text-fire-3/25 text-center leading-relaxed">
          The AI Secretary will guide you step-by-step. Have your video ready before starting.
        </p>
      </motion.div>
    </div>
  );
}