/**
 * syncStreetCred — Master function per assegnare Street Cred.
 * Gestisce tutte le azioni ON e OFFLINE con i relativi pesi in punti.
 *
 * ─── AZIONI ONLINE ────────────────────────────────────────────
 *   follow_instagram      100 SC  (una tantum)
 *   follow_tiktok         100 SC  (una tantum)
 *   follow_youtube         80 SC  (una tantum)
 *   follow_kick            80 SC  (una tantum)
 *   follow_snapchat        60 SC  (una tantum)
 *   ugc_submission         75 SC  per contenuto approvato
 *   vote_cast              20 SC  per voto governance/atleta
 *   marketplace_trade     120 SC  per ogni trade completato
 *   token_purchase        150 SC  per acquisto token atleta
 *   nft_purchase          200 SC  per acquisto NFT
 *   referral              250 SC  per ogni amico invitato che si registra
 *   event_registration     50 SC  per iscrizione a evento
 *   prediction_bet         30 SC  per ogni scommessa piazzata
 *   daily_login            10 SC  per accesso giornaliero (max 1/giorno)
 *   streak_7days          100 SC  bonus streak 7 giorni consecutivi
 *   streak_30days         500 SC  bonus streak 30 giorni consecutivi
 *
 * ─── AZIONI OFFLINE ───────────────────────────────────────────
 *   event_checkin         150 SC  per check-in fisico in arena (QR scan)
 *   side_event_attended   100 SC  per workshop/sessione speciale
 *   merch_purchase        120 SC  per acquisto merchandise in loco
 *   autograph_session      80 SC  per partecipazione meet & greet
 *   volunteer              200 SC  per volontariato durante evento
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// ─── TABELLA PUNTI ────────────────────────────────────────────
const ONLINE_POINTS = {
  follow_instagram:   { points: 100, one_time: true,  label: 'Follow Instagram' },
  follow_tiktok:      { points: 100, one_time: true,  label: 'Follow TikTok' },
  follow_youtube:     { points: 80,  one_time: true,  label: 'Follow YouTube' },
  follow_kick:        { points: 80,  one_time: true,  label: 'Follow Kick' },
  follow_snapchat:    { points: 60,  one_time: true,  label: 'Follow Snapchat' },
  ugc_submission:     { points: 75,  one_time: false, label: 'Contenuto UGC approvato' },
  vote_cast:          { points: 20,  one_time: false, label: 'Voto governance/atleta' },
  marketplace_trade:  { points: 120, one_time: false, label: 'Trade marketplace' },
  token_purchase:     { points: 150, one_time: false, label: 'Acquisto token atleta' },
  nft_purchase:       { points: 200, one_time: false, label: 'Acquisto NFT' },
  referral:           { points: 250, one_time: false, label: 'Amico referral registrato' },
  event_registration: { points: 50,  one_time: false, label: 'Iscrizione evento' },
  prediction_bet:     { points: 30,  one_time: false, label: 'Scommessa piazzata' },
  daily_login:        { points: 10,  one_time: false, label: 'Accesso giornaliero' },
  streak_7days:       { points: 100, one_time: false, label: 'Streak 7 giorni' },
  streak_30days:      { points: 500, one_time: false, label: 'Streak 30 giorni' },
};

const OFFLINE_POINTS = {
  event_checkin:       { points: 150, one_time: false, label: 'Check-in in arena (QR)' },
  side_event_attended: { points: 100, one_time: false, label: 'Side event / workshop' },
  merch_purchase:      { points: 120, one_time: false, label: 'Merch acquistato in loco' },
  autograph_session:   { points: 80,  one_time: false, label: 'Meet & greet atleta' },
  volunteer:           { points: 200, one_time: false, label: 'Volontariato evento' },
};

function getLevel(points) {
  const LEVELS = [
    { level: 'sd_icon',       min: 15000, cashback: 0.05, multiplier: 2.0,  perks: ['backstage_access', 'cashback_5pct', '1of1_card', 'governance_voting', 'early_access', 'free_merch', 'vip_pass'] },
    { level: 'street_legend', min: 5000,  cashback: 0.02, multiplier: 1.5,  perks: ['vip_pass', 'cashback_2pct', 'early_access', 'free_merch'] },
    { level: 'hype_beast',    min: 2000,  cashback: 0.015,multiplier: 1.25, perks: ['early_access', 'cashback_1_5pct', 'free_drink'] },
    { level: 'follower',      min: 500,   cashback: 0.01, multiplier: 1.1,  perks: ['cashback_1pct', 'raffle_entry'] },
    { level: 'newcomer',      min: 0,     cashback: 0,    multiplier: 1.0,  perks: [] },
  ];
  for (const l of LEVELS) {
    if (points >= l.min) return l;
  }
  return LEVELS[LEVELS.length - 1];
}

function calcProgress(points, levelName) {
  const NEXT = { newcomer: 500, follower: 2000, hype_beast: 5000, street_legend: 15000 };
  const STARTS = { newcomer: 0, follower: 500, hype_beast: 2000, street_legend: 5000, sd_icon: 15000 };
  const next = NEXT[levelName];
  if (!next) return 100;
  const start = STARTS[levelName] || 0;
  return Math.min(100, Math.round(((points - start) / (next - start)) * 100));
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    // action: chiave dell'azione (es. "event_checkin", "referral")
    // scope: "online" | "offline" — se omesso viene rilevato automaticamente
    // value: quante volte (default 1, per azioni counter)
    // user_email: opzionale — se non presente usa l'utente corrente
    const { action, scope, value = 1 } = body;
    let { user_email } = body;

    if (!action) {
      return Response.json({
        error: 'action required',
        available_online: Object.keys(ONLINE_POINTS),
        available_offline: Object.keys(OFFLINE_POINTS),
      }, { status: 400 });
    }

    // Risolvi utente
    if (!user_email) {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
      user_email = user.email;
    }

    // Determina scope e configurazione azione
    let actionCfg = null;
    let resolvedScope = scope;
    if (ONLINE_POINTS[action]) {
      actionCfg = ONLINE_POINTS[action];
      resolvedScope = 'online';
    } else if (OFFLINE_POINTS[action]) {
      actionCfg = OFFLINE_POINTS[action];
      resolvedScope = 'offline';
    } else {
      return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }

    // Carica o crea record StreetCred
    const existing = await base44.asServiceRole.entities.StreetCred.filter({ user_email });
    let record = existing[0];

    if (!record) {
      const users = await base44.asServiceRole.entities.User.filter({ email: user_email });
      const userName = users[0]?.full_name || user_email;
      const referral_code = userName.slice(0, 4).toUpperCase().replace(/\s/g, '') + Math.random().toString(36).slice(2, 6).toUpperCase();
      record = await base44.asServiceRole.entities.StreetCred.create({
        user_email,
        user_name: userName,
        total_points: 0,
        level: 'newcomer',
        cashback_rate: 0,
        current_multiplier: 1.0,
        next_level_progress: 0,
        actions_online: {},
        actions_offline: {},
        unlocked_perks: [],
        level_history: [],
        referral_code,
        last_points_earned_at: new Date().toISOString(),
      });
    }

    const actionsKey = resolvedScope === 'online' ? 'actions_online' : 'actions_offline';
    const actions = record[actionsKey] || {};
    let gained = 0;

    if (actionCfg.one_time) {
      // Azione una-tantum: non ripetibile
      if (actions[action]) {
        return Response.json({ success: true, gained: 0, already_done: true, message: `${actionCfg.label} già completato` });
      }
      actions[action] = true;
      gained = actionCfg.points;
    } else {
      // Azione ripetibile: incrementa contatore
      const prev = actions[action] || 0;
      const newCount = prev + value;
      actions[action] = newCount;
      gained = actionCfg.points * value;
    }

    // Applica moltiplicatore
    const multiplier = record.current_multiplier || 1.0;
    const gainedWithMultiplier = Math.round(gained * multiplier);

    const currentPoints = record.total_points || 0;
    const newPoints = currentPoints + gainedWithMultiplier;
    const newLevelInfo = getLevel(newPoints);
    const oldLevel = record.level || 'newcomer';
    const levelChanged = oldLevel !== newLevelInfo.level;

    const levelHistory = record.level_history || [];
    if (levelChanged) {
      levelHistory.push({ from: oldLevel, to: newLevelInfo.level, at: new Date().toISOString(), trigger: action });
    }

    await base44.asServiceRole.entities.StreetCred.update(record.id, {
      total_points: newPoints,
      level: newLevelInfo.level,
      cashback_rate: newLevelInfo.cashback,
      current_multiplier: newLevelInfo.multiplier,
      unlocked_perks: newLevelInfo.perks,
      next_level_progress: calcProgress(newPoints, newLevelInfo.level),
      last_points_earned_at: new Date().toISOString(),
      [actionsKey]: actions,
      early_access_enabled: ['street_legend', 'sd_icon', 'hype_beast'].includes(newLevelInfo.level),
      ...(levelChanged ? { level_unlocked_at: new Date().toISOString(), level_history: levelHistory } : {}),
    });

    // Log
    await base44.asServiceRole.entities.TokenTransaction.create({
      user_email,
      transaction_type: 'earn',
      amount: gainedWithMultiplier,
      balance_after: newPoints,
      description: `[${resolvedScope.toUpperCase()}] ${actionCfg.label}${multiplier > 1 ? ` (x${multiplier} boost)` : ''}`,
      timestamp: new Date().toISOString(),
    });

    // Notifica SC guadagnati
    await base44.asServiceRole.entities.Notification.create({
      user_email,
      type: 'reward',
      title: `⚡ +${gainedWithMultiplier} Street Cred!`,
      message: `${actionCfg.label} — Totale: ${newPoints.toLocaleString()} SC`,
      action_url: '/dashboard-fan',
      created_at: new Date().toISOString(),
    });

    // Notifica level up
    if (levelChanged) {
      const LEVEL_PERKS_TEXT = {
        follower:      '1% cashback + Badge Follower + Accesso raffle',
        hype_beast:    '1.5% cashback + Early access eventi + Free drink in arena',
        street_legend: '2% cashback + VIP Pass annuale + Merch SD gratuito',
        sd_icon:       '5% cashback + Accesso backstage + Card 1-of-1 + Governance voting',
      };
      await base44.asServiceRole.entities.Notification.create({
        user_email,
        type: 'milestone',
        title: `🏆 LEVEL UP: ${newLevelInfo.level.replace(/_/g, ' ').toUpperCase()}!`,
        message: LEVEL_PERKS_TEXT[newLevelInfo.level] || 'Nuovo livello sbloccato!',
        action_url: '/dashboard-fan',
        created_at: new Date().toISOString(),
      });
    }

    return Response.json({
      success: true,
      action,
      scope: resolvedScope,
      label: actionCfg.label,
      gained: gainedWithMultiplier,
      multiplier,
      new_total: newPoints,
      level: newLevelInfo.level,
      level_changed: levelChanged,
      progress: calcProgress(newPoints, newLevelInfo.level),
      cashback_rate: newLevelInfo.cashback,
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});