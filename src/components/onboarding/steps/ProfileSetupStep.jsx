/**
 * Profile Setup Step
 * Basic athlete profile information
 */

import React from 'react';
import { motion } from 'framer-motion';

const SPORTS = [
  'Skateboarding',
  'BMX',
  'Parkour',
  'Climbing',
  'Snowboarding',
  'Surfing',
  'Motorsports',
  'Motorsports',
  'Other',
];

export default function ProfileSetupStep({ data, onChange }) {
  const handleSportToggle = (sport) => {
    const updated = data.sports.includes(sport)
      ? data.sports.filter((s) => s !== sport)
      : [...data.sports, sport];
    onChange({ ...data, sports: updated });
  };

  return (
    <div className="space-y-6">
      {/* Nickname */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <label className="block font-rajdhani font-bold text-fire-4 mb-2">
          Athlete Nickname *
        </label>
        <input
          type="text"
          value={data.nickname}
          onChange={(e) =>
            onChange({ ...data, nickname: e.target.value })
          }
          placeholder="Your public nickname (e.g., SkyRider, IceQueen)"
          className="w-full bg-fire-3/5 border border-fire-3/20 px-4 py-2 text-fire-4 placeholder-fire-3/30 font-rajdhani rounded focus:outline-none focus:border-fire-3/40"
        />
      </motion.div>

      {/* Bio */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <label className="block font-rajdhani font-bold text-fire-4 mb-2">
          Bio
        </label>
        <textarea
          value={data.bio}
          onChange={(e) => onChange({ ...data, bio: e.target.value })}
          placeholder="Tell us about yourself, your achievements, style..."
          rows={3}
          className="w-full bg-fire-3/5 border border-fire-3/20 px-4 py-2 text-fire-4 placeholder-fire-3/30 font-rajdhani rounded focus:outline-none focus:border-fire-3/40"
        />
      </motion.div>

      {/* Sports Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <label className="block font-rajdhani font-bold text-fire-4 mb-3">
          Your Sports *
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {SPORTS.map((sport) => (
            <button
              key={sport}
              onClick={() => handleSportToggle(sport)}
              className={`px-4 py-2 rounded border font-rajdhani text-sm transition-all ${
                data.sports.includes(sport)
                  ? 'bg-fire-3/20 border-fire-3/40 text-fire-5'
                  : 'bg-fire-3/5 border-fire-3/20 text-fire-4 hover:border-fire-3/40'
              }`}
            >
              {sport}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Location */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="grid grid-cols-2 gap-4"
      >
        <div>
          <label className="block font-rajdhani font-bold text-fire-4 mb-2">
            City
          </label>
          <input
            type="text"
            value={data.city}
            onChange={(e) => onChange({ ...data, city: e.target.value })}
            placeholder="Your city"
            className="w-full bg-fire-3/5 border border-fire-3/20 px-4 py-2 text-fire-4 placeholder-fire-3/30 font-rajdhani rounded focus:outline-none focus:border-fire-3/40"
          />
        </div>
        <div>
          <label className="block font-rajdhani font-bold text-fire-4 mb-2">
            Country
          </label>
          <input
            type="text"
            value={data.country}
            onChange={(e) =>
              onChange({ ...data, country: e.target.value })
            }
            placeholder="Your country"
            className="w-full bg-fire-3/5 border border-fire-3/20 px-4 py-2 text-fire-4 placeholder-fire-3/30 font-rajdhani rounded focus:outline-none focus:border-fire-3/40"
          />
        </div>
      </motion.div>

      {/* Team Name */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <label className="block font-rajdhani font-bold text-fire-4 mb-2">
          Team Name (Optional)
        </label>
        <input
          type="text"
          value={data.team_name}
          onChange={(e) =>
            onChange({ ...data, team_name: e.target.value })
          }
          placeholder="Your team or crew name"
          className="w-full bg-fire-3/5 border border-fire-3/20 px-4 py-2 text-fire-4 placeholder-fire-3/30 font-rajdhani rounded focus:outline-none focus:border-fire-3/40"
        />
      </motion.div>
    </div>
  );
}