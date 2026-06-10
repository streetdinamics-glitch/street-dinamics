/**
 * AthleteTokenMinter — Admin panel to:
 * 6. Manually mint/create AthleteToken cards for a tournament
 */
import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { CreditCard, Plus, RefreshCw, CheckCircle2, Zap } from 'lucide-react';
import { toast } from 'sonner';

const TIERS = [
  { key: 'rising_star',     label: 'Rising Star',     supply: 1000, price: 5,   color: '#94a3b8' },
  { key: 'breakout_talent', label: 'Breakout Talent', supply: 250,  price: 25,  color: '#22c55e' },
  { key: 'elite_performer', label: 'Elite Performer', supply: 50,   price: 100, color: '#3b82f6' },
  { key: 'living_legend',   label: 'Living Legend',   supply: 10,   price: 500, color: '#fbbf24' },
];

export default function AthleteTokenMinter() {
  const queryClient = useQueryClient();
  const [selectedTournament, setSelectedTournament] = useState('');
  const [selectedAthlete, setSelectedAthlete] = useState('');
  const [selectedTiers, setSelectedTiers] = useState(['rising_star', 'breakout_talent']);
  const [customOverrides, setCustomOverrides] = useState({});
  const [isMinting, setIsMinting] = useState(false);

  const { data: tournaments = [] } = useQuery({
    queryKey: ['admin-tournaments-minter'],
    queryFn: () => base44.entities.Tournament.list('-created_date', 100),
    initialData: [],
  });
  const { data: events = [] } = useQuery({
    queryKey: ['admin-events-minter'],
    queryFn: () => base44.entities.Event.list('-created_date', 200),
    initialData: [],
  });
  const { data: registrations = [] } = useQuery({
    queryKey: ['admin-registrations-minter', selectedTournament],
    queryFn: async () => {
      if (!selectedTournament) return [];
      const t = tournaments.find(t => t.id === selectedTournament);
      if (!t?.event_id) return [];
      return base44.entities.Registration.filter({ event_id: t.event_id, type: 'athlete' });
    },
    enabled: !!selectedTournament,
    initialData: [],
  });
  const { data: existingTokens = [] } = useQuery({
    queryKey: ['existing-tokens-minter', selectedTournament],
    queryFn: () => base44.entities.AthleteToken.filter({ tournament_id: selectedTournament }),
    enabled: !!selectedTournament,
    initialData: [],
  });

  const getEventTitle = (id) => events.find(e => e.id === id)?.title || id;

  const toggleTier = (key) => {
    setSelectedTiers(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const handleMint = async () => {
    if (!selectedTournament || !selectedAthlete || selectedTiers.length === 0) return;
    const athlete = registrations.find(r => r.id === selectedAthlete);
    if (!confirm(`Mintare ${selectedTiers.length} tier di card per ${athlete?.full_name || 'atleta'}?`)) return;

    setIsMinting(true);
    try {
      await base44.functions.invoke('mintAthleteToken', {
        tournamentId: selectedTournament,
        athleteEmail: athlete?.email,
        athleteName: athlete?.full_name || athlete?.name,
        tiers: selectedTiers.map(key => {
          const base = TIERS.find(t => t.key === key);
          return {
            tier: key,
            total_supply: customOverrides[key]?.supply ?? base.supply,
            base_price: customOverrides[key]?.price ?? base.price,
          };
        }),
      });
      queryClient.invalidateQueries({ queryKey: ['existing-tokens-minter'] });
      toast.success('✅ Card mintate con successo!');
    } catch (e) {
      toast.error('Errore minting: ' + e.message);
    } finally {
      setIsMinting(false);
    }
  };

  const alreadyMinted = existingTokens.filter(t =>
    selectedAthlete && registrations.find(r => r.id === selectedAthlete)?.email === t.athlete_email
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <CreditCard size={26} className="text-cyan" />
        <h2 className="font-orbitron font-black text-2xl" style={{ background: 'linear-gradient(135deg,#00ffee,#3b82f6)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
          ATHLETE TOKEN MINTER
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: config */}
        <div className="space-y-4">
          {/* Tournament select */}
          <div>
            <label className="font-mono text-[10px] tracking-[2px] uppercase text-white/40 block mb-1">Torneo</label>
            <select
              className="cyber-input"
              value={selectedTournament}
              onChange={e => { setSelectedTournament(e.target.value); setSelectedAthlete(''); }}
            >
              <option value="">— Seleziona torneo —</option>
              {tournaments.map(t => (
                <option key={t.id} value={t.id}>
                  {getEventTitle(t.event_id)} · {t.status}
                </option>
              ))}
            </select>
          </div>

          {/* Athlete select */}
          <div>
            <label className="font-mono text-[10px] tracking-[2px] uppercase text-white/40 block mb-1">
              Atleta {registrations.length > 0 ? `(${registrations.length} iscritti)` : ''}
            </label>
            <select
              className="cyber-input"
              value={selectedAthlete}
              disabled={!selectedTournament}
              onChange={e => setSelectedAthlete(e.target.value)}
            >
              <option value="">— Seleziona atleta —</option>
              {registrations.map(r => (
                <option key={r.id} value={r.id}>
                  {r.full_name || r.name || r.email} · {r.sport}
                </option>
              ))}
            </select>
          </div>

          {/* Tier selection */}
          <div>
            <div className="font-mono text-[10px] tracking-[2px] uppercase text-white/40 mb-2">Tier da Mintare</div>
            <div className="space-y-2">
              {TIERS.map(tier => {
                const active = selectedTiers.includes(tier.key);
                const override = customOverrides[tier.key] || {};
                return (
                  <div key={tier.key} className="border transition-all"
                    style={{ borderColor: active ? `${tier.color}44` : 'rgba(255,255,255,0.06)' }}>
                    <div className="flex items-center gap-3 p-3 cursor-pointer" onClick={() => toggleTier(tier.key)}>
                      <div className="w-4 h-4 border-2 flex items-center justify-center flex-shrink-0"
                        style={{ borderColor: active ? tier.color : 'rgba(255,255,255,0.2)', background: active ? `${tier.color}22` : 'transparent' }}>
                        {active && <div className="w-2 h-2" style={{ background: tier.color }} />}
                      </div>
                      <div className="flex-1">
                        <div className="font-orbitron text-sm" style={{ color: tier.color }}>{tier.label}</div>
                        <div className="font-mono text-[9px] text-white/30">
                          Supply: {override.supply ?? tier.supply} · €{override.price ?? tier.price}
                        </div>
                      </div>
                    </div>
                    {active && (
                      <div className="grid grid-cols-2 gap-2 p-3 pt-0 border-t border-white/5">
                        <div>
                          <label className="font-mono text-[8px] text-white/30 block mb-1">Supply</label>
                          <input
                            type="number"
                            className="cyber-input text-sm py-1"
                            value={override.supply ?? tier.supply}
                            onClick={e => e.stopPropagation()}
                            onChange={e => setCustomOverrides(prev => ({
                              ...prev, [tier.key]: { ...prev[tier.key], supply: Number(e.target.value) }
                            }))}
                          />
                        </div>
                        <div>
                          <label className="font-mono text-[8px] text-white/30 block mb-1">Prezzo (€)</label>
                          <input
                            type="number"
                            className="cyber-input text-sm py-1"
                            value={override.price ?? tier.price}
                            onClick={e => e.stopPropagation()}
                            onChange={e => setCustomOverrides(prev => ({
                              ...prev, [tier.key]: { ...prev[tier.key], price: Number(e.target.value) }
                            }))}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={handleMint}
            disabled={!selectedTournament || !selectedAthlete || selectedTiers.length === 0 || isMinting}
            className="btn-fire w-full text-[11px] py-3 flex items-center justify-center gap-2 disabled:opacity-30"
          >
            {isMinting ? <RefreshCw size={14} className="animate-spin" /> : <Zap size={14} />}
            Minta {selectedTiers.length} tier
          </button>
        </div>

        {/* Right: existing tokens */}
        <div>
          <div className="font-mono text-[10px] tracking-[2px] uppercase text-white/40 mb-3">
            CARD GIÀ MINTATE {selectedTournament ? `(${existingTokens.length})` : ''}
          </div>
          <div className="space-y-2 max-h-[55vh] overflow-y-auto">
            {existingTokens.length === 0 && selectedTournament && (
              <p className="font-mono text-xs text-white/20 text-center py-8">Nessuna card per questo torneo</p>
            )}
            {!selectedTournament && (
              <p className="font-mono text-xs text-white/15 text-center py-8">← Seleziona un torneo</p>
            )}
            {existingTokens.map(tok => {
              const tierCfg = TIERS.find(t => t.key === tok.token_tier);
              return (
                <div key={tok.id} className="p-3 border border-white/6 bg-black/30 flex items-center justify-between"
                  style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))' }}>
                  <div>
                    <div className="font-orbitron text-xs text-fire-5">{tok.athlete_name}</div>
                    <div className="font-mono text-[9px]" style={{ color: tierCfg?.color || '#fff' }}>{tok.token_tier?.replace(/_/g,' ')}</div>
                  </div>
                  <div className="text-right font-mono text-[9px]">
                    <div className="text-white/50">{tok.available_supply}/{tok.total_supply}</div>
                    <div className="text-white/25">€{tok.base_price}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}