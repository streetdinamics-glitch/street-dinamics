/**
 * Brand Proposal Wizard
 * Multi-step wizard for brands to create and send sponsorship proposals
 */

import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ArrowLeft, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import ProposalBasicsStep from './proposal-steps/ProposalBasicsStep';
import ProposalScopeStep from './proposal-steps/ProposalScopeStep';
import ProposalBudgetStep from './proposal-steps/ProposalBudgetStep';
import ProposalReviewStep from './proposal-steps/ProposalReviewStep';

const STEPS = [
  { id: 'basics', title: 'Campaign Basics', description: 'Define the campaign name and target athlete' },
  { id: 'scope', title: 'Deliverables', description: 'Outline what you need from the athlete' },
  { id: 'budget', title: 'Budget & Terms', description: 'Set compensation and payment schedule' },
  { id: 'review', title: 'Review & Send', description: 'Review and send the proposal' },
];

export default function BrandProposalWizard({ brandEmail, brandName, onClose, onSuccess }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [proposalData, setProposalData] = useState({
    campaign_title: '',
    description: '',
    target_athlete_email: '',
    target_athlete_name: '',
    budget: 0,
    currency: 'EUR',
    duration_days: 30,
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    deliverables: [],
    payment_terms: 'milestone',
    notes: '',
  });
  const queryClient = useQueryClient();

  const sendProposalMutation = useMutation({
    mutationFn: async () => {
      // Create SponsorshipDeal with "proposed" status
      const deal = await base44.entities.SponsorshipDeal.create({
        brand_email: brandEmail,
        brand_name: brandName,
        athlete_email: proposalData.target_athlete_email,
        athlete_name: proposalData.target_athlete_name,
        campaign_title: proposalData.campaign_title,
        description: proposalData.description,
        budget: proposalData.budget,
        currency: proposalData.currency,
        duration_days: proposalData.duration_days,
        start_date: proposalData.start_date,
        end_date: proposalData.end_date,
        deliverables: proposalData.deliverables,
        payment_terms: proposalData.payment_terms,
        status: 'proposed',
        athlete_response: 'pending',
      });

      // Send notification email to athlete
      await base44.integrations.Core.SendEmail({
        to: proposalData.target_athlete_email,
        subject: `New Sponsorship Proposal from ${brandName}: ${proposalData.campaign_title}`,
        body: `Hello ${proposalData.target_athlete_name},

${brandName} has sent you a sponsorship proposal!

Campaign: ${proposalData.campaign_title}
Budget: €${proposalData.budget}
Duration: ${proposalData.duration_days} days
Payment Terms: ${proposalData.payment_terms}

Description: ${proposalData.description}

Deliverables:
${proposalData.deliverables.map((d, i) => `${i + 1}. ${typeof d === 'string' ? d : d.description}`).join('\n')}

You can review this proposal in your dashboard and accept, counter-offer, or reject it.`,
      });

      return deal;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brand-deals'] });
      toast.success('Proposal sent to athlete!');
      onSuccess?.();
    },
    onError: (error) => {
      toast.error('Failed to send proposal: ' + error.message);
    },
  });

  const handleNext = () => {
    if (currentStep === STEPS.length - 1) {
      sendProposalMutation.mutate();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: // Basics
        return proposalData.campaign_title && proposalData.target_athlete_email;
      case 1: // Scope
        return proposalData.deliverables.length > 0;
      case 2: // Budget
        return proposalData.budget > 0;
      case 3: // Review
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="fixed inset-0 z-[800] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-4xl bg-gradient-to-br from-[rgba(10,4,18,0.99)] to-[rgba(4,2,8,1)] border border-fire-3/20 rounded-lg p-8"
      >
        <div className="absolute top-0 left-0 right-0 fire-line" />

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            {STEPS.map((step, idx) => (
              <div key={step.id} className="flex items-center">
                <motion.div
                  animate={{
                    scale: idx === currentStep ? 1.1 : 1,
                    backgroundColor:
                      idx < currentStep
                        ? 'rgba(0, 255, 136, 0.2)'
                        : idx === currentStep
                        ? 'rgba(255, 102, 0, 0.2)'
                        : 'rgba(255, 102, 0, 0.05)',
                  }}
                  className="flex items-center justify-center w-12 h-12 rounded-full border-2 border-fire-3/30 cursor-pointer transition-all"
                  onClick={() => idx <= currentStep && setCurrentStep(idx)}
                >
                  {idx < currentStep ? (
                    <CheckCircle size={24} className="text-green-400" />
                  ) : idx === currentStep ? (
                    <div className="w-6 h-6 rounded-full bg-fire-3 animate-pulse" />
                  ) : (
                    <span className="font-orbitron font-bold text-fire-3/40">{idx + 1}</span>
                  )}
                </motion.div>

                {idx < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 rounded transition-all ${
                      idx < currentStep ? 'bg-green-500' : 'bg-fire-3/20'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="text-center">
            <h2 className="text-fire-gradient font-orbitron font-black text-2xl mb-1">
              {STEPS[currentStep].title}
            </h2>
            <p className="font-rajdhani text-fire-3/60">
              {STEPS[currentStep].description}
            </p>
          </div>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="mb-8 min-h-[400px]"
          >
            {currentStep === 0 && (
              <ProposalBasicsStep data={proposalData} onChange={setProposalData} />
            )}
            {currentStep === 1 && (
              <ProposalScopeStep data={proposalData} onChange={setProposalData} />
            )}
            {currentStep === 2 && (
              <ProposalBudgetStep data={proposalData} onChange={setProposalData} />
            )}
            {currentStep === 3 && (
              <ProposalReviewStep data={proposalData} brandName={brandName} />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex gap-3 pt-6 border-t border-fire-3/10">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className="flex-1 bg-fire-3/10 border border-fire-3/20 text-fire-3 font-orbitron font-bold py-3 rounded hover:bg-fire-3/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <ArrowLeft size={18} />
            BACK
          </button>

          <button
            onClick={handleNext}
            disabled={!canProceed() || sendProposalMutation.isPending}
            className="flex-1 bg-gradient-to-r from-fire-3 to-fire-4 text-black font-orbitron font-bold py-3 rounded hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {sendProposalMutation.isPending
              ? 'SENDING...'
              : currentStep === STEPS.length - 1
              ? 'SEND PROPOSAL'
              : 'NEXT'}
            {!sendProposalMutation.isPending && <ChevronRight size={18} />}
          </button>
        </div>
      </motion.div>
    </div>
  );
}