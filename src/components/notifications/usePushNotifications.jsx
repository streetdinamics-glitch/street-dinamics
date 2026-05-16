import { useEffect, useRef, useCallback } from 'react';
import { base44 } from '@/api/base44Client';

const PUSH_PERM_KEY = 'sd_push_enabled';

/**
 * Hook to manage browser push notifications.
 * - Requests permission on demand
 * - Fires browser notifications for key athlete events
 * - Subscribes to Registration status changes + new Events
 */
export function usePushNotifications(user) {
  const unsubscribers = useRef([]);
  const permissionGranted = useRef(false);

  const sendPush = useCallback((title, body, options = {}) => {
    if (!permissionGranted.current) return;
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;

    try {
      const notif = new Notification(title, {
        body,
        icon: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69b2e24ee21bc949528cccdd/5d1be983b_photo_2026-03-11_15-56-46.jpg',
        badge: '/favicon.ico',
        tag: options.tag || 'sd-notification',
        renotify: options.renotify || false,
        ...options,
      });

      if (options.url) {
        notif.onclick = () => {
          window.focus();
          window.location.href = options.url;
          notif.close();
        };
      }
    } catch (err) {
      console.warn('[PushNotif] Failed to show notification:', err.message);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    if (typeof window === 'undefined' || !('Notification' in window)) return;

    // Restore permission state
    permissionGranted.current = Notification.permission === 'granted';

    const setupSubscriptions = () => {
      // 1. Registration status changes (athlete verification approved/rejected)
      const unsubReg = base44.entities.Registration.subscribe((event) => {
        if (event.type !== 'update') return;
        const data = event.data;
        if (data?.email !== user.email) return;

        if (data.status === 'confirmed' && event.old_data?.status !== 'confirmed') {
          sendPush(
            '✅ Verifica Atleta Approvata!',
            'La tua richiesta di verifica è stata approvata. Sei ufficialmente un atleta Street Dinamics!',
            { tag: 'registration-confirmed', url: '/dashboard-atleta' }
          );
        } else if (data.status === 'rejected' && event.old_data?.status !== 'rejected') {
          sendPush(
            '❌ Verifica Non Approvata',
            'La tua richiesta non è stata approvata. Controlla i requisiti e riapplica.',
            { tag: 'registration-rejected', url: '/dashboard-atleta' }
          );
        }
      });

      // 2. New Event published — notify if user's sport matches
      const unsubEvent = base44.entities.Event.subscribe(async (event) => {
        if (event.type !== 'create') return;
        const newEvent = event.data;
        if (!newEvent?.sport || !newEvent?.title) return;

        // Check user's registered sport from their registrations
        try {
          const regs = await base44.entities.Registration.filter({ email: user.email, type: 'athlete' });
          const userSports = [...new Set(regs.map(r => r.sport?.toLowerCase()).filter(Boolean))];
          const eventSport = newEvent.sport.toLowerCase();

          const isCompatible = userSports.length === 0 || userSports.some(s =>
            s.includes(eventSport) || eventSport.includes(s)
          );

          if (isCompatible) {
            sendPush(
              `🏆 Nuovo Evento: ${newEvent.sport}`,
              `"${newEvent.title}" — ${newEvent.location || ''}${newEvent.date ? ` · ${newEvent.date}` : ''}`,
              { tag: `new-event-${newEvent.id}`, url: '/Home' }
            );
          }
        } catch {}
      });

      // 3. Event goes LIVE
      const unsubLive = base44.entities.Event.subscribe((event) => {
        if (event.type !== 'update') return;
        if (event.data?.status === 'live' && event.old_data?.status !== 'live') {
          sendPush(
            `🔴 LIVE ORA: ${event.data.title}`,
            'Un evento è iniziato! Guarda la diretta adesso.',
            { tag: `event-live-${event.data.id}`, url: '/Home', renotify: true }
          );
        }
      });

      unsubscribers.current = [unsubReg, unsubEvent, unsubLive].filter(Boolean);
    };

    setupSubscriptions();

    return () => {
      unsubscribers.current.forEach(unsub => { try { unsub(); } catch {} });
      unsubscribers.current = [];
    };
  }, [user, sendPush]);

  const requestPermission = useCallback(async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return false;
    if (Notification.permission === 'granted') {
      permissionGranted.current = true;
      localStorage.setItem(PUSH_PERM_KEY, '1');
      return true;
    }
    if (Notification.permission === 'denied') return false;

    const result = await Notification.requestPermission();
    permissionGranted.current = result === 'granted';
    if (permissionGranted.current) {
      localStorage.setItem(PUSH_PERM_KEY, '1');
    }
    return permissionGranted.current;
  }, []);

  const isSupported = typeof window !== 'undefined' && 'Notification' in window;
  const currentPermission = isSupported ? Notification.permission : 'denied';

  return { requestPermission, isSupported, permission: currentPermission };
}