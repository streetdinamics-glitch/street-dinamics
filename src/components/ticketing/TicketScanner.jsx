/**
 * Ticket Scanner Component
 * Organizers scan QR codes to validate and record ticket entries
 */

import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Camera, CheckCircle, AlertCircle, X, Scan } from 'lucide-react';
import { toast } from 'sonner';

export default function TicketScanner({ event, onClose }) {
  const [scannedCode, setScannedCode] = useState('');
  const [lastScan, setLastScan] = useState(null);
  const [useManualEntry, setUseManualEntry] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const inputRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const validateTicketMutation = useMutation({
    mutationFn: async (ticketCode) => {
      const tickets = await base44.entities.Ticket.filter({ ticket_code: ticketCode, event_id: event.id });
      if (!tickets.length) throw new Error('Ticket not found');

      const ticket = tickets[0];
      if (ticket.status === 'used') throw new Error('Ticket already used');
      if (ticket.status !== 'active') throw new Error(`Ticket is ${ticket.status}`);

      await base44.entities.Ticket.update(ticket.id, {
        status: 'used',
        entry_timestamp: new Date().toISOString(),
        scanner_email: user?.email,
      });

      return ticket;
    },
    onSuccess: (ticket) => {
      setLastScan({ success: true, ticket });
      toast.success(`✓ Entry recorded for ${ticket.buyer_name}`);
      setScannedCode('');
      setManualCode('');
      inputRef.current?.focus();
      queryClient.invalidateQueries({ queryKey: ['event-tickets'] });
    },
    onError: (error) => {
      setLastScan({ success: false, error: error.message });
      toast.error(error.message);
    },
  });

  useEffect(() => {
    if (!useManualEntry) inputRef.current?.focus();
  }, [useManualEntry]);

  const handleScan = (code) => {
    if (code && code.trim()) {
      validateTicketMutation.mutate(code.trim());
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualCode) {
      handleScan(manualCode);
    }
  };

  const handlePaste = (e) => {
    const pastedText = e.clipboardData.getData('text');
    if (pastedText) {
      setScannedCode(pastedText);
      handleScan(pastedText);
    }
  };

  return (
    <div className="fixed inset-0 z-[600] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-gradient-to-br from-[rgba(10,4,18,0.99)] to-[rgba(4,2,8,1)] border border-cyan/20 rounded-lg p-8"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="font-orbitron font-black text-2xl text-cyan mb-2">TICKET SCANNER</h2>
            <p className="font-rajdhani text-sm text-fire-4/70">{event.title}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-cyan/10 rounded transition-all">
            <X size={20} className="text-cyan" />
          </button>
        </div>

        {/* Scanner Mode Toggle */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setUseManualEntry(false)}
            className={`flex-1 py-2 px-4 rounded font-orbitron font-bold text-xs tracking-[1px] uppercase transition-all border ${
              !useManualEntry
                ? 'border-cyan bg-cyan/20 text-cyan'
                : 'border-cyan/20 bg-cyan/5 text-cyan/60 hover:border-cyan/40'
            }`}
          >
            <Scan size={14} className="inline mr-2" />
            QR CODE
          </button>
          <button
            onClick={() => setUseManualEntry(true)}
            className={`flex-1 py-2 px-4 rounded font-orbitron font-bold text-xs tracking-[1px] uppercase transition-all border ${
              useManualEntry
                ? 'border-cyan bg-cyan/20 text-cyan'
                : 'border-cyan/20 bg-cyan/5 text-cyan/60 hover:border-cyan/40'
            }`}
          >
            MANUAL ENTRY
          </button>
        </div>

        {/* QR Code Scanner Mode */}
        {!useManualEntry && (
          <div className="space-y-4 mb-6">
            <div className="bg-black/50 border border-cyan/30 rounded-lg p-8 flex flex-col items-center justify-center aspect-square">
              <Camera className="text-cyan/40 mb-3" size={40} />
              <p className="font-mono text-sm text-cyan/60 text-center">
                Point camera at QR code to scan ticket
              </p>
              <input
                ref={inputRef}
                type="text"
                value={scannedCode}
                onChange={(e) => setScannedCode(e.target.value)}
                onPaste={handlePaste}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleScan(scannedCode);
                  }
                }}
                className="absolute opacity-0 pointer-events-none"
                autoFocus
                placeholder="Scanner will capture QR code here"
              />
            </div>
            <p className="font-mono text-xs text-cyan/50 text-center">
              (Most barcode scanners will automatically populate the field)
            </p>
          </div>
        )}

        {/* Manual Entry Mode */}
        {useManualEntry && (
          <form onSubmit={handleManualSubmit} className="space-y-4 mb-6">
            <div>
              <label className="block font-rajdhani font-bold text-cyan mb-2 text-sm">
                Ticket Code
              </label>
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="TKT-XXXXXXXXXXXX"
                autoFocus
                className="w-full bg-cyan/5 border border-cyan/20 px-4 py-3 text-cyan placeholder-cyan/30 font-mono font-bold focus:outline-none focus:border-cyan/40 rounded"
              />
            </div>
            <button
              type="submit"
              disabled={!manualCode || validateTicketMutation.isPending}
              className="w-full bg-cyan text-black font-orbitron font-bold py-3 rounded hover:opacity-90 transition-all disabled:opacity-50"
            >
              {validateTicketMutation.isPending ? 'VALIDATING...' : 'VALIDATE TICKET'}
            </button>
          </form>
        )}

        {/* Last Scan Result */}
        {lastScan && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg border mb-6 ${
              lastScan.success
                ? 'bg-green-500/10 border-green-500/30'
                : 'bg-red-500/10 border-red-500/30'
            }`}
          >
            <div className="flex items-start gap-3">
              {lastScan.success ? (
                <CheckCircle className="text-green-400 flex-shrink-0 mt-0.5" size={20} />
              ) : (
                <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={20} />
              )}
              <div>
                {lastScan.success ? (
                  <div>
                    <p className="font-orbitron font-bold text-green-400 text-sm">ENTRY RECORDED</p>
                    <p className="font-rajdhani text-sm text-green-400/80 mt-1">
                      {lastScan.ticket.buyer_name}
                    </p>
                    <p className="font-mono text-xs text-green-400/60 mt-1">
                      {new Date().toLocaleTimeString()}
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="font-orbitron font-bold text-red-400 text-sm">INVALID TICKET</p>
                    <p className="font-rajdhani text-sm text-red-400/80 mt-1">
                      {lastScan.error}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Stats */}
        <div className="bg-cyan/5 border border-cyan/20 p-4 rounded-lg">
          <p className="font-mono text-xs text-cyan/60 uppercase tracking-[1px] mb-2">Scanner Info</p>
          <div className="space-y-1 font-rajdhani text-sm">
            <p>
              Operator: <span className="text-cyan font-bold">{user?.full_name}</span>
            </p>
            <p>
              Status: <span className="text-green-400 font-bold">● ACTIVE</span>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}