import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { useTranslation } from '../translations';

export default function EventCard({ event, index, onRegisterAthlete, onRegisterSpectator, lang }) {
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
      initial={{ opacity: 0, y: 30, rotateX: 15 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      whileHover={{ 
        y: -12, 
        rotateX: -3,
        rotateY: 2,
        scale: 1.02,
        transition: { duration: 0.3 }
      }}
      transition={{ delay: index * 0.08, duration: 0.6 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="event-card-shell relative"
      style={{ 
        perspective: '1000px',
        transformStyle: 'preserve-3d',
      }}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-fire-3/5 via-transparent to-purple-500/5 rounded-lg"
        animate={isHovered ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.3 }}
        style={{ transform: 'translateZ(-10px)' }}
      />

      <div className="absolute top-0 left-0 right-0 fire-line" style={{ animationDelay: `${-index}s` }} />
      <div className="absolute top-0 right-0 w-4 h-4 bg-gradient-to-bl from-fire-4 to-fire-2" style={{ clipPath: 'polygon(100% 0,100% 100%,0 0)' }} />
      
      <motion.div 
        className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyber-cyan/30 to-transparent pointer-events-none" 
        animate={isHovered ? { y: [-20, 400], opacity: [0, 1, 0] } : { y: -20, opacity: 0 }}
        transition={{ duration: 1.5, repeat: isHovered ? Infinity : 0, ease: 'linear' }}
      />

      {/* Status Badges with 3D effect */}
      {event.status === 'live' && (
        <motion.div 
          className="absolute top-3 right-3 px-3 py-1.5 bg-green-500/15 border border-green-500/40 font-mono text-[9px] tracking-[2px] uppercase text-green-400 flex items-center gap-1.5"
          animate={{ 
            boxShadow: [
              '0 0 10px rgba(34,197,94,0.3)',
              '0 0 20px rgba(34,197,94,0.6)',
              '0 0 10px rgba(34,197,94,0.3)',
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ transform: 'translateZ(20px)' }}
        >
          <motion.div 
            className="w-2 h-2 rounded-full bg-green-400" 
            animate={{ 
              scale: [1, 1.3, 1],
              opacity: [1, 0.5, 1]
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          {t('event_live')}
        </motion.div>
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
        <motion.div 
          className="inline-flex items-center gap-1.5 font-mono text-[9px] tracking-[3px] uppercase text-fire-3 border border-fire-3/25 bg-fire-3/5 px-2.5 py-1 mb-3 self-start clip-btn"
          whileHover={{ scale: 1.05 }}
        >
          <motion.div 
            className="w-1.5 h-1.5 rounded-full bg-fire-3 shadow-[0_0_5px_var(--fire-3)]" 
            animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          {event.sport || 'STREET SPORT'}
        </motion.div>

        <motion.h3 
          className="font-orbitron font-extrabold text-[clamp(16px,2.6vw,26px)] leading-tight tracking-[1px] text-fire-6/90 mb-1"
          animate={isHovered ? { x: [0, 5, 0] } : {}}
          transition={{ duration: 0.5 }}
        >
          {event.title}
        </motion.h3>

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
              transition={{ duration: 1.5, ease: 'easeOut' }}
            >
              <motion.div 
                className="absolute right-[-4px] top-[-4px] w-2.5 h-2.5 rounded-full bg-fire-6 shadow-[0_0_10px_var(--fire-5)]" 
                animate={{ 
                  boxShadow: [
                    '0 0 10px var(--fire-5)',
                    '0 0 20px var(--fire-5)',
                    '0 0 10px var(--fire-5)'
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>
          </div>
        </div>

        {/* Stream buttons with 3D hover */}
        {(hasLiveStream || hasVOD) && streamUrl && (
          <motion.button
            onClick={handleStreamClick}
            className="btn-fire text-[10px] py-2.5 px-3 mb-2 text-center relative overflow-hidden w-full cursor-pointer"
            whileHover={{ 
              scale: 1.05, 
              rotateX: -5,
              boxShadow: '0 6px 25px rgba(255,100,0,0.5)',
            }}
            whileTap={{ scale: 0.98 }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-fire-5/30 via-fire-3/30 to-fire-5/30"
              animate={{ x: [-100, 100] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            />
            <span className="relative z-10">{hasLiveStream ? t('event_watch_stream') : t('event_watch_vod')}</span>
          </motion.button>
        )}

        {/* Registration buttons with 3D depth */}
        {event.status !== 'ended' && (
          <div className="grid grid-cols-2 gap-2" style={{ perspective: '800px' }}>
            <motion.button 
              onClick={() => onRegisterAthlete?.(event)} 
              className="btn-fire text-[10px] py-2.5 px-2"
              whileHover={{ scale: 1.05, rotateX: -5 }}
              whileTap={{ scale: 0.98 }}
            >
              {t('event_register_athlete')}
            </motion.button>
            <motion.button 
              onClick={() => onRegisterSpectator?.(event)} 
              className="btn-ghost text-[10px] py-2.5 px-2"
              whileHover={{ scale: 1.05, rotateX: -5 }}
              whileTap={{ scale: 0.98 }}
            >
              {t('event_register_spectator')}
            </motion.button>
          </div>
        )}
      </div>
    </motion.div>
  );
}