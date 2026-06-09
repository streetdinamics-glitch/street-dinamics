/**
 * mintAthleteTokensAtTournamentStart
 * 
 * Triggered when a Tournament becomes "in_progress".
 * Mints AthleteToken cards for every registered athlete in the tournament's event.
 * Rarity is determined by athlete stats.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const RARITY_CONFIG = {
  rising_star:     { supply: 500, price: 2 },
  breakout_talent: { supply: 200, price: 5 },
  elite_performer: { supply: 50,  price: 15 },
  living_legend:   { supply: 10,  price: 50 },
};

function determineRarity(athleteStat) {
  if (!athleteStat) return 'rising_star';
  if (athleteStat.wins >= 10 || athleteStat.performance_rating >= 80) return 'living_legend';
  if (athleteStat.wins >= 5  || athleteStat.performance_rating >= 60) return 'elite_performer';
  if (athleteStat.wins >= 2  || athleteStat.performance_rating >= 40) return 'breakout_talent';
  return 'rising_star';
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));

    // Support both entity automation payload and direct call
    const tournamentId = body?.data?.id || body?.event?.entity_id || body?.tournament_id;
    if (!tournamentId) {
      return Response.json({ error: 'tournament_id required' }, { status: 400 });
    }

    const tournament = await base44.asServiceRole.entities.Tournament.get(tournamentId);
    if (!tournament) {
      return Response.json({ error: 'Tournament not found' }, { status: 404 });
    }

    // Avoid double-minting
    if (tournament.tokens_minted) {
      return Response.json({ skipped: true, reason: 'tokens already minted for this tournament' });
    }

    const event = await base44.asServiceRole.entities.Event.get(tournament.event_id);
    if (!event) {
      return Response.json({ error: 'Event not found' }, { status: 404 });
    }

    // Fetch all athlete registrations for this event
    const registrations = await base44.asServiceRole.entities.Registration.filter({
      event_id: tournament.event_id,
      type: 'athlete',
    });

    const mintedTokens = [];

    for (const reg of registrations) {
      // Check for existing token for this tournament
      const existing = await base44.asServiceRole.entities.AthleteToken.filter({
        athlete_email: reg.email,
        tournament_id: tournamentId,
      });
      if (existing.length > 0) continue;

      // Get athlete stats for rarity determination
      const stats = await base44.asServiceRole.entities.AthleteStats.filter({
        athlete_email: reg.email,
      });
      const rarity = determineRarity(stats[0]);
      const config = RARITY_CONFIG[rarity];
      const athleteName = `${reg.first_name} ${reg.last_name}`;

      const token = await base44.asServiceRole.entities.AthleteToken.create({
        athlete_email: reg.email,
        athlete_name: athleteName,
        sport: reg.sport || event.sport,
        token_tier: rarity,
        card_number: Math.floor(Math.random() * 99000) + 1000,
        event_moment: `${event.title} — ${new Date().getFullYear()} Tournament`,
        total_supply: config.supply,
        available_supply: config.supply,
        base_price: config.price,
        current_price: config.price,
        mint_price: config.price,
        status: 'active',
        tournament_id: tournamentId,
        snapshot_included: false,
        holders_at_snapshot: 0,
        token_benefits: [
          'Snapshot NFT Clip al termine del torneo',
          'Royalty su sponsor dell\'atleta',
          'Diritto di voto',
        ],
      });

      mintedTokens.push({ id: token.id, athlete: athleteName, rarity });

      // Notify all platform users about new card availability
      try {
        await base44.asServiceRole.entities.Notification.create({
          user_email: reg.email,
          type: 'milestone',
          title: `🃏 La tua Card è stata mintata!`,
          message: `La tua card ${rarity.replace('_', ' ')} per ${event.title} è ora disponibile nel marketplace.`,
          action_url: '/marketplace',
          created_at: new Date().toISOString(),
        });
      } catch (_) {}
    }

    // Mark tournament as tokens minted
    await base44.asServiceRole.entities.Tournament.update(tournamentId, {
      tokens_minted: true,
    });

    return Response.json({
      success: true,
      tournament_id: tournamentId,
      event: event.title,
      minted: mintedTokens.length,
      tokens: mintedTokens,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});