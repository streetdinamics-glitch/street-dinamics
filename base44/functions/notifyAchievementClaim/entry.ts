import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { claimId, status } = await req.json();

    const claim = await base44.asServiceRole.entities.AchievementClaim.filter({ id: claimId }).then(r => r[0]);
    if (!claim) {
      return Response.json({ error: 'Claim not found' }, { status: 404 });
    }

    let title, message, type;
    
    if (status === 'approved') {
      title = '🏆 Achievement Unlocked!';
      message = `Your claim for "${claim.achievement_name}" has been approved! Badge awarded.`;
      type = 'milestone';
    } else if (status === 'rejected') {
      title = '❌ Claim Rejected';
      message = `Your claim for "${claim.achievement_name}" was not approved. ${claim.rejection_reason || 'Please try again with better proof.'}`;
      type = 'milestone';
    } else if (status === 'under_review') {
      title = '🔍 Claim Under Review';
      message = `Your claim for "${claim.achievement_name}" is being reviewed by AI and admins.`;
      type = 'milestone';
    }

    await base44.asServiceRole.entities.Notification.create({
      user_email: claim.user_email,
      type,
      title,
      message,
      related_entity_id: claimId,
      related_entity_type: 'AchievementClaim',
      is_read: false,
      created_at: new Date().toISOString(),
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});