/**
 * Chat Window
 * Real-time messaging interface for negotiation
 */

import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MoreVertical, Archive, X } from 'lucide-react';
import { toast } from 'sonner';

export default function ChatWindow({ conversation, userRole, user }) {
  const [messageText, setMessageText] = useState('');
  const [messageType, setMessageType] = useState('text');
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: messages = [] } = useQuery({
    queryKey: ['messages', conversation.id],
    queryFn: () => base44.entities.Message.filter({ conversation_id: conversation.id }),
    initialData: [],
    refetchInterval: 2000,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content) => {
      const message = await base44.entities.Message.create({
        conversation_id: conversation.id,
        sender_email: user.email,
        sender_name: user.full_name,
        sender_type: userRole,
        content,
        message_type: messageType,
        created_at: new Date().toISOString(),
      });

      // Update conversation
      await base44.entities.Conversation.update(conversation.id, {
        last_message: content.substring(0, 100),
        last_message_at: new Date().toISOString(),
        unread_count_brand: userRole === 'athlete' ? conversation.unread_count_brand + 1 : 0,
        unread_count_athlete: userRole === 'brand' ? conversation.unread_count_athlete + 1 : 0,
      });

      return message;
    },
    onSuccess: () => {
      setMessageText('');
      setMessageType('text');
      queryClient.invalidateQueries({ queryKey: ['messages', conversation.id] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      scrollToBottom();
    },
    onError: () => {
      toast.error('Failed to send message');
    },
  });

  // Real-time subscription
  useEffect(() => {
    const unsubscribe = base44.entities.Message.subscribe((event) => {
      if (event.data?.conversation_id === conversation.id) {
        queryClient.invalidateQueries({ queryKey: ['messages', conversation.id] });
        scrollToBottom();
      }
    });

    return unsubscribe;
  }, [conversation.id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    sendMessageMutation.mutate(messageText);
  };

  const messageTypeEmoji = {
    text: '💬',
    term_proposal: '📋',
    deliverable_update: '✅',
    logistics_note: '📍',
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-fire-3/20 flex items-center justify-between">
        <div>
          <h2 className="font-orbitron font-bold text-lg text-fire-5">
            {conversation.subject}
          </h2>
          <p className="font-mono text-xs text-fire-3/60 mt-1">
            {userRole === 'brand' ? conversation.athlete_email : conversation.brand_email}
          </p>
        </div>
        <button className="p-2 hover:bg-fire-3/10 rounded transition-all text-fire-3/60 hover:text-fire-3">
          <MoreVertical size={18} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <AnimatePresence>
          {messages.map((msg, idx) => {
            const isOwn = msg.sender_email === user.email;
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md xl:max-w-lg ${
                    isOwn
                      ? 'bg-fire-3/20 border border-fire-3/40 text-fire-4'
                      : 'bg-black/40 border border-fire-3/10 text-fire-4/70'
                  } rounded-lg p-3`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span>{messageTypeEmoji[msg.message_type] || '💬'}</span>
                    <p className="font-rajdhani font-bold text-xs text-fire-3/60">
                      {msg.sender_name}
                    </p>
                  </div>
                  <p className="font-rajdhani text-sm break-words">{msg.content}</p>
                  <p className="font-mono text-xs text-fire-3/40 mt-2">
                    {new Date(msg.created_at).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-fire-3/20 space-y-3">
        <div className="flex gap-2">
          {['text', 'term_proposal', 'deliverable_update', 'logistics_note'].map((type) => (
            <button
              key={type}
              onClick={() => setMessageType(type)}
              className={`px-3 py-1 rounded text-xs font-mono uppercase tracking-[1px] border transition-all ${
                messageType === type
                  ? 'border-fire-3 bg-fire-3/20 text-fire-5'
                  : 'border-fire-3/20 bg-fire-3/5 text-fire-3/60 hover:border-fire-3/40'
              }`}
            >
              {type.replace('_', ' ')}
            </button>
          ))}
        </div>

        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-fire-3/5 border border-fire-3/20 px-4 py-2 text-fire-4 placeholder-fire-3/30 font-rajdhani rounded focus:outline-none focus:border-fire-3/40"
          />
          <button
            type="submit"
            disabled={!messageText.trim() || sendMessageMutation.isPending}
            className="bg-gradient-to-r from-fire-3 to-fire-4 text-black font-orbitron font-bold py-2 px-4 rounded hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            <Send size={16} />
            SEND
          </button>
        </form>
      </div>
    </div>
  );
}