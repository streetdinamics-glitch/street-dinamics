import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { athlete_email } = await req.json();

    if (!athlete_email) {
      return Response.json({ error: 'athlete_email required' }, { status: 400 });
    }

    // Fetch athlete's event history
    const registrations = await base44.entities.Registration.filter({
      email: athlete_email,
      type: 'athlete',
      status: 'confirmed'
    });

    const stats = await base44.entities.AthleteStats.filter({
      athlete_email: athlete_email
    });

    const athleteStats = stats[0] || { events_participated: 0, wins: 0, podium_finishes: 0 };

    // Fetch existing badges
    const existingBadges = await base44.entities.AthleteBadge.filter({
      athlete_email: athlete_email
    });

    const existingBadgeTypes = new Set(existingBadges.map(b => b.badge_type));
    const newBadges = [];

    // Award badges based on criteria
    const eventCount = registrations.length;

    // First event badge
    if (eventCount >= 1 && !existingBadgeTypes.has('first_event')) {
      newBadges.push({
        athlete_email,
        badge_type: 'first_event',
        badge_name: 'First Step',
        badge_description: 'Completed your first event',
        badge_icon: '⭐',
        rarity: 'common',
        earned_date: new Date().toISOString().split('T')[0]
      });
    }

    // Five events badge
    if (eventCount >= 5 && !existingBadgeTypes.has('five_events')) {
      newBadges.push({
        athlete_email,
        badge_type: 'five_events',
        badge_name: 'Regular',
        badge_description: '5 events completed',
        badge_icon: '🎯',
        rarity: 'rare',
        earned_date: new Date().toISOString().split('T')[0]
      });
    }

    // Ten events badge
    if (eventCount >= 10 && !existingBadgeTypes.has('ten_events')) {
      newBadges.push({
        athlete_email,
        badge_type: 'ten_events',
        badge_name: 'Dedicated',
        badge_description: '10 events milestone reached',
        badge_icon: '⚡',
        rarity: 'epic',
        earned_date: new Date().toISOString().split('T')[0]
      });
    }

    // Veteran badge (10+ events)
    if (eventCount >= 10 && !existingBadgeTypes.has('veteran')) {
      newBadges.push({
        athlete_email,
        badge_type: 'veteran',
        badge_name: 'Veteran',
        badge_description: 'Experienced competitor',
        badge_icon: '🏅',
        rarity: 'epic',
        earned_date: new Date().toISOString().split('T')[0]
      });
    }

    // Winner badge
    if (athleteStats.wins >= 1 && !existingBadgeTypes.has('winner')) {
      newBadges.push({
        athlete_email,
        badge_type: 'winner',
        badge_name: 'Winner',
        badge_description: '1st place victory',
        badge_icon: '🏆',
        rarity: 'epic',
        earned_date: new Date().toISOString().split('T')[0]
      });
    }

    // Champion badge (3+ wins)
    if (athleteStats.wins >= 3 && !existingBadgeTypes.has('champion')) {
      newBadges.push({
        athlete_email,
        badge_type: 'champion',
        badge_name: 'Champion',
        badge_description: 'Multiple victories achieved',
        badge_icon: '👑',
        rarity: 'legendary',
        earned_date: new Date().toISOString().split('T')[0]
      });
    }

    // Podium finisher badge
    if (athleteStats.podium_finishes >= 1 && !existingBadgeTypes.has('podium_finisher')) {
      newBadges.push({
        athlete_email,
        badge_type: 'podium_finisher',
        badge_name: 'Podium',
        badge_description: 'Top 3 finish',
        badge_icon: '🥇',
        rarity: 'rare',
        earned_date: new Date().toISOString().split('T')[0]
      });
    }

    // Create new badges
    if (newBadges.length > 0) {
      await base44.entities.AthleteBadge.bulkCreate(newBadges);
    }

    // Fetch all badges
    const allBadges = await base44.entities.AthleteBadge.filter({
      athlete_email: athlete_email
    });

    return Response.json({
      success: true,
      new_badges_count: newBadges.length,
      total_badges: allBadges.length,
      badges: allBadges
    });

  } catch (error) {
    console.error('Badge award error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});