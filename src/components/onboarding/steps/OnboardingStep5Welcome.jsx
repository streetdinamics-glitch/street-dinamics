import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const SD_LOGO = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69b2e24ee21bc949528cccdd/5d1be983b_photo_2026-03-11_15-56-46.jpg";

const CONTENT = {
  it: {
    athlete: {
      slides: [
        { emoji: '🃏', title: 'La Tua Card', text: "Ogni atleta SD ha una card unica — come una figurina Panini. Quando vinci, la tua card aumenta di valore. I tuoi fan la tengono come investimento." },
        { emoji: '💰', title: 'Le Royalty', text: "Ogni volta che prendi uno sponsor, il 50% dei proventi va automaticamente agli holder delle tue card. Nessun intermediario." },
        { emoji: '👑', title: 'Window Challenge', text: "Vinci un torneo e puoi sfidare il campione in carica. La tua storia si svolge in tempo reale — e la tua card si muove con essa." },
        { emoji: '⚡', title: 'AI Interview', text: "L'agente SD su WhatsApp verificherà il tuo profilo. Rispondi onestamente — è il tuo passaporto verso le gare ufficiali." },
      ],
      greeting: (n) => n ? `BENVENUTO,\n${String(n).toUpperCase().split(' ')[0]}!` : 'SEI UN ATLETA SD!',
      sub: 'Il tuo profilo atleta è attivo. Completa la verifica su WhatsApp per accedere alle gare.',
      cta: '🔥 Accedi alla Dashboard',
      dashboard: '/dashboard-atleta',
      hint: 'Visualizza tutte le slide per continuare',
      status: '⚔️ ATLETA — IN ATTESA DI VERIFICA',
    },
    fan: {
      slides: [
        { emoji: '🃏', title: 'Colleziona Card', text: "Ogni atleta SD ha una card unica. Acquistala, tienila, e guadagna royalty quando l'atleta prende sponsor. Investimento reale." },
        { emoji: '🎲', title: 'Scommesse Etiche', text: "Usa i Prediction Coins per scommettere sugli outcome degli eventi. Nessun denaro reale — solo punti community che valgono premi." },
        { emoji: '🏆', title: 'Fan Status', text: "Più partecipi, più sali di livello: Rookie → Enthusiast → Superfan → Legend → Hall of Fame. Ogni tier sblocca perks esclusivi." },
      ],
      greeting: (n) => n ? `BENVENUTO,\n${String(n).toUpperCase().split(' ')[0]}!` : 'SEI NEL SISTEMA!',
      sub: 'Sei registrato nella community SD. Esplora gli eventi, segui gli atleti e inizia la tua collezione.',
      cta: '🔥 Accedi alla Dashboard',
      dashboard: '/dashboard-fan',
      hint: 'Visualizza tutte le slide per continuare',
      status: '👀 FAN — PROFILO ATTIVO',
    },
  },
  en: {
    athlete: {
      slides: [
        { emoji: '🃏', title: 'Your Card', text: "Every SD athlete has a unique card — like a Panini sticker. When you win, your card gains value. Your fans hold it as an investment." },
        { emoji: '💰', title: 'Royalties', text: "Every time you get a sponsor, 50% of earnings automatically goes to your card holders. No middlemen." },
        { emoji: '👑', title: 'Window Challenge', text: "Win a tournament and you can challenge the current champion. Your story unfolds in real time — and your card moves with it." },
        { emoji: '⚡', title: 'AI Interview', text: "The SD agent on WhatsApp will verify your profile. Answer honestly — it's your passport to official competitions." },
      ],
      greeting: (n) => n ? `WELCOME,\n${String(n).toUpperCase().split(' ')[0]}!` : 'YOU\'RE AN SD ATHLETE!',
      sub: 'Your athlete profile is active. Complete verification on WhatsApp to access competitions.',
      cta: '🔥 Go to Dashboard',
      dashboard: '/dashboard-atleta',
      hint: 'View all slides to continue',
      status: '⚔️ ATHLETE — PENDING VERIFICATION',
    },
    fan: {
      slides: [
        { emoji: '🃏', title: 'Collect Cards', text: "Every SD athlete has a unique card. Buy it, hold it, and earn royalties when the athlete gets sponsors. Real investment." },
        { emoji: '🎲', title: 'Ethical Betting', text: "Use Prediction Coins to bet on event outcomes. No real money — just community points worth prizes." },
        { emoji: '🏆', title: 'Fan Status', text: "The more you participate, the higher you climb: Rookie → Enthusiast → Superfan → Legend → Hall of Fame. Each tier unlocks exclusive perks." },
      ],
      greeting: (n) => n ? `WELCOME,\n${String(n).toUpperCase().split(' ')[0]}!` : 'YOU\'RE IN THE SYSTEM!',
      sub: 'You\'re registered in the SD community. Explore events, follow athletes, and start your collection.',
      cta: '🔥 Go to Dashboard',
      dashboard: '/dashboard-fan',
      hint: 'View all slides to continue',
      status: '👀 FAN — PROFILE ACTIVE',
    },
  },
  es: {
    athlete: {
      slides: [
        { emoji: '🃏', title: 'Tu Card', text: "Cada atleta SD tiene una card única. Cuando ganas, tu card aumenta de valor. Tus fans la guardan como inversión." },
        { emoji: '💰', title: 'Regalías', text: "Cada vez que consigues un sponsor, el 50% va automáticamente a los holders de tus cards. Sin intermediarios." },
        { emoji: '👑', title: 'Window Challenge', text: "Gana un torneo y puedes desafiar al campeón vigente. Tu historia se desarrolla en tiempo real." },
        { emoji: '⚡', title: 'Entrevista AI', text: "El agente SD en WhatsApp verificará tu perfil. Responde honestamente — es tu pasaporte a las competiciones oficiales." },
      ],
      greeting: (n) => n ? `BIENVENIDO,\n${String(n).toUpperCase().split(' ')[0]}!` : '¡ERES UN ATLETA SD!',
      sub: 'Tu perfil de atleta está activo. Completa la verificación en WhatsApp para acceder a las competiciones.',
      cta: '🔥 Ir al Dashboard',
      dashboard: '/dashboard-atleta',
      hint: 'Ve todas las slides para continuar',
      status: '⚔️ ATLETA — PENDIENTE DE VERIFICACIÓN',
    },
    fan: {
      slides: [
        { emoji: '🃏', title: 'Colecciona Cards', text: "Cada atleta SD tiene una card única. Cómprala y gana regalías cuando el atleta consiga sponsors." },
        { emoji: '🎲', title: 'Apuestas Éticas', text: "Usa Prediction Coins para apostar en los resultados. Sin dinero real — solo puntos que valen premios." },
        { emoji: '🏆', title: 'Fan Status', text: "Cuanto más participas, más subes: Rookie → Enthusiast → Superfan → Legend → Hall of Fame." },
      ],
      greeting: (n) => n ? `BIENVENIDO,\n${String(n).toUpperCase().split(' ')[0]}!` : '¡ESTÁS EN EL SISTEMA!',
      sub: 'Estás registrado en la comunidad SD. Explora eventos, sigue atletas y empieza tu colección.',
      cta: '🔥 Ir al Dashboard',
      dashboard: '/dashboard-fan',
      hint: 'Ve todas las slides para continuar',
      status: '👀 FAN — PERFIL ACTIVO',
    },
  },
  fr: {
    athlete: {
      slides: [
        { emoji: '🃏', title: 'Ta Card', text: "Chaque athlète SD a une card unique. Quand tu gagnes, ta card prend de la valeur. Tes fans la détiennent comme investissement." },
        { emoji: '💰', title: 'Royalties', text: "À chaque sponsoring, 50% va automatiquement aux détenteurs de tes cards. Sans intermédiaires." },
        { emoji: '👑', title: 'Window Challenge', text: "Remporte un tournoi et tu peux défier le champion en titre. Ton histoire se déroule en temps réel." },
        { emoji: '⚡', title: 'Interview AI', text: "L'agent SD sur WhatsApp vérifiera ton profil. Réponds honnêtement — c'est ton passeport pour les compétitions officielles." },
      ],
      greeting: (n) => n ? `BIENVENUE,\n${String(n).toUpperCase().split(' ')[0]} !` : 'TU ES UN ATHLÈTE SD !',
      sub: 'Ton profil athlète est actif. Complète la vérification sur WhatsApp pour accéder aux compétitions.',
      cta: '🔥 Aller au Dashboard',
      dashboard: '/dashboard-atleta',
      hint: 'Vois toutes les slides pour continuer',
      status: '⚔️ ATHLÈTE — EN ATTENTE DE VÉRIFICATION',
    },
    fan: {
      slides: [
        { emoji: '🃏', title: 'Collectionne des Cards', text: "Chaque athlète SD a une card unique. Achète-la et gagne des royalties quand l'athlète obtient des sponsors." },
        { emoji: '🎲', title: 'Paris Éthiques', text: "Utilise les Prediction Coins pour parier sur les résultats. Pas d'argent réel — juste des points valant des récompenses." },
        { emoji: '🏆', title: 'Fan Status', text: "Plus tu participes, plus tu montes : Rookie → Enthusiast → Superfan → Legend → Hall of Fame." },
      ],
      greeting: (n) => n ? `BIENVENUE,\n${String(n).toUpperCase().split(' ')[0]} !` : 'TU ES DANS LE SYSTÈME !',
      sub: 'Tu es inscrit dans la communauté SD. Explore les événements, suis des athlètes et commence ta collection.',
      cta: '🔥 Aller au Dashboard',
      dashboard: '/dashboard-fan',
      hint: 'Vois toutes les slides pour continuer',
      status: '👀 FAN — PROFIL ACTIF',
    },
  },
  ar: {
    athlete: {
      slides: [
        { emoji: '🃏', title: 'بطاقتك', text: "كل رياضي SD لديه بطاقة فريدة. عندما تفوز، تزداد قيمة بطاقتك. مشجعوك يحتفظون بها كاستثمار." },
        { emoji: '💰', title: 'الإتاوات', text: "في كل مرة تحصل على راعٍ، 50٪ تذهب تلقائياً لحاملي بطاقاتك. بدون وسطاء." },
        { emoji: '👑', title: 'تحدي النافذة', text: "اربح بطولة ويمكنك تحدي البطل الحالي. قصتك تتكشف في الوقت الحقيقي." },
        { emoji: '⚡', title: 'مقابلة AI', text: "وكيل SD على واتساب سيتحقق من ملفك. أجب بصدق — هذا جواز سفرك للمسابقات الرسمية." },
      ],
      greeting: (n) => n ? `مرحباً،\n${String(n).split(' ')[0]}!` : 'أنت رياضي SD!',
      sub: 'ملفك الرياضي نشط. أكمل التحقق على واتساب للوصول إلى المسابقات.',
      cta: '🔥 اذهب إلى لوحة التحكم',
      dashboard: '/dashboard-atleta',
      hint: 'اعرض جميع الشرائح للمتابعة',
      status: '⚔️ رياضي — في انتظار التحقق',
    },
    fan: {
      slides: [
        { emoji: '🃏', title: 'جمّع البطاقات', text: "كل رياضي SD لديه بطاقة فريدة. اشترها واحصل على إتاوات عندما يحصل الرياضي على رعاة." },
        { emoji: '🎲', title: 'رهانات أخلاقية', text: "استخدم عملات التنبؤ للرهان على النتائج. لا مال حقيقي — فقط نقاط تستحق جوائز." },
        { emoji: '🏆', title: 'مستوى المشجع', text: "كلما شاركت أكثر، ارتفعت أكثر: مبتدئ → متحمس → مشجع فائق → أسطورة → قاعة المشاهير." },
      ],
      greeting: (n) => n ? `مرحباً،\n${String(n).split(' ')[0]}!` : 'أنت في النظام!',
      sub: 'أنت مسجل في مجتمع SD. استكشف الأحداث وتابع الرياضيين وابدأ مجموعتك.',
      cta: '🔥 اذهب إلى لوحة التحكم',
      dashboard: '/dashboard-fan',
      hint: 'اعرض جميع الشرائح للمتابعة',
      status: '👀 مشجع — الملف نشط',
    },
  },
  de: {
    athlete: {
      slides: [
        { emoji: '🃏', title: 'Deine Card', text: "Jeder SD-Athlet hat eine einzigartige Card. Wenn du gewinnst, steigt ihr Wert. Deine Fans halten sie als Investment." },
        { emoji: '💰', title: 'Royalties', text: "Jedes Sponsoring: 50% geht automatisch an deine Card-Inhaber. Keine Zwischenhändler." },
        { emoji: '👑', title: 'Window Challenge', text: "Gewinn ein Turnier und du kannst den amtierenden Champion herausfordern. Deine Geschichte entfaltet sich in Echtzeit." },
        { emoji: '⚡', title: 'AI Interview', text: "Der SD-Agent auf WhatsApp verifiziert dein Profil. Antworte ehrlich — das ist dein Pass zu offiziellen Wettkämpfen." },
      ],
      greeting: (n) => n ? `WILLKOMMEN,\n${String(n).toUpperCase().split(' ')[0]}!` : 'DU BIST EIN SD-ATHLET!',
      sub: 'Dein Athletenprofil ist aktiv. Schließe die Verifizierung auf WhatsApp ab, um an Wettkämpfen teilzunehmen.',
      cta: '🔥 Zum Dashboard',
      dashboard: '/dashboard-atleta',
      hint: 'Sieh alle Slides um fortzufahren',
      status: '⚔️ ATHLET — AUSSTEHENDE VERIFIZIERUNG',
    },
    fan: {
      slides: [
        { emoji: '🃏', title: 'Cards sammeln', text: "Jeder SD-Athlet hat eine einzigartige Card. Kauf sie und verdiene Royalties, wenn der Athlet Sponsoren bekommt." },
        { emoji: '🎲', title: 'Ethisches Wetten', text: "Nutze Prediction Coins zum Wetten auf Ergebnisse. Kein echtes Geld — nur Punkte wert Prämien." },
        { emoji: '🏆', title: 'Fan-Status', text: "Je mehr du teilnimmst, desto höher steigst du: Rookie → Enthusiast → Superfan → Legend → Hall of Fame." },
      ],
      greeting: (n) => n ? `WILLKOMMEN,\n${String(n).toUpperCase().split(' ')[0]}!` : 'DU BIST IM SYSTEM!',
      sub: 'Du bist in der SD-Community registriert. Entdecke Events, folge Athleten und starte deine Sammlung.',
      cta: '🔥 Zum Dashboard',
      dashboard: '/dashboard-fan',
      hint: 'Sieh alle Slides um fortzufahren',
      status: '👀 FAN — PROFIL AKTIV',
    },
  },
};

export default function OnboardingStep5Welcome({ userData, onFinish, lang = 'it' }) {
  const navigate = useNavigate();
  const langData = CONTENT[lang] || CONTENT.it;
  const { name, role } = userData || {};
  const isAthlete = role === 'athlete';
  const C = isAthlete ? langData.athlete : langData.fan;

  const [slide, setSlide] = useState(0);
  const [allSeen, setAllSeen] = useState(false);

  const goNext = () => {
    const next = slide + 1;
    if (next >= C.slides.length) {
      setAllSeen(true);
    } else {
      setSlide(next);
    }
  };

  const handleEnter = () => {
    onFinish?.();
    navigate(C.dashboard);
  };

  return (
    <div className="relative z-10 flex flex-col items-center justify-center min-h-full px-5 py-10 max-w-lg mx-auto w-full text-center">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7 }}
        className="mb-6"
      >
        <motion.img
          src={SD_LOGO}
          alt="SD"
          className="w-16 h-16 rounded-xl object-cover mx-auto mb-4"
          animate={{ filter: [
            'drop-shadow(0 0 16px rgba(255,100,0,0.7))',
            'drop-shadow(0 0 30px rgba(255,150,0,1))',
            'drop-shadow(0 0 16px rgba(255,100,0,0.7))',
          ]}}
          transition={{ duration: 2.5, repeat: Infinity }}
        />

        <motion.h2
          className="heading-fire text-[clamp(26px,6vw,52px)] font-black leading-tight mb-2 whitespace-pre-line"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {C.greeting(name)}
        </motion.h2>

        {/* Role badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className={`inline-block px-3 py-1 border font-mono text-[9px] tracking-[2px] uppercase mb-3 ${
            isAthlete ? 'border-fire-3/40 text-fire-4/80 bg-fire-3/8' : 'border-cyan-400/30 text-cyan-400/70 bg-cyan-400/5'
          }`}
          style={{ clipPath: 'polygon(4px 0%, 100% 0%, calc(100% - 4px) 100%, 0% 100%)' }}
        >
          {C.status}
        </motion.div>

        <p className="font-rajdhani text-sm text-white/45 max-w-sm mx-auto leading-relaxed">
          {C.sub}
        </p>
      </motion.div>

      {/* Slides */}
      <div className="w-full max-w-sm mb-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3 }}
            className={`border p-5 mb-4 ${
              isAthlete ? 'border-fire-3/20 bg-fire-3/5' : 'border-cyan-400/15 bg-cyan-400/5'
            }`}
            style={{ clipPath: 'polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))' }}
          >
            <div className="text-4xl mb-3">{C.slides[slide].emoji}</div>
            <h3 className={`font-orbitron font-bold text-base mb-2 ${isAthlete ? 'text-fire-4' : 'text-cyan-400'}`}>
              {C.slides[slide].title}
            </h3>
            <p className="font-rajdhani text-sm text-white/55 leading-relaxed">
              {C.slides[slide].text}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Slide navigation */}
        <div className="flex items-center justify-between">
          <div className="flex gap-1.5">
            {C.slides.map((_, i) => (
              <div
                key={i}
                className={`transition-all duration-300 rounded-full ${
                  i === slide
                    ? `w-5 h-1.5 ${isAthlete ? 'bg-fire-3' : 'bg-cyan-400'}`
                    : i < slide
                    ? `w-1.5 h-1.5 ${isAthlete ? 'bg-fire-3/40' : 'bg-cyan-400/40'}`
                    : 'w-1.5 h-1.5 bg-white/10'
                }`}
              />
            ))}
          </div>
          {!allSeen && slide < C.slides.length - 1 && (
            <button
              onClick={goNext}
              className="btn-ghost text-[10px] tracking-[2px] px-4 py-2"
            >
              →
            </button>
          )}
          {!allSeen && slide === C.slides.length - 1 && (
            <button
              onClick={goNext}
              className={`font-orbitron text-[10px] tracking-[2px] px-4 py-2 border transition-all ${
                isAthlete ? 'border-fire-3/40 text-fire-4 hover:bg-fire-3/10' : 'border-cyan-400/40 text-cyan-400 hover:bg-cyan-400/10'
              }`}
            >
              ✓
            </button>
          )}
        </div>
      </div>

      {!allSeen && (
        <p className="font-mono text-[9px] text-white/20 mb-4">{C.hint}</p>
      )}

      {/* CTA */}
      <motion.div
        animate={{ opacity: allSeen ? 1 : 0.25 }}
        transition={{ duration: 0.4 }}
      >
        <motion.button
          onClick={allSeen ? handleEnter : undefined}
          disabled={!allSeen}
          className={`btn-fire text-[13px] tracking-[4px] px-12 py-4 ${!allSeen ? 'opacity-30 cursor-not-allowed' : ''}`}
          whileHover={allSeen ? { scale: 1.05, boxShadow: '0 8px 40px rgba(255,100,0,0.6)' } : {}}
          whileTap={allSeen ? { scale: 0.97 } : {}}
        >
          {C.cta}
        </motion.button>
      </motion.div>
    </div>
  );
}