# Street Dinamics — Web3 Wagering Architecture

## Folder Structure

```
contracts/
├── AthleteWager.sol          # Pillar I  — P2P escrow (ERC-1155 gated)
├── SDPredictionMarket.sol    # Pillar II — AMM binary prediction market
└── ARCHITECTURE.md           # This file

components/
├── wagering/
│   ├── SD3PillarsHub.jsx     # Master hub (replaces BetSection/EthicBettingPanel)
│   ├── WageringHub.jsx       # Pillar I container (lists live matches)
│   ├── WagerCard.jsx         # Per-match P2P wager card + contract calls
│   └── AthleteTokenEconomy.jsx # Pillar III — tier display + champion cards
└── prediction/
    ├── PredictionMarketPanel.jsx  # Pillar II — unified source toggle
    ├── NativePredictionMarket.jsx # Option A — on-chain AMM markets
    └── ExternalMarketsFeed.jsx    # Option B — Polymarket / Kalshi signals
```

---

## Pillar I — AthleteWager.sol

### Flow
1. User A holds `athleteTokenIdA` (ERC-1155 from AthleteNFT contract)
2. User A calls `createWager(matchId, tokenIdA, tokenIdB, amount)` → $SD locked in escrow
3. User B (holds tokenIdB) calls `acceptWager(wagerId)` → User B's $SD locked
4. Oracle (result-oracle wallet) calls `resolveWager(wagerId, outcome)` after tournament result
5. Winner receives pot × 97.5%; platform receives 2.5% fee
6. Edge cases: `Outcome.Draw` / `Outcome.Cancelled` → full pro-rata refund

### Deployment (Hardhat)
```bash
npx hardhat run scripts/deploy-wager.js --network polygon
# Set oracle post-deploy:
await contract.setOracle("0xYourOracleAddress")
```

### Proxy Pattern
Uses OpenZeppelin `TransparentUpgradeableProxy`. Deploy:
1. Deploy implementation: `AthleteWager`
2. Deploy `ProxyAdmin`
3. Deploy `TransparentUpgradeableProxy(impl, admin, initData)`

---

## Pillar II — SDPredictionMarket.sol

### AMM Model (Constant Product)
- YES and NO pools seeded by admin at market creation
- Share price = `amount × otherPool / (thisPool + amount)` (low gas, no order book)
- 1.5% fee on each purchase
- Oracle resolves → winners redeem proportional share of total pool

### External Integrations
| Provider   | Mode         | API                                      |
|------------|--------------|------------------------------------------|
| Polymarket | Reference    | `https://gamma-api.polymarket.com`       |
| Kalshi     | Reference    | `https://trading-api.kalshi.com/v2`      |
| Both       | Embed widget | Replace mock data in ExternalMarketsFeed |

To enable live data:
```js
// ExternalMarketsFeed.jsx — replace MOCK_POLYMARKET with:
const { data } = useQuery({
  queryKey: ['polymarket-feed'],
  queryFn: () => fetch('https://gamma-api.polymarket.com/markets?active=true&limit=10').then(r => r.json()),
  refetchInterval: 60000,
});
```

---

## Pillar III — Card Economy

### Rarity Tiers (ERC-1155 token IDs)
| Tier               | Token ID Range | Wager Access | Multiplier |
|--------------------|---------------|--------------|------------|
| Rising Star        | 1–999         | ✓            | 1×         |
| Breakout Talent    | 1000–1999     | ✓            | 1.5×       |
| Elite Performer    | 2000–2999     | ✓            | 2×         |
| Living Legend      | 3000–3999     | ✓            | 3×         |

### Champion Flag
After each tournament cycle, the oracle calls a write on the metadata
contract (or updates Supabase off-chain record) setting `isChampion: true`
for the title-holder's card. This gates Window Challenge access.

---

## Environment Variables Required

```env
POLYGON_RPC_URL=https://polygon-rpc.com
ORACLE_WALLET=0xYourOracleWallet
SD_TOKEN_ADDRESS=0xYourSDToken
ATHLETE_NFT_ADDRESS=0xYourAthleteNFT
WAGER_CONTRACT_ADDRESS=0xDeployedAthleteWager
PREDICTION_MARKET_ADDRESS=0xDeployedSDPredictionMarket
```

Update `components/web3/web3Config.js` → `CONTRACT_ADDRESSES` after deployment.