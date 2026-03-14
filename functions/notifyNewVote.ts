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

    const vote = payload.data;

    // Get event details
    const events = await base44.asServiceRole.entities.Event.filter({ id: vote.event_id });
    const event = events[0];

    if (!event) {
      return Response.json({ error: 'Event not found' }, { status: 404 });
    }

    // Get all registered users for this event
    const registrations = await base44.asServiceRole.entities.Registration.filter({ 
      event_id: vote.event_id,
      status: 'confirmed'
    });

    if (registrations.length === 0) {
      return Response.json({ message: 'No registered users' });
    }

    const subject = `🗳️ New Fan Vote for ${event.title}`;
    const body = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0412; color: #ffe8c0; padding: 30px; border: 1px solid rgba(0,255,238,0.3);">
        <h1 style="color: #00ffee; font-size: 28px; margin-bottom: 20px;">🗳️ NEW FAN VOTE</h1>
        <h2 style="color: #ffcc00; font-size: 22px; margin-bottom: 15px;">${event.title}</h2>
        <p style="font-size: 16px; line-height: 1.6; color: #ffe8c0;">
          A new fan voting poll has started! Cast your vote now and let your voice be heard.
        </p>
        <div style="margin: 25px 0; padding: 15px; background: rgba(0,255,238,0.1); border-left: 3px solid #00ffee;">
          <p style="margin: 0; color: #00ffee;"><strong>Question:</strong> ${vote.question}</p>
        </div>
        <div style="margin: 25px 0; padding: 15px; background: rgba(255,100,0,0.1); border-left: 3px solid #ff6600;">
          <p style="margin: 0; color: #ffcc00;"><strong>🎫 Token holders can vote now</strong></p>
        </div>
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
        message: `New fan vote: ${vote.question}`,
        type: 'system',
        link: '/',
        priority: 'medium'
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