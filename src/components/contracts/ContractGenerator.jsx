/**
 * Contract Generator
 * Generate and download sponsorship agreement PDFs
 */

import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { FileText, Download, Loader } from 'lucide-react';
import { toast } from 'sonner';

export default function ContractGenerator({ deal, onClose }) {
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const generateContract = async () => {
    try {
      setIsGenerating(true);
      const response = await base44.functions.invoke('generateSponsorshipContract', {
        deal_id: deal.id,
      });

      // Download the PDF
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `sponsorship-agreement-${deal.campaign_title.replace(/\s+/g, '-')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Contract downloaded successfully!');
    } catch (error) {
      toast.error('Failed to generate contract: ' + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-fire-3/10 to-fire-3/5 border border-fire-3/20 rounded-lg p-6 space-y-4"
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-lg bg-fire-3/10 border border-fire-3/20 flex items-center justify-center flex-shrink-0">
          <FileText size={24} className="text-fire-3" />
        </div>
        <div className="flex-1">
          <h3 className="font-orbitron font-bold text-lg text-fire-5 mb-1">
            SPONSORSHIP AGREEMENT
          </h3>
          <p className="font-rajdhani text-sm text-fire-4/70">
            Generate a legally binding PDF contract from your agreement terms
          </p>
        </div>
      </div>

      {/* Deal Summary */}
      <div className="bg-black/30 rounded-lg p-4 space-y-2 border border-fire-3/10">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="font-mono text-xs text-fire-3/60 mb-1">CAMPAIGN</p>
            <p className="font-rajdhani font-bold text-fire-4">{deal.campaign_title}</p>
          </div>
          <div>
            <p className="font-mono text-xs text-fire-3/60 mb-1">BUDGET</p>
            <p className="font-rajdhani font-bold text-fire-6">€{deal.budget}</p>
          </div>
          <div>
            <p className="font-mono text-xs text-fire-3/60 mb-1">DURATION</p>
            <p className="font-rajdhani font-bold text-fire-4">{deal.duration_days} days</p>
          </div>
          <div>
            <p className="font-mono text-xs text-fire-3/60 mb-1">STATUS</p>
            <p className="font-rajdhani font-bold text-green-400">{deal.status}</p>
          </div>
        </div>

        <div className="pt-2 border-t border-fire-3/10">
          <p className="font-mono text-xs text-fire-3/60 mb-2">PARTIES</p>
          <p className="font-rajdhani text-sm text-fire-4/70">
            <span className="font-bold text-fire-4">Brand:</span> {deal.brand_name}
          </p>
          <p className="font-rajdhani text-sm text-fire-4/70">
            <span className="font-bold text-fire-4">Athlete:</span> {deal.athlete_name}
          </p>
        </div>
      </div>

      {/* Deliverables Summary */}
      {deal.deliverables && deal.deliverables.length > 0 && (
        <div className="bg-black/30 rounded-lg p-4 border border-fire-3/10">
          <p className="font-mono text-xs text-fire-3/60 mb-2 uppercase tracking-[1px]">
            DELIVERABLES ({deal.deliverables.length})
          </p>
          <div className="space-y-1">
            {deal.deliverables.slice(0, 3).map((deliverable, idx) => {
              const text = typeof deliverable === 'string' ? deliverable : deliverable.description;
              return (
                <p key={idx} className="font-rajdhani text-sm text-fire-4/70">
                  • {text}
                </p>
              );
            })}
            {deal.deliverables.length > 3 && (
              <p className="font-rajdhani text-xs text-fire-3/60 mt-2">
                + {deal.deliverables.length - 3} more deliverables
              </p>
            )}
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-cyan/5 border border-cyan/20 p-3 rounded">
        <p className="font-mono text-xs text-cyan/70">
          ℹ️ This generates a professional PDF agreement with all campaign details, terms, deliverables, and signature pages. Both parties must sign for it to be legally binding.
        </p>
      </div>

      {/* Action Button */}
      <button
        onClick={generateContract}
        disabled={isGenerating}
        className="w-full bg-gradient-to-r from-fire-3 to-fire-4 text-black font-orbitron font-bold py-3 rounded hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isGenerating ? (
          <>
            <Loader size={18} className="animate-spin" />
            GENERATING...
          </>
        ) : (
          <>
            <Download size={18} />
            DOWNLOAD AGREEMENT PDF
          </>
        )}
      </button>

      {/* Legal Notice */}
      <div className="pt-4 border-t border-fire-3/10">
        <p className="font-mono text-xs text-fire-3/40 leading-relaxed">
          LEGAL NOTICE: This PDF is a template and should be reviewed by legal counsel before execution. Each party should retain a signed copy for their records. This agreement becomes binding upon signature by both parties.
        </p>
      </div>
    </motion.div>
  );
}