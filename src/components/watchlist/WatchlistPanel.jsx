import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Bell, BellOff } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from '../translations';

export default function WatchlistPanel({ lang = 'en', onClose }) {
  const t = useTranslation(lang);
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: watchlist = [] } = useQuery({
    queryKey: ['user-watchlist'],
    queryFn: async () => {
      if (!user) return [];
      return base44.entities.Watchlist.filter(
        { user_email: user.email },
        '-added_at',
        100
      );
    },
    enabled: !!user,
  });

  const removeFromWatchlist = useMutation({
    mutationFn: (id) => base44.entities.Watchlist.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-watchlist'] });
      toast.success('Removed from watchlist');
    },
  });

  const updateWatchlistSettings = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Watchlist.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-watchlist'] });
      setEditingId(null);
      toast.success('Settings updated');
    },
  });

  const handleToggleNotification = (item, type) => {
    const updates = {};
    if (type === 'price') {
      updates.notify_price_drop = !item.notify_price_drop;
    } else {
      updates.notify_new_listings = !item.notify_new_listings;
    }
    updateWatchlistSettings.mutate({
      id: item.id,
      data: updates,
    });
  };

  const handleRemove = (id) => {
    if (confirm('Remove from watchlist?')) {
      removeFromWatchlist.mutate(id);
    }
  };

  const getPriceChangeColor = (change) => {
    if (change === null || change === undefined) return 'text-fire-3';
    return change < 0 ? 'text-green-400' : 'text-red-400';
  };

  return (
    <div className="fixed inset-0 z-[400] bg-black/95 backdrop-blur-md flex items-start justify-center overflow-y-auto p-4">
      <div className="relative w-full max-w-3xl bg-gradient-to-br from-[rgba(10,4,18,0.98)] to-[rgba(4,2,8,0.99)] border border-fire-3/20 clip-cyber p-8 my-8">
        <div className="absolute top-0 left-0 right-0 fire-line" />

        <button
          onClick={onClose}
          className="absolute top-3 right-4 font-mono text-[10px] tracking-[2px] text-fire-3/30 hover:text-fire-3"
        >
          CLOSE
        </button>

        <h2 className="heading-fire text-2xl font-black mb-2">My Watchlist</h2>
        <p className="font-mono text-[11px] text-fire-3/40 tracking-[1px] mb-6">
          Track price changes and new listings for your favorite assets
        </p>

        {watchlist.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-lg border-2 border-fire-3/20 flex items-center justify-center">
              <span className="text-3xl">⭐</span>
            </div>
            <p className="font-mono text-sm text-fire-3/30">
              No watchlist items yet. Add athletes or NFT drops to track them here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {watchlist.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="p-4 bg-fire-3/5 border border-fire-3/15 hover:border-fire-3/30 transition-all"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-orbitron font-bold text-lg text-fire-4">
                          {item.asset_name}
                        </span>
                        <span className="px-2 py-0.5 text-[9px] font-mono tracking-[1px] uppercase border border-fire-3/30 text-fire-3/60 bg-fire-3/5">
                          {item.asset_type === 'athlete' ? '🏅 Athlete' : '💎 NFT Drop'}
                        </span>
                      </div>
                      <div className="font-mono text-xs text-fire-3/40">
                        Added {new Date(item.added_at).toLocaleDateString()}
                      </div>
                    </div>

                    {item.baseline_price !== undefined && (
                      <div className="text-right">
                        <div className="font-orbitron font-bold text-fire-5 text-lg">
                          €{item.baseline_price.toFixed(2)}
                        </div>
                        {item.price_change_percent !== undefined && (
                          <div className={`font-mono text-sm font-bold ${getPriceChangeColor(
                            item.price_change_percent
                          )}`}>
                            {item.price_change_percent > 0 ? '+' : ''}{item.price_change_percent.toFixed(1)}%
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Notification Settings */}
                  <div className="flex items-center gap-2 pt-3 border-t border-fire-3/10">
                    <button
                      onClick={() => handleToggleNotification(item, 'price')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 border text-[10px] font-mono tracking-[1px] uppercase transition-all ${
                        item.notify_price_drop
                          ? 'border-green-500/40 bg-green-500/5 text-green-400'
                          : 'border-fire-3/30 bg-fire-3/5 text-fire-3/60 hover:border-fire-3/50'
                      }`}
                    >
                      {item.notify_price_drop ? (
                        <>
                          <Bell size={12} />
                          Price Alerts On
                        </>
                      ) : (
                        <>
                          <BellOff size={12} />
                          Price Alerts Off
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleToggleNotification(item, 'listings')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 border text-[10px] font-mono tracking-[1px] uppercase transition-all ${
                        item.notify_new_listings
                          ? 'border-green-500/40 bg-green-500/5 text-green-400'
                          : 'border-fire-3/30 bg-fire-3/5 text-fire-3/60 hover:border-fire-3/50'
                      }`}
                    >
                      {item.notify_new_listings ? (
                        <>
                          <Bell size={12} />
                          Listings On
                        </>
                      ) : (
                        <>
                          <BellOff size={12} />
                          Listings Off
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleRemove(item.id)}
                      disabled={removeFromWatchlist.isPending}
                      className="ml-auto flex items-center gap-1.5 px-3 py-1.5 border border-red-500/30 bg-red-500/5 text-red-400 text-[10px] font-mono tracking-[1px] uppercase hover:border-red-500/50 hover:bg-red-500/10 transition-all"
                    >
                      <Trash2 size={12} />
                      Remove
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}