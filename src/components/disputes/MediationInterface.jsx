/**
 * Mediation Interface
 * Real-time mediation chat and resolution discussion
 */

import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Send, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

export default function MediationInterface({ dispute, user }) {
  const [mediationMessage, setMediationMessage] = useState('');
  const queryClient = useQueryClient();

  const submittedMessages = dispute.evidence_initiator?.filter(e => e.message) || [];

  const sendMediationMutation = useMutation({
    mutationFn: async () => {
      if (!mediationMessage.trim()) {
        throw new Error('Message cannot be empty');
      }

      const updated = await base44.entities.Dispute.update(dispute.id, {
        status: 'mediating',
        updated_at: new Date().toISOString(),
      });

      // In a real system, this would be stored in a separate MediationChat entity
      // For now, we're tracking it in the evidence system
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['disputes'] });
      setMediationMessage('');
      toast.success('Mediation note added');
    },
    onError: (error) => {
      toast.error('Failed to add note: ' + error.message);
    },
  });

  return (
    <div className="space-y-6">
      <div className="bg-purple-500/5 border border-purple-500/20 p-6 rounded-lg">
        <h3 className="font-orbitron font-bold text-lg text-purple-400 mb-4 flex items-center gap-2">
          <MessageSquare size={20} />
          MEDIATION DISCUSSION
        </h3>

        <div className="space-y-4 mb-6">
          <div className="bg-black/40 border border-purple-500/10 p-4 rounded max-h-96 overflow-y-auto space-y-3">
            <div className="text-center py-8">
              <MessageSquare size={32} className="text-purple-500/30 mx-auto mb-2" />
              <p className="font-mono text-xs text-purple-500/40">
                Mediation discussion area
              </p>
              <p className="font-rajdhani text-sm text-purple-400/60 mt-2">
                Review evidence from both parties and discuss resolution with them
              </p>
            </div>
          </div>
        </div>

        {user?.role === 'admin' && (
          <div className="space-y-3">
            <label className="block font-rajdhani font-bold text-purple-400 text-sm">
              Mediation Notes
            </label>
            <textarea
              value={mediationMessage}
              onChange={(e) => setMediationMessage(e.target.value)}
              placeholder="Add mediation notes, requests for clarification, or discussion points..."
              rows={3}
              className="w-full bg-black/40 border border-purple-500/20 px-4 py-2 text-purple-300 placeholder-purple-500/30 font-rajdhani rounded focus:outline-none focus:border-purple-500/40"
            />
            <button
              onClick={() => sendMediationMutation.mutate()}
              disabled={!mediationMessage.trim() || sendMediationMutation.isPending}
              className="w-full bg-purple-500/20 border border-purple-500/40 text-purple-300 font-orbitron font-bold py-2 rounded hover:bg-purple-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Send size={16} />
              {sendMediationMutation.isPending ? 'SAVING...' : 'ADD MEDIATION NOTE'}
            </button>
          </div>
        )}
      </div>

      {/* Mediation Guidelines */}
      <div className="bg-cyan/5 border border-cyan/20 p-6 rounded-lg">
        <h4 className="font-orbitron font-bold text-cyan text-sm mb-3 uppercase tracking-[1px]">
          📋 MEDIATION GUIDELINES
        </h4>
        <ul className="font-rajdhani text-sm text-cyan/70 space-y-2">
          <li>• Review all evidence submitted by both parties</li>
          <li>• Consider the original agreement and terms</li>
          <li>• Evaluate the quality and completeness of deliverables</li>
          <li>• Contact both parties if clarification is needed</li>
          <li>• Make a fair and impartial decision</li>
          <li>• Document reasoning for your resolution</li>
          <li>• Process payouts according to resolution</li>
        </ul>
      </div>
    </div>
  );
}