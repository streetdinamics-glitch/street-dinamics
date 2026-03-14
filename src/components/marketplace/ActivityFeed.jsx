import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, BarChart3, ArrowRight } from 'lucide-react';
import { useTranslation } from '../translations';

export default function ActivityFeed({ lang = 'en' }) {
  const t = useTranslation(lang);
  const [liveActivities, setLiveActivities] = useState([]);

  // Fetch recent trades
  const { data: trades = [] } = useQuery({
    queryKey: ['market-trades'],
    queryFn: () => base44.entities.SecondaryMarketTrade.list('-traded_at', 50),
    refetchInterval: 5000, // Refetch every 5 seconds
    initialData: [],
  });

  // Subscribe to real-time updates
  useEffect(() => {
    const unsubscribe = base44.entities.SecondaryMarketTrade.subscribe((event) => {
      if (event.type === 'create') {
        setLiveActivities(prev => [
          {
            id: event.id,
            type: 'trade',
            data: event.data,
            timestamp: new Date(),
          },
          ...prev.slice(0, 19),
        ]);
      }
    });

    return unsubscribe;
  }, []);

  // Calculate price trends for each asset
  const calculateTrend = (assetId) => {
    const assetTrades = trades.filter(t => t.asset_id === assetId);
    if (assetTrades.length < 2) return { change: 0, percent: 0 };

    const latest = assetTrades[0].price_per_unit;
    const previous = assetTrades[Math.min(4, assetTrades.length - 1)].price_per_unit;
    const change = latest - previous;
    const percent = previous ? ((change / previous) * 100).toFixed(2) : 0;

    return { change, percent };
  };

  // Calculate volume per asset
  const calculateVolume = (assetId) => {
    const assetTrades = trades.filter(t => t.asset_id === assetId);
    return {
      count: assetTrades.length,
      total: assetTrades.reduce((sum, t) => sum + t.total_amount, 0),
    };
  };

  // Get top assets by volume
  const topAssets = [...new Set(trades.map(t => t.asset_id))]
    .slice(0, 5)
    .map(assetId => {
      const volume = calculateVolume(assetId);
      const trend = calculateTrend(assetId);
      const latestTrade = trades.find(t => t.asset_id === assetId);

      return {
        assetId,
        athlete: latestTrade?.athlete_name,
        volume,
        trend,
        price: latestTrade?.price_per_unit || 0,
      };
    });

  // Format time ago
  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    return `${Math.floor(seconds / 86400)}d`;
  };

  const displayActivities = liveActivities.length > 0 ? liveActivities : trades.slice(0, 10).map(t => ({
    id: t.id,
    type: 'trade',
    data: t,
    timestamp: new Date(t.traded_at),
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
      {/* Top Assets */}
      <div className="lg:col-span-1 bg-gradient-to-br from-[rgba(10,4,18,0.97)] to-[rgba(4,2,8,0.99)] border border-fire-3/20 p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 size={16} className="text-fire-3" />
          <h3 className="font-orbitron font-bold text-lg text-fire-4">TOP ASSETS</h3>
        </div>

        <div className="space-y-3">
          {topAssets.length === 0 ? (
            <p className="font-mono text-xs text-fire-3/40">No activity yet</p>
          ) : (
            topAssets.map((asset, i) => (
              <motion.div
                key={asset.assetId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-3 bg-fire-3/5 border border-fire-3/10 rounded hover:border-fire-3/30 transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="font-rajdhani font-bold text-sm text-fire-5">
                    {asset.athlete}
                  </div>
                  <div className={`flex items-center gap-1 font-mono text-xs ${
                    asset.trend.change >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {asset.trend.change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {asset.trend.percent}%
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-orbitron font-bold text-fire-4">€{asset.price.toFixed(2)}</span>
                  <span className="font-mono text-[10px] text-fire-3/40">
                    {asset.volume.count} trades
                  </span>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="lg:col-span-2 bg-gradient-to-br from-[rgba(10,4,18,0.97)] to-[rgba(4,2,8,0.99)] border border-fire-3/20 p-6">
        <div className="flex items-center gap-2 mb-4">
          <ArrowRight size={16} className="text-fire-3" />
          <h3 className="font-orbitron font-bold text-lg text-fire-4">RECENT TRANSACTIONS</h3>
        </div>

        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          <AnimatePresence>
            {displayActivities.length === 0 ? (
              <p className="font-mono text-xs text-fire-3/40">No transactions yet</p>
            ) : (
              displayActivities.map((activity, i) => {
                const trade = activity.data;
                const isProfit = trade.seller_receives >= trade.total_amount * 0.8;

                return (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className={`p-3 border rounded text-xs font-mono transition-all ${
                      i === 0 && liveActivities.length > 0
                        ? 'border-green-500/60 bg-green-500/10 animate-pulse'
                        : 'border-fire-3/10 bg-fire-3/5 hover:border-fire-3/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-fire-5 font-bold truncate">
                        {trade.athlete_name}
                      </span>
                      <span className={`${isProfit ? 'text-green-400' : 'text-orange-400'}`}>
                        €{trade.total_amount.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-fire-3/60">
                      <span>
                        {trade.asset_type} · {trade.quantity} unit{trade.quantity > 1 ? 's' : ''}
                      </span>
                      <span>{timeAgo(activity.timestamp)}</span>
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}