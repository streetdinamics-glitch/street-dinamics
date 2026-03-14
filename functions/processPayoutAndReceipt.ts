/**
 * Process Payout and Receipt Generation
 * Smart contract-like escrow release with automated receipt generation
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { milestoneRequestId, escrowId, dealId } = await req.json();

    if (!milestoneRequestId || !escrowId || !dealId) {
      return Response.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Fetch milestone request
    const milestoneRequests = await base44.entities.MilestonePaymentRequest.filter({
      id: milestoneRequestId,
    });

    if (milestoneRequests.length === 0) {
      return Response.json({ error: 'Milestone not found' }, { status: 404 });
    }

    const milestone = milestoneRequests[0];

    // Verify brand is approving
    if (milestone.brand_email !== user.email) {
      return Response.json(
        { error: 'Only brand can approve milestones' },
        { status: 403 }
      );
    }

    // Fetch escrow account
    const escrows = await base44.entities.EscrowAccount.filter({
      id: escrowId,
    });

    if (escrows.length === 0) {
      return Response.json({ error: 'Escrow not found' }, { status: 404 });
    }

    const escrow = escrows[0];

    // Fetch deal
    const deals = await base44.entities.SponsorshipDeal.filter({ id: dealId });
    if (deals.length === 0) {
      return Response.json({ error: 'Deal not found' }, { status: 404 });
    }

    const deal = deals[0];

    // Calculate available funds and verify escrow has sufficient balance
    const remainingEscrow = escrow.held_amount - milestone.milestone_amount;
    if (remainingEscrow < 0) {
      return Response.json(
        {
          error: `Insufficient escrow funds. Available: €${escrow.held_amount}, Requested: €${milestone.milestone_amount}`,
        },
        { status: 400 }
      );
    }

    // Create payout record
    const payout = await base44.entities.Payout.create({
      athlete_email: milestone.athlete_email,
      escrow_id: escrowId,
      deal_id: dealId,
      amount: milestone.milestone_amount,
      currency: 'EUR',
      payout_method: 'braintree',
      status: 'processing',
      initiated_date: new Date().toISOString(),
    });

    // Update milestone to mark as paid
    await base44.entities.MilestonePaymentRequest.update(milestone.id, {
      status: 'paid',
      approved_at: new Date().toISOString(),
      payout_id: payout.id,
    });

    // Update escrow account (release funds from hold)
    const newHeldAmount = escrow.held_amount - milestone.milestone_amount;
    const newReleasedAmount = escrow.released_amount + milestone.milestone_amount;

    await base44.entities.EscrowAccount.update(escrowId, {
      held_amount: newHeldAmount,
      released_amount: newReleasedAmount,
      status:
        newHeldAmount === 0 && newReleasedAmount === escrow.total_amount
          ? 'released'
          : escrow.status,
    });

    // Generate invoice
    const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.random()
      .toString()
      .substring(2, 7)}`;

    const invoice = await base44.entities.Invoice.create({
      payout_id: payout.id,
      milestone_id: milestone.id,
      deal_id: dealId,
      escrow_id: escrowId,
      invoice_number: invoiceNumber,
      athlete_email: milestone.athlete_email,
      athlete_name: deal.athlete_name,
      brand_email: milestone.brand_email,
      brand_name: deal.brand_name,
      amount: milestone.milestone_amount,
      milestone_title: milestone.milestone_title,
      description: `Milestone Completion: ${milestone.milestone_title} for ${deal.campaign_title}`,
      issued_date: new Date().toISOString(),
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      paid_date: new Date().toISOString(),
      transaction_hash: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'generated',
      notes: `Automatic payout for milestone approval. Escrow: ${escrowId}`,
    });

    // Send notification email to athlete
    await base44.integrations.Core.SendEmail({
      to: milestone.athlete_email,
      subject: `Payment Approved: €${milestone.milestone_amount} - ${milestone.milestone_title}`,
      body: `Your milestone "${milestone.milestone_title}" has been approved by ${deal.brand_name}.

Amount: €${milestone.milestone_amount}
Invoice: ${invoiceNumber}
Campaign: ${deal.campaign_title}

Your payment is now processing and will be transferred to your bank account within 1-2 business days.`,
    });

    // Send notification email to brand
    await base44.integrations.Core.SendEmail({
      to: milestone.brand_email,
      subject: `Milestone Approved: Payment Released - €${milestone.milestone_amount}`,
      body: `You have approved the milestone "${milestone.milestone_title}" for ${deal.athlete_name}.

Amount Released: €${milestone.milestone_amount}
Invoice: ${invoiceNumber}
Remaining Escrow: €${newHeldAmount}

The payment has been transferred to the athlete's bank account.`,
    });

    return Response.json({
      success: true,
      payout: payout,
      invoice: invoice,
      escrowUpdate: {
        held_amount: newHeldAmount,
        released_amount: newReleasedAmount,
      },
    });
  } catch (error) {
    console.error('Payout processing error:', error);
    return Response.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
});