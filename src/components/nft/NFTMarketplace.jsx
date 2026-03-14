import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Sparkles, Flame, Star, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from '../translations';
import NFTFilterPanel from './NFTFilterPanel';

export default function NFTMarketplace({ lang = 'en' }) {
  const t = useTranslation(lang);
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    rarity: 'all',
    athlete: '',
    priceRange: [0, 1000],
    availability: 'all',
  });

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nft-cards'] });
      queryClient.invalidateQueries({ queryKey: ['my-nfts'] });
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

  const rarityColors = {
    common: { bg: 'from-fire-3/10 to-fire-3/5', border: 'border-fire-3/30', text: 'text-fire-3' },
    rare: { bg: 'from-cyan/10 to-cyan/5', border: 'border-cyan/30', text: 'text-cyan' },
    epic: { bg: 'from-purple-500/10 to-purple-500/5', border: 'border-purple-500/30', text: 'text-purple-400' },
    legendary: { bg: 'from-fire-5/20 to-fire-3/10', border: 'border-fire-5/40', text: 'text-fire-6' },
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
        Historic Moments
      </p>
      <h2 className="heading-fire text-[clamp(36px,7vw,88px)] text-center leading-none mb-4 font-black">
        NFT COLLECTION CARDS
      </h2>

      <p className="text-center font-rajdhani text-lg text-fire-4/70 max-w-3xl mx-auto mb-8">
        Each NFT captures a unique historic moment. Limited supply. Value grows with athlete performance.
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
          Showing <span className="text-fire-4 font-bold">{liveCards.length}</span> of <span className="text-fire-4 font-bold">{nftCards.length}</span> NFT drops
        </p>
      </div>

      {/* NFT Grid */}
      {liveCards.length === 0 ? (
        <div className="text-center py-20">
          <Sparkles size={48} className="text-fire-3/30 mx-auto mb-4" />
          <p className="font-mono text-sm text-fire-3/40 tracking-[2px]">NO DROPS MATCH YOUR FILTERS</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {liveCards.map((card, i) => {
            const rarityStyle = rarityColors[card.rarity];
            const availability = card.total_supply - card.minted_count;
            const soldPercentage = (card.minted_count / card.total_supply) * 100;
            const isOwned = myNFTs.some(nft => nft.nft_id === card.id);

            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`relative bg-gradient-to-br ${rarityStyle.bg} border ${rarityStyle.border} overflow-hidden`}
              >
                {/* Rarity Badge */}
                <div className={`absolute top-3 right-3 px-3 py-1 border ${rarityStyle.border} ${rarityStyle.text} font-mono text-xs tracking-[1px] uppercase bg-black/60 backdrop-blur-sm z-10`}>
                  {card.rarity}
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
                      <div className="font-mono text-xs text-fire-3/60">CARD #</div>
                      <div className="font-orbitron font-bold text-fire-5">{card.card_number}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-xs text-fire-3/60">PRICE</div>
                      <div className="font-orbitron font-bold text-fire-5">€{card.mint_price}</div>
                    </div>
                  </div>

                  {/* Availability */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-xs text-fire-3/60">AVAILABLE</span>
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

                  {/* Status & Action */}
                  {card.status === 'upcoming' ? (
                    <div className="text-center py-3 bg-fire-3/10 border border-fire-3/20">
                      <div className="font-mono text-xs text-fire-3/60 tracking-[1px]">
                        DROP: {new Date(card.drop_date).toLocaleDateString()}
                      </div>
                    </div>
                  ) : availability === 0 ? (
                    <div className="text-center py-3 bg-red-500/10 border border-red-500/30">
                      <div className="font-mono text-xs text-red-400 tracking-[1px] uppercase">
                        SOLD OUT
                      </div>
                    </div>
                  ) : isOwned ? (
                    <div className="text-center py-3 bg-cyan/10 border border-cyan/30">
                      <div className="font-mono text-xs text-cyan tracking-[1px] uppercase">
                        ✓ OWNED
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleMint(card)}
                      disabled={mintNFTMutation.isPending}
                      className="btn-fire w-full text-xs flex items-center justify-center gap-2"
                    >
                      <ShoppingCart size={14} />
                      {mintNFTMutation.isPending ? 'MINTING...' : 'MINT NOW'}
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

      {/* My Collection Preview */}
      {myNFTs.length > 0 && (
        <div className="mt-16">
          <h3 className="font-orbitron font-bold text-2xl text-fire-5 mb-6 text-center">
            MY COLLECTION
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {myNFTs.slice(0, 6).map((nft, i) => (
              <motion.div
                key={nft.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className={`bg-gradient-to-br ${rarityColors[nft.rarity].bg} border ${rarityColors[nft.rarity].border} p-3 text-center`}
              >
                <div className="font-mono text-xs text-fire-3/60 mb-1">#{nft.serial_number}</div>
                <div className="font-rajdhani font-bold text-sm text-fire-5">{nft.athlete_name}</div>
                <div className={`font-mono text-xs ${rarityColors[nft.rarity].text} uppercase mt-2`}>
                  {nft.rarity}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}