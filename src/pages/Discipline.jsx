import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import CyberOverlays from '../components/cyber/CyberOverlays';
import Navbar from '../components/cyber/Navbar';
import Footer from '../components/cyber/Footer';
import FireRule from '../components/cyber/FireRule';
import { useLang } from '../components/useLang';

const DISCIPLINES = [
  {
    emoji: '⚽', name: 'Calcio', day: 'Giorno 1',
    format: '3v3 su campo ridotto',
    standard: ['2 tempi da 15 minuti', 'Campo ridotto', 'Porta piccola'],
    assurde: [
      'Se una squadra va 3-0 la partita finisce immediatamente',
      'Goal segnato dal centrocampo vale triplo → candidato Historic Moment NFT automatico',
      'Il portiere può uscire dall\'area — se prende goal fuori area vale doppio per l\'avversario',
      'Golden goal in caso di parità: primo a segnare vince, senza rigori',
    ],
    window: 'Lo sfidante dichiara dopo aver vinto un torneo regionale — deve battere i contendenti distretto per distretto.',
    ps: 'FIFA — stesso formato 3v3, stessa durata partite',
  },
  {
    emoji: '🏀', name: 'Basket', day: 'Giorno 1',
    format: '3v3 streetball, half court, regole FIBA 3x3 adattate',
    standard: ['Half court', 'Canestri da 2pt (normale) e 3pt (da fuori arco)', 'Possesso alternato dopo canestro'],
    assurde: [
      'Ogni canestro da oltre l\'arco vale 3 punti invece di 2 — premia il rischio',
      '"On fire": 3 canestri consecutivi → il prossimo vale il doppio',
      'Buzzer beater da oltre metà campo: 5 punti + Historic Moment automatico',
      'Ogni squadra ha UN SOLO timeout per partita',
      'Fallo tecnico = 2 punti all\'avversario',
    ],
    window: 'Sfida valida dopo vittoria in torneo regionale 3x3.',
    ps: 'NBA 2K — stesso formato 3v3',
  },
  {
    emoji: '🏐', name: 'Pallavolo', day: 'Giorno 1',
    format: 'Beach 2v2 o indoor 4v4 adattato',
    standard: ['Set da 15 punti', 'Rotazioni standard', 'Tre tocchi per lato'],
    assurde: [
      'Set da 15 punti invece di 25 — partite più veloci, più intense',
      'Ace diretto = 2 punti + candidato Historic Moment se applauso supera soglia',
      '"Super set" finale (se 1-1): 7 punti, niente vantaggi, primo a 7 vince',
      'Battuta jump serve obbligatoria sul match point — nessuna battuta dal basso',
    ],
    window: 'Sfida valida dopo vittoria in torneo regionale beach o indoor.',
    ps: 'Spike Volleyball',
  },
  {
    emoji: '🎤', name: 'Freestyle Rap / Beatbox', day: 'Giorno 2',
    format: 'Battle 1v1 a turni, giuria 3 + voto pubblico live (30% peso)',
    standard: ['Turni a tempo', 'Giuria tecnica', 'No playback'],
    assurde: [
      'Il pubblico può interrompere la battle (50%+): si aggiunge turno bonus "last bar" su parola random della audience',
      'Il giudice può "blindare" un turno — pubblico vota prima di sentire il risultato',
      '"Chiamata diretta" (reference all\'avversario reale): vale 1.5× sul punteggio',
      'Turno finale: 60 secondi no-stop, tema scelto 10 secondi prima dall\'host',
      'Beatbox: deve includere almeno 1 suono "impossibile" ogni turno',
    ],
    window: 'Sfida valida dopo vittoria in battle ufficiale SD.',
    ps: 'Beat Saber / Beat Snap',
  },
  {
    emoji: '🎵', name: 'Beatmaking', day: 'Giorno 2',
    format: 'Beat in 10 minuti con campionatore fisso uguale per tutti — produzione live sul palco',
    standard: ['10 minuti esatti', 'Stesso strumento per tutti', 'Presentazione finale'],
    assurde: [
      'Il sample base è svelato SOLO all\'inizio — nessuna preparazione',
      'Deve includere almeno 1 suono catturato live dall\'ambiente dell\'evento',
      'Il beat vincitore va su Spotify come "SD Official Beat Vol.N" — stream = royalty per atleta e holder',
      'Giudizio: 40% tecnica, 30% reazione pubblico, 30% "ripetibilità"',
      'Supera i 10 minuti anche di 1 secondo: squalifica automatica',
    ],
    window: 'Sfida valida dopo vittoria in sessione live ufficiale.',
    ps: 'GarageBand challenge — tutti stessa sessione',
  },
  {
    emoji: '💃', name: 'Danza / Breaking', day: 'Giorno 2',
    format: 'Freestyle 90 secondi + battle 1v1 a scelta stilistica',
    standard: ['90 secondi freestyle', 'Battle 1v1', 'Giudici tecnici + crowd'],
    assurde: [
      'Freeze battle bonus: turno extra solo di freeze — chi tiene la posizione più difficile più a lungo vince',
      '"DROP call": se 60% del pubblico urla "DROP", il DJ drappa il beat in quel momento esatto',
      'Il campione sceglie lo stile per la Window Challenge',
      '"Wild style": l\'host annuncia 30s prima la fine — l\'ultimo movimento deve essere sincronizzato con l\'ultimo beat',
      'Clip con 100k views organiche in 48h → certificazione automatica Historic Moment',
    ],
    window: 'Sfida valida dopo vittoria in cypher ufficiale SD.',
    ps: 'Just Dance su canzoni votate dalla community live',
  },
  {
    emoji: '🛹', name: 'Skate', day: 'Giorno 3',
    format: 'Best trick in 5 tentativi + line completa',
    standard: ['5 tentativi per best trick', 'Line completa giudicata', 'Ostacoli fissi'],
    assurde: [
      '"Spirit point": caduta coraggiosa su ostacolo difficile non penalizza — premia il rischio',
      '"First Ever": trick mai tentato in nessun evento SD precedente → card update permanente',
      '"Salvataggio pubblico": se urlano abbastanza, il giudice può concedere un tentativo extra (1 per gara)',
      'Trick con atterraggio perfetto che fa alzare il pubblico → Historic Moment candidato automatico',
      '"Victory lap": 60 secondi su qualsiasi ostacolo dopo la vittoria — tutto filmato per il drop',
    ],
    window: 'Sfida valida dopo vittoria in sessione best trick ufficiale.',
    ps: 'Tony Hawk Pro Skater — same scoring logic',
  },
  {
    emoji: '🏍️', name: 'Moto Stunt', day: 'Giorno 3',
    format: 'Round in pista chiusa, scoring tecnico + crowd reaction',
    standard: ['Pista chiusa', 'Scoring tecnico', 'Safety gear obbligatorio'],
    assurde: [
      'Solo stunt freestyle, zero velocità — chi cerca di "vincere per velocità" viene squalificato',
      'Il video dello stunt va obbligatoriamente su TikTok entro 30 minuti — le view nelle 24h contano il 20% del punteggio card',
      '"Blind stunt": una manovra con ostacolo scelto dall\'organizzazione 60 secondi prima',
      'Momento di silenzio totale certificato dall\'host → Historic Moment candidato automatico',
      'Il campione sceglie il terreno — ma lo sfidante sceglie la categoria di stunt',
    ],
    window: 'Sfida valida dopo vittoria in sessione stunt ufficiale.',
    ps: 'MotoGP game + Trials Rising',
  },
  {
    emoji: '🚗', name: 'Drifting / Auto', day: 'Giorno 3',
    format: 'Sessioni di drift in pista chiusa — scoring: angolo + fumo + linea + crowd reaction',
    standard: ['Pista chiusa omologata', 'Scoring: angolo, fumo, linea', 'One lap format'],
    assurde: [
      'One lap each — chi fa la migliore singola lap vince. Un giro. La pressione è totale.',
      'L\'auto del vincitore viene avvolta nel livello della sua card — wrap "SD Legendary Edition" fotografato come NFT asset fisico',
      '"Fan favourite line": la linea più spettacolare anche se non tecnicamente perfetta riceve bonus card',
      'L\'auto tocca il cordolo: manche nulla — senza appelli',
      '"Tandem option": se entrambi d\'accordo, tandem run giudicato come unica performance',
    ],
    window: 'Sfida valida dopo vittoria in sessione drift ufficiale.',
    ps: 'Gran Turismo — same one-lap format, same track',
  },
  {
    emoji: '💪', name: 'Powerlifting / Street Workout / Arti Marziali', day: 'Giorno 4',
    format: 'Categorie per peso corporeo + specialità',
    standard: ['Categorie di peso', 'Arbitro certificato', 'Protezioni obbligatorie'],
    assurde: [
      'Record personale certificato = Historic Moment automatico',
      'Il lift deve essere completato entro 3 secondi dal segnale — 30 secondi max di preparazione',
      'Street Workout: ogni routine deve includere un elemento mai visto in nessun evento SD — altrimenti vale il 70%',
      'In caso di parità sul peso: vince chi ha il punteggio card più basso (premia la sorpresa)',
      '"Double or nothing": tentativo al doppio del PR — se riesce: triplo punti + Historic Moment. Se fallisce: zero.',
    ],
    window: 'Sfida valida dopo vittoria in competizione ufficiale.',
    ps: 'WWE 2K / UFC 5 secondo disciplina del giorno',
  },
  {
    emoji: '🥋', name: 'MMA / Kickboxing', day: 'Giorno 4',
    format: 'Regole adattate punto-per-punto, protezioni obbligatorie, categorie di peso',
    standard: ['Protezioni obbligatorie', 'Categorie di peso', 'Arbitro certificato'],
    assurde: [
      'Un round unico fino a KO tecnico o tap out — nessun giudice di punti, nessun tempo fisso',
      'Se nessuno cede entro 5 minuti: "sudden death" — ogni colpo pulito vale 2× sul punteggio card',
      '"Ground and pound" permesso solo per 10 secondi consecutivi — poi arbitro interrompe e si torna in piedi',
      'KO tecnico confermato entro 3 secondi → Historic Moment NFT automatico',
    ],
    window: 'Sfida valida dopo vittoria in match ufficiale SD.',
    ps: 'UFC 5',
  },
  {
    emoji: '🎾', name: 'Sport Singolari', day: 'Giorno 5',
    format: 'Tennis · Ping Pong · Kendo · Biliardo · Freccette · Badminton — eliminazione diretta 1v1',
    standard: ['Tabellone alla vista', '1v1 eliminazione diretta', 'Regole standard adattate'],
    assurde: [
      'Tennis: set da 4 game. "Sudden death" sull\'ultimo game: primo punto vince il game.',
      'Ping Pong: "spin obbligatorio" — ogni terzo colpo deve essere con effetto spin',
      'Kendo: match fino a 2 ippon. Un ippon cancellato per comportamento antisportivo = sconfitta immediata.',
      'Biliardo: ogni buca valida → dichiarare ad alta voce la buca successiva PRIMA di eseguire',
      'Freccette: formato 301, bullseye vale 75 invece di 50, double in / double out obbligatorio',
      'Badminton: servizio cambia ogni 2 punti indipendentemente da chi ha segnato',
    ],
    window: 'Sfida valida dopo vittoria nel proprio formato 1v1 ufficiale.',
    ps: 'Wii Sports revival / EA Sports collection — stessa logica 1v1',
  },
];

function DisciplineCard({ d }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      layout
      className="border border-fire-3/15 bg-black/40 overflow-hidden"
      style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))' }}
    >
      <button
        className="w-full flex items-center justify-between p-4 hover:bg-fire-3/5 transition-all"
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex items-center gap-3 text-left">
          <span className="text-3xl">{d.emoji}</span>
          <div>
            <div className="font-orbitron font-bold text-base text-fire-4">{d.name}</div>
            <div className="font-mono text-[10px] text-white/30 uppercase tracking-[1px]">{d.day} · {d.format}</div>
          </div>
        </div>
        <ChevronDown size={16} className={`text-fire-3/50 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-5 space-y-4 border-t border-fire-3/10">
              {/* Regole Assurde */}
              <div className="pt-4">
                <p className="font-mono text-[10px] uppercase tracking-[3px] text-fire-3/60 mb-2">🔥 Regole Assurde SD</p>
                <ul className="space-y-2">
                  {d.assurde.map((r, i) => (
                    <li key={i} className="flex gap-2 font-rajdhani text-sm text-white/65">
                      <span className="text-fire-3 flex-shrink-0">•</span>{r}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Window Challenge */}
              <div className="p-3 border border-yellow-500/20 bg-yellow-500/5">
                <p className="font-mono text-[10px] uppercase tracking-[2px] text-yellow-500/60 mb-1">👑 Window Challenge</p>
                <p className="font-rajdhani text-sm text-yellow-200/70">{d.window}</p>
              </div>

              {/* PlayStation Corner */}
              <div className="p-3 border border-purple-500/20 bg-purple-500/5">
                <p className="font-mono text-[10px] uppercase tracking-[2px] text-purple-400/60 mb-1">🎮 PlayStation Corner</p>
                <p className="font-rajdhani text-sm text-purple-200/70">{d.ps}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function Discipline() {
  const [lang, setLang] = useLang();

  return (
    <div className="relative min-h-screen bg-cyber-void text-[var(--text-main)]">
      <CyberOverlays />
      <Navbar onScrollTo={() => {}} lang={lang} onLangSwitch={setLang} onProfileClick={() => {}} />

      <div className="pt-[80px] section-container max-w-3xl">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <p className="font-mono text-[10px] tracking-[7px] uppercase text-fire-3/40 mb-3">IL SISTEMA</p>
          <h1 className="heading-fire text-[clamp(40px,8vw,80px)] font-black leading-none mb-4">DISCIPLINE</h1>
          <p className="font-rajdhani text-lg text-white/40 max-w-xl mx-auto">Regole standard + Regole Assurde SD — quelle che ci rendono unici. Clicca ogni disciplina per espandere.</p>
        </motion.div>

        <div className="space-y-3">
          {DISCIPLINES.map((d, i) => (
            <motion.div key={d.name} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
              <DisciplineCard d={d} />
            </motion.div>
          ))}
        </div>
      </div>

      <FireRule />
      <Footer lang={lang} />
    </div>
  );
}