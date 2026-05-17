import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Tag, ShoppingBag, X, Filter, Search, Globe, Flag, Map, Trophy, Star, Zap, Shield, Crown, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import CyberOverlays from '../components/cyber/CyberOverlays';
import Navbar from '../components/cyber/Navbar';
import Footer from '../components/cyber/Footer';
import { useLang } from '../components/useLang';

const RARITY_CONFIG = {
  rising_star:     { label: 'Rising Star',     color: 'text-gray-400',   border: 'border-gray-400/30',   bg: 'bg-gray-400/8',   icon: Star },
  breakout_talent: { label: 'Breakout Talent', color: 'text-blue-400',   border: 'border-blue-400/30',   bg: 'bg-blue-400/8',   icon: Zap },
  elite_performer: { label: 'Elite Performer', color: 'text-purple-400', border: 'border-purple-500/30', bg: 'bg-purple-500/8', icon: Shield },
  living_legend:   { label: 'Living Legend',   color: 'text-yellow-400', border: 'border-yellow-400/40', bg: 'bg-yellow-400/8', icon: Crown },
};

const LEVEL_CONFIG = {
  regional:     { label: 'Regionale',     icon: Map,    color: 'text-gray-400' },
  national:     { label: 'Nazionale',     icon: Flag,   color: 'text-blue-400' },
  continental:  { label: 'Continentale', icon: Globe,  color: 'text-purple-400' },
  world:        { label: 'Mondiale',      icon: Trophy, color: 'text-yellow-400' },
};

function ListingCard({ listing, onBuy, isBuying, currentUserEmail }) {
  const rarity = RARITY_CONFIG[listing.rarity] || RARITY_CONFIG['rising_star'];
  const level = LEVEL_CONFIG[listing.tournament_level];
  const RarityIcon = rarity.icon;
  const LevelIcon = level?.icon;
  const isOwn = listing.seller_email === currentUserEmail;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative border ${rarity.border} ${rarity.bg} p-4 flex flex-col gap-3`}
      style={{ clipPath: 'polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))' }}
    >
      {/* Type badge */}
      <div className="flex items-center justify-between">
        <span className={`font-mono text-[8px] tracking-[2px] uppercase px-2 py-0.5 border ${
          listing.asset_type === 'snapshot'
            ? 'border-cyan/30 text-cyan bg-cyan/8'
            : 'border-fire-3/30 text-fire-3 bg-fire-3/8'
        }`}>
          {listing.asset_type === 'snapshot' ? '📸 NFT Snapshot' : '🃏 Card NFT'}
        </span>
        {isOwn && (
          <span className="font-mono text-[7px] tracking-[1px] uppercase text-white/30 border border-white/10 px-2 py-0.5">TUA</span>
        )}
      </div>

      {/* Athlete info */}
      <div>
        <div className="font-orbitron font-black text-base text-white/90">{listing.athlete_name}</div>
        {listing.sport && (
          <div className="font-mono text-[9px] text-white/35 uppercase tracking-[1px]">{listing.sport}</div>
        )}
      </div>

      {/* Rarity + Level */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className={`flex items-center gap-1 px-2 py-0.5 border ${rarity.border}`}>
          <RarityIcon size={10} className={rarity.color} />
          <span className={`font-mono text-[8px] uppercase tracking-[1px] ${rarity.color}`}>{rarity.label}</span>
        </div>
        {level && (
          <div className="flex items-center gap-1 px-2 py-0.5 border border-white/8">
            <LevelIcon size={10} className={level.color} />
            <span className={`font-mono text-[8px] uppercase tracking-[1px] ${level.color}`}>{level.label}</span>
          </div>
        )}
      </div>

      {/* Price */}
      <div className="flex items-baseline gap-1">
        <span className="font-orbitron font-black text-2xl text-fire-5">€{Number(listing.listing_price).toFixed(2)}</span>
        {listing.quantity > 1 && (
          <span className="font-mono text-[9px] text-white/30">x{listing.quantity}</span>
        )}
      </div>

      {/* Buy / own */}
      {isOwn ? (
        <div className="text-center py-2 border border-white/8 font-mono text-[9px] text-white/30">In vendita</div>
      ) : (
        <button
          onClick={() => onBuy(listing)}
          disabled={isBuying}
          className="btn-fire w-full text-xs"
        >
          {isBuying ? 'Acquisto...' : 'Acquista ora'}
        </button>
      )}
    </motion.div>
  );
}

export default function NFTMarketplace() {
  const [lang] = useLang();
  const queryClient = useQueryClient();

  // Filters
  const [search, setSearch] = useState('');
  const [filterRarity, setFilterRarity] = useState('all');
  const [filterLevel, setFilterLevel] = useState('all');
  const [filterSport, setFilterSport] = useState('all');
  const [filterType, setFilterType] = useState('all');

  // Modal state
  const [showSellModal, setShowSellModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [listingPrice, setListingPrice] = useState('');
  const [listingQty, setListingQty] = useState(1);

  const { data: user } = useQuery({ queryKey: ['current-user'], queryFn: () => base44.auth.me() });

  const { data: listings = [], isLoading } = useQuery({
    queryKey: ['marketplace-listings'],
    queryFn: () => base44.entities.SecondaryMarketListing.filter({ status: 'active' }),
    initialData: [],
    refetchInterval: 30000,
  });

  const { data: myTokens = [] } = useQuery({
    queryKey: ['my-tokens-mp', user?.email],
    queryFn: () => base44.entities.TokenOwnership.filter({ created_by: user.email }),
    enabled: !!user?.email,
    initialData: [],
  });

  const { data: myNFTs = [] } = useQuery({
    queryKey: ['my-nfts-mp', user?.email],
    queryFn: () => base44.entities.NFTOwnership.filter({ created_by: user.email }),
    enabled: !!user?.email,
    initialData: [],
  });

  // Collect unique sports from listings
  const allSports = useMemo(() => {
    const sports = listings.map(l => l.sport).filter(Boolean);
    return [...new Set(sports)];
  }, [listings]);

  // Filtered listings
  const filtered = useMemo(() => {
    return listings.filter(l => {
      if (filterRarity !== 'all' && l.rarity !== filterRarity) return false;
      if (filterLevel !== 'all' && l.tournament_level !== filterLevel) return false;
      if (filterSport !== 'all' && l.sport !== filterSport) return false;
      if (filterType !== 'all' && l.asset_type !== filterType) return false;
      if (search && !l.athlete_name?.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [listings, filterRarity, filterLevel, filterSport, filterType, search]);

  const createListingMutation = useMutation({
    mutationFn: async () => {
      if (!selectedAsset || !listingPrice || parseFloat(listingPrice) <= 0) throw new Error('Dati mancanti');
      return base44.entities.SecondaryMarketListing.create({
        asset_type: selectedAsset.asset_type,
        asset_id: selectedAsset.id,
        athlete_name: selectedAsset.athlete_name,
        sport: selectedAsset.sport || '',
        rarity: selectedAsset.rarity || 'rising_star',
        tournament_level: selectedAsset.tournament_level || 'regional',
        seller_email: user.email,
        quantity: listingQty,
        listing_price: parseFloat(listingPrice),
        total_value: parseFloat(listingPrice) * listingQty,
        status: 'active',
        listed_at: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace-listings'] });
      setShowSellModal(false);
      setSelectedAsset(null);
      setListingPrice('');
      setListingQty(1);
      toast.success('Card messa in vendita con successo!');
    },
  });

  const buyMutation = useMutation({
    mutationFn: async (listing) => {
      if (listing.seller_email === user?.email) throw new Error('Non puoi acquistare la tua stessa listing');
      const platformFee = listing.total_value * 0.05;
      const sellerReceives = listing.total_value - platformFee;
      await base44.entities.SecondaryMarketTrade.create({
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
      await base44.entities.SecondaryMarketListing.update(listing.id, { status: 'sold' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace-listings'] });
      toast.success('Acquisto completato!');
    },
    onError: (e) => toast.error(e.message || 'Errore durante l\'acquisto'),
  });

  return (
    <div className="min-h-screen bg-cyber-void text-[var(--text-main)]">
      <CyberOverlays />
      <Navbar lang={lang} />

      <div className="relative z-10 pt-[88px] max-w-[1400px] mx-auto px-4 md:px-8 pb-24">

        {/* Header */}
        <div className="mb-8 mt-4">
          <p className="font-mono text-[9px] tracking-[6px] uppercase text-fire-3/40 mb-1">STREET DINAMICS</p>
          <h1 className="heading-fire text-[clamp(32px,6vw,72px)] leading-none font-black mb-3">NFT MARKETPLACE</h1>
          <p className="font-rajdhani text-base text-white/40 max-w-2xl">
            Compra e vendi card NFT e NFT Snapshot degli atleti SD. Ogni card è aggiornata con le statistiche reali del torneo.
          </p>
          <div className="h-[1px] bg-gradient-to-r from-fire-3 via-fire-5/40 to-transparent mt-4" />
        </div>

        {/* Actions bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2">
            <ShoppingBag size={14} className="text-fire-3/50" />
            <span className="font-mono text-[10px] text-white/30">{filtered.length} listing{filtered.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => queryClient.invalidateQueries({ queryKey: ['marketplace-listings'] })}
              className="btn-ghost flex items-center gap-2 text-[10px] px-3 py-2"
            >
              <RefreshCw size={12} /> Aggiorna
            </button>
            {user && (
              <button onClick={() => setShowSellModal(true)} className="btn-fire flex items-center gap-2">
                <Tag size={14} /> Metti in vendita
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 p-4 border border-fire-3/12 bg-fire-3/3"
          style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))' }}>
          <div className="flex items-center gap-2 mb-3">
            <Filter size={12} className="text-fire-3/50" />
            <span className="font-mono text-[9px] tracking-[3px] uppercase text-fire-3/40">Filtri</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {/* Search */}
            <div className="relative lg:col-span-2">
              <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Cerca atleta..."
                className="cyber-input pl-8 text-sm py-2"
              />
            </div>

            {/* Type */}
            <select value={filterType} onChange={e => setFilterType(e.target.value)} className="cyber-input cyber-select text-sm py-2">
              <option value="all">Tutti i tipi</option>
              <option value="token">🃏 Card NFT</option>
              <option value="snapshot">📸 NFT Snapshot</option>
            </select>

            {/* Rarity */}
            <select value={filterRarity} onChange={e => setFilterRarity(e.target.value)} className="cyber-input cyber-select text-sm py-2">
              <option value="all">Tutte le rarità</option>
              {Object.entries(RARITY_CONFIG).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>

            {/* Level */}
            <select value={filterLevel} onChange={e => setFilterLevel(e.target.value)} className="cyber-input cyber-select text-sm py-2">
              <option value="all">Tutti i livelli</option>
              {Object.entries(LEVEL_CONFIG).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>
          {allSports.length > 0 && (
            <div className="flex gap-2 mt-2 flex-wrap">
              <button
                onClick={() => setFilterSport('all')}
                className={`font-mono text-[8px] tracking-[1px] uppercase px-2 py-1 border transition-all ${
                  filterSport === 'all' ? 'border-fire-3/60 text-fire-3 bg-fire-3/10' : 'border-white/10 text-white/30 hover:border-white/20'
                }`}
              >
                Tutti gli sport
              </button>
              {allSports.map(s => (
                <button
                  key={s}
                  onClick={() => setFilterSport(filterSport === s ? 'all' : s)}
                  className={`font-mono text-[8px] tracking-[1px] uppercase px-2 py-1 border transition-all ${
                    filterSport === s ? 'border-fire-3/60 text-fire-3 bg-fire-3/10' : 'border-white/10 text-white/30 hover:border-white/20'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Listings grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-2 border-fire-3/30 border-t-fire-3 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <ShoppingBag size={48} className="text-fire-3/20 mx-auto mb-4" />
            <p className="font-orbitron text-sm text-white/25 tracking-[2px]">Nessuna listing trovata</p>
            <p className="font-rajdhani text-sm text-white/20 mt-1">Prova a cambiare i filtri o metti in vendita la tua prima card</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((listing, idx) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                onBuy={() => buyMutation.mutate(listing)}
                isBuying={buyMutation.isPending}
                currentUserEmail={user?.email}
              />
            ))}
          </div>
        )}
      </div>

      {/* Sell Modal */}
      <AnimatePresence>
        {showSellModal && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-[#04020a] border border-fire-3/30 p-6"
              style={{ clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))' }}
            >
              <div className="flex items-center justify-between mb-5">
                <div>
                  <div className="font-mono text-[8px] tracking-[3px] uppercase text-fire-3/40 mb-0.5">MARKETPLACE</div>
                  <h3 className="font-orbitron font-black text-lg text-fire-4">Metti in vendita</h3>
                </div>
                <button onClick={() => setShowSellModal(false)} className="p-1.5 border border-fire-3/20 hover:border-fire-3/40 transition-all">
                  <X size={16} className="text-fire-3" />
                </button>
              </div>

              <div className="space-y-5">
                {/* Asset selection */}
                <div>
                  <label className="font-mono text-[9px] tracking-[2px] uppercase text-fire-3/50 mb-2 block">Seleziona card</label>
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {myTokens.length === 0 && myNFTs.length === 0 && (
                      <p className="font-rajdhani text-sm text-white/30 text-center py-4">Nessuna card disponibile</p>
                    )}
                    {myTokens.map(tok => (
                      <button key={tok.id}
                        onClick={() => setSelectedAsset({ ...tok, asset_type: 'token' })}
                        className={`w-full p-3 border text-left transition-all ${
                          selectedAsset?.id === tok.id ? 'border-fire-3 bg-fire-3/15' : 'border-fire-3/15 bg-fire-3/5 hover:border-fire-3/30'
                        }`}
                      >
                        <div className="font-rajdhani font-bold text-fire-5 text-sm">{tok.athlete_name}</div>
                        <div className="font-mono text-[8px] text-fire-3/50 uppercase">🃏 Card · {tok.rarity?.replace(/_/g, ' ') || 'rising star'}</div>
                      </button>
                    ))}
                    {myNFTs.map(nft => (
                      <button key={nft.id}
                        onClick={() => setSelectedAsset({ ...nft, asset_type: 'snapshot' })}
                        className={`w-full p-3 border text-left transition-all ${
                          selectedAsset?.id === nft.id ? 'border-cyan bg-cyan/15' : 'border-cyan/15 bg-cyan/5 hover:border-cyan/30'
                        }`}
                      >
                        <div className="font-rajdhani font-bold text-cyan text-sm">{nft.athlete_name}</div>
                        <div className="font-mono text-[8px] text-cyan/50 uppercase">📸 NFT Snapshot · #{nft.serial_number}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price */}
                <div>
                  <label className="font-mono text-[9px] tracking-[2px] uppercase text-fire-3/50 mb-2 block">Prezzo (€)</label>
                  <input
                    type="number" step="0.01" min="0"
                    value={listingPrice}
                    onChange={e => setListingPrice(e.target.value)}
                    placeholder="Es. 25.00"
                    className="cyber-input"
                  />
                </div>

                {/* Quantity for tokens */}
                {selectedAsset?.asset_type === 'token' && (
                  <div>
                    <label className="font-mono text-[9px] tracking-[2px] uppercase text-fire-3/50 mb-2 block">Quantità</label>
                    <input type="number" min="1"
                      value={listingQty}
                      onChange={e => setListingQty(parseInt(e.target.value) || 1)}
                      className="cyber-input"
                    />
                  </div>
                )}

                {/* Fee breakdown */}
                {listingPrice > 0 && (
                  <div className="bg-black/40 border border-white/8 p-3 space-y-1.5">
                    <div className="flex justify-between font-mono text-[9px]">
                      <span className="text-white/30">Totale vendita</span>
                      <span className="text-fire-4">€{(parseFloat(listingPrice) * listingQty).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-mono text-[9px]">
                      <span className="text-white/30">Fee piattaforma (5%)</span>
                      <span className="text-red-400">-€{((parseFloat(listingPrice) * listingQty) * 0.05).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-mono text-[9px] pt-1.5 border-t border-white/8">
                      <span className="text-fire-5 font-bold">Ricevi</span>
                      <span className="text-fire-5 font-bold">€{((parseFloat(listingPrice) * listingQty) * 0.95).toFixed(2)}</span>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  <button onClick={() => setShowSellModal(false)} className="btn-ghost flex-1">Annulla</button>
                  <button
                    onClick={() => createListingMutation.mutate()}
                    disabled={!selectedAsset || !listingPrice || createListingMutation.isPending}
                    className="btn-fire flex-1"
                  >
                    {createListingMutation.isPending ? 'Pubblicazione...' : 'Pubblica'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer lang={lang} />
    </div>
  );
}