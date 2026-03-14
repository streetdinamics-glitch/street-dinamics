import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BarChart3 } from 'lucide-react';
import NFTAssetAnalytics from './NFTAssetAnalytics';

export default function NFTAnalyticsModal({ nft, onClose }) {
  const [timeRange, setTimeRange] = useState('30d');

  // Mock data generation - in production, fetch from backend
  const generateMockData = (days) => {
    const data = [];
    const basePrice = nft.mint_price || 100;
    for (let i = 0; i < days; i++) {
      const variance = (Math.random() - 0.5) * 20;
      data.push({
        date: new Date(Date.now() - (days - i) * 86400000).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
        price: parseFloat((basePrice + variance).toFixed(2)),
      });
    }
    return data;
  };

  const generateVolumeData = (days) => {
    const data = [];
    for (let i = 0; i < days; i++) {
      data.push({
        date: new Date(Date.now() - (days - i) * 86400000).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
        volume: Math.floor(Math.random() * 50) + 10,
      });
    }
    return data;
  };

  const getDaysFromRange = () => {
    switch (timeRange) {
      case '7d':
        return 7;
      case '30d':
        return 30;
      case '90d':
        return 90;
      case '1y':
        return 365;
      default:
        return 30;
    }
  };

  const priceHistory = generateMockData(getDaysFromRange());
  const tradingVolume = generateVolumeData(getDaysFromRange());
  const rarityData = [
    { name: 'Common', count: 450 },
    { name: 'Rare', count: 120 },
    { name: 'Epic', count: 25 },
    { name: 'Legendary', count: 5 },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-5xl max-h-[90vh] bg-gradient-to-br from-[rgba(10,4,18,0.98)] to-[rgba(4,2,8,0.99)] border border-fire-3/30 clip-cyber overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 bg-gradient-to-b from-[rgba(10,4,18,0.98)] to-[rgba(10,4,18,0.9)] border-b border-fire-3/20 p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BarChart3 size={24} className="text-fire-5" />
              <div>
                <h2 className="heading-fire text-2xl font-black">{nft.athlete_name}</h2>
                <p className="font-mono text-[11px] text-fire-3/60">Card #{nft.card_number}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 border border-fire-3/20 hover:border-fire-3/40 transition-all hover:bg-fire-3/5"
            >
              <X size={20} className="text-fire-3" />
            </button>
          </div>

          {/* Time Range Selector */}
          <div className="border-b border-fire-3/10 bg-fire-3/5 px-6 py-4 flex gap-2">
            {['7d', '30d', '90d', '1y'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 font-mono text-xs font-bold uppercase tracking-[1px] border transition-all ${
                  timeRange === range
                    ? 'bg-fire-3/20 border-fire-3/40 text-fire-5'
                    : 'bg-transparent border-fire-3/10 text-fire-3/60 hover:border-fire-3/30 hover:text-fire-3'
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          {/* Analytics Content */}
          <div className="p-6">
            <NFTAssetAnalytics
              nft={nft}
              priceHistory={priceHistory}
              tradingVolume={tradingVolume}
              rarityData={rarityData}
            />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}