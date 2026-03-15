import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BellOff, X, Plus, Star, Dumbbell, Radio, Clock, Trash2, Monitor } from 'lucide-react';
import { toast } from 'sonner';
import EventCountdown from './EventCountdown';

const SPORTS = ['Skateboarding', 'BMX', 'Parkour', 'Breakdancing', 'Freestyle Football', 'Street Basketball', 'Slacklining', 'Rollerblade'];

export default function MySubscriptionsPanel({
  user,
  events = [],
  subscriptions = [],
  addSub,
  removeSub,
  toggleAlert,
  isSubscribed,
  getSubscription,
  requestBrowserPermission,
  onClose,
}) {
  const [tab, setTab] = useState('subscriptions'); // 'subscriptions' | 'discover'
  const [browserGranted, setBrowserGranted] = useState(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission === 'granted' : false
  );

  const handleBrowserPermission = async () => {
    const granted = await requestBrowserPermission();
    setBrowserGranted(granted);
    if (!granted) toast.error('Browser notifications blocked. Check your browser settings.');
  };

  // Upcoming events that match user subscriptions
  const followedEvents = events.filter(event => {
    if (event.status === 'ended') return false;
    return subscriptions.some(s =>
      (s.type === 'sport' && s.value === event.sport)
    );
  });

  // Unique sports from events for discovery
  const availableSports = [...new Set([...SPORTS, ...events.map(e => e.sport).filter(Boolean)])];

  // Unique athletes from token events
  const subscribedAthletes = subscriptions.filter(s => s.type === 'athlete');
  const subscribedSports = subscriptions.filter(s => s.type === 'sport');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[600] flex items-end sm:items-center justify-center p-4 bg-black/70"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-lg max-h-[85vh] flex flex-col bg-[rgba(6,2,12,0.99)] border border-purple-500/30 clip-cyber shadow-[0_0_80px_rgba(155,0,255,0.2)]"
      >
        {/* Header */}
        <div className="flex-shrink-0 p-5 border-b border-purple-500/20 bg-gradient-to-r from-purple-600/10 to-transparent">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Bell size={18} className="text-purple-400" />
              <h2 className="font-orbitron font-bold text-lg text-purple-300 tracking-[2px] uppercase">My Subscriptions</h2>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-white/10 transition-colors">
              <X size={16} className="text-fire-3/60" />
            </button>
          </div>

          {/* Browser notification prompt */}
          {!browserGranted && (
            <button
              onClick={handleBrowserPermission}
              className="w-full flex items-center gap-3 p-3 bg-fire-3/5 border border-fire-3/20 hover:border-fire-3/40 transition-all mb-3"
            >
              <Monitor size={16} className="text-fire-3 flex-shrink-0" />
              <div className="text-left">
                <p className="font-orbitron text-[10px] text-fire-4 tracking-[1px] uppercase">Enable Browser Alerts</p>
                <p className="font-mono text-[9px] text-fire-3/50 mt-0.5">Get notified when followed events go live</p>
              </div>
              <Plus size={14} className="text-fire-3 ml-auto flex-shrink-0" />
            </button>
          )}

          {/* Tabs */}
          <div className="flex gap-1">
            {[
              { id: 'subscriptions', label: 'Following' },
              { id: 'discover', label: 'Discover' },
              { id: 'upcoming', label: `Upcoming${followedEvents.length ? ` (${followedEvents.length})` : ''}` },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-3 py-1.5 font-orbitron text-[9px] tracking-[1px] uppercase border transition-all ${
                  tab === t.id
                    ? 'border-purple-400 bg-purple-500/20 text-purple-300'
                    : 'border-white/10 text-fire-3/40 hover:border-purple-400/30 hover:text-purple-400'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 min-h-0">

          {/* ── FOLLOWING TAB ── */}
          {tab === 'subscriptions' && (
            <div className="space-y-4">
              {subscriptions.length === 0 ? (
                <div className="text-center py-12">
                  <Star size={36} className="text-fire-3/20 mx-auto mb-3" />
                  <p className="font-mono text-xs text-fire-3/30 tracking-[1px]">Not following anything yet</p>
                  <p className="font-mono text-[10px] text-fire-3/20 mt-1">Use the Discover tab to follow sports</p>
                </div>
              ) : (
                <>
                  {subscribedSports.length > 0 && (
                    <div>
                      <p className="font-mono text-[9px] tracking-[2px] uppercase text-fire-3/40 mb-2">Sports</p>
                      <div className="space-y-2">
                        {subscribedSports.map(sub => (
                          <SubRow
                            key={sub.id}
                            sub={sub}
                            icon={<Dumbbell size={14} className="text-fire-3" />}
                            onRemove={() => removeSub.mutate(sub.id)}
                            onToggleInApp={() => toggleAlert.mutate({ id: sub.id, field: 'in_app_alerts', value: !sub.in_app_alerts })}
                            onToggleBrowser={() => toggleAlert.mutate({ id: sub.id, field: 'browser_alerts', value: !sub.browser_alerts })}
                            browserGranted={browserGranted}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  {subscribedAthletes.length > 0 && (
                    <div>
                      <p className="font-mono text-[9px] tracking-[2px] uppercase text-fire-3/40 mb-2">Athletes</p>
                      <div className="space-y-2">
                        {subscribedAthletes.map(sub => (
                          <SubRow
                            key={sub.id}
                            sub={sub}
                            icon={<Star size={14} className="text-cyan" />}
                            onRemove={() => removeSub.mutate(sub.id)}
                            onToggleInApp={() => toggleAlert.mutate({ id: sub.id, field: 'in_app_alerts', value: !sub.in_app_alerts })}
                            onToggleBrowser={() => toggleAlert.mutate({ id: sub.id, field: 'browser_alerts', value: !sub.browser_alerts })}
                            browserGranted={browserGranted}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ── DISCOVER TAB ── */}
          {tab === 'discover' && (
            <div className="space-y-5">
              <div>
                <p className="font-mono text-[9px] tracking-[2px] uppercase text-fire-3/40 mb-3">Sports / Categories</p>
                <div className="flex flex-wrap gap-2">
                  {availableSports.map(sport => {
                    const followed = isSubscribed('sport', sport);
                    return (
                      <button
                        key={sport}
                        onClick={() => {
                          if (followed) {
                            const s = getSubscription('sport', sport);
                            if (s) removeSub.mutate(s.id);
                          } else {
                            addSub.mutate({ type: 'sport', value: sport, label: sport });
                          }
                        }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 font-mono text-[10px] uppercase border transition-all ${
                          followed
                            ? 'border-purple-400 bg-purple-500/20 text-purple-300'
                            : 'border-fire-3/20 text-fire-3/50 hover:border-fire-3/40 hover:text-fire-4'
                        }`}
                      >
                        {followed ? <Bell size={11} /> : <BellOff size={11} />}
                        {sport}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── UPCOMING TAB ── */}
          {tab === 'upcoming' && (
            <div className="space-y-3">
              {followedEvents.length === 0 ? (
                <div className="text-center py-12">
                  <Clock size={36} className="text-fire-3/20 mx-auto mb-3" />
                  <p className="font-mono text-xs text-fire-3/30 tracking-[1px]">No upcoming events for followed sports</p>
                </div>
              ) : (
                followedEvents.map(event => (
                  <div
                    key={event.id}
                    className={`p-4 border clip-cyber ${
                      event.status === 'live'
                        ? 'border-green-500/40 bg-green-500/5'
                        : 'border-fire-3/20 bg-fire-3/5'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h4 className="font-orbitron font-bold text-sm text-fire-5">{event.title}</h4>
                        <p className="font-mono text-[10px] text-fire-3/50 mt-0.5">{event.sport} · {event.location}</p>
                      </div>
                      {event.status === 'live' ? (
                        <span className="flex items-center gap-1 px-2 py-1 bg-green-500/20 border border-green-500/40 text-[9px] font-mono text-green-400 flex-shrink-0">
                          <Radio size={9} className="animate-pulse" /> LIVE
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-fire-3/10 border border-fire-3/20 text-[9px] font-mono text-fire-3/60 flex-shrink-0 uppercase">
                          {event.status}
                        </span>
                      )}
                    </div>
                    {event.status === 'upcoming' && event.date && (
                      <EventCountdown date={event.date} />
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function SubRow({ sub, icon, onRemove, onToggleInApp, onToggleBrowser, browserGranted }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-white/3 border border-white/8 hover:border-white/15 transition-all">
      {icon}
      <span className="font-rajdhani font-bold text-fire-4 flex-1 text-sm">{sub.label}</span>
      <div className="flex items-center gap-1">
        <button
          onClick={onToggleInApp}
          title="In-app alerts"
          className={`p-1.5 border transition-all ${sub.in_app_alerts ? 'border-purple-400/60 bg-purple-500/20 text-purple-300' : 'border-white/10 text-white/20 hover:text-white/40'}`}
        >
          <Bell size={11} />
        </button>
        {browserGranted && (
          <button
            onClick={onToggleBrowser}
            title="Browser alerts"
            className={`p-1.5 border transition-all ${sub.browser_alerts ? 'border-fire-3/60 bg-fire-3/10 text-fire-4' : 'border-white/10 text-white/20 hover:text-white/40'}`}
          >
            <Monitor size={11} />
          </button>
        )}
        <button
          onClick={onRemove}
          className="p-1.5 border border-red-500/20 text-red-500/40 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/40 transition-all"
        >
          <Trash2 size={11} />
        </button>
      </div>
    </div>
  );
}