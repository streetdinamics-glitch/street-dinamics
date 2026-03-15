import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { event_id, fan_email, activity_type, points } = await req.json();

    if (!event_id || !fan_email || !activity_type || !points) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get or create fan points record
    const existing = await base44.entities.FanPoints.filter({
      event_id,
      fan_email
    });

    const fanRecord = existing[0];
    const user = await base44.auth.me();

    if (!fanRecord) {
      // Create new record
      const newRecord = await base44.entities.FanPoints.create({
        event_id,
        fan_email,
        fan_name: user?.full_name || fan_email.split('@')[0],
        chat_points: activity_type === 'chat' ? points : 0,
        vote_points: activity_type === 'vote' ? points : 0,
        prediction_points: activity_type === 'prediction' ? points : 0,
        total_points: points,
        messages_count: activity_type === 'chat' ? 1 : 0,
        votes_count: activity_type === 'vote' ? 1 : 0,
        correct_predictions: activity_type === 'prediction' ? 1 : 0,
        last_updated: new Date().toISOString()
      });

      return Response.json({ success: true, record: newRecord });
    }

    // Update existing record
    const updateData = {
      total_points: (fanRecord.total_points || 0) + points,
      last_updated: new Date().toISOString()
    };

    if (activity_type === 'chat') {
      updateData.chat_points = (fanRecord.chat_points || 0) + points;
      updateData.messages_count = (fanRecord.messages_count || 0) + 1;
    } else if (activity_type === 'vote') {
      updateData.vote_points = (fanRecord.vote_points || 0) + points;
      updateData.votes_count = (fanRecord.votes_count || 0) + 1;
    } else if (activity_type === 'prediction') {
      updateData.prediction_points = (fanRecord.prediction_points || 0) + points;
      updateData.correct_predictions = (fanRecord.correct_predictions || 0) + 1;
    }

    const updated = await base44.entities.FanPoints.update(fanRecord.id, updateData);

    // Check if rewards should be unlocked
    await checkAndAwardRewards(base44, event_id, fan_email, updated.total_points);

    // Trigger fan status check if significant points awarded
    if (points >= 50) {
      base44.asServiceRole.functions.invoke('updateFanStatus', { 
        userEmail: fan_email 
      }).catch(err => console.error('Fan status update failed:', err));
    }

    return Response.json({ success: true, record: updated });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function checkAndAwardRewards(base44, event_id, fan_email, totalPoints) {
  const rewardThresholds = [
    { points: 50, reward: 'Rookie Fan', type: 'digital_badge', desc: 'Earned 50 fan points' },
    { points: 150, reward: 'Rising Enthusiast', type: 'digital_badge', desc: 'Earned 150 fan points' },
    { points: 300, reward: 'Super Fan', type: 'nft_collectible', desc: 'Earned 300 fan points - Exclusive NFT' },
    { points: 500, reward: 'VIP Event Access', type: 'vip_access', desc: 'Earned 500 fan points - Next event VIP' },
    { points: 1000, reward: 'Hall of Fame', type: 'exclusive_content', desc: 'Earned 1000 fan points - Lifetime achievement' }
  ];

  for (const threshold of rewardThresholds) {
    if (totalPoints >= threshold.points) {
      const existing = await base44.entities.FanReward.filter({
        event_id,
        fan_email,
        reward_name: threshold.reward
      });

      if (!existing || existing.length === 0) {
        const user = await base44.auth.me();
        await base44.entities.FanReward.create({
          event_id,
          fan_email,
          fan_name: user?.full_name || fan_email.split('@')[0],
          reward_type: threshold.type,
          reward_name: threshold.reward,
          reward_description: threshold.desc,
          points_required: threshold.points,
          reward_image_url: `https://api.example.com/rewards/${threshold.reward.toLowerCase().replace(/ /g, '-')}.png`,
          earned_at: new Date().toISOString(),
          redemption_code: `REWARD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        });
      }
    }
  }
}