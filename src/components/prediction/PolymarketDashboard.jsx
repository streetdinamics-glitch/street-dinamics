import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ExternalLink, RefreshCw, Search, TrendingUp, TrendingDown,
  Activity, Zap, Globe, AlertTriangle, BarChart3, Clock, Droplets
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

// ─── Fetcher ────────────────────────────────────────────────────────────────
async function fetchMarkets({ search = '', limit = 20 } = {}) {
  const res = await base44.functions.invoke('fetchPolymarketMarkets', { search, limit });
  return res.data;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getProbColor(prob) {
  if (prob >= 70) return 'text-green-400';
  if (prob >= 50) return 'text-yellow-400';
  if (prob >= 30) return 'text-orange-400';
  return 'text-red-400';
}

function OutcomeBar({ outcomes = [] }) {
  if (outcomes.length === 0) return null;
  const yes = outcomes.find(o => o.label === 'Yes') || outcomes[0];
  const no  = outcomes.find(o => o.label === 'No')  || outcomes[1];
  if (!yes || !no) return null;
  return (
    <div className="w-full h-1.5 flex overflow-hidden rounded-full bg-white/5">
      <div className="h-full bg-gradient-to-r from-green-600 to-green-400 transition-all duration-700"
        style={{ width: `${yes.prob}%` }} />
      <div className="h-full bg-gradient-to-l from-red-600 to-red-400 flex-1 transition-all duration-700" />
    </div>
  );
}

// ─── Market Card ─────────────────────────────────────────────────────────────
function PolymarketCard({ market, index }) {
  const [expanded, setExpanded] = useState(false);
  const yes = market.outcomes?.find(o => o.label === 'Yes') || market.outcomes?.[0];
  const no  = market.outcomes?.find(o => o.label === 'No')  || market.outcomes?.[1];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="border border-purple-500/20 bg-purple-500/[0.03] hover:border-purple-400/40 hover:bg-purple-500/[0.06] transition-all cursor-pointer"
      style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))' }}
      onClick={() => setExpanded(e => !e)}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          {market.image && (
            <img src={market.image} alt="" className="w-8 h-8 rounded object-cover flex-shrink-0 border border-white/10" />
          )}
          <div className="flex-1 min-w-0">
            <p className="font-rajdhani font-semibold text-sm text-white/85 leading-tight line-clamp-2">
              {market.question}
            </p>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <span className="font-mono text-[8px] text-purple-400/50 border border-purple-400/15 px-1.5 py-0.5">
                VOL {market.volumeFormatted}
              </span>
              <span className="font-mono text-[8px] text-blue-400/50 flex items-center gap-1">
                <Droplets size={7} /> LIQ {market.liquidityFormatted}
              </span>
            </div>
          </div>
          <a
            href={market.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="flex-shrink-0 p-1.5 border border-purple-400/20 bg-purple-500/10 hover:bg-purple-500/25 text-purple-400 transition-all"
            title="Apri su Polymarket"
          >
            <ExternalLink size={11} />
          </a>
        </div>

        {/* Outcome bar */}
        <OutcomeBar outcomes={market.outcomes} />

        {/* Probabilities */}
        <div className="flex items-center gap-2 mt-2">
          {yes && (
            <div className="flex items-center gap-1">
              <TrendingUp size={10} className="text-green-400" />
              <span className="font-orbitron text-xs font-black text-green-400">{yes.prob}%</span>
              <span className="font-mono text-[8px] text-white/25">{yes.label}</span>
            </div>
          )}
          <div className="w-[1px] h-3 bg-white/10" />
          {no && (
            <div className="flex items-center gap-1">
              <TrendingDown size={10} className="text-red-400" />
              <span className="font-orbitron text-xs font-black text-red-400">{no.prob}%</span>
              <span className="font-mono text-[8px] text-white/25">{no.label}</span>
            </div>
          )}
          <div className="ml-auto">
            {market.outcomes?.length > 2 && (
              <span className="font-mono text-[8px] text-white/30">+{market.outcomes.length - 2} more</span>
            )}
          </div>
        </div>
      </div>

      {/* Expanded: all outcomes + bet button */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-purple-500/15"
          >
            <div className="p-4 space-y-2">
              {market.outcomes?.map((o, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="font-rajdhani text-sm text-white/60">{o.label}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-28 h-1 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all"
                        style={{
                          width: `${o.prob}%`,
                          background: i === 0 ? 'linear-gradient(90deg,#16a34a,#4ade80)' : 'linear-gradient(90deg,#dc2626,#f87171)'
                        }} />
                    </div>
                    <span className={`font-orbitron text-sm font-black w-10 text-right ${getProbColor(o.prob)}`}>
                      {o.prob}%
                    </span>
                    <span className="font-mono text-[9px] text-white/30 w-10 text-right">
                      ${o.price.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}

              {market.description && (
                <p className="font-rajdhani text-xs text-white/30 leading-relaxed border-t border-white/5 pt-2 mt-2">
                  {market.description.slice(0, 200)}{market.description.length > 200 ? '…' : ''}
                </p>
              )}

              <a
                href={market.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full mt-3 py-2.5 border border-purple-500/50 bg-purple-500/15 text-purple-300 hover:bg-purple-500/25 hover:border-purple-400 transition-all font-orbitron text-[10px] tracking-[2px] uppercase"
                style={{ clipPath: 'polygon(5px 0%, 100% 0%, calc(100% - 5px) 100%, 0% 100%)' }}
              >
                <Globe size={12} />
                Piazza scommessa su Polymarket
                <ExternalLink size={10} />
              </a>

              <p className="font-mono text-[7px] text-white/20 text-center">
                Verrai reindirizzato a polymarket.com · Transazione on-chain su Polygon
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Trending Ticker ─────────────────────────────────────────────────────────
function TrendingTicker({ items = [] }) {
  if (!items.length) return null;
  return (
    <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 scrollbar-hide">
      <span className="font-mono text-[8px] text-fire-3/40 uppercase tracking-[2px] flex-shrink-0 flex items-center gap-1">
        <Zap size={8} /> TRENDING
      </span>
      {items.map((m, i) => {
        const yes = m.outcomes?.find(o => o.label === 'Yes') || m.outcomes?.[0];
        return (
          <a key={m.id || i} href={m.url} target="_blank" rel="noopener noreferrer"
            className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 border border-purple-500/20 bg-purple-500/5 hover:bg-purple-500/10 transition-all"
            style={{ clipPath: 'polygon(5px 0%, 100% 0%, calc(100% - 5px) 100%, 0% 100%)' }}>
            <span className="font-rajdhani text-xs text-white/60 max-w-[140px] truncate">{m.question}</span>
            {yes && <span className={`font-orbitron text-xs font-black flex-shrink-0 ${getProbColor(yes.prob)}`}>{yes.prob}%</span>}
            <span className="font-mono text-[8px] text-white/20 flex-shrink-0">{m.volumeFormatted}</span>
          </a>
        );
      })}
    </div>
  );
}

// ─── Stats Bar ───────────────────────────────────────────────────────────────
function StatsBar({ markets = [] }) {
  const totalVol = markets.reduce((s, m) => s + (parseFloat(m.volume) || 0), 0);
  const avgProb = markets.length
    ? Math.round(markets.reduce((s, m) => {
        const yes = m.outcomes?.find(o => o.label === 'Yes') || m.outcomes?.[0];
        return s + (yes?.prob || 50);
      }, 0) / markets.length)
    : 50;

  const fmt = (n) => n >= 1e6 ? `$${(n/1e6).toFixed(1)}M` : n >= 1e3 ? `$${(n/1e3).toFixed(0)}K` : `$${n.toFixed(0)}`;

  return (
    <div className="grid grid-cols-3 gap-2 mb-4">
      {[
        { label: 'Mercati attivi', value: markets.length, icon: Activity, color: 'text-purple-400' },
        { label: 'Volume totale', value: fmt(totalVol), icon: BarChart3, color: 'text-fire-4' },
        { label: 'Prob. media YES', value: `${avgProb}%`, icon: TrendingUp, color: 'text-green-400' },
      ].map(({ label, value, icon: Icon, color }) => (
        <div key={label} className="border border-white/5 bg-white/[0.015] p-3 text-center">
          <Icon size={14} className={`${color} mx-auto mb-1`} />
          <div className={`font-orbitron text-sm font-black ${color}`}>{value}</div>
          <div className="font-mono text-[7px] text-white/20 uppercase tracking-[1px] mt-0.5">{label}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Dashboard ──────────────────────────────────────────────────────────
export default function PolymarketDashboard() {
  const [search, setSearch] = useState('');
  const [inputVal, setInputVal] = useState('');
  const [limit, setLimit] = useState(20);

  const { data, isLoading, isError, error, refetch, isFetching, dataUpdatedAt } = useQuery({
    queryKey: ['polymarket-markets', search, limit],
    queryFn: () => fetchMarkets({ search, limit }),
    staleTime: 60_000,
    refetchInterval: 120_000,
  });

  const markets  = data?.markets  || [];
  const trending = data?.trending || [];
  const lastUpdated = dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString('it-IT') : null;

  const handleSearch = useCallback((e) => {
    e.preventDefault();
    setSearch(inputVal.trim());
  }, [inputVal]);

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            <span className="font-mono text-[8px] text-purple-400/60 uppercase tracking-[3px]">POLYMARKET LIVE</span>
          </div>
          <p className="font-orbitron text-sm text-purple-300">Mercati di Previsione On-Chain</p>
          {lastUpdated && (
            <p className="font-mono text-[7px] text-white/20 mt-0.5 flex items-center gap-1">
              <Clock size={7} /> Aggiornato alle {lastUpdated}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-purple-500/25 bg-purple-500/5 hover:bg-purple-500/10 text-purple-400 font-mono text-[9px] uppercase tracking-[1px] transition-all disabled:opacity-40"
          >
            <RefreshCw size={10} className={isFetching ? 'animate-spin' : ''} />
            {isFetching ? 'Caricamento...' : 'Aggiorna'}
          </button>
          <a
            href="https://polymarket.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 border border-purple-500/30 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 font-mono text-[9px] uppercase tracking-[1px] transition-all"
          >
            <Globe size={10} />
            Polymarket.com
            <ExternalLink size={8} />
          </a>
        </div>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
          <input
            type="text"
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            placeholder="Cerca mercati sportivi… (es. fight, skate, MMA)"
            className="cyber-input pl-8 text-sm py-2"
          />
        </div>
        <button type="submit"
          className="px-4 py-2 bg-purple-500/15 border border-purple-500/30 text-purple-300 font-orbitron text-[9px] tracking-[1px] uppercase hover:bg-purple-500/25 transition-all"
          style={{ clipPath: 'polygon(5px 0%, 100% 0%, calc(100% - 5px) 100%, 0% 100%)' }}>
          Cerca
        </button>
        {search && (
          <button type="button" onClick={() => { setSearch(''); setInputVal(''); }}
            className="px-3 py-2 border border-white/10 text-white/30 hover:text-white/60 font-mono text-[9px] transition-all">
            ✕
          </button>
        )}
      </form>

      {/* Trending */}
      <TrendingTicker items={trending} />

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-12 gap-3">
          <div className="w-5 h-5 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
          <span className="font-mono text-[9px] text-purple-400/60 uppercase tracking-[2px]">Connessione a Polymarket…</span>
        </div>
      )}

      {/* Error */}
      {isError && !isLoading && (
        <div className="flex items-start gap-3 p-4 border border-red-500/20 bg-red-500/5">
          <AlertTriangle size={14} className="text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-orbitron text-xs text-red-400 font-bold">Errore connessione Polymarket</p>
            <p className="font-mono text-[9px] text-white/30 mt-1">{error?.message || 'API non raggiungibile'}</p>
            <button onClick={() => refetch()} className="mt-2 font-mono text-[9px] text-red-400/60 hover:text-red-400 underline">
              Riprova
            </button>
          </div>
        </div>
      )}

      {/* Markets */}
      {!isLoading && !isError && (
        <>
          <StatsBar markets={markets} />

          {markets.length === 0 ? (
            <div className="text-center py-10 border border-white/5 bg-white/[0.01]">
              <Globe size={24} className="text-purple-400/20 mx-auto mb-2" />
              <p className="font-orbitron text-sm text-white/20">Nessun mercato trovato</p>
              <p className="font-mono text-[9px] text-white/15 mt-1">Prova una ricerca diversa</p>
            </div>
          ) : (
            <div className="space-y-2">
              {markets.map((market, i) => (
                <PolymarketCard key={market.id || i} market={market} index={i} />
              ))}
            </div>
          )}

          {/* Load more */}
          {data?.hasMore && (
            <button
              onClick={() => setLimit(l => l + 20)}
              className="w-full mt-4 py-2.5 border border-purple-500/20 bg-purple-500/5 text-purple-400 font-orbitron text-[10px] tracking-[2px] uppercase hover:bg-purple-500/10 transition-all"
            >
              Carica altri mercati
            </button>
          )}
        </>
      )}

      {/* Disclaimer */}
      <div className="mt-4 px-3 py-2 border border-white/5 bg-white/[0.01]">
        <p className="font-mono text-[7px] text-white/15 text-center leading-relaxed">
          Dati in tempo reale da Polymarket CLOB API · Mercati on-chain su Polygon · Le scommesse sono transazioni blockchain irreversibili ·
          Solo a scopo informativo · Non costituisce consulenza finanziaria · Gioca responsabilmente
        </p>
      </div>
    </div>
  );
}