# SDAthleteNFT — Deploy Guide

## Stack
- Solidity ^0.8.20
- OpenZeppelin 5.x
- Hardhat (deploy) + Polygon PoS

---

## 1. Installa dipendenze (una tantum)
```bash
npm install --save-dev hardhat @openzeppelin/contracts @openzeppelin/contracts-upgradeable
npx hardhat init  # scegli "TypeScript project"
```

---

## 2. Configura `hardhat.config.js`
```js
require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.20",
  networks: {
    polygon: {
      url: process.env.POLYGON_RPC,           // es: https://polygon-rpc.com
      accounts: [process.env.MINTING_PRIVATE_KEY],
    },
    polygonAmoy: {  // testnet
      url: "https://rpc-amoy.polygon.technology",
      accounts: [process.env.MINTING_PRIVATE_KEY],
    },
  },
};
```

---

## 3. Script deploy (`scripts/deploy.js`)
```js
const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  const NFT = await ethers.getContractFactory("SDAthleteNFT");
  const nft = await NFT.deploy(
    "https://metadata.streetdinamics.ae/nft/",  // base URI (IPFS o CDN)
    deployer.address,   // minter wallet (= MINTING_PRIVATE_KEY address)
    deployer.address,   // fee recipient (cambia con il tuo treasury wallet)
  );
  await nft.waitForDeployment();
  console.log("SDAthleteNFT deployed to:", await nft.getAddress());
}

main().catch(console.error);
```

```bash
# Testnet first
npx hardhat run scripts/deploy.js --network polygonAmoy

# Mainnet
npx hardhat run scripts/deploy.js --network polygon
```

---

## 4. Env vars da impostare

### Backend (Base44 → Settings → Environment Variables)
| Key | Value |
|-----|-------|
| `ATHLETE_TOKEN_ADDRESS` | indirizzo contratto deployato |
| `MINTING_PRIVATE_KEY`   | chiave privata wallet minter (no 0x prefix) |
| `POLYGON_RPC`           | URL RPC Polygon (es: Alchemy/QuickNode) |

### Frontend (Vite .env o Base44 config)
| Key | Value |
|-----|-------|
| `VITE_NFT_CONTRACT_POLYGON`      | indirizzo mainnet |
| `VITE_NFT_CONTRACT_POLYGON_AMOY` | indirizzo testnet |

---

## 5. Verifica contratto su Polygonscan
```bash
npx hardhat verify --network polygon <CONTRACT_ADDRESS> \
  "https://metadata.streetdinamics.ae/nft/" \
  <MINTER_ADDRESS> \
  <FEE_RECIPIENT_ADDRESS>
```

---

## 6. Flow completo post-deploy
1. Utente connette wallet (RainbowKit/wagmi)
2. Clicca "Mint NFT" → `Web3PurchaseModal` chiama `writeContract` → ERC-1155 `mint()`
3. Utente paga in MATIC, transazione confermata su Polygon
4. Frontend chiama backend `mintAthleteToken` → registra `NFTOwnership` nel DB
5. NFT appare nel wallet + nella dashboard fan

## 7. Last Man Standing (adminMint)
Per mintare il premio "Last Man Standing":
```js
// Dal backend (admin only)
await base44.functions.invoke('mintAthleteToken', {
  athleteTokenId: '<id_token_living_legend>',
  recipientAddress: winnerWalletAddress,
  recipientEmail: winnerEmail,
  amount: 1,
  adminFree: true,  // bypassa pagamento ETH, usa adminMint()
});
``