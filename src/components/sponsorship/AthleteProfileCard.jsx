/**
 * Athlete Profile Card for Brand Dashboard
 * Shows athlete stats and sponsorship proposal button
 */

import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Users, Trophy, TrendingUp } from 'lucide-react';

export default function AthleteProfileCard({ athlete, stats, onPropose }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-gradient-to-br from-[rgba(10,4,18,0.98)] to-[rgba(4,2,8,1)] border border-fire-3/20 rounded-lg overflow-hidden hover:border-fire-3/40 transition-all"
    >
      {/* Avatar Section */}
      <div className="h-40 bg-gradient-to-br from-fire-3/20 to-fire-3/5 border-b border-fire-3/20 flex items-center justify-center overflow-hidden">
        {athlete.photo_url ? (
          <img src={athlete.photo_url} alt={athlete.full_name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-24 h-24 rounded-full bg-fire-3/10 border border-fire-3/30 flex items-center justify-center">
            <span className="font-orbitron text-3xl font-black text-fire-4">
              {athlete.full_name.charAt(0)}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        {/* Name & Bio */}
        <div>
          <h3 className="font-orbitron font-bold text-lg text-fire-5 mb-1">
            {athlete.nickname || athlete.full_name}
          </h3>
          <p className="font-rajdhani text-xs text-fire-3/60">
            {(athlete.athlete_profile?.sports || []).join(', ') || 'Athlete'}
          </p>
          {athlete.bio && (
            <p className="font-rajdhani text-sm text-fire-4/70 mt-2 line-clamp-2">
              {athlete.bio}
            </p>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2 bg-fire-3/5 p-3 rounded">
          <div>
            <div className="flex items-center gap-1 mb-1">
              <Users size={12} className="text-cyan" />
              <span className="font-mono text-xs text-fire-3/60">Followers</span>
            </div>
            <div className="font-orbitron font-bold text-fire-4">
              {stats?.fan_count || 0}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1 mb-1">
              <Trophy size={12} className="text-fire-4" />
              <span className="font-mono text-xs text-fire-3/60">Events</span>
            </div>
            <div className="font-orbitron font-bold text-fire-4">
              {stats?.events_participated || 0}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1 mb-1">
              <TrendingUp size={12} className="text-green-400" />
              <span className="font-mono text-xs text-fire-3/60">Win Rate</span>
            </div>
            <div className="font-orbitron font-bold text-green-400">
              {stats?.events_participated ? ((stats.wins / stats.events_participated) * 100).toFixed(0) : 0}%
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1 mb-1">
              <TrendingUp size={12} className="text-purple-400" />
              <span className="font-mono text-xs text-fire-3/60">Rating</span>
            </div>
            <div className="font-orbitron font-bold text-purple-400">
              {stats?.performance_rating || 0}
            </div>
          </div>
        </div>

        {/* Social Links */}
        {(athlete.instagram || athlete.youtube || athlete.twitter) && (
          <div className="flex gap-2 text-fire-3/60">
            {athlete.instagram && (
              <a
                href={`https://instagram.com/${athlete.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-fire-3 transition-all"
                title="Instagram"
              >
                📷
              </a>
            )}
            {athlete.youtube && (
              <a
                href={`https://youtube.com/@${athlete.youtube}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-fire-3 transition-all"
                title="YouTube"
              >
                📹
              </a>
            )}
            {athlete.twitter && (
              <a
                href={`https://twitter.com/${athlete.twitter}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-fire-3 transition-all"
                title="Twitter"
              >
                𝕏
              </a>
            )}
          </div>
        )}

        {/* Propose Button */}
        <button
          onClick={onPropose}
          className="w-full bg-gradient-to-r from-fire-3 to-fire-4 text-black font-orbitron font-bold text-sm py-2.5 rounded hover:opacity-90 transition-all flex items-center justify-center gap-2"
        >
          <MessageSquare size={16} />
          PROPOSE DEAL
        </button>
      </div>
    </motion.div>
  );
}