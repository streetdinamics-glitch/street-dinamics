import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SD_LOGO = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69b2e24ee21bc949528cccdd/5d1be983b_photo_2026-03-11_15-56-46.jpg";

const SLIDES_BY_LANG = {
  it: [
    { emoji: '🃏', title: 'La Card', text: "Ogni atleta ha una card — come una figurina Panini. La compri, la tieni, e quando l'atleta vince, vale di più." },
    { emoji: '💰', title: 'Le Royalty', text: "Ogni sponsorizzazione che l'atleta prende, il 50% va agli holder delle sue card. Automaticamente." },
    { emoji: '👑', title: 'Window Challenge', text: "Chi vince un torneo può sfidare il campione. Tu segui la storia in tempo reale — e la tua card si muove con essa." },
  ],
  en: [
    { emoji: '🃏', title: 'The Card', text: "Every athlete has a card — like a Panini sticker. You buy it, keep it, and when the athlete wins, it's worth more." },
    { emoji: '💰', title: 'Royalties', text: "Every sponsorship the athlete gets, 50% goes to card holders. Automatically." },
    { emoji: '👑', title: 'Window Challenge', text: "Whoever wins a tournament can challenge the champion. You follow the story in real time — and your card moves with it." },
  ],
  es: [
    { emoji: '🃏', title: 'La Card', text: "Cada atleta tiene una card — como una figurita Panini. La compras, la guardas, y cuando el atleta gana, vale más." },
    { emoji: '💰', title: 'Las Regalías', text: "Cada sponsorización que consigue el atleta, el 50% va a los holders de sus cards. Automáticamente." },
    { emoji: '👑', title: 'Window Challenge', text: "Quien gana un torneo puede desafiar al campeón. Sigues la historia en tiempo real — y tu card se mueve con ella." },
  ],
  fr: [
    { emoji: '🃏', title: 'La Card', text: "Chaque athlète a une card — comme une vignette Panini. Tu l'achètes, tu la gardes, et quand l'athlète gagne, elle vaut plus." },
    { emoji: '💰', title: 'Les Royalties', text: "Chaque sponsoring que l'athlète obtient, 50% va aux détenteurs de ses cards. Automatiquement." },
    { emoji: '👑', title: 'Window Challenge', text: "Qui remporte un tournoi peut défier le champion. Tu suis l'histoire en temps réel — et ta card évolue avec elle." },
  ],
  ar: [
    { emoji: '🃏', title: 'البطاقة', text: "لكل رياضي بطاقة — مثل ملصقات بانيني. تشتريها وتحتفظ بها، وعندما يفوز الرياضي تزيد قيمتها." },
    { emoji: '💰', title: 'الإتاوات', text: "كل رعاية يحصل عليها الرياضي، 50٪ تذهب تلقائياً لحاملي بطاقاته." },
    { emoji: '👑', title: 'تحدي النافذة', text: "من يفوز في بطولة يمكنه تحدي البطل. تتابع القصة في الوقت الحقيقي — وبطاقتك تتحرك معها." },
  ],
  de: [
    { emoji: '🃏', title: 'Die Card', text: "Jeder Athlet hat eine Card — wie ein Panini-Sticker. Du kaufst sie, behältst sie, und wenn der Athlet gewinnt, ist sie mehr wert." },
    { emoji: '💰', title: 'Royalties', text: "Jedes Sponsoring, das der Athlet bekommt: 50% geht automatisch an die Card-Inhaber." },
    { emoji: '👑', title: 'Window Challenge', text: "Wer ein Turnier gewinnt, kann den Champion herausfordern. Du verfolgst die Geschichte in Echtzeit — und deine Card bewegt sich mit ihr." },
  ],
};

const LABELS = {
  it: {
    greeting: (name) => name ? `CIAO, ${String(name).toUpperCase().split(' ')[0]}!` : 'SEI DENTRO!',
    sub_athlete: 'Il tuo profilo atleta è attivo. Ti avviseremo via WhatsApp per i prossimi eventi.',
    sub_fan: 'Sei nel sistema. Ti terremo aggiornato sugli eventi SD.',
    next: 'Prossima →',
    enter: '🔥 Entra nella Piattaforma',
    slideHint: 'Scorri tutte e 3 le slide per continuare',
  },
  en: {
    greeting: (name) => name ? `HEY, ${String(name).toUpperCase().split(' ')[0]}!` : "YOU'RE IN!",
    sub_athlete: "Your athlete profile is active. We'll notify you via WhatsApp for upcoming events.",
    sub_fan: "You're in the system. We'll keep you updated on SD events.",
    next: 'Next →',
    enter: '🔥 Enter the Platform',
    slideHint: 'View all 3 slides to continue',
  },
  es: {
    greeting: (name) => name ? `¡HOLA, ${String(name).toUpperCase().split(' ')[0]}!` : '¡ESTÁS DENTRO!',
    sub_athlete: 'Tu perfil de atleta está activo. Te avisaremos por WhatsApp para los próximos eventos.',
    sub_fan: 'Estás en el sistema. Te mantendremos al día con los eventos SD.',
    next: 'Siguiente →',
    enter: '🔥 Entrar a la Plataforma',
    slideHint: 'Ve las 3 diapositivas para continuar',
  },
  fr: {
    greeting: (name) => name ? `SALUT, ${String(name).toUpperCase().split(' ')[0]} !` : 'TU ES DEDANS !',
    sub_athlete: "Ton profil athlète est actif. On te préviendra par WhatsApp pour les prochains événements.",
    sub_fan: "Tu es dans le système. On te tiendra informé des événements SD.",
    next: 'Suivant →',
    enter: '🔥 Entrer sur la Plateforme',
    slideHint: 'Vois les 3 slides pour continuer',
  },
  ar: {
    greeting: (name) => name ? `أهلاً، ${String(name).split(' ')[0]}!` : 'أنت داخل!',
    sub_athlete: 'ملفك الرياضي نشط. سنخطرك عبر واتساب للأحداث القادمة.',
    sub_fan: 'أنت في النظام. سنبقيك على اطلاع بأحداث SD.',
    next: 'التالي →',
    enter: '🔥 أدخل المنصة',
    slideHint: 'اعرض الشرائح الثلاث للمتابعة',
  },
  de: {
    greeting: (name) => name ? `HEY, ${String(name).toUpperCase().split(' ')[0]}!` : 'DU BIST DRIN!',
    sub_athlete: 'Dein Athletenprofil ist aktiv. Wir benachrichtigen dich per WhatsApp für kommende Events.',
    sub_fan: 'Du bist im System. Wir halten dich über SD-Events auf dem Laufenden.',
    next: 'Weiter →',
    enter: '🔥 Plattform betreten',
    slideHint: 'Sieh alle 3 Slides um fortzufahren',
  },
};

export default function OnboardingStep5Welcome({ userData, onFinish, lang = 'it' }) {
  const L = LABELS[lang] || LABELS.it;
  const SLIDES = SLIDES_BY_LANG[lang] || SLIDES_BY_LANG.it;
  const { name, role } = userData || {};
  const [slide, setSlide] = useState(0);
  const [allSeen, setAllSeen] = useState(false);

  useEffect(() => {
    if (slide >= SLIDES.length - 1) setAllSeen(true);
  }, [slide, SLIDES.length]);

  const goNext = () => {
    if (slide < SLIDES.length - 1) setSlide(s => s + 1);
  };

  return (
    <div className="relative z-10 flex flex-col items-center justify-center min-h-full px-5 py-12 max-w-lg mx-auto w-full text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="mb-8"
      >
        <motion.img
          src={SD_LOGO}
          alt="SD"
          className="w-20 h-20 rounded-xl object-cover mx-auto mb-4"
          style={{ filter: 'drop-shadow(0 0 20px rgba(255,100,0,0.7))' }}
          animate={{ filter: [
            'drop-shadow(0 0 20px rgba(255,100,0,0.7))',
            'drop-shadow(0 0 35px rgba(255,150,0,1))',
            'drop-shadow(0 0 20px rgba(255,100,0,0.7))',
          ]}}
          transition={{ duration: 2.5, repeat: Infinity }}
        />
        <h2 className="heading-fire text-[clamp(28px,6vw,52px)] font-black leading-none mb-2">
          {L.greeting(name)}
        </h2>
        <p className="font-rajdhani text-base text-white/50">
          {role === 'athlete' ? L.sub_athlete : L.sub_fan}
        </p>
      </motion.div>

      {/* Slides — dots NOT clickable to prevent skipping */}
      <div className="w-full max-w-sm mb-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.35 }}
            className="border border-fire-3/20 bg-fire-3/5 p-6"
            style={{ clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))' }}
          >
            <div className="text-4xl mb-3">{SLIDES[slide].emoji}</div>
            <h3 className="font-orbitron font-bold text-lg text-fire-4 mb-2">{SLIDES[slide].title}</h3>
            <p className="font-rajdhani text-base text-white/60 leading-relaxed">{SLIDES[slide].text}</p>
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-between mt-4">
          {/* Visual-only dots — NOT clickable (prevents skipping) */}
          <div className="flex gap-2">
            {SLIDES.map((_, i) => (
              <div
                key={i}
                className={`w-6 h-1 transition-all duration-300 ${
                  i === slide ? 'bg-fire-3' : i < slide ? 'bg-fire-3/40' : 'bg-white/10'
                }`}
              />
            ))}
          </div>
          {slide < SLIDES.length - 1 && (
            <button onClick={goNext} className="btn-ghost text-[10px] tracking-[2px] px-4 py-2">
              {L.next}
            </button>
          )}
        </div>
      </div>

      <motion.div animate={{ opacity: allSeen ? 1 : 0.3 }}>
        <motion.button
          onClick={allSeen ? onFinish : undefined}
          disabled={!allSeen}
          className={`btn-fire text-[13px] tracking-[4px] px-12 py-4 ${!allSeen ? 'opacity-30 cursor-not-allowed' : ''}`}
          whileHover={allSeen ? { scale: 1.05, boxShadow: '0 8px 40px rgba(255,100,0,0.6)' } : {}}
          whileTap={allSeen ? { scale: 0.97 } : {}}
        >
          {L.enter}
        </motion.button>
      </motion.div>

      {!allSeen && (
        <p className="font-mono text-[9px] text-white/20 mt-3">{L.slideHint}</p>
      )}
    </div>
  );
}