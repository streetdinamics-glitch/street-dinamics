import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Camera, CheckCircle, XCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';

export default function QRScanner({ onClose }) {
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [manualCode, setManualCode] = useState('');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const queryClient = useQueryClient();

  const checkInMutation = useMutation({
    mutationFn: async ({ registrationId }) => {
      return await base44.entities.Registration.update(registrationId, {
        checked_in: true,
        check_in_time: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registrations'] });
      toast.success('Check-in successful');
    }
  });

  const verifyTicket = async (ticketData) => {
    try {
      const parsed = JSON.parse(ticketData);
      const registrations = await base44.entities.Registration.filter({
        ticket_code: parsed.ticket_code
      });

      if (registrations.length === 0) {
        setScanResult({
          success: false,
          message: 'Invalid ticket code'
        });
        return;
      }

      const registration = registrations[0];
      
      if (registration.checked_in) {
        setScanResult({
          success: false,
          message: 'Ticket already checked in',
          data: registration
        });
        return;
      }

      setScanResult({
        success: true,
        message: 'Valid ticket',
        data: registration
      });

      // Auto check-in
      checkInMutation.mutate({ registrationId: registration.id });

    } catch (err) {
      setScanResult({
        success: false,
        message: 'Invalid QR code format'
      });
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
      setScanning(true);
    } catch (err) {
      toast.error('Camera access denied');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setScanning(false);
  };

  const captureFrame = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    // In production, use a QR code detection library like jsQR
    // For now, we'll use manual input
    stopCamera();
  };

  const handleManualVerify = () => {
    if (!manualCode.trim()) return;
    
    // Try to verify as ticket code directly
    base44.entities.Registration.filter({ ticket_code: manualCode.trim() })
      .then(registrations => {
        if (registrations.length === 0) {
          setScanResult({
            success: false,
            message: 'Invalid ticket code'
          });
          return;
        }

        const registration = registrations[0];
        
        if (registration.checked_in) {
          setScanResult({
            success: false,
            message: 'Ticket already checked in',
            data: registration
          });
          return;
        }

        setScanResult({
          success: true,
          message: 'Valid ticket',
          data: registration
        });

        checkInMutation.mutate({ registrationId: registration.id });
      });
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[800] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-[500px] bg-gradient-to-br from-[rgba(10,4,18,0.99)] to-[rgba(4,2,8,1)] border border-fire-3/20 clip-cyber p-6"
      >
        <div className="absolute top-0 left-0 right-0 fire-line" />
        
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-fire-3/30 hover:text-fire-3"
        >
          <X size={20} />
        </button>

        <h2 className="text-fire-gradient font-orbitron font-black text-2xl tracking-[2px] mb-6 uppercase">
          TICKET CHECK-IN
        </h2>

        {!scanning && !scanResult && (
          <div className="space-y-4">
            <button
              onClick={startCamera}
              className="btn-fire w-full text-[11px] py-3 flex items-center justify-center gap-2"
            >
              <Camera size={16} />
              SCAN QR CODE
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-fire-3/20" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-[rgba(4,2,8,1)] px-2 text-fire-3/40 font-mono">OR</span>
              </div>
            </div>

            <div>
              <label className="font-mono text-[11px] tracking-[2px] uppercase text-fire-3/40 block mb-2">
                Manual Ticket Code
              </label>
              <input
                className="cyber-input mb-3"
                value={manualCode}
                onChange={e => setManualCode(e.target.value)}
                placeholder="Enter ticket code"
                onKeyPress={e => e.key === 'Enter' && handleManualVerify()}
              />
              <button
                onClick={handleManualVerify}
                disabled={!manualCode.trim()}
                className="btn-ghost w-full text-[11px] py-2.5 disabled:opacity-40"
              >
                VERIFY
              </button>
            </div>
          </div>
        )}

        {scanning && (
          <div className="space-y-4">
            <div className="relative bg-black aspect-square rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />
              
              <div className="absolute inset-0 border-4 border-fire-3/30 pointer-events-none">
                <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-fire-3" />
                <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-fire-3" />
                <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-fire-3" />
                <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-fire-3" />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={stopCamera}
                className="btn-ghost flex-1 text-[11px] py-2.5"
              >
                CANCEL
              </button>
              <button
                onClick={captureFrame}
                className="btn-fire flex-1 text-[11px] py-2.5"
              >
                CAPTURE
              </button>
            </div>
            
            <p className="text-center font-mono text-[9px] text-fire-3/40 tracking-[1px]">
              Position QR code within frame
            </p>
          </div>
        )}

        {scanResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className={`p-6 rounded-lg border-2 text-center ${
              scanResult.success 
                ? 'bg-green-500/10 border-green-500/40' 
                : 'bg-red-500/10 border-red-500/40'
            }`}>
              {scanResult.success ? (
                <CheckCircle size={48} className="text-green-400 mx-auto mb-3" />
              ) : (
                <XCircle size={48} className="text-red-400 mx-auto mb-3" />
              )}
              
              <h3 className={`font-orbitron font-bold text-xl mb-2 ${
                scanResult.success ? 'text-green-400' : 'text-red-400'
              }`}>
                {scanResult.message}
              </h3>
              
              {scanResult.data && (
                <div className="mt-4 text-left font-mono text-sm text-fire-4/60 space-y-1">
                  <p><strong>Name:</strong> {scanResult.data.first_name} {scanResult.data.last_name}</p>
                  <p><strong>Code:</strong> {scanResult.data.ticket_code}</p>
                  <p><strong>Type:</strong> {scanResult.data.type}</p>
                  {scanResult.data.seat_zone && (
                    <p><strong>Seat:</strong> {scanResult.data.seat_zone}</p>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={() => {
                setScanResult(null);
                setManualCode('');
              }}
              className="btn-fire w-full text-[11px] py-3"
            >
              SCAN ANOTHER
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}