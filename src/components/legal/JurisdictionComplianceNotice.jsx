/**
 * JURISDICTION-SPECIFIC NFT COMPLIANCE NOTICE - TEMPLATE DEMO
 * 
 * ⚠️ This is a template showing compliance notices for different jurisdictions.
 * MUST be customized by legal counsel for your specific jurisdiction.
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Globe, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function JurisdictionComplianceNotice({ userJurisdiction = 'EU' }) {
  const [selectedJurisdiction, setSelectedJurisdiction] = useState(userJurisdiction);

  const jurisdictions = {
    EU: {
      name: '🇪🇺 EUROPEAN UNION (GDPR)',
      regulations: [
        {
          law: 'GDPR (General Data Protection Regulation)',
          applies: 'Your personal data',
          requirement: 'Explicit consent, right to access/deletion, data portability',
          link: 'https://gdpr-info.eu/',
        },
        {
          law: 'Consumer Rights Directive 2011/83/EU',
          applies: 'Purchase withdrawal',
          requirement: '14-day right of withdrawal (applies BEFORE NFT minting)',
          link: 'https://ec.europa.eu/info/law/consumer-rights-directive_en',
        },
        {
          law: 'VAT Directive 2006/112/EC',
          applies: 'NFT sales',
          requirement: 'VAT may apply (reverse charge for intangible goods)',
          link: 'https://ec.europa.eu/taxation_customs/business/vat_en',
        },
        {
          law: 'MiFID II / ESMA Guidelines',
          applies: 'If NFT deemed investment product',
          requirement: 'May require regulatory license & investor warnings',
          link: 'https://www.esma.europa.eu/policy-rules/mifid-ii',
        },
      ],
      compliantIfStatement: `
        ✓ If Street Dynamics has:
        - Clear data processing agreement (DPA)
        - Privacy policy in local language
        - Designated data protection officer
        - Withdrawal process BEFORE minting
        - VAT compliance mechanism
      `,
    },
    US: {
      name: '🇺🇸 UNITED STATES',
      regulations: [
        {
          law: 'FTC Guides & Unfair/Deceptive Acts Rule',
          applies: 'All NFT marketing',
          requirement: 'No false claims about value, utility, or celebrity endorsements',
          link: 'https://www.ftc.gov/news-events/news/2023/09/ftc-staff-warns-against-deceptive-nft-claims',
        },
        {
          law: 'Securities Act 1933 & SEC Rules',
          applies: 'If NFT represents ownership/dividends',
          requirement: 'May require registration or exemption qualification',
          link: 'https://www.sec.gov/litigation/admin/2024/33-11301.pdf',
        },
        {
          law: 'State Consumer Protection Acts',
          applies: 'Varies by state (CA, NY, TX, etc.)',
          requirement: 'State-specific warnings, refund policies, disclosure',
          link: 'https://consumer.ftc.gov/articles/how-recognize-and-report-spam-text-messages',
        },
        {
          law: 'IRS Tax Guidance',
          applies: 'Capital gains on NFT sales',
          requirement: 'Report gains on Form 8949 (creator may issue 1099-K)',
          link: 'https://www.irs.gov/pub/irs-drop/n-22-36.pdf',
        },
      ],
      compliantIfStatement: `
        ✓ If Street Dynamics has:
        - Clear disclaimer: "NFTs may be unregistered securities"
        - No false endorsement claims (athlete performance = price)
        - Plain English disclosures (risks, volatility, loss of value)
        - State-compliant terms (varies by user location)
        - Tax reporting capability (for high-volume traders)
      `,
    },
    UK: {
      name: '🇬🇧 UNITED KINGDOM',
      regulations: [
        {
          law: 'Consumer Rights Act 2015',
          applies: 'Digital services',
          requirement: 'Right of withdrawal (14 days), fair terms, clear pricing',
          link: 'https://www.legislation.gov.uk/ukpga/2015/15/contents',
        },
        {
          law: 'Data Protection Act 2018 (GDPR equivalent)',
          applies: 'Personal data',
          requirement: 'Similar to EU GDPR (post-Brexit alignment)',
          link: 'https://www.legislation.gov.uk/ukpga/2018/12/contents',
        },
        {
          law: 'FCA Handbook (if classified as investment)',
          applies: 'Regulatory scope unclear',
          requirement: 'FCA guidance on "financial promotion" of crypto/NFTs',
          link: 'https://www.fca.org.uk/news/statements/our-approach-crypto-assets-and-promotion-crypto-assets',
        },
        {
          law: 'Online Safety Bill 2023',
          applies: 'User-generated content, scam prevention',
          requirement: 'Duty of care to prevent fraud on platform',
          link: 'https://www.legislation.gov.uk/ukpga/2023/50/contents',
        },
      ],
      compliantIfStatement: `
        ✓ If Street Dynamics has:
        - 14-day cancellation right (applies pre-mint)
        - Clear withdrawal mechanism
        - Anti-fraud monitoring & user protection
        - FCA-compliant disclosures (if applicable)
        - Fair contract terms (not unfair or hidden)
      `,
    },
    IT: {
      name: '🇮🇹 ITALY (SPECIFIC)',
      regulations: [
        {
          law: 'Codice della Privacy (Italian GDPR implementation)',
          applies: 'Personal data processing',
          requirement: 'Explicit consent, data minimization, DPO notification',
          link: 'https://www.garanteprivacy.it/',
        },
        {
          law: 'MiFID II (CONSOB)',
          applies: 'If NFT deemed investment product',
          requirement: 'May require authorization from CONSOB (Italian SEC)',
          link: 'https://www.consob.it/web/sezioneutente/documentazione',
        },
        {
          law: 'Decree Law 1/2023 (Crypto Assets)',
          applies: 'Digital asset taxation & regulation',
          requirement: 'Report crypto holdings > €51,645; tax on gains',
          link: 'https://www.agenziadelleentrate.gov.it/',
        },
        {
          law: 'Consumer Code (Legislative Decree 206/2005)',
          applies: 'Purchase of digital goods',
          requirement: '14-day withdrawal, clear terms in Italian',
          link: 'https://www.normattiva.it/uri-res/N2Srv?urnt=ur:nir:dlgs:2005-09-06;206',
        },
      ],
      compliantIfStatement: `
        ✓ If Street Dynamics has:
        - Italian language terms & privacy policy
        - Notification to Garante della Privacy (GDPR authority)
        - Clear withdrawal process (pre-mint)
        - Tax-friendly reporting (crypto holdings disclosure)
        - CONSOB compliance if deemed investment
      `,
    },
  };

  const current = jurisdictions[selectedJurisdiction] || jurisdictions.EU;

  return (
    <div className="space-y-6">
      {/* Jurisdiction Selector */}
      <div className="bg-gradient-to-r from-fire-3/10 to-fire-3/5 border border-fire-3/20 p-6 rounded-lg">
        <h2 className="text-fire-gradient font-orbitron font-black text-2xl mb-4 flex items-center gap-2">
          <Globe size={28} />
          Jurisdiction-Specific NFT Regulations
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.keys(jurisdictions).map((jur) => (
            <button
              key={jur}
              onClick={() => setSelectedJurisdiction(jur)}
              className={`p-3 border rounded transition-all font-mono text-sm font-bold tracking-[1px] ${
                selectedJurisdiction === jur
                  ? 'border-fire-3 bg-fire-3/20 text-fire-5'
                  : 'border-fire-3/20 bg-fire-3/5 text-fire-3/60 hover:border-fire-3/40'
              }`}
            >
              {jur}
            </button>
          ))}
        </div>
      </div>

      {/* Active Jurisdiction Content */}
      <motion.div
        key={selectedJurisdiction}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="bg-black/40 border border-fire-3/20 p-6 rounded-lg">
          <h3 className="font-orbitron font-bold text-2xl text-fire-5 mb-2">
            {current.name}
          </h3>
          <p className="font-rajdhani text-sm text-fire-4/80">
            Applicable laws & regulations that may govern NFT transactions
          </p>
        </div>

        {/* Regulations */}
        <div className="space-y-4">
          {current.regulations.map((reg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-gradient-to-br from-[rgba(10,4,18,0.97)] to-[rgba(4,2,8,0.99)] border border-fire-3/20 p-5 rounded-lg"
            >
              <div className="flex items-start gap-4 mb-3">
                <AlertCircle className="w-5 h-5 text-fire-4 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h4 className="font-orbitron font-bold text-fire-5 mb-1">
                    {reg.law}
                  </h4>
                  <div className="space-y-1 font-rajdhani text-xs text-fire-4/70">
                    <p>
                      <span className="font-bold text-fire-3">Applies to:</span> {reg.applies}
                    </p>
                    <p>
                      <span className="font-bold text-fire-3">Requirement:</span> {reg.requirement}
                    </p>
                    <a
                      href={reg.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan hover:underline mt-2 inline-block"
                    >
                      📖 Full text →
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Compliance Checklist */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: current.regulations.length * 0.1 }}
          className="bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/30 p-6 rounded-lg"
        >
          <h4 className="font-orbitron font-bold text-green-400 mb-3 flex items-center gap-2">
            <CheckCircle2 size={20} />
            What Makes Us Compliant in {selectedJurisdiction}?
          </h4>
          <pre className="font-mono text-xs text-green-400/80 whitespace-pre-wrap">
            {current.compliantIfStatement.trim()}
          </pre>
        </motion.div>

        {/* Warning */}
        <div className="bg-red-500/10 border border-red-500/30 p-6 rounded-lg">
          <p className="font-rajdhani text-sm text-red-400">
            <strong>⚠️ TEMPLATE DISCLAIMER:</strong> This is a template for demonstration purposes only.
            NFT regulation is rapidly evolving and varies by jurisdiction. Regulations listed may be incomplete
            or outdated. This is NOT legal advice. You MUST consult with a qualified attorney licensed in
            your specific jurisdiction before launching NFT platform or selling NFTs.
          </p>
        </div>
      </motion.div>
    </div>
  );
}