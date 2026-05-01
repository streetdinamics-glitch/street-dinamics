import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, ChevronRight } from 'lucide-react';

const LABELS = {
  it: {
    step: 'STEP 3 DI 4',
    title: 'AGENTE\nWHATSAPP',
    sub: 'Riceverai questo messaggio subito dopo la registrazione.',
    minor: '⚠️ Sei minorenne — invieremo un messaggio al numero inserito per la conferma del genitore/tutore.',
    phoneReminder: 'Il messaggio arriverà al numero:',
    openWa: '📲 Scrivi all\'Agente SD su WhatsApp',
    waNote: 'Il messaggio verrà inviato all\'agente SD. Ti risponderà entro poco.',
    continue: 'Continua →',
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
    sub: 'You will receive this message right after registration.',
    minor: '⚠️ You are a minor — we will send a message to the number provided for parental consent.',
    phoneReminder: 'Message will be sent to:',
    openWa: '📲 Message the SD Agent on WhatsApp',
    waNote: 'The message will be sent to the SD agent. They will reply shortly.',
    continue: 'Continue →',
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
    sub: 'Recibirás este mensaje justo después del registro.',
    minor: '⚠️ Eres menor de edad — enviaremos un mensaje al número proporcionado para el consentimiento parental.',
    phoneReminder: 'El mensaje llegará al número:',
    openWa: '📲 Escribir al Agente SD en WhatsApp',
    waNote: 'El mensaje será enviado al agente SD. Te responderá pronto.',
    continue: 'Continuar →',
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
    sub: 'Tu recevras ce message juste après l\'inscription.',
    minor: '⚠️ Tu es mineur — nous enverrons un message au numéro fourni pour le consentement parental.',
    phoneReminder: 'Le message arrivera au numéro :',
    openWa: '📲 Écrire à l\'Agent SD sur WhatsApp',
    waNote: 'Le message sera envoyé à l\'agent SD. Il répondra rapidement.',
    continue: 'Continuer →',
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
    sub: 'ستتلقى هذه الرسالة فور التسجيل.',
    minor: '⚠️ أنت قاصر — سنرسل رسالة إلى الرقم المقدم للحصول على موافقة الوالدين.',
    phoneReminder: 'ستصل الرسالة إلى الرقم:',
    openWa: '📲 راسل وكيل SD على واتساب',
    waNote: 'سيتم إرسال الرسالة إلى وكيل SD. سيرد عليك قريباً.',
    continue: 'استمر →',
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
    sub: 'Du erhältst diese Nachricht direkt nach der Registrierung.',
    minor: '⚠️ Du bist minderjährig — wir senden eine Nachricht an die angegebene Nummer für die elterliche Zustimmung.',
    phoneReminder: 'Die Nachricht kommt an die Nummer:',
    openWa: '📲 SD-Agent auf WhatsApp schreiben',
    waNote: 'Die Nachricht wird an den SD-Agent gesendet. Er antwortet bald.',
    continue: 'Weiter →',
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
  // support both 'name' (new) and 'nome' (legacy)
  const name = userData.name || userData.nome || '';
  const { role, discipline, phone, isMinor } = userData;
  const isAthlete = role === 'athlete';

  const messages = isAthlete
    ? L.msgs_athlete(name, discipline)
    : L.msgs_fan(name);

  const [tick, setTick] = useState(0);
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

  // SD business WhatsApp — user sends a message to the SD agent
  // Replace with the real SD WhatsApp Business number (digits only, no + or spaces)
  const SD_WA_NUMBER = '393200000000'; // ← replace with real number
  const waMessages = {
    it: `SD Sistema - Nuovo account attivato!\nNome: ${name || ''}\nTelefono: ${phone || ''}\nRuolo: ${role === 'athlete' ? 'Atleta' : 'Fan'}\nDisciplina: ${discipline || ''}`,
    en: `SD System - New account activated!\nName: ${name || ''}\nPhone: ${phone || ''}\nRole: ${role === 'athlete' ? 'Athlete' : 'Fan'}\nDiscipline: ${discipline || ''}`,
    es: `SD Sistema - ¡Nueva cuenta activada!\nNombre: ${name || ''}\nTeléfono: ${phone || ''}\nRol: ${role === 'athlete' ? 'Atleta' : 'Fan'}\nDisciplina: ${discipline || ''}`,
    fr: `SD Système - Nouveau compte activé!\nNom: ${name || ''}\nTéléphone: ${phone || ''}\nRôle: ${role === 'athlete' ? 'Athlète' : 'Fan'}\nDiscipline: ${discipline || ''}`,
    ar: `نظام SD - تم تفعيل الحساب!\nالاسم: ${name || ''}\nالهاتف: ${phone || ''}\nالدور: ${role === 'athlete' ? 'رياضي' : 'مشجع'}\nالتخصص: ${discipline || ''}`,
    de: `SD System - Neues Konto aktiviert!\nName: ${name || ''}\nTelefon: ${phone || ''}\nRolle: ${role === 'athlete' ? 'Athlet' : 'Fan'}\nDisziplin: ${discipline || ''}`,
  };
  const waText = waMessages[lang] || waMessages.it;
  // wa.me works on both mobile (opens app) and desktop (opens web.whatsapp.com)
  const waLink = `https://wa.me/${SD_WA_NUMBER}?text=${encodeURIComponent(waText)}`;

  return (
    <div className="relative z-10 flex flex-col items-center justify-center min-h-full px-5 py-12 max-w-lg mx-auto w-full text-center">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <p className="font-mono text-[9px] tracking-[6px] uppercase text-fire-3/40 mb-2">{L.step}</p>
        <h2 className="heading-fire text-[clamp(26px,5vw,46px)] font-black leading-none mb-3 whitespace-pre-line">
          {L.title}
        </h2>
        <p className="font-rajdhani text-sm text-white/40 max-w-xs mx-auto">{L.sub}</p>
      </motion.div>

      {/* WhatsApp mockup */}
      <div className="w-full max-w-sm mb-8">
        <div className="bg-[#0f1f0e] rounded-2xl overflow-hidden border border-green-500/20 shadow-[0_0_40px_rgba(0,200,0,0.1)]">
          <div className="bg-[#1a2f18] px-4 py-3 flex items-center gap-3 border-b border-green-500/10">
            <div className="w-8 h-8 rounded-full bg-fire-3/20 flex items-center justify-center text-sm">🔥</div>
            <div className="text-left">
              <div className="font-rajdhani font-bold text-sm text-green-400">SD Sistema</div>
              <div className="font-mono text-[9px] text-green-400/40">online</div>
            </div>
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

      {isMinor && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="w-full max-w-sm mb-6 px-4 py-3 bg-yellow-500/10 border border-yellow-500/30 text-left"
        >
          <p className="font-mono text-[10px] text-yellow-400 leading-relaxed">{L.minor}</p>
        </motion.div>
      )}

      {phone && (
        <p className="font-mono text-[10px] text-white/30 mb-6">
          {L.phoneReminder} <span className="text-fire-3">{phone}</span>
          <br/>
          <span className="text-white/20">{L.waNote}</span>
        </p>
      )}

      {allShown && (
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
          {L.openWa}
          <ChevronRight size={12} />
        </motion.a>
      )}

      {/* Continue is always reachable once messages are shown — WA click is optional */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: allShown ? 1 : 0.4 }}
        onClick={onNext}
        disabled={!allShown}
        className={`btn-fire text-[12px] tracking-[3px] px-10 py-3.5 ${!allShown ? 'opacity-30 cursor-not-allowed' : ''}`}
      >
        {L.continue}
      </motion.button>
    </div>
  );
}