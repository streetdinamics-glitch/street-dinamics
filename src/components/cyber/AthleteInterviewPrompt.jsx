import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function AthleteInterviewPrompt({ registration, event, onClose }) {
  const whatsappLink = base44.agents.getWhatsAppConnectURL('athlete_secretary');

  return (
    <div className="fixed inset-0 z-[510] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-[550px] bg-gradient-to-br from-[rgba(10,4,18,0.99)] to-[rgba(4,2,8,1)] border border-fire-3/20 clip-cyber p-8"
      >
        <div className="absolute top-0 left-0 right-0 fire-line" />
        
        <button
          onClick={onClose}
          className="absolute top-3 right-4 font-mono text-xs text-fire-3/30 hover:text-fire-3"
        >
          <X size={18} />
        </button>

        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-cyan/20 to-cyan/10 border border-cyan/30 flex items-center justify-center"
          >
            <MessageSquare size={36} className="text-cyan" />
          </motion.div>

          <h2 className="text-fire-gradient font-orbitron font-black text-2xl tracking-[2px] mb-2 uppercase">
            AI Secretary Interview
          </h2>
          <p className="font-mono text-[11px] tracking-[4px] uppercase text-fire-3/30 mb-4">
            Final Step: Registration Approval
          </p>
        </div>

        <div className="bg-cyan/5 border border-cyan/15 p-5 mb-6">
          <h3 className="font-orbitron font-bold text-sm text-cyan mb-3 tracking-[1px] uppercase">
            What to Expect
          </h3>
          <ul className="space-y-2 font-rajdhani text-sm text-fire-4/60">
            <li className="flex items-start gap-2">
              <span className="text-cyan mt-0.5">•</span>
              <span>Quick 5-minute interview via WhatsApp</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan mt-0.5">•</span>
              <span>Questions about your experience and commitment</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan mt-0.5">•</span>
              <span>Instant approval decision from AI Secretary</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan mt-0.5">•</span>
              <span>If approved: Receive event WhatsApp channel link</span>
            </li>
          </ul>
        </div>

        <div className="bg-fire-3/5 border border-fire-3/10 p-4 mb-6">
          <div className="font-mono text-[9px] text-fire-3/40 tracking-[2px] uppercase mb-2">
            Your Application
          </div>
          <div className="space-y-1 font-rajdhani text-sm text-fire-4/50">
            <div><strong>Event:</strong> {event?.title}</div>
            <div><strong>Name:</strong> {registration?.first_name} {registration?.last_name}</div>
            <div><strong>Sport:</strong> {registration?.sport}</div>
          </div>
        </div>

        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-fire w-full text-[11px] py-3.5 flex items-center justify-center gap-2 no-underline"
        >
          <MessageSquare size={16} />
          START INTERVIEW ON WHATSAPP
        </a>

        <p className="font-mono text-[8px] text-fire-3/30 text-center mt-4 leading-relaxed">
          The AI Secretary will guide you through the process. Be honest and enthusiastic!
        </p>
      </motion.div>
    </div>
  );
}