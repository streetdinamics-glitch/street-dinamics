import React, { useState, memo } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { useTranslation } from '../translations';

function EventCard({ event, index, onRegisterAthlete, onRegisterSpectator, lang }) {
  const t = useTranslation(lang);
  const [isHovered, setIsHovered] = useState(false);
  const filled = event.filled_spots || 0;
  const max = event.max_spots || 32;
  const pct = Math.min((filled / max) * 100, 100);

  const hasLiveStream = event.status === 'live' && (event.kick_live_url || event.youtube_live_url);
  const hasVOD = event.status === 'ended' && (event.kick_vod_url || event.youtube_vod_url);
  
  // Safely construct stream URL with validation
  const getStreamUrl = () => {
    if (event.status === 'live') {
      return event.kick_live_url || event.youtube_live_url || '';
    }
    if (event.status === 'ended') {
      return event.kick_vod_url || event.youtube_vod_url || '';
    }
    return '';
  };
  
  const streamUrl = getStreamUrl();
  
  // Safe URL opener that always works
  const handleStreamClick = (e) => {
    e.preventDefault();
    if (!streamUrl) return;
    
    try {
      // Ensure URL is valid
      const url = streamUrl.startsWith('http') ? streamUrl : `https://${streamUrl}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      // Fallback: try direct navigation
      try {
        window.location.href = streamUrl;
      } catch {
        console.error('Failed to open stream URL');
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, scale: 1.015, transition: { duration: 0.22, ease: 'easeOut' } }}
      transition={{ delay: Math.min(index * 0.06, 0.3), duration: 0.5 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="event-card-shell relative"
      style={{ willChange: 'transform' }}
    >
      {/* Hover glow — CSS transition, no JS animate */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-fire-3/5 via-transparent to-purple-500/5 rounded-lg pointer-events-none transition-opacity duration-300"
        style={{ opacity: isHovered ? 1 : 0 }}
      />

      <div className="absolute top-0 left-0 right-0 fire-line" />
      <div className="absolute top-0 right-0 w-4 h-4 bg-gradient-to-bl from-fire-4 to-fire-2" style={{ clipPath: 'polygon(100% 0,100% 100%,0 0)' }} />

      {/* Scan line — only renders DOM when hovered */}
      {isHovered && (
        <motion.div
          className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyber-cyan/40 to-transparent pointer-events-none"
          animate={{ y: [-20, 420], opacity: [0, 0.9, 0] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
        />
      )}

      {/* Status Badges with 3D effect */}
      {event.status === 'live' && (
        <div className="absolute top-3 right-3 px-3 py-1.5 bg-green-500/15 border border-green-500/40 font-mono text-[9px] tracking-[2px] uppercase text-green-400 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          {t('event_live')}
        </div>
      )}
      {event.status === 'ended' && (
        <motion.div 
          className="absolute top-3 right-3 px-3 py-1.5 bg-red-500/10 border border-red-500/30 font-mono text-[9px] tracking-[2px] uppercase text-red-400"
          style={{ transform: 'translateZ(20px)' }}
        >
          {t('event_ended')}
        </motion.div>
      )}

      <div className="p-5 relative z-[1] flex flex-col min-h-[380px]">
        <div className="inline-flex items-center gap-1.5 font-mono text-[9px] tracking-[3px] uppercase text-fire-3 border border-fire-3/25 bg-fire-3/5 px-2.5 py-1 mb-3 self-start clip-btn">
          <span className="w-1.5 h-1.5 rounded-full bg-fire-3 shadow-[0_0_5px_var(--fire-3)] animate-pulse" />
          {event.sport || 'STREET SPORT'}
        </div>

        <h3 className="font-orbitron font-extrabold text-[clamp(16px,2.6vw,26px)] leading-tight tracking-[1px] text-fire-6/90 mb-1 transition-transform duration-200"
          style={{ transform: isHovered ? 'translateX(4px)' : 'translateX(0)' }}>
          {event.title}
        </h3>

        <p className="font-mono text-[13px] tracking-[2px] text-fire-5 mb-3">
          {event.date ? format(new Date(event.date), 'dd MMM yyyy').toUpperCase() : 'TBA'}
        </p>

        <div className="h-[1px] bg-gradient-to-r from-fire-2/40 to-fire-2/5 mb-3" />

        <p className="text-sm font-semibold tracking-[1.5px] uppercase text-fire-4/60 mb-2.5">
          {event.location}
        </p>

        <p className="text-base font-normal leading-relaxed text-fire-4/35 flex-grow mb-3.5">
          {event.description}
        </p>

        <div className="mb-4">
          <div className="flex justify-between font-mono text-[11px] tracking-[2px] uppercase text-fire-3/30 mb-1.5">
            <span>{t('event_spots').toUpperCase()}</span>
            <span>{filled} / {max}</span>
          </div>
          <div className="h-[2px] bg-fire-3/10 relative overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-fire-2 to-fire-5 relative"
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
            >
              <div className="absolute right-[-4px] top-[-4px] w-2.5 h-2.5 rounded-full bg-fire-6 shadow-[0_0_8px_var(--fire-5)]" />
            </motion.div>
          </div>
        </div>

        {/* Stream button */}
        {(hasLiveStream || hasVOD) && streamUrl && (
          <motion.button
            onClick={handleStreamClick}
            className="btn-fire text-[10px] py-2.5 px-3 mb-2 text-center w-full cursor-pointer"
            whileHover={{ scale: 1.04, boxShadow: '0 6px 22px rgba(255,100,0,0.45)' }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 22 }}
          >
            {hasLiveStream ? t('event_watch_stream') : t('event_watch_vod')}
          </motion.button>
        )}

        {/* Registration buttons */}
        {event.status !== 'ended' && (
          <div className="grid grid-cols-2 gap-2">
            <motion.button
              onClick={() => onRegisterAthlete?.(event)}
              className="btn-fire text-[10px] py-2.5 px-2"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 22 }}
            >
              {t('event_register_athlete')}
            </motion.button>
            <motion.button
              onClick={() => onRegisterSpectator?.(event)}
              className="btn-ghost text-[10px] py-2.5 px-2"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 22 }}
            >
              {t('event_register_spectator')}
            </motion.button>
          </div>
        )}
        </div>
    </motion.div>
  );
}

export default memo(EventCard);