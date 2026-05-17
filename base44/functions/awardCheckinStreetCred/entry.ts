/**
 * Automation trigger: fires when a Registration is updated with checked_in = true
 * Awards +150 Street Cred points to the fan automatically.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));

    const { data, old_data, event } = body;

    // Only act when checked_in transitions from false/null to true
    if (!data?.checked_in || old_data?.checked_in === true) {
      return Response.json({ skipped: true });
    }

    const userEmail = data.email;
    if (!userEmail) return Response.json({ skipped: true, reason: 'no email' });

    // Load or create StreetCred for the user
    const existing = await base44.asServiceRole.entities.StreetCred.filter({ user_email: userEmail });
    
    const LEVELS = [
      { id: 'sd_icon',       min: 2000, perks: ['vip_backstage','free_merch','early_access','meet_athletes','exclusive_badge'] },
      { id: 'street_legend', min: 1000, perks: ['free_merch','early_access','meet_athletes'] },
      { id: 'hype_beast',    min: 500,  perks: ['early_access','free_drink'] },
      { id: 'follower',      min: 100,  perks: ['raffle_entry'] },
      { id: 'newcomer',      min: 0,    perks: [] },
    ];

    const computeLevel = (pts) => {
      for (const lvl of LEVELS) if (pts >= lvl.min) return lvl;
      return LEVELS[LEVELS.length - 1];
    };

    let record = existing[0];
    const attendedEvents = ((record?.actions?.attended_events) || 0) + 1;
    const newPoints = (record?.total_points || 0) + 150;
    const lvl = computeLevel(newPoints);

    if (record) {
      await base44.asServiceRole.entities.StreetCred.update(record.id, {
        total_points: newPoints,
        level: lvl.id,
        unlocked_perks: lvl.perks,
        actions: { ...(record.actions || {}), attended_events: attendedEvents },
        last_synced_at: new Date().toISOString(),
      });
    } else {
      const referral_code = userEmail.split('@')[0].toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase();
      await base44.asServiceRole.entities.StreetCred.create({
        user_email: userEmail,
        user_name: `${data.first_name || ''} ${data.last_name || ''}`.trim() || userEmail,
        total_points: 150,
        level: computeLevel(150).id,
        actions: { attended_events: 1 },
        unlocked_perks: computeLevel(150).perks,
        referral_code,
        last_synced_at: new Date().toISOString(),
      });
    }

    return Response.json({ success: true, user: userEmail, points_awarded: 150 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});