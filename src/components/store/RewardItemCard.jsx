import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Sparkles } from 'lucide-react';

export default function RewardItemCard({ item, index, userTokens, onRedeem, isRedeeming, tierConfig }) {
  const tierStyle = tierConfig[item.rarity] || tierConfig['rising_star'];
  const canAfford = userTokens >= item.token_cost;
  const inStock = item.stock_quantity === -1 || item.stock_quantity > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`relative bg-gradient-to-br from-[rgba(10,4,18,0.98)] to-[rgba(4,2,8,1)] border ${tierStyle.border} overflow-hidden group clip-cyber`}
    >
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: `radial-gradient(circle at 50% 0%, ${tierStyle.glow}, transparent 70%)` }}
      />

      {/* Rarity Badge */}
      <div className={`absolute top-3 right-3 px-3 py-1 border font-orbitron text-[8px] tracking-[2px] uppercase bg-gradient-to-r ${tierStyle.bg} ${tierStyle.accent} clip-btn z-10`}>
        {tierStyle.label || item.rarity}
      </div>

      {/* Image */}
      {item.image_url && (
        <div className="aspect-square overflow-hidden bg-black/40">
          <img
            src={item.image_url}
            alt={item.item_name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Content */}
      <div className="p-5">
        <div className="mb-3">
          <div className="font-orbitron font-black text-xl text-fire-5 mb-1">
            {item.item_name}
          </div>
          <div className="font-rajdhani text-sm text-fire-4/80 mb-2">
            {item.description}
          </div>
          <div className="inline-block px-2 py-1 text-[9px] font-mono tracking-[1px] uppercase bg-fire-3/10 border border-fire-3/20 text-fire-3">
            {item.category.replace('_', ' ')}
          </div>
        </div>

        {/* Benefits */}
        {item.benefits?.length > 0 && (
          <div className="mb-4">
            <div className="font-mono text-[9px] tracking-[1px] uppercase text-fire-3/60 mb-2">Benefits:</div>
            <ul className="space-y-1">
              {item.benefits.map((benefit, i) => (
                <li key={i} className="font-mono text-xs text-fire-4/70 flex items-start gap-2">
                  <Sparkles size={10} className="text-fire-3 mt-0.5 flex-shrink-0" />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Stock */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="font-mono text-xs text-fire-3/60">Cost</div>
            <div className="font-orbitron font-bold text-fire-5 text-lg">{item.token_cost.toLocaleString()} tokens</div>
          </div>
          {item.stock_quantity !== -1 && (
            <div className="text-right">
              <div className="font-mono text-xs text-fire-3/60">Stock</div>
              <div className={`font-orbitron font-bold text-lg ${item.stock_quantity === 0 ? 'text-red-400' : 'text-fire-4'}`}>
                {item.stock_quantity}
              </div>
            </div>
          )}
        </div>

        {/* Redeem Button */}
        {!inStock ? (
          <div className="text-center py-3 bg-red-500/10 border border-red-500/30">
            <div className="font-mono text-xs text-red-400 tracking-[1px] uppercase">
              Out of Stock
            </div>
          </div>
        ) : !canAfford ? (
          <div className="text-center py-3 bg-fire-3/10 border border-fire-3/20">
            <div className="font-mono text-xs text-fire-3/60 tracking-[1px] uppercase">
              Insufficient Tokens
            </div>
          </div>
        ) : (
          <button
            onClick={onRedeem}
            disabled={isRedeeming}
            className="btn-fire w-full text-xs flex items-center justify-center gap-2"
          >
            <ShoppingBag size={14} />
            {isRedeeming ? 'Redeeming...' : 'Redeem Now'}
          </button>
        )}
      </div>

      {/* Living Legend Glow */}
      {item.rarity === 'living_legend' && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-radial from-fire-5/20 via-transparent to-transparent animate-pulse" />
        </div>
      )}
    </motion.div>
  );
}