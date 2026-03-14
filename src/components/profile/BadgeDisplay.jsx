import React from 'react';
import { motion } from 'framer-motion';
import { Award, Trophy, Star, Zap, Target, TrendingUp, Crown, Medal } from 'lucide-react';

const BADGE_CONFIG = {
  rookie: {
    name: 'Rookie',
    icon: Star,
    color: 'text-fire-3',
    bgColor: 'bg-fire-3/10',
    borderColor: 'border-fire-3/30',
    description: 'First event participation'
  },
  veteran: {
    name: 'Veteran',
    icon: Award,
    color: 'text-cyan',
    bgColor: 'bg-cyan/10',
    borderColor: 'border-cyan/30',
    description: '10+ events completed'
  },
  champion: {
    name: 'Champion',
    icon: Trophy,
    color: 'text-fire-5',
    bgColor: 'bg-fire-5/10',
    borderColor: 'border-fire-5/40',
    description: 'Multiple wins'
  },
  legend: {
    name: 'Legend',
    icon: Crown,
    color: 'text-purple-400',
    bgColor: 'bg-purple-400/10',
    borderColor: 'border-purple-400/40',
    description: 'Elite status achieved'
  },
  first_event: {
    name: 'First Step',
    icon: Star,
    color: 'text-fire-4',
    bgColor: 'bg-fire-4/10',
    borderColor: 'border-fire-4/30',
    description: 'Completed first event'
  },
  five_events: {
    name: 'Regular',
    icon: Target,
    color: 'text-cyan',
    bgColor: 'bg-cyan/10',
    borderColor: 'border-cyan/30',
    description: '5 events milestone'
  },
  ten_events: {
    name: 'Dedicated',
    icon: Zap,
    color: 'text-fire-5',
    bgColor: 'bg-fire-5/10',
    borderColor: 'border-fire-5/30',
    description: '10 events milestone'
  },
  podium_finisher: {
    name: 'Podium',
    icon: Medal,
    color: 'text-fire-4',
    bgColor: 'bg-fire-4/10',
    borderColor: 'border-fire-4/30',
    description: 'Top 3 finish'
  },
  winner: {
    name: 'Winner',
    icon: Trophy,
    color: 'text-fire-5',
    bgColor: 'bg-fire-5/10',
    borderColor: 'border-fire-5/40',
    description: '1st place victory'
  },
  crowd_favorite: {
    name: 'Crowd Favorite',
    icon: Star,
    color: 'text-cyan',
    bgColor: 'bg-cyan/10',
    borderColor: 'border-cyan/30',
    description: 'High fan engagement'
  },
  rising_star: {
    name: 'Rising Star',
    icon: TrendingUp,
    color: 'text-fire-3',
    bgColor: 'bg-fire-3/10',
    borderColor: 'border-fire-3/30',
    description: 'Rapid improvement'
  },
  consistent_performer: {
    name: 'Consistent',
    icon: Target,
    color: 'text-cyan',
    bgColor: 'bg-cyan/10',
    borderColor: 'border-cyan/30',
    description: 'Reliable performance'
  }
};

export default function BadgeDisplay({ badges }) {
  if (!badges || badges.length === 0) {
    return (
      <div className="text-center py-8">
        <Award className="w-12 h-12 text-fire-3/20 mx-auto mb-2" />
        <p className="font-mono text-xs text-fire-3/40 tracking-[1px]">
          No badges earned yet
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {badges.map((badge, index) => {
        const config = BADGE_CONFIG[badge.badge_type] || BADGE_CONFIG.rookie;
        const Icon = config.icon;

        return (
          <motion.div
            key={badge.id}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`relative p-4 ${config.bgColor} border ${config.borderColor} clip-cyber group hover:scale-105 transition-transform cursor-pointer`}
          >
            <div className="text-center">
              <div className={`w-12 h-12 mx-auto mb-2 rounded-full ${config.bgColor} border-2 ${config.borderColor} flex items-center justify-center`}>
                <Icon className={`w-6 h-6 ${config.color}`} />
              </div>
              <h4 className={`font-orbitron font-bold text-xs ${config.color} mb-1 tracking-[1px]`}>
                {badge.badge_name || config.name}
              </h4>
              <p className="font-mono text-[9px] text-fire-3/40 tracking-[0.5px]">
                {badge.badge_description || config.description}
              </p>
              {badge.earned_date && (
                <p className="font-mono text-[8px] text-fire-3/30 mt-1">
                  {new Date(badge.earned_date).toLocaleDateString()}
                </p>
              )}
            </div>

            {/* Rarity indicator */}
            {badge.rarity && badge.rarity !== 'common' && (
              <div className={`absolute top-1 right-1 w-2 h-2 rounded-full ${
                badge.rarity === 'legendary' ? 'bg-purple-400' :
                badge.rarity === 'epic' ? 'bg-fire-5' :
                'bg-cyan'
              }`} />
            )}

            {/* Hover glow effect */}
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-gradient-to-b from-${config.color}/10 to-transparent`} />
          </motion.div>
        );
      })}
    </div>
  );
}