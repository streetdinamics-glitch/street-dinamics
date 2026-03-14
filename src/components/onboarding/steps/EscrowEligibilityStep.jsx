/**
 * Escrow Eligibility Step
 * Confirmation and eligibility summary
 */

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Lock, Users } from 'lucide-react';

export default function EscrowEligibilityStep({
  profileData,
  socialData,
  verificationData,
}) {
  const checks = [
    {
      title: 'Profile Complete',
      status: profileData.nickname && profileData.sports.length > 0,
      icon: CheckCircle,
    },
    {
      title: 'Identity Verified',
      status: !!verificationData.id_document_url,
      icon: Lock,
    },
    {
      title: 'Social Reach Calculated',
      status: socialData.calculatedReach > 0,
      icon: Users,
    },
  ];

  const allChecksPass = checks.every((c) => c.status);

  return (
    <div className="space-y-6">
      {/* Eligibility Checklist */}
      <div className="space-y-3">
        {checks.map((check, idx) => {
          const Icon = check.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`flex items-center gap-3 p-4 rounded-lg border ${
                check.status
                  ? 'bg-green-500/10 border-green-500/30'
                  : 'bg-orange-500/10 border-orange-500/20'
              }`}
            >
              <Icon
                size={24}
                className={
                  check.status ? 'text-green-400' : 'text-orange-400'
                }
              />
              <span
                className={`font-rajdhani font-bold ${
                  check.status ? 'text-green-400' : 'text-orange-400'
                }`}
              >
                {check.title}
              </span>
              {check.status && (
                <span className="ml-auto font-mono text-xs text-green-400 uppercase tracking-[1px]">
                  ✓ Complete
                </span>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Status Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={`p-6 rounded-lg border ${
          allChecksPass
            ? 'bg-gradient-to-r from-green-500/10 to-green-500/5 border-green-500/30'
            : 'bg-gradient-to-r from-orange-500/10 to-orange-500/5 border-orange-500/20'
        }`}
      >
        <div className="flex items-start gap-3">
          {allChecksPass ? (
            <CheckCircle size={28} className="text-green-400 flex-shrink-0 mt-1" />
          ) : (
            <AlertCircle size={28} className="text-orange-400 flex-shrink-0 mt-1" />
          )}
          <div>
            <h3 className={`font-orbitron font-black text-xl mb-2 ${
              allChecksPass ? 'text-green-400' : 'text-orange-400'
            }`}>
              {allChecksPass
                ? 'ESCROW ELIGIBLE ✓'
                : 'COMPLETE REQUIREMENTS'}
            </h3>
            <p className={`font-rajdhani text-sm ${
              allChecksPass ? 'text-green-400/70' : 'text-orange-400/70'
            }`}>
              {allChecksPass
                ? 'You are now eligible for escrow-backed sponsorship deals! You can receive milestone-based payments with full legal protection and automatic fund release upon brand approval.'
                : 'Complete all requirements to unlock escrow-backed payments and sponsorship opportunities.'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Benefits Summary */}
      {allChecksPass && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-black/40 border border-cyan/20 p-6 rounded-lg"
        >
          <h3 className="font-orbitron font-bold text-cyan mb-4">
            What You Can Now Do
          </h3>
          <ul className="space-y-3 font-rajdhani text-sm text-cyan/70">
            <li className="flex items-start gap-3">
              <CheckCircle size={16} className="text-cyan flex-shrink-0 mt-0.5" />
              <span>Apply for sponsorship deals with secure escrow payments</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle size={16} className="text-cyan flex-shrink-0 mt-0.5" />
              <span>Track milestone payments and automatically receive funds</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle size={16} className="text-cyan flex-shrink-0 mt-0.5" />
              <span>Earn tokens and participate in royalty distributions</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle size={16} className="text-cyan flex-shrink-0 mt-0.5" />
              <span>Dispute protection with third-party mediation</span>
            </li>
          </ul>
        </motion.div>
      )}
    </div>
  );
}