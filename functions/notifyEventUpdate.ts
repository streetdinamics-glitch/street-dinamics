import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { event, data, old_data } = await req.json();

    // Only process update events
    if (event.type !== 'update') {
      return Response.json({ message: 'Not an update event' });
    }

    const eventData = data;
    const oldEventData = old_data;

    // Check what changed
    const statusChanged = eventData.status !== oldEventData.status;
    const liveUrlsChanged = 
      eventData.kick_live_url !== oldEventData.kick_live_url ||
      eventData.youtube_live_url !== oldEventData.youtube_live_url;
    const vodUrlsChanged = 
      eventData.kick_vod_url !== oldEventData.kick_vod_url ||
      eventData.youtube_vod_url !== oldEventData.youtube_vod_url;
    const detailsChanged = 
      eventData.date !== oldEventData.date ||
      eventData.location !== oldEventData.location ||
      eventData.description !== oldEventData.description;

    // If nothing important changed, skip notification
    if (!statusChanged && !liveUrlsChanged && !vodUrlsChanged && !detailsChanged) {
      return Response.json({ message: 'No significant changes' });
    }

    // Get all athlete registrations for this event
    const registrations = await base44.asServiceRole.entities.Registration.filter({
      event_id: eventData.id,
      type: 'athlete',
      status: 'confirmed'
    });

    if (registrations.length === 0) {
      return Response.json({ message: 'No registered athletes to notify' });
    }

    // Build notification message
    let subject = '';
    let message = '';

    if (statusChanged) {
      if (eventData.status === 'live') {
        subject = `🔴 LIVE NOW: ${eventData.title}`;
        message = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #000; color: #ffe8c0; padding: 20px; border: 2px solid #ff5000;">
            <h1 style="color: #ff9900; font-size: 28px; margin: 0 0 20px 0; letter-spacing: 2px;">EVENT IS LIVE NOW!</h1>
            
            <div style="background: rgba(255,100,0,0.1); border: 1px solid rgba(255,100,0,0.3); padding: 15px; margin-bottom: 20px;">
              <h2 style="color: #ffcc00; font-size: 20px; margin-top: 0;">${eventData.title}</h2>
              <p style="margin: 5px 0;"><strong>Location:</strong> ${eventData.location}</p>
              <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: #00ff00;">🔴 LIVE NOW</span></p>
            </div>
            
            ${eventData.kick_live_url || eventData.youtube_live_url ? `
            <div style="background: #080512; border: 2px solid #ff9900; padding: 20px; text-align: center; margin-bottom: 20px;">
              <h3 style="color: #00ffee; font-size: 16px; margin-top: 0;">WATCH LIVE STREAM</h3>
              ${eventData.kick_live_url ? `<p><a href="${eventData.kick_live_url}" style="color: #ff9900; font-size: 18px; text-decoration: none;">🎥 Watch on Kick</a></p>` : ''}
              ${eventData.youtube_live_url ? `<p><a href="${eventData.youtube_live_url}" style="color: #ff9900; font-size: 18px; text-decoration: none;">📺 Watch on YouTube</a></p>` : ''}
            </div>
            ` : ''}
            
            <p style="font-size: 14px; color: #664422;">Good luck and give it your all! 🔥</p>
          </div>
        `;
      } else if (eventData.status === 'ended') {
        subject = `Event Ended: ${eventData.title}`;
        message = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #000; color: #ffe8c0; padding: 20px; border: 2px solid #ff5000;">
            <h1 style="color: #ff9900; font-size: 28px; margin: 0 0 20px 0;">Event Concluded</h1>
            
            <div style="background: rgba(255,100,0,0.1); border: 1px solid rgba(255,100,0,0.3); padding: 15px; margin-bottom: 20px;">
              <h2 style="color: #ffcc00; font-size: 20px; margin-top: 0;">${eventData.title}</h2>
              <p style="margin: 5px 0;">Thank you for participating!</p>
            </div>
            
            ${eventData.kick_vod_url || eventData.youtube_vod_url ? `
            <div style="background: #080512; border: 2px solid #ff9900; padding: 20px; text-align: center; margin-bottom: 20px;">
              <h3 style="color: #00ffee; font-size: 16px; margin-top: 0;">WATCH REPLAY</h3>
              ${eventData.kick_vod_url ? `<p><a href="${eventData.kick_vod_url}" style="color: #ff9900; font-size: 18px; text-decoration: none;">🎥 Replay on Kick</a></p>` : ''}
              ${eventData.youtube_vod_url ? `<p><a href="${eventData.youtube_vod_url}" style="color: #ff9900; font-size: 18px; text-decoration: none;">📺 Replay on YouTube</a></p>` : ''}
            </div>
            ` : ''}
            
            <p style="font-size: 14px; color: #664422;">Check back soon for results and highlights! 🏆</p>
          </div>
        `;
      }
    } else if (liveUrlsChanged && eventData.status === 'live') {
      subject = `📺 Live Stream Links Updated: ${eventData.title}`;
      message = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #000; color: #ffe8c0; padding: 20px; border: 2px solid #ff5000;">
          <h1 style="color: #ff9900; font-size: 28px; margin: 0 0 20px 0;">Live Stream Available</h1>
          
          <div style="background: rgba(255,100,0,0.1); border: 1px solid rgba(255,100,0,0.3); padding: 15px; margin-bottom: 20px;">
            <h2 style="color: #ffcc00; font-size: 20px; margin-top: 0;">${eventData.title}</h2>
          </div>
          
          <div style="background: #080512; border: 2px solid #ff9900; padding: 20px; text-align: center; margin-bottom: 20px;">
            <h3 style="color: #00ffee; font-size: 16px; margin-top: 0;">WATCH NOW</h3>
            ${eventData.kick_live_url ? `<p><a href="${eventData.kick_live_url}" style="color: #ff9900; font-size: 18px; text-decoration: none;">🎥 Watch on Kick</a></p>` : ''}
            ${eventData.youtube_live_url ? `<p><a href="${eventData.youtube_live_url}" style="color: #ff9900; font-size: 18px; text-decoration: none;">📺 Watch on YouTube</a></p>` : ''}
          </div>
        </div>
      `;
    } else if (vodUrlsChanged && eventData.status === 'ended') {
      subject = `📹 Replay Available: ${eventData.title}`;
      message = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #000; color: #ffe8c0; padding: 20px; border: 2px solid #ff5000;">
          <h1 style="color: #ff9900; font-size: 28px; margin: 0 0 20px 0;">Event Replay Available</h1>
          
          <div style="background: rgba(255,100,0,0.1); border: 1px solid rgba(255,100,0,0.3); padding: 15px; margin-bottom: 20px;">
            <h2 style="color: #ffcc00; font-size: 20px; margin-top: 0;">${eventData.title}</h2>
          </div>
          
          <div style="background: #080512; border: 2px solid #ff9900; padding: 20px; text-align: center; margin-bottom: 20px;">
            <h3 style="color: #00ffee; font-size: 16px; margin-top: 0;">WATCH REPLAY</h3>
            ${eventData.kick_vod_url ? `<p><a href="${eventData.kick_vod_url}" style="color: #ff9900; font-size: 18px; text-decoration: none;">🎥 Replay on Kick</a></p>` : ''}
            ${eventData.youtube_vod_url ? `<p><a href="${eventData.youtube_vod_url}" style="color: #ff9900; font-size: 18px; text-decoration: none;">📺 Replay on YouTube</a></p>` : ''}
          </div>
        </div>
      `;
    } else if (detailsChanged) {
      subject = `📅 Event Details Updated: ${eventData.title}`;
      message = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #000; color: #ffe8c0; padding: 20px; border: 2px solid #ff5000;">
          <h1 style="color: #ff9900; font-size: 28px; margin: 0 0 20px 0;">Event Details Updated</h1>
          
          <div style="background: rgba(255,100,0,0.1); border: 1px solid rgba(255,100,0,0.3); padding: 15px; margin-bottom: 20px;">
            <h2 style="color: #ffcc00; font-size: 20px; margin-top: 0;">${eventData.title}</h2>
            <p style="margin: 5px 0;"><strong>Date:</strong> ${eventData.date}</p>
            <p style="margin: 5px 0;"><strong>Location:</strong> ${eventData.location}</p>
            ${eventData.description ? `<p style="margin: 5px 0;"><strong>Details:</strong> ${eventData.description}</p>` : ''}
          </div>
          
          <p style="font-size: 14px; color: #664422;">Please note the updated information. See you there! 🔥</p>
        </div>
      `;
    }

    // Send email notifications to all registered athletes
    const emailPromises = registrations.map(reg =>
      base44.asServiceRole.integrations.Core.SendEmail({
        to: reg.email,
        subject: subject,
        body: message
      }).catch(err => {
        console.error(`Failed to send email to ${reg.email}:`, err);
        return { error: err.message };
      })
    );

    await Promise.all(emailPromises);

    // Create in-app notifications
    const notificationPromises = registrations.map(reg =>
      base44.asServiceRole.entities.Notification.create({
        recipient_email: reg.email,
        title: subject,
        message: statusChanged 
          ? `Event "${eventData.title}" is now ${eventData.status}` 
          : `Event "${eventData.title}" has been updated`,
        type: 'event',
        link: `/#events`,
        priority: statusChanged && eventData.status === 'live' ? 'high' : 'medium'
      }).catch(err => {
        console.error(`Failed to create notification for ${reg.email}:`, err);
        return { error: err.message };
      })
    );

    await Promise.all(notificationPromises);

    return Response.json({ 
      success: true, 
      notified: registrations.length,
      changes: {
        statusChanged,
        liveUrlsChanged,
        vodUrlsChanged,
        detailsChanged
      }
    });

  } catch (error) {
    console.error('Notification error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});