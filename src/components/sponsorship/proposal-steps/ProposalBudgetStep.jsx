/**
 * Proposal Budget Step
 * Set budget, payment terms, and duration
 */

import React from 'react';
import { motion } from 'framer-motion';

export default function ProposalBudgetStep({ data, onChange }) {
  return (
    <div className="space-y-6">
      {/* Budget */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <label className="block font-rajdhani font-bold text-fire-4 mb-2">
          Total Budget (EUR) *
        </label>
        <input
          type="number"
          min="0"
          step="100"
          value={data.budget}
          onChange={(e) => onChange({ ...data, budget: parseFloat(e.target.value) || 0 })}
          placeholder="0.00"
          className="w-full bg-fire-3/5 border border-fire-3/20 px-4 py-2 text-fire-4 placeholder-fire-3/30 font-rajdhani rounded focus:outline-none focus:border-fire-3/40 text-lg"
        />
        <p className="font-mono text-xs text-fire-3/50 mt-1">
          Minimum budget: €500
        </p>
      </motion.div>

      {/* Payment Terms */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <label className="block font-rajdhani font-bold text-fire-4 mb-3">
          Payment Terms *
        </label>

        <div className="grid grid-cols-3 gap-3">
          {[
            { id: 'upfront', label: 'Upfront', desc: 'Full payment upfront' },
            { id: 'milestone', label: 'Milestone', desc: 'Per deliverable' },
            { id: 'on_completion', label: 'On Completion', desc: 'After all deliverables' },
          ].map((term) => (
            <button
              key={term.id}
              onClick={() => onChange({ ...data, payment_terms: term.id })}
              className={`p-4 rounded border-2 transition-all text-center ${
                data.payment_terms === term.id
                  ? 'border-fire-3 bg-fire-3/20'
                  : 'border-fire-3/20 bg-fire-3/5 hover:border-fire-3/40'
              }`}
            >
              <p className="font-rajdhani font-bold text-fire-4 text-sm">
                {term.label}
              </p>
              <p className="font-mono text-xs text-fire-3/60 mt-1">
                {term.desc}
              </p>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Duration Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-cyan/5 border border-cyan/20 p-4 rounded-lg"
      >
        <p className="font-rajdhani text-sm text-cyan/70">
          <strong>Campaign Duration:</strong>{' '}
          {Math.ceil(
            (new Date(data.end_date) - new Date(data.start_date)) /
              (1000 * 60 * 60 * 24)
          )}{' '}
          days
        </p>
      </motion.div>

      {/* Budget Breakdown */}
      {data.budget > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-fire-3/5 border border-fire-3/10 p-4 rounded-lg space-y-2"
        >
          <p className="font-rajdhani font-bold text-fire-4 mb-3">Budget Breakdown</p>
          <div className="flex justify-between text-sm">
            <span className="font-rajdhani text-fire-4">Total Budget</span>
            <span className="font-orbitron font-bold text-fire-5">
              €{data.budget.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-sm pt-2 border-t border-fire-3/10">
            <span className="font-rajdhani text-fire-4">Athlete Receives</span>
            <span className="font-orbitron font-bold text-green-400">
              €{(data.budget * 0.95).toFixed(2)} (5% fee)
            </span>
          </div>
        </motion.div>
      )}

      {/* Special Requests */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <label className="block font-rajdhani font-bold text-fire-4 mb-2">
          Special Requests / Conditions
        </label>
        <textarea
          value={data.special_requests || ''}
          onChange={(e) => onChange({ ...data, special_requests: e.target.value })}
          placeholder="E.g., exclusivity clause, content approval process, usage rights, etc."
          rows={3}
          className="w-full bg-fire-3/5 border border-fire-3/20 px-4 py-2 text-fire-4 placeholder-fire-3/30 font-rajdhani rounded focus:outline-none focus:border-fire-3/40"
        />
      </motion.div>
    </div>
  );
}