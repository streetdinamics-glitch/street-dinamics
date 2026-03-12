import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from '../translations';

export default function RegistrationModal({ event, type, onClose, onSuccess, lang }) {
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
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const fileInputRef = useRef(null);

  const totalSteps = 3;

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

  const canProceedStep1 = form.first_name && form.last_name && form.email && form.phone && form.id_document;
  const canProceedStep2 = contractAccepted;
  const canProceedStep3 = signed;

  const handleSubmit = async () => {
    const ticketCode = 'SD-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const seatZone = String.fromCharCode(65 + Math.floor(Math.random() * 6)) + String(Math.floor(Math.random() * 50) + 1).padStart(2, '0');
    
    // Save signature canvas as image
    const signatureUrl = canvasRef.current?.toDataURL('image/png');
    
    const regData = {
      event_id: event.id,
      type,
      ...form,
      contract_accepted: true,
      signature_url: signatureUrl,
      status: 'confirmed',
      ticket_code: ticketCode,
      seat_zone: seatZone,
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
              <h2>🏅 Street Dinamics - ${event.title}</h2>
              <p>Your ${type} registration is confirmed!</p>
              <h3>Ticket Code: ${data.ticket_code}</h3>
              <p>Seat: ${data.seat_zone}</p>
              <p>QR Code Data: ${qrData}</p>
              <p>Show this code at the venue entrance.</p>
              <p>Event: ${event.title}</p>
              <p>Date: ${event.date}</p>
              <p>Location: ${event.location}</p>
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
        <div className="flex items-center mb-5 gap-0">
          {[t('reg_step_info'), t('reg_step_contract'), t('reg_step_signature')].map((label, i) => (
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
            {type === 'athlete' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="font-mono text-[11px] tracking-[2px] uppercase text-fire-3/30 block mb-1">{t('reg_dob')}</label>
                  <input className="cyber-input" type="date" value={form.date_of_birth} onChange={e => handleChange('date_of_birth', e.target.value)} />
                </div>
                <div>
                  <label className="font-mono text-[11px] tracking-[2px] uppercase text-fire-3/30 block mb-1">{t('reg_sport')}</label>
                  <input className="cyber-input" value={form.sport} onChange={e => handleChange('sport', e.target.value)} />
                </div>
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
                {uploading ? '⏳ Uploading...' : form.id_document ? '✓ Document Uploaded' : '📎 Choose File'}
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

        {/* Step 2: Contract */}
        {step === 2 && (
          <div className="animate-[fadeUp_0.35s_ease]">
            <h2 className="text-fire-gradient font-orbitron font-black text-2xl tracking-[2px] mb-1">{t('reg_contract_title').toUpperCase()}</h2>
            <p className="font-mono text-[11px] tracking-[4px] uppercase text-fire-3/30 mb-4">Legally Binding</p>

            <div className="bg-black/50 border border-fire-3/10 p-4 mb-4 max-h-[260px] overflow-y-auto font-mono text-[13px] leading-loose text-fire-4/35 scrollbar-thin">
              <h5 className="font-rajdhani font-bold text-[13px] tracking-[3px] text-fire-3 uppercase mb-1">CONTRATTO DI PARTECIPAZIONE</h5>
              Street Dinamics ASD — Il presente contratto è redatto in conformità al Codice Civile italiano, al D.Lgs. 36/2021, al GDPR (UE) 2016/679 e al Regolamento eIDAS.
              <br /><br />
              <h5 className="font-rajdhani font-bold text-[13px] tracking-[3px] text-fire-3 uppercase mb-1">1 — Acceptance</h5>
              By completing registration, you unconditionally accept all terms. This constitutes a legally binding agreement.
              <br /><br />
              <h5 className="font-rajdhani font-bold text-[13px] tracking-[3px] text-fire-3 uppercase mb-1">2 — Privacy (GDPR)</h5>
              Data Controller: Street Dinamics ASD — info@streetdinamics.it. Data retained for 5 years post-event. Rights: access, rectification, erasure, portability.
              <br /><br />
              <h5 className="font-rajdhani font-bold text-[13px] tracking-[3px] text-fire-3 uppercase mb-1">3 — Image Rights</h5>
              Non-exclusive, royalty-free licence for promotional use of name, likeness, video footage for 24 months.
              <br /><br />
              <h5 className="font-rajdhani font-bold text-[13px] tracking-[3px] text-fire-3 uppercase mb-1">4 — Disclaimer</h5>
              Street Dinamics ASD accepts no liability for personal injury, theft, or event cancellation due to force majeure.
            </div>

            <label className="flex items-start gap-2.5 cursor-pointer mb-4">
              <input type="checkbox" checked={contractAccepted} onChange={e => setContractAccepted(e.target.checked)} className="w-4 h-4 mt-0.5 accent-fire-3 flex-shrink-0" />
              <span className="text-sm text-fire-3/30 leading-snug">
                {t('reg_contract_accept')}
              </span>
            </label>

            <div className="flex gap-2.5">
              <button onClick={() => setStep(1)} className="btn-ghost py-3.5 px-5 text-[13px]">← {t('reg_back')}</button>
              <button disabled={!canProceedStep2} onClick={() => setStep(3)} className="btn-fire flex-1 text-[13px] py-3.5 disabled:opacity-20 disabled:cursor-not-allowed">
                {t('reg_next')} →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Signature */}
        {step === 3 && (
          <div className="animate-[fadeUp_0.35s_ease]">
            <h2 className="text-fire-gradient font-orbitron font-black text-2xl tracking-[2px] mb-1">{t('reg_signature_title').toUpperCase()}</h2>
            <p className="font-mono text-[11px] tracking-[4px] uppercase text-fire-3/30 mb-4">{t('reg_signature_hint')}</p>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono text-[11px] tracking-[2px] uppercase text-fire-3/30">✍ {t('reg_signature_title')}</span>
                <button onClick={clearSig} className="font-mono text-[11px] tracking-[2px] text-fire-3/40 hover:text-fire-3 bg-transparent border-none cursor-pointer">{t('reg_signature_clear')}</button>
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
            </div>

            <div className="flex gap-2.5">
              <button onClick={() => setStep(2)} className="btn-ghost py-3.5 px-5 text-[13px]">← {t('reg_back')}</button>
              <button
                disabled={!canProceedStep3 || createReg.isPending}
                onClick={handleSubmit}
                className="btn-fire flex-1 text-[13px] py-3.5 disabled:opacity-20 disabled:cursor-not-allowed"
              >
                {createReg.isPending ? t('reg_submitting') : `✓ ${t('reg_submit')}`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}