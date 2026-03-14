/**
 * Payout Request Modal
 * Athletes request withdrawal from escrow
 */

import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { X, Info } from 'lucide-react';
import { toast } from 'sonner';

export default function PayoutRequestModal({
  availableAmount,
  primaryMethod,
  escrowAccounts,
  onClose,
  onSuccess,
}) {
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const handleRequestPayout = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payoutAmount = parseFloat(amount);

      if (isNaN(payoutAmount) || payoutAmount <= 0) {
        toast.error('Invalid amount');
        return;
      }

      if (payoutAmount > availableAmount) {
        toast.error('Amount exceeds available balance');
        return;
      }

      // Create payout record
      const payout = await base44.entities.Payout.create({
        athlete_email: user.email,
        escrow_id: escrowAccounts[0]?.id,
        deal_id: escrowAccounts[0]?.deal_id,
        amount: payoutAmount,
        currency: 'EUR',
        payout_method: primaryMethod.method_type,
        bank_account_id: primaryMethod.braintree_token || null,
        crypto_wallet_address: primaryMethod.crypto_wallet_address || null,
        status: 'pending',
        initiated_date: new Date().toISOString(),
      });

      // Trigger payout processing
      await base44.functions.invoke('processPayout', {
        payoutId: payout.id,
        method: primaryMethod.method_type,
        amount: payoutAmount,
      });

      toast.success(`Payout of €${payoutAmount} requested successfully!`);
      onSuccess();
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Failed to request payout');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[600] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-gradient-to-br from-[rgba(10,4,18,0.99)] to-[rgba(4,2,8,1)] border border-green-500/20 rounded-lg p-8"
      >
        <div className="flex items-start justify-between mb-6">
          <h2 className="font-orbitron font-black text-2xl text-green-400">
            REQUEST WITHDRAWAL
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-green-500/10 rounded transition-all">
            <X size={20} className="text-green-400" />
          </button>
        </div>

        <form onSubmit={handleRequestPayout} className="space-y-4">
          {/* Amount Input */}
          <div>
            <label className="block font-rajdhani font-bold text-green-400 mb-2">
              Withdrawal Amount (EUR)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-3 font-orbitron font-bold text-fire-5">
                €
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0"
                max={availableAmount}
                className="w-full bg-green-500/5 border border-green-500/20 pl-8 pr-4 py-2 text-green-400 placeholder-green-400/30 font-orbitron font-bold text-lg focus:outline-none focus:border-green-500/40 rounded"
              />
            </div>
            <p className="font-mono text-xs text-green-400/60 mt-1">
              Available: €{availableAmount.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
            </p>
          </div>

          {/* Max Button */}
          <button
            type="button"
            onClick={() => setAmount(availableAmount.toString())}
            className="w-full text-xs font-mono py-1 px-2 bg-green-500/10 border border-green-500/20 text-green-400 rounded hover:bg-green-500/20 transition-all"
          >
            USE MAXIMUM (€{availableAmount.toLocaleString('de-DE', { minimumFractionDigits: 2 })})
          </button>

          {/* Payment Method Info */}
          <div className="bg-green-500/10 border border-green-500/20 p-4 rounded">
            <p className="font-rajdhani font-bold text-green-400 mb-2 flex items-center gap-2">
              <Info size={16} />
              Payment Method
            </p>
            <p className="font-rajdhani text-sm text-green-400/80">
              {primaryMethod.method_type === 'braintree'
                ? `${primaryMethod.bank_name} ••••${primaryMethod.bank_account_last_four}`
                : `${primaryMethod.crypto_type} Wallet (${primaryMethod.crypto_wallet_address.slice(0, 6)}...)`}
            </p>
          </div>

          {/* Processing Info */}
          <div className="bg-cyan/5 border border-cyan/20 p-4 rounded">
            <p className="font-mono text-xs text-cyan/70">
              💡 Processing typically takes:
            </p>
            <ul className="font-mono text-xs text-cyan/70 mt-2 space-y-1">
              <li>
                • <strong>Bank Transfer:</strong> 1-2 business days
              </li>
              <li>
                • <strong>Crypto Wallet:</strong> 10-30 minutes
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-fire-3/20">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-fire-3/10 border border-fire-3/20 text-fire-3 font-orbitron font-bold py-3 rounded hover:bg-fire-3/20 transition-all"
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={!amount || isLoading}
              className="flex-1 bg-green-500 text-black font-orbitron font-bold py-3 rounded hover:opacity-90 transition-all disabled:opacity-50"
            >
              {isLoading ? 'PROCESSING...' : 'CONFIRM WITHDRAWAL'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}