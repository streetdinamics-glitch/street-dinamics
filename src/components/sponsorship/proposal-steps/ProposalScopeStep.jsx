/**
 * Proposal Scope Step
 * Define deliverables and requirements
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2 } from 'lucide-react';

const DELIVERABLE_TYPES = [
  'Instagram Posts',
  'TikTok Videos',
  'YouTube Video',
  'Event Appearance',
  'Product Review',
  'Story Posts',
  'Live Stream',
  'Merchandise Wearing',
  'Other',
];

export default function ProposalScopeStep({ data, onChange }) {
  const [newDeliverable, setNewDeliverable] = useState('');
  const [selectedType, setSelectedType] = useState('Instagram Posts');

  const addDeliverable = () => {
    if (newDeliverable.trim()) {
      const updated = [
        ...data.deliverables,
        {
          type: selectedType,
          description: newDeliverable,
          status: 'pending',
        },
      ];
      onChange({ ...data, deliverables: updated });
      setNewDeliverable('');
    }
  };

  const removeDeliverable = (index) => {
    const updated = data.deliverables.filter((_, i) => i !== index);
    onChange({ ...data, deliverables: updated });
  };

  return (
    <div className="space-y-6">
      {/* Add Deliverable */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-fire-3/5 border border-fire-3/20 p-4 rounded-lg"
      >
        <label className="block font-rajdhani font-bold text-fire-4 mb-3">
          Add Deliverable *
        </label>

        <div className="space-y-3">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full bg-fire-3/5 border border-fire-3/20 px-4 py-2 text-fire-4 font-rajdhani rounded focus:outline-none focus:border-fire-3/40"
          >
            {DELIVERABLE_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          <div className="flex gap-2">
            <input
              type="text"
              value={newDeliverable}
              onChange={(e) => setNewDeliverable(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addDeliverable()}
              placeholder="e.g., 1 Instagram post per week"
              className="flex-1 bg-fire-3/5 border border-fire-3/20 px-4 py-2 text-fire-4 placeholder-fire-3/30 font-rajdhani rounded focus:outline-none focus:border-fire-3/40"
            />
            <button
              onClick={addDeliverable}
              className="bg-fire-3 text-black font-orbitron font-bold px-4 py-2 rounded hover:bg-fire-4 transition-all flex items-center gap-2"
            >
              <Plus size={16} />
              ADD
            </button>
          </div>
        </div>
      </motion.div>

      {/* Deliverables List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <label className="block font-rajdhani font-bold text-fire-4 mb-3">
          Deliverables ({data.deliverables.length})
        </label>

        {data.deliverables.length === 0 ? (
          <div className="text-center py-6 bg-fire-3/5 border border-fire-3/10 rounded">
            <p className="font-rajdhani text-fire-3/50">
              Add at least one deliverable to continue
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {data.deliverables.map((deliverable, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between bg-fire-3/5 border border-fire-3/10 p-3 rounded"
              >
                <div>
                  <p className="font-rajdhani font-bold text-fire-4">
                    {deliverable.description}
                  </p>
                  <p className="font-mono text-xs text-fire-3/50">
                    {deliverable.type}
                  </p>
                </div>
                <button
                  onClick={() => removeDeliverable(idx)}
                  className="p-2 hover:bg-red-500/20 text-red-400 transition-all rounded"
                >
                  <Trash2 size={16} />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Additional Notes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <label className="block font-rajdhani font-bold text-fire-4 mb-2">
          Additional Requirements
        </label>
        <textarea
          value={data.notes}
          onChange={(e) => onChange({ ...data, notes: e.target.value })}
          placeholder="Any special requirements, hashtags, or brand guidelines..."
          rows={3}
          className="w-full bg-fire-3/5 border border-fire-3/20 px-4 py-2 text-fire-4 placeholder-fire-3/30 font-rajdhani rounded focus:outline-none focus:border-fire-3/40"
        />
      </motion.div>
    </div>
  );
}