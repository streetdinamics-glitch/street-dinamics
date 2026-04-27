import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CyberOverlays from '../components/cyber/CyberOverlays';
import Navbar from '../components/cyber/Navbar';
import Footer from '../components/cyber/Footer';
import FireRule from '../components/cyber/FireRule';
import { useLang } from '../components/useLang';

const TABS = [
  {
    id: 'proprieta',
    label: '🃏 Proprietà',
    content: (
      <div className="space-y-4">
        <h3 className="font-orbitron font-bold text-2xl text-fire-4">La Card è tua. Per sempre.</h3>
        <ul className="space-y-3">
          {[
            'NFT su blockchain Polygon — immutabile, non falsificabile',
            'Numero di serie: #001 vale più di #500 — la scarsità è reale',
            'Si può tenere, vendere, regalare in qualsiasi momento',
            'Fee SD: 2.5% sulla transazione — nient\'altro',
          ].map((item, i) => (
            <li key={i} className="flex gap-3 font-rajdhani text-lg text-white/70">
              <span className="text-fire-3 font-bold mt-0.5">→</span>{item}
            </li>
          ))}
        </ul>
      </div>
    ),
  },
  {
    id: 'royalty',
    label: '💰 Royalty',
    content: (
      <div className="space-y-6">
        <h3 className="font-orbitron font-bold text-2xl text-fire-4">Guadagni senza fare nulla.</h3>
        <div className="p-4 bg-fire-3/10 border border-fire-3/30 font-mono text-sm text-fire-5">
          Sponsor paga 1.000€ → atleta prende 500€ → 500€ divisi tra gli holder<br />
          10 card su 100 holder = <span className="text-fire-3 font-bold">50€ automatici</span>
        </div>
        <div className="space-y-3">
          {[
            { src: 'Sponsorizzazioni', pct: '50% atleta + 50% holder' },
            { src: 'Mercato secondario', pct: 'Venditore + SD 2.5%' },
            { src: 'Streaming on-demand', pct: 'Atleta + holder ogni mese' },
            { src: 'Drop rivenduto', pct: 'Holder + SD 2.5%' },
            { src: 'Window Challenge', pct: 'Atleta + holder + SD' },
            { src: 'Podcast Day sponsor', pct: 'SD + atleta (giorno 6)' },
          ].map((r, i) => (
            <div key={i} className="flex justify-between border-b border-white/5 pb-2">
              <span className="font-rajdhani text-white/60">{r.src}</span>
              <span className="font-mono text-xs text-fire-3">{r.pct}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'voto',
    label: '🗳️ Sovereignty',
    content: (
      <div className="space-y-4">
        <h3 className="font-orbitron font-bold text-2xl text-fire-4">La community decide. Davvero.</h3>
        <p className="font-rajdhani text-lg text-white/60">Dopo ogni vittoria la community vota quale momento diventa la clip ufficiale certificata.</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { tier: 'Common', votes: '1 voto' },
            { tier: 'Uncommon', votes: '10 voti' },
            { tier: 'Rare', votes: '100 voti' },
            { tier: 'Legendary', votes: '1.200 voti' },
          ].map((v, i) => (
            <div key={i} className="p-3 border border-fire-3/20 bg-fire-3/5">
              <div className="font-orbitron text-sm text-fire-4">{v.tier}</div>
              <div className="font-mono text-xs text-white/50">{v.votes}</div>
            </div>
          ))}
        </div>
        <div className="space-y-2 pt-2">
          {['Fine torneo', '48h: candidati caricati', 'Notifica agli holder', '72h di voto', 'Vince il momento con più voti ponderati', 'Certificato su blockchain → NFT drop automatico'].map((s, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full border border-fire-3/40 bg-fire-3/10 flex items-center justify-center font-mono text-[10px] text-fire-3 flex-shrink-0">{i + 1}</div>
              <span className="font-rajdhani text-white/60">{s}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'scarsita',
    label: '📊 Scarsità',
    content: (
      <div className="space-y-6">
        <h3 className="font-orbitron font-bold text-2xl text-fire-4">Meno card = più valore.</h3>
        <p className="font-rajdhani text-white/50">Lo smart contract non può emettere più card di quelle dichiarate — tecnicamente impossibile.</p>
        <div className="space-y-3">
          {[
            { level: '🏙️ Regionale', name: 'Common', count: '100.000', price: '~1€', color: 'border-gray-500/40 bg-gray-500/5' },
            { level: '🇮🇹 Nazionale', name: 'Uncommon', count: '10.000', price: '~8€', color: 'border-green-500/40 bg-green-500/5' },
            { level: '🌍 Continentale', name: 'Rare', count: '1.000', price: '~100€', color: 'border-blue-500/40 bg-blue-500/5' },
            { level: '🌐 Internazionale', name: 'Legendary', count: '100', price: '~1.200€', color: 'border-yellow-500/40 bg-yellow-500/5' },
          ].map((s, i) => (
            <div key={i} className={`flex items-center justify-between p-3 border ${s.color}`}>
              <div>
                <div className="font-orbitron text-sm text-fire-4">{s.level} · {s.name}</div>
                <div className="font-mono text-xs text-white/40">{s.count} card</div>
              </div>
              <div className="font-orbitron font-bold text-lg text-fire-5">{s.price}</div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'snapshot',
    label: '📸 Snapshot',
    content: (
      <div className="space-y-6">
        <h3 className="font-orbitron font-bold text-2xl text-fire-4">Il momento della vittoria è tutto.</h3>
        <p className="font-rajdhani text-lg text-white/60">Nel momento esatto della vittoria finale, lo smart contract fotografa tutti gli holder attivi. Chi è dentro riceve il drop. Chi vende anche solo un secondo prima: nessun drop. Per sempre.</p>
        <div className="space-y-4">
          {[
            { icon: '⚔️', label: 'Torneo in corso' },
            { icon: '🏆', label: 'Vittoria finale' },
            { icon: '📸', label: 'Snapshot on-chain' },
            { icon: '🎁', label: 'Drop automatico — senza fare niente' },
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-10 h-10 border border-fire-3/30 bg-fire-3/10 flex items-center justify-center text-xl flex-shrink-0">{s.icon}</div>
              {i < 3 && <div className="absolute ml-5 mt-10 w-[1px] h-4 bg-fire-3/20" />}
              <span className="font-rajdhani font-bold text-lg text-white/70">{s.label}</span>
            </div>
          ))}
        </div>
        <div className="p-4 bg-yellow-500/10 border border-yellow-500/30">
          <p className="font-rajdhani text-base text-yellow-200">
            <strong>Storia di Marco:</strong> compra 10 card a 1€ → le tiene → atleta vince internazionale → riceve automaticamente 10 Legendary Card
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 'pilastri',
    label: '⚖️ 6 Pilastri',
    content: (
      <div className="space-y-4">
        <h3 className="font-orbitron font-bold text-2xl text-fire-4">I 3 giudici sono persone del pubblico.</h3>
        <p className="font-rajdhani text-white/50 text-sm">Nessun esperto tecnico. Guardano, sentono, giudicano quello che vedono.</p>
        <div className="space-y-3">
          {[
            { e: '📈', label: 'Sta migliorando?', pct: '25%', desc: 'Rispetto all\'ultima volta, è cresciuto?' },
            { e: '🔥', label: 'Accende la gente?', pct: '20%', desc: 'Il pubblico reagisce quando entra?' },
            { e: '🎯', label: 'È costante?', pct: '15%', desc: 'Ci si può contare ogni volta?' },
            { e: '🏅', label: 'Lo riconoscono fuori?', pct: '15%', desc: 'Premi, scouting, brand?' },
            { e: '👥', label: 'Ha gente dietro?', pct: '15%', desc: 'La sua fanbase cresce?' },
            { e: '👊', label: 'Porta energia?', pct: '10%', desc: 'Trascina gli altri o pensa solo a sé?' },
          ].map((p, i) => (
            <div key={i} className="flex gap-3 p-3 border border-white/8 bg-white/3 hover:border-fire-3/30 transition-all">
              <span className="text-2xl">{p.e}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-orbitron text-sm text-fire-4">{p.label}</span>
                  <span className="font-mono text-xs text-fire-3 font-bold">{p.pct}</span>
                </div>
                <p className="font-rajdhani text-sm text-white/50">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'window',
    label: '👑 Window Challenge',
    content: (
      <div className="space-y-4">
        <h3 className="font-orbitron font-bold text-2xl text-fire-4">La finestra si apre solo dopo aver vinto.</h3>
        <div className="space-y-3">
          {[
            { step: '1', icon: '🏆', label: 'Prerequisito', desc: 'Vinci un torneo ufficiale SD. Non esiste altra strada.' },
            { step: '2', icon: '📢', label: 'Dichiarazione', desc: 'Dichiari pubblicamente la sfida sui social / app SD.' },
            { step: '3', icon: '⚔️', label: 'Elimina i contendenti', desc: 'Batti tutti gli altri vincitori in coda, in ordine di ranking.' },
            { step: '4', icon: '👑', label: 'La sfida al campione', desc: 'Solo ora accedi al campione in carica. Trasmesso live. Picco massimo del mercato card.' },
          ].map((s, i) => (
            <div key={i} className="flex gap-4 p-3 border border-fire-3/15 bg-fire-3/5">
              <div className="w-8 h-8 bg-fire-3/20 border border-fire-3/40 flex items-center justify-center font-orbitron font-bold text-sm text-fire-3 flex-shrink-0">{s.step}</div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span>{s.icon}</span>
                  <span className="font-orbitron text-sm text-fire-4">{s.label}</span>
                </div>
                <p className="font-rajdhani text-sm text-white/60">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
];

export default function ComeFunziona() {
  const [lang, setLang] = useLang();
  const [activeTab, setActiveTab] = useState('proprieta');

  const active = TABS.find(t => t.id === activeTab);

  return (
    <div className="relative min-h-screen bg-cyber-void text-[var(--text-main)]">
      <CyberOverlays />
      <Navbar onScrollTo={() => {}} lang={lang} onLangSwitch={setLang} onProfileClick={() => {}} />

      <div className="pt-[80px] section-container max-w-4xl">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center">
          <p className="font-mono text-[10px] tracking-[7px] uppercase text-fire-3/40 mb-3">COME FUNZIONA</p>
          <h1 className="heading-fire text-[clamp(40px,8vw,80px)] font-black leading-none mb-4">LA CARD</h1>
          <p className="font-rajdhani text-lg text-white/40 max-w-xl mx-auto">7 concetti. Leggili tutti — poi decidi se vuoi fare parte del sistema.</p>
        </motion.div>

        {/* Tab bar */}
        <div className="flex flex-wrap gap-2 mb-8">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2 font-orbitron text-[10px] tracking-[1px] uppercase border transition-all ${
                activeTab === tab.id
                  ? 'border-fire-3 bg-fire-3/15 text-fire-4'
                  : 'border-white/10 text-white/40 hover:border-fire-3/40 hover:text-fire-3'
              }`}
              style={{ clipPath: 'polygon(5px 0%, 100% 0%, calc(100% - 5px) 100%, 0% 100%)' }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className="border border-fire-3/15 bg-black/40 p-6 md:p-8"
            style={{ clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))' }}
          >
            {active?.content}
          </motion.div>
        </AnimatePresence>
      </div>

      <FireRule />
      <Footer lang={lang} />
    </div>
  );
}