import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    const { event, data, old_data } = body;

    // Only act on status changes to confirmed or rejected
    if (!data || !old_data) return Response.json({ skipped: true });
    if (data.status === old_data.status) return Response.json({ skipped: true });
    if (!['confirmed', 'rejected'].includes(data.status)) return Response.json({ skipped: true });

    const isConfirmed = data.status === 'confirmed';

    // Fetch event details for the WhatsApp channel link
    let eventRecord = null;
    if (data.event_id) {
      try {
        const events = await base44.asServiceRole.entities.Event.filter({ id: data.event_id });
        eventRecord = events?.[0] || null;
      } catch {}
    }

    // Send notification in-app
    await base44.asServiceRole.entities.Notification.create({
      user_email: data.email,
      type: 'event',
      title: isConfirmed ? '✅ Registrazione Confermata!' : '❌ Registrazione Rifiutata',
      message: isConfirmed
        ? `La tua registrazione per l'evento è stata confermata! ${eventRecord?.whatsapp_channel_link ? 'Unisciti al canale WhatsApp ufficiale per aggiornamenti.' : ''}`
        : 'La tua registrazione non è stata approvata. Puoi riapplicare con la documentazione corretta.',
      related_entity_id: data.event_id,
      related_entity_type: 'Event',
      created_at: new Date().toISOString(),
    });

    // Send email notification
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: data.email,
      subject: isConfirmed
        ? '✅ Street Dinamics — Registrazione Confermata!'
        : '❌ Street Dinamics — Registrazione non approvata',
      body: isConfirmed
        ? `Ciao ${data.first_name}!

La tua registrazione all'evento Street Dinamics è stata CONFERMATA ✅

${eventRecord?.whatsapp_channel_link
  ? `👉 Unisciti al canale WhatsApp ufficiale: ${eventRecord.whatsapp_channel_link}`
  : ''}

Ricorda di portare la tua attrezzatura e il QR code del ticket.

A presto,
Street Dinamics Team 🔥`
        : `Ciao ${data.first_name},

Purtroppo la tua registrazione non è stata approvata.

Motivo: documentazione insufficiente o verifica non completata.
Puoi ripresentare la candidatura con la documentazione corretta.

Street Dinamics Team`,
    });

    return Response.json({ success: true, email: data.email, status: data.status });
  } catch (error) {
    console.error('[notifyRegistrationStatusChange]', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});