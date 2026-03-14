/**
 * Athlete Proposal Review
 * Component for athletes to review, accept, counter, or reject proposals
 */

import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { CheckCircle, X, MessageSquare, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

export default function AthleteProposalReview({ deal, onClose }) {
  const [action, setAction] = useState(null); // 'accept', 'counter', 'reject'
  const [counterAmount, setCounterAmount] = useState(deal.budget);
  const [counterNotes, setCounterNotes] = useState('');
  const queryClient = useQueryClient();

  const respondMutation = useMutation({
    mutationFn: async () => {
      const updateData = {};

      if (action === 'accept') {
        updateData.athlete_response = 'accepted';
        updateData.status = 'accepted';
      } else if (action === 'counter') {
        updateData.athlete_response = 'counter_offered';
        updateData.counter_offer_amount = counterAmount;
        updateData.negotiation_notes = counterNotes;
      } else if (action === 'reject') {
        updateData.athlete_response = 'rejected';
        updateData.status = 'rejected';
      }

      const updated = await base44.entities.SponsorshipDeal.update(deal.id, updateData);

      // Send notification to brand
      const actionLabel = action === 'accept' ? 'accepted' : action === 'counter' ? 'countered' : 'rejected';
      await base44.integrations.Core.SendEmail({
        to: deal.brand_email,
        subject: `Proposal Response: ${deal.campaign_title} - ${deal.athlete_name}`,
        body: `${deal.athlete_name} has ${actionLabel} your sponsorship proposal for "${deal.campaign_title}".

${action === 'counter' ? `Counter Offer: €${counterAmount}\n\nNotes: ${counterNotes}` : ''}

Log in to your dashboard to view the full response and next steps.`,
      });

      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['athlete-proposals'] });
      toast.success(`Proposal ${action}ed!`);
      onClose();
    },
    onError: (error) => {
      toast.error('Error: ' + error.message);
    },
  });

  return (
    <div className="fixed inset-0 z-[700] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl bg-gradient-to-br from-[rgba(10,4,18,0.99)] to-[rgba(4,2,8,1)] border border-fire-3/20 rounded-lg p-8"
      >
        <div className="absolute top-0 left-0 right-0 fire-line" />

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-fire-gradient font-orbitron font-black text-2xl mb-2">
              {deal.campaign_title}
            </h2>
            <p className="font-mono text-sm text-fire-3/60">
              From {deal.brand_name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-fire-3/10 rounded transition-all"
          >
            <X size={20} className="text-fire-3" />
          </button>
        </div>

        {/* Proposal Details */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-fire-3/5 border border-fire-3/20 p-4 rounded-lg">
            <p className="font-mono text-xs text-fire-3/60 uppercase mb-1">Budget</p>
            <p className="font-orbitron font-black text-2xl text-fire-5">
              €{deal.budget.toFixed(2)}
            </p>
          </div>
          <div className="bg-cyan/5 border border-cyan/20 p-4 rounded-lg">
            <p className="font-mono text-xs text-cyan/60 uppercase mb-1">Duration</p>
            <p className="font-orbitron font-black text-2xl text-cyan">
              {deal.duration_days} days
            </p>
          </div>
        </div>

        {/* Description */}
        {deal.description && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-fire-3/5 border border-fire-3/10 p-4 rounded-lg"
          >
            <h3 className="font-rajdhani font-bold text-fire-4 mb-2">Campaign Details</h3>
            <p className="font-rajdhani text-fire-4/70 text-sm">{deal.description}</p>
          </motion.div>
        )}

        {/* Deliverables */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h3 className="font-rajdhani font-bold text-fire-4 mb-3">
            Required Deliverables
          </h3>
          <div className="space-y-2">
            {deal.deliverables.map((del, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 bg-fire-3/5 border border-fire-3/10 p-3 rounded"
              >
                <CheckCircle size={16} className="text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-rajdhani font-bold text-fire-4 text-sm">
                    {typeof del === 'string' ? del : del.description}
                  </p>
                  {del.type && (
                    <p className="font-mono text-xs text-fire-3/50">{del.type}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Action Selection */}
        {!action ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3 mb-6"
          >
            <p className="font-rajdhani font-bold text-fire-4 mb-3">
              How would you like to respond?
            </p>

            <button
              onClick={() => setAction('accept')}
              className="w-full flex items-center gap-3 bg-green-500/10 border border-green-500/30 hover:border-green-500/50 p-4 rounded transition-all"
            >
              <CheckCircle size={20} className="text-green-400" />
              <div className="text-left">
                <p className="font-rajdhani font-bold text-green-400">
                  ACCEPT PROPOSAL
                </p>
                <p className="font-rajdhani text-xs text-green-400/60">
                  Agree to all terms
                </p>
              </div>
            </button>

            <button
              onClick={() => setAction('counter')}
              className="w-full flex items-center gap-3 bg-cyan/10 border border-cyan/30 hover:border-cyan/50 p-4 rounded transition-all"
            >
              <MessageSquare size={20} className="text-cyan" />
              <div className="text-left">
                <p className="font-rajdhani font-bold text-cyan">COUNTER-OFFER</p>
                <p className="font-rajdhani text-xs text-cyan/60">
                  Suggest different terms
                </p>
              </div>
            </button>

            <button
              onClick={() => setAction('reject')}
              className="w-full flex items-center gap-3 bg-red-500/10 border border-red-500/30 hover:border-red-500/50 p-4 rounded transition-all"
            >
              <X size={20} className="text-red-400" />
              <div className="text-left">
                <p className="font-rajdhani font-bold text-red-400">REJECT</p>
                <p className="font-rajdhani text-xs text-red-400/60">
                  Decline the proposal
                </p>
              </div>
            </button>
          </motion.div>
        ) : action === 'counter' ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 mb-6"
          >
            <div>
              <label className="block font-rajdhani font-bold text-fire-4 mb-2">
                Counter Budget (EUR)
              </label>
              <input
                type="number"
                value={counterAmount}
                onChange={(e) => setCounterAmount(parseFloat(e.target.value) || 0)}
                className="w-full bg-fire-3/5 border border-fire-3/20 px-4 py-2 text-fire-4 font-rajdhani rounded focus:outline-none focus:border-fire-3/40"
              />
            </div>

            <div>
              <label className="block font-rajdhani font-bold text-fire-4 mb-2">
                Notes for Brand
              </label>
              <textarea
                value={counterNotes}
                onChange={(e) => setCounterNotes(e.target.value)}
                placeholder="Explain your counter-offer..."
                rows={3}
                className="w-full bg-fire-3/5 border border-fire-3/20 px-4 py-2 text-fire-4 placeholder-fire-3/30 font-rajdhani rounded focus:outline-none focus:border-fire-3/40"
              />
            </div>
          </motion.div>
        ) : null}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => setAction(null)}
            disabled={!action || respondMutation.isPending}
            className="flex-1 bg-fire-3/10 border border-fire-3/20 text-fire-3 font-orbitron font-bold py-3 rounded hover:bg-fire-3/20 transition-all disabled:opacity-50"
          >
            {action ? 'BACK' : 'CANCEL'}
          </button>

          {action && (
            <button
              onClick={() => respondMutation.mutate()}
              disabled={respondMutation.isPending}
              className="flex-1 bg-gradient-to-r from-fire-3 to-fire-4 text-black font-orbitron font-bold py-3 rounded hover:opacity-90 transition-all disabled:opacity-50"
            >
              {respondMutation.isPending
                ? 'SENDING...'
                : `${action.toUpperCase()} PROPOSAL`}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}