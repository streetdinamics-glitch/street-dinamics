import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Clock, TrendingUp, Users, Volume2 } from 'lucide-react';

export default function LiveEventTicker({ eventId, eventStatus = 'live' }) {
  const [scrollIndex, setScrollIndex] = useState(0);
  const [dismissedNotifications, setDismissedNotifications] = useState([]);

  // Fetch live event data
  const { data: event = {} } = useQuery({
    queryKey: ['event-details', eventId],
    queryFn: () => base44.entities.Event.filter({ id: eventId }).then(r => r[0]),
    enabled: !!eventId,
    refetchInterval: 30000,
  });

  // Fetch live scores
  const { data: liveScores = [] } = useQuery({
    queryKey: ['live-scores', eventId],
    queryFn: () => base44.entities.EventScore.filter({ event_id: eventId, status: 'submitted' }).then(r => r.sort((a, b) => (b.score || 0) - (a.score || 0))),
    enabled: !!eventId && eventStatus === 'live',
    refetchInterval: 15000,
  });

  // Fetch active voting campaigns
  const { data: activeCampaigns = [] } = useQuery({
    queryKey: ['active-campaigns', eventId],
    queryFn: () => base44.entities.EventVote.filter({ event_id: eventId, status: 'active' }),
    enabled: !!eventId,
    refetchInterval: 30000,
  });

  // Fetch upcoming events/phases
  const { data: allEvents = [] } = useQuery({
    queryKey: ['upcoming-events'],
    queryFn: () => base44.entities.Event.list('-date', 20),
    refetchInterval: 60000,
  });

  // Get current user for notifications
  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  // Parse phases from event
  const phases = useMemo(() => {
    if (!event.date) return [];
    const eventDate = new Date(event.date);
    const now = new Date();
    const hoursElapsed = (now - eventDate) / (1000 * 60 * 60);

    return [
      { name: 'Registration', duration: 24, start: -24, icon: 'Users', status: hoursElapsed > 0 ? 'completed' : 'upcoming' },
      { name: 'Pre-Event', duration: 1, start: 0, icon: 'Clock', status: hoursElapsed >= 0 && hoursElapsed < 1 ? 'live' : hoursElapsed >= 1 ? 'completed' : 'upcoming' },
      { name: 'Main Event', duration: 2, start: 1, icon: 'TrendingUp', status: hoursElapsed >= 1 && hoursElapsed < 3 ? 'live' : hoursElapsed >= 3 ? 'completed' : 'upcoming' },
      { name: 'Post-Event', duration: 1, start: 3, icon: 'Volume2', status: hoursElapsed >= 3 ? 'live' : 'upcoming' },
    ];
  }, [event]);

  // Build notification alerts
  const notifications = useMemo(() => {
    const alerts = [];

    if (activeCampaigns.length > 0) {
      alerts.push({
        id: 'voting-active',
        type: 'voting',
        title: 'Live Voting Active',
        message: `${activeCampaigns.length} campaigns open - cast your vote`,
        icon: 'Users',
        priority: 'high',
      });
    }

    if (liveScores.length > 0 && liveScores[0]) {
      alerts.push({
        id: 'top-score',
        type: 'score',
        title: 'Leading Score Update',
        message: `${liveScores[0].athlete_name} leads with ${liveScores[0].score} points`,
        icon: 'TrendingUp',
        priority: 'medium',
      });
    }

    const currentPhase = phases.find(p => p.status === 'live');
    if (currentPhase) {
      const nextPhase = phases.find(p => p.start > currentPhase.start);
      if (nextPhase) {
        alerts.push({
          id: 'phase-upcoming',
          type: 'phase',
          title: 'Phase Coming Up',
          message: `${nextPhase.name} phase starting soon`,
          icon: 'Clock',
          priority: 'low',
        });
      }
    }

    return alerts.filter(a => !dismissedNotifications.includes(a.id));
  }, [activeCampaigns, liveScores, phases, dismissedNotifications]);

  // Auto-scroll top scores
  useEffect(() => {
    if (liveScores.length <= 1) return;
    const interval = setInterval(() => {
      setScrollIndex(prev => (prev + 1) % liveScores.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [liveScores.length]);

  const topScores = liveScores.slice(0, 3);

  const dismissNotification = (id) => {
    setDismissedNotifications(prev => [...prev, id]);
    setTimeout(() => {
      setDismissedNotifications(prev => prev.filter(x => x !== id));
    }, 10000);
  };

  const upcomingEvents = allEvents
    .filter(e => new Date(e.date) > new Date() && e.id !== eventId)
    .slice(0, 2);

  return (
    <div className="w-full space-y-3">
      {/* Live Scores Ticker */}
      {liveScores.length > 0 && eventStatus === 'live' && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-fire-3/15 to-fire-3/5 border border-fire-3/30 p-4 clip-cyber overflow-hidden"
        >
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={16} className="text-fire-3 animate-pulse" />
            <span className="font-orbitron text-[11px] tracking-[2px] text-fire-3 uppercase">Live Scores</span>
          </div>

          <div className="space-y-2">
            <AnimatePresence mode="wait">
              {topScores.map((score, idx) => (
                <motion.div
                  key={score.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="flex items-center justify-between p-2.5 bg-black/20 border border-fire-3/20 hover:border-fire-3/40 transition-all"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-6 h-6 flex items-center justify-center font-orbitron font-bold text-[12px] text-fire-3">
                      {idx + 1}
                    </div>
                    <div>
                      <div className="font-rajdhani font-bold text-sm text-fire-4">{score.athlete_name}</div>
                      <div className="font-mono text-[9px] text-fire-3/60">{score.performance_metrics?.difficulty || 'Standard'}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-orbitron font-bold text-lg text-fire-5">{score.score}</div>
                    <div className="font-mono text-[8px] text-fire-3/60">{new Date(score.submitted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {/* Event Phases */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-r from-cyan/15 to-cyan/5 border border-cyan/30 p-4 clip-cyber"
      >
        <div className="flex items-center gap-2 mb-3">
          <Clock size={16} className="text-cyan" />
          <span className="font-orbitron text-[11px] tracking-[2px] text-cyan uppercase">Event Timeline</span>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {phases.map((phase, idx) => (
            <div
              key={phase.name}
              className={`flex-shrink-0 px-4 py-2.5 border-2 rounded-lg transition-all ${
                phase.status === 'live'
                  ? 'border-fire-3 bg-fire-3/20 shadow-[0_0_15px_rgba(255,100,0,0.3)]'
                  : phase.status === 'completed'
                  ? 'border-cyan/30 bg-cyan/5 opacity-60'
                  : 'border-cyan/30 bg-cyan/10'
              }`}
            >
              <div className="font-orbitron text-[10px] tracking-[1px] font-bold text-center">
                <div className={phase.status === 'live' ? 'text-fire-5' : phase.status === 'completed' ? 'text-cyan/60' : 'text-cyan'}>
                  {phase.name}
                </div>
                {phase.status === 'live' && (
                  <div className="text-[8px] text-fire-3 mt-1 font-mono tracking-[1px]">NOW</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Alert Notifications */}
      {notifications.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-2"
        >
          <AnimatePresence>
            {notifications.map((notification) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={`flex items-start gap-3 p-3 border-l-4 rounded ${
                  notification.priority === 'high'
                    ? 'border-l-red-500 bg-red-500/10 border border-red-500/30'
                    : notification.priority === 'medium'
                    ? 'border-l-fire-3 bg-fire-3/10 border border-fire-3/30'
                    : 'border-l-cyan border border-cyan/30 bg-cyan/10'
                }`}
              >
                <div className={notification.priority === 'high' ? 'text-red-500' : notification.priority === 'medium' ? 'text-fire-3' : 'text-cyan'}>
                  <AlertCircle size={18} />
                </div>
                <div className="flex-1">
                  <div className={`font-orbitron text-[11px] font-bold tracking-[1px] ${
                    notification.priority === 'high' ? 'text-red-400' : notification.priority === 'medium' ? 'text-fire-4' : 'text-cyan'
                  }`}>
                    {notification.title}
                  </div>
                  <div className="font-mono text-[10px] text-fire-3/60 mt-0.5">
                    {notification.message}
                  </div>
                </div>
                <button
                  onClick={() => dismissNotification(notification.id)}
                  className="text-xs font-mono text-fire-3/40 hover:text-fire-3 transition-colors flex-shrink-0"
                >
                  Dismiss
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Upcoming Events Preview */}
      {upcomingEvents.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-purple-500/15 to-purple-500/5 border border-purple-500/30 p-4 clip-cyber"
        >
          <div className="flex items-center gap-2 mb-3">
            <Volume2 size={16} className="text-purple-400" />
            <span className="font-orbitron text-[11px] tracking-[2px] text-purple-400 uppercase">Coming Up Next</span>
          </div>

          <div className="space-y-2">
            {upcomingEvents.map((evt) => (
              <div key={evt.id} className="flex items-center justify-between p-2.5 bg-black/20 border border-purple-500/20">
                <div>
                  <div className="font-rajdhani font-bold text-sm text-purple-400">{evt.title}</div>
                  <div className="font-mono text-[9px] text-purple-400/60">
                    {new Date(evt.date).toLocaleDateString([], { month: 'short', day: 'numeric' })} - {evt.sport}
                  </div>
                </div>
                <div className="text-[10px] font-orbitron text-purple-400/60">{evt.location}</div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}