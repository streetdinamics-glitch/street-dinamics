import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from '../translations';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';

export default function AdminPanel({ lang, onClose }) {
  const t = useTranslation(lang);
  const queryClient = useQueryClient();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [liveLinks, setLiveLinks] = useState({ kick: '', youtube: '' });
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const { data: events = [] } = useQuery({
    queryKey: ['admin-events'],
    queryFn: () => base44.entities.Event.list('-created_date', 100),
  });

  const updateEvent = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Event.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-events'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      setSelectedEvent(null);
      setLiveLinks({ kick: '', youtube: '' });
    },
  });

  const handleGoLive = (event) => {
    setSelectedEvent(event);
    setLiveLinks({
      kick: event.kick_live_url || '',
      youtube: event.youtube_live_url || '',
    });
  };

  const handleSaveLinks = () => {
    if (!selectedEvent) return;
    updateEvent.mutate({
      id: selectedEvent.id,
      data: {
        status: 'live',
        kick_live_url: liveLinks.kick,
        youtube_live_url: liveLinks.youtube,
      },
    });
  };

  const handleEndEvent = (event) => {
    updateEvent.mutate({
      id: event.id,
      data: { status: 'ended' },
    });
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      alert('Password must be at least 8 characters');
      return;
    }
    
    try {
      await base44.auth.updateMe({ password: newPassword });
      alert('Password changed successfully');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      alert('Failed to change password');
    }
  };

  return (
    <div className="fixed inset-0 z-[500] bg-black/95 backdrop-blur-xl flex items-start justify-center overflow-y-auto p-4">
      <div className="relative w-full max-w-[1100px] bg-gradient-to-br from-[rgba(10,4,18,0.99)] to-[rgba(4,2,8,1)] border border-fire-3/20 clip-cyber p-8 my-auto">
        <div className="absolute top-0 left-0 right-0 fire-line" />
        <button onClick={onClose} className="absolute top-3 right-4 font-mono text-[10px] tracking-[2px] text-fire-3/30 hover:text-fire-3">
          ✕ CLOSE
        </button>

        <h2 className="text-fire-gradient font-orbitron font-black text-2xl tracking-[2px] mb-6">
          {t('admin_panel')}
        </h2>

        {/* Create Event Button */}
        <Link
          to={createPageUrl('CreateEvent')}
          className="inline-block mb-8 btn-fire text-[11px] py-3 px-6 no-underline"
        >
          {t('admin_create_event')}
        </Link>

        {/* Events List */}
        <div className="space-y-4 mb-8">
          {events.map(event => (
            <div key={event.id} className="p-5 bg-fire-3/5 border border-fire-3/10 flex justify-between items-center">
              <div className="flex-1">
                <div className="font-orbitron font-bold text-lg text-fire-4 mb-1">{event.title}</div>
                <div className="font-mono text-xs text-fire-3/40">{event.date} • {event.location}</div>
                <div className={`inline-block mt-2 px-3 py-1 text-[9px] font-mono tracking-[2px] uppercase border ${
                  event.status === 'live' ? 'border-green-500/40 text-green-400 bg-green-500/5' :
                  event.status === 'ended' ? 'border-red-500/40 text-red-400 bg-red-500/5' :
                  'border-fire-3/40 text-fire-4 bg-fire-3/5'
                }`}>
                  {event.status}
                </div>
              </div>
              <div className="flex gap-2">
                {event.status === 'upcoming' && (
                  <button
                    onClick={() => handleGoLive(event)}
                    className="btn-fire text-[10px] py-2 px-4"
                  >
                    {t('admin_go_live')}
                  </button>
                )}
                {event.status === 'live' && (
                  <button
                    onClick={() => handleEndEvent(event)}
                    className="btn-ghost text-[10px] py-2 px-4"
                  >
                    {t('admin_end_event')}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Live Links Modal */}
        {selectedEvent && (
          <div className="mb-8 p-6 bg-green-500/5 border border-green-500/20">
            <h3 className="font-orbitron font-bold text-lg text-green-400 mb-4">
              {t('admin_go_live')}: {selectedEvent.title}
            </h3>
            <div className="space-y-3 mb-4">
              <div>
                <label className="font-mono text-[11px] tracking-[2px] uppercase text-fire-3/30 block mb-1">
                  {t('admin_kick_url')}
                </label>
                <input
                  className="cyber-input"
                  placeholder="https://kick.com/..."
                  value={liveLinks.kick}
                  onChange={(e) => setLiveLinks({ ...liveLinks, kick: e.target.value })}
                />
              </div>
              <div>
                <label className="font-mono text-[11px] tracking-[2px] uppercase text-fire-3/30 block mb-1">
                  {t('admin_youtube_url')}
                </label>
                <input
                  className="cyber-input"
                  placeholder="https://youtube.com/..."
                  value={liveLinks.youtube}
                  onChange={(e) => setLiveLinks({ ...liveLinks, youtube: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setSelectedEvent(null)} className="btn-ghost py-2 px-4 text-[10px]">
                Cancel
              </button>
              <button
                onClick={handleSaveLinks}
                disabled={!liveLinks.kick && !liveLinks.youtube}
                className="btn-fire py-2 px-4 text-[10px] disabled:opacity-20"
              >
                {t('admin_save_links')}
              </button>
            </div>
          </div>
        )}

        {/* Change Password */}
        <div className="p-6 bg-fire-3/5 border border-fire-3/10">
          <h3 className="font-orbitron font-bold text-lg text-fire-4 mb-4">{t('admin_change_pass')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="font-mono text-[11px] tracking-[2px] uppercase text-fire-3/30 block mb-1">
                New Password
              </label>
              <input
                type="password"
                className="cyber-input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div>
              <label className="font-mono text-[11px] tracking-[2px] uppercase text-fire-3/30 block mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                className="cyber-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>
          <button
            onClick={handleChangePassword}
            disabled={!newPassword || newPassword !== confirmPassword}
            className="btn-fire text-[10px] py-2 px-4 disabled:opacity-20"
          >
            {t('admin_change_pass')}
          </button>
        </div>
      </div>
    </div>
  );
}