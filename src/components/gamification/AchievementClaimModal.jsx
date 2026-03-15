import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Upload, X, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function AchievementClaimModal({ achievement, onClose }) {
  const queryClient = useQueryClient();
  const [proofDescription, setProofDescription] = useState('');
  const [proofFiles, setProofFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const submitClaimMutation = useMutation({
    mutationFn: async (claimData) => {
      const user = await base44.auth.me();
      return base44.entities.AchievementClaim.create({
        ...claimData,
        user_email: user.email,
        user_name: user.full_name,
        status: 'pending',
        claimed_at: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['achievement-claims'] });
      toast.success('Achievement claim submitted for review');
      onClose();
    },
    onError: () => {
      toast.error('Failed to submit claim');
    },
  });

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const uploadedUrls = await Promise.all(
        files.map(async (file) => {
          const result = await base44.integrations.Core.UploadFile({ file });
          return result.file_url;
        })
      );
      setProofFiles([...proofFiles, ...uploadedUrls]);
      toast.success(`${files.length} file(s) uploaded`);
    } catch (err) {
      toast.error('Failed to upload files');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!proofDescription.trim()) {
      toast.error('Please provide a description of your achievement');
      return;
    }

    if (proofFiles.length === 0) {
      toast.error('Please upload at least one proof file');
      return;
    }

    submitClaimMutation.mutate({
      achievement_id: achievement.id,
      achievement_name: achievement.name,
      proof_description: proofDescription,
      proof_files: proofFiles,
      supporting_data: {
        timestamp: new Date().toISOString(),
        achievement_tier: achievement.tier,
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-[rgba(10,4,18,0.99)] to-[rgba(4,2,8,1)] border border-fire-3/40 p-6 clip-cyber max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-orbitron font-bold text-2xl text-fire-4">
            CLAIM ACHIEVEMENT
          </h2>
          <button onClick={onClose} className="text-fire-3/60 hover:text-fire-3 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Achievement Info */}
        <div className="mb-6 p-4 bg-gradient-to-r from-fire-3/10 to-fire-3/5 border border-fire-3/20">
          <h3 className="font-orbitron font-bold text-fire-5 mb-2">{achievement.name}</h3>
          <p className="font-mono text-xs text-fire-3/70">{achievement.description}</p>
        </div>

        {/* Warning */}
        <div className="mb-6 p-3 bg-yellow-500/10 border border-yellow-500/30 flex gap-2">
          <AlertCircle size={16} className="text-yellow-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-yellow-300">
            Your claim will be reviewed by AI and may require admin approval. Please provide detailed proof and explanation.
          </p>
        </div>

        {/* Proof Description */}
        <div className="mb-6">
          <label className="font-mono text-xs text-fire-3/60 tracking-[1px] uppercase block mb-2">
            Describe How You Completed This Achievement *
          </label>
          <textarea
            value={proofDescription}
            onChange={(e) => setProofDescription(e.target.value)}
            placeholder="Explain what you did to earn this achievement, provide specific details, dates, and context..."
            className="cyber-input min-h-[120px] resize-none"
            maxLength={1000}
          />
          <p className="text-[9px] text-fire-3/40 mt-1 font-mono text-right">
            {proofDescription.length}/1000
          </p>
        </div>

        {/* File Upload */}
        <div className="mb-6">
          <label className="font-mono text-xs text-fire-3/60 tracking-[1px] uppercase block mb-2">
            Upload Proof (Screenshots, Videos, Documents) *
          </label>
          <label className="block border-2 border-dashed border-fire-3/30 p-6 text-center cursor-pointer hover:border-fire-3/60 transition-colors">
            <input
              type="file"
              multiple
              accept="image/*,video/*,.pdf"
              onChange={handleFileUpload}
              className="hidden"
              disabled={uploading}
            />
            <Upload size={32} className="text-fire-3/40 mx-auto mb-2" />
            <p className="font-mono text-xs text-fire-3/60">
              {uploading ? 'Uploading...' : 'Click to upload files'}
            </p>
            <p className="font-mono text-[9px] text-fire-3/40 mt-1">
              Images, videos, or PDF documents
            </p>
          </label>

          {/* Uploaded Files */}
          {proofFiles.length > 0 && (
            <div className="mt-4 space-y-2">
              {proofFiles.map((url, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-fire-3/5 border border-fire-3/20">
                  <span className="font-mono text-xs text-fire-4 truncate flex-1">
                    File {i + 1}
                  </span>
                  <button
                    onClick={() => setProofFiles(proofFiles.filter((_, idx) => idx !== i))}
                    className="text-red-400 hover:text-red-300 ml-2"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 btn-ghost py-3"
            disabled={submitClaimMutation.isPending}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitClaimMutation.isPending || uploading}
            className="flex-1 btn-fire py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitClaimMutation.isPending ? 'Submitting...' : 'Submit Claim'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}