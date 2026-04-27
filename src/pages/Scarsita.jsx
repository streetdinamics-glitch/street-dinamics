import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import CyberOverlays from '../components/cyber/CyberOverlays';
import Navbar from '../components/cyber/Navbar';
import Footer from '../components/cyber/Footer';
import FireRule from '../components/cyber/FireRule';
import { useLang } from '../components/useLang';

const TIERS = [
  { name: 'Common', level: '🏙️ Regionale', count: 100000, label: '100.000', price: '~1€', drop: 'Nessuno', color: '#888888', barH: 100, invest10: '10€' },
  { name: 'Uncommon', level: '🇮🇹 Nazionale', count: 10000, label: '10.000', price: '~8€', drop: '🥉 Bronze Clip', color: '#22c55e', barH: 20, invest10: '80€' },
  { name: 'Rare', level: '🌍 Continentale', count: 1000, label: '1.000', price: '~100€', drop: '🥈 Silver Clip HD', color: '#3b82f6', barH: 6, invest10: '1.000€' },
  { name: 'Legendary', level: '🌐 Internazionale', count: 100, label: '100', price: '~1.200€', drop: '⭐ Legendary Art', color: '#eab308', barH: 1.5, invest10: '12.000€' },
];

const MULTIPLIERS = [
  { label: 'Regionale', mult: 1, color: 'text-gray-400' },
  { label: 'Nazionale', mult: 8, color: 'text-green-400' },
  { label: 'Continentale', mult: 100, color: 'text-blue-400' },
  { label: 'Internazionale', mult: 1200, color: 'text-yellow-400' },
];

function AnimatedBar({ pct, color, delay }) {
  const [h, setH] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setH(pct), delay);
    return () => clearTimeout(t);
  }, [pct, delay]);
  return (
    <div className="flex flex-col items-center justify-end" style={{ height: 200 }}>
      <div
        className="w-full transition-all duration-1000 ease-out rounded-t"
        style={{ height: `${h}%`, backgroundColor: color, minHeight: 3 }}
      />
    </div>
  );
}

const SNAPSHOT_STEPS = [
  { icon: '⚔️', label: 'Torneo in corso' },
  { icon: '🏆', label: 'Vittoria finale' },
  { icon: '📸', label: 'Snapshot on-chain' },
  { icon: '🎁', label: 'Drop automatico' },
];

export default function Scarsita() {
  const [lang, setLang] = useLang();
  const [cards, setCards] = useState(10);
  const [snapshotStep, setSnapshotStep] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setSnapshotStep(s => (s + 1) % (SNAPSHOT_STEPS.length + 1));
    }, 1200);
    return () => clearInterval(intervalRef.current);
  }, []);

  return (
    <div className="relative min-h-screen bg-cyber-void text-[var(--text-main)]">
      <CyberOverlays />
      <Navbar onScrollTo={() => {}} lang={lang} onLangSwitch={setLang} onProfileClick={() => {}} />

      <div className="pt-[80px] section-container max-w-4xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <p className="font-mono text-[10px] tracking-[7px] uppercase text-fire-3/40 mb-3">IL SISTEMA</p>
          <h1 className="heading-fire text-[clamp(36px,7vw,72px)] font-black leading-none mb-4">SCARSITÀ &<br />SIMULATORE</h1>
          <p className="font-rajdhani text-lg text-white/40 max-w-xl mx-auto">
            Ogni livello superato → 10× meno card. Automaticamente più rari. Automaticamente più preziosi.
          </p>
        </motion.div>

        {/* Scarcity bars */}
        <div className="mb-12">
          <p className="font-mono text-[10px] tracking-[5px] uppercase text-fire-3/40 mb-6">VISUALIZZAZIONE SCARSITÀ PROPORZIONALE</p>
          <div className="grid grid-cols-4 gap-4">
            {TIERS.map((t, i) => (
              <div key={t.name} className="flex flex-col items-center">
                <AnimatedBar pct={t.barH} color={t.color} delay={i * 200} />
                <div className="mt-3 text-center">
                  <div className="font-orbitron font-bold text-sm" style={{ color: t.color }}>{t.name}</div>
                  <div className="font-mono text-[10px] text-white/40">{t.label}</div>
                  <div className="font-mono text-[11px] text-white/60 mt-1">{t.price}</div>
                </div>
              </div>
            ))}
          </div>
          <p className="font-mono text-[10px] text-white/20 text-center mt-4">Le barre sono proporzionali al numero reale di card — non standardizzate</p>
        </div>

        {/* Full table */}
        <div className="mb-12 overflow-x-auto">
          <p className="font-mono text-[10px] tracking-[5px] uppercase text-fire-3/40 mb-4">TABELLA COMPLETA</p>
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-fire-3/20">
                {['Livello', 'Card', 'Prezzo', 'NFT Drop', '10 card al lancio'].map(h => (
                  <th key={h} className="py-2 px-3 text-left font-mono text-[10px] uppercase tracking-[1px] text-fire-3/50">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TIERS.map((t, i) => (
                <tr key={t.name} className={`border-b border-white/5 ${i % 2 === 0 ? 'bg-white/2' : ''}`}>
                  <td className="py-3 px-3 font-rajdhani text-white/60">{t.level}</td>
                  <td className="py-3 px-3 font-orbitron text-sm font-bold" style={{ color: t.color }}>{t.label} {t.name}</td>
                  <td className="py-3 px-3 font-mono text-sm text-white/70">{t.price}</td>
                  <td className="py-3 px-3 font-rajdhani text-sm text-white/60">{t.drop}</td>
                  <td className="py-3 px-3 font-orbitron text-sm text-fire-3">{t.invest10}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Simulator */}
        <div className="mb-12 border border-fire-3/20 bg-fire-3/5 p-6" style={{ clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))' }}>
          <p className="font-mono text-[10px] tracking-[5px] uppercase text-fire-3/40 mb-2">SIMULATORE INVESTIMENTO</p>
          <div className="flex items-center justify-between mb-1">
            <span className="font-rajdhani text-white/60">Quante card compri al lancio?</span>
            <span className="font-orbitron font-bold text-2xl text-fire-3">{cards}</span>
          </div>
          <input
            type="range" min={1} max={200} value={cards}
            onChange={e => setCards(Number(e.target.value))}
            className="w-full mb-6 accent-orange-500"
          />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {MULTIPLIERS.map(m => {
              const value = cards * m.mult;
              const profit = value - cards;
              return (
                <div key={m.label} className="p-3 border border-white/10 bg-black/40">
                  <div className={`font-orbitron font-bold text-sm ${m.color} mb-1`}>{m.label}</div>
                  <div className="font-mono text-lg font-bold text-white">€{value.toLocaleString()}</div>
                  {profit > 0 && (
                    <div className="font-mono text-[10px] text-green-400">+€{profit.toLocaleString()} profitto</div>
                  )}
                  <div className="font-mono text-[9px] text-white/30 mt-1">×{m.mult}</div>
                </div>
              );
            })}
          </div>
          <p className="font-mono text-[9px] text-white/20 mt-4">Basato sul sistema di scarsità reale: 100k → 10k → 1k → 100 card</p>
        </div>

        {/* Snapshot animation */}
        <div className="mb-10">
          <p className="font-mono text-[10px] tracking-[5px] uppercase text-fire-3/40 mb-5">SNAPSHOT — COME FUNZIONA</p>
          <div className="grid grid-cols-4 gap-3 mb-6">
            {SNAPSHOT_STEPS.map((s, i) => (
              <div key={i} className={`p-4 border text-center transition-all duration-500 ${
                snapshotStep > i
                  ? 'border-fire-3/60 bg-fire-3/15 scale-105'
                  : 'border-white/10 bg-white/3'
              }`}>
                <div className="text-2xl mb-2">{s.icon}</div>
                <div className={`font-mono text-[10px] uppercase tracking-[1px] transition-colors ${snapshotStep > i ? 'text-fire-3' : 'text-white/30'}`}>{s.label}</div>
              </div>
            ))}
          </div>

          <div className="p-5 border border-yellow-500/30 bg-yellow-500/5">
            <p className="font-rajdhani text-base text-yellow-200">
              <strong>Storia di Marco:</strong> compra 10 card a 1€ → le tiene → atleta vince internazionale → riceve automaticamente 10 Legendary Card. Senza fare nulla.
            </p>
          </div>
        </div>
      </div>

      <FireRule />
      <Footer lang={lang} />
    </div>
  );
}