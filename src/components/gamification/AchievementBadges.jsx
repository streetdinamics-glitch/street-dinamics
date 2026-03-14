import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Zap, Heart, Target, Crown } from 'lucide-react';

const achievementDefinitions = {
  'first-vote': {
    icon: <Target size={24} />,
    title: 'First Blood',
    description: 'Cast your first vote',
    color: 'from-cyan/20 to-cyan/10',
    borderColor: 'border-cyan/30',
    textColor: 'text-cyan'
  },
  'vote-master': {
    icon: <Zap size={24} />,
    title: 'Vote Master',
    description: 'Cast 50 votes',
    color: 'from-fire-5/20 to-fire-5/10',
    borderColor: 'border-fire-5/30',
    textColor: 'text-fire-5'
  },
  'chat-convo': {
    icon: <Heart size={24} />,
    title: 'Social Butterfly',
    description: 'Post 20 messages',
    color: 'from-purple/20 to-purple/10',
    borderColor: 'border-purple/30',
    textColor: 'text-purple-400'
  },
  'prediction-streak': {
    icon: <Star size={24} />,
    title: 'Prediction Streak',
    description: '5 correct predictions',
    color: 'from-fire-4/20 to-fire-4/10',
    borderColor: 'border-fire-4/30',
    textColor: 'text-fire-4'
  },
  'legendary': {
    icon: <Crown size={24} />,
    title: 'Legend',
    description: 'Complete all challenges',
    color: 'from-fire-5/25 to-fire-4/15',
    borderColor: 'border-fire-5/40',
    textColor: 'text-fire-5'
  }
};

export default function AchievementBadges({ achievements = [] }) {
  const [hoveredBadge, setHoveredBadge] = useState(null);

  const allAchievements = Object.entries(achievementDefinitions).map(([key, def]) => ({
    id: key,
    ...def,
    unlocked: achievements.some(a => a.id === key)
  }));

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
      {allAchievements.map((achievement, i) => (
        <motion.div
          key={achievement.id}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.05 }}
          onHoverStart={() => setHoveredBadge(achievement.id)}
          onHoverEnd={() => setHoveredBadge(null)}
          className={`relative group`}
        >
          <div
            className={`bg-gradient-to-br ${achievement.color} border ${achievement.borderColor} p-4 text-center transition-all ${
              achievement.unlocked ? 'cursor-pointer' : 'opacity-40'
            }`}
          >
            {/* Icon */}
            <div className={`flex justify-center mb-2 ${achievement.textColor} ${achievement.unlocked ? '' : 'opacity-50'}`}>
              {achievement.icon}
            </div>

            {/* Title */}
            <div className={`font-orbitron font-bold text-xs mb-1 ${achievement.textColor}`}>
              {achievement.title}
            </div>

            {/* Badge */}
            {achievement.unlocked && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 border-2 border-green-300 rounded-full flex items-center justify-center text-white text-xs font-bold"
              >
                ✓
              </motion.div>
            )}
          </div>

          {/* Tooltip */}
          {hoveredBadge === achievement.id && achievement.unlocked && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-black/90 border border-fire-3/40 px-3 py-2 rounded text-xs text-fire-4 whitespace-nowrap z-50 pointer-events-none"
            >
              {achievement.description}
            </motion.div>
          )}
        </motion.div>
      ))}
    </div>
  );
}