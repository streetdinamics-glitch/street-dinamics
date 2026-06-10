/**
 * executeTournamentSnapshot
 * 
 * Run after a tournament completes.
 * Takes snapshot of who holds AthleteToken cards, then distributes NFT Clips.
 * 
 * Can be:
 * - Called directly with { tournament_id: "..." }
 * - Triggered by entity automation on Tournament when status → "completed"
 * - Run on schedule to process any pending completed tournaments
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const CLIP_RARITY_MAP = {
  rising_star:     'bronze',
  breakout_talent: 'silver',
  elite_performer: 'gold',
  living_legend:   'legendary',
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));

    // Support entity automation payload and direct call
    const singleId = body?.data?.id || body?.event?.entity_id || body?.tournament_id;

    let tournaments;
    if (singleId) {
      const t = await base44.asServiceRole.entities.Tournament.get(singleId);
      tournaments = t ? [t] : [];
    } else {
      // Scheduled mode: find all completed tournaments without snapshot
      tournaments = await base44.asServiceRole.entities.Tournament.filter({
        status: 'completed',
        snapshot_completed: false,
      });
    }

    if (tournaments.length === 0) {
      return Response.json({ success: true, message: 'No tournaments pending snapshot' });
    }

    const results = [];

    for (const tournament of tournaments) {
      if (tournament.snapshot_completed) continue;

      // Get all AthleteTokens for this tournament
      const tokens = await base44.asServiceRole.entities.AthleteToken.filter({
        tournament_id: tournament.id,
      });

      if (tokens.length === 0) {
        await base44.asServiceRole.entities.Tournament.update(tournament.id, {
          snapshot_completed: true,
          snapshot_executed_at: new Date().toISOString(),
        });
        results.push({ tournament_id: tournament.id, skipped: true, reason: 'no tokens found' });
        continue;
      }

      const clipsCreated = [];
      const processedPairs = new Set();
      let totalHolders = 0;

      for (const token of tokens) {
        // Get all ownership records for this token
        const owners = await base44.asServiceRole.entities.NFTOwnership.filter({
          nft_id: token.id,
        });

        totalHolders += owners.length;

        for (const owner of owners) {
          const pairKey = `${owner.buyer_email}:${token.athlete_email}`;
          if (processedPairs.has(pairKey)) continue;
          processedPairs.add(pairKey);

          const clipRarity = CLIP_RARITY_MAP[token.token_tier] || 'bronze';

          // Create NFT Clip record
          const clip = await base44.asServiceRole.entities.NFTClip.create({
            athlete_email: token.athlete_email,
            athlete_name: token.athlete_name,
            tournament_id: tournament.id,
            video_url: '',
            title: `${token.athlete_name} — ${token.event_moment || 'Tournament Moment'} [${clipRarity.toUpperCase()}]`,
            description: `NFT Clip esclusivo guadagnato tenendo la card di ${token.athlete_name} durante il torneo.`,
            rarity: clipRarity,
            recipient_email: owner.buyer_email,
            card_id_linked: token.id,
            moment_timestamp: new Date().toISOString(),
            created_at: new Date().toISOString(),
          });

          clipsCreated.push(clip.id);

          // Award Street Cred for holding card through tournament
          try {
            await base44.asServiceRole.functions.invoke('syncStreetCred', {
              user_email: owner.buyer_email,
              action: 'nft_purchase',
              value: 1,
            });
          } catch (_) {}

          // Notify recipient
          try {
            await base44.asServiceRole.entities.Notification.create({
              user_email: owner.buyer_email,
              type: 'reward',
              title: `🎬 NFT Clip ricevuto!`,
              message: `Hai ricevuto un ${clipRarity} NFT Clip di ${token.athlete_name} per aver tenuto la sua card durante il torneo!`,
              action_url: '/NFTDashboard',
              created_at: new Date().toISOString(),
            });
          } catch (_) {}
        }

        // Update token with snapshot info
        await base44.asServiceRole.entities.AthleteToken.update(token.id, {
          snapshot_included: true,
          holders_at_snapshot: owners.length,
        });
      }

      // Create snapshot record
      await base44.asServiceRole.entities.TournamentSnapshot.create({
        tournament_id: tournament.id,
        snapshot_date: new Date().toISOString(),
        total_cardholders: totalHolders,
        nft_clips_minted: clipsCreated.length,
        distribution_completed: true,
        athletes_processed: tokens.length,
      });

      // Mark tournament as done
      await base44.asServiceRole.entities.Tournament.update(tournament.id, {
        snapshot_completed: true,
        snapshot_executed_at: new Date().toISOString(),
      });

      results.push({
        tournament_id: tournament.id,
        athletes: tokens.length,
        cardholders: totalHolders,
        clips_created: clipsCreated.length,
      });
    }

    return Response.json({ success: true, processed: results.length, results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});