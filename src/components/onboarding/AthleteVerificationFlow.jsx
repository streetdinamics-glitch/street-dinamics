import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, Loader } from 'lucide-react';
import { toast } from 'sonner';
import AthleteDetailsForm from './steps/AthleteDetailsForm';
import AIInterviewStep from './steps/AIInterviewStep';
import VerificationComplete from './steps/VerificationComplete';

export default function AthleteVerificationFlow({ eventId, onVerified }) {
  const [step, setStep] = useState(1); // 1: Details, 2: Interview, 3: Complete
  const [athleteData, setAthleteData] = useState({
    bio: '',
    sports: [],
    experience_level: '',
    social_links: { instagram: '', tiktok: '', youtube: '', twitter: '' },
    portfolio_url: '',
  });
  const [interviewComplete, setInterviewComplete] = useState(false);
  const [whatsappLink, setWhatsappLink] = useState('');
  const queryClient = useQueryClient();

  const { data: event } = useQuery({
    queryKey: ['event', eventId],
    queryFn: () => base44.entities.Event.filter({ id: eventId }).then(r => r[0]),
    enabled: !!eventId,
  });

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const submitVerification = useMutation({
    mutationFn: async () => {
      if (!interviewComplete) {
        throw new Error('Interview must be completed');
      }

      const user = await base44.auth.me();

      // Update user athlete profile
      await base44.auth.updateMe({
        athlete_profile: {
          bio: athleteData.bio,
          sports: athleteData.sports,
          experience_level: athleteData.experience_level,
          social_links: athleteData.social_links,
          portfolio_url: athleteData.portfolio_url,
          verification_status: 'verified',
          verified_at: new Date().toISOString(),
          interview_completed: true,
        },
        user_type: 'athlete',
      });

      // Send WhatsApp channel link
      if (event?.whatsapp_channel_link) {
        await base44.integrations.Core.SendEmail({
          to: user.email,
          subject: `Street Dynamics Verified Athlete Access - ${event.title}`,
          body: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #000; color: #ffe8c0; padding: 20px; border: 2px solid #ff5000;">
              <div style="text-align: center; margin-bottom: 20px;">
                <h1 style="color: #ff9900; font-size: 28px; margin: 0; letter-spacing: 2px;">STREET DYNAMICS</h1>
                <p style="color: #664422; font-size: 11px; letter-spacing: 3px; margin: 5px 0;">VERIFIED ATHLETE</p>
              </div>
              
              <div style="background: rgba(255,100,0,0.05); border: 1px solid rgba(255,100,0,0.2); padding: 20px; margin-bottom: 20px;">
                <h2 style="color: #ffcc00; font-size: 20px; margin-top: 0;">Welcome to the Network</h2>
                <p style="margin: 10px 0;">Your verification interview was successful. You now have exclusive access to the athlete community channel for <strong>${event.title}</strong>.</p>
                
                <div style="background: #080512; border: 2px solid #ff9900; padding: 15px; text-align: center; margin: 15px 0;">
                  <p style="color: #00ffee; font-size: 14px; margin: 5px 0;">WHATSAPP CHANNEL</p>
                  <a href="${event.whatsapp_channel_link}" style="display: inline-block; background: #25d366; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; margin-top: 10px;">Join Channel</a>
                </div>

                <p style="font-size: 12px; color: #664422; margin-top: 15px;">This is a private channel for verified athletes. Share insights, collaborate, and stay updated on events and opportunities.</p>
              </div>

              <div style="text-align: center; padding-top: 15px; border-top: 1px solid rgba(255,100,0,0.2);">
                <p style="font-size: 10px; color: #2a1500; letter-spacing: 2px; margin: 3px 0;">© 2026 STREET DYNAMICS FZE</p>
              </div>
            </div>
          `,
        });
        setWhatsappLink(event.whatsapp_channel_link);
      }

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['current-user'] });
      toast.success('Verification complete! WhatsApp link sent.');
      setStep(3);
      onVerified?.();
    },
    onError: (err) => {
      toast.error('Verification failed: ' + err.message);
    },
  });

  const handleDetailsSubmit = (data) => {
    setAthleteData(data);
    setStep(2);
  };

  const handleInterviewComplete = () => {
    setInterviewComplete(true);
  };

  return (
    <div className="fixed inset-0 z-[500] bg-black/95 backdrop-blur-xl flex items-start justify-center overflow-y-auto p-4">
      <div className="relative w-full max-w-[700px] bg-gradient-to-br from-[rgba(10,4,18,0.99)] to-[rgba(4,2,8,1)] border border-fire-3/20 clip-cyber p-8 my-8">
        <div className="absolute top-0 left-0 right-0 fire-line" />

        {/* Step Indicator */}
        <div className="flex items-center gap-4 mb-8">
          {[1, 2, 3].map((s) => (
            <React.Fragment key={s}>
              <motion.div
                animate={{
                  scale: step === s ? 1.1 : 1,
                  backgroundColor: step >= s ? 'rgba(255,100,0,0.3)' : 'rgba(255,100,0,0.1)',
                }}
                className="relative w-10 h-10 rounded-full border-2 border-fire-3/40 flex items-center justify-center font-orbitron font-bold text-fire-4"
              >
                {step > s ? <CheckCircle size={20} className="text-fire-4" /> : s}
              </motion.div>
              {s < 3 && <div className="flex-1 h-0.5 bg-fire-3/20" />}
            </React.Fragment>
          ))}
        </div>

        {/* Step 1: Details Form */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <h2 className="text-fire-gradient font-orbitron font-black text-2xl tracking-[2px] mb-2">
              ATHLETE VERIFICATION
            </h2>
            <p className="font-mono text-[11px] tracking-[4px] uppercase text-fire-3/40 mb-6">
              Step 1: Your Profile
            </p>
            <AthleteDetailsForm onSubmit={handleDetailsSubmit} />
          </motion.div>
        )}

        {/* Step 2: AI Interview */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <h2 className="text-fire-gradient font-orbitron font-black text-2xl tracking-[2px] mb-2">
              SECRETARY INTERVIEW
            </h2>
            <p className="font-mono text-[11px] tracking-[4px] uppercase text-fire-3/40 mb-6">
              Step 2: AI Interview with our Secretary
            </p>
            <AIInterviewStep
              athleteData={athleteData}
              onInterviewComplete={handleInterviewComplete}
              onProceed={() => {
                if (interviewComplete) {
                  submitVerification.mutate();
                }
              }}
              isPending={submitVerification.isPending}
            />
          </motion.div>
        )}

        {/* Step 3: Verification Complete */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <h2 className="text-fire-gradient font-orbitron font-black text-2xl tracking-[2px] mb-2">
              VERIFICATION COMPLETE
            </h2>
            <p className="font-mono text-[11px] tracking-[4px] uppercase text-fire-3/40 mb-6">
              Step 3: Welcome to the Network
            </p>
            <VerificationComplete eventName={event?.title} whatsappLink={whatsappLink} />
          </motion.div>
        )}
      </div>
    </div>
  );
}