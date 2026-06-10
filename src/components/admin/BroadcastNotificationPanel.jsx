/**
 * BroadcastNotificationPanel — Admin panel to:
 * 3. Send broadcast notification to all users or a target segment
 */
import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Bell, Send, Users, User, Megaphone } from 'lucide-react';
import { toast } from 'sonner';

const TARGETS = [
  { key: 'all',      label: 'Tutti gli utenti',   icon: Users },
  { key: 'fans',     label: 'Solo fan',            icon: User },
  { key: 'athletes', label: 'Solo atleti',          icon: User },
];

const NOTIF_TYPES = [
  { key: 'announcement', label: '📢 Annuncio',     color: '#ff6600' },
  { key: 'event',        label: '🎟️ Evento',       color: '#00ffee' },
  { key: 'reward',       label: '🎁 Premio',        color: '#fbbf24' },
  { key: 'system',       label: '⚙️ Sistema',       color: '#94a3b8' },
];

export default function BroadcastNotificationPanel() {
  const queryClient = useQueryClient();
  const [target, setTarget] = useState('all');
  const [notifType, setNotifType] = useState('announcement');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [link, setLink] = useState('');
  const [sending, setSending] = useState(false);

  const { data: users = [] } = useQuery({
    queryKey: ['all-users-notif'],
    queryFn: () => base44.entities.User.list('-created_date', 500),
    initialData: [],
  });

  const { data: recentNotifs = [] } = useQuery({
    queryKey: ['recent-broadcast-notifs'],
    queryFn: () => base44.entities.Notification.list('-created_date', 20),
    initialData: [],
  });

  const getTargetUsers = () => {
    if (target === 'fans') return users.filter(u => u.role === 'user' || u.user_type === 'fan');
    if (target === 'athletes') return users.filter(u => u.user_type === 'athlete');
    return users;
  };

  const handleSend = async () => {
    if (!title || !message) return;
    const targetUsers = getTargetUsers();
    if (!confirm(`Inviare a ${targetUsers.length} utenti?`)) return;

    setSending(true);
    try {
      // Create a Notification record for each target user (bulk via Promise.all in batches)
      const batch = targetUsers.map(u =>
        base44.entities.Notification.create({
          user_email: u.email,
          user_name: u.full_name,
          type: notifType,
          title,
          message,
          link: link || null,
          read: false,
          created_at: new Date().toISOString(),
        })
      );
      await Promise.all(batch);
      queryClient.invalidateQueries({ queryKey: ['recent-broadcast-notifs'] });
      toast.success(`✅ Notifica inviata a ${targetUsers.length} utenti!`);
      setTitle('');
      setMessage('');
      setLink('');
    } catch (e) {
      toast.error('Errore invio: ' + e.message);
    } finally {
      setSending(false);
    }
  };

  const targetCount = getTargetUsers().length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Megaphone size={26} className="text-fire-4" />
        <h2 className="font-orbitron font-black text-2xl text-fire-gradient">BROADCAST NOTIFICHE</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compose */}
        <div className="space-y-4 p-5 border border-fire-3/20 bg-fire-3/5">
          {/* Target */}
          <div>
            <div className="font-mono text-[10px] tracking-[2px] uppercase text-white/40 mb-2">Destinatari</div>
            <div className="flex gap-2">
              {TARGETS.map(t => (
                <button
                  key={t.key}
                  onClick={() => setTarget(t.key)}
                  className={`flex-1 py-2 px-2 font-mono text-[10px] border transition-all ${
                    target === t.key ? 'border-fire-4/60 bg-fire-3/15 text-fire-5' : 'border-white/8 text-white/30 hover:border-white/20'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <div className="font-mono text-[9px] text-white/25 mt-1">{targetCount} utenti selezionati</div>
          </div>

          {/* Type */}
          <div>
            <div className="font-mono text-[10px] tracking-[2px] uppercase text-white/40 mb-2">Tipo</div>
            <div className="grid grid-cols-2 gap-1.5">
              {NOTIF_TYPES.map(n => (
                <button
                  key={n.key}
                  onClick={() => setNotifType(n.key)}
                  className={`py-2 px-3 font-mono text-[10px] border transition-all text-left ${
                    notifType === n.key ? 'border-fire-4/60 bg-fire-3/15' : 'border-white/8 text-white/30'
                  }`}
                  style={{ color: notifType === n.key ? n.color : undefined }}
                >
                  {n.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="font-mono text-[10px] tracking-[2px] uppercase text-white/40 block mb-1">Titolo *</label>
            <input
              className="cyber-input"
              placeholder="es. Nuovo torneo disponibile!"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>
          <div>
            <label className="font-mono text-[10px] tracking-[2px] uppercase text-white/40 block mb-1">Messaggio *</label>
            <textarea
              className="cyber-input"
              rows={3}
              placeholder="Testo della notifica..."
              value={message}
              onChange={e => setMessage(e.target.value)}
            />
          </div>
          <div>
            <label className="font-mono text-[10px] tracking-[2px] uppercase text-white/40 block mb-1">Link (opzionale)</label>
            <input
              className="cyber-input"
              placeholder="/Home o /marketplace"
              value={link}
              onChange={e => setLink(e.target.value)}
            />
          </div>

          <button
            onClick={handleSend}
            disabled={!title || !message || sending || targetCount === 0}
            className="btn-fire w-full text-[11px] py-3 flex items-center justify-center gap-2 disabled:opacity-30"
          >
            {sending ? (
              <><span className="animate-spin">⏳</span> Invio in corso...</>
            ) : (
              <><Send size={14} /> Invia a {targetCount} utenti</>
            )}
          </button>
        </div>

        {/* Recent sends */}
        <div>
          <div className="font-mono text-[10px] tracking-[2px] uppercase text-white/40 mb-3">INVII RECENTI</div>
          <div className="space-y-2 max-h-[50vh] overflow-y-auto">
            {recentNotifs.length === 0 && (
              <p className="font-mono text-xs text-white/20 text-center py-8">Nessuna notifica inviata</p>
            )}
            {recentNotifs.map(n => (
              <div key={n.id} className="p-3 border border-white/6 bg-black/30 flex items-start gap-3">
                <Bell size={12} className="text-fire-3/50 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="font-orbitron text-xs text-fire-5 truncate">{n.title}</div>
                  <div className="font-mono text-[9px] text-white/25 truncate">{n.message}</div>
                  <div className="font-mono text-[8px] text-white/18 mt-0.5">{n.user_email}</div>
                </div>
                <div className="font-mono text-[8px] text-white/20 flex-shrink-0">
                  {n.created_at ? new Date(n.created_at).toLocaleDateString('it') : ''}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}