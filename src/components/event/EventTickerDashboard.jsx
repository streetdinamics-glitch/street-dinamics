import React, { useState } from 'react';
import { motion } from 'framer-motion';
import LiveEventTicker from './LiveEventTicker';
import { ChevronDown } from 'lucide-react';

export default function EventTickerDashboard({ eventId, eventStatus = 'live', eventTitle = '' }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-40 bg-gradient-to-b from-black/95 via-black/90 to-black/80 backdrop-blur-lg border-b border-fire-3/20"
    >
      <div className="max-w-full px-4 md:px-8 py-3">
        {/* Header Bar */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-fire-3 animate-pulse" />
            <div>
              <h3 className="font-orbitron text-[12px] tracking-[2px] text-fire-4 uppercase">Live Event</h3>
              <p className="font-mono text-[9px] text-fire-3/60">{eventTitle}</p>
            </div>
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 hover:bg-fire-3/10 border border-fire-3/20 transition-all"
          >
            <ChevronDown
              size={18}
              className={`text-fire-3 transition-transform ${isCollapsed ? '-rotate-180' : ''}`}
            />
          </button>
        </div>

        {/* Expandable Content */}
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <LiveEventTicker eventId={eventId} eventStatus={eventStatus} />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}