/**
 * Deal Detail Modal
 * View full deal details, messaging, and contract generation
 */

import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquare, FileText, Clock, DollarSign, CheckCircle } from 'lucide-react';
import ContractGenerator from '../contracts/ContractGenerator';

export default function DealDetailModal({ deal, onClose }) {
  const [showContract, setShowContract] = useState(false);
  const [showMessaging, setShowMessaging] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: conversation } = useQuery({
    queryKey: ['deal-conversation', deal.id],
    queryFn: async () => {
      const convs = await base44.entities.Conversation.filter({ deal_id: deal.id });
      return convs[0] || null;
    },
  });

  const userRole = user?.email === deal.brand_email ? 'brand' : 'athlete';

  const statusColors = {
    proposed: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
    accepted: 'bg-green-500/10 border-green-500/30 text-green-400',
    rejected: 'bg-red-500/10 border-red-500/30 text-red-400',
    in_progress: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
    completed: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
    disputed: 'bg-red-500/10 border-red-500/30 text-red-400',
  };

  return (
    <div className="fixed inset-0 z-[700] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl bg-gradient-to-br from-[rgba(10,4,18,0.99)] to-[rgba(4,2,8,1)] border border-fire-3/20 rounded-lg p-8 my-auto"
      >
        <div className="absolute top-0 left-0 right-0 fire-line" />

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-fire-gradient font-orbitron font-black text-2xl mb-2">
              {deal.campaign_title}
            </h2>
            <p className="font-mono text-sm text-fire-3/60">
              {userRole === 'brand' ? deal.athlete_name : deal.brand_name}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-fire-3/10 rounded transition-all">
            <X size={20} className="text-fire-3" />
          </button>
        </div>

        {/* Status Badge */}
        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded border mb-6 font-mono text-xs font-bold ${statusColors[deal.status]}`}>
          <CheckCircle size={14} />
          {deal.status.toUpperCase()}
        </div>

        {/* Deal Info Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-fire-3/5 border border-fire-3/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign size={16} className="text-fire-3" />
              <p className="font-mono text-xs text-fire-3/60 uppercase tracking-[1px]">Budget</p>
            </div>
            <p className="font-orbitron font-black text-2xl text-fire-6">€{deal.budget}</p>
          </div>

          <div className="bg-cyan/5 border border-cyan/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={16} className="text-cyan" />
              <p className="font-mono text-xs text-cyan/60 uppercase tracking-[1px]">Duration</p>
            </div>
            <p className="font-orbitron font-black text-2xl text-cyan">{deal.duration_days} days</p>
          </div>
        </div>

        {/* Description */}
        <div className="mb-6">
          <h3 className="font-orbitron font-bold text-lg text-fire-5 mb-2">DESCRIPTION</h3>
          <p className="font-rajdhani text-fire-4/70 leading-relaxed">{deal.description}</p>
        </div>

        {/* Deliverables */}
        <div className="mb-6">
          <h3 className="font-orbitron font-bold text-lg text-fire-5 mb-3">DELIVERABLES</h3>
          <div className="space-y-2">
            {deal.deliverables && deal.deliverables.length > 0 ? (
              deal.deliverables.map((deliverable, idx) => {
                const text = typeof deliverable === 'string' ? deliverable : deliverable.description;
                const status = typeof deliverable === 'string' ? null : deliverable.status;
                return (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-fire-3/5 rounded border border-fire-3/10">
                    <CheckCircle size={18} className={`text-fire-3 flex-shrink-0 mt-0.5 ${status === 'completed' ? 'text-green-400' : ''}`} />
                    <div className="flex-1">
                      <p className="font-rajdhani text-sm text-fire-4">{text}</p>
                      {status && (
                        <p className="font-mono text-xs text-fire-3/60 mt-1">Status: {status}</p>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="font-rajdhani text-sm text-fire-3/60">No deliverables specified</p>
            )}
          </div>
        </div>

        {/* Key Terms */}
        <div className="mb-6">
          <h3 className="font-orbitron font-bold text-lg text-fire-5 mb-3">KEY TERMS</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-fire-3/5 rounded border border-fire-3/10">
              <p className="font-mono text-xs text-fire-3/60 mb-1">Payment Terms</p>
              <p className="font-rajdhani font-bold text-fire-4 text-sm">{deal.payment_terms}</p>
            </div>
            <div className="p-3 bg-fire-3/5 rounded border border-fire-3/10">
              <p className="font-mono text-xs text-fire-3/60 mb-1">Start Date</p>
              <p className="font-rajdhani font-bold text-fire-4 text-sm">
                {new Date(deal.start_date).toLocaleDateString()}
              </p>
            </div>
            <div className="p-3 bg-fire-3/5 rounded border border-fire-3/10">
              <p className="font-mono text-xs text-fire-3/60 mb-1">End Date</p>
              <p className="font-rajdhani font-bold text-fire-4 text-sm">
                {new Date(deal.end_date).toLocaleDateString()}
              </p>
            </div>
            <div className="p-3 bg-fire-3/5 rounded border border-fire-3/10">
              <p className="font-mono text-xs text-fire-3/60 mb-1">Escrow Status</p>
              <p className="font-rajdhani font-bold text-fire-4 text-sm">
                {deal.escrow_id ? 'Active' : 'None'}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-6">
          {deal.status === 'accepted' && (
            <button
              onClick={() => setShowContract(true)}
              className="flex-1 bg-gradient-to-r from-fire-3 to-fire-4 text-black font-orbitron font-bold py-3 rounded hover:opacity-90 transition-all flex items-center justify-center gap-2"
            >
              <FileText size={18} />
              GENERATE CONTRACT
            </button>
          )}
          <button
            onClick={() => setShowMessaging(true)}
            className="flex-1 bg-cyan/10 border border-cyan/30 text-cyan font-orbitron font-bold py-3 rounded hover:bg-cyan/20 transition-all flex items-center justify-center gap-2"
          >
            <MessageSquare size={18} />
            {conversation ? 'CONTINUE' : 'START'} MESSAGING
          </button>
        </div>

        {/* Contract Generator */}
        <AnimatePresence>
          {showContract && (
            <div className="mb-6">
              <ContractGenerator deal={deal} onClose={() => setShowContract(false)} />
            </div>
          )}
        </AnimatePresence>

        {/* Messaging Info */}
        {showMessaging && (
          <div className="bg-cyan/5 border border-cyan/20 p-4 rounded">
            <p className="font-mono text-sm text-cyan/70">
              💬 Use the messaging system to discuss campaign details, deliverables, and logistics directly with {userRole === 'brand' ? deal.athlete_name : deal.brand_name}.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}