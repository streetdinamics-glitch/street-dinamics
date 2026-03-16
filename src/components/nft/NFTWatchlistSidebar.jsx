import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X, Bell, BellOff, TrendingUp, TrendingDown, Activity, ChevronRight, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';

const RARITY_STYLE = {
  rising_star:     { color: 'text-slate-400',  border: 'border-slate-500/30',  bg: 'bg-slate-500/10',  label: 'Rising Star' },
  breakout_talent: { color: 'text-purple-400', border: 'border-purple-500/30', bg: 'bg-purple-500/10', label: 'Breakout' },
  elite_performer: { color: 'text-cyan',        border: 'border-cyan/30',       bg: 'bg-cyan/10',       label: 'Elite' },
  living_legend:   { color: 'text-fire-5',      border: 'border-fire-5/40',     bg: 'bg-fire-5/10',     label: 'Legend' },
};

function PriceAlert({ item, nftCard }) {
  const queryClient = useQueryClient();
  const currentPrice = nftCard?.mint_price ?? item.baseline_price;
  const baseline = item.baseline_price;
  const change = baseline > 0 ? ((currentPrice - baseline) / baseline) * 100 : 0;
  const isUp = change > 0;
  const style = RARITY_STYLE[nftCard?.rarity] || RARITY_STYLE.rising_star;
  const availability = nftCard ? (nftCard.total_supply - (nftCard.minted_count || 0)) : null;
  const soldPct = nftCard ? ((nftCard.minted_count || 0) / nftCard.total_supply) * 100 : 0;

  const toggleAlert = useMutation({
    mutationFn: () => base44.entities.Watchlist.update(item.id, {
      notify_price_drop: !item.notify_price_drop,
    }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['nft-watchlist'] }),
  });

  const remove = useMutation({
    mutationFn: () => base44.entities.Watchlist.delete(item.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nft-watchlist'] });
      queryClient.invalidateQueries({ queryKey: ['watchlist', 'nft_drop', item.asset_id] });
      toast.success('Removed from watchlist');
    },
  });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={`border ${style.border} bg-gradient-to-br from-black/60 to-black/40 p-4 relative group`}
    >
      {/* Remove button */}
      <button
        onClick={() => remove.mutate()}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-fire-3/40 hover:text-red-400"
      >
        <X size={12} />
      </button>

      {/* Header */}
      <div className="flex items-start justify-between mb-2 pr-4">
        <div>
          <p className="font-orbitron font-black text-sm text-fire-5 leading-tight">{item.asset_name}</p>
          {nftCard?.event_moment && (
            <p className="font-mono text-[9px] text-fire-3/50 mt-0.5 truncate max-w-[130px]">{nftCard.event_moment}</p>
          )}
        </div>
        <span className={`text-[8px] font-mono tracking-[1px] uppercase px-2 py-0.5 border ${style.border} ${style.color} ${style.bg}`}>
          {style.label}
        </span>
      </div>

      {/* Price row */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="font-mono text-[8px] text-fire-3/40 tracking-[1px] mb-0.5">PRICE</p>
          <p className="font-orbitron font-black text-lg text-cyan">€{currentPrice?.toFixed(2) ?? '—'}</p>
        </div>
        <div className="text-right">
          <p className="font-mono text-[8px] text-fire-3/40 tracking-[1px] mb-0.5">CHANGE</p>
          <div className={`flex items-center gap-1 font-orbitron font-bold text-sm ${
            Math.abs(change) < 0.01 ? 'text-fire-3/50' : isUp ? 'text-red-400' : 'text-green-400'
          }`}>
            {Math.abs(change) < 0.01 ? (
              <span>—</span>
            ) : isUp ? (
              <><TrendingUp size={12} /> +{change.toFixed(1)}%</>
            ) : (
              <><TrendingDown size={12} /> {change.toFixed(1)}%</>
            )}
          </div>
        </div>
      </div>

      {/* Supply bar */}
      {nftCard && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="font-mono text-[8px] text-fire-3/40 tracking-[1px]">SUPPLY</span>
            <span className={`font-mono text-[9px] font-bold ${
              availability === 0 ? 'text-red-400' : availability && availability <= 5 ? 'text-fire-5' : 'text-fire-3/60'
            }`}>
              {availability === 0 ? 'SOLD OUT' : availability !== null ? `${availability} left` : '—'}
            </span>
          </div>
          <div className="h-1 bg-fire-3/10 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-fire-3 to-fire-5 transition-all duration-700"
              style={{ width: `${soldPct}%` }}
            />
          </div>
        </div>
      )}

      {/* Footer: alert toggle + added date */}
      <div className="flex items-center justify-between pt-2 border-t border-fire-3/10">
        <button
          onClick={() => toggleAlert.mutate()}
          className={`flex items-center gap-1 text-[9px] font-mono tracking-[1px] uppercase transition-all ${
            item.notify_price_drop
              ? 'text-green-400'
              : 'text-fire-3/40 hover:text-fire-3/70'
          }`}
        >
          {item.notify_price_drop ? <Bell size={10} /> : <BellOff size={10} />}
          {item.notify_price_drop ? 'Alert On' : 'Alert Off'}
        </button>
        <span className="font-mono text-[8px] text-fire-3/30">
          {new Date(item.added_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
      </div>
    </motion.div>
  );
}

function RecentActivityItem({ trade }) {
  const isBuy = true; // trades are purchases from market
  return (
    <div className="flex items-center justify-between py-2 border-b border-fire-3/10 last:border-0">
      <div className="flex items-center gap-2">
        <div className={`w-1.5 h-1.5 rounded-full ${isBuy ? 'bg-green-400' : 'bg-red-400'}`} />
        <div>
          <p className="font-mono text-[9px] text-fire-4 leading-tight truncate max-w-[110px]">{trade.nft_title || 'NFT Card'}</p>
          <p className="font-mono text-[8px] text-fire-3/40">
            {new Date(trade.created_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </p>
        </div>
      </div>
      <span className="font-orbitron font-bold text-xs text-cyan">€{trade.price?.toFixed(2)}</span>
    </div>
  );
}

export default function NFTWatchlistSidebar({ isOpen, onToggle }) {
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: watchlist = [] } = useQuery({
    queryKey: ['nft-watchlist'],
    queryFn: async () => {
      if (!user) return [];
      return base44.entities.Watchlist.filter({ user_email: user.email, asset_type: 'nft_drop' }, '-added_at', 50);
    },
    enabled: !!user,
    refetchInterval: 30000, // Poll every 30s for price updates
  });

  const { data: nftCards = [] } = useQuery({
    queryKey: ['nft-cards'],
    queryFn: () => base44.entities.NFTCollectionCard.list('-drop_date', 100),
    refetchInterval: 60000,
  });

  const { data: recentTrades = [] } = useQuery({
    queryKey: ['recent-market-activity'],
    queryFn: () => base44.entities.SecondaryMarketTrade.list('-created_date', 10),
    refetchInterval: 30000,
  });

  // Only show watchlisted NFTs that the user doesn't own
  const { data: myNFTs = [] } = useQuery({
    queryKey: ['my-nfts', user?.email],
    queryFn: () => base44.entities.NFTOwnership.filter({ buyer_email: user.email }),
    enabled: !!user,
  });

  const ownedNFTIds = new Set(myNFTs.map(n => n.nft_id));
  const watchlistItems = watchlist.filter(w => !ownedNFTIds.has(w.asset_id));

  // Filter recent trades to only watchlisted assets
  const watchlistAssetIds = new Set(watchlist.map(w => w.asset_id));
  const relevantTrades = recentTrades.filter(t => watchlistAssetIds.has(t.nft_id));
  const allRecentTrades = recentTrades.slice(0, 5);

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className={`fixed right-0 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center gap-1 py-4 px-2 border border-r-0 transition-all duration-300 ${
          isOpen
            ? 'bg-fire-3/20 border-fire-3/40 text-fire-4'
            : 'bg-black/80 border-fire-3/20 text-fire-3/50 hover:text-fire-3 hover:bg-fire-3/10'
        }`}
      >
        <Star size={16} fill={watchlistItems.length > 0 ? 'currentColor' : 'none'} />
        {watchlistItems.length > 0 && (
          <span className="font-orbitron font-black text-[9px] text-fire-5">
            {watchlistItems.length}
          </span>
        )}
        <div className="writing-mode-vertical font-mono text-[8px] tracking-[2px] uppercase" style={{ writingMode: 'vertical-rl' }}>
          Watchlist
        </div>
        <ChevronRight size={12} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Sidebar Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-30 w-72 bg-gradient-to-b from-[rgba(4,2,10,0.99)] to-[rgba(2,1,6,1)] border-l border-fire-3/20 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-fire-3/15 shrink-0">
              <div className="fire-line mb-3" />
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-orbitron font-black text-fire-4 text-sm tracking-[2px]">WATCHLIST</h3>
                  <p className="font-mono text-[8px] text-fire-3/40 tracking-[1px] mt-0.5">
                    {watchlistItems.length} NFT{watchlistItems.length !== 1 ? 's' : ''} tracked
                  </p>
                </div>
                <Star size={18} className="text-fire-5" fill="currentColor" />
              </div>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto">
              {/* Watchlisted NFTs */}
              <div className="p-3 space-y-2">
                {watchlistItems.length === 0 ? (
                  <div className="py-8 text-center">
                    <Star size={28} className="text-fire-3/20 mx-auto mb-3" />
                    <p className="font-mono text-[10px] text-fire-3/30 tracking-[1px] leading-relaxed">
                      Star NFT cards<br />you want to track
                    </p>
                  </div>
                ) : (
                  <AnimatePresence>
                    {watchlistItems.map(item => {
                      const card = nftCards.find(c => c.id === item.asset_id);
                      return (
                        <PriceAlert key={item.id} item={item} nftCard={card} />
                      );
                    })}
                  </AnimatePresence>
                )}
              </div>

              {/* Divider */}
              <div className="mx-3 mb-2 border-t border-fire-3/10" />

              {/* Recent Market Activity */}
              <div className="p-3">
                <div className="flex items-center gap-2 mb-3">
                  <Activity size={12} className="text-fire-3/50" />
                  <p className="font-mono text-[9px] tracking-[2px] uppercase text-fire-3/50">Market Activity</p>
                </div>
                {allRecentTrades.length === 0 ? (
                  <p className="font-mono text-[9px] text-fire-3/30 text-center py-4">No recent activity</p>
                ) : (
                  allRecentTrades.map(trade => (
                    <RecentActivityItem key={trade.id} trade={trade} />
                  ))
                )}
              </div>

              {/* Live pulse indicator */}
              <div className="px-3 pb-4 flex items-center gap-2 justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <span className="font-mono text-[8px] text-fire-3/30 tracking-[1px]">LIVE • updates every 30s</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop on mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onToggle}
            className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          />
        )}
      </AnimatePresence>
    </>
  );
}