import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { betId } = await req.json();

    const bet = await base44.asServiceRole.entities.Bet.filter({ id: betId }).then(r => r[0]);
    if (!bet) {
      return Response.json({ error: 'Bet not found' }, { status: 404 });
    }

    const title = bet.result === 'won' ? '🎉 Bet Won!' : '❌ Bet Lost';
    const message = bet.result === 'won'
      ? `Congratulations! You won ${bet.potential_winnings} tokens on your bet.`
      : `Your bet of ${bet.amount} tokens was not successful this time.`;

    await base44.asServiceRole.entities.Notification.create({
      user_email: bet.created_by,
      type: 'deal',
      title,
      message,
      related_entity_id: betId,
      related_entity_type: 'Bet',
      is_read: false,
      created_at: new Date().toISOString(),
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});