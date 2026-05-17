import React from 'react';
import { motion } from 'framer-motion';
import { Globe, Map, Flag, Trophy, Info } from 'lucide-react';

const LEVELS = [
  {
    id: 'regional',
    label: 'REGIONALE',
    icon: Map,
    color: 'text-gray-400',
    border: 'border-gray-400/30',
    bg: 'bg-gray-400/5',
    card: 'Rising Star',
    cardColor: 'text-gray-400',
    supply: '100.000 card',
    desc: 'L\'atleta partecipa a tornei regionali certificati SD. Al completamento del torneo, viene mintata una card NFT "Rising Star" con i dati reali della performance.',
  },
  {
    id: 'national',
    label: 'NAZIONALE',
    icon: Flag,
    color: 'text-blue-400',
    border: 'border-blue-400/30',
    bg: 'bg-blue-400/5',
    card: 'Breakout Talent',
    cardColor: 'text-blue-400',
    supply: '10.000 card',
    desc: 'L\'atleta accede alla fase nazionale. La card si aggiorna a "Breakout Talent": supply ridotta, statistiche aggiornate, valore di mercato in crescita.',
  },
  {
    id: 'continental',
    label: 'CONTINENTALE',
    icon: Globe,
    color: 'text-purple-400',
    border: 'border-purple-500/35',
    bg: 'bg-purple-500/5',
    card: 'Elite Performer',
    cardColor: 'text-purple-400',
    supply: '1.000 card',
    desc: 'L\'atleta compete a livello continentale. Viene mintata la card "Elite Performer" in edizione limitatissima, con accesso prioritario a eventi e revenue sharing sponsorship.',
  },
  {
    id: 'world',
    label: 'MONDIALE',
    icon: Trophy,
    color: 'text-yellow-400',
    border: 'border-yellow-400/40',
    bg: 'bg-yellow-400/8',
    card: 'Living Legend',
    cardColor: 'text-yellow-400',
    supply: '100 card',
    desc: 'Solo i campioni mondiali SD ottengono la card "Living Legend". Ultra-rara, include voto di governance, royalty sui tornei futuri e accesso VIP lifetime agli eventi.',
  },
];

export default function AthleteTokenEconomy({ lang = 'it' }) {
  return (
    <div className="mb-8">
      {/* Section header */}
      <div className="mb-5">
        <p className="font-mono text-[9px] tracking-[5px] uppercase text-fire-3/40">PILLAR III</p>
        <h3 className="font-orbitron font-black text-xl text-fire-4 mt-0.5">NFT CARD ECONOMY</h3>
        <p className="font-rajdhani text-sm text-white/40 mt-1">
          Le card NFT degli atleti vengono mintate automaticamente in base al livello del torneo raggiunto — più avanza l'atleta, più la card diventa rara e preziosa.
        </p>
      </div>

      {/* Info banner */}
      <div className="mb-5 flex items-start gap-3 px-4 py-3 border border-fire-3/20 bg-fire-3/5"
        style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))' }}>
        <Info size={14} className="text-fire-3/60 mt-0.5 shrink-0" />
        <p className="font-rajdhani text-sm text-white/50">
          Il minting avviene <span className="text-fire-4 font-bold">al termine di ogni torneo ufficiale SD</span>. La card registra le statistiche reali della performance e viene aggiornata ad ogni avanzamento di livello. I fan possono acquistare le card prima che l'atleta avanzi — il valore cresce con lui.
        </p>
      </div>

      {/* Tournament level cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {LEVELS.map((level, idx) => {
          const Icon = level.icon;
          return (
            <motion.div key={level.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.07 }}>
              <div className={`p-4 border ${level.border} ${level.bg} h-full flex flex-col`}
                style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))' }}>
                {/* Level badge */}
                <div className="flex items-center gap-2 mb-3">
                  <Icon size={14} className={level.color} />
                  <span className={`font-orbitron font-black text-[10px] tracking-[2px] ${level.color}`}>{level.label}</span>
                </div>

                {/* Card name */}
                <div className="mb-3 pb-3 border-b border-white/8">
                  <div className="font-mono text-[8px] text-white/25 uppercase mb-0.5">NFT Card</div>
                  <div className={`font-orbitron font-bold text-sm ${level.cardColor}`}>{level.card}</div>
                </div>

                {/* Stats */}
                <div className="space-y-1.5 mb-3">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-[8px] text-white/25">Supply</span>
                    <span className={`font-mono text-[8px] font-bold ${level.color}`}>{level.supply}</span>
                  </div>
                </div>

                {/* Description */}
                <p className="font-rajdhani text-xs text-white/35 leading-relaxed mt-auto">{level.desc}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Flow explanation */}
      <div className="border border-white/8 bg-black/30 p-4"
        style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))' }}>
        <div className="font-mono text-[9px] uppercase tracking-[3px] text-fire-3/40 mb-3">Come funziona il minting</div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-0">
          {[
            { n: '01', t: 'Torneo SD', d: 'L\'atleta si registra e compete in un torneo ufficiale Street Dinamics' },
            { n: '02', t: 'Performance', d: 'Le statistiche reali (vittorie, punteggi, discipline) vengono registrate on-chain' },
            { n: '03', t: 'Minting', d: 'A fine torneo, la card NFT viene mintata automaticamente con i dati aggiornati' },
            { n: '04', t: 'Upgrade', d: 'Se l\'atleta avanza di livello, la card si aggiorna a rarità superiore — chi la possiede beneficia dell\'aumento di valore' },
          ].map((s, i) => (
            <div key={i} className="p-3 border border-fire-3/8 border-r-0 last:border-r">
              <div className="font-orbitron font-black text-xl text-fire-3/12 mb-1">{s.n}</div>
              <div className="font-orbitron text-[10px] text-fire-4/60 mb-1">{s.t}</div>
              <div className="font-rajdhani text-xs text-white/30">{s.d}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}