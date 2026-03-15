import React from 'react';
import { motion } from 'framer-motion';
import { Gift, ShoppingCart, Sparkles } from 'lucide-react';

export default function EnhancedRewardItemCard({ item, index, userTokens, onRedeem, isRedeeming, tierConfig, fanStatus }) {
  const tierStyle = tierConfig[item.rarity] || tierConfig['rising_star'];
  
  // Apply tier discount if available
  const userTier = fanStatus?.current_tier || 'rookie';
  const discountMap = {
    rookie: 0,
    enthusiast: 0.1,
    superfan: 0.2,
    legend: 0.3,
    hall_of_fame: 0.5,
  };
  
  const discount = discountMap[userTier] || 0;
  const finalCost = Math.round(item.token_cost * (1 - discount));
  const canAfford = userTokens >= finalCost;
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

      {/* Discount Badge */}
      {discount > 0 && (
        <div className="absolute top-3 left-3 px-2 py-1 bg-green-500/20 border border-green-500/40 font-mono text-[8px] tracking-[1px] uppercase text-green-400 z-10">
          -{(discount * 100)}% OFF
        </div>
      )}
      
      {/* Rarity Badge */}
      <div className={`absolute top-3 right-3 px-3 py-1 border font-orbitron text-[8px] tracking-[2px] uppercase bg-gradient-to-r ${tierStyle.bg} ${tierStyle.accent} clip-btn z-10`}>
        {tierStyle.label || item.rarity}
      </div>

      {item.image_url && (
        <div className="aspect-square overflow-hidden bg-black/40">
          <img src={item.image_url} alt={item.item_name} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="p-5">
        <div className="mb-3">
          <div className="font-orbitron font-black text-xl text-fire-5 mb-1">{item.item_name}</div>
          <div className="inline-block px-2 py-0.5 text-[8px] font-mono tracking-[1px] uppercase bg-fire-3/10 border border-fire-3/20 text-fire-3">
            {item.category.replace('_', ' ')}
          </div>
        </div>

        <p className="text-sm text-fire-4/70 mb-4 line-clamp-2">{item.description}</p>

        {item.benefits && item.benefits.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-1.5 mb-2">
              <Sparkles size={12} className="text-cyan" />
              <span className="font-mono text-[9px] tracking-[2px] uppercase text-cyan">Benefits</span>
            </div>
            <ul className="space-y-1">
              {item.benefits.slice(0, 3).map((benefit, i) => (
                <li key={i} className="font-mono text-xs text-fire-4/60 flex items-start gap-1.5">
                  <span className="text-fire-3/40">•</span>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mb-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-mono text-xs text-fire-3/60">Cost</div>
              <div className="flex items-center gap-2">
                {discount > 0 && (
                  <span className="font-orbitron text-sm text-fire-3/40 line-through">{item.token_cost}</span>
                )}
                <span className="font-orbitron font-bold text-xl text-fire-5">{finalCost}</span>
                <span className="font-mono text-xs text-fire-3/60">tokens</span>
              </div>
            </div>
            {item.stock_quantity !== -1 && (
              <div className="text-right">
                <div className="font-mono text-xs text-fire-3/60">Stock</div>
                <div className="font-orbitron font-bold text-fire-4">{item.stock_quantity}</div>
              </div>
            )}
          </div>
        </div>

        {!inStock ? (
          <div className="text-center py-3 bg-red-500/10 border border-red-500/30">
            <div className="font-mono text-xs text-red-400 tracking-[1px] uppercase">Out of Stock</div>
          </div>
        ) : !canAfford ? (
          <div className="text-center py-3 bg-fire-3/10 border border-fire-3/30">
            <div className="font-mono text-xs text-fire-3/60 tracking-[1px] uppercase">Insufficient Tokens</div>
          </div>
        ) : (
          <button
            onClick={() => onRedeem({ ...item, token_cost: finalCost })}
            disabled={isRedeeming}
            className="btn-fire w-full text-xs flex items-center justify-center gap-2"
          >
            <ShoppingCart size={14} />
            {isRedeeming ? 'Redeeming...' : 'Redeem Now'}
          </button>
        )}
      </div>

      {item.rarity === 'living_legend' && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-radial from-fire-5/20 via-transparent to-transparent animate-pulse" />
        </div>
      )}
    </motion.div>
  );
}