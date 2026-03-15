import React from 'react';
import { useAccount, useBalance } from 'wagmi';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Wallet, Layers, Image, ExternalLink, AlertCircle, RefreshCw } from 'lucide-react';
import WalletConnectButton from '../web3/WalletConnectButton';

const TIER_STYLES = {
  living_legend:   { color: 'text-purple-400', border: 'border-purple-500/40', bg: 'bg-purple-500/10', label: 'LIVING LEGEND' },
  elite_performer: { color: 'text-fire-5',     border: 'border-fire-5/40',     bg: 'bg-fire-5/10',     label: 'ELITE PERFORMER' },
  breakout_talent: { color: 'text-cyan',        border: 'border-cyan/40',       bg: 'bg-cyan/10',       label: 'BREAKOUT TALENT' },
  rising_star:     { color: 'text-fire-3/80',  border: 'border-fire-3/30',     bg: 'bg-fire-3/5',      label: 'RISING STAR' },
};

function VaultCard({ children, className = '' }) {
  return (
    <div className={`p-5 border clip-cyber ${className}`}>
      {children}
    </div>
  );
}

function TokenCard({ token }) {
  const tier = TIER_STYLES[token.token_tier] || TIER_STYLES.rising_star;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 border clip-cyber ${tier.border} ${tier.bg} relative overflow-hidden`}
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-current to-transparent opacity-30" />
      {token.image_url && (
        <img src={token.image_url} alt={token.athlete_name} className="w-full h-28 object-cover mb-3 opacity-80" />
      )}
      <div className={`font-mono text-[8px] tracking-[2px] uppercase mb-1 ${tier.color}`}>{tier.label}</div>
      <div className="font-orbitron font-bold text-sm text-fire-6 mb-1">{token.athlete_name}</div>
      <div className="font-mono text-[10px] text-fire-3/50">{token.sport}</div>
      {token.event_moment && (
        <div className="mt-2 font-rajdhani text-xs text-fire-4/70 italic">"{token.event_moment}"</div>
      )}
      <div className="mt-3 flex items-center justify-between">
        <span className="font-mono text-[9px] text-fire-3/30">#{token.card_number}</span>
        <span className="font-mono text-[9px] text-fire-3/50">€{token.purchase_price}</span>
      </div>
    </motion.div>
  );
}

function NFTCard({ nft }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 border border-purple-500/30 bg-purple-500/5 clip-cyber relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-40" />
      {nft.image_url && (
        <img src={nft.image_url} alt={nft.clip_title || 'NFT Clip'} className="w-full h-28 object-cover mb-3 opacity-80" />
      )}
      <div className="font-mono text-[8px] tracking-[2px] uppercase mb-1 text-purple-400">NFT CLIP</div>
      <div className="font-orbitron font-bold text-sm text-purple-200 mb-1 truncate">
        {nft.clip_title || nft.athlete_name}
      </div>
      {nft.event_name && (
        <div className="font-mono text-[10px] text-purple-400/50">{nft.event_name}</div>
      )}
      <div className="mt-3 flex items-center justify-between">
        <span className="font-mono text-[9px] text-purple-400/30">Ed. {nft.edition_number}/{nft.total_editions}</span>
        {nft.token_id && (
          <a
            href={`https://polygonscan.com/token/${nft.contract_address}?a=${nft.token_id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 font-mono text-[9px] text-purple-400/60 hover:text-purple-300"
          >
            View <ExternalLink size={9} />
          </a>
        )}
      </div>
    </motion.div>
  );
}

export default function MyDigitalVault({ user }) {
  const { address, isConnected, chain } = useAccount();
  const { data: balance, refetch: refetchBalance } = useBalance({ address, enabled: !!address });

  // DB athlete tokens owned by this user
  const { data: dbTokens = [] } = useQuery({
    queryKey: ['vault-tokens', user?.email],
    queryFn: async () => {
      const u = await base44.auth.me();
      return base44.entities.TokenOwnership.filter({ created_by: u.email });
    },
    enabled: !!user,
    initialData: [],
  });

  // DB NFT clips owned by this user
  const { data: dbNFTs = [] } = useQuery({
    queryKey: ['vault-nfts', user?.email],
    queryFn: async () => {
      const u = await base44.auth.me();
      return base44.entities.NFTOwnership.filter({ created_by: u.email });
    },
    enabled: !!user,
    initialData: [],
  });

  const totalItems = dbTokens.length + dbNFTs.length;

  return (
    <div className="space-y-6">
      {/* Wallet Connection Block */}
      <VaultCard className={isConnected ? 'border-green-500/30 bg-green-500/5' : 'border-fire-3/20 bg-fire-3/3'}>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Wallet size={16} className={isConnected ? 'text-green-400' : 'text-fire-3/50'} />
              <span className="font-orbitron text-[11px] font-bold tracking-[2px] uppercase text-fire-4">
                {isConnected ? 'Wallet Connected' : 'Connect Your Wallet'}
              </span>
            </div>
            {isConnected ? (
              <div className="space-y-1">
                <p className="font-mono text-[10px] text-green-400/70 break-all">{address}</p>
                <div className="flex items-center gap-3 flex-wrap">
                  {chain && (
                    <span className="font-mono text-[9px] text-fire-3/40 uppercase tracking-[1px]">
                      🔗 {chain.name}
                    </span>
                  )}
                  {balance && (
                    <span className="font-mono text-[9px] text-fire-3/60">
                      {parseFloat(balance.formatted).toFixed(4)} {balance.symbol}
                    </span>
                  )}
                  <button
                    onClick={() => refetchBalance()}
                    className="flex items-center gap-1 font-mono text-[9px] text-fire-3/30 hover:text-fire-3/60 transition-colors"
                  >
                    <RefreshCw size={9} /> Refresh
                  </button>
                </div>
              </div>
            ) : (
              <p className="font-mono text-[10px] text-fire-3/40 mt-1">
                Connect to verify on-chain ownership of your NFTs and tokens
              </p>
            )}
          </div>
          <WalletConnectButton minimal />
        </div>

        {isConnected && (
          <div className="mt-4 flex items-start gap-2 p-3 bg-yellow-500/5 border border-yellow-500/20">
            <AlertCircle size={12} className="text-yellow-500/70 mt-0.5 flex-shrink-0" />
            <p className="font-mono text-[9px] text-yellow-500/60 leading-relaxed">
              On-chain verification coming soon. Your digital assets below are sourced from the Street Dinamics platform database.
              Wallet linking allows future cross-chain portfolio verification.
            </p>
          </div>
        )}
      </VaultCard>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Athlete Tokens', value: dbTokens.length, icon: Layers, color: 'text-fire-5' },
          { label: 'NFT Clips',      value: dbNFTs.length,   icon: Image,  color: 'text-purple-400' },
          { label: 'Total Assets',   value: totalItems,       icon: Wallet, color: 'text-cyan' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="p-4 border border-white/8 bg-white/3 clip-cyber text-center">
            <Icon size={18} className={`${color} mx-auto mb-2`} />
            <div className={`font-orbitron font-black text-2xl ${color}`}>{value}</div>
            <div className="font-mono text-[8px] tracking-[1px] uppercase text-fire-3/30 mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Athlete Tokens */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Layers size={14} className="text-fire-5" />
          <h3 className="font-orbitron text-[11px] font-bold tracking-[2px] uppercase text-fire-4">
            Athlete Tokens ({dbTokens.length})
          </h3>
        </div>
        {dbTokens.length === 0 ? (
          <div className="text-center py-10 border border-fire-3/10 bg-fire-3/3">
            <Layers size={32} className="text-fire-3/20 mx-auto mb-2" />
            <p className="font-mono text-xs text-fire-3/30">No athlete tokens yet</p>
            <p className="font-mono text-[10px] text-fire-3/20 mt-1">Browse the Token Marketplace to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {dbTokens.map(t => <TokenCard key={t.id} token={t} />)}
          </div>
        )}
      </div>

      {/* NFT Clips */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Image size={14} className="text-purple-400" />
          <h3 className="font-orbitron text-[11px] font-bold tracking-[2px] uppercase text-purple-300">
            NFT Clips ({dbNFTs.length})
          </h3>
        </div>
        {dbNFTs.length === 0 ? (
          <div className="text-center py-10 border border-purple-500/10 bg-purple-500/3">
            <Image size={32} className="text-purple-500/20 mx-auto mb-2" />
            <p className="font-mono text-xs text-purple-400/30">No NFT clips yet</p>
            <p className="font-mono text-[10px] text-purple-400/20 mt-1">Check out the NFT Marketplace for exclusive clips</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {dbNFTs.map(n => <NFTCard key={n.id} nft={n} />)}
          </div>
        )}
      </div>
    </div>
  );
}