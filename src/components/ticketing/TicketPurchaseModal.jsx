/**
 * Ticket Purchase Modal
 * Allows users to purchase event tickets with multiple tiers
 */

import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { X, ShoppingCart, Ticket, Crown } from 'lucide-react';
import { toast } from 'sonner';

export default function TicketPurchaseModal({ event, onClose, onSuccess, user }) {
  const [ticketType, setTicketType] = useState('general');
  const [quantity, setQuantity] = useState(1);
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const ticketTiers = {
    general: { name: 'General Admission', price: 25, description: 'Standard entry to event' },
    early_bird: { name: 'Early Bird', price: 20, description: 'Limited early bird pricing' },
    vip: { name: 'VIP Access', price: 75, description: 'Premium seating + meet & greet' },
    premium: { name: 'Premium', price: 150, description: 'Exclusive lounge access + premium seating' },
  };

  const selectedTier = ticketTiers[ticketType];
  const totalPrice = selectedTier.price * quantity;

  const generateTicketCode = () => {
    return `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  };

  const generateQRCode = async (ticketCode) => {
    try {
      const qrDataUrl = `${window.location.origin}?ticket=${ticketCode}&event=${event.id}`;
      const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrDataUrl)}`;
      return { qrDataUrl, qrImageUrl };
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw error;
    }
  };

  const handlePurchase = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const ticketCode = generateTicketCode();
      const { qrDataUrl, qrImageUrl } = await generateQRCode(ticketCode);

      // Create individual tickets for each quantity
      const ticketPromises = Array.from({ length: quantity }).map((_, idx) =>
        base44.entities.Ticket.create({
          event_id: event.id,
          buyer_email: user.email,
          buyer_name: user.full_name,
          ticket_type: ticketType,
          price: selectedTier.price,
          quantity: 1,
          ticket_code: `${ticketCode}-${idx + 1}`,
          qr_code_url: qrImageUrl,
          qr_code_data: qrDataUrl,
          additional_info: additionalInfo ? JSON.parse(additionalInfo) : null,
          purchase_date: new Date().toISOString(),
        })
      );

      await Promise.all(ticketPromises);
      toast.success(`${quantity} ticket(s) purchased successfully!`);
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Purchase failed:', error);
      toast.error('Failed to purchase tickets. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[500] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl bg-gradient-to-br from-[rgba(10,4,18,0.99)] to-[rgba(4,2,8,1)] border border-fire-3/20 rounded-lg p-8"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-fire-gradient font-orbitron font-black text-2xl mb-2">
              GET YOUR TICKETS
            </h2>
            <p className="font-rajdhani text-sm text-fire-4/70">{event.title}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-fire-3/10 rounded transition-all">
            <X size={20} className="text-fire-3" />
          </button>
        </div>

        <form onSubmit={handlePurchase} className="space-y-6">
          {/* Ticket Tier Selection */}
          <div>
            <label className="block font-orbitron font-bold text-fire-5 mb-4 uppercase tracking-[1px]">
              Select Ticket Tier
            </label>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(ticketTiers).map(([key, tier]) => (
                <motion.button
                  key={key}
                  type="button"
                  onClick={() => setTicketType(key)}
                  whileHover={{ scale: 1.02 }}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    ticketType === key
                      ? 'border-fire-3 bg-fire-3/20'
                      : 'border-fire-3/20 bg-fire-3/5 hover:border-fire-3/40'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-rajdhani font-bold text-fire-4">{tier.name}</h4>
                    {key === 'vip' && <Crown size={16} className="text-fire-5" />}
                  </div>
                  <p className="font-mono text-xs text-fire-3/60 mb-2">{tier.description}</p>
                  <p className="font-orbitron font-black text-lg text-fire-5">€{tier.price}</p>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div>
            <label className="block font-rajdhani font-bold text-fire-4 mb-2">Quantity</label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 bg-fire-3/10 border border-fire-3/20 text-fire-3 font-bold rounded hover:bg-fire-3/20 transition-all"
              >
                −
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="flex-1 bg-fire-3/5 border border-fire-3/20 px-4 py-2 text-fire-4 font-orbitron font-bold text-center focus:outline-none focus:border-fire-3/40"
                min="1"
                max="10"
              />
              <button
                type="button"
                onClick={() => setQuantity(Math.min(10, quantity + 1))}
                className="w-10 h-10 bg-fire-3/10 border border-fire-3/20 text-fire-3 font-bold rounded hover:bg-fire-3/20 transition-all"
              >
                +
              </button>
            </div>
          </div>

          {/* Additional Info */}
          <div>
            <label className="block font-rajdhani font-bold text-fire-4 mb-2">Special Requirements (Optional)</label>
            <textarea
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              placeholder="e.g., Accessibility needs, dietary requirements, etc."
              rows={2}
              className="w-full bg-fire-3/5 border border-fire-3/20 px-4 py-2 text-fire-4 placeholder-fire-3/30 font-rajdhani focus:outline-none focus:border-fire-3/40 rounded"
            />
          </div>

          {/* Price Breakdown */}
          <div className="bg-fire-3/5 border border-fire-3/20 p-4 rounded-lg space-y-2">
            <div className="flex justify-between font-rajdhani">
              <span className="text-fire-3/60">Unit Price</span>
              <span className="text-fire-4">€{selectedTier.price}</span>
            </div>
            <div className="flex justify-between font-rajdhani">
              <span className="text-fire-3/60">Quantity</span>
              <span className="text-fire-4">{quantity}</span>
            </div>
            <div className="h-[1px] bg-fire-3/20" />
            <div className="flex justify-between font-orbitron font-black text-lg">
              <span className="text-fire-3">TOTAL</span>
              <span className="text-fire-5">€{totalPrice}</span>
            </div>
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
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-fire-3 to-fire-4 text-black font-orbitron font-bold py-3 rounded hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <ShoppingCart size={18} />
              {isLoading ? 'PROCESSING...' : 'PURCHASE TICKETS'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}