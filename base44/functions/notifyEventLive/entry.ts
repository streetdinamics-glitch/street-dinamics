import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();
    
    // Only trigger on status change to 'live'
    if (payload.event?.type !== 'update' || !payload.data || !payload.old_data) {
      return Response.json({ message: 'Not a status update' });
    }

    if (payload.old_data.status === 'live' || payload.data.status !== 'live') {
      return Response.json({ message: 'Not going live' });
    }

    const event = payload.data;

    // Get all registered users
    const registrations = await base44.asServiceRole.entities.Registration.filter({ 
      event_id: event.id,
      status: 'confirmed'
    });

    if (registrations.length === 0) {
      return Response.json({ message: 'No registered users' });
    }

    const subject = `🔴 ${event.title} is LIVE NOW!`;
    const body = `
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

    // Send emails
    const emailPromises = registrations.map(reg => 
      base44.asServiceRole.integrations.Core.SendEmail({
        to: reg.email,
        subject: subject,
        body: body
      }).catch(err => console.error(`Failed to send to ${reg.email}:`, err))
    );

    await Promise.all(emailPromises);

    // Create notifications
    const notificationPromises = registrations.map(reg =>
      base44.asServiceRole.entities.Notification.create({
        recipient_email: reg.email,
        title: subject,
        message: `${event.title} is now live!`,
        type: 'event',
        link: '/',
        priority: 'high'
      }).catch(err => console.error(`Failed to create notification:`, err))
    );

    await Promise.all(notificationPromises);

    return Response.json({ 
      success: true, 
      notified: registrations.length
    });

  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});