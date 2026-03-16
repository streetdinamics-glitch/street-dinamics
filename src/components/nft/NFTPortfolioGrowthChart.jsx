import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { motion } from 'framer-motion';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-black/95 border border-fire-3/30 px-4 py-3 font-mono text-xs">
      <p className="text-fire-3/60 tracking-[1px] mb-1">{label}</p>
      <p className="text-cyan font-bold">€{payload[0].value.toFixed(2)}</p>
      {payload[1] && <p className="text-fire-3/60">Invested: €{payload[1].value.toFixed(2)}</p>}
    </div>
  );
};

export default function NFTPortfolioGrowthChart({ enrichedNFTs }) {
  const chartData = useMemo(() => {
    if (enrichedNFTs.length === 0) return [];

    // Collect all relevant date points from purchases and transactions
    const events = [];

    enrichedNFTs.forEach(nft => {
      // Initial purchase
      if (nft.minted_at || nft.purchase_date) {
        events.push({
          date: new Date(nft.minted_at || nft.purchase_date),
          nftId: nft.id,
          value: nft.purchase_price,
          invested: nft.purchase_price,
          type: 'purchase',
        });
      }
      // Secondary market trades
      nft.transactions.forEach(tx => {
        events.push({
          date: new Date(tx.created_date),
          nftId: nft.id,
          value: tx.price,
          type: 'trade',
        });
      });
    });

    if (events.length === 0) return [];

    events.sort((a, b) => a.date - b.date);

    // Build cumulative portfolio value over time
    // Track current value of each NFT
    const nftValues = {};
    const nftInvested = {};
    const points = [];

    events.forEach(ev => {
      if (ev.type === 'purchase') {
        nftValues[ev.nftId] = ev.value;
        nftInvested[ev.nftId] = ev.invested;
      } else {
        nftValues[ev.nftId] = ev.value;
      }

      const totalValue = Object.values(nftValues).reduce((s, v) => s + v, 0);
      const totalInvested = Object.values(nftInvested).reduce((s, v) => s + v, 0);

      points.push({
        date: ev.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' }),
        value: parseFloat(totalValue.toFixed(2)),
        invested: parseFloat(totalInvested.toFixed(2)),
      });
    });

    // Add today's snapshot as last point
    const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
    const lastValue = points[points.length - 1];
    if (lastValue && lastValue.date !== today) {
      points.push({ date: today, value: lastValue.value, invested: lastValue.invested });
    }

    return points;
  }, [enrichedNFTs]);

  if (chartData.length < 2) return null;

  const firstValue = chartData[0].value;
  const lastValue = chartData[chartData.length - 1].value;
  const growth = lastValue - firstValue;
  const growthPct = firstValue > 0 ? ((growth / firstValue) * 100).toFixed(1) : '0.0';
  const isPositive = growth >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="mb-8 bg-gradient-to-br from-[rgba(10,4,18,0.98)] to-[rgba(4,2,8,1)] border border-cyan/20 clip-cyber p-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div>
          <p className="font-mono text-[9px] tracking-[3px] uppercase text-cyan/40 mb-1">Portfolio</p>
          <h2 className="font-orbitron font-black text-2xl text-cyan">VALUE GROWTH</h2>
        </div>
        <div className="flex gap-6">
          <div className="text-right">
            <p className="font-mono text-[9px] tracking-[1px] uppercase text-fire-3/40 mb-0.5">Current</p>
            <p className="font-orbitron font-black text-xl text-cyan">€{lastValue.toFixed(2)}</p>
          </div>
          <div className="text-right">
            <p className="font-mono text-[9px] tracking-[1px] uppercase text-fire-3/40 mb-0.5">All-time</p>
            <p className={`font-orbitron font-black text-xl ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
              {isPositive ? '+' : ''}{growthPct}%
            </p>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,100,0,0.06)" />
          <XAxis
            dataKey="date"
            tick={{ fill: 'rgba(255,160,60,0.35)', fontSize: 9, fontFamily: 'var(--font-mono)' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: 'rgba(255,160,60,0.35)', fontSize: 9, fontFamily: 'var(--font-mono)' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={v => `€${v}`}
            width={55}
          />
          <Tooltip content={<CustomTooltip />} />
          {/* Invested baseline */}
          <Line
            type="monotone"
            dataKey="invested"
            stroke="rgba(255,100,0,0.25)"
            strokeWidth={1}
            strokeDasharray="4 4"
            dot={false}
            activeDot={false}
          />
          {/* Portfolio value */}
          <Line
            type="monotone"
            dataKey="value"
            stroke="#00ffee"
            strokeWidth={2}
            dot={{ fill: '#00ffee', r: 3, strokeWidth: 0 }}
            activeDot={{ fill: '#00ffee', r: 5, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex gap-5 mt-3">
        <div className="flex items-center gap-2">
          <div className="w-5 h-0.5 bg-cyan" />
          <span className="font-mono text-[9px] tracking-[1px] uppercase text-cyan/60">Portfolio Value</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-0.5 border-t border-dashed border-fire-3/40" />
          <span className="font-mono text-[9px] tracking-[1px] uppercase text-fire-3/40">Total Invested</span>
        </div>
      </div>
    </motion.div>
  );
}