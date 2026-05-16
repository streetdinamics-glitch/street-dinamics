import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Layers, TrendingUp, Sparkles, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import WatchlistButton from '../watchlist/WatchlistButton';

const RARITY_CONFIG = {
  rising_star:     { label: 'Rising Star',     color: 'text-slate-400', bg: 'from-slate-600 to-slate-800',               border: 'border-slate-500/40', estValue: 5 },
  breakout_talent: { label: 'Breakout Talent', color: 'text-purple-400', bg: 'from-blue-600 to-purple-700',              border: 'border-purple-500/40', estValue: 25 },
  elite_performer: { label: 'Elite Performer', color: 'text-cyan',       bg: 'from-cyan-500 to-cyan-700',                border: 'border-cyan/40', estValue: 80 },
  living_legend:   { label: 'Living Legend',   color: 'text-fire-5',     bg: 'from-yellow-500 via-orange-500 to-red-600', border: 'border-fire-3/50', estValue: 300 },
};

const SOURCE_LABELS = {
  mint: { label: 'Mint', color: 'text-fire-3' },
  secondary: { label: 'Mercato', color: 'text-cyan' },
  ugc_reward: { label: 'UGC 🎁', color: 'text-purple-400' },
  reward: { label: 'Reward', color: 'text-fire-5' },
};

function NFTCard({ nft, index }) {
  const rc = RARITY_CONFIG[nft.rarity] || RARITY_CONFIG.rising_star;
  const src = SOURCE_LABELS[nft.purchase_type] || SOURCE_LABELS.mint;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.06 }}
      className={`bg-gradient-to-br ${rc.bg} p-[1px] clip-cyber group`}
    >
      <div className="bg-[rgba(4,2,10,0.96)] clip-cyber h-full flex flex-col overflow-hidden">
        {/* Rarity glow top */}
        <div className={`h-1 bg-gradient-to-r ${rc.bg}`} />

        <div className="p-3 flex-1 flex flex-col gap-2">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className={`font-mono text-[8px] tracking-[1px] uppercase ${rc.color}`}>{rc.label}</div>
            <div className={`font-mono text-[8px] ${src.color}`}>{src.label}</div>
          </div>

          {/* Athlete */}
          <div className="font-orbitron font-bold text-sm text-fire-5 leading-tight">{nft.athlete_name}</div>

          {/* Serial */}
          <div className="font-mono text-[9px] text-white/30">#{nft.serial_number || '—'}</div>

          {/* Est value */}
          <div className="mt-auto pt-2 border-t border-white/5 flex items-center justify-between">
            <div>
              <div className="font-mono text-[7px] text-white/20 uppercase">Est. valore</div>
              <div className="font-orbitron text-xs font-bold text-fire-5">€{rc.estValue}</div>
            </div>
            <WatchlistButton
              assetType="nft_drop"
              assetId={nft.nft_id}
              assetName={nft.athlete_name}
              price={nft.purchase_price || rc.estValue}
              className="p-1 border border-white/10 hover:border-fire-3/30 text-xs"
              iconOnly
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function FanNFTCollection({ lang = 'it' }) {
  const [filter, setFilter] = useState('all');

  const { data: user } = useQuery({ queryKey: ['current-user'], queryFn: () => base44.auth.me() });

  const { data: myNFTs = [], isLoading } = useQuery({
    queryKey: ['my-nfts-full', user?.email],
    queryFn: () => base44.entities.NFTOwnership.filter({ buyer_email: user.email }),
    enabled: !!user,
    initialData: [],
  });

  const filtered = useMemo(() => {
    if (filter === 'all') return myNFTs;
    if (filter === 'ugc') return myNFTs.filter(n => n.purchase_type === 'ugc_reward');
    return myNFTs.filter(n => n.rarity === filter);
  }, [myNFTs, filter]);

  const totalEstValue = useMemo(() =>
    myNFTs.reduce((sum, n) => sum + (RARITY_CONFIG[n.rarity]?.estValue || 5), 0)
  , [myNFTs]);

  const rarityBreakdown = useMemo(() => {
    const counts = {};
    myNFTs.forEach(n => { counts[n.rarity] = (counts[n.rarity] || 0) + 1; });
    return counts;
  }, [myNFTs]);

  if (!user) return null;

  return (
    <section className="section-container">
      <p className="font-mono text-[10px] tracking-[7px] uppercase text-fire-3 text-center mb-2">LA TUA COLLEZIONE</p>
      <h2 className="heading-fire text-[clamp(32px,6vw,72px)] text-center leading-none mb-3 font-black">
        NFT VAULT
      </h2>

      {myNFTs.length === 0 ? (
        <div className="text-center py-20 max-w-md mx-auto">
          <Layers size={48} className="text-fire-3/20 mx-auto mb-4" />
          <p className="font-orbitron text-lg text-fire-5 mb-2">Il tuo vault è vuoto</p>
          <p className="font-rajdhani text-sm text-fire-4/50 mb-6">Acquista NFT cards dal marketplace o guadagnale creando contenuti UGC</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link to="/NFTDashboard" className="btn-fire text-xs no-underline inline-flex items-center gap-1">
              <ShoppingBag size={12} /> Marketplace
            </Link>
            <button onClick={() => document.getElementById('ugc-rewards')?.scrollIntoView({ behavior: 'smooth' })} className="btn-ghost text-xs">
              <Sparkles size={12} className="inline mr-1" /> Guadagna via UGC
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Summary stats */}
          <div className="max-w-3xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            <div className="border border-fire-3/20 bg-fire-3/5 p-3 text-center">
              <div className="font-orbitron text-2xl font-black text-fire-5">{myNFTs.length}</div>
              <div className="font-mono text-[8px] tracking-[1px] uppercase text-fire-3/40 mt-1">NFT Totali</div>
            </div>
            <div className="border border-cyan/20 bg-cyan/5 p-3 text-center">
              <div className="font-orbitron text-2xl font-black text-cyan">€{totalEstValue}</div>
              <div className="font-mono text-[8px] tracking-[1px] uppercase text-cyan/40 mt-1">Valore Stimato</div>
            </div>
            <div className="border border-purple-500/20 bg-purple-500/5 p-3 text-center">
              <div className="font-orbitron text-2xl font-black text-purple-400">{myNFTs.filter(n => n.purchase_type === 'ugc_reward').length}</div>
              <div className="font-mono text-[8px] tracking-[1px] uppercase text-purple-400/40 mt-1">Via UGC</div>
            </div>
            <div className="border border-fire-5/20 bg-fire-5/5 p-3 text-center">
              <div className="font-orbitron text-2xl font-black text-fire-5">{rarityBreakdown['living_legend'] || 0}</div>
              <div className="font-mono text-[8px] tracking-[1px] uppercase text-fire-5/40 mt-1">Living Legend</div>
            </div>
          </div>

          {/* Rarity breakdown bar */}
          <div className="max-w-3xl mx-auto mb-8">
            <div className="flex h-2 rounded overflow-hidden gap-0.5">
              {Object.entries(RARITY_CONFIG).map(([rarity, cfg]) => {
                const count = rarityBreakdown[rarity] || 0;
                const pct = myNFTs.length > 0 ? (count / myNFTs.length) * 100 : 0;
                return pct > 0 ? (
                  <div key={rarity} title={`${cfg.label}: ${count}`} style={{ width: `${pct}%` }} className={`bg-gradient-to-r ${cfg.bg} h-full`} />
                ) : null;
              })}
            </div>
            <div className="flex gap-4 mt-2 flex-wrap">
              {Object.entries(RARITY_CONFIG).map(([rarity, cfg]) => (
                <div key={rarity} className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${cfg.bg}`} />
                  <span className={`font-mono text-[8px] ${cfg.color}`}>{cfg.label}: {rarityBreakdown[rarity] || 0}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex flex-wrap gap-2 mb-6 max-w-3xl mx-auto">
            {[
              { key: 'all', label: 'Tutte' },
              { key: 'ugc', label: '🎁 via UGC' },
              ...Object.entries(RARITY_CONFIG).map(([k, v]) => ({ key: k, label: v.label })),
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-3 py-1 font-mono text-[9px] tracking-[1px] uppercase border transition-all ${
                  filter === tab.key ? 'border-fire-3 bg-fire-3/20 text-fire-4' : 'border-fire-3/15 text-fire-3/30 hover:border-fire-3/30'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-w-5xl mx-auto">
            {filtered.map((nft, i) => (
              <NFTCard key={nft.id} nft={nft} index={i} />
            ))}
          </div>

          {/* CTA for more */}
          <div className="text-center mt-10 flex gap-3 justify-center flex-wrap">
            <Link to="/NFTDashboard" className="btn-ghost text-xs no-underline inline-flex items-center gap-1">
              <ShoppingBag size={12} /> Marketplace
            </Link>
            <button
              onClick={() => document.getElementById('ugc-rewards')?.scrollIntoView({ behavior: 'smooth' })}
              className="btn-cyan text-xs flex items-center gap-1"
            >
              <Sparkles size={12} /> Guadagna NFT con UGC
            </button>
          </div>
        </>
      )}
    </section>
  );
}