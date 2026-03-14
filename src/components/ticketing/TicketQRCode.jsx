/**
 * Ticket QR Code Display Component
 * Shows QR code and ticket details for entry
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Download, Printer } from 'lucide-react';

export default function TicketQRCode({ ticket, event }) {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = ticket.qr_code_url;
    link.download = `ticket-${ticket.ticket_code}.png`;
    link.click();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-md bg-gradient-to-br from-[rgba(10,4,18,0.99)] to-[rgba(4,2,8,1)] border border-fire-3/20 rounded-lg overflow-hidden"
    >
      {/* Ticket Header */}
      <div className="bg-gradient-to-r from-fire-3/20 to-fire-3/10 p-6 border-b border-fire-3/20">
        <h3 className="font-orbitron font-bold text-lg text-fire-5 mb-1">
          {ticket.ticket_type.toUpperCase()} TICKET
        </h3>
        <p className="font-rajdhani text-sm text-fire-4/70">{event.title}</p>
      </div>

      {/* QR Code Section */}
      <div className="p-8 flex flex-col items-center bg-black/30">
        <div className="bg-white p-4 rounded-lg mb-6 shadow-lg">
          <img
            src={ticket.qr_code_url}
            alt="Ticket QR Code"
            className="w-48 h-48"
          />
        </div>
        <p className="font-mono text-xs text-fire-3/60 text-center tracking-[2px] uppercase">
          {ticket.ticket_code}
        </p>
      </div>

      {/* Ticket Details */}
      <div className="p-6 space-y-3 border-t border-fire-3/20">
        <div className="flex justify-between items-start">
          <div>
            <p className="font-mono text-xs text-fire-3/60 uppercase tracking-[1px] mb-1">Event Date</p>
            <p className="font-rajdhani font-bold text-fire-4">
              {new Date(event.date).toLocaleDateString('en-US', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </p>
          </div>
          <div className="text-right">
            <p className="font-mono text-xs text-fire-3/60 uppercase tracking-[1px] mb-1">Location</p>
            <p className="font-rajdhani font-bold text-fire-4 text-sm">{event.location}</p>
          </div>
        </div>

        <div className="h-[1px] bg-fire-3/20" />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="font-mono text-xs text-fire-3/60 uppercase tracking-[1px] mb-1">Buyer</p>
            <p className="font-rajdhani font-bold text-fire-4 text-sm">{ticket.buyer_name}</p>
          </div>
          <div>
            <p className="font-mono text-xs text-fire-3/60 uppercase tracking-[1px] mb-1">Price Paid</p>
            <p className="font-orbitron font-black text-fire-5">€{ticket.price}</p>
          </div>
        </div>

        {ticket.seat_number && (
          <div>
            <p className="font-mono text-xs text-fire-3/60 uppercase tracking-[1px] mb-1">Seat/Zone</p>
            <p className="font-rajdhani font-bold text-fire-4">{ticket.seat_number}</p>
          </div>
        )}

        {/* Status Badge */}
        <div className="mt-4 py-2 px-3 rounded-lg border text-center">
          <p className={`font-mono text-xs font-bold tracking-[1px] uppercase ${
            ticket.status === 'active'
              ? 'text-green-400 bg-green-500/10 border-green-500/30'
              : ticket.status === 'used'
              ? 'text-blue-400 bg-blue-500/10 border-blue-500/30'
              : 'text-red-400 bg-red-500/10 border-red-500/30'
          }`}>
            {ticket.status === 'active' ? '✓ VALID FOR ENTRY' : ticket.status.toUpperCase()}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-6 border-t border-fire-3/20 flex gap-2">
        <button
          onClick={handleDownload}
          className="flex-1 bg-fire-3/10 border border-fire-3/20 text-fire-3 font-orbitron font-bold py-2 rounded hover:bg-fire-3/20 transition-all flex items-center justify-center gap-2 text-sm"
        >
          <Download size={16} />
          DOWNLOAD
        </button>
        <button
          onClick={handlePrint}
          className="flex-1 bg-cyan/10 border border-cyan/20 text-cyan font-orbitron font-bold py-2 rounded hover:bg-cyan/20 transition-all flex items-center justify-center gap-2 text-sm"
        >
          <Printer size={16} />
          PRINT
        </button>
      </div>
    </motion.div>
  );
}