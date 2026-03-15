import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Crown, Clock } from 'lucide-react';

export default function EarlyAccessGate({ dropDate, fanTier, requiredTier = 'superfan' }) {
  const tierHierarchy = ['rookie', 'enthusiast', 'superfan', 'legend', 'hall_of_fame'];
  const userTierIndex = tierHierarchy.indexOf(fanTier || 'rookie');
  const requiredTierIndex = tierHierarchy.indexOf(requiredTier);
  
  const hasAccess = userTierIndex >= requiredTierIndex;
  
  const earlyAccessHours = {
    superfan: 24,
    legend: 48,
    hall_of_fame: 72,
  };

  const hoursEarly = earlyAccessHours[fanTier] || 0;
  const earlyAccessDate = new Date(new Date(dropDate).getTime() - hoursEarly * 60 * 60 * 1000);
  const publicDropDate = new Date(dropDate);
  const now = new Date();

  const isEarlyAccessPeriod = now >= earlyAccessDate && now < publicDropDate;
  const isPubliclyAvailable = now >= publicDropDate;

  if (isPubliclyAvailable) {
    return null; // No gate needed
  }

  if (!hasAccess && isEarlyAccessPeriod) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-black/90 backdrop-blur-md z-20 flex items-center justify-center"
      >
        <div className="text-center p-8">
          <Lock size={48} className="text-fire-3/40 mx-auto mb-4" />
          <div className="font-orbitron font-bold text-xl text-fire-5 mb-2">Early Access Only</div>
          <p className="font-mono text-sm text-fire-3/60 mb-4">
            Available for {requiredTier}+ tier fans
          </p>
          <div className="flex items-center gap-2 justify-center text-fire-3/40">
            <Clock size={16} />
            <span className="font-mono text-xs">
              Public release: {publicDropDate.toLocaleString()}
            </span>
          </div>
        </div>
      </motion.div>
    );
  }

  if (hasAccess && isEarlyAccessPeriod) {
    return (
      <div className="absolute top-3 left-3 px-3 py-1.5 bg-gradient-to-r from-yellow-500 to-orange-500 border border-yellow-400/50 font-mono text-[8px] tracking-[2px] uppercase text-black z-10 flex items-center gap-1.5">
        <Crown size={12} />
        EARLY ACCESS
      </div>
    );
  }

  return null;
}