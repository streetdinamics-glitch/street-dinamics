import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, FileText } from 'lucide-react';

export default function MinorConsentForm({ 
  minorData, 
  onParentSign, 
  parentSignature, 
  onClearSignature 
}) {
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const [parentForm, setParentForm] = useState({
    parent_full_name: '',
    parent_id_number: '',
    parent_relationship: '',
    parent_email: '',
    parent_phone: '',
  });

  const startDraw = (e) => {
    isDrawing.current = true;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.strokeStyle = '#00ffee';
    ctx.lineWidth = 2.5;
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
  };

  const endDraw = () => {
    isDrawing.current = false;
    if (canvasRef.current && isFormComplete) {
      // Verify canvas is not blank by checking pixel data
      const ctx = canvasRef.current.getContext('2d');
      const imageData = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
      const hasContent = imageData.data.some((val, idx) => idx % 4 !== 3 && val > 0);
      if (!hasContent) return; // Canvas is blank, don't save
      const signatureUrl = canvasRef.current.toDataURL('image/png');
      onParentSign({ ...parentForm, signature_url: signatureUrl });
    }
  };

  const clearSignature = () => {
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
    onClearSignature();
  };

  const isFormComplete = parentForm.parent_full_name && 
                         parentForm.parent_id_number && 
                         parentForm.parent_relationship && 
                         parentForm.parent_email && 
                         parentForm.parent_phone;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-cyan/10 to-cyan/5 border-2 border-cyan/40 p-6 space-y-6"
    >
      {/* Warning Banner */}
      <div className="bg-fire-2/20 border-2 border-fire-2/60 p-4 flex items-start gap-3">
        <AlertTriangle size={24} className="text-fire-2 flex-shrink-0 mt-1" />
        <div>
          <p className="font-orbitron font-bold text-sm text-fire-2 mb-1">
            PARENTAL CONSENT REQUIRED
          </p>
          <p className="font-mono text-xs text-fire-4/80 leading-relaxed">
            This participant is under 18 years of age. A parent or legal guardian MUST complete this form and provide 
            a legally binding digital signature. Participation without valid parental consent is NOT permitted under UAE law and GDPR Article 8.
          </p>
        </div>
      </div>

      {/* Minor Information Summary */}
      <div className="bg-cyan/5 border border-cyan/20 p-4">
        <h4 className="font-orbitron font-bold text-sm text-cyan mb-3 flex items-center gap-2">
          <FileText size={16} />
          MINOR PARTICIPANT DETAILS
        </h4>
        <div className="grid grid-cols-2 gap-3 font-mono text-xs">
          <div>
            <span className="text-cyan/60">Name:</span>
            <p className="text-cyan font-semibold">{minorData.first_name} {minorData.last_name}</p>
          </div>
          <div>
            <span className="text-cyan/60">Date of Birth:</span>
            <p className="text-cyan font-semibold">{minorData.date_of_birth}</p>
          </div>
          <div>
            <span className="text-cyan/60">Email:</span>
            <p className="text-cyan font-semibold">{minorData.email}</p>
          </div>
          <div>
            <span className="text-cyan/60">Sport:</span>
            <p className="text-cyan font-semibold">{minorData.sport || 'Spectator'}</p>
          </div>
        </div>
      </div>

      {/* Parent/Guardian Information */}
      <div>
        <h4 className="font-orbitron font-bold text-sm text-fire-4 mb-4 flex items-center gap-2">
          <Shield size={16} />
          PARENT / LEGAL GUARDIAN INFORMATION
        </h4>
        
        <div className="space-y-4">
          <div>
            <label className="font-mono text-xs tracking-[2px] uppercase text-fire-3/60 block mb-1">
              Full Legal Name *
            </label>
            <input
              type="text"
              value={parentForm.parent_full_name}
              onChange={(e) => setParentForm({ ...parentForm, parent_full_name: e.target.value })}
              placeholder="As appears on official ID"
              className="cyber-input"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-mono text-xs tracking-[2px] uppercase text-fire-3/60 block mb-1">
                ID / Passport Number *
              </label>
              <input
                type="text"
                value={parentForm.parent_id_number}
                onChange={(e) => setParentForm({ ...parentForm, parent_id_number: e.target.value })}
                placeholder="National ID or Passport"
                className="cyber-input"
                required
              />
            </div>

            <div>
              <label className="font-mono text-xs tracking-[2px] uppercase text-fire-3/60 block mb-1">
                Relationship to Minor *
              </label>
              <select
                value={parentForm.parent_relationship}
                onChange={(e) => setParentForm({ ...parentForm, parent_relationship: e.target.value })}
                className="cyber-input"
                required
              >
                <option value="">-- Select --</option>
                <option value="mother">Mother</option>
                <option value="father">Father</option>
                <option value="legal_guardian">Legal Guardian</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-mono text-xs tracking-[2px] uppercase text-fire-3/60 block mb-1">
                Email Address *
              </label>
              <input
                type="email"
                value={parentForm.parent_email}
                onChange={(e) => setParentForm({ ...parentForm, parent_email: e.target.value })}
                placeholder="parent@example.com"
                className="cyber-input"
                required
              />
            </div>

            <div>
              <label className="font-mono text-xs tracking-[2px] uppercase text-fire-3/60 block mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                value={parentForm.parent_phone}
                onChange={(e) => setParentForm({ ...parentForm, parent_phone: e.target.value })}
                placeholder="+971 XX XXX XXXX"
                className="cyber-input"
                required
              />
            </div>
          </div>
        </div>
      </div>

      {/* Parental Declarations */}
      <div className="bg-fire-3/5 border border-fire-3/20 p-5">
        <h4 className="font-orbitron font-bold text-sm text-fire-4 mb-3">
          PARENTAL DECLARATIONS & AUTHORIZATIONS
        </h4>
        <div className="space-y-2 font-mono text-xs text-fire-3/60">
          <p>✓ I confirm I am the parent/legal guardian of the minor participant listed above;</p>
          <p>✓ I have read, understood, and accept all terms of the Participation Agreement on behalf of the minor;</p>
          <p>✓ I grant permission for the minor to participate in Street Dinamics events and associated activities;</p>
          <p>✓ I consent to the processing of the minor's personal data per GDPR Article 8 and UAE Data Protection Law;</p>
          <p>✓ I grant image rights and content licensing permissions for the minor's photos, videos, and performance data;</p>
          <p>✓ I understand the minor CANNOT purchase tokens, NFTs, or participate in revenue-sharing until age 18;</p>
          <p>✓ I acknowledge the minor's safety is my responsibility outside of official event hours;</p>
          <p>✓ I authorize emergency medical treatment if I cannot be reached;</p>
          <p>✓ I confirm the emergency contact information provided is accurate and reachable;</p>
          <p>✓ I may revoke this consent at any time by written notice to streetdinamics@gmail.com.</p>
        </div>
      </div>

      {/* Digital Signature */}
      <div>
        <label className="font-orbitron text-sm font-bold text-fire-4 mb-3 block flex items-center justify-between">
          <span>PARENT/GUARDIAN DIGITAL SIGNATURE *</span>
          <button
            onClick={clearSignature}
            className="font-mono text-xs tracking-[2px] text-cyan/60 hover:text-cyan transition-all"
            type="button"
          >
            CLEAR
          </button>
        </label>
        
        <canvas
          ref={canvasRef}
          width={600}
          height={120}
          className="w-full h-[120px] bg-black/70 border-2 border-cyan/40 cursor-crosshair block touch-none"
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
        />
        
        <p className="font-mono text-xs text-cyan/60 mt-2">
          Sign above with your finger or mouse. This signature is legally binding under eIDAS (EU) 910/2014 
          and UAE Electronic Transactions Law.
        </p>
      </div>

      {/* Validation Warning */}
      {!isFormComplete && (
        <div className="bg-red-500/10 border border-red-500/40 p-4 flex items-start gap-3">
          <AlertTriangle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
          <p className="font-mono text-xs text-red-400">
            All parent/guardian fields must be completed before signature is valid.
          </p>
        </div>
      )}

      {/* Legal Notice */}
      <div className="bg-black/60 border border-fire-3/10 p-4 mt-4">
        <p className="font-mono text-[10px] text-fire-3/40 leading-relaxed text-center">
          By signing above, the parent/guardian certifies under penalty of perjury that all information provided is true and accurate, 
          and that they possess legal parental authority over the minor participant. 
          False statements may result in immediate termination of participation and potential legal consequences.
        </p>
      </div>
    </motion.div>
  );
}