import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Shield, Crown, Star, Zap } from 'lucide-react';
import { useTranslation } from '../translations';

function TierCard({ tier, count = 0, t }) {
  const Icon = tier.icon;
  return (
    <div className={`p-4 border ${tier.border} ${tier.bg} relative overflow-hidden`}
      style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))' }}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon size={16} className={tier.color} />
          <div>
            <div className={`font-orbitron font-bold text-xs ${tier.color}`}>{tier.label}</div>
            {tier.id === 'living_legend' && (
              <div className="font-mono text-[7px] text-yellow-400/60 uppercase tracking-[1px]">Champion</div>
            )}
          </div>
        </div>
        {count > 0 && <span className={`font-orbitron text-sm font-black ${tier.color}`}>{count}</span>}
      </div>
      <div className="space-y-1.5">
        <div className="flex justify-between">
          <span className="font-mono text-[8px] text-white/25">{t('wag_p3_access')}</span>
          <span className="font-mono text-[8px] text-green-400">✓</span>
        </div>
        <div className="flex justify-between">
          <span className="font-mono text-[8px] text-white/25">{t('wag_p3_mult')}</span>
          <span className={`font-mono text-[8px] ${tier.color}`}>{tier.winRate}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-mono text-[8px] text-white/25">{t('wag_p3_benefit')}</span>
          <span className={`font-mono text-[8px] ${tier.color} text-right max-w-[120px]`}>{tier.benefit}</span>
        </div>
      </div>
    </div>
  );
}

export default function AthleteTokenEconomy({ lang = 'it' }) {
  const t = useTranslation(lang);
  const TIERS = [
    { id: 'rising_star',     label: t('wag_p3_tier1'), color: 'text-gray-400',   border: 'border-gray-400/25',   bg: 'bg-gray-400/5',   icon: Star,   winRate: '—',     benefit: t('wag_p3_b1') },
    { id: 'breakout_talent', label: t('wag_p3_tier2'), color: 'text-blue-400',   border: 'border-blue-400/25',   bg: 'bg-blue-400/5',   icon: Zap,    winRate: '+1.5x', benefit: t('wag_p3_b2') },
    { id: 'elite_performer', label: t('wag_p3_tier3'), color: 'text-purple-400', border: 'border-purple-500/30', bg: 'bg-purple-500/5', icon: Shield, winRate: '+2x',   benefit: t('wag_p3_b3') },
    { id: 'living_legend',   label: t('wag_p3_tier4'), color: 'text-yellow-400', border: 'border-yellow-400/40', bg: 'bg-yellow-400/8', icon: Crown,  winRate: '+3x',   benefit: t('wag_p3_b4') },
  ];

  const { data: user } = useQuery({ queryKey: ['current-user'], queryFn: () => base44.auth.me() });

  const { data: myTokens = [] } = useQuery({
    queryKey: ['my-token-economy', user?.email],
    queryFn: () => base44.entities.TokenOwnership.filter({ user_email: user.email }),
    enabled: !!user?.email,
    initialData: [],
  });

  const { data: athletes = [] } = useQuery({
    queryKey: ['athlete-tokens-market'],
    queryFn: () => base44.entities.AthleteToken.list('-current_price', 20),
    initialData: [],
  });

  const tierCounts = TIERS.reduce((acc, t) => {
    acc[t.id] = myTokens.filter(tok => tok.rarity === t.id).length;
    return acc;
  }, {});

  return (
    <div className="mb-8">
      {/* Section header */}
      <div className="mb-5">
        <p className="font-mono text-[9px] tracking-[5px] uppercase text-fire-3/40">PILLAR III</p>
        <h3 className="font-orbitron font-black text-xl text-fire-4 mt-0.5">{t('wag_p3_title')}</h3>
        <p className="font-rajdhani text-sm text-white/40 mt-1">{t('wag_p3_desc')}</p>
      </div>

      {/* NFT Minting Explanation */}
      <div className="mb-6 p-5 border border-fire-3/20 bg-fire-3/5"
        style={{ clipPath: 'polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))' }}>
        <div className="flex items-center gap-2 mb-3">
          <Zap size={14} className="text-fire-3" />
          <p className="font-orbitron text-xs font-bold text-fire-4 uppercase tracking-[2px]">Come funziona il Minting delle Card NFT</p>
        </div>
        <p className="font-rajdhani text-sm text-white/60 mb-4 leading-relaxed">
          Ogni Card NFT viene <span className="text-fire-4 font-bold">mintata automaticamente</span> al termine di ogni evento Street Dynamics, in base al <span className="text-fire-4 font-bold">punteggio accumulato dall'atleta</span> durante la competizione. Il sistema valuta performance, vittorie e momenti chiave per determinare la rarità della card assegnata.
        </p>

        {/* Minting flow steps */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          {[
            { n: '01', title: 'Performance Score', desc: 'L\'atleta accumula punti durante l\'evento: vittorie, trick riusciti, voti della giuria e engagement del pubblico.' },
            { n: '02', title: 'Calcolo Rarità', desc: 'Il sistema analizza il punteggio finale e lo confronta con la soglia di ogni tier per determinare la rarità della card.' },
            { n: '03', title: 'NFT Minted On-Chain', desc: 'La card viene mintata automaticamente sulla blockchain con i metadati dell\'atleta, del momento e delle statistiche.' },
          ].map((s, i) => (
            <div key={i} className="p-3 bg-black/40 border border-fire-3/10">
              <div className="font-orbitron font-black text-lg text-fire-3/20 mb-1">{s.n}</div>
              <div className="font-orbitron text-[10px] text-fire-4/70 mb-1 uppercase tracking-[1px]">{s.title}</div>
              <div className="font-rajdhani text-xs text-white/40">{s.desc}</div>
            </div>
          ))}
        </div>

        {/* Score thresholds */}
        <div className="border-t border-fire-3/10 pt-4">
          <p className="font-mono text-[8px] uppercase tracking-[3px] text-fire-3/40 mb-3">Soglie di Punteggio → Rarità Card</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { range: '0 – 499 pt', label: 'Rising Star', color: 'text-gray-400', border: 'border-gray-400/20', desc: 'Partecipazione' },
              { range: '500 – 999 pt', label: 'Breakout Talent', color: 'text-blue-400', border: 'border-blue-400/25', desc: 'Top 50%' },
              { range: '1000 – 1999 pt', label: 'Elite Performer', color: 'text-purple-400', border: 'border-purple-500/30', desc: 'Top 20%' },
              { range: '2000+ pt', label: 'Living Legend', color: 'text-yellow-400', border: 'border-yellow-400/40', desc: 'Campione' },
            ].map((r, i) => (
              <div key={i} className={`p-2.5 border ${r.border} bg-black/30 text-center`}>
                <div className={`font-mono text-[8px] ${r.color} mb-1`}>{r.range}</div>
                <div className={`font-orbitron text-[9px] font-bold ${r.color}`}>{r.label}</div>
                <div className="font-mono text-[7px] text-white/25 mt-0.5">{r.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tier grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {TIERS.map((tier, idx) => (
          <motion.div key={tier.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.07 }}>
            <TierCard tier={tier} count={tierCounts[tier.id]} t={t} />
          </motion.div>
        ))}
      </div>

      {/* On-chain metadata notice */}
      <div className="px-4 py-3 border border-white/5 bg-white/[0.01]">
        <p className="font-mono text-[7px] text-white/20">
          Card metadata: athlete stats · tournament history · performance score · win rate · event moment · rarity tier
          — aggiornati on-chain ad ogni ciclo di torneo tramite oracle transaction
        </p>
      </div>
    </div>
  );
}