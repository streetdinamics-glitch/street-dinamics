import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, CheckCircle, XCircle } from 'lucide-react';

const EMPTY_FORM = {
  name: '',
  slug: '',
  emoji: '',
  description: '',
  is_active: true,
  scoring_criteria: [],
  token_supply_regional: 1000,
  token_supply_national: 100,
  token_supply_elite: 10,
  token_price_regional: 1,
  token_price_national: 10,
  token_price_elite: 100,
};

export default function SportCategoryManager() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [criteriaInput, setCriteriaInput] = useState('');

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['sport-categories'],
    queryFn: () => base44.entities.SportCategory.list('name', 100),
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.SportCategory.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sport-categories'] });
      toast.success('Sport category created');
      resetForm();
    },
    onError: (err) => toast.error('Failed: ' + err.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.SportCategory.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sport-categories'] });
      toast.success('Category updated');
      resetForm();
    },
    onError: (err) => toast.error('Failed: ' + err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.SportCategory.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sport-categories'] });
      toast.success('Category deleted');
    },
    onError: (err) => toast.error('Failed: ' + err.message),
  });

  const toggleActive = (cat) => {
    updateMutation.mutate({ id: cat.id, data: { is_active: !cat.is_active } });
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditing(null);
    setShowForm(false);
    setCriteriaInput('');
  };

  const startEdit = (cat) => {
    setEditing(cat);
    setForm({
      name: cat.name || '',
      slug: cat.slug || '',
      emoji: cat.emoji || '',
      description: cat.description || '',
      is_active: cat.is_active !== false,
      scoring_criteria: cat.scoring_criteria || [],
      token_supply_regional: cat.token_supply_regional ?? 1000,
      token_supply_national: cat.token_supply_national ?? 100,
      token_supply_elite: cat.token_supply_elite ?? 10,
      token_price_regional: cat.token_price_regional ?? 1,
      token_price_national: cat.token_price_national ?? 10,
      token_price_elite: cat.token_price_elite ?? 100,
    });
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!form.name.trim() || !form.slug.trim()) {
      toast.error('Name and slug are required');
      return;
    }
    const data = { ...form, slug: form.slug.toLowerCase().replace(/\s+/g, '_') };
    if (editing) {
      updateMutation.mutate({ id: editing.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const addCriteria = () => {
    const val = criteriaInput.trim();
    if (!val) return;
    setForm(f => ({ ...f, scoring_criteria: [...(f.scoring_criteria || []), val] }));
    setCriteriaInput('');
  };

  const removeCriteria = (i) => {
    setForm(f => ({ ...f, scoring_criteria: f.scoring_criteria.filter((_, idx) => idx !== i) }));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-orbitron font-black text-2xl text-fire-gradient">SPORT CATEGORIES</h2>
          <p className="font-mono text-[10px] text-fire-3/40 tracking-[1px] mt-1">
            Define disciplines — controls dropdowns everywhere in the platform
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="btn-fire text-[10px] py-2 px-4 flex items-center gap-2"
        >
          <Plus size={14} /> New Category
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="mb-8 p-6 bg-cyan/5 border border-cyan/20 clip-cyber">
          <h3 className="font-orbitron font-bold text-lg text-cyber-cyan mb-4">
            {editing ? `Edit: ${editing.name}` : 'New Sport Category'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Name */}
            <div>
              <label className="font-mono text-[10px] tracking-[2px] uppercase text-fire-3/40 block mb-1">Name *</label>
              <input
                className="cyber-input"
                placeholder="e.g. Calcio, Danza, Beatbox"
                value={form.name}
                onChange={(e) => {
                  const val = e.target.value;
                  setForm(f => ({
                    ...f,
                    name: val,
                    slug: editing ? f.slug : val.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''),
                  }));
                }}
              />
            </div>
            {/* Slug */}
            <div>
              <label className="font-mono text-[10px] tracking-[2px] uppercase text-fire-3/40 block mb-1">Slug * (auto)</label>
              <input
                className="cyber-input"
                placeholder="e.g. calcio"
                value={form.slug}
                onChange={(e) => setForm(f => ({ ...f, slug: e.target.value.toLowerCase().replace(/\s+/g, '_') }))}
              />
            </div>
            {/* Emoji */}
            <div>
              <label className="font-mono text-[10px] tracking-[2px] uppercase text-fire-3/40 block mb-1">Emoji Icon</label>
              <input
                className="cyber-input"
                placeholder="⚽ 💃 🎤 🎮 🥊"
                value={form.emoji}
                onChange={(e) => setForm(f => ({ ...f, emoji: e.target.value }))}
              />
            </div>
            {/* Description */}
            <div>
              <label className="font-mono text-[10px] tracking-[2px] uppercase text-fire-3/40 block mb-1">Description</label>
              <input
                className="cyber-input"
                placeholder="Short description"
                value={form.description}
                onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
              />
            </div>
          </div>

          {/* Token Supply per Level (Business Plan Scarcity Model) */}
          <div className="p-4 bg-fire-3/5 border border-fire-3/10 mb-4">
            <div className="font-mono text-[10px] tracking-[2px] uppercase text-fire-3/50 mb-3">
              Token Scarcity Model — Plan §05 (fewer tokens = more value per level)
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="font-mono text-[9px] uppercase text-fire-3/40 block mb-1">
                  🟢 Regional Supply
                </label>
                <input type="number" className="cyber-input text-sm" value={form.token_supply_regional}
                  onChange={(e) => setForm(f => ({ ...f, token_supply_regional: +e.target.value }))} />
                <div className="font-mono text-[8px] text-fire-3/30 mt-1">€{form.token_price_regional} each</div>
                <input type="number" className="cyber-input text-sm mt-1" value={form.token_price_regional}
                  onChange={(e) => setForm(f => ({ ...f, token_price_regional: +e.target.value }))} />
              </div>
              <div>
                <label className="font-mono text-[9px] uppercase text-fire-3/40 block mb-1">
                  🔵 National Supply
                </label>
                <input type="number" className="cyber-input text-sm" value={form.token_supply_national}
                  onChange={(e) => setForm(f => ({ ...f, token_supply_national: +e.target.value }))} />
                <div className="font-mono text-[8px] text-fire-3/30 mt-1">€{form.token_price_national} each</div>
                <input type="number" className="cyber-input text-sm mt-1" value={form.token_price_national}
                  onChange={(e) => setForm(f => ({ ...f, token_price_national: +e.target.value }))} />
              </div>
              <div>
                <label className="font-mono text-[9px] uppercase text-fire-3/40 block mb-1">
                  🔴 Elite Supply
                </label>
                <input type="number" className="cyber-input text-sm" value={form.token_supply_elite}
                  onChange={(e) => setForm(f => ({ ...f, token_supply_elite: +e.target.value }))} />
                <div className="font-mono text-[8px] text-fire-3/30 mt-1">€{form.token_price_elite} each</div>
                <input type="number" className="cyber-input text-sm mt-1" value={form.token_price_elite}
                  onChange={(e) => setForm(f => ({ ...f, token_price_elite: +e.target.value }))} />
              </div>
            </div>
          </div>

          {/* Scoring Criteria */}
          <div className="mb-4">
            <label className="font-mono text-[10px] tracking-[2px] uppercase text-fire-3/40 block mb-2">
              Universal Score Criteria (Plan §04)
            </label>
            <div className="flex gap-2 mb-2">
              <input
                className="cyber-input flex-1"
                placeholder="e.g. Tecnica, Crescita, Engagement..."
                value={criteriaInput}
                onChange={(e) => setCriteriaInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCriteria())}
              />
              <button onClick={addCriteria} className="btn-cyan text-[10px] py-2 px-3">Add</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {(form.scoring_criteria || []).map((c, i) => (
                <span key={i} className="flex items-center gap-1.5 px-3 py-1 bg-fire-3/10 border border-fire-3/20 font-mono text-xs text-fire-4">
                  {c}
                  <button onClick={() => removeCriteria(i)} className="text-fire-3/40 hover:text-red-400">×</button>
                </span>
              ))}
            </div>
          </div>

          {/* Active toggle */}
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => setForm(f => ({ ...f, is_active: !f.is_active }))}
              className={`w-10 h-5 rounded-full transition-colors ${form.is_active ? 'bg-green-500' : 'bg-fire-3/20'} relative`}
            >
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${form.is_active ? 'left-5' : 'left-0.5'}`} />
            </button>
            <span className="font-mono text-xs text-fire-3/60">{form.is_active ? 'Active' : 'Inactive'}</span>
          </div>

          <div className="flex gap-3">
            <button onClick={resetForm} className="btn-ghost py-2 px-4 text-[10px]">Cancel</button>
            <button
              onClick={handleSubmit}
              disabled={createMutation.isPending || updateMutation.isPending}
              className="btn-fire py-2 px-6 text-[10px] disabled:opacity-20"
            >
              {createMutation.isPending || updateMutation.isPending ? 'Saving...' : editing ? 'Save Changes' : 'Create Category'}
            </button>
          </div>
        </div>
      )}

      {/* Category List */}
      {isLoading ? (
        <div className="text-center py-8 font-mono text-fire-3/30 text-sm">Loading...</div>
      ) : categories.length === 0 ? (
        <div className="text-center py-12 border border-fire-3/10">
          <div className="text-4xl mb-3">🏆</div>
          <p className="font-mono text-sm text-fire-3/30">No categories yet. Create the first discipline.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {categories.map(cat => (
            <div key={cat.id} className={`p-4 border flex flex-col sm:flex-row sm:items-center gap-3 ${cat.is_active ? 'border-fire-3/15 bg-fire-3/3' : 'border-fire-3/5 bg-black/20 opacity-50'}`}>
              <div className="text-3xl">{cat.emoji || '🏅'}</div>
              <div className="flex-1">
                <div className="font-orbitron font-bold text-base text-fire-4">{cat.name}</div>
                <div className="font-mono text-[10px] text-fire-3/40">{cat.slug}</div>
                {cat.description && (
                  <div className="font-rajdhani text-sm text-fire-4/60 mt-0.5">{cat.description}</div>
                )}
                <div className="flex gap-3 mt-1 flex-wrap">
                  <span className="font-mono text-[9px] text-green-400/60">🟢 {cat.token_supply_regional ?? 1000} × €{cat.token_price_regional ?? 1}</span>
                  <span className="font-mono text-[9px] text-cyan/60">🔵 {cat.token_supply_national ?? 100} × €{cat.token_price_national ?? 10}</span>
                  <span className="font-mono text-[9px] text-fire-5/60">🔴 {cat.token_supply_elite ?? 10} × €{cat.token_price_elite ?? 100}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button onClick={() => toggleActive(cat)} className={`flex items-center gap-1 font-mono text-[9px] py-1 px-3 border transition-all ${cat.is_active ? 'border-green-500/30 text-green-400 hover:bg-green-500/10' : 'border-fire-3/20 text-fire-3/40 hover:bg-fire-3/5'}`}>
                  {cat.is_active ? <><CheckCircle size={10} /> Active</> : <><XCircle size={10} /> Inactive</>}
                </button>
                <button onClick={() => startEdit(cat)} className="btn-cyan text-[9px] py-1 px-3 flex items-center gap-1">
                  <Pencil size={10} /> Edit
                </button>
                <button
                  onClick={() => { if (confirm(`Delete "${cat.name}"?`)) deleteMutation.mutate(cat.id); }}
                  className="btn-ghost text-[9px] py-1 px-3 border-red-500/30 text-red-400 hover:bg-red-500/5 flex items-center gap-1"
                >
                  <Trash2 size={10} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}