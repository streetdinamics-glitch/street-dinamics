import React from 'react';
import { Shield, FileText, Scale, Globe } from 'lucide-react';

export default function LegalDocumentation() {
  const documents = [
    {
      title: 'Privacy Policy',
      icon: Shield,
      description: 'Complete GDPR and UAE Data Protection Law compliance documentation',
      sections: [
        'Data Controller Identity',
        'Processing Purposes and Legal Bases',
        'Data Categories and Retention',
        'Third-Party Processors',
        'Cross-Border Transfers (SCC)',
        'User Rights (Art. 15-22)',
        'Cookies and Tracking',
        'Children\'s Privacy (GDPR Art. 8)',
        'Blockchain and Right to Erasure',
        'Data Breach Notification',
        'Contact Information',
      ],
    },
    {
      title: 'Terms of Service',
      icon: FileText,
      description: 'Platform usage terms, user obligations, and service limitations',
      sections: [
        'Account Creation and Eligibility',
        'User Conduct and Prohibited Activities',
        'Intellectual Property Rights',
        'Payment and Refund Policy',
        'Limitation of Liability',
        'Indemnification',
        'Governing Law and Dispute Resolution',
        'Severability and Amendments',
        'Force Majeure',
        'Entire Agreement',
      ],
    },
    {
      title: 'Token & NFT Terms',
      icon: Globe,
      description: 'MiCA-compliant tokenomics, smart contract risks, and blockchain disclosures',
      sections: [
        'Token Classification (Utility, NOT Security)',
        'MiCA Compliance (EU Reg. 2023/1114)',
        'Age Restrictions (18+ for purchases)',
        'No Guarantee of Return',
        'Smart Contract Risks',
        'Blockchain Immutability',
        'Royalty Distribution Mechanics',
        'Secondary Market Rules',
        'Governance Voting Rights',
        'Platform Fee Structure',
      ],
    },
    {
      title: 'Participation Waiver',
      icon: Scale,
      description: 'Event liability waiver, assumption of risk, and medical authorization',
      sections: [
        'Acknowledgment of Risks',
        'Assumption of Risk',
        'Release of Liability',
        'Insurance Coverage',
        'Medical Authorization',
        'Fitness Declaration',
        'Code of Conduct',
        'Anti-Doping Compliance',
        'Disciplinary Measures',
        'Emergency Contact Authorization',
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="heading-fire text-4xl font-black mb-3">LEGAL DOCUMENTATION</h2>
        <p className="font-rajdhani text-lg text-fire-4/70 max-w-2xl mx-auto">
          Comprehensive legal framework ensuring full compliance with UAE, EU (GDPR, MiCA, eIDAS), 
          and international regulations for youth sports, data protection, and blockchain operations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {documents.map((doc, index) => {
          const Icon = doc.icon;
          
          return (
            <div key={index} className="bg-gradient-to-br from-[rgba(10,4,18,0.97)] to-[rgba(4,2,8,0.99)] border border-fire-3/20 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Icon size={24} className="text-fire-5" />
                <h3 className="font-orbitron font-bold text-lg text-fire-5">{doc.title}</h3>
              </div>
              
              <p className="font-rajdhani text-sm text-fire-4/70 mb-4 leading-relaxed">
                {doc.description}
              </p>

              <div className="bg-fire-3/5 border border-fire-3/10 p-4">
                <h5 className="font-mono text-xs text-fire-3 font-bold mb-2 tracking-[1px]">KEY SECTIONS:</h5>
                <ul className="space-y-1">
                  {doc.sections.map((section, i) => (
                    <li key={i} className="font-mono text-xs text-fire-3/60 flex items-start gap-2">
                      <span className="text-fire-3">•</span>
                      <span>{section}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      {/* Regulatory Compliance Summary */}
      <div className="bg-gradient-to-br from-cyan/10 to-cyan/5 border border-cyan/30 p-6">
        <h3 className="font-orbitron font-bold text-xl text-cyan mb-4">REGULATORY COMPLIANCE FRAMEWORK</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
          <div>
            <h5 className="text-cyan font-bold mb-2 tracking-[2px]">EU REGULATIONS:</h5>
            <ul className="space-y-1 text-cyan/70">
              <li>• GDPR (2016/679) — Data Protection</li>
              <li>• MiCA (2023/1114) — Crypto-Assets</li>
              <li>• eIDAS (910/2014) — Electronic Signatures</li>
              <li>• ODR (524/2013) — Consumer Disputes</li>
              <li>• Cookie Law (2009/136/EC)</li>
            </ul>
          </div>

          <div>
            <h5 className="text-cyan font-bold mb-2 tracking-[2px]">UAE LAWS:</h5>
            <ul className="space-y-1 text-cyan/70">
              <li>• DIFC Data Protection Law No. 5/2020</li>
              <li>• Federal Law No. 1/2006 (E-Transactions)</li>
              <li>• Commercial Transactions Law</li>
              <li>• Child Protection Law</li>
              <li>• IFZA Free Zone Regulations</li>
            </ul>
          </div>

          <div>
            <h5 className="text-cyan font-bold mb-2 tracking-[2px]">INTERNATIONAL:</h5>
            <ul className="space-y-1 text-cyan/70">
              <li>• UNCITRAL Model Law (E-Signatures)</li>
              <li>• WADA Anti-Doping Code (Athletes)</li>
              <li>• PCI-DSS (Payment Security)</li>
              <li>• ISO 27001 (Data Security)</li>
            </ul>
          </div>

          <div>
            <h5 className="text-cyan font-bold mb-2 tracking-[2px]">JURISDICTION:</h5>
            <ul className="space-y-1 text-cyan/70">
              <li>• Primary: DIFC Courts (Dubai)</li>
              <li>• Arbitration: DIFC-LCIA Centre</li>
              <li>• EU Consumers: Local courts retained</li>
              <li>• Language: English</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-fire-3/5 border border-fire-3/20 p-6">
        <h4 className="font-orbitron font-bold text-sm text-fire-4 mb-3">LEGAL CONTACTS</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
          <div>
            <p className="text-fire-3/60 mb-1">General Legal:</p>
            <p className="text-fire-4">legal@streetdynamics.ae</p>
          </div>
          <div>
            <p className="text-fire-3/60 mb-1">Data Protection Officer:</p>
            <p className="text-fire-4">privacy@streetdynamics.ae</p>
          </div>
          <div>
            <p className="text-fire-3/60 mb-1">User Support:</p>
            <p className="text-fire-4">support@streetdynamics.ae</p>
          </div>
        </div>
        <p className="font-mono text-[10px] text-fire-3/60 mt-4 text-center">
          Street Dynamics Holding FZE — IFZA Business Park, Dubai, UAE — License: [TBD]<br/>
          Response Time: 48h general | 30 days GDPR requests | 24h urgent safety matters
        </p>
      </div>
    </div>
  );
}