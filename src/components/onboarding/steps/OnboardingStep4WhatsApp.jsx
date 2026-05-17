import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, ChevronRight, CheckCircle, ChevronDown } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const LABELS = {
  it: {
    step: 'STEP 3 DI 4 — WHATSAPP',
    title_athlete: 'INTERVISTA\nSD AGENT',
    title_fan: 'CONNETTITI\nALL\'AGENTE',
    sub_athlete: "L'agente SD su WhatsApp verifica il tuo profilo atleta in 2 minuti.",
    sub_fan: 'Ricevi aggiornamenti eventi e community direttamente su WhatsApp.',
    phoneReminder: 'Il tuo numero:',
    openWa_athlete: '📲 Inizia l\'Intervista',
    openWa_fan: '📲 Connettiti all\'Agente SD',
    waNote: 'Si apre WhatsApp — l\'agente risponde subito.',
    continue: 'Continua →',
    skip_fan: 'Salta per ora →',
    athleteWarning: '⚠️ Obbligatorio per gli atleti — apri WhatsApp per continuare.',
    opened: '✓ WhatsApp aperto',
    minor: '⚠️ Sei minorenne — l\'agente gestirà la verifica con consenso del genitore.',
    msgs_athlete: (name, disc) => [
      `🏆 Ciao ${name || 'atleta'}! Benvenuto in Street Dinamics.`,
      `Sono l'agente SD — ti seguirò da qui.`,
      `Ti faccio 4 domande veloci per il tuo profilo atleta.`,
      `Da quanti anni pratichi ${disc || 'la tua disciplina'}?`,
    ],
    msgs_fan: (name) => [
      `👀 Ciao ${name || 'fan'}! Benvenuto in Street Dinamics.`,
      `Sono l'agente SD — sarò il tuo punto di contatto.`,
      `Quale disciplina vuoi seguire di più?`,
    ],
  },
  en: {
    step: 'STEP 3 OF 4 — WHATSAPP',
    title_athlete: 'SD AGENT\nINTERVIEW',
    title_fan: 'CONNECT TO\nTHE AGENT',
    sub_athlete: 'The SD agent on WhatsApp verifies your athlete profile in 2 minutes.',
    sub_fan: "You'll receive event and community updates directly on WhatsApp.",
    phoneReminder: 'Your number:',
    openWa_athlete: '📲 Start Interview',
    openWa_fan: '📲 Connect to SD Agent',
    waNote: 'Opens WhatsApp — agent replies immediately.',
    continue: 'Continue →',
    skip_fan: 'Skip for now →',
    athleteWarning: '⚠️ Required for athletes — open WhatsApp to continue.',
    opened: '✓ WhatsApp opened',
    minor: '⚠️ You are a minor — the agent will handle verification with parental consent.',
    msgs_athlete: (name, disc) => [
      `🏆 Hi ${name || 'athlete'}! Welcome to Street Dinamics.`,
      `I'm the SD agent — I'll guide you from here.`,
      `4 quick questions to complete your athlete profile.`,
      `How many years have you been practicing ${disc || 'your discipline'}?`,
    ],
    msgs_fan: (name) => [
      `👀 Hi ${name || 'fan'}! Welcome to Street Dinamics.`,
      `I'm the SD agent — your main point of contact.`,
      `Which discipline do you want to follow most?`,
    ],
  },
  es: {
    step: 'PASO 3 DE 4 — WHATSAPP',
    title_athlete: 'ENTREVISTA\nAGENTE SD',
    title_fan: 'CONÉCTATE\nAL AGENTE',
    sub_athlete: 'El agente SD en WhatsApp verifica tu perfil de atleta en 2 minutos.',
    sub_fan: 'Recibirás actualizaciones de eventos directamente por WhatsApp.',
    phoneReminder: 'Tu número:',
    openWa_athlete: '📲 Iniciar Entrevista',
    openWa_fan: '📲 Conectarse al Agente',
    waNote: 'Abre WhatsApp — el agente responde inmediatamente.',
    continue: 'Continuar →',
    skip_fan: 'Saltar por ahora →',
    athleteWarning: '⚠️ Obligatorio para atletas — abre WhatsApp para continuar.',
    opened: '✓ WhatsApp abierto',
    minor: '⚠️ Eres menor — el agente gestionará la verificación parental.',
    msgs_athlete: (name, disc) => [`🏆 ¡Hola ${name || 'atleta'}!`, `Soy el agente SD.`, `4 preguntas rápidas.`, `¿Años practicando ${disc || 'tu disciplina'}?`],
    msgs_fan: (name) => [`👀 ¡Hola ${name || 'fan'}!`, `Soy el agente SD.`, `¿Qué disciplina te interesa más?`],
  },
  fr: {
    step: 'ÉTAPE 3 SUR 4 — WHATSAPP',
    title_athlete: 'INTERVIEW\nAGENT SD',
    title_fan: 'CONNECTE-TOI\nÀ L\'AGENT',
    sub_athlete: "L'agent SD sur WhatsApp vérifie ton profil athlète en 2 minutes.",
    sub_fan: 'Tu recevras des mises à jour événements directement sur WhatsApp.',
    phoneReminder: 'Ton numéro :',
    openWa_athlete: "📲 Commencer l'Interview",
    openWa_fan: "📲 Se connecter à l'Agent",
    waNote: "Ouvre WhatsApp — l'agent répond immédiatement.",
    continue: 'Continuer →',
    skip_fan: 'Passer pour l\'instant →',
    athleteWarning: "⚠️ Obligatoire pour les athlètes — ouvre WhatsApp pour continuer.",
    opened: '✓ WhatsApp ouvert',
    minor: "⚠️ Tu es mineur — l'agent gérera la vérification parentale.",
    msgs_athlete: (name, disc) => [`🏆 Salut ${name || 'athlète'} !`, `Je suis l'agent SD.`, `4 questions rapides.`, `Années de pratique en ${disc || 'ta discipline'} ?`],
    msgs_fan: (name) => [`👀 Salut ${name || 'fan'} !`, `Je suis l'agent SD.`, `Quelle discipline veux-tu suivre le plus ?`],
  },
  ar: {
    step: 'الخطوة 3 من 4 — واتساب',
    title_athlete: 'مقابلة\nوكيل SD',
    title_fan: 'تواصل مع\nالوكيل',
    sub_athlete: 'وكيل SD على واتساب يتحقق من ملفك الرياضي خلال دقيقتين.',
    sub_fan: 'ستتلقى تحديثات الأحداث مباشرة على واتساب.',
    phoneReminder: 'رقمك:',
    openWa_athlete: '📲 ابدأ المقابلة',
    openWa_fan: '📲 تواصل مع الوكيل',
    waNote: 'يفتح واتساب — الوكيل يرد فوراً.',
    continue: 'استمر →',
    skip_fan: 'تخطي الآن →',
    athleteWarning: '⚠️ إلزامي للرياضيين — افتح واتساب للمتابعة.',
    opened: '✓ واتساب مفتوح',
    minor: '⚠️ أنت قاصر — الوكيل سيتعامل مع التحقق بموافقة الوالدين.',
    msgs_athlete: (name, disc) => [`🏆 مرحباً ${name || 'رياضي'}!`, `أنا وكيل SD.`, `4 أسئلة سريعة.`, `كم سنة تمارس ${disc || 'تخصصك'}؟`],
    msgs_fan: (name) => [`👀 مرحباً ${name || 'مشجع'}!`, `أنا وكيل SD.`, `أي تخصص تريد متابعته أكثر؟`],
  },
  de: {
    step: 'SCHRITT 3 VON 4 — WHATSAPP',
    title_athlete: 'SD-AGENT\nINTERVIEW',
    title_fan: 'MIT AGENT\nVERBINDEN',
    sub_athlete: 'Der SD-Agent auf WhatsApp verifiziert dein Athletenprofil in 2 Minuten.',
    sub_fan: 'Du erhältst Event-Updates direkt über WhatsApp.',
    phoneReminder: 'Deine Nummer:',
    openWa_athlete: '📲 Interview starten',
    openWa_fan: '📲 Mit Agent verbinden',
    waNote: 'Öffnet WhatsApp — Agent antwortet sofort.',
    continue: 'Weiter →',
    skip_fan: 'Jetzt überspringen →',
    athleteWarning: '⚠️ Pflicht für Athleten — öffne WhatsApp um fortzufahren.',
    opened: '✓ WhatsApp geöffnet',
    minor: '⚠️ Du bist minderjährig — der Agent regelt die elterliche Verifizierung.',
    msgs_athlete: (name, disc) => [`🏆 Hallo ${name || 'Athlet'}!`, `Ich bin der SD-Agent.`, `4 schnelle Fragen.`, `Jahre in ${disc || 'deiner Disziplin'}?`],
    msgs_fan: (name) => [`👀 Hallo ${name || 'Fan'}!`, `Ich bin der SD-Agent.`, `Welche Disziplin möchtest du am meisten verfolgen?`],
  },
};

export default function OnboardingStep4WhatsApp({ userData, onNext, lang = 'it' }) {
  const L = LABELS[lang] || LABELS.it;
  const name = userData?.name || userData?.nome || '';
  const { role, discipline, phone, isMinor } = userData || {};
  const isAthlete = role === 'athlete';
  const phoneMissing = !phone;

  const messages = isAthlete ? L.msgs_athlete(name, discipline) : L.msgs_fan(name);
  const [tick, setTick] = useState(0);
  const [waOpened, setWaOpened] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      setTick(p => {
        const next = p + 1;
        if (next >= messages.length) clearInterval(id);
        return next;
      });
    }, 700);
    return () => clearInterval(id);
  }, []);

  const visibleMessages = messages.slice(0, Math.min(tick + 1, messages.length));
  const allShown = visibleMessages.length >= messages.length;
  const waLink = base44.agents.getWhatsAppConnectURL('athlete_secretary');
  const canContinue = allShown && (!isAthlete || waOpened);

  const handleOpenWa = () => {
    setWaOpened(true);
    window.open(waLink, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="relative z-10 flex flex-col items-center justify-center min-h-full px-5 py-10 max-w-lg mx-auto w-full text-center">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
        <p className="font-mono text-[8px] tracking-[5px] uppercase text-fire-3/40 mb-2">{L.step}</p>
        <h2 className="heading-fire text-[clamp(24px,5vw,44px)] font-black leading-none mb-3 whitespace-pre-line">
          {isAthlete ? L.title_athlete : L.title_fan}
        </h2>
        <p className="font-rajdhani text-sm text-white/40 max-w-xs mx-auto">
          {isAthlete ? L.sub_athlete : L.sub_fan}
        </p>
      </motion.div>

      {/* WhatsApp chat mockup */}
      <div className="w-full max-w-sm mb-5">
        <div className="bg-[#0f1f0e] rounded-2xl overflow-hidden border border-green-500/20 shadow-[0_0_32px_rgba(0,200,0,0.08)]">
          {/* Chat header */}
          <div className="bg-[#1a2f18] px-4 py-3 flex items-center gap-3 border-b border-green-500/10">
            <div className="w-8 h-8 rounded-full bg-fire-3/20 flex items-center justify-center text-sm flex-shrink-0">🔥</div>
            <div className="text-left flex-1">
              <div className="font-rajdhani font-bold text-sm text-green-400">SD Sistema</div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <div className="font-mono text-[8px] text-green-400/50">online</div>
              </div>
            </div>
            {isAthlete && (
              <span className="font-mono text-[8px] text-fire-4/60 border border-fire-4/20 px-2 py-0.5">
                INTERVIEW
              </span>
            )}
          </div>
          {/* Messages */}
          <div className="p-4 space-y-2 min-h-[110px]">
            {visibleMessages.map((msg, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 6, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.25 }} className="flex justify-start">
                <div className="bg-[#1f3320] text-green-100 rounded-2xl rounded-tl-sm px-3 py-2 text-sm max-w-[88%] text-left font-rajdhani">
                  {msg}
                </div>
              </motion.div>
            ))}
            {!allShown && (
              <div className="flex gap-1 pl-1 pt-1">
                {[0, 1, 2].map(i => (
                  <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-green-500/40"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.18 }} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Minor warning */}
      {isMinor && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="w-full max-w-sm mb-4 px-4 py-3 bg-yellow-500/10 border border-yellow-500/30 text-left">
          <p className="font-mono text-[10px] text-yellow-400 leading-relaxed">{L.minor}</p>
        </motion.div>
      )}

      {phoneMissing && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="w-full max-w-sm mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 text-left">
          <p className="font-mono text-[9px] text-red-400 leading-relaxed">
            ⚠️ Numero WhatsApp non inserito — torna allo step precedente per aggiungerlo.
          </p>
        </motion.div>
      )}
      {phone && (
        <p className="font-mono text-[9px] text-white/20 mb-3">
          {L.phoneReminder} <span className="text-fire-3">{phone}</span>
        </p>
      )}

      {/* Athlete warning */}
      <AnimatePresence>
        {isAthlete && allShown && !waOpened && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="w-full max-w-sm mb-4 px-4 py-2.5 bg-fire-3/8 border border-fire-3/25 text-center">
            <p className="font-mono text-[9px] text-fire-4/80">{L.athleteWarning}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* WA Button */}
      <AnimatePresence>
        {allShown && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-4 w-full max-w-sm space-y-2">
            {waOpened ? (
              <div className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600/20 border border-green-500/40 text-green-400 font-orbitron text-[11px] tracking-[1px] uppercase"
                style={{ clipPath: 'polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)' }}>
                <CheckCircle size={14} /> {L.opened}
              </div>
            ) : (
              <button onClick={handleOpenWa}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-green-600/20 border border-green-500/40 text-green-400 font-orbitron text-[11px] tracking-[2px] uppercase hover:bg-green-600/35 transition-all"
                style={{ clipPath: 'polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)' }}>
                <MessageCircle size={14} />
                {isAthlete ? L.openWa_athlete : L.openWa_fan}
                <ChevronRight size={12} />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <p className="font-mono text-[8px] text-white/18 mb-5 max-w-xs">{L.waNote}</p>

      {/* Continue / Skip */}
      <div className="flex flex-col items-center gap-2 w-full max-w-sm">
        <motion.button
          animate={{ opacity: canContinue ? 1 : 0.3 }}
          onClick={canContinue ? onNext : undefined}
          disabled={!canContinue}
          className={`btn-fire w-full text-[12px] tracking-[3px] py-3.5 ${!canContinue ? 'cursor-not-allowed' : ''}`}
          whileHover={canContinue ? { scale: 1.03 } : {}}
          whileTap={canContinue ? { scale: 0.97 } : {}}
        >
          {L.continue}
        </motion.button>

        {/* Skip only for fans, always shown after messages load */}
        {!isAthlete && allShown && (
          <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            onClick={onNext}
            className="font-mono text-[9px] text-white/30 hover:text-white/50 transition-colors underline underline-offset-2 py-1">
            {L.skip_fan}
          </motion.button>
        )}
      </div>
    </div>
  );
}