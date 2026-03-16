import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Wallet, Gift, TrendingUp, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

import { useTranslation } from '../translations';

export default function UserProfileDashboard({ lang = 'en' }) {
  const t = useTranslation(lang);
  const queryClient = useQueryClient();
  const [copiedWallet, setCopiedWallet] = useState(null);

  // Fetch current user
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  // Fetch NFT ownership
  const { data: nftOwnership = [] } = useQuery({
    queryKey: ['user-nft-ownership', user?.email],
    queryFn: () => base44.entities.NFTOwnership.filter({ buyer_email: user?.email }),
    enabled: !!user?.email,
  });

  // Fetch rewards
  const { data: rewards = [] } = useQuery({
    queryKey: ['user-rewards', user?.email],
    queryFn: () => base44.entities.FanReward.filter({ fan_email: user?.email }),
    enabled: !!user?.email,
  });

  // Calculate collection value
  const collectionValue = useMemo(() => {
    return nftOwnership.reduce((sum, nft) => sum + (nft.purchase_price || 0), 0);
  }, [nftOwnership]);

  // Calculate rewards earned
  const totalRewardsEarned = useMemo(() => {
    return rewards.filter(r => r.redeemed).length;
  }, [rewards]);

  // Wallet management mutation
  const updateUserWallets = useMutation({
    mutationFn: async (wallets) => {
      return base44.auth.updateMe({
        crypto_wallets: wallets,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['current-user'] });
      toast.success(t('upd_wallet_updated'));
    },
    onError: (err) => {
      toast.error(t('upd_wallet_update_fail') + ': ' + err.message);
    },
  });

  const handleAddWallet = async () => {
    const walletAddress = prompt(t('upd_wallet_prompt'));
    if (!walletAddress) return;

    const currentWallets = user?.crypto_wallets || [];
    if (currentWallets.some(w => w.address === walletAddress)) {
      toast.error(t('upd_wallet_exists'));
      return;
    }

    updateUserWallets.mutate([
      ...currentWallets,
      {
        address: walletAddress,
        chain: 'polygon',
        added_at: new Date().toISOString(),
      },
    ]);
  };

  const handleRemoveWallet = (address) => {
    if (confirm(t('upd_remove_confirm'))) {
      const updated = (user?.crypto_wallets || []).filter(w => w.address !== address);
      updateUserWallets.mutate(updated);
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedWallet(id);
    setTimeout(() => setCopiedWallet(null), 2000);
  };

  if (userLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-fire-3/30 border-t-fire-3 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-fire-3/10 to-fire-3/5 border border-fire-3/20 p-8 clip-cyber"
      >
        <div className="flex items-center gap-4 mb-4">
          {user?.avatar_url && (
            <img
              src={user.avatar_url}
              alt={user.full_name}
              className="w-16 h-16 rounded-lg border border-fire-3/30"
            />
          )}
          <div>
            <h1 className="font-orbitron font-black text-3xl text-fire-5">{user?.full_name}</h1>
            <p className="font-mono text-sm text-fire-3/60">{user?.email}</p>
            {user?.role === 'athlete' && (
              <span className="inline-block mt-2 px-3 py-1 bg-cyan/10 border border-cyan/30 text-cyan text-[9px] font-mono tracking-[2px] uppercase">
                {t('upd_verified_athlete')}
              </span>
            )}
          </div>
        </div>
      </motion.div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Collection Value */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-cyan/10 to-cyan/5 border border-cyan/30 p-6 clip-cyber"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-cyan/20 flex items-center justify-center">
              <TrendingUp size={20} className="text-cyan" />
            </div>
            <div className="font-mono text-[9px] text-cyan/60 tracking-[2px] uppercase">{t('upd_collection_value')}</div>
          </div>
          <div className="font-orbitron font-black text-4xl text-cyan">€{collectionValue.toFixed(0)}</div>
          <p className="font-mono text-[9px] text-cyan/40 mt-2">{nftOwnership.length} {t('upd_nfts_owned')}</p>
        </motion.div>

        {/* Rewards Earned */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-fire-5/20 to-fire-3/10 border border-fire-3/40 p-6 clip-cyber"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-fire-3/20 flex items-center justify-center">
              <Gift size={20} className="text-fire-5" />
            </div>
            <div className="font-mono text-[9px] text-fire-3/60 tracking-[2px] uppercase">{t('upd_rewards_earned')}</div>
          </div>
          <div className="font-orbitron font-black text-4xl text-fire-5">{totalRewardsEarned}</div>
          <p className="font-mono text-[9px] text-fire-3/40 mt-2">{rewards.length} {t('upd_total_rewards')}</p>
        </motion.div>

        {/* Wallets Connected */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/30 p-6 clip-cyber"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Wallet size={20} className="text-purple-400" />
            </div>
            <div className="font-mono text-[9px] text-purple-400/60 tracking-[2px] uppercase">{t('upd_web3_wallets')}</div>
          </div>
          <div className="font-orbitron font-black text-4xl text-purple-400">{(user?.crypto_wallets || []).length}</div>
          <p className="font-mono text-[9px] text-purple-400/40 mt-2">{t('upd_connected_wallets')}</p>
        </motion.div>
      </div>

      {/* NFT Collection */}
      {nftOwnership.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-[rgba(10,4,18,0.99)] to-[rgba(4,2,8,1)] border border-fire-3/20 p-8 clip-cyber"
        >
          <h2 className="font-orbitron font-black text-2xl text-fire-5 mb-6">{t('upd_nft_collection')}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {nftOwnership.map((nft, i) => {
              const tierColors = {
                common: 'from-slate-600 to-slate-800',
                rare: 'from-blue-600 to-purple-700',
                epic: 'from-cyan-500 to-cyan-700',
                legendary: 'from-yellow-500 via-orange-500 to-red-600',
              };
              return (
                <motion.div
                  key={nft.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className={`bg-gradient-to-br ${tierColors[nft.rarity]} border border-fire-3/20 p-3 text-center clip-cyber group cursor-pointer hover:shadow-[0_0_20px_rgba(255,100,0,0.3)] transition-all`}
                >
                  <div className="font-mono text-[8px] text-fire-3/60 mb-1">#{nft.serial_number}</div>
                  <div className="font-rajdhani font-bold text-xs text-fire-5 mb-1 truncate">{nft.athlete_name}</div>
                  <div className="font-mono text-[7px] text-fire-4/80">€{nft.purchase_price}</div>
                  <div className="font-mono text-[7px] text-fire-3/60 mt-1 uppercase">{nft.rarity}</div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Reward History */}
      {rewards.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-[rgba(10,4,18,0.99)] to-[rgba(4,2,8,1)] border border-fire-3/20 p-8 clip-cyber"
        >
          <h2 className="font-orbitron font-black text-2xl text-fire-5 mb-6">{t('upd_reward_history')}</h2>
          <div className="space-y-3">
            {rewards.slice(0, 5).map((reward) => (
              <div key={reward.id} className="flex items-center justify-between p-4 bg-fire-3/5 border border-fire-3/10 hover:border-fire-3/30 transition-all">
                <div>
                  <div className="font-orbitron font-bold text-fire-5">{reward.reward_name}</div>
                  <p className="font-mono text-xs text-fire-3/60">{reward.reward_type}</p>
                </div>
                <div className="text-right">
                  <div className={`inline-block px-3 py-1 text-[9px] font-mono tracking-[1px] uppercase border ${
                    reward.redeemed
                      ? 'border-green-500/40 bg-green-500/10 text-green-400'
                      : 'border-yellow-500/40 bg-yellow-500/10 text-yellow-400'
                  }`}>
                    {reward.redeemed ? t('upd_redeemed') : t('upd_pending')}
                  </div>
                  <p className="font-mono text-[9px] text-fire-3/40 mt-1">
                    {new Date(reward.earned_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
            {rewards.length > 5 && (
              <p className="font-mono text-xs text-fire-3/40 text-center pt-4">+{rewards.length - 5} {t('upd_more_rewards')}</p>
            )}
          </div>
        </motion.div>
      )}

      {/* Wallet Management */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/30 p-8 clip-cyber"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-orbitron font-black text-2xl text-purple-400">{t('upd_wallet_management')}</h2>
          <button
            onClick={handleAddWallet}
            disabled={updateUserWallets.isPending}
            className="btn-fire py-2 px-4 text-xs"
          >
            {t('upd_add_wallet')}
          </button>
        </div>

        {(user?.crypto_wallets || []).length === 0 ? (
          <div className="text-center py-8">
            <p className="font-mono text-sm text-purple-400/60">{t('upd_no_wallets')}</p>
            <p className="font-mono text-xs text-purple-400/40 mt-2">{t('upd_no_wallets_desc')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {(user.crypto_wallets || []).map((wallet) => (
              <div key={wallet.address} className="flex items-center justify-between p-4 bg-purple-500/10 border border-purple-500/20">
                <div className="flex-1">
                  <div className="font-orbitron text-sm text-purple-400 break-all">
                    {wallet.address.substring(0, 10)}...{wallet.address.substring(wallet.address.length - 8)}
                  </div>
                  <p className="font-mono text-[9px] text-purple-400/60 mt-1">{wallet.chain}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => copyToClipboard(wallet.address, wallet.address)}
                    className="p-2 hover:bg-purple-500/20 transition-all"
                  >
                    {copiedWallet === wallet.address ? (
                      <Check size={16} className="text-green-400" />
                    ) : (
                      <Copy size={16} className="text-purple-400/60 hover:text-purple-400" />
                    )}
                  </button>
                  <button
                    onClick={() => handleRemoveWallet(wallet.address)}
                    disabled={updateUserWallets.isPending}
                    className="px-3 py-1 text-xs border border-red-500/40 text-red-400 hover:bg-red-500/10 transition-all"
                  >
                    {t('upd_remove')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}