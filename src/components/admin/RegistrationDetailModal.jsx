import React, { useState } from 'react';
import { format } from 'date-fns';
import { FileText, Shield, PenTool, Image, Globe, Coins, Mail, CheckCircle2, XCircle, ExternalLink, X } from 'lucide-react';

const SECTIONS = ['overview', 'document', 'contract', 'consents', 'signatures'];

export default function RegistrationDetailModal({ registration: reg, event, onClose }) {
  const [tab, setTab] = useState('overview');

  if (!reg) return null;

  const isMinor = reg.is_minor;
  const gdpr = reg.gdpr_consents || {};

  const consentItems = [
    { key: 'necessary', icon: Shield, label: 'Essential Processing', color: 'cyan' },
    { key: 'marketing', icon: Mail, label: 'Marketing Communications', color: 'fire-3' },
    { key: 'imageRights', icon: Image, label: 'Image Rights & Content', color: 'fire-4' },
    { key: 'tokenization', icon: Coins, label: 'Tokenization & Blockchain', color: 'fire-5' },
    { key: 'crossBorder', icon: Globe, label: 'Cross-Border Data Transfers', color: 'purple-400' },
  ];

  return (
    <div className="fixed inset-0 z-[700] bg-black/95 backdrop-blur-xl flex items-start justify-center overflow-y-auto p-4">
      <div className="relative w-full max-w-[860px] bg-gradient-to-br from-[rgba(10,4,18,0.99)] to-[rgba(4,2,8,1)] border border-fire-3/20 clip-cyber p-6 md:p-8 my-8">
        <div className="absolute top-0 left-0 right-0 fire-line" />
        <div className="absolute top-0 right-0 w-[18px] h-[18px] bg-gradient-to-bl from-fire-5 to-fire-2" style={{ clipPath: 'polygon(100% 0,100% 100%,0 0)' }} />

        <button onClick={onClose} className="absolute top-3 right-4 font-mono text-[10px] tracking-[2px] text-fire-3/30 hover:text-fire-3 flex items-center gap-1">
          <X size={12} /> CLOSE
        </button>

        {/* Header */}
        <div className="mb-5">
          <p className="font-mono text-[9px] tracking-[3px] uppercase text-fire-3/40 mb-1">REGISTRATION FILE</p>
          <h2 className="text-fire-gradient font-orbitron font-black text-xl tracking-[2px]">
            {reg.first_name} {reg.last_name}
          </h2>
          <div className="flex flex-wrap gap-3 mt-2 font-mono text-xs text-fire-3/50">
            <span>{reg.email}</span>
            <span>•</span>
            <span>{reg.type?.toUpperCase()}</span>
            <span>•</span>
            <span className={`px-2 py-0.5 border text-[9px] tracking-[1px] ${
              reg.status === 'confirmed' ? 'border-green-500/40 text-green-400 bg-green-500/10' :
              reg.status === 'rejected' ? 'border-red-500/40 text-red-400 bg-red-500/10' :
              'border-fire-3/40 text-fire-4 bg-fire-3/10'
            }`}>{reg.status?.toUpperCase()}</span>
            {isMinor && <span className="px-2 py-0.5 border border-cyan/40 text-cyan bg-cyan/10 text-[9px] tracking-[1px]">MINOR</span>}
          </div>
        </div>

        {/* Tab Nav */}
        <div className="flex gap-0 border-b border-fire-3/20 mb-6 overflow-x-auto">
          {SECTIONS.map(s => (
            <button
              key={s}
              onClick={() => setTab(s)}
              className={`font-mono text-[9px] tracking-[2px] uppercase px-4 py-2.5 transition-all whitespace-nowrap border-b-2 ${
                tab === s ? 'border-fire-3 text-fire-4 bg-fire-3/5' : 'border-transparent text-fire-3/30 hover:text-fire-3/60'
              }`}
            >
              {s === 'document' ? '🪪 Document' :
               s === 'contract' ? '📋 Contract' :
               s === 'consents' ? '🔒 GDPR' :
               s === 'signatures' ? '✍️ Signatures' : '👤 Overview'}
            </button>
          ))}
        </div>

        {/* OVERVIEW */}
        {tab === 'overview' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                ['Full Name', `${reg.first_name} ${reg.last_name}`],
                ['Email', reg.email],
                ['Phone', reg.phone],
                ['Date of Birth', reg.date_of_birth],
                ['Age at Registration', `${reg.age_at_registration} years old`],
                ['Sport / Discipline', reg.sport || 'Spectator'],
                ['Registration Type', reg.type],
                ['Attendance Mode', reg.attendance_mode || '—'],
                ['Ticket Code', reg.ticket_code],
                ['Seat / Zone', reg.seat_zone || '—'],
                ['Contract Version', reg.contract_version],
                ['GDPR Consent Date', reg.gdpr_consent_date ? format(new Date(reg.gdpr_consent_date), 'dd MMM yyyy HH:mm') : '—'],
                ['Referral Source', reg.referral_source || '—'],
                ['UTM Source', reg.utm_source || '—'],
                ['UTM Campaign', reg.utm_campaign || '—'],
              ].map(([label, value]) => (
                <div key={label} className="p-3 bg-fire-3/5 border border-fire-3/10">
                  <p className="font-mono text-[9px] tracking-[2px] uppercase text-fire-3/40 mb-0.5">{label}</p>
                  <p className="font-rajdhani font-semibold text-sm text-fire-4">{value || '—'}</p>
                </div>
              ))}
            </div>

            {/* Parental data if minor */}
            {isMinor && reg.parental_consent && (
              <div className="mt-4 p-5 bg-cyan/5 border border-cyan/20">
                <h4 className="font-orbitron font-bold text-sm text-cyan mb-3 flex items-center gap-2">
                  <Shield size={14} /> PARENTAL CONSENT DATA
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    ['Parent Full Name', reg.parental_consent.parent_full_name],
                    ['Relationship', reg.parental_consent.parent_relationship],
                    ['Parent ID Number', reg.parental_consent.parent_id_number],
                    ['Parent Email', reg.parental_consent.parent_email],
                    ['Parent Phone', reg.parental_consent.parent_phone],
                  ].map(([label, value]) => (
                    <div key={label} className="p-3 bg-cyan/5 border border-cyan/10">
                      <p className="font-mono text-[9px] tracking-[2px] uppercase text-cyan/40 mb-0.5">{label}</p>
                      <p className="font-rajdhani font-semibold text-sm text-cyan">{value || '—'}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* DOCUMENT */}
        {tab === 'document' && (
          <div className="space-y-4">
            <p className="font-mono text-[10px] tracking-[2px] uppercase text-fire-3/40">UPLOADED IDENTITY DOCUMENT</p>
            {reg.id_document ? (
              <div className="space-y-3">
                <div className="border border-fire-3/20 bg-black/40 p-4">
                  {reg.id_document.match(/\.(jpg|jpeg|png)$/i) ? (
                    <img
                      src={reg.id_document}
                      alt="ID Document"
                      className="max-w-full max-h-[400px] object-contain mx-auto block"
                    />
                  ) : reg.id_document.match(/\.pdf$/i) ? (
                    <div className="text-center py-10">
                      <FileText size={48} className="text-fire-3/40 mx-auto mb-3" />
                      <p className="font-mono text-xs text-fire-3/50 mb-4">PDF Document</p>
                      <a
                        href={reg.id_document}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-fire text-[10px] py-2 px-4 inline-flex items-center gap-2 no-underline"
                      >
                        <ExternalLink size={12} /> Open PDF
                      </a>
                    </div>
                  ) : (
                    <a
                      href={reg.id_document}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-fire text-[10px] py-2 px-4 inline-flex items-center gap-2 no-underline"
                    >
                      <ExternalLink size={12} /> View Document
                    </a>
                  )}
                </div>
                <a
                  href={reg.id_document}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 font-mono text-xs text-fire-3/50 hover:text-fire-3 transition-colors no-underline"
                >
                  <ExternalLink size={11} /> Open in new tab
                </a>
              </div>
            ) : (
              <div className="text-center py-16 border border-fire-3/10 bg-fire-3/5">
                <FileText size={40} className="text-fire-3/20 mx-auto mb-3" />
                <p className="font-mono text-xs text-fire-3/30">No document uploaded</p>
              </div>
            )}
          </div>
        )}

        {/* CONTRACT */}
        {tab === 'contract' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="font-mono text-[10px] tracking-[2px] uppercase text-fire-3/40">SIGNED PARTICIPATION AGREEMENT — v{reg.contract_version || '1.2'}</p>
              <span className={`font-mono text-[9px] tracking-[1px] px-2 py-1 border ${reg.contract_accepted ? 'border-green-500/40 text-green-400 bg-green-500/10' : 'border-red-500/40 text-red-400 bg-red-500/10'}`}>
                {reg.contract_accepted ? '✓ ACCEPTED' : '✗ NOT ACCEPTED'}
              </span>
            </div>

            <div className="bg-black/60 border border-fire-3/15 p-6 max-h-[520px] overflow-y-auto font-mono text-[11px] leading-loose text-fire-4/50 space-y-4">
              {/* Header */}
              <div className="text-center border-b border-fire-3/20 pb-4 mb-4">
                <h4 className="font-orbitron font-black text-base tracking-[3px] text-fire-3 uppercase mb-1">COMPREHENSIVE PARTICIPATION AGREEMENT</h4>
                <p className="text-xs text-fire-3/60">Street Dynamics Holding FZE (IFZA, Dubai, UAE)</p>
                <p className="text-xs text-fire-3/60">Version {reg.contract_version || '1.2'} — Signed: {reg.gdpr_consent_date ? format(new Date(reg.gdpr_consent_date), 'dd MMM yyyy HH:mm') : '—'}</p>
              </div>

              {/* Participant Info block */}
              <div className="bg-fire-3/5 border border-fire-3/20 p-4 mb-4">
                <p className="font-rajdhani font-bold text-sm text-fire-4 mb-2">PARTY IDENTIFICATION — PARTICIPANT</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><span className="text-fire-3/40">Full Name:</span> <strong className="text-fire-4">{reg.first_name} {reg.last_name}</strong></div>
                  <div><span className="text-fire-3/40">Date of Birth:</span> <strong className="text-fire-4">{reg.date_of_birth}</strong></div>
                  <div><span className="text-fire-3/40">Email:</span> <strong className="text-fire-4">{reg.email}</strong></div>
                  <div><span className="text-fire-3/40">Phone:</span> <strong className="text-fire-4">{reg.phone}</strong></div>
                  <div><span className="text-fire-3/40">Age:</span> <strong className="text-fire-4">{reg.age_at_registration} {isMinor ? '(MINOR — Parental consent required)' : '(Adult)'}</strong></div>
                  <div><span className="text-fire-3/40">Type:</span> <strong className="text-fire-4">{reg.type} — {reg.attendance_mode}</strong></div>
                  <div><span className="text-fire-3/40">Event:</span> <strong className="text-fire-4">{event.title}</strong></div>
                  <div><span className="text-fire-3/40">Event Date:</span> <strong className="text-fire-4">{event.date}</strong></div>
                  <div><span className="text-fire-3/40">Ticket Code:</span> <strong className="text-fire-4">{reg.ticket_code}</strong></div>
                  <div><span className="text-fire-3/40">IP Address:</span> <strong className="text-fire-4">{reg.ip_address || 'REDACTED'}</strong></div>
                </div>
              </div>

              {isMinor && reg.parental_consent && (
                <div className="bg-cyan/5 border border-cyan/20 p-4 mb-4">
                  <p className="font-rajdhani font-bold text-sm text-cyan mb-2">PARENT / LEGAL GUARDIAN</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div><span className="text-cyan/40">Name:</span> <strong className="text-cyan">{reg.parental_consent.parent_full_name}</strong></div>
                    <div><span className="text-cyan/40">Relationship:</span> <strong className="text-cyan">{reg.parental_consent.parent_relationship}</strong></div>
                    <div><span className="text-cyan/40">ID Number:</span> <strong className="text-cyan">{reg.parental_consent.parent_id_number}</strong></div>
                    <div><span className="text-cyan/40">Email:</span> <strong className="text-cyan">{reg.parental_consent.parent_email}</strong></div>
                    <div><span className="text-cyan/40">Phone:</span> <strong className="text-cyan">{reg.parental_consent.parent_phone}</strong></div>
                  </div>
                </div>
              )}

              {/* Contract body — abbreviated key articles with participant data */}
              <p><strong className="text-fire-4">ARTICLE 1 — SCOPE:</strong> This Agreement governs the Participant's {reg.type === 'athlete' ? 'active participation as an athlete/competitor' : 'attendance as a spectator'} in "{event.title}" ({event.date}, {event.location}), organized by Street Dynamics Holding FZE.</p>

              <p><strong className="text-fire-4">ARTICLE 2 — LIABILITY WAIVER:</strong> {reg.type === 'athlete' ? 'Participant acknowledges athletic competition involves inherent physical risks and voluntarily assumes all such risks.' : 'Participant acknowledges attending live sports events involves risks and voluntarily attends at their own risk.'} Release of liability granted to Street Dynamics Holding FZE except in cases of gross negligence.</p>

              <p><strong className="text-fire-4">ARTICLE 3 — IMAGE RIGHTS:</strong> Participant grants Street Dynamics a worldwide, royalty-free license to capture, publish, and create derivative works from their image and performance data, including NFT minting {gdpr?.imageRights ? '(CONSENT GRANTED)' : '(CONSENT NOT GIVEN)'}.</p>

              <p><strong className="text-fire-4">ARTICLE 4 — DATA PROTECTION:</strong> Personal data processed under GDPR (EU) 2016/679 and UAE Data Protection Law. GDPR Consent recorded: {reg.gdpr_consent_date ? format(new Date(reg.gdpr_consent_date), 'dd MMM yyyy HH:mm:ss') : '—'}. Marketing consent: {reg.marketing_consent ? 'YES' : 'NO'}. Cross-border transfers: {reg.cross_border_consent ? 'YES' : 'NO'}.</p>

              <p><strong className="text-fire-4">ARTICLE 5 — TOKENIZATION:</strong> {gdpr?.tokenization ? 'Participant consented to blockchain operations and token/NFT creation.' : 'Participant did NOT consent to tokenization. No tokens or NFTs may be created.'}</p>

              <p><strong className="text-fire-4">ARTICLE 6 — REFUND POLICY:</strong> 14+ days: 75% refund. 7-13 days: 50% refund. Under 7 days or no-show: No refund. Organizer cancellation: Full refund within 30 days.</p>

              <p><strong className="text-fire-4">ARTICLE 7 — GOVERNING LAW:</strong> This Agreement is governed by the laws of the DIFC, Dubai, UAE. Disputes resolved via DIFC-LCIA arbitration.</p>

              {isMinor && <p><strong className="text-fire-4">ARTICLE 8 — MINOR PROVISIONS:</strong> Participant is a minor ({reg.age_at_registration} years). Registration pending admin verification. Minor cannot purchase tokens, NFTs, or receive royalty payments until age 18. Parent/guardian co-signature required and recorded.</p>}

              <div className="border-t border-fire-3/20 pt-4 mt-4">
                <p className="text-fire-3/80">By affixing their digital signature, all parties confirm having read, understood, and voluntarily accepted all terms of this Agreement.</p>
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div>
                    <p className="text-fire-3/40 text-[10px]">Signed (Participant):</p>
                    <p className="text-fire-4 font-bold">{reg.first_name} {reg.last_name}</p>
                    <p className="text-fire-3/40 text-[10px]">{reg.gdpr_consent_date ? format(new Date(reg.gdpr_consent_date), 'dd MMM yyyy HH:mm') : '—'}</p>
                  </div>
                  {isMinor && reg.parental_consent && (
                    <div>
                      <p className="text-cyan/40 text-[10px]">Signed (Parent/Guardian):</p>
                      <p className="text-cyan font-bold">{reg.parental_consent.parent_full_name}</p>
                      <p className="text-cyan/40 text-[10px]">{reg.parental_consent.parent_relationship}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* GDPR CONSENTS */}
        {tab === 'consents' && (
          <div className="space-y-3">
            <p className="font-mono text-[10px] tracking-[2px] uppercase text-fire-3/40 mb-4">RECORDED GDPR CONSENT PREFERENCES</p>
            {consentItems.map(({ key, icon: Icon, label }) => {
              const granted = key === 'necessary' ? true : !!gdpr[key];
              return (
                <div key={key} className={`flex items-center justify-between p-4 border ${granted ? 'border-green-500/30 bg-green-500/5' : 'border-fire-3/15 bg-fire-3/5'}`}>
                  <div className="flex items-center gap-3">
                    <Icon size={16} className={granted ? 'text-green-400' : 'text-fire-3/30'} />
                    <span className="font-rajdhani font-semibold text-sm text-fire-4">{label}</span>
                  </div>
                  <div className={`flex items-center gap-1.5 font-mono text-[10px] tracking-[1px] ${granted ? 'text-green-400' : 'text-fire-3/40'}`}>
                    {granted ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                    {granted ? 'GRANTED' : 'NOT GIVEN'}
                  </div>
                </div>
              );
            })}
            <div className="mt-4 p-4 bg-fire-3/5 border border-fire-3/10">
              <p className="font-mono text-[10px] text-fire-3/40 leading-relaxed">
                Consent recorded: <strong className="text-fire-4">{reg.gdpr_consent_date ? format(new Date(reg.gdpr_consent_date), 'dd MMM yyyy HH:mm:ss') : '—'}</strong><br/>
                Contract version: <strong className="text-fire-4">{reg.contract_version || '—'}</strong><br/>
                Consent revoked: <strong className={reg.consent_revoked ? 'text-red-400' : 'text-green-400'}>{reg.consent_revoked ? `YES — ${reg.consent_revoked_date || ''}` : 'NO'}</strong>
              </p>
            </div>
          </div>
        )}

        {/* SIGNATURES */}
        {tab === 'signatures' && (
          <div className="space-y-6">
            <div>
              <p className="font-mono text-[10px] tracking-[2px] uppercase text-fire-3/40 mb-3">PARTICIPANT DIGITAL SIGNATURE</p>
              {reg.signature_url ? (
                <div className="border border-fire-3/20 bg-black/60 p-4">
                  <img src={reg.signature_url} alt="Participant Signature" className="max-w-full max-h-[120px] object-contain" />
                  <p className="font-mono text-[9px] text-fire-3/30 mt-2">
                    eIDAS / UAE Electronic Transactions Law compliant • {reg.gdpr_consent_date ? format(new Date(reg.gdpr_consent_date), 'dd MMM yyyy HH:mm') : '—'}
                  </p>
                </div>
              ) : (
                <div className="border border-fire-3/10 bg-fire-3/5 p-8 text-center">
                  <PenTool size={32} className="text-fire-3/20 mx-auto mb-2" />
                  <p className="font-mono text-xs text-fire-3/30">No signature recorded</p>
                </div>
              )}
            </div>

            {isMinor && (
              <div>
                <p className="font-mono text-[10px] tracking-[2px] uppercase text-cyan/40 mb-3">PARENT / GUARDIAN DIGITAL SIGNATURE</p>
                {reg.parental_consent?.signature_url ? (
                  <div className="border border-cyan/20 bg-black/60 p-4">
                    <img src={reg.parental_consent.signature_url} alt="Parent Signature" className="max-w-full max-h-[120px] object-contain" />
                    <p className="font-mono text-[9px] text-cyan/30 mt-2">
                      Parent: {reg.parental_consent.parent_full_name} ({reg.parental_consent.parent_relationship})
                    </p>
                  </div>
                ) : (
                  <div className="border border-cyan/10 bg-cyan/5 p-8 text-center">
                    <PenTool size={32} className="text-cyan/20 mx-auto mb-2" />
                    <p className="font-mono text-xs text-cyan/30">No parent signature recorded</p>
                  </div>
                )}
              </div>
            )}

            <div className="p-4 bg-fire-3/5 border border-fire-3/10">
              <p className="font-mono text-[9px] text-fire-3/40 leading-relaxed">
                Signatures are legally binding under eIDAS Regulation (EU) 910/2014 and UAE Federal Law No. 1/2006 on Electronic Transactions.
                Authenticity established via timestamp, IP address, and device fingerprint.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}