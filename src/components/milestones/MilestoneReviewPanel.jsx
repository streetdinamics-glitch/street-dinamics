/**
 * Milestone Review Panel
 * Brand review and approval/rejection interface
 */

import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { X, CheckCircle, XCircle, FileText } from 'lucide-react';
import { toast } from 'sonner';

export default function MilestoneReviewPanel({ request, deal, onClose, onReload }) {
  const [action, setAction] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [brandNotes, setBrandNotes] = useState('');
  const queryClient = useQueryClient();

  const reviewMutation = useMutation({
    mutationFn: async () => {
      if (action === 'reject' && !rejectionReason) {
        throw new Error('Please provide rejection reason');
      }

      const updateData = {
        status: action === 'approve' ? 'approved' : 'rejected',
        reviewed_at: new Date().toISOString(),
        brand_notes: brandNotes,
      };

      if (action === 'reject') {
        updateData.rejection_reason = rejectionReason;
      }

      if (action === 'approve') {
        updateData.approved_at = new Date().toISOString();

        // Create payout for approved milestone
        const payout = await base44.entities.Payout.create({
          athlete_email: request.athlete_email,
          escrow_id: request.escrow_id,
          deal_id: request.deal_id,
          amount: request.milestone_amount,
          currency: 'EUR',
          payout_method: 'braintree',
          status: 'pending',
          initiated_date: new Date().toISOString(),
        });

        updateData.payout_id = payout.id;
      }

      const updated = await base44.entities.MilestonePaymentRequest.update(
        request.id,
        updateData
      );

      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milestone-requests'] });
      toast.success(
        action === 'approve'
          ? 'Milestone approved! Payout initiated.'
          : 'Milestone rejected.'
      );
      onReload?.();
      onClose();
    },
    onError: (error) => {
      toast.error('Review failed: ' + error.message);
    },
  });

  return (
    <div className="fixed inset-0 z-[900] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-3xl bg-gradient-to-br from-[rgba(10,4,18,0.99)] to-[rgba(4,2,8,1)] border border-fire-3/20 rounded-lg p-8 my-auto"
      >
        <div className="absolute top-0 left-0 right-0 fire-line" />

        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-fire-gradient font-orbitron font-black text-2xl mb-2">
              REVIEW MILESTONE SUBMISSION
            </h2>
            <p className="font-rajdhani text-sm text-fire-4/70">
              {request.milestone_title}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-fire-3/10 rounded transition-all">
            <X size={20} className="text-fire-3" />
          </button>
        </div>

        {/* Payment Amount */}
        <div className="bg-gradient-to-r from-fire-3/20 to-fire-3/10 border border-fire-3/30 p-6 rounded-lg mb-6">
          <p className="font-mono text-xs text-fire-3/60 mb-2 uppercase">
            Requested Payment
          </p>
          <p className="font-orbitron font-black text-3xl text-fire-5">
            €{request.milestone_amount.toFixed(2)}
          </p>
        </div>

        {/* Athlete Submission */}
        <div className="space-y-6 mb-6">
          <div>
            <h3 className="font-orbitron font-bold text-lg text-fire-5 mb-3">
              ATHLETE'S SUBMISSION
            </h3>

            {/* Completion Notes */}
            {request.completion_notes && (
              <div className="bg-black/40 border border-fire-3/10 p-4 rounded-lg mb-4">
                <p className="font-rajdhani font-bold text-fire-4 mb-2">Completion Notes</p>
                <p className="font-rajdhani text-fire-4/70">{request.completion_notes}</p>
              </div>
            )}

            {/* Proof Files */}
            {request.proof_of_completion && request.proof_of_completion.length > 0 && (
              <div className="bg-black/40 border border-fire-3/10 p-4 rounded-lg">
                <p className="font-rajdhani font-bold text-fire-4 mb-3 flex items-center gap-2">
                  <FileText size={18} />
                  Proof Files ({request.proof_of_completion.length})
                </p>
                <div className="space-y-2">
                  {request.proof_of_completion.map((file, idx) => (
                    <a
                      key={idx}
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 bg-fire-3/10 border border-fire-3/20 rounded hover:bg-fire-3/20 transition-all text-fire-4 text-sm"
                    >
                      <FileText size={14} />
                      {file.name}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Review Form */}
        {action && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 mb-6 p-4 bg-fire-3/5 border border-fire-3/20 rounded-lg"
          >
            {action === 'reject' && (
              <div>
                <label className="block font-rajdhani font-bold text-fire-4 mb-2 text-sm">
                  Rejection Reason *
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Explain why this submission doesn't meet requirements..."
                  rows={3}
                  className="w-full bg-black/40 border border-fire-3/20 px-4 py-2 text-fire-4 placeholder-fire-3/30 font-rajdhani rounded focus:outline-none"
                />
              </div>
            )}

            <div>
              <label className="block font-rajdhani font-bold text-fire-4 mb-2 text-sm">
                Notes (Optional)
              </label>
              <textarea
                value={brandNotes}
                onChange={(e) => setBrandNotes(e.target.value)}
                placeholder="Any feedback for the athlete..."
                rows={2}
                className="w-full bg-black/40 border border-fire-3/20 px-4 py-2 text-fire-4 placeholder-fire-3/30 font-rajdhani rounded focus:outline-none"
              />
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-fire-3/10 border border-fire-3/20 text-fire-3 font-orbitron font-bold py-3 rounded hover:bg-fire-3/20 transition-all"
          >
            CLOSE
          </button>

          {!action ? (
            <>
              <button
                onClick={() => setAction('reject')}
                className="flex-1 bg-red-500/10 border border-red-500/30 text-red-400 font-orbitron font-bold py-3 rounded hover:bg-red-500/20 transition-all flex items-center justify-center gap-2"
              >
                <XCircle size={18} />
                REJECT
              </button>
              <button
                onClick={() => setAction('approve')}
                className="flex-1 bg-green-500/10 border border-green-500/30 text-green-400 font-orbitron font-bold py-3 rounded hover:bg-green-500/20 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle size={18} />
                APPROVE
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  setAction(null);
                  setRejectionReason('');
                  setBrandNotes('');
                }}
                className="flex-1 bg-fire-3/10 border border-fire-3/20 text-fire-3 font-orbitron font-bold py-3 rounded hover:bg-fire-3/20 transition-all"
              >
                CANCEL
              </button>
              <button
                onClick={() => reviewMutation.mutate()}
                disabled={
                  (action === 'reject' && !rejectionReason) || reviewMutation.isPending
                }
                className={`flex-1 font-orbitron font-bold py-3 rounded transition-all disabled:opacity-50 ${
                  action === 'approve'
                    ? 'bg-green-500/20 border border-green-500/40 text-green-400 hover:bg-green-500/30'
                    : 'bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30'
                }`}
              >
                {reviewMutation.isPending
                  ? 'PROCESSING...'
                  : action === 'approve'
                  ? 'CONFIRM APPROVAL'
                  : 'CONFIRM REJECTION'}
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}