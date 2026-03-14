import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { AlertTriangle, Mail, Shield, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ConsentWithdrawal({ user }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [reason, setReason] = useState('');
  const queryClient = useQueryClient();

  const withdrawConsentMutation = useMutation({
    mutationFn: async () => {
      // Update user consents
      await base44.auth.updateMe({
        marketing_consent: false,
        image_rights_consent: false,
        tokenization_consent: false,
        cross_border_consent: false,
        gdpr_consents: {
          necessary: true,
          marketing: false,
          imageRights: false,
          tokenization: false,
          crossBorder: false,
        },
        consent_withdrawal_date: new Date().toISOString(),
        consent_withdrawal_reason: reason,
      });

      // Mark all registrations as consent revoked
      // Note: This would ideally be done server-side, but showing the pattern
      const registrations = await base44.entities.Registration.filter({ email: user.email });
      for (const reg of registrations) {
        await base44.entities.Registration.update(reg.id, {
          consent_revoked: true,
          consent_revoked_date: new Date().toISOString(),
        });
      }

      // Send confirmation email
      await base44.integrations.Core.SendEmail({
        to: user.email,
        subject: 'Street Dynamics — Consent Withdrawal Confirmation',
        body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #000; color: #ffe8c0; border: 2px solid #00ffee;">
            <h2 style="color: #00ffee;">CONSENT WITHDRAWAL CONFIRMED</h2>
            <p>Dear ${user.full_name},</p>
            <p>Your consent withdrawal request has been processed on ${new Date().toLocaleDateString()}.</p>
            
            <div style="background: rgba(0,255,238,0.1); border: 1px solid rgba(0,255,238,0.3); padding: 15px; margin: 20px 0;">
              <h3 style="color: #00ffee; margin-top: 0;">ACTIONS TAKEN:</h3>
              <ul style="line-height: 1.8;">
                <li>✓ Marketing communications: STOPPED</li>
                <li>✓ Image rights for new content: REVOKED</li>
                <li>✓ Future tokenization: DISABLED</li>
                <li>✓ Cross-border data transfers: MINIMIZED</li>
              </ul>
            </div>

            <div style="background: rgba(255,100,0,0.1); border: 1px solid rgba(255,100,0,0.3); padding: 15px; margin: 20px 0;">
              <h4 style="color: #ff9900; margin-top: 0;">IMPORTANT NOTICES:</h4>
              <p style="font-size: 13px; line-height: 1.6;">
                • <strong>Existing Content:</strong> Previously published photos/videos remain online (lawful use before withdrawal).<br/>
                • <strong>Minted NFTs:</strong> Cannot be deleted due to blockchain immutability. Metadata remains on-chain.<br/>
                • <strong>Off-Chain Data:</strong> Personal identifiers will be pseudonymized where possible.<br/>
                • <strong>Account Status:</strong> Your account remains active for essential services (event tickets you purchased).<br/>
                • <strong>Data Retention:</strong> Some data retained for legal compliance (7-10 years) per UAE/EU law.<br/>
              </p>
            </div>

            <p style="font-size: 12px; color: #664422; margin-top: 20px;">
              <strong>Your Rights:</strong> You may request a full data export, file a complaint with the UAE Data Office or EU supervisory authority, 
              or contact our Data Protection Officer at privacy@streetdynamics.ae.
            </p>

            <p style="font-size: 12px; color: #664422; margin-top: 20px;">
              Reference ID: ${user.id}<br/>
              Withdrawal Date: ${new Date().toISOString()}<br/>
              Processed by: Street Dynamics Holding FZE (IFZA, Dubai, UAE)
            </p>

            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(255,100,0,0.2);">
              <p style="font-size: 10px; color: #2a1500;">© 2026 Street Dynamics Holding FZE — GDPR & UAE Data Protection Compliant</p>
            </div>
          </div>
        `,
      });

      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['current-user'] });
      setShowConfirm(false);
      toast.success('Consent withdrawal processed. Check your email for confirmation.');
    },
    onError: () => {
      toast.error('Failed to process withdrawal. Contact support.');
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="w-6 h-6 text-fire-5" />
        <h3 className="font-orbitron font-bold text-xl text-fire-5">GDPR CONSENT MANAGEMENT</h3>
      </div>

      {/* Current Consents */}
      <div className="bg-fire-3/5 border border-fire-3/20 p-5">
        <h4 className="font-orbitron font-bold text-sm text-fire-4 mb-3">YOUR CURRENT CONSENTS</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${user.marketing_consent ? 'bg-green-400' : 'bg-red-400'}`} />
            <span className="text-fire-3/60">Marketing Communications</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${user.image_rights_consent ? 'bg-green-400' : 'bg-red-400'}`} />
            <span className="text-fire-3/60">Image Rights</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${user.tokenization_consent ? 'bg-green-400' : 'bg-red-400'}`} />
            <span className="text-fire-3/60">Tokenization</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${user.cross_border_consent ? 'bg-green-400' : 'bg-red-400'}`} />
            <span className="text-fire-3/60">Cross-Border Transfers</span>
          </div>
        </div>
        {user.gdpr_consent_date && (
          <p className="font-mono text-xs text-fire-3/60 mt-3">
            Last updated: {new Date(user.gdpr_consent_date).toLocaleDateString()}
          </p>
        )}
      </div>

      {/* Withdrawal Warning */}
      <div className="bg-red-500/20 border-2 border-red-500/60 p-5">
        <div className="flex items-start gap-3 mb-3">
          <AlertTriangle size={24} className="text-red-400 flex-shrink-0" />
          <div>
            <h4 className="font-orbitron font-bold text-base text-red-400 mb-2">
              WITHDRAW ALL CONSENTS (GDPR RIGHT TO OBJECT)
            </h4>
            <p className="font-rajdhani text-sm text-red-300 leading-relaxed">
              You have the right to withdraw consent at any time under GDPR Article 7(3). 
              Withdrawing consent will stop future data processing for marketing, image capture, and tokenization.
            </p>
          </div>
        </div>

        <div className="bg-black/60 border border-red-500/40 p-4 mb-4">
          <p className="font-mono text-xs text-red-300 mb-2 font-bold">CONSEQUENCES OF WITHDRAWAL:</p>
          <ul className="font-mono text-xs text-red-400/80 space-y-1 list-disc list-inside">
            <li>No more marketing emails or promotional content</li>
            <li>No new photos/videos captured at future events</li>
            <li>Existing published content remains (lawful use before withdrawal)</li>
            <li>Minted NFTs cannot be deleted (blockchain immutability)</li>
            <li>Token purchase/trading disabled (requires active consent)</li>
            <li>Account downgraded to essential services only</li>
          </ul>
        </div>

        <button
          onClick={() => setShowConfirm(true)}
          className="w-full bg-red-500/20 border border-red-500/60 text-red-400 font-orbitron font-bold text-xs tracking-[2px] uppercase py-3 px-4 hover:bg-red-500/30 transition-all flex items-center justify-center gap-2"
        >
          <Trash2 size={14} />
          WITHDRAW ALL CONSENTS
        </button>
      </div>

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-[700] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg bg-gradient-to-br from-[rgba(10,4,18,0.99)] to-[rgba(4,2,8,1)] border-2 border-red-500/60 p-8"
          >
            <div className="text-center mb-6">
              <AlertTriangle size={64} className="text-red-400 mx-auto mb-4" />
              <h3 className="font-orbitron font-black text-2xl text-red-400 mb-2">
                FINAL CONFIRMATION
              </h3>
              <p className="font-rajdhani text-sm text-red-300 leading-relaxed">
                This action cannot be undone. Your account will be severely limited after consent withdrawal.
              </p>
            </div>

            <div className="mb-6">
              <label className="font-orbitron text-sm font-bold text-fire-4 mb-2 block">
                REASON FOR WITHDRAWAL (Optional)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Help us improve: Why are you withdrawing consent?"
                className="cyber-input h-20 resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="btn-ghost flex-1"
              >
                CANCEL
              </button>
              <button
                onClick={() => withdrawConsentMutation.mutate()}
                disabled={withdrawConsentMutation.isPending}
                className="flex-1 bg-red-500/40 border border-red-500/80 text-red-300 font-orbitron font-bold text-xs tracking-[2px] uppercase py-3 px-4 hover:bg-red-500/60 transition-all"
              >
                {withdrawConsentMutation.isPending ? 'PROCESSING...' : 'CONFIRM WITHDRAWAL'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* GDPR Rights Info */}
      <div className="bg-cyan/10 border border-cyan/30 p-5">
        <h4 className="font-orbitron font-bold text-sm text-cyan mb-3 flex items-center gap-2">
          <Mail size={16} />
          YOUR GDPR RIGHTS
        </h4>
        <div className="font-mono text-xs text-cyan/80 space-y-2 leading-relaxed">
          <p><strong>Right to Access:</strong> Request a copy of all your data → privacy@streetdynamics.ae</p>
          <p><strong>Right to Rectification:</strong> Correct inaccurate data via profile settings</p>
          <p><strong>Right to Erasure:</strong> Request deletion (subject to legal retention) → privacy@streetdynamics.ae</p>
          <p><strong>Right to Portability:</strong> Export your data in JSON/CSV format → Settings → Export Data</p>
          <p><strong>Right to Object:</strong> Use the withdrawal button above</p>
          <p><strong>Right to Lodge Complaint:</strong> UAE Data Office (DIFC) or EU supervisory authority</p>
        </div>
      </div>
    </div>
  );
}