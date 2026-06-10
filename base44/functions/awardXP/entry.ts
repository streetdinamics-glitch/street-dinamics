/**
 * awardXP — ora punta a StreetCred (sistema unificato).
 * XP e Street Cred sono la stessa valuta.
 *
 * Livelli & soglie:
 *   newcomer       0 SC   - Base
 *   follower       500 SC - Cashback 1%, Badge
 *   hype_beast     2.000  - Cashback 1.5%, Early access
 *   street_legend  5.000  - Cashback 2%, VIP Pass, Merch
 *   sd_icon        10.000 - Cashback 3%, Backstage, 1-of-1 card
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const LEVEL_THRESHOLDS = [
  { level: 'sd_icon',       min: 10000, cashback: 0.03, multiplier: 2.0, perks: ['backstage_access', 'cashback_3pct', '1of1_card', 'governance_voting', 'early_access', 'free_merch', 'vip_pass', 'badge_sd_icon'] },
  { level: 'street_legend', min: 5000,  cashback: 0.02, multiplier: 1.5, perks: ['vip_pass', 'cashback_2pct', 'early_access', 'free_merch', 'badge_street_legend'] },
  { level: 'hype_beast',    min: 2000,  cashback: 0.015,multiplier: 1.25,perks: ['early_access', 'cashback_1_5pct', 'free_drink', 'badge_hype_beast'] },
  { level: 'follower',      min: 500,   cashback: 0.01, multiplier: 1.1, perks: ['cashback_1pct', 'raffle_entry', 'badge_follower'] },
  { level: 'newcomer',      min: 0,     cashback: 0,    multiplier: 1.0, perks: [] },
];

const LEVEL_NEXT = {
  newcomer:      { next: 'follower',       nextMin: 500   },
  follower:      { next: 'hype_beast',     nextMin: 2000  },
  hype_beast:    { next: 'street_legend',  nextMin: 5000  },
  street_legend: { next: 'sd_icon',        nextMin: 10000 },
  sd_icon:       { next: null,             nextMin: null  },
};

function getLevel(points) {
  for (const l of LEVEL_THRESHOLDS) {
    if (points >= l.min) return l;
  }
  return LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
}

function calcProgress(points, levelName) {
  const info = LEVEL_NEXT[levelName];
  if (!info?.next) return 100;
  const current = LEVEL_THRESHOLDS.find(l => l.level === levelName);
  const start = current?.min || 0;
  return Math.min(100, Math.round(((points - start) / (info.nextMin - start)) * 100));
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { user_email, xp_amount, reason, action } = await req.json();

    if (!user_email || xp_amount == null) {
      return Response.json({ error: 'user_email and xp_amount required' }, { status: 400 });
    }

    // Trova o crea record StreetCred
    const existing = await base44.asServiceRole.entities.StreetCred.filter({ user_email });
    let record = existing[0];

    const currentPoints = record?.total_points || 0;
    const appliedMultiplier = record?.current_multiplier || 1.0;
    const rawAmount = xp_amount > 0 ? Math.round(xp_amount * appliedMultiplier) : xp_amount;
    const newPoints = Math.max(0, currentPoints + rawAmount);
    const newLevelInfo = getLevel(newPoints);
    const oldLevel = record?.level || 'newcomer';
    const levelChanged = oldLevel !== newLevelInfo.level;

    const updateData = {
      total_points: newPoints,
      level: newLevelInfo.level,
      cashback_rate: newLevelInfo.cashback,
      current_multiplier: newLevelInfo.multiplier,
      unlocked_perks: newLevelInfo.perks,
      next_level_progress: calcProgress(newPoints, newLevelInfo.level),
      last_points_earned_at: new Date().toISOString(),
      ...(levelChanged ? {
        level_unlocked_at: new Date().toISOString(),
        early_access_enabled: ['street_legend', 'sd_icon', 'hype_beast'].includes(newLevelInfo.level),
      } : {}),
    };

    if (record) {
      await base44.asServiceRole.entities.StreetCred.update(record.id, updateData);
    } else {
      const users = await base44.asServiceRole.entities.User.filter({ email: user_email });
      const referral_code = (users[0]?.full_name || user_email).slice(0, 4).toUpperCase().replace(/\s/g, '') + Math.random().toString(36).slice(2, 6).toUpperCase();
      await base44.asServiceRole.entities.StreetCred.create({
        user_email,
        user_name: users[0]?.full_name || user_email,
        referral_code,
        actions_online: {},
        actions_offline: {},
        level_history: [],
        ...updateData,
      });
    }

    // Log transazione
    await base44.asServiceRole.entities.TokenTransaction.create({
      user_email,
      transaction_type: rawAmount >= 0 ? 'earn' : 'spend',
      amount: rawAmount,
      balance_after: newPoints,
      description: reason || action || 'Street Cred aggiornato',
      timestamp: new Date().toISOString(),
    });

    // Notifica punti
    if (rawAmount > 0) {
      await base44.asServiceRole.entities.Notification.create({
        user_email,
        type: 'reward',
        title: `⚡ +${rawAmount} Street Cred!`,
        message: `${reason || 'Attività completata'} — Totale: ${newPoints.toLocaleString()} SC`,
        action_url: '/dashboard-fan',
        created_at: new Date().toISOString(),
      });
    }

    // Notifica level up
    if (levelChanged) {
      const LEVEL_LABELS = {
        follower:      'FOLLOWER',
        hype_beast:    'HYPE BEAST',
        street_legend: 'STREET LEGEND',
        sd_icon:       'SD ICON',
      };
      const LEVEL_PERKS_TEXT = {
        follower:      '1% cashback sbloccato + Badge Follower + Accesso raffle',
        hype_beast:    '1.5% cashback + Early access eventi + Free drink in arena',
        street_legend: '2% cashback + VIP Pass annuale + Merch SD gratuito',
        sd_icon:       '3% cashback + Accesso backstage + Card 1-of-1 + Governance voting',
      };
      await base44.asServiceRole.entities.Notification.create({
        user_email,
        type: 'milestone',
        title: `🏆 LEVEL UP: ${LEVEL_LABELS[newLevelInfo.level] || newLevelInfo.level}!`,
        message: LEVEL_PERKS_TEXT[newLevelInfo.level] || 'Nuovo livello sbloccato!',
        action_url: '/dashboard-fan',
        created_at: new Date().toISOString(),
      });
    }

    return Response.json({
      success: true,
      points_awarded: rawAmount,
      new_total: newPoints,
      level: newLevelInfo.level,
      cashback_rate: newLevelInfo.cashback,
      multiplier: newLevelInfo.multiplier,
      level_changed: levelChanged,
      progress: calcProgress(newPoints, newLevelInfo.level),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});