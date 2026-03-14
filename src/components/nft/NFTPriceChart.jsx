import React, { useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function NFTPriceChart({ nftId, athleteName }) {
  const { data: transactions = [] } = useQuery({
    queryKey: ['nft-price-history', nftId],
    queryFn: async () => {
      const trades = await base44.entities.SecondaryMarketTrade.filter({ nft_id: nftId });
      return trades.sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
    },
    initialData: [],
  });

  const chartData = useMemo(() => {
    if (transactions.length === 0) return [];

    return transactions.map((tx, idx) => ({
      date: new Date(tx.created_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      price: tx.price,
      type: tx.type === 'buy' ? 'Bought' : 'Sold',
    }));
  }, [transactions]);

  if (chartData.length === 0) {
    return (
      <div className="w-full h-[250px] bg-black/30 border border-fire-3/10 flex items-center justify-center">
        <p className="font-mono text-sm text-fire-3/40">No price history available</p>
      </div>
    );
  }

  const minPrice = Math.min(...chartData.map(d => d.price));
  const maxPrice = Math.max(...chartData.map(d => d.price));
  const avgPrice = (chartData.reduce((sum, d) => sum + d.price, 0) / chartData.length).toFixed(2);

  return (
    <div className="space-y-4">
      {/* Price Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-black/30 border border-fire-3/10 p-3">
          <p className="font-mono text-[9px] text-fire-3/60 tracking-[1px] mb-1">MIN PRICE</p>
          <p className="font-orbitron font-bold text-fire-4">€{minPrice.toFixed(2)}</p>
        </div>
        <div className="bg-black/30 border border-fire-3/10 p-3">
          <p className="font-mono text-[9px] text-fire-3/60 tracking-[1px] mb-1">AVG PRICE</p>
          <p className="font-orbitron font-bold text-cyan">€{avgPrice}</p>
        </div>
        <div className="bg-black/30 border border-fire-3/10 p-3">
          <p className="font-mono text-[9px] text-fire-3/60 tracking-[1px] mb-1">MAX PRICE</p>
          <p className="font-orbitron font-bold text-purple-400">€{maxPrice.toFixed(2)}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="w-full h-[300px] bg-black/30 border border-fire-3/10 p-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ff6600" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ff6600" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,102,0,0.1)" />
            <XAxis 
              dataKey="date" 
              stroke="#ff6600" 
              style={{ fontSize: 11, fontFamily: 'monospace' }} 
            />
            <YAxis 
              stroke="#ff6600" 
              style={{ fontSize: 11, fontFamily: 'monospace' }}
              label={{ value: '€', angle: -90, position: 'insideLeft', offset: 10, fill: '#ff6600' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(4,2,8,0.95)',
                border: '1px solid rgba(255,102,0,0.3)',
                fontFamily: 'monospace',
                fontSize: 11,
              }}
              formatter={(value) => `€${value.toFixed(2)}`}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Legend 
              wrapperStyle={{ fontFamily: 'monospace', fontSize: 11 }}
              formatter={() => `${athleteName} Price History`}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#ff6600"
              strokeWidth={2}
              dot={{ fill: '#ff6600', r: 4 }}
              activeDot={{ r: 6 }}
              isAnimationActive={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}