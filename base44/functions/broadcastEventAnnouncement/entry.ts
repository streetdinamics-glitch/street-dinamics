import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

/**
 * Broadcast an announcement to all users in a live event chat
 * Called by admins to send important announcements, updates, or Q&A responses
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admins can broadcast
    if (user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { event_id, message, message_type = 'announcement' } = await req.json();

    if (!event_id || !message) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create announcement in chat
    const announcement = await base44.entities.ChatMessage.create({
      event_id,
      user_email: user.email,
      user_name: 'Event Admin',
      user_role: 'admin',
      message,
      message_type,
      timestamp: new Date().toISOString()
    });

    // Get all active chat participants for the event
    const messages = await base44.entities.ChatMessage.filter(
      { event_id },
      '-timestamp',
      1000
    );

    const uniqueEmails = [...new Set(messages.map(m => m.user_email))];

    // Send notifications to participants
    for (const email of uniqueEmails) {
      try {
        await base44.integrations.Core.SendEmail({
          to: email,
          subject: `Live Event Update: ${message_type}`,
          body: `
            <h2>Event Announcement</h2>
            <p>${message}</p>
            <p>Join the live chat to ask questions and get real-time updates!</p>
          `
        });
      } catch (err) {
        console.error(`Failed to notify ${email}:`, err.message);
      }
    }

    return Response.json({
      success: true,
      announcement_id: announcement.id,
      participants_notified: uniqueEmails.length
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});