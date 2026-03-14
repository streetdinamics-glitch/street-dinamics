/**
 * Milestone Progress Tracker
 * Visual progress tracker for escrow milestones
 */

import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, AlertCircle, Lock } from 'lucide-react';
import MilestoneSubmissionModal from './MilestoneSubmissionModal';

export default function MilestoneProgressTracker({ deal, escrow, userRole }) {
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [submissionModalOpen, setSubmissionModalOpen] = useState(false);

  const { data: milestoneRequests = [] } = useQuery({
    queryKey: ['milestone-requests', escrow?.id],
    queryFn: () =>
      escrow?.id
        ? base44.entities.MilestonePaymentRequest.filter({
            escrow_id: escrow.id,
          })
        : Promise.resolve([]),
    initialData: [],
    refetchInterval: 5000,
  });

  // Default milestones if not in custom format
  const milestones = deal?.deliverables || [];
  const totalMilestones = Array.isArray(milestones) ? milestones.length : 0;

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'text-green-400';
      case 'approved':
        return 'text-cyan';
      case 'submitted':
      case 'under_review':
        return 'text-yellow-400';
      case 'rejected':
        return 'text-red-400';
      case 'in_progress':
        return 'text-orange-400';
      default:
        return 'text-fire-3/40';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid':
        return <CheckCircle size={20} />;
      case 'approved':
        return <CheckCircle size={20} />;
      case 'submitted':
      case 'under_review':
        return <Clock size={20} />;
      case 'rejected':
        return <AlertCircle size={20} />;
      case 'in_progress':
        return <Clock size={20} />;
      default:
        return <Lock size={20} />;
    }
  };

  const completedCount = milestoneRequests.filter((m) => m.status === 'paid').length;
  const approvedCount = milestoneRequests.filter((m) => m.status === 'approved').length;

  return (
    <div className="space-y-6">
      {/* Progress Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-fire-3/20 to-fire-3/10 border border-fire-3/30 p-6 rounded-lg"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-orbitron font-bold text-lg text-fire-5">
            MILESTONE PROGRESS
          </h3>
          <p className="font-orbitron font-black text-2xl text-fire-6">
            {completedCount}/{totalMilestones}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-black/40 border border-fire-3/20 rounded-full h-3 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(completedCount / totalMilestones) * 100}%` }}
            transition={{ duration: 0.8 }}
            className="h-full bg-gradient-to-r from-fire-3 to-fire-5"
          />
        </div>

        <div className="flex justify-between mt-3 font-rajdhani text-sm text-fire-3/60">
          <span>{completedCount} Completed</span>
          <span>{approvedCount} Approved</span>
          <span>{totalMilestones - completedCount} Pending</span>
        </div>
      </motion.div>

      {/* Milestones List */}
      <div className="space-y-3">
        {milestones.map((milestone, idx) => {
          const request = milestoneRequests[idx];
          const status = request?.status || 'not_started';
          const amount = request?.milestone_amount || (typeof milestone === 'string' ? 0 : milestone.amount || 0);

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => {
                setSelectedMilestone({ ...milestone, index: idx, request });
              }}
              className="bg-gradient-to-br from-[rgba(10,4,18,0.98)] to-[rgba(4,2,8,1)] border border-fire-3/20 p-5 rounded-lg hover:border-fire-3/40 transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`mt-1 ${getStatusColor(status)}`}>
                    {getStatusIcon(status)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-rajdhani font-bold text-fire-4 mb-1">
                      Milestone {idx + 1}:{' '}
                      {typeof milestone === 'string'
                        ? milestone.substring(0, 40)
                        : milestone.description || `Deliverable ${idx + 1}`}
                    </h4>
                    <p className="font-mono text-xs text-fire-3/60">
                      {typeof milestone === 'string'
                        ? 'Task'
                        : `Status: ${milestone.status || 'pending'}`}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-orbitron font-black text-xl text-fire-6">
                    €{amount}
                  </p>
                  <p className={`font-mono text-xs uppercase tracking-[1px] mt-1 ${getStatusColor(status)}`}>
                    {status.replace('_', ' ')}
                  </p>
                </div>
              </div>

              {/* Status Timeline */}
              <div className="flex items-center justify-between text-xs font-mono text-fire-3/50 mt-3 pt-3 border-t border-fire-3/10">
                {request?.submitted_at && (
                  <span>Submitted: {new Date(request.submitted_at).toLocaleDateString()}</span>
                )}
                {request?.approved_at && (
                  <span className="text-green-400">Approved: {new Date(request.approved_at).toLocaleDateString()}</span>
                )}
                {request?.due_date && !request?.approved_at && (
                  <span>Due: {new Date(request.due_date).toLocaleDateString()}</span>
                )}
              </div>

              {/* Action Button */}
              {userRole === 'athlete' && status === 'not_started' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedMilestone({ ...milestone, index: idx, request });
                    setSubmissionModalOpen(true);
                  }}
                  className="mt-3 w-full py-2 bg-fire-3/10 border border-fire-3/20 text-fire-4 font-rajdhani text-sm rounded hover:bg-fire-3/20 transition-all"
                >
                  START WORK
                </button>
              )}

              {userRole === 'athlete' && status === 'in_progress' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedMilestone({ ...milestone, index: idx, request });
                    setSubmissionModalOpen(true);
                  }}
                  className="mt-3 w-full py-2 bg-cyan/10 border border-cyan/20 text-cyan font-rajdhani text-sm rounded hover:bg-cyan/20 transition-all"
                >
                  SUBMIT FOR APPROVAL
                </button>
              )}

              {userRole === 'brand' && status === 'submitted' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedMilestone({ ...milestone, index: idx, request });
                  }}
                  className="mt-3 w-full py-2 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 font-rajdhani text-sm rounded hover:bg-yellow-500/20 transition-all"
                >
                  REVIEW SUBMISSION
                </button>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Submission Modal */}
      {submissionModalOpen && selectedMilestone && (
        <MilestoneSubmissionModal
          milestone={selectedMilestone}
          deal={deal}
          escrow={escrow}
          userRole={userRole}
          onClose={() => {
            setSubmissionModalOpen(false);
            setSelectedMilestone(null);
          }}
        />
      )}
    </div>
  );
}