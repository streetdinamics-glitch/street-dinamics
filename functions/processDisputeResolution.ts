/**
 * Process Dispute Resolution
 * Execute payout based on dispute resolution decision
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { dispute_id, escrow_id, resolution, resolution_amount, initiator_email, respondent_email } = await req.json();

    if (!dispute_id || !escrow_id || !resolution) {
      return Response.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Fetch escrow
    const escrows = await base44.entities.EscrowAccount.filter({ id: escrow_id });
    const escrow = escrows[0];

    if (!escrow) {
      return Response.json({ error: 'Escrow not found' }, { status: 404 });
    }

    let initiatorAmount = 0;
    let respondentAmount = 0;

    // Calculate payout based on resolution
    switch (resolution) {
      case 'full_refund_buyer':
        // Full refund to buyer/athlete
        initiatorAmount = escrow.held_amount;
        respondentAmount = 0;
        break;

      case 'full_payment_seller':
        // Full payment to seller/brand (no refund)
        initiatorAmount = 0;
        respondentAmount = escrow.held_amount;
        break;

      case 'partial_refund':
        // Partial refund as specified
        initiatorAmount = resolution_amount;
        respondentAmount = escrow.held_amount - resolution_amount;
        break;

      case 'split_50_50':
        // Even split
        initiatorAmount = escrow.held_amount / 2;
        respondentAmount = escrow.held_amount / 2;
        break;

      case 'custom_split':
        // Custom amount
        initiatorAmount = resolution_amount;
        respondentAmount = escrow.held_amount - resolution_amount;
        break;

      case 'rejected':
        // Claim rejected - full payment to respondent
        initiatorAmount = 0;
        respondentAmount = escrow.held_amount;
        break;

      default:
        return Response.json({ error: 'Invalid resolution type' }, { status: 400 });
    }

    // Create payouts
    const payouts = [];

    if (initiatorAmount > 0) {
      const payout = await base44.entities.Payout.create({
        athlete_email: initiator_email,
        escrow_id,
        deal_id: escrow.deal_id,
        amount: initiatorAmount,
        currency: 'EUR',
        payout_method: 'braintree', // Default method
        status: 'pending',
        initiated_date: new Date().toISOString(),
      });
      payouts.push(payout);
    }

    if (respondentAmount > 0) {
      const payout = await base44.entities.Payout.create({
        athlete_email: respondent_email,
        escrow_id,
        deal_id: escrow.deal_id,
        amount: respondentAmount,
        currency: 'EUR',
        payout_method: 'braintree',
        status: 'pending',
        initiated_date: new Date().toISOString(),
      });
      payouts.push(payout);
    }

    // Update escrow status
    const updatedEscrow = await base44.entities.EscrowAccount.update(escrow_id, {
      status: 'released',
      released_amount: initiatorAmount + respondentAmount,
      held_amount: 0,
      dispute_status: 'resolved',
      updated_at: new Date().toISOString(),
    });

    return Response.json({
      success: true,
      dispute_id,
      payouts,
      escrow: updatedEscrow,
      initiatorAmount,
      respondentAmount,
    });
  } catch (error) {
    console.error('Dispute resolution error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});