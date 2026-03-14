/**
 * Athlete Onboarding Wizard
 * Multi-step onboarding: profile → social → verification → escrow eligibility
 */

import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, CheckCircle, Lock } from 'lucide-react';
import { toast } from 'sonner';
import ProfileSetupStep from './steps/ProfileSetupStep';
import SocialMediaStep from './steps/SocialMediaStep';
import IdentityVerificationStep from './steps/IdentityVerificationStep';
import EscrowEligibilityStep from './steps/EscrowEligibilityStep';

const STEPS = [
  { id: 'profile', title: 'Profile Setup', description: 'Basic athlete information' },
  { id: 'social', title: 'Social Media', description: 'Link accounts for reach calculation' },
  { id: 'identity', title: 'Verify Identity', description: 'KYC verification for escrow' },
  { id: 'escrow', title: 'Escrow Ready', description: 'Confirm eligibility status' },
];

export default function AthleteOnboardingWizard({ user, onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [profileData, setProfileData] = useState({
    nickname: '',
    bio: '',
    sports: [],
    city: '',
    country: '',
    team_name: '',
  });
  const [socialData, setSocialData] = useState({
    instagram: '',
    youtube: '',
    tiktok: '',
    twitter: '',
    calculatedReach: 0,
  });
  const [verificationData, setVerificationData] = useState({
    id_document_url: '',
    verification_status: 'pending',
    verified_at: null,
  });
  const queryClient = useQueryClient();

  const completeMutation = useMutation({
    mutationFn: async () => {
      // Update user profile with all collected data
      const updatePayload = {
        nickname: profileData.nickname,
        bio: profileData.bio,
        sports: profileData.sports,
        city: profileData.city,
        country: profileData.country,
        team_name: profileData.team_name,
        instagram: socialData.instagram,
        youtube: socialData.youtube,
        tiktok: socialData.tiktok,
        twitter: socialData.twitter,
        calculated_reach: socialData.calculatedReach,
        id_document_url: verificationData.id_document_url,
        verification_status: 'verified',
        verified_at: new Date().toISOString(),
        escrow_eligible: true,
        onboarding_completed: true,
      };

      await base44.auth.updateMe(updatePayload);

      // Send completion email
      await base44.integrations.Core.SendEmail({
        to: user.email,
        subject: 'Welcome to Street Dynamics - Onboarding Complete',
        body: `Welcome ${user.full_name}!

Your profile has been successfully set up:
- Profile: ${profileData.nickname || user.full_name}
- Sports: ${profileData.sports.join(', ')}
- Calculated Reach: ${socialData.calculatedReach.toLocaleString()} followers
- Escrow Status: Eligible ✓

You can now:
✓ Apply for sponsorship deals
✓ Participate in tournaments
✓ Receive escrow-backed payments
✓ Earn tokens and royalties

Happy competing!`,
      });

      return updatePayload;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['current-user'] });
      toast.success('Onboarding complete! Welcome to Street Dynamics!');
      onComplete?.();
    },
    onError: (error) => {
      toast.error('Onboarding failed: ' + error.message);
    },
  });

  const handleNext = async () => {
    if (currentStep === STEPS.length - 1) {
      completeMutation.mutate();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: // Profile
        return profileData.nickname && profileData.sports.length > 0;
      case 1: // Social
        return true; // Optional but at least one should be linked
      case 2: // Identity
        return verificationData.id_document_url;
      case 3: // Escrow
        return true; // Just confirmation
      default:
        return false;
    }
  };

  return (
    <div className="fixed inset-0 z-[800] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-4xl bg-gradient-to-br from-[rgba(10,4,18,0.99)] to-[rgba(4,2,8,1)] border border-fire-3/20 rounded-lg p-8"
      >
        <div className="absolute top-0 left-0 right-0 fire-line" />

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            {STEPS.map((step, idx) => (
              <div key={step.id} className="flex items-center">
                <motion.div
                  animate={{
                    scale: idx === currentStep ? 1.1 : 1,
                    backgroundColor:
                      idx < currentStep
                        ? 'rgba(0, 255, 136, 0.2)'
                        : idx === currentStep
                        ? 'rgba(255, 102, 0, 0.2)'
                        : 'rgba(255, 102, 0, 0.05)',
                  }}
                  className="flex items-center justify-center w-12 h-12 rounded-full border-2 border-fire-3/30 cursor-pointer transition-all"
                  onClick={() => idx <= currentStep && setCurrentStep(idx)}
                >
                  {idx < currentStep ? (
                    <CheckCircle size={24} className="text-green-400" />
                  ) : idx === currentStep ? (
                    <div className="w-6 h-6 rounded-full bg-fire-3 animate-pulse" />
                  ) : (
                    <Lock size={20} className="text-fire-3/40" />
                  )}
                </motion.div>

                {idx < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 rounded transition-all ${
                      idx < currentStep
                        ? 'bg-green-500'
                        : 'bg-fire-3/20'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="text-center">
            <h2 className="text-fire-gradient font-orbitron font-black text-2xl mb-1">
              {STEPS[currentStep].title}
            </h2>
            <p className="font-rajdhani text-fire-3/60">
              {STEPS[currentStep].description}
            </p>
          </div>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="mb-8 min-h-[300px]"
          >
            {currentStep === 0 && (
              <ProfileSetupStep
                data={profileData}
                onChange={setProfileData}
              />
            )}
            {currentStep === 1 && (
              <SocialMediaStep
                data={socialData}
                onChange={setSocialData}
                userEmail={user.email}
              />
            )}
            {currentStep === 2 && (
              <IdentityVerificationStep
                data={verificationData}
                onChange={setVerificationData}
              />
            )}
            {currentStep === 3 && (
              <EscrowEligibilityStep
                profileData={profileData}
                socialData={socialData}
                verificationData={verificationData}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex gap-3 pt-6 border-t border-fire-3/10">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className="flex-1 bg-fire-3/10 border border-fire-3/20 text-fire-3 font-orbitron font-bold py-3 rounded hover:bg-fire-3/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            BACK
          </button>

          <button
            onClick={handleNext}
            disabled={!canProceed() || completeMutation.isPending}
            className="flex-1 bg-gradient-to-r from-fire-3 to-fire-4 text-black font-orbitron font-bold py-3 rounded hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {completeMutation.isPending
              ? 'COMPLETING...'
              : currentStep === STEPS.length - 1
              ? 'COMPLETE'
              : 'NEXT'}
            {!completeMutation.isPending && <ChevronRight size={18} />}
          </button>
        </div>
      </motion.div>
    </div>
  );
}