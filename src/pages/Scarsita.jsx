import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import CyberOverlays from '../components/cyber/CyberOverlays';
import Navbar from '../components/cyber/Navbar';
import Footer from '../components/cyber/Footer';
import FireRule from '../components/cyber/FireRule';
import { useLang } from '../components/useLang';
import { useTranslation } from '../components/translations';

const TIERS_BASE = [
  { name: 'Common', levelKey: '🏙️', count: 100000, label: '100.000', price: '~1€', dropKey: 'scar_tier_common', color: '#888888', barH: 100, invest10: '10€', multKey: 'scar_mult_regional', mult: 1, multColor: 'text-gray-400' },
  { name: 'Uncommon', levelKey: '🇮🇹', count: 10000, label: '10.000', price: '~8€', dropKey: 'scar_tier_uncommon', color: '#22c55e', barH: 20, invest10: '80€', multKey: 'scar_mult_national', mult: 8, multColor: 'text-green-400' },
  { name: 'Rare', levelKey: '🌍', count: 1000, label: '1.000', price: '~100€', dropKey: 'scar_tier_rare', color: '#3b82f6', barH: 6, invest10: '1.000€', multKey: 'scar_mult_continental', mult: 100, multColor: 'text-blue-400' },
  { name: 'Legendary', levelKey: '🌐', count: 100, label: '100', price: '~1.200€', dropKey: 'scar_tier_legendary', color: '#eab308', barH: 1.5, invest10: '12.000€', multKey: 'scar_mult_international', mult: 1200, multColor: 'text-yellow-400' },
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

const SNAPSHOT_STEP_KEYS = ['scar_step1', 'scar_step2', 'scar_step3', 'scar_step4'];
const SNAPSHOT_ICONS = ['⚔️', '🏆', '📸', '🎁'];

export default function Scarsita() {
  const [lang, setLang] = useLang();
  const t = useTranslation(lang);
  const [cards, setCards] = useState(10);
  const [snapshotStep, setSnapshotStep] = useState(0);
  const intervalRef = useRef(null);
  const tiers = TIERS_BASE.map(tier => ({ ...tier, level: `${tier.levelKey} ${t(tier.multKey)}`, drop: t(tier.dropKey) }));
  const multipliers = TIERS_BASE.map(tier => ({ label: t(tier.multKey), mult: tier.mult, color: tier.multColor }));
  const snapshotSteps = SNAPSHOT_STEP_KEYS.map((key, i) => ({ icon: SNAPSHOT_ICONS[i], label: t(key) }));

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setSnapshotStep(s => (s + 1) % (snapshotSteps.length + 1));
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
          <p className="font-mono text-[10px] tracking-[7px] uppercase text-fire-3/40 mb-3">{t('scar_system')}</p>
          <h1 className="heading-fire text-[clamp(36px,7vw,72px)] font-black leading-none mb-4 whitespace-pre-line">{t('scar_title')}</h1>
          <p className="font-rajdhani text-lg text-white/40 max-w-xl mx-auto">{t('scar_subtitle')}</p>
        </motion.div>

        {/* Scarcity bars */}
        <div className="mb-12">
          <p className="font-mono text-[10px] tracking-[5px] uppercase text-fire-3/40 mb-6">{t('scar_viz')}</p>
          <div className="grid grid-cols-4 gap-4">
            {tiers.map((tier, i) => (
              <div key={tier.name} className="flex flex-col items-center">
                <AnimatedBar pct={tier.barH} color={tier.color} delay={i * 200} />
                <div className="mt-3 text-center">
                  <div className="font-orbitron font-bold text-sm" style={{ color: tier.color }}>{tier.name}</div>
                  <div className="font-mono text-[10px] text-white/40">{tier.label}</div>
                  <div className="font-mono text-[11px] text-white/60 mt-1">{tier.price}</div>
                </div>
              </div>
            ))}
          </div>
          <p className="font-mono text-[10px] text-white/20 text-center mt-4">{t('scar_bars_note')}</p>
        </div>

        {/* Full table */}
        <div className="mb-12 overflow-x-auto">
          <p className="font-mono text-[10px] tracking-[5px] uppercase text-fire-3/40 mb-4">{t('scar_table')}</p>
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-fire-3/20">
                {[t('scar_col_level'), t('scar_col_cards'), t('scar_col_price'), t('scar_col_drop'), t('scar_col_invest')].map(h => (
                  <th key={h} className="py-2 px-3 text-left font-mono text-[10px] uppercase tracking-[1px] text-fire-3/50">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tiers.map((tier, i) => (
                <tr key={tier.name} className={`border-b border-white/5 ${i % 2 === 0 ? 'bg-white/2' : ''}`}>
                  <td className="py-3 px-3 font-rajdhani text-white/60">{tier.level}</td>
                  <td className="py-3 px-3 font-orbitron text-sm font-bold" style={{ color: tier.color }}>{tier.label} {tier.name}</td>
                  <td className="py-3 px-3 font-mono text-sm text-white/70">{tier.price}</td>
                  <td className="py-3 px-3 font-rajdhani text-sm text-white/60">{tier.drop}</td>
                  <td className="py-3 px-3 font-orbitron text-sm text-fire-3">{tier.invest10}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Simulator */}
        <div className="mb-12 border border-fire-3/20 bg-fire-3/5 p-6" style={{ clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))' }}>
          <p className="font-mono text-[10px] tracking-[5px] uppercase text-fire-3/40 mb-2">{t('scar_simulator')}</p>
          <div className="flex items-center justify-between mb-1">
            <span className="font-rajdhani text-white/60">{t('scar_how_many')}</span>
            <span className="font-orbitron font-bold text-2xl text-fire-3">{cards}</span>
          </div>
          <input
            type="range" min={1} max={200} value={cards}
            onChange={e => setCards(Number(e.target.value))}
            className="w-full mb-6 accent-orange-500"
          />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {multipliers.map(m => {
              const value = cards * m.mult;
              const profit = value - cards;
              return (
                <div key={m.label} className="p-3 border border-white/10 bg-black/40">
                  <div className={`font-orbitron font-bold text-sm ${m.color} mb-1`}>{m.label}</div>
                  <div className="font-mono text-lg font-bold text-white">€{value.toLocaleString()}</div>
                  {profit > 0 && (
                    <div className="font-mono text-[10px] text-green-400">+€{profit.toLocaleString()} {t('scar_profit')}</div>
                  )}
                  <div className="font-mono text-[9px] text-white/30 mt-1">×{m.mult}</div>
                </div>
              );
            })}
          </div>
          <p className="font-mono text-[9px] text-white/20 mt-4">{t('scar_note')}</p>
        </div>

        {/* Snapshot animation */}
        <div className="mb-10">
          <p className="font-mono text-[10px] tracking-[5px] uppercase text-fire-3/40 mb-5">{t('scar_snapshot')}</p>
          <div className="grid grid-cols-4 gap-3 mb-6">
            {snapshotSteps.map((s, i) => (
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
            <p className="font-rajdhani text-base text-yellow-200" dangerouslySetInnerHTML={{ __html: t('scar_story') }} />
          </div>
        </div>
      </div>

      <FireRule />
      <Footer lang={lang} />
    </div>
  );
}