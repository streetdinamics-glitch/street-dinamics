/**
 * LiveMarketsFeed
 * Shows live odds from Polymarket and Kalshi directly in the dashboard.
 * Data is fetched via backend functions (no CORS issues).
 */
import React, { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, TrendingUp, RefreshCw, Search, Globe, BarChart2 } from 'lucide-react';

const PLATFORMS = [
  { id: 'polymarket', label: 'Polymarket', icon: Globe,     fn: 'fetchPolymarketMarkets', color: 'purple', accentClass: 'text-purple-300', borderClass: 'border-purple-500/30', bgClass: 'bg-purple-500/[0.04]', activeBorder: 'border-purple-400/60', activeBg: 'bg-purple-500/10' },
  { id: 'kalshi',     label: 'Kalshi',     icon: BarChart2, fn: 'fetchKalshiMarkets',     color: 'blue',   accentClass: 'text-blue-300',   borderClass: 'border-blue-500/30',   bgClass: 'bg-blue-500/[0.04]',   activeBorder: 'border-blue-400/60',   activeBg: 'bg-blue-500/10'   },
];

function ProbBar({ outcomes, color }) {
  if (!outcomes?.length) return null;
  const yes = outcomes[0];
  const no  = outcomes[1] || { label: 'No', prob: 100 - yes.prob };
  const isRed = yes.prob < 50;

  return (
    <div className="mt-3">
      <div className="flex justify-between items-center mb-1.5">
        {outcomes.slice(0, 2).map((o, i) => (
          <span key={i} className={`font-orbitron text-xs font-bold ${
            i === 0
              ? (yes.prob >= 50 ? 'text-green-400' : 'text-red-400')
              : 'text-white/40'
          }`}>
            {o.label} <span className="text-[10px]">{o.prob}%</span>
          </span>
        ))}
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden flex">
        <div
          className={`h-full rounded-full transition-all duration-500 ${yes.prob >= 50 ? 'bg-green-500' : 'bg-red-500'}`}
          style={{ width: `${yes.prob}%` }}
        />
        <div className="h-full bg-white/10 flex-1" />
      </div>
    </div>
  );
}

function MarketCard({ market, platform }) {
  const p = PLATFORMS.find(p => p.id === platform);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`border ${p.borderClass} ${p.bgClass} p-4 transition-all hover:${p.activeBorder} hover:${p.activeBg}`}
      style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))' }}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="font-rajdhani text-sm text-white/80 leading-snug line-clamp-2 flex-1">
          {market.question}
        </p>
        <a
          href={market.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
          className={`flex-shrink-0 p-1.5 border ${p.borderClass} ${p.accentClass} hover:${p.activeBorder} transition-all rounded-sm`}
          title={`Apri su ${p.label}`}
        >
          <ExternalLink size={11} />
        </a>
      </div>

      <ProbBar outcomes={market.outcomes} color={p.color} />

      <div className="flex items-center gap-3 mt-2">
        {market.volumeFormatted && (
          <span className="font-mono text-[8px] text-white/25 flex items-center gap-1">
            <TrendingUp size={9} />
            Vol {market.volumeFormatted}
          </span>
        )}
        {market.category && (
          <span className="font-mono text-[8px] text-white/20 uppercase tracking-[1px]">
            {market.category}
          </span>
        )}
      </div>
    </motion.div>
  );
}

function MarketSkeleton() {
  return (
    <div className="border border-white/5 p-4 animate-pulse" style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))' }}>
      <div className="h-3 bg-white/5 rounded mb-2 w-3/4" />
      <div className="h-3 bg-white/5 rounded mb-3 w-1/2" />
      <div className="h-2 bg-white/5 rounded-full" />
    </div>
  );
}

export default function LiveMarketsFeed() {
  const [activeTab, setActiveTab]   = useState('polymarket');
  const [search, setSearch]         = useState('');
  const [debouncedSearch, setDebounced] = useState('');

  // Debounce search
  const handleSearch = useCallback((val) => {
    setSearch(val);
    clearTimeout(window._mktSearchTimer);
    window._mktSearchTimer = setTimeout(() => setDebounced(val), 500);
  }, []);

  const activePlatform = PLATFORMS.find(p => p.id === activeTab);

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['live-markets', activeTab, debouncedSearch],
    queryFn: () => base44.functions.invoke(activePlatform.fn, { search: debouncedSearch, limit: 12 })
      .then(r => r.data),
    staleTime: 2 * 60 * 1000,
    placeholderData: (prev) => prev, // keeps old data visible during refetch
    retry: 1,
  });

  const markets = data?.markets || [];
  const fetchedAt = data?.fetchedAt ? new Date(data.fetchedAt).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }) : null;

  return (
    <div className="mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="font-mono text-[9px] tracking-[5px] uppercase text-fire-3/40">LIVE</p>
          <h3 className="font-orbitron font-bold text-lg text-fire-4">Quote in Tempo Reale</h3>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-1.5 font-mono text-[8px] uppercase tracking-[1px] text-white/30 hover:text-white/60 transition-colors border border-white/10 px-2 py-1.5"
        >
          <RefreshCw size={10} className={isFetching ? 'animate-spin' : ''} />
          {fetchedAt ? `Agg. ${fetchedAt}` : 'Aggiorna'}
        </button>
      </div>

      {/* Platform tabs */}
      <div className="flex gap-2 mb-4">
        {PLATFORMS.map(({ id, label, icon: Icon, accentClass, activeBorder, activeBg, borderClass }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 font-orbitron text-[9px] tracking-[1px] uppercase px-4 py-2 border transition-all ${
              activeTab === id
                ? `${activeBorder} ${activeBg} ${accentClass}`
                : 'border-white/10 text-white/30 hover:border-white/20'
            }`}
            style={{ clipPath: 'polygon(5px 0%, 100% 0%, calc(100% - 5px) 100%, 0% 100%)' }}
          >
            <Icon size={11} />
            {label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
        <input
          type="text"
          value={search}
          onChange={e => handleSearch(e.target.value)}
          placeholder={`Cerca mercati su ${activePlatform.label}...`}
          className="cyber-input w-full pl-9 text-sm py-2"
        />
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="space-y-3">
            {[...Array(4)].map((_, i) => <MarketSkeleton key={i} />)}
          </motion.div>
        ) : isError || (data?.error && markets.length === 0) ? (
          <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="text-center py-10 border border-dashed border-white/5">
            <p className="font-mono text-sm text-white/20">Feed temporaneamente non disponibile</p>
            <button onClick={() => refetch()} className="font-mono text-[9px] text-fire-3/40 mt-2 hover:text-fire-3 underline">
              Riprova
            </button>
          </motion.div>
        ) : markets.length === 0 ? (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="text-center py-10 border border-dashed border-white/5">
            <p className="font-mono text-sm text-white/20">Nessun mercato trovato</p>
          </motion.div>
        ) : (
          <motion.div key={`${activeTab}-${debouncedSearch}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="space-y-3">
            {markets.map(market => (
              <MarketCard key={market.id} market={market} platform={activeTab} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Disclaimer */}
      <div className="mt-4 px-3 py-2 border border-white/5 bg-white/[0.01]">
        <p className="font-mono text-[7px] text-white/15 text-center leading-relaxed">
          Dati forniti da {activePlatform.label} via API pubblica · Quote in tempo reale · Non costituisce consulenza finanziaria · Gioca responsabilmente
        </p>
      </div>
    </div>
  );
}