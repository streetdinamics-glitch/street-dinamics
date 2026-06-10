/**
 * updateFanStatus — ora delegato a StreetCred (sistema unificato).
 * Ricalcola il livello dell'utente in base ai punti accumulati.
 * Mantenuto per compatibilità con FanStatusManager e altre chiamate esistenti.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { userEmail } = await req.json();

    if (!userEmail) {
      return Response.json({ error: 'Missing userEmail' }, { status: 400 });
    }

    // Delega a syncStreetCred per il ricalcolo
    // Non passa action — syncStreetCred senza action ritorna semplicemente lo stato corrente
    // Usiamo awardXP con 0 punti per forzare il ricalcolo del livello
    const existing = await base44.asServiceRole.entities.StreetCred.filter({ user_email: userEmail });

    if (!existing[0]) {
      return Response.json({ error: 'StreetCred record not found for user' }, { status: 404 });
    }

    const record = existing[0];
    const points = record.total_points || 0;

    // Calcola livello corretto in base ai punti
    const LEVELS = [
      { level: 'sd_icon',       min: 15000, cashback: 0.05, multiplier: 2.0 },
      { level: 'street_legend', min: 5000,  cashback: 0.02, multiplier: 1.5 },
      { level: 'hype_beast',    min: 2000,  cashback: 0.015,multiplier: 1.25 },
      { level: 'follower',      min: 500,   cashback: 0.01, multiplier: 1.1 },
      { level: 'newcomer',      min: 0,     cashback: 0,    multiplier: 1.0 },
    ];
    const lvl = LEVELS.find(l => points >= l.min) || LEVELS[LEVELS.length - 1];

    const NEXT = { newcomer: 500, follower: 2000, hype_beast: 5000, street_legend: 15000 };
    const STARTS = { newcomer: 0, follower: 500, hype_beast: 2000, street_legend: 5000, sd_icon: 15000 };
    const nextMin = NEXT[lvl.level];
    const progress = nextMin
      ? Math.min(100, Math.round(((points - (STARTS[lvl.level] || 0)) / (nextMin - (STARTS[lvl.level] || 0))) * 100))
      : 100;

    await base44.asServiceRole.entities.StreetCred.update(record.id, {
      level: lvl.level,
      cashback_rate: lvl.cashback,
      current_multiplier: lvl.multiplier,
      next_level_progress: progress,
      early_access_enabled: ['street_legend', 'sd_icon', 'hype_beast'].includes(lvl.level),
    });

    return Response.json({
      success: true,
      user_email: userEmail,
      level: lvl.level,
      total_points: points,
      progress,
      cashback_rate: lvl.cashback,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});