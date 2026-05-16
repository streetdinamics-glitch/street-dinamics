import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft } from 'lucide-react';

const SD_LOGO = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69b2e24ee21bc949528cccdd/5d1be983b_photo_2026-03-11_15-56-46.jpg";

const CONTENT = {
  it: {
    athlete: {
      slides: [
        { emoji: '🃏', title: 'La Tua Card', text: "Ogni atleta SD ha una card unica. Quando vinci, la tua card aumenta di valore e i tuoi fan la tengono come investimento." },
        { emoji: '💰', title: 'Royalty 50%', text: "Ogni sponsor genera royalty automatiche per gli holder delle tue card. Nessun intermediario, tutto on-chain." },
        { emoji: '👑', title: 'Window Challenge', text: "Vinci un torneo e sfida il campione in carica. La tua storia si muove in tempo reale." },
        { emoji: '⚡', title: 'AI Interview', text: "L'agente SD su WhatsApp verifica il tuo profilo. Rispondi — è il tuo passaporto per le gare ufficiali." },
      ],
      greeting: (n) => n ? `BENVENUTO,\n${String(n).toUpperCase().split(' ')[0]}!` : 'SEI UN ATLETA SD!',
      sub: 'Profilo atleta attivo. Completa la verifica WhatsApp per accedere alle gare.',
      cta: '🔥 Vai alla Dashboard',
      dashboard: '/dashboard-atleta',
      status: '⚔️ ATLETA — IN ATTESA DI VERIFICA',
    },
    fan: {
      slides: [
        { emoji: '🃏', title: 'Colleziona Card', text: "Ogni atleta SD ha una card unica. Acquistala e guadagna royalty quando prende sponsor. Investimento reale." },
        { emoji: '🎲', title: 'Prediction Markets', text: "Usa i Prediction Coins per scommettere sugli outcome degli eventi. Zero denaro reale — solo punti community." },
        { emoji: '🏆', title: 'Fan Status', text: "Rookie → Enthusiast → Superfan → Legend → Hall of Fame. Ogni livello sblocca perks esclusivi." },
      ],
      greeting: (n) => n ? `BENVENUTO,\n${String(n).toUpperCase().split(' ')[0]}!` : 'SEI NEL SISTEMA!',
      sub: 'Sei nella community SD. Esplora eventi, segui atleti e inizia la tua collezione.',
      cta: '🔥 Vai alla Dashboard',
      dashboard: '/dashboard-fan',
      status: '👀 FAN — PROFILO ATTIVO',
    },
  },
  en: {
    athlete: {
      slides: [
        { emoji: '🃏', title: 'Your Card', text: "Every SD athlete has a unique card. When you win, your card gains value and fans hold it as an investment." },
        { emoji: '💰', title: '50% Royalties', text: "Every sponsorship auto-distributes royalties to your card holders. No middlemen, all on-chain." },
        { emoji: '👑', title: 'Window Challenge', text: "Win a tournament and challenge the current champion. Your story unfolds in real time." },
        { emoji: '⚡', title: 'AI Interview', text: "The SD agent on WhatsApp verifies your profile. Answer honestly — it's your pass to official competitions." },
      ],
      greeting: (n) => n ? `WELCOME,\n${String(n).toUpperCase().split(' ')[0]}!` : "YOU'RE AN SD ATHLETE!",
      sub: 'Athlete profile active. Complete WhatsApp verification to access competitions.',
      cta: '🔥 Go to Dashboard',
      dashboard: '/dashboard-atleta',
      status: '⚔️ ATHLETE — PENDING VERIFICATION',
    },
    fan: {
      slides: [
        { emoji: '🃏', title: 'Collect Cards', text: "Every SD athlete has a unique card. Buy it and earn royalties when the athlete gets sponsors. Real investment." },
        { emoji: '🎲', title: 'Prediction Markets', text: "Use Prediction Coins to bet on event outcomes. No real money — just community points worth prizes." },
        { emoji: '🏆', title: 'Fan Status', text: "Rookie → Enthusiast → Superfan → Legend → Hall of Fame. Each tier unlocks exclusive perks." },
      ],
      greeting: (n) => n ? `WELCOME,\n${String(n).toUpperCase().split(' ')[0]}!` : "YOU'RE IN THE SYSTEM!",
      sub: "You're registered in the SD community. Explore events, follow athletes, and start your collection.",
      cta: '🔥 Go to Dashboard',
      dashboard: '/dashboard-fan',
      status: '👀 FAN — PROFILE ACTIVE',
    },
  },
  es: {
    athlete: {
      slides: [
        { emoji: '🃏', title: 'Tu Card', text: "Cada atleta SD tiene una card única. Cuando ganas, sube de valor y tus fans la guardan como inversión." },
        { emoji: '💰', title: 'Regalías 50%', text: "Cada sponsoring distribuye regalías automáticamente a los holders de tus cards. Sin intermediarios." },
        { emoji: '👑', title: 'Window Challenge', text: "Gana un torneo y desafía al campeón. Tu historia en tiempo real." },
        { emoji: '⚡', title: 'Entrevista AI', text: "El agente SD en WhatsApp verifica tu perfil. Responde — es tu pasaporte a competiciones oficiales." },
      ],
      greeting: (n) => n ? `BIENVENIDO,\n${String(n).toUpperCase().split(' ')[0]}!` : '¡ERES UN ATLETA SD!',
      sub: 'Perfil activo. Completa la verificación WhatsApp para acceder a competiciones.',
      cta: '🔥 Ir al Dashboard', dashboard: '/dashboard-atleta', status: '⚔️ ATLETA — PENDIENTE',
    },
    fan: {
      slides: [
        { emoji: '🃏', title: 'Colecciona', text: "Cada atleta SD tiene una card única. Gana regalías cuando consigue sponsors." },
        { emoji: '🎲', title: 'Prediction Markets', text: "Usa Prediction Coins para apostar en resultados. Sin dinero real." },
        { emoji: '🏆', title: 'Fan Status', text: "Rookie → Enthusiast → Superfan → Legend → Hall of Fame." },
      ],
      greeting: (n) => n ? `BIENVENIDO,\n${String(n).toUpperCase().split(' ')[0]}!` : '¡ESTÁS EN EL SISTEMA!',
      sub: 'Registrado en la comunidad SD.',
      cta: '🔥 Ir al Dashboard', dashboard: '/dashboard-fan', status: '👀 FAN — ACTIVO',
    },
  },
  fr: {
    athlete: {
      slides: [
        { emoji: '🃏', title: 'Ta Card', text: "Chaque athlète SD a une card unique. Quand tu gagnes, elle prend de la valeur et tes fans l'investissent." },
        { emoji: '💰', title: 'Royalties 50%', text: "Chaque sponsoring distribue automatiquement des royalties aux détenteurs. Sans intermédiaires." },
        { emoji: '👑', title: 'Window Challenge', text: "Remporte un tournoi et défie le champion en titre." },
        { emoji: '⚡', title: 'Interview AI', text: "L'agent SD sur WhatsApp vérifie ton profil. C'est ton passeport pour les compétitions." },
      ],
      greeting: (n) => n ? `BIENVENUE,\n${String(n).toUpperCase().split(' ')[0]} !` : 'TU ES UN ATHLÈTE SD !',
      sub: 'Profil athlète actif. Complète la vérification WhatsApp.',
      cta: '🔥 Aller au Dashboard', dashboard: '/dashboard-atleta', status: '⚔️ ATHLÈTE — EN ATTENTE',
    },
    fan: {
      slides: [
        { emoji: '🃏', title: 'Collectionne', text: "Chaque athlète SD a une card unique. Gagne des royalties quand il obtient des sponsors." },
        { emoji: '🎲', title: 'Marchés prédiction', text: "Utilise des Prediction Coins pour parier. Pas d'argent réel." },
        { emoji: '🏆', title: 'Fan Status', text: "Rookie → Enthusiast → Superfan → Legend → Hall of Fame." },
      ],
      greeting: (n) => n ? `BIENVENUE,\n${String(n).toUpperCase().split(' ')[0]} !` : 'TU ES DANS LE SYSTÈME !',
      sub: 'Inscrit dans la communauté SD.',
      cta: '🔥 Aller au Dashboard', dashboard: '/dashboard-fan', status: '👀 FAN — ACTIF',
    },
  },
  ar: {
    athlete: {
      slides: [
        { emoji: '🃏', title: 'بطاقتك', text: "كل رياضي SD لديه بطاقة فريدة. عندما تفوز ترتفع قيمتها." },
        { emoji: '💰', title: 'إتاوات 50%', text: "كل رعاية توزع إتاوات تلقائياً على حاملي بطاقاتك." },
        { emoji: '👑', title: 'تحدي النافذة', text: "اربح بطولة وتحدى البطل الحالي." },
        { emoji: '⚡', title: 'مقابلة AI', text: "وكيل SD يتحقق من ملفك على واتساب." },
      ],
      greeting: (n) => n ? `مرحباً،\n${String(n).split(' ')[0]}!` : 'أنت رياضي SD!',
      sub: 'ملفك الرياضي نشط. أكمل التحقق على واتساب.',
      cta: '🔥 لوحة التحكم', dashboard: '/dashboard-atleta', status: '⚔️ رياضي — في انتظار التحقق',
    },
    fan: {
      slides: [
        { emoji: '🃏', title: 'جمّع البطاقات', text: "اشترها واحصل على إتاوات عند حصول الرياضي على رعاة." },
        { emoji: '🎲', title: 'أسواق التنبؤ', text: "راهن على النتائج بعملات المجتمع." },
        { emoji: '🏆', title: 'مستوى المشجع', text: "مبتدئ → متحمس → مشجع فائق → أسطورة → قاعة المشاهير." },
      ],
      greeting: (n) => n ? `مرحباً،\n${String(n).split(' ')[0]}!` : 'أنت في النظام!',
      sub: 'أنت مسجل في مجتمع SD.',
      cta: '🔥 لوحة التحكم', dashboard: '/dashboard-fan', status: '👀 مشجع — نشط',
    },
  },
  de: {
    athlete: {
      slides: [
        { emoji: '🃏', title: 'Deine Card', text: "Jeder SD-Athlet hat eine einzigartige Card. Wenn du gewinnst, steigt ihr Wert." },
        { emoji: '💰', title: '50% Royalties', text: "Jedes Sponsoring verteilt automatisch Royalties an deine Card-Inhaber." },
        { emoji: '👑', title: 'Window Challenge', text: "Gewinn ein Turnier und fordere den Champion heraus." },
        { emoji: '⚡', title: 'AI Interview', text: "Der SD-Agent verifiziert dein Profil auf WhatsApp." },
      ],
      greeting: (n) => n ? `WILLKOMMEN,\n${String(n).toUpperCase().split(' ')[0]}!` : 'DU BIST EIN SD-ATHLET!',
      sub: 'Athletenprofil aktiv. Schließe die WhatsApp-Verifizierung ab.',
      cta: '🔥 Zum Dashboard', dashboard: '/dashboard-atleta', status: '⚔️ ATHLET — AUSSTEHEND',
    },
    fan: {
      slides: [
        { emoji: '🃏', title: 'Cards sammeln', text: "Verdiene Royalties wenn der Athlet Sponsoren bekommt." },
        { emoji: '🎲', title: 'Prediction Markets', text: "Wettkämpfe mit Prediction Coins ohne echtes Geld." },
        { emoji: '🏆', title: 'Fan-Status', text: "Rookie → Enthusiast → Superfan → Legend → Hall of Fame." },
      ],
      greeting: (n) => n ? `WILLKOMMEN,\n${String(n).toUpperCase().split(' ')[0]}!` : 'DU BIST IM SYSTEM!',
      sub: 'In der SD-Community registriert.',
      cta: '🔥 Zum Dashboard', dashboard: '/dashboard-fan', status: '👀 FAN — AKTIV',
    },
  },
};

export default function OnboardingStep5Welcome({ userData, onFinish, lang = 'it' }) {
  const navigate = useNavigate();
  const { name, role } = userData || {};
  const isAthlete = role === 'athlete';
  const langData = CONTENT[lang] || CONTENT.it;
  const C = isAthlete ? langData.athlete : langData.fan;

  const [slide, setSlide] = useState(0);
  const [allSeen, setAllSeen] = useState(false);
  const [direction, setDirection] = useState(1);

  // Auto-advance after 4s on each slide
  useEffect(() => {
    if (allSeen) return;
    const t = setTimeout(() => {
      if (slide < C.slides.length - 1) {
        setDirection(1);
        setSlide(s => s + 1);
      } else {
        setAllSeen(true);
      }
    }, 4000);
    return () => clearTimeout(t);
  }, [slide, allSeen, C.slides.length]);

  const goTo = (idx) => {
    setDirection(idx > slide ? 1 : -1);
    setSlide(idx);
    if (idx === C.slides.length - 1) setAllSeen(true);
  };

  const goNext = () => {
    if (slide < C.slides.length - 1) {
      setDirection(1);
      setSlide(s => s + 1);
      if (slide + 1 === C.slides.length - 1) setAllSeen(true);
    } else {
      setAllSeen(true);
    }
  };

  const goPrev = () => {
    if (slide > 0) { setDirection(-1); setSlide(s => s - 1); }
  };

  const handleEnter = () => {
    onFinish?.();
    navigate(C.dashboard);
  };

  return (
    <div className="relative z-10 flex flex-col items-center justify-center min-h-full px-5 py-8 max-w-lg mx-auto w-full text-center">

      {/* Header */}
      <motion.div initial={{ opacity: 0, scale: 0.88 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }} className="mb-5">
        <motion.img src={SD_LOGO} alt="SD"
          className="w-14 h-14 rounded-xl object-cover mx-auto mb-3"
          animate={{ filter: ['drop-shadow(0 0 14px rgba(255,100,0,0.7))', 'drop-shadow(0 0 28px rgba(255,150,0,1))', 'drop-shadow(0 0 14px rgba(255,100,0,0.7))'] }}
          transition={{ duration: 2.5, repeat: Infinity }} />

        <motion.h2 className="heading-fire text-[clamp(24px,6vw,48px)] font-black leading-tight mb-2 whitespace-pre-line"
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          {C.greeting(name)}
        </motion.h2>

        <motion.div initial={{ opacity: 0, scale: 0.82 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}
          className={`inline-block px-3 py-1 border font-mono text-[8px] tracking-[2px] uppercase mb-3 ${
            isAthlete ? 'border-fire-3/40 text-fire-4/80 bg-fire-3/8' : 'border-cyan-400/30 text-cyan-400/70 bg-cyan-400/5'
          }`}
          style={{ clipPath: 'polygon(4px 0%, 100% 0%, calc(100% - 4px) 100%, 0% 100%)' }}>
          {C.status}
        </motion.div>

        <p className="font-rajdhani text-sm text-white/40 max-w-sm mx-auto leading-relaxed">{C.sub}</p>
      </motion.div>

      {/* Slides */}
      <div className="w-full max-w-sm mb-5">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={slide}
            custom={direction}
            initial={{ opacity: 0, x: direction * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -40 }}
            transition={{ duration: 0.28 }}
            className={`border p-5 mb-3 ${isAthlete ? 'border-fire-3/20 bg-fire-3/5' : 'border-cyan-400/15 bg-cyan-400/5'}`}
            style={{ clipPath: 'polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))' }}
          >
            <div className="text-4xl mb-3">{C.slides[slide].emoji}</div>
            <h3 className={`font-orbitron font-bold text-base mb-2 ${isAthlete ? 'text-fire-4' : 'text-cyan-400'}`}>
              {C.slides[slide].title}
            </h3>
            <p className="font-rajdhani text-sm text-white/55 leading-relaxed">{C.slides[slide].text}</p>
          </motion.div>
        </AnimatePresence>

        {/* Slide nav */}
        <div className="flex items-center justify-between">
          <button onClick={goPrev} disabled={slide === 0}
            className={`p-1.5 transition-all ${slide === 0 ? 'opacity-0 cursor-default' : 'opacity-50 hover:opacity-100'}`}>
            <ChevronLeft size={16} className={isAthlete ? 'text-fire-3' : 'text-cyan-400'} />
          </button>

          <div className="flex gap-2 items-center">
            {C.slides.map((_, i) => (
              <button key={i} onClick={() => goTo(i)}
                className={`transition-all duration-300 rounded-full ${
                  i === slide ? `w-5 h-1.5 ${isAthlete ? 'bg-fire-3' : 'bg-cyan-400'}` :
                  i < slide  ? `w-1.5 h-1.5 ${isAthlete ? 'bg-fire-3/50' : 'bg-cyan-400/50'}` :
                  'w-1.5 h-1.5 bg-white/15'
                }`}
              />
            ))}
          </div>

          <button onClick={goNext} disabled={allSeen && slide === C.slides.length - 1}
            className={`p-1.5 transition-all ${allSeen && slide === C.slides.length - 1 ? 'opacity-0 cursor-default' : 'opacity-50 hover:opacity-100'}`}>
            <ChevronRight size={16} className={isAthlete ? 'text-fire-3' : 'text-cyan-400'} />
          </button>
        </div>
      </div>

      {/* CTA */}
      <motion.button
        animate={{ opacity: allSeen ? 1 : 0.3, scale: allSeen ? 1 : 0.97 }}
        transition={{ duration: 0.4 }}
        onClick={allSeen ? handleEnter : undefined}
        disabled={!allSeen}
        className={`btn-fire text-[13px] tracking-[4px] px-12 py-4 ${!allSeen ? 'opacity-30 cursor-not-allowed' : ''}`}
        whileHover={allSeen ? { scale: 1.05, boxShadow: '0 8px 40px rgba(255,100,0,0.6)' } : {}}
        whileTap={allSeen ? { scale: 0.97 } : {}}
      >
        {C.cta}
      </motion.button>

      {!allSeen && (
        <p className="font-mono text-[8px] text-white/18 mt-2">
          {slide + 1}/{C.slides.length} · auto-avanza…
        </p>
      )}
    </div>
  );
}