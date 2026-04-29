import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '../../components/translations';
import AthleteInterviewPrompt from './AthleteInterviewPrompt';
import QRCode from 'qrcode';

export default function SuccessModal({ registration, event, onClose, lang }) {
  const t = useTranslation(lang);
  const [showInterview, setShowInterview] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const isAthlete = registration.type === 'athlete';
  const isOnline = registration.attendance_mode === 'online';
  const whatsappLink = event?.whatsapp_channel_link;

  useEffect(() => {
    const qrData = `SD-TICKET|${registration.ticket_code}|${registration.event_id}|${registration.email}`;
    QRCode.toDataURL(qrData, {
      width: 200,
      margin: 2,
      color: { dark: '#ff9900', light: '#000000' }
    }).then(setQrCodeUrl).catch(console.error);
  }, [registration]);

  return (
    <div className="fixed inset-0 z-[600] bg-black/95 backdrop-blur-xl flex items-center justify-center p-5 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative bg-gradient-to-br from-[rgba(10,4,18,0.99)] to-[rgba(4,2,8,1)] border clip-cyber p-8 md:p-10 max-w-[520px] w-full text-center my-4"
        style={{ borderColor: isAthlete ? 'rgba(255,80,0,0.3)' : 'rgba(0,255,238,0.25)' }}
      >
        <div className="absolute top-0 left-0 right-0 fire-line" />
        <div className="absolute top-0 right-0 w-[22px] h-[22px] bg-gradient-to-bl from-fire-5 to-fire-2" style={{ clipPath: 'polygon(100% 0,100% 100%,0 0)' }} />

        {/* Icon */}
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
          <span className="text-4xl">{isAthlete ? '⚔️' : '🎟️'}</span>
        </motion.div>

        <h2 className="text-fire-gradient font-orbitron font-black text-2xl tracking-[2px] mb-2">
          {isAthlete ? t('success_athlete_title') : t('success_spectator_title')}
        </h2>
        <p className="font-rajdhani text-base text-fire-4/60 leading-relaxed mb-6">
          {isAthlete ? t('success_athlete_msg') : t('success_spectator_msg')}
        </p>

        {/* Ticket */}
        {registration.ticket_code && (
          <div className="bg-black/50 border border-fire-3/20 p-5 mb-5 text-left">
            <div className="font-mono text-[10px] tracking-[3px] uppercase text-fire-3/40 mb-3 text-center">{t('success_ticket')}</div>
            {qrCodeUrl && (
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-white rounded-lg">
                  <img src={qrCodeUrl} alt="Ticket QR Code" className="w-[180px] h-[180px]" />
                </div>
              </div>
            )}
            <div className="font-orbitron font-black text-xl text-fire-5 tracking-[4px] mb-2 text-center">{registration.ticket_code}</div>
            {registration.seat_zone && registration.seat_zone !== 'ONLINE' && (
              <div className="font-mono text-sm text-fire-4/50 text-center">
                {t('success_seat')}: <span className="text-fire-4">{registration.seat_zone}</span>
              </div>
            )}
            {isOnline && (
              <div className="font-mono text-sm text-cyan/80 text-center mb-1">
                Access: <span className="text-cyan font-bold">Online Stream</span>
              </div>
            )}
            <p className="font-mono text-[9px] text-fire-3/40 tracking-[1px] mt-3 text-center">
              Mostra il QR code all'ingresso per il check-in automatico
            </p>
          </div>
        )}

        {/* WhatsApp Channel — shown for both athletes and fans/spectators */}
        {whatsappLink && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-5 p-4 border border-green-500/40 bg-green-500/10"
            style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))' }}
          >
            <div className="flex items-center gap-2 justify-center mb-2">
              <span className="text-2xl">💬</span>
              <span className="font-orbitron text-sm font-bold text-green-400 tracking-[1px]">CANALE WHATSAPP</span>
            </div>
            <p className="font-rajdhani text-sm text-green-300/80 mb-3">
              {isAthlete
                ? 'Unisciti al canale WhatsApp ufficiale per ricevere tutte le istruzioni, l\'orario di check-in, le regole e gli aggiornamenti dell\'evento.'
                : 'Unisciti al canale WhatsApp per ricevere aggiornamenti in tempo reale sull\'evento, accesso stream e notizie esclusive.'}
            </p>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-orbitron text-[11px] tracking-[2px] uppercase transition-all"
              style={{ clipPath: 'polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)' }}
            >
              <span>💬</span>
              UNISCITI AL CANALE
            </a>
          </motion.div>
        )}

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {isAthlete ? (
            <>
              <button onClick={() => setShowInterview(true)} className="btn-fire text-[11px] py-3 px-6">
                PROCEED TO AI INTERVIEW →
              </button>
              <button onClick={onClose} className="btn-ghost text-[11px] py-3 px-6">
                Chiudi
              </button>
            </>
          ) : (
            <button onClick={onClose} className="btn-fire text-[11px] py-3 px-8">
              {t('success_close')}
            </button>
          )}
        </div>
      </motion.div>

      {showInterview && (
        <AthleteInterviewPrompt
          registration={registration}
          event={event}
          onClose={() => { setShowInterview(false); onClose(); }}
        />
      )}
    </div>
  );
}