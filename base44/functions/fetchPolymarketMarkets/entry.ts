import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Polymarket CLOB API – public endpoints, no auth required for reads
const CLOB_BASE = 'https://clob.polymarket.com';
const GAMMA_BASE = 'https://gamma-api.polymarket.com';

// Sport keywords to filter relevant markets
const SPORT_KEYWORDS = [
  'fight', 'mma', 'boxing', 'skate', 'skateboard', 'dance', 'battle',
  'sport', 'champion', 'match', 'tournament', 'athlete', 'football',
  'soccer', 'basketball', 'tennis', 'combat', 'freestyle', 'race',
  'olympic', 'street', 'underground', 'rap', 'breakdance'
];

function isSportRelated(question = '') {
  const q = question.toLowerCase();
  return SPORT_KEYWORDS.some(kw => q.includes(kw));
}

function buildMarketUrl(conditionId) {
  return `https://polymarket.com/event/${conditionId}`;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { search = '', limit = 20, offset = 0 } = body;

    // Fetch active markets from Gamma API (metadata-rich)
    const params = new URLSearchParams({
      active: 'true',
      closed: 'false',
      limit: String(Math.min(limit * 5, 200)), // over-fetch then filter
      offset: String(offset),
    });
    if (search) params.set('q', search);

    const gammaRes = await fetch(`${GAMMA_BASE}/markets?${params}`, {
      headers: { 'Accept': 'application/json' },
    });

    if (!gammaRes.ok) {
      throw new Error(`Gamma API error: ${gammaRes.status}`);
    }

    const gammaData = await gammaRes.json();
    const allMarkets = Array.isArray(gammaData) ? gammaData : (gammaData.markets || []);

    // Filter to sport-related markets
    const filtered = search
      ? allMarkets
      : allMarkets.filter(m => isSportRelated(m.question || m.title || ''));

    // Normalize and enrich each market
    const markets = filtered.slice(0, limit).map(m => {
      const outcomes = m.outcomes ? (typeof m.outcomes === 'string' ? JSON.parse(m.outcomes) : m.outcomes) : ['Yes', 'No'];
      const prices = m.outcomePrices ? (typeof m.outcomePrices === 'string' ? JSON.parse(m.outcomePrices) : m.outcomePrices) : [];

      const parsedOutcomes = outcomes.map((label, i) => ({
        label,
        price: parseFloat(prices[i] || 0.5),
        prob: Math.round(parseFloat(prices[i] || 0.5) * 100),
      }));

      return {
        id: m.id || m.conditionId,
        conditionId: m.conditionId,
        question: m.question || m.title || 'Unknown market',
        description: m.description || '',
        category: m.category || 'sports',
        volume: m.volume || m.volumeNum || 0,
        volumeFormatted: formatVolume(m.volume || m.volumeNum || 0),
        liquidity: m.liquidity || m.liquidityNum || 0,
        liquidityFormatted: formatVolume(m.liquidity || m.liquidityNum || 0),
        outcomes: parsedOutcomes,
        startDate: m.startDate,
        endDate: m.endDate,
        image: m.image,
        icon: m.icon,
        active: m.active !== false,
        closed: !!m.closed,
        url: buildMarketUrl(m.conditionId || m.id),
        slug: m.slug,
      };
    });

    // Fetch trending markets separately for the featured section
    let trending = [];
    try {
      const trendRes = await fetch(`${GAMMA_BASE}/markets?active=true&closed=false&order=volume&ascending=false&limit=5`, {
        headers: { 'Accept': 'application/json' },
      });
      if (trendRes.ok) {
        const td = await trendRes.json();
        const tArr = Array.isArray(td) ? td : (td.markets || []);
        trending = tArr.slice(0, 5).map(m => {
          const outcomes = m.outcomes ? (typeof m.outcomes === 'string' ? JSON.parse(m.outcomes) : m.outcomes) : ['Yes', 'No'];
          const prices = m.outcomePrices ? (typeof m.outcomePrices === 'string' ? JSON.parse(m.outcomePrices) : m.outcomePrices) : [];
          return {
            id: m.id || m.conditionId,
            conditionId: m.conditionId,
            question: m.question || m.title,
            volume: m.volume || 0,
            volumeFormatted: formatVolume(m.volume || 0),
            outcomes: outcomes.map((label, i) => ({
              label,
              price: parseFloat(prices[i] || 0.5),
              prob: Math.round(parseFloat(prices[i] || 0.5) * 100),
            })),
            url: buildMarketUrl(m.conditionId || m.id),
            image: m.image,
          };
        });
      }
    } catch (_) { /* trending is optional */ }

    return Response.json({
      markets,
      trending,
      total: filtered.length,
      hasMore: filtered.length > limit,
      source: 'polymarket_clob',
      fetchedAt: new Date().toISOString(),
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function formatVolume(val) {
  const n = parseFloat(val) || 0;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}