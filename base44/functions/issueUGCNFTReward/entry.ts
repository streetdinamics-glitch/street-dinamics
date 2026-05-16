import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Called when a UGCSubmission is approved (entity automation on update)
// Checks if approved=true and reward_issued=false, then mints the NFT reward

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { data: sub, event } = body;

    // Guard: only act on update events where approved just became true
    if (event?.type !== 'update') {
      return Response.json({ skipped: 'not an update event' });
    }
    if (!sub?.approved || sub?.reward_issued || sub?.reward_type !== 'nft_card') {
      return Response.json({ skipped: 'no nft reward needed', approved: sub?.approved, issued: sub?.reward_issued });
    }

    const rarity = sub.reward_nft_rarity || 'rising_star';
    const raritySerialBase = { rising_star: 1000, breakout_talent: 500, elite_performer: 100, living_legend: 20 };

    // Count existing NFTs of this rarity to generate serial
    const existing = await base44.asServiceRole.entities.NFTOwnership.filter({ rarity });
    const serialNumber = (raritySerialBase[rarity] || 1000) + existing.length + 1;

    // Create NFT ownership record for the creator
    const nftOwnership = await base44.asServiceRole.entities.NFTOwnership.create({
      nft_id: sub.id, // reference to UGC submission
      athlete_name: sub.athlete_name || 'Street Dinamics',
      card_number: serialNumber,
      serial_number: serialNumber,
      rarity: rarity,
      purchase_price: 0,
      purchase_type: 'ugc_reward',
      minted_at: new Date().toISOString(),
      buyer_email: sub.creator_email,
    });

    // Mark reward as issued
    await base44.asServiceRole.entities.UGCSubmission.update(sub.id, {
      reward_issued: true,
      reward_nft_id: nftOwnership.id,
    });

    // Notify fan
    await base44.asServiceRole.entities.Notification.create({
      user_email: sub.creator_email,
      type: 'reward',
      title: `🎴 NFT Card Sbloccata!`,
      message: `Il tuo contenuto "${sub.title}" è stato approvato! Hai ricevuto una NFT card ${rarity.replace('_', ' ')} di ${sub.athlete_name || 'Street Dinamics'}.`,
      related_entity_id: nftOwnership.id,
      related_entity_type: 'NFTOwnership',
      is_read: false,
      created_at: new Date().toISOString(),
    });

    // Update fan status
    await base44.asServiceRole.functions.invoke('updateFanStatus', { userEmail: sub.creator_email });

    console.log(`[issueUGCNFTReward] Issued ${rarity} NFT to ${sub.creator_email}`);
    return Response.json({ success: true, nftId: nftOwnership.id, rarity, recipient: sub.creator_email });
  } catch (error) {
    console.error('[issueUGCNFTReward]', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});