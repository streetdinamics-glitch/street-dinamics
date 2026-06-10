import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CyberOverlays from '../components/cyber/CyberOverlays';
import Navbar from '../components/cyber/Navbar';
import Footer from '../components/cyber/Footer';
import FireRule from '../components/cyber/FireRule';
import { useLang } from '../components/useLang';

const DAYS = [
{
  day: 'Giorno 1', emoji: '⚽', theme: 'BATTAGLIA DI SQUADRA',
  disciplines: 'Calcio · Basket · Pallavolo',
  desc: '3v3. Tattica collettiva. Un\'identità. Tre tornei — un esito.',
  ps: 'FIFA / NBA 2K / Spike Volleyball',
  color: 'border-blue-500/30 bg-blue-500/5',
  accent: 'text-blue-400'
},
{
  day: 'Giorno 2', emoji: '🎤', theme: 'STRADA PURA',
  disciplines: 'Freestyle Rap · Beatbox · Beatmaking · Breaking',
  desc: 'Battle 1v1. Nessuna tattica — solo istinto. Chi ha il flow vince.',
  ps: 'Beat Saber · Beat Snap · Just Dance',
  color: 'border-purple-500/30 bg-purple-500/5',
  accent: 'text-purple-400'
},
{
  day: 'Giorno 3', emoji: '🛹', theme: 'ASFALTO IN FIAMME',
  disciplines: 'Skate · Moto Stunt · Drifting · BMX',
  desc: 'Velocità. Stile. Rischio. Il giorno che diventa contenuto da solo.',
  ps: 'Tony Hawk · Gran Turismo · MotoGP',
  color: 'border-orange-500/30 bg-orange-500/5',
  accent: 'text-orange-400'
},
{
  day: 'Giorno 4', emoji: '💪', theme: 'CORPO & FERRO',
  disciplines: 'Powerlifting · MMA · Kendo · Street Workout',
  desc: 'Corpo contro corpo. Nessun alibi. L\'esito è sempre lo stesso.',
  ps: 'UFC 5 · Mortal Kombat · Street Fighter',
  color: 'border-red-500/30 bg-red-500/5',
  accent: 'text-red-400'
},
{
  day: 'Giorno 5', emoji: '🎾', theme: 'IL DUELLO',
  disciplines: 'Tennis · Ping Pong · Biliardo · Freccette · Badminton',
  desc: '1 contro 1. Uno strumento. Nessun alibi.',
  ps: 'Tennis World Tour · Wii Sports · Snooker Elite',
  color: 'border-cyan-500/30 bg-cyan-500/5',
  accent: 'text-cyan-400'
},
{
  day: 'Giorno 6', emoji: '🎙️', theme: 'LEGGENDA',
  disciplines: 'SD Talks — I 5 campioni',
  desc: 'Cena. Registrazione live. Nessuna scaletta. Telecamera fissa, nessun filtro. YouTube + Spotify entro 48h. Gli holder vedono il link 24h prima del mondo.',
  ps: '🏆 Card oro speciale — solo per il Podcast Day',
  color: 'border-yellow-500/30 bg-yellow-500/5',
  accent: 'text-yellow-400',
  special: true
}];


export default function FormatoEvento() {
  const [lang, setLang] = useLang();
  const [activeDay, setActiveDay] = useState(null);

  return (
    <div className="relative min-h-screen bg-cyber-void text-[var(--text-main)]">
      <CyberOverlays />
      <Navbar onScrollTo={() => {}} lang={lang} onLangSwitch={setLang} onProfileClick={() => {}} />

      <div className="pt-[80px] section-container max-w-5xl">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
          <p className="font-mono text-[10px] tracking-[7px] uppercase text-fire-3/40 mb-3">// CIRCUITO PRINCIPALE //</p>
          <h1 className="heading-fire text-[clamp(36px,7vw,72px)] font-black leading-none mb-4">5 GIORNI.<br />5 ENERGIE.<br />1 ESITO.</h1>
          <p className="font-rajdhani text-xl text-white/40 max-w-xl mx-auto">
            Non logistica. <span className="text-fire-3/60">Tribù.</span><br />
            Stessa energia, stesso giorno.
          </p>
        </motion.div>

        {/* Day grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {DAYS.map((d, i) =>
          <motion.button
            key={d.day}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            onClick={() => setActiveDay(activeDay?.day === d.day ? null : d)}
            className={`text-left p-5 border transition-all hover:scale-[1.02] ${d.color} ${
            activeDay?.day === d.day ? 'ring-1 ring-fire-3/40' : ''} ${
            d.special ? 'md:col-span-2 lg:col-span-3' : ''}`}
            style={{ clipPath: 'polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))' }}>
            
              <div className="flex items-start gap-3">
                <span className="text-4xl">{d.emoji}</span>
                <div className="min-w-0 flex-1">
                  <div className="font-mono text-[10px] tracking-[3px] uppercase text-white/30 mb-1">{d.day}</div>
                  <div className={`font-orbitron font-bold text-lg ${d.accent} mb-1`}>{d.theme}</div>
                  <div className="font-rajdhani text-sm text-white/50">{d.disciplines}</div>
                </div>
              </div>
            </motion.button>
          )}
        </div>

        {/* Detail panel */}
        <AnimatePresence>
          {activeDay &&
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-8">
            
              <div className={`border ${activeDay.color} p-6 space-y-4`} style={{ clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))' }}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">{activeDay.emoji}</span>
                  <div>
                    <div className="font-mono text-[10px] tracking-[3px] uppercase text-white/30">{activeDay.day}</div>
                    <div className={`font-orbitron font-bold text-2xl ${activeDay.accent}`}>{activeDay.theme}</div>
                  </div>
                </div>
                <p className="font-rajdhani text-base text-white/65 leading-relaxed">{activeDay.desc}</p>
                <div className="p-3 border border-purple-500/20 bg-purple-500/5 flex items-start gap-2">
                  <span>🎮</span>
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[2px] text-purple-400/60 mb-1">PlayStation Corner</p>
                    <p className="font-rajdhani text-sm text-purple-200/70">{activeDay.ps}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          }
        </AnimatePresence>

        {/* PlayStation Corner note */}
        <div className="border border-purple-500/20 bg-purple-500/5 p-5 mb-10">
          <h3 className="font-orbitron font-bold text-base text-purple-400 mb-1">🎮 PLAY CORNER — ogni giorno</h3>
          <p className="font-mono text-[9px] text-purple-400/30 uppercase tracking-[2px] mb-3">Stessa logica. Schermo diverso.</p>
          <div className="space-y-2">
            {[
            'Torneo sulla disciplina del giorno — eliminazione diretta, 16 posti',
            'Card gaming: stesse regole degli atleti fisici',
            'Nessuna prenotazione. Entra e gioca.'].
            map((item, i) =>
            <div key={i} className="flex gap-2 font-rajdhani text-sm text-white/60">
                <span className="text-purple-400">→</span>{item}
              </div>
            )}
          </div>
        </div>
      </div>

      <FireRule />
      <Footer lang={lang} />
    </div>);

}