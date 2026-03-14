import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, AlertCircle, Shield, CheckCircle2 } from 'lucide-react';

export default function AgeVerification({ dateOfBirth, onVerified }) {
  const [verified, setVerified] = useState(false);
  const [ageCategory, setAgeCategory] = useState(null);

  React.useEffect(() => {
    if (!dateOfBirth) return;

    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    const category = {
      age,
      isMinor: age < 18,
      canCompete: age >= 13 && age <= 30,
      canPurchaseTokens: age >= 18,
      requiresParentalConsent: age < 18,
      legalStatus: age < 13 ? 'too_young' : age >= 13 && age < 18 ? 'minor' : age <= 30 ? 'adult' : 'over_age',
    };

    setAgeCategory(category);
    
    if (category.legalStatus === 'too_young') {
      onVerified(false, category);
    } else if (category.legalStatus === 'over_age') {
      onVerified(false, category);
    } else {
      setVerified(true);
      onVerified(true, category);
    }
  }, [dateOfBirth]);

  if (!dateOfBirth || !ageCategory) {
    return null;
  }

  // Too young (under 13)
  if (ageCategory.legalStatus === 'too_young') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-red-500/20 border-2 border-red-500/60 p-6 flex items-start gap-4"
      >
        <AlertCircle size={32} className="text-red-400 flex-shrink-0" />
        <div>
          <h4 className="font-orbitron font-bold text-lg text-red-400 mb-2">
            AGE RESTRICTION — REGISTRATION NOT PERMITTED
          </h4>
          <p className="font-rajdhani text-sm text-red-300 leading-relaxed mb-3">
            Street Dynamics events are open to participants aged 13-30 years. 
            You are currently {ageCategory.age} years old and do not meet the minimum age requirement.
          </p>
          <p className="font-mono text-xs text-red-400/80">
            Reason: Child protection regulations (GDPR Art. 8, UAE Child Protection Law). 
            Please contact support@streetdynamics.ae for information on junior programs.
          </p>
        </div>
      </motion.div>
    );
  }

  // Over age (over 30)
  if (ageCategory.legalStatus === 'over_age') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-fire-3/20 border-2 border-fire-3/60 p-6 flex items-start gap-4"
      >
        <AlertCircle size={32} className="text-fire-3 flex-shrink-0" />
        <div>
          <h4 className="font-orbitron font-bold text-lg text-fire-3 mb-2">
            AGE RESTRICTION — ATHLETE REGISTRATION CLOSED
          </h4>
          <p className="font-rajdhani text-sm text-fire-4 leading-relaxed mb-3">
            Street Dynamics competitive events are designed for youth athletes aged 13-30. 
            You are currently {ageCategory.age} years old.
          </p>
          <p className="font-mono text-xs text-fire-3/60">
            You may still attend as a spectator, purchase tokens/NFTs, and engage with the platform. 
            For exhibition matches or coaching opportunities, contact: partnerships@streetdynamics.ae
          </p>
        </div>
      </motion.div>
    );
  }

  // Minor (13-17)
  if (ageCategory.isMinor) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-cyan/10 border-2 border-cyan/40 p-6"
      >
        <div className="flex items-start gap-4 mb-4">
          <Shield size={28} className="text-cyan flex-shrink-0" />
          <div>
            <h4 className="font-orbitron font-bold text-lg text-cyan mb-2">
              MINOR PARTICIPANT — PARENTAL CONSENT REQUIRED
            </h4>
            <p className="font-rajdhani text-sm text-cyan/80 leading-relaxed">
              Age: <strong>{ageCategory.age} years</strong> — You are eligible to compete, 
              but parental/guardian consent is MANDATORY under GDPR Article 8 and UAE law.
            </p>
          </div>
        </div>

        <div className="bg-cyan/5 border border-cyan/20 p-4 space-y-2 font-mono text-xs text-cyan/70">
          <p className="flex items-center gap-2">
            <CheckCircle2 size={14} className="text-cyan" />
            ✓ Eligible to compete in events (age 13+)
          </p>
          <p className="flex items-center gap-2">
            <CheckCircle2 size={14} className="text-cyan" />
            ✓ Can appear in photos/videos (with parental consent)
          </p>
          <p className="flex items-center gap-2">
            <AlertCircle size={14} className="text-red-400" />
            ✗ Cannot purchase tokens or NFTs (requires age 18+)
          </p>
          <p className="flex items-center gap-2">
            <AlertCircle size={14} className="text-red-400" />
            ✗ Cannot receive royalty payments directly (parent custody required)
          </p>
        </div>

        <p className="font-mono text-xs text-cyan/60 mt-4">
          → Your parent/guardian must complete the form and signature on the next step.
        </p>
      </motion.div>
    );
  }

  // Adult (18-30)
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-green-500/10 border-2 border-green-500/40 p-5 flex items-start gap-4"
    >
      <CheckCircle2 size={28} className="text-green-400 flex-shrink-0" />
      <div>
        <h4 className="font-orbitron font-bold text-base text-green-400 mb-2">
          AGE VERIFIED — FULL PLATFORM ACCESS
        </h4>
        <p className="font-rajdhani text-sm text-green-300/90 leading-relaxed mb-3">
          Age: <strong>{ageCategory.age} years</strong> — You have complete access to all platform features.
        </p>
        <div className="font-mono text-xs text-green-400/70 space-y-1">
          <p>✓ Compete in all events</p>
          <p>✓ Purchase tokens and NFTs</p>
          <p>✓ Receive royalty payments</p>
          <p>✓ Trade on secondary market</p>
          <p>✓ Full governance voting rights</p>
        </div>
      </div>
    </motion.div>
  );
}