/**
 * PAYMENT PROCESSOR COMPLIANCE - TEMPLATE DEMO
 * 
 * Shows what terms you MUST comply with when using payment processors.
 * ⚠️ Requirements differ between Stripe, Adyen, PayPal, etc.
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, AlertTriangle, CheckCircle2, Lock } from 'lucide-react';

export default function PaymentProcessorCompliance() {
  const [expandedProcessor, setExpandedProcessor] = useState('stripe');

  const processors = {
    stripe: {
      name: 'Stripe',
      logo: '🔵',
      type: 'Card Processor + Payment Orchestration',
      restrictions: [
        {
          title: 'Restricted Business List',
          content: [
            '❌ Cannot sell to users in: Cuba, Iran, North Korea, Syria (OFAC)',
            '❌ Cannot process: Gambling, adult content, weapons, counterfeit goods',
            '❌ Crypto-adjacent restrictions: Cannot process crypto-to-fiat conversions',
            '✓ NFTs are ALLOWED (as digital collectibles, not securities)',
          ],
          link: 'https://stripe.com/restricted-businesses',
        },
        {
          title: 'Chargeback & Dispute Policy',
          content: [
            '• Stripe allows customer-initiated chargebacks for "digital goods"',
            '• Customer can dispute within 180 days of transaction',
            '• If disputes exceed 1% of volume → account review/suspension',
            '• NFTs are non-refundable, but Stripe may allow chargeback if customer disputes',
            '• You can contest chargebacks with proof of delivery/agreement',
          ],
          link: 'https://stripe.com/en-ie/guides/strong-customer-authentication',
        },
        {
          title: 'KYC / AML Requirements',
          content: [
            '✓ Stripe handles KYC for YOU (merchant account verification)',
            '✗ YOU must verify customer identity if transaction > €5,000',
            '✗ YOU must monitor for suspicious patterns (wash trading, structuring)',
            '✓ Stripe flags high-risk transactions automatically',
            '⚠️ Ultimate Beneficial Owner (UBO) disclosure required',
          ],
          link: 'https://stripe.com/docs/compliance',
        },
        {
          title: 'Fee Structure',
          content: [
            '💳 Card fees: 2.9% + €0.35 per transaction',
            '💳 Bank transfer: 1% (varies by region)',
            '💳 Currency conversion: 1-2% markup',
            '❗ Refund fees: Same as original transaction fee',
            '🚨 High chargeback rate → higher reserve requirements',
          ],
          link: 'https://stripe.com/pricing',
        },
        {
          title: 'Data & Privacy Requirements',
          content: [
            '🔒 PCI-DSS Level 1 compliance required',
            '🔒 Never store full credit card numbers (Stripe tokenizes)',
            '🔒 GDPR: EU customers have withdrawal rights for "digital goods"',
            '🔒 Data retention: Keep transaction records 7-10 years (tax)',
            '🔒 Process encryption: TLS 1.2+ required',
          ],
          link: 'https://stripe.com/security',
        },
      ],
      mustDo: [
        '✅ Display Stripe badge/logo on checkout',
        '✅ Clear refund policy (non-refundable NFTs)',
        '✅ Terms mentioning Stripe processes payments',
        '✅ Implement 3D Secure authentication (SCA)',
        '✅ Keep webhook logs for 1 year (for audit)',
      ],
    },
    adyen: {
      name: 'Adyen',
      logo: '🟢',
      type: 'Global Payment Orchestration',
      restrictions: [
        {
          title: 'Restricted Activities',
          content: [
            '❌ Cannot sell in sanctioned countries (OFAC/EU list)',
            '❌ Crypto exchanges (but crypto collectibles/NFTs allowed)',
            '❌ Peer-to-peer payment systems',
            '❌ High-risk merchants (casinos, adult content)',
            '✓ Digital collectibles (NFTs) are explicitly ALLOWED',
          ],
          link: 'https://docs.adyen.com/risk-management/prohibited-activities',
        },
        {
          title: 'Dispute & Chargeback Policy',
          content: [
            '• Adyen processes disputes on behalf of card networks',
            '• Customer has up to 120 days to dispute (varies by card)',
            '• Digital goods disputes commonly ruled AGAINST merchant',
            '• Proof of delivery/acceptance required to fight chargebacks',
            '• If dispute rate > 0.8% → account restrictions',
          ],
          link: 'https://docs.adyen.com/risk-management/chargeback-and-disputes',
        },
        {
          title: 'KYC / Sanctions Checking',
          content: [
            '✓ Adyen performs merchant KYC verification',
            '⚠️ You must implement customer identity verification (high-value)',
            '⚠️ Screen customers against OFAC/ECCU lists (>€10k transactions)',
            '✓ Adyen provides compliance tools (Risk Management API)',
            '✓ Automatic fraud detection & 3D Secure',
          ],
          link: 'https://docs.adyen.com/risk-management',
        },
        {
          title: 'Fee Structure',
          content: [
            '💳 Card rates: 1.5-3.5% + fixed fee (region-dependent)',
            '💳 Local payment methods: 1-4% (e-wallet, bank transfer)',
            '💳 Recurring/subscription: Discounted rates possible',
            '💳 Currency conversion: 1.5% markup (transparent)',
            '🌍 Multi-currency settlement (40+ currencies supported)',
          ],
          link: 'https://www.adyen.com/pricing',
        },
        {
          title: 'Regulatory Compliance',
          content: [
            '🔒 PCI-DSS Level 1 certified',
            '🔒 GDPR compliant (EU data residency available)',
            '🔒 SCA/3D Secure mandatory for EU cards (>€50)',
            '🔒 Reporting: Provide transaction statements for tax compliance',
            '🔒 Settlement: T+1 or T+2 (next business day)',
          ],
          link: 'https://www.adyen.com/policies-and-compliance',
        },
      ],
      mustDo: [
        '✅ Implement Adyen Hosted Payment Page or API',
        '✅ Enable 3D Secure authentication',
        '✅ Display clear refund policy (non-refundable NFTs)',
        '✅ Handle webhooks securely (HMAC signature verification)',
        '✅ Annual compliance attestation (if requested)',
      ],
    },
  };

  const current = processors[expandedProcessor];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-fire-3/10 to-cyan/10 border border-fire-3/20 p-6 rounded-lg">
        <h2 className="text-fire-gradient font-orbitron font-black text-2xl mb-2 flex items-center gap-2">
          <CreditCard size={28} />
          Payment Processor Compliance
        </h2>
        <p className="font-rajdhani text-sm text-fire-4/80">
          When using Stripe, Adyen, or other processors, you MUST comply with their specific terms.
          They can suspend/terminate accounts for violations.
        </p>
      </div>

      {/* Processor Selector */}
      <div className="flex gap-3">
        {Object.keys(processors).map((key) => (
          <button
            key={key}
            onClick={() => setExpandedProcessor(key)}
            className={`flex-1 p-4 border rounded transition-all ${
              expandedProcessor === key
                ? 'border-fire-3 bg-fire-3/20'
                : 'border-fire-3/20 bg-fire-3/5 hover:border-fire-3/40'
            }`}
          >
            <div className="font-orbitron font-bold text-fire-5 mb-1">
              {processors[key].logo} {processors[key].name}
            </div>
            <div className="font-mono text-xs text-fire-3/60">
              {processors[key].type}
            </div>
          </button>
        ))}
      </div>

      {/* Processor Details */}
      <motion.div
        key={expandedProcessor}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Restrictions */}
        <div className="space-y-4">
          <h3 className="font-orbitron font-bold text-fire-5 text-lg">RESTRICTIONS & REQUIREMENTS</h3>

          {current.restrictions.map((restriction, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-gradient-to-br from-[rgba(10,4,18,0.97)] to-[rgba(4,2,8,0.99)] border border-fire-3/20 p-5 rounded-lg"
            >
              <div className="flex items-start gap-3 mb-3">
                <AlertTriangle className="w-5 h-5 text-fire-4 flex-shrink-0 mt-0.5" />
                <h4 className="font-rajdhani font-bold text-fire-5">
                  {restriction.title}
                </h4>
              </div>

              <ul className="space-y-2 mb-4">
                {restriction.content.map((item, i) => (
                  <li key={i} className="font-rajdhani text-sm text-fire-4/80 ml-2">
                    {item}
                  </li>
                ))}
              </ul>

              <a
                href={restriction.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-cyan text-xs hover:underline font-mono"
              >
                📖 Official policy →
              </a>
            </motion.div>
          ))}
        </div>

        {/* Must-Do Checklist */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: current.restrictions.length * 0.1 }}
          className="bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/30 p-6 rounded-lg"
        >
          <h3 className="font-orbitron font-bold text-green-400 mb-4 flex items-center gap-2">
            <CheckCircle2 size={20} />
            Implementation Checklist
          </h3>

          <div className="space-y-2">
            {current.mustDo.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-black font-bold text-xs mt-0.5 flex-shrink-0">
                  ✓
                </div>
                <span className="font-rajdhani text-sm text-green-400/90">{item}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* PCI-DSS Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-black/40 border border-cyan/30 p-6 rounded-lg"
        >
          <h3 className="font-orbitron font-bold text-cyan mb-3 flex items-center gap-2">
            <Lock size={18} />
            PCI-DSS Compliance
          </h3>
          <p className="font-rajdhani text-sm text-cyan/80 mb-3">
            Even though {current.name} handles payment processing, YOU are responsible for:
          </p>
          <ul className="space-y-2 font-rajdhani text-sm text-cyan/80">
            <li>✓ Never logging/storing raw credit card data</li>
            <li>✓ Using tokenized/vault systems (provided by processor)</li>
            <li>✓ Encrypting data in transit (TLS 1.2+)</li>
            <li>✓ Keeping merchant account credentials secure</li>
            <li>✓ Regular security audits (annually or per merchant agreement)</li>
          </ul>
        </motion.div>
      </motion.div>

      {/* Final Warning */}
      <div className="bg-red-500/10 border border-red-500/30 p-6 rounded-lg">
        <h3 className="font-orbitron font-bold text-red-400 mb-3">⚠️ CRITICAL WARNINGS</h3>
        <ul className="space-y-2 font-rajdhani text-sm text-red-400/90">
          <li>
            🚫 <strong>Terms Violations:</strong> If you violate processor terms (high chargebacks, KYC failures),
            they can suspend your account permanently and hold settlement for 180 days
          </li>
          <li>
            🚫 <strong>No Appeal Process:</strong> Major processors have limited appeals for account suspensions
          </li>
          <li>
            🚫 <strong>Blacklist Risk:</strong> Violation flags may be shared with other processors (industry databases)
          </li>
          <li>
            🚫 <strong>This is a Template:</strong> Actual processor terms change frequently.
            Read the full terms before integration.
          </li>
        </ul>
      </div>
    </div>
  );
}