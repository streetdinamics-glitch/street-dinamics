/**
 * useXPNotifications
 * Subscribes to Notification entity in real-time and shows toast popups
 * whenever a new XP reward or tier-up notification arrives for the current user.
 */
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';

export function useXPNotifications(userEmail) {
  const seenIds = useRef(new Set());

  useEffect(() => {
    if (!userEmail) return;

    const unsubscribe = base44.entities.Notification.subscribe((event) => {
      if (event.type !== 'create') return;
      const n = event.data;
      if (!n) return;
      if (n.user_email !== userEmail) return;
      if (seenIds.current.has(event.id)) return;
      seenIds.current.add(event.id);

      // Solo tipi relevanti all'XP
      if (n.type === 'reward') {
        toast(n.title, {
          description: n.message,
          duration: 5000,
          style: {
            background: 'rgba(4,2,10,0.97)',
            border: '1px solid rgba(255,150,0,0.35)',
            color: '#ffcc00',
            fontFamily: 'var(--font-rajdhani)',
          },
          icon: '⚡',
        });
      } else if (n.type === 'milestone') {
        toast(n.title, {
          description: n.message,
          duration: 8000,
          style: {
            background: 'rgba(4,2,10,0.97)',
            border: '1px solid rgba(255,80,0,0.6)',
            color: '#ff9900',
            fontFamily: 'var(--font-rajdhani)',
            boxShadow: '0 0 20px rgba(255,100,0,0.3)',
          },
          icon: '🏆',
        });
      }
    });

    return unsubscribe;
  }, [userEmail]);
}