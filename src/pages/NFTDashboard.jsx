import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, Zap, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import NFTPriceChart from '../components/nft/NFTPriceChart';
import NFTRarityBreakdown from '../components/nft/NFTRarityBreakdown';
import NFTPortfolioGrowthChart from '../components/nft/NFTPortfolioGrowthChart';
import { useLang } from '../components/useLang';
import { useTranslation } from '../components/translations';

export default function NFTDashboard() {
  const [sortBy, setSortBy] = useState('value');
  const [lang] = useLang();
  const t = useTranslation(lang);

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: ownedNFTs = [] } = useQuery({
    queryKey: ['my-nfts', user?.email],
    queryFn: async () => {
      if (!user) return [];
      return base44.entities.NFTOwnership.filter({ buyer_email: user.email });
    },
    enabled: !!user,
    initialData: [],
  });

  const { data: cards = [] } = useQuery({
    queryKey: ['nft-cards'],
    queryFn: () => base44.entities.NFTCollectionCard.list('-created_date', 100),
    initialData: [],
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ['my-transactions'],
    queryFn: async () => {
      if (!user) return [];
      const buys = await base44.entities.SecondaryMarketTrade.filter({ buyer_email: user.email });
      const sells = await base44.entities.SecondaryMarketTrade.filter({ seller_email: user.email });
      return [...buys, ...sells].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    },
    enabled: !!user,
    initialData: [],
  });

  // Enrich NFTs with card data
  const enrichedNFTs = ownedNFTs.map(nft => {
    const card = cards.find(c => c.id === nft.nft_id);
    const nftTransactions = transactions.filter(t => t.nft_id === nft.nft_id);
    
    return {
      ...nft,
      card,
      transactions: nftTransactions,
      currentValue: nftTransactions.length > 0 
        ? nftTransactions[0].price 
        : nft.purchase_price,
      profitLoss: (nftTransactions.length > 0 ? nftTransactions[0].price : nft.purchase_price) - nft.purchase_price,
    };
  });

  // Portfolio calculations
  const totalValue = enrichedNFTs.reduce((sum, nft) => sum + nft.currentValue, 0);
  const totalInvested = enrichedNFTs.reduce((sum, nft) => sum + nft.purchase_price, 0);
  const totalProfitLoss = totalValue - totalInvested;
  const profitLossPercent = totalInvested > 0 ? ((totalProfitLoss / totalInvested) * 100).toFixed(2) : 0;

  // Sort NFTs
  const sortedNFTs = [...enrichedNFTs].sort((a, b) => {
    if (sortBy === 'value') return b.currentValue - a.currentValue;
    if (sortBy === 'profit') return b.profitLoss - a.profitLoss;
    return new Date(b.minted_at) - new Date(a.minted_at);
  });

  const rarityColors = {
    common: 'text-fire-3',
    rare: 'text-cyan',
    epic: 'text-purple-400',
    legendary: 'text-fire-6',
  };

  return (
    <div className="min-h-screen bg-cyber-void text-[var(--text-main)] p-6">
      {/* Background effects */}
      <div className="cyber-grid" />
      <div className="cyber-scanlines" />
      <div className="cyber-vignette" />

      <div className="relative z-10 max-w-[1600px] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <p className="font-mono text-[10px] tracking-[7px] uppercase text-fire-3/40 mb-2">{t('nft_dashboard_portfolio')}</p>
          <h1 className="heading-fire text-[clamp(36px,6vw,72px)] leading-none font-black mb-4">
            {t('nft_dashboard_title')}
          </h1>
          <div className="h-[2px] bg-gradient-to-r from-fire-3 via-fire-5 to-transparent" />
        </motion.div>

        {/* Portfolio Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-[rgba(10,4,18,0.98)] to-[rgba(4,2,8,1)] border border-cyan/20 p-6 clip-cyber"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="font-mono text-[9px] tracking-[2px] uppercase text-cyan/60">{t('nft_dashboard_total_value')}</p>
              <DollarSign className="text-cyan" size={20} />
            </div>
            <div className="font-orbitron font-black text-3xl text-cyan mb-1">€{totalValue.toFixed(2)}</div>
            <p className="font-mono text-[10px] text-cyan/40">{enrichedNFTs.length} {t('nft_dashboard_nfts')}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-[rgba(10,4,18,0.98)] to-[rgba(4,2,8,1)] border border-fire-3/20 p-6 clip-cyber"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="font-mono text-[9px] tracking-[2px] uppercase text-fire-3/60">{t('nft_dashboard_invested')}</p>
              <Zap className="text-fire-3" size={20} />
            </div>
            <div className="font-orbitron font-black text-3xl text-fire-5 mb-1">€{totalInvested.toFixed(2)}</div>
            <p className="font-mono text-[10px] text-fire-3/40">{t('nft_dashboard_purchase')}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`bg-gradient-to-br ${
              totalProfitLoss >= 0
                ? 'from-green-500/10 to-green-600/5 border border-green-500/20'
                : 'from-red-500/10 to-red-600/5 border border-red-500/20'
            } p-6 clip-cyber`}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="font-mono text-[9px] tracking-[2px] uppercase text-green-400/60">{t('nft_dashboard_profit')}</p>
              <TrendingUp className={totalProfitLoss >= 0 ? 'text-green-400' : 'text-red-400'} size={20} />
            </div>
            <div className={`font-orbitron font-black text-3xl mb-1 ${
              totalProfitLoss >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {totalProfitLoss >= 0 ? '+' : ''}€{totalProfitLoss.toFixed(2)}
            </div>
            <p className={`font-mono text-[10px] ${totalProfitLoss >= 0 ? 'text-green-400/40' : 'text-red-400/40'}`}>
              {totalProfitLoss >= 0 ? '+' : ''}{profitLossPercent}%
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-[rgba(10,4,18,0.98)] to-[rgba(4,2,8,1)] border border-purple-500/20 p-6 clip-cyber"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="font-mono text-[9px] tracking-[2px] uppercase text-purple-400/60">{t('nft_dashboard_transactions')}</p>
              <TrendingUp className="text-purple-400" size={20} />
            </div>
            <div className="font-orbitron font-black text-3xl text-purple-400 mb-1">{transactions.length}</div>
            <p className="font-mono text-[10px] text-purple-400/40">{t('nft_dashboard_buy_sell')}</p>
          </motion.div>
        </div>

        {/* Rarity Breakdown */}
        <NFTRarityBreakdown enrichedNFTs={enrichedNFTs} />

        {/* NFT Collection */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-fire-gradient font-orbitron font-black text-2xl">{t('nft_dashboard_my_nfts')}</h2>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-black/50 border border-fire-3/20 text-fire-4 font-mono text-xs p-2 outline-none focus:border-fire-3/50 transition-all"
            >
              <option value="value">{t('nft_dashboard_sort_value')}</option>
              <option value="profit">{t('nft_dashboard_sort_profit')}</option>
              <option value="recent">{t('nft_dashboard_sort_recent')}</option>
            </select>
          </div>

          {enrichedNFTs.length === 0 ? (
            <div className="text-center py-20 bg-gradient-to-br from-[rgba(10,4,18,0.98)] to-[rgba(4,2,8,1)] border border-fire-3/20">
              <Zap className="text-fire-3/30 mx-auto mb-4" size={48} />
              <p className="font-mono text-sm text-fire-3/40 tracking-[1px]">{t('nft_dashboard_empty')}</p>
            </div>
          ) : (
            <div className="space-y-6">
              {sortedNFTs.map((nft, idx) => (
                <motion.div
                  key={nft.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-gradient-to-br from-[rgba(10,4,18,0.98)] to-[rgba(4,2,8,1)] border border-fire-3/20 p-6 clip-cyber overflow-hidden"
                >
                  {/* NFT Header */}
                  <div className="flex flex-col lg:flex-row gap-6 mb-6">
                    {/* Left: NFT Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-orbitron font-black text-xl text-fire-5 mb-1">
                            {nft.athlete_name}
                          </h3>
                          <p className="font-rajdhani text-sm text-fire-4/80">
                            Card #{nft.card_number} • Serial #{nft.serial_number}
                          </p>
                        </div>
                        <span className={`font-mono text-xs font-bold tracking-[1px] uppercase px-3 py-1.5 border ${
                          nft.rarity === 'common' ? 'border-fire-3/30 text-fire-3 bg-fire-3/5' :
                          nft.rarity === 'rare' ? 'border-cyan/30 text-cyan bg-cyan/5' :
                          nft.rarity === 'epic' ? 'border-purple-500/30 text-purple-400 bg-purple-500/5' :
                          'border-fire-5/40 text-fire-6 bg-fire-5/10'
                        }`}>
                          {nft.rarity}
                        </span>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-black/30 border border-fire-3/10 p-3">
                          <p className="font-mono text-[9px] text-fire-3/60 tracking-[1px] mb-1">{t('nft_dashboard_purchase_label')}</p>
                          <p className="font-orbitron font-bold text-fire-4">€{nft.purchase_price}</p>
                        </div>
                        <div className="bg-black/30 border border-fire-3/10 p-3">
                          <p className="font-mono text-[9px] text-fire-3/60 tracking-[1px] mb-1">{t('nft_dashboard_current')}</p>
                          <p className="font-orbitron font-bold text-cyan">€{nft.currentValue.toFixed(2)}</p>
                        </div>
                        <div className={`bg-black/30 border p-3 ${
                          nft.profitLoss >= 0 ? 'border-green-500/20' : 'border-red-500/20'
                        }`}>
                          <p className="font-mono text-[9px] text-fire-3/60 tracking-[1px] mb-1">{t('nft_dashboard_pl')}</p>
                          <p className={`font-orbitron font-bold ${nft.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {nft.profitLoss >= 0 ? '+' : ''}€{nft.profitLoss.toFixed(2)}
                          </p>
                        </div>
                        <div className="bg-black/30 border border-fire-3/10 p-3">
                          <p className="font-mono text-[9px] text-fire-3/60 tracking-[1px] mb-1">{t('nft_dashboard_minted')}</p>
                          <p className="font-orbitron font-bold text-fire-5">
                            {new Date(nft.minted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Right: Quick Stats */}
                    <div className="lg:w-48 flex flex-col justify-between">
                      <div>
                        <p className="font-mono text-[9px] text-fire-3/60 tracking-[1px] mb-2 uppercase">{t('nft_dashboard_return')}</p>
                        <div className="text-3xl font-orbitron font-black mb-2">
                          <span className={nft.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}>
                            {nft.profitLoss >= 0 ? '+' : ''}{((nft.profitLoss / nft.purchase_price) * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      {nft.transactions.length > 0 && (
                        <div>
                          <p className="font-mono text-[9px] text-fire-3/60 tracking-[1px] mb-2 uppercase">{t('nft_dashboard_last_trade')}</p>
                          <p className="font-mono text-sm text-fire-4">
                            {new Date(nft.transactions[0].created_date).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              year: '2-digit'
                            })}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Price Chart */}
                  {nft.transactions.length > 0 && (
                    <NFTPriceChart nftId={nft.nft_id} athleteName={nft.athlete_name} />
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Recent Transactions */}
        {transactions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <h2 className="text-fire-gradient font-orbitron font-black text-2xl mb-6">{t('nft_dashboard_history')}</h2>
            <div className="bg-gradient-to-br from-[rgba(10,4,18,0.98)] to-[rgba(4,2,8,1)] border border-fire-3/20 clip-cyber overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-fire-3/10 border-b border-fire-3/20">
                      <th className="px-6 py-4 text-left font-orbitron font-bold text-fire-4 text-xs tracking-[1px]">{t('nft_dashboard_card')}</th>
                      <th className="px-6 py-4 text-left font-orbitron font-bold text-fire-4 text-xs tracking-[1px]">{t('nft_dashboard_type')}</th>
                      <th className="px-6 py-4 text-right font-orbitron font-bold text-fire-4 text-xs tracking-[1px]">{t('nft_dashboard_price')}</th>
                      <th className="px-6 py-4 text-center font-orbitron font-bold text-fire-4 text-xs tracking-[1px]">{t('nft_dashboard_date')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-fire-3/10">
                    {transactions.slice(0, 10).map((tx, idx) => (
                      <tr key={tx.id} className="hover:bg-fire-3/5 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-rajdhani font-bold text-fire-5">{tx.nft_title || 'NFT Card'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 font-mono text-xs font-bold tracking-[1px] ${
                            user?.email === tx.buyer_email
                              ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                              : 'bg-red-500/10 text-red-400 border border-red-500/20'
                          }`}>
                            {user?.email === tx.buyer_email ? (
                              <>
                                <ArrowDownLeft size={12} /> BUY
                              </>
                            ) : (
                              <>
                                <ArrowUpRight size={12} /> SELL
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="font-orbitron font-black text-cyan">€{tx.price.toFixed(2)}</div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="font-mono text-sm text-fire-3/60">
                            {new Date(tx.created_date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: '2-digit'
                            })}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}