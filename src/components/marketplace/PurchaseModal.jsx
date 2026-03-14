import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, CreditCard, Wallet, ShoppingCart } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export default function PurchaseModal({ token, onClose, onSuccess }) {
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerName, setBuyerName] = useState('');
  const queryClient = useQueryClient();

  const totalPrice = (token.current_price || token.base_price) * quantity;
  const maxQuantity = Math.min(token.available_supply, 10);

  const purchaseMutation = useMutation({
    mutationFn: async (data) => {
      // Create transaction record
      const transaction = await base44.entities.TokenTransaction.create({
        token_id: token.id,
        buyer_email: data.email,
        seller_email: 'platform@streetdinamics.ae',
        transaction_type: 'primary_sale',
        quantity: data.quantity,
        price_per_token: token.current_price || token.base_price,
        total_amount: totalPrice,
        payment_status: 'completed',
        payment_method: paymentMethod,
      });

      // Create ownership record
      await base44.entities.TokenOwnership.create({
        athlete_name: token.athlete_name,
        token_tier: token.token_tier,
        purchase_price: token.current_price || token.base_price,
        purchase_date: new Date().toISOString().split('T')[0],
      });

      // Update token availability
      await base44.entities.AthleteToken.update(token.id, {
        available_supply: token.available_supply - data.quantity,
        status: token.available_supply - data.quantity === 0 ? 'sold_out' : 'active',
      });

      // Update athlete fan count
      const athleteStats = await base44.entities.AthleteStats.filter({ athlete_email: token.athlete_email });
      if (athleteStats.length > 0) {
        await base44.entities.AthleteStats.update(athleteStats[0].id, {
          fan_count: (athleteStats[0].fan_count || 0) + 1,
        });
      }

      return transaction;
    },
  });

  const handlePurchase = () => {
    if (!buyerEmail || !buyerName) {
      alert('Please fill in all fields');
      return;
    }

    purchaseMutation.mutate(
      { email: buyerEmail, name: buyerName, quantity },
      {
        onSuccess: (data) => {
          queryClient.invalidateQueries({ queryKey: ['tokens'] });
          queryClient.invalidateQueries({ queryKey: ['my-tokens'] });
          onSuccess?.(data);
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 z-[500] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 30 }}
        className="relative w-full max-w-[550px] bg-gradient-to-br from-[rgba(10,4,18,0.99)] to-[rgba(4,2,8,1)] border border-fire-3/20 clip-cyber p-6 md:p-8"
      >
        <div className="absolute top-0 left-0 right-0 fire-line" />
        <div className="absolute top-0 right-0 w-[22px] h-[22px] bg-gradient-to-bl from-fire-5 to-fire-2" style={{ clipPath: 'polygon(100% 0,100% 100%,0 0)' }} />

        <button onClick={onClose} className="absolute top-3 right-4 font-mono text-xs tracking-[2px] text-fire-3/30 hover:text-fire-3 cursor-pointer bg-transparent border-none">
          <X size={18} />
        </button>

        <h2 className="text-fire-gradient font-orbitron font-black text-2xl tracking-[2px] mb-1 uppercase">Purchase Token</h2>
        <p className="font-mono text-[11px] tracking-[4px] uppercase text-fire-3/30 mb-6">{token.athlete_name} — {token.token_tier}</p>

        {/* Token preview */}
        <div className="bg-fire-3/5 border border-fire-3/10 p-4 mb-5 flex items-center gap-4">
          <img
            src={token.avatar_url || 'https://via.placeholder.com/80'}
            alt={token.athlete_name}
            className="w-20 h-20 object-cover rounded"
          />
          <div>
            <div className="font-orbitron font-bold text-lg text-fire-5">{token.athlete_name}</div>
            <div className="font-mono text-[10px] text-fire-3/40 tracking-[1px] uppercase">{token.sport} • {token.token_tier}</div>
            <div className="font-orbitron font-bold text-sm text-fire-4 mt-1">€{token.current_price || token.base_price} per token</div>
          </div>
        </div>

        {/* Buyer info */}
        <div className="mb-4">
          <label className="font-mono text-[11px] tracking-[2px] uppercase text-fire-3/30 block mb-1">Your Name</label>
          <input
            type="text"
            value={buyerName}
            onChange={(e) => setBuyerName(e.target.value)}
            className="cyber-input"
            placeholder="John Doe"
          />
        </div>

        <div className="mb-4">
          <label className="font-mono text-[11px] tracking-[2px] uppercase text-fire-3/30 block mb-1">Your Email</label>
          <input
            type="email"
            value={buyerEmail}
            onChange={(e) => setBuyerEmail(e.target.value)}
            className="cyber-input"
            placeholder="you@example.com"
          />
        </div>

        {/* Quantity selector */}
        <div className="mb-4">
          <label className="font-mono text-[11px] tracking-[2px] uppercase text-fire-3/30 block mb-2">Quantity</label>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="btn-ghost text-[12px] py-2 px-4"
            >
              −
            </button>
            <div className="font-orbitron font-bold text-xl text-fire-5 min-w-[60px] text-center">{quantity}</div>
            <button
              onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
              className="btn-ghost text-[12px] py-2 px-4"
            >
              +
            </button>
            <span className="font-mono text-[10px] text-fire-3/30 ml-auto">Max: {maxQuantity}</span>
          </div>
        </div>

        {/* Payment method */}
        <div className="mb-5">
          <label className="font-mono text-[11px] tracking-[2px] uppercase text-fire-3/30 block mb-2">Payment Method</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setPaymentMethod('card')}
              className={`flex items-center gap-2 justify-center py-2.5 px-3 border font-mono text-[10px] tracking-[1px] transition-all ${
                paymentMethod === 'card'
                  ? 'border-fire-3 bg-fire-3/10 text-fire-4'
                  : 'border-fire-3/20 text-fire-3/40 hover:border-fire-3/40'
              }`}
            >
              <CreditCard size={14} />
              Card
            </button>
            <button
              onClick={() => setPaymentMethod('wallet')}
              className={`flex items-center gap-2 justify-center py-2.5 px-3 border font-mono text-[10px] tracking-[1px] transition-all ${
                paymentMethod === 'wallet'
                  ? 'border-cyan bg-cyan/10 text-cyan'
                  : 'border-fire-3/20 text-fire-3/40 hover:border-fire-3/40'
              }`}
            >
              <Wallet size={14} />
              Crypto
            </button>
          </div>
        </div>

        {/* Total */}
        <div className="bg-gradient-to-r from-fire-3/10 to-fire-3/5 border border-fire-3/20 p-4 mb-5">
          <div className="flex items-center justify-between mb-1">
            <span className="font-mono text-[10px] text-fire-3/40 tracking-[1px]">SUBTOTAL</span>
            <span className="font-rajdhani text-sm text-fire-4">€{totalPrice.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[10px] text-fire-3/40 tracking-[1px]">FEES</span>
            <span className="font-rajdhani text-sm text-fire-4">€0.00</span>
          </div>
          <div className="h-[1px] bg-fire-3/20 mb-2" />
          <div className="flex items-center justify-between">
            <span className="font-orbitron text-sm font-bold text-fire-5 tracking-[1px]">TOTAL</span>
            <span className="font-orbitron text-xl font-black text-fire-5">€{totalPrice.toFixed(2)}</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-ghost py-3 px-5 text-[11px]">
            Cancel
          </button>
          <button
            onClick={handlePurchase}
            disabled={purchaseMutation.isPending || !buyerEmail || !buyerName}
            className="btn-fire flex-1 text-[11px] py-3 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <ShoppingCart size={14} />
            {purchaseMutation.isPending ? 'Processing...' : 'Complete Purchase'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}