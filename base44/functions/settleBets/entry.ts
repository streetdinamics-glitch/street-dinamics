import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { eventId, winningOutcome } = await req.json();

    if (!eventId || !winningOutcome) {
      return Response.json({ error: 'Missing eventId or winningOutcome' }, { status: 400 });
    }

    const activeBets = await base44.asServiceRole.entities.Bet.filter({ event_id: eventId, status: 'active' });

    let settledCount = 0;
    let paidOut = 0;

    for (const bet of activeBets) {
      const won = bet.outcome === winningOutcome;
      const result = won ? 'won' : 'lost';

      await base44.asServiceRole.entities.Bet.update(bet.id, {
        status: 'settled',
        result,
        settled_at: new Date().toISOString(),
      });

      // Credit winnings if won
      if (won) {
        await base44.asServiceRole.functions.invoke('updateTokenBalance', {
          userEmail: bet.created_by,
          userName: bet.created_by,
          amount: bet.potential_winnings,
          type: 'bet_won',
          description: `Won bet on ${winningOutcome}`,
          relatedEntityId: bet.id,
          relatedEntityType: 'Bet',
        });
        paidOut += bet.potential_winnings;
      }

      // Notify user
      await base44.asServiceRole.functions.invoke('notifyBetSettlement', { betId: bet.id });
      settledCount++;
    }

    return Response.json({ 
      success: true, 
      settledCount,
      paidOut,
      winningOutcome,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});