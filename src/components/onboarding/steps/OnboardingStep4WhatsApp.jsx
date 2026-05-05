import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, ChevronRight, CheckCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const LABELS = {
  it: {
    step: 'STEP 3 DI 4',
    title: 'AGENTE\nWHATSAPP',
    sub_athlete: "L'agente SD ti farà un'intervista veloce per verificare il tuo profilo atleta.",
    sub_fan: 'Riceverai aggiornamenti sugli eventi e la community direttamente su WhatsApp.',
    minor: '⚠️ Sei minorenne — l\'agente gestirà la verifica con consenso del genitore.',
    phoneReminder: 'Numero registrato:',
    openWa_athlete: '📲 Inizia l\'Intervista con l\'Agente SD',
    openWa_fan: '📲 Connettiti all\'Agente SD',
    waNote: 'Si apre WhatsApp — l\'agente SD risponde entro pochi minuti.',
    continue: 'Continua →',
    athleteWarning: '⚠️ Per gli atleti, aprire WhatsApp è obbligatorio per completare la verifica.',
    opened: '✓ WhatsApp aperto — puoi continuare',
    msgs_athlete: (name, disc) => [
      `🏆 Ciao ${name || 'atleta'}! Benvenuto in Street Dinamics.`,
      `Sono l'agente SD — ti seguirò da qui.`,
      `Ti faccio 4 domande veloci per il tuo profilo atleta.`,
      `Prima domanda: da quanti anni pratichi ${disc || 'la tua disciplina'}?`,
    ],
    msgs_fan: (name) => [
      `👀 Ciao ${name || 'fan'}! Benvenuto in Street Dinamics.`,
      `Due domande veloci e sei dentro.`,
      `Quale disciplina ti interessa seguire di più?`,
    ],
  },
  en: {
    step: 'STEP 3 OF 4',
    title: 'WHATSAPP\nAGENT',
    sub_athlete: 'The SD agent will do a quick interview to verify your athlete profile.',
    sub_fan: 'You\'ll receive event and community updates directly on WhatsApp.',
    minor: '⚠️ You are a minor — the agent will handle verification with parental consent.',
    phoneReminder: 'Registered number:',
    openWa_athlete: '📲 Start Interview with SD Agent',
    openWa_fan: '📲 Connect to SD Agent',
    waNote: 'Opens WhatsApp — the SD agent replies within minutes.',
    continue: 'Continue →',
    athleteWarning: '⚠️ For athletes, opening WhatsApp is required to complete verification.',
    opened: '✓ WhatsApp opened — you can continue',
    msgs_athlete: (name, disc) => [
      `🏆 Hi ${name || 'athlete'}! Welcome to Street Dinamics.`,
      `I'm the SD agent — I'll guide you from here.`,
      `4 quick questions to complete your athlete profile.`,
      `First: how many years have you been practicing ${disc || 'your discipline'}?`,
    ],
    msgs_fan: (name) => [
      `👀 Hi ${name || 'fan'}! Welcome to Street Dinamics.`,
      `Two quick questions and you're in.`,
      `Which discipline do you want to follow most?`,
    ],
  },
  es: {
    step: 'PASO 3 DE 4',
    title: 'AGENTE\nWHATSAPP',
    sub_athlete: 'El agente SD hará una entrevista rápida para verificar tu perfil de atleta.',
    sub_fan: 'Recibirás actualizaciones de eventos y comunidad directamente por WhatsApp.',
    minor: '⚠️ Eres menor de edad — el agente gestionará la verificación con consentimiento parental.',
    phoneReminder: 'Número registrado:',
    openWa_athlete: '📲 Iniciar Entrevista con el Agente SD',
    openWa_fan: '📲 Conectarse al Agente SD',
    waNote: 'Abre WhatsApp — el agente SD responde en minutos.',
    continue: 'Continuar →',
    athleteWarning: '⚠️ Para atletas, abrir WhatsApp es obligatorio para completar la verificación.',
    opened: '✓ WhatsApp abierto — puedes continuar',
    msgs_athlete: (name, disc) => [
      `🏆 ¡Hola ${name || 'atleta'}! Bienvenido a Street Dinamics.`,
      `Soy el agente SD — te guiaré desde aquí.`,
      `4 preguntas rápidas para tu perfil de atleta.`,
      `Primera: ¿cuántos años llevas practicando ${disc || 'tu disciplina'}?`,
    ],
    msgs_fan: (name) => [
      `👀 ¡Hola ${name || 'fan'}! Bienvenido a Street Dinamics.`,
      `Dos preguntas rápidas y ya estás dentro.`,
      `¿Qué disciplina te interesa seguir más?`,
    ],
  },
  fr: {
    step: 'ÉTAPE 3 SUR 4',
    title: 'AGENT\nWHATSAPP',
    sub_athlete: "L'agent SD fera une interview rapide pour vérifier ton profil athlète.",
    sub_fan: 'Tu recevras des mises à jour événements et communauté directement sur WhatsApp.',
    minor: "⚠️ Tu es mineur — l'agent gérera la vérification avec consentement parental.",
    phoneReminder: 'Numéro enregistré :',
    openWa_athlete: "📲 Commencer l'Interview avec l'Agent SD",
    openWa_fan: "📲 Se connecter à l'Agent SD",
    waNote: "Ouvre WhatsApp — l'agent SD répond en quelques minutes.",
    continue: 'Continuer →',
    athleteWarning: "⚠️ Pour les athlètes, ouvrir WhatsApp est obligatoire pour compléter la vérification.",
    opened: '✓ WhatsApp ouvert — tu peux continuer',
    msgs_athlete: (name, disc) => [
      `🏆 Salut ${name || 'athlète'} ! Bienvenue sur Street Dinamics.`,
      `Je suis l'agent SD — je te guide depuis ici.`,
      `4 questions rapides pour ton profil athlète.`,
      `Première : depuis combien d'années pratiques-tu ${disc || 'ta discipline'} ?`,
    ],
    msgs_fan: (name) => [
      `👀 Salut ${name || 'fan'} ! Bienvenue sur Street Dinamics.`,
      `Deux questions rapides et tu es dedans.`,
      `Quelle discipline veux-tu suivre le plus ?`,
    ],
  },
  ar: {
    step: 'الخطوة 3 من 4',
    title: 'وكيل\nواتساب',
    sub_athlete: 'سيجري وكيل SD مقابلة سريعة للتحقق من ملفك الرياضي.',
    sub_fan: 'ستتلقى تحديثات الأحداث والمجتمع مباشرة على واتساب.',
    minor: '⚠️ أنت قاصر — سيتعامل الوكيل مع التحقق بموافقة الوالدين.',
    phoneReminder: 'الرقم المسجل:',
    openWa_athlete: '📲 ابدأ المقابلة مع وكيل SD',
    openWa_fan: '📲 تواصل مع وكيل SD',
    waNote: 'يفتح واتساب — يرد وكيل SD خلال دقائق.',
    continue: 'استمر →',
    athleteWarning: '⚠️ للرياضيين، فتح واتساب إلزامي لإكمال التحقق.',
    opened: '✓ واتساب مفتوح — يمكنك المتابعة',
    msgs_athlete: (name, disc) => [
      `🏆 مرحباً ${name || 'رياضي'}! أهلاً بك في Street Dinamics.`,
      `أنا وكيل SD — سأرشدك من هنا.`,
      `4 أسئلة سريعة لإكمال ملفك الرياضي.`,
      `الأول: منذ كم سنة تمارس ${disc || 'تخصصك'}؟`,
    ],
    msgs_fan: (name) => [
      `👀 مرحباً ${name || 'مشجع'}! أهلاً بك في Street Dinamics.`,
      `سؤالان سريعان وأنت داخل.`,
      `أي تخصص تريد متابعته أكثر؟`,
    ],
  },
  de: {
    step: 'SCHRITT 3 VON 4',
    title: 'WHATSAPP\nAGENT',
    sub_athlete: 'Der SD-Agent führt ein schnelles Interview zur Verifizierung deines Athletenprofils.',
    sub_fan: 'Du erhältst Event- und Community-Updates direkt über WhatsApp.',
    minor: '⚠️ Du bist minderjährig — der Agent regelt die Verifizierung mit elterlicher Zustimmung.',
    phoneReminder: 'Registrierte Nummer:',
    openWa_athlete: '📲 Interview mit SD-Agent starten',
    openWa_fan: '📲 Mit SD-Agent verbinden',
    waNote: 'Öffnet WhatsApp — der SD-Agent antwortet in Minuten.',
    continue: 'Weiter →',
    athleteWarning: '⚠️ Für Athleten ist das Öffnen von WhatsApp zur Verifizierung erforderlich.',
    opened: '✓ WhatsApp geöffnet — du kannst fortfahren',
    msgs_athlete: (name, disc) => [
      `🏆 Hallo ${name || 'Athlet'}! Willkommen bei Street Dinamics.`,
      `Ich bin der SD-Agent — ich begleite dich von hier.`,
      `4 schnelle Fragen für dein Athletenprofil.`,
      `Erste: Wie viele Jahre übst du ${disc || 'deine Disziplin'} aus?`,
    ],
    msgs_fan: (name) => [
      `👀 Hallo ${name || 'Fan'}! Willkommen bei Street Dinamics.`,
      `Zwei schnelle Fragen und du bist dabei.`,
      `Welche Disziplin möchtest du am meisten verfolgen?`,
    ],
  },
};

export default function OnboardingStep4WhatsApp({ userData, onNext, lang = 'it' }) {
  const L = LABELS[lang] || LABELS.it;
  const name = userData.name || userData.nome || '';
  const { role, discipline, phone, isMinor } = userData;
  const isAthlete = role === 'athlete';

  const messages = isAthlete
    ? L.msgs_athlete(name, discipline)
    : L.msgs_fan(name);

  const [tick, setTick] = useState(0);
  const [waOpened, setWaOpened] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      setTick(p => {
        const next = p + 1;
        if (next >= messages.length) clearInterval(id);
        return next;
      });
    }, 800);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const visibleMessages = messages.slice(0, Math.min(tick + 1, messages.length));
  const allShown = visibleMessages.length >= messages.length;

  const waLink = base44.agents.getWhatsAppConnectURL('athlete_secretary');

  // Athletes must open WA before continuing; fans can skip
  const canContinue = allShown && (!isAthlete || waOpened);

  const handleOpenWa = () => {
    setWaOpened(true);
    window.open(waLink, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="relative z-10 flex flex-col items-center justify-center min-h-full px-5 py-12 max-w-lg mx-auto w-full text-center">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
        <p className="font-mono text-[9px] tracking-[6px] uppercase text-fire-3/40 mb-2">{L.step}</p>
        <h2 className="heading-fire text-[clamp(26px,5vw,46px)] font-black leading-none mb-3 whitespace-pre-line">
          {L.title}
        </h2>
        <p className="font-rajdhani text-sm text-white/40 max-w-xs mx-auto">
          {isAthlete ? L.sub_athlete : L.sub_fan}
        </p>
      </motion.div>

      {/* WhatsApp mockup */}
      <div className="w-full max-w-sm mb-6">
        <div className="bg-[#0f1f0e] rounded-2xl overflow-hidden border border-green-500/20 shadow-[0_0_40px_rgba(0,200,0,0.1)]">
          <div className="bg-[#1a2f18] px-4 py-3 flex items-center gap-3 border-b border-green-500/10">
            <div className="w-8 h-8 rounded-full bg-fire-3/20 flex items-center justify-center text-sm">🔥</div>
            <div className="text-left">
              <div className="font-rajdhani font-bold text-sm text-green-400">SD Sistema</div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <div className="font-mono text-[9px] text-green-400/50">online</div>
              </div>
            </div>
            {isAthlete && (
              <span className="ml-auto font-mono text-[8px] text-fire-4/60 border border-fire-4/20 px-2 py-0.5">
                INTERVIEW
              </span>
            )}
          </div>
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
                {[0, 1, 2].map(i => (
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

      {isMinor && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="w-full max-w-sm mb-4 px-4 py-3 bg-yellow-500/10 border border-yellow-500/30 text-left"
        >
          <p className="font-mono text-[10px] text-yellow-400 leading-relaxed">{L.minor}</p>
        </motion.div>
      )}

      {phone && (
        <p className="font-mono text-[9px] text-white/25 mb-4">
          {L.phoneReminder} <span className="text-fire-3">{phone}</span>
        </p>
      )}

      {/* Athlete warning — must open WA */}
      {isAthlete && allShown && !waOpened && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm mb-4 px-4 py-2.5 bg-fire-3/8 border border-fire-3/25 text-center"
        >
          <p className="font-mono text-[9px] text-fire-4/80 leading-relaxed">{L.athleteWarning}</p>
        </motion.div>
      )}

      {/* WA Button */}
      <AnimatePresence>
        {allShown && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 w-full max-w-sm"
          >
            {waOpened ? (
              <div className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600/20 border border-green-500/40 text-green-400 font-orbitron text-[11px] tracking-[1px] uppercase"
                style={{ clipPath: 'polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)' }}
              >
                <CheckCircle size={14} />
                {L.opened}
              </div>
            ) : (
              <button
                onClick={handleOpenWa}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-green-600/20 border border-green-500/40 text-green-400 font-orbitron text-[11px] tracking-[2px] uppercase hover:bg-green-600/35 transition-all"
                style={{ clipPath: 'polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)' }}
              >
                <MessageCircle size={14} />
                {isAthlete ? L.openWa_athlete : L.openWa_fan}
                <ChevronRight size={12} />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <p className="font-mono text-[8px] text-white/20 mb-5 max-w-xs">{L.waNote}</p>

      <motion.button
        animate={{ opacity: canContinue ? 1 : 0.3 }}
        onClick={canContinue ? onNext : undefined}
        disabled={!canContinue}
        className={`btn-fire text-[12px] tracking-[3px] px-10 py-3.5 ${!canContinue ? 'cursor-not-allowed' : ''}`}
        whileHover={canContinue ? { scale: 1.03 } : {}}
        whileTap={canContinue ? { scale: 0.97 } : {}}
      >
        {L.continue}
      </motion.button>
    </div>
  );
}