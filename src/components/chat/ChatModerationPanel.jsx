import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { AlertCircle, MessageSquare, Users, TrendingUp, Send } from 'lucide-react';
import { toast } from 'sonner';

export default function ChatModerationPanel({ event }) {
  const queryClient = useQueryClient();
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [announcementType, setAnnouncementType] = useState('announcement');

  const { data: messages = [] } = useQuery({
    queryKey: ['event-chat-moderation', event.id],
    queryFn: () => base44.entities.ChatMessage.filter(
      { event_id: event.id },
      '-timestamp',
      100
    ),
    refetchInterval: 2000,
    initialData: [],
  });

  // Get chat statistics
  const uniqueUsers = new Set(messages.map(m => m.user_email)).size;
  const messageCount = messages.filter(m => !m.is_deleted).length;
  const pinnedCount = messages.filter(m => m.is_pinned).length;

  const broadcastMutation = useMutation({
    mutationFn: async () => {
      return base44.functions.invoke('broadcastEventAnnouncement', {
        event_id: event.id,
        message: broadcastMessage,
        message_type: announcementType,
      });
    },
    onSuccess: () => {
      toast.success('Announcement broadcast to all participants');
      setBroadcastMessage('');
      queryClient.invalidateQueries({ queryKey: ['event-chat-moderation', event.id] });
    },
    onError: (err) => {
      toast.error('Failed to broadcast: ' + err.message);
    }
  });

  const roleDistribution = {
    admin: messages.filter(m => m.user_role === 'admin').length,
    athlete: messages.filter(m => m.user_role === 'athlete').length,
    fan: messages.filter(m => m.user_role === 'fan').length,
  };

  return (
    <div className="space-y-6">
      {/* Chat Statistics */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Active Users', value: uniqueUsers, color: 'cyan' },
          { label: 'Messages', value: messageCount, color: 'fire-4' },
          { label: 'Pinned', value: pinnedCount, color: 'yellow-500' },
          { label: 'Engagement', value: `${Math.round((messageCount / (uniqueUsers || 1)).toFixed(1))}`, color: 'purple-400' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`bg-${stat.color}/5 border border-${stat.color}/20 p-4 rounded`}
          >
            <div className={`font-mono text-[10px] text-${stat.color}/60 uppercase tracking-[1px] mb-2`}>
              {stat.label}
            </div>
            <div className={`font-orbitron font-black text-2xl text-${stat.color}`}>
              {stat.value}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Role Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-purple-500/10 to-cyan/10 border border-purple-500/20 p-6 rounded-lg"
      >
        <h3 className="font-orbitron font-bold text-lg text-purple-400 mb-4 flex items-center gap-2">
          <Users size={20} />
          Participant Roles
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { role: 'admin', label: 'Admins', icon: '👤' },
            { role: 'athlete', label: 'Athletes', icon: '🏃' },
            { role: 'fan', label: 'Fans', icon: '👥' },
          ].map(({ role, label, icon }) => (
            <div key={role} className="bg-black/30 border border-purple-500/10 p-4 rounded">
              <div className="font-mono text-[9px] text-purple-400/60 uppercase mb-2">{icon} {label}</div>
              <div className="font-orbitron font-black text-xl text-purple-300">
                {roleDistribution[role]}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Broadcast Announcement */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 p-6 rounded-lg"
      >
        <h3 className="font-orbitron font-bold text-lg text-yellow-500 mb-4 flex items-center gap-2">
          <AlertCircle size={20} />
          Broadcast to All Viewers
        </h3>
        
        <div className="space-y-3 mb-4">
          <textarea
            value={broadcastMessage}
            onChange={(e) => setBroadcastMessage(e.target.value)}
            placeholder="Enter announcement message..."
            maxLength={300}
            rows={3}
            className="w-full cyber-input"
          />
          <div className="flex gap-3">
            {[
              { type: 'announcement', label: '📢 Announcement', color: 'yellow-500' },
              { type: 'answer', label: '✓ Answer', color: 'green-500' },
              { type: 'update', label: '🔄 Update', color: 'blue-500' },
            ].map(({ type, label, color }) => (
              <button
                key={type}
                onClick={() => setAnnouncementType(type)}
                className={`flex-1 text-xs font-orbitron px-3 py-2 rounded border transition-all ${
                  announcementType === type
                    ? `bg-${color}/20 border-${color} text-${color}`
                    : `bg-black/30 border-${color}/30 text-${color}/60`
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => broadcastMutation.mutate()}
          disabled={!broadcastMessage.trim() || broadcastMutation.isPending}
          className="w-full btn-fire py-2 px-4 text-[11px] font-bold flex items-center justify-center gap-2 disabled:opacity-30"
        >
          <Send size={14} />
          {broadcastMutation.isPending ? 'Broadcasting...' : 'Broadcast to All'}
        </button>
        <p className="font-mono text-[9px] text-yellow-500/50 mt-3 tracking-[1px]">
          Sends message to chat + notifies all participants via email
        </p>
      </motion.div>

      {/* Recent Messages */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-br from-fire-3/5 to-black border border-fire-3/20 p-6 rounded-lg"
      >
        <h3 className="font-orbitron font-bold text-lg text-fire-4 mb-4 flex items-center gap-2">
          <MessageSquare size={20} />
          Recent Messages
        </h3>
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {messages.slice(0, 20).map(msg => (
            <div
              key={msg.id}
              className={`p-3 rounded border text-xs font-rajdhani ${
                msg.is_deleted ? 'opacity-50 line-through' :
                msg.message_type === 'announcement' ? 'bg-yellow-500/10 border-yellow-500/20' :
                msg.message_type === 'answer' ? 'bg-green-500/10 border-green-500/20' :
                'bg-fire-3/5 border-fire-3/10'
              }`}
            >
              <div className="flex justify-between items-start gap-2 mb-1">
                <span className={`font-mono font-bold text-[9px] ${
                  msg.user_role === 'admin' ? 'text-red-400' : 'text-fire-3'
                }`}>
                  {msg.user_name}
                </span>
                <span className="text-fire-3/40">{new Date(msg.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <p className="text-fire-4/80">{msg.message}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}