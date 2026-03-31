import { createClientFromRequest } from 'npm:@base44/sdk@0.8.0'; // FIX #13: consistent version

// ── Types ─────────────────────────────────────────────────────────────────────
type ActivityType = 'chat' | 'vote' | 'prediction';

interface RequestBody {
  event_id:      string;
  fan_email:     string;
  activity_type: ActivityType;
  points:        number;
}

interface FanPointsRecord {
  id:                  string;
  event_id:            string;
  fan_email:           string;
  fan_name:            string;
  chat_points:         number;
  vote_points:         number;
  prediction_points:   number;
  total_points:        number;
  messages_count:      number;
  votes_count:         number;
  predictions_count:   number; // FIX #16: renamed from correct_predictions
  last_updated:        string;
}

interface RewardThreshold {
  points:  number;
  reward:  string;
  type:    string;
  desc:    string;
  imageKey: string;
}

interface AuthUser {
  email:      string;
  full_name?: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────
const VALID_ACTIVITY_TYPES: ActivityType[] = ['chat', 'vote', 'prediction']; // FIX #5

const MAX_POINTS_PER_REQUEST = 500; // FIX #4: cap against inflation abuse
const MIN_POINTS_PER_REQUEST = 1;   // FIX #4: no zero or negative points

const REWARD_THRESHOLDS: RewardThreshold[] = [
  { points: 50,   reward: 'Rookie Fan',       type: 'digital_badge',     desc: 'Earned 50 fan points',                        imageKey: 'rookie-fan' },
  { points: 150,  reward: 'Rising Enthusiast', type: 'digital_badge',    desc: 'Earned 150 fan points',                       imageKey: 'rising-enthusiast' },
  { points: 300,  reward: 'Super Fan',         type: 'nft_collectible',  desc: 'Earned 300 fan points — Exclusive NFT',        imageKey: 'super-fan' },
  { points: 500,  reward: 'VIP Event Access',  type: 'vip_access',       desc: 'Earned 500 fan points — Next event VIP',       imageKey: 'vip-event-access' },
  { points: 1000, reward: 'Hall of Fame',      type: 'exclusive_content', desc: 'Earned 1000 fan points — Lifetime achievement', imageKey: 'hall-of-fame' },
];

// FIX #11: configurable reward image base URL via env var
const REWARD_IMAGE_BASE = Deno.env.get('REWARD_IMAGE_BASE_URL') || 'https://streetdinamics.app/assets/rewards';

// ── Helpers ───────────────────────────────────────────────────────────────────

// FIX #10: cryptographically secure redemption code
function generateRedemptionCode(): string {
  return `REWARD-${crypto.randomUUID()}`;
}

function deriveFanName(user: AuthUser | null, fan_email: string): string {
  return user?.full_name || fan_email.split('@')[0];
}

// ── Reward checker ────────────────────────────────────────────────────────────
// FIX #7: user passed in — no second auth.me() call
async function checkAndAwardRewards(
  base44:       ReturnType<typeof createClientFromRequest>,
  event_id:     string,
  fan_email:    string,
  totalPoints:  number,
  user:         AuthUser | null,
): Promise<void> {
  for (const threshold of REWARD_THRESHOLDS) {
    if (totalPoints < threshold.points) continue;

    // FIX #6: use asServiceRole for reward queries
    const existing = await base44.asServiceRole.entities.FanReward.filter({
      event_id,
      fan_email,
      reward_name: threshold.reward,
    });

    if (!existing || existing.length === 0) {
      // FIX #6: use asServiceRole for reward creation
      await base44.asServiceRole.entities.FanReward.create({
        event_id,
        fan_email,
        fan_name:           deriveFanName(user, fan_email),
        reward_type:        threshold.type,
        reward_name:        threshold.reward,
        reward_description: threshold.desc,
        points_required:    threshold.points,
        reward_image_url:   `${REWARD_IMAGE_BASE}/${threshold.imageKey}.png`, // FIX #11
        earned_at:          new Date().toISOString(),
        redemption_code:    generateRedemptionCode(), // FIX #10
      });
    }
  }
}

// ── Main Handler ──────────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  // FIX #1: method guard
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);

    // FIX #2: auth check FIRST, before any DB operations
    const user: AuthUser | null = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // FIX #8: safe body parse
    let body: RequestBody;
    try {
      body = await req.json();
    } catch {
      return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { event_id, fan_email, activity_type, points } = body;

    // FIX #14: proper null/undefined checks — !points blocks points=0
    if (!event_id || !fan_email || !activity_type) {
      return Response.json({ error: 'Missing required fields: event_id, fan_email, activity_type' }, { status: 400 });
    }
    if (points === undefined || points === null) {
      return Response.json({ error: 'Missing required field: points' }, { status: 400 });
    }

    // FIX #5: validate activity_type against known values
    if (!VALID_ACTIVITY_TYPES.includes(activity_type)) {
      return Response.json({
        error: `Invalid activity_type. Must be one of: ${VALID_ACTIVITY_TYPES.join(', ')}`,
      }, { status: 400 });
    }

    // FIX #4: validate points range
    if (
      typeof points !== 'number' ||
      !Number.isInteger(points) ||
      points < MIN_POINTS_PER_REQUEST ||
      points > MAX_POINTS_PER_REQUEST
    ) {
      return Response.json({
        error: `points must be an integer between ${MIN_POINTS_PER_REQUEST} and ${MAX_POINTS_PER_REQUEST}`,
      }, { status: 400 });
    }

    // FIX #3: use asServiceRole for all entity operations
    const existing = await base44.asServiceRole.entities.FanPoints.filter({
      event_id,
      fan_email,
    });

    const fanRecord: FanPointsRecord | undefined = existing?.[0];

    let resultRecord: FanPointsRecord;

    if (!fanRecord) {
      // Create new record
      resultRecord = await base44.asServiceRole.entities.FanPoints.create({
        event_id,
        fan_email,
        fan_name:           deriveFanName(user, fan_email),
        chat_points:        activity_type === 'chat'       ? points : 0,
        vote_points:        activity_type === 'vote'       ? points : 0,
        prediction_points:  activity_type === 'prediction' ? points : 0,
        total_points:       points,
        messages_count:     activity_type === 'chat'       ? 1 : 0,
        votes_count:        activity_type === 'vote'       ? 1 : 0,
        predictions_count:  activity_type === 'prediction' ? 1 : 0, // FIX #16
        last_updated:       new Date().toISOString(),
      });
    } else {
      // FIX #9: derive all values from the single read — minimise race window
      const updateData: Partial<FanPointsRecord> = {
        total_points: (fanRecord.total_points || 0) + points,
        last_updated: new Date().toISOString(),
      };

      if (activity_type === 'chat') {
        updateData.chat_points    = (fanRecord.chat_points    || 0) + points;
        updateData.messages_count = (fanRecord.messages_count || 0) + 1;
      } else if (activity_type === 'vote') {
        updateData.vote_points  = (fanRecord.vote_points  || 0) + points;
        updateData.votes_count  = (fanRecord.votes_count  || 0) + 1;
      } else if (activity_type === 'prediction') {
        updateData.prediction_points = (fanRecord.prediction_points || 0) + points;
        updateData.predictions_count = (fanRecord.predictions_count || 0) + 1; // FIX #16
      }

      // FIX #3: asServiceRole
      resultRecord = await base44.asServiceRole.entities.FanPoints.update(fanRecord.id, updateData);
    }

    // Check and award any newly unlocked rewards
    // FIX #7: pass user — no second auth.me() call inside
    await checkAndAwardRewards(base44, event_id, fan_email, resultRecord.total_points, user);

    // FIX #12: trigger fan status update on every successful award, not just points >= 50
    base44.asServiceRole.functions.invoke('updateFanStatus', {
      userEmail: fan_email,
    }).catch((err: unknown) => {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[awardFanPoints] Fan status update failed for ${fan_email}:`, msg);
    });

    return Response.json({ success: true, record: resultRecord });

  } catch (error: unknown) {
    // FIX #17 & #18: typed error, logged server-side
    const message = error instanceof Error ? error.message : 'Unknown error';
    const name    = error instanceof Error ? error.name    : 'Error';
    console.error(`[awardFanPoints] ${name}:`, error);
    return Response.json({ error: message, type: name }, { status: 500 });
  }
});
