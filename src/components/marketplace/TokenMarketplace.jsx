import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { TrendingUp, Sparkles } from 'lucide-react';
import TokenCard from './TokenCard';
import TokenFilters from './TokenFilters';
import PurchaseModal from './PurchaseModal';
import PurchaseSuccessModal from './PurchaseSuccessModal';

export default function TokenMarketplace({ lang }) {
  const [filters, setFilters] = useState({
    tier: 'all',
    sport: 'all',
    status: 'all',
    sort: 'newest',
  });
  const [purchaseModal, setPurchaseModal] = useState(null);
  const [successModal, setSuccessModal] = useState(null);

  const { data: tokens = [], isLoading } = useQuery({
    queryKey: ['tokens'],
    queryFn: () => base44.entities.AthleteToken.list('-created_date', 100),
    initialData: [],
  });

  // Get unique sports
  const sports = [...new Set(tokens.map(t => t.sport))];

  // Apply filters
  let filteredTokens = tokens.filter(token => {
    if (filters.tier !== 'all' && token.token_tier !== filters.tier) return false;
    if (filters.sport !== 'all' && token.sport !== filters.sport) return false;
    if (filters.status !== 'all' && token.status !== filters.status) return false;
    return true;
  });

  // Apply sorting
  filteredTokens = [...filteredTokens].sort((a, b) => {
    switch (filters.sort) {
      case 'price_low':
        return (a.current_price || a.base_price) - (b.current_price || b.base_price);
      case 'price_high':
        return (b.current_price || b.base_price) - (a.current_price || a.base_price);
      case 'popular':
        return (b.total_supply - b.available_supply) - (a.total_supply - a.available_supply);
      default:
        return 0;
    }
  });

  const handlePurchaseSuccess = (transaction) => {
    setPurchaseModal(null);
    setSuccessModal(transaction);
  };

  return (
    <section id="marketplace" className="section-container">
      <p className="font-mono text-[10px] tracking-[7px] uppercase text-fire-3 text-center mb-2">Digital Collectibles</p>
      <h2 className="heading-fire text-[clamp(36px,7vw,88px)] text-center leading-none mb-4 font-black">
        TOKEN MARKETPLACE
      </h2>

      {/* Stats bar */}
      <div className="max-w-[960px] mx-auto mb-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-fire-3/10 to-fire-3/5 border border-fire-3/20 p-4 text-center"
          >
            <div className="flex items-center justify-center gap-2 mb-1">
              <Sparkles size={16} className="text-fire-3" />
              <span className="font-mono text-[9px] text-fire-3/40 tracking-[2px] uppercase">Total Athletes</span>
            </div>
            <div className="font-orbitron font-black text-3xl text-fire-5">{tokens.length}</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-cyan/10 to-cyan/5 border border-cyan/20 p-4 text-center"
          >
            <div className="flex items-center justify-center gap-2 mb-1">
              <TrendingUp size={16} className="text-cyan" />
              <span className="font-mono text-[9px] text-cyan/60 tracking-[2px] uppercase">Available Tokens</span>
            </div>
            <div className="font-orbitron font-black text-3xl text-cyan">
              {tokens.reduce((sum, t) => sum + (t.available_supply || 0), 0)}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20 p-4 text-center"
          >
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="font-mono text-[9px] text-purple-400/60 tracking-[2px] uppercase">Floor Price</span>
            </div>
            <div className="font-orbitron font-black text-3xl text-purple-400">
              €{tokens.length > 0 ? Math.min(...tokens.map(t => t.current_price || t.base_price)).toFixed(0) : 0}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Filters */}
      <TokenFilters filters={filters} onFilterChange={setFilters} sports={sports} />

      {/* Token grid */}
      {isLoading ? (
        <div className="text-center font-mono text-fire-3/30 text-sm tracking-[2px] py-20">LOADING TOKENS...</div>
      ) : filteredTokens.length === 0 ? (
        <div className="text-center py-20">
          <span className="text-4xl block mb-3">🎫</span>
          <p className="font-mono text-sm tracking-[2px] text-fire-3/30">No tokens match your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTokens.map((token, i) => (
            <motion.div
              key={token.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <TokenCard token={token} onBuy={() => setPurchaseModal(token)} />
            </motion.div>
          ))}
        </div>
      )}

      {/* Purchase modal */}
      {purchaseModal && (
        <PurchaseModal
          token={purchaseModal}
          onClose={() => setPurchaseModal(null)}
          onSuccess={handlePurchaseSuccess}
        />
      )}

      {/* Success modal */}
      {successModal && (
        <PurchaseSuccessModal
          transaction={successModal}
          onClose={() => setSuccessModal(null)}
        />
      )}
    </section>
  );
}