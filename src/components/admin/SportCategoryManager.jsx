import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Edit2, Check, X, Dumbbell } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

// The 6 official Street Dinamics disciplines from the business plan
const DEFAULT_CATEGORIES = [
  { name: 'Skateboarding', emoji: '🛹', description: 'Street and park skateboarding disciplines' },
  { name: 'BMX', emoji: '🚲', description: 'Freestyle BMX — street, park, flatland' },
  { name: 'Parkour', emoji: '🏃', description: 'Freerunning and parkour movement' },
  { name: 'Breakdancing', emoji: '💃', description: 'Breaking / B-boying — competitive dance battles' },
  { name: 'Freestyle Football', emoji: '⚽', description: 'Football freestyle tricks and battles' },
  { name: 'Street Basketball', emoji: '🏀', description: '3x3 and 1v1 street basketball' },
  { name: 'Arti Marziali', emoji: '🥊', description: 'Martial arts — MMA, kickboxing, capoeira' },
  { name: 'Gaming', emoji: '🎮', description: 'Competitive esports and gaming tournaments' },
  { name: 'Beatbox', emoji: '🎤', description: 'Beatbox battles and performances' },
  { name: 'Danza', emoji: '🕺', description: 'Urban dance styles — hip hop, waacking, locking' },
];

export default function SportCategoryManager() {
  const queryClient = useQueryClient();
  const [newCat, setNewCat] = useState({ name: '', emoji: '', description: '' });
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const { data: categories = [] } = useQuery({
    queryKey: ['sport-categories'],
    queryFn: () => base44.entities.SportCategory.list('name', 100),
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.SportCategory.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sport-categories'] });
      setNewCat({ name: '', emoji: '', description: '' });
      setShowAdd(false);
      toast.success('Sport category created');
    },
    onError: () => toast.error('Failed to create category'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.SportCategory.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sport-categories'] });
      setEditingId(null);
      toast.success('Category updated');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.SportCategory.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sport-categories'] });
      toast.success('Category deleted');
    },
  });

  const toggleActive = (cat) => {
    updateMutation.mutate({ id: cat.id, data: { is_active: !cat.is_active } });
  };

  const handleSeedDefaults = async () => {
    const existingNames = new Set(categories.map(c => c.name));
    const toCreate = DEFAULT_CATEGORIES.filter(d => !existingNames.has(d.name));
    if (toCreate.length === 0) { toast.info('All defaults already exist'); return; }
    for (const cat of toCreate) {
      await base44.entities.SportCategory.create({ ...cat, is_active: true, min_age: 13, max_age: 30 });
    }
    queryClient.invalidateQueries({ queryKey: ['sport-categories'] });
    toast.success(`Added ${toCreate.length} default categories`);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Dumbbell size={26} className="text-fire-3" />
          <h2 className="font-orbitron font-black text-2xl text-fire-gradient">SPORT CATEGORIES</h2>
        </div>
        <div className="flex gap-2">
          <button onClick={handleSeedDefaults} className="btn-ghost text-[10px] py-2 px-4">
            ⚡ Seed Defaults
          </button>
          <button onClick={() => setShowAdd(v => !v)} className="btn-fire text-[10px] py-2 px-4 flex items-center gap-2">
            <Plus size={14} /> Add Custom
          </button>
        </div>
      </div>

      {/* Add form */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 p-5 bg-fire-3/5 border border-fire-3/20 space-y-3"
          >
            <p className="font-mono text-[9px] uppercase tracking-[2px] text-fire-3/50 mb-2">New Sport Category</p>
            <div className="grid grid-cols-3 gap-3">
              <input
                className="cyber-input"
                placeholder="Name (e.g. Capoeira)"
                value={newCat.name}
                onChange={e => setNewCat({ ...newCat, name: e.target.value })}
              />
              <input
                className="cyber-input"
                placeholder="Emoji (e.g. 🤸)"
                value={newCat.emoji}
                onChange={e => setNewCat({ ...newCat, emoji: e.target.value })}
              />
              <input
                className="cyber-input"
                placeholder="Short description"
                value={newCat.description}
                onChange={e => setNewCat({ ...newCat, description: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => createMutation.mutate({ ...newCat, is_active: true, min_age: 13, max_age: 30 })}
                disabled={!newCat.name || createMutation.isPending}
                className="btn-fire text-[10px] py-2 px-4 disabled:opacity-30"
              >
                {createMutation.isPending ? 'Saving...' : 'Create'}
              </button>
              <button onClick={() => setShowAdd(false)} className="btn-ghost text-[10px] py-2 px-4">
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* List */}
      {categories.length === 0 ? (
        <div className="text-center py-12 bg-fire-3/5 border border-fire-3/10">
          <Dumbbell size={40} className="text-fire-3/20 mx-auto mb-3" />
          <p className="font-mono text-xs text-fire-3/30 mb-4">No sport categories yet.</p>
          <button onClick={handleSeedDefaults} className="btn-fire text-[10px] py-2 px-6">
            ⚡ Seed Official Disciplines
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`flex items-center gap-4 p-4 border transition-all ${
                cat.is_active
                  ? 'bg-fire-3/5 border-fire-3/15'
                  : 'bg-black/20 border-white/5 opacity-50'
              }`}
            >
              <span className="text-2xl w-8 text-center flex-shrink-0">{cat.emoji}</span>

              {editingId === cat.id ? (
                <div className="flex-1 grid grid-cols-2 gap-2">
                  <input
                    className="cyber-input text-sm"
                    value={editForm.name || ''}
                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                    placeholder="Name"
                  />
                  <input
                    className="cyber-input text-sm"
                    value={editForm.description || ''}
                    onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                    placeholder="Description"
                  />
                </div>
              ) : (
                <div className="flex-1">
                  <span className="font-orbitron font-bold text-fire-4 text-sm">{cat.name}</span>
                  {cat.description && (
                    <p className="font-mono text-[10px] text-fire-3/40 mt-0.5">{cat.description}</p>
                  )}
                </div>
              )}

              <div className="flex items-center gap-2 flex-shrink-0">
                {editingId === cat.id ? (
                  <>
                    <button
                      onClick={() => updateMutation.mutate({ id: cat.id, data: editForm })}
                      className="p-1.5 bg-green-500/20 border border-green-500/40 text-green-400 hover:bg-green-500/30"
                    >
                      <Check size={13} />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="p-1.5 bg-white/5 border border-white/10 text-white/40 hover:text-white/70"
                    >
                      <X size={13} />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => { setEditingId(cat.id); setEditForm({ name: cat.name, description: cat.description, emoji: cat.emoji }); }}
                      className="p-1.5 bg-cyan/10 border border-cyan/20 text-cyan/60 hover:text-cyan hover:border-cyan/40"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => toggleActive(cat)}
                      className={`px-2 py-1 font-mono text-[9px] uppercase border transition-all ${
                        cat.is_active
                          ? 'border-green-500/40 text-green-400 bg-green-500/10 hover:bg-green-500/5'
                          : 'border-white/10 text-white/30 hover:border-white/20'
                      }`}
                    >
                      {cat.is_active ? 'Active' : 'Inactive'}
                    </button>
                    <button
                      onClick={() => { if (confirm(`Delete "${cat.name}"?`)) deleteMutation.mutate(cat.id); }}
                      className="p-1.5 bg-red-500/10 border border-red-500/20 text-red-500/50 hover:text-red-400 hover:border-red-500/40"
                    >
                      <Trash2 size={13} />
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <p className="font-mono text-[9px] text-fire-3/30 mt-4 tracking-[1px]">
        {categories.filter(c => c.is_active).length} active · {categories.length} total · Sport field in all events and tokens is locked to these categories only.
      </p>
    </div>
  );
}