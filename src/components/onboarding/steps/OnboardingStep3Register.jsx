import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';

const DISCIPLINES = [
  'Calcio', 'Basket', 'Pallavolo',
  'Freestyle Rap', 'Beatbox', 'Beatmaking', 'Danza / Breaking',
  'Skate', 'Moto Stunt', 'Drifting / Auto', 'BMX',
  'Powerlifting / Street Workout',
  'MMA / Kickboxing', 'Taekwondo',
  'Tennis', 'Ping Pong', 'Kendo', 'Biliardo', 'Freccette', 'Badminton',
];

function calcAge(dob) {
  if (!dob) return null;
  const today = new Date();
  const birth = new Date(dob);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export default function OnboardingStep3Register({ onNext }) {
  const [form, setForm] = useState({
    nome: '', cognome: '', email: '', password: '', phone: '',
    dob: '', discipline: '', role: '',
    terms: false, privacy: false, image_rights: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const age = calcAge(form.dob);
  const isMinor = age !== null && age < 18;

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const canSubmit =
    form.nome && form.cognome && form.email && form.password.length >= 8 &&
    form.phone && form.dob && form.discipline && form.role &&
    form.terms && form.privacy && form.image_rights;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError('');

    try {
      // Save user data via updateMe (user is already authenticated via base44 auth)
      await base44.auth.updateMe({
        full_name: `${form.nome} ${form.cognome}`,
        role: form.role === 'atleta' ? 'athlete' : 'user',
        phone: form.phone,
        date_of_birth: form.dob,
        discipline: form.discipline,
        is_minor: isMinor,
        onboarding_completed: true,
      });

      onNext({
        nome: form.nome,
        cognome: form.cognome,
        phone: form.phone,
        role: form.role,
        discipline: form.discipline,
        isMinor,
      });
    } catch (err) {
      setError('Errore durante la registrazione. Riprova.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative z-10 flex flex-col items-center justify-start min-h-full px-5 py-10 max-w-lg mx-auto w-full overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6 w-full"
      >
        <p className="font-mono text-[9px] tracking-[6px] uppercase text-fire-3/40 mb-2">STEP 2 DI 4</p>
        <h2 className="heading-fire text-[clamp(26px,5vw,46px)] font-black leading-none mb-2">
          CHI SEI?
        </h2>
        <p className="font-rajdhani text-sm text-white/40">
          La mail è usata SOLO per conferma account. Tutto il resto via WhatsApp.
        </p>
      </motion.div>

      <form onSubmit={handleSubmit} className="w-full space-y-3">
        {/* Nome / Cognome */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="font-mono text-[9px] uppercase tracking-[2px] text-fire-3/50 block mb-1">Nome *</label>
            <input className="cyber-input" value={form.nome} onChange={e => set('nome', e.target.value)} placeholder="Marco" required />
          </div>
          <div>
            <label className="font-mono text-[9px] uppercase tracking-[2px] text-fire-3/50 block mb-1">Cognome *</label>
            <input className="cyber-input" value={form.cognome} onChange={e => set('cognome', e.target.value)} placeholder="Rossi" required />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="font-mono text-[9px] uppercase tracking-[2px] text-fire-3/50 block mb-1">
            Email * <span className="text-white/25 normal-case">(solo per conferma account)</span>
          </label>
          <input className="cyber-input" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="marco@email.com" required />
        </div>

        {/* Password */}
        <div>
          <label className="font-mono text-[9px] uppercase tracking-[2px] text-fire-3/50 block mb-1">Password * <span className="text-white/25">min 8 caratteri</span></label>
          <input className="cyber-input" type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="••••••••" required minLength={8} />
        </div>

        {/* WhatsApp */}
        <div>
          <label className="font-mono text-[9px] uppercase tracking-[2px] text-fire-3/50 block mb-1">
            📱 Numero WhatsApp * <span className="text-fire-3/70">— il canale reale</span>
          </label>
          <input className="cyber-input border-fire-3/30" type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+39 333 000 0000" required />
          <p className="font-mono text-[8px] text-fire-3/30 mt-1">Senza questo numero non funziona nulla. Obbligatorio.</p>
        </div>

        {/* Data di nascita */}
        <div>
          <label className="font-mono text-[9px] uppercase tracking-[2px] text-fire-3/50 block mb-1">Data di nascita *</label>
          <input className="cyber-input" type="date" value={form.dob} onChange={e => set('dob', e.target.value)} required />
          {isMinor && (
            <div className="mt-2 px-3 py-2 bg-yellow-500/10 border border-yellow-500/30">
              <p className="font-mono text-[10px] text-yellow-400">
                ⚠️ Sei minorenne — invieremo un messaggio WhatsApp al numero inserito per la conferma del genitore/tutore.
              </p>
            </div>
          )}
        </div>

        {/* Disciplina */}
        <div>
          <label className="font-mono text-[9px] uppercase tracking-[2px] text-fire-3/50 block mb-1">Disciplina principale *</label>
          <select className="cyber-input" value={form.discipline} onChange={e => set('discipline', e.target.value)} required>
            <option value="">— Seleziona —</option>
            {DISCIPLINES.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        {/* Ruolo */}
        <div>
          <label className="font-mono text-[9px] uppercase tracking-[2px] text-fire-3/50 block mb-2">Sei qui come... *</label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'atleta', emoji: '🏆', label: 'Atleta', sub: 'partecipa alle competizioni' },
              { id: 'fan', emoji: '👀', label: 'Fan / Visitatore', sub: 'segue gli eventi' },
            ].map(r => (
              <button
                key={r.id}
                type="button"
                onClick={() => set('role', r.id)}
                className={`p-4 border text-left transition-all ${
                  form.role === r.id
                    ? 'border-fire-3 bg-fire-3/10'
                    : 'border-white/10 bg-white/3 hover:border-fire-3/40'
                }`}
                style={{ clipPath: 'polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)' }}
              >
                <div className="text-2xl mb-1">{r.emoji}</div>
                <div className="font-orbitron font-bold text-sm text-fire-4">{r.label}</div>
                <div className="font-rajdhani text-xs text-white/40">{r.sub}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Consensi */}
        <div className="space-y-2 pt-2">
          {[
            { key: 'terms', label: 'Accetto i Termini di Servizio' },
            { key: 'privacy', label: 'Accetto la Privacy Policy' },
            { key: 'image_rights', label: 'Acconsento al trattamento delle immagini' },
          ].map(c => (
            <label key={c.key} className="flex items-center gap-3 cursor-pointer group">
              <div
                onClick={() => set(c.key, !form[c.key])}
                className={`w-5 h-5 border flex items-center justify-center flex-shrink-0 transition-all ${
                  form[c.key] ? 'border-fire-3 bg-fire-3/20' : 'border-white/20 group-hover:border-fire-3/40'
                }`}
              >
                {form[c.key] && <span className="text-fire-3 text-xs font-bold">✓</span>}
              </div>
              <span className="font-rajdhani text-sm text-white/60">{c.label}</span>
            </label>
          ))}
        </div>

        {error && (
          <p className="font-mono text-[10px] text-red-400 text-center">{error}</p>
        )}

        <div className="pt-2 pb-6">
          <button
            type="submit"
            disabled={!canSubmit || loading}
            className={`btn-fire w-full text-[12px] tracking-[3px] py-4 transition-all ${
              !canSubmit || loading ? 'opacity-30 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Registrazione...' : 'Registrati →'}
          </button>
        </div>
      </form>
    </div>
  );
}