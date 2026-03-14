/**
 * Ticket Management Panel
 * Organizers view, manage, and scan tickets
 */

import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Scan, FileText, TrendingUp, CheckCircle, AlertCircle, DollarSign } from 'lucide-react';
import TicketScanner from './TicketScanner';

export default function TicketManagementPanel({ event }) {
  const [scannerOpen, setScannerOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  const { data: tickets = [] } = useQuery({
    queryKey: ['event-tickets', event.id],
    queryFn: () => base44.entities.Ticket.filter({ event_id: event.id }),
    initialData: [],
  });

  // Calculate stats
  const stats = {
    total: tickets.length,
    active: tickets.filter(t => t.status === 'active').length,
    used: tickets.filter(t => t.status === 'used').length,
    revenue: tickets.reduce((sum, t) => sum + (t.price * t.quantity), 0),
  };

  const filteredTickets = tickets.filter(t => filterStatus === 'all' || t.status === filterStatus);

  return (
    <div className="space-y-6">
      {/* Header with Scanner */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-orbitron font-bold text-2xl text-fire-5 flex items-center gap-2">
          <FileText size={24} />
          Ticket Management
        </h2>
        <button
          onClick={() => setScannerOpen(true)}
          className="bg-gradient-to-r from-cyan to-cyan-400 text-black font-orbitron font-bold py-3 px-6 rounded flex items-center gap-2 hover:opacity-90 transition-all"
        >
          <Scan size={18} />
          SCAN TICKETS
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: FileText, label: 'Total Tickets', value: stats.total, color: 'fire-3' },
          { icon: CheckCircle, label: 'Entries Recorded', value: stats.used, color: 'green-400' },
          { icon: AlertCircle, label: 'Valid Tickets', value: stats.active, color: 'cyan' },
          { icon: DollarSign, label: 'Revenue', value: `€${stats.revenue.toLocaleString()}`, color: 'purple-400' },
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-gradient-to-br from-[rgba(10,4,18,0.98)] to-[rgba(4,2,8,1)] border border-fire-3/20 p-4 rounded-lg"
            >
              <div className={`w-8 h-8 rounded-full bg-${stat.color}/10 flex items-center justify-center mb-2`}>
                <Icon size={16} className={`text-${stat.color}`} />
              </div>
              <p className="font-mono text-xs text-fire-3/60 uppercase tracking-[1px] mb-1">
                {stat.label}
              </p>
              <p className={`font-orbitron font-black text-2xl text-${stat.color}`}>
                {stat.value}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {[
          { label: 'All', value: 'all' },
          { label: 'Valid', value: 'active' },
          { label: 'Used', value: 'used' },
          { label: 'Refunded', value: 'refunded' },
        ].map(tab => (
          <button
            key={tab.value}
            onClick={() => setFilterStatus(tab.value)}
            className={`px-4 py-2 rounded font-orbitron font-bold text-xs tracking-[1px] uppercase border transition-all ${
              filterStatus === tab.value
                ? 'border-fire-3 bg-fire-3/20 text-fire-5'
                : 'border-fire-3/20 bg-fire-3/5 text-fire-3/60 hover:border-fire-3/40'
            }`}
          >
            {tab.label} ({tickets.filter(t => tab.value === 'all' || t.status === tab.value).length})
          </button>
        ))}
      </div>

      {/* Tickets Table */}
      <div className="bg-gradient-to-br from-[rgba(10,4,18,0.98)] to-[rgba(4,2,8,1)] border border-fire-3/20 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-fire-3/20 bg-fire-3/5">
                <th className="px-6 py-3 text-left font-orbitron font-bold text-xs text-fire-3/60 uppercase tracking-[1px]">
                  Ticket Code
                </th>
                <th className="px-6 py-3 text-left font-orbitron font-bold text-xs text-fire-3/60 uppercase tracking-[1px]">
                  Buyer
                </th>
                <th className="px-6 py-3 text-left font-orbitron font-bold text-xs text-fire-3/60 uppercase tracking-[1px]">
                  Tier
                </th>
                <th className="px-6 py-3 text-left font-orbitron font-bold text-xs text-fire-3/60 uppercase tracking-[1px]">
                  Price
                </th>
                <th className="px-6 py-3 text-left font-orbitron font-bold text-xs text-fire-3/60 uppercase tracking-[1px]">
                  Status
                </th>
                <th className="px-6 py-3 text-left font-orbitron font-bold text-xs text-fire-3/60 uppercase tracking-[1px]">
                  Entry Time
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map((ticket, idx) => (
                <motion.tr
                  key={ticket.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="border-b border-fire-3/10 hover:bg-fire-3/5 transition-all"
                >
                  <td className="px-6 py-3 font-mono text-sm text-fire-4">
                    {ticket.ticket_code}
                  </td>
                  <td className="px-6 py-3 font-rajdhani text-sm text-fire-4">
                    {ticket.buyer_name}
                  </td>
                  <td className="px-6 py-3 font-rajdhani text-xs text-fire-3/60 uppercase">
                    {ticket.ticket_type}
                  </td>
                  <td className="px-6 py-3 font-orbitron font-bold text-fire-5">
                    €{ticket.price}
                  </td>
                  <td className="px-6 py-3">
                    <span
                      className={`inline-block px-3 py-1 rounded text-xs font-mono font-bold ${
                        ticket.status === 'active'
                          ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                          : ticket.status === 'used'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}
                    >
                      {ticket.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 font-mono text-xs text-fire-3/60">
                    {ticket.entry_timestamp
                      ? new Date(ticket.entry_timestamp).toLocaleTimeString()
                      : '—'}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredTickets.length === 0 && (
        <div className="text-center py-12 bg-fire-3/5 border border-fire-3/20 rounded-lg">
          <FileText size={48} className="text-fire-3/20 mx-auto mb-3" />
          <p className="font-mono text-sm text-fire-3/40">No tickets found</p>
        </div>
      )}

      {/* Scanner Modal */}
      <AnimatePresence>
        {scannerOpen && <TicketScanner event={event} onClose={() => setScannerOpen(false)} />}
      </AnimatePresence>
    </div>
  );
}