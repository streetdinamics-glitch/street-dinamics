import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, Users, Award } from 'lucide-react';

export default function RoyaltyDashboard({ athleteEmail }) {
  const { data: distributions = [] } = useQuery({
    queryKey: ['royalty-distributions', athleteEmail],
    queryFn: () => base44.entities.RoyaltyDistribution.filter({ 
      athlete_email: athleteEmail,
      status: 'completed'
    }),
    initialData: [],
  });

  const { data: myPayouts = [] } = useQuery({
    queryKey: ['my-royalty-payouts', athleteEmail],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.TokenHolderPayout.filter({
        holder_email: user.email,
        athlete_name: athleteEmail, // This should match athlete
        payout_status: 'paid'
      });
    },
    initialData: [],
  });

  const totalEarned = myPayouts.reduce((sum, p) => sum + p.payout_amount, 0);
  const totalDistributed = distributions.reduce((sum, d) => sum + d.token_holders_pool, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-fire-3/10 to-fire-3/5 border border-fire-3/20 p-5"
        >
          <div className="flex items-center gap-3 mb-3">
            <DollarSign className="w-6 h-6 text-fire-5" />
            <span className="font-mono text-xs text-fire-3/60 tracking-[2px] uppercase">
              Total Earned
            </span>
          </div>
          <div className="font-orbitron font-black text-3xl text-fire-5">
            €{totalEarned.toFixed(2)}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-cyan/10 to-cyan/5 border border-cyan/20 p-5"
        >
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="w-6 h-6 text-cyan" />
            <span className="font-mono text-xs text-cyan/60 tracking-[2px] uppercase">
              Distributions
            </span>
          </div>
          <div className="font-orbitron font-black text-3xl text-cyan">
            {distributions.length}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20 p-5"
        >
          <div className="flex items-center gap-3 mb-3">
            <Award className="w-6 h-6 text-purple-400" />
            <span className="font-mono text-xs text-purple-400/60 tracking-[2px] uppercase">
              Avg per Event
            </span>
          </div>
          <div className="font-orbitron font-black text-3xl text-purple-400">
            €{distributions.length > 0 ? (totalEarned / distributions.length).toFixed(2) : '0.00'}
          </div>
        </motion.div>
      </div>

      {/* Distribution History */}
      <div className="bg-gradient-to-br from-[rgba(10,4,18,0.97)] to-[rgba(4,2,8,0.99)] border border-fire-3/20 clip-cyber p-6">
        <h3 className="font-orbitron font-bold text-xl text-fire-5 mb-4">
          DISTRIBUTION HISTORY
        </h3>

        {distributions.length === 0 ? (
          <div className="text-center py-12">
            <DollarSign size={48} className="text-fire-3/30 mx-auto mb-4" />
            <p className="font-mono text-sm text-fire-3/40 tracking-[2px]">
              NO DISTRIBUTIONS YET
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {distributions.map((dist, i) => {
              const myPayout = myPayouts.find(p => p.distribution_id === dist.id);

              return (
                <motion.div
                  key={dist.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-fire-3/5 border border-fire-3/10 p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="font-rajdhani font-bold text-fire-5 mb-1">
                        {dist.distribution_type.replace('_', ' ').toUpperCase()}
                      </div>
                      <div className="font-mono text-xs text-fire-3/60">
                        {new Date(dist.distribution_date).toLocaleDateString()}
                      </div>
                    </div>
                    {myPayout && (
                      <div className="text-right">
                        <div className="font-mono text-xs text-fire-3/60 mb-1">YOUR PAYOUT</div>
                        <div className="font-orbitron font-bold text-lg text-fire-5">
                          €{myPayout.payout_amount.toFixed(2)}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-4 font-mono text-xs">
                    <div>
                      <div className="text-fire-3/60 mb-1">Total Revenue</div>
                      <div className="text-fire-4 font-semibold">€{dist.total_revenue.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="text-fire-3/60 mb-1">Token Pool (20%)</div>
                      <div className="text-fire-4 font-semibold">€{dist.token_holders_pool.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="text-fire-3/60 mb-1">Per Token</div>
                      <div className="text-fire-4 font-semibold">€{dist.per_token_payout.toFixed(4)}</div>
                    </div>
                  </div>

                  {dist.source_description && (
                    <p className="mt-3 text-sm text-fire-4/70 font-rajdhani">
                      {dist.source_description}
                    </p>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* How It Works */}
      <div className="bg-fire-3/5 border border-fire-3/20 p-6">
        <h4 className="font-orbitron font-bold text-sm text-fire-4 mb-3">HOW ROYALTY WORKS</h4>
        <div className="space-y-2 font-mono text-xs text-fire-3/60 leading-relaxed">
          <p>• 70% of athlete revenue goes to the athlete</p>
          <p>• 20% is distributed to all token holders proportionally</p>
          <p>• 10% platform fee for operations and development</p>
          <p>• Revenue sources: sponsorships, event prizes, content licensing, merchandise</p>
          <p>• Distributions occur within 30 days of revenue confirmation</p>
        </div>
      </div>
    </div>
  );
}