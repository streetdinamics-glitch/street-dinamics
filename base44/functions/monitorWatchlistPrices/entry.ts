import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Get all watchlist items
    const watchlistItems = await base44.asServiceRole.entities.Watchlist.list('-added_at', 1000);

    if (!watchlistItems || watchlistItems.length === 0) {
      return Response.json({ processed: 0, notificationsSent: 0 });
    }

    let notificationsSent = 0;

    // Monitor each watchlist item
    for (const item of watchlistItems) {
      try {
        let currentPrice = item.baseline_price;
        let priceChangePercent = 0;

        // Update current price based on asset type
        if (item.asset_type === 'nft_drop') {
          const nftCard = await base44.asServiceRole.entities.NFTCollectionCard.filter(
            { id: item.asset_id }
          );
          if (nftCard[0]) {
            currentPrice = nftCard[0].mint_price;
          }
        } else if (item.asset_type === 'athlete') {
          // For athletes, check token price if available
          const tokens = await base44.asServiceRole.entities.TokenOwnership.filter(
            { athlete_name: item.asset_name }
          );
          if (tokens[0]) {
            currentPrice = tokens[0].purchase_price || item.baseline_price;
          }
        }

        // Calculate price change
        priceChangePercent = ((currentPrice - item.baseline_price) / item.baseline_price) * 100;

        // Update watchlist item with current price
        await base44.asServiceRole.entities.Watchlist.update(item.id, {
          current_price: currentPrice,
          price_change_percent: priceChangePercent,
        });

        // Check if notification should be sent
        const shouldNotify =
          item.notify_price_drop &&
          priceChangePercent <= (item.notify_threshold_percent || -10) &&
          (!item.last_notification_at ||
            new Date() - new Date(item.last_notification_at) > 24 * 60 * 60 * 1000);

        if (shouldNotify) {
          // Create notification
          await base44.asServiceRole.entities.Notification.create({
            user_email: item.user_email,
            type: 'watchlist_price_drop',
            title: `Price Drop Alert: ${item.asset_name}`,
            message: `${item.asset_name} dropped ${Math.abs(priceChangePercent).toFixed(1)}% to €${currentPrice.toFixed(2)}`,
            asset_type: item.asset_type,
            asset_id: item.asset_id,
            read: false,
            created_at: new Date().toISOString(),
          });

          // Update last notification time
          await base44.asServiceRole.entities.Watchlist.update(item.id, {
            last_notification_at: new Date().toISOString(),
          });

          notificationsSent++;
        }
      } catch (err) {
        console.log(`Error processing watchlist item ${item.id}: ${err.message}`);
      }
    }

    return Response.json({
      processed: watchlistItems.length,
      notificationsSent,
    });
  } catch (error) {
    console.error('Watchlist monitoring error:', error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
});