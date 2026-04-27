import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, ChevronRight } from 'lucide-react';

export default function OnboardingStep4WhatsApp({ userData, onNext }) {
  const { nome, role, discipline, phone, isMinor } = userData;
  const isAthlete = role === 'atleta';

  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick(p => p + 1), 800);
    return () => clearInterval(t);
  }, []);

  const messages = isAthlete
    ? [
        `🏆 Ciao ${nome || 'atleta'}! Benvenuto in Street Dinamics.`,
        `Sono l'agente SD — ti seguirò da qui.`,
        `Ti faccio 4 domande veloci per completare il tuo profilo atleta.`,
        `Prima domanda: da quanti anni pratichi ${discipline || 'la tua disciplina'}?`,
      ]
    : [
        `👀 Ciao ${nome || 'fan'}! Benvenuto in Street Dinamics.`,
        `Due domande veloci e sei dentro.`,
        `Quale disciplina ti interessa seguire di più?`,
      ];

  const visibleMessages = messages.slice(0, Math.min(tick + 1, messages.length));
  const allShown = visibleMessages.length >= messages.length;

  const waLink = phone
    ? `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`SD System - Account attivato per ${nome || ''}. Attendi il messaggio dell'agente.`)}`
    : null;

  return (
    <div className="relative z-10 flex flex-col items-center justify-center min-h-full px-5 py-12 max-w-lg mx-auto w-full text-center">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <p className="font-mono text-[9px] tracking-[6px] uppercase text-fire-3/40 mb-2">STEP 3 DI 4</p>
        <h2 className="heading-fire text-[clamp(26px,5vw,46px)] font-black leading-none mb-3">
          AGENTE<br />WHATSAPP
        </h2>
        <p className="font-rajdhani text-sm text-white/40 max-w-xs mx-auto">
          Immediatamente dopo la registrazione riceverai questo messaggio su WhatsApp.
        </p>
      </motion.div>

      {/* WhatsApp chat mockup */}
      <div className="w-full max-w-sm mb-8">
        <div className="bg-[#0f1f0e] rounded-2xl overflow-hidden border border-green-500/20 shadow-[0_0_40px_rgba(0,200,0,0.1)]">
          {/* WA header */}
          <div className="bg-[#1a2f18] px-4 py-3 flex items-center gap-3 border-b border-green-500/10">
            <div className="w-8 h-8 rounded-full bg-fire-3/20 flex items-center justify-center text-sm">🔥</div>
            <div className="text-left">
              <div className="font-rajdhani font-bold text-sm text-green-400">SD Sistema</div>
              <div className="font-mono text-[9px] text-green-400/40">online</div>
            </div>
          </div>

          {/* Messages */}
          <div className="p-4 space-y-2 min-h-[140px]">
            {visibleMessages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="flex justify-start"
              >
                <div className="bg-[#1f3320] text-green-100 rounded-2xl rounded-tl-sm px-3 py-2 text-sm max-w-[85%] text-left font-rajdhani">
                  {msg}
                </div>
              </motion.div>
            ))}
            {!allShown && (
              <div className="flex gap-1 pl-1">
                {[0,1,2].map(i => (
                  <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-green-500/40"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Minor notice */}
      {isMinor && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-full max-w-sm mb-6 px-4 py-3 bg-yellow-500/10 border border-yellow-500/30 text-left"
        >
          <p className="font-mono text-[10px] text-yellow-400 leading-relaxed">
            ⚠️ <strong>Sei minorenne</strong> — invieremo un messaggio WhatsApp al numero inserito per la conferma del genitore/tutore. La registrazione si attiva solo dopo il SI via WhatsApp.
          </p>
        </motion.div>
      )}

      {/* Phone reminder */}
      {phone && (
        <p className="font-mono text-[10px] text-white/30 mb-6">
          Il messaggio arriverà al numero: <span className="text-fire-3">{phone}</span>
        </p>
      )}

      {/* Open WA button */}
      {waLink && allShown && (
        <motion.a
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-6 py-3 bg-green-600/20 border border-green-500/40 text-green-400 font-orbitron text-[11px] tracking-[2px] uppercase mb-4 hover:bg-green-600/30 transition-all"
          style={{ clipPath: 'polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)' }}
        >
          <MessageCircle size={14} />
          Apri WhatsApp
          <ChevronRight size={12} />
        </motion.a>
      )}

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: allShown ? 1 : 0.4 }}
        onClick={allShown ? onNext : undefined}
        disabled={!allShown}
        className={`btn-fire text-[12px] tracking-[3px] px-10 py-3.5 ${!allShown ? 'opacity-30 cursor-not-allowed' : ''}`}
      >
        Continua →
      </motion.button>
    </div>
  );
}