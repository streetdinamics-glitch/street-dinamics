import { useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export function useNotifications() {
  const unsubscribers = useRef([]);

  useEffect(() => {
    let user;

    const initialize = async () => {
      try {
        user = await base44.auth.me();
        if (!user) return;

        // Subscribe to event updates
        const unsubEvent = base44.entities.Event.subscribe((event) => {
          if (event.type === 'update' && event.data.status === 'live') {
            toast.success(`Event LIVE: ${event.data.title}`, {
              description: 'Click to view live stream',
              action: { label: 'View', onClick: () => window.location.hash = '#events' },
            });
          }
        });

        // Subscribe to milestone approvals
        const unsubMilestone = base44.entities.MilestonePaymentRequest?.subscribe?.((event) => {
          if (event.type === 'update' && event.data.status === 'approved') {
            if (event.data.athlete_email === user.email) {
              toast.success(`Milestone Approved: ${event.data.milestone_title}`, {
                description: `€${event.data.milestone_amount} ready for payout`,
              });
            }
          }
        });

        // Subscribe to voting campaign updates
        const unsubVote = base44.entities.EventVote?.subscribe?.((event) => {
          if (event.type === 'update' && event.data.status === 'closed') {
            toast.info(`Voting Closed: ${event.data.campaign_name}`, {
              description: 'Results are now available',
            });
          }
        });

        // Subscribe to sponsorship deal status changes
        const unsubDeal = base44.entities.SponsorshipDeal?.subscribe?.((event) => {
          if (event.type === 'update') {
            if (event.data.athlete_email === user.email && event.data.status === 'accepted') {
              toast.success(`Deal Accepted: ${event.data.campaign_title}`, {
                description: `Budget: €${event.data.budget}`,
              });
            }
          }
        });

        // Subscribe to fan rewards
        const unsubReward = base44.entities.FanReward?.subscribe?.((event) => {
          if (event.type === 'create' && event.data.fan_email === user.email) {
            toast.success(`Reward Unlocked: ${event.data.reward_name}`, {
              description: event.data.reward_description,
            });
          }
        });

        unsubscribers.current = [
          unsubEvent,
          unsubMilestone,
          unsubVote,
          unsubDeal,
          unsubReward,
        ].filter(Boolean);
      } catch (err) {
        console.error('Failed to initialize notifications:', err);
      }
    };

    initialize();

    return () => {
      unsubscribers.current.forEach(unsub => {
        try {
          unsub();
        } catch (err) {
          console.error('Error unsubscribing:', err);
        }
      });
    };
  }, []);
}