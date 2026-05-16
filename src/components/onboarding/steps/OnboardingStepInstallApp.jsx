import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Smartphone, Share, PlusSquare, MoreVertical, Chrome, ChevronRight } from 'lucide-react';

const LABELS = {
  it: {
    title: 'Installa l\'App',
    subtitle: 'Aggiungi Street Dinamics alla schermata home per un\'esperienza nativa.',
    ios_title: '📱 iPhone / iPad (Safari)',
    ios_steps: [
      'Apri questa pagina in Safari',
      'Tocca l\'icona "Condividi" (□↑) in basso',
      'Scorri e seleziona "Aggiungi a schermata Home"',
      'Tocca "Aggiungi" in alto a destra',
    ],
    android_title: '🤖 Android (Chrome)',
    android_steps: [
      'Apri questa pagina in Chrome',
      'Tocca i 3 puntini (⋮) in alto a destra',
      'Seleziona "Aggiungi a schermata Home"',
      'Conferma toccando "Aggiungi"',
    ],
    skip: 'Salta per ora',
    cta: 'Ho installato l\'App!',
    already: 'Sei già in modalità app',
    pwa_badge: '✦ NESSUN APP STORE RICHIESTO',
  },
  en: {
    title: 'Install the App',
    subtitle: 'Add Street Dinamics to your home screen for a native experience.',
    ios_title: '📱 iPhone / iPad (Safari)',
    ios_steps: [
      'Open this page in Safari',
      'Tap the Share icon (□↑) at the bottom',
      'Scroll and tap "Add to Home Screen"',
      'Tap "Add" in the top right',
    ],
    android_title: '🤖 Android (Chrome)',
    android_steps: [
      'Open this page in Chrome',
      'Tap the 3-dot menu (⋮) in the top right',
      'Select "Add to Home Screen"',
      'Confirm by tapping "Add"',
    ],
    skip: 'Skip for now',
    cta: 'I\'ve installed it!',
    already: 'Already running as app',
    pwa_badge: '✦ NO APP STORE REQUIRED',
  },
  es: {
    title: 'Instala la App',
    subtitle: 'Añade Street Dinamics a tu pantalla de inicio.',
    ios_title: '📱 iPhone / iPad (Safari)',
    ios_steps: [
      'Abre esta página en Safari',
      'Toca el icono "Compartir" (□↑) abajo',
      'Desplázate y selecciona "Añadir a inicio"',
      'Toca "Añadir" arriba a la derecha',
    ],
    android_title: '🤖 Android (Chrome)',
    android_steps: [
      'Abre esta página en Chrome',
      'Toca los 3 puntos (⋮) arriba a la derecha',
      'Selecciona "Añadir a pantalla de inicio"',
      'Confirma tocando "Añadir"',
    ],
    skip: 'Omitir por ahora',
    cta: '¡Ya la instalé!',
    already: 'Ya en modo app',
    pwa_badge: '✦ SIN APP STORE',
  },
  fr: {
    title: 'Installer l\'App',
    subtitle: 'Ajoutez Street Dinamics à votre écran d\'accueil.',
    ios_title: '📱 iPhone / iPad (Safari)',
    ios_steps: [
      'Ouvrez cette page dans Safari',
      'Appuyez sur l\'icône "Partager" (□↑) en bas',
      'Faites défiler et sélectionnez "Sur l\'écran d\'accueil"',
      'Appuyez sur "Ajouter" en haut à droite',
    ],
    android_title: '🤖 Android (Chrome)',
    android_steps: [
      'Ouvrez cette page dans Chrome',
      'Appuyez sur les 3 points (⋮) en haut à droite',
      'Sélectionnez "Ajouter à l\'écran d\'accueil"',
      'Confirmez en appuyant sur "Ajouter"',
    ],
    skip: 'Passer pour l\'instant',
    cta: 'App installée !',
    already: 'Déjà en mode app',
    pwa_badge: '✦ SANS APP STORE',
  },
  ar: {
    title: 'تثبيت التطبيق',
    subtitle: 'أضف Street Dinamics إلى شاشتك الرئيسية.',
    ios_title: '📱 iPhone / iPad (Safari)',
    ios_steps: [
      'افتح هذه الصفحة في Safari',
      'اضغط على أيقونة "مشاركة" (□↑) في الأسفل',
      'مرر واختر "إضافة إلى الشاشة الرئيسية"',
      'اضغط "إضافة" في الأعلى',
    ],
    android_title: '🤖 Android (Chrome)',
    android_steps: [
      'افتح هذه الصفحة في Chrome',
      'اضغط على النقاط الثلاث (⋮) في الأعلى',
      'اختر "إضافة إلى الشاشة الرئيسية"',
      'اضغط "إضافة" للتأكيد',
    ],
    skip: 'تخطي الآن',
    cta: 'لقد قمت بالتثبيت!',
    already: 'يعمل بالفعل كتطبيق',
    pwa_badge: '✦ بدون متجر تطبيقات',
  },
  de: {
    title: 'App installieren',
    subtitle: 'Füge Street Dinamics zum Home-Bildschirm hinzu.',
    ios_title: '📱 iPhone / iPad (Safari)',
    ios_steps: [
      'Öffne diese Seite in Safari',
      'Tippe auf das "Teilen"-Symbol (□↑) unten',
      'Scrolle und wähle "Zum Home-Bildschirm"',
      'Tippe oben rechts auf "Hinzufügen"',
    ],
    android_title: '🤖 Android (Chrome)',
    android_steps: [
      'Öffne diese Seite in Chrome',
      'Tippe auf die 3 Punkte (⋮) oben rechts',
      'Wähle "Zum Startbildschirm hinzufügen"',
      'Bestätige mit "Hinzufügen"',
    ],
    skip: 'Jetzt überspringen',
    cta: 'App installiert!',
    already: 'Läuft bereits als App',
    pwa_badge: '✦ KEIN APP STORE NÖTIG',
  },
};

function StepList({ steps }) {
  return (
    <div className="space-y-2">
      {steps.map((s, i) => (
        <div key={i} className="flex items-start gap-3">
          <div className="w-5 h-5 rounded-full bg-fire-3/20 border border-fire-3/40 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="font-mono text-[9px] text-fire-4">{i + 1}</span>
          </div>
          <span className="font-rajdhani text-sm text-white/70 leading-snug">{s}</span>
        </div>
      ))}
    </div>
  );
}

export default function OnboardingStepInstallApp({ lang = 'it', onNext, onSkip }) {
  const L = LABELS[lang] || LABELS.it;
  const [isStandalone, setIsStandalone] = useState(false);
  const [activeTab, setActiveTab] = useState('ios');

  useEffect(() => {
    const standalone =
      window.navigator.standalone === true ||
      window.matchMedia('(display-mode: standalone)').matches;
    setIsStandalone(standalone);

    // Auto-detect OS to pre-select the right tab
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes('android')) setActiveTab('android');
    else setActiveTab('ios');
  }, []);

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center px-5 py-16 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm flex flex-col gap-5"
      >
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 mb-3 border border-fire-3/30 bg-fire-3/10">
            <Smartphone size={26} className="text-fire-4" />
          </div>
          <h2 className="font-orbitron text-xl font-bold text-fire-5 mb-1">{L.title}</h2>
          <p className="font-rajdhani text-sm text-white/50">{L.subtitle}</p>
          <div className="mt-2 inline-block font-mono text-[8px] tracking-[2px] text-fire-3/40 border border-fire-3/15 px-2 py-0.5">
            {L.pwa_badge}
          </div>
        </div>

        {/* Already standalone */}
        {isStandalone ? (
          <div className="border border-fire-3/30 bg-fire-3/10 p-4 text-center">
            <span className="font-orbitron text-sm text-fire-5">✓ {L.already}</span>
          </div>
        ) : (
          <>
            {/* OS Tabs */}
            <div className="flex border border-fire-3/20 overflow-hidden">
              <button
                onClick={() => setActiveTab('ios')}
                className={`flex-1 py-2 font-orbitron text-[9px] tracking-[1px] uppercase transition-all ${
                  activeTab === 'ios'
                    ? 'bg-fire-3/20 text-fire-5 border-r border-fire-3/20'
                    : 'bg-transparent text-white/25 border-r border-fire-3/10 hover:text-white/50'
                }`}
              >
                iOS / Safari
              </button>
              <button
                onClick={() => setActiveTab('android')}
                className={`flex-1 py-2 font-orbitron text-[9px] tracking-[1px] uppercase transition-all ${
                  activeTab === 'android'
                    ? 'bg-fire-3/20 text-fire-5'
                    : 'bg-transparent text-white/25 hover:text-white/50'
                }`}
              >
                Android / Chrome
              </button>
            </div>

            {/* Instructions */}
            <div className="border border-fire-3/15 bg-black/40 p-4">
              <div className="font-mono text-[9px] tracking-[1.5px] uppercase text-fire-3/50 mb-3">
                {activeTab === 'ios' ? L.ios_title : L.android_title}
              </div>
              <StepList steps={activeTab === 'ios' ? L.ios_steps : L.android_steps} />
            </div>

            {/* Visual hint */}
            {activeTab === 'ios' && (
              <div className="flex items-center justify-center gap-4 py-2">
                <div className="flex items-center gap-1 text-white/20">
                  <Share size={14} />
                  <span className="font-mono text-[8px]">Share</span>
                </div>
                <ChevronRight size={10} className="text-white/15" />
                <div className="flex items-center gap-1 text-white/20">
                  <PlusSquare size={14} />
                  <span className="font-mono text-[8px]">Add</span>
                </div>
              </div>
            )}
            {activeTab === 'android' && (
              <div className="flex items-center justify-center gap-4 py-2">
                <div className="flex items-center gap-1 text-white/20">
                  <Chrome size={14} />
                  <span className="font-mono text-[8px]">Chrome</span>
                </div>
                <ChevronRight size={10} className="text-white/15" />
                <div className="flex items-center gap-1 text-white/20">
                  <MoreVertical size={14} />
                  <span className="font-mono text-[8px]">Menu</span>
                </div>
              </div>
            )}
          </>
        )}

        {/* CTAs */}
        <div className="flex flex-col gap-2 mt-1">
          <button
            onClick={onNext}
            className="btn-fire w-full"
          >
            {isStandalone ? '→ Continua' : L.cta} →
          </button>
          {!isStandalone && (
            <button
              onClick={onSkip}
              className="font-mono text-[9px] tracking-[1px] text-white/20 hover:text-white/40 transition-colors text-center py-1"
            >
              {L.skip}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}