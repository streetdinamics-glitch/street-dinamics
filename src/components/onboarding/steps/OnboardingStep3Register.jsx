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

const LABELS = {
  it: {
    step: 'STEP 2 DI 4',
    title: 'CHI SEI?',
    sub: 'Nessun documento. Nessun dato personale. Solo quello che serve.',
    name: 'Nome *',
    phone: '📱 Numero WhatsApp *',
    phoneSub: 'Il canale principale — obbligatorio',
    email: 'Email * (solo per conferma account)',
    password: 'Password *',
    passwordSub: 'min 8 caratteri',
    discipline: 'Disciplina principale *',
    selectDisc: '— Seleziona —',
    role: 'Sei qui come... *',
    athlete: 'Atleta',
    athleteSub: 'partecipa alle competizioni',
    fan: 'Fan / Visitatore',
    fanSub: 'segue gli eventi',
    terms: 'Accetto i Termini di Servizio',
    privacy: 'Accetto la Privacy Policy',
    register: 'Registrati →',
    registering: 'Registrazione...',
    error: 'Errore. Riprova.',
    note: 'Documenti e dati anagrafici saranno richiesti solo al momento dell\'iscrizione a un evento.',
  },
  en: {
    step: 'STEP 2 OF 4',
    title: 'WHO ARE YOU?',
    sub: 'No documents. No personal data. Just what\'s needed.',
    name: 'Name *',
    phone: '📱 WhatsApp Number *',
    phoneSub: 'Main channel — required',
    email: 'Email * (account confirmation only)',
    password: 'Password *',
    passwordSub: 'min 8 characters',
    discipline: 'Main Discipline *',
    selectDisc: '— Select —',
    role: 'You are here as... *',
    athlete: 'Athlete',
    athleteSub: 'compete in events',
    fan: 'Fan / Visitor',
    fanSub: 'follow events',
    terms: 'I accept the Terms of Service',
    privacy: 'I accept the Privacy Policy',
    register: 'Register →',
    registering: 'Registering...',
    error: 'Error. Try again.',
    note: 'ID documents and personal data will only be required when registering for an event.',
  },
  es: {
    step: 'PASO 2 DE 4',
    title: '¿QUIÉN ERES?',
    sub: 'Sin documentos. Sin datos personales. Solo lo necesario.',
    name: 'Nombre *',
    phone: '📱 Número WhatsApp *',
    phoneSub: 'Canal principal — obligatorio',
    email: 'Email * (solo confirmación de cuenta)',
    password: 'Contraseña *',
    passwordSub: 'mín 8 caracteres',
    discipline: 'Disciplina principal *',
    selectDisc: '— Seleccionar —',
    role: 'Estás aquí como... *',
    athlete: 'Atleta',
    athleteSub: 'participa en competiciones',
    fan: 'Fan / Visitante',
    fanSub: 'sigue los eventos',
    terms: 'Acepto los Términos de Servicio',
    privacy: 'Acepto la Política de Privacidad',
    register: 'Registrarse →',
    registering: 'Registrando...',
    error: 'Error. Inténtalo de nuevo.',
    note: 'Los documentos y datos personales solo se solicitarán al inscribirse en un evento.',
  },
  fr: {
    step: 'ÉTAPE 2 SUR 4',
    title: 'QUI ES-TU ?',
    sub: 'Aucun document. Aucune donnée personnelle. Juste l\'essentiel.',
    name: 'Nom *',
    phone: '📱 Numéro WhatsApp *',
    phoneSub: 'Canal principal — obligatoire',
    email: 'Email * (confirmation de compte uniquement)',
    password: 'Mot de passe *',
    passwordSub: 'min 8 caractères',
    discipline: 'Discipline principale *',
    selectDisc: '— Sélectionner —',
    role: 'Tu es ici en tant que... *',
    athlete: 'Athlète',
    athleteSub: 'participe aux compétitions',
    fan: 'Fan / Visiteur',
    fanSub: 'suit les événements',
    terms: 'J\'accepte les Conditions d\'utilisation',
    privacy: 'J\'accepte la Politique de confidentialité',
    register: 'S\'inscrire →',
    registering: 'Inscription...',
    error: 'Erreur. Réessaie.',
    note: 'Les documents et données personnelles ne seront demandés que lors de l\'inscription à un événement.',
  },
  ar: {
    step: 'الخطوة 2 من 4',
    title: 'من أنت؟',
    sub: 'لا وثائق. لا بيانات شخصية. فقط ما هو ضروري.',
    name: 'الاسم *',
    phone: '📱 رقم واتساب *',
    phoneSub: 'القناة الرئيسية — إلزامي',
    email: 'البريد الإلكتروني * (تأكيد الحساب فقط)',
    password: 'كلمة المرور *',
    passwordSub: '8 أحرف على الأقل',
    discipline: 'التخصص الرئيسي *',
    selectDisc: '— اختر —',
    role: 'أنت هنا بصفة... *',
    athlete: 'رياضي',
    athleteSub: 'يشارك في المسابقات',
    fan: 'مشجع / زائر',
    fanSub: 'يتابع الأحداث',
    terms: 'أوافق على شروط الخدمة',
    privacy: 'أوافق على سياسة الخصوصية',
    register: 'سجّل →',
    registering: 'جارٍ التسجيل...',
    error: 'خطأ. حاول مجدداً.',
    note: 'ستُطلب الوثائق والبيانات الشخصية فقط عند التسجيل في حدث.',
  },
  de: {
    step: 'SCHRITT 2 VON 4',
    title: 'WER BIST DU?',
    sub: 'Keine Dokumente. Keine persönlichen Daten. Nur das Nötigste.',
    name: 'Name *',
    phone: '📱 WhatsApp-Nummer *',
    phoneSub: 'Hauptkanal — erforderlich',
    email: 'E-Mail * (nur Kontobestätigung)',
    password: 'Passwort *',
    passwordSub: 'mind. 8 Zeichen',
    discipline: 'Hauptdisziplin *',
    selectDisc: '— Auswählen —',
    role: 'Du bist hier als... *',
    athlete: 'Athlet',
    athleteSub: 'nimmt an Wettkämpfen teil',
    fan: 'Fan / Besucher',
    fanSub: 'verfolgt Events',
    terms: 'Ich akzeptiere die Nutzungsbedingungen',
    privacy: 'Ich akzeptiere die Datenschutzrichtlinie',
    register: 'Registrieren →',
    registering: 'Registrierung...',
    error: 'Fehler. Versuch es nochmal.',
    note: 'Ausweisdokumente und persönliche Daten werden nur bei der Event-Anmeldung abgefragt.',
  },
};

export default function OnboardingStep3Register({ onNext, lang = 'it' }) {
  const L = LABELS[lang] || LABELS.it;

  const [form, setForm] = useState({
    name: '', phone: '', email: '', password: '',
    discipline: '', role: '',
    terms: false, privacy: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const canSubmit =
    form.name.trim() &&
    form.phone.trim() &&
    form.email.trim() &&
    form.password.length >= 8 &&
    form.discipline &&
    form.role &&
    form.terms &&
    form.privacy;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError('');
    try {
      await base44.auth.updateMe({
        full_name: form.name,
        role: form.role === 'athlete' ? 'athlete' : 'user',
        phone: form.phone,
        discipline: form.discipline,
        onboarding_completed: true,
      });
      onNext({
        name: form.name,
        phone: form.phone,
        role: form.role,
        discipline: form.discipline,
      });
    } catch (err) {
      setError(L.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative z-10 flex flex-col items-center justify-start min-h-full px-5 py-8 max-w-lg mx-auto w-full overflow-y-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6 w-full">
        <p className="font-mono text-[9px] tracking-[6px] uppercase text-fire-3/40 mb-2">{L.step}</p>
        <h2 className="heading-fire text-[clamp(26px,5vw,46px)] font-black leading-none mb-2">{L.title}</h2>
        <p className="font-rajdhani text-sm text-white/40">{L.sub}</p>
      </motion.div>

      <form onSubmit={handleSubmit} className="w-full space-y-3">
        {/* Name */}
        <div>
          <label className="font-mono text-[9px] uppercase tracking-[2px] text-fire-3/50 block mb-1">{L.name}</label>
          <input
            className="cyber-input"
            value={form.name}
            onChange={e => set('name', e.target.value)}
            placeholder="Marco Rossi"
            required
          />
        </div>

        {/* WhatsApp */}
        <div>
          <label className="font-mono text-[9px] uppercase tracking-[2px] text-fire-3/50 block mb-1">{L.phone}</label>
          <input
            className="cyber-input border-fire-3/30"
            type="tel"
            value={form.phone}
            onChange={e => set('phone', e.target.value)}
            placeholder="+39 333 000 0000"
            required
          />
          <p className="font-mono text-[8px] text-fire-3/30 mt-1">{L.phoneSub}</p>
        </div>

        {/* Email */}
        <div>
          <label className="font-mono text-[9px] uppercase tracking-[2px] text-fire-3/50 block mb-1">{L.email}</label>
          <input
            className="cyber-input"
            type="email"
            value={form.email}
            onChange={e => set('email', e.target.value)}
            placeholder="marco@email.com"
            required
          />
        </div>

        {/* Password */}
        <div>
          <label className="font-mono text-[9px] uppercase tracking-[2px] text-fire-3/50 block mb-1">
            {L.password} <span className="text-white/25 normal-case">{L.passwordSub}</span>
          </label>
          <input
            className="cyber-input"
            type="password"
            value={form.password}
            onChange={e => set('password', e.target.value)}
            placeholder="••••••••"
            required
            minLength={8}
          />
        </div>

        {/* Discipline */}
        <div>
          <label className="font-mono text-[9px] uppercase tracking-[2px] text-fire-3/50 block mb-1">{L.discipline}</label>
          <select className="cyber-input" value={form.discipline} onChange={e => set('discipline', e.target.value)} required>
            <option value="">{L.selectDisc}</option>
            {DISCIPLINES.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        {/* Role */}
        <div>
          <label className="font-mono text-[9px] uppercase tracking-[2px] text-fire-3/50 block mb-2">{L.role}</label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'athlete', emoji: '🏆', label: L.athlete, sub: L.athleteSub },
              { id: 'fan', emoji: '👀', label: L.fan, sub: L.fanSub },
            ].map(r => (
              <button
                key={r.id}
                type="button"
                onClick={() => set('role', r.id)}
                className={`p-4 border text-left transition-all ${
                  form.role === r.id ? 'border-fire-3 bg-fire-3/10' : 'border-white/10 hover:border-fire-3/40'
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

        {/* Consents */}
        <div className="space-y-2 pt-1">
          {[
            { key: 'terms', label: L.terms },
            { key: 'privacy', label: L.privacy },
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

        {/* Note about personal info */}
        <div className="px-3 py-2.5 bg-fire-3/5 border border-fire-3/15 mt-1">
          <p className="font-mono text-[9px] text-fire-3/50 leading-relaxed">
            ℹ️ {L.note}
          </p>
        </div>

        {error && <p className="font-mono text-[10px] text-red-400 text-center">{error}</p>}

        <div className="pt-2 pb-8">
          <button
            type="submit"
            disabled={!canSubmit || loading}
            className={`btn-fire w-full text-[12px] tracking-[3px] py-4 transition-all ${!canSubmit || loading ? 'opacity-30 cursor-not-allowed' : ''}`}
          >
            {loading ? L.registering : L.register}
          </button>
        </div>
      </form>
    </div>
  );
}