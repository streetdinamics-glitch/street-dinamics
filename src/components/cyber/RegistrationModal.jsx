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
            subject: `Street Dynamics - ${type === 'athlete' ? 'Registration' : 'Ticket'} Confirmed`,
            body: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #000; color: #ffe8c0; padding: 20px; border: 2px solid #ff5000;">
                <div style="text-align: center; margin-bottom: 20px;">
                  <h1 style="color: #ff9900; font-size: 28px; margin: 0;">🏅 STREET DYNAMICS</h1>
                  <p style="color: #664422; font-size: 11px; letter-spacing: 3px; margin: 5px 0;">GLOBAL SPORTS PLATFORM</p>
                </div>
                
                <div style="background: rgba(255,100,0,0.05); border: 1px solid rgba(255,100,0,0.2); padding: 15px; margin-bottom: 20px;">
                  <h2 style="color: #ffcc00; font-size: 20px; margin-top: 0;">${event.title}</h2>
                  <p style="margin: 5px 0;"><strong>Status:</strong> ${type === 'athlete' ? '🏅 Athlete Registered' : '🎫 Spectator Ticket Confirmed'}</p>
                  <p style="margin: 5px 0;"><strong>Date:</strong> ${event.date}</p>
                  <p style="margin: 5px 0;"><strong>Location:</strong> ${event.location}</p>
                </div>
                
                <div style="background: #080512; border: 2px solid #ff9900; padding: 20px; text-align: center; margin-bottom: 20px;">
                  <h3 style="color: #00ffee; font-size: 16px; margin-top: 0;">YOUR TICKET CODE</h3>
                  <div style="font-size: 32px; font-weight: bold; color: #fff; letter-spacing: 4px; margin: 15px 0;">${data.ticket_code}</div>
                  <p style="color: #ff9900; margin: 10px 0;"><strong>Seat/Zone:</strong> ${data.seat_zone}</p>
                  <p style="font-size: 11px; color: #664422; margin-top: 15px;">Show this code at venue entrance</p>
                </div>
                
                <div style="font-size: 12px; color: #664422; line-height: 1.6;">
                  <p><strong>Important:</strong> This registration is governed by the Terms of Service of Street Dynamics Holding FZE (IFZA, Dubai, UAE).</p>
                  <p>For support: <a href="mailto:support@streetdynamics.ae" style="color: #ff9900;">support@streetdynamics.ae</a></p>
                </div>
                
                <div style="text-align: center; margin-top: 25px; padding-top: 15px; border-top: 1px solid rgba(255,100,0,0.2);">
                  <p style="font-size: 10px; color: #2a1500; letter-spacing: 2px;">© 2026 STREET DYNAMICS HOLDING FZE — ALL RIGHTS RESERVED</p>
                  <p style="font-size: 10px; color: #2a1500;">IFZA Business Park, Dubai, UAE</p>
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
              <h5 className="font-rajdhani font-bold text-[13px] tracking-[3px] text-fire-3 uppercase mb-1">PARTICIPATION AGREEMENT — STREET DYNAMICS HOLDING FZE</h5>
              This agreement is governed by UAE Federal Law, DIFC Law, GDPR (EU) 2016/679, UAE Data Protection Law (DIFC Law No. 5/2020), and eIDAS Regulation (EU) 910/2014.
              <br /><br />
              <h5 className="font-rajdhani font-bold text-[13px] tracking-[3px] text-fire-3 uppercase mb-1">ART. 1 — IDENTIFICATION OF PARTIES</h5>
              <strong>Organizer:</strong> Street Dynamics Holding FZE, registered in IFZA (International Free Zone Authority), Dubai, UAE, License No. [TBD], with registered office at [IFZA Business Park, Dubai], email: legal@streetdynamics.ae.<br/>
              Street Dynamics Holding FZE is the sole controlling entity of the "Street Dynamics" brand and all affiliated platforms, events, digital assets, and IP rights globally.<br/>
              <strong>Participant:</strong> The undersigned individual (hereinafter "Participant"), of legal age or represented by a parent/guardian if minor.
              <br /><br />
              <h5 className="font-rajdhani font-bold text-[13px] tracking-[3px] text-fire-3 uppercase mb-1">ART. 2 — SCOPE OF AGREEMENT</h5>
              The Participant registers for a sporting event organized, branded, or licensed by Street Dynamics Holding FZE. Registration constitutes full acceptance of these Terms and Conditions, Event Rules published on the official website, and all policies of Street Dynamics Holding FZE.
              <br /><br />
              <h5 className="font-rajdhani font-bold text-[13px] tracking-[3px] text-fire-3 uppercase mb-1">ART. 3 — DATA PROTECTION (GDPR + UAE LAW)</h5>
              <strong>Data Controller:</strong> Street Dynamics Holding FZE.<br/>
              <strong>Purpose:</strong> Event registration, communication, legal compliance, marketing (opt-in required), blockchain/token operations (if applicable).<br/>
              <strong>Legal Basis:</strong> Contract performance (GDPR Art. 6.1.b), explicit consent for promotional purposes (GDPR Art. 6.1.a), legitimate interest for platform security.<br/>
              <strong>Data Retention:</strong> 7 years from event date, or as required by UAE/EU law, whichever is longer.<br/>
              <strong>Rights:</strong> Access, rectification, erasure, portability, objection, restriction (GDPR Art. 15-22). Contact: privacy@streetdynamics.ae.<br/>
              <strong>Cross-Border Transfers:</strong> Data may be transferred outside the UAE/EU under Standard Contractual Clauses (SCC) and appropriate safeguards.
              <br /><br />
              <h5 className="font-rajdhani font-bold text-[13px] tracking-[3px] text-fire-3 uppercase mb-1">ART. 4 — IMAGE RIGHTS & CONTENT LICENSE</h5>
              Participant grants Street Dynamics Holding FZE a worldwide, royalty-free, perpetual, irrevocable license to:<br/>
              - Capture photos, videos, audio recordings during events;<br/>
              - Use such materials for promotional, editorial, social media, NFT minting, and commercial purposes globally;<br/>
              - Sublicense rights to sponsors, media partners, and blockchain platforms (including tokenization of content).<br/>
              <strong>Revocation:</strong> Consent may be revoked by written notice to privacy@streetdynamics.ae. Revocation does not affect prior lawful use or minted NFTs.
              <br /><br />
              <h5 className="font-rajdhani font-bold text-[13px] tracking-[3px] text-fire-3 uppercase mb-1">ART. 5 — LIABILITY WAIVER</h5>
              Participant acknowledges:<br/>
              - Physical fitness for sporting activity;<br/>
              - Voluntary assumption of all inherent risks;<br/>
              - Release of Street Dynamics Holding FZE from liability for personal injury, property damage, or loss, except in cases of gross negligence or willful misconduct.<br/>
              <strong>Insurance:</strong> Street Dynamics Holding FZE maintains public liability insurance covering third-party claims during events.
              <br /><br />
              <h5 className="font-rajdhani font-bold text-[13px] tracking-[3px] text-fire-3 uppercase mb-1">ART. 6 — CANCELLATION & REFUNDS</h5>
              - Participant cancellation: 50% refund if cancelled 7+ days before event. No refund within 7 days.<br/>
              - Organizer cancellation: Full refund if cancelled due to force majeure (weather, health emergencies, government orders).<br/>
              - Refunds processed within 30 business days via original payment method.
              <br /><br />
              <h5 className="font-rajdhani font-bold text-[13px] tracking-[3px] text-fire-3 uppercase mb-1">ART. 7 — TOKEN & NFT MECHANICS (IF APPLICABLE)</h5>
              If the Participant engages with Street Dynamics tokens (SD Tokens), NFT drops, or blockchain-based rewards:<br/>
              - Tokens are digital assets, not securities, and carry no ownership rights in Street Dynamics Holding FZE.<br/>
              - NFTs are minted on [Polygon/Ethereum/Solana - TBD] and subject to blockchain immutability.<br/>
              - Token holders may receive event access, voting rights, revenue-sharing from sponsorships (as per tokenomics whitepaper).<br/>
              - No guarantee of financial return. Tokens are utility assets for platform engagement only.
              <br /><br />
              <h5 className="font-rajdhani font-bold text-[13px] tracking-[3px] text-fire-3 uppercase mb-1">ART. 8 — DIGITAL SIGNATURE (eIDAS + UAE)</h5>
              The signature affixed via digital canvas is legally binding under:<br/>
              - eIDAS Regulation (EU) 910/2014 (for EU participants);<br/>
              - UAE Electronic Transactions Law (Federal Law No. 1/2006);<br/>
              - DIFC Electronic Transactions Law (Law No. 2/2017).<br/>
              The signature hash is cryptographically stored as proof of informed consent.
              <br /><br />
              <h5 className="font-rajdhani font-bold text-[13px] tracking-[3px] text-fire-3 uppercase mb-1">ART. 9 — INTELLECTUAL PROPERTY</h5>
              "Street Dynamics" and all associated logos, trademarks, content, and IP are the exclusive property of Street Dynamics Holding FZE. Unauthorized use is prohibited and subject to legal action.
              <br /><br />
              <h5 className="font-rajdhani font-bold text-[13px] tracking-[3px] text-fire-3 uppercase mb-1">ART. 10 — GOVERNING LAW & DISPUTE RESOLUTION</h5>
              <strong>Governing Law:</strong> Laws of the Dubai International Financial Centre (DIFC).<br/>
              <strong>Jurisdiction:</strong> Any disputes shall be resolved by:<br/>
              1. Good-faith negotiation (30 days);<br/>
              2. Mediation via DIFC-LCIA Arbitration Centre;<br/>
              3. Binding arbitration in Dubai under DIFC-LCIA Arbitration Rules (English language).<br/>
              Class actions and jury trials are waived.
              <br /><br />
              <h5 className="font-rajdhani font-bold text-[13px] tracking-[3px] text-fire-3 uppercase mb-1">ART. 11 — SEVERABILITY & AMENDMENTS</h5>
              If any provision is invalid, the remainder remains enforceable. Street Dynamics Holding FZE reserves the right to amend these Terms with 30 days' notice via email and website publication.
              <br /><br />
              <strong>Date & Place:</strong> [Auto-generated]<br/>
              <strong>Participant / Parent (if minor):</strong> [Digital signature]<br/>
              <strong>Binding Entity:</strong> Street Dynamics Holding FZE (IFZA, Dubai, UAE)
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