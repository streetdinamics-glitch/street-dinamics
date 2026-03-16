import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

const TIERS = [
  { key: 'rising_star',      label: 'Rising Star',      color: '#ff6600', border: 'border-fire-3/40',     text: 'text-fire-3',    bg: 'bg-fire-3/10' },
  { key: 'breakout_talent',  label: 'Breakout Talent',  color: '#00ffee', border: 'border-cyan/40',       text: 'text-cyan',      bg: 'bg-cyan/10' },
  { key: 'elite_performer',  label: 'Elite Performer',  color: '#9b00ff', border: 'border-purple-500/40', text: 'text-purple-400', bg: 'bg-purple-500/10' },
  { key: 'living_legend',    label: 'Living Legend',    color: '#ffe566', border: 'border-fire-6/40',     text: 'text-fire-6',    bg: 'bg-fire-6/10' },
];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-black/95 border border-fire-3/30 px-4 py-3 font-mono text-xs">
      <p className="text-fire-4 font-bold tracking-[1px] mb-1">{d.label}</p>
      <p className="text-fire-3/80">{d.count} NFTs · {d.pct}%</p>
      <p className="text-cyan">Avg: €{d.avg.toFixed(2)}</p>
      <p className="text-fire-5">Total: €{d.total.toFixed(2)}</p>
    </div>
  );
};

export default function NFTRarityBreakdown({ enrichedNFTs }) {
  const data = useMemo(() => {
    const total = enrichedNFTs.length;
    return TIERS.map(tier => {
      const items = enrichedNFTs.filter(n => n.token_tier === tier.key || n.rarity === tier.key);
      const totalVal = items.reduce((s, n) => s + n.currentValue, 0);
      return {
        ...tier,
        count: items.length,
        total: totalVal,
        avg: items.length > 0 ? totalVal / items.length : 0,
        pct: total > 0 ? ((items.length / total) * 100).toFixed(1) : '0.0',
      };
    }).filter(d => d.count > 0);
  }, [enrichedNFTs]);

  if (enrichedNFTs.length === 0) return null;

  // Empty-state donut when no tier data matched
  const chartData = data.length > 0 ? data : [{ label: 'Unknown', count: enrichedNFTs.length, color: '#333', pct: '100.0', avg: 0, total: 0 }];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="mb-8 bg-gradient-to-br from-[rgba(10,4,18,0.98)] to-[rgba(4,2,8,1)] border border-fire-3/20 clip-cyber p-6"
    >
      <p className="font-mono text-[9px] tracking-[3px] uppercase text-fire-3/40 mb-1">Portfolio</p>
      <h2 className="text-fire-gradient font-orbitron font-black text-2xl mb-6">RARITY BREAKDOWN</h2>

      <div className="flex flex-col lg:flex-row gap-8 items-center">
        {/* Donut chart */}
        <div className="relative w-56 h-56 flex-shrink-0 mx-auto lg:mx-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={68}
                outerRadius={100}
                dataKey="count"
                paddingAngle={3}
                strokeWidth={0}
              >
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          {/* Center label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="font-orbitron font-black text-3xl text-fire-5">{enrichedNFTs.length}</span>
            <span className="font-mono text-[9px] tracking-[2px] uppercase text-fire-3/50">NFTs</span>
          </div>
        </div>

        {/* Tier breakdown rows */}
        <div className="flex-1 w-full space-y-3">
          {data.map((tier) => (
            <div key={tier.key} className={`flex items-center gap-4 p-4 border ${tier.border} ${tier.bg}`}>
              {/* Colour dot */}
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: tier.color }} />

              {/* Label + bar */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`font-orbitron font-bold text-xs tracking-[1px] uppercase ${tier.text}`}>{tier.label}</span>
                  <span className="font-mono text-[10px] text-fire-3/60">{tier.count} NFT{tier.count !== 1 ? 's' : ''} · {tier.pct}%</span>
                </div>
                <div className="h-1.5 bg-black/40 w-full">
                  <div
                    className="h-full transition-all duration-700"
                    style={{ width: `${tier.pct}%`, background: tier.color, opacity: 0.8 }}
                  />
                </div>
              </div>

              {/* Avg value */}
              <div className="text-right flex-shrink-0 w-24">
                <p className="font-mono text-[8px] tracking-[1px] uppercase text-fire-3/40 mb-0.5">Avg Value</p>
                <p className={`font-orbitron font-black text-base ${tier.text}`}>€{tier.avg.toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}