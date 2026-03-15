import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { userEmail, userName, amount, type, description, relatedEntityId, relatedEntityType } = await req.json();

    if (!userEmail || amount === undefined) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get or create token balance
    let balance = await base44.asServiceRole.entities.TokenBalance.filter({ user_email: userEmail }).then(r => r[0]);
    
    if (!balance) {
      balance = await base44.asServiceRole.entities.TokenBalance.create({
        user_email: userEmail,
        user_name: userName,
        total_tokens: 0,
        earned_from_points: 0,
        earned_from_bets: 0,
        earned_from_ownership: 0,
        spent_on_rewards: 0,
        spent_on_bets: 0,
        last_updated: new Date().toISOString(),
      });
    }

    const newTotal = balance.total_tokens + amount;

    if (newTotal < 0) {
      return Response.json({ error: 'Insufficient balance' }, { status: 400 });
    }

    // Update balance with category tracking
    const updateData = {
      total_tokens: newTotal,
      last_updated: new Date().toISOString(),
    };

    if (type === 'points_converted') updateData.earned_from_points = (balance.earned_from_points || 0) + amount;
    if (type === 'bet_won') updateData.earned_from_bets = (balance.earned_from_bets || 0) + amount;
    if (type === 'bet_placed') updateData.spent_on_bets = (balance.spent_on_bets || 0) + Math.abs(amount);
    if (type === 'reward_redeemed') updateData.spent_on_rewards = (balance.spent_on_rewards || 0) + Math.abs(amount);

    await base44.asServiceRole.entities.TokenBalance.update(balance.id, updateData);

    // Create transaction record
    await base44.asServiceRole.entities.TokenTransaction.create({
      user_email: userEmail,
      transaction_type: type,
      amount,
      balance_after: newTotal,
      description,
      related_entity_id: relatedEntityId,
      related_entity_type: relatedEntityType,
      timestamp: new Date().toISOString(),
    });

    return Response.json({ success: true, newBalance: newTotal });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});