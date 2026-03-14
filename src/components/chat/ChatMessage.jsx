import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Pin, Trash2, MoreVertical } from 'lucide-react';
import { format } from 'date-fns';

export default function ChatMessage({ message, currentUserRole, onReply, onPin, onDelete }) {
  const [showMenu, setShowMenu] = useState(false);

  const roleStyles = {
    admin: 'bg-gradient-to-r from-purple-500/20 to-purple-500/10 border-l-2 border-purple-500',
    athlete: 'bg-gradient-to-r from-cyan/20 to-cyan/10 border-l-2 border-cyan',
    fan: 'bg-gradient-to-r from-fire-3/20 to-fire-3/10 border-l-2 border-fire-3',
  };

  const roleBadges = {
    admin: { text: 'ADMIN', color: 'text-purple-400 bg-purple-500/20' },
    athlete: { text: '⭐ ATHLETE', color: 'text-cyan bg-cyan/20' },
    fan: { text: 'FAN', color: 'text-fire-4 bg-fire-3/20' },
  };

  const badge = roleBadges[message.user_role] || roleBadges.fan;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-3 rounded border ${roleStyles[message.user_role] || roleStyles.fan} group relative`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-orbitron font-bold text-sm text-fire-4">{message.user_name}</span>
            <span className={`px-1.5 py-0.5 text-[8px] font-mono tracking-[1px] uppercase border rounded ${badge.color}`}>
              {badge.text}
            </span>
          </div>
          <p className="font-mono text-[9px] text-fire-3/50 mt-0.5">
            {format(new Date(message.timestamp), 'HH:mm')}
          </p>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-fire-3/20 rounded"
          >
            <MoreVertical size={14} className="text-fire-3/60" />
          </button>
          {showMenu && (
            <div className="absolute right-0 mt-1 bg-[rgba(4,2,8,0.95)] border border-fire-3/30 rounded shadow-lg z-50">
              <button
                onClick={() => {
                  onReply();
                  setShowMenu(false);
                }}
                className="block w-full text-left px-3 py-2 text-xs text-fire-4 hover:bg-fire-3/20 whitespace-nowrap"
              >
                Reply
              </button>
              {currentUserRole === 'admin' && (
                <button
                  onClick={() => {
                    onPin();
                    setShowMenu(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-xs text-cyan hover:bg-cyan/20 flex items-center gap-2 whitespace-nowrap"
                >
                  <Pin size={12} /> Pin
                </button>
              )}
              {currentUserRole === 'admin' && (
                <button
                  onClick={() => {
                    onDelete();
                    setShowMenu(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-xs text-red-400 hover:bg-red-500/20 flex items-center gap-2 whitespace-nowrap"
                >
                  <Trash2 size={12} /> Delete
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <p className="text-sm text-fire-3/90 font-rajdhani leading-relaxed">{message.message}</p>

      {message.parent_message_id && (
        <div className="mt-2 pt-2 border-t border-fire-3/20 text-[11px] text-fire-3/60 italic">
          ↩ Replying to thread
        </div>
      )}
    </motion.div>
  );
}