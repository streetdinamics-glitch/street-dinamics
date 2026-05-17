/**
 * SDPredictionHub
 * Shows ONLY admin-configured Polymarket and Kalshi links for Street Dinamics events.
 * No external market feeds, no random data — only what admin sets up.
 */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Globe, BarChart2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const PLATFORMS = [
  { id: 'polymarket', label: 'Polymarket', icon: Globe,     borderClass: 'border-purple-500/30', bgClass: 'bg-purple-500/[0.04]', activeClass: 'border-purple-400/60 bg-purple-500/10 text-purple-300', inactiveClass: 'border-white/10 text-white/30' },
  { id: 'kalshi',     label: 'Kalshi',     icon: BarChart2, borderClass: 'border-blue-500/30',   bgClass: 'bg-blue-500/[0.04]',   activeClass: 'border-blue-400/60 bg-blue-500/10 text-blue-300',     inactiveClass: 'border-white/10 text-white/30' },
];

function LinkCard({ link, platform }) {
  const isPolymarket = platform === 'polymarket';
  const borderColor = isPolymarket ? 'border-purple-500/20 hover:border-purple-400/40' : 'border-blue-500/20 hover:border-blue-400/40';
  const bgColor = isPolymarket ? 'bg-purple-500/[0.03] hover:bg-purple-500/[0.06]' : 'bg-blue-500/[0.03] hover:bg-blue-500/[0.06]';
  const textColor = isPolymarket ? 'text-purple-400' : 'text-blue-400';
  const btnBg = isPolymarket ? 'border-purple-500/40 bg-purple-500/10 text-purple-300 hover:bg-purple-500/25 hover:border-purple-400' : 'border-blue-500/40 bg-blue-500/10 text-blue-300 hover:bg-blue-500/25 hover:border-blue-400';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`border ${borderColor} ${bgColor} transition-all p-4`}
      style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))' }}
    >
      {link.event_name && (
        <div className={`font-mono text-[8px] tracking-[2px] uppercase ${textColor} opacity-60 mb-1`}>
          {link.event_name}
        </div>
      )}
      <p className="font-rajdhani font-semibold text-sm text-white/85 leading-tight mb-3">
        {link.label}
      </p>
      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        className={`flex items-center justify-center gap-2 w-full py-2.5 border font-orbitron text-[10px] tracking-[2px] uppercase transition-all ${btnBg}`}
        style={{ clipPath: 'polygon(5px 0%, 100% 0%, calc(100% - 5px) 100%, 0% 100%)' }}
      >
        <ExternalLink size={11} />
        Vai su {PLATFORMS.find(p => p.id === platform)?.label}
      </a>
    </motion.div>
  );
}

export default function SDPredictionHub() {
  const [activeTab, setActiveTab] = useState('polymarket');

  const { data: allLinks = [], isLoading } = useQuery({
    queryKey: ['prediction-links-public'],
    queryFn: () => base44.entities.PredictionLink.list('-created_date', 100),
    staleTime: 60_000,
  });

  const activeLinks = allLinks.filter(l => l.is_active && l.platform === activeTab);

  return (
    <div>
      {/* Platform Tabs */}
      <div className="flex gap-2 mb-5">
        {PLATFORMS.map(({ id, label, icon: Icon, activeClass, inactiveClass }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 font-orbitron text-[9px] tracking-[2px] uppercase px-4 py-2 border transition-all ${activeTab === id ? activeClass : inactiveClass}`}
            style={{ clipPath: 'polygon(5px 0%, 100% 0%, calc(100% - 5px) 100%, 0% 100%)' }}
          >
            <Icon size={11} />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12 gap-3">
          <div className="w-4 h-4 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
          <span className="font-mono text-[9px] text-white/30 uppercase tracking-[2px]">Caricamento...</span>
        </div>
      ) : activeLinks.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-white/5">
          <Globe size={28} className="text-white/10 mx-auto mb-3" />
          <p className="font-orbitron text-sm text-white/20">Nessun mercato disponibile</p>
          <p className="font-mono text-[8px] text-white/15 mt-1 tracking-[1px]">
            L'admin aggiungerà presto i link per questo evento
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {activeLinks.map(link => (
            <LinkCard key={link.id} link={link} platform={activeTab} />
          ))}
        </div>
      )}

      {/* Disclaimer */}
      <div className="mt-4 px-3 py-2 border border-white/5 bg-white/[0.01]">
        <p className="font-mono text-[7px] text-white/15 text-center leading-relaxed">
          Link ufficiali curati da Street Dinamics · Solo mercati relativi agli eventi SD · Non costituisce consulenza finanziaria · Gioca responsabilmente
        </p>
      </div>
    </div>
  );
}