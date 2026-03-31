import { createClientFromRequest } from 'npm:@base44/sdk@0.8.0'; // FIX #7: consistent version

// ── Types ─────────────────────────────────────────────────────────────────────
interface AthleteStats {
  events_participated: number;
  wins:                number;
  podium_finishes:     number;
}

interface BadgeDefinition {
  badge_type:        string;
  badge_name:        string;
  badge_description: string;
  badge_icon:        string;
  rarity:            'common' | 'rare' | 'epic' | 'legendary';
  // Criteria — at least one must be provided
  min_events?:       number;
  min_wins?:         number;
  min_podiums?:      number;
}

interface BadgeRecord {
  athlete_email: string;
  badge_type:    string;
  badge_name:    string;
  [key: string]: unknown;
}

// ── Badge Definitions ─────────────────────────────────────────────────────────
// FIX #5 & #15: declarative config — ten_events and veteran now have distinct thresholds
const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    badge_type:        'first_event',
    badge_name:        'First Step',
    badge_description: 'Participated in your first event',
    badge_icon:        '⭐',
    rarity:            'common',
    min_events:        1,
  },
  {
    badge_type:        'five_events',
    badge_name:        'Regular',
    badge_description: '5 events participated',
    badge_icon:        '🎯',
    rarity:            'rare',
    min_events:        5,
  },
  {
    badge_type:        'ten_events',
    badge_name:        'Dedicated',
    badge_description: '10 events milestone reached',
    badge_icon:        '⚡',
    rarity:            'epic',
    min_events:        10,
  },
  {
    badge_type:        'veteran',           // FIX #5: distinct threshold from ten_events
    badge_name:        'Veteran',
    badge_description: 'Seasoned competitor — 20 events',
    badge_icon:        '🏅',
    rarity:            'epic',
    min_events:        20,
  },
  {
    badge_type:        'podium_finisher',
    badge_name:        'Podium',
    badge_description: 'Top 3 finish achieved',
    badge_icon:        '🥇',
    rarity:            'rare',
    min_podiums:       1,
  },
  {
    badge_type:        'winner',
    badge_name:        'Winner',
    badge_description: '1st place victory',
    badge_icon:        '🏆',
    rarity:            'epic',
    min_wins:          1,
  },
  {
    badge_type:        'champion',
    badge_name:        'Champion',
    badge_description: 'Multiple victories — 3 wins',
    badge_icon:        '👑',
    rarity:            'legendary',
    min_wins:          3,
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

// FIX #8: basic email format validation
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function badgeIsUnlocked(
  def:     BadgeDefinition,
  events:  number,
  wins:    number,
  podiums: number,
): boolean {
  if (def.min_events  !== undefined && events  < def.min_events)  return false;
  if (def.min_wins    !== undefined && wins    < def.min_wins)    return false;
  if (def.min_podiums !== undefined && podiums < def.min_podiums) return false;
  return true;
}

// ── Main Handler ──────────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  // FIX #1: method guard
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);

    // FIX #2: auth check first
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // FIX #4: safe body parse
    let body: { athlete_email?: string };
    try {
      body = await req.json();
    } catch {
      return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { athlete_email } = body;

    if (!athlete_email) {
      return Response.json({ error: 'athlete_email required' }, { status: 400 });
    }

    // FIX #8: validate email format
    if (!isValidEmail(athlete_email)) {
      return Response.json({ error: 'Invalid athlete_email format' }, { status: 400 });
    }

    // FIX #3: all entity operations use asServiceRole
    const [registrations, stats, existingBadges] = await Promise.all([
      base44.asServiceRole.entities.Registration.filter({
        email:  athlete_email,
        type:   'athlete',
        status: 'confirmed',
      }),
      base44.asServiceRole.entities.AthleteStats.filter({
        athlete_email,
      }),
      base44.asServiceRole.entities.AthleteBadge.filter({
        athlete_email,
      }),
    ]);

    // FIX #10: explicit numeric coercion for all stat fields
    const rawStats: Partial<AthleteStats> = stats?.[0] || {};
    const athleteStats: AthleteStats = {
      events_participated: Number(rawStats.events_participated) || 0,
      wins:                Number(rawStats.wins)                || 0,
      podium_finishes:     Number(rawStats.podium_finishes)     || 0,
    };

    const existingBadgeTypes = new Set((existingBadges as BadgeRecord[]).map(b => b.badge_type));
    const eventCount = registrations.length;

    // FIX #15: evaluate all badges from declarative config
    const newBadges = BADGE_DEFINITIONS
      .filter(def =>
        !existingBadgeTypes.has(def.badge_type) &&
        badgeIsUnlocked(def, eventCount, athleteStats.wins, athleteStats.podium_finishes)
      )
      .map(def => ({
        athlete_email,
        badge_type:        def.badge_type,
        badge_name:        def.badge_name,
        badge_description: def.badge_description,
        badge_icon:        def.badge_icon,
        rarity:            def.rarity,
        earned_date:       new Date().toISOString(), // FIX #12: full ISO string, not date-only
      }));

    // FIX #9: create badges individually to isolate failures
    const createdBadges: BadgeRecord[] = [];
    const failedBadges:  string[]      = [];

    for (const badge of newBadges) {
      try {
        // FIX #3: asServiceRole
        const created = await base44.asServiceRole.entities.AthleteBadge.create(badge);
        createdBadges.push(created);
      } catch (badgeErr: unknown) {
        const msg = badgeErr instanceof Error ? badgeErr.message : 'Unknown error';
        console.error(`[awardAthleteBadges] Failed to create badge ${badge.badge_type} for ${athlete_email}: ${msg}`);
        failedBadges.push(badge.badge_type);
      }
    }

    // FIX #13: notify athlete for each newly awarded badge
    if (createdBadges.length > 0) {
      await base44.asServiceRole.entities.Notification.create({
        user_email: athlete_email,
        type:       'badge_awarded',
        title:      `You earned ${createdBadges.length} new badge${createdBadges.length > 1 ? 's' : ''}!`,
        message:    createdBadges.map(b => `${b.badge_icon ?? ''} ${b.badge_name}`).join(', '),
        read:       false,
        created_at: new Date().toISOString(),
      }).catch(() => null); // non-critical
    }

    // FIX #6: build full badge list from in-memory data — no second DB round-trip
    const allBadges = [...(existingBadges as BadgeRecord[]), ...createdBadges];

    return Response.json({
      success:          true,
      new_badges_count: createdBadges.length,
      failed_badges:    failedBadges.length > 0 ? failedBadges : undefined,
      total_badges:     allBadges.length,
      badges:           allBadges,
    });

  } catch (error: unknown) {
    // FIX #16: typed error handling
    const message = error instanceof Error ? error.message : 'Unknown error';
    const name    = error instanceof Error ? error.name    : 'Error';
    console.error(`[awardAthleteBadges] ${name}:`, error);
    return Response.json({ error: message, type: name }, { status: 500 });
  }
});
