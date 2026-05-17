import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '../translations';

const LEVELS = [
  { key: 'regional',     label_key: 'w3c_level_regional',     cards: '100.000', price: '€1',    drop_key: 'w3c_drop_none',        color: '#888', dropColor: null },
  { key: 'national',     label_key: 'w3c_level_national',     cards: '10.000',  price: '€10',   drop_key: 'w3c_drop_bronze',      color: '#cd7f32', dropColor: '#cd7f32' },
  { key: 'continental',  label_key: 'w3c_level_continental',  cards: '1.000',   price: '€100',  drop_key: 'w3c_drop_silver',      color: '#aaa', dropColor: '#aaa' },
  { key: 'international',label_key: 'w3c_level_international',cards: '100',     price: '€1.000',drop_key: 'w3c_drop_legendary',   color: '#ffcc00', dropColor: '#ffcc00' },
];

export default function Web3ConceptExplainer({ lang }) {
  const t = useTranslation(lang);
  const [activeLevel, setActiveLevel] = useState(0);
  const level = LEVELS[activeLevel];

  return (
    <div className="space-y-16">

      {/* ─── HERO STATEMENT ─── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-3xl mx-auto"
      >
        <p className="font-mono text-[10px] tracking-[6px] uppercase text-fire-3/40 mb-3">{t('w3c_eyebrow')}</p>
        <h2 className="heading-fire text-[clamp(32px,5vw,64px)] leading-none font-black mb-4">
          {t('w3c_title')}
        </h2>
        <p className="font-rajdhani text-xl text-[var(--text-main)]/70 leading-relaxed">
          {t('w3c_intro')}
        </p>
      </motion.div>

      {/* ─── TWO OBJECTS SIDE BY SIDE ─── */}
      <div className="grid lg:grid-cols-[1fr_auto_1fr] gap-6 items-start">

        {/* LEFT — LA CARD */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-[rgba(12,5,22,0.98)] to-[rgba(6,2,10,1)] border border-fire-3/30 clip-cyber p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 flex items-center justify-center text-3xl">🃏</div>
            <div>
              <p className="font-mono text-[9px] tracking-[3px] uppercase text-fire-3/40">{t('w3c_object1_label')}</p>
              <h3 className="font-orbitron font-black text-2xl text-fire-5">{t('w3c_card_title')}</h3>
            </div>
          </div>

          <p className="font-rajdhani text-lg text-[var(--text-main)]/80 mb-6 leading-relaxed">
            {t('w3c_card_desc')}
          </p>

          {/* 3 Rights */}
          <div className="space-y-3 mb-6">
            <p className="font-mono text-[9px] tracking-[3px] uppercase text-fire-3/50 mb-3">{t('w3c_card_rights_title')}</p>
            {[
              { icon: '💰', title_key: 'w3c_right1_title', desc_key: 'w3c_right1_desc' },
              { icon: '🗳️', title_key: 'w3c_right2_title', desc_key: 'w3c_right2_desc' },
              { icon: '📸', title_key: 'w3c_right3_title', desc_key: 'w3c_right3_desc' },
            ].map((r, i) => (
              <div key={i} className="flex gap-3 p-3 bg-fire-3/5 border border-fire-3/10">
                <span className="text-xl">{r.icon}</span>
                <div>
                  <p className="font-orbitron text-xs font-bold text-fire-5">{t(r.title_key)}</p>
                  <p className="font-rajdhani text-sm text-[var(--text-main)]/60">{t(r.desc_key)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Resell note */}
          <div className="border-t border-fire-3/15 pt-4">
            <p className="font-rajdhani text-sm text-[var(--text-main)]/50">
              {t('w3c_card_resell')}
            </p>
          </div>
        </motion.div>

        {/* CENTER ARROW */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col items-center justify-center gap-3 py-8 lg:py-0"
        >
          <p className="font-mono text-[8px] tracking-[2px] uppercase text-fire-3/40 text-center max-w-[120px] leading-relaxed">
            {t('w3c_arrow_top')}
          </p>
          <div className="hidden lg:flex flex-col items-center gap-1">
            <div className="w-[2px] h-16 bg-gradient-to-b from-fire-3/0 via-fire-3/60 to-fire-5" />
            <div
              style={{
                width: 0, height: 0,
                borderLeft: '8px solid transparent',
                borderRight: '8px solid transparent',
                borderTop: '12px solid #ffcc00',
              }}
            />
          </div>
          <div className="lg:hidden text-fire-5 text-2xl">↓</div>
          <div className="bg-fire-5/10 border border-fire-5/30 px-3 py-2 text-center">
            <p className="font-orbitron text-[9px] font-bold text-fire-5 tracking-[1px]">{t('w3c_arrow_cta')}</p>
          </div>
        </motion.div>

        {/* RIGHT — IL DROP */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-gradient-to-br from-[rgba(6,2,18,0.98)] to-[rgba(4,2,14,1)] border border-cyber-cyan/20 clip-cyber p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 flex items-center justify-center text-3xl">🏆</div>
            <div>
              <p className="font-mono text-[9px] tracking-[3px] uppercase text-cyber-cyan/40">{t('w3c_object2_label')}</p>
              <h3 className="font-orbitron font-black text-2xl text-cyber-cyan">{t('w3c_drop_title')}</h3>
            </div>
          </div>

          <p className="font-rajdhani text-lg text-[var(--text-main)]/80 mb-6 leading-relaxed">
            {t('w3c_drop_desc')}
          </p>

          {/* NOT FOR SALE badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-cyber-cyan/5 border border-cyber-cyan/25 mb-6">
            <span className="w-2 h-2 rounded-full bg-cyber-cyan" style={{ animation: 'blink 2s ease-in-out infinite' }} />
            <span className="font-mono text-[10px] tracking-[2px] uppercase text-cyber-cyan">{t('w3c_drop_not_for_sale')}</span>
          </div>

          {/* Drop levels */}
          <div className="space-y-2 mb-6">
            <p className="font-mono text-[9px] tracking-[3px] uppercase text-cyber-cyan/50 mb-3">{t('w3c_drop_levels_title')}</p>
            {[
              { level_key: 'w3c_level_regional',      drop_key: 'w3c_drop_none',      color: '#666' },
              { level_key: 'w3c_level_national',      drop_key: 'w3c_drop_bronze',    color: '#cd7f32' },
              { level_key: 'w3c_level_continental',   drop_key: 'w3c_drop_silver',    color: '#aaa' },
              { level_key: 'w3c_level_international', drop_key: 'w3c_drop_legendary', color: '#ffcc00' },
            ].map((row, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-cyber-cyan/3 border border-cyber-cyan/8">
                <span className="font-rajdhani text-sm text-[var(--text-main)]/60">{t(row.level_key)}</span>
                <span className="font-orbitron text-xs font-bold" style={{ color: row.color }}>{t(row.drop_key)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-cyber-cyan/10 pt-4">
            <p className="font-rajdhani text-sm text-[var(--text-main)]/50">
              {t('w3c_drop_after')}
            </p>
          </div>
        </motion.div>
      </div>

      {/* ─── SNAPSHOT DIAGRAM ─── */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="bg-gradient-to-br from-[rgba(8,4,18,0.99)] to-[rgba(4,2,10,1)] border border-fire-3/15 clip-cyber p-8"
      >
        <p className="font-mono text-[9px] tracking-[4px] uppercase text-fire-3/40 mb-2 text-center">{t('w3c_snapshot_label')}</p>
        <h3 className="font-orbitron font-black text-xl text-[var(--text-main)] mb-8 text-center">{t('w3c_snapshot_title')}</h3>

        {/* Level selector */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {LEVELS.map((lv, i) => (
            <button
              key={lv.key}
              onClick={() => setActiveLevel(i)}
              className="font-orbitron text-[10px] font-bold tracking-[1px] uppercase px-4 py-2 border transition-all clip-btn"
              style={{
                borderColor: activeLevel === i ? (lv.color || '#ff6600') : 'rgba(255,100,0,0.2)',
                color: activeLevel === i ? (lv.color || '#ff6600') : 'rgba(255,180,100,0.4)',
                background: activeLevel === i ? `${lv.color}10` : 'transparent',
              }}
            >
              {t(lv.label_key)}
            </button>
          ))}
        </div>

        {/* Flow diagram */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-0">
          {/* Step 1 */}
          <SnapshotStep
            icon="🃏"
            label={t('w3c_snap_step1')}
            sub={`${t(level.label_key)} · ${level.cards} {t('w3c_cards_total')} · ${level.price}`}
            color="#ff6600"
          />
          <Arrow />
          {/* Step 2 */}
          <SnapshotStep icon="🏆" label={t('w3c_snap_step2')} sub={t('w3c_snap_step2_sub')} color="#ffcc00" />
          <Arrow />
          {/* Step 3 — snapshot moment */}
          <SnapshotStep
            icon="📸"
            label={t('w3c_snap_step3')}
            sub={t('w3c_snap_step3_sub')}
            color="#00ffee"
            highlight
          />
          <Arrow />
          {/* Step 4 — drop */}
          <div className="flex flex-col items-center text-center w-40">
            <div
              className="w-16 h-16 flex items-center justify-center text-3xl mb-3 border-2"
              style={{ borderColor: level.dropColor || '#444', background: level.dropColor ? `${level.dropColor}10` : 'transparent' }}
            >
              {activeLevel === 0 ? '—' : activeLevel === 1 ? '🥉' : activeLevel === 2 ? '🥈' : '⭐'}
            </div>
            <p className="font-orbitron text-xs font-bold mb-1" style={{ color: level.dropColor || '#555' }}>
              {t('w3c_snap_step4')}
            </p>
            <p className="font-rajdhani text-xs" style={{ color: level.dropColor || '#555' }}>
              {t(level.drop_key)}
            </p>
          </div>
        </div>

        {/* Story */}
        <div className="mt-10 p-5 bg-fire-3/5 border-l-2 border-fire-5">
          <p
            className="font-rajdhani text-base text-[var(--text-main)]/80 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: t('w3c_story') }}
          />
        </div>
      </motion.div>

      {/* ─── BOTTOM SIMPLE RULES ─── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid md:grid-cols-3 gap-4"
      >
        {[
          { icon: '🛒', key: 'w3c_rule1' },
          { icon: '⏳', key: 'w3c_rule2' },
          { icon: '🎁', key: 'w3c_rule3' },
        ].map((rule, i) => (
          <div key={i} className="p-6 bg-gradient-to-br from-fire-3/5 to-transparent border border-fire-3/15 clip-cyber text-center">
            <div className="text-4xl mb-3">{rule.icon}</div>
            <p className="font-orbitron text-sm font-bold text-fire-5">{t(rule.key)}</p>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

function SnapshotStep({ icon, label, sub, color, highlight }) {
  return (
    <div className="flex flex-col items-center text-center w-40">
      <div
        className="w-16 h-16 flex items-center justify-center text-3xl mb-3"
        style={{
          border: `2px solid ${color}`,
          background: `${color}12`,
          boxShadow: highlight ? `0 0 20px ${color}40` : 'none',
        }}
      >
        {icon}
      </div>
      <p className="font-orbitron text-xs font-bold mb-1" style={{ color }}>{label}</p>
      <p className="font-rajdhani text-xs text-[var(--text-main)]/50">{sub}</p>
    </div>
  );
}

function Arrow() {
  return (
    <div className="hidden md:flex items-center text-fire-3/30 mx-2 text-2xl">→</div>
  );
}