import React from 'react';
import { motion } from 'framer-motion';

export default function EmojiReactionBar({ onSelect, position = 'top-right' }) {
  const emojis = ['🔥', '❤️', '⚡', '👏', '🎉', '😂', '💯', '👍', '🚀', '✨'];

  const positionClass = {
    'top-right': 'absolute bottom-12 right-0',
    'top-left': 'absolute bottom-12 left-0',
  }[position];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 10 }}
      className={`${positionClass} bg-[rgba(4,2,8,0.98)] border border-fire-3/30 rounded-lg p-3 z-[100] shadow-xl`}
    >
      <div className="grid grid-cols-5 gap-2">
        {emojis.map((emoji, i) => (
          <motion.button
            key={emoji}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => onSelect(emoji)}
            whileHover={{ scale: 1.3 }}
            className="text-xl hover:bg-fire-3/20 p-1 rounded transition-all"
          >
            {emoji}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}