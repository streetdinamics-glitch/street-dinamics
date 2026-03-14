/**
 * Messaging Interface
 * Main messaging hub for brand-athlete negotiation
 */

import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Plus } from 'lucide-react';
import ConversationList from './ConversationList';
import ChatWindow from './ChatWindow';
import NewConversationModal from './NewConversationModal';

export default function MessagingInterface() {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newConvModalOpen, setNewConvModalOpen] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: conversations = [] } = useQuery({
    queryKey: ['conversations', user?.email],
    queryFn: () =>
      user?.email
        ? base44.entities.Conversation.filter({
            $or: [{ brand_email: user.email }, { athlete_email: user.email }],
          })
        : Promise.resolve([]),
    initialData: [],
    refetchInterval: 5000,
  });

  const userRole = user?.role === 'athlete' ? 'athlete' : 'brand';

  return (
    <div className="min-h-screen bg-cyber-void text-foreground p-6">
      <div className="cyber-grid" />
      <div className="cyber-scanlines" />
      <div className="cyber-vignette" />

      <div className="relative z-10 max-w-[1600px] mx-auto h-screen flex flex-col">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <p className="font-mono text-[10px] tracking-[7px] uppercase text-fire-3/40 mb-2">
            // DIRECT MESSAGING //
          </p>
          <h1 className="heading-fire text-[clamp(36px,6vw,72px)] leading-none font-black mb-4">
            SPONSORSHIP NEGOTIATIONS
          </h1>
          <div className="h-[2px] bg-gradient-to-r from-fire-3 via-fire-5 to-transparent" />
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden">
          {/* Conversation List */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="md:col-span-1 bg-gradient-to-br from-[rgba(10,4,18,0.98)] to-[rgba(4,2,8,1)] border border-fire-3/20 rounded-lg flex flex-col overflow-hidden"
          >
            <div className="p-4 border-b border-fire-3/20 flex items-center justify-between">
              <h2 className="font-orbitron font-bold text-lg text-fire-5 flex items-center gap-2">
                <MessageSquare size={20} />
                Conversations
              </h2>
              <button
                onClick={() => setNewConvModalOpen(true)}
                className="p-1.5 hover:bg-fire-3/10 rounded transition-all text-fire-3"
              >
                <Plus size={18} />
              </button>
            </div>

            <ConversationList
              conversations={conversations}
              selectedId={selectedConversation?.id}
              userRole={userRole}
              onSelect={setSelectedConversation}
            />
          </motion.div>

          {/* Chat Window */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="md:col-span-2 bg-gradient-to-br from-[rgba(10,4,18,0.98)] to-[rgba(4,2,8,1)] border border-fire-3/20 rounded-lg flex flex-col overflow-hidden"
          >
            {selectedConversation ? (
              <ChatWindow conversation={selectedConversation} userRole={userRole} user={user} />
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare size={48} className="text-fire-3/20 mx-auto mb-4" />
                  <p className="font-rajdhani text-sm text-fire-3/40">
                    Select a conversation or start a new one
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* New Conversation Modal */}
      <AnimatePresence>
        {newConvModalOpen && (
          <NewConversationModal
            onClose={() => setNewConvModalOpen(false)}
            onConversationCreated={(conv) => {
              setSelectedConversation(conv);
              setNewConvModalOpen(false);
            }}
            userRole={userRole}
          />
        )}
      </AnimatePresence>
    </div>
  );
}