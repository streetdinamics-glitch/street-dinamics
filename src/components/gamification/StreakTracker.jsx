import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';

export default function StreakTracker({ userEmail }) {
  const [streak, setStreak] = useState(0);
  const [lastCheckIn, setLastCheckIn] = useState(null);

  useEffect(() => {
    // Simulate streak calculation based on participation
    const today = new Date().toDateString();
    const storedCheckIn = localStorage.getItem(`streak-checkin-${userEmail}`);
    const storedStreak = localStorage.getItem(`streak-count-${userEmail}`) || '0';

    if (storedCheckIn !== today) {
      // New day, increment streak
      const newStreak = parseInt(storedStreak) + 1;
      setStreak(newStreak);
      localStorage.setItem(`streak-checkin-${userEmail}`, today);
      localStorage.setItem(`streak-count-${userEmail}`, newStreak.toString());
    } else {
      setStreak(parseInt(storedStreak));
    }
    setLastCheckIn(storedCheckIn);
  }, [userEmail]);

  const streakBonusMultiplier = Math.min(1 + (streak * 0.1), 3); // Max 3x multiplier at 20+ days

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-fire-5/15 via-fire-4/10 to-fire-3/15 border border-fire-5/30 p-8 relative overflow-hidden"
    >
      {/* Animated background */}
      <div className="absolute inset-0 opacity-30">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] bg-gradient-to-br from-fire-5/20 via-transparent to-fire-3/20"
        />
      </div>

      <div className="relative z-10 flex items-center justify-between flex-wrap gap-6">
        {/* Streak Display */}
        <div className="flex items-center gap-6">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-fire-5 to-fire-4 text-black"
          >
            <div className="text-center">
              <Flame size={32} className="mx-auto mb-1" />
              <div className="font-orbitron font-black text-2xl">{streak}</div>
            </div>
          </motion.div>

          <div>
            <div className="font-orbitron font-black text-3xl text-fire-5 mb-2">
              {streak} DAY STREAK
            </div>
            <div className="font-rajdhani text-sm text-fire-3/80 mb-3">
              Keep engaging to build your multiplier
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-fire-3/20 px-3 py-1 rounded border border-fire-3/40">
                <span className="font-mono text-xs text-fire-4">
                  {streakBonusMultiplier.toFixed(1)}x POINTS
                </span>
              </div>
              {streak > 0 && (
                <motion.div
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="text-fire-5 font-bold text-sm"
                >
                  ⚡ Active
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Milestones */}
        <div className="flex gap-2">
          {[7, 14, 21, 30].map((milestone, i) => (
            <motion.div
              key={milestone}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className={`flex flex-col items-center gap-1 px-4 py-3 rounded border ${
                streak >= milestone
                  ? 'bg-fire-5/20 border-fire-5/40'
                  : 'bg-fire-3/10 border-fire-3/20'
              }`}
            >
              <div className="font-orbitron font-bold text-sm text-fire-5">
                {milestone}
              </div>
              <div className="font-mono text-xs text-fire-3/60">DAYS</div>
              {streak >= milestone && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-yellow-400 text-xs mt-1"
                >
                  ✓
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}