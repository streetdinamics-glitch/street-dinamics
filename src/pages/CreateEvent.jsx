import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function CreateEvent() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    sport: '',
    date: '',
    location: '',
    description: '',
    max_spots: 50,
    filled_spots: 0,
    status: 'upcoming',
  });

  const createEvent = useMutation({
    mutationFn: (data) => base44.entities.Event.create(data),
    onSuccess: () => {
      navigate(createPageUrl('Home'));
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createEvent.mutate(form);
  };

  return (
    <div className="min-h-screen bg-cyber-void p-6">
      <div className="max-w-[700px] mx-auto">
        <div className="relative bg-gradient-to-br from-[rgba(10,4,18,0.99)] to-[rgba(4,2,8,1)] border border-fire-3/20 clip-cyber p-8">
          <div className="absolute top-0 left-0 right-0 fire-line" />
          
          <h1 className="text-fire-gradient font-orbitron font-black text-3xl tracking-[2px] mb-6">
            CREATE NEW EVENT
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="font-mono text-[11px] tracking-[2px] uppercase text-fire-3/30 block mb-1">
                Event Title *
              </label>
              <input
                className="cyber-input"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="font-mono text-[11px] tracking-[2px] uppercase text-fire-3/30 block mb-1">
                  Sport *
                </label>
                <input
                  className="cyber-input"
                  required
                  value={form.sport}
                  onChange={(e) => setForm({ ...form, sport: e.target.value })}
                />
              </div>
              <div>
                <label className="font-mono text-[11px] tracking-[2px] uppercase text-fire-3/30 block mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  className="cyber-input"
                  required
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="font-mono text-[11px] tracking-[2px] uppercase text-fire-3/30 block mb-1">
                Location *
              </label>
              <input
                className="cyber-input"
                required
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </div>

            <div>
              <label className="font-mono text-[11px] tracking-[2px] uppercase text-fire-3/30 block mb-1">
                Description
              </label>
              <textarea
                className="cyber-input h-24"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <div>
              <label className="font-mono text-[11px] tracking-[2px] uppercase text-fire-3/30 block mb-1">
                Max Participants
              </label>
              <input
                type="number"
                className="cyber-input"
                value={form.max_spots}
                onChange={(e) => setForm({ ...form, max_spots: parseInt(e.target.value) || 50 })}
              />
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => navigate(createPageUrl('Home'))}
                className="btn-ghost py-3 px-5"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createEvent.isPending}
                className="btn-fire flex-1 py-3 disabled:opacity-20"
              >
                {createEvent.isPending ? 'Creating...' : '✓ Create Event'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}