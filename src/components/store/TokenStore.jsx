import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ShoppingBag, Star, Zap, Filter, Package, Gift } from 'lucide-react';
import { toast } from 'sonner';
import RewardItemCard from './RewardItemCard';
import UserInventoryPanel from './UserInventoryPanel';
import PointsConverter from './PointsConverter';
import TokenBalanceWidget from './TokenBalanceWidget';

const TIER_CONFIG = {
  common: { bg: 'from-slate-600 to-slate-800', glow: 'rgba(148, 163, 184, 0.4)', border: 'border-slate-500/30', accent: 'text-slate-400' },
  rare: { bg: 'from-blue-600 to-purple-700', glow: 'rgba(147, 51, 234, 0.4)', border: 'border-purple-500/30', accent: 'text-purple-400' },
  epic: { bg: 'from-cyan-500 to-cyan-700', glow: 'rgba(0, 255, 238, 0.4)', border: 'border-cyan/30', accent: 'text-cyan' },
  legendary: { bg: 'from-yellow-500 via-orange-500 to-red-600', glow: 'rgba(255, 150, 0, 0.6)', border: 'border-fire-3/40', accent: 'text-fire-5' },
};

export default function TokenStore() {
  const queryClient = useQueryClient();
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [rarityFilter, setRarityFilter] = useState('all');
  const [showInventory, setShowInventory] = useState(false);
  const [showConverter, setShowConverter] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: events = [] } = useQuery({
    queryKey: ['events'],
    queryFn: () => base44.entities.Event.list('-created_date', 10),
    initialData: [],
  });

  const { data: rewardItems = [] } = useQuery({
    queryKey: ['reward-items'],
    queryFn: () => base44.entities.RewardItem.filter({ is_active: true }),
    initialData: [],
  });

  const { data: tokenBalance } = useQuery({
    queryKey: ['token-balance', user?.email],
    queryFn: () => base44.entities.TokenBalance.filter({ user_email: user?.email }).then(r => r[0] || { total_tokens: 0 }),
    enabled: !!user,
  });

  const totalTokens = tokenBalance?.total_tokens || 0;

  const filteredItems = useMemo(() => {
    return rewardItems.filter(item => {
      if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
      if (rarityFilter !== 'all' && item.rarity !== rarityFilter) return false;
      return true;
    });
  }, [rewardItems, categoryFilter, rarityFilter]);

  const redeemItemMutation = useMutation({
    mutationFn: async (item) => {
      const currentBalance = await base44.entities.TokenBalance.filter({ user_email: user.email }).then(r => r[0]);
      
      if (!currentBalance || currentBalance.total_tokens < item.token_cost) {
        throw new Error('Insufficient tokens');
      }

      const redemptionCode = `REWARD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      const inventoryItem = await base44.entities.UserInventory.create({
        user_email: user.email,
        user_name: user.full_name,
        item_id: item.id,
        item_name: item.item_name,
        item_category: item.category,
        item_image_url: item.image_url,
        redemption_code: redemptionCode,
        tokens_spent: item.token_cost,
        redeemed_at: new Date().toISOString(),
        expiry_date: item.expiry_date,
      });

      if (item.stock_quantity > 0) {
        await base44.entities.RewardItem.update(item.id, {
          stock_quantity: item.stock_quantity - 1,
          is_active: item.stock_quantity - 1 > 0,
        });
      }

      // Deduct tokens via centralized function
      await base44.functions.invoke('updateTokenBalance', {
        userEmail: user.email,
        userName: user.full_name,
        amount: -item.token_cost,
        type: 'reward_redeemed',
        description: `Redeemed ${item.item_name}`,
        relatedEntityId: inventoryItem.id,
        relatedEntityType: 'UserInventory',
      });

      await base44.entities.Notification.create({
        user_email: user.email,
        type: 'reward',
        title: '🎁 Reward Redeemed!',
        message: `You redeemed "${item.item_name}" for ${item.token_cost} tokens`,
        related_entity_id: inventoryItem.id,
        related_entity_type: 'UserInventory',
        is_read: false,
        created_at: new Date().toISOString(),
      });

      return inventoryItem;
    },
    onSuccess: (data, item) => {
      queryClient.invalidateQueries({ queryKey: ['reward-items'] });
      queryClient.invalidateQueries({ queryKey: ['user-inventory'] });
      queryClient.invalidateQueries({ queryKey: ['token-balance'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success(`Redeemed: ${item.item_name}`);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to redeem item');
    },
  });

  return (
    <section id="token-store" className="section-container">
      <p className="font-mono text-[10px] tracking-[7px] uppercase text-fire-3 text-center mb-2">
        EXCLUSIVE REWARDS
      </p>
      <h2 className="heading-fire text-[clamp(36px,7vw,88px)] text-center leading-none mb-4 font-black">
        TOKEN STORE
      </h2>

      <p className="text-center font-rajdhani text-lg text-fire-4/70 max-w-3xl mx-auto mb-8">
        Redeem your earned tokens for exclusive rewards, badges, and event access passes
      </p>

      {/* Points Converter */}
      {events[0] && (
        <div className="max-w-2xl mx-auto mb-8">
          <PointsConverter eventId={events[0].id} />
        </div>
      )}

      {/* Token Balance & Inventory */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <TokenBalanceWidget />

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onClick={() => setShowInventory(true)}
          className="bg-gradient-to-br from-cyan/10 to-transparent border border-cyan/30 p-6 clip-cyber hover:bg-cyan/20 transition-all text-left"
        >
          <div className="flex items-center gap-3 mb-2">
            <Package size={24} className="text-cyan" />
            <div className="font-mono text-[10px] tracking-[2px] uppercase text-cyan/60">My Inventory</div>
          </div>
          <div className="font-orbitron text-2xl font-bold text-cyan">View Items</div>
          <div className="font-mono text-xs text-cyan/40 mt-1">Click to manage your rewards</div>
        </motion.button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-8">
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-fire-3/60" />
          <span className="font-mono text-xs text-fire-3/60 uppercase">Category:</span>
        </div>
        {['all', 'badge', 'event_pass', 'merchandise', 'nft', 'vip_access', 'exclusive_content'].map(cat => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3 py-1 font-mono text-[9px] tracking-[1px] uppercase border transition-all ${
              categoryFilter === cat
                ? 'border-fire-3 bg-fire-3/20 text-fire-4'
                : 'border-fire-3/20 text-fire-3/40 hover:border-fire-3/40'
            }`}
          >
            {cat.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 mb-8">
        <div className="flex items-center gap-2">
          <Star size={16} className="text-fire-3/60" />
          <span className="font-mono text-xs text-fire-3/60 uppercase">Rarity:</span>
        </div>
        {['all', 'common', 'rare', 'epic', 'legendary'].map(rarity => (
          <button
            key={rarity}
            onClick={() => setRarityFilter(rarity)}
            className={`px-3 py-1 font-mono text-[9px] tracking-[1px] uppercase border transition-all ${
              rarityFilter === rarity
                ? 'border-fire-3 bg-fire-3/20 text-fire-4'
                : 'border-fire-3/20 text-fire-3/40 hover:border-fire-3/40'
            }`}
          >
            {rarity}
          </button>
        ))}
      </div>

      {/* Reward Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-20">
          <Gift size={48} className="text-fire-3/30 mx-auto mb-4" />
          <p className="font-mono text-sm text-fire-3/40 tracking-[2px]">No rewards available</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item, i) => (
            <RewardItemCard
              key={item.id}
              item={item}
              index={i}
              userTokens={totalTokens}
              onRedeem={() => redeemItemMutation.mutate(item)}
              isRedeeming={redeemItemMutation.isPending}
              tierConfig={TIER_CONFIG}
            />
          ))}
        </div>
      )}

      {/* Inventory Modal */}
      {showInventory && (
        <UserInventoryPanel onClose={() => setShowInventory(false)} />
      )}
    </section>
  );
}