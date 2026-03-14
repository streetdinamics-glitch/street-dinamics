/**
 * Social Media Step
 * Link social accounts and calculate reach
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Instagram, Youtube, Twitter, Zap } from 'lucide-react';
import { toast } from 'sonner';

const SOCIAL_PLATFORMS = [
  {
    id: 'instagram',
    name: 'Instagram',
    icon: Instagram,
    placeholder: 'username',
    color: 'from-pink-500 to-orange-500',
  },
  {
    id: 'youtube',
    name: 'YouTube',
    icon: Youtube,
    placeholder: '@channel',
    color: 'from-red-500 to-red-600',
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    icon: Zap,
    placeholder: '@username',
    color: 'from-cyan-500 to-purple-500',
  },
  {
    id: 'twitter',
    name: 'Twitter',
    icon: Twitter,
    placeholder: '@username',
    color: 'from-blue-400 to-blue-500',
  },
];

export default function SocialMediaStep({ data, onChange, userEmail }) {
  const [calculating, setCalculating] = useState(false);

  const handleSocialChange = (platform, value) => {
    onChange({ ...data, [platform]: value });
  };

  const calculateReach = async () => {
    setCalculating(true);
    try {
      // Simulate API calls to get follower counts
      let totalReach = 0;

      if (data.instagram) {
        // Mock follower count (in real app, use Instagram Graph API)
        totalReach += Math.floor(Math.random() * 50000) + 5000;
      }

      if (data.youtube) {
        // Mock subscriber count
        totalReach += Math.floor(Math.random() * 100000) + 10000;
      }

      if (data.tiktok) {
        // Mock follower count
        totalReach += Math.floor(Math.random() * 500000) + 50000;
      }

      if (data.twitter) {
        // Mock follower count
        totalReach += Math.floor(Math.random() * 100000) + 5000;
      }

      onChange({ ...data, calculatedReach: totalReach });
      toast.success(`Reach calculated: ${totalReach.toLocaleString()} followers!`);
    } catch (error) {
      toast.error('Failed to calculate reach: ' + error.message);
    } finally {
      setCalculating(false);
    }
  };

  const hasLinked = data.instagram || data.youtube || data.tiktok || data.twitter;

  return (
    <div className="space-y-6">
      <div className="bg-fire-3/5 border border-fire-3/20 p-4 rounded-lg">
        <p className="font-rajdhani text-fire-4/70 text-sm">
          Link your social media accounts to calculate your reach and increase appeal to sponsors.
        </p>
      </div>

      {/* Social Platforms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SOCIAL_PLATFORMS.map((platform, idx) => {
          const Icon = platform.icon;
          const value = data[platform.id] || '';

          return (
            <motion.div
              key={platform.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <label className="block font-rajdhani font-bold text-fire-4 mb-2 flex items-center gap-2">
                <Icon size={18} className={`text-${platform.color.split(' ')[0]}`} />
                {platform.name}
              </label>
              <input
                type="text"
                value={value}
                onChange={(e) => handleSocialChange(platform.id, e.target.value)}
                placeholder={platform.placeholder}
                className="w-full bg-fire-3/5 border border-fire-3/20 px-4 py-2 text-fire-4 placeholder-fire-3/30 font-rajdhani rounded focus:outline-none focus:border-fire-3/40"
              />
            </motion.div>
          );
        })}
      </div>

      {/* Reach Calculation */}
      {hasLinked && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <button
            onClick={calculateReach}
            disabled={calculating}
            className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white font-orbitron font-bold py-3 rounded hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {calculating ? 'CALCULATING...' : 'CALCULATE REACH'}
            {!calculating && <Zap size={18} />}
          </button>

          {data.calculatedReach > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-r from-purple-500/10 to-purple-500/5 border border-purple-500/30 p-4 rounded-lg text-center"
            >
              <p className="font-mono text-xs text-purple-400 uppercase tracking-[1px] mb-1">
                Calculated Reach
              </p>
              <p className="font-orbitron font-black text-3xl text-purple-300">
                {data.calculatedReach.toLocaleString()}
              </p>
              <p className="font-rajdhani text-xs text-purple-400/60 mt-2">
                Followers across all platforms
              </p>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
}