import React from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Star } from 'lucide-react';
import { toast } from 'sonner';

export default function WatchlistButton({ assetType, assetId, assetName, price, className = '' }) {
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: watchlistItem } = useQuery({
    queryKey: ['watchlist', assetType, assetId],
    queryFn: async () => {
      if (!user) return null;
      const items = await base44.entities.Watchlist.filter({
        user_email: user.email,
        asset_type: assetType,
        asset_id: assetId,
      });
      return items[0] || null;
    },
    enabled: !!user,
  });

  const addToWatchlist = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Must be logged in');
      return base44.entities.Watchlist.create({
        user_email: user.email,
        asset_type: assetType,
        asset_id: assetId,
        asset_name: assetName,
        baseline_price: price || 0,
        current_price: price || 0,
        added_at: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist', assetType, assetId] });
      queryClient.invalidateQueries({ queryKey: ['user-watchlist'] });
      toast.success('Added to watchlist');
    },
    onError: () => toast.error('Failed to add to watchlist'),
  });

  const removeFromWatchlist = useMutation({
    mutationFn: async () => {
      if (!watchlistItem) throw new Error('Not in watchlist');
      return base44.entities.Watchlist.delete(watchlistItem.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist', assetType, assetId] });
      queryClient.invalidateQueries({ queryKey: ['user-watchlist'] });
      toast.success('Removed from watchlist');
    },
    onError: () => toast.error('Failed to remove from watchlist'),
  });

  const handleClick = () => {
    if (!user) {
      toast.error('Please log in first');
      return;
    }
    if (watchlistItem) {
      removeFromWatchlist.mutate();
    } else {
      addToWatchlist.mutate();
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={addToWatchlist.isPending || removeFromWatchlist.isPending}
      className={`flex items-center gap-1.5 transition-all ${
        watchlistItem
          ? 'text-fire-5 border-fire-5/40 bg-fire-3/10'
          : 'text-fire-3/60 border-fire-3/20 hover:text-fire-4 hover:border-fire-3/40'
      } ${className}`}
    >
      <Star size={16} fill={watchlistItem ? 'currentColor' : 'none'} />
      <span className="text-[11px] font-mono uppercase tracking-[1px]">
        {watchlistItem ? 'Watched' : 'Watch'}
      </span>
    </button>
  );
}