/**
 * CheckoutModal — Checkout unificato per il marketplace secondario.
 * Supporta pagamento fiat (simulato) e crypto via CryptoPaymentModal.
 * Gestisce sia acquisti primari (AthleteToken) che secondari (SecondaryMarketListing).
 */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, CreditCard, Wallet, ShoppingCart, CheckCircle, Loader2, ArrowRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import CryptoPaymentModal from '../web3/CryptoPaymentModal';

const RARITY_COLORS = {
  rising_star:     '#94a3b8',
  breakout_talent: '#a855f7',
  elite_performer: '#00ffee',
  living_legend:   '#fbbf24',
};

export default function CheckoutModal({ listing, onClose, onSuccess }) {
  const queryClient = useQueryClient();
  const [paymentMethod, setPaymentMethod] = useState(null); // 'fiat' | 'crypto' | null
  const [done, setDone] = useState(false);

  const { data: user } = useQuery({ queryKey: ['current-user'], queryFn: () => base44.auth.me() });

  const price = listing.listing_price || listing.current_price || listing.base_price || 0;
  const total = price * (listing.quantity || 1);
  const rarity = listing.rarity || listing.token_tier || 'rising_star';
  const tierColor = RARITY_COLORS[rarity] || '#ff6600';
  const platformFee = total * 0.05;
  const sellerReceives = total - platformFee;
  const isSecondary = !!listing.seller_email;

  // Fiat purchase (secondary market)
  const fiatMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Utente non autenticato');
      if (isSecondary) {
        // Secondary market trade
        await base44.entities.SecondaryMarketTrade.create({
          listing_id: listing.id,
          asset_type: listing.asset_type || 'token',
          asset_id: listing.asset_id,
          athlete_name: listing.athlete_name,
          seller_email: listing.seller_email,
          buyer_email: user.email,
          quantity: listing.quantity || 1,
          price_per_unit: price,
          total_amount: total,
          platform_fee: platformFee,
          seller_receives: sellerReceives,
          payment_method: 'fiat_eur',
          traded_at: new Date().toISOString(),
        });
        await base44.entities.SecondaryMarketListing.update(listing.id, { status: 'sold' });
        // Transfer ownership
        await base44.entities.NFTOwnership.create({
          nft_id: listing.asset_id,
          athlete_name: listing.athlete_name,
          rarity,
          purchase_price: price,
          purchase_type: 'secondary_fiat',
          buyer_email: user.email,
          minted_at: new Date().toISOString(),
        });
      } else {
        // Primary sale (AthleteToken from store)
        await base44.entities.TokenTransaction.create({
          token_id: listing.id,
          buyer_email: user.email,
          seller_email: 'platform@streetdinamics.ae',
          transaction_type: 'primary_sale',
          quantity: 1,
          price_per_token: price,
          total_amount: price,
          payment_status: 'completed',
          payment_method: 'fiat_eur',
          timestamp: new Date().toISOString(),
        });
        await base44.entities.TokenOwnership.create({
          athlete_name: listing.athlete_name,
          token_tier: listing.token_tier,
          rarity: listing.token_tier,
          purchase_price: price,
          purchase_date: new Date().toISOString().split('T')[0],
          user_email: user.email,
          quantity: 1,
        });
        await base44.entities.AthleteToken.update(listing.id, {
          available_supply: Math.max(0, (listing.available_supply || 1) - 1),
          status: (listing.available_supply || 1) - 1 <= 0 ? 'sold_out' : 'active',
        });
      }
      // Award Street Cred
      base44.functions.invoke('syncStreetCred', {
        user_email: user.email,
        action: 'marketplace_trades',
        value: 1,
      }).catch(() => {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace-listings'] });
      queryClient.invalidateQueries({ queryKey: ['my-tokens-mp'] });
      queryClient.invalidateQueries({ queryKey: ['fan-tokens'] });
      setDone(true);
      setTimeout(() => { onSuccess?.(); onClose(); }, 2000);
    },
    onError: (e) => toast.error(e.message || 'Errore durante l\'acquisto'),
  });

  // If user chose crypto, delegate to CryptoPaymentModal
  if (paymentMethod === 'crypto') {
    // Build a fake AthleteToken-like object for CryptoPaymentModal
    const tokenObj = {
      id: listing.asset_id || listing.id,
      athlete_name: listing.athlete_name,
      token_tier: rarity,
      current_price: price,
      base_price: price,
      avatar_url: listing.avatar_url || listing.image_url,
    };
    return (
      <CryptoPaymentModal
        token={tokenObj}
        onClose={onClose}
        onSuccess={(data) => {
          queryClient.invalidateQueries({ queryKey: ['marketplace-listings'] });
          if (isSecondary) {
            base44.entities.SecondaryMarketListing.update(listing.id, { status: 'sold' }).catch(() => {});
          }
          onSuccess?.(data);
          onClose();
        }}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-[500] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-[520px] bg-gradient-to-br from-[rgba(10,4,18,0.99)] to-[rgba(4,2,8,1)] clip-cyber p-6 md:p-8"
        style={{ border: `1px solid ${tierColor}33` }}
      >
        {/* Top accent */}
        <div className="absolute top-0 left-0 right-0 h-[2px]"
          style={{ background: `linear-gradient(90deg, transparent, ${tierColor}, transparent)` }} />

        <button onClick={onClose} className="absolute top-3 right-4 text-white/20 hover:text-white/60 transition-colors">
          <X size={18} />
        </button>

        {done ? (
          <div className="text-center py-8">
            <CheckCircle size={56} className="mx-auto mb-4 text-green-400" />
            <h3 className="font-orbitron font-bold text-xl text-green-400 mb-2">Acquisto Completato!</h3>
            <p className="font-mono text-sm text-white/40">
              {listing.athlete_name} è nel tuo vault
            </p>
          </div>
        ) : (
          <>
            <h2 className="font-orbitron font-black text-xl tracking-[2px] mb-0.5 uppercase" style={{ color: tierColor }}>
              Checkout
            </h2>
            <p className="font-mono text-[10px] tracking-[3px] uppercase text-white/30 mb-5">
              {listing.athlete_name} · {rarity.replace(/_/g, ' ')}
            </p>

            {/* Item preview */}
            <div className="flex items-center gap-4 p-3 mb-5 border rounded"
              style={{ background: `${tierColor}08`, borderColor: `${tierColor}22` }}>
              {listing.avatar_url || listing.image_url ? (
                <img src={listing.avatar_url || listing.image_url} alt={listing.athlete_name}
                  className="w-14 h-14 object-cover rounded" style={{ borderColor: `${tierColor}44` }} />
              ) : (
                <div className="w-14 h-14 flex items-center justify-center text-3xl"
                  style={{ background: `${tierColor}15`, borderRadius: 4 }}>🃏</div>
              )}
              <div className="flex-1">
                <div className="font-orbitron font-bold text-base" style={{ color: tierColor }}>
                  {listing.athlete_name}
                </div>
                <div className="font-mono text-[9px] text-white/35 uppercase tracking-[1px]">
                  {listing.sport || ''} · {rarity.replace(/_/g, ' ')}
                </div>
                {isSecondary && (
                  <div className="font-mono text-[8px] text-white/25 mt-0.5">
                    Venditore: {listing.seller_email?.split('@')[0]}…
                  </div>
                )}
              </div>
            </div>

            {/* Price breakdown */}
            <div className="border border-white/8 bg-black/30 p-4 mb-5 space-y-2">
              <div className="flex justify-between font-mono text-[10px]">
                <span className="text-white/40">Prezzo unitario</span>
                <span style={{ color: tierColor }}>€{price.toFixed(2)}</span>
              </div>
              {isSecondary && (
                <div className="flex justify-between font-mono text-[10px]">
                  <span className="text-white/40">Fee piattaforma (5%)</span>
                  <span className="text-red-400">+€{platformFee.toFixed(2)}</span>
                </div>
              )}
              <div className="h-px bg-white/8" />
              <div className="flex justify-between font-orbitron font-bold text-sm">
                <span style={{ color: tierColor }}>TOTALE</span>
                <span style={{ color: tierColor }}>€{total.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment method choice */}
            {!paymentMethod && (
              <div className="space-y-3">
                <p className="font-mono text-[10px] tracking-[2px] uppercase text-white/30 mb-2">Scegli metodo di pagamento</p>

                <button
                  onClick={() => setPaymentMethod('fiat')}
                  className="w-full flex items-center gap-4 p-4 border border-fire-3/20 bg-fire-3/5 hover:border-fire-3/50 hover:bg-fire-3/10 transition-all text-left"
                  style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))' }}
                >
                  <CreditCard size={22} className="text-fire-4 flex-shrink-0" />
                  <div>
                    <div className="font-orbitron font-bold text-sm text-fire-5">Carta / Fiat EUR</div>
                    <div className="font-mono text-[9px] text-white/30">Pagamento diretto · Disponibile subito</div>
                  </div>
                  <ArrowRight size={14} className="ml-auto text-fire-3/40" />
                </button>

                <button
                  onClick={() => setPaymentMethod('crypto')}
                  className="w-full flex items-center gap-4 p-4 border border-cyan/20 bg-cyan/5 hover:border-cyan/50 hover:bg-cyan/10 transition-all text-left"
                  style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))' }}
                >
                  <Wallet size={22} className="text-cyan flex-shrink-0" />
                  <div>
                    <div className="font-orbitron font-bold text-sm text-cyan">Crypto / Web3</div>
                    <div className="font-mono text-[9px] text-white/30">USDC, USDT, EURe, ETH, MATIC e altri</div>
                  </div>
                  <ArrowRight size={14} className="ml-auto text-cyan/40" />
                </button>
              </div>
            )}

            {/* Fiat confirm step */}
            {paymentMethod === 'fiat' && (
              <div className="space-y-4">
                <div className="p-4 border border-fire-4/20 bg-fire-4/5">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard size={14} className="text-fire-4" />
                    <span className="font-orbitron text-sm text-fire-4">Pagamento Fiat EUR</span>
                  </div>
                  <p className="font-mono text-[10px] text-white/30">
                    Acquirente: <span className="text-fire-5">{user?.email || '—'}</span>
                  </p>
                  <p className="font-orbitron font-black text-xl mt-2" style={{ color: '#ff6600' }}>
                    €{total.toFixed(2)}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setPaymentMethod(null)} className="btn-ghost py-3 px-4 text-[11px]">
                    ← Indietro
                  </button>
                  <button
                    onClick={() => fiatMutation.mutate()}
                    disabled={fiatMutation.isPending}
                    className="btn-fire flex-1 py-3 text-[11px] flex items-center justify-center gap-2 disabled:opacity-30"
                  >
                    {fiatMutation.isPending ? (
                      <><Loader2 size={14} className="animate-spin" /> Elaborazione...</>
                    ) : (
                      <><ShoppingCart size={14} /> Conferma acquisto</>
                    )}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}