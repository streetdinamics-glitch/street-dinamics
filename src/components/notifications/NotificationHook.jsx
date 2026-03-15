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

        // Subscribe to bet settlements
        const unsubBet = base44.entities.Bet?.subscribe?.((event) => {
          if (event.type === 'update' && event.data.created_by === user.email && event.data.status === 'settled') {
            const isWon = event.data.result === 'won';
            toast[isWon ? 'success' : 'error'](
              isWon ? '🎉 Bet Won!' : '❌ Bet Lost',
              {
                description: isWon 
                  ? `You won ${event.data.potential_winnings} tokens!`
                  : `Better luck next time`,
              }
            );
          }
        });

        // Subscribe to UGC engagement updates
        const unsubUGC = base44.entities.UGCSubmission?.subscribe?.((event) => {
          if (event.type === 'update' && event.data.creator_email === user.email) {
            const engagement = event.data.engagement_count || 0;
            const milestones = [10, 50, 100, 500, 1000];
            const reachedMilestone = milestones.find(m => engagement >= m && (event.old_data?.engagement_count || 0) < m);
            
            if (reachedMilestone) {
              toast.success(`🔥 ${reachedMilestone} Engagement!`, {
                description: `Your "${event.data.title}" is trending!`,
              });
            }
          }
        });

        // Subscribe to achievement claim updates
        const unsubClaim = base44.entities.AchievementClaim?.subscribe?.((event) => {
          if (event.type === 'update' && event.data.user_email === user.email) {
            if (event.data.status === 'approved') {
              toast.success('🏆 Achievement Unlocked!', {
                description: `${event.data.achievement_name} badge awarded`,
              });
            } else if (event.data.status === 'rejected') {
              toast.error('Claim Rejected', {
                description: `${event.data.achievement_name} - ${event.data.rejection_reason || 'Try again with better proof'}`,
              });
            }
          }
        });

        unsubscribers.current = [
          unsubEvent,
          unsubMilestone,
          unsubVote,
          unsubDeal,
          unsubReward,
          unsubBet,
          unsubUGC,
          unsubClaim,
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