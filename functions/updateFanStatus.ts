import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const TIER_REQUIREMENTS = {
  rookie: 0,
  enthusiast: 1000,
  superfan: 5000,
  legend: 15000,
  hall_of_fame: 50000,
};

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
    const { userEmail } = await req.json();

    if (!userEmail) {
      return Response.json({ error: 'Missing userEmail' }, { status: 400 });
    }

    // Get current fan status
    const fanStatusRecords = await base44.asServiceRole.entities.FanStatus.filter({ user_email: userEmail });
    let fanStatus = fanStatusRecords[0];

    if (!fanStatus) {
      return Response.json({ error: 'Fan status not found' }, { status: 404 });
    }

    // Get token transactions to calculate total spent
    const transactions = await base44.asServiceRole.entities.TokenTransaction.filter({ user_email: userEmail });
    const totalSpent = transactions
      .filter(t => t.transaction_type === 'spend' || t.transaction_type === 'reward_redeemed')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const totalEarned = transactions
      .filter(t => t.transaction_type === 'earn' || t.transaction_type === 'bet_won' || t.transaction_type === 'points_converted')
      .reduce((sum, t) => sum + t.amount, 0);

    // Calculate rarity score
    const nfts = await base44.asServiceRole.entities.NFTOwnership.filter({ buyer_email: userEmail });
    const tokens = await base44.asServiceRole.entities.TokenOwnership.filter({ created_by: userEmail });
    
    const rarityPoints = {
      rising_star: 1,
      breakout_talent: 5,
      elite_performer: 15,
      living_legend: 50,
    };

    const rarityScore = [
      ...nfts.map(n => rarityPoints[n.rarity] || 0),
      ...tokens.map(t => rarityPoints[t.rarity] || 0)
    ].reduce((sum, score) => sum + score, 0);

    // Determine new tier
    let newTier = 'rookie';
    for (const [tier, requirement] of Object.entries(TIER_REQUIREMENTS).reverse()) {
      if (totalSpent >= requirement) {
        newTier = tier;
        break;
      }
    }

    const tierChanged = newTier !== fanStatus.current_tier;
    const tierHistory = fanStatus.tier_history || [];
    
    if (tierChanged) {
      tierHistory.push({
        tier: newTier,
        achieved_at: new Date().toISOString(),
        tokens_spent: totalSpent,
        rarity_score: rarityScore,
      });
    }

    // Calculate next tier progress
    const tierList = Object.keys(TIER_REQUIREMENTS);
    const currentTierIndex = tierList.indexOf(newTier);
    const nextTier = tierList[currentTierIndex + 1];
    let nextTierProgress = 100;

    if (nextTier) {
      const currentReq = TIER_REQUIREMENTS[newTier];
      const nextReq = TIER_REQUIREMENTS[nextTier];
      nextTierProgress = Math.min(((totalSpent - currentReq) / (nextReq - currentReq)) * 100, 100);
    }

    // Determine perks
    const perks = [];
    if (newTier === 'enthusiast' || currentTierIndex >= tierList.indexOf('enthusiast')) {
      perks.push('10% reward discount', 'priority_support');
    }
    if (newTier === 'superfan' || currentTierIndex >= tierList.indexOf('superfan')) {
      perks.push('20% reward discount', 'early_access_24h', 'exclusive_badge');
    }
    if (newTier === 'legend' || currentTierIndex >= tierList.indexOf('legend')) {
      perks.push('30% reward discount', 'early_access_48h', 'vip_events', 'custom_badge');
    }
    if (newTier === 'hall_of_fame') {
      perks.push('50% reward discount', 'early_access_72h', 'vip_events_plus', 'lifetime_nfts', 'governance_voting');
    }

    const earlyAccessEnabled = ['superfan', 'legend', 'hall_of_fame'].includes(newTier);

    // Update fan status
    const updatedStatus = await base44.asServiceRole.entities.FanStatus.update(fanStatus.id, {
      current_tier: newTier,
      total_tokens_spent: totalSpent,
      total_tokens_earned: totalEarned,
      current_multiplier: TIER_MULTIPLIERS[newTier],
      rarity_score: rarityScore,
      nfts_owned: nfts.length,
      tokens_owned: tokens.length,
      early_access_enabled: earlyAccessEnabled,
      next_tier_progress: nextTierProgress,
      perks_unlocked: perks,
      tier_history: tierHistory,
      tier_unlocked_at: tierChanged ? new Date().toISOString() : fanStatus.tier_unlocked_at,
    });

    // Send notification if tier changed
    if (tierChanged) {
      await base44.asServiceRole.entities.Notification.create({
        user_email: userEmail,
        type: 'reward',
        title: `🎉 Tier Unlocked: ${newTier.toUpperCase()}`,
        message: `Congratulations! You've reached ${newTier} tier with ${TIER_MULTIPLIERS[newTier]}x earnings multiplier!`,
        related_entity_id: updatedStatus.id,
        related_entity_type: 'FanStatus',
        is_read: false,
        created_at: new Date().toISOString(),
      });
    }

    return Response.json({ 
      success: true,
      fanStatus: updatedStatus,
      tierChanged,
      message: tierChanged ? `Congratulations! You've reached ${newTier} tier!` : 'Fan status updated',
    });
  } catch (error) {
    console.error('Error updating fan status:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});