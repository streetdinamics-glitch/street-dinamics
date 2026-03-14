/**
 * NFT TERMS OF SERVICE - TEMPLATE DEMO
 * 
 * ⚠️ IMPORTANT: This is a template. Requires legal review before use.
 * Different jurisdictions (EU, US, UK, etc.) have different requirements.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, AlertCircle, FileText } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function NFTTermsOfService({ event, onAccept, onReject }) {
  const [expanded, setExpanded] = useState({});
  const [acceptedAll, setAcceptedAll] = useState(false);
  const [acceptedSections, setAcceptedSections] = useState({});

  const sections = [
    {
      id: 'ownership',
      title: '1. NFT OWNERSHIP & DIGITAL ASSET RIGHTS',
      content: `
        • You own the NFT serial number you mint (e.g., #5 of 100)
        • Ownership does NOT grant you copyright to the image/video
        • Athlete retains all commercial & broadcast rights
        • Street Dynamics retains platform IP rights
        • You may sell on secondary market (5% platform fee)
        • NFT is non-refundable once minted
      `,
      jurisdiction: 'EU/US/UK',
    },
    {
      id: 'no_liability',
      title: '2. NO LIABILITY FOR PERFORMANCE/VALUE',
      content: `
        • NFT value is not guaranteed and may decrease to zero
        • Athlete performance does not guarantee NFT appreciation
        • Street Dynamics is not responsible for market fluctuations
        • Secondary market trades are at your own risk
        • No insurance or buyer protection (except payment processor terms)
        • You acknowledge the speculative nature of digital assets
      `,
      jurisdiction: 'All Jurisdictions',
    },
    {
      id: 'data_privacy',
      title: '3. DATA & PRIVACY',
      content: `
        • Your email, purchase history are stored and processed
        • Data shared with payment processor (Stripe/Adyen)
        • EU: Subject to GDPR (right to access, deletion, portability)
        • We do not share data with 3rd parties without consent
        • You can request data export via settings → GDPR Tools
        • Retention: Purchase records kept for 10 years (tax/fraud)
      `,
      jurisdiction: 'GDPR (EU)',
    },
    {
      id: 'taxes',
      title: '4. TAX & FINANCIAL RESPONSIBILITY',
      content: `
        • YOU are responsible for capital gains taxes on NFT sales
        • YOU report purchase/sale to tax authorities
        • YOU track basis cost and holding period
        • Street Dynamics does NOT provide tax forms (1099-K, etc.)
        • Currency conversion handled by payment processor
        • VAT/GST may apply (varies by jurisdiction)
        
        EXAMPLE: Buy for €100, sell for €500
        → You owe capital gains tax on €400 profit (varies by country)
      `,
      jurisdiction: 'All Jurisdictions',
    },
    {
      id: 'disputes',
      title: '5. DISPUTE RESOLUTION & REFUNDS',
      content: `
        • NFTs are FINAL SALE (no refunds after minting)
        • Disputes resolved through email support first
        • If unresolved: mediation through [YOUR JURISDICTION]
        • Small claims court eligible for transactions under €5,000
        • Chargebacks/Payment disputes: Payment processor decides
        • Legal venue: [Your jurisdiction, e.g., Rome, Italy]
      `,
      jurisdiction: 'EU/US/UK',
    },
    {
      id: 'prohibited',
      title: '6. PROHIBITED CONDUCT',
      content: `
        ❌ Do NOT:
        • Impersonate others
        • Manipulate market prices / wash trading
        • Use bots to inflate demand
        • Exploit technical vulnerabilities
        • Harass athletes or other users
        • Use platform for money laundering
        
        CONSEQUENCE: Account suspension, legal action, law enforcement referral
      `,
      jurisdiction: 'All Jurisdictions',
    },
  ];

  const handleSectionAccept = (id) => {
    setAcceptedSections(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const allSectionsAccepted = sections.every(s => acceptedSections[s.id]);

  const handleFinalAccept = async () => {
    if (!allSectionsAccepted) {
      alert('Please review and accept all sections');
      return;
    }

    const user = await base44.auth.me();
    
    // Record acceptance
    await base44.functions.invoke('recordTermsAcceptance', {
      user_email: user.email,
      event_id: event?.id,
      terms_version: '1.0-NFT-TEMPLATE',
      sections_accepted: acceptedSections,
      timestamp: new Date().toISOString(),
      jurisdiction: 'EU-GDPR-TEMPLATE',
    });

    onAccept?.();
  };

  return (
    <div className="fixed inset-0 z-[600] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-3xl bg-gradient-to-br from-[rgba(10,4,18,0.99)] to-[rgba(4,2,8,1)] border border-fire-3/20 rounded-lg p-8"
      >
        {/* Header */}
        <div className="flex items-start gap-3 mb-6 pb-6 border-b border-fire-3/20">
          <AlertCircle className="w-6 h-6 text-fire-4 flex-shrink-0 mt-1" />
          <div>
            <h2 className="text-fire-gradient font-orbitron font-black text-2xl mb-2">
              NFT TERMS OF SERVICE
            </h2>
            <p className="font-mono text-xs text-fire-3/60">
              ⚠️ TEMPLATE DEMO - Must be reviewed by legal counsel before use
            </p>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-3 mb-8 max-h-[60vh] overflow-y-auto">
          {sections.map((section) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-fire-3/20 bg-fire-3/5 rounded"
            >
              {/* Section Header */}
              <button
                onClick={() => setExpanded(prev => ({ ...prev, [section.id]: !prev[section.id] }))}
                className="w-full p-4 flex items-center justify-between hover:bg-fire-3/10 transition-all"
              >
                <div className="text-left">
                  <h3 className="font-rajdhani font-bold text-sm text-fire-5 mb-1">
                    {section.title}
                  </h3>
                  <p className="font-mono text-xs text-fire-3/60">
                    Jurisdiction: {section.jurisdiction}
                  </p>
                </div>
                <motion.div
                  animate={{ rotate: expanded[section.id] ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown size={20} className="text-fire-3" />
                </motion.div>
              </button>

              {/* Content */}
              <AnimatePresence>
                {expanded[section.id] && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border-t border-fire-3/20 bg-black/40 p-4"
                  >
                    <p className="font-rajdhani text-sm text-fire-4/80 whitespace-pre-line mb-4">
                      {section.content}
                    </p>

                    {/* Acceptance Checkbox */}
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={acceptedSections[section.id] || false}
                        onChange={() => handleSectionAccept(section.id)}
                        className="w-4 h-4 accent-fire-3"
                      />
                      <span className="font-mono text-xs text-fire-3/80">
                        I have read and agree to this section
                      </span>
                    </label>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-fire-3/20 pt-6">
          <div className="bg-fire-3/5 border border-fire-3/20 p-4 rounded mb-4">
            <p className="font-mono text-xs text-fire-3/60 leading-relaxed">
              📋 By accepting, you confirm you have read, understood, and agree to all terms.
              These are binding legal terms. If you do not agree, do not proceed.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onReject}
              className="flex-1 bg-fire-3/10 border border-fire-3/20 text-fire-3 font-orbitron font-bold text-sm py-3 rounded hover:bg-fire-3/20 transition-all"
            >
              DECLINE
            </button>
            <button
              onClick={handleFinalAccept}
              disabled={!allSectionsAccepted}
              className="flex-1 bg-gradient-to-r from-fire-3 to-fire-4 text-black font-orbitron font-bold text-sm py-3 rounded hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <FileText size={16} />
              ACCEPT ALL TERMS
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}