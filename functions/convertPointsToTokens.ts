import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { eventId, pointsToConvert } = await req.json();

    if (!eventId || !pointsToConvert || pointsToConvert <= 0) {
      return Response.json({ error: 'Invalid conversion request' }, { status: 400 });
    }

    const fanPoints = await base44.entities.FanPoints.filter({ 
      event_id: eventId, 
      fan_email: user.email 
    }).then(r => r[0]);

    if (!fanPoints || (fanPoints.total_points || 0) < pointsToConvert) {
      return Response.json({ error: 'Insufficient points' }, { status: 400 });
    }

    // Deduct points
    await base44.entities.FanPoints.update(fanPoints.id, {
      total_points: (fanPoints.total_points || 0) - pointsToConvert,
      last_updated: new Date().toISOString(),
    });

    // Add tokens (1:1 conversion)
    const tokensEarned = pointsToConvert;
    await base44.functions.invoke('updateTokenBalance', {
      userEmail: user.email,
      userName: user.full_name,
      amount: tokensEarned,
      type: 'points_converted',
      description: `Converted ${pointsToConvert} points to tokens`,
      relatedEntityId: fanPoints.id,
      relatedEntityType: 'FanPoints',
    });

    return Response.json({ 
      success: true, 
      tokensEarned,
      pointsRemaining: (fanPoints.total_points || 0) - pointsToConvert,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});