import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Smile, Flame, Heart, Zap, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import ChatMessage from './ChatMessage';
import EmojiReactionBar from './EmojiReactionBar';

export default function LiveEventChat({ eventId, eventTitle }) {
  const queryClient = useQueryClient();
  const scrollRef = useRef(null);
  const [messageInput, setMessageInput] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);

  // Get current user
  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  // Fetch chat messages
  const { data: messages = [] } = useQuery({
    queryKey: ['event-chat', eventId],
    queryFn: () => base44.entities.ChatMessage.filter({ event_id: eventId }, '-created_date', 100),
    refetchInterval: 2000, // Real-time polling
  });

  // Send message mutation
  const sendMessage = useMutation({
    mutationFn: async (content) => {
      return base44.entities.ChatMessage.create({
        event_id: eventId,
        user_email: user.email,
        user_name: user.full_name,
        user_role: user.role || 'fan',
        message: content,
        message_type: 'regular',
        timestamp: new Date().toISOString(),
        parent_message_id: replyingTo?.id || null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-chat', eventId] });
      setMessageInput('');
      setReplyingTo(null);
      setShowEmojiPicker(false);
    },
    onError: () => {
      toast.error('Failed to send message');
    },
  });

  // Pin message mutation (admin only)
  const pinMessage = useMutation({
    mutationFn: (messageId) => 
      base44.entities.ChatMessage.update(messageId, { is_pinned: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-chat', eventId] });
    },
  });

  // Delete message mutation
  const deleteMessage = useMutation({
    mutationFn: (messageId) =>
      base44.entities.ChatMessage.update(messageId, { is_deleted: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-chat', eventId] });
    },
  });

  // Auto-scroll to latest message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim()) return;
    sendMessage.mutate(messageInput.trim());
  };

  const handleAddEmoji = (emoji) => {
    setMessageInput(messageInput + emoji);
  };

  // Separate pinned and regular messages
  const pinnedMessages = messages.filter(m => m.is_pinned && !m.is_deleted);
  const regularMessages = messages.filter(m => !m.is_pinned && !m.is_deleted);
  const announcementMessages = messages.filter(m => m.message_type === 'announcement' && !m.is_deleted);

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-[rgba(10,4,18,0.99)] to-[rgba(4,2,8,1)] border border-fire-3/20 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-fire-3/10 bg-fire-3/5">
        <div className="flex items-center gap-2">
          <MessageSquare size={16} className="text-fire-3" />
          <h3 className="font-orbitron font-bold text-fire-4">{eventTitle}</h3>
          <span className="ml-auto font-mono text-[9px] text-fire-3/60">
            {messages.length} messages
          </span>
        </div>
      </div>

      {/* Announcements */}
      <AnimatePresence>
        {announcementMessages.map((announcement) => (
          <motion.div
            key={announcement.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="px-4 py-2 bg-cyan/10 border-b border-cyan/20"
          >
            <div className="font-mono text-[10px] text-cyan/60 mb-1">📢 ANNOUNCEMENT</div>
            <p className="text-sm text-cyan font-rajdhani">{announcement.message}</p>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Pinned Messages */}
      {pinnedMessages.length > 0 && (
        <div className="px-4 py-2 bg-fire-5/10 border-b border-fire-5/20">
          <div className="font-mono text-[9px] text-fire-4/70 tracking-[1px] uppercase mb-2">📌 Pinned</div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {pinnedMessages.map((msg) => (
              <div key={msg.id} className="flex-shrink-0 px-3 py-1 bg-fire-5/20 border border-fire-5/30 rounded text-xs font-rajdhani text-fire-4/80 whitespace-nowrap">
                <strong>{msg.user_name}:</strong> {msg.message.substring(0, 40)}...
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Messages Container */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-2 p-4">
        {regularMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center">
            <div>
              <MessageSquare size={32} className="text-fire-3/20 mx-auto mb-2" />
              <p className="font-mono text-sm text-fire-3/30">No messages yet. Start the conversation!</p>
            </div>
          </div>
        ) : (
          regularMessages.map((msg) => (
            <ChatMessage
              key={msg.id}
              message={msg}
              currentUserRole={user?.role}
              onReply={() => setReplyingTo(msg)}
              onPin={() => user?.role === 'admin' && pinMessage.mutate(msg.id)}
              onDelete={() => deleteMessage.mutate(msg.id)}
            />
          ))
        )}
      </div>

      {/* Reply Preview */}
      {replyingTo && (
        <div className="px-4 py-2 bg-fire-3/10 border-t border-fire-3/20 flex items-center justify-between">
          <div className="flex-1">
            <p className="font-mono text-[9px] text-fire-3/60 mb-1">Replying to {replyingTo.user_name}</p>
            <p className="text-sm text-fire-4/80 truncate">{replyingTo.message}</p>
          </div>
          <button
            onClick={() => setReplyingTo(null)}
            className="ml-2 px-2 py-1 text-xs border border-fire-3/20 hover:border-fire-3/40 text-fire-3/60 hover:text-fire-3"
          >
            ✕
          </button>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t border-fire-3/10 bg-fire-3/5">
        <form onSubmit={handleSendMessage} className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Chat with the community..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              maxLength={200}
              className="cyber-input flex-1 text-sm"
            />
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-2 border border-fire-3/20 hover:border-fire-3/40 text-fire-3/60 hover:text-fire-3 transition-all"
              >
                <Smile size={18} />
              </button>
              {showEmojiPicker && (
                <EmojiReactionBar
                  onSelect={handleAddEmoji}
                  position="top-right"
                />
              )}
            </div>
            <button
              type="submit"
              disabled={!messageInput.trim() || sendMessage.isPending}
              className="p-2 bg-fire-3 text-black hover:bg-fire-5 disabled:opacity-50 transition-all"
            >
              <Send size={18} />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <p className="font-mono text-[8px] text-fire-3/40">{messageInput.length}/200</p>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => handleAddEmoji('🔥')}
                className="px-2 py-1 text-xs bg-fire-3/10 hover:bg-fire-3/20 border border-fire-3/20 rounded transition-all"
              >
                🔥
              </button>
              <button
                type="button"
                onClick={() => handleAddEmoji('❤️')}
                className="px-2 py-1 text-xs bg-fire-3/10 hover:bg-fire-3/20 border border-fire-3/20 rounded transition-all"
              >
                ❤️
              </button>
              <button
                type="button"
                onClick={() => handleAddEmoji('⚡')}
                className="px-2 py-1 text-xs bg-fire-3/10 hover:bg-fire-3/20 border border-fire-3/20 rounded transition-all"
              >
                ⚡
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}