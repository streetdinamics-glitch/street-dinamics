import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle, Send, Pin, Trash2,
  Users, X, ExternalLink, Radio, BarChart2
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const TABS = [
  { id: 'chat', label: 'Chat', icon: MessageCircle },
  { id: 'stats', label: 'Predictions', icon: BarChart2 },
];

const MSG_COLORS = {
  announcement: { bg: 'bg-yellow-500/10 border-yellow-500/40', text: 'text-yellow-200', badge: 'bg-yellow-500/20 text-yellow-300' },
  answer:       { bg: 'bg-green-500/10 border-green-500/40',  text: 'text-green-200',  badge: 'bg-green-500/20 text-green-300'  },
  update:       { bg: 'bg-blue-500/10 border-blue-500/40',    text: 'text-blue-200',   badge: 'bg-blue-500/20 text-blue-300'   },
  regular:      { bg: 'bg-white/5 border-white/10',           text: 'text-fire-4/90',  badge: null },
};

function StreamBadge({ event }) {
  if (!event.kick_live_url && !event.youtube_live_url) return null;
  const isKick = !!event.kick_live_url;
  const url = event.kick_live_url || event.youtube_live_url;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center gap-1.5 px-2 py-1 text-[9px] font-mono uppercase tracking-[1px] border transition-all hover:opacity-80 ${
        isKick ? 'border-green-500/40 bg-green-500/10 text-green-400' : 'border-red-500/40 bg-red-500/10 text-red-400'
      }`}
    >
      <Radio size={10} className="animate-pulse" />
      {isKick ? 'Kick' : 'YouTube'} Live
      <ExternalLink size={9} />
    </a>
  );
}

export default function LiveEventSidebar({ event }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState('chat');
  const [message, setMessage] = useState('');
  const [lastSeenCount, setLastSeenCount] = useState(0);
  const messagesEndRef = useRef(null);

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['chat-messages', event.id],
    queryFn: () => base44.entities.ChatMessage.filter(
      { event_id: event.id, is_deleted: false },
      '-timestamp',
      150
    ),
    enabled: event.status === 'live',
    initialData: [],
    refetchInterval: 3000,
  });

  // Fetch live voting campaigns for this event
  const { data: voteCampaigns = [] } = useQuery({
    queryKey: ['vote-campaigns-sidebar', event.id],
    queryFn: () => base44.entities.EventVote.filter({ event_id: event.id, status: 'live' }),
    enabled: event.status === 'live',
    initialData: [],
    refetchInterval: 5000,
  });

  // Fetch active bets for this event
  const { data: bets = [] } = useQuery({
    queryKey: ['event-bets-sidebar', event.id],
    queryFn: () => base44.entities.Bet.filter({ event_id: event.id, status: 'active' }),
    enabled: event.status === 'live',
    initialData: [],
    refetchInterval: 5000,
  });

  // Real-time subscription
  useEffect(() => {
    if (event.status !== 'live') return;
    const unsub = base44.entities.ChatMessage.subscribe((evt) => {
      if (evt.type === 'create') {
        queryClient.invalidateQueries({ queryKey: ['chat-messages', event.id] });
      }
    });
    return unsub;
  }, [event.id, event.status, queryClient]);

  // Auto scroll when open
  useEffect(() => {
    if (open && tab === 'chat' && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open, tab]);

  // Track unread when sidebar is closed
  useEffect(() => {
    if (open) setLastSeenCount(messages.length);
  }, [open, messages.length]);

  if (event.status !== 'live') return null;

  const isAdmin = user?.role === 'admin';
  const unreadCount = Math.max(0, messages.length - lastSeenCount);
  const uniqueUsers = new Set(messages.map(m => m.user_email)).size;
  const orderedMessages = [...messages].reverse(); // oldest → newest for display
  const pinnedMessages = messages.filter(m => m.is_pinned);

  // Build vote stats from EventVote choices
  const voteStats = voteCampaigns.flatMap(campaign =>
    (campaign.choices || []).map(choice => ({
      label: choice.label,
      count: choice.votes || choice.vote_count || 0,
      total: campaign.total_votes || 0,
    }))
  );

  // Bet pool breakdown
  const betPool = { team_a: 0, team_b: 0, draw: 0 };
  bets.forEach(b => { if (b.outcome) betPool[b.outcome] = (betPool[b.outcome] || 0) + (b.amount || 0); });
  const totalPool = Object.values(betPool).reduce((s, n) => s + n, 0);

  const sendMsg = useMutation({
    mutationFn: async ({ text, type }) => {
      const u = await base44.auth.me();
      return base44.entities.ChatMessage.create({
        event_id: event.id,
        user_email: u.email,
        user_name: u.full_name,
        user_role: u.role || 'fan',
        message: text,
        message_type: type,
        timestamp: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      setMessage('');
      queryClient.invalidateQueries({ queryKey: ['chat-messages', event.id] });
    },
    onError: () => toast.error('Failed to send message'),
  });

  const deleteMsg = useMutation({
    mutationFn: (id) => base44.entities.ChatMessage.update(id, { is_deleted: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['chat-messages', event.id] }),
  });

  const pinMsg = useMutation({
    mutationFn: ({ id, pin }) => base44.entities.ChatMessage.update(id, { is_pinned: pin }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['chat-messages', event.id] }),
  });

  const handleSend = (e, type = 'regular') => {
    e.preventDefault();
    const text = message.trim();
    if (!text || !user) return;
    if (text.length > 500) { toast.error('Max 500 characters'); return; }
    sendMsg.mutate({ text, type });
  };

  return (
    <>
      {/* Floating toggle button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-6 z-[501] flex items-center gap-2 px-4 py-3 bg-purple-700 border border-purple-400/40 shadow-[0_0_30px_rgba(155,0,255,0.4)] hover:shadow-[0_0_50px_rgba(155,0,255,0.7)] transition-all font-orbitron text-[10px] tracking-[2px] uppercase text-white"
        style={{ clipPath: 'polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)' }}
      >
        <Radio size={14} className="text-red-400 animate-pulse" />
        LIVE CHAT
        {unreadCount > 0 && !open && (
          <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </motion.button>

      {/* Sidebar panel */}
      <AnimatePresence>
        {open && (
          <>
            {/* Mobile backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[498] bg-black/50 md:hidden"
              onClick={() => setOpen(false)}
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 bottom-0 z-[500] w-full max-w-[380px] flex flex-col bg-[rgba(6,2,12,0.99)] border-l border-purple-500/30 shadow-[-20px_0_60px_rgba(155,0,255,0.2)]"
            >
              {/* ── Header ── */}
              <div className="flex-shrink-0 p-4 border-b border-purple-500/20 bg-gradient-to-r from-purple-600/10 to-transparent">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <Radio size={13} className="text-red-400 animate-pulse flex-shrink-0" />
                    <span className="font-orbitron font-bold text-sm text-purple-300 tracking-[1px] uppercase truncate">
                      {event.title}
                    </span>
                  </div>
                  <button
                    onClick={() => setOpen(false)}
                    className="p-1.5 hover:bg-white/10 transition-colors flex-shrink-0 ml-2"
                  >
                    <X size={16} className="text-fire-3/60" />
                  </button>
                </div>

                <div className="flex items-center gap-2 flex-wrap mb-3">
                  <StreamBadge event={event} />
                  <div className="flex items-center gap-1 px-2 py-1 bg-white/5 border border-white/10 text-[9px] font-mono text-fire-3/60">
                    <Users size={10} />
                    {uniqueUsers} online
                  </div>
                  {pinnedMessages.length > 0 && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-yellow-500/10 border border-yellow-500/30 text-[9px] font-mono text-yellow-400">
                      <Pin size={10} />
                      {pinnedMessages.length} pinned
                    </div>
                  )}
                </div>

                {/* Tabs */}
                <div className="flex gap-1">
                  {TABS.map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => setTab(id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 font-orbitron text-[9px] tracking-[1px] uppercase border transition-all ${
                        tab === id
                          ? 'border-purple-400 bg-purple-500/20 text-purple-300'
                          : 'border-white/10 text-fire-3/40 hover:border-purple-500/30 hover:text-purple-400'
                      }`}
                    >
                      <Icon size={11} />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── CHAT TAB ── */}
              {tab === 'chat' && (
                <>
                  {/* Pinned strip */}
                  {pinnedMessages.length > 0 && (
                    <div className="flex-shrink-0 px-3 pt-2 space-y-1.5 border-b border-yellow-500/20 pb-2">
                      {pinnedMessages.slice(0, 2).map(msg => (
                        <div key={msg.id} className="flex items-start gap-2 p-2 bg-yellow-500/10 border border-yellow-500/30 text-xs">
                          <Pin size={11} className="text-yellow-400 mt-0.5 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <span className="font-mono text-[9px] text-yellow-500 font-bold mr-1">{msg.user_name}</span>
                            <span className="font-rajdhani text-yellow-200/80 break-words">{msg.message}</span>
                          </div>
                          {isAdmin && (
                            <button
                              onClick={() => pinMsg.mutate({ id: msg.id, pin: false })}
                              className="flex-shrink-0 text-yellow-500/40 hover:text-yellow-400 ml-1"
                            >
                              <X size={10} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5 min-h-0">
                    {orderedMessages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center py-10">
                        <MessageCircle size={36} className="text-purple-500/20 mb-3" />
                        <p className="font-mono text-xs text-purple-400/30 tracking-[1px]">Be the first to chat!</p>
                      </div>
                    ) : (
                      orderedMessages.map((msg) => {
                        const isOwn = user?.email === msg.user_email;
                        const style = MSG_COLORS[msg.message_type] || MSG_COLORS.regular;
                        return (
                          <div
                            key={msg.id}
                            className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} group`}
                          >
                            <div className="flex items-baseline gap-1.5 mb-0.5 px-1">
                              <span className={`font-mono text-[9px] font-bold ${
                                msg.user_role === 'admin' ? 'text-red-400' : isOwn ? 'text-cyan' : 'text-purple-400'
                              }`}>
                                {msg.user_role === 'admin' ? '🛡 ' : ''}{msg.user_name}
                              </span>
                              <span className="font-mono text-[8px] text-white/20">
                                {new Date(msg.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <div className={`relative max-w-[85%] px-3 py-2 border ${style.bg} ${style.text}`}>
                              {msg.message_type !== 'regular' && (
                                <span className={`inline-block text-[8px] font-mono uppercase px-1.5 py-0.5 mr-1.5 ${style.badge}`}>
                                  {msg.message_type}
                                </span>
                              )}
                              <span className="font-rajdhani text-sm leading-snug break-words">{msg.message}</span>

                              {/* Admin controls — inline below message to avoid overflow */}
                              {isAdmin && (
                                <div className="flex gap-1 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={() => pinMsg.mutate({ id: msg.id, pin: !msg.is_pinned })}
                                    className="flex items-center gap-1 px-1.5 py-0.5 bg-yellow-500/20 border border-yellow-500/30 hover:bg-yellow-500/40 text-[8px] font-mono text-yellow-400"
                                    title={msg.is_pinned ? 'Unpin' : 'Pin'}
                                  >
                                    <Pin size={9} /> {msg.is_pinned ? 'Unpin' : 'Pin'}
                                  </button>
                                  <button
                                    onClick={() => deleteMsg.mutate(msg.id)}
                                    className="flex items-center gap-1 px-1.5 py-0.5 bg-red-500/20 border border-red-500/30 hover:bg-red-500/40 text-[8px] font-mono text-red-400"
                                    title="Delete"
                                  >
                                    <Trash2 size={9} /> Del
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  <div className="flex-shrink-0 p-3 border-t border-purple-500/20 bg-black/40">
                    {user ? (
                      <div className="space-y-2">
                        <form onSubmit={(e) => handleSend(e, 'regular')} className="flex gap-2">
                          <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Predict, debate, react..."
                            className="flex-1 cyber-input text-sm py-2"
                            maxLength={500}
                            disabled={sendMsg.isPending}
                          />
                          <button
                            type="submit"
                            disabled={!message.trim() || sendMsg.isPending}
                            className="btn-fire text-[10px] py-2 px-4 flex items-center gap-1.5 disabled:opacity-30"
                          >
                            <Send size={12} />
                            Send
                          </button>
                        </form>
                        {isAdmin && (
                          <div className="flex gap-1">
                            {[
                              { type: 'announcement', label: '📢 Announce', cls: 'border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10' },
                              { type: 'answer',       label: '✅ Answer',   cls: 'border-green-500/30 text-green-400 hover:bg-green-500/10'  },
                              { type: 'update',       label: '🔵 Update',   cls: 'border-blue-500/30 text-blue-400 hover:bg-blue-500/10'    },
                            ].map(({ type, label, cls }) => (
                              <button
                                key={type}
                                onClick={(e) => handleSend(e, type)}
                                disabled={!message.trim() || sendMsg.isPending}
                                className={`flex-1 py-1 px-2 font-mono text-[8px] uppercase tracking-[1px] border transition-all disabled:opacity-30 ${cls}`}
                              >
                                {label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-3 bg-purple-500/5 border border-purple-500/20">
                        <p className="font-mono text-xs text-purple-400/50">Sign in to join the chat</p>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* ── PREDICTIONS TAB ── */}
              {tab === 'stats' && (
                <div className="flex-1 overflow-y-auto p-4 space-y-6 min-h-0">

                  {/* Live voting breakdown */}
                  <div>
                    <p className="font-mono text-[9px] tracking-[2px] uppercase text-fire-3/40 mb-3">Live Vote Breakdown</p>
                    {voteStats.length === 0 ? (
                      <div className="text-center py-8">
                        <BarChart2 size={32} className="text-fire-3/20 mx-auto mb-2" />
                        <p className="font-mono text-xs text-fire-3/30">No active voting campaigns</p>
                      </div>
                    ) : (
                      voteStats.map((item, i) => {
                        const pct = item.total > 0 ? Math.round((item.count / item.total) * 100) : 0;
                        return (
                          <div key={i} className="mb-3">
                            <div className="flex justify-between mb-1">
                              <span className="font-rajdhani font-bold text-fire-4 text-sm">{item.label}</span>
                              <span className="font-mono text-xs text-fire-3/60">{item.count} · {pct}%</span>
                            </div>
                            <div className="h-2 bg-fire-3/10 overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 0.6 }}
                                className="h-full bg-gradient-to-r from-fire-3 to-fire-5"
                              />
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Bet pool */}
                  <div>
                    <p className="font-mono text-[9px] tracking-[2px] uppercase text-cyan/40 mb-3">
                      Betting Pool — {totalPool} tokens wagered
                    </p>
                    {totalPool === 0 ? (
                      <p className="font-mono text-xs text-fire-3/30">No active bets</p>
                    ) : (
                      Object.entries(betPool).map(([outcome, amount]) => {
                        const pct = totalPool > 0 ? Math.round((amount / totalPool) * 100) : 0;
                        return (
                          <div key={outcome} className="mb-3">
                            <div className="flex justify-between mb-1">
                              <span className="font-rajdhani text-cyan/80 text-sm capitalize">{outcome.replace(/_/g, ' ')}</span>
                              <span className="font-mono text-xs text-cyan/50">{amount} tkn · {pct}%</span>
                            </div>
                            <div className="h-1.5 bg-cyan/10 overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 0.6 }}
                                className="h-full bg-gradient-to-r from-cyan/60 to-cyan"
                              />
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Stream links */}
                  {(event.kick_live_url || event.youtube_live_url) && (
                    <div>
                      <p className="font-mono text-[9px] tracking-[2px] uppercase text-fire-3/40 mb-3">Watch Live</p>
                      <div className="space-y-2">
                        {event.kick_live_url && (
                          <a href={event.kick_live_url} target="_blank" rel="noopener noreferrer"
                            className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/30 hover:bg-green-500/20 transition-all group">
                            <span className="font-orbitron text-[10px] text-green-400 tracking-[1px]">KICK STREAM</span>
                            <ExternalLink size={12} className="text-green-400 group-hover:translate-x-0.5 transition-transform" />
                          </a>
                        )}
                        {event.youtube_live_url && (
                          <a href={event.youtube_live_url} target="_blank" rel="noopener noreferrer"
                            className="flex items-center justify-between p-3 bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 transition-all group">
                            <span className="font-orbitron text-[10px] text-red-400 tracking-[1px]">YOUTUBE STREAM</span>
                            <ExternalLink size={12} className="text-red-400 group-hover:translate-x-0.5 transition-transform" />
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}