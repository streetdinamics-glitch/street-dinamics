/**
 * processNFTPurchase
 * Riceve la conferma di un acquisto crypto on-chain e sincronizza il database.
 * Crea NFTOwnership / TokenOwnership, aggiorna supply, awards Street Cred.
 *
 * Payload:
 *   item_type      "nft_card" | "athlete_token"
 *   item_id        ID dell'entità (NFTCollectionCard o AthleteToken)
 *   quantity       numero di item acquistati
 *   buyer_wallet   indirizzo wallet
 *   tx_hash        hash transazione on-chain
 *   payment_token  simbolo token usato (es. "USDC", "ETH")
 *   payment_chain  nome chain (es. "Polygon", "Ethereum")
 *   eur_equivalent importo EUR equivalente
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    const {
      item_type,
      item_id,
      quantity = 1,
      buyer_wallet,
      tx_hash,
      payment_token,
      payment_chain,
      eur_equivalent = 0,
    } = body;

    if (!item_type || !item_id || !buyer_wallet || !tx_hash) {
      return Response.json({ error: 'Missing required fields: item_type, item_id, buyer_wallet, tx_hash' }, { status: 400 });
    }

    // Resolve buyer user record (by wallet or email)
    let buyerEmail = buyer_wallet; // fallback: usa wallet come identificatore
    let buyerName  = buyer_wallet.slice(0, 8) + '…';

    // Try to find user by wallet address (if they've linked it)
    const users = await base44.asServiceRole.entities.User.filter({ wallet_address: buyer_wallet });
    if (users[0]) {
      buyerEmail = users[0].email;
      buyerName  = users[0].full_name || buyerEmail;
    }

    const now = new Date().toISOString();
    let result = {};

    // ── NFT CARD ─────────────────────────────────────────────────────────────
    if (item_type === 'nft_card') {
      const cards = await base44.asServiceRole.entities.NFTCollectionCard.filter({ id: item_id });
      const card = cards[0];
      if (!card) return Response.json({ error: 'NFTCollectionCard not found' }, { status: 404 });

      const currentMinted = card.minted_count || 0;
      if (currentMinted + quantity > card.total_supply) {
        return Response.json({ error: 'Insufficient supply', available: card.total_supply - currentMinted }, { status: 409 });
      }

      // Create ownership records
      const ownerships = [];
      for (let i = 0; i < quantity; i++) {
        const serial = currentMinted + i + 1;
        const ownership = await base44.asServiceRole.entities.NFTOwnership.create({
          nft_id:          card.id,
          athlete_name:    card.athlete_name,
          card_number:     card.card_number,
          serial_number:   serial,
          rarity:          card.rarity,
          purchase_price:  eur_equivalent / quantity,
          purchase_type:   'crypto_mint',
          minted_at:       now,
          buyer_email:     buyerEmail,
          tx_hash,
          payment_token,
          payment_chain,
        });
        ownerships.push(ownership);
      }

      // Update minted count
      const newMinted = currentMinted + quantity;
      await base44.asServiceRole.entities.NFTCollectionCard.update(card.id, {
        minted_count: newMinted,
        status: newMinted >= card.total_supply ? 'sold_out' : card.status,
      });

      result = { ownerships, minted: quantity };
    }

    // ── ATHLETE TOKEN ─────────────────────────────────────────────────────────
    else if (item_type === 'athlete_token') {
      const tokens = await base44.asServiceRole.entities.AthleteToken.filter({ id: item_id });
      const token = tokens[0];
      if (!token) return Response.json({ error: 'AthleteToken not found' }, { status: 404 });

      if ((token.available_supply || 0) < quantity) {
        return Response.json({ error: 'Insufficient supply', available: token.available_supply }, { status: 409 });
      }

      // Transaction record
      const txRecord = await base44.asServiceRole.entities.TokenTransaction.create({
        token_id:        token.id,
        buyer_email:     buyerEmail,
        seller_email:    'platform@streetdinamics.ae',
        transaction_type: 'primary_sale',
        quantity,
        price_per_token: eur_equivalent / quantity,
        total_amount:    eur_equivalent,
        payment_status:  'completed',
        payment_method:  `crypto:${payment_token}:${payment_chain}`,
        tx_hash,
        timestamp:       now,
      });

      // Ownership record
      await base44.asServiceRole.entities.TokenOwnership.create({
        athlete_name:   token.athlete_name,
        token_tier:     token.token_tier,
        rarity:         token.token_tier,
        purchase_price: eur_equivalent / quantity,
        purchase_date:  now.split('T')[0],
        user_email:     buyerEmail,
        quantity,
        tx_hash,
      });

      // Update supply
      await base44.asServiceRole.entities.AthleteToken.update(token.id, {
        available_supply: token.available_supply - quantity,
        status: token.available_supply - quantity <= 0 ? 'sold_out' : 'active',
      });

      // Update athlete fan count
      const stats = await base44.asServiceRole.entities.AthleteStats.filter({ athlete_email: token.athlete_email });
      if (stats[0]) {
        await base44.asServiceRole.entities.AthleteStats.update(stats[0].id, {
          fan_count: (stats[0].fan_count || 0) + quantity,
        });
      }

      result = { transaction: txRecord, quantity };
    } else {
      return Response.json({ error: `Unknown item_type: ${item_type}` }, { status: 400 });
    }

    // ── Award Street Cred ─────────────────────────────────────────────────────
    const scAction = item_type === 'nft_card' ? 'nft_purchase' : 'token_purchase';
    await base44.asServiceRole.functions.invoke('syncStreetCred', {
      user_email: buyerEmail,
      action:     scAction,
      value:      quantity,
    });

    // ── Notification ──────────────────────────────────────────────────────────
    const scPoints = item_type === 'nft_card' ? 200 * quantity : 150 * quantity;
    await base44.asServiceRole.entities.Notification.create({
      user_email: buyerEmail,
      type:       'reward',
      title:      `✅ Acquisto completato — ${payment_token} su ${payment_chain}`,
      message:    `+${scPoints} Street Cred guadagnati! TX: ${tx_hash.slice(0, 12)}…`,
      action_url: '/dashboard-fan',
      created_at: now,
    });

    return Response.json({
      success: true,
      item_type,
      item_id,
      quantity,
      buyer_wallet,
      payment_token,
      payment_chain,
      eur_equivalent,
      sc_awarded: scPoints,
      ...result,
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});