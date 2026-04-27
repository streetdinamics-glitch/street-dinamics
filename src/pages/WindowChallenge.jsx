import React from 'react';
import { motion } from 'framer-motion';
import CyberOverlays from '../components/cyber/CyberOverlays';
import Navbar from '../components/cyber/Navbar';
import Footer from '../components/cyber/Footer';
import FireRule from '../components/cyber/FireRule';
import { useLang } from '../components/useLang';

const STEPS = [
  { n: '1', icon: '🏆', label: 'Prerequisito', color: 'border-fire-3/40 bg-fire-3/5',
    desc: 'Vinci il torneo. Non esiste altra strada. Nessuna scorciatoia, nessuna eccezione.' },
  { n: '2', icon: '📢', label: 'Dichiarazione', color: 'border-yellow-500/40 bg-yellow-500/5',
    desc: 'Dopo la vittoria, dichiari pubblicamente la sfida sui social e sull\'app SD. È ufficiale da quel momento.' },
  { n: '3', icon: '⚔️', label: 'Elimina i contendenti', color: 'border-purple-500/40 bg-purple-500/5',
    desc: 'Batti tutti gli altri vincitori in coda, in ordine di ranking. Ogni vittoria = evento SD separato con contenuto e spike delle card.' },
  { n: '4', icon: '👑', label: 'La sfida al campione', color: 'border-cyan-500/40 bg-cyan-500/5',
    desc: 'Solo ora accedi al campione in carica. Trasmesso live. Picco massimo del mercato card.' },
];

const CARD_IMPACTS = [
  { event: 'Vittoria in torneo', effect: 'Card dello sfidante sale', dir: '↑' },
  { event: 'Dichiarazione sfida', effect: 'Card campione sale (difesa attesa)', dir: '↑↑' },
  { event: 'Vittorie sui contendenti', effect: 'Ulteriori salite progressive', dir: '↑↑↑' },
  { event: 'Evento finale', effect: 'Picco massimo per entrambi', dir: '🔥' },
  { event: 'Esito', effect: 'Nuovo valore di mercato permanente', dir: '→' },
];

export default function WindowChallenge() {
  const [lang, setLang] = useLang();

  return (
    <div className="relative min-h-screen bg-cyber-void text-[var(--text-main)]">
      <CyberOverlays />
      <Navbar onScrollTo={() => {}} lang={lang} onLangSwitch={setLang} onProfileClick={() => {}} />

      <div className="pt-[80px] section-container max-w-4xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <p className="font-mono text-[10px] tracking-[7px] uppercase text-fire-3/40 mb-3">IL SISTEMA</p>
          <h1 className="heading-fire text-[clamp(36px,7vw,72px)] font-black leading-none mb-4">WINDOW<br />CHALLENGE</h1>
          <p className="font-rajdhani text-lg text-white/40 max-w-2xl mx-auto">
            La finestra si apre SOLO dopo aver vinto un torneo ufficiale SD. Non prima. Mai.
          </p>
        </motion.div>

        {/* Flow */}
        <div className="mb-12">
          <p className="font-mono text-[10px] tracking-[5px] uppercase text-fire-3/40 mb-5">COME FUNZIONA — 4 PASSI</p>
          <div className="relative">
            {/* Connector line */}
            <div className="absolute left-[19px] top-10 bottom-10 w-[1px] bg-gradient-to-b from-fire-3/30 via-fire-3/10 to-fire-3/30 hidden md:block" />
            <div className="space-y-4">
              {STEPS.map((s, i) => (
                <motion.div
                  key={s.n}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`flex gap-4 p-5 border ${s.color}`}
                  style={{ clipPath: 'polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))' }}
                >
                  <div className="flex-shrink-0 w-10 h-10 border border-fire-3/40 bg-fire-3/10 flex items-center justify-center font-orbitron font-bold text-fire-3">
                    {s.n}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{s.icon}</span>
                      <span className="font-orbitron font-bold text-base text-fire-4">{s.label}</span>
                    </div>
                    <p className="font-rajdhani text-base text-white/60">{s.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Two columns: sfidante + campione rules */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="border border-fire-3/20 bg-fire-3/5 p-5" style={{ clipPath: 'polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))' }}>
            <h3 className="font-orbitron font-bold text-lg text-fire-4 mb-4">⚔️ Regole — Sfidante</h3>
            <ul className="space-y-2">
              {[
                'Prerequisito: vittoria in torneo ufficiale SD — sempre, senza eccezioni',
                'La finestra dura fino al ciclo di eventi successivo — poi decade',
                'Se decade: bisogna rivincere un torneo per riaprirla',
                'Non si salta nessun contendente — ordine di ranking rispettato',
                'Ogni vittoria sui contendenti genera card update e contenuto autonomo',
              ].map((r, i) => (
                <li key={i} className="flex gap-2 font-rajdhani text-sm text-white/60">
                  <span className="text-fire-3 flex-shrink-0">•</span>{r}
                </li>
              ))}
            </ul>
          </div>

          <div className="border border-cyan-500/20 bg-cyan-500/5 p-5" style={{ clipPath: 'polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))' }}>
            <h3 className="font-orbitron font-bold text-lg text-cyan-400 mb-4">👑 Regole — Campione</h3>
            <ul className="space-y-2">
              {[
                'Continua a partecipare ai tornei ordinari — il titolo si difende anche lì',
                'Può rifiutare la sfida una sola volta — alla seconda perde il titolo automaticamente',
                'Diritto di risposta pubblica entro 7 giorni dalla dichiarazione',
                'Perdere in torneo ordinario NON fa perdere il titolo',
                '3 Window Challenge vinte consecutive → status "Leggenda" → card speciale emessa',
              ].map((r, i) => (
                <li key={i} className="flex gap-2 font-rajdhani text-sm text-white/60">
                  <span className="text-cyan-400 flex-shrink-0">•</span>{r}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Card impact */}
        <div className="mb-10">
          <p className="font-mono text-[10px] tracking-[5px] uppercase text-fire-3/40 mb-4">IMPATTO SULLE CARD</p>
          <div className="border border-fire-3/15 overflow-hidden">
            {CARD_IMPACTS.map((c, i) => (
              <div key={i} className={`flex items-center justify-between px-4 py-3 ${i % 2 === 0 ? 'bg-white/2' : ''} border-b border-white/5 last:border-b-0`}>
                <span className="font-rajdhani text-white/60">{c.event}</span>
                <div className="flex items-center gap-3">
                  <span className="font-rajdhani text-sm text-white/50">{c.effect}</span>
                  <span className="font-orbitron font-bold text-fire-3">{c.dir}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Legend badge */}
        <div className="p-5 border border-yellow-500/30 bg-yellow-500/5 text-center">
          <div className="text-4xl mb-2">⭐</div>
          <h3 className="font-orbitron font-bold text-xl text-yellow-400 mb-2">STATUS LEGGENDA</h3>
          <p className="font-rajdhani text-base text-yellow-200/60">
            3 Window Challenge vinte consecutive → card speciale emessa. Immutabile. Per sempre.
          </p>
        </div>
      </div>

      <FireRule />
      <Footer lang={lang} />
    </div>
  );
}