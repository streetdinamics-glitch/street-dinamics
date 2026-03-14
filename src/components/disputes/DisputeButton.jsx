/**
 * Dispute Button
 * Quick-access button to open a dispute for transactions
 */

import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function DisputeButton({ escrow_id, deal_id, transaction_id, type, disabled = false }) {
  const [showForm, setShowForm] = useState(false);
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: escrow } = useQuery({
    queryKey: ['escrow', escrow_id],
    queryFn: () => {
      const escrows = base44.entities.EscrowAccount.filter({ id: escrow_id });
      return escrows[0] || null;
    },
    enabled: !!escrow_id,
  });

  const createDisputeMutation = useMutation({
    mutationFn: async () => {
      if (!reason || !description) {
        throw new Error('Please provide reason and description');
      }

      if (!escrow) {
        throw new Error('Escrow not found');
      }

      const dispute = await base44.entities.Dispute.create({
        escrow_id,
        deal_id,
        transaction_id,
        dispute_type: type,
        initiator_email: user.email,
        initiator_role: type === 'sponsorship' ? (user.role === 'athlete' ? 'athlete' : 'brand') : 'buyer',
        respondent_email: type === 'sponsorship' 
          ? (user.email === escrow.brand_email ? escrow.athlete_email : escrow.brand_email)
          : escrow.athlete_email,
        respondent_role: type === 'sponsorship'
          ? (user.email === escrow.brand_email ? 'athlete' : 'brand')
          : 'seller',
        reason,
        description,
        amount_disputed: escrow.held_amount,
        created_at: new Date().toISOString(),
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      });

      return dispute;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['disputes'] });
      setShowForm(false);
      setReason('');
      setDescription('');
      toast.success('Dispute opened. Admin mediators will review your case.');
    },
    onError: (error) => {
      toast.error('Failed to open dispute: ' + error.message);
    },
  });

  if (disabled) {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setShowForm(true)}
        className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-400 font-rajdhani font-bold rounded hover:bg-red-500/20 transition-all text-sm"
      >
        <AlertTriangle size={16} />
        OPEN DISPUTE
      </button>

      {showForm && (
        <div className="fixed inset-0 z-[900] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-gradient-to-br from-[rgba(10,4,18,0.99)] to-[rgba(4,2,8,1)] border border-red-500/30 rounded-lg p-6"
          >
            <h2 className="text-red-400 font-orbitron font-black text-xl mb-4">OPEN DISPUTE</h2>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block font-rajdhani font-bold text-fire-4 mb-2 text-sm">
                  Reason for Dispute *
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-fire-3/5 border border-fire-3/20 px-4 py-2 text-fire-4 font-rajdhani rounded focus:outline-none"
                >
                  <option value="">-- Select --</option>
                  <option value="incomplete_deliverables">Incomplete Deliverables</option>
                  <option value="poor_quality">Poor Quality</option>
                  <option value="missed_deadline">Missed Deadline</option>
                  <option value="non_delivery">Non-Delivery</option>
                  <option value="item_not_as_described">Item Not As Described</option>
                  <option value="damaged_goods">Damaged Goods</option>
                  <option value="unauthorized_charges">Unauthorized Charges</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block font-rajdhani font-bold text-fire-4 mb-2 text-sm">
                  Detailed Description *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain what went wrong and what resolution you're seeking..."
                  rows={4}
                  className="w-full bg-fire-3/5 border border-fire-3/20 px-4 py-2 text-fire-4 placeholder-fire-3/30 font-rajdhani rounded focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 bg-fire-3/10 border border-fire-3/20 text-fire-3 font-rajdhani font-bold py-2 rounded hover:bg-fire-3/20 transition-all"
              >
                CANCEL
              </button>
              <button
                onClick={() => createDisputeMutation.mutate()}
                disabled={!reason || !description || createDisputeMutation.isPending}
                className="flex-1 bg-red-500/20 border border-red-500/40 text-red-400 font-rajdhani font-bold py-2 rounded hover:bg-red-500/30 transition-all disabled:opacity-50"
              >
                {createDisputeMutation.isPending ? 'OPENING...' : 'OPEN DISPUTE'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}