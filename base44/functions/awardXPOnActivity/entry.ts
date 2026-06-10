/**
 * awardXPOnActivity
 *
 * Entity automation handler — ascolta gli eventi delle entità chiave
 * e li traduce in azioni Street Cred tramite syncStreetCred.
 *
 * Triggers:
 *   Registration.create           → event_registration (+50 SC)
 *   UserVote / MatchupVote.create  → vote_cast (+20 SC)
 *   NFTOwnership.create           → nft_purchase (+200 SC)
 *   TokenOwnership.create         → token_purchase (+150 SC)
 *   UGCSubmission.update approved → ugc_submission (+75 SC)
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { event, data, old_data } = body;
    const entityName = event?.entity_name;
    const eventType  = event?.type;

    if (!entityName || !data) {
      return Response.json({ skipped: true, reason: 'missing entity or data' });
    }

    let user_email = null;
    let action = null;

    // ── Registration ─────────────────────────────────────────────
    if (entityName === 'Registration') {
      if (eventType !== 'create') return Response.json({ skipped: true });
      user_email = data.email;
      action = 'event_registration';
    }

    // ── Votes ─────────────────────────────────────────────────────
    else if (entityName === 'UserVote' || entityName === 'MatchupVote') {
      if (eventType !== 'create') return Response.json({ skipped: true });
      user_email = data.user_email || data.voter_email;
      action = 'vote_cast';
    }

    // ── NFT Ownership ─────────────────────────────────────────────
    else if (entityName === 'NFTOwnership') {
      if (eventType !== 'create') return Response.json({ skipped: true });
      user_email = data.buyer_email;
      action = 'nft_purchase';
    }

    // ── Token Ownership ───────────────────────────────────────────
    else if (entityName === 'TokenOwnership') {
      if (eventType !== 'create') return Response.json({ skipped: true });
      user_email = data.user_email;
      if (!user_email) return Response.json({ skipped: true, reason: 'no email on TokenOwnership' });
      action = 'token_purchase';
    }

    // ── UGC approvato ─────────────────────────────────────────────
    else if (entityName === 'UGCSubmission') {
      if (eventType !== 'update') return Response.json({ skipped: true });
      if (data.approved !== true || old_data?.approved === true) {
        return Response.json({ skipped: true, reason: 'not a new approval' });
      }
      user_email = data.creator_email;
      action = 'ugc_submission';
    }

    else {
      return Response.json({ skipped: true, reason: `entity ${entityName} not handled` });
    }

    if (!user_email || !action) {
      return Response.json({ skipped: true, reason: 'no user email or action' });
    }

    // Chiama syncStreetCred come funzione master
    const result = await base44.asServiceRole.functions.invoke('syncStreetCred', {
      user_email,
      action,
      value: 1,
    });

    return Response.json({ success: true, user_email, action, result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});