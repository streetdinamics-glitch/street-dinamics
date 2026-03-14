import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { athlete_email, update_type, update_message } = await req.json();

    // Get athlete details
    const athletes = await base44.asServiceRole.entities.User.filter({ email: athlete_email });
    const athlete = athletes[0];
    
    if (!athlete) {
      return Response.json({ error: 'Athlete not found' }, { status: 404 });
    }

    // Get all users who own tokens of this athlete (their fans)
    const tokenOwnerships = await base44.asServiceRole.entities.TokenOwnership.filter({ 
      athlete_name: athlete.nickname || athlete.full_name 
    });

    if (tokenOwnerships.length === 0) {
      return Response.json({ message: 'No token holders to notify' });
    }

    // Get unique fan emails
    const fanEmails = [...new Set(tokenOwnerships.map(t => t.created_by))];

    const subject = `⭐ ${athlete.nickname || athlete.full_name} Update`;
    const body = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0412; color: #ffe8c0; padding: 30px; border: 1px solid rgba(255,100,0,0.3);">
        <h1 style="color: #ff6600; font-size: 28px; margin-bottom: 20px;">⭐ ATHLETE UPDATE</h1>
        <h2 style="color: #ffcc00; font-size: 22px; margin-bottom: 15px;">${athlete.nickname || athlete.full_name}</h2>
        <p style="font-size: 16px; line-height: 1.6; color: #ffe8c0;">
          ${update_message || 'Your favorite athlete has posted a new update!'}
        </p>
        <div style="margin: 25px 0; padding: 15px; background: rgba(255,100,0,0.1); border-left: 3px solid #ff6600;">
          <p style="margin: 0; color: #ffcc00;"><strong>🎫 You own tokens of this athlete</strong></p>
        </div>
        <div style="margin-top: 20px;">
          <a href="/AthleteProfile?email=${athlete_email}" 
             style="display: inline-block; background: linear-gradient(135deg, #ff4400, #ff9900); color: #000; 
                    padding: 12px 30px; text-decoration: none; font-weight: bold; border-radius: 4px;">
            VIEW PROFILE
          </a>
        </div>
        <p style="margin-top: 25px; font-size: 14px; color: #664422;">
          Street Dinamics - Global Street Sports Platform
        </p>
      </div>
    `;

    // Send emails to all token holders
    const emailPromises = fanEmails.map(email => 
      base44.asServiceRole.integrations.Core.SendEmail({
        to: email,
        subject: subject,
        body: body
      }).catch(err => console.error(`Failed to send to ${email}:`, err))
    );

    await Promise.all(emailPromises);

    // Create in-app notifications
    const notificationPromises = fanEmails.map(email =>
      base44.asServiceRole.entities.Notification.create({
        recipient_email: email,
        title: subject,
        message: update_message || `${athlete.nickname || athlete.full_name} posted an update`,
        type: 'system',
        link: `/AthleteProfile?email=${athlete_email}`,
        priority: 'medium'
      }).catch(err => console.error(`Failed to create notification for ${email}:`, err))
    );

    await Promise.all(notificationPromises);

    return Response.json({ 
      success: true, 
      notified: fanEmails.length,
      athlete: athlete.nickname || athlete.full_name
    });

  } catch (error) {
    console.error('Notification error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});