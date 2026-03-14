import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import QRCode from 'qrcode';
import { toast } from 'sonner';

export default function EventRegistrations({ event, onClose, lang }) {
  const queryClient = useQueryClient();
  const [qrCodes, setQrCodes] = useState({});

  const { data: registrations = [] } = useQuery({
    queryKey: ['event-registrations', event.id],
    queryFn: () => base44.entities.Registration.filter({ event_id: event.id }),
  });

  const updateRegistration = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Registration.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-registrations'] });
      toast.success('Registration updated');
    },
  });

  useEffect(() => {
    registrations.forEach(async (reg) => {
      if (reg.ticket_code && !qrCodes[reg.id]) {
        try {
          const qrData = `SD-TICKET|${reg.ticket_code}|${event.id}|${reg.email}`;
          const qr = await QRCode.toDataURL(qrData, { width: 200, margin: 1 });
          setQrCodes(prev => ({ ...prev, [reg.id]: qr }));
        } catch (err) {
          console.error('QR generation failed:', err);
        }
      }
    });
  }, [registrations, event.id]);

  const athletes = registrations.filter(r => r.type === 'athlete');
  const spectators = registrations.filter(r => r.type === 'spectator');

  const handleApprove = (reg) => {
    updateRegistration.mutate({
      id: reg.id,
      data: { status: 'confirmed' },
    });
  };

  const handleReject = (reg) => {
    updateRegistration.mutate({
      id: reg.id,
      data: { status: 'rejected' },
    });
  };

  return (
    <div className="fixed inset-0 z-[600] bg-black/95 backdrop-blur-xl flex items-start justify-center overflow-y-auto p-4">
      <div className="relative w-full max-w-[1200px] bg-gradient-to-br from-[rgba(10,4,18,0.99)] to-[rgba(4,2,8,1)] border border-fire-3/20 clip-cyber p-6 md:p-8 my-auto">
        <div className="absolute top-0 left-0 right-0 fire-line" />
        <button onClick={onClose} className="absolute top-3 right-4 font-mono text-[10px] tracking-[2px] text-fire-3/30 hover:text-fire-3">
          ✕ CLOSE
        </button>

        <h2 className="text-fire-gradient font-orbitron font-black text-xl md:text-2xl tracking-[2px] mb-2">
          REGISTRATIONS: {event.title}
        </h2>
        <p className="font-mono text-[10px] text-fire-3/30 mb-6">
          {event.date} • {event.location}
        </p>

        {/* Athletes */}
        <div className="mb-8">
          <h3 className="font-orbitron font-bold text-lg text-fire-4 mb-4 flex items-center gap-2">
            ATHLETES ({athletes.length})
          </h3>
          {athletes.length === 0 ? (
            <p className="text-center py-8 font-mono text-xs text-fire-3/30">No athlete registrations yet</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {athletes.map(reg => (
                <div key={reg.id} className="p-4 bg-fire-3/5 border border-fire-3/10">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="font-orbitron font-bold text-base text-fire-4">
                        {reg.first_name} {reg.last_name}
                      </div>
                      <div className="font-mono text-xs text-fire-3/40 mt-1">
                        {reg.email}
                      </div>
                      <div className="font-mono text-xs text-fire-3/40">
                        Sport: {reg.sport || 'N/A'}
                      </div>
                      <div className={`inline-block mt-2 px-2 py-1 text-[8px] font-mono tracking-[2px] uppercase border ${
                        reg.status === 'confirmed' ? 'border-green-500/40 text-green-400 bg-green-500/5' :
                        reg.status === 'rejected' ? 'border-red-500/40 text-red-400 bg-red-500/5' :
                        'border-fire-3/40 text-fire-4 bg-fire-3/5'
                      }`}>
                        {reg.status}
                      </div>
                    </div>
                    {qrCodes[reg.id] && (
                      <img src={qrCodes[reg.id]} alt="QR" className="w-16 h-16 border border-fire-3/20" />
                    )}
                  </div>
                  {reg.ticket_code && (
                    <div className="font-mono text-xs text-cyan mb-2">
                      Code: {reg.ticket_code}
                    </div>
                  )}
                  {reg.status === 'pending' && (
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleApprove(reg)}
                        className="btn-fire text-[9px] py-1.5 px-3 flex-1"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(reg)}
                        className="btn-ghost text-[9px] py-1.5 px-3 flex-1"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Spectators */}
        <div>
          <h3 className="font-orbitron font-bold text-lg text-cyan mb-4 flex items-center gap-2">
            SPECTATORS ({spectators.length})
          </h3>
          {spectators.length === 0 ? (
            <p className="text-center py-8 font-mono text-xs text-fire-3/30">No spectator tickets yet</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {spectators.map(reg => (
                <div key={reg.id} className="p-4 bg-cyan/5 border border-cyan/10">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="font-orbitron font-bold text-base text-cyan">
                        {reg.first_name} {reg.last_name}
                      </div>
                      <div className="font-mono text-xs text-cyan/60 mt-1">
                        {reg.email}
                      </div>
                      {reg.seat_zone && (
                        <div className="font-mono text-xs text-cyan/60">
                          Seat: {reg.seat_zone}
                        </div>
                      )}
                      <div className={`inline-block mt-2 px-2 py-1 text-[8px] font-mono tracking-[2px] uppercase border ${
                        reg.status === 'confirmed' ? 'border-green-500/40 text-green-400 bg-green-500/5' :
                        reg.status === 'rejected' ? 'border-red-500/40 text-red-400 bg-red-500/5' :
                        'border-cyan/40 text-cyan bg-cyan/5'
                      }`}>
                        {reg.status}
                      </div>
                    </div>
                    {qrCodes[reg.id] && (
                      <img src={qrCodes[reg.id]} alt="QR" className="w-16 h-16 border border-cyan/20" />
                    )}
                  </div>
                  {reg.ticket_code && (
                    <div className="font-mono text-xs text-cyan mb-2">
                      Code: {reg.ticket_code}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}