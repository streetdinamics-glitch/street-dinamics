import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Points per action
const POINTS = {
  instagram: 100,
  tiktok: 100,
  youtube: 80,
  kick: 80,
  snapchat: 60,
  share_event: 50,
  referral: 200,
  attended_event: 150,
};

// Levels thresholds
const LEVELS = [
  { id: 'sd_icon',      min: 2000, perks: ['vip_backstage', 'free_merch', 'early_access', 'meet_athletes', 'exclusive_badge'] },
  { id: 'street_legend',min: 1000, perks: ['free_merch', 'early_access', 'meet_athletes'] },
  { id: 'hype_beast',   min: 500,  perks: ['early_access', 'free_drink'] },
  { id: 'follower',     min: 100,  perks: ['raffle_entry'] },
  { id: 'newcomer',     min: 0,    perks: [] },
];

function computeLevel(points) {
  for (const lvl of LEVELS) {
    if (points >= lvl.min) return lvl;
  }
  return LEVELS[LEVELS.length - 1];
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    // body.action: one of the action keys above
    // body.value: for share_event / referral actions, how many new ones to add
    const { action, value = 1 } = body;

    // Load or create StreetCred record
    const existing = await base44.entities.StreetCred.filter({ user_email: user.email });
    let record = existing[0];

    if (!record) {
      // Create fresh record
      const referral_code = user.email.split('@')[0].toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase();
      record = await base44.entities.StreetCred.create({
        user_email: user.email,
        user_name: user.full_name || user.email,
        total_points: 0,
        level: 'newcomer',
        actions: {},
        unlocked_perks: [],
        referral_code,
        last_synced_at: new Date().toISOString(),
      });
    }

    let actions = record.actions || {};
    let points = record.total_points || 0;
    let gained = 0;

    if (action && POINTS[action] !== undefined) {
      if (['instagram','tiktok','youtube','kick','snapchat'].includes(action)) {
        // One-time social follows
        if (!actions[action]) {
          actions[action] = true;
          gained += POINTS[action];
        }
      } else if (action === 'share_event') {
        const prev = actions.share_event || 0;
        const added = Math.max(0, value - prev);
        actions.share_event = value;
        gained += added * POINTS.share_event;
      } else if (action === 'referral') {
        const prev = actions.referrals || 0;
        const added = Math.max(0, value - prev);
        actions.referrals = value;
        gained += added * POINTS.referral;
      } else if (action === 'attended_event') {
        const prev = actions.attended_events || 0;
        const added = Math.max(0, value - prev);
        actions.attended_events = value;
        gained += added * POINTS.attended_event;
      }
    }

    points += gained;
    const levelData = computeLevel(points);

    const updated = await base44.entities.StreetCred.update(record.id, {
      total_points: points,
      level: levelData.id,
      actions,
      unlocked_perks: levelData.perks,
      last_synced_at: new Date().toISOString(),
    });

    return Response.json({ success: true, record: updated, gained, level: levelData });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});