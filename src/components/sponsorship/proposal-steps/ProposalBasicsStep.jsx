/**
 * Proposal Basics Step
 * Campaign name, description, and target athlete
 */

import React from 'react';
import { motion } from 'framer-motion';

export default function ProposalBasicsStep({ data, onChange }) {
  return (
    <div className="space-y-6">
      {/* Campaign Title */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <label className="block font-rajdhani font-bold text-fire-4 mb-2">
          Campaign Title *
        </label>
        <input
          type="text"
          value={data.campaign_title}
          onChange={(e) => onChange({ ...data, campaign_title: e.target.value })}
          placeholder="e.g., Summer 2026 Product Launch"
          className="w-full bg-fire-3/5 border border-fire-3/20 px-4 py-2 text-fire-4 placeholder-fire-3/30 font-rajdhani rounded focus:outline-none focus:border-fire-3/40"
        />
      </motion.div>

      {/* Description */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <label className="block font-rajdhani font-bold text-fire-4 mb-2">
          Campaign Description
        </label>
        <textarea
          value={data.description}
          onChange={(e) => onChange({ ...data, description: e.target.value })}
          placeholder="Briefly describe the campaign, brand, and what you're looking for..."
          rows={4}
          className="w-full bg-fire-3/5 border border-fire-3/20 px-4 py-2 text-fire-4 placeholder-fire-3/30 font-rajdhani rounded focus:outline-none focus:border-fire-3/40"
        />
      </motion.div>

      {/* Target Athlete */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 gap-4"
      >
        <div>
          <label className="block font-rajdhani font-bold text-fire-4 mb-2">
            Athlete Email *
          </label>
          <input
            type="email"
            value={data.target_athlete_email}
            onChange={(e) => onChange({ ...data, target_athlete_email: e.target.value })}
            placeholder="athlete@example.com"
            className="w-full bg-fire-3/5 border border-fire-3/20 px-4 py-2 text-fire-4 placeholder-fire-3/30 font-rajdhani rounded focus:outline-none focus:border-fire-3/40"
          />
        </div>

        <div>
          <label className="block font-rajdhani font-bold text-fire-4 mb-2">
            Athlete Name
          </label>
          <input
            type="text"
            value={data.target_athlete_name}
            onChange={(e) => onChange({ ...data, target_athlete_name: e.target.value })}
            placeholder="Athlete's name"
            className="w-full bg-fire-3/5 border border-fire-3/20 px-4 py-2 text-fire-4 placeholder-fire-3/30 font-rajdhani rounded focus:outline-none focus:border-fire-3/40"
          />
        </div>
      </motion.div>

      {/* Campaign Dates */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="grid grid-cols-2 gap-4"
      >
        <div>
          <label className="block font-rajdhani font-bold text-fire-4 mb-2">
            Start Date
          </label>
          <input
            type="date"
            value={data.start_date}
            onChange={(e) => onChange({ ...data, start_date: e.target.value })}
            className="w-full bg-fire-3/5 border border-fire-3/20 px-4 py-2 text-fire-4 font-rajdhani rounded focus:outline-none focus:border-fire-3/40"
          />
        </div>

        <div>
          <label className="block font-rajdhani font-bold text-fire-4 mb-2">
            End Date
          </label>
          <input
            type="date"
            value={data.end_date}
            onChange={(e) => onChange({ ...data, end_date: e.target.value })}
            className="w-full bg-fire-3/5 border border-fire-3/20 px-4 py-2 text-fire-4 font-rajdhani rounded focus:outline-none focus:border-fire-3/40"
          />
        </div>
      </motion.div>
    </div>
  );
}