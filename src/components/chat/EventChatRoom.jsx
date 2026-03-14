import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageCircle, Users, Pin, Trash2, AlertCircle, MessageSquare } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTranslation } from '../translations';

export default function EventChatRoom({ event, lang }) {
  const t = useTranslation(lang);
  const queryClient = useQueryClient();
  const [message, setMessage] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef(null);

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['chat-messages', event.id],
    queryFn: () => base44.entities.ChatMessage.filter(
      { event_id: event.id, is_deleted: false },
      '-timestamp',
      100
    ),
    enabled: event.status === 'live',
    initialData: [],
    refetchInterval: 2000,
  });

  const pinnedMessages = messages.filter(m => m.is_pinned).sort((a, b) => 
    new Date(b.timestamp) - new Date(a.timestamp)
  );

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (isExpanded && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isExpanded]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (event.status !== 'live') return;
    
    const unsubscribe = base44.entities.ChatMessage.subscribe((updateEvent) => {
      if (updateEvent.type === 'create') {
        queryClient.invalidateQueries({ queryKey: ['chat-messages', event.id] });
      }
    });

    return unsubscribe;
  }, [event.id, event.status, queryClient]);

  const sendMessage = useMutation({
    mutationFn: async ({ text, messageType = 'regular' }) => {
      const currentUser = await base44.auth.me();
      return base44.entities.ChatMessage.create({
        event_id: event.id,
        user_email: currentUser.email,
        user_name: currentUser.nickname || currentUser.full_name,
        user_role: currentUser.role || 'fan',
        message: text,
        message_type: messageType,
        timestamp: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages', event.id] });
      setMessage('');
    },
    onError: () => {
      toast.error('Failed to send message');
    }
  });

  const deleteMessage = useMutation({
    mutationFn: (msgId) => base44.entities.ChatMessage.update(msgId, { is_deleted: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages', event.id] });
      toast.success('Message deleted');
    }
  });

  const pinMessage = useMutation({
    mutationFn: (msgId) => base44.entities.ChatMessage.update(msgId, { is_pinned: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages', event.id] });
      toast.success('Message pinned');
    }
  });

  const unpinMessage = useMutation({
    mutationFn: (msgId) => base44.entities.ChatMessage.update(msgId, { is_pinned: false }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages', event.id] });
    }
  });

  const handleSend = (e, messageType = 'regular') => {
    e.preventDefault();
    const trimmed = message.trim();
    if (!trimmed || !user) return;
    if (trimmed.length > 500) {
      toast.error('Message too long (max 500 characters)');
      return;
    }
    sendMessage.mutate({ text: trimmed, messageType });
  };

  const isAdmin = user?.role === 'admin';

  if (event.status !== 'live') return null;

  // Get unique user count
  const uniqueUsers = new Set(messages.map(m => m.user_email)).size;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      {/* Chat Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-purple-500/10 to-cyan/10 border border-purple-500/20 hover:border-purple-500/40 transition-all"
      >
        <div className="flex items-center gap-3">
          <MessageCircle className="w-6 h-6 text-purple-400" />
          <h3 className="font-orbitron font-bold text-xl text-purple-400 tracking-[2px] uppercase">
            LIVE CHAT
          </h3>
          <div className="flex items-center gap-1.5 px-2 py-1 bg-purple-500/20 border border-purple-500/30 text-xs font-mono text-purple-300">
            <Users size={12} />
            {uniqueUsers}
          </div>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="text-purple-400"
        >
          ▼
        </motion.div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="bg-gradient-to-br from-purple-500/5 to-black border-l border-r border-b border-purple-500/20 p-4">
              {/* Pinned Messages */}
              {pinnedMessages.length > 0 && (
                <div className="mb-4 space-y-2 border-b border-purple-500/20 pb-3">
                  {pinnedMessages.map(msg => (
                    <div key={msg.id} className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                      <div className="flex items-start gap-2 mb-1">
                        <Pin size={14} className="text-yellow-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <span className="font-mono text-[9px] font-bold text-yellow-600">{msg.user_name}</span>
                          <p className="font-rajdhani text-xs text-yellow-700 mt-1">{msg.message}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Messages Container */}
              <div className="h-[300px] overflow-y-auto mb-4 space-y-2 pr-2 scrollbar-thin scrollbar-thumb-purple-500/30 scrollbar-track-transparent">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <MessageCircle className="w-12 h-12 text-purple-400/30 mb-3" />
                    <p className="font-mono text-sm text-purple-400/40 tracking-[1px]">
                      No messages yet. Start the conversation!
                    </p>
                  </div>
                ) : (
                  <>
                    {messages.slice().reverse().map((msg, i) => {
                      const isOwnMessage = user && msg.user_email === user.email;
                      return (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.02 }}
                          className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[80%] ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                            <div className="flex items-baseline gap-2 mb-1">
                              <span className={`font-mono text-[10px] font-bold tracking-[1px] ${
                                isOwnMessage ? 'text-cyan' : 'text-purple-400'
                              }`}>
                                {msg.user_name}
                              </span>
                              <span className="font-mono text-[9px] text-fire-3/30">
                                {new Date(msg.timestamp).toLocaleTimeString('en-US', { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </span>
                            </div>
                            <div className={`px-3 py-2 rounded-lg ${
                              isOwnMessage 
                                ? 'bg-cyan/10 border border-cyan/20 text-cyan/90' 
                                : 'bg-purple-500/10 border border-purple-500/20 text-fire-4/80'
                            }`}>
                              <p className="font-rajdhani text-sm leading-relaxed break-words">
                                {msg.message}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Message Input */}
              {user ? (
                <form onSubmit={handleSend} className="flex gap-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 cyber-input"
                    maxLength={500}
                    disabled={sendMessage.isPending}
                  />
                  <button
                    type="submit"
                    disabled={!message.trim() || sendMessage.isPending}
                    className="btn-fire text-[11px] py-2 px-5 flex items-center gap-2 disabled:opacity-30"
                  >
                    <Send size={14} />
                    {sendMessage.isPending ? 'Sending...' : 'Send'}
                  </button>
                </form>
              ) : (
                <div className="text-center py-4 bg-purple-500/5 border border-purple-500/20">
                  <p className="font-mono text-sm text-purple-400/60">
                    Sign in to join the chat
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}