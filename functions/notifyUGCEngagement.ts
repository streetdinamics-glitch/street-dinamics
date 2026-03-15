import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { ugcId } = await req.json();

    const ugc = await base44.asServiceRole.entities.UGCSubmission.filter({ id: ugcId }).then(r => r[0]);
    if (!ugc) {
      return Response.json({ error: 'UGC not found' }, { status: 404 });
    }

    const engagementCount = ugc.engagement_count || 0;
    const milestones = [10, 50, 100, 500, 1000];
    
    const reachedMilestone = milestones.find(m => 
      engagementCount >= m && (ugc.engagement_count - 1) < m
    );

    if (reachedMilestone) {
      await base44.asServiceRole.entities.Notification.create({
        user_email: ugc.creator_email,
        type: 'reward',
        title: `🔥 ${reachedMilestone} Engagement Milestone!`,
        message: `Your "${ugc.title}" has reached ${reachedMilestone} total engagement!`,
        related_entity_id: ugcId,
        related_entity_type: 'UGCSubmission',
        is_read: false,
        created_at: new Date().toISOString(),
      });
    }

    return Response.json({ success: true, milestoneReached: reachedMilestone });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});