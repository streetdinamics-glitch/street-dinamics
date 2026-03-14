import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, MessageCircle } from 'lucide-react';

export default function VerificationComplete({ eventName, whatsappLink }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-6 text-center"
    >
      <div className="flex justify-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-cyan flex items-center justify-center"
        >
          <CheckCircle size={40} className="text-black" />
        </motion.div>
      </div>

      <div>
        <h3 className="font-orbitron font-black text-2xl text-fire-5 mb-2">
          VERIFIED ATHLETE
        </h3>
        <p className="font-mono text-[11px] tracking-[2px] uppercase text-fire-3/60">
          You've been approved to compete
        </p>
      </div>

      <div className="bg-fire-3/10 border border-fire-3/20 p-6 rounded space-y-3">
        <p className="font-rajdhani text-sm text-fire-3">
          Congratulations! Your profile has been verified through our AI secretary interview.
        </p>
        <p className="font-rajdhani text-sm text-fire-3">
          You now have exclusive access to the athlete network for <strong>{eventName}</strong>.
        </p>
      </div>

      {whatsappLink && (
        <motion.a
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-fire w-full py-3 flex items-center justify-center gap-2 text-[13px] inline-block"
        >
          <MessageCircle size={16} />
          Join WhatsApp Channel
        </motion.a>
      )}

      <div className="bg-cyan/10 border border-cyan/30 p-4 rounded">
        <p className="font-mono text-[10px] text-cyan/80 leading-relaxed">
          Next steps: Join the athlete community, complete any pre-event requirements, and start connecting with other verified athletes.
        </p>
      </div>
    </motion.div>
  );
}