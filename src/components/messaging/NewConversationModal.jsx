/**
 * New Conversation Modal
 * Start a new messaging conversation
 */

import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { toast } from 'sonner';

export default function NewConversationModal({ onClose, onConversationCreated, userRole }) {
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [subject, setSubject] = useState('');
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: deals = [] } = useQuery({
    queryKey: ['deals-for-messaging', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const allDeals = await base44.entities.SponsorshipDeal.filter({
        status: 'accepted',
      });
      return userRole === 'brand'
        ? allDeals.filter((d) => d.brand_email === user.email)
        : allDeals.filter((d) => d.athlete_email === user.email);
    },
    enabled: !!user?.email,
    initialData: [],
  });

  const createConversationMutation = useMutation({
    mutationFn: async () => {
      if (!selectedDeal || !subject) {
        throw new Error('Please select a deal and enter a subject');
      }

      const conversation = await base44.entities.Conversation.create({
        deal_id: selectedDeal.id,
        brand_email: userRole === 'brand' ? user.email : selectedDeal.brand_email,
        athlete_email: userRole === 'athlete' ? user.email : selectedDeal.athlete_email,
        subject,
        created_at: new Date().toISOString(),
      });

      return conversation;
    },
    onSuccess: (conversation) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      toast.success('Conversation started!');
      onConversationCreated(conversation);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <div className="fixed inset-0 z-[600] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-gradient-to-br from-[rgba(10,4,18,0.99)] to-[rgba(4,2,8,1)] border border-fire-3/20 rounded-lg p-8"
      >
        <div className="flex items-start justify-between mb-6">
          <h2 className="text-fire-gradient font-orbitron font-black text-2xl">
            NEW CONVERSATION
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-fire-3/10 rounded transition-all">
            <X size={20} className="text-fire-3" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Deal Selection */}
          <div>
            <label className="block font-rajdhani font-bold text-fire-4 mb-2 text-sm">
              Select Campaign *
            </label>
            <select
              value={selectedDeal?.id || ''}
              onChange={(e) => {
                const deal = deals.find((d) => d.id === e.target.value);
                setSelectedDeal(deal);
              }}
              className="w-full bg-fire-3/5 border border-fire-3/20 px-4 py-2 text-fire-4 font-rajdhani rounded focus:outline-none focus:border-fire-3/40"
            >
              <option value="">-- Select a campaign --</option>
              {deals.map((deal) => (
                <option key={deal.id} value={deal.id}>
                  {deal.campaign_title} • €{deal.budget}
                </option>
              ))}
            </select>
            {deals.length === 0 && (
              <p className="font-mono text-xs text-fire-3/40 mt-2">
                No active campaigns found
              </p>
            )}
          </div>

          {/* Subject */}
          {selectedDeal && (
            <div>
              <label className="block font-rajdhani font-bold text-fire-4 mb-2 text-sm">
                Conversation Subject *
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g., Deliverable Timeline, Payment Terms..."
                className="w-full bg-fire-3/5 border border-fire-3/20 px-4 py-2 text-fire-4 placeholder-fire-3/30 font-rajdhani rounded focus:outline-none focus:border-fire-3/40"
              />
            </div>
          )}

          {/* Deal Info */}
          {selectedDeal && (
            <div className="bg-fire-3/5 border border-fire-3/20 p-4 rounded-lg">
              <h4 className="font-rajdhani font-bold text-fire-4 mb-2">{selectedDeal.campaign_title}</h4>
              <p className="font-rajdhani text-sm text-fire-4/70 mb-3">
                {selectedDeal.description}
              </p>
              <div className="space-y-1 font-mono text-xs text-fire-3/60">
                <p>Budget: €{selectedDeal.budget}</p>
                <p>Duration: {selectedDeal.duration_days} days</p>
                <p>Deliverables: {selectedDeal.deliverables?.length || 0}</p>
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="bg-cyan/5 border border-cyan/20 p-3 rounded">
            <p className="font-mono text-xs text-cyan/70">
              💡 Use this conversation to negotiate terms, discuss deliverables, and coordinate campaign logistics.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-fire-3/20">
            <button
              onClick={onClose}
              className="flex-1 bg-fire-3/10 border border-fire-3/20 text-fire-3 font-orbitron font-bold py-2 rounded hover:bg-fire-3/20 transition-all"
            >
              CANCEL
            </button>
            <button
              onClick={() => createConversationMutation.mutate()}
              disabled={!selectedDeal || !subject || createConversationMutation.isPending}
              className="flex-1 bg-gradient-to-r from-fire-3 to-fire-4 text-black font-orbitron font-bold py-2 rounded hover:opacity-90 transition-all disabled:opacity-50"
            >
              {createConversationMutation.isPending ? 'CREATING...' : 'START CHAT'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}