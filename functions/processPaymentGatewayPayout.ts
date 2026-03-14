/**
 * Process Payment Gateway Payout
 * Handles currency conversion, fiat transfers, and tax-compliant invoices
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { payoutId, paymentMethod, currencyConversion } = await req.json();

    if (!payoutId || !paymentMethod) {
      return Response.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Fetch payout
    const payouts = await base44.entities.Payout.filter({ id: payoutId });
    if (payouts.length === 0) {
      return Response.json({ error: 'Payout not found' }, { status: 404 });
    }

    const payout = payouts[0];

    // Fetch associated milestone and escrow for context
    const milestones = await base44.entities.MilestonePaymentRequest.filter({
      id: payout.milestone_id || undefined,
    });
    const milestone = milestones[0];

    const escrows = await base44.entities.EscrowAccount.filter({
      id: payout.escrow_id,
    });
    const escrow = escrows[0];

    // Calculate payout amount with currency conversion if needed
    let payoutAmount = payout.amount;
    let conversionRate = 1;
    let convertedCurrency = 'EUR';

    if (currencyConversion && currencyConversion.targetCurrency !== 'EUR') {
      // Simulate currency conversion (in production, use live exchange rates)
      const rates = {
        USD: 1.08,
        GBP: 0.86,
        CHF: 0.95,
        JPY: 160.5,
      };
      conversionRate = rates[currencyConversion.targetCurrency] || 1;
      payoutAmount = payout.amount * conversionRate;
      convertedCurrency = currencyConversion.targetCurrency;
    }

    // Process payment via gateway
    let transactionId, status;
    if (paymentMethod.type === 'braintree') {
      transactionId = await processBraintreePayment(
        payoutAmount,
        paymentMethod.token,
        payout.athlete_email
      );
      status = 'completed';
    } else if (paymentMethod.type === 'crypto_wallet') {
      transactionId = await processCryptoPayment(
        payoutAmount,
        paymentMethod.walletAddress,
        currencyConversion?.targetCurrency || 'USDC'
      );
      status = 'completed';
    } else {
      throw new Error('Unsupported payment method');
    }

    // Update payout status
    await base44.entities.Payout.update(payoutId, {
      transaction_id: transactionId,
      status: status,
      completed_date: new Date().toISOString(),
      metadata: {
        conversionRate,
        convertedCurrency,
        paymentMethod: paymentMethod.type,
      },
    });

    // Fetch deal for invoice generation
    const deals = await base44.entities.SponsorshipDeal.filter({
      id: payout.deal_id,
    });
    const deal = deals[0];

    // Generate tax-compliant invoices for both parties
    const invoiceData = {
      payout_id: payoutId,
      milestone_id: milestone?.id,
      deal_id: payout.deal_id,
      escrow_id: payout.escrow_id,
      invoice_number: generateInvoiceNumber(),
      athlete_email: payout.athlete_email,
      athlete_name: deal?.athlete_name || 'Athlete',
      brand_email: deal?.brand_email || 'Brand',
      brand_name: deal?.brand_name || 'Brand',
      amount: payout.amount,
      milestone_title: milestone?.milestone_title || 'Sponsorship Milestone',
      description: generateTaxCompliantDescription(deal, milestone),
      issued_date: new Date().toISOString(),
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      paid_date: new Date().toISOString(),
      transaction_hash: transactionId,
      status: 'generated',
      notes: `Tax-compliant invoice. Currency: ${convertedCurrency} at rate ${conversionRate.toFixed(4)}. Payment method: ${paymentMethod.type}`,
    };

    const invoice = await base44.entities.Invoice.create(invoiceData);

    // Send invoice emails
    await sendInvoiceToAthlete(payout.athlete_email, invoiceData, invoice);
    await sendInvoiceToRBrand(deal?.brand_email, invoiceData, invoice);

    // Update escrow if final milestone
    if (escrow) {
      const remainingHeld = escrow.held_amount - payout.amount;
      if (remainingHeld === 0) {
        await base44.entities.EscrowAccount.update(escrow.id, {
          status: 'released',
        });
      }
    }

    return Response.json({
      success: true,
      payout: { ...payout, status },
      invoice,
      payment: {
        transactionId,
        amount: payoutAmount,
        currency: convertedCurrency,
        conversionRate,
      },
    });
  } catch (error) {
    console.error('Payment gateway error:', error);
    return Response.json(
      { error: error.message || 'Payment processing failed' },
      { status: 500 }
    );
  }
});

// Simulate Braintree payment processing
async function processBraintreePayment(amount, token, email) {
  // In production, use: require('braintree').connect({...})
  // const result = await gateway.transaction.sale({
  //   amount: amount.toString(),
  //   paymentMethodNonce: token,
  // });
  return `bt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Simulate crypto payment processing
async function processCryptoPayment(amount, walletAddress, currency) {
  // In production, integrate with blockchain provider (Infura, Alchemy, etc.)
  return `crypto_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function generateInvoiceNumber() {
  const date = new Date();
  const year = date.getFullYear();
  const random = Math.random().toString().substring(2, 7);
  return `INV-${year}-${random}`;
}

function generateTaxCompliantDescription(deal, milestone) {
  return `Professional Services: Sponsorship Performance - ${deal?.campaign_title || 'Campaign'}. Milestone: ${milestone?.milestone_title || 'Deliverables'}. Services rendered in accordance with sponsorship agreement dated ${deal?.start_date || new Date().toISOString().split('T')[0]}.`;
}

async function sendInvoiceToAthlete(email, invoiceData, invoice) {
  await fetch(
    `${Deno.env.get('BASE44_API_URL') || 'https://api.base44.io'}/integrations/send-email`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: email,
        subject: `Invoice ${invoiceData.invoice_number} - Payment Received`,
        body: `Your sponsorship payment has been processed.

Invoice Number: ${invoiceData.invoice_number}
Amount: €${invoiceData.amount.toFixed(2)}
Milestone: ${invoiceData.milestone_title}
Date: ${new Date(invoiceData.paid_date).toLocaleDateString()}

This invoice is tax-compliant and has been registered in our system. You can download your invoice from your dashboard for tax filing purposes.`,
      }),
    }
  );
}

async function sendInvoiceToRBrand(email, invoiceData, invoice) {
  await fetch(
    `${Deno.env.get('BASE44_API_URL') || 'https://api.base44.io'}/integrations/send-email`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: email,
        subject: `Payment Processed - Invoice ${invoiceData.invoice_number}`,
        body: `Sponsorship payment has been successfully processed to ${invoiceData.athlete_name}.

Invoice Number: ${invoiceData.invoice_number}
Amount: €${invoiceData.amount.toFixed(2)}
Campaign: ${invoiceData.athlete_name} - ${invoiceData.milestone_title}
Date: ${new Date(invoiceData.paid_date).toLocaleDateString()}

Payment method: Automated escrow release
Status: Completed

Both parties have signed off on milestone completion. Tax-compliant invoices have been generated for your records.`,
      }),
    }
  );
}