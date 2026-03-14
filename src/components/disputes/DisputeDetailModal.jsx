/**
 * Dispute Detail Modal
 * Full dispute view with evidence, mediation, and resolution
 */

import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, FileText, MessageSquare, Scale } from 'lucide-react';
import { toast } from 'sonner';
import EvidenceSubmission from './EvidenceSubmission';
import MediationInterface from './MediationInterface';

export default function DisputeDetailModal({ dispute, onClose, onReload }) {
  const [activeTab, setActiveTab] = useState('evidence');
  const [resolution, setResolution] = useState(dispute.resolution || '');
  const [resolutionAmount, setResolutionAmount] = useState(dispute.resolution_amount || '');
  const [notes, setNotes] = useState(dispute.resolution_notes || '');
  const [showResolution, setShowResolution] = useState(false);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: initiator } = useQuery({
    queryKey: ['dispute-initiator', dispute.initiator_email],
    queryFn: async () => {
      const users = await base44.entities.User.filter({ email: dispute.initiator_email });
      return users[0];
    },
  });

  const { data: respondent } = useQuery({
    queryKey: ['dispute-respondent', dispute.respondent_email],
    queryFn: async () => {
      const users = await base44.entities.User.filter({ email: dispute.respondent_email });
      return users[0];
    },
  });

  const assignMediatorMutation = useMutation({
    mutationFn: async () => {
      return await base44.entities.Dispute.update(dispute.id, {
        assigned_mediator: user.email,
        status: 'under_review',
        updated_at: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['disputes'] });
      toast.success('You are now assigned as mediator');
    },
  });

  const resolveDisputeMutation = useMutation({
    mutationFn: async () => {
      if (!resolution || !resolutionAmount) {
        throw new Error('Resolution and amount required');
      }

      const resolved = await base44.entities.Dispute.update(dispute.id, {
        status: 'resolved',
        resolution,
        resolution_amount: parseFloat(resolutionAmount),
        resolution_notes: notes,
        assigned_mediator: user.email,
        resolved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      // Process payout based on resolution
      await base44.functions.invoke('processDisputeResolution', {
        dispute_id: dispute.id,
        escrow_id: dispute.escrow_id,
        resolution,
        resolution_amount: parseFloat(resolutionAmount),
        initiator_email: dispute.initiator_email,
        respondent_email: dispute.respondent_email,
      });

      return resolved;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['disputes'] });
      toast.success('Dispute resolved and payout processed');
      onReload();
      onClose();
    },
    onError: (error) => {
      toast.error('Failed to resolve: ' + error.message);
    },
  });

  const reasonLabels = {
    incomplete_deliverables: 'Incomplete Deliverables',
    poor_quality: 'Poor Quality',
    missed_deadline: 'Missed Deadline',
    non_delivery: 'Non-Delivery',
    item_not_as_described: 'Item Not As Described',
    damaged_goods: 'Damaged Goods',
    unauthorized_charges: 'Unauthorized Charges',
    other: 'Other',
  };

  return (
    <div className="fixed inset-0 z-[800] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-4xl bg-gradient-to-br from-[rgba(10,4,18,0.99)] to-[rgba(4,2,8,1)] border border-fire-3/20 rounded-lg p-8 my-auto"
      >
        <div className="absolute top-0 left-0 right-0 fire-line" />

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-fire-gradient font-orbitron font-black text-2xl mb-2">
              DISPUTE MEDIATION
            </h2>
            <p className="font-rajdhani text-sm text-fire-4/70">
              {reasonLabels[dispute.reason]}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-fire-3/10 rounded transition-all">
            <X size={20} className="text-fire-3" />
          </button>
        </div>

        {/* Parties Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-red-500/5 border border-red-500/20 p-4 rounded-lg">
            <p className="font-mono text-xs text-red-600/60 mb-2">CLAIMANT</p>
            <p className="font-rajdhani font-bold text-fire-4 mb-2">
              {initiator?.full_name || dispute.initiator_email}
            </p>
            <p className="font-mono text-xs text-fire-3/60">
              Role: {dispute.initiator_role.toUpperCase()}
            </p>
          </div>

          <div className="bg-green-500/5 border border-green-500/20 p-4 rounded-lg">
            <p className="font-mono text-xs text-green-600/60 mb-2">RESPONDENT</p>
            <p className="font-rajdhani font-bold text-fire-4 mb-2">
              {respondent?.full_name || dispute.respondent_email}
            </p>
            <p className="font-mono text-xs text-fire-3/60">
              Role: {dispute.respondent_role.toUpperCase()}
            </p>
          </div>
        </div>

        {/* Amount in Dispute */}
        <div className="bg-gradient-to-r from-fire-3/20 to-fire-3/10 border border-fire-3/30 p-6 rounded-lg mb-6">
          <p className="font-mono text-xs text-fire-3/60 mb-2 uppercase tracking-[1px]">
            Amount in Dispute
          </p>
          <p className="font-orbitron font-black text-3xl text-fire-5">
            €{dispute.amount_disputed.toFixed(2)}
          </p>
        </div>

        {/* Issue Description */}
        <div className="bg-fire-3/5 border border-fire-3/10 p-6 rounded-lg mb-6">
          <h3 className="font-orbitron font-bold text-lg text-fire-5 mb-3">ISSUE DESCRIPTION</h3>
          <p className="font-rajdhani text-fire-4/70 leading-relaxed">{dispute.description}</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-fire-3/20">
          {[
            { id: 'evidence', label: 'Evidence', icon: FileText },
            { id: 'mediation', label: 'Mediation', icon: Scale },
            { id: 'resolution', label: 'Resolution', icon: Send },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-3 font-rajdhani font-bold border-b-2 transition-all ${
                activeTab === id
                  ? 'border-fire-3 text-fire-5'
                  : 'border-transparent text-fire-3/60 hover:text-fire-4'
              }`}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="mb-6">
          {activeTab === 'evidence' && (
            <EvidenceSubmission dispute={dispute} user={user} />
          )}

          {activeTab === 'mediation' && (
            <MediationInterface dispute={dispute} user={user} />
          )}

          {activeTab === 'resolution' && (
            <div className="space-y-4">
              {!dispute.assigned_mediator && (
                <button
                  onClick={() => assignMediatorMutation.mutate()}
                  className="w-full bg-blue-500/10 border border-blue-500/30 text-blue-400 font-orbitron font-bold py-3 rounded hover:bg-blue-500/20 transition-all"
                >
                  {assignMediatorMutation.isPending ? 'ASSIGNING...' : 'ASSIGN MYSELF AS MEDIATOR'}
                </button>
              )}

              {dispute.assigned_mediator === user?.email && (
                <div className="space-y-4">
                  <div>
                    <label className="block font-rajdhani font-bold text-fire-4 mb-2 text-sm">
                      Resolution Type *
                    </label>
                    <select
                      value={resolution}
                      onChange={(e) => setResolution(e.target.value)}
                      className="w-full bg-fire-3/5 border border-fire-3/20 px-4 py-2 text-fire-4 font-rajdhani rounded focus:outline-none focus:border-fire-3/40"
                    >
                      <option value="">-- Select --</option>
                      <option value="full_refund_buyer">Full Refund to Buyer/Athlete</option>
                      <option value="full_payment_seller">Full Payment to Seller/Brand</option>
                      <option value="partial_refund">Partial Refund</option>
                      <option value="split_50_50">Split 50/50</option>
                      <option value="custom_split">Custom Split</option>
                      <option value="rejected">Reject Claim</option>
                    </select>
                  </div>

                  {['partial_refund', 'custom_split'].includes(resolution) && (
                    <div>
                      <label className="block font-rajdhani font-bold text-fire-4 mb-2 text-sm">
                        Amount to Award (EUR) *
                      </label>
                      <input
                        type="number"
                        value={resolutionAmount}
                        onChange={(e) => setResolutionAmount(e.target.value)}
                        min="0"
                        max={dispute.amount_disputed}
                        step="0.01"
                        className="w-full bg-fire-3/5 border border-fire-3/20 px-4 py-2 text-fire-4 font-rajdhani rounded focus:outline-none focus:border-fire-3/40"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block font-rajdhani font-bold text-fire-4 mb-2 text-sm">
                      Mediation Notes
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Explain your resolution reasoning..."
                      rows={4}
                      className="w-full bg-fire-3/5 border border-fire-3/20 px-4 py-2 text-fire-4 placeholder-fire-3/30 font-rajdhani rounded focus:outline-none focus:border-fire-3/40"
                    />
                  </div>

                  <button
                    onClick={() => resolveDisputeMutation.mutate()}
                    disabled={!resolution || resolveDisputeMutation.isPending}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-orbitron font-bold py-3 rounded hover:opacity-90 transition-all disabled:opacity-50"
                  >
                    {resolveDisputeMutation.isPending ? 'RESOLVING...' : 'FINALIZE RESOLUTION & PROCESS PAYOUT'}
                  </button>
                </div>
              )}

              {dispute.status === 'resolved' && (
                <div className="bg-green-500/10 border border-green-500/30 p-4 rounded">
                  <p className="font-rajdhani font-bold text-green-400 mb-2">✓ DISPUTE RESOLVED</p>
                  <p className="font-rajdhani text-sm text-green-400/70">
                    Resolution: {dispute.resolution?.replace(/_/g, ' ').toUpperCase()}
                  </p>
                  <p className="font-rajdhani text-sm text-green-400/70">
                    Awarded: €{dispute.resolution_amount?.toFixed(2)}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}