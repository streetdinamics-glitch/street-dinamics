import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const STEPS = {
  en: [
    { icon: '🎯', label: 'Confirm your sport discipline' },
    { icon: '🎥', label: 'Send a video proof (min 1 minute)' },
    { icon: '🏷️', label: 'Team name or competition nickname' },
    { icon: '✅', label: 'Instant approval decision' },
  ],
  it: [
    { icon: '🎯', label: 'Conferma la tua disciplina sportiva' },
    { icon: '🎥', label: 'Invia un video dimostrativo (min 1 minuto)' },
    { icon: '🏷️', label: 'Nome del team o nickname di gara' },
    { icon: '✅', label: 'Decisione di approvazione immediata' },
  ],
  es: [
    { icon: '🎯', label: 'Confirma tu disciplina deportiva' },
    { icon: '🎥', label: 'Envía un video de prueba (mín. 1 minuto)' },
    { icon: '🏷️', label: 'Nombre del equipo o apodo de competición' },
    { icon: '✅', label: 'Decisión de aprobación instantánea' },
  ],
  fr: [
    { icon: '🎯', label: 'Confirmez votre discipline sportive' },
    { icon: '🎥', label: 'Envoyez une vidéo de preuve (min 1 minute)' },
    { icon: '🏷️', label: 'Nom d\'équipe ou surnom de compétition' },
    { icon: '✅', label: 'Décision d\'approbation instantanée' },
  ],
  ar: [
    { icon: '🎯', label: 'تأكيد تخصصك الرياضي' },
    { icon: '🎥', label: 'أرسل فيديو إثبات (دقيقة واحدة على الأقل)' },
    { icon: '🏷️', label: 'اسم الفريق أو اللقب في المنافسة' },
    { icon: '✅', label: 'قرار الموافقة الفوري' },
  ],
  de: [
    { icon: '🎯', label: 'Bestätigen Sie Ihre Sportdisziplin' },
    { icon: '🎥', label: 'Video-Nachweis senden (min. 1 Minute)' },
    { icon: '🏷️', label: 'Teamname oder Wettkampf-Nickname' },
    { icon: '✅', label: 'Sofortige Genehmigungsentscheidung' },
  ],
};

const LABELS = {
  en: {
    title: 'AI Secretary Interview',
    subtitle: 'Athlete Verification · WhatsApp',
    event: 'Event', athlete: 'Athlete', sport: 'Sport',
    steps_title: 'Interview steps',
    cta: 'OPEN WHATSAPP INTERVIEW',
    hint: 'The AI Secretary will guide you step-by-step. Have your video ready before starting.',
  },
  it: {
    title: 'Intervista Segretaria AI',
    subtitle: 'Verifica Atleta · WhatsApp',
    event: 'Evento', athlete: 'Atleta', sport: 'Sport',
    steps_title: 'Passaggi intervista',
    cta: 'APRI INTERVISTA WHATSAPP',
    hint: 'La Segretaria AI ti guiderà passo dopo passo. Tieni il video pronto prima di iniziare.',
  },
  es: {
    title: 'Entrevista Secretaria IA',
    subtitle: 'Verificación Atleta · WhatsApp',
    event: 'Evento', athlete: 'Atleta', sport: 'Deporte',
    steps_title: 'Pasos de la entrevista',
    cta: 'ABRIR ENTREVISTA WHATSAPP',
    hint: 'La Secretaria IA te guiará paso a paso. Ten tu video listo antes de comenzar.',
  },
  fr: {
    title: 'Entretien Secrétaire IA',
    subtitle: 'Vérification Athlète · WhatsApp',
    event: 'Événement', athlete: 'Athlète', sport: 'Sport',
    steps_title: 'Étapes de l\'entretien',
    cta: 'OUVRIR L\'ENTRETIEN WHATSAPP',
    hint: 'La Secrétaire IA vous guidera étape par étape. Préparez votre vidéo avant de commencer.',
  },
  ar: {
    title: 'مقابلة السكرتيرة الذكية',
    subtitle: 'التحقق من الرياضي · واتساب',
    event: 'الحدث', athlete: 'الرياضي', sport: 'الرياضة',
    steps_title: 'خطوات المقابلة',
    cta: 'افتح مقابلة واتساب',
    hint: 'ستوجهك السكرتيرة الذكية خطوة بخطوة. احضر الفيديو قبل البدء.',
  },
  de: {
    title: 'KI-Sekretärin Interview',
    subtitle: 'Athleten-Verifizierung · WhatsApp',
    event: 'Veranstaltung', athlete: 'Athlet', sport: 'Sport',
    steps_title: 'Interview-Schritte',
    cta: 'WHATSAPP-INTERVIEW ÖFFNEN',
    hint: 'Die KI-Sekretärin führt Sie Schritt für Schritt. Halten Sie Ihr Video bereit.',
  },
};

export default function AthleteInterviewPrompt({ registration, event, lang = 'en', onClose }) {
  const whatsappLink = base44.agents.getWhatsAppConnectURL('athlete_secretary');
  const L = LABELS[lang] || LABELS.en;
  const steps = STEPS[lang] || STEPS.en;

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
            {L.title}
          </h2>
          <p className="font-mono text-[10px] tracking-[4px] uppercase text-fire-3/30">
            {L.subtitle}
          </p>
        </div>

        {/* Application summary */}
        <div className="bg-fire-3/5 border border-fire-3/15 p-3 mb-4 grid grid-cols-3 gap-2 text-center">
          {[
            { label: L.event, value: event?.title || '—' },
            { label: L.athlete, value: `${registration?.first_name || ''} ${registration?.last_name || ''}`.trim() || '—' },
            { label: L.sport, value: registration?.sport || '—' },
          ].map(item => (
            <div key={item.label}>
              <div className="font-mono text-[8px] text-fire-3/30 uppercase tracking-[1px]">{item.label}</div>
              <div className="font-rajdhani text-sm text-fire-4 font-semibold truncate">{item.value}</div>
            </div>
          ))}
        </div>

        {/* Steps */}
        <div className="border border-white/5 bg-white/2 p-4 mb-5 space-y-2">
          <p className="font-mono text-[9px] tracking-[3px] uppercase text-white/30 mb-3">{L.steps_title}</p>
          {steps.map((s, i) => (
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
          {L.cta}
        </a>

        <p className="font-mono text-[8px] text-fire-3/25 text-center leading-relaxed">
          {L.hint}
        </p>
      </motion.div>
    </div>
  );
}