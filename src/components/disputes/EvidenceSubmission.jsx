/**
 * Evidence Submission
 * Evidence upload and viewing from both parties
 */

import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Upload, File, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function EvidenceSubmission({ dispute, user }) {
  const [files, setFiles] = useState([]);
  const [description, setDescription] = useState('');
  const queryClient = useQueryClient();

  const isInitiator = user?.email === dispute.initiator_email;

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (files.length === 0) {
        throw new Error('Please select files to upload');
      }

      const uploadedFiles = [];
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        
        // Upload file to Base44
        const uploadRes = await base44.integrations.Core.UploadFile({ file });
        uploadedFiles.push({
          name: file.name,
          url: uploadRes.file_url,
          uploaded_at: new Date().toISOString(),
        });
      }

      // Update dispute with evidence
      const evidenceKey = isInitiator ? 'evidence_initiator' : 'evidence_respondent';
      const currentEvidence = dispute[evidenceKey] || [];

      const updated = await base44.entities.Dispute.update(dispute.id, {
        [evidenceKey]: [
          ...currentEvidence,
          {
            files: uploadedFiles,
            description,
            submitted_by: user.email,
            submitted_at: new Date().toISOString(),
          },
        ],
        status: 'awaiting_evidence',
        updated_at: new Date().toISOString(),
      });

      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['disputes'] });
      setFiles([]);
      setDescription('');
      toast.success('Evidence submitted successfully');
    },
    onError: (error) => {
      toast.error('Failed to submit evidence: ' + error.message);
    },
  });

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files || []));
  };

  const evidenceKey = isInitiator ? 'evidence_initiator' : 'evidence_respondent';
  const evidence = dispute[evidenceKey] || [];

  return (
    <div className="space-y-6">
      {/* Submission Form */}
      <div className="bg-fire-3/5 border border-fire-3/20 p-6 rounded-lg space-y-4">
        <h3 className="font-orbitron font-bold text-lg text-fire-5">
          SUBMIT YOUR EVIDENCE
        </h3>

        <div>
          <label className="block font-rajdhani font-bold text-fire-4 mb-2 text-sm">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Explain what evidence you're providing and why it supports your position..."
            rows={3}
            className="w-full bg-black/40 border border-fire-3/20 px-4 py-2 text-fire-4 placeholder-fire-3/30 font-rajdhani rounded focus:outline-none focus:border-fire-3/40"
          />
        </div>

        <div>
          <label className="block font-rajdhani font-bold text-fire-4 mb-2 text-sm">
            Files (Screenshots, Documents, Messages, etc.)
          </label>
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="w-full"
          />
          {files.length > 0 && (
            <div className="mt-3 space-y-2">
              {files.map((file, idx) => (
                <div key={idx} className="flex items-center gap-2 text-fire-4/70 text-sm">
                  <File size={14} />
                  {file.name}
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => uploadMutation.mutate()}
          disabled={!description || files.length === 0 || uploadMutation.isPending}
          className="w-full bg-gradient-to-r from-fire-3 to-fire-4 text-black font-orbitron font-bold py-3 rounded hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Upload size={18} />
          {uploadMutation.isPending ? 'UPLOADING...' : 'SUBMIT EVIDENCE'}
        </button>
      </div>

      {/* Your Evidence */}
      {evidence.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-orbitron font-bold text-lg text-fire-5">YOUR EVIDENCE</h3>
          {evidence.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-500/5 border border-green-500/20 p-4 rounded-lg"
            >
              <p className="font-rajdhani font-bold text-green-400 mb-2">
                Submitted: {new Date(item.submitted_at).toLocaleDateString()}
              </p>
              <p className="font-rajdhani text-fire-4/70 mb-3">{item.description}</p>
              <div className="space-y-2">
                {item.files?.map((file, fileIdx) => (
                  <a
                    key={fileIdx}
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 bg-black/30 border border-green-500/20 rounded hover:bg-black/40 transition-all text-green-400 text-sm"
                  >
                    <File size={14} />
                    {file.name}
                  </a>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Opponent Evidence */}
      {isInitiator ? (
        dispute.evidence_respondent && dispute.evidence_respondent.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-orbitron font-bold text-lg text-fire-5">RESPONDENT'S EVIDENCE</h3>
            {dispute.evidence_respondent.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/5 border border-red-500/20 p-4 rounded-lg"
              >
                <p className="font-rajdhani font-bold text-red-400 mb-2">
                  Submitted: {new Date(item.submitted_at).toLocaleDateString()}
                </p>
                <p className="font-rajdhani text-fire-4/70 mb-3">{item.description}</p>
                <div className="space-y-2">
                  {item.files?.map((file, fileIdx) => (
                    <a
                      key={fileIdx}
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 bg-black/30 border border-red-500/20 rounded hover:bg-black/40 transition-all text-red-400 text-sm"
                    >
                      <File size={14} />
                      {file.name}
                    </a>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )
      ) : (
        dispute.evidence_initiator && dispute.evidence_initiator.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-orbitron font-bold text-lg text-fire-5">CLAIMANT'S EVIDENCE</h3>
            {dispute.evidence_initiator.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/5 border border-red-500/20 p-4 rounded-lg"
              >
                <p className="font-rajdhani font-bold text-red-400 mb-2">
                  Submitted: {new Date(item.submitted_at).toLocaleDateString()}
                </p>
                <p className="font-rajdhani text-fire-4/70 mb-3">{item.description}</p>
                <div className="space-y-2">
                  {item.files?.map((file, fileIdx) => (
                    <a
                      key={fileIdx}
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 bg-black/30 border border-red-500/20 rounded hover:bg-black/40 transition-all text-red-400 text-sm"
                    >
                      <File size={14} />
                      {file.name}
                    </a>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )
      )}
    </div>
  );
}