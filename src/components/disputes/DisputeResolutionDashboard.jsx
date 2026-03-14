/**
 * Dispute Resolution Dashboard
 * Admin/organizer mediation hub for all escrow disputes
 */

import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Filter, Clock, CheckCircle, Scale } from 'lucide-react';
import DisputeCard from './DisputeCard';
import DisputeDetailModal from './DisputeDetailModal';

export default function DisputeResolutionDashboard() {
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  // Verify user is admin
  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-cyber-void flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle size={48} className="text-red-500 mx-auto mb-4" />
          <p className="font-orbitron text-xl text-red-400">Admin access required</p>
        </div>
      </div>
    );
  }

  const { data: disputes = [] } = useQuery({
    queryKey: ['disputes'],
    queryFn: () => base44.entities.Dispute.list('-created_at', 100),
    initialData: [],
    refetchInterval: 5000,
  });

  const { data: stats } = useQuery({
    queryKey: ['dispute-stats', disputes.length],
    queryFn: () => ({
      total: disputes.length,
      opened: disputes.filter((d) => d.status === 'opened').length,
      underReview: disputes.filter((d) => d.status === 'under_review').length,
      mediating: disputes.filter((d) => d.status === 'mediating').length,
      resolved: disputes.filter((d) => d.status === 'resolved').length,
      totalAmount: disputes.reduce((sum, d) => sum + d.amount_disputed, 0),
    }),
  });

  // Filter disputes
  let filtered = disputes;
  if (filterStatus !== 'all') {
    filtered = filtered.filter((d) => d.status === filterStatus);
  }
  if (filterType !== 'all') {
    filtered = filtered.filter((d) => d.dispute_type === filterType);
  }

  const statusColors = {
    opened: 'border-yellow-500/30 bg-yellow-500/5 text-yellow-400',
    under_review: 'border-blue-500/30 bg-blue-500/5 text-blue-400',
    awaiting_evidence: 'border-orange-500/30 bg-orange-500/5 text-orange-400',
    mediating: 'border-purple-500/30 bg-purple-500/5 text-purple-400',
    resolved: 'border-green-500/30 bg-green-500/5 text-green-400',
    appealed: 'border-red-500/30 bg-red-500/5 text-red-400',
    closed: 'border-gray-500/30 bg-gray-500/5 text-gray-400',
  };

  return (
    <div className="min-h-screen bg-cyber-void text-foreground p-6">
      <div className="cyber-grid" />
      <div className="cyber-scanlines" />
      <div className="cyber-vignette" />

      <div className="relative z-10 max-w-[1400px] mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="heading-fire text-[clamp(40px,7vw,80px)] leading-none font-black mb-4">
            DISPUTE RESOLUTION
          </h1>
          <p className="font-mono text-[10px] tracking-[7px] uppercase text-fire-3/60">
            ESCROW MEDIATION CENTER
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8"
        >
          <div className="bg-gradient-to-br from-fire-3/10 to-fire-3/5 border border-fire-3/20 p-4 rounded-lg">
            <p className="font-mono text-xs text-fire-3/60 mb-2">TOTAL DISPUTES</p>
            <p className="font-orbitron font-black text-3xl text-fire-5">{stats?.total || 0}</p>
          </div>

          <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border border-yellow-500/20 p-4 rounded-lg">
            <p className="font-mono text-xs text-yellow-600/60 mb-2">OPENED</p>
            <p className="font-orbitron font-black text-3xl text-yellow-400">{stats?.opened || 0}</p>
          </div>

          <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 p-4 rounded-lg">
            <p className="font-mono text-xs text-blue-600/60 mb-2">UNDER REVIEW</p>
            <p className="font-orbitron font-black text-3xl text-blue-400">{stats?.underReview || 0}</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20 p-4 rounded-lg">
            <p className="font-mono text-xs text-purple-600/60 mb-2">MEDIATING</p>
            <p className="font-orbitron font-black text-3xl text-purple-400">{stats?.mediating || 0}</p>
          </div>

          <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20 p-4 rounded-lg">
            <p className="font-mono text-xs text-green-600/60 mb-2">RESOLVED</p>
            <p className="font-orbitron font-black text-3xl text-green-400">{stats?.resolved || 0}</p>
          </div>
        </motion.div>

        {/* Total Amount in Dispute */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-fire-3/20 to-fire-3/10 border border-fire-3/30 p-6 rounded-lg mb-8"
        >
          <p className="font-mono text-xs text-fire-3/60 mb-2 uppercase tracking-[1px]">
            Total Amount in Dispute
          </p>
          <p className="font-orbitron font-black text-4xl text-fire-6">
            €{(stats?.totalAmount || 0).toFixed(2)}
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap gap-3 mb-8"
        >
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-fire-3" />
            <span className="font-mono text-xs text-fire-3/60 uppercase">Filter by:</span>
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-fire-3/5 border border-fire-3/20 px-4 py-2 text-fire-4 font-rajdhani rounded text-sm focus:outline-none focus:border-fire-3/40"
          >
            <option value="all">All Status</option>
            <option value="opened">Opened</option>
            <option value="under_review">Under Review</option>
            <option value="awaiting_evidence">Awaiting Evidence</option>
            <option value="mediating">Mediating</option>
            <option value="resolved">Resolved</option>
            <option value="appealed">Appealed</option>
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-fire-3/5 border border-fire-3/20 px-4 py-2 text-fire-4 font-rajdhani rounded text-sm focus:outline-none focus:border-fire-3/40"
          >
            <option value="all">All Types</option>
            <option value="sponsorship">Sponsorship</option>
            <option value="marketplace">Marketplace</option>
          </select>
        </motion.div>

        {/* Disputes List */}
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 bg-fire-3/5 border border-fire-3/10 rounded-lg"
            >
              <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
              <p className="font-rajdhani text-lg text-fire-4/70">No disputes match your filters</p>
            </motion.div>
          ) : (
            <AnimatePresence>
              {filtered.map((dispute, idx) => (
                <motion.div
                  key={dispute.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => setSelectedDispute(dispute)}
                  className="cursor-pointer"
                >
                  <DisputeCard dispute={dispute} statusColors={statusColors} />
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedDispute && (
          <DisputeDetailModal
            dispute={selectedDispute}
            onClose={() => setSelectedDispute(null)}
            onReload={() => {
              // Reload disputes
              setSelectedDispute(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}