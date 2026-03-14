import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

export default function ChallengeCard({ challenge, completed, onComplete, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`bg-gradient-to-br ${challenge.color} border ${challenge.borderColor} ${completed ? 'opacity-60' : ''} p-5 relative overflow-hidden group cursor-pointer transition-all hover:border-opacity-100`}
      onClick={onComplete}
    >
      {/* Glow effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-fire-5/10 to-transparent" />

      <div className="relative z-10 space-y-3">
        {/* Icon */}
        <div className="flex items-center justify-between">
          <div className="text-fire-5/70 group-hover:text-fire-5 transition-colors">
            {challenge.icon}
          </div>
          {completed && (
            <div className="bg-green-500/20 border border-green-500/40 p-1 rounded">
              <Check size={16} className="text-green-400" />
            </div>
          )}
        </div>

        {/* Content */}
        <div>
          <div className="font-orbitron font-bold text-fire-4 text-sm">
            {challenge.title}
          </div>
          <div className="font-rajdhani text-xs text-fire-3/60 mt-1">
            {challenge.description}
          </div>
        </div>

        {/* Points */}
        <div className="flex items-center gap-1 pt-2 border-t border-fire-3/20">
          <span className="text-fire-5 font-orbitron font-bold text-lg">
            +{challenge.points}
          </span>
          <span className="font-mono text-xs text-fire-3/40">PTS</span>
        </div>
      </div>

      {/* Completion animation */}
      {completed && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-transparent pointer-events-none"
        />
      )}
    </motion.div>
  );
}