/**
 * MilestoneRewardManager
 * Permette all'admin di creare traguardi e assegnare premi manualmente
 * sia agli atleti (basati su performance/eventi) che ai fan (basati su Street Cred).
 */
import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, Trash2, Trophy, Star, Gift, Search, CheckCircle, Loader2, ChevronDown, ChevronUp } from 'lucide-react';

// ─── Configurazione premi ───────────────────────────────────────────────────

const REWARD_TYPES = [
  { value: 'street_cred_points', label: '⭐ Street Cred Points', color: 'text-yellow-400' },
  { value: 'nft_card', label: '🃏 NFT Card', color: 'text-purple-400' },
  { value: 'token_drop', label: '🪙 Token Drop', color: 'text-cyan-400' },
  { value: 'badge', label: '🏅 Badge', color: 'text-fire-4' },
  { value: 'cashback_boost', label: '💸 Cashback Boost', color: 'text-green-400' },
  { value: 'early_access', label: '🔓 Early Access', color: 'text-blue-400' },
  { value: 'custom', label: '🎁 Premio Custom', color: 'text-white' },
];

const MILESTONE_TARGETS = [
  { value: 'fan', label: '👥 Fan (Street Cred)', color: 'text-fire-4' },
  { value: 'athlete', label: '🏆 Atleta (Performance)', color: 'text-cyan-400' },
];

const SC_LEVELS = [
  { value: 'newcomer', label: 'Newcomer', threshold: 0 },
  { value: 'follower', label: 'Follower', threshold: 500 },
  { value: 'hype_beast', label: 'Hype Beast', threshold: 2000 },
  { value: 'street_legend', label: 'Street Legend', threshold: 7500 },
  { value: 'sd_icon', label: 'SD Icon', threshold: 20000 },
];

const BADGE_TYPES = [
  'rookie', 'veteran', 'champion', 'legend', 'first_event',
  'five_events', 'ten_events', 'podium_finisher', 'winner',
  'crowd_favorite', 'rising_star', 'consistent_performer',
];

// ─── Sub-component: Form nuovo traguardo ────────────────────────────────────

function MilestoneForm({ onCreated }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    name: '',
    description: '',
    target_type: 'fan',
    trigger_type: 'sc_level',       // sc_level | sc_points | athlete_wins | athlete_events | manual
    trigger_value: '',              // valore soglia
    reward_type: 'street_cred_points',
    reward_value: '',               // punti / nome badge / descrizione nft
    reward_note: '',
    is_active: true,
    is_repeatable: false,
  });

  const f = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const createMutation = useMutation({
    mutationFn: () => base44.entities.RewardItem.create({
      name: form.name,
      description: form.description,
      item_type: form.reward_type,
      points_cost: form.trigger_type === 'sc_points' ? Number(form.trigger_value) : 0,
      milestone_target: form.target_type,
      milestone_trigger_type: form.trigger_type,
      milestone_trigger_value: form.trigger_value,
      reward_value: form.reward_value,
      reward_note: form.reward_note,
      is_active: form.is_active,
      is_repeatable: form.is_repeatable,
    }),
    onSuccess: () => {
      toast.success('Traguardo creato!');
      queryClient.invalidateQueries({ queryKey: ['milestone-rewards'] });
      onCreated?.();
      setForm({
        name: '', description: '', target_type: 'fan', trigger_type: 'sc_level',
        trigger_value: '', reward_type: 'street_cred_points', reward_value: '',
        reward_note: '', is_active: true, is_repeatable: false,
      });
    },
    onError: e => toast.error(e.message),
  });

  const triggerOptions = form.target_type === 'fan'
    ? [
        { value: 'sc_level', label: 'Raggiungimento livello Street Cred' },
        { value: 'sc_points', label: 'Punti Street Cred accumulati' },
        { value: 'nfts_owned', label: 'Numero NFT posseduti' },
        { value: 'tokens_owned', label: 'Numero Token posseduti' },
        { value: 'referrals', label: 'Referral completati' },
        { value: 'events_attended', label: 'Eventi frequentati (fisico)' },
        { value: 'manual', label: 'Manuale (admin assegna a mano)' },
      ]
    : [
        { value: 'athlete_wins', label: 'Vittorie accumulate' },
        { value: 'athlete_events', label: 'Tornei partecipati' },
        { value: 'podium_finishes', label: 'Podi raggiunti' },
        { value: 'performance_score', label: 'Score performance ≥ soglia' },
        { value: 'manual', label: 'Manuale (admin assegna a mano)' },
      ];

  return (
    <div className="p-5 border border-green-500/20 bg-green-500/3">
      <h3 className="font-orbitron font-bold text-green-400 text-base mb-4 flex items-center gap-2">
        <Plus size={16} /> Nuovo Traguardo & Premio
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        {/* Nome */}
        <div className="md:col-span-2">
          <label className="font-mono text-[10px] tracking-[2px] uppercase text-white/30 block mb-1">Nome Traguardo *</label>
          <input className="cyber-input" placeholder="es. Street Legend Ascension" value={form.name} onChange={e => f('name', e.target.value)} />
        </div>

        {/* Descrizione */}
        <div className="md:col-span-2">
          <label className="font-mono text-[10px] tracking-[2px] uppercase text-white/30 block mb-1">Descrizione</label>
          <textarea className="cyber-input" rows={2} placeholder="Descrizione visibile agli utenti" value={form.description} onChange={e => f('description', e.target.value)} />
        </div>

        {/* Target */}
        <div>
          <label className="font-mono text-[10px] tracking-[2px] uppercase text-white/30 block mb-1">Target</label>
          <select className="cyber-input" value={form.target_type} onChange={e => { f('target_type', e.target.value); f('trigger_type', e.target.value === 'fan' ? 'sc_level' : 'athlete_wins'); }}>
            {MILESTONE_TARGETS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>

        {/* Trigger type */}
        <div>
          <label className="font-mono text-[10px] tracking-[2px] uppercase text-white/30 block mb-1">Condizione</label>
          <select className="cyber-input" value={form.trigger_type} onChange={e => f('trigger_type', e.target.value)}>
            {triggerOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        {/* Trigger value */}
        {form.trigger_type !== 'manual' && (
          <div>
            <label className="font-mono text-[10px] tracking-[2px] uppercase text-white/30 block mb-1">
              {form.trigger_type === 'sc_level' ? 'Livello SC richiesto' : 'Valore soglia'}
            </label>
            {form.trigger_type === 'sc_level' ? (
              <select className="cyber-input" value={form.trigger_value} onChange={e => f('trigger_value', e.target.value)}>
                <option value="">— Seleziona livello —</option>
                {SC_LEVELS.map(l => <option key={l.value} value={l.value}>{l.label} (≥{l.threshold} pts)</option>)}
              </select>
            ) : (
              <input className="cyber-input" type="number" min={0} placeholder="es. 1000" value={form.trigger_value} onChange={e => f('trigger_value', e.target.value)} />
            )}
          </div>
        )}

        {/* Reward type */}
        <div>
          <label className="font-mono text-[10px] tracking-[2px] uppercase text-white/30 block mb-1">Tipo Premio</label>
          <select className="cyber-input" value={form.reward_type} onChange={e => f('reward_type', e.target.value)}>
            {REWARD_TYPES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </div>

        {/* Reward value */}
        <div>
          <label className="font-mono text-[10px] tracking-[2px] uppercase text-white/30 block mb-1">
            {form.reward_type === 'street_cred_points' ? 'Punti assegnati'
              : form.reward_type === 'badge' ? 'Tipo badge'
              : form.reward_type === 'cashback_boost' ? 'Boost % (es. 0.05 = +5%)'
              : 'Descrizione / valore premio'}
          </label>
          {form.reward_type === 'badge' ? (
            <select className="cyber-input" value={form.reward_value} onChange={e => f('reward_value', e.target.value)}>
              <option value="">— Seleziona badge —</option>
              {BADGE_TYPES.map(b => <option key={b} value={b}>{b.replace(/_/g, ' ')}</option>)}
            </select>
          ) : (
            <input
              className="cyber-input"
              type={['street_cred_points', 'cashback_boost'].includes(form.reward_type) ? 'number' : 'text'}
              step={form.reward_type === 'cashback_boost' ? '0.01' : undefined}
              placeholder={form.reward_type === 'street_cred_points' ? 'es. 500' : form.reward_type === 'cashback_boost' ? 'es. 0.05' : 'es. "Rising Star NFT Pack"'}
              value={form.reward_value}
              onChange={e => f('reward_value', e.target.value)}
            />
          )}
        </div>

        {/* Note */}
        <div className="md:col-span-2">
          <label className="font-mono text-[10px] tracking-[2px] uppercase text-white/30 block mb-1">Note interne (opzionale)</label>
          <input className="cyber-input" placeholder="Note per lo staff" value={form.reward_note} onChange={e => f('reward_note', e.target.value)} />
        </div>

        {/* Flags */}
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 accent-green-500" checked={form.is_active} onChange={e => f('is_active', e.target.checked)} />
            <span className="font-mono text-[10px] text-white/50">Attivo</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 accent-fire-3" checked={form.is_repeatable} onChange={e => f('is_repeatable', e.target.checked)} />
            <span className="font-mono text-[10px] text-white/50">Ripetibile</span>
          </label>
        </div>
      </div>

      <button
        onClick={() => createMutation.mutate()}
        disabled={!form.name || !form.reward_type || createMutation.isPending}
        className="btn-fire text-[11px] py-2.5 px-6 disabled:opacity-30 flex items-center gap-2"
      >
        {createMutation.isPending ? <><Loader2 size={13} className="animate-spin" /> Creazione...</> : <><Plus size={13} /> Crea Traguardo</>}
      </button>
    </div>
  );
}

// ─── Sub-component: Assegnazione manuale ────────────────────────────────────

function ManualAssignPanel({ milestone }) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [assigning, setAssigning] = useState(null);

  const { data: streetCredUsers = [] } = useQuery({
    queryKey: ['sc-users-for-assign'],
    queryFn: () => base44.entities.StreetCred.list('-total_points', 200),
    initialData: [],
    enabled: milestone.milestone_target === 'fan',
  });
  const { data: athletes = [] } = useQuery({
    queryKey: ['athletes-for-assign'],
    queryFn: () => base44.entities.AthleteStats.list('-wins', 100),
    initialData: [],
    enabled: milestone.milestone_target === 'athlete',
  });

  const users = milestone.milestone_target === 'fan' ? streetCredUsers : athletes;
  const filtered = users.filter(u => {
    const name = u.user_name || u.athlete_name || '';
    const email = u.user_email || u.athlete_email || '';
    return name.toLowerCase().includes(search.toLowerCase()) || email.toLowerCase().includes(search.toLowerCase());
  });

  const assignMutation = useMutation({
    mutationFn: async (user) => {
      const email = user.user_email || user.athlete_email;
      const name = user.user_name || user.athlete_name;

      // Create FanReward record
      await base44.entities.FanReward.create({
        user_email: email,
        user_name: name,
        reward_type: milestone.item_type,
        reward_name: milestone.name,
        reward_description: milestone.description || '',
        reward_value: milestone.reward_value || '',
        milestone_id: milestone.id,
        source: 'admin_manual',
        issued_at: new Date().toISOString(),
        redeemed: false,
      });

      // If street cred points: call syncStreetCred
      if (milestone.item_type === 'street_cred_points' && milestone.reward_value) {
        await base44.functions.invoke('syncStreetCred', {
          user_email: email,
          action: 'manual_reward',
          points: Number(milestone.reward_value),
          note: milestone.name,
        });
      }

      // If badge: create AthleteBadge (for athletes)
      if (milestone.item_type === 'badge' && milestone.reward_value && milestone.milestone_target === 'athlete') {
        await base44.entities.AthleteBadge.create({
          athlete_email: email,
          badge_type: milestone.reward_value,
          badge_name: milestone.reward_value.replace(/_/g, ' '),
          earned_date: new Date().toISOString().split('T')[0],
        });
      }

      // Notification
      await base44.entities.Notification.create({
        user_email: email,
        title: `🏆 Hai sbloccato: ${milestone.name}!`,
        message: `Complimenti ${name}! Hai ricevuto il premio: ${milestone.reward_value || milestone.item_type}.`,
        type: 'reward',
        is_read: false,
      });
    },
    onSuccess: (_, user) => {
      const name = user.user_name || user.athlete_name;
      toast.success(`Premio assegnato a ${name}!`);
      queryClient.invalidateQueries({ queryKey: ['fan-rewards'] });
      setAssigning(null);
    },
    onError: e => toast.error(e.message),
  });

  return (
    <div className="mt-3 p-4 bg-black/40 border border-white/8">
      <div className="font-mono text-[10px] text-white/40 mb-3 tracking-[1px]">
        ASSEGNA MANUALMENTE · {milestone.milestone_target === 'fan' ? 'FAN' : 'ATLETI'}
      </div>
      <div className="relative mb-3">
        <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
        <input className="cyber-input pl-8 text-sm" placeholder="Cerca per nome o email…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <div className="max-h-52 overflow-y-auto space-y-1.5">
        {filtered.slice(0, 30).map(u => {
          const email = u.user_email || u.athlete_email;
          const name = u.user_name || u.athlete_name || email;
          const sub = milestone.milestone_target === 'fan'
            ? `${u.total_points || 0} pts · ${u.level || 'newcomer'}`
            : `${u.wins || 0} vinte · ${u.events_participated || 0} eventi`;
          const isAssigning = assigning === email && assignMutation.isPending;
          return (
            <div key={email} className="flex items-center justify-between p-2.5 border border-white/5 bg-white/2 hover:bg-white/5 transition-all">
              <div>
                <div className="font-rajdhani font-semibold text-sm text-white/80">{name}</div>
                <div className="font-mono text-[9px] text-white/30">{email} · {sub}</div>
              </div>
              <button
                onClick={() => { setAssigning(email); assignMutation.mutate(u); }}
                disabled={assignMutation.isPending}
                className="btn-fire text-[9px] py-1.5 px-3 flex items-center gap-1 disabled:opacity-40"
              >
                {isAssigning ? <Loader2 size={11} className="animate-spin" /> : <Gift size={11} />}
                Assegna
              </button>
            </div>
          );
        })}
        {filtered.length === 0 && <p className="font-mono text-[10px] text-white/20 text-center py-4">Nessun utente trovato</p>}
      </div>
    </div>
  );
}

// ─── Sub-component: Card traguardo ──────────────────────────────────────────

function MilestoneCard({ milestone, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const queryClient = useQueryClient();

  const rewardType = REWARD_TYPES.find(r => r.value === milestone.item_type);
  const isManual = milestone.milestone_trigger_type === 'manual';
  const isActive = milestone.is_active !== false;

  const toggleMutation = useMutation({
    mutationFn: () => base44.entities.RewardItem.update(milestone.id, { is_active: !isActive }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['milestone-rewards'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: () => base44.entities.RewardItem.delete(milestone.id),
    onSuccess: () => { toast.success('Traguardo eliminato'); queryClient.invalidateQueries({ queryKey: ['milestone-rewards'] }); onDelete?.(); },
  });

  return (
    <div className={`border transition-all ${isActive ? 'border-white/10 bg-white/2' : 'border-white/5 bg-black/20 opacity-50'}`}
      style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))' }}>

      <div className="flex items-start gap-3 p-4">
        <Trophy size={18} className={milestone.milestone_target === 'fan' ? 'text-fire-4 flex-shrink-0 mt-0.5' : 'text-cyan-400 flex-shrink-0 mt-0.5'} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-orbitron font-bold text-sm text-white/90">{milestone.name}</span>
            <span className={`font-mono text-[9px] px-2 py-0.5 border ${milestone.milestone_target === 'fan' ? 'border-fire-3/30 text-fire-4' : 'border-cyan/30 text-cyan-400'}`}>
              {milestone.milestone_target === 'fan' ? 'FAN' : 'ATLETA'}
            </span>
            {isManual && <span className="font-mono text-[9px] px-2 py-0.5 border border-yellow-500/30 text-yellow-400">MANUALE</span>}
            {!isActive && <span className="font-mono text-[9px] px-2 py-0.5 border border-white/10 text-white/30">INATTIVO</span>}
          </div>
          {milestone.description && (
            <p className="font-rajdhani text-xs text-white/40 mt-0.5 truncate">{milestone.description}</p>
          )}
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            {milestone.milestone_trigger_type !== 'manual' && (
              <span className="font-mono text-[9px] text-white/30">
                📍 {milestone.milestone_trigger_type?.replace(/_/g, ' ')} = <strong className="text-white/50">{milestone.milestone_trigger_value}</strong>
              </span>
            )}
            <span className={`font-mono text-[9px] font-bold ${rewardType?.color || 'text-white'}`}>
              {rewardType?.label} {milestone.reward_value ? `· ${milestone.reward_value}` : ''}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={() => toggleMutation.mutate()} className={`font-mono text-[9px] px-2 py-1 border transition-all ${isActive ? 'border-red-500/30 text-red-400 hover:bg-red-500/10' : 'border-green-500/30 text-green-400 hover:bg-green-500/10'}`}>
            {isActive ? 'DISATTIVA' : 'ATTIVA'}
          </button>
          {isManual && (
            <button onClick={() => setExpanded(!expanded)} className="font-mono text-[9px] px-2 py-1 border border-fire-3/30 text-fire-4 hover:bg-fire-3/10 flex items-center gap-1">
              <Gift size={11} /> ASSEGNA {expanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
            </button>
          )}
          <button onClick={() => { if (confirm('Eliminare questo traguardo?')) deleteMutation.mutate(); }} className="p-1.5 text-red-400/40 hover:text-red-400 transition-colors">
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {expanded && isManual && <ManualAssignPanel milestone={milestone} />}
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function MilestoneRewardManager() {
  const [showForm, setShowForm] = useState(false);
  const [filterTarget, setFilterTarget] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [searchMilestone, setSearchMilestone] = useState('');

  const { data: milestones = [], isLoading } = useQuery({
    queryKey: ['milestone-rewards'],
    queryFn: () => base44.entities.RewardItem.list('-created_date', 100),
    initialData: [],
  });

  const { data: fanRewards = [] } = useQuery({
    queryKey: ['fan-rewards'],
    queryFn: () => base44.entities.FanReward.list('-created_date', 50),
    initialData: [],
  });

  const filtered = milestones.filter(m => {
    if (filterTarget !== 'all' && m.milestone_target !== filterTarget) return false;
    if (filterType !== 'all' && m.item_type !== filterType) return false;
    if (searchMilestone && !m.name?.toLowerCase().includes(searchMilestone.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <p className="font-mono text-[10px] tracking-[6px] uppercase text-fire-4/40 mb-1">// SISTEMA PREMI //</p>
        <h2 className="font-orbitron font-black text-2xl tracking-[2px] text-fire-5 mb-1">MILESTONE REWARD MANAGER</h2>
        <p className="font-rajdhani text-sm text-white/40">
          Crea traguardi e premi per atleti e fan · Assegna manualmente o automaticamente
        </p>
      </div>

      {/* Stats rapide */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="border border-fire-3/15 bg-fire-3/5 p-3 text-center">
          <div className="font-orbitron font-black text-xl text-fire-4">{milestones.length}</div>
          <div className="font-mono text-[9px] text-white/30 tracking-[1px]">TRAGUARDI TOTALI</div>
        </div>
        <div className="border border-green-500/15 bg-green-500/5 p-3 text-center">
          <div className="font-orbitron font-black text-xl text-green-400">{milestones.filter(m => m.is_active !== false).length}</div>
          <div className="font-mono text-[9px] text-white/30 tracking-[1px]">ATTIVI</div>
        </div>
        <div className="border border-cyan/15 bg-cyan/5 p-3 text-center">
          <div className="font-orbitron font-black text-xl text-cyan-400">{fanRewards.length}</div>
          <div className="font-mono text-[9px] text-white/30 tracking-[1px]">PREMI EROGATI</div>
        </div>
      </div>

      {/* Toggle form */}
      <button
        onClick={() => setShowForm(p => !p)}
        className="btn-fire text-[11px] py-2.5 px-5 mb-5 flex items-center gap-2"
      >
        {showForm ? '✕ Chiudi' : <><Plus size={13} /> Nuovo Traguardo</>}
      </button>

      {showForm && <div className="mb-5"><MilestoneForm onCreated={() => setShowForm(false)} /></div>}

      {/* Filtri */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={11} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
          <input className="cyber-input pl-8 text-sm" placeholder="Cerca traguardo…" value={searchMilestone} onChange={e => setSearchMilestone(e.target.value)} />
        </div>
        <select className="cyber-input w-auto min-w-[140px]" value={filterTarget} onChange={e => setFilterTarget(e.target.value)}>
          <option value="all">Tutti i target</option>
          <option value="fan">👥 Fan</option>
          <option value="athlete">🏆 Atleti</option>
        </select>
        <select className="cyber-input w-auto min-w-[160px]" value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="all">Tutti i premi</option>
          {REWARD_TYPES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
      </div>

      {/* Lista */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin text-fire-3/40" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 border border-white/5">
          <Star size={32} className="mx-auto mb-3 text-white/10" />
          <p className="font-rajdhani text-white/30">
            {milestones.length === 0 ? 'Nessun traguardo creato. Inizia con il pulsante "Nuovo Traguardo".' : 'Nessun risultato per i filtri selezionati.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(m => <MilestoneCard key={m.id} milestone={m} />)}
        </div>
      )}

      {/* Ultimi premi erogati */}
      {fanRewards.length > 0 && (
        <div className="mt-8">
          <p className="font-mono text-[10px] tracking-[4px] uppercase text-white/30 mb-3">ULTIMI PREMI EROGATI</p>
          <div className="space-y-1.5">
            {fanRewards.slice(0, 10).map(r => (
              <div key={r.id} className="flex items-center justify-between p-3 border border-white/5 bg-white/1.5">
                <div>
                  <span className="font-rajdhani font-semibold text-sm text-white/70">{r.user_name || r.user_email}</span>
                  <span className="font-mono text-[10px] text-white/30 ml-2">→ {r.reward_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`font-mono text-[9px] px-2 py-0.5 border ${r.redeemed ? 'border-green-500/30 text-green-400' : 'border-yellow-500/20 text-yellow-400/60'}`}>
                    {r.redeemed ? '✓ RISCATTATO' : 'PENDENTE'}
                  </span>
                  <span className="font-mono text-[9px] text-white/20">
                    {r.issued_at ? new Date(r.issued_at).toLocaleDateString('it-IT') : '—'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}