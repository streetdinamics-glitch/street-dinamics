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

// International dial codes
const DIAL_CODES = [
  { code: '+39', flag: '🇮🇹', name: 'Italy' },
  { code: '+44', flag: '🇬🇧', name: 'UK' },
  { code: '+1', flag: '🇺🇸', name: 'USA' },
  { code: '+33', flag: '🇫🇷', name: 'France' },
  { code: '+49', flag: '🇩🇪', name: 'Germany' },
  { code: '+34', flag: '🇪🇸', name: 'Spain' },
  { code: '+971', flag: '🇦🇪', name: 'UAE' },
  { code: '+966', flag: '🇸🇦', name: 'Saudi Arabia' },
  { code: '+55', flag: '🇧🇷', name: 'Brazil' },
  { code: '+52', flag: '🇲🇽', name: 'Mexico' },
  { code: '+81', flag: '🇯🇵', name: 'Japan' },
  { code: '+86', flag: '🇨🇳', name: 'China' },
];

const LABELS = {
  it: {
    step: 'STEP 2 DI 4',
    title: 'CHI SEI?',
    sub: 'Nessun documento. Solo quello che serve.',
    name: 'Nome completo *',
    namePlaceholder: 'Marco Rossi',
    nameError: 'Inserisci il tuo nome',
    phone: '📱 Numero WhatsApp *',
    phonePlaceholder: '333 000 0000',
    phoneSub: 'Sarà il tuo canale principale di comunicazione.',
    phoneError: 'Numero non valido (minimo 7 cifre)',
    discipline: 'Disciplina principale *',
    selectDisc: '— Seleziona —',
    discError: 'Seleziona una disciplina',
    role: 'Sei qui come... *',
    roleError: 'Seleziona un ruolo',
    athlete: 'Atleta',
    athleteSub: 'partecipa alle competizioni',
    fan: 'Fan / Visitatore',
    fanSub: 'segue gli eventi',
    terms: 'Accetto i Termini di Servizio',
    privacy: 'Accetto la Privacy Policy',
    register: 'Continua →',
    registering: 'Salvataggio...',
    errorGeneric: 'Errore di rete. Riprova.',
    note: 'Documenti e dati anagrafici saranno richiesti solo al momento dell\'iscrizione a un evento.',
  },
  en: {
    step: 'STEP 2 OF 4',
    title: 'WHO ARE YOU?',
    sub: 'No documents. Just what\'s needed.',
    name: 'Full name *',
    namePlaceholder: 'Marco Rossi',
    nameError: 'Enter your name',
    phone: '📱 WhatsApp Number *',
    phonePlaceholder: '333 000 0000',
    phoneSub: 'This will be your main communication channel.',
    phoneError: 'Invalid number (minimum 7 digits)',
    discipline: 'Main Discipline *',
    selectDisc: '— Select —',
    discError: 'Select a discipline',
    role: 'You are here as... *',
    roleError: 'Select a role',
    athlete: 'Athlete',
    athleteSub: 'compete in events',
    fan: 'Fan / Visitor',
    fanSub: 'follow events',
    terms: 'I accept the Terms of Service',
    privacy: 'I accept the Privacy Policy',
    register: 'Continue →',
    registering: 'Saving...',
    errorGeneric: 'Network error. Try again.',
    note: 'ID documents and personal data will only be required when registering for an event.',
  },
  es: {
    step: 'PASO 2 DE 4',
    title: '¿QUIÉN ERES?',
    sub: 'Sin documentos. Solo lo necesario.',
    name: 'Nombre completo *',
    namePlaceholder: 'Marco Rossi',
    nameError: 'Introduce tu nombre',
    phone: '📱 Número WhatsApp *',
    phonePlaceholder: '333 000 0000',
    phoneSub: 'Este será tu canal principal de comunicación.',
    phoneError: 'Número inválido (mínimo 7 dígitos)',
    discipline: 'Disciplina principal *',
    selectDisc: '— Seleccionar —',
    discError: 'Selecciona una disciplina',
    role: 'Estás aquí como... *',
    roleError: 'Selecciona un rol',
    athlete: 'Atleta',
    athleteSub: 'participa en competiciones',
    fan: 'Fan / Visitante',
    fanSub: 'sigue los eventos',
    terms: 'Acepto los Términos de Servicio',
    privacy: 'Acepto la Política de Privacidad',
    register: 'Continuar →',
    registering: 'Guardando...',
    errorGeneric: 'Error de red. Inténtalo de nuevo.',
    note: 'Los documentos solo se solicitarán al inscribirse en un evento.',
  },
  fr: {
    step: 'ÉTAPE 2 SUR 4',
    title: 'QUI ES-TU ?',
    sub: 'Aucun document. Juste l\'essentiel.',
    name: 'Nom complet *',
    namePlaceholder: 'Marco Rossi',
    nameError: 'Entrez votre nom',
    phone: '📱 Numéro WhatsApp *',
    phonePlaceholder: '333 000 0000',
    phoneSub: 'Ce sera ton canal principal de communication.',
    phoneError: 'Numéro invalide (minimum 7 chiffres)',
    discipline: 'Discipline principale *',
    selectDisc: '— Sélectionner —',
    discError: 'Sélectionne une discipline',
    role: 'Tu es ici en tant que... *',
    roleError: 'Sélectionne un rôle',
    athlete: 'Athlète',
    athleteSub: 'participe aux compétitions',
    fan: 'Fan / Visiteur',
    fanSub: 'suit les événements',
    terms: 'J\'accepte les Conditions d\'utilisation',
    privacy: 'J\'accepte la Politique de confidentialité',
    register: 'Continuer →',
    registering: 'Enregistrement...',
    errorGeneric: 'Erreur réseau. Réessaie.',
    note: 'Les documents ne seront demandés que lors de l\'inscription à un événement.',
  },
  ar: {
    step: 'الخطوة 2 من 4',
    title: 'من أنت؟',
    sub: 'لا وثائق. فقط ما هو ضروري.',
    name: 'الاسم الكامل *',
    namePlaceholder: 'Marco Rossi',
    nameError: 'أدخل اسمك',
    phone: '📱 رقم واتساب *',
    phonePlaceholder: '333 000 0000',
    phoneSub: 'هذا سيكون قناتك الرئيسية للتواصل.',
    phoneError: 'رقم غير صالح (7 أرقام على الأقل)',
    discipline: 'التخصص الرئيسي *',
    selectDisc: '— اختر —',
    discError: 'اختر تخصصاً',
    role: 'أنت هنا بصفة... *',
    roleError: 'اختر دوراً',
    athlete: 'رياضي',
    athleteSub: 'يشارك في المسابقات',
    fan: 'مشجع / زائر',
    fanSub: 'يتابع الأحداث',
    terms: 'أوافق على شروط الخدمة',
    privacy: 'أوافق على سياسة الخصوصية',
    register: 'استمر →',
    registering: 'جارٍ الحفظ...',
    errorGeneric: 'خطأ في الشبكة. حاول مجدداً.',
    note: 'ستُطلب الوثائق فقط عند التسجيل في حدث.',
  },
  de: {
    step: 'SCHRITT 2 VON 4',
    title: 'WER BIST DU?',
    sub: 'Keine Dokumente. Nur das Nötigste.',
    name: 'Vollständiger Name *',
    namePlaceholder: 'Marco Rossi',
    nameError: 'Gib deinen Namen ein',
    phone: '📱 WhatsApp-Nummer *',
    phonePlaceholder: '333 000 0000',
    phoneSub: 'Dies wird dein Hauptkommunikationskanal sein.',
    phoneError: 'Ungültige Nummer (mindestens 7 Ziffern)',
    discipline: 'Hauptdisziplin *',
    selectDisc: '— Auswählen —',
    discError: 'Wähle eine Disziplin',
    role: 'Du bist hier als... *',
    roleError: 'Wähle eine Rolle',
    athlete: 'Athlet',
    athleteSub: 'nimmt an Wettkämpfen teil',
    fan: 'Fan / Besucher',
    fanSub: 'verfolgt Events',
    terms: 'Ich akzeptiere die Nutzungsbedingungen',
    privacy: 'Ich akzeptiere die Datenschutzrichtlinie',
    register: 'Weiter →',
    registering: 'Speichern...',
    errorGeneric: 'Netzwerkfehler. Versuch es nochmal.',
    note: 'Ausweisdokumente werden nur bei der Event-Anmeldung abgefragt.',
  },
};

function getPasswordStrength(pw) {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score; // 0-5
}

function isValidPhone(num) {
  const digits = num.replace(/\D/g, '');
  return digits.length >= 7;
}

export default function OnboardingStep3Register({ onNext, lang = 'it' }) {
  const L = LABELS[lang] || LABELS.it;

  const [form, setForm] = useState({
    name: '', dialCode: '+39', phone: '',
    discipline: '', role: '',
    terms: false, privacy: false,
  });
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const touch = (k) => setTouched(t => ({ ...t, [k]: true }));

  const errors = {
    name: !form.name.trim() ? L.nameError : '',
    phone: !isValidPhone(form.phone) ? L.phoneError : '',
    discipline: !form.discipline ? L.discError : '',
    role: !form.role ? L.roleError : '',
  };

  const canSubmit =
    !errors.name && !errors.phone && !errors.discipline && !errors.role &&
    form.terms && form.privacy;

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Touch all fields to show errors
    setTouched({ name: true, phone: true, discipline: true, role: true });
    if (!canSubmit) return;
    setLoading(true);
    setError('');
    const fullPhone = `${form.dialCode}${form.phone.replace(/\s/g, '')}`;
    try {
      await base44.auth.updateMe({
        full_name: form.name.trim(),
        role: form.role === 'athlete' ? 'athlete' : 'user',
        phone: fullPhone,
        discipline: form.discipline,
        onboarding_completed: true,
      });
      onNext({
        name: form.name.trim(),
        phone: fullPhone,
        role: form.role,
        discipline: form.discipline,
      });
    } catch (err) {
      setError(L.errorGeneric);
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

      <form onSubmit={handleSubmit} className="w-full space-y-4">
        {/* Name */}
        <div>
          <label className="font-mono text-[9px] uppercase tracking-[2px] text-fire-3/50 block mb-1">{L.name}</label>
          <input
            className="cyber-input"
            value={form.name}
            onChange={e => set('name', e.target.value)}
            onBlur={() => touch('name')}
            placeholder={L.namePlaceholder}
          />
          {touched.name && errors.name && (
            <p className="font-mono text-[9px] text-red-400 mt-1">⚠ {errors.name}</p>
          )}
        </div>

        {/* WhatsApp with dial code selector */}
        <div>
          <label className="font-mono text-[9px] uppercase tracking-[2px] text-fire-3/50 block mb-1">{L.phone}</label>
          <div className="flex gap-2">
            <select
              className="cyber-input w-[110px] flex-shrink-0 text-sm"
              value={form.dialCode}
              onChange={e => set('dialCode', e.target.value)}
            >
              {DIAL_CODES.map(d => (
                <option key={d.code} value={d.code}>{d.flag} {d.code}</option>
              ))}
            </select>
            <input
              className="cyber-input flex-1"
              type="tel"
              value={form.phone}
              onChange={e => set('phone', e.target.value.replace(/[^\d\s]/g, ''))}
              onBlur={() => touch('phone')}
              placeholder={L.phonePlaceholder}
            />
          </div>
          <p className="font-mono text-[8px] text-fire-3/30 mt-1">💬 {L.phoneSub}</p>
          {touched.phone && errors.phone && (
            <p className="font-mono text-[9px] text-red-400 mt-1">⚠ {errors.phone}</p>
          )}
        </div>

        {/* Discipline */}
        <div>
          <label className="font-mono text-[9px] uppercase tracking-[2px] text-fire-3/50 block mb-1">{L.discipline}</label>
          <select
            className="cyber-input"
            value={form.discipline}
            onChange={e => { set('discipline', e.target.value); touch('discipline'); }}
          >
            <option value="">{L.selectDisc}</option>
            {DISCIPLINES.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          {touched.discipline && errors.discipline && (
            <p className="font-mono text-[9px] text-red-400 mt-1">⚠ {errors.discipline}</p>
          )}
        </div>

        {/* Role — always 2-column grid */}
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
                onClick={() => { set('role', r.id); touch('role'); }}
                className={`relative p-4 border text-left transition-all ${
                  form.role === r.id
                    ? 'border-fire-3 bg-fire-3/10 shadow-[0_0_14px_rgba(255,102,0,0.2)]'
                    : 'border-white/10 hover:border-fire-3/40'
                }`}
                style={{ clipPath: 'polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)' }}
              >
                {form.role === r.id && (
                  <span className="absolute top-2 right-2 text-fire-3 text-xs font-bold">✓</span>
                )}
                <div className="text-2xl mb-1">{r.emoji}</div>
                <div className="font-orbitron font-bold text-sm text-fire-4">{r.label}</div>
                <div className="font-rajdhani text-xs text-white/40">{r.sub}</div>
              </button>
            ))}
          </div>
          {touched.role && errors.role && (
            <p className="font-mono text-[9px] text-red-400 mt-1">⚠ {errors.role}</p>
          )}
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

        {/* Note */}
        <div className="px-3 py-2.5 bg-fire-3/5 border border-fire-3/15">
          <p className="font-mono text-[9px] text-fire-3/50 leading-relaxed">ℹ️ {L.note}</p>
        </div>

        {error && <p className="font-mono text-[10px] text-red-400 text-center">⚠ {error}</p>}

        <div className="pt-2 pb-8">
          <button
            type="submit"
            disabled={loading}
            className={`btn-fire w-full text-[12px] tracking-[3px] py-4 transition-all ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            {loading ? L.registering : L.register}
          </button>
        </div>
      </form>
    </div>
  );
}