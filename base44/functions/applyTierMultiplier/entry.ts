import { createClientFromRequest } from 'npm:@base44/sdk@0.8.0'; // FIX #1: consistent version

// ── Types ─────────────────────────────────────────────────────────────────────
type Tier = 'rookie' | 'enthusiast' | 'superfan' | 'legend' | 'hall_of_fame';

interface FanStatus {
  user_email: string;
  current_tier: Tier;
}

interface RequestBody {
  userEmail: string;
  baseAmount: number;
  // FIX #3: removed unused `type` field
}

// ── Constants ─────────────────────────────────────────────────────────────────
const TIER_MULTIPLIERS: Record<Tier, number> = {
  rookie:       1.0,
  enthusiast:   1.25,
  superfan:     1.5,
  legend:       2.0,
  hall_of_fame: 3.0,
};

const DEFAULT_TIER: Tier     = 'rookie';
const DEFAULT_MULTIPLIER     = TIER_MULTIPLIERS[DEFAULT_TIER];

// ── Helper: float-safe multiply ───────────────────────────────────────────────
// FIX #5: Math.round(1.25 * 100) = 124 due to float imprecision — fix with epsilon rounding
function applyMultiplier(base: number, multiplier: number): number {
  return Math.round((base * multiplier + Number.EPSILON) * 100) / 100;
}

// ── Main Handler ──────────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  // FIX #6: method guard
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);

    // FIX #2: auth check — endpoint was completely open before
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // FIX #4: parse and validate body
    let body: RequestBody;
    try {
      body = await req.json();
    } catch {
      return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { userEmail, baseAmount } = body;

    if (!userEmail || typeof userEmail !== 'string') {
      return Response.json({ error: 'Missing or invalid field: userEmail' }, { status: 400 });
    }

    // FIX #4: baseAmount must be a finite positive number
    if (baseAmount === undefined || baseAmount === null) {
      return Response.json({ error: 'Missing required field: baseAmount' }, { status: 400 });
    }
    if (typeof baseAmount !== 'number' || !isFinite(baseAmount) || baseAmount < 0) {
      return Response.json({ error: 'baseAmount must be a non-negative finite number' }, { status: 400 });
    }

    // Get fan status
    const fanStatusRecords: FanStatus[] = await base44.asServiceRole.entities.FanStatus.filter({
      user_email: userEmail,
    });

    const fanStatus = fanStatusRecords?.[0];

    // No fan status → return base amount at rookie tier
    if (!fanStatus) {
      return Response.json({
        success:          true,
        multipliedAmount: baseAmount,
        multiplier:       DEFAULT_MULTIPLIER,
        tier:             DEFAULT_TIER,
        baseAmount,
      });
    }

    // FIX #7: unknown tier falls back to rookie with a warning log
    const tier       = fanStatus.current_tier;
    const multiplier = TIER_MULTIPLIERS[tier] ?? (() => {
      console.warn(`[applyTierMultiplier] Unknown tier "${tier}" for ${userEmail}, defaulting to ${DEFAULT_MULTIPLIER}`);
      return DEFAULT_MULTIPLIER;
    })();

    const multipliedAmount = applyMultiplier(baseAmount, multiplier);

    return Response.json({
      success: true,
      multipliedAmount,
      multiplier,
      tier,
      baseAmount,
    });

  } catch (error: unknown) {
    // FIX #8: typed error handling
    const message = error instanceof Error ? error.message : 'Unknown error';
    const name    = error instanceof Error ? error.name    : 'Error';
    console.error(`[applyTierMultiplier] ${name}:`, error);
    return Response.json({ error: message, type: name }, { status: 500 });
  }
});
