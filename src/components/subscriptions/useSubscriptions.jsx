import { useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

/**
 * Returns user's subscriptions + helpers to add/remove/check.
 * Also fires browser / in-app alerts when a followed event goes live.
 */
export function useSubscriptions(user, events = []) {
  const queryClient = useQueryClient();
  const notifiedRef = useRef(new Set()); // track already-alerted event IDs

  const { data: subscriptions = [] } = useQuery({
    queryKey: ['subscriptions', user?.email],
    queryFn: () => base44.entities.Subscription.filter({ user_email: user.email }),
    enabled: !!user,
    initialData: [],
    staleTime: 30000,
  });

  // ── Watch for live events that match subscriptions ──────────────────────
  useEffect(() => {
    if (!user || subscriptions.length === 0) return;

    const liveEvents = events.filter(e => e.status === 'live');
    liveEvents.forEach(event => {
      if (notifiedRef.current.has(event.id)) return;

      const sportSub = subscriptions.find(s => s.type === 'sport' && s.value === event.sport);
      const matches = !!sportSub;

      if (matches) {
        notifiedRef.current.add(event.id);

        // In-app toast
        if (sportSub.in_app_alerts) {
          toast.success(`🔴 LIVE: ${event.title}`, {
            description: `${event.sport} · ${event.location}`,
            duration: 8000,
            action: { label: 'View', onClick: () => document.getElementById('events')?.scrollIntoView({ behavior: 'smooth' }) },
          });
        }

        // Browser notification
        if (sportSub?.browser_alerts && 'Notification' in window && Notification.permission === 'granted') {
          new Notification(`🔴 LIVE: ${event.title}`, {
            body: `${event.sport} at ${event.location} is now live!`,
            icon: '/favicon.ico',
          });
        }
      }
    });
  }, [events, subscriptions, user]);

  // ── CRUD ────────────────────────────────────────────────────────────────
  const addSub = useMutation({
    mutationFn: ({ type, value, label }) => {
      if (!user?.email) throw new Error('Not authenticated');
      return base44.entities.Subscription.create({
        user_email: user.email,
        type,
        value,
        label,
        browser_alerts: true,
        in_app_alerts: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions', user?.email] });
      toast.success('Subscribed!');
    },
  });

  const removeSub = useMutation({
    mutationFn: (id) => base44.entities.Subscription.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions', user?.email] });
      toast.success('Unsubscribed');
    },
  });

  const toggleAlert = useMutation({
    mutationFn: ({ id, field, value }) => base44.entities.Subscription.update(id, { [field]: value }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['subscriptions', user?.email] }),
  });

  const isSubscribed = (type, value) => subscriptions.some(s => s.type === type && s.value === value);
  const getSubscription = (type, value) => subscriptions.find(s => s.type === type && s.value === value);

  const requestBrowserPermission = async () => {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    const result = await Notification.requestPermission();
    return result === 'granted';
  };

  return {
    subscriptions,
    addSub,
    removeSub,
    toggleAlert,
    isSubscribed,
    getSubscription,
    requestBrowserPermission,
  };
}