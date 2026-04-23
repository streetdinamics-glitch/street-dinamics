import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '../../components/translations';
import AthleteInterviewPrompt from './AthleteInterviewPrompt';
import QRCode from 'qrcode';

export default function SuccessModal({ registration, event, onClose, lang }) {
  const t = useTranslation(lang);
  const [showInterview, setShowInterview] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const canvasRef = useRef(null);
  const isAthlete = registration.type === 'athlete';
  const isOnline = registration.attendance_mode === 'online';

  useEffect(() => {
    // Generate QR code
    // Use same format as EventRegistrations QR scanner for check-in compatibility
    const qrData = `SD-TICKET|${registration.ticket_code}|${registration.event_id}|${registration.email}`;

    QRCode.toDataURL(qrData, {
      width: 200,
      margin: 2,
      color: {
        dark: '#ff9900',
        light: '#000000'
      }
    }).then(url => {
      setQrCodeUrl(url);
    }).catch(err => {
      console.error('QR generation failed:', err);
    });
  }, [registration]);

  return (
    <div className="fixed inset-0 z-[600] bg-black/95 backdrop-blur-xl flex items-center justify-center p-5">
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative bg-gradient-to-br from-[rgba(10,4,18,0.99)] to-[rgba(4,2,8,1)] border clip-cyber p-8 md:p-10 max-w-[500px] w-full text-center"
        style={{ borderColor: isAthlete ? 'rgba(255,80,0,0.3)' : 'rgba(0,255,238,0.25)' }}
      >
        <div className="absolute top-0 left-0 right-0 fire-line" />
        <div className="absolute top-0 right-0 w-[22px] h-[22px] bg-gradient-to-bl from-fire-5 to-fire-2" style={{ clipPath: 'polygon(100% 0,100% 100%,0 0)' }} />

        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.3, duration: 0.8, type: 'spring', stiffness: 200 }}
          className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center"
          style={{ 
            background: isAthlete ? 'rgba(255,100,0,0.1)' : 'rgba(0,255,238,0.1)',
            border: `2px solid ${isAthlete ? 'rgba(255,100,0,0.3)' : 'rgba(0,255,238,0.3)'}`
          }}
        >
          <div 
            className="w-12 h-12 rounded-full"
            style={{ 
              background: isAthlete ? 'rgba(255,100,0,0.2)' : 'rgba(0,255,238,0.2)',
              border: `2px solid ${isAthlete ? 'rgba(255,150,0,0.5)' : 'rgba(0,255,238,0.5)'}`
            }}
          />
        </motion.div>

        <h2 className="text-fire-gradient font-orbitron font-black text-2xl tracking-[2px] mb-2">
          {isAthlete ? t('success_athlete_title') : t('success_spectator_title')}
        </h2>

        <p className="font-rajdhani text-base text-fire-4/60 leading-relaxed mb-6">
          {isAthlete ? t('success_athlete_msg') : t('success_spectator_msg')}
        </p>

        {registration.ticket_code && (
          <div className="bg-black/50 border border-fire-3/20 p-5 mb-6">
            <div className="font-mono text-[10px] tracking-[3px] uppercase text-fire-3/40 mb-2">{t('success_ticket')}</div>
            
            {qrCodeUrl && (
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-white rounded-lg">
                  <img src={qrCodeUrl} alt="Ticket QR Code" className="w-[200px] h-[200px]" />
                </div>
              </div>
            )}
            
            <div className="font-orbitron font-black text-2xl text-fire-5 tracking-[4px] mb-2">{registration.ticket_code}</div>
            {registration.seat_zone && registration.seat_zone !== 'ONLINE' && (
              <div className="font-mono text-sm text-fire-4/50">
                {t('success_seat')}: <span className="text-fire-4">{registration.seat_zone}</span>
              </div>
            )}
            {isOnline && (
              <div className="font-mono text-sm text-cyan/80 mb-2">
                Access: <span className="text-cyan font-bold">Online Stream</span>
              </div>
            )}
            <p className="font-mono text-[9px] text-fire-3/40 tracking-[1px] mt-3">
              Scan QR code at venue entrance for automated check-in
            </p>
          </div>
        )}

        {isAthlete ? (
          <button
            onClick={() => setShowInterview(true)}
            className="btn-fire text-[11px] py-3 px-8"
          >
            PROCEED TO AI INTERVIEW →
          </button>
        ) : (
          <button onClick={onClose} className="btn-fire text-[11px] py-3 px-8">
            {t('success_close')}
          </button>
        )}
      </motion.div>

      {showInterview && (
        <AthleteInterviewPrompt
          registration={registration}
          event={event}
          onClose={() => {
            setShowInterview(false);
            onClose();
          }}
        />
      )}
    </div>
  );
}