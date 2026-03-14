import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Tag, ShoppingBag, X } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from '../translations';
import ActivityFeed from './ActivityFeed';

export default function SecondaryMarket({ lang = 'en' }) {
  const t = useTranslation(lang);
  const [showListingModal, setShowListingModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [listingPrice, setListingPrice] = useState('');
  const [listingQuantity, setListingQuantity] = useState(1);
  const queryClient = useQueryClient();

  const { data: listings = [] } = useQuery({
    queryKey: ['secondary-listings'],
    queryFn: () => base44.entities.SecondaryMarketListing.filter({ status: 'active' }),
    initialData: [],
  });

  const { data: myTokens = [] } = useQuery({
    queryKey: ['my-tokens'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.TokenOwnership.filter({ created_by: user.email });
    },
    initialData: [],
  });

  const { data: myNFTs = [] } = useQuery({
    queryKey: ['my-nfts'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.NFTOwnership.filter({ 
        created_by: user.email,
        listed_for_sale: false
      });
    },
    initialData: [],
  });

  const createListingMutation = useMutation({
    mutationFn: async (data) => {
      const user = await base44.auth.me();
      
      return await base44.entities.SecondaryMarketListing.create({
        asset_type: data.asset_type,
        asset_id: data.asset_id,
        athlete_name: data.athlete_name,
        seller_email: user.email,
        quantity: data.quantity,
        listing_price: parseFloat(data.listing_price),
        total_value: parseFloat(data.listing_price) * data.quantity,
        status: 'active',
        listed_at: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['secondary-listings'] });
      queryClient.invalidateQueries({ queryKey: ['my-tokens'] });
      queryClient.invalidateQueries({ queryKey: ['my-nfts'] });
      setShowListingModal(false);
      setSelectedAsset(null);
      setListingPrice('');
      toast.success(t('secondary_list_success'));
    },
    onError: () => {
      toast.error(t('secondary_list_error'));
    },
  });

  const buyListingMutation = useMutation({
    mutationFn: async (listing) => {
      const user = await base44.auth.me();
      
      if (user.email === listing.seller_email) {
        throw new Error('Cannot buy your own listing');
      }

      const platformFee = listing.total_value * 0.05;
      const sellerReceives = listing.total_value - platformFee;

      // Create trade record
      const trade = await base44.entities.SecondaryMarketTrade.create({
        listing_id: listing.id,
        asset_type: listing.asset_type,
        asset_id: listing.asset_id,
        athlete_name: listing.athlete_name,
        seller_email: listing.seller_email,
        buyer_email: user.email,
        quantity: listing.quantity,
        price_per_unit: listing.listing_price,
        total_amount: listing.total_value,
        platform_fee: platformFee,
        seller_receives: sellerReceives,
        traded_at: new Date().toISOString(),
      });

      // Update listing status
      await base44.entities.SecondaryMarketListing.update(listing.id, {
        status: 'sold',
      });

      // Transfer ownership based on asset type
      if (listing.asset_type === 'token') {
        await base44.entities.TokenOwnership.create({
          athlete_name: listing.athlete_name,
          token_tier: 'common', // Would need to fetch from original
          purchase_price: listing.listing_price,
          purchase_date: new Date().toISOString().split('T')[0],
        });
      } else if (listing.asset_type === 'nft') {
        const nft = await base44.entities.NFTOwnership.filter({ id: listing.asset_id });
        if (nft[0]) {
          await base44.entities.NFTOwnership.update(listing.asset_id, {
            created_by: user.email,
            purchase_price: listing.listing_price,
            purchase_type: 'secondary',
          });
        }
      }

      return trade;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['secondary-listings'] });
      queryClient.invalidateQueries({ queryKey: ['my-tokens'] });
      queryClient.invalidateQueries({ queryKey: ['my-nfts'] });
      toast.success('Purchase successful!');
    },
    onError: (error) => {
      toast.error(error.message || 'Purchase failed');
    },
  });

  const handleCreateListing = () => {
    if (!selectedAsset || !listingPrice || listingPrice <= 0) {
      toast.error('Please fill in all fields');
      return;
    }

    createListingMutation.mutate({
      asset_type: selectedAsset.type,
      asset_id: selectedAsset.id,
      athlete_name: selectedAsset.athlete_name,
      quantity: listingQuantity,
      listing_price: listingPrice,
    });
  };

  return (
    <section id="secondary-market" className="section-container">
      <div className="absolute bottom-[-1px] left-0 right-0 h-[1px] fire-line" />
      
      <p className="font-mono text-[10px] tracking-[7px] uppercase text-fire-3 text-center mb-2">
        {t('secondary_subtitle')}
      </p>
      <h2 className="heading-fire text-[clamp(36px,7vw,88px)] text-center leading-none mb-4 font-black">
        {t('secondary_title')}
      </h2>

      <p className="text-center font-rajdhani text-lg text-fire-4/70 max-w-3xl mx-auto mb-8">
        {t('secondary_description')}
      </p>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4 mb-12">
        <button
          onClick={() => setShowListingModal(true)}
          disabled={myTokens.length === 0 && myNFTs.length === 0}
          className="btn-fire flex items-center gap-2"
        >
          <Tag size={16} />
          {t('secondary_list_for_sale')}
        </button>
      </div>

      {/* Activity Feed */}
      <ActivityFeed lang={lang} />

      {/* Active Listings */}
      {listings.length === 0 ? (
        <div className="text-center py-20">
          <ShoppingBag size={48} className="text-fire-3/30 mx-auto mb-4" />
          <p className="font-mono text-sm text-fire-3/40 tracking-[2px]">{t('secondary_no_listings')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing, i) => (
            <motion.div
              key={listing.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-gradient-to-br from-[rgba(10,4,18,0.97)] to-[rgba(4,2,8,0.99)] border border-fire-3/20 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`px-3 py-1 border text-xs font-mono tracking-[1px] uppercase ${
                  listing.asset_type === 'nft'
                    ? 'bg-cyan/10 border-cyan/30 text-cyan'
                    : 'bg-fire-3/10 border-fire-3/30 text-fire-3'
                }`}>
                  {listing.asset_type}
                </div>
                <TrendingUp size={16} className="text-fire-5" />
              </div>

              <div className="mb-4">
               <div className="font-orbitron font-black text-xl text-fire-5 mb-1">
                 {listing.athlete_name}
               </div>
               <div className="font-mono text-xs text-fire-3/60">
                 {t('secondary_quantity')}: {listing.quantity}
               </div>
              </div>

              <div className="mb-4">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-orbitron font-black text-3xl text-fire-5">
                    €{listing.listing_price.toFixed(2)}
                  </span>
                  <span className="font-mono text-xs text-fire-3/60">{t('secondary_per_unit')}</span>
                </div>
                <div className="font-mono text-sm text-fire-4">
                  {t('secondary_total')}: €{listing.total_value.toFixed(2)}
                </div>
              </div>

              <button
                onClick={() => buyListingMutation.mutate(listing)}
                disabled={buyListingMutation.isPending}
                className="btn-fire w-full text-xs"
              >
                {buyListingMutation.isPending ? t('secondary_processing') : t('secondary_buy_now')}
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Listing Modal */}
      <AnimatePresence>
        {showListingModal && (
          <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-gradient-to-br from-[rgba(10,4,18,0.98)] to-[rgba(4,2,8,0.99)] border border-fire-3/30 clip-cyber p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="heading-fire text-2xl font-black">{t('secondary_create_listing')}</h3>
                <button
                  onClick={() => setShowListingModal(false)}
                  className="p-2 border border-fire-3/20 hover:border-fire-3/40 transition-all"
                >
                  <X size={18} className="text-fire-3" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Select Asset */}
                <div>
                  <label className="font-orbitron text-sm font-bold text-fire-4 mb-3 block">
                    {t('secondary_select_asset')}
                  </label>
                  
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {myTokens.map((token) => (
                      <button
                        key={token.id}
                        onClick={() => setSelectedAsset({ 
                          type: 'token', 
                          id: token.id, 
                          athlete_name: token.athlete_name 
                        })}
                        className={`w-full p-4 border text-left transition-all ${
                          selectedAsset?.id === token.id
                            ? 'border-fire-3 bg-fire-3/20'
                            : 'border-fire-3/20 bg-fire-3/5 hover:border-fire-3/40'
                        }`}
                      >
                        <div className="font-rajdhani font-bold text-fire-5">{token.athlete_name}</div>
                        <div className="font-mono text-xs text-fire-3/60">Token · {token.token_tier}</div>
                      </button>
                    ))}
                    
                    {myNFTs.map((nft) => (
                      <button
                        key={nft.id}
                        onClick={() => setSelectedAsset({ 
                          type: 'nft', 
                          id: nft.id, 
                          athlete_name: nft.athlete_name 
                        })}
                        className={`w-full p-4 border text-left transition-all ${
                          selectedAsset?.id === nft.id
                            ? 'border-cyan bg-cyan/20'
                            : 'border-cyan/20 bg-cyan/5 hover:border-cyan/40'
                        }`}
                      >
                        <div className="font-rajdhani font-bold text-cyan">{nft.athlete_name}</div>
                        <div className="font-mono text-xs text-cyan/60">
                          NFT #{nft.serial_number} · {nft.rarity}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Input */}
                <div>
                  <label className="font-orbitron text-sm font-bold text-fire-4 mb-2 block">
                    {t('secondary_listing_price')}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={listingPrice}
                    onChange={(e) => setListingPrice(e.target.value)}
                    placeholder={t('secondary_enter_price')}
                    className="cyber-input"
                  />
                </div>

                {/* Quantity (for tokens) */}
                {selectedAsset?.type === 'token' && (
                  <div>
                    <label className="font-orbitron text-sm font-bold text-fire-4 mb-2 block">
                      {t('secondary_quantity')}
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={listingQuantity}
                      onChange={(e) => setListingQuantity(parseInt(e.target.value))}
                      className="cyber-input"
                    />
                  </div>
                )}

                {/* Fee Info */}
                {listingPrice > 0 && (
                  <div className="bg-fire-3/10 border border-fire-3/20 p-4">
                    <div className="font-mono text-xs text-fire-3/60 space-y-1">
                      <div className="flex justify-between">
                        <span>{t('secondary_sale_price')}:</span>
                        <span className="text-fire-4">
                          €{(parseFloat(listingPrice) * listingQuantity).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t('secondary_platform_fee')}:</span>
                        <span className="text-red-400">
                          -€{((parseFloat(listingPrice) * listingQuantity) * 0.05).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-fire-3/20">
                        <span className="text-fire-5">{t('secondary_you_receive')}:</span>
                        <span className="text-fire-5 font-bold">
                          €{((parseFloat(listingPrice) * listingQuantity) * 0.95).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowListingModal(false)}
                    className="btn-ghost flex-1"
                  >
                    CANCEL
                  </button>
                  <button
                    onClick={handleCreateListing}
                    disabled={!selectedAsset || !listingPrice || createListingMutation.isPending}
                    className="btn-fire flex-1"
                  >
                    {createListingMutation.isPending ? 'CREATING...' : 'CREATE LISTING'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}