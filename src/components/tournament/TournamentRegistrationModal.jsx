import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, AlertCircle, Trophy, User, Calendar, Shield } from 'lucide-react';
import { toast } from 'sonner';

export default function TournamentRegistrationModal({ event, tournament, onClose, onSuccess }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    discipline: '',
    experience_level: '',
    team_name: '',
    emergency_contact: '',
    emergency_phone: '',
    medical_conditions: '',
    terms_accepted: false,
  });
  const [errors, setErrors] = useState({});
  const queryClient = useQueryClient();

  const disciplines = [
    'Parkour',
    'BMX',
    'Skateboarding',
    'Street Basketball',
    'Breaking',
    'Street Soccer',
    'Scooter',
    'Inline Skating',
  ];

  const experienceLevels = [
    { value: 'beginner', label: 'Beginner (0-1 years)' },
    { value: 'intermediate', label: 'Intermediate (1-3 years)' },
    { value: 'advanced', label: 'Advanced (3-5 years)' },
    { value: 'professional', label: 'Professional (5+ years)' },
  ];

  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const registerMutation = useMutation({
    mutationFn: async (data) => {
      const user = await base44.auth.me();
      
      // Validate age for tournament
      if (!user.date_of_birth) {
        throw new Error('Date of birth is required. Please complete your profile first.');
      }
      
      const birthDate = new Date(user.date_of_birth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      if (age < 13 || age > 30) {
        throw new Error('Tournament participants must be between 13-30 years old.');
      }
      
      const isMinor = age < 18;
      
      // Create tournament participant record
      const participant = await base44.entities.TournamentParticipant.create({
        tournament_id: tournament.id,
        event_id: event.id,
        user_email: user.email,
        user_name: user.full_name || user.nickname || user.email.split('@')[0],
        discipline: data.discipline,
        experience_level: data.experience_level,
        team_name: data.team_name || null,
        emergency_contact: data.emergency_contact,
        emergency_phone: data.emergency_phone,
        medical_conditions: data.medical_conditions || null,
        status: isMinor ? 'pending' : 'registered',
        registration_date: new Date().toISOString(),
        age_at_registration: age,
        is_minor: isMinor,
        terms_accepted: true,
        terms_version: '1.2',
        terms_accepted_date: new Date().toISOString(),
      });

      // Update user profile with discipline if not already set
      if (!user.sports || !user.sports.includes(data.discipline)) {
        const updatedSports = [...(user.sports || []), data.discipline];
        await base44.auth.updateMe({ sports: updatedSports });
      }

      return participant;
    },
    onSuccess: (participant) => {
      queryClient.invalidateQueries({ queryKey: ['tournament-participants'] });
      queryClient.invalidateQueries({ queryKey: ['current-user'] });
      setStep(4);
      setTimeout(() => {
        onSuccess?.(participant);
        onClose();
      }, 3000);
    },
    onError: (error) => {
      toast.error('Registration failed. Please try again.');
      console.error(error);
    },
  });

  const validateStep = (currentStep) => {
    const newErrors = {};

    if (currentStep === 1) {
      if (!formData.discipline) newErrors.discipline = 'Please select a discipline';
      if (!formData.experience_level) newErrors.experience_level = 'Please select your experience level';
    }

    if (currentStep === 2) {
      if (!formData.emergency_contact) newErrors.emergency_contact = 'Emergency contact name is required';
      if (!formData.emergency_phone) newErrors.emergency_phone = 'Emergency phone is required';
      else if (!/^\+?[\d\s-()]+$/.test(formData.emergency_phone)) {
        newErrors.emergency_phone = 'Please enter a valid phone number';
      }
    }

    if (currentStep === 3) {
      if (!formData.terms_accepted) newErrors.terms_accepted = 'You must accept the terms to continue';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      if (step === 3) {
        registerMutation.mutate(formData);
      } else {
        setStep(step + 1);
      }
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const updateField = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl bg-gradient-to-br from-[rgba(10,4,18,0.98)] to-[rgba(4,2,8,0.99)] border border-fire-3/30 clip-cyber relative max-h-[90vh] overflow-y-auto"
      >
        <div className="absolute top-0 left-0 right-0 fire-line" />
        
        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="heading-fire text-3xl font-black mb-2">TOURNAMENT REGISTRATION</h2>
              <p className="font-mono text-xs text-fire-3/40 tracking-[2px]">{event.title}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 border border-fire-3/20 hover:border-fire-3/40 hover:bg-fire-3/5 transition-all"
            >
              <X size={18} className="text-fire-3" />
            </button>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center justify-between mb-8">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-orbitron font-bold text-xs transition-all ${
                  step >= s 
                    ? 'border-fire-3 bg-fire-3 text-black' 
                    : 'border-fire-3/20 bg-transparent text-fire-3/40'
                }`}>
                  {step > s ? <Check size={16} /> : s}
                </div>
                {s < 4 && (
                  <div className={`flex-1 h-[2px] mx-2 transition-all ${
                    step > s ? 'bg-fire-3' : 'bg-fire-3/20'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Step Content */}
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <label className="font-orbitron text-sm font-bold text-fire-4 mb-2 flex items-center gap-2">
                    <Trophy size={16} />
                    SELECT DISCIPLINE *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {disciplines.map((disc) => (
                      <button
                        key={disc}
                        onClick={() => updateField('discipline', disc)}
                        className={`p-3 border text-left font-rajdhani font-semibold text-sm transition-all ${
                          formData.discipline === disc
                            ? 'border-fire-3 bg-fire-3/20 text-fire-5'
                            : 'border-fire-3/20 bg-fire-3/5 text-fire-3/60 hover:border-fire-3/40 hover:bg-fire-3/10'
                        }`}
                      >
                        {disc}
                      </button>
                    ))}
                  </div>
                  {errors.discipline && (
                    <p className="text-red-400 text-xs font-mono mt-1 flex items-center gap-1">
                      <AlertCircle size={12} /> {errors.discipline}
                    </p>
                  )}
                </div>

                <div>
                  <label className="font-orbitron text-sm font-bold text-fire-4 mb-2 block">
                    EXPERIENCE LEVEL *
                  </label>
                  <div className="space-y-2">
                    {experienceLevels.map((level) => (
                      <button
                        key={level.value}
                        onClick={() => updateField('experience_level', level.value)}
                        className={`w-full p-3 border text-left font-rajdhani font-semibold text-sm transition-all ${
                          formData.experience_level === level.value
                            ? 'border-fire-3 bg-fire-3/20 text-fire-5'
                            : 'border-fire-3/20 bg-fire-3/5 text-fire-3/60 hover:border-fire-3/40 hover:bg-fire-3/10'
                        }`}
                      >
                        {level.label}
                      </button>
                    ))}
                  </div>
                  {errors.experience_level && (
                    <p className="text-red-400 text-xs font-mono mt-1 flex items-center gap-1">
                      <AlertCircle size={12} /> {errors.experience_level}
                    </p>
                  )}
                </div>

                <div>
                  <label className="font-orbitron text-sm font-bold text-fire-4 mb-2 block">
                    TEAM NAME (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.team_name}
                    onChange={(e) => updateField('team_name', e.target.value)}
                    placeholder="Enter team name if competing as a team"
                    className="cyber-input"
                  />
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <label className="font-orbitron text-sm font-bold text-fire-4 mb-2 block">
                    EMERGENCY CONTACT NAME *
                  </label>
                  <input
                    type="text"
                    value={formData.emergency_contact}
                    onChange={(e) => updateField('emergency_contact', e.target.value)}
                    placeholder="Full name of emergency contact"
                    className="cyber-input"
                  />
                  {errors.emergency_contact && (
                    <p className="text-red-400 text-xs font-mono mt-1 flex items-center gap-1">
                      <AlertCircle size={12} /> {errors.emergency_contact}
                    </p>
                  )}
                </div>

                <div>
                  <label className="font-orbitron text-sm font-bold text-fire-4 mb-2 block">
                    EMERGENCY CONTACT PHONE *
                  </label>
                  <input
                    type="tel"
                    value={formData.emergency_phone}
                    onChange={(e) => updateField('emergency_phone', e.target.value)}
                    placeholder="+971 XX XXX XXXX"
                    className="cyber-input"
                  />
                  {errors.emergency_phone && (
                    <p className="text-red-400 text-xs font-mono mt-1 flex items-center gap-1">
                      <AlertCircle size={12} /> {errors.emergency_phone}
                    </p>
                  )}
                </div>

                <div>
                  <label className="font-orbitron text-sm font-bold text-fire-4 mb-2 block">
                    MEDICAL CONDITIONS (Optional)
                  </label>
                  <textarea
                    value={formData.medical_conditions}
                    onChange={(e) => updateField('medical_conditions', e.target.value)}
                    placeholder="Any medical conditions, allergies, or special requirements we should know about"
                    className="cyber-input h-24 resize-none"
                  />
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="bg-fire-3/10 border border-fire-3/20 p-6">
                  <h3 className="font-orbitron font-bold text-lg text-fire-5 mb-4">REVIEW YOUR REGISTRATION</h3>
                  
                  <div className="space-y-3 font-rajdhani text-sm">
                    <div className="flex justify-between">
                      <span className="text-fire-3/60">Event:</span>
                      <span className="text-fire-4 font-semibold">{event.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-fire-3/60">Discipline:</span>
                      <span className="text-fire-4 font-semibold">{formData.discipline}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-fire-3/60">Experience:</span>
                      <span className="text-fire-4 font-semibold capitalize">{formData.experience_level}</span>
                    </div>
                    {formData.team_name && (
                      <div className="flex justify-between">
                        <span className="text-fire-3/60">Team:</span>
                        <span className="text-fire-4 font-semibold">{formData.team_name}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-fire-3/60">Emergency Contact:</span>
                      <span className="text-fire-4 font-semibold">{formData.emergency_contact}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-fire-3/5 border border-fire-3/20 p-6">
                  <h4 className="font-orbitron font-bold text-sm text-fire-4 mb-3 flex items-center gap-2">
                    <Shield size={16} />
                    TOURNAMENT PARTICIPATION AGREEMENT
                  </h4>
                  <div className="font-mono text-xs text-fire-3/60 space-y-2 max-h-64 overflow-y-auto leading-relaxed">
                    <p><strong className="text-fire-4">ASSUMPTION OF RISK:</strong> I understand competitive sports involve inherent risks including physical injury, equipment failure, and medical emergencies. I voluntarily assume all such risks.</p>
                    
                    <p><strong className="text-fire-4">FITNESS DECLARATION:</strong> I certify I am in good physical health with no medical conditions that would prevent safe participation. I have disclosed all relevant medical information.</p>
                    
                    <p><strong className="text-fire-4">FAIR PLAY COMMITMENT:</strong> I agree to compete with integrity, respect all participants, judges, and organizers, and comply with anti-doping regulations (WADA standards if applicable).</p>
                    
                    <p><strong className="text-fire-4">IMAGE RIGHTS:</strong> I grant Street Dynamics Holding FZE permission to capture, use, and distribute photos/videos of my participation for promotional purposes, social media, and NFT minting.</p>
                    
                    <p><strong className="text-fire-4">LIABILITY RELEASE:</strong> I release Street Dynamics Holding FZE from liability for injuries, property damage, or losses, except in cases of gross negligence or willful misconduct.</p>
                    
                    <p><strong className="text-fire-4">SAFETY COMPLIANCE:</strong> I will follow all safety guidelines, wear required protective equipment, and immediately report any unsafe conditions to event staff.</p>
                    
                    <p><strong className="text-fire-4">DISCIPLINE & CONDUCT:</strong> I understand violations of the Code of Conduct may result in disqualification, forfeiture of prizes, and permanent ban from future events.</p>
                    
                    <p><strong className="text-fire-4">EMERGENCY AUTHORIZATION:</strong> I authorize Street Dynamics staff to seek emergency medical treatment on my behalf if I am incapacitated and my emergency contact cannot be reached.</p>
                    
                    <p><strong className="text-fire-4">GOVERNING LAW:</strong> This agreement is governed by DIFC law (Dubai). Disputes resolved via arbitration per DIFC-LCIA rules.</p>
                    
                    {formData.medical_conditions && (
                      <div className="mt-3 pt-3 border-t border-fire-3/20">
                        <p className="text-fire-5"><strong>MEDICAL DISCLOSURE ACKNOWLEDGED:</strong> Event staff will be informed of your medical conditions for safety purposes only.</p>
                      </div>
                    )}
                  </div>
                  
                  <label className="flex items-start gap-3 mt-4 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.terms_accepted}
                      onChange={(e) => updateField('terms_accepted', e.target.checked)}
                      className="mt-1"
                    />
                    <span className="font-rajdhani text-sm text-fire-4">
                      I have read and accept the tournament terms and conditions *
                    </span>
                  </label>
                  {errors.terms_accepted && (
                    <p className="text-red-400 text-xs font-mono mt-2 flex items-center gap-1">
                      <AlertCircle size={12} /> {errors.terms_accepted}
                    </p>
                  )}
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="w-24 h-24 rounded-full bg-gradient-to-br from-fire-3 to-fire-5 flex items-center justify-center mx-auto mb-6"
                >
                  <Check size={48} className="text-black" />
                </motion.div>
                
                <h3 className="heading-fire text-3xl font-black mb-3">REGISTRATION COMPLETE!</h3>
                <p className="font-rajdhani text-lg text-fire-4/80 mb-6">
                  You're officially registered for the tournament.
                </p>
                
                <div className="bg-fire-3/10 border border-fire-3/20 p-6 max-w-md mx-auto">
                  <p className="font-mono text-xs text-fire-3/60 mb-4">
                    Check your email for tournament details, schedule, and bracket information.
                  </p>
                  <div className="flex items-center justify-center gap-2 text-fire-5 font-orbitron text-sm">
                    <Calendar size={16} />
                    <span>{event.date}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          {step < 4 && (
            <div className="flex gap-3 mt-8">
              {step > 1 && (
                <button
                  onClick={handleBack}
                  className="btn-ghost flex-1"
                >
                  BACK
                </button>
              )}
              <button
                onClick={handleNext}
                disabled={registerMutation.isPending}
                className="btn-fire flex-1"
              >
                {registerMutation.isPending ? 'REGISTERING...' : step === 3 ? 'COMPLETE REGISTRATION' : 'NEXT'}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}