/**
 * fetchKalshiMarkets
 * Fetches active markets from Kalshi's public REST API.
 * Kalshi API v2 — no auth required for public market reads.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const KALSHI_BASE = 'https://trading-api.kalshi.com/trade-api/v2';

const SPORT_KEYWORDS = [
  'sport', 'fight', 'mma', 'boxing', 'skate', 'dance', 'battle', 'champion',
  'match', 'tournament', 'athlete', 'football', 'soccer', 'basketball', 'tennis',
  'olympic', 'street', 'freestyle', 'race', 'basketball', 'baseball', 'hockey',
  'golf', 'cricket', 'rugby', 'formula', 'nfl', 'nba', 'mlb', 'nhl',
];

function isSportRelated(title = '', category = '') {
  const combined = (title + ' ' + category).toLowerCase();
  return SPORT_KEYWORDS.some(kw => combined.includes(kw));
}

function formatVolume(val) {
  const n = parseFloat(val) || 0;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { search = '', limit = 15, category = 'sports' } = body;

    const params = new URLSearchParams({
      limit: String(Math.min(limit * 4, 100)),
      status: 'open',
    });
    if (category) params.set('category', category);

    const res = await fetch(`${KALSHI_BASE}/markets?${params}`, {
      headers: { 'Accept': 'application/json' },
    });

    if (!res.ok) {
      // Kalshi may 403 from certain IPs; return graceful empty
      return Response.json({ markets: [], total: 0, source: 'kalshi', error: `Kalshi API: ${res.status}` });
    }

    const data = await res.json();
    const allMarkets = data.markets || [];

    const filtered = search
      ? allMarkets.filter(m => (m.title || '').toLowerCase().includes(search.toLowerCase()))
      : allMarkets.filter(m => isSportRelated(m.title, m.category));

    const markets = filtered.slice(0, limit).map(m => {
      // yes_bid / no_bid are in cents (0–99)
      const yesBid  = (m.yes_bid  ?? 50) / 100;
      const noBid   = (m.no_bid   ?? 50) / 100;
      return {
        id: m.ticker,
        ticker: m.ticker,
        question: m.title || m.ticker,
        category: m.category || 'sports',
        volume: m.volume || 0,
        volumeFormatted: formatVolume(m.volume || 0),
        liquidity: m.liquidity || 0,
        outcomes: [
          { label: 'Yes', price: yesBid,  prob: Math.round(yesBid  * 100) },
          { label: 'No',  price: noBid,   prob: Math.round(noBid   * 100) },
        ],
        closeTime: m.close_time,
        url: `https://kalshi.com/markets/${m.ticker}`,
        active: m.status === 'open',
      };
    });

    return Response.json({
      markets,
      total: filtered.length,
      hasMore: filtered.length > limit,
      source: 'kalshi',
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});