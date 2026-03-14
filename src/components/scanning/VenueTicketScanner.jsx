import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, CheckCircle2, X, AlertCircle, ZoomIn } from 'lucide-react';
import { toast } from 'sonner';

export default function VenueTicketScanner({ eventId, eventTitle }) {
  const [scanMode, setScanMode] = useState('camera'); // 'camera' or 'manual'
  const [manualInput, setManualInput] = useState('');
  const [lastScanned, setLastScanned] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const queryClient = useQueryClient();

  // Fetch current event check-in stats
  const { data: registrations = [] } = useQuery({
    queryKey: ['event-registrations', eventId],
    queryFn: () => base44.entities.Registration.filter({ event_id: eventId }),
    initialData: [],
  });

  const checkedInCount = registrations.filter(r => r.checked_in).length;
  const totalCount = registrations.length;

  // Mutation to update check-in status
  const updateCheckIn = useMutation({
    mutationFn: async (ticketCode) => {
      // Find registration by ticket code
      const reg = registrations.find(r => r.ticket_code === ticketCode);
      
      if (!reg) {
        throw new Error('Ticket not found');
      }

      if (reg.checked_in) {
        throw new Error('Already checked in');
      }

      // Update registration
      await base44.entities.Registration.update(reg.id, {
        checked_in: true,
        check_in_time: new Date().toISOString(),
      });

      return reg;
    },
    onSuccess: (reg) => {
      queryClient.invalidateQueries({ queryKey: ['event-registrations', eventId] });
      setLastScanned({
        name: `${reg.first_name} ${reg.last_name}`,
        type: reg.type,
        time: new Date(),
        status: 'success',
      });
      setManualInput('');
      toast.success(`✓ ${reg.first_name} checked in`);
    },
    onError: (error) => {
      setLastScanned({
        code: manualInput || 'Unknown',
        status: 'error',
        message: error.message,
        time: new Date(),
      });
      toast.error(error.message);
    },
  });

  // Start camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setCameraActive(true);
        startQRScanning();
      }
    } catch (err) {
      toast.error('Camera access denied');
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setCameraActive(false);
  };

  // QR Code scanning
  const startQRScanning = () => {
    const scanInterval = setInterval(() => {
      if (canvasRef.current && videoRef.current && cameraActive) {
        const ctx = canvasRef.current.getContext('2d');
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        ctx.drawImage(videoRef.current, 0, 0);

        try {
          const imageData = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
          // Basic QR detection - look for the ticket code pattern in video
          // For production, use jsQR or similar library
          const detectedCode = detectQRCode(imageData);
          if (detectedCode) {
            clearInterval(scanInterval);
            updateCheckIn.mutate(detectedCode);
            stopCamera();
          }
        } catch (e) {
          // Continue scanning
        }
      }
    }, 100);

    return () => clearInterval(scanInterval);
  };

  // Simple QR detection (for demo - use jsQR library for production)
  const detectQRCode = (imageData) => {
    // Placeholder: in production, use jsQR library
    // This would detect and decode the QR code
    return null;
  };

  // Handle manual input
  const handleManualScan = (e) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    
    updateCheckIn.mutate(manualInput.toUpperCase());
  };

  // Auto-focus on manual input
  useEffect(() => {
    if (scanMode === 'manual') {
      const input = document.getElementById('manual-ticket-input');
      input?.focus();
    }
  }, [scanMode]);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="w-full bg-gradient-to-br from-[rgba(10,4,18,0.97)] to-[rgba(4,2,8,0.99)] border border-fire-3/20 p-6">
      <div className="mb-6">
        <h2 className="heading-fire text-2xl font-black mb-1">VENUE CHECK-IN SCANNER</h2>
        <p className="font-mono text-[11px] tracking-[2px] uppercase text-fire-3/40">
          {eventTitle} · Real-time Attendance Tracking
        </p>
      </div>

      {/* Check-in Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/40 border border-fire-3/10 p-4 text-center"
        >
          <div className="font-orbitron font-black text-2xl text-fire-5 mb-1">{checkedInCount}</div>
          <div className="font-mono text-[10px] tracking-[2px] uppercase text-fire-3/60">Checked In</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-black/40 border border-fire-3/10 p-4 text-center"
        >
          <div className="font-orbitron font-black text-2xl text-fire-3 mb-1">{totalCount}</div>
          <div className="font-mono text-[10px] tracking-[2px] uppercase text-fire-3/60">Total</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-black/40 border border-fire-3/10 p-4 text-center"
        >
          <div className="font-orbitron font-black text-2xl text-cyan mb-1">
            {totalCount > 0 ? Math.round((checkedInCount / totalCount) * 100) : 0}%
          </div>
          <div className="font-mono text-[10px] tracking-[2px] uppercase text-fire-3/60">Check-in Rate</div>
        </motion.div>
      </div>

      {/* Mode Toggle */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => {
            setScanMode('camera');
            if (!cameraActive) startCamera();
          }}
          className={`flex-1 py-2.5 px-4 font-orbitron font-bold text-[11px] tracking-[2px] uppercase transition-all ${
            scanMode === 'camera'
              ? 'bg-fire-3 text-black border border-fire-3'
              : 'bg-transparent border border-fire-3/20 text-fire-3/60 hover:border-fire-3 hover:text-fire-3'
          }`}
        >
          <QrCode size={14} className="inline mr-2" />
          QR Camera
        </button>
        <button
          onClick={() => {
            setScanMode('manual');
            stopCamera();
          }}
          className={`flex-1 py-2.5 px-4 font-orbitron font-bold text-[11px] tracking-[2px] uppercase transition-all ${
            scanMode === 'manual'
              ? 'bg-fire-3 text-black border border-fire-3'
              : 'bg-transparent border border-fire-3/20 text-fire-3/60 hover:border-fire-3 hover:text-fire-3'
          }`}
        >
          MANUAL ENTRY
        </button>
      </div>

      {/* Camera Mode */}
      {scanMode === 'camera' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6"
        >
          <div className="bg-black/60 border-2 border-fire-3/30 aspect-video relative overflow-hidden mb-4">
            {cameraActive ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                <canvas ref={canvasRef} style={{ display: 'none' }} />
                <motion.div
                  className="absolute inset-0 border-4 border-cyan/40 pointer-events-none"
                  animate={{ borderColor: ['rgba(0,255,238,0.4)', 'rgba(0,255,238,0.8)', 'rgba(0,255,238,0.4)'] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <motion.div
                  className="absolute inset-4 border-2 border-dashed border-fire-3/20"
                  animate={{ scale: [0.95, 1.05, 0.95] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-fire-3/40">
                <ZoomIn size={48} className="mb-2" />
                <p className="font-mono text-sm">Camera not active</p>
              </div>
            )}
          </div>
          {cameraActive && (
            <button
              onClick={stopCamera}
              className="btn-ghost text-sm py-2.5 px-4 w-full"
            >
              Stop Camera
            </button>
          )}
        </motion.div>
      )}

      {/* Manual Entry Mode */}
      {scanMode === 'manual' && (
        <motion.form onSubmit={handleManualScan} className="mb-6">
          <div className="mb-3">
            <label className="font-mono text-[11px] tracking-[2px] uppercase text-fire-3/60 block mb-2">
              Ticket Code
            </label>
            <input
              id="manual-ticket-input"
              type="text"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder="SD-XXXXXX"
              className="cyber-input w-full font-orbitron font-bold tracking-widest text-center text-lg"
              maxLength="20"
            />
            <p className="font-mono text-[10px] text-fire-3/40 mt-2">Enter ticket code (e.g., SD-ABC123)</p>
          </div>
          <button
            type="submit"
            disabled={!manualInput || updateCheckIn.isPending}
            className="btn-fire w-full py-3 text-sm disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {updateCheckIn.isPending ? 'Processing...' : 'Check In'}
          </button>
        </motion.form>
      )}

      {/* Last Scanned Result */}
      <AnimatePresence>
        {lastScanned && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`p-4 border ${
              lastScanned.status === 'success'
                ? 'bg-green-500/10 border-green-500/30'
                : 'bg-red-500/10 border-red-500/30'
            }`}
          >
            <div className="flex items-start gap-3">
              {lastScanned.status === 'success' ? (
                <CheckCircle2 size={20} className="text-green-400 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <div className={`font-rajdhani font-bold ${lastScanned.status === 'success' ? 'text-green-300' : 'text-red-300'}`}>
                  {lastScanned.status === 'success' 
                    ? `${lastScanned.name} • ${lastScanned.type.toUpperCase()}`
                    : `Check-in Failed`
                  }
                </div>
                {lastScanned.status === 'error' && (
                  <p className="font-mono text-xs text-red-300/70 mt-1">{lastScanned.message}</p>
                )}
                <p className="font-mono text-xs text-fire-3/50 mt-1">
                  {new Date(lastScanned.time).toLocaleTimeString()}
                </p>
              </div>
              <button
                onClick={() => setLastScanned(null)}
                className="text-fire-3/40 hover:text-fire-3 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instructions */}
      <div className="mt-6 bg-fire-3/5 border border-fire-3/10 p-4">
        <p className="font-mono text-[10px] leading-relaxed text-fire-3/50">
          <strong className="text-fire-3/70">How it works:</strong> Scan QR codes from participant tickets using the camera, or enter ticket codes manually. Check-in is recorded immediately with timestamp.
        </p>
      </div>
    </div>
  );
}