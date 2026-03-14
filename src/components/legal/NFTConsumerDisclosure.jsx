/**
 * NFT CONSUMER DISCLOSURE STATEMENTS - TEMPLATE DEMO
 * 
 * ⚠️ IMPORTANT: This is a template for demonstration.
 * Requires legal review & compliance with jurisdiction-specific consumer protection laws.
 * 
 * RELEVANT LAWS:
 * - EU: Consumer Rights Directive 2011/83/EU
 * - US: FTC Guides, State Consumer Protection Acts
 * - UK: Consumer Rights Act 2015
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Info, DollarSign, Clock, Zap } from 'lucide-react';

export default function NFTConsumerDisclosure() {
  const [acknowledged, setAcknowledged] = useState(false);

  const disclosures = [
    {
      icon: AlertTriangle,
      title: 'HIGH RISK INVESTMENT',
      color: 'from-red-500/20 to-red-500/10 border-red-500/30',
      textColor: 'text-red-400',
      details: [
        'NFTs are SPECULATIVE assets with volatile prices',
        'Value can drop to €0 - no minimum price guarantee',
        'Illiquid market - may take time to find buyer',
        'NOT FDIC insured or government protected',
        'Artist/athlete endorsement ≠ price guarantee',
      ],
    },
    {
      icon: DollarSign,
      title: 'PAYMENT & REFUND POLICY',
      color: 'from-cyan/20 to-cyan/10 border-cyan/30',
      textColor: 'text-cyan',
      details: [
        '✓ Payment processed via Stripe (cards) or Adyen (local)',
        '✓ 14-day right of withdrawal (EU only, applies if purchased after acceptance)',
        '✗ NFTs are FINAL SALE after minting (no refunds)',
        '✗ Cancellation request only valid BEFORE minting completes',
        '→ Chargeback disputes resolved by payment processor',
      ],
    },
    {
      icon: Zap,
      title: 'SMART CONTRACT & BLOCKCHAIN RISKS',
      color: 'from-purple-500/20 to-purple-500/10 border-purple-500/30',
      textColor: 'text-purple-400',
      details: [
        '⚠️ Current version: Centralized database (NOT blockchain)',
        '⚠️ If migrated to blockchain in future: gas fees apply',
        '⚠️ Blockchain transactions are irreversible',
        '⚠️ Lost private keys = lost NFT access (no recovery)',
        '⚠️ Smart contract bugs can cause permanent loss',
      ],
    },
    {
      icon: Clock,
      title: 'TIME LIMITS & EXPIRATION',
      color: 'from-fire-3/20 to-fire-3/10 border-fire-3/30',
      textColor: 'text-fire-4',
      details: [
        '⏱️ Withdrawal period: 14 days from purchase (EU)',
        '⏱️ Secondary market: No withdrawal right (final sale)',
        '⏱️ Data retention: 10 years (for tax/fraud prevention)',
        '⏱️ Platform may discontinue (3 months notice)',
        '⏱️ Payment processor fees locked at purchase time',
      ],
    },
    {
      icon: Info,
      title: 'DISCLOSURE: CONFLICTS OF INTEREST',
      color: 'from-yellow-500/20 to-yellow-500/10 border-yellow-500/30',
      textColor: 'text-yellow-500',
      details: [
        '💰 Street Dynamics takes 10% platform fee on all sales',
        '💰 Athletes/influencers may benefit from price increases',
        '💰 Athlete may create new drops (dilutes previous supply)',
        '💰 No lock-up period - athlete can dump supply anytime',
        '→ You should assume athletes have financial incentive to promote',
      ],
    },
    {
      icon: AlertTriangle,
      title: 'LEGAL STATUS BY JURISDICTION',
      color: 'from-orange-500/20 to-orange-500/10 border-orange-500/30',
      textColor: 'text-orange-500',
      details: [
        '🇪🇺 EU: Treated as digital goods (VAT applies)',
        '🇮🇹 Italy: May be classified as financial instrument (MiFID II)',
        '🇺🇸 US: SEC may classify as securities (ongoing debate)',
        '🇬🇧 UK: FCA jurisdiction unclear (rapidly evolving)',
        '⚠️ Your jurisdiction may have different rules - consult local counsel',
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-fire-3/10 to-cyan/10 border border-fire-3/20 p-6 rounded-lg">
        <h2 className="text-fire-gradient font-orbitron font-black text-2xl mb-2">
          CONSUMER DISCLOSURE STATEMENTS
        </h2>
        <p className="font-rajdhani text-sm text-fire-4/80 mb-3">
          You must read and understand these disclosures before purchasing any NFT.
        </p>
        <p className="font-mono text-xs text-fire-3/60">
          📋 TEMPLATE FOR DEMO PURPOSES - Requires legal review for production use
        </p>
      </div>

      {/* Disclosure Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {disclosures.map((disclosure, idx) => {
          const Icon = disclosure.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`bg-gradient-to-br ${disclosure.color} rounded-lg p-5 border`}
            >
              <div className="flex items-start gap-3 mb-4">
                <Icon className={`w-6 h-6 ${disclosure.textColor} flex-shrink-0 mt-0.5`} />
                <h3 className={`font-orbitron font-bold text-lg ${disclosure.textColor} tracking-[1px]`}>
                  {disclosure.title}
                </h3>
              </div>

              <ul className="space-y-2">
                {disclosure.details.map((detail, i) => (
                  <li key={i} className="font-rajdhani text-xs text-fire-4/80 leading-relaxed">
                    {detail}
                  </li>
                ))}
              </ul>
            </motion.div>
          );
        })}
      </div>

      {/* Compliance Notice */}
      <div className="bg-black/40 border border-fire-3/20 p-6 rounded-lg">
        <h3 className="font-orbitron font-bold text-fire-5 mb-4">⚖️ IMPORTANT LEGAL NOTICE</h3>
        <div className="space-y-3 font-rajdhani text-sm text-fire-4/80">
          <p>
            Street Dynamics is NOT a registered financial advisor, bank, or securities broker.
            These disclosures are provided for informational purposes only and do NOT constitute financial advice.
          </p>
          <p>
            <strong>Consult professionals:</strong>
            • Tax advisor (for capital gains treatment)
            • Securities attorney (for regulatory status in your jurisdiction)
            • Financial advisor (for portfolio allocation)
          </p>
          <p>
            <strong>Regulatory Status:</strong> The legal classification of NFTs is rapidly evolving.
            Your jurisdiction may treat these differently (digital goods, financial instruments, collectibles, etc.).
            You are responsible for compliance in your jurisdiction.
          </p>
        </div>
      </div>

      {/* Acknowledgment */}
      <div className="bg-fire-3/5 border border-fire-3/20 p-6 rounded-lg">
        <label className="flex items-start gap-4 cursor-pointer">
          <input
            type="checkbox"
            checked={acknowledged}
            onChange={(e) => setAcknowledged(e.target.checked)}
            className="w-5 h-5 mt-1 accent-fire-3"
          />
          <span className="font-rajdhani text-sm text-fire-4/80">
            I have read and understand these consumer disclosures. I acknowledge the risks of NFT investment
            and that I am not seeking financial advice from Street Dynamics.
          </span>
        </label>

        {acknowledged && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded"
          >
            <p className="font-mono text-xs text-green-400">✓ Disclosures acknowledged</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}