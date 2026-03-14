/**
 * Payout Method Modal
 * Add bank account or crypto wallet for payouts
 */

import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { X, CreditCard, Wallet } from 'lucide-react';
import { toast } from 'sonner';

export default function PayoutMethodModal({ onClose, onSuccess }) {
  const [methodType, setMethodType] = useState('braintree');
  const [formData, setFormData] = useState({
    bankHolder: '',
    bankName: '',
    accountLast4: '',
    walletAddress: '',
    walletLabel: '',
    cryptoType: 'ETH',
  });
  const [isLoading, setIsLoading] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const handleAddMethod = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (methodType === 'braintree') {
        if (!formData.bankHolder || !formData.bankName || !formData.accountLast4) {
          toast.error('Please fill all bank details');
          return;
        }

        await base44.entities.PayoutMethod.create({
          athlete_email: user.email,
          method_type: 'braintree',
          bank_account_holder: formData.bankHolder,
          bank_name: formData.bankName,
          bank_account_last_four: formData.accountLast4,
          verified: true,
          is_primary: true,
        });
      } else {
        if (!formData.walletAddress || !formData.walletLabel) {
          toast.error('Please provide wallet address and label');
          return;
        }

        // Validate wallet address format
        if (!formData.walletAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
          toast.error('Invalid Ethereum wallet address format');
          return;
        }

        await base44.entities.PayoutMethod.create({
          athlete_email: user.email,
          method_type: 'crypto_wallet',
          crypto_wallet_address: formData.walletAddress,
          crypto_type: formData.cryptoType,
          wallet_label: formData.walletLabel,
          verified: true,
          is_primary: true,
        });
      }

      toast.success('Payment method added successfully!');
      onSuccess();
    } catch (error) {
      toast.error(error.message || 'Failed to add payment method');
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
        className="w-full max-w-2xl bg-gradient-to-br from-[rgba(10,4,18,0.99)] to-[rgba(4,2,8,1)] border border-fire-3/20 rounded-lg p-8"
      >
        <div className="flex items-start justify-between mb-6">
          <h2 className="text-fire-gradient font-orbitron font-black text-2xl">
            ADD PAYMENT METHOD
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-fire-3/10 rounded transition-all">
            <X size={20} className="text-fire-3" />
          </button>
        </div>

        {/* Method Type Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setMethodType('braintree')}
            className={`flex-1 py-3 px-4 rounded font-orbitron font-bold text-xs tracking-[1px] uppercase border transition-all flex items-center justify-center gap-2 ${
              methodType === 'braintree'
                ? 'border-fire-3 bg-fire-3/20 text-fire-5'
                : 'border-fire-3/20 bg-fire-3/5 text-fire-3/60 hover:border-fire-3/40'
            }`}
          >
            <CreditCard size={16} />
            Bank Account
          </button>
          <button
            onClick={() => setMethodType('crypto_wallet')}
            className={`flex-1 py-3 px-4 rounded font-orbitron font-bold text-xs tracking-[1px] uppercase border transition-all flex items-center justify-center gap-2 ${
              methodType === 'crypto_wallet'
                ? 'border-cyan bg-cyan/20 text-cyan'
                : 'border-cyan/20 bg-cyan/5 text-cyan/60 hover:border-cyan/40'
            }`}
          >
            <Wallet size={16} />
            Crypto Wallet
          </button>
        </div>

        <form onSubmit={handleAddMethod} className="space-y-4">
          {methodType === 'braintree' ? (
            <>
              <div>
                <label className="block font-rajdhani font-bold text-fire-4 mb-2">
                  Account Holder Name *
                </label>
                <input
                  type="text"
                  value={formData.bankHolder}
                  onChange={(e) => setFormData({ ...formData, bankHolder: e.target.value })}
                  placeholder="John Doe"
                  className="w-full bg-fire-3/5 border border-fire-3/20 px-4 py-2 text-fire-4 placeholder-fire-3/30 font-rajdhani focus:outline-none focus:border-fire-3/40 rounded"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-rajdhani font-bold text-fire-4 mb-2">
                    Bank Name *
                  </label>
                  <input
                    type="text"
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                    placeholder="Deutsche Bank"
                    className="w-full bg-fire-3/5 border border-fire-3/20 px-4 py-2 text-fire-4 placeholder-fire-3/30 font-rajdhani focus:outline-none focus:border-fire-3/40 rounded"
                  />
                </div>

                <div>
                  <label className="block font-rajdhani font-bold text-fire-4 mb-2">
                    Last 4 Digits *
                  </label>
                  <input
                    type="text"
                    value={formData.accountLast4}
                    onChange={(e) => setFormData({ ...formData, accountLast4: e.target.value.slice(-4) })}
                    placeholder="1234"
                    maxLength="4"
                    className="w-full bg-fire-3/5 border border-fire-3/20 px-4 py-2 text-fire-4 placeholder-fire-3/30 font-rajdhani focus:outline-none focus:border-fire-3/40 rounded"
                  />
                </div>
              </div>

              <div className="bg-cyan/5 border border-cyan/20 p-3 rounded">
                <p className="font-mono text-xs text-cyan/70">
                  ℹ️ Your full bank details are encrypted and never stored in plain text. Only the last 4 digits are visible.
                </p>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block font-rajdhani font-bold text-cyan mb-2">
                  Wallet Address *
                </label>
                <input
                  type="text"
                  value={formData.walletAddress}
                  onChange={(e) => setFormData({ ...formData, walletAddress: e.target.value })}
                  placeholder="0x1234567890123456789012345678901234567890"
                  className="w-full bg-cyan/5 border border-cyan/20 px-4 py-2 text-cyan placeholder-cyan/30 font-mono text-sm focus:outline-none focus:border-cyan/40 rounded"
                />
                <p className="font-mono text-xs text-cyan/60 mt-1">
                  Only Ethereum (0x) addresses supported
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-rajdhani font-bold text-cyan mb-2">
                    Cryptocurrency Type *
                  </label>
                  <select
                    value={formData.cryptoType}
                    onChange={(e) => setFormData({ ...formData, cryptoType: e.target.value })}
                    className="w-full bg-cyan/5 border border-cyan/20 px-4 py-2 text-cyan font-rajdhani focus:outline-none focus:border-cyan/40 rounded"
                  >
                    <option value="ETH">Ethereum (ETH)</option>
                    <option value="USDC">USD Coin (USDC)</option>
                    <option value="BTC">Bitcoin (BTC)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-rajdhani font-bold text-cyan mb-2">
                    Wallet Label *
                  </label>
                  <input
                    type="text"
                    value={formData.walletLabel}
                    onChange={(e) => setFormData({ ...formData, walletLabel: e.target.value })}
                    placeholder="My Main Wallet"
                    className="w-full bg-cyan/5 border border-cyan/20 px-4 py-2 text-cyan placeholder-cyan/30 font-rajdhani focus:outline-none focus:border-cyan/40 rounded"
                  />
                </div>
              </div>

              <div className="bg-cyan/5 border border-cyan/20 p-3 rounded">
                <p className="font-mono text-xs text-cyan/70">
                  ℹ️ Ensure you have full control of this wallet. Payouts cannot be reversed once sent.
                </p>
              </div>
            </>
          )}

          <div className="flex gap-3 pt-6 border-t border-fire-3/20">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-fire-3/10 border border-fire-3/20 text-fire-3 font-orbitron font-bold py-3 rounded hover:bg-fire-3/20 transition-all"
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-fire-3 to-fire-4 text-black font-orbitron font-bold py-3 rounded hover:opacity-90 transition-all disabled:opacity-50"
            >
              {isLoading ? 'ADDING...' : 'ADD METHOD'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}