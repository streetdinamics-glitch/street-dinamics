/**
 * Deal Detail Modal with Escrow Information
 * Shows full deal details and escrow payment progress
 */

import React from 'react';
import { motion } from 'framer-motion';
import { X, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export default function DealDetailModal({ deal, escrow, onClose }) {
  const milestones = escrow?.milestones || [];
  const completedMilestones = milestones.filter(m => m.status === 'completed').length;

  return (
    <div className="fixed inset-0 z-[600] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-3xl bg-gradient-to-br from-[rgba(10,4,18,0.99)] to-[rgba(4,2,8,1)] border border-fire-3/20 rounded-lg p-8 my-auto max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-fire-gradient font-orbitron font-black text-2xl mb-2">{deal.campaign_title}</h2>
            <p className="font-rajdhani text-sm text-fire-4/70">
              By {deal.brand_name} • {new Date(deal.start_date).toLocaleDateString()}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-fire-3/10 rounded transition-all">
            <X size={20} className="text-fire-3" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Campaign Details */}
          <div className="bg-fire-3/5 border border-fire-3/20 p-6 rounded-lg">
            <h3 className="font-orbitron font-bold text-lg text-fire-5 mb-4">Campaign Details</h3>
            <p className="font-rajdhani text-sm text-fire-4/80 leading-relaxed mb-4">{deal.description}</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="font-mono text-xs text-fire-3/60 mb-1 uppercase tracking-[1px]">Budget</p>
                <p className="font-orbitron font-bold text-2xl text-fire-5">€{deal.budget.toLocaleString()}</p>
              </div>
              <div>
                <p className="font-mono text-xs text-fire-3/60 mb-1 uppercase tracking-[1px]">Duration</p>
                <p className="font-orbitron font-bold text-2xl text-fire-5">{deal.duration_days} days</p>
              </div>
              <div>
                <p className="font-mono text-xs text-fire-3/60 mb-1 uppercase tracking-[1px]">Start Date</p>
                <p className="font-rajdhani font-bold text-fire-5">{new Date(deal.start_date).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="font-mono text-xs text-fire-3/60 mb-1 uppercase tracking-[1px]">End Date</p>
                <p className="font-rajdhani font-bold text-fire-5">{new Date(deal.end_date).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Deliverables */}
          <div className="bg-cyan/5 border border-cyan/20 p-6 rounded-lg">
            <h3 className="font-orbitron font-bold text-lg text-cyan mb-4">
              Required Deliverables ({deal.deliverables?.length || 0})
            </h3>

            <div className="space-y-3">
              {(deal.deliverables || []).map((deliverable, idx) => (
                <div key={idx} className="bg-black/40 p-4 rounded flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-cyan flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-rajdhani font-bold text-fire-4">{deliverable.description}</p>
                    <p className="font-mono text-xs text-fire-3/60 mt-1">
                      Due: {new Date(deliverable.deadline).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Escrow & Milestones */}
          {escrow && (
            <div className="bg-green-500/5 border border-green-500/20 p-6 rounded-lg">
              <h3 className="font-orbitron font-bold text-lg text-green-400 mb-4">Payment Milestones (Escrow Protected)</h3>

              <div className="bg-black/40 p-4 rounded mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-mono text-xs text-green-400/60 mb-2 uppercase tracking-[1px]">
                      Escrow Status
                    </p>
                    <p className="font-orbitron font-bold text-xl text-green-400">{escrow.status.toUpperCase()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-xs text-green-400/60 mb-2 uppercase tracking-[1px]">
                      Total Protected
                    </p>
                    <p className="font-orbitron font-bold text-2xl text-green-400">€{escrow.total_amount.toLocaleString()}</p>
                  </div>
                </div>

                <div className="h-2 bg-black rounded overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(escrow.released_amount / escrow.total_amount) * 100}%` }}
                    transition={{ duration: 1 }}
                    className="h-full bg-green-500"
                  />
                </div>
                <div className="flex justify-between mt-2">
                  <span className="font-mono text-xs text-green-400/80">
                    €{escrow.released_amount.toLocaleString()} released
                  </span>
                  <span className="font-mono text-xs text-green-400/80">
                    €{escrow.held_amount.toLocaleString()} held
                  </span>
                </div>
              </div>

              {/* Payment Terms */}
              <div className="bg-black/30 p-4 rounded">
                <p className="font-mono text-xs text-green-400/60 mb-3 uppercase tracking-[1px]">
                  {deal.payment_terms === 'milestone' ? 'Milestone-Based Payments' : 'Payment Schedule'}
                </p>

                <div className="space-y-2">
                  {milestones.map((milestone, idx) => (
                    <div key={idx} className="flex items-center gap-3 py-2">
                      {milestone.status === 'completed' ? (
                        <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                      ) : (
                        <Clock className="w-4 h-4 text-fire-3/60 flex-shrink-0" />
                      )}
                      <span className="font-rajdhani text-sm flex-1 text-fire-4">
                        {milestone.description}
                      </span>
                      <span className="font-orbitron font-bold text-fire-5">€{milestone.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded flex gap-2">
                <AlertCircle size={16} className="text-green-400 flex-shrink-0 mt-0.5" />
                <p className="font-rajdhani text-xs text-green-400/80">
                  All payments are held in escrow until you complete deliverables. Brand cannot withdraw funds once locked.
                </p>
              </div>
            </div>
          )}

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full bg-fire-3/10 border border-fire-3/20 text-fire-3 font-orbitron font-bold py-3 rounded hover:bg-fire-3/20 transition-all"
          >
            CLOSE
          </button>
        </div>
      </motion.div>
    </div>
  );
}