/**
 * Milestone Proof Upload
 * Athletes upload video/image proof-of-work for milestone completion
 */

import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Upload, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { toast } from 'soner';

export default function MilestoneProofUpload({ milestone, onSuccess }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [description, setDescription] = useState('');
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error('Please select a file');

      // Upload file to platform storage
      const fileData = new FormData();
      fileData.append('file', file);

      const uploadResponse = await base44.integrations.Core.UploadFile({
        file: file,
      });

      const proofUrl = uploadResponse.file_url;

      // Submit proof and trigger AI verification
      const verificationResult = await base44.functions.invoke(
        'verifyMilestoneProof',
        {
          milestoneId: milestone.id,
          proofUrl: proofUrl,
          description: description,
          fileType: file.type.startsWith('video/') ? 'video' : 'image',
        }
      );

      return verificationResult.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milestone', milestone.id] });
      toast.success('Proof submitted! AI verification in progress...');
      setFile(null);
      setPreview('');
      setDescription('');
      onSuccess?.();
    },
    onError: (error) => {
      toast.error('Upload failed: ' + error.message);
    },
  });

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);

      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreview(event.target?.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const maxSize = 500 * 1024 * 1024; // 500MB
  const isValid = file && file.size <= maxSize;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-[rgba(10,4,18,0.98)] to-[rgba(4,2,8,1)] border border-green-500/20 p-6 rounded-lg"
    >
      <h3 className="font-orbitron font-bold text-lg text-green-400 mb-4 flex items-center gap-2">
        <Upload size={20} />
        Submit Proof of Completion
      </h3>

      {/* Milestone Details */}
      <div className="bg-green-500/5 border border-green-500/10 p-4 rounded-lg mb-6">
        <p className="font-rajdhani font-bold text-green-400 text-sm mb-1">
          {milestone.milestone_title}
        </p>
        <p className="font-rajdhani text-xs text-green-400/60">
          €{milestone.milestone_amount} • Due{' '}
          {new Date(milestone.due_date).toLocaleDateString()}
        </p>
      </div>

      {/* File Upload */}
      <div className="mb-6">
        <label className="block font-rajdhani font-bold text-green-400 mb-3">
          Upload Proof (Video or Image)
        </label>

        <div className="border-2 border-dashed border-green-500/30 rounded-lg p-8 text-center hover:border-green-500/50 transition-all cursor-pointer bg-green-500/5 relative">
          <input
            type="file"
            accept="image/*,video/*"
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />

          {preview ? (
            <div className="space-y-3">
              {file?.type.startsWith('video/') ? (
                <video
                  src={preview}
                  className="max-h-64 mx-auto rounded"
                  controls
                />
              ) : (
                <img
                  src={preview}
                  alt="Preview"
                  className="max-h-64 mx-auto rounded"
                />
              )}
              <p className="font-rajdhani text-sm text-green-400">
                {file?.name} ({(file?.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload size={32} className="mx-auto text-green-500/60" />
              <p className="font-rajdhani font-bold text-green-400">
                Click to upload or drag and drop
              </p>
              <p className="font-rajdhani text-xs text-green-400/60">
                MP4, MOV, JPG, PNG up to 500MB
              </p>
            </div>
          )}
        </div>

        {file && file.size > maxSize && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-2 mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-sm"
          >
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            File too large. Maximum 500MB allowed.
          </motion.div>
        )}
      </div>

      {/* Description */}
      <div className="mb-6">
        <label className="block font-rajdhani font-bold text-green-400 mb-2">
          Description of Proof
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Explain what this proof shows and how it demonstrates completion..."
          rows={3}
          className="w-full bg-green-500/5 border border-green-500/20 px-4 py-2 text-green-400 placeholder-green-400/30 font-rajdhani rounded focus:outline-none focus:border-green-500/40"
        />
      </div>

      {/* AI Verification Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-cyan/5 border border-cyan/20 p-4 rounded-lg mb-6 flex gap-3"
      >
        <AlertCircle size={18} className="text-cyan flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-rajdhani font-bold text-cyan text-sm mb-1">
            Automated AI Verification
          </p>
          <p className="font-rajdhani text-xs text-cyan/70">
            Your proof will be analyzed by advanced vision AI to verify completion. Brand will then be notified for signature approval.
          </p>
        </div>
      </motion.div>

      {/* Submit Button */}
      <button
        onClick={() => uploadMutation.mutate()}
        disabled={!isValid || uploadMutation.isPending}
        className="w-full bg-gradient-to-r from-green-500 to-green-600 text-black font-orbitron font-bold py-3 rounded hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {uploadMutation.isPending ? (
          <>
            <Loader size={18} className="animate-spin" />
            UPLOADING & VERIFYING...
          </>
        ) : (
          <>
            <Upload size={18} />
            SUBMIT PROOF
          </>
        )}
      </button>
    </motion.div>
  );
}