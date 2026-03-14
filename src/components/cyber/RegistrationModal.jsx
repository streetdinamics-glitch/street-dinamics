import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from '../translations';
import ComprehensiveContract from '../legal/ComprehensiveContract';
import AgeVerification from '../legal/AgeVerification';
import MinorConsentForm from '../legal/MinorConsentForm';
import GDPRConsentManager from '../legal/GDPRConsentManager';

export default function RegistrationModal({ event, type, attendanceMode, onClose, onSuccess, lang }) {
  const t = useTranslation(lang);
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', phone: '',
    date_of_birth: '', sport: '', id_document: '',
  });
  const [contractAccepted, setContractAccepted] = useState(false);
  const [signed, setSigned] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [ageVerified, setAgeVerified] = useState(null);
  const [ageCategory, setAgeCategory] = useState(null);
  const [gdprConsents, setGdprConsents] = useState({});
  const [parentalConsent, setParentalConsent] = useState(null);
  const canvasRef = useRef(null);
  const parentCanvasRef = useRef(null);
  const isDrawing = useRef(false);
  const fileInputRef = useRef(null);

  const totalSteps = ageCategory?.isMinor ? 5 : 4;

  const createReg = useMutation({
    mutationFn: (data) => base44.entities.Registration.create(data),
  });

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert(t('reg_upload_size'));
      return;
    }

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      handleChange('id_document', file_url);
    } catch (err) {
      alert(t('reg_upload_error'));
    } finally {
      setUploading(false);
    }
  };

  const canProceedStep1 = form.first_name && form.last_name && form.email && form.phone && form.date_of_birth && form.id_document && ageVerified;
  const canProceedStep2 = Object.keys(gdprConsents).length > 0;
  const canProceedStep3 = contractAccepted;
  const canProceedStep4 = ageCategory?.isMinor ? (parentalConsent && parentalConsent.signature_url) : true;
  const canProceedStep5 = signed;

  const handleSubmit = async () => {
    // Validate age verification
    if (!ageVerified || !ageCategory) {
      alert('Age verification failed. Please check date of birth.');
      return;
    }

    // For minors, verify parental consent
    if (ageCategory.isMinor && !parentalConsent?.signature_url) {
      alert('Parental consent signature is required for minors.');
      return;
    }

    const ticketCode = 'SD-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const seatZone = type === 'spectator' && attendanceMode === 'in-person' 
      ? String.fromCharCode(65 + Math.floor(Math.random() * 6)) + String(Math.floor(Math.random() * 50) + 1).padStart(2, '0')
      : 'ONLINE';
    
    // Save participant signature
    const signatureUrl = canvasRef.current?.toDataURL('image/png');
    
    const regData = {
      event_id: event.id,
      type,
      attendance_mode: attendanceMode || (type === 'athlete' ? 'in-person' : 'online'),
      ...form,
      contract_accepted: true,
      signature_url: signatureUrl,
      status: ageCategory.isMinor ? 'pending' : 'confirmed',
      ticket_code: ticketCode,
      seat_zone: seatZone,
      // Age and consent tracking
      age_at_registration: ageCategory.age,
      is_minor: ageCategory.isMinor,
      // GDPR consents
      gdpr_consents: gdprConsents,
      marketing_consent: gdprConsents.marketing || false,
      image_rights_consent: gdprConsents.imageRights || false,
      tokenization_consent: gdprConsents.tokenization || false,
      cross_border_consent: gdprConsents.crossBorder || false,
      // Parental data (if minor)
      parental_consent: ageCategory.isMinor ? parentalConsent : null,
      // Legal compliance timestamps
      gdpr_consent_date: new Date().toISOString(),
      contract_version: '1.2',
      ip_address: 'REDACTED', // Would be captured server-side
    };
    
    createReg.mutate(regData, {
      onSuccess: async (data) => {
        // Send confirmation email with QR code
        try {
          const qrData = `SD-TICKET|${data.ticket_code}|${data.event_id}|${data.email}`;
          await base44.integrations.Core.SendEmail({
            to: form.email,
            subject: `Street Dinamics - ${type === 'athlete' ? 'Registration' : 'Ticket'} Confirmed`,
            body: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #000; color: #ffe8c0; padding: 20px; border: 2px solid #ff5000;">
                <div style="text-align: center; margin-bottom: 20px;">
                  <h1 style="color: #ff9900; font-size: 28px; margin: 0; letter-spacing: 2px;">STREET DINAMICS</h1>
                  <p style="color: #664422; font-size: 11px; letter-spacing: 3px; margin: 5px 0;">GLOBAL SPORTS PLATFORM</p>
                </div>
                
                <div style="background: rgba(255,100,0,0.05); border: 1px solid rgba(255,100,0,0.2); padding: 15px; margin-bottom: 20px;">
                  <h2 style="color: #ffcc00; font-size: 20px; margin-top: 0;">${event.title}</h2>
                  <p style="margin: 5px 0;"><strong>Status:</strong> ${type === 'athlete' ? 'Athlete Registered' : 'Spectator Ticket Confirmed'}</p>
                  <p style="margin: 5px 0;"><strong>Type:</strong> ${attendanceMode === 'in-person' ? 'In-Person Attendance' : 'Online Stream Access'}</p>
                  <p style="margin: 5px 0;"><strong>Date:</strong> ${event.date}</p>
                  <p style="margin: 5px 0;"><strong>Location:</strong> ${attendanceMode === 'in-person' ? event.location : 'Online Stream'}</p>
                </div>
                
                <div style="background: #080512; border: 2px solid #ff9900; padding: 20px; text-align: center; margin-bottom: 20px;">
                  <h3 style="color: #00ffee; font-size: 16px; margin-top: 0;">YOUR TICKET CODE</h3>
                  <div style="font-size: 32px; font-weight: bold; color: #fff; letter-spacing: 4px; margin: 15px 0;">${data.ticket_code}</div>
                  ${attendanceMode === 'in-person' 
                    ? `<p style="color: #ff9900; margin: 10px 0;"><strong>Seat/Zone:</strong> ${data.seat_zone}</p>
                       <p style="font-size: 11px; color: #664422; margin-top: 15px;">Show this code at venue entrance</p>`
                    : `<p style="color: #00ffee; margin: 10px 0;"><strong>Access:</strong> Online Stream</p>
                       <p style="font-size: 11px; color: #664422; margin-top: 15px;">Use this code to access the live stream</p>`
                  }
                </div>
                
                <div style="font-size: 12px; color: #664422; line-height: 1.6;">
                  <p><strong>Important:</strong> This registration is governed by the Terms of Service of Street Dynamics Holding FZE (IFZA, Dubai, UAE).</p>
                  <p>For support: <a href="mailto:support@streetdinamics.ae" style="color: #ff9900;">support@streetdinamics.ae</a></p>
                </div>
                
                <div style="text-align: center; margin-top: 25px; padding-top: 15px; border-top: 1px solid rgba(255,100,0,0.2);">
                  <p style="font-size: 10px; color: #2a1500; letter-spacing: 2px; margin: 3px 0;">© 2026 STREET DYNAMICS HOLDING FZE — ALL RIGHTS RESERVED</p>
                  <p style="font-size: 9px; color: #2a1500; margin: 2px 0;">IFZA Business Park, Dubai, UAE — License: [TBD]</p>
                  <p style="font-size: 8px; color: #2a1500; margin: 2px 0;">Global Platform • Blockchain-Powered • Youth Sports 13-30</p>
                </div>
              </div>
            `
          });
        } catch (err) {
          console.error('Email failed:', err);
        }
        queryClient.invalidateQueries({ queryKey: ['registrations'] });
        onSuccess?.(data);
      }
    });
  };

  // Canvas drawing
  const startDraw = (e) => {
    isDrawing.current = true;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.strokeStyle = '#ff9900';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.touches?.[0]?.clientX || e.clientX) - rect.left;
    const y = (e.touches?.[0]?.clientY || e.clientY) - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };
  const draw = (e) => {
    if (!isDrawing.current) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.touches?.[0]?.clientX || e.clientX) - rect.left;
    const y = (e.touches?.[0]?.clientY || e.clientY) - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
    setSigned(true);
  };
  const endDraw = () => { isDrawing.current = false; };
  const clearSig = () => {
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setSigned(false);
  };

  return (
    <div className="fixed inset-0 z-[500] bg-black/95 backdrop-blur-xl flex items-start justify-center overflow-y-auto p-4 md:p-6">
      <div className="relative w-full max-w-[600px] bg-gradient-to-br from-[rgba(10,4,18,0.99)] to-[rgba(4,2,8,1)] border border-fire-3/20 clip-cyber p-6 md:p-8 my-auto shadow-2xl">
        <div className="absolute top-0 left-0 right-0 fire-line" />
        <div className="absolute top-0 right-0 w-[22px] h-[22px] bg-gradient-to-bl from-fire-5 to-fire-2" style={{ clipPath: 'polygon(100% 0,100% 100%,0 0)' }} />

        <button onClick={onClose} className="absolute top-3 right-4 font-mono text-xs tracking-[2px] text-fire-3/30 hover:text-fire-3 cursor-pointer bg-transparent border-none">{t('reg_close')}</button>

        {/* Step indicator */}
        <div className="flex items-center mb-5 gap-0 overflow-x-auto">
          {(ageCategory?.isMinor 
            ? ['Info', 'GDPR', 'Contract', 'Parent', 'Sign']
            : ['Info', 'GDPR', 'Contract', 'Sign']
          ).map((label, i) => (
            <div key={i} className={`flex-1 text-center pb-2.5 relative font-mono text-[9px] tracking-[2px] ${step > i + 1 ? 'text-fire-4' : step === i + 1 ? 'text-fire-5' : 'text-fire-3/25'}`}>
              <div className={`w-[22px] h-[22px] rounded-full border mx-auto mb-1 flex items-center justify-center font-orbitron text-[9px] font-bold transition-all ${step === i + 1 ? 'border-fire-3 text-fire-5 bg-fire-3/10 shadow-[0_0_10px_rgba(255,100,0,0.35)]' : step > i + 1 ? 'border-fire-4 text-fire-5 bg-fire-3/15' : 'border-fire-3/25 text-fire-3/25'}`}>
                {i + 1}
              </div>
              <span>{label}</span>
            </div>
          ))}
        </div>

        {/* Step 1: Info */}
        {step === 1 && (
          <div className="animate-[fadeUp_0.35s_ease]">
            <h2 className="text-fire-gradient font-orbitron font-black text-2xl tracking-[2px] mb-1">
              {type === 'athlete' ? t('reg_athlete_title').toUpperCase() : t('reg_spectator_title').toUpperCase()}
            </h2>
            <p className="font-mono text-[11px] tracking-[4px] uppercase text-fire-3/30 mb-4">
              {event?.title}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="font-mono text-[11px] tracking-[2px] uppercase text-fire-3/30 block mb-1">{t('reg_first_name')}</label>
                <input className="cyber-input" value={form.first_name} onChange={e => handleChange('first_name', e.target.value)} />
              </div>
              <div>
                <label className="font-mono text-[11px] tracking-[2px] uppercase text-fire-3/30 block mb-1">{t('reg_last_name')}</label>
                <input className="cyber-input" value={form.last_name} onChange={e => handleChange('last_name', e.target.value)} />
              </div>
            </div>
            <div className="mb-3">
              <label className="font-mono text-[11px] tracking-[2px] uppercase text-fire-3/30 block mb-1">{t('reg_email')}</label>
              <input className="cyber-input" type="email" value={form.email} onChange={e => handleChange('email', e.target.value)} />
            </div>
            <div className="mb-3">
              <label className="font-mono text-[11px] tracking-[2px] uppercase text-fire-3/30 block mb-1">{t('reg_phone')}</label>
              <input className="cyber-input" type="tel" value={form.phone} onChange={e => handleChange('phone', e.target.value)} />
            </div>
            <div className="mb-3">
              <label className="font-mono text-[11px] tracking-[2px] uppercase text-fire-3/30 block mb-1">{t('reg_dob')} *</label>
              <input 
                className="cyber-input" 
                type="date" 
                value={form.date_of_birth} 
                onChange={e => handleChange('date_of_birth', e.target.value)}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>

            {/* Age Verification */}
            {form.date_of_birth && (
              <div className="mb-3">
                <AgeVerification 
                  dateOfBirth={form.date_of_birth}
                  onVerified={(verified, category) => {
                    setAgeVerified(verified);
                    setAgeCategory(category);
                  }}
                />
              </div>
            )}

            {type === 'athlete' && ageVerified && (
              <div className="mb-3">
                <label className="font-mono text-[11px] tracking-[2px] uppercase text-fire-3/30 block mb-1">{t('reg_sport')} *</label>
                <input className="cyber-input" value={form.sport} onChange={e => handleChange('sport', e.target.value)} />
              </div>
            )}

            {/* Document upload */}
            <div className="mb-4">
              <label className="font-mono text-[11px] tracking-[2px] uppercase text-fire-3/30 block mb-1">{t('reg_id_upload')}</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="btn-ghost w-full text-[11px] py-2.5 px-3 flex items-center justify-center gap-2 disabled:opacity-40"
              >
                {uploading ? 'Uploading...' : form.id_document ? 'Document Uploaded' : 'Choose File'}
              </button>
              <p className="font-mono text-[9px] tracking-[1px] text-fire-3/30 mt-1">{t('reg_id_hint')}</p>
            </div>

            <div className="flex gap-2.5 mt-4">
              <button
                disabled={!canProceedStep1}
                onClick={() => setStep(2)}
                className="btn-fire flex-1 text-[13px] py-3.5 disabled:opacity-20 disabled:cursor-not-allowed"
              >
                {t('reg_next')} →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: GDPR Consent */}
        {step === 2 && (
          <div className="animate-[fadeUp_0.35s_ease]">
            <h2 className="text-fire-gradient font-orbitron font-black text-2xl tracking-[2px] mb-1">DATA PROTECTION</h2>
            <p className="font-mono text-[11px] tracking-[4px] uppercase text-fire-3/30 mb-4">GDPR Compliance</p>

            <div className="max-h-[400px] overflow-y-auto mb-4">
              <GDPRConsentManager
                type={type}
                onConsentChange={setGdprConsents}
              />
            </div>

            <div className="flex gap-2.5">
              <button onClick={() => setStep(1)} className="btn-ghost py-3.5 px-5 text-[13px]">← Back</button>
              <button 
                disabled={!canProceedStep2} 
                onClick={() => setStep(3)} 
                className="btn-fire flex-1 text-[13px] py-3.5 disabled:opacity-20 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Contract */}
        {step === 3 && (
          <div className="animate-[fadeUp_0.35s_ease]">
            <h2 className="text-fire-gradient font-orbitron font-black text-2xl tracking-[2px] mb-1">LEGAL AGREEMENT</h2>
            <p className="font-mono text-[11px] tracking-[4px] uppercase text-fire-3/30 mb-4">Binding Contract</p>

            <div className="bg-black/50 border border-fire-3/10 p-4 mb-4 max-h-[320px] overflow-y-auto scrollbar-thin">
              <ComprehensiveContract type={type} isMinor={ageCategory?.isMinor} />
            </div>

            <label className="flex items-start gap-2.5 cursor-pointer mb-4">
              <input 
                type="checkbox" 
                checked={contractAccepted} 
                onChange={e => setContractAccepted(e.target.checked)} 
                className="w-4 h-4 mt-0.5 accent-fire-3 flex-shrink-0" 
              />
              <span className="text-sm text-fire-3/30 leading-snug">
                I have read, understood, and accept all terms of this comprehensive agreement. 
                {ageCategory?.isMinor && ' My parent/guardian will co-sign on the next step.'}
              </span>
            </label>

            <div className="flex gap-2.5">
              <button onClick={() => setStep(2)} className="btn-ghost py-3.5 px-5 text-[13px]">← Back</button>
              <button 
                disabled={!canProceedStep3} 
                onClick={() => setStep(ageCategory?.isMinor ? 4 : 4)} 
                className="btn-fire flex-1 text-[13px] py-3.5 disabled:opacity-20 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Parental Consent (Only for Minors) */}
        {step === 4 && ageCategory?.isMinor && (
          <div className="animate-[fadeUp_0.35s_ease]">
            <h2 className="text-fire-gradient font-orbitron font-black text-2xl tracking-[2px] mb-1">PARENTAL CONSENT</h2>
            <p className="font-mono text-[11px] tracking-[4px] uppercase text-fire-3/30 mb-4">Required for Minors</p>

            <div className="max-h-[400px] overflow-y-auto mb-4">
              <MinorConsentForm
                minorData={form}
                onParentSign={setParentalConsent}
                parentSignature={parentalConsent}
                onClearSignature={() => setParentalConsent(null)}
              />
            </div>

            <div className="flex gap-2.5">
              <button onClick={() => setStep(3)} className="btn-ghost py-3.5 px-5 text-[13px]">← Back</button>
              <button 
                disabled={!canProceedStep4} 
                onClick={() => setStep(5)} 
                className="btn-fire flex-1 text-[13px] py-3.5 disabled:opacity-20 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {/* Step 4/5: Participant Signature */}
        {((step === 4 && !ageCategory?.isMinor) || (step === 5 && ageCategory?.isMinor)) && (
          <div className="animate-[fadeUp_0.35s_ease]">
            <h2 className="text-fire-gradient font-orbitron font-black text-2xl tracking-[2px] mb-1">
              {ageCategory?.isMinor ? 'MINOR SIGNATURE' : 'YOUR SIGNATURE'}
            </h2>
            <p className="font-mono text-[11px] tracking-[4px] uppercase text-fire-3/30 mb-4">
              {ageCategory?.isMinor ? 'Minor Co-Signs with Parent' : 'Legally Binding eSignature'}
            </p>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono text-[11px] tracking-[2px] uppercase text-fire-3/30">
                  {ageCategory?.isMinor ? 'Minor Participant Signature' : 'Your Signature'}
                </span>
                <button 
                  onClick={clearSig} 
                  className="font-mono text-[11px] tracking-[2px] text-fire-3/40 hover:text-fire-3 bg-transparent border-none cursor-pointer"
                >
                  Clear
                </button>
              </div>
              <canvas
                ref={canvasRef}
                width={520}
                height={100}
                className={`w-full h-[100px] bg-black/50 border cursor-crosshair block touch-none ${signed ? 'border-fire-3/40' : 'border-fire-3/18'}`}
                onMouseDown={startDraw}
                onMouseMove={draw}
                onMouseUp={endDraw}
                onMouseLeave={endDraw}
                onTouchStart={startDraw}
                onTouchMove={draw}
                onTouchEnd={endDraw}
              />
              <p className="font-mono text-xs text-fire-3/60 mt-2">
                {ageCategory?.isMinor 
                  ? 'Minor participants must sign alongside their parent/guardian. Both signatures are required.'
                  : 'Sign with your finger or mouse. This creates a legally binding electronic signature.'}
              </p>
            </div>

            {ageCategory?.isMinor && (
              <div className="bg-cyan/10 border border-cyan/30 p-4 mb-4">
                <p className="font-mono text-xs text-cyan/80 leading-relaxed">
                  ✓ Parent signature: <strong className="text-cyan">VERIFIED</strong><br/>
                  → Minor signature: <strong className="text-fire-3">{signed ? 'COMPLETED' : 'PENDING'}</strong>
                </p>
              </div>
            )}

            <div className="flex gap-2.5">
              <button 
                onClick={() => setStep(ageCategory?.isMinor ? 4 : 3)} 
                className="btn-ghost py-3.5 px-5 text-[13px]"
              >
                ← Back
              </button>
              <button
                disabled={!canProceedStep5 || createReg.isPending}
                onClick={handleSubmit}
                className="btn-fire flex-1 text-[13px] py-3.5 disabled:opacity-20 disabled:cursor-not-allowed"
              >
                {createReg.isPending ? 'Processing...' : 'Complete Registration'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}