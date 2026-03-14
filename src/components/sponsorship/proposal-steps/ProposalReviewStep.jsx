/**
 * Proposal Review Step
 * Final review before sending proposal
 */

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

export default function ProposalReviewStep({ data, brandName }) {
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Campaign Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-fire-3/5 border border-fire-3/20 p-4 rounded-lg"
        >
          <h3 className="font-rajdhani font-bold text-fire-4 mb-3">Campaign</h3>
          <div className="space-y-2 font-rajdhani text-sm">
            <p>
              <span className="text-fire-3/60">Title:</span>{' '}
              <span className="text-fire-4 font-bold">{data.campaign_title}</span>
            </p>
            <p>
              <span className="text-fire-3/60">From:</span>{' '}
              <span className="text-fire-4">{brandName}</span>
            </p>
            <p>
              <span className="text-fire-3/60">To:</span>{' '}
              <span className="text-fire-4">{data.target_athlete_name}</span>
            </p>
            <p>
              <span className="text-fire-3/60">Duration:</span>{' '}
              <span className="text-fire-4">
                {data.duration_days} days
              </span>
            </p>
          </div>
        </motion.div>

        {/* Budget Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-green-500/5 border border-green-500/20 p-4 rounded-lg"
        >
          <h3 className="font-rajdhani font-bold text-green-400 mb-3">Budget</h3>
          <div className="space-y-2 font-rajdhani text-sm">
            <p>
              <span className="text-green-400/60">Total:</span>{' '}
              <span className="text-green-400 font-bold text-lg">
                €{data.budget.toFixed(2)}
              </span>
            </p>
            <p>
              <span className="text-green-400/60">Athlete Receives:</span>{' '}
              <span className="text-green-400 font-bold">
                €{(data.budget * 0.95).toFixed(2)}
              </span>
            </p>
            <p>
              <span className="text-green-400/60">Platform Fee:</span>{' '}
              <span className="text-green-400">
                €{(data.budget * 0.05).toFixed(2)} (5%)
              </span>
            </p>
            <p>
              <span className="text-green-400/60">Payment Terms:</span>{' '}
              <span className="text-green-400 capitalize">
                {data.payment_terms.replace('_', ' ')}
              </span>
            </p>
          </div>
        </motion.div>
      </div>

      {/* Description */}
      {data.description && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-cyan/5 border border-cyan/20 p-4 rounded-lg"
        >
          <h3 className="font-rajdhani font-bold text-cyan mb-2">Description</h3>
          <p className="font-rajdhani text-cyan/70 text-sm leading-relaxed">
            {data.description}
          </p>
        </motion.div>
      )}

      {/* Deliverables */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <h3 className="font-rajdhani font-bold text-fire-4 mb-3">
          Deliverables ({data.deliverables.length})
        </h3>
        <div className="space-y-2">
          {data.deliverables.map((del, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 bg-fire-3/5 border border-fire-3/10 p-3 rounded"
            >
              <CheckCircle size={18} className="text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-rajdhani font-bold text-fire-4 text-sm">
                  {del.description}
                </p>
                <p className="font-mono text-xs text-fire-3/50">{del.type}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Confirmation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-green-500/10 border border-green-500/30 p-4 rounded-lg text-center"
      >
        <p className="font-rajdhani text-green-400 text-sm">
          ✓ Ready to send proposal to {data.target_athlete_name}
        </p>
        <p className="font-mono text-xs text-green-400/60 mt-2">
          They will receive an email notification and can accept, counter-offer, or reject
        </p>
      </motion.div>
    </div>
  );
}