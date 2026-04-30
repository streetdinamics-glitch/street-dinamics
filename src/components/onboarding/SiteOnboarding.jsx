import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import OnboardingStep1Splash from './steps/OnboardingStep1Splash.jsx';
import OnboardingStep2Social from './steps/OnboardingStep2Social.jsx';
import OnboardingStep3Register from './steps/OnboardingStep3Register.jsx';
import OnboardingStep4WhatsApp from './steps/OnboardingStep4WhatsApp.jsx';
import OnboardingStep5Welcome from './steps/OnboardingStep5Welcome.jsx';

const STORAGE_KEY = 'sd_onboarding_complete';

export function useSiteOnboarding() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const done = localStorage.getItem(STORAGE_KEY);
    if (!done) setShow(true);
  }, []);

  const complete = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setShow(false);
  };

  return { show, complete };
}

const TOTAL_STEPS = 4; // steps 2-5 (step 1 is splash)

export default function SiteOnboarding({ onComplete, lang = 'it' }) {
  const [step, setStep] = useState(1);
  const [userData, setUserData] = useState({});

  const next = (data = {}) => {
    setUserData(prev => ({ ...prev, ...data }));
    setStep(s => s + 1);
  };

  const finish = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    onComplete?.();
  };

  // Steps 2,3,4 are the trackable ones (1 = splash, 5 = welcome/finish)
  const progressStep = step >= 2 && step <= 4 ? step - 1 : null; // 1,2,3

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center overflow-hidden">
      <div className="cyber-grid" />
      <div className="cyber-scanlines" />
      <div className="cyber-vignette" />

      {/* Progress — dots + bar, only steps 2-4, NOT clickable */}
      {progressStep !== null && (
        <div className="absolute top-5 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10 w-48">
          <div className="flex gap-2">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i < progressStep ? 'bg-fire-3' : i === progressStep ? 'bg-fire-5 scale-125' : 'bg-white/10'
                }`}
              />
            ))}
          </div>
          <div className="h-[2px] w-full bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-fire-3 to-fire-5 transition-all duration-500"
              style={{ width: `${(progressStep / 3) * 100}%` }}
            />
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -60 }} className="w-full h-full">
            <OnboardingStep1Splash lang={lang} onNext={() => next()} />
          </motion.div>
        )}
        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -60 }} className="w-full h-full overflow-y-auto">
            <OnboardingStep2Social lang={lang} onNext={() => next()} />
          </motion.div>
        )}
        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -60 }} className="w-full h-full overflow-y-auto">
            <OnboardingStep3Register lang={lang} onNext={(data) => next(data)} />
          </motion.div>
        )}
        {step === 4 && (
          <motion.div key="step4" initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -60 }} className="w-full h-full overflow-y-auto">
            <OnboardingStep4WhatsApp lang={lang} userData={userData} onNext={() => next()} />
          </motion.div>
        )}
        {step === 5 && (
          <motion.div key="step5" initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="w-full h-full overflow-y-auto">
            <OnboardingStep5Welcome lang={lang} userData={userData} onFinish={finish} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}