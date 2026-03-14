import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { event_id, notification_type } = await req.json();

    // Get event details
    const events = await base44.asServiceRole.entities.Event.filter({ id: event_id });
    const event = events[0];
    
    if (!event) {
      return Response.json({ error: 'Event not found' }, { status: 404 });
    }

    // Get all registered users for this event
    const registrations = await base44.asServiceRole.entities.Registration.filter({ 
      event_id: event_id,
      status: 'confirmed'
    });

    if (registrations.length === 0) {
      return Response.json({ message: 'No registered users' });
    }

    // Send notifications based on type
    let subject, body;
    
    if (notification_type === 'event_live') {
      subject = `🔴 ${event.title} is LIVE NOW!`;
      body = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0412; color: #ffe8c0; padding: 30px; border: 1px solid rgba(255,100,0,0.3);">
          <h1 style="color: #ff6600; font-size: 28px; margin-bottom: 20px;">🔴 LIVE NOW!</h1>
          <h2 style="color: #ffcc00; font-size: 22px; margin-bottom: 15px;">${event.title}</h2>
          <p style="font-size: 16px; line-height: 1.6; color: #ffe8c0;">
            The event you registered for is now live! Join the action now.
          </p>
          <div style="margin: 25px 0; padding: 15px; background: rgba(255,100,0,0.1); border-left: 3px solid #ff6600;">
            <p style="margin: 0; color: #ffcc00;"><strong>📍 Location:</strong> ${event.location}</p>
            <p style="margin: 5px 0 0 0; color: #ffcc00;"><strong>📅 Date:</strong> ${event.date}</p>
          </div>
          ${event.kick_live_url || event.youtube_live_url ? `
            <div style="margin-top: 20px;">
              <a href="${event.kick_live_url || event.youtube_live_url}" 
                 style="display: inline-block; background: linear-gradient(135deg, #ff4400, #ff9900); color: #000; 
                        padding: 12px 30px; text-decoration: none; font-weight: bold; border-radius: 4px;">
                WATCH LIVE STREAM
              </a>
            </div>
          ` : ''}
          <p style="margin-top: 25px; font-size: 14px; color: #664422;">
            Street Dinamics - Global Street Sports Platform
          </p>
        </div>
      `;
    } else if (notification_type === 'new_vote') {
      subject = `🗳️ New Fan Vote for ${event.title}`;
      body = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0412; color: #ffe8c0; padding: 30px; border: 1px solid rgba(0,255,238,0.3);">
          <h1 style="color: #00ffee; font-size: 28px; margin-bottom: 20px;">🗳️ NEW FAN VOTE</h1>
          <h2 style="color: #ffcc00; font-size: 22px; margin-bottom: 15px;">${event.title}</h2>
          <p style="font-size: 16px; line-height: 1.6; color: #ffe8c0;">
            A new fan voting poll has started! Cast your vote now and let your voice be heard.
          </p>
          <div style="margin: 25px 0; padding: 15px; background: rgba(0,255,238,0.1); border-left: 3px solid #00ffee;">
            <p style="margin: 0; color: #00ffee;"><strong>🎫 Token holders can vote now</strong></p>
          </div>
          <p style="margin-top: 25px; font-size: 14px; color: #664422;">
            Street Dinamics - Global Street Sports Platform
          </p>
        </div>
      `;
    }

    // Send emails to all registered users
    const emailPromises = registrations.map(reg => 
      base44.asServiceRole.integrations.Core.SendEmail({
        to: reg.email,
        subject: subject,
        body: body
      }).catch(err => console.error(`Failed to send to ${reg.email}:`, err))
    );

    await Promise.all(emailPromises);

    // Create in-app notifications
    const notificationPromises = registrations.map(reg =>
      base44.asServiceRole.entities.Notification.create({
        recipient_email: reg.email,
        title: subject,
        message: notification_type === 'event_live' 
          ? `${event.title} is now live!`
          : `New fan vote available for ${event.title}`,
        type: notification_type === 'event_live' ? 'event' : 'system',
        link: '/',
        priority: 'high'
      }).catch(err => console.error(`Failed to create notification for ${reg.email}:`, err))
    );

    await Promise.all(notificationPromises);

    return Response.json({ 
      success: true, 
      notified: registrations.length,
      type: notification_type
    });

  } catch (error) {
    console.error('Notification error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});