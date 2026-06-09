/**
 * awardXPOnActivity
 * 
 * Entity automation handler — fires on create/update of key entities
 * and routes to awardXP with the appropriate XP amount.
 * 
 * Supported triggers (configured in automations):
 *   - Registration.create           → +50 XP
 *   - Registration.update (checkin) → +100 XP  (handled also by awardCheckinStreetCred)
 *   - EventVote / UserVote .create  → +10 XP
 *   - NFTOwnership.create           → +75 XP  (on-chain card purchase)
 *   - TokenOwnership.create         → +50 XP
 *   - UGCSubmission.update approved → +150 XP
 *   - MatchupVote.create            → +10 XP
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const RULES = {
  Registration: {
    create: { xp: 50,  reason: 'Registrazione evento' },
    checkin: { xp: 100, reason: 'Check-in live all\'evento' },
  },
  UserVote:    { create: { xp: 10,  reason: 'Voto su atleta/evento' } },
  MatchupVote: { create: { xp: 10,  reason: 'Voto sfida matchup' } },
  NFTOwnership:  { create: { xp: 75,  reason: 'Acquisto card atleta (on-chain)' } },
  TokenOwnership:{ create: { xp: 50,  reason: 'Acquisto token atleta' } },
  UGCSubmission: { approved: { xp: 150, reason: 'Contenuto UGC approvato dalla community' } },
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));

    const { event, data, old_data } = body;
    const entityName = event?.entity_name;
    const eventType  = event?.type; // 'create' | 'update'

    if (!entityName || !data) {
      return Response.json({ skipped: true, reason: 'missing entity or data' });
    }

    let userEmail = null;
    let xp = 0;
    let reason = '';

    // ── Registration ───────────────────────────────────────────────────────────
    if (entityName === 'Registration') {
      userEmail = data.email;

      if (eventType === 'create') {
        xp = RULES.Registration.create.xp;
        reason = RULES.Registration.create.reason;
      } else if (eventType === 'update' && data.checked_in === true && old_data?.checked_in !== true) {
        // Already handled by awardCheckinStreetCred; skip to avoid double-award
        return Response.json({ skipped: true, reason: 'checkin handled by dedicated function' });
      } else {
        return Response.json({ skipped: true, reason: 'registration update not relevant' });
      }
    }

    // ── Votes ──────────────────────────────────────────────────────────────────
    else if (entityName === 'UserVote' || entityName === 'MatchupVote') {
      if (eventType !== 'create') return Response.json({ skipped: true });
      userEmail = data.user_email || data.voter_email || data.created_by_id;
      xp = 10;
      reason = entityName === 'MatchupVote' ? 'Voto sfida matchup' : 'Voto su atleta/evento';
    }

    // ── NFT / Token ownership ──────────────────────────────────────────────────
    else if (entityName === 'NFTOwnership') {
      if (eventType !== 'create') return Response.json({ skipped: true });
      userEmail = data.buyer_email || data.created_by_id;
      xp = 75;
      reason = 'Acquisto card atleta (on-chain)';
    }
    else if (entityName === 'TokenOwnership') {
      if (eventType !== 'create') return Response.json({ skipped: true });
      userEmail = data.created_by_id;
      if (!userEmail) {
        // Try to resolve from User entity via created_by_id
        return Response.json({ skipped: true, reason: 'no email on TokenOwnership' });
      }
      xp = 50;
      reason = 'Acquisto token atleta';
    }

    // ── UGC approved ───────────────────────────────────────────────────────────
    else if (entityName === 'UGCSubmission') {
      if (eventType !== 'update') return Response.json({ skipped: true });
      if (data.approved !== true || old_data?.approved === true) {
        return Response.json({ skipped: true, reason: 'not a new approval' });
      }
      userEmail = data.creator_email;
      xp = 150;
      reason = 'Contenuto UGC approvato dalla community';
    }

    else {
      return Response.json({ skipped: true, reason: `entity ${entityName} not handled` });
    }

    if (!userEmail || xp === 0) {
      return Response.json({ skipped: true, reason: 'no user email or zero xp' });
    }

    // Call unified XP hub
    const result = await base44.asServiceRole.functions.invoke('awardXP', {
      user_email: userEmail,
      xp_amount: xp,
      reason,
    });

    return Response.json({ success: true, user_email: userEmail, xp_awarded: xp, reason, result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});