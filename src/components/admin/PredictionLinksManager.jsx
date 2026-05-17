import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ExternalLink, Plus, Trash2, Eye, EyeOff } from 'lucide-react';

const PLATFORMS = [
  { id: 'polymarket', label: 'Polymarket', color: 'purple' },
  { id: 'kalshi',     label: 'Kalshi',     color: 'blue' },
];

export default function PredictionLinksManager() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ platform: 'polymarket', label: '', url: '', event_name: '' });
  const [adding, setAdding] = useState(false);

  const { data: links = [] } = useQuery({
    queryKey: ['prediction-links'],
    queryFn: () => base44.entities.PredictionLink.list('-created_date', 100),
  });

  const createLink = useMutation({
    mutationFn: (data) => base44.entities.PredictionLink.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prediction-links'] });
      setForm({ platform: 'polymarket', label: '', url: '', event_name: '' });
      setAdding(false);
      toast.success('Link added');
    },
    onError: (e) => toast.error('Error: ' + e.message),
  });

  const toggleLink = useMutation({
    mutationFn: ({ id, is_active }) => base44.entities.PredictionLink.update(id, { is_active }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['prediction-links'] }),
  });

  const deleteLink = useMutation({
    mutationFn: (id) => base44.entities.PredictionLink.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prediction-links'] });
      toast.success('Link deleted');
    },
  });

  const handleSubmit = () => {
    if (!form.label.trim() || !form.url.trim()) return;
    createLink.mutate({ ...form, is_active: true });
  };

  const grouped = {
    polymarket: links.filter(l => l.platform === 'polymarket'),
    kalshi:     links.filter(l => l.platform === 'kalshi'),
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-orbitron font-black text-xl text-fire-4">🔮 Prediction Market Links</h2>
          <p className="font-mono text-[9px] text-white/30 mt-1 tracking-[1px]">
            Only these links will be shown to users — SD events only
          </p>
        </div>
        <button onClick={() => setAdding(a => !a)} className="btn-fire text-[10px] py-2 px-4 flex items-center gap-2">
          <Plus size={12} /> Add Link
        </button>
      </div>

      {/* Add Form */}
      {adding && (
        <div className="mb-6 p-5 border border-fire-3/20 bg-fire-3/5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="font-mono text-[10px] tracking-[2px] uppercase text-fire-3/40 block mb-1">Platform</label>
              <select className="cyber-input" value={form.platform} onChange={e => setForm({ ...form, platform: e.target.value })}>
                {PLATFORMS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
              </select>
            </div>
            <div>
              <label className="font-mono text-[10px] tracking-[2px] uppercase text-fire-3/40 block mb-1">SD Event Name</label>
              <input className="cyber-input" placeholder="e.g. SD Skate Open 2026" value={form.event_name} onChange={e => setForm({ ...form, event_name: e.target.value })} />
            </div>
            <div>
              <label className="font-mono text-[10px] tracking-[2px] uppercase text-fire-3/40 block mb-1">Label / Question</label>
              <input className="cyber-input" placeholder="e.g. Who wins the SD Skate finals?" value={form.label} onChange={e => setForm({ ...form, label: e.target.value })} />
            </div>
            <div>
              <label className="font-mono text-[10px] tracking-[2px] uppercase text-fire-3/40 block mb-1">Market URL</label>
              <input className="cyber-input" placeholder="https://polymarket.com/event/..." value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setAdding(false)} className="btn-ghost text-[10px] py-2 px-4">Cancel</button>
            <button onClick={handleSubmit} disabled={!form.label || !form.url || createLink.isPending} className="btn-fire text-[10px] py-2 px-4 disabled:opacity-30">
              {createLink.isPending ? 'Saving...' : 'Save Link'}
            </button>
          </div>
        </div>
      )}

      {/* Links by platform */}
      {PLATFORMS.map(({ id, label, color }) => (
        <div key={id} className="mb-6">
          <div className={`font-mono text-[9px] tracking-[3px] uppercase mb-2 ${color === 'purple' ? 'text-purple-400/60' : 'text-blue-400/60'}`}>
            {label} Links ({grouped[id].length})
          </div>
          {grouped[id].length === 0 ? (
            <div className={`p-4 border border-dashed ${color === 'purple' ? 'border-purple-500/15' : 'border-blue-500/15'} text-center`}>
              <p className="font-mono text-[9px] text-white/20">No {label} links yet — add one above</p>
            </div>
          ) : (
            <div className="space-y-2">
              {grouped[id].map(link => (
                <div key={link.id} className={`flex items-center gap-3 p-3 border transition-all ${
                  color === 'purple' 
                    ? link.is_active ? 'border-purple-500/30 bg-purple-500/5' : 'border-white/5 bg-white/[0.01] opacity-40'
                    : link.is_active ? 'border-blue-500/30 bg-blue-500/5' : 'border-white/5 bg-white/[0.01] opacity-40'
                }`}>
                  <div className="flex-1 min-w-0">
                    <p className="font-rajdhani text-sm text-white/80 truncate">{link.label}</p>
                    {link.event_name && (
                      <p className="font-mono text-[8px] text-fire-3/40 mt-0.5">{link.event_name}</p>
                    )}
                    <p className="font-mono text-[7px] text-white/20 truncate mt-0.5">{link.url}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <a href={link.url} target="_blank" rel="noopener noreferrer" className={`p-1.5 border transition-all ${color === 'purple' ? 'border-purple-500/20 text-purple-400 hover:bg-purple-500/10' : 'border-blue-500/20 text-blue-400 hover:bg-blue-500/10'}`}>
                      <ExternalLink size={11} />
                    </a>
                    <button onClick={() => toggleLink.mutate({ id: link.id, is_active: !link.is_active })} className="p-1.5 border border-white/10 text-white/30 hover:text-white/60 transition-all">
                      {link.is_active ? <Eye size={11} /> : <EyeOff size={11} />}
                    </button>
                    <button onClick={() => deleteLink.mutate(link.id)} className="p-1.5 border border-red-500/20 text-red-400/50 hover:text-red-400 hover:bg-red-500/5 transition-all">
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}