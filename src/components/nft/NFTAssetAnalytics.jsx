import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, TrendingDown, Eye, DollarSign } from 'lucide-react';

export default function NFTAssetAnalytics({ nft, priceHistory = [], tradingVolume = [], rarityData = [] }) {
  // Calculate key metrics
  const metrics = useMemo(() => {
    if (!priceHistory || priceHistory.length === 0) return null;

    const prices = priceHistory.map(p => p.price);
    const currentPrice = prices[prices.length - 1];
    const previousPrice = prices[0];
    const change = currentPrice - previousPrice;
    const changePercent = ((change / previousPrice) * 100).toFixed(2);
    const avgPrice = (prices.reduce((a, b) => a + b) / prices.length).toFixed(2);
    const floorPrice = Math.min(...prices).toFixed(2);
    const highPrice = Math.max(...prices).toFixed(2);
    const totalVolume = tradingVolume.reduce((sum, v) => sum + v.volume, 0);

    return {
      currentPrice: currentPrice.toFixed(2),
      change: change.toFixed(2),
      changePercent,
      avgPrice,
      floorPrice,
      highPrice,
      totalVolume,
      isPositive: change >= 0,
    };
  }, [priceHistory, tradingVolume]);

  // Chart colors
  const rarityColors = ['#ff6600', '#00ffee', '#9b00ff', '#ffcc00'];

  if (!metrics) {
    return (
      <div className="text-center py-12">
        <p className="font-mono text-sm text-fire-3/40">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-fire-3/10 to-fire-3/5 border border-fire-3/20 p-4"
        >
          <div className="font-mono text-[9px] text-fire-3/60 uppercase tracking-[1px] mb-2">Current Price</div>
          <div className="font-orbitron font-black text-2xl text-fire-5">€{metrics.currentPrice}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`bg-gradient-to-br ${
            metrics.isPositive ? 'from-green-500/10 to-green-500/5' : 'from-red-500/10 to-red-500/5'
          } border ${metrics.isPositive ? 'border-green-500/20' : 'border-red-500/20'} p-4`}
        >
          <div className="font-mono text-[9px] text-fire-3/60 uppercase tracking-[1px] mb-2 flex items-center gap-1">
            {metrics.isPositive ? (
              <TrendingUp size={12} className="text-green-400" />
            ) : (
              <TrendingDown size={12} className="text-red-400" />
            )}
            24h Change
          </div>
          <div className={`font-orbitron font-black text-2xl ${metrics.isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {metrics.isPositive ? '+' : ''}{metrics.change} ({metrics.changePercent}%)
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-cyan/10 to-cyan/5 border border-cyan/20 p-4"
        >
          <div className="font-mono text-[9px] text-cyan/60 uppercase tracking-[1px] mb-2">Floor Price</div>
          <div className="font-orbitron font-black text-2xl text-cyan">€{metrics.floorPrice}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20 p-4"
        >
          <div className="font-mono text-[9px] text-purple-400/60 uppercase tracking-[1px] mb-2">Avg Price</div>
          <div className="font-orbitron font-black text-2xl text-purple-400">€{metrics.avgPrice}</div>
        </motion.div>
      </div>

      {/* Price Chart */}
      {priceHistory.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-[rgba(10,4,18,0.97)] to-[rgba(4,2,8,0.99)] border border-fire-3/20 p-6"
        >
          <h3 className="heading-fire text-xl font-black mb-6">Price History</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={priceHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,100,0,0.1)" />
              <XAxis dataKey="date" stroke="rgba(255,100,0,0.3)" />
              <YAxis stroke="rgba(255,100,0,0.3)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(4,2,10,0.95)',
                  border: '1px solid rgba(255,100,0,0.2)',
                  borderRadius: '0',
                }}
                labelStyle={{ color: '#ffe8c0' }}
              />
              <Line type="monotone" dataKey="price" stroke="#ff6600" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Volume & Rarity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trading Volume */}
        {tradingVolume.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-br from-[rgba(10,4,18,0.97)] to-[rgba(4,2,8,0.99)] border border-fire-3/20 p-6"
          >
            <h3 className="heading-fire text-xl font-black mb-6 flex items-center gap-2">
              <Eye size={20} className="text-fire-5" />
              Trading Volume
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={tradingVolume}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,100,0,0.1)" />
                <XAxis dataKey="date" stroke="rgba(255,100,0,0.3)" />
                <YAxis stroke="rgba(255,100,0,0.3)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(4,2,10,0.95)',
                    border: '1px solid rgba(255,100,0,0.2)',
                  }}
                  labelStyle={{ color: '#ffe8c0' }}
                />
                <Bar dataKey="volume" fill="#ff6600" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Rarity Breakdown */}
        {rarityData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-br from-[rgba(10,4,18,0.97)] to-[rgba(4,2,8,0.99)] border border-fire-3/20 p-6"
          >
            <h3 className="heading-fire text-xl font-black mb-6">Rarity Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={rarityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {rarityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={rarityColors[index % rarityColors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(4,2,10,0.95)',
                    border: '1px solid rgba(255,100,0,0.2)',
                  }}
                  labelStyle={{ color: '#ffe8c0' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        )}
      </div>

      {/* Stats Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-gradient-to-br from-fire-3/10 to-fire-3/5 border border-fire-3/20 p-6"
      >
        <h3 className="font-orbitron font-black text-lg text-fire-5 mb-4">Trading Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 font-mono text-sm">
          <div>
            <div className="text-fire-3/60 text-[11px] uppercase mb-1">High (24h)</div>
            <div className="text-fire-5 font-bold">€{metrics.highPrice}</div>
          </div>
          <div>
            <div className="text-fire-3/60 text-[11px] uppercase mb-1">Total Volume</div>
            <div className="text-cyan font-bold flex items-center gap-1">
              <DollarSign size={14} />
              {metrics.totalVolume}
            </div>
          </div>
          <div>
            <div className="text-fire-3/60 text-[11px] uppercase mb-1">Listings</div>
            <div className="text-purple-400 font-bold">{tradingVolume.length}</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}