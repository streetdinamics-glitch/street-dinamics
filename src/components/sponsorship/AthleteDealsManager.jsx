/**
 * Athlete Deals Manager
 * Allows athletes to review, accept/reject, and manage sponsorship deals
 */

import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, MessageSquare, DollarSign, Calendar, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import DealDetailModal from './DealDetailModal';

export default function AthleteDealsManager() {
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: deals = [] } = useQuery({
    queryKey: ['athlete-deals', user?.email],
    queryFn: () =>
      user?.email
        ? base44.entities.SponsorshipDeal.filter({ athlete_email: user.email })
        : Promise.resolve([]),
    enabled: !!user?.email,
    initialData: [],
  });

  const { data: escrows = [] } = useQuery({
    queryKey: ['escrow-accounts', user?.email],
    queryFn: () =>
      user?.email
        ? base44.entities.EscrowAccount.filter({ athlete_email: user.email })
        : Promise.resolve([]),
    enabled: !!user?.email,
    initialData: [],
  });

  const respondToProposalMutation = useMutation({
    mutationFn: async ({ dealId, response, counterOffer }) => {
      return await base44.entities.SponsorshipDeal.update(dealId, {
        athlete_response: response,
        counter_offer_amount: counterOffer || null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['athlete-deals'] });
      toast.success('Response sent to brand!');
    },
    onError: () => {
      toast.error('Failed to respond to proposal');
    },
  });

  const handleAcceptDeal = (deal) => {
    respondToProposalMutation.mutate({
      dealId: deal.id,
      response: 'accepted',
    });
  };

  const handleRejectDeal = (deal) => {
    respondToProposalMutation.mutate({
      dealId: deal.id,
      response: 'rejected',
    });
  };

  const pendingDeals = deals.filter(d => d.athlete_response === 'pending');
  const acceptedDeals = deals.filter(d => d.athlete_response === 'accepted' && d.status !== 'completed');
  const completedDeals = deals.filter(d => d.status === 'completed');

  const totalEarnings = escrows.reduce((sum, e) => sum + e.released_amount, 0);

  return (
    <div className="min-h-screen bg-cyber-void text-foreground p-6">
      <div className="cyber-grid" />
      <div className="cyber-scanlines" />
      <div className="cyber-vignette" />

      <div className="relative z-10 max-w-[1400px] mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <p className="font-mono text-[10px] tracking-[7px] uppercase text-fire-3/40 mb-2">
            // SPONSORSHIP OPPORTUNITIES //
          </p>
          <h1 className="heading-fire text-[clamp(36px,6vw,72px)] leading-none font-black mb-4">
            MANAGE DEALS & EARNINGS
          </h1>
          <div className="h-[2px] bg-gradient-to-r from-fire-3 via-fire-5 to-transparent" />
        </motion.div>

        {/* Earnings Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[rgba(10,4,18,0.98)] to-[rgba(4,2,8,1)] border border-green-500/20 p-6 mb-8 rounded-lg"
        >
          <div className="flex items-center gap-3 mb-4">
            <DollarSign className="text-green-400" size={24} />
            <h2 className="font-orbitron font-bold text-2xl text-green-400">TOTAL EARNINGS</h2>
          </div>
          <div className="font-orbitron font-black text-5xl text-green-400">
            €{totalEarnings.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
          </div>
          <p className="font-rajdhani text-sm text-fire-4/70 mt-2">
            From {acceptedDeals.length} active deals
          </p>
        </motion.div>

        {/* Pending Proposals */}
        {pendingDeals.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h2 className="font-orbitron font-bold text-2xl text-fire-5 mb-4 flex items-center gap-2">
              <MessageSquare size={24} />
              Pending Proposals ({pendingDeals.length})
            </h2>

            <div className="space-y-4">
              {pendingDeals.map((deal, idx) => (
                <motion.div
                  key={deal.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-gradient-to-br from-[rgba(10,4,18,0.98)] to-[rgba(4,2,8,1)] border border-fire-3/20 p-6 rounded-lg hover:border-fire-3/40 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-orbitron font-bold text-lg text-fire-5 mb-2">
                        {deal.campaign_title}
                      </h3>
                      <p className="font-rajdhani text-sm text-fire-4/70">{deal.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-orbitron font-black text-3xl text-fire-6 mb-1">
                        €{deal.budget.toLocaleString()}
                      </div>
                      <p className="font-mono text-xs text-fire-3/60">
                        {deal.duration_days} days • {new Date(deal.start_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="bg-black/40 p-4 rounded mb-4">
                    <p className="font-mono text-xs text-fire-3/60 mb-2 uppercase tracking-[1px]">
                      Deliverables ({deal.deliverables?.length || 0})
                    </p>
                    <ul className="space-y-1">
                      {(deal.deliverables || []).slice(0, 3).map((del, i) => (
                        <li key={i} className="font-rajdhani text-sm text-fire-4/70">
                          • {del.description}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleRejectDeal(deal)}
                      className="flex-1 bg-red-500/10 border border-red-500/30 text-red-400 font-orbitron font-bold py-2 rounded hover:bg-red-500/20 transition-all flex items-center justify-center gap-2"
                    >
                      <X size={16} />
                      DECLINE
                    </button>
                    <button
                      onClick={() => {
                        setSelectedDeal(deal);
                        setDetailModalOpen(true);
                      }}
                      className="flex-1 bg-fire-3/10 border border-fire-3/30 text-fire-3 font-orbitron font-bold py-2 rounded hover:bg-fire-3/20 transition-all"
                    >
                      REVIEW
                    </button>
                    <button
                      onClick={() => handleAcceptDeal(deal)}
                      className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-black font-orbitron font-bold py-2 rounded hover:opacity-90 transition-all flex items-center justify-center gap-2"
                    >
                      <Check size={16} />
                      ACCEPT
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Active Deals */}
        {acceptedDeals.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <h2 className="font-orbitron font-bold text-2xl text-cyan mb-4 flex items-center gap-2">
              <CheckCircle size={24} />
              Active Campaigns ({acceptedDeals.length})
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {acceptedDeals.map((deal, idx) => {
                const escrow = escrows.find(e => e.deal_id === deal.id);
                return (
                  <motion.div
                    key={deal.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-gradient-to-br from-cyan/5 to-cyan/2 border border-cyan/20 p-5 rounded-lg"
                  >
                    <h3 className="font-orbitron font-bold text-lg text-cyan mb-3">
                      {deal.campaign_title}
                    </h3>

                    <div className="space-y-2 mb-4 font-rajdhani text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-fire-3/60">Budget</span>
                        <span className="font-bold text-fire-4">€{deal.budget.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-fire-3/60">Escrow Status</span>
                        <span
                          className={`font-mono text-xs px-2 py-1 rounded ${
                            escrow?.status === 'funded'
                              ? 'bg-green-500/10 text-green-400'
                              : 'bg-fire-3/10 text-fire-3'
                          }`}
                        >
                          {escrow?.status || 'pending'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-fire-3/60">Timeline</span>
                        <span className="text-fire-4 text-xs">
                          {new Date(deal.start_date).toLocaleDateString()} - {new Date(deal.end_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {escrow && (
                      <div className="bg-black/30 p-3 rounded mb-4">
                        <p className="font-mono text-xs text-fire-3/60 mb-2">PAYMENT PROGRESS</p>
                        <div className="h-2 bg-black/40 rounded overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(escrow.released_amount / escrow.total_amount) * 100}%` }}
                            transition={{ duration: 1 }}
                            className="h-full bg-green-500"
                          />
                        </div>
                        <div className="mt-2 flex justify-between">
                          <span className="font-mono text-xs text-fire-3/60">
                            €{escrow.released_amount.toLocaleString()} released
                          </span>
                          <span className="font-mono text-xs text-fire-3/60">
                            €{escrow.held_amount.toLocaleString()} in escrow
                          </span>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => {
                        setSelectedDeal(deal);
                        setDetailModalOpen(true);
                      }}
                      className="w-full bg-cyan/10 border border-cyan/30 text-cyan font-orbitron font-bold py-2 rounded hover:bg-cyan/20 transition-all"
                    >
                      View Details
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {deals.length === 0 && (
          <div className="text-center py-20">
            <MessageSquare size={48} className="text-fire-3/20 mx-auto mb-4" />
            <p className="font-mono text-sm text-fire-3/40">
              No sponsorship proposals yet. Complete your profile to attract brands!
            </p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {detailModalOpen && selectedDeal && (
          <DealDetailModal
            deal={selectedDeal}
            escrow={escrows.find(e => e.deal_id === selectedDeal.id)}
            onClose={() => {
              setDetailModalOpen(false);
              setSelectedDeal(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}