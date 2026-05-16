import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import OnboardingStep1Splash from './steps/OnboardingStep1Splash.jsx';
import OnboardingStep2Social from './steps/OnboardingStep2Social.jsx';
import OnboardingStep3Register from './steps/OnboardingStep3Register.jsx';
import OnboardingStep4WhatsApp from './steps/OnboardingStep4WhatsApp.jsx';
import OnboardingStepInstallApp from './steps/OnboardingStepInstallApp.jsx';
import OnboardingStep5Welcome from './steps/OnboardingStep5Welcome.jsx';
import { ChevronLeft } from 'lucide-react';

const STORAGE_KEY = 'sd_onboarding_complete';

export function useSiteOnboarding(userAlreadyDone = false) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (userAlreadyDone) {
      localStorage.setItem(STORAGE_KEY, 'true');
      setShow(false);
      return;
    }
    const done = localStorage.getItem(STORAGE_KEY);
    if (!done) setShow(true);
  }, [userAlreadyDone]);

  const complete = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setShow(false);
  };

  return { show, complete };
}

const STEP_LABELS = {
  it: ['Community', 'Profilo', 'WhatsApp', 'App', 'Benvenuto'],
  en: ['Community', 'Profile', 'WhatsApp', 'App', 'Welcome'],
  es: ['Comunidad', 'Perfil', 'WhatsApp', 'App', 'Bienvenida'],
  fr: ['Communauté', 'Profil', 'WhatsApp', 'App', 'Bienvenue'],
  ar: ['المجتمع', 'الملف', 'واتساب', 'تطبيق', 'مرحباً'],
  de: ['Community', 'Profil', 'WhatsApp', 'App', 'Willkommen'],
};

export default function SiteOnboarding({ onComplete, lang: initialLang = 'it', onLangChange }) {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [userData, setUserData] = useState({});
  const [lang, setLang] = useState(initialLang);

  const handleLangChange = (newLang) => {
    setLang(newLang);
    onLangChange?.(newLang);
  };

  const next = (data = {}) => {
    setUserData(prev => ({ ...prev, ...data }));
    setDirection(1);
    setStep(s => s + 1);
  };

  const back = () => {
    if (step <= 1) return;
    setDirection(-1);
    setStep(s => s - 1);
  };

  const finish = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    onComplete?.();
  };

  // Steps 2-6 are progress-tracked (1 = splash only)
  const progressStep = step >= 2 && step <= 6 ? step - 1 : null; // 1,2,3,4,5
  const TOTAL = 5;
  const labels = STEP_LABELS[lang] || STEP_LABELS.it;

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center overflow-hidden">
      <div className="cyber-grid" />
      <div className="cyber-scanlines" />
      <div className="cyber-vignette" />

      {/* Progress bar + labels */}
      {progressStep !== null && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10 w-[min(340px,88vw)]">
          {/* Step dots with labels */}
          <div className="flex items-start justify-between w-full px-1">
            {labels.map((label, i) => {
              const idx = i + 1;
              const done = idx < progressStep;
              const active = idx === progressStep;
              return (
                <div key={i} className="flex flex-col items-center gap-1" style={{ minWidth: 0, flex: 1 }}>
                  <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    done ? 'bg-fire-3' : active ? 'bg-fire-5 scale-125' : 'bg-white/10'
                  }`} />
                  <span className={`font-mono text-[7px] tracking-[0.5px] leading-tight text-center transition-colors ${
                    done ? 'text-fire-3/60' : active ? 'text-fire-5' : 'text-white/15'
                  }`} style={{ maxWidth: 52, wordBreak: 'keep-all' }}>
                    {active ? <strong>{label}</strong> : label}
                  </span>
                </div>
              );
            })}
          </div>
          {/* Progress bar */}
          <div className="h-[2px] w-full bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-fire-3 to-fire-5"
              animate={{ width: `${(progressStep / TOTAL) * 100}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>
      )}

      {/* Back button — steps 2-5 only (not on welcome step) */}
      {step >= 2 && step <= 5 && (
        <button
          onClick={back}
          className="absolute top-[72px] left-3 z-20 flex items-center gap-1 font-mono text-[9px] text-white/25 hover:text-white/50 transition-colors py-2 px-2"
        >
          <ChevronLeft size={13} /> back
        </button>
      )}

      <AnimatePresence mode="wait" custom={direction}>
        {step === 1 && (
          <motion.div key="step1" custom={direction}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -60 }}
            className="w-full h-full">
            <OnboardingStep1Splash lang={lang} onNext={() => next()} onLangChange={handleLangChange} />
          </motion.div>
        )}
        {step === 2 && (
          <motion.div key="step2" custom={direction}
            initial={{ opacity: 0, x: direction * 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: direction * -60 }}
            className="w-full h-full overflow-y-auto">
            <OnboardingStep2Social lang={lang} onNext={() => next()} />
          </motion.div>
        )}
        {step === 3 && (
          <motion.div key="step3" custom={direction}
            initial={{ opacity: 0, x: direction * 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: direction * -60 }}
            className="w-full h-full overflow-y-auto">
            <OnboardingStep3Register lang={lang} onNext={(data) => next(data)} />
          </motion.div>
        )}
        {step === 4 && (
          <motion.div key="step4" custom={direction}
            initial={{ opacity: 0, x: direction * 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: direction * -60 }}
            className="w-full h-full overflow-y-auto">
            <OnboardingStep4WhatsApp lang={lang} userData={userData} onNext={() => next()} />
          </motion.div>
        )}
        {step === 5 && (
          <motion.div key="step5" custom={direction}
            initial={{ opacity: 0, x: direction * 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: direction * -60 }}
            className="w-full h-full overflow-y-auto">
            <OnboardingStepInstallApp lang={lang} onNext={() => next()} onSkip={() => next()} />
          </motion.div>
        )}
        {step === 6 && (
          <motion.div key="step6" custom={direction}
            initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
            className="w-full h-full overflow-y-auto">
            <OnboardingStep5Welcome lang={lang} userData={userData} onFinish={finish} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}