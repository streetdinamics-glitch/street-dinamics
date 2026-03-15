import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, Star } from 'lucide-react';
import { toast } from 'sonner';

export default function PointsConverter({ eventId }) {
  const queryClient = useQueryClient();
  const [pointsToConvert, setPointsToConvert] = useState(0);

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: fanPoints } = useQuery({
    queryKey: ['fan-points-converter', eventId, user?.email],
    queryFn: () => base44.entities.FanPoints.filter({ event_id: eventId, fan_email: user?.email }).then(r => r[0]),
    enabled: !!user && !!eventId,
  });

  const convertMutation = useMutation({
    mutationFn: async (points) => {
      return base44.functions.invoke('convertPointsToTokens', {
        eventId,
        pointsToConvert: points,
      });
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['fan-points'] });
      queryClient.invalidateQueries({ queryKey: ['token-balance'] });
      toast.success(`Converted ${pointsToConvert} points to ${response.data.tokensEarned} tokens!`);
      setPointsToConvert(0);
    },
    onError: () => {
      toast.error('Conversion failed');
    },
  });

  const availablePoints = fanPoints?.total_points || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/30 p-6 clip-cyber"
    >
      <h3 className="font-orbitron font-bold text-purple-400 mb-2 flex items-center gap-2">
        <Star size={20} />
        Convert Points to Tokens
      </h3>
      <p className="font-mono text-[10px] text-purple-500/60 mb-4">
        Exchange your event points for tokens (1:1 ratio)
      </p>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-black/40 border border-purple-500/20 p-3 text-center">
          <div className="font-mono text-[9px] text-purple-500/60 mb-1">Available Points</div>
          <div className="font-orbitron text-2xl font-bold text-purple-400">{availablePoints}</div>
        </div>
        <div className="bg-black/40 border border-fire-3/20 p-3 text-center">
          <div className="font-mono text-[9px] text-fire-3/60 mb-1">Will Receive</div>
          <div className="font-orbitron text-2xl font-bold text-fire-5">{pointsToConvert}</div>
        </div>
      </div>

      <div className="mb-4">
        <label className="font-mono text-xs text-purple-500/60 block mb-2">
          Amount to Convert: {pointsToConvert}
        </label>
        <input
          type="range"
          min="0"
          max={availablePoints}
          step="10"
          value={pointsToConvert}
          onChange={(e) => setPointsToConvert(Number(e.target.value))}
          className="w-full h-2 bg-purple-500/20 rounded cursor-pointer"
        />
      </div>

      <button
        onClick={() => convertMutation.mutate(pointsToConvert)}
        disabled={pointsToConvert === 0 || convertMutation.isPending}
        className="w-full btn-fire py-3 flex items-center justify-center gap-2 disabled:opacity-30"
      >
        <span>Convert {pointsToConvert} Points</span>
        <ArrowRight size={16} />
        <Zap size={16} />
      </button>
    </motion.div>
  );
}