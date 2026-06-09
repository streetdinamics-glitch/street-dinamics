/**
 * awardXP
 * 
 * Central function to award XP to a user and manage tier progression.
 * XP is the single currency of the SD platform.
 * 
 * Tier thresholds:
 *   rookie       0 XP    - No cashback
 *   enthusiast   500 XP  - 1% cashback, redeem XP → EUR
 *   superfan     2000 XP - 1.5% cashback, free merch
 *   legend       5000 XP - 2% cashback, VIP Pass
 *   hall_of_fame 10000 XP - 3% cashback, early access + backstage
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const TIER_THRESHOLDS = [
  { tier: 'hall_of_fame', xp: 10000, cashback: 0.03 },
  { tier: 'legend',       xp: 5000,  cashback: 0.02 },
  { tier: 'superfan',     xp: 2000,  cashback: 0.015 },
  { tier: 'enthusiast',   xp: 500,   cashback: 0.01 },
  { tier: 'rookie',       xp: 0,     cashback: 0 },
];

const TIER_NEXT = {
  rookie:       { next: 'enthusiast',   nextXp: 500   },
  enthusiast:   { next: 'superfan',     nextXp: 2000  },
  superfan:     { next: 'legend',       nextXp: 5000  },
  legend:       { next: 'hall_of_fame', nextXp: 10000 },
  hall_of_fame: { next: null,           nextXp: null  },
};

function getTier(xp) {
  for (const t of TIER_THRESHOLDS) {
    if (xp >= t.xp) return t;
  }
  return TIER_THRESHOLDS[TIER_THRESHOLDS.length - 1];
}

function calcProgress(xp, tierName) {
  const info = TIER_NEXT[tierName];
  if (!info.next) return 100;
  const current = TIER_THRESHOLDS.find(t => t.tier === tierName);
  const start = current?.xp || 0;
  const end = info.nextXp;
  return Math.min(100, Math.round(((xp - start) / (end - start)) * 100));
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { user_email, xp_amount, reason } = await req.json();

    if (!user_email || xp_amount == null) {
      return Response.json({ error: 'user_email and xp_amount required' }, { status: 400 });
    }

    // Find existing FanStatus
    const statuses = await base44.asServiceRole.entities.FanStatus.filter({ user_email });
    let status = statuses[0];

    const currentXP = status?.total_xp || 0;
    const newXP = Math.max(0, currentXP + xp_amount);
    const newTierInfo = getTier(newXP);
    const oldTier = status?.current_tier || 'rookie';
    const tierChanged = oldTier !== newTierInfo.tier;

    const updateData = {
      total_xp: newXP,
      current_tier: newTierInfo.tier,
      cashback_rate: newTierInfo.cashback,
      next_tier_progress: calcProgress(newXP, newTierInfo.tier),
      last_xp_earned_at: new Date().toISOString(),
      ...(tierChanged ? { tier_unlocked_at: new Date().toISOString() } : {}),
    };

    if (status) {
      await base44.asServiceRole.entities.FanStatus.update(status.id, updateData);
    } else {
      // Create new FanStatus
      const users = await base44.asServiceRole.entities.User.filter({ email: user_email });
      await base44.asServiceRole.entities.FanStatus.create({
        user_email,
        user_name: users[0]?.full_name || user_email,
        ...updateData,
      });
    }

    // Log XP transaction
    await base44.asServiceRole.entities.TokenTransaction.create({
      user_email,
      transaction_type: xp_amount >= 0 ? 'earn' : 'spend',
      amount: xp_amount,
      balance_after: newXP,
      description: reason || 'XP aggiornato',
      timestamp: new Date().toISOString(),
    });

    // Notify tier upgrade
    if (tierChanged) {
      const tierLabel = newTierInfo.tier.replace(/_/g, ' ').toUpperCase();
      await base44.asServiceRole.entities.Notification.create({
        user_email,
        type: 'milestone',
        title: `🏆 Tier Up: ${tierLabel}!`,
        message: `Hai raggiunto il livello ${tierLabel} con ${newXP.toLocaleString()} XP! Nuovi premi sbloccati.`,
        action_url: '/dashboard-fan',
        created_at: new Date().toISOString(),
      });
    }

    return Response.json({
      success: true,
      xp_awarded: xp_amount,
      new_total_xp: newXP,
      tier: newTierInfo.tier,
      cashback_rate: newTierInfo.cashback,
      tier_changed: tierChanged,
      progress: calcProgress(newXP, newTierInfo.tier),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});