/**
 * Milestone Signature Verification
 * Multi-signature approval workflow for escrow fund release
 */

import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { CheckCircle, Lock, Signature, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function MilestoneSignatureVerification({
  milestone,
  escrowId,
  dealId,
  userRole, // 'athlete' or 'brand'
  userEmail,
}) {
  const [isSigningOpen, setIsSigningOpen] = useState(false);
  const [signatureData, setSignatureData] = useState('');
  const queryClient = useQueryClient();

  // Fetch multi-sig approval record
  const { data: multiSig } = useQuery({
    queryKey: ['multi-sig', milestone.id],
    queryFn: async () => {
      const records = await base44.entities.MultiSignatureApproval.filter({
        milestone_id: milestone.id,
      });
      return records[0] || null;
    },
  });

  const signMutation = useMutation({
    mutationFn: async () => {
      if (!signatureData.trim()) {
        throw new Error('Please provide a digital signature');
      }

      // Generate signature hash (in production, use cryptographic signing)
      const signatureHash = btoa(
        `${userEmail}-${milestone.id}-${Date.now()}-${Math.random()}`
      );

      const updateData = {};

      if (userRole === 'athlete') {
        updateData.athlete_signature = { hash: signatureHash, timestamp: Date.now() };
        updateData.athlete_signed_at = new Date().toISOString();
      } else {
        updateData.brand_signature = { hash: signatureHash, timestamp: Date.now() };
        updateData.brand_signed_at = new Date().toISOString();
      }

      // Update status based on which signatures exist
      if (multiSig?.athlete_signature && userRole === 'brand') {
        updateData.status = 'both_signed';
        updateData.multi_sig_verified = true;
        updateData.verified_at = new Date().toISOString();
      } else if (multiSig?.brand_signature && userRole === 'athlete') {
        updateData.status = 'both_signed';
        updateData.multi_sig_verified = true;
        updateData.verified_at = new Date().toISOString();
      } else {
        updateData.status = userRole === 'athlete' ? 'athlete_signed' : 'brand_signed';
      }

      const updated = await base44.entities.MultiSignatureApproval.update(
        multiSig.id,
        updateData
      );

      // If both signed, send notification
      if (updateData.multi_sig_verified) {
        const otherEmail =
          userRole === 'athlete' ? multiSig.brand_email : multiSig.athlete_email;
        await base44.integrations.Core.SendEmail({
          to: otherEmail,
          subject: `Multi-Sig Complete: Milestone Ready for Payout`,
          body: `Both signatures have been collected for milestone "${milestone.milestone_title}".

Amount: €${milestone.milestone_amount}
Status: Ready for escrow release

Automated payout will be processed within 2 business hours.`,
        });
      }

      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['multi-sig', milestone.id] });
      toast.success('Signature recorded successfully!');
      setIsSigningOpen(false);
      setSignatureData('');
    },
    onError: (error) => {
      toast.error('Signature failed: ' + error.message);
    },
  });

  if (!multiSig) {
    return null;
  }

  const athleteSigned = !!multiSig.athlete_signed_at;
  const brandSigned = !!multiSig.brand_signed_at;
  const bothSigned = athleteSigned && brandSigned;

  const canSign =
    userRole === 'athlete' ? !athleteSigned : !brandSigned;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-[rgba(10,4,18,0.98)] to-[rgba(4,2,8,1)] border border-purple-500/20 p-6 rounded-lg"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-orbitron font-bold text-lg text-purple-400 flex items-center gap-2">
          <Lock size={20} />
          Multi-Signature Escrow
        </h3>
        <span
          className={`px-3 py-1 text-xs font-mono font-bold rounded ${
            bothSigned
              ? 'bg-green-500/20 border border-green-500/30 text-green-400'
              : 'bg-purple-500/20 border border-purple-500/30 text-purple-400'
          }`}
        >
          {multiSig.status.toUpperCase().replace('_', ' ')}
        </span>
      </div>

      {/* Amount */}
      <div className="bg-purple-500/5 border border-purple-500/10 p-4 rounded-lg mb-6">
        <p className="font-mono text-xs text-purple-400/60 uppercase tracking-[1px] mb-1">
          Escrow Amount
        </p>
        <p className="font-orbitron font-black text-3xl text-purple-300">
          €{milestone.milestone_amount.toFixed(2)}
        </p>
      </div>

      {/* Signature Status */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Athlete */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`border-2 rounded-lg p-4 ${
            athleteSigned
              ? 'border-green-500/30 bg-green-500/10'
              : 'border-purple-500/20 bg-purple-500/5'
          }`}
        >
          <div className="flex items-center gap-2 mb-3">
            {athleteSigned ? (
              <CheckCircle size={20} className="text-green-400" />
            ) : (
              <Signature size={20} className="text-purple-400" />
            )}
            <p className="font-rajdhani font-bold text-sm">
              {athleteSigned ? 'Athlete Signed' : 'Athlete Signature'}
            </p>
          </div>

          {athleteSigned && (
            <p className="font-mono text-xs text-green-400/60">
              Signed:{' '}
              {new Date(multiSig.athlete_signed_at).toLocaleString()}
            </p>
          )}

          {userRole === 'athlete' && !athleteSigned && (
            <button
              onClick={() => setIsSigningOpen(true)}
              className="mt-2 w-full px-3 py-2 bg-green-500/20 border border-green-500/30 text-green-400 font-rajdhani text-xs font-bold rounded hover:bg-green-500/30 transition-all"
            >
              SIGN NOW
            </button>
          )}
        </motion.div>

        {/* Brand */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className={`border-2 rounded-lg p-4 ${
            brandSigned
              ? 'border-green-500/30 bg-green-500/10'
              : 'border-purple-500/20 bg-purple-500/5'
          }`}
        >
          <div className="flex items-center gap-2 mb-3">
            {brandSigned ? (
              <CheckCircle size={20} className="text-green-400" />
            ) : (
              <Signature size={20} className="text-purple-400" />
            )}
            <p className="font-rajdhani font-bold text-sm">
              {brandSigned ? 'Brand Signed' : 'Brand Signature'}
            </p>
          </div>

          {brandSigned && (
            <p className="font-mono text-xs text-green-400/60">
              Signed:{' '}
              {new Date(multiSig.brand_signed_at).toLocaleString()}
            </p>
          )}

          {userRole === 'brand' && !brandSigned && (
            <button
              onClick={() => setIsSigningOpen(true)}
              className="mt-2 w-full px-3 py-2 bg-green-500/20 border border-green-500/30 text-green-400 font-rajdhani text-xs font-bold rounded hover:bg-green-500/30 transition-all"
            >
              SIGN NOW
            </button>
          )}
        </motion.div>
      </div>

      {/* Signing Modal */}
      {isSigningOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 mb-6 p-4 bg-black/40 border border-green-500/20 rounded-lg"
        >
          <p className="font-rajdhani font-bold text-green-400 mb-2">
            Digital Signature
          </p>
          <textarea
            value={signatureData}
            onChange={(e) => setSignatureData(e.target.value)}
            placeholder="Enter your digital signature (or paste from your signature device)"
            rows={3}
            className="w-full bg-green-500/5 border border-green-500/20 px-4 py-2 text-green-400 placeholder-green-400/30 font-mono rounded focus:outline-none focus:border-green-500/40"
          />

          <div className="flex gap-2">
            <button
              onClick={() => setIsSigningOpen(false)}
              className="flex-1 px-3 py-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 font-rajdhani text-xs font-bold rounded hover:bg-purple-500/20 transition-all"
            >
              CANCEL
            </button>
            <button
              onClick={() => signMutation.mutate()}
              disabled={signMutation.isPending || !signatureData.trim()}
              className="flex-1 px-3 py-2 bg-green-500/20 border border-green-500/30 text-green-400 font-rajdhani text-xs font-bold rounded hover:bg-green-500/30 transition-all disabled:opacity-50"
            >
              {signMutation.isPending ? 'SIGNING...' : 'CONFIRM SIGNATURE'}
            </button>
          </div>
        </motion.div>
      )}

      {/* Timeline */}
      {bothSigned && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-500/10 border border-green-500/20 p-4 rounded-lg flex items-start gap-3"
        >
          <CheckCircle size={20} className="text-green-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-rajdhani font-bold text-green-400 text-sm">
              ✓ Both signatures confirmed
            </p>
            <p className="font-rajdhani text-xs text-green-400/60 mt-1">
              Automatic payout will be triggered. Funds released to athlete bank account within 2 business hours.
            </p>
          </div>
        </motion.div>
      )}

      {/* Expiration */}
      <div className="mt-6 flex items-center gap-2 text-purple-400/60 font-rajdhani text-xs">
        <Clock size={14} />
        Signatures expire {new Date(multiSig.expires_at).toLocaleDateString()}
      </div>
    </motion.div>
  );
}