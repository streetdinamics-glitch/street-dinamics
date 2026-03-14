/**
 * Milestone Submission Modal
 * Athletes submit proof of completion
 */

import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { X, Upload, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function MilestoneSubmissionModal({
  milestone,
  deal,
  escrow,
  userRole,
  onClose,
}) {
  const [files, setFiles] = useState([]);
  const [notes, setNotes] = useState('');
  const [markComplete, setMarkComplete] = useState(false);
  const queryClient = useQueryClient();

  const submitMilestoneeMutation = useMutation({
    mutationFn: async () => {
      const uploadedFiles = [];

      // Upload proof files
      for (const file of files) {
        const uploadRes = await base44.integrations.Core.UploadFile({ file });
        uploadedFiles.push({
          name: file.name,
          url: uploadRes.file_url,
          uploaded_at: new Date().toISOString(),
        });
      }

      // Create or update milestone request
      const requests = await base44.entities.MilestonePaymentRequest.filter({
        escrow_id: escrow.id,
        milestone_index: milestone.index,
      });

      let request;
      if (requests.length > 0) {
        // Update existing
        request = await base44.entities.MilestonePaymentRequest.update(
          requests[0].id,
          {
            status: 'submitted',
            proof_of_completion: uploadedFiles,
            completion_notes: notes,
            submitted_at: new Date().toISOString(),
          }
        );
      } else {
        // Create new
        request = await base44.entities.MilestonePaymentRequest.create({
          escrow_id: escrow.id,
          deal_id: deal.id,
          milestone_index: milestone.index,
          milestone_title:
            typeof milestone === 'string'
              ? milestone
              : milestone.description || `Milestone ${milestone.index + 1}`,
          milestone_amount: escrow.total_amount / deal.deliverables.length,
          athlete_email: deal.athlete_email,
          brand_email: deal.brand_email,
          status: 'submitted',
          proof_of_completion: uploadedFiles,
          completion_notes: notes,
          submitted_at: new Date().toISOString(),
          due_date: new Date(deal.end_date).toISOString(),
        });
      }

      return request;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milestone-requests'] });
      toast.success('Milestone submitted for review!');
      onClose();
    },
    onError: (error) => {
      toast.error('Submission failed: ' + error.message);
    },
  });

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files || []));
  };

  return (
    <div className="fixed inset-0 z-[900] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl bg-gradient-to-br from-[rgba(10,4,18,0.99)] to-[rgba(4,2,8,1)] border border-fire-3/20 rounded-lg p-8"
      >
        <div className="absolute top-0 left-0 right-0 fire-line" />

        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-fire-gradient font-orbitron font-black text-2xl mb-2">
              SUBMIT MILESTONE
            </h2>
            <p className="font-rajdhani text-sm text-fire-4/70">
              {typeof milestone === 'string'
                ? milestone.substring(0, 50)
                : milestone.description || `Milestone ${milestone.index + 1}`}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-fire-3/10 rounded transition-all">
            <X size={20} className="text-fire-3" />
          </button>
        </div>

        {/* Milestone Details */}
        <div className="bg-fire-3/5 border border-fire-3/20 p-4 rounded-lg mb-6">
          <p className="font-mono text-xs text-fire-3/60 mb-2 uppercase">
            Completion Payment
          </p>
          <p className="font-orbitron font-black text-3xl text-fire-6">
            €{(milestone.request?.milestone_amount || 0).toFixed(2)}
          </p>
        </div>

        {/* Proof Upload */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block font-rajdhani font-bold text-fire-4 mb-2 text-sm">
              Proof of Completion *
            </label>
            <label className="flex items-center justify-center gap-2 p-6 border-2 border-dashed border-fire-3/30 rounded-lg cursor-pointer hover:border-fire-3/50 transition-all">
              <Upload size={20} className="text-fire-3" />
              <span className="font-rajdhani text-fire-4/70">
                {files.length > 0 ? `${files.length} file(s) selected` : 'Click to upload proof'}
              </span>
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
            {files.length > 0 && (
              <div className="mt-3 space-y-2">
                {files.map((file, idx) => (
                  <p key={idx} className="font-rajdhani text-xs text-fire-4/70">
                    ✓ {file.name}
                  </p>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block font-rajdhani font-bold text-fire-4 mb-2 text-sm">
              Completion Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe what you've completed, how it meets the requirements, and any context..."
              rows={4}
              className="w-full bg-fire-3/5 border border-fire-3/20 px-4 py-2 text-fire-4 placeholder-fire-3/30 font-rajdhani rounded focus:outline-none focus:border-fire-3/40"
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={markComplete}
              onChange={(e) => setMarkComplete(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="font-rajdhani text-sm text-fire-4/70">
              I confirm this milestone is complete and ready for brand review
            </span>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-fire-3/10 border border-fire-3/20 text-fire-3 font-orbitron font-bold py-3 rounded hover:bg-fire-3/20 transition-all"
          >
            CANCEL
          </button>
          <button
            onClick={() => submitMilestoneeMutation.mutate()}
            disabled={
              !files.length || !notes || !markComplete || submitMilestoneeMutation.isPending
            }
            className="flex-1 bg-gradient-to-r from-fire-3 to-fire-4 text-black font-orbitron font-bold py-3 rounded hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Check size={18} />
            {submitMilestoneeMutation.isPending ? 'SUBMITTING...' : 'SUBMIT FOR APPROVAL'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}