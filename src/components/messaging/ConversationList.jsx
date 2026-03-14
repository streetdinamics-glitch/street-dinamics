/**
 * Conversation List
 * Shows all conversations with last message preview
 */

import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Zap } from 'lucide-react';

export default function ConversationList({ conversations, selectedId, userRole, onSelect }) {
  const sorted = conversations
    .filter(c => c.status === 'active')
    .sort((a, b) => new Date(b.last_message_at || 0) - new Date(a.last_message_at || 0));

  if (sorted.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center">
          <MessageCircle size={32} className="text-fire-3/20 mx-auto mb-2" />
          <p className="font-mono text-xs text-fire-3/40">No conversations yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto space-y-1 p-2">
      {sorted.map((conv, idx) => {
        const unreadCount =
          userRole === 'brand' ? conv.unread_count_brand : conv.unread_count_athlete;
        const otherParty = userRole === 'brand' ? conv.athlete_email : conv.brand_email;

        return (
          <motion.button
            key={conv.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => onSelect(conv)}
            className={`w-full text-left p-3 rounded transition-all border ${
              selectedId === conv.id
                ? 'border-fire-3 bg-fire-3/20'
                : 'border-fire-3/10 hover:border-fire-3/20 hover:bg-fire-3/5'
            }`}
          >
            <div className="flex items-start justify-between mb-1">
              <h4 className="font-rajdhani font-bold text-fire-4 text-sm truncate">
                {conv.subject}
              </h4>
              {unreadCount > 0 && (
                <span className="flex items-center justify-center w-5 h-5 bg-green-500 text-black text-xs font-bold rounded-full flex-shrink-0 ml-2">
                  {unreadCount}
                </span>
              )}
            </div>
            <p className="font-mono text-xs text-fire-3/60 mb-2 truncate">
              {otherParty}
            </p>
            <p className="font-rajdhani text-xs text-fire-4/70 line-clamp-2">
              {conv.last_message}
            </p>
            <p className="font-mono text-xs text-fire-3/40 mt-2">
              {conv.last_message_at
                ? new Date(conv.last_message_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'Just now'}
            </p>
          </motion.button>
        );
      })}
    </div>
  );
}