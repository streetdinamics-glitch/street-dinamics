import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '../translations';

export default function SpectatorTypeModal({ event, onClose, onSelectType, lang }) {
  const t = useTranslation(lang);
  return (
    <div className="fixed inset-0 z-[500] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-[700px] bg-gradient-to-br from-[rgba(10,4,18,0.99)] to-[rgba(4,2,8,1)] border border-fire-3/20 clip-cyber p-8"
      >
        <div className="absolute top-0 left-0 right-0 fire-line" />
        <div className="absolute top-0 right-0 w-[22px] h-[22px] bg-gradient-to-bl from-fire-5 to-fire-2" style={{ clipPath: 'polygon(100% 0,100% 100%,0 0)' }} />
        
        <button onClick={onClose} className="absolute top-3 right-4 font-mono text-[10px] tracking-[2px] text-fire-3/30 hover:text-fire-3">
          CLOSE
        </button>

        <h2 className="text-fire-gradient font-orbitron font-black text-2xl tracking-[2px] mb-2">
          {t('attendance_title')}
        </h2>
        <p className="font-mono text-[11px] tracking-[3px] uppercase text-fire-3/30 mb-8">
          {event.title}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* In-Person */}
          <motion.button
            onClick={() => onSelectType('in-person')}
            className="relative p-8 bg-gradient-to-br from-fire-3/10 to-fire-2/5 border border-fire-3/30 clip-cyber text-left group overflow-hidden"
            whileHover={{ 
              scale: 1.03, 
              borderColor: 'rgba(255,130,0,0.6)',
              boxShadow: '0 10px 40px rgba(255,100,0,0.3)'
            }}
            whileTap={{ scale: 0.98 }}
            style={{ perspective: '1000px' }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-fire-4/0 to-fire-3/10"
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
            
            <div className="relative z-10">
              <div className="w-16 h-16 mb-4 rounded-full border-2 border-fire-3/40 bg-fire-3/5 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-fire-3/20 border-2 border-fire-4/50" />
              </div>
              
              <h3 className="font-orbitron font-black text-xl tracking-[2px] text-fire-5 mb-2">
                {t('attendance_in_person')}
              </h3>
              <p className="font-rajdhani text-base text-fire-4/60 leading-relaxed">
                {t('attendance_in_person_desc').replace('{location}', event.location)}
              </p>
            </div>
            
            <motion.div
              className="absolute bottom-4 right-4 font-mono text-[9px] tracking-[3px] uppercase text-fire-3/40 group-hover:text-fire-4 transition-colors"
            >
              {t('attendance_select')} →
            </motion.div>
          </motion.button>

          {/* Online */}
          <motion.button
            onClick={() => onSelectType('online')}
            className="relative p-8 bg-gradient-to-br from-cyan/10 to-purple-500/5 border border-cyan/30 clip-cyber text-left group overflow-hidden"
            whileHover={{ 
              scale: 1.03, 
              borderColor: 'rgba(0,255,238,0.6)',
              boxShadow: '0 10px 40px rgba(0,255,238,0.2)'
            }}
            whileTap={{ scale: 0.98 }}
            style={{ perspective: '1000px' }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-cyan/0 to-cyan/10"
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
            
            <div className="relative z-10">
              <div className="w-16 h-16 mb-4 rounded-full border-2 border-cyan/40 bg-cyan/5 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-cyan/20 border-2 border-cyan/50" />
              </div>
              
              <h3 className="font-orbitron font-black text-xl tracking-[2px] text-cyan mb-2">
                {t('attendance_online')}
              </h3>
              <p className="font-rajdhani text-base text-cyan/60 leading-relaxed">
                {t('attendance_online_desc')}
              </p>
            </div>
            
            <motion.div
              className="absolute bottom-4 right-4 font-mono text-[9px] tracking-[3px] uppercase text-cyan/40 group-hover:text-cyan transition-colors"
            >
              {t('attendance_select')} →
            </motion.div>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}