import React, { useState } from 'react';
import { useTranslation } from '../translations';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const TIERS = [
  { id: 'rookie',       xp: 0,     label: 'Rookie',       color: 'text-white/40',   border: 'border-white/10',    icon: '⚪', cashback: 0,    perks: ['Accesso base alla community SD'] },
  { id: 'enthusiast',   xp: 500,   label: 'Enthusiast',   color: 'text-fire-4',     border: 'border-fire-4/40',   icon: '🔥', cashback: 1,    perks: ['Redeem XP → EUR (1%)', 'Badge esclusivo profilo'] },
  { id: 'superfan',     xp: 2000,  label: 'Superfan',     color: 'text-fire-5',     border: 'border-fire-5/40',   icon: '⚡', cashback: 1.5,  perks: ['Merch SD gratuito', 'Cashback 1.5%', 'Early access eventi'] },
  { id: 'legend',       xp: 5000,  label: 'Legend',       color: 'text-cyan-400',   border: 'border-cyan-400/40', icon: '👑', cashback: 2,    perks: ['VIP Pass evento annuale', 'Cashback 2%', 'Early access NFT drops'] },
  { id: 'hall_of_fame', xp: 10000, label: 'Hall of Fame', color: 'text-purple-400', border: 'border-purple-400/40', icon: '💎', cashback: 3,  perks: ['Accesso backstage', 'Cashback 3%', 'Card 1-di-1 esclusiva', 'Governance voting'] },
];

const XP_SOURCES = [
  { icon: '🎟️', label: 'Registrazione evento', xp: '+50 XP' },
  { icon: '✅', label: 'Check-in live all\'evento', xp: '+100 XP' },
  { icon: '🗳️', label: 'Voto su atleta', xp: '+10 XP' },
  { icon: '📱', label: 'Social share evento', xp: '+25 XP' },
  { icon: '⚡', label: 'Vinci sfida fan', xp: '+150 XP' },
  { icon: '🃏', label: 'Tieni card fino a snapshot', xp: '+200 XP' },
  { icon: '🏆', label: 'Milestone / Achievement', xp: '+20–200 XP' },
  { icon: '👥', label: 'Referral confermato', xp: '+75 XP' },
];

export default function WageringHub({ lang = 'it' }) {
  const t = useTranslation(lang);
  const [activeTab, setActiveTab] = useState('earn');

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: fanStatuses = [] } = useQuery({
    queryKey: ['fan-status-hub', user?.email],
    queryFn: () => base44.entities.FanStatus.filter({ user_email: user.email }),
    enabled: !!user,
    initialData: [],
  });

  const fanStatus = fanStatuses[0];
  const totalXP = fanStatus?.total_xp || 0;
  const currentTierData = TIERS.find(t => t.id === (fanStatus?.current_tier || 'rookie')) || TIERS[0];
  const currentIdx = TIERS.indexOf(currentTierData);
  const nextTier = TIERS[currentIdx + 1] || null;
  const progress = fanStatus?.next_tier_progress || 0;

  const tabs = [
    { id: 'earn',   label: '💰 Guadagna XP' },
    { id: 'tiers',  label: '🏆 Livelli & Premi' },
    { id: 'wager',  label: '⚡ Sfide Fan' },
  ];

  return (
    <div className="mb-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <p className="font-mono text-[9px] tracking-[5px] uppercase text-fire-3/40">PILLAR I</p>
          <h3 className="font-orbitron font-black text-xl text-fire-4 mt-0.5">{t('wag_p1_title')}</h3>
          <p className="font-rajdhani text-sm text-white/40 mt-1">XP è la tua unica valuta — guadagni, scala livelli, ottieni premi reali</p>
        </div>
        {user && (
          <div className="text-right flex-shrink-0">
            <div className="font-orbitron font-black text-3xl text-fire-5 leading-none">{totalXP.toLocaleString()}</div>
            <div className="font-mono text-[8px] text-white/30 uppercase tracking-[2px]">XP totali</div>
            <div className={`font-mono text-[9px] mt-1 ${currentTierData.color}`}>
              {currentTierData.icon} {currentTierData.label}
            </div>
          </div>
        )}
      </div>

      {/* XP Progress Bar */}
      {user && (
        <div className="mb-6 p-4 border border-fire-3/15 bg-black/40"
          style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))' }}>
          {nextTier ? (
            <>
              <div className="flex justify-between items-center mb-2">
                <span className={`font-mono text-[9px] uppercase tracking-[1px] ${currentTierData.color}`}>
                  {currentTierData.icon} {currentTierData.label}
                </span>
                <span className="font-mono text-[9px] text-white/30">
                  {totalXP.toLocaleString()} / {nextTier.xp.toLocaleString()} XP
                </span>
                <span className={`font-mono text-[9px] uppercase tracking-[1px] ${nextTier.color}`}>
                  {nextTier.icon} {nextTier.label}
                </span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-fire-3 to-fire-5 rounded-full transition-all duration-700"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="font-mono text-[8px] text-white/20 mt-1.5 text-center">
                {(nextTier.xp - totalXP).toLocaleString()} XP al livello successivo
              </p>
            </>
          ) : (
            <div className="text-center">
              <span className="font-orbitron text-sm text-purple-400">💎 HALL OF FAME — Livello Massimo Raggiunto</span>
            </div>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-5">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`font-orbitron text-[9px] tracking-[1px] uppercase px-3 py-2 border transition-all ${
              activeTab === tab.id
                ? 'border-fire-3/60 bg-fire-3/10 text-fire-4'
                : 'border-white/10 text-white/30 hover:border-white/20'
            }`}
            style={{ clipPath: 'polygon(5px 0%, 100% 0%, calc(100% - 5px) 100%, 0% 100%)' }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Earn */}
      {activeTab === 'earn' && (
        <div>
          <p className="font-mono text-[8px] uppercase tracking-[2px] text-white/25 mb-3">COME GUADAGNI XP</p>
          <div className="space-y-1.5">
            {XP_SOURCES.map((s, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 border border-white/5 bg-white/[0.02] hover:border-fire-3/20 transition-all"
                style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))' }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{s.icon}</span>
                  <span className="font-rajdhani text-sm text-white/60">{s.label}</span>
                </div>
                <span className="font-orbitron text-xs font-bold text-fire-5 flex-shrink-0">{s.xp}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Tiers */}
      {activeTab === 'tiers' && (
        <div className="space-y-3">
          {TIERS.map((tier) => {
            const isCurrent = tier.id === (fanStatus?.current_tier || 'rookie');
            const isUnlocked = totalXP >= tier.xp;
            return (
              <div
                key={tier.id}
                className={`p-4 border transition-all ${
                  isCurrent
                    ? `${tier.border} bg-white/[0.04]`
                    : isUnlocked
                    ? 'border-white/10 bg-white/[0.01]'
                    : 'border-white/5 opacity-40'
                }`}
                style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))' }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{tier.icon}</span>
                    <div>
                      <div className={`font-orbitron font-bold text-sm ${tier.color}`}>{tier.label}</div>
                      <div className="font-mono text-[8px] text-white/30">{tier.xp.toLocaleString()} XP — Cashback {tier.cashback}%</div>
                    </div>
                  </div>
                  {isCurrent && (
                    <span className={`font-mono text-[8px] px-2 py-0.5 border ${tier.border} ${tier.color} uppercase`}>
                      CORRENTE
                    </span>
                  )}
                  {!isCurrent && isUnlocked && (
                    <span className="font-mono text-[8px] text-green-400/60">✓</span>
                  )}
                </div>
                <div className="space-y-1">
                  {tier.perks.map((perk, j) => (
                    <div
                      key={j}
                      className={`flex items-center gap-2 font-rajdhani text-xs ${
                        isUnlocked ? 'text-white/55' : 'text-white/20'
                      }`}
                    >
                      <span className={isUnlocked ? tier.color : 'text-white/20'}>→</span>
                      {perk}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab: Sfide Fan */}
      {activeTab === 'wager' && (
        <div>
          <div
            className="mb-5 p-4 border border-fire-3/20 bg-fire-3/5"
            style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))' }}
          >
            <p className="font-orbitron text-xs text-fire-4 mb-1">⚡ SFIDE TRA FAN — XP ECONOMY</p>
            <p className="font-rajdhani text-sm text-white/40">
              Usa i tuoi XP per sfidare altri fan. Prevedi il risultato corretto e vinci gli XP dell'avversario + 50% bonus. Nessuna valuta reale.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-0 mb-5">
            {[
              { n: '01', title: 'Guadagna XP',  d: 'Partecipa ad eventi, vota, condividi — accumuli XP' },
              { n: '02', title: 'Sfida un fan', d: 'Scommetti i tuoi XP su chi vince una gara SD' },
              { n: '03', title: 'XP in escrow', d: 'Gli XP di entrambi vengono bloccati fino all\'esito ufficiale' },
              { n: '04', title: 'Il vincitore',  d: 'Chi aveva ragione riceve tutti gli XP + 50% bonus dalla pool community' },
            ].map((s, i) => (
              <div
                key={i}
                className="p-4 bg-black/30 border border-fire-3/8 border-r-0 last:border-r"
              >
                <div className="font-orbitron font-black text-xl text-fire-3/15 mb-1">{s.n}</div>
                <div className="font-orbitron text-xs text-fire-4/60 mb-1">{s.title}</div>
                <div className="font-rajdhani text-xs text-white/30">{s.d}</div>
              </div>
            ))}
          </div>

          <div className="p-3 border border-dashed border-white/8 text-center">
            <p className="font-mono text-[8px] text-white/25">
              🚀 Sistema sfide live — disponibile con il prossimo aggiornamento piattaforma
            </p>
          </div>
        </div>
      )}
    </div>
  );
}