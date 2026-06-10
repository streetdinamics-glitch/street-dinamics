import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import CyberOverlays from '../components/cyber/CyberOverlays';
import Navbar from '../components/cyber/Navbar';
import Footer from '../components/cyber/Footer';
import FireRule from '../components/cyber/FireRule';
import PageNav from '../components/cyber/PageNav';
import { useLang } from '../components/useLang';

const TIERS = [
  { name: 'Common',    level: '🏙️ Regionale',     label: '100.000', price: 1,    mult: 1,    drop: '—',              color: '#888888', colorClass: 'text-gray-400',   barH: 100 },
  { name: 'Uncommon',  level: '🇮🇹 Nazionale',     label: '10.000',  price: 8,    mult: 8,    drop: '🥉 Bronze Clip', color: '#22c55e', colorClass: 'text-green-400',  barH: 20  },
  { name: 'Rare',      level: '🌍 Continentale',   label: '1.000',   price: 100,  mult: 100,  drop: '🥈 Silver Clip', color: '#3b82f6', colorClass: 'text-blue-400',   barH: 6   },
  { name: 'Legendary', level: '🌐 Internazionale', label: '100',     price: 1200, mult: 1200, drop: '⭐ Legendary Art',color: '#eab308', colorClass: 'text-yellow-400', barH: 1.5 },
];

const PRICE_LABELS = ['€1', '~€8', '~€100', '~€1.200'];
const INVEST_10 = ['€10', '€80', '€1.000', '€12.000'];

const SNAPSHOT_STEPS = ['⚔️ TORNEO IN CORSO', '🏆 VITTORIA FINALE', '📸 SNAPSHOT ON-CHAIN', '🎁 DROP AUTOMATICO'];

function AnimatedBar({ pct, color, delay }) {
  const [h, setH] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setH(pct), delay);
    return () => clearTimeout(t);
  }, [pct, delay]);
  return (
    <div className="flex flex-col items-center justify-end" style={{ height: 200 }}>
      <div className="w-full transition-all duration-1000 ease-out" style={{ height: `${h}%`, backgroundColor: color, minHeight: 3 }} />
    </div>
  );
}

export default function Scarsita() {
  const [lang, setLang] = useLang();
  const [cards, setCards] = useState(10);
  const [selectedTier, setSelectedTier] = useState(3);
  const [snapshotStep, setSnapshotStep] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => setSnapshotStep(s => (s + 1) % (SNAPSHOT_STEPS.length + 1)), 1200);
    return () => clearInterval(intervalRef.current);
  }, []);

  const tier = TIERS[selectedTier];
  const invested = cards * tier.price;
  const bestCase = cards * tier.mult;
  const profit = bestCase - invested;

  return (
    <div className="relative min-h-screen bg-cyber-void text-[var(--text-main)]">
      <CyberOverlays />
      <Navbar onScrollTo={() => {}} lang={lang} onLangSwitch={setLang} onProfileClick={() => {}} />

      <div className="pt-[80px] section-container max-w-4xl">

        {/* ─── HEADER ─── */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <p className="font-mono text-[10px] tracking-[7px] uppercase text-fire-3/40 mb-3">// IL SISTEMA //</p>
          <h1 className="heading-fire text-[clamp(36px,7vw,72px)] font-black leading-none mb-6">
            LA MATEMATICA<br />DELLA SCARSITÀ
          </h1>
          <p className="font-rajdhani text-xl text-white/40 max-w-md mx-auto leading-relaxed">
            1 card. Due destini.<br />
            <span className="text-fire-3/70">Solo uno conta.</span>
          </p>
        </motion.div>

        {/* ─── BARS ─── */}
        <div className="mb-16">
          <p className="font-mono text-[9px] tracking-[5px] uppercase text-fire-3/30 mb-8">// OFFERTA TOTALE — PROPORZIONALE REALE //</p>
          <div className="grid grid-cols-4 gap-4">
            {TIERS.map((t, i) => (
              <div key={t.name} className="flex flex-col items-center">
                <AnimatedBar pct={t.barH} color={t.color} delay={i * 200} />
                <div className="mt-3 text-center">
                  <div className="font-orbitron font-black text-sm" style={{ color: t.color }}>{t.name}</div>
                  <div className="font-mono text-[10px] text-white/25">{t.label}</div>
                  <div className="font-mono text-sm text-white/60 mt-1 font-bold">{PRICE_LABELS[i]}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/5" />
            <p className="font-mono text-[9px] text-white/15 uppercase tracking-[2px] text-center">
              ogni livello → ×10 meno card → ×10 più raro → ×10 più prezioso
            </p>
            <div className="h-px flex-1 bg-white/5" />
          </div>
        </div>

        {/* ─── TABLE ─── */}
        <div className="mb-16 overflow-x-auto">
          <p className="font-mono text-[9px] tracking-[5px] uppercase text-fire-3/30 mb-4">// TABELLA COMPLETA //</p>
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-fire-3/20">
                {['Livello', 'Card Totali', 'Prezzo', 'NFT Drop', '10 Card al lancio'].map(h => (
                  <th key={h} className="py-3 px-3 text-left font-mono text-[9px] uppercase tracking-[2px] text-fire-3/40">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TIERS.map((t, i) => (
                <tr key={t.name} className="border-b border-white/5 hover:bg-white/[0.015] transition-all">
                  <td className="py-4 px-3 font-rajdhani text-white/40">{t.level}</td>
                  <td className="py-4 px-3 font-orbitron text-sm font-black" style={{ color: t.color }}>{t.label}</td>
                  <td className="py-4 px-3 font-mono text-sm text-white/60">{PRICE_LABELS[i]}</td>
                  <td className="py-4 px-3 font-rajdhani text-sm text-white/50">{t.drop}</td>
                  <td className="py-4 px-3 font-orbitron text-sm font-black text-fire-3">{INVEST_10[i]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ─── SIMULATOR ─── */}
        <div className="mb-16">
          <p className="font-mono text-[9px] tracking-[5px] uppercase text-fire-3/30 mb-6">// SIMULATORE SCENARI //</p>

          {/* Tier buttons */}
          <div className="grid grid-cols-4 gap-2 mb-6">
            {TIERS.map((t, i) => (
              <button
                key={t.name}
                onClick={() => setSelectedTier(i)}
                className={`py-2 px-1 border transition-all font-orbitron text-[9px] font-bold uppercase tracking-[1px] ${
                  selectedTier === i
                    ? 'bg-fire-3/10 text-fire-4'
                    : 'border-white/8 text-white/20 hover:border-white/20'
                }`}
                style={{
                  clipPath: 'polygon(5px 0%, 100% 0%, calc(100% - 5px) 100%, 0% 100%)',
                  borderColor: selectedTier === i ? t.color : undefined,
                  color: selectedTier === i ? t.color : undefined,
                }}
              >
                {t.name}
              </button>
            ))}
          </div>

          {/* Slider */}
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[10px] uppercase tracking-[2px] text-white/30">Card acquistate al lancio</span>
            <span className="font-orbitron font-black text-3xl text-fire-3">{cards}</span>
          </div>
          <input type="range" min={1} max={200} value={cards} onChange={e => setCards(Number(e.target.value))}
            className="w-full mb-8 accent-orange-500" />

          {/* DUAL SCENARIO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

            {/* BEST CASE */}
            <motion.div
              key={`best-${selectedTier}-${cards}`}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative border border-green-500/30 bg-green-500/[0.04] p-6 overflow-hidden"
              style={{ clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))' }}
            >
              <div className="absolute top-3 right-3 font-mono text-[8px] tracking-[3px] text-green-500/30 uppercase">BEST CASE</div>
              <p className="font-mono text-[9px] uppercase tracking-[2px] text-green-400/50 mb-1">Atleta vince → {tier.level}</p>
              <p className="font-mono text-[9px] text-white/15 mb-5">{cards} card × ×{tier.mult.toLocaleString()} moltiplicatore</p>
              <div className="font-orbitron font-black leading-none mb-2" style={{ fontSize: 'clamp(36px, 5vw, 52px)', color: '#4ade80' }}>
                €{bestCase.toLocaleString()}
              </div>
              <div className="font-mono text-sm text-green-400/50">
                +€{profit.toLocaleString()} profitto netto
              </div>
              <div className="mt-5 pt-4 border-t border-green-500/15 grid grid-cols-2 gap-2">
                <div>
                  <p className="font-mono text-[8px] text-white/15">Investito</p>
                  <p className="font-mono text-xs text-white/40">€{invested.toLocaleString()}</p>
                </div>
                <div>
                  <p className="font-mono text-[8px] text-white/15">Moltiplicatore</p>
                  <p className="font-mono text-xs text-green-400/50">×{tier.mult.toLocaleString()}</p>
                </div>
              </div>
            </motion.div>

            {/* WORST CASE */}
            <motion.div
              key={`worst-${selectedTier}-${cards}`}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative border border-red-500/30 bg-red-500/[0.04] p-6 overflow-hidden"
              style={{ clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))' }}
            >
              <div className="absolute top-3 right-3 font-mono text-[8px] tracking-[3px] text-red-500/30 uppercase">WORST CASE</div>
              <p className="font-mono text-[9px] uppercase tracking-[2px] text-red-400/50 mb-1">Vendi prima della vittoria</p>
              <p className="font-mono text-[9px] text-white/15 mb-5">Drop ricevuto: <span className="text-red-400 font-bold">ZERO</span></p>
              <div className="font-orbitron font-black leading-none mb-2" style={{ fontSize: 'clamp(36px, 5vw, 52px)', color: '#f87171' }}>
                €0
              </div>
              <div className="font-mono text-sm text-red-400/50">
                Drop perso. Per sempre.
              </div>
              <div className="mt-5 pt-4 border-t border-red-500/15 grid grid-cols-2 gap-2">
                <div>
                  <p className="font-mono text-[8px] text-white/15">La card</p>
                  <p className="font-mono text-xs text-white/40">Vendibile sul mercato</p>
                </div>
                <div>
                  <p className="font-mono text-[8px] text-white/15">Il drop storico</p>
                  <p className="font-mono text-xs text-red-400/50 font-bold">Irrecuperabile</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Commitment row */}
          <div className="border border-white/8 bg-white/[0.015] p-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div>
                <p className="font-mono text-[8px] uppercase tracking-[3px] text-white/20 mb-1">HOLDING MINIMO</p>
                <p className="font-orbitron font-bold text-sm text-white/50">5–10 anni</p>
              </div>
              <div className="sm:border-x border-white/8">
                <p className="font-mono text-[8px] uppercase tracking-[3px] text-white/20 mb-1">TIMELINE CIRCUITO</p>
                <p className="font-orbitron font-bold text-sm text-white/50">Regionale → Internazionale</p>
              </div>
              <div>
                <p className="font-mono text-[8px] uppercase tracking-[3px] text-white/20 mb-1">GARANZIA PROFITTO</p>
                <p className="font-orbitron font-bold text-sm text-fire-3">Zero. Dipende dall'atleta.</p>
              </div>
            </div>
          </div>
          <p className="font-mono text-[8px] text-white/10 mt-3 text-center">
            Simulatore basato sul sistema reale: 100k → 10k → 1k → 100 card · Nessuna garanzia di profitto · Gioca responsabilmente
          </p>
        </div>

        {/* ─── SNAPSHOT ─── */}
        <div className="mb-10">
          <p className="font-mono text-[9px] tracking-[5px] uppercase text-fire-3/30 mb-6">// SNAPSHOT — ZERO AZIONI RICHIESTE //</p>
          <div className="grid grid-cols-4 gap-3 mb-8">
            {SNAPSHOT_STEPS.map((s, i) => {
              const [icon, ...labelParts] = s.split(' ');
              return (
                <div key={i}
                  className={`p-4 border text-center transition-all duration-500 ${
                    snapshotStep > i
                      ? 'border-fire-3/60 bg-fire-3/10 scale-[1.04]'
                      : 'border-white/8 bg-white/[0.015]'
                  }`}
                  style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))' }}
                >
                  <div className="text-2xl mb-2">{icon}</div>
                  <div className={`font-mono text-[8px] uppercase tracking-[1px] transition-colors leading-tight ${snapshotStep > i ? 'text-fire-3' : 'text-white/20'}`}>
                    {labelParts.join(' ')}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Story */}
          <div className="border-l-2 border-fire-3/30 pl-6 py-3">
            <p className="font-mono text-[9px] uppercase tracking-[3px] text-fire-3/30 mb-4">// SCENARIO //</p>
            <p className="font-rajdhani text-lg text-white/60 leading-relaxed">
              10 card a €1. Tenute. L'atleta vince l'<span className="text-fire-5 font-bold">Internazionale</span>.<br />
              <span className="text-yellow-400 font-bold text-xl">10 Legendary Card ricevute. Automaticamente.</span>
            </p>
            <p className="font-mono text-sm text-white/20 mt-4">
              Il sistema premia chi rimane.
            </p>
          </div>
        </div>

      </div>

      <PageNav currentPath="/scarsita" />
      <Footer lang={lang} />
    </div>
  );
}