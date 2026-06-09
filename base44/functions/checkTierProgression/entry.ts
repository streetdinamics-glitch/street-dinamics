/**
 * checkTierProgression
 * Scheduled daily: checks all FanStatus records and promotes users to the correct tier.
 * Admin-only function.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const TIER_THRESHOLDS = [
  { tier: 'hall_of_fame', xp: 10000, cashback: 0.03 },
  { tier: 'legend',       xp: 5000,  cashback: 0.02 },
  { tier: 'superfan',     xp: 2000,  cashback: 0.015 },
  { tier: 'enthusiast',   xp: 500,   cashback: 0.01 },
  { tier: 'rookie',       xp: 0,     cashback: 0 },
];

function getTier(xp) {
  for (const t of TIER_THRESHOLDS) {
    if (xp >= t.xp) return t;
  }
  return TIER_THRESHOLDS[TIER_THRESHOLDS.length - 1];
}

const TIER_NEXT = {
  rookie:       500,
  enthusiast:   2000,
  superfan:     5000,
  legend:       10000,
  hall_of_fame: null,
};

function calcProgress(xp, tierName) {
  const next = TIER_NEXT[tierName];
  if (!next) return 100;
  const current = TIER_THRESHOLDS.find(t => t.tier === tierName);
  const start = current?.xp || 0;
  return Math.min(100, Math.round(((xp - start) / (next - start)) * 100));
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const allStatuses = await base44.asServiceRole.entities.FanStatus.list();
    let promoted = 0;

    for (const status of allStatuses) {
      const xp = status.total_xp || 0;
      const correctTier = getTier(xp);
      const progress = calcProgress(xp, correctTier.tier);

      if (status.current_tier !== correctTier.tier || status.next_tier_progress !== progress) {
        await base44.asServiceRole.entities.FanStatus.update(status.id, {
          current_tier: correctTier.tier,
          cashback_rate: correctTier.cashback,
          next_tier_progress: progress,
          ...(status.current_tier !== correctTier.tier ? { tier_unlocked_at: new Date().toISOString() } : {}),
        });

        if (status.current_tier !== correctTier.tier) {
          promoted++;
          await base44.asServiceRole.entities.Notification.create({
            user_email: status.user_email,
            type: 'milestone',
            title: `🏆 Tier Up: ${correctTier.tier.replace(/_/g, ' ').toUpperCase()}!`,
            message: `Hai raggiunto il livello ${correctTier.tier.replace(/_/g, ' ')} con ${xp.toLocaleString()} XP! Scopri i tuoi nuovi premi.`,
            action_url: '/dashboard-fan',
            created_at: new Date().toISOString(),
          });
        }
      }
    }

    return Response.json({ success: true, checked: allStatuses.length, promoted });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});