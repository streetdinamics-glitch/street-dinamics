/**
 * Milestone Tracking Dashboard
 * Real-time tracking of milestone progress and AI verification status
 */

import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Clock,
  CheckCircle,
  AlertCircle,
  Loader,
  Eye,
  FileText,
} from 'lucide-react';

export default function MilestoneTracking({ dealId, athleteEmail }) {
  const { data: milestones = [] } = useQuery({
    queryKey: ['milestones', dealId],
    queryFn: async () => {
      const records = await base44.entities.MilestonePaymentRequest.filter({
        deal_id: dealId,
        athlete_email: athleteEmail,
      });
      return records;
    },
    initialData: [],
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle size={20} className="text-green-400" />;
      case 'submitted':
        return <Loader size={20} className="text-yellow-400 animate-spin" />;
      case 'under_review':
        return <Eye size={20} className="text-cyan animate-pulse" />;
      case 'rejected':
        return <AlertCircle size={20} className="text-red-400" />;
      default:
        return <Clock size={20} className="text-fire-3/60" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
      case 'paid':
        return 'bg-green-500/10 border-green-500/20 text-green-400';
      case 'submitted':
      case 'under_review':
        return 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400';
      case 'rejected':
        return 'bg-red-500/10 border-red-500/20 text-red-400';
      default:
        return 'bg-fire-3/5 border-fire-3/20 text-fire-4';
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      not_started: 'Not Started',
      in_progress: 'In Progress',
      submitted: 'Proof Submitted - AI Verifying',
      under_review: 'Verified - Awaiting Brand Signature',
      approved: 'Approved - Ready for Payout',
      rejected: 'Rejected - Resubmit Proof',
      paid: 'Paid ✓',
    };
    return labels[status] || status;
  };

  return (
    <div className="space-y-4">
      <h3 className="font-orbitron font-bold text-lg text-fire-5 mb-4">
        Milestone Progress ({milestones.length})
      </h3>

      {milestones.length === 0 ? (
        <div className="text-center py-12 bg-fire-3/5 border border-fire-3/10 rounded-lg">
          <FileText size={32} className="mx-auto text-fire-3/30 mb-3" />
          <p className="font-rajdhani text-fire-3/50">
            No milestones in this deal
          </p>
        </div>
      ) : (
        milestones.map((milestone, idx) => (
          <motion.div
            key={milestone.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`border rounded-lg p-4 ${getStatusColor(milestone.status)}`}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-3 flex-1">
                {getStatusIcon(milestone.status)}
                <div className="flex-1">
                  <p className="font-rajdhani font-bold text-sm">
                    {milestone.milestone_title}
                  </p>
                  <p className="font-mono text-xs opacity-60 mt-1">
                    Milestone {idx + 1} • €{milestone.milestone_amount}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <div className="font-orbitron font-bold text-sm">
                  {getStatusLabel(milestone.status)}
                </div>
                {milestone.due_date && (
                  <div className="font-mono text-xs opacity-60 mt-1">
                    Due:{' '}
                    {new Date(milestone.due_date).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-1 bg-black/30 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width:
                    milestone.status === 'not_started'
                      ? '0%'
                      : milestone.status === 'in_progress'
                      ? '33%'
                      : milestone.status === 'submitted'
                      ? '50%'
                      : milestone.status === 'under_review'
                      ? '75%'
                      : milestone.status === 'approved'
                      ? '90%'
                      : '100%',
                }}
                transition={{ duration: 0.5 }}
                className="h-full bg-gradient-to-r from-fire-3 to-fire-5"
              />
            </div>

            {/* Submission Info */}
            {milestone.submitted_at && (
              <div className="mt-3 text-xs opacity-75">
                <p>
                  Submitted:{' '}
                  {new Date(milestone.submitted_at).toLocaleString()}
                </p>
              </div>
            )}

            {/* Rejection Reason */}
            {milestone.status === 'rejected' && milestone.rejection_reason && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-3 p-2 bg-red-500/20 border border-red-500/30 rounded text-xs"
              >
                <p className="font-rajdhani font-bold mb-1">Reason:</p>
                <p className="font-rajdhani">
                  {milestone.rejection_reason}
                </p>
              </motion.div>
            )}
          </motion.div>
        ))
      )}

      {/* Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-fire-3/5 border border-fire-3/10 p-4 rounded-lg"
      >
        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          <div>
            <p className="font-orbitron font-bold text-fire-5">
              {milestones.filter((m) => m.status === 'paid').length}
            </p>
            <p className="font-rajdhani text-fire-3/60">Paid</p>
          </div>
          <div>
            <p className="font-orbitron font-bold text-yellow-400">
              {milestones.filter((m) =>
                ['submitted', 'under_review'].includes(m.status)
              ).length}
            </p>
            <p className="font-rajdhani text-fire-3/60">In Review</p>
          </div>
          <div>
            <p className="font-orbitron font-bold text-green-400">
              {milestones.filter((m) => m.status === 'approved').length}
            </p>
            <p className="font-rajdhani text-fire-3/60">Approved</p>
          </div>
          <div>
            <p className="font-orbitron font-bold text-fire-5">
              €
              {milestones
                .filter((m) => m.status === 'paid')
                .reduce((sum, m) => sum + m.milestone_amount, 0)
                .toFixed(0)}
            </p>
            <p className="font-rajdhani text-fire-3/60">Earned</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}