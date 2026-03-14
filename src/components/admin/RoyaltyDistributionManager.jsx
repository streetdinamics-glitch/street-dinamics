import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { DollarSign, Users, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export default function RoyaltyDistributionManager() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    athlete_email: '',
    distribution_type: 'sponsorship',
    total_revenue: '',
    source_description: '',
  });

  const queryClient = useQueryClient();

  const { data: athletes = [] } = useQuery({
    queryKey: ['all-athletes'],
    queryFn: async () => {
      const users = await base44.entities.User.list('-created_date', 200);
      return users.filter(u => u.role === 'athlete' || u.user_type === 'athlete');
    },
    initialData: [],
  });

  const { data: distributions = [] } = useQuery({
    queryKey: ['all-distributions'],
    queryFn: () => base44.entities.RoyaltyDistribution.list('-distribution_date', 100),
    initialData: [],
  });

  const distributeRoyaltyMutation = useMutation({
    mutationFn: async (data) => {
      const totalRevenue = parseFloat(data.total_revenue);
      const athleteShare = totalRevenue * 0.70;
      const tokenHoldersPool = totalRevenue * 0.20;
      const platformFee = totalRevenue * 0.10;

      // Get all token holders for this athlete
      const tokenOwnerships = await base44.entities.TokenOwnership.filter({
        athlete_name: data.athlete_email
      });

      const totalTokens = tokenOwnerships.length;
      const perTokenPayout = totalTokens > 0 ? tokenHoldersPool / totalTokens : 0;

      // Create distribution record
      const distribution = await base44.entities.RoyaltyDistribution.create({
        athlete_email: data.athlete_email,
        distribution_type: data.distribution_type,
        total_revenue: totalRevenue,
        athlete_share: athleteShare,
        token_holders_pool: tokenHoldersPool,
        platform_fee: platformFee,
        distribution_date: new Date().toISOString(),
        total_tokens_outstanding: totalTokens,
        per_token_payout: perTokenPayout,
        status: 'processing',
        source_description: data.source_description,
      });

      // Create individual payout records
      if (totalTokens > 0) {
        const payouts = tokenOwnerships.map(ownership => ({
          distribution_id: distribution.id,
          holder_email: ownership.created_by,
          athlete_name: data.athlete_email,
          tokens_held: 1,
          payout_amount: perTokenPayout,
          payout_status: 'pending',
        }));

        await base44.entities.TokenHolderPayout.bulkCreate(payouts);
      }

      // Mark distribution as completed
      await base44.entities.RoyaltyDistribution.update(distribution.id, {
        status: 'completed',
      });

      return distribution;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-distributions'] });
      queryClient.invalidateQueries({ queryKey: ['royalty-distributions'] });
      setShowForm(false);
      setFormData({
        athlete_email: '',
        distribution_type: 'sponsorship',
        total_revenue: '',
        source_description: '',
      });
      toast.success('Royalty distributed to all token holders!');
    },
    onError: (error) => {
      toast.error('Distribution failed: ' + error.message);
    },
  });

  const handleSubmit = () => {
    if (!formData.athlete_email || !formData.total_revenue) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (parseFloat(formData.total_revenue) <= 0) {
      toast.error('Revenue must be greater than 0');
      return;
    }
    distributeRoyaltyMutation.mutate(formData);
  };

  const totalRevenue = formData.total_revenue ? parseFloat(formData.total_revenue) : 0;
  const breakdown = {
    athlete: (totalRevenue * 0.70).toFixed(2),
    holders: (totalRevenue * 0.20).toFixed(2),
    platform: (totalRevenue * 0.10).toFixed(2),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-orbitron font-bold text-xl text-fire-5 flex items-center gap-2">
          <DollarSign size={20} />
          ROYALTY DISTRIBUTION
        </h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-fire text-xs"
        >
          + NEW DISTRIBUTION
        </button>
      </div>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-fire-3/5 border border-fire-3/20 p-6"
        >
          <div className="space-y-4">
            {/* Athlete Selection */}
            <div>
              <label className="font-orbitron text-sm font-bold text-fire-4 mb-2 block">
                SELECT ATHLETE
              </label>
              <select
                value={formData.athlete_email}
                onChange={(e) => setFormData({ ...formData, athlete_email: e.target.value })}
                className="cyber-input"
              >
                <option value="">-- Select Athlete --</option>
                {athletes.map((athlete) => (
                  <option key={athlete.email} value={athlete.email}>
                    {athlete.full_name || athlete.email}
                  </option>
                ))}
              </select>
            </div>

            {/* Distribution Type */}
            <div>
              <label className="font-orbitron text-sm font-bold text-fire-4 mb-2 block">
                REVENUE SOURCE
              </label>
              <select
                value={formData.distribution_type}
                onChange={(e) => setFormData({ ...formData, distribution_type: e.target.value })}
                className="cyber-input"
              >
                <option value="sponsorship">Sponsorship</option>
                <option value="event_prize">Event Prize</option>
                <option value="content_licensing">Content Licensing</option>
                <option value="merchandise">Merchandise</option>
              </select>
            </div>

            {/* Total Revenue */}
            <div>
              <label className="font-orbitron text-sm font-bold text-fire-4 mb-2 block">
                TOTAL REVENUE (EUR)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.total_revenue}
                onChange={(e) => setFormData({ ...formData, total_revenue: e.target.value })}
                placeholder="1000.00"
                className="cyber-input"
              />
            </div>

            {/* Description */}
            <div>
              <label className="font-orbitron text-sm font-bold text-fire-4 mb-2 block">
                SOURCE DESCRIPTION
              </label>
              <textarea
                value={formData.source_description}
                onChange={(e) => setFormData({ ...formData, source_description: e.target.value })}
                placeholder="e.g., 'Nike sponsorship Q1 2026'"
                className="cyber-input h-20 resize-none"
              />
            </div>

            {/* Revenue Breakdown */}
            {totalRevenue > 0 && (
              <div className="bg-fire-3/10 border border-fire-3/20 p-5">
                <div className="font-orbitron font-bold text-sm text-fire-4 mb-3">
                  DISTRIBUTION BREAKDOWN
                </div>
                <div className="space-y-2 font-mono text-sm">
                  <div className="flex justify-between">
                    <span className="text-fire-3/60">Athlete (70%):</span>
                    <span className="text-fire-5 font-bold">€{breakdown.athlete}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-fire-3/60">Token Holders (20%):</span>
                    <span className="text-cyan font-bold">€{breakdown.holders}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-fire-3/60">Platform (10%):</span>
                    <span className="text-fire-4">€{breakdown.platform}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowForm(false)}
                className="btn-ghost flex-1"
              >
                CANCEL
              </button>
              <button
                onClick={handleSubmit}
                disabled={distributeRoyaltyMutation.isPending}
                className="btn-fire flex-1"
              >
                {distributeRoyaltyMutation.isPending ? 'DISTRIBUTING...' : 'DISTRIBUTE ROYALTY'}
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Distribution History */}
      <div className="space-y-3">
        <h4 className="font-orbitron font-bold text-fire-4">DISTRIBUTION HISTORY</h4>
        {distributions.map((dist) => (
          <div key={dist.id} className="bg-fire-3/5 border border-fire-3/10 p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="font-rajdhani font-bold text-fire-5 mb-1">
                  {dist.athlete_email}
                </div>
                <div className="font-mono text-xs text-fire-3/60">
                  {dist.distribution_type.replace('_', ' ').toUpperCase()} • {new Date(dist.distribution_date).toLocaleDateString()}
                </div>
              </div>
              <div className={`px-3 py-1 border text-xs font-mono ${
                dist.status === 'completed' ? 'border-green-500/40 text-green-400 bg-green-500/10' :
                'border-fire-3/40 text-fire-3 bg-fire-3/10'
              }`}>
                {dist.status}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-xs">
              <div>
                <div className="text-fire-3/60">Total Revenue</div>
                <div className="text-fire-4 font-semibold">€{dist.total_revenue.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-fire-3/60">Token Pool</div>
                <div className="text-cyan font-semibold">€{dist.token_holders_pool.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-fire-3/60">Total Tokens</div>
                <div className="text-fire-4 font-semibold">{dist.total_tokens_outstanding}</div>
              </div>
              <div>
                <div className="text-fire-3/60">Per Token</div>
                <div className="text-fire-5 font-semibold">€{dist.per_token_payout.toFixed(4)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}