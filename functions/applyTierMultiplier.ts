import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const TIER_MULTIPLIERS = {
  rookie: 1.0,
  enthusiast: 1.25,
  superfan: 1.5,
  legend: 2.0,
  hall_of_fame: 3.0,
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { userEmail, baseAmount, type } = await req.json();

    if (!userEmail || baseAmount === undefined) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get fan status
    const fanStatusRecords = await base44.asServiceRole.entities.FanStatus.filter({ user_email: userEmail });
    const fanStatus = fanStatusRecords[0];

    if (!fanStatus) {
      // No fan status, return base amount
      return Response.json({ 
        success: true, 
        multipliedAmount: baseAmount, 
        multiplier: 1.0,
        tier: 'rookie'
      });
    }

    const multiplier = TIER_MULTIPLIERS[fanStatus.current_tier] || 1.0;
    const multipliedAmount = Math.round(baseAmount * multiplier);

    return Response.json({
      success: true,
      multipliedAmount,
      multiplier,
      tier: fanStatus.current_tier,
      baseAmount,
    });
  } catch (error) {
    console.error('Error applying tier multiplier:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});