import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from '../translations';

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
  const fileInputRef = useRef(null);

  const updateUser = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: () => onComplete?.(),
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
    const userData = {
      user_type: userType,
      role: userType === 'athlete' ? 'athlete' : 'spectator',
      phone: formData.phone,
      date_of_birth: formData.date_of_birth,
      country: formData.country,
      city: formData.city,
      avatar_url: formData.avatar_url,
      onboarding_completed: true,
      preferences: {
        language: lang,
        notifications_enabled: true,
        email_updates: true,
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
        
        {/* Step 1: Choose Type */}
        {step === 1 && (
          <div className="animate-[fadeUp_0.35s_ease]">
            <h2 className="text-fire-gradient font-orbitron font-black text-3xl tracking-[2px] mb-2 text-center">
              WELCOME TO STREET DINAMICS
            </h2>
            <p className="font-mono text-[11px] tracking-[3px] uppercase text-fire-3/30 mb-8 text-center">
              Choose Your Path
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <button
                onClick={() => { setUserType('athlete'); setStep(2); }}
                className="relative group p-8 bg-gradient-to-br from-fire-3/10 to-fire-2/5 border-2 border-fire-3/20 hover:border-fire-3 transition-all"
              >
                <div className="text-5xl mb-4">🏅</div>
                <div className="font-orbitron font-bold text-xl text-fire-4 mb-2">ATHLETE</div>
                <div className="font-rajdhani text-sm text-fire-3/40 leading-relaxed">
                  Compete in events, build your profile, earn tokens, and grow your fan base
                </div>
              </button>

              <button
                onClick={() => { setUserType('spectator'); setStep(2); }}
                className="relative group p-8 bg-gradient-to-br from-cyan/10 to-cyan/5 border-2 border-cyan/20 hover:border-cyan transition-all"
              >
                <div className="text-5xl mb-4">🎫</div>
                <div className="font-orbitron font-bold text-xl text-cyan mb-2">SPECTATOR</div>
                <div className="font-rajdhani text-sm text-cyan/60 leading-relaxed">
                  Watch events, support athletes, collect tokens, and win prizes
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Profile Info */}
        {step === 2 && (
          <div className="animate-[fadeUp_0.35s_ease]">
            <h2 className="text-fire-gradient font-orbitron font-black text-2xl tracking-[2px] mb-1">
              {userType === 'athlete' ? 'ATHLETE PROFILE' : 'SPECTATOR PROFILE'}
            </h2>
            <p className="font-mono text-[11px] tracking-[3px] uppercase text-fire-3/30 mb-6">
              Complete Your Profile
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
                {uploading ? '⏳ Uploading...' : formData.avatar_url ? '✓ Photo Uploaded' : '📸 Upload Photo'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="font-mono text-[11px] tracking-[2px] uppercase text-fire-3/30 block mb-1">Phone</label>
                <input
                  className="cyber-input"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="font-mono text-[11px] tracking-[2px] uppercase text-fire-3/30 block mb-1">Date of Birth</label>
                <input
                  type="date"
                  className="cyber-input"
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="font-mono text-[11px] tracking-[2px] uppercase text-fire-3/30 block mb-1">Country</label>
                <input
                  className="cyber-input"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                />
              </div>
              <div>
                <label className="font-mono text-[11px] tracking-[2px] uppercase text-fire-3/30 block mb-1">City</label>
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
                  <label className="font-mono text-[11px] tracking-[2px] uppercase text-fire-3/30 block mb-1">Sports (comma-separated)</label>
                  <input
                    className="cyber-input"
                    placeholder="e.g. Parkour, BMX, Skateboarding"
                    value={formData.sports.join(', ')}
                    onChange={(e) => setFormData({ ...formData, sports: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                  />
                </div>
                <div className="mb-4">
                  <label className="font-mono text-[11px] tracking-[2px] uppercase text-fire-3/30 block mb-1">Bio</label>
                  <textarea
                    className="cyber-input h-24"
                    placeholder="Tell us about yourself and your journey..."
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  />
                </div>
              </>
            )}

            {userType === 'spectator' && (
              <div className="mb-4">
                <label className="font-mono text-[11px] tracking-[2px] uppercase text-fire-3/30 block mb-1">Favorite Sports (comma-separated)</label>
                <input
                  className="cyber-input"
                  placeholder="e.g. Parkour, BMX, Skateboarding"
                  value={formData.favorite_sports.join(', ')}
                  onChange={(e) => setFormData({ ...formData, favorite_sports: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                />
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep(1)} className="btn-ghost py-3 px-5">← Back</button>
              <button
                onClick={handleSubmit}
                disabled={updateUser.isPending || !formData.phone || !formData.date_of_birth}
                className="btn-fire flex-1 py-3 disabled:opacity-20"
              >
                {updateUser.isPending ? 'Creating Profile...' : '✓ Complete Setup'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}