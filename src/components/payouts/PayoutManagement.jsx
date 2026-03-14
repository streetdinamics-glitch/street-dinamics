/**
 * Payout Management Component
 * Allows athletes to manage payment methods and request payouts
 */

import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, Wallet, Plus, Trash2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import PayoutMethodModal from './PayoutMethodModal';
import PayoutRequestModal from './PayoutRequestModal';

export default function PayoutManagement() {
  const [methodModalOpen, setMethodModalOpen] = useState(false);
  const [payoutModalOpen, setPayoutModalOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: payoutMethods = [] } = useQuery({
    queryKey: ['payout-methods', user?.email],
    queryFn: () =>
      user?.email
        ? base44.entities.PayoutMethod.filter({ athlete_email: user.email })
        : Promise.resolve([]),
    enabled: !!user?.email,
    initialData: [],
  });

  const { data: escrowAccounts = [] } = useQuery({
    queryKey: ['escrow-accounts', user?.email],
    queryFn: () =>
      user?.email
        ? base44.entities.EscrowAccount.filter({ athlete_email: user.email })
        : Promise.resolve([]),
    enabled: !!user?.email,
    initialData: [],
  });

  const { data: payoutHistory = [] } = useQuery({
    queryKey: ['payout-history', user?.email],
    queryFn: () =>
      user?.email
        ? base44.entities.Payout.filter({ athlete_email: user.email })
        : Promise.resolve([]),
    enabled: !!user?.email,
    initialData: [],
  });

  const deleteMethodMutation = useMutation({
    mutationFn: (methodId) => base44.entities.PayoutMethod.delete(methodId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payout-methods'] });
      toast.success('Payment method removed');
    },
    onError: () => {
      toast.error('Failed to remove payment method');
    },
  });

  const totalAvailable = escrowAccounts.reduce((sum, e) => sum + e.held_amount, 0);
  const totalEarned = escrowAccounts.reduce((sum, e) => sum + e.released_amount, 0);
  const totalWithdrawn = payoutHistory
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  const primaryMethod = payoutMethods.find(m => m.is_primary);

  return (
    <div className="min-h-screen bg-cyber-void text-foreground p-6">
      <div className="cyber-grid" />
      <div className="cyber-scanlines" />
      <div className="cyber-vignette" />

      <div className="relative z-10 max-w-[1200px] mx-auto space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }}>
          <p className="font-mono text-[10px] tracking-[7px] uppercase text-fire-3/40 mb-2">
            // PAYOUT MANAGEMENT //
          </p>
          <h1 className="heading-fire text-[clamp(36px,6vw,72px)] leading-none font-black mb-4">
            WITHDRAW YOUR EARNINGS
          </h1>
          <div className="h-[2px] bg-gradient-to-r from-fire-3 via-fire-5 to-transparent" />
        </motion.div>

        {/* Earnings Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Available to Withdraw', value: totalAvailable, color: 'green-400' },
            { label: 'Total Earned', value: totalEarned, color: 'cyan' },
            { label: 'Total Withdrawn', value: totalWithdrawn, color: 'fire-4' },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-gradient-to-br from-[rgba(10,4,18,0.98)] to-[rgba(4,2,8,1)] border border-fire-3/20 p-6 rounded-lg"
            >
              <p className="font-mono text-xs text-fire-3/60 uppercase tracking-[1px] mb-2">
                {stat.label}
              </p>
              <p className={`font-orbitron font-black text-3xl text-${stat.color}`}>
                €{stat.value.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Quick Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`border-2 p-6 rounded-lg ${
            totalAvailable > 0
              ? 'border-green-500/40 bg-green-500/10'
              : 'border-fire-3/20 bg-fire-3/5'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className={`font-orbitron font-bold text-lg ${
                totalAvailable > 0 ? 'text-green-400' : 'text-fire-3/60'
              }`}>
                REQUEST PAYOUT
              </h3>
              <p className="font-rajdhani text-sm text-fire-4/70 mt-1">
                {totalAvailable > 0
                  ? `You have €${totalAvailable.toLocaleString()} available`
                  : 'No funds available to withdraw'}
              </p>
            </div>
            <button
              onClick={() => {
                if (!primaryMethod) {
                  setMethodModalOpen(true);
                  toast.info('Add a payment method first');
                  return;
                }
                setPayoutModalOpen(true);
              }}
              disabled={totalAvailable === 0}
              className={`px-6 py-3 font-orbitron font-bold rounded transition-all ${
                totalAvailable > 0
                  ? 'bg-green-500 text-black hover:opacity-90'
                  : 'bg-fire-3/20 text-fire-3/40 cursor-not-allowed'
              }`}
            >
              REQUEST WITHDRAWAL
            </button>
          </div>
        </motion.div>

        {/* Payment Methods Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-orbitron font-bold text-2xl text-fire-5 flex items-center gap-2">
              <Wallet size={24} />
              Payment Methods
            </h2>
            <button
              onClick={() => setMethodModalOpen(true)}
              className="bg-fire-3/10 border border-fire-3/20 text-fire-3 font-orbitron font-bold py-2 px-4 rounded hover:bg-fire-3/20 transition-all flex items-center gap-2"
            >
              <Plus size={16} />
              ADD METHOD
            </button>
          </div>

          {payoutMethods.length === 0 ? (
            <div className="bg-fire-3/5 border border-fire-3/20 p-8 rounded-lg text-center">
              <Wallet className="text-fire-3/20 mx-auto mb-4" size={48} />
              <p className="font-rajdhani text-sm text-fire-3/60 mb-4">
                No payment methods added yet
              </p>
              <button
                onClick={() => setMethodModalOpen(true)}
                className="bg-gradient-to-r from-fire-3 to-fire-4 text-black font-orbitron font-bold py-2 px-6 rounded hover:opacity-90 transition-all inline-flex items-center gap-2"
              >
                <Plus size={16} />
                ADD YOUR FIRST METHOD
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {payoutMethods.map((method, idx) => (
                <motion.div
                  key={method.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-gradient-to-br from-[rgba(10,4,18,0.98)] to-[rgba(4,2,8,1)] border border-fire-3/20 p-5 rounded-lg flex items-center justify-between hover:border-fire-3/40 transition-all"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-rajdhani font-bold text-fire-4">
                        {method.method_type === 'braintree'
                          ? `${method.bank_name} ••••${method.bank_account_last_four}`
                          : `${method.crypto_type} Wallet`}
                      </h3>
                      {method.is_primary && (
                        <span className="px-2 py-1 bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-mono rounded">
                          PRIMARY
                        </span>
                      )}
                      {method.verified && (
                        <CheckCircle size={16} className="text-green-400" />
                      )}
                    </div>
                    <p className="font-mono text-xs text-fire-3/60">
                      {method.method_type === 'braintree'
                        ? method.bank_account_holder
                        : method.crypto_wallet_address.slice(0, 10) + '...' + method.crypto_wallet_address.slice(-8)}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteMethodMutation.mutate(method.id)}
                    className="p-2 text-red-400/60 hover:text-red-400 hover:bg-red-500/10 rounded transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Payout History */}
        {payoutHistory.length > 0 && (
          <div>
            <h2 className="font-orbitron font-bold text-2xl text-fire-5 mb-6 flex items-center gap-2">
              <DollarSign size={24} />
              Withdrawal History
            </h2>

            <div className="space-y-3">
              {payoutHistory.slice(0, 10).map((payout, idx) => (
                <motion.div
                  key={payout.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-black/30 border border-fire-3/10 p-4 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-orbitron font-bold text-fire-5">
                        €{payout.amount.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
                      </p>
                      <p className="font-mono text-xs text-fire-3/60 mt-1">
                        {new Date(payout.initiated_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-rajdhani text-sm text-fire-4/70 mb-1">
                        {payout.payout_method === 'braintree' ? 'Bank Transfer' : 'Crypto Wallet'}
                      </p>
                      <span
                        className={`inline-block px-3 py-1 rounded text-xs font-mono font-bold ${
                          payout.status === 'completed'
                            ? 'bg-green-500/10 text-green-400'
                            : payout.status === 'processing'
                            ? 'bg-yellow-500/10 text-yellow-400'
                            : 'bg-red-500/10 text-red-400'
                        }`}
                      >
                        {payout.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  {payout.transaction_id && (
                    <p className="font-mono text-xs text-fire-3/40 truncate">
                      TX: {payout.transaction_id}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {methodModalOpen && (
          <PayoutMethodModal
            onClose={() => setMethodModalOpen(false)}
            onSuccess={() => {
              setMethodModalOpen(false);
              queryClient.invalidateQueries({ queryKey: ['payout-methods'] });
            }}
          />
        )}
        {payoutModalOpen && (
          <PayoutRequestModal
            availableAmount={totalAvailable}
            primaryMethod={primaryMethod}
            escrowAccounts={escrowAccounts}
            onClose={() => setPayoutModalOpen(false)}
            onSuccess={() => {
              setPayoutModalOpen(false);
              queryClient.invalidateQueries({ queryKey: ['payout-history'] });
              queryClient.invalidateQueries({ queryKey: ['escrow-accounts'] });
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}