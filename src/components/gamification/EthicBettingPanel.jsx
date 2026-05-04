import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

// Ethical betting uses "Prediction Coins" — zero real money
const COIN_EMOJI = '🔮';
const STARTING_COINS = 500;

const LABELS = {
  it: { title: 'PRONOSTICI ETICI', sub: 'Coin virtuali — nessun denaro reale.', balance: 'Il tuo saldo', stake: 'Punta', confirm: 'Conferma', won: 'VINTO', lost: 'PERSO', pending: 'IN CORSO', active: 'Aperte', settled: 'Chiuse', noEvents: 'Nessun evento live per scommettere.', odds: 'Quota', potential: 'Potenziale' },
  en: { title: 'ETHICAL PREDICTIONS', sub: 'Virtual coins — no real money.', balance: 'Your balance', stake: 'Stake', confirm: 'Confirm', won: 'WON', lost: 'LOST', pending: 'PENDING', active: 'Open', settled: 'Closed', noEvents: 'No live events to bet on.', odds: 'Odds', potential: 'Potential' },
  es: { title: 'PRONÓSTICOS ÉTICOS', sub: 'Monedas virtuales — sin dinero real.', balance: 'Tu saldo', stake: 'Apuesta', confirm: 'Confirmar', won: 'GANADO', lost: 'PERDIDO', pending: 'EN CURSO', active: 'Abiertas', settled: 'Cerradas', noEvents: 'No hay eventos en vivo para apostar.', odds: 'Cuota', potential: 'Potencial' },
  fr: { title: 'PRONOSTICS ÉTHIQUES', sub: 'Coins virtuels — pas d\'argent réel.', balance: 'Ton solde', stake: 'Mise', confirm: 'Confirmer', won: 'GAGNÉ', lost: 'PERDU', pending: 'EN COURS', active: 'Ouvertes', settled: 'Fermées', noEvents: 'Aucun événement live pour parier.', odds: 'Cote', potential: 'Potentiel' },
  ar: { title: 'التنبؤات الأخلاقية', sub: 'عملات افتراضية — لا مال حقيقي.', balance: 'رصيدك', stake: 'رهان', confirm: 'تأكيد', won: 'فاز', lost: 'خسر', pending: 'جارٍ', active: 'مفتوحة', settled: 'مغلقة', noEvents: 'لا أحداث مباشرة للتنبؤ بها.', odds: 'احتمال', potential: 'المحتمل' },
  de: { title: 'ETHISCHE VORHERSAGEN', sub: 'Virtuelle Coins — kein echtes Geld.', balance: 'Dein Guthaben', stake: 'Einsatz', confirm: 'Bestätigen', won: 'GEWONNEN', lost: 'VERLOREN', pending: 'LAUFEND', active: 'Offen', settled: 'Abgeschlossen', noEvents: 'Keine Live-Events zum Wetten.', odds: 'Quote', potential: 'Potenzial' },
};

function BetRow({ bet }) {
  const resultColor = bet.result === 'won' ? 'text-green-400 border-green-500/30' :
                      bet.result === 'lost' ? 'text-red-400 border-red-500/30' :
                      'text-yellow-400 border-yellow-500/30';
  return (
    <div className="flex items-center justify-between p-3 border border-white/5 bg-white/2 text-sm">
      <div>
        <div className="font-orbitron text-[11px] text-fire-4">{bet.outcome?.replace(/_/g, ' ').toUpperCase()}</div>
        <div className="font-mono text-[9px] text-white/30">{bet.amount} {COIN_EMOJI} × {bet.odds}</div>
      </div>
      <span className={`font-mono text-[10px] px-2 py-0.5 border ${resultColor}`}>
        {bet.result === 'won' ? `+${bet.potential_winnings}` : bet.result === 'lost' ? `-${bet.amount}` : '?'}
      </span>
    </div>
  );
}

export default function EthicBettingPanel({ lang = 'it', userEmail }) {
  const L = LABELS[lang] || LABELS.it;
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('active');
  const [selectedOutcome, setSelectedOutcome] = useState(null);
  const [stakeInput, setStakeInput] = useState('50');
  const [isPlacing, setIsPlacing] = useState(false);

  const { data: bets = [] } = useQuery({
    queryKey: ['bets', userEmail],
    queryFn: () => base44.entities.Bet.filter({ user_email: userEmail }),
    enabled: !!userEmail,
    initialData: [],
  });

  const { data: events = [] } = useQuery({
    queryKey: ['live-events'],
    queryFn: () => base44.entities.Event.filter({ status: 'live' }),
    initialData: [],
    refetchInterval: 30000,
  });

  const activeBets = bets.filter(b => b.status === 'active');
  const settledBets = bets.filter(b => b.status === 'settled');
  const totalWon = settledBets.filter(b => b.result === 'won').reduce((s, b) => s + (b.potential_winnings || 0), 0);
  const totalLost = settledBets.filter(b => b.result === 'lost').reduce((s, b) => s + (b.amount || 0), 0);
  const balance = STARTING_COINS + totalWon - totalLost - activeBets.reduce((s, b) => s + b.amount, 0);

  // Mock odds for live events (in real app these come from EventMatchup)
  const liveOdds = [
    { id: 'team_a', label: '🔴 Team A', odds: 1.8 },
    { id: 'draw',   label: '🤝 Draw',   odds: 3.2 },
    { id: 'team_b', label: '🔵 Team B', odds: 2.1 },
  ];

  const stakeAmount = parseInt(stakeInput) || 0;
  const potential = selectedOutcome ? Math.floor(stakeAmount * selectedOutcome.odds) : 0;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="font-mono text-[9px] tracking-[5px] uppercase text-fire-3/40">{L.title}</p>
          <p className="font-rajdhani text-xs text-white/30">{L.sub}</p>
        </div>
        <div className="text-right border border-cyan-500/30 bg-cyan-500/5 px-4 py-2"
          style={{ clipPath: 'polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)' }}>
          <div className="font-mono text-[9px] text-cyan-400/50 uppercase">{L.balance}</div>
          <div className="font-orbitron font-bold text-lg text-cyan-400">{balance.toLocaleString()} {COIN_EMOJI}</div>
        </div>
      </div>

      {/* Live event quick-bet */}
      {events.length > 0 && (
        <div className="mb-5 p-4 border border-fire-3/20 bg-fire-3/5"
          style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))' }}>
          <div className="font-mono text-[9px] text-fire-3/50 mb-2 uppercase tracking-[3px]">🔴 LIVE — {events[0].title}</div>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {liveOdds.map(opt => (
              <button
                key={opt.id}
                onClick={() => setSelectedOutcome(selectedOutcome?.id === opt.id ? null : opt)}
                className={`p-2 border text-center transition-all ${
                  selectedOutcome?.id === opt.id
                    ? 'border-fire-3 bg-fire-3/15 shadow-[0_0_10px_rgba(255,102,0,0.2)]'
                    : 'border-white/10 hover:border-fire-3/40'
                }`}
              >
                <div className="font-rajdhani text-xs text-white/70">{opt.label}</div>
                <div className="font-orbitron font-bold text-sm text-fire-4">×{opt.odds}</div>
              </button>
            ))}
          </div>

          <AnimatePresence>
            {selectedOutcome && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden">
                <div className="flex gap-2 items-center mb-2">
                  <input
                    type="number"
                    value={stakeInput}
                    onChange={e => setStakeInput(e.target.value)}
                    min={10} max={balance}
                    className="cyber-input w-28 text-center font-orbitron"
                    placeholder="50"
                  />
                  <span className="font-mono text-xs text-white/30">{COIN_EMOJI}</span>
                  <div className="flex-1 text-right font-mono text-[10px] text-cyan-400">
                    {L.potential}: <span className="font-bold">{potential} {COIN_EMOJI}</span>
                  </div>
                </div>
                <button
                  disabled={isPlacing || stakeAmount <= 0 || stakeAmount > balance}
                  onClick={async () => {
                    if (!userEmail || !events[0] || stakeAmount <= 0 || stakeAmount > balance) return;
                    setIsPlacing(true);
                    await base44.entities.Bet.create({
                      event_id: events[0].id,
                      user_email: userEmail,
                      outcome: selectedOutcome.id,
                      amount: stakeAmount,
                      odds: selectedOutcome.odds,
                      potential_winnings: potential,
                      status: 'active',
                      result: 'pending',
                      placed_at: new Date().toISOString(),
                    });
                    queryClient.invalidateQueries({ queryKey: ['bets', userEmail] });
                    setSelectedOutcome(null);
                    setStakeInput('50');
                    setIsPlacing(false);
                  }}
                  className="btn-fire w-full text-[11px] tracking-[2px] py-2.5 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isPlacing ? '...' : `${L.confirm} — ${selectedOutcome.label}`}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {events.length === 0 && (
        <div className="text-center py-6 border border-white/5 mb-4">
          <p className="font-rajdhani text-white/30 text-sm">{L.noEvents}</p>
        </div>
      )}

      {/* Tabs: active / settled bets */}
      <div className="flex gap-1 mb-3">
        {['active', 'settled'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`font-mono text-[9px] uppercase tracking-[2px] px-4 py-1.5 border transition-all ${
              tab === t ? 'border-fire-3/50 bg-fire-3/10 text-fire-3' : 'border-white/10 text-white/30 hover:border-white/20'
            }`}>
            {t === 'active' ? L.active : L.settled} ({t === 'active' ? activeBets.length : settledBets.length})
          </button>
        ))}
      </div>

      <div className="space-y-1.5">
        {(tab === 'active' ? activeBets : settledBets).slice(0, 6).map(b => (
          <BetRow key={b.id} bet={b} />
        ))}
        {(tab === 'active' ? activeBets : settledBets).length === 0 && (
          <p className="font-rajdhani text-white/25 text-sm text-center py-4">—</p>
        )}
      </div>
    </motion.div>
  );
}