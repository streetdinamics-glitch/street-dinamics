import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Mail, Database, Globe, Image, Coins } from 'lucide-react';

export default function GDPRConsentManager({ onConsentChange, type, fireInitial = true }) {
  const [consents, setConsents] = useState({
    necessary: true, // Always required
    marketing: false,
    imageRights: false,
    tokenization: false,
    crossBorder: false,
  });

  // Only fire initial state if explicitly requested (registration modal needs it, onboarding doesn't)
  React.useEffect(() => {
    if (fireInitial) {
      onConsentChange(consents);
    }
  }, []);

  const handleToggle = (key) => {
    if (key === 'necessary') return; // Cannot opt-out
    
    const newConsents = { ...consents, [key]: !consents[key] };
    setConsents(newConsents);
    onConsentChange(newConsents);
  };

  const consentItems = [
    {
      key: 'necessary',
      icon: Shield,
      title: 'Essential Event Processing (Required)',
      description: 'Registration, ticketing, access control, safety communications, legal compliance. Cannot be disabled.',
      required: true,
      legalBasis: 'Contract Performance (GDPR Art. 6.1.b)',
      color: 'cyan',
    },
    {
      key: 'marketing',
      icon: Mail,
      title: 'Marketing & Promotional Communications',
      description: 'Receive emails about upcoming events, special offers, and platform news. You can unsubscribe anytime.',
      required: false,
      legalBasis: 'Explicit Consent (GDPR Art. 6.1.a)',
      color: 'fire-3',
    },
    {
      key: 'imageRights',
      icon: Image,
      title: 'Image Rights & Content Usage',
      description: 'Permission to capture and publish your photos/videos on social media, website, promotional materials, and NFT minting.',
      required: false,
      legalBasis: 'Explicit Consent (GDPR Art. 6.1.a)',
      color: 'fire-4',
    },
    {
      key: 'tokenization',
      icon: Coins,
      title: 'Tokenization & Blockchain Operations',
      description: type === 'athlete' 
        ? 'Create athlete tokens in your name, mint NFTs from your performances, process royalty distributions, and enable secondary market trading.'
        : 'Allow your participation data to be used in platform tokenomics and blockchain-based reward systems.',
      required: false,
      legalBasis: 'Explicit Consent (GDPR Art. 6.1.a + MiCA Compliance)',
      color: 'fire-5',
    },
    {
      key: 'crossBorder',
      icon: Globe,
      title: 'Cross-Border Data Transfers',
      description: 'Transfer data to service providers outside UAE/EU (USA, Singapore) under Standard Contractual Clauses for cloud hosting, payment processing, and blockchain operations.',
      required: false,
      legalBasis: 'Explicit Consent (GDPR Art. 49.1.a)',
      color: 'purple-400',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-cyan/5 border border-cyan/20 p-5">
        <h4 className="font-orbitron font-bold text-sm text-cyan mb-2 flex items-center gap-2">
          <Shield size={18} />
          DATA PROTECTION & CONSENT PREFERENCES
        </h4>
        <p className="font-mono text-xs text-cyan/70 leading-relaxed">
          Street Dinamics is committed to protecting your privacy under GDPR (EU) 2016/679 and UAE Data Protection Law. 
          Please review and customize your consent preferences below.
        </p>
      </div>

      {consentItems.map((item, index) => {
        const Icon = item.icon;
        const isActive = consents[item.key];

        return (
          <motion.div
            key={item.key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`border-2 p-5 transition-all ${
              isActive 
                ? `border-${item.color}/60 bg-${item.color}/10` 
                : 'border-fire-3/20 bg-fire-3/5'
            }`}
          >
            <div className="flex items-start gap-4">
              <Icon size={24} className={`text-${item.color} flex-shrink-0 mt-1`} />
              
              <div className="flex-grow">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h5 className="font-rajdhani font-bold text-sm text-fire-4 mb-1">
                      {item.title}
                      {item.required && (
                        <span className="ml-2 px-2 py-0.5 bg-cyan/20 border border-cyan/40 text-cyan text-[10px] font-mono tracking-[1px]">
                          REQUIRED
                        </span>
                      )}
                    </h5>
                    <p className="font-mono text-xs text-fire-3/60 italic">
                      {item.legalBasis}
                    </p>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consents[item.key]}
                      onChange={() => handleToggle(item.key)}
                      disabled={item.required}
                      className="sr-only peer"
                    />
                    <div className={`relative w-14 h-7 rounded-full peer transition-all ${
                      consents[item.key]
                        ? `bg-${item.color} border-2 border-${item.color}`
                        : 'bg-fire-3/10 border-2 border-fire-3/30'
                    } ${item.required ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                      <div className={`absolute top-0.5 left-0.5 bg-black w-6 h-6 rounded-full transition-transform ${
                        consents[item.key] ? 'translate-x-7' : 'translate-x-0'
                      }`} />
                    </div>
                  </label>
                </div>

                <p className="font-rajdhani text-sm text-fire-4/80 leading-relaxed mb-3">
                  {item.description}
                </p>

                {isActive && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="bg-black/40 border border-fire-3/10 p-3 mt-3"
                  >
                    <p className="font-mono text-[10px] text-fire-3/60 leading-relaxed">
                      <strong className="text-fire-4">✓ CONSENT GRANTED:</strong> You have authorized this data processing activity. 
                      You may withdraw consent at any time by contacting privacy@streetdynamics.ae. 
                      Withdrawal does not affect the lawfulness of processing before withdrawal.
                    </p>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}

      {/* Summary Footer */}
      <div className="bg-fire-3/5 border border-fire-3/20 p-5">
        <h5 className="font-orbitron font-bold text-sm text-fire-4 mb-3">CONSENT SUMMARY</h5>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 font-mono text-xs">
          {Object.entries(consents).map(([key, value]) => (
            <div key={key} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${value ? 'bg-green-400' : 'bg-red-400'}`} />
              <span className="text-fire-3/60 capitalize">{key.replace('_', ' ')}</span>
            </div>
          ))}
        </div>
        <p className="font-mono text-[10px] text-fire-3/60 mt-4 leading-relaxed">
          Data Protection Officer: streetdinamics@gmail.com | 
          Supervisory Authority: UAE Data Office (DIFC) | 
          EU Representative: [To Be Appointed if required]
        </p>
      </div>
    </div>
  );
}