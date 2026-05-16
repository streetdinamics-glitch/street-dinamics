import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { data: newEvent } = body;

    if (!newEvent?.sport || !newEvent?.title) {
      return Response.json({ skipped: true, reason: 'no sport or title' });
    }

    const sport = newEvent.sport.toLowerCase();

    // Find all athlete registrations with this sport
    const allRegistrations = await base44.asServiceRole.entities.Registration.filter({ type: 'athlete' });

    // Unique athlete emails who registered for this sport
    const matchingEmails = [...new Set(
      allRegistrations
        .filter(r => r.sport && r.sport.toLowerCase().includes(sport))
        .map(r => r.email)
        .filter(Boolean)
    )];

    if (matchingEmails.length === 0) {
      return Response.json({ skipped: true, reason: 'no matching athletes', sport });
    }

    // Create in-app notifications for each matched athlete
    await Promise.all(matchingEmails.map(email =>
      base44.asServiceRole.entities.Notification.create({
        user_email: email,
        type: 'event',
        title: `🏆 Nuovo Evento: ${newEvent.sport}`,
        message: `"${newEvent.title}" è disponibile${newEvent.location ? ` a ${newEvent.location}` : ''}${newEvent.date ? ` · ${newEvent.date}` : ''}. Registrati ora!`,
        related_entity_id: newEvent.id,
        related_entity_type: 'Event',
        action_url: '/Home',
        created_at: new Date().toISOString(),
      })
    ));

    return Response.json({ success: true, notified: matchingEmails.length, sport });
  } catch (error) {
    console.error('[notifyNewCompatibleEvent]', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});