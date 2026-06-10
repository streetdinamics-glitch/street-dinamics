/**
 * PurchaseModal — Acquisto primario di AthleteToken dallo store.
 * Usa l'utente loggato (no form email/nome manuale).
 * Offre scelta tra Fiat e Crypto.
 */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, CreditCard, Wallet, ShoppingCart, CheckCircle, Loader2, ArrowRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import CryptoPaymentModal from '../web3/CryptoPaymentModal';

const TIER_COLORS = {
  rising_star:     '#94a3b8',
  breakout_talent: '#a855f7',
  elite_performer: '#00ffee',
  living_legend:   '#fbbf24',
};

export default function PurchaseModal({ token, onClose, onSuccess }) {
  const queryClient = useQueryClient();
  const [paymentMethod, setPaymentMethod] = useState(null); // null | 'fiat' | 'crypto'
  const [quantity, setQuantity] = useState(1);
  const [done, setDone] = useState(false);

  const { data: user } = useQuery({ queryKey: ['current-user'], queryFn: () => base44.auth.me() });

  const price = token.current_price || token.base_price || 0;
  const totalPrice = price * quantity;
  const maxQuantity = Math.min(token.available_supply || 1, 10);
  const tierColor = TIER_COLORS[token.token_tier] || '#ff6600';

  const fiatMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Utente non autenticato');

      await base44.entities.TokenTransaction.create({
        token_id: token.id,
        buyer_email: user.email,
        seller_email: 'platform@streetdinamics.ae',
        transaction_type: 'primary_sale',
        quantity,
        price_per_token: price,
        total_amount: totalPrice,
        payment_status: 'completed',
        payment_method: 'fiat_eur',
        timestamp: new Date().toISOString(),
      });

      await base44.entities.TokenOwnership.create({
        athlete_name: token.athlete_name,
        token_tier: token.token_tier,
        rarity: token.token_tier,
        purchase_price: price,
        purchase_date: new Date().toISOString().split('T')[0],
        user_email: user.email,
        quantity,
      });

      await base44.entities.AthleteToken.update(token.id, {
        available_supply: Math.max(0, token.available_supply - quantity),
        status: token.available_supply - quantity <= 0 ? 'sold_out' : 'active',
      });

      const stats = await base44.entities.AthleteStats.filter({ athlete_email: token.athlete_email });
      if (stats[0]) {
        await base44.entities.AthleteStats.update(stats[0].id, {
          fan_count: (stats[0].fan_count || 0) + quantity,
        });
      }

      // Street Cred
      base44.functions.invoke('syncStreetCred', {
        user_email: user.email,
        action: 'tokens_owned',
        value: quantity,
      }).catch(() => {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tokens'] });
      queryClient.invalidateQueries({ queryKey: ['fan-tokens'] });
      queryClient.invalidateQueries({ queryKey: ['my-tokens-mp'] });
      setDone(true);
      setTimeout(() => onSuccess?.(), 2000);
    },
    onError: (e) => toast.error(e.message || 'Errore durante l\'acquisto'),
  });

  if (paymentMethod === 'crypto') {
    return (
      <CryptoPaymentModal
        token={token}
        onClose={onClose}
        onSuccess={(data) => {
          queryClient.invalidateQueries({ queryKey: ['tokens'] });
          queryClient.invalidateQueries({ queryKey: ['fan-tokens'] });
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
              La card di {token.athlete_name} è nel tuo vault
            </p>
          </div>
        ) : (
          <>
            <h2 className="font-orbitron font-black text-xl tracking-[2px] mb-0.5 uppercase" style={{ color: tierColor }}>
              Acquista Card
            </h2>
            <p className="font-mono text-[10px] tracking-[3px] uppercase text-white/30 mb-5">
              {token.athlete_name} · {token.token_tier?.replace(/_/g, ' ')}
            </p>

            {/* Token preview */}
            <div className="flex items-center gap-4 p-3 mb-5 border"
              style={{ background: `${tierColor}08`, borderColor: `${tierColor}22` }}>
              {token.avatar_url ? (
                <img src={token.avatar_url} alt={token.athlete_name} className="w-14 h-14 object-cover" />
              ) : (
                <div className="w-14 h-14 flex items-center justify-center text-3xl"
                  style={{ background: `${tierColor}15` }}>🃏</div>
              )}
              <div className="flex-1">
                <div className="font-orbitron font-bold text-base" style={{ color: tierColor }}>
                  {token.athlete_name}
                </div>
                <div className="font-mono text-[9px] text-white/35 uppercase tracking-[1px]">
                  {token.sport} · {token.token_tier?.replace(/_/g, ' ')}
                </div>
                <div className="font-mono text-[10px] mt-1" style={{ color: tierColor }}>
                  €{price.toFixed(2)} / card
                </div>
              </div>
              {/* Quantity */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-7 h-7 border border-white/10 text-white/60 hover:border-white/30 font-bold flex items-center justify-center">−</button>
                <span className="font-orbitron font-bold min-w-[24px] text-center" style={{ color: tierColor }}>{quantity}</span>
                <button onClick={() => setQuantity(q => Math.min(maxQuantity, q + 1))}
                  className="w-7 h-7 border border-white/10 text-white/60 hover:border-white/30 font-bold flex items-center justify-center">+</button>
              </div>
            </div>

            {/* Totale */}
            <div className="border border-white/8 bg-black/30 p-4 mb-5 flex items-center justify-between">
              <span className="font-mono text-[10px] text-white/40">TOTALE ({quantity}x)</span>
              <span className="font-orbitron font-black text-xl" style={{ color: tierColor }}>€{totalPrice.toFixed(2)}</span>
            </div>

            {/* Payment method choice */}
            {!paymentMethod && (
              <div className="space-y-3">
                <p className="font-mono text-[10px] tracking-[2px] uppercase text-white/30 mb-2">Metodo di pagamento</p>

                <button
                  onClick={() => setPaymentMethod('fiat')}
                  className="w-full flex items-center gap-4 p-4 border border-fire-3/20 bg-fire-3/5 hover:border-fire-3/50 hover:bg-fire-3/10 transition-all text-left"
                  style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))' }}
                >
                  <CreditCard size={22} className="text-fire-4 flex-shrink-0" />
                  <div>
                    <div className="font-orbitron font-bold text-sm text-fire-5">Carta / Fiat EUR</div>
                    <div className="font-mono text-[9px] text-white/30">Pagamento diretto · Immediato</div>
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

                <button onClick={onClose} className="w-full btn-ghost py-2.5 text-[11px] mt-1">
                  Annulla
                </button>
              </div>
            )}

            {/* Fiat confirm */}
            {paymentMethod === 'fiat' && (
              <div className="space-y-4">
                <div className="p-4 border border-fire-4/20 bg-fire-4/5">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard size={14} className="text-fire-4" />
                    <span className="font-orbitron text-sm text-fire-4">Pagamento Fiat EUR</span>
                  </div>
                  <p className="font-mono text-[10px] text-white/30">
                    Account: <span className="text-fire-5">{user?.email || '—'}</span>
                  </p>
                  <p className="font-orbitron font-black text-2xl mt-2 text-fire-5">€{totalPrice.toFixed(2)}</p>
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
                      <><ShoppingCart size={14} /> Conferma €{totalPrice.toFixed(2)}</>
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