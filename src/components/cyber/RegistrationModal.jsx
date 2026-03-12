import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export default function RegistrationModal({ event, type, onClose, onSuccess }) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', phone: '',
    date_of_birth: '', sport: '', id_document: '',
  });
  const [contractAccepted, setContractAccepted] = useState(false);
  const [signed, setSigned] = useState(false);
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);

  const totalSteps = type === 'athlete' ? 3 : 3;

  const createReg = useMutation({
    mutationFn: (data) => base44.entities.Registration.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['registrations'] });
      onSuccess?.(data);
    },
  });

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const canProceedStep1 = form.first_name && form.last_name && form.email && form.phone;
  const canProceedStep2 = contractAccepted;
  const canProceedStep3 = signed;

  const handleSubmit = () => {
    const ticketCode = 'SD-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const seatZone = String.fromCharCode(65 + Math.floor(Math.random() * 6)) + String(Math.floor(Math.random() * 50) + 1).padStart(2, '0');
    createReg.mutate({
      event_id: event.id,
      type,
      ...form,
      contract_accepted: true,
      status: 'confirmed',
      ticket_code: ticketCode,
      seat_zone: seatZone,
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

        <button onClick={onClose} className="absolute top-3 right-4 font-mono text-xs tracking-[2px] text-fire-3/30 hover:text-fire-3 cursor-pointer bg-transparent border-none">✕ CLOSE</button>

        {/* Step indicator */}
        <div className="flex items-center mb-5 gap-0">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div key={i} className={`flex-1 text-center pb-2.5 relative font-mono text-[9px] tracking-[2px] ${step > i + 1 ? 'text-fire-4' : step === i + 1 ? 'text-fire-5' : 'text-fire-3/25'}`}>
              <div className={`w-[22px] h-[22px] rounded-full border mx-auto mb-1 flex items-center justify-center font-orbitron text-[9px] font-bold transition-all ${step === i + 1 ? 'border-fire-3 text-fire-5 bg-fire-3/10 shadow-[0_0_10px_rgba(255,100,0,0.35)]' : step > i + 1 ? 'border-fire-4 text-fire-5 bg-fire-3/15' : 'border-fire-3/25 text-fire-3/25'}`}>
                {i + 1}
              </div>
              <span>{['INFO', 'CONTRACT', 'SIGN'][i]}</span>
            </div>
          ))}
        </div>

        {/* Step 1: Info */}
        {step === 1 && (
          <div className="animate-[fadeUp_0.35s_ease]">
            <h2 className="text-fire-gradient font-orbitron font-black text-2xl tracking-[2px] mb-1">
              {type === 'athlete' ? 'JOIN THE ARENA' : 'JOIN THE CROWD'}
            </h2>
            <p className="font-mono text-[11px] tracking-[4px] uppercase text-fire-3/30 mb-4">
              {type === 'athlete' ? 'Athlete Registration' : 'Spectator Registration'}
            </p>
            <div className="bg-fire-3/5 border border-fire-3/15 p-2.5 mb-4 text-sm font-semibold text-fire-4/60">
              Event: <strong className="text-fire-3">{event?.title}</strong> — {event?.location}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="font-mono text-[11px] tracking-[2px] uppercase text-fire-3/30 block mb-1">First Name</label>
                <input className="cyber-input" value={form.first_name} onChange={e => handleChange('first_name', e.target.value)} placeholder="Marco" />
              </div>
              <div>
                <label className="font-mono text-[11px] tracking-[2px] uppercase text-fire-3/30 block mb-1">Last Name</label>
                <input className="cyber-input" value={form.last_name} onChange={e => handleChange('last_name', e.target.value)} placeholder="Rossi" />
              </div>
            </div>
            <div className="mb-3">
              <label className="font-mono text-[11px] tracking-[2px] uppercase text-fire-3/30 block mb-1">Email</label>
              <input className="cyber-input" type="email" value={form.email} onChange={e => handleChange('email', e.target.value)} placeholder="marco@gmail.com" />
            </div>
            <div className="mb-3">
              <label className="font-mono text-[11px] tracking-[2px] uppercase text-fire-3/30 block mb-1">Phone</label>
              <input className="cyber-input" type="tel" value={form.phone} onChange={e => handleChange('phone', e.target.value)} placeholder="+39 333 000 0000" />
            </div>
            {type === 'athlete' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="font-mono text-[11px] tracking-[2px] uppercase text-fire-3/30 block mb-1">Date of Birth</label>
                  <input className="cyber-input" type="date" value={form.date_of_birth} onChange={e => handleChange('date_of_birth', e.target.value)} />
                </div>
                <div>
                  <label className="font-mono text-[11px] tracking-[2px] uppercase text-fire-3/30 block mb-1">Sport</label>
                  <input className="cyber-input" value={form.sport} onChange={e => handleChange('sport', e.target.value)} placeholder="Basketball, Futsal..." />
                </div>
              </div>
            )}

            <div className="flex gap-2.5 mt-4">
              <button
                disabled={!canProceedStep1}
                onClick={() => setStep(2)}
                className="btn-fire flex-1 text-[13px] py-3.5 disabled:opacity-20 disabled:cursor-not-allowed"
              >
                NEXT: CONTRACT →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Contract */}
        {step === 2 && (
          <div className="animate-[fadeUp_0.35s_ease]">
            <h2 className="text-fire-gradient font-orbitron font-black text-2xl tracking-[2px] mb-1">CONTRACT</h2>
            <p className="font-mono text-[11px] tracking-[4px] uppercase text-fire-3/30 mb-4">Read carefully — legally binding</p>

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
                I have read and <strong className="text-fire-3">fully accept</strong> all terms, privacy policy, and disclaimer above.
              </span>
            </label>

            <div className="flex gap-2.5">
              <button onClick={() => setStep(1)} className="btn-ghost py-3.5 px-5 text-[13px]">← BACK</button>
              <button disabled={!canProceedStep2} onClick={() => setStep(3)} className="btn-fire flex-1 text-[13px] py-3.5 disabled:opacity-20 disabled:cursor-not-allowed">
                NEXT: SIGN →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Signature */}
        {step === 3 && (
          <div className="animate-[fadeUp_0.35s_ease]">
            <h2 className="text-fire-gradient font-orbitron font-black text-2xl tracking-[2px] mb-1">SIGN HERE</h2>
            <p className="font-mono text-[11px] tracking-[4px] uppercase text-fire-3/30 mb-4">Digital signature — legally binding</p>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono text-[11px] tracking-[2px] uppercase text-fire-3/30">✍ Your Signature</span>
                <button onClick={clearSig} className="font-mono text-[11px] tracking-[2px] text-fire-3/40 hover:text-fire-3 bg-transparent border-none cursor-pointer">Clear</button>
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
              <p className="font-mono text-[11px] tracking-[1px] text-fire-3/30 text-center mt-1">Draw with finger or mouse · eIDAS compliant</p>
            </div>

            <div className="flex gap-2.5">
              <button onClick={() => setStep(2)} className="btn-ghost py-3.5 px-5 text-[13px]">← BACK</button>
              <button
                disabled={!canProceedStep3 || createReg.isPending}
                onClick={handleSubmit}
                className="btn-fire flex-1 text-[13px] py-3.5 disabled:opacity-20 disabled:cursor-not-allowed"
              >
                {createReg.isPending ? 'PROCESSING...' : '✓ COMPLETE REGISTRATION'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}