import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from '../translations';
import OnboardingTerms from '../legal/OnboardingTerms';
import AgeVerification from '../legal/AgeVerification';
import GDPRConsentManager from '../legal/GDPRConsentManager';

export default function OnboardingFlow({ user, onComplete, lang }) {
  const t = useTranslation(lang);
  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState('');
  const [formData, setFormData] = useState({
    phone: '',
    date_of_birth: '',
    country: '',
    city: '',
    sports: [],
    bio: '',
    favorite_sports: [],
  });
  const [uploading, setUploading] = useState(false);
  const [ageVerified, setAgeVerified] = useState(null);
  const [ageCategory, setAgeCategory] = useState(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [gdprConsents, setGdprConsents] = useState({});
  const fileInputRef = useRef(null);

  const updateUser = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: () => {
      setStep(3);
    },
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({ ...prev, avatar_url: file_url }));
    } catch (err) {
      alert('Upload failed. Try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = () => {
    if (!termsAccepted) {
      alert('You must accept the Terms of Service to continue.');
      return;
    }

    if (!ageVerified || !ageCategory) {
      alert('Age verification is required.');
      return;
    }

    if (ageCategory.isMinor) {
      alert('Minors cannot complete self-registration. Parental consent is required during event registration.');
      return;
    }

    const userData = {
      user_type: userType,
      role: userType === 'athlete' ? 'athlete' : 'spectator',
      phone: formData.phone,
      date_of_birth: formData.date_of_birth,
      age_at_registration: ageCategory.age,
      is_minor: ageCategory.isMinor,
      country: formData.country,
      city: formData.city,
      avatar_url: formData.avatar_url,
      onboarding_completed: true,
      // GDPR compliance
      gdpr_consents: gdprConsents,
      marketing_consent: gdprConsents.marketing || false,
      image_rights_consent: gdprConsents.imageRights || false,
      tokenization_consent: gdprConsents.tokenization || false,
      cross_border_consent: gdprConsents.crossBorder || false,
      gdpr_consent_date: new Date().toISOString(),
      terms_version: '1.2',
      terms_accepted_date: new Date().toISOString(),
      preferences: {
        language: lang,
        notifications_enabled: gdprConsents.marketing || false,
        email_updates: gdprConsents.marketing || false,
      },
    };

    if (userType === 'athlete') {
      userData.athlete_profile = {
        sports: formData.sports,
        bio: formData.bio,
        social_links: {},
        achievements: [],
        verification_status: 'pending',
      };
    } else if (userType === 'spectator') {
      userData.spectator_profile = {
        favorite_sports: formData.favorite_sports,
        favorite_athletes: [],
      };
    }

    updateUser.mutate(userData);
  };

  return (
    <div className="fixed inset-0 z-[500] bg-black/98 backdrop-blur-2xl flex items-center justify-center overflow-y-auto p-4">
      <div className="relative w-full max-w-[700px] bg-gradient-to-br from-[rgba(10,4,18,0.99)] to-[rgba(4,2,8,1)] border border-fire-3/20 clip-cyber p-8 my-auto">
        <div className="absolute top-0 left-0 right-0 fire-line" />
        
        {/* Step 1: Terms of Service */}
        {step === 1 && userType === '' && (
          <div className="animate-[fadeUp_0.35s_ease]">
            <h2 className="text-fire-gradient font-orbitron font-black text-2xl tracking-[2px] mb-2 text-center">
              TERMS OF SERVICE
            </h2>
            <p className="font-mono text-[11px] tracking-[3px] uppercase text-fire-3/30 mb-6 text-center">
              Please Read Carefully
            </p>

            <div className="bg-black/60 border border-fire-3/10 p-4 max-h-[320px] overflow-y-auto mb-4">
              <OnboardingTerms userType="general" />
            </div>

            <label className="flex items-start gap-3 cursor-pointer mb-6">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="w-4 h-4 mt-1 accent-fire-3"
              />
              <span className="text-sm text-fire-3/40 leading-snug">
                I have read, understood, and accept the Street Dynamics Terms of Service, Privacy Policy, 
                and agree to comply with all platform rules and regulations.
              </span>
            </label>

            <button
              disabled={!termsAccepted}
              onClick={() => setStep(2)}
              className="btn-fire w-full py-3 disabled:opacity-20 disabled:cursor-not-allowed"
            >
              ACCEPT & CONTINUE →
            </button>
          </div>
        )}

        {/* Step 2: Choose Type */}
        {step === 2 && userType === '' && (
          <div className="animate-[fadeUp_0.35s_ease]">
            <h2 className="text-fire-gradient font-orbitron font-black text-3xl tracking-[2px] mb-2 text-center">
              {t('onboard_welcome')}
            </h2>
            <p className="font-mono text-[11px] tracking-[3px] uppercase text-fire-3/30 mb-8 text-center">
              {t('onboard_choose')}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <button
                onClick={() => { setUserType('athlete'); setStep(3); }}
                className="relative group p-8 bg-gradient-to-br from-fire-3/10 to-fire-2/5 border-2 border-fire-3/20 hover:border-fire-3 transition-all"
              >
                <div className="text-5xl mb-4">🏅</div>
                <div className="font-orbitron font-bold text-xl text-fire-4 mb-2">{t('onboard_athlete')}</div>
                <div className="font-rajdhani text-sm text-fire-3/40 leading-relaxed">
                  {t('onboard_athlete_desc')}
                </div>
              </button>

              <button
                onClick={() => { setUserType('spectator'); setStep(3); }}
                className="relative group p-8 bg-gradient-to-br from-cyan/10 to-cyan/5 border-2 border-cyan/20 hover:border-cyan transition-all"
              >
                <div className="text-5xl mb-4">🎫</div>
                <div className="font-orbitron font-bold text-xl text-cyan mb-2">{t('onboard_spectator')}</div>
                <div className="font-rajdhani text-sm text-cyan/60 leading-relaxed">
                  {t('onboard_spectator_desc')}
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Step 3: GDPR Consents */}
        {step === 3 && userType && !updateUser.isSuccess && (
          <div className="animate-[fadeUp_0.35s_ease]">
            <h2 className="text-fire-gradient font-orbitron font-black text-2xl tracking-[2px] mb-2 text-center">
              DATA PROTECTION
            </h2>
            <p className="font-mono text-[11px] tracking-[3px] uppercase text-fire-3/30 mb-6 text-center">
              GDPR Consent Preferences
            </p>

            <div className="max-h-[400px] overflow-y-auto mb-6">
              <GDPRConsentManager
                type={userType}
                onConsentChange={setGdprConsents}
              />
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="btn-ghost py-3 px-5">← Back</button>
              <button
                disabled={Object.keys(gdprConsents).length === 0}
                onClick={() => setStep(4)}
                className="btn-fire flex-1 py-3 disabled:opacity-20"
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Profile Info */}
        {step === 4 && userType && !updateUser.isSuccess && (
          <div className="animate-[fadeUp_0.35s_ease] text-center py-8">
            <div className="text-6xl mb-6">✓</div>
            <h2 className="text-fire-gradient font-orbitron font-black text-2xl tracking-[2px] mb-3">
              {t('onboard_complete').toUpperCase()}
            </h2>
            <p className="font-rajdhani text-base text-fire-4/60 mb-6 leading-relaxed max-w-md mx-auto">
              {userType === 'athlete' 
                ? 'Your athlete profile is ready! You can now register for events and start competing.'
                : 'Your spectator profile is ready! You can now get tickets and support your favorite athletes.'}
            </p>
            <button
              onClick={() => onComplete?.()}
              className="btn-fire py-3 px-8"
            >
              START EXPLORING →
            </button>
          </div>
        )}


          <div className="animate-[fadeUp_0.35s_ease]">
            <h2 className="text-fire-gradient font-orbitron font-black text-2xl tracking-[2px] mb-1">
              {userType === 'athlete' ? t('onboard_athlete').toUpperCase() : t('onboard_spectator').toUpperCase()} {t('onboard_profile_title').split(' ')[0].toUpperCase()}
            </h2>
            <p className="font-mono text-[11px] tracking-[3px] uppercase text-fire-3/30 mb-6">
              {t('onboard_profile_title')}
            </p>

            {/* Avatar Upload */}
            <div className="mb-6 text-center">
              <div className="w-24 h-24 mx-auto mb-3 rounded-full bg-fire-3/10 border border-fire-3/20 flex items-center justify-center overflow-hidden">
                {formData.avatar_url ? (
                  <img src={formData.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl">👤</span>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="btn-ghost text-[10px] py-2 px-4"
              >
                {uploading ? '⏳...' : formData.avatar_url ? '✓' : `📸 ${t('onboard_photo')}`}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="font-mono text-[11px] tracking-[2px] uppercase text-fire-3/30 block mb-1">{t('onboard_phone')}</label>
                <input
                  type="tel"
                  className="cyber-input"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+971 XX XXX XXXX"
                />
              </div>
              <div>
                <label className="font-mono text-[11px] tracking-[2px] uppercase text-fire-3/30 block mb-1">{t('onboard_dob')} *</label>
                <input
                  type="date"
                  className="cyber-input"
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                  max={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
            </div>

            {/* Age Verification */}
            {formData.date_of_birth && (
              <div className="mb-4">
                <AgeVerification
                  dateOfBirth={formData.date_of_birth}
                  onVerified={(verified, category) => {
                    setAgeVerified(verified);
                    setAgeCategory(category);
                  }}
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="font-mono text-[11px] tracking-[2px] uppercase text-fire-3/30 block mb-1">{t('onboard_country')}</label>
                <input
                  className="cyber-input"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                />
              </div>
              <div>
                <label className="font-mono text-[11px] tracking-[2px] uppercase text-fire-3/30 block mb-1">{t('onboard_city')}</label>
                <input
                  className="cyber-input"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>
            </div>

            {userType === 'athlete' && (
              <>
                <div className="mb-4">
                  <label className="font-mono text-[11px] tracking-[2px] uppercase text-fire-3/30 block mb-1">{t('onboard_sports')}</label>
                  <input
                    className="cyber-input"
                    placeholder={t('onboard_sports_placeholder')}
                    value={formData.sports.join(', ')}
                    onChange={(e) => setFormData({ ...formData, sports: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                  />
                </div>
                <div className="mb-4">
                  <label className="font-mono text-[11px] tracking-[2px] uppercase text-fire-3/30 block mb-1">{t('onboard_bio')}</label>
                  <textarea
                    className="cyber-input h-24"
                    placeholder={t('onboard_bio_placeholder')}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  />
                </div>
              </>
            )}

            {userType === 'spectator' && (
              <div className="mb-4">
                <label className="font-mono text-[11px] tracking-[2px] uppercase text-fire-3/30 block mb-1">{t('onboard_fav_sports')}</label>
                <input
                  className="cyber-input"
                  placeholder={t('onboard_sports_placeholder')}
                  value={formData.favorite_sports.join(', ')}
                  onChange={(e) => setFormData({ ...formData, favorite_sports: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                />
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep(3)} className="btn-ghost py-3 px-5">← {t('onboard_back')}</button>
              <button
                onClick={handleSubmit}
                disabled={updateUser.isPending || !formData.phone || !formData.date_of_birth || !ageVerified || ageCategory?.isMinor}
                className="btn-fire flex-1 py-3 disabled:opacity-20"
              >
                {updateUser.isPending ? t('onboard_creating') : `✓ ${t('onboard_complete')}`}
              </button>
            </div>
            
            {ageCategory?.isMinor && (
              <p className="text-center font-mono text-xs text-red-400 mt-3">
                Minors cannot complete independent onboarding. Please register through an event with parental consent.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}