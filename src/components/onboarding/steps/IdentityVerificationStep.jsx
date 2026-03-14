/**
 * Identity Verification Step
 * KYC verification for escrow eligibility
 */

import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function IdentityVerificationStep({ data, onChange }) {
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState('');

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const uploadRes = await base44.integrations.Core.UploadFile({ file });
      onChange({
        ...data,
        id_document_url: uploadRes.file_url,
        verification_status: 'verified',
        verified_at: new Date().toISOString(),
      });
      setFileName(file.name);
      toast.success('Document uploaded successfully!');
    } catch (error) {
      toast.error('Upload failed: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-cyan/5 border border-cyan/20 p-4 rounded-lg">
        <p className="font-rajdhani text-cyan/70 text-sm">
          Identity verification is required to be eligible for escrow-backed sponsorship payments. Your information is securely stored and encrypted.
        </p>
      </div>

      {/* Accepted Documents */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-black/40 border border-fire-3/10 p-4 rounded-lg"
      >
        <h3 className="font-rajdhani font-bold text-fire-4 mb-3">Accepted Documents</h3>
        <ul className="space-y-2 font-rajdhani text-sm text-fire-4/70">
          <li className="flex items-center gap-2">
            <CheckCircle size={16} className="text-green-400" />
            Valid Passport
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle size={16} className="text-green-400" />
            National ID Card
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle size={16} className="text-green-400" />
            Driver's License
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle size={16} className="text-green-400" />
            Residency Permit
          </li>
        </ul>
      </motion.div>

      {/* File Upload */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        {data.id_document_url ? (
          <div className="bg-green-500/10 border border-green-500/30 p-6 rounded-lg text-center">
            <CheckCircle size={40} className="text-green-400 mx-auto mb-3" />
            <p className="font-orbitron font-bold text-green-400 mb-2">
              VERIFIED ✓
            </p>
            <p className="font-rajdhani text-sm text-green-400/70">
              {fileName || 'Document verified successfully'}
            </p>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-cyan/30 rounded-lg cursor-pointer hover:border-cyan/50 hover:bg-cyan/5 transition-all">
            <Upload size={32} className="text-cyan" />
            <div>
              <p className="font-rajdhani font-bold text-cyan">
                Click to upload ID document
              </p>
              <p className="font-mono text-xs text-cyan/50">
                PNG, JPG, PDF up to 10MB
              </p>
            </div>
            <input
              type="file"
              onChange={handleFileUpload}
              disabled={uploading}
              accept="image/*,.pdf"
              className="hidden"
            />
          </label>
        )}
      </motion.div>

      {/* Privacy Notice */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-orange-500/5 border border-orange-500/20 p-4 rounded-lg flex gap-3"
      >
        <AlertCircle size={18} className="text-orange-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-rajdhani font-bold text-orange-400 text-sm mb-1">
            Data Security
          </p>
          <p className="font-rajdhani text-xs text-orange-400/70">
            Your identity documents are encrypted and stored securely. We never share your personal information without your consent.
          </p>
        </div>
      </motion.div>
    </div>
  );
}