/**
 * Payment Gateway Processor
 * Handles currency conversion, payment method selection, and fiat payout processing
 */

import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { CreditCard, DollarSign, TrendingUp, Check, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function PaymentGatewayProcessor({
  payout,
  paymentMethods,
  onSuccess,
}) {
  const [selectedMethod, setSelectedMethod] = useState(paymentMethods[0] || null);
  const [selectedCurrency, setSelectedCurrency] = useState('EUR');
  const [showConfirm, setShowConfirm] = useState(false);
  const queryClient = useQueryClient();

  const CURRENCIES = {
    EUR: { label: 'Euro', rate: 1, symbol: '€' },
    USD: { label: 'US Dollar', rate: 1.08, symbol: '$' },
    GBP: { label: 'British Pound', rate: 0.86, symbol: '£' },
    CHF: { label: 'Swiss Franc', rate: 0.95, symbol: 'CHF' },
    JPY: { label: 'Japanese Yen', rate: 160.5, symbol: '¥' },
  };

  const CRYPTO_CURRENCIES = {
    USDC: { label: 'USD Coin', symbol: 'USDC' },
    ETH: { label: 'Ethereum', symbol: 'ETH' },
    BTC: { label: 'Bitcoin', symbol: 'BTC' },
  };

  const processPaymentMutation = useMutation({
    mutationFn: async () => {
      const currencyData =
        selectedCurrency === 'EUR' || !selectedMethod
          ? null
          : {
              targetCurrency: selectedCurrency,
              rate: CURRENCIES[selectedCurrency]?.rate || 1,
            };

      const result = await base44.functions.invoke(
        'processPaymentGatewayPayout',
        {
          payoutId: payout.id,
          paymentMethod: selectedMethod,
          currencyConversion: currencyData,
        }
      );

      return result.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['payouts'] });
      toast.success('Payment processed successfully!');
      onSuccess?.(data);
    },
    onError: (error) => {
      toast.error('Payment failed: ' + error.message);
    },
  });

  const convertedAmount = payout.amount * (CURRENCIES[selectedCurrency]?.rate || 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-[rgba(10,4,18,0.98)] to-[rgba(4,2,8,1)] border border-cyan/20 p-6 rounded-lg space-y-6"
    >
      {/* Header */}
      <div>
        <h3 className="font-orbitron font-bold text-lg text-cyan flex items-center gap-2 mb-2">
          <CreditCard size={20} />
          Payment Gateway Processing
        </h3>
        <p className="font-rajdhani text-cyan/60 text-sm">
          Select payment method and currency for automated payout
        </p>
      </div>

      {/* Amount Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-cyan/5 border border-cyan/10 p-4 rounded-lg">
          <p className="font-mono text-xs text-cyan/60 uppercase mb-1">
            Original Amount
          </p>
          <p className="font-orbitron font-black text-2xl text-cyan">
            €{payout.amount.toFixed(2)}
          </p>
        </div>

        <div className="bg-green-500/5 border border-green-500/10 p-4 rounded-lg">
          <p className="font-mono text-xs text-green-400/60 uppercase mb-1">
            Converted Amount
          </p>
          <p className="font-orbitron font-black text-2xl text-green-400">
            {selectedCurrency === 'EUR' || !selectedMethod
              ? '€'
              : selectedCurrency.length === 3
              ? CURRENCIES[selectedCurrency]?.symbol
              : CRYPTO_CURRENCIES[selectedCurrency]?.symbol}
            {convertedAmount.toFixed(2)}
          </p>
          {selectedCurrency !== 'EUR' && (
            <p className="font-mono text-xs text-green-400/50 mt-1">
              @ {(CURRENCIES[selectedCurrency]?.rate || 1).toFixed(4)}
            </p>
          )}
        </div>
      </div>

      {/* Payment Method Selection */}
      <div>
        <label className="block font-rajdhani font-bold text-cyan mb-3">
          Select Payment Method
        </label>
        <div className="space-y-2">
          {paymentMethods.map((method) => (
            <motion.button
              key={method.id}
              whileHover={{ scale: 1.01 }}
              onClick={() => setSelectedMethod(method)}
              className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                selectedMethod?.id === method.id
                  ? 'border-cyan bg-cyan/10'
                  : 'border-cyan/20 bg-cyan/5 hover:border-cyan/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-rajdhani font-bold text-cyan text-sm">
                    {method.method_type === 'braintree'
                      ? '💳 Bank Transfer'
                      : '₿ Crypto Wallet'}
                  </p>
                  <p className="font-mono text-xs text-cyan/60">
                    {method.method_type === 'braintree'
                      ? `**** ${method.bank_account_last_four}`
                      : method.crypto_wallet_address?.substring(0, 10) + '...'}
                  </p>
                </div>
                {selectedMethod?.id === method.id && (
                  <Check size={20} className="text-green-400" />
                )}
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Currency Selection */}
      {selectedMethod && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <label className="block font-rajdhani font-bold text-cyan mb-3">
            Payout Currency
          </label>

          {selectedMethod.method_type === 'braintree' ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {Object.entries(CURRENCIES).map(([code, data]) => (
                <button
                  key={code}
                  onClick={() => setSelectedCurrency(code)}
                  className={`p-3 rounded border-2 transition-all font-rajdhani text-sm font-bold ${
                    selectedCurrency === code
                      ? 'border-green-500 bg-green-500/10 text-green-400'
                      : 'border-cyan/20 bg-cyan/5 text-cyan/60 hover:border-cyan/40'
                  }`}
                >
                  {code}
                  <br />
                  <span className="text-xs">({data.symbol})</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {Object.entries(CRYPTO_CURRENCIES).map(([code, data]) => (
                <button
                  key={code}
                  onClick={() => setSelectedCurrency(code)}
                  className={`p-3 rounded border-2 transition-all font-rajdhani text-sm font-bold ${
                    selectedCurrency === code
                      ? 'border-purple-500 bg-purple-500/10 text-purple-400'
                      : 'border-cyan/20 bg-cyan/5 text-cyan/60 hover:border-cyan/40'
                  }`}
                >
                  {code}
                </button>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Conversion Details */}
      {selectedCurrency !== 'EUR' && selectedMethod && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-lg"
        >
          <div className="flex gap-3">
            <TrendingUp size={20} className="text-yellow-400 flex-shrink-0" />
            <div>
              <p className="font-rajdhani font-bold text-yellow-400 text-sm mb-1">
                Currency Conversion Applied
              </p>
              <p className="font-mono text-xs text-yellow-400/70">
                €{payout.amount.toFixed(2)} × {(CURRENCIES[selectedCurrency]?.rate || 1).toFixed(4)} ={' '}
                {CURRENCIES[selectedCurrency]?.symbol}
                {convertedAmount.toFixed(2)}
              </p>
              <p className="font-mono text-xs text-yellow-400/60 mt-1">
                Live rate as of {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Compliance Notice */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-green-500/10 border border-green-500/20 p-4 rounded-lg flex gap-3"
      >
        <AlertCircle size={18} className="text-green-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-rajdhani font-bold text-green-400 text-sm mb-1">
            Tax-Compliant Processing
          </p>
          <p className="font-rajdhani text-xs text-green-400/70">
            Automated invoices will be generated for both parties with conversion rates, payment method details, and professional services description for tax filing.
          </p>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => setShowConfirm(false)}
          className="flex-1 bg-cyan/10 border border-cyan/20 text-cyan font-orbitron font-bold py-3 rounded hover:bg-cyan/20 transition-all"
        >
          CANCEL
        </button>

        <button
          onClick={() => setShowConfirm(true)}
          disabled={!selectedMethod || processPaymentMutation.isPending}
          className="flex-1 bg-gradient-to-r from-cyan to-green-400 text-black font-orbitron font-bold py-3 rounded hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <CreditCard size={18} />
          PROCESS PAYMENT
        </button>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/40 border border-green-500/30 p-4 rounded-lg space-y-4"
        >
          <p className="font-rajdhani font-bold text-green-400">
            Confirm Payment Processing
          </p>
          <div className="space-y-2 font-rajdhani text-sm text-green-400/70">
            <p>
              Method: {selectedMethod.method_type === 'braintree' ? 'Bank Transfer' : 'Crypto'}
            </p>
            <p>
              Amount: {selectedCurrency === 'EUR' ? '€' : CURRENCIES[selectedCurrency]?.symbol || CRYPTO_CURRENCIES[selectedCurrency]?.symbol}
              {convertedAmount.toFixed(2)}
            </p>
            <p>Tax-compliant invoices will be generated and sent to both parties.</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowConfirm(false)}
              className="flex-1 px-3 py-2 bg-cyan/10 border border-cyan/20 text-cyan font-rajdhani text-xs font-bold rounded hover:bg-cyan/20 transition-all"
            >
              CANCEL
            </button>
            <button
              onClick={() => {
                processPaymentMutation.mutate();
                setShowConfirm(false);
              }}
              disabled={processPaymentMutation.isPending}
              className="flex-1 px-3 py-2 bg-green-500/20 border border-green-500/30 text-green-400 font-rajdhani text-xs font-bold rounded hover:bg-green-500/30 transition-all disabled:opacity-50"
            >
              {processPaymentMutation.isPending ? 'PROCESSING...' : 'CONFIRM'}
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}