/**
 * Dispute Card
 * Individual dispute summary card
 */

import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Clock, DollarSign } from 'lucide-react';

export default function DisputeCard({ dispute, statusColors }) {
  const reasonLabels = {
    incomplete_deliverables: 'Incomplete Deliverables',
    poor_quality: 'Poor Quality',
    missed_deadline: 'Missed Deadline',
    non_delivery: 'Non-Delivery',
    item_not_as_described: 'Item Not As Described',
    damaged_goods: 'Damaged Goods',
    unauthorized_charges: 'Unauthorized Charges',
    other: 'Other',
  };

  const daysOpen = Math.floor(
    (new Date() - new Date(dispute.created_at)) / (1000 * 60 * 60 * 24)
  );

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`p-6 rounded-lg border transition-all cursor-pointer ${
        statusColors[dispute.status] || 'border-fire-3/20 bg-fire-3/5'
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={18} className="text-current" />
            <h3 className="font-orbitron font-bold text-lg text-current">
              {reasonLabels[dispute.reason] || dispute.reason}
            </h3>
          </div>
          <p className="font-rajdhani text-sm text-current/70 mb-2">
            {dispute.dispute_type === 'sponsorship'
              ? `${dispute.initiator_role.toUpperCase()} vs ${dispute.respondent_role.toUpperCase()}`
              : `Marketplace Transaction`}
          </p>
          <p className="font-rajdhani text-sm text-current/60 line-clamp-2">
            {dispute.description}
          </p>
        </div>

        <div className="text-right ml-4">
          <p className="font-mono text-xs text-current/60 mb-1 uppercase">Amount</p>
          <p className="font-orbitron font-black text-xl text-current">
            €{dispute.amount_disputed.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-current/20">
        <div>
          <p className="font-mono text-xs text-current/60 mb-1">Status</p>
          <p className="font-rajdhani font-bold text-sm text-current">
            {dispute.status.replace('_', ' ').toUpperCase()}
          </p>
        </div>

        <div>
          <p className="font-mono text-xs text-current/60 mb-1 flex items-center gap-1">
            <Clock size={12} />
            OPENED
          </p>
          <p className="font-rajdhani font-bold text-sm text-current">{daysOpen}d ago</p>
        </div>

        <div>
          <p className="font-mono text-xs text-current/60 mb-1">Mediator</p>
          <p className="font-rajdhani font-bold text-sm text-current">
            {dispute.assigned_mediator ? 'Assigned' : 'Pending'}
          </p>
        </div>
      </div>
    </motion.div>
  );
}