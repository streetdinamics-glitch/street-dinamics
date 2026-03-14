import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Download, FileText, Database, Shield, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function DataExportTool({ user }) {
  const [exporting, setExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);

  const exportDataMutation = useMutation({
    mutationFn: async () => {
      // Fetch all user data
      const [registrations, tokens, nfts, bets, votes, transactions] = await Promise.all([
        base44.entities.Registration.filter({ created_by: user.email }),
        base44.entities.TokenOwnership.filter({ created_by: user.email }),
        base44.entities.NFTOwnership.filter({ created_by: user.email }),
        base44.entities.Bet.filter({ created_by: user.email }),
        base44.entities.UserVote.filter({ user_email: user.email }),
        base44.entities.TokenTransaction.filter({ buyer_email: user.email }),
      ]);

      // Compile comprehensive data export
      const exportData = {
        export_metadata: {
          export_date: new Date().toISOString(),
          export_version: '1.0',
          data_controller: 'Street Dynamics Holding FZE',
          user_id: user.id,
          user_email: user.email,
          legal_basis: 'GDPR Article 20 (Right to Data Portability)',
        },
        personal_information: {
          full_name: user.full_name,
          email: user.email,
          phone: user.phone,
          date_of_birth: user.date_of_birth,
          age_at_registration: user.age_at_registration,
          is_minor: user.is_minor,
          country: user.country,
          city: user.city,
          role: user.role,
          user_type: user.user_type,
          avatar_url: user.avatar_url,
          wallet_address: user.wallet_address,
          account_created: user.created_date,
        },
        gdpr_consents: {
          marketing_consent: user.marketing_consent,
          image_rights_consent: user.image_rights_consent,
          tokenization_consent: user.tokenization_consent,
          cross_border_consent: user.cross_border_consent,
          consent_date: user.gdpr_consent_date,
          terms_version: user.terms_version,
          terms_accepted_date: user.terms_accepted_date,
        },
        profile_data: {
          athlete_profile: user.athlete_profile || null,
          spectator_profile: user.spectator_profile || null,
          preferences: user.preferences || null,
        },
        event_registrations: registrations.map(r => ({
          event_id: r.event_id,
          type: r.type,
          registration_date: r.created_date,
          status: r.status,
          ticket_code: r.ticket_code,
          attendance_mode: r.attendance_mode,
        })),
        token_ownership: tokens.map(t => ({
          athlete_name: t.athlete_name,
          token_tier: t.token_tier,
          purchase_date: t.purchase_date,
          purchase_price: t.purchase_price,
        })),
        nft_ownership: nfts.map(n => ({
          athlete_name: n.athlete_name,
          card_number: n.card_number,
          serial_number: n.serial_number,
          rarity: n.rarity,
          minted_at: n.minted_at,
        })),
        transactions: transactions.map(tx => ({
          transaction_date: tx.created_date,
          athlete: tx.athlete_name,
          amount: tx.total_amount,
          payment_status: tx.payment_status,
        })),
        betting_history: bets.map(b => ({
          event_id: b.event_id,
          athlete_name: b.athlete_name,
          prediction: b.prediction,
          status: b.status,
          created_date: b.created_date,
        })),
        voting_history: votes.map(v => ({
          vote_id: v.vote_id,
          choice_index: v.choice_index,
          voted_at: v.voted_at,
        })),
        legal_notices: {
          data_retention_period: '7-10 years from last activity',
          blockchain_data_notice: 'NFT metadata on blockchain is immutable and cannot be deleted',
          third_party_processors: ['Stripe (payments)', 'AWS (hosting)', 'Polygon (blockchain)'],
          cross_border_transfers: ['USA (SCC)', 'Singapore (SCC)'],
          supervisory_authority: 'UAE Data Office (DIFC) / EU DPA',
          contact: 'privacy@streetdynamics.ae',
        },
      };

      // Convert to JSON and trigger download
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `StreetDynamics_DataExport_${user.email}_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      return exportData;
    },
    onSuccess: () => {
      setExporting(false);
      setExportComplete(true);
      toast.success('Data export complete! File downloaded.');
    },
    onError: () => {
      setExporting(false);
      toast.error('Export failed. Please contact support.');
    },
  });

  const handleExport = () => {
    setExporting(true);
    exportDataMutation.mutate();
  };

  return (
    <div className="bg-cyan/10 border border-cyan/30 p-6">
      <div className="flex items-start gap-4 mb-4">
        <Database size={32} className="text-cyan flex-shrink-0" />
        <div>
          <h4 className="font-orbitron font-bold text-lg text-cyan mb-2">
            DATA PORTABILITY (GDPR Art. 20)
          </h4>
          <p className="font-rajdhani text-sm text-cyan/80 leading-relaxed">
            Download a complete copy of all your personal data stored on Street Dynamics in machine-readable JSON format. 
            This includes your profile, registrations, tokens, NFTs, transactions, and consent records.
          </p>
        </div>
      </div>

      <div className="bg-black/60 border border-cyan/20 p-4 mb-4">
        <h5 className="font-mono text-xs text-cyan font-bold mb-2">EXPORT INCLUDES:</h5>
        <div className="grid grid-cols-2 gap-2 font-mono text-xs text-cyan/70">
          <div className="flex items-center gap-2">
            <CheckCircle size={12} />
            Personal Information
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle size={12} />
            GDPR Consent History
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle size={12} />
            Event Registrations
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle size={12} />
            Token Ownership
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle size={12} />
            NFT Collection
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle size={12} />
            Transaction History
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle size={12} />
            Betting/Voting Records
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle size={12} />
            Legal Notices
          </div>
        </div>
      </div>

      <button
        onClick={handleExport}
        disabled={exporting}
        className="w-full bg-cyan/20 border border-cyan/60 text-cyan font-orbitron font-bold text-sm tracking-[2px] uppercase py-3 px-4 hover:bg-cyan/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <Download size={16} />
        {exporting ? 'EXPORTING DATA...' : exportComplete ? '✓ EXPORT COMPLETE' : 'DOWNLOAD MY DATA (JSON)'}
      </button>

      <p className="font-mono text-[10px] text-cyan/60 mt-3 text-center">
        Response time: Instant download | Format: JSON (machine-readable) | 
        Blockchain data included with immutability notice
      </p>
    </div>
  );
}