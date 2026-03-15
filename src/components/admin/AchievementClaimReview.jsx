import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Eye, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function AchievementClaimReview() {
  const queryClient = useQueryClient();
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [reviewingWithAI, setReviewingWithAI] = useState(null);

  const { data: claims = [] } = useQuery({
    queryKey: ['achievement-claims'],
    queryFn: () => base44.entities.AchievementClaim.list('-claimed_at', 200).catch(() => []),
    refetchInterval: 30000,
  });

  const aiReviewMutation = useMutation({
    mutationFn: async (claim) => {
      const prompt = `Review this achievement claim:

Achievement: ${claim.achievement_name}
User: ${claim.user_name}
Description: ${claim.proof_description}
Files Provided: ${claim.proof_files?.length || 0}

Analyze if the user has genuinely completed this achievement based on their description and supporting data. Provide:
1. A confidence score (0-100)
2. Recommendation (approve/reject/needs_human_review)
3. Detailed reasoning

Return JSON: {confidence: number, recommendation: string, reasoning: string, concerns: string[]}`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            confidence: { type: 'number' },
            recommendation: { type: 'string' },
            reasoning: { type: 'string' },
            concerns: { type: 'array', items: { type: 'string' } },
          },
        },
      });

      await base44.entities.AchievementClaim.update(claim.id, {
        status: 'under_review',
        ai_review: result,
        ai_recommendation: result.recommendation,
        ai_confidence_score: result.confidence,
      });

      await base44.functions.invoke('notifyAchievementClaim', {
        claimId: claim.id,
        status: 'under_review',
      });

      return result;
    },
    onSuccess: (result, claim) => {
      queryClient.invalidateQueries({ queryKey: ['achievement-claims'] });
      toast.success(`AI Review Complete: ${result.recommendation}`);
      setReviewingWithAI(null);
    },
    onError: () => {
      toast.error('AI review failed');
      setReviewingWithAI(null);
    },
  });

  const reviewClaimMutation = useMutation({
    mutationFn: async ({ claimId, approved, notes }) => {
      const user = await base44.auth.me();
      
      await base44.entities.AchievementClaim.update(claimId, {
        status: approved ? 'approved' : 'rejected',
        admin_reviewer: user.email,
        admin_notes: notes,
        reviewed_at: new Date().toISOString(),
        rejection_reason: approved ? null : notes,
      });

      if (approved) {
        const claim = claims.find(c => c.id === claimId);
        await base44.entities.AthleteBadge.create({
          athlete_email: claim.user_email,
          athlete_name: claim.user_name,
          badge_id: claim.achievement_id,
          badge_name: claim.achievement_name,
          earned_at: new Date().toISOString(),
        });
      }

      await base44.functions.invoke('notifyAchievementClaim', {
        claimId,
        status: approved ? 'approved' : 'rejected',
      });
    },
    onSuccess: (_, { approved }) => {
      queryClient.invalidateQueries({ queryKey: ['achievement-claims'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success(approved ? 'Claim approved and badge awarded' : 'Claim rejected');
      setSelectedClaim(null);
      setAdminNotes('');
    },
    onError: () => {
      toast.error('Failed to process review');
    },
  });

  const pendingClaims = claims.filter(c => c.status === 'pending' || c.status === 'under_review');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-orbitron font-bold text-2xl text-fire-4">ACHIEVEMENT CLAIM REVIEW</h2>
        <div className="font-mono text-xs text-fire-3/60">
          {pendingClaims.length} pending claims
        </div>
      </div>

      {/* Claims List */}
      <div className="grid grid-cols-1 gap-4">
        {pendingClaims.length === 0 ? (
          <p className="text-center text-fire-3/40 py-12">No pending claims</p>
        ) : (
          pendingClaims.map((claim, i) => (
            <motion.div
              key={claim.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-gradient-to-br from-fire-3/10 to-fire-3/5 border border-fire-3/20 p-4 clip-cyber"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-orbitron font-bold text-fire-5 mb-1">
                    {claim.achievement_name}
                  </h3>
                  <p className="font-mono text-xs text-fire-3/70">
                    User: {claim.user_name} • {new Date(claim.claimed_at).toLocaleDateString()}
                  </p>
                </div>
                <div className={`px-2 py-1 text-[9px] font-mono tracking-[1px] uppercase border ${
                  claim.status === 'pending' 
                    ? 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400'
                    : 'border-cyan/30 bg-cyan/10 text-cyan'
                }`}>
                  {claim.status}
                </div>
              </div>

              <p className="font-mono text-xs text-fire-4/80 mb-3 line-clamp-2">
                {claim.proof_description}
              </p>

              <div className="flex items-center gap-2 mb-3 text-xs font-mono text-fire-3/60">
                <span>{claim.proof_files?.length || 0} proof files attached</span>
              </div>

              {/* AI Review Results */}
              {claim.ai_review && (
                <div className="mb-3 p-3 bg-cyan/5 border border-cyan/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={14} className="text-cyan" />
                    <span className="font-mono text-xs text-cyan">AI Analysis</span>
                    <span className="font-mono text-[9px] text-cyan/60">
                      {claim.ai_confidence_score}% confidence
                    </span>
                  </div>
                  <p className="font-mono text-[10px] text-fire-3/70 mb-2">
                    {claim.ai_review.reasoning}
                  </p>
                  <div className={`inline-block px-2 py-1 text-[9px] font-mono tracking-[1px] uppercase ${
                    claim.ai_recommendation === 'approve' 
                      ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                      : claim.ai_recommendation === 'reject'
                      ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                      : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30'
                  }`}>
                    AI Recommends: {claim.ai_recommendation}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                {!claim.ai_review && (
                  <button
                    onClick={() => {
                      setReviewingWithAI(claim.id);
                      aiReviewMutation.mutate(claim);
                    }}
                    disabled={reviewingWithAI === claim.id}
                    className="btn-cyan py-2 px-3 text-xs flex items-center gap-2 disabled:opacity-50"
                  >
                    {reviewingWithAI === claim.id ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        AI Reviewing...
                      </>
                    ) : (
                      <>
                        <Sparkles size={14} />
                        AI Review
                      </>
                    )}
                  </button>
                )}
                <button
                  onClick={() => setSelectedClaim(claim)}
                  className="btn-ghost py-2 px-3 text-xs flex items-center gap-2"
                >
                  <Eye size={14} />
                  Review
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Detail Modal */}
      {selectedClaim && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-[rgba(10,4,18,0.99)] to-[rgba(4,2,8,1)] border border-fire-3/40 p-6 clip-cyber max-w-3xl w-full max-h-[90vh] overflow-y-auto"
          >
            <h3 className="font-orbitron font-bold text-2xl text-fire-4 mb-6">
              CLAIM REVIEW
            </h3>

            <div className="space-y-4 mb-6">
              <div>
                <label className="font-mono text-xs text-fire-3/60 block mb-1">Achievement</label>
                <p className="font-orbitron text-fire-5">{selectedClaim.achievement_name}</p>
              </div>
              <div>
                <label className="font-mono text-xs text-fire-3/60 block mb-1">User</label>
                <p className="font-mono text-fire-4">{selectedClaim.user_name} ({selectedClaim.user_email})</p>
              </div>
              <div>
                <label className="font-mono text-xs text-fire-3/60 block mb-1">Proof Description</label>
                <p className="font-mono text-sm text-fire-4/90 whitespace-pre-wrap">
                  {selectedClaim.proof_description}
                </p>
              </div>
              <div>
                <label className="font-mono text-xs text-fire-3/60 block mb-2">Proof Files</label>
                <div className="grid grid-cols-2 gap-2">
                  {selectedClaim.proof_files?.map((url, i) => (
                    <a
                      key={i}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-fire-3/10 border border-fire-3/20 text-xs font-mono text-cyan hover:bg-fire-3/20 transition-colors"
                    >
                      View File {i + 1} →
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label className="font-mono text-xs text-fire-3/60 tracking-[1px] uppercase block mb-2">
                Admin Notes
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add review notes (required for rejection)..."
                className="cyber-input min-h-[100px] resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setSelectedClaim(null);
                  setAdminNotes('');
                }}
                className="flex-1 btn-ghost py-3"
              >
                Cancel
              </button>
              <button
                onClick={() => reviewClaimMutation.mutate({ 
                  claimId: selectedClaim.id, 
                  approved: false,
                  notes: adminNotes 
                })}
                disabled={!adminNotes.trim() || reviewClaimMutation.isPending}
                className="flex-1 border-2 border-red-500/40 bg-red-500/10 text-red-400 hover:bg-red-500/20 py-3 font-orbitron text-xs tracking-[2px] uppercase disabled:opacity-50"
              >
                <XCircle size={16} className="inline mr-2" />
                Reject
              </button>
              <button
                onClick={() => reviewClaimMutation.mutate({ 
                  claimId: selectedClaim.id, 
                  approved: true,
                  notes: adminNotes 
                })}
                disabled={reviewClaimMutation.isPending}
                className="flex-1 btn-fire py-3"
              >
                <CheckCircle size={16} className="inline mr-2" />
                Approve & Award Badge
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}