import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';

const DISCIPLINES = [
  'Freestyle Rap', 'Beatbox', 'Beatmaking', 'Danza / Breaking',
  'Skate', 'BMX', 'Moto Stunt', 'Drifting / Auto',
  'MMA / Kickboxing', 'Taekwondo', 'Powerlifting / Street Workout',
  'Calcio', 'Basket', 'Pallavolo', 'Tennis', 'Ping Pong',
  'Kendo', 'Biliardo', 'Freccette', 'Badminton',
];

const DIAL_CODES = [
  { code: '+39', flag: '🇮🇹' }, { code: '+44', flag: '🇬🇧' },
  { code: '+1',  flag: '🇺🇸' }, { code: '+33', flag: '🇫🇷' },
  { code: '+49', flag: '🇩🇪' }, { code: '+34', flag: '🇪🇸' },
  { code: '+971', flag: '🇦🇪' }, { code: '+966', flag: '🇸🇦' },
  { code: '+55', flag: '🇧🇷' }, { code: '+52', flag: '🇲🇽' },
  { code: '+81', flag: '🇯🇵' }, { code: '+86', flag: '🇨🇳' },
];

const LABELS = {
  it: {
    step: 'STEP 2 DI 4 — PROFILO',
    title: 'CHI SEI?',
    sub: 'Ci vogliono 30 secondi.',
    name: 'Nome completo *', namePh: 'Marco Rossi', nameErr: 'Inserisci il tuo nome',
    phone: '📱 WhatsApp *', phonePh: '333 000 0000', phoneSub: 'Il tuo canale principale con SD.',
    phoneErr: 'Numero non valido (min. 7 cifre)',
    discAthlete: 'Disciplina principale *', discFan: 'Sport preferito *',
    selectDisc: '— Seleziona —', discErr: 'Seleziona una disciplina',
    role: 'Sei qui come... *', roleErr: 'Seleziona un ruolo',
    athlete: 'Atleta', athleteSub: 'Gareggia, crea la tua card, guadagna royalty',
    athletePerks: ['🏆 Accesso alle gare', '🃏 Card personale', '💰 Royalty sponsor', '⚡ AI Interview'],
    fan: 'Fan / Visitatore', fanSub: 'Segui, colleziona card, accumula premi',
    fanPerks: ['👀 Segui live', '🃏 Colleziona card', '🎲 Prediction Markets', '🎁 Premi community'],
    terms: 'Accetto i Termini di Servizio',
    privacy: 'Accetto la Privacy Policy',
    termsErr: 'Devi accettare i Termini', privacyErr: 'Devi accettare la Privacy Policy',
    submit: 'Continua →', submitting: 'Salvataggio...', errGeneric: 'Errore di rete. Riprova.',
    note: 'Documenti e dati anagrafici richiesti solo all\'iscrizione ad un evento.',
    rolePreview: 'Cosa ottieni:',
  },
  en: {
    step: 'STEP 2 OF 4 — PROFILE',
    title: 'WHO ARE YOU?',
    sub: 'Takes 30 seconds.',
    name: 'Full name *', namePh: 'Marco Rossi', nameErr: 'Enter your name',
    phone: '📱 WhatsApp *', phonePh: '333 000 0000', phoneSub: 'Your main channel with SD.',
    phoneErr: 'Invalid number (min. 7 digits)',
    discAthlete: 'Main Discipline *', discFan: 'Favourite sport *',
    selectDisc: '— Select —', discErr: 'Select a discipline',
    role: 'You are here as... *', roleErr: 'Select a role',
    athlete: 'Athlete', athleteSub: 'Compete, build your card, earn royalties',
    athletePerks: ['🏆 Compete', '🃏 Personal card', '💰 Sponsor royalties', '⚡ AI Interview'],
    fan: 'Fan / Visitor', fanSub: 'Follow, collect cards, earn rewards',
    fanPerks: ['👀 Follow live', '🃏 Collect cards', '🎲 Prediction Markets', '🎁 Community rewards'],
    terms: 'I accept the Terms of Service',
    privacy: 'I accept the Privacy Policy',
    termsErr: 'You must accept the Terms', privacyErr: 'You must accept the Privacy Policy',
    submit: 'Continue →', submitting: 'Saving...', errGeneric: 'Network error. Try again.',
    note: 'ID documents only required at event registration.',
    rolePreview: 'What you get:',
  },
  es: {
    step: 'PASO 2 DE 4 — PERFIL',
    title: '¿QUIÉN ERES?',
    sub: 'Tarda 30 segundos.',
    name: 'Nombre completo *', namePh: 'Marco Rossi', nameErr: 'Introduce tu nombre',
    phone: '📱 WhatsApp *', phonePh: '333 000 0000', phoneSub: 'Tu canal principal con SD.',
    phoneErr: 'Número inválido (mín. 7 dígitos)',
    discAthlete: 'Disciplina principal *', discFan: 'Deporte favorito *',
    selectDisc: '— Seleccionar —', discErr: 'Selecciona una disciplina',
    role: 'Estás aquí como... *', roleErr: 'Selecciona un rol',
    athlete: 'Atleta', athleteSub: 'Compite, crea tu card, gana regalías',
    athletePerks: ['🏆 Competir', '🃏 Card personal', '💰 Regalías sponsors', '⚡ Entrevista AI'],
    fan: 'Fan / Visitante', fanSub: 'Sigue, colecciona cards, gana premios',
    fanPerks: ['👀 Seguir en vivo', '🃏 Coleccionar cards', '🎲 Prediction Markets', '🎁 Premios'],
    terms: 'Acepto los Términos', privacy: 'Acepto la Privacidad',
    termsErr: 'Debes aceptar', privacyErr: 'Debes aceptar',
    submit: 'Continuar →', submitting: 'Guardando...', errGeneric: 'Error de red. Inténtalo.',
    note: 'Documentos solo requeridos al inscribirse en evento.',
    rolePreview: 'Lo que obtienes:',
  },
  fr: {
    step: 'ÉTAPE 2 SUR 4 — PROFIL',
    title: 'QUI ES-TU ?',
    sub: 'Ça prend 30 secondes.',
    name: 'Nom complet *', namePh: 'Marco Rossi', nameErr: 'Entrez votre nom',
    phone: '📱 WhatsApp *', phonePh: '333 000 0000', phoneSub: 'Ton canal principal avec SD.',
    phoneErr: 'Numéro invalide (min. 7 chiffres)',
    discAthlete: 'Discipline principale *', discFan: 'Sport préféré *',
    selectDisc: '— Sélectionner —', discErr: 'Sélectionne une discipline',
    role: 'Tu es ici en tant que... *', roleErr: 'Sélectionne un rôle',
    athlete: 'Athlète', athleteSub: 'Compète, crée ta card, gagne des royalties',
    athletePerks: ['🏆 Compétitions', '🃏 Card personnelle', '💰 Royalties', '⚡ Interview AI'],
    fan: 'Fan / Visiteur', fanSub: 'Suis, collectionne, gagne des récompenses',
    fanPerks: ['👀 Suivre en live', '🃏 Collectionner', '🎲 Marchés prédiction', '🎁 Récompenses'],
    terms: "J'accepte les Conditions", privacy: "J'accepte la Confidentialité",
    termsErr: 'Tu dois accepter', privacyErr: 'Tu dois accepter',
    submit: 'Continuer →', submitting: 'Enregistrement...', errGeneric: 'Erreur réseau. Réessaie.',
    note: "Documents requis uniquement lors de l'inscription à un événement.",
    rolePreview: 'Ce que tu obtiens :',
  },
  ar: {
    step: 'الخطوة 2 من 4 — الملف',
    title: 'من أنت؟',
    sub: 'يستغرق 30 ثانية.',
    name: 'الاسم الكامل *', namePh: 'Marco Rossi', nameErr: 'أدخل اسمك',
    phone: '📱 واتساب *', phonePh: '333 000 0000', phoneSub: 'قناتك الرئيسية مع SD.',
    phoneErr: 'رقم غير صالح (7 أرقام على الأقل)',
    discAthlete: 'التخصص الرئيسي *', discFan: 'الرياضة المفضلة *',
    selectDisc: '— اختر —', discErr: 'اختر تخصصاً',
    role: 'أنت هنا بصفة... *', roleErr: 'اختر دوراً',
    athlete: 'رياضي', athleteSub: 'شارك واحصل على الإتاوات',
    athletePerks: ['🏆 المسابقات', '🃏 بطاقة شخصية', '💰 الإتاوات', '⚡ مقابلة AI'],
    fan: 'مشجع / زائر', fanSub: 'تابع واجمع وراكم المكافآت',
    fanPerks: ['👀 متابعة مباشرة', '🃏 جمع البطاقات', '🎲 أسواق التنبؤ', '🎁 المكافآت'],
    terms: 'أوافق على الشروط', privacy: 'أوافق على الخصوصية',
    termsErr: 'يجب قبول الشروط', privacyErr: 'يجب قبول الخصوصية',
    submit: 'استمر →', submitting: 'جارٍ الحفظ...', errGeneric: 'خطأ في الشبكة.',
    note: 'الوثائق مطلوبة فقط عند التسجيل في حدث.',
    rolePreview: 'ما ستحصل عليه:',
  },
  de: {
    step: 'SCHRITT 2 VON 4 — PROFIL',
    title: 'WER BIST DU?',
    sub: 'Dauert 30 Sekunden.',
    name: 'Vollständiger Name *', namePh: 'Marco Rossi', nameErr: 'Gib deinen Namen ein',
    phone: '📱 WhatsApp *', phonePh: '333 000 0000', phoneSub: 'Dein Hauptkanal mit SD.',
    phoneErr: 'Ungültige Nummer (mind. 7 Ziffern)',
    discAthlete: 'Hauptdisziplin *', discFan: 'Lieblingssport *',
    selectDisc: '— Auswählen —', discErr: 'Wähle eine Disziplin',
    role: 'Du bist hier als... *', roleErr: 'Wähle eine Rolle',
    athlete: 'Athlet', athleteSub: 'Nimm teil, erstelle deine Card, verdiene Royalties',
    athletePerks: ['🏆 Wettkämpfe', '🃏 Persönliche Card', '💰 Royalties', '⚡ AI Interview'],
    fan: 'Fan / Besucher', fanSub: 'Verfolge, sammle, verdiene Prämien',
    fanPerks: ['👀 Live verfolgen', '🃏 Cards sammeln', '🎲 Prediction Markets', '🎁 Prämien'],
    terms: 'Ich akzeptiere die Nutzungsbedingungen',
    privacy: 'Ich akzeptiere die Datenschutzrichtlinie',
    termsErr: 'Du musst die Bedingungen akzeptieren', privacyErr: 'Du musst die Datenschutzrichtlinie akzeptieren',
    submit: 'Weiter →', submitting: 'Speichern...', errGeneric: 'Netzwerkfehler. Versuch es nochmal.',
    note: 'Ausweisdokumente nur bei Event-Anmeldung erforderlich.',
    rolePreview: 'Was du bekommst:',
  },
};

function isValidPhone(num) {
  return num.replace(/\D/g, '').length >= 7;
}

const ROLES = (L) => [
  { id: 'athlete', emoji: '🏆', label: L.athlete, sub: L.athleteSub, perks: L.athletePerks,
    border: 'border-fire-3', bg: 'bg-fire-3/10', shadow: '0 0 20px rgba(255,102,0,0.25)', textColor: 'text-fire-4' },
  { id: 'fan', emoji: '👀', label: L.fan, sub: L.fanSub, perks: L.fanPerks,
    border: 'border-cyan-400', bg: 'bg-cyan-400/10', shadow: '0 0 20px rgba(0,255,238,0.2)', textColor: 'text-cyan-400' },
];

export default function OnboardingStep3Register({ onNext, lang = 'it' }) {
  const L = LABELS[lang] || LABELS.it;
  const roles = ROLES(L);

  const [form, setForm] = useState({ name: '', dialCode: '+39', phone: '', discipline: '', role: '', terms: false, privacy: false });
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const touch = (k) => setTouched(t => ({ ...t, [k]: true }));

  const getErrors = (f) => ({
    name: !f.name.trim() ? L.nameErr : '',
    phone: !isValidPhone(f.phone) ? L.phoneErr : '',
    discipline: !f.discipline ? L.discErr : '',
    role: !f.role ? L.roleErr : '',
    terms: !f.terms ? L.termsErr : '',
    privacy: !f.privacy ? L.privacyErr : '',
  });

  const errors = getErrors(form);
  const allValid = !Object.values(errors).some(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ name: true, phone: true, discipline: true, role: true, terms: true, privacy: true });
    if (!allValid) return;
    setLoading(true);
    setError('');
    const fullPhone = `${form.dialCode}${form.phone.replace(/\s/g, '')}`;
    try {
      await base44.auth.updateMe({
        display_name: form.name.trim(),
        role: form.role === 'athlete' ? 'athlete' : 'user',
        phone: fullPhone,
        athlete_profile: form.role === 'athlete' ? { discipline: form.discipline } : undefined,
        spectator_profile: form.role === 'fan' ? { interests: [form.discipline] } : undefined,
        onboarding_completed: true,
      });
      onNext({ name: form.name.trim(), phone: fullPhone, role: form.role, discipline: form.discipline });
    } catch (err) {
      setError(err?.message || err?.response?.data?.detail || L.errGeneric);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative z-10 flex flex-col items-center justify-start min-h-full px-5 py-8 max-w-lg mx-auto w-full">
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6 w-full">
        <p className="font-mono text-[8px] tracking-[5px] uppercase text-fire-3/40 mb-2">{L.step}</p>
        <h2 className="heading-fire text-[clamp(24px,5vw,44px)] font-black leading-none mb-2">{L.title}</h2>
        <p className="font-rajdhani text-sm text-white/40">{L.sub}</p>
      </motion.div>

      <form onSubmit={handleSubmit} className="w-full space-y-4" noValidate>

        {/* Role selection — FIRST for context */}
        <div>
          <label className="font-mono text-[8px] uppercase tracking-[2px] text-fire-3/50 block mb-2">{L.role}</label>
          <div className="grid grid-cols-2 gap-3">
            {roles.map(r => (
              <button key={r.id} type="button"
                onClick={() => { set('role', r.id); touch('role'); }}
                className={`relative p-4 border-2 text-left transition-all duration-200 ${
                  form.role === r.id ? `${r.border} ${r.bg}` : 'border-white/10 hover:border-white/25 bg-white/[0.02]'
                }`}
                style={{ clipPath: 'polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)', boxShadow: form.role === r.id ? r.shadow : 'none' }}
              >
                {form.role === r.id && (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className={`absolute top-2 right-2 text-xs font-bold ${r.textColor}`}>✓</motion.span>
                )}
                <div className="text-2xl mb-1.5">{r.emoji}</div>
                <div className={`font-orbitron font-bold text-sm mb-0.5 ${form.role === r.id ? r.textColor : 'text-white/60'}`}>
                  {r.label}
                </div>
                <div className="font-rajdhani text-[11px] text-white/35 mb-2 leading-snug">{r.sub}</div>
                <AnimatePresence>
                  {form.role === r.id && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                      <div className={`text-[8px] font-mono uppercase tracking-[1px] mb-1 ${r.textColor} opacity-60`}>{L.rolePreview}</div>
                      {r.perks.map((p, i) => (
                        <div key={i} className={`font-mono text-[9px] ${r.textColor} opacity-70 leading-relaxed`}>{p}</div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            ))}
          </div>
          {touched.role && errors.role && <p className="font-mono text-[9px] text-red-400 mt-1">⚠ {errors.role}</p>}
        </div>

        {/* Name */}
        <div>
          <label className="font-mono text-[8px] uppercase tracking-[2px] text-fire-3/50 block mb-1">{L.name}</label>
          <input className="cyber-input" value={form.name}
            onChange={e => set('name', e.target.value)} onBlur={() => touch('name')}
            placeholder={L.namePh} autoComplete="name" />
          {touched.name && errors.name && <p className="font-mono text-[9px] text-red-400 mt-1">⚠ {errors.name}</p>}
        </div>

        {/* WhatsApp */}
        <div>
          <label className="font-mono text-[8px] uppercase tracking-[2px] text-fire-3/50 block mb-1">{L.phone}</label>
          <div className="flex gap-2">
            <select className="cyber-input w-[90px] flex-shrink-0 text-sm" value={form.dialCode}
              onChange={e => set('dialCode', e.target.value)}>
              {DIAL_CODES.map(d => <option key={d.code} value={d.code}>{d.flag} {d.code}</option>)}
            </select>
            <input className="cyber-input flex-1" type="tel" value={form.phone}
              onChange={e => set('phone', e.target.value.replace(/[^\d\s\-]/g, ''))}
              onBlur={() => touch('phone')} placeholder={L.phonePh} autoComplete="tel" />
          </div>
          <p className="font-mono text-[8px] text-fire-3/30 mt-1">💬 {L.phoneSub}</p>
          {touched.phone && errors.phone && <p className="font-mono text-[9px] text-red-400 mt-1">⚠ {errors.phone}</p>}
        </div>

        {/* Discipline — label changes based on role */}
        <div>
          <label className="font-mono text-[8px] uppercase tracking-[2px] text-fire-3/50 block mb-1">
            {form.role === 'fan' ? L.discFan : L.discAthlete}
          </label>
          <select className="cyber-input" value={form.discipline}
            onChange={e => { set('discipline', e.target.value); touch('discipline'); }}>
            <option value="">{L.selectDisc}</option>
            {DISCIPLINES.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          {touched.discipline && errors.discipline && <p className="font-mono text-[9px] text-red-400 mt-1">⚠ {errors.discipline}</p>}
        </div>

        {/* Consents */}
        <div className="space-y-2 pt-1">
          {[{ key: 'terms', label: L.terms, err: errors.terms }, { key: 'privacy', label: L.privacy, err: errors.privacy }].map(c => (
            <div key={c.key}>
              <label className="flex items-center gap-3 cursor-pointer group">
                <div onClick={() => { set(c.key, !form[c.key]); touch(c.key); }}
                  className={`w-5 h-5 border flex items-center justify-center flex-shrink-0 transition-all ${
                    form[c.key] ? 'border-fire-3 bg-fire-3/20' : 'border-white/20 group-hover:border-fire-3/40'
                  }`}>
                  {form[c.key] && <span className="text-fire-3 text-xs font-bold leading-none">✓</span>}
                </div>
                <span className="font-rajdhani text-sm text-white/60">{c.label}</span>
              </label>
              {touched[c.key] && c.err && <p className="font-mono text-[9px] text-red-400 mt-1 pl-8">⚠ {c.err}</p>}
            </div>
          ))}
        </div>

        {/* Note */}
        <div className="px-3 py-2 bg-fire-3/5 border border-fire-3/10">
          <p className="font-mono text-[8px] text-fire-3/40 leading-relaxed">ℹ️ {L.note}</p>
        </div>

        {error && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="font-mono text-[10px] text-red-400 text-center bg-red-500/10 border border-red-500/20 px-3 py-2">
            ⚠ {error}
          </motion.p>
        )}

        <div className="pt-2 pb-8">
          <motion.button type="submit" disabled={loading}
            className={`btn-fire w-full text-[12px] tracking-[3px] py-4 transition-all ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
            whileHover={!loading ? { scale: 1.02 } : {}} whileTap={!loading ? { scale: 0.98 } : {}}>
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-3 h-3 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                {L.submitting}
              </span>
            ) : L.submit}
          </motion.button>
        </div>
      </form>
    </div>
  );
}