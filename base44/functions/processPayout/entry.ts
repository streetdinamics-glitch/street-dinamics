/**
 * Process Payout Function
 * Handles payout requests via Braintree or crypto wallet
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const BRAINTREE_API_KEY = Deno.env.get('BRAINTREE_API_KEY');
const BRAINTREE_MERCHANT_ID = Deno.env.get('BRAINTREE_MERCHANT_ID');
const CRYPTO_API_KEY = Deno.env.get('CRYPTO_API_KEY');

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { payoutId, method, amount } = await req.json();

    // Fetch the payout record
    const payouts = await base44.entities.Payout.filter({ id: payoutId });
    if (!payouts.length || payouts[0].athlete_email !== user.email) {
      return Response.json({ error: 'Payout not found' }, { status: 404 });
    }

    const payout = payouts[0];

    // Fetch payment method details
    const methods = await base44.entities.PayoutMethod.filter({
      athlete_email: user.email,
      method_type: method,
    });

    if (!methods.length) {
      return Response.json({ error: 'Payment method not found' }, { status: 400 });
    }

    const paymentMethod = methods[0];

    // Update payout status to processing
    await base44.entities.Payout.update(payoutId, {
      status: 'processing',
    });

    let result;

    if (method === 'braintree') {
      result = await processBraintreePayout(payout, paymentMethod);
    } else if (method === 'crypto_wallet') {
      result = await processCryptoPayout(payout, paymentMethod);
    } else {
      throw new Error('Unknown payout method');
    }

    // Update payout with success
    await base44.entities.Payout.update(payoutId, {
      status: 'completed',
      transaction_id: result.transactionId,
      completed_date: new Date().toISOString(),
      metadata: result.metadata,
    });

    // Update escrow account
    if (payout.escrow_id) {
      const escrows = await base44.entities.EscrowAccount.filter({ id: payout.escrow_id });
      if (escrows.length) {
        const escrow = escrows[0];
        await base44.entities.EscrowAccount.update(payout.escrow_id, {
          held_amount: Math.max(0, escrow.held_amount - amount),
          released_amount: escrow.released_amount + amount,
        });
      }
    }

    return Response.json({
      success: true,
      transactionId: result.transactionId,
      message: `Payout of €${amount} processed successfully`,
    });
  } catch (error) {
    console.error('Payout error:', error);

    const { payoutId } = await req.json().catch(() => ({}));
    if (payoutId) {
      const base44 = createClientFromRequest(req);
      await base44.entities.Payout.update(payoutId, {
        status: 'failed',
        error_message: error.message,
      });
    }

    return Response.json(
      { error: error.message || 'Payout processing failed' },
      { status: 500 }
    );
  }
});

async function processBraintreePayout(payout, paymentMethod) {
  // Mock Braintree payout implementation
  // In production, integrate actual Braintree SDK

  if (!BRAINTREE_API_KEY || !BRAINTREE_MERCHANT_ID) {
    throw new Error('Braintree credentials not configured');
  }

  // Simulate payout processing
  const transactionId = `BT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  return {
    transactionId,
    metadata: {
      method: 'braintree',
      accountLast4: paymentMethod.bank_account_last_four,
      bank: paymentMethod.bank_name,
      processedAt: new Date().toISOString(),
    },
  };
}

async function processCryptoPayout(payout, paymentMethod) {
  // Mock crypto payout implementation
  // In production, integrate with actual blockchain/wallet API

  if (!CRYPTO_API_KEY) {
    throw new Error('Crypto API not configured');
  }

  // Validate wallet address format
  const walletAddress = paymentMethod.crypto_wallet_address;
  if (!walletAddress || walletAddress.length < 20) {
    throw new Error('Invalid wallet address');
  }

  // Simulate crypto transaction
  const transactionHash = `0x${Array(64)
    .fill(0)
    .map(() => Math.floor(Math.random() * 16).toString(16))
    .join('')}`;

  return {
    transactionId: transactionHash,
    metadata: {
      method: 'crypto',
      wallet: walletAddress.slice(0, 6) + '...' + walletAddress.slice(-4),
      cryptoType: paymentMethod.crypto_type,
      transactionHash,
      networkFee: (payout.amount * 0.001).toFixed(2),
      processedAt: new Date().toISOString(),
    },
  };
}