import React, { useState, useMemo } from 'react';

// Unified tier config for both NFT and Token cards
const TIER_CONFIG = {
  rising_star: { bg: 'from-slate-600 to-slate-800', glow: 'rgba(148, 163, 184, 0.4)', border: 'border-slate-500/30', accent: 'text-slate-400', label: 'Rising Star' },
  breakout_talent: { bg: 'from-blue-600 to-purple-700', glow: 'rgba(147, 51, 234, 0.4)', border: 'border-purple-500/30', accent: 'text-purple-400', label: 'Breakout Talent' },
  elite_performer: { bg: 'from-cyan-500 to-cyan-700', glow: 'rgba(0, 255, 238, 0.4)', border: 'border-cyan/30', accent: 'text-cyan', label: 'Elite Performer' },
  living_legend: { bg: 'from-yellow-500 via-orange-500 to-red-600', glow: 'rgba(255, 150, 0, 0.6)', border: 'border-fire-3/40', accent: 'text-fire-5', label: 'Living Legend' },
};
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Sparkles, Flame, Star, ShoppingCart, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from '../translations';
import NFTFilterPanel from './NFTFilterPanel';
import WatchlistButton from '../watchlist/WatchlistButton';
import NFTAnalyticsModal from './NFTAnalyticsModal';
import EarlyAccessGate from '../marketplace/EarlyAccessGate';

export default function NFTMarketplace({ lang = 'en' }) {
  const t = useTranslation(lang);
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    rarity: 'all',
    athlete: '',
    priceRange: [0, 1000],
    availability: 'all',
  });
  const [selectedNFT, setSelectedNFT] = useState(null);

  const { data: nftCards = [] } = useQuery({
    queryKey: ['nft-cards'],
    queryFn: () => base44.entities.NFTCollectionCard.list('-drop_date', 100),
    initialData: [],
  });

  const { data: myNFTs = [] } = useQuery({
    queryKey: ['my-nfts'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.NFTOwnership.filter({ created_by: user.email });
    },
    initialData: [],
  });

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: fanStatus } = useQuery({
    queryKey: ['fan-status', user?.email],
    queryFn: () => base44.entities.FanStatus.filter({ user_email: user?.email }).then(r => r[0]),
    enabled: !!user,
  });

  const mintNFTMutation = useMutation({
    mutationFn: async ({ nftId, cardData }) => {
      const user = await base44.auth.me();

      // Refetch latest card data to prevent race condition
      const latestCard = await base44.entities.NFTCollectionCard.filter({ id: nftId });
      const card = latestCard[0];

      if (!card) throw new Error('NFT card not found');
      if (card.minted_count >= card.total_supply) throw new Error('Sold out');
      if (card.status !== 'live') throw new Error('Drop is not live');

      // Create ownership record with immutable reference
      const ownership = await base44.entities.NFTOwnership.create({
        nft_id: nftId,
        athlete_name: card.athlete_name, // Reference from card
        card_number: card.card_number,
        serial_number: card.minted_count + 1, // Incremental serial
        rarity: card.rarity,
        purchase_price: card.mint_price,
        purchase_type: 'mint',
        minted_at: new Date().toISOString(),
        buyer_email: user.email,
      });

      // Update card minted count
      await base44.entities.NFTCollectionCard.update(nftId, {
        minted_count: card.minted_count + 1,
        status: card.minted_count + 1 >= card.total_supply ? 'sold_out' : card.status,
      });

      return ownership;
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['nft-cards'] });
      queryClient.invalidateQueries({ queryKey: ['my-nfts'] });
      queryClient.invalidateQueries({ queryKey: ['fan-status'] });
      
      // Update fan status after NFT mint
      try {
        const user = await base44.auth.me();
        await base44.functions.invoke('updateFanStatus', { userEmail: user.email });
      } catch (err) {
        console.error('Failed to update fan status:', err);
      }
      
      toast.success('NFT minted successfully!');
    },
    onError: () => {
      toast.error('Failed to mint NFT');
    },
  });

  const handleMint = async (card) => {
    try {
      const user = await base44.auth.me();

      // Client-side validation
      if (card.status !== 'live') {
        toast.error('This drop is not live yet');
        return;
      }
      if (card.minted_count >= card.total_supply) {
        toast.error('Sold out!');
        return;
      }
      if (card.mint_price <= 0) {
        toast.error('Invalid mint price');
        return;
      }

      mintNFTMutation.mutate({ nftId: card.id, cardData: card });
    } catch (err) {
      toast.error('Failed to initiate mint');
    }
  };



  // Get unique athlete names
  const athleteNames = useMemo(() => {
    return Array.from(new Set(nftCards.map(c => c.athlete_name))).sort();
  }, [nftCards]);

  // Apply all filters
  const filteredCards = useMemo(() => {
    return nftCards.filter(card => {
      // Rarity filter
      if (filters.rarity !== 'all' && card.rarity !== filters.rarity) return false;

      // Athlete filter
      if (filters.athlete && card.athlete_name !== filters.athlete) return false;

      // Price range filter
      if (card.mint_price < filters.priceRange[0] || card.mint_price > filters.priceRange[1]) return false;

      // Availability filter
      const availability = card.status === 'sold_out' ? 'soldout' : 
                          card.status === 'upcoming' ? 'upcoming' :
                          (card.total_supply - card.minted_count) === 0 ? 'soldout' :
                          (card.total_supply - card.minted_count) <= (card.total_supply * 0.2) ? 'limited' : 'available';
      
      if (filters.availability !== 'all' && availability !== filters.availability) return false;

      return true;
    });
  }, [nftCards, filters]);

  const liveCards = filteredCards.filter(c => c.status === 'live' || c.status === 'upcoming');

  return (
    <section id="nft-marketplace" className="section-container">
      <p className="font-mono text-[10px] tracking-[7px] uppercase text-fire-3 text-center mb-2">
        {t('nft_subtitle')}
      </p>
      <h2 className="heading-fire text-[clamp(36px,7vw,88px)] text-center leading-none mb-4 font-black">
        {t('nft_title')}
      </h2>

      <p className="text-center font-rajdhani text-lg text-fire-4/70 max-w-3xl mx-auto mb-8">
        {t('nft_description')}
      </p>

      {/* Advanced Filter Panel */}
      <NFTFilterPanel
        filters={filters}
        onFiltersChange={setFilters}
        athletes={athleteNames}
        priceRange={[0, 1000]}
      />

      {/* Results Info */}
      <div className="mb-6 flex items-center justify-between">
        <p className="font-mono text-sm text-fire-3/60 tracking-[1px]">
          {t('nft_showing')} <span className="text-fire-4 font-bold">{liveCards.length}</span> {t('nft_of')} <span className="text-fire-4 font-bold">{nftCards.length}</span> {t('nft_drops')}
        </p>
      </div>

      {/* NFT Grid */}
      {liveCards.length === 0 ? (
        <div className="text-center py-20">
          <Sparkles size={48} className="text-fire-3/30 mx-auto mb-4" />
          <p className="font-mono text-sm text-fire-3/40 tracking-[2px]">{t('nft_no_drops')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {liveCards.map((card, i) => {
            const tierStyle = TIER_CONFIG[card.rarity];
            const availability = card.total_supply - card.minted_count;
            const soldPercentage = (card.minted_count / card.total_supply) * 100;
            const isOwned = myNFTs.some(nft => nft.nft_id === card.id);

            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`relative bg-gradient-to-br from-[rgba(10,4,18,0.98)] to-[rgba(4,2,8,1)] border ${tierStyle.border} overflow-hidden group clip-cyber`}
              >
                {/* Early Access Gate */}
                <EarlyAccessGate 
                  dropDate={card.drop_date} 
                  fanTier={fanStatus?.current_tier}
                  requiredTier="superfan"
                />

                {/* Tier glow */}
                <motion.div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 0%, ${tierStyle.glow}, transparent 70%)` }} />
                
                {/* Rarity Badge */}
                <div className={`absolute top-3 right-3 px-3 py-1 border font-orbitron text-[8px] tracking-[2px] uppercase bg-gradient-to-r ${tierStyle.bg} ${tierStyle.accent} clip-btn z-10`}>
                  {tierStyle.label}
                </div>

                {/* Image */}
                {card.image_url && (
                  <div className="aspect-square overflow-hidden bg-black/40">
                    <img
                      src={card.image_url}
                      alt={card.event_moment}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Card Info */}
                <div className="p-5">
                  <div className="mb-3">
                    <div className="font-orbitron font-black text-xl text-fire-5 mb-1">
                      {card.athlete_name}
                    </div>
                    <div className="font-rajdhani text-sm text-fire-4/80">
                      {card.event_moment}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="font-mono text-xs text-fire-3/60">{t('nft_card_number')}</div>
                      <div className="font-orbitron font-bold text-fire-5">{card.card_number}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-xs text-fire-3/60">{t('nft_price')}</div>
                      <div className="font-orbitron font-bold text-fire-5">€{card.mint_price}</div>
                    </div>
                  </div>

                  {/* Availability */}
                   <div className="mb-4">
                     <div className="flex items-center justify-between mb-1">
                       <span className="font-mono text-xs text-fire-3/60">{t('nft_available')}</span>
                       <span className={`font-mono text-xs ${
                         availability === 0 ? 'text-red-400' : 'text-fire-4'
                       }`}>
                         {availability} / {card.total_supply}
                       </span>
                     </div>
                    <div className="h-2 bg-fire-3/10 rounded overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${soldPercentage}%` }}
                        className="h-full bg-gradient-to-r from-fire-3 to-fire-5"
                      />
                    </div>
                  </div>

                  {/* Analytics & Watchlist */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <button
                      onClick={() => setSelectedNFT(card)}
                      className="btn-cyan text-xs flex items-center justify-center gap-1"
                    >
                      <BarChart3 size={12} />
                      Analytics
                    </button>
                    <WatchlistButton
                      assetType="nft_drop"
                      assetId={card.id}
                      assetName={card.athlete_name}
                      price={card.mint_price}
                      className="border border-fire-3/20 hover:border-fire-3/40 py-2 px-2 text-xs justify-center"
                    />
                  </div>

                  {/* Status & Action */}
                  {card.status === 'upcoming' ? (
                    <div className="text-center py-3 bg-fire-3/10 border border-fire-3/20">
                      <div className="font-mono text-xs text-fire-3/60 tracking-[1px]">
                        {t('nft_drop')}: {new Date(card.drop_date).toLocaleDateString()}
                      </div>
                    </div>
                  ) : availability === 0 ? (
                    <div className="text-center py-3 bg-red-500/10 border border-red-500/30">
                      <div className="font-mono text-xs text-red-400 tracking-[1px] uppercase">
                        {t('nft_sold_out')}
                      </div>
                    </div>
                  ) : isOwned ? (
                    <div className="text-center py-3 bg-cyan/10 border border-cyan/30">
                      <div className="font-mono text-xs text-cyan tracking-[1px] uppercase">
                        {t('nft_owned')}
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleMint(card)}
                      disabled={mintNFTMutation.isPending}
                      className="btn-fire w-full text-xs flex items-center justify-center gap-2"
                    >
                      <ShoppingCart size={14} />
                      {mintNFTMutation.isPending ? t('nft_minting') : t('nft_mint_now')}
                    </button>
                  )}
                </div>

                {/* Glow Effect for Legendary */}
                {card.rarity === 'legendary' && (
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-radial from-fire-5/20 via-transparent to-transparent animate-pulse" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Analytics Modal */}
      {selectedNFT && (
        <NFTAnalyticsModal nft={selectedNFT} onClose={() => setSelectedNFT(null)} />
      )}

      {/* My Collection Preview */}
      {myNFTs.length > 0 && (
        <div className="mt-16">
          <h3 className="font-orbitron font-bold text-2xl text-fire-5 mb-6 text-center">
            {t('nft_my_collection')}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {myNFTs.slice(0, 6).map((nft, i) => (
              <motion.div
                key={nft.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className={`bg-gradient-to-br from-[rgba(10,4,18,0.98)] to-[rgba(4,2,8,1)] border ${TIER_CONFIG[nft.rarity].border} p-3 text-center`}
              >
                <div className="font-mono text-xs text-fire-3/60 mb-1">#{nft.serial_number}</div>
                <div className="font-rajdhani font-bold text-sm text-fire-5">{nft.athlete_name}</div>
                <div className={`font-mono text-xs ${TIER_CONFIG[nft.rarity].accent} uppercase mt-2`}>
                   {TIER_CONFIG[nft.rarity].label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}