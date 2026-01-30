# Stablecoin Network Support Plan (USDC/USDT)

**Goal**
Support the following networks for stablecoins:

- **USDC:** Ethereum, Solana, Polygon, Arbitrum, Base, BNB Smart Chain
- **USDT:** Ethereum, Tron, Solana, Polygon, Arbitrum, Base, BNB Smart Chain

This document outlines what needs to be adjusted or implemented for production readiness.

---

## 1) Network Categories: EVM vs Non‑EVM

### EVM Networks (shared EOA address)

- **Ethereum, Polygon, Arbitrum, Base, BNB Smart Chain (BSC)**
- Wallets are **EOA** and compatible with `viem`
- A **single EOA per user** can be reused across these chains
- Use same private key, same address format (0x...)

### Non‑EVM Networks (unique wallets)

- **Solana** (SPL tokens)
  - Uses **Ed25519** cryptography
  - Address format: **base58** encoded (32-byte public key)
  - Token standard: **SPL Token Program**
  - Requires **@solana/web3.js** SDK
- **Tron** (TRC‑20 tokens)
  - Uses **secp256k1** (like Ethereum) but different address encoding
  - Address format: **base58check** starting with 'T' (mainnet)
  - Token standard: **TRC-20** (similar to ERC-20 but incompatible)
  - Requires **TronWeb** SDK

- Cannot reuse an EVM address for these chains
- Require separate private keys and wallet generation

---

## 2) Current Behavior in the Codebase (Baseline)

- **One EOA wallet per user** is already enforced and reused across networks.
- **Stablecoin wallets** are stored per token + blockchain + network but **share the same EOA address** for EVM chains.
- Balance and token reads use **EVM‑only** logic (`viem`).
- **Currently active networks:**
  - ✅ **USDT:** Polygon mainnet, Arbitrum mainnet (Base mainnet disabled)
  - ✅ **USDC:** Polygon mainnet, Arbitrum mainnet, Base mainnet
  - 📝 Testnets exist but are disabled by default
- **Admin dashboard** at https://myadmin.raverpay.com/dashboard/alchemy/network-config provides enable/disable controls without code deployments.

---

## 3) Required Changes (High‑Level)

### A) Configuration & Environment

- Add **RPC URLs** for Ethereum mainnet, Solana mainnet, Tron mainnet.
- Extend config to include **Ethereum, Solana, Tron** as supported blockchains.
- Ensure network validation recognizes the new chains.
- Add chain IDs for EVM networks.

### B) Network Registry (DB: `alchemyNetworkConfig`)

- Add entries for **USDC** and **USDT** on each supported chain.
- Store:
  - `tokenType`, `tokenName`, `tokenSymbol`
  - `blockchain`, `blockchainName`
  - `network`, `networkLabel`
  - `tokenAddress` (contract address or mint address)
  - `decimals`
  - `isEnabled`, `isTestnet`, `displayOrder`
  - **NEW:** `blockchainType` enum ('EVM', 'SOLANA', 'TRON')
  - **NEW:** `iconUrl` - Cloudinary URL for blockchain logo (e.g., `https://res.cloudinary.com/{cloud}/image/upload/v1/blockchain/eth-mainnet.svg`)

### C) Wallet Strategy

- **EVM chains:** keep single EOA wallet per user.
- **Solana/Tron:** introduce **distinct wallet types** with separate key pairs.
- **Recommended approach:** Extend `alchemyWallet` table with blockchain type discrimination.
- All wallets must have proper encryption at rest.

### D) Balance and Receive Logic

- **EVM:** extend chain ID mapping to include Ethereum mainnet.
- **Solana:** implement SPL token balance checks via Solana RPC.
- **Tron:** implement TRC-20 balance checks via Tron API/RPC.
- Ensure receive address rendering depends on blockchain type.

### E) API Responses and UI

- **EVM networks:** same address, different network labels.
- **Solana/Tron:** different addresses; must display chain‑specific address and QR.
- API should clearly indicate blockchain type in responses.

---

## 4) Detailed Task List

### 4.0 Blockchain Images & Assets

**Current Image Assets Location:**
`/Users/joseph/Desktop/raverpay/assets/blockchain/`

**Expected Image Files Needed:**

```
assets/blockchain/arb-mainnet.svg          ✅ (already exists)
assets/blockchain/arb-testnet.svg          ✅ (already exists)
assets/blockchain/base-mainnet.svg         ✅ (already exists)
assets/blockchain/base-testnet.svg         (need to add)
assets/blockchain/polygon-mainnet.svg      ✅ (already exists)
assets/blockchain/polygon-testnet.svg      ✅ (already exists)
assets/blockchain/eth-mainnet.svg          (need to add)
assets/blockchain/eth-testnet.svg          (need to add)
assets/blockchain/bsc-mainnet.svg          (need to add)
assets/blockchain/bsc-testnet.svg          (need to add)
assets/blockchain/solana-mainnet.svg       (need to add)
assets/blockchain/solana-testnet.svg       (need to add)
assets/blockchain/tron-mainnet.svg         (need to add)
assets/blockchain/tron-testnet.svg         (need to add)
```

**Image Upload & Database Seeding Strategy:**

1. **Upload to Cloudinary:**

   ```bash
   # Upload all blockchain images to Cloudinary
   # Recommended folder structure: /blockchain/
   # Naming convention: {blockchain}-{network}.svg

   # Example Cloudinary URLs after upload:
   https://res.cloudinary.com/{your-cloud}/image/upload/v1/blockchain/eth-mainnet.svg
   https://res.cloudinary.com/{your-cloud}/image/upload/v1/blockchain/solana-mainnet.svg
   https://res.cloudinary.com/{your-cloud}/image/upload/v1/blockchain/tron-mainnet.svg
   ```

2. **Add `iconUrl` column to database:**

   ```sql
   ALTER TABLE alchemy_network_config
   ADD COLUMN iconUrl VARCHAR(500);
   ```

3. **Update existing records with icon URLs:**

   ```sql
   -- Update existing Polygon records
   UPDATE alchemy_network_config
   SET iconUrl = 'https://res.cloudinary.com/{cloud}/blockchain/polygon-mainnet.svg'
   WHERE blockchain = 'POLYGON' AND network = 'mainnet';

   UPDATE alchemy_network_config
   SET iconUrl = 'https://res.cloudinary.com/{cloud}/blockchain/polygon-testnet.svg'
   WHERE blockchain = 'POLYGON' AND network = 'amoy';

   -- Update existing Arbitrum records
   UPDATE alchemy_network_config
   SET iconUrl = 'https://res.cloudinary.com/{cloud}/blockchain/arb-mainnet.svg'
   WHERE blockchain = 'ARBITRUM' AND network = 'mainnet';

   UPDATE alchemy_network_config
   SET iconUrl = 'https://res.cloudinary.com/{cloud}/blockchain/arb-testnet.svg'
   WHERE blockchain = 'ARBITRUM' AND network = 'sepolia';

   -- Update existing Base records
   UPDATE alchemy_network_config
   SET iconUrl = 'https://res.cloudinary.com/{cloud}/blockchain/base-mainnet.svg'
   WHERE blockchain = 'BASE' AND network = 'mainnet';

   UPDATE alchemy_network_config
   SET iconUrl = 'https://res.cloudinary.com/{cloud}/blockchain/base-testnet.svg'
   WHERE blockchain = 'BASE' AND network = 'sepolia';
   ```

4. **Image Sources for New Chains:**
   - **Ethereum:** https://ethereum.org/en/assets/ (official brand assets)
   - **BSC:** https://www.bnbchain.org/en/brand-assets (official brand assets)
   - **Solana:** https://solana.com/branding (official brand assets)
   - **Tron:** https://tron.network/static/doc/TRON%20Branding%20Guidelines.pdf

5. **Image Requirements:**
   - Format: **SVG** (vector, scalable)
   - Size: Keep under 50KB per image
   - Colors: Use official brand colors
   - Transparent background
   - Square aspect ratio (1:1) for consistency
   - Optimize with SVGO before uploading

**Checklist:**

- [ ] Download/create missing blockchain logos (Ethereum, BSC, Solana, Tron)
- [ ] Optimize all SVG files
- [ ] Upload all images to Cloudinary in `/blockchain/` folder
- [ ] Add `iconUrl` column to `alchemy_network_config` table
- [ ] Update existing 12 records with Cloudinary URLs
- [ ] Include `iconUrl` in all 28 new database inserts
- [ ] Update admin dashboard to display blockchain icons
- [ ] Update mobile app to fetch and display blockchain icons from `iconUrl`

### 4.1 Update Supported Networks Configuration

**Add blockchain type constants:**

```typescript
enum BlockchainType {
  EVM = 'EVM',
  SOLANA = 'SOLANA',
  TRON = 'TRON',
}

enum Blockchain {
  ETHEREUM = 'ETHEREUM',
  POLYGON = 'POLYGON',
  ARBITRUM = 'ARBITRUM',
  BASE = 'BASE',
  BSC = 'BSC', // BNB Smart Chain
  SOLANA = 'SOLANA',
  TRON = 'TRON',
}
```

**Chain ID mappings (EVM only):**

- Ethereum mainnet: `1`
- Polygon mainnet: `137`
- Arbitrum One: `42161`
- Base mainnet: `8453`
- BSC mainnet: `56`

### 4.2 Add RPC Configuration

**Environment variables needed:**

```bash
# Ethereum
ALCHEMY_DEV_ETH_MAINNET_RPC=https://eth-mainnet.g.alchemy.com/v2/{API_KEY}
ALCHEMY_PROD_ETH_MAINNET_RPC=https://eth-mainnet.g.alchemy.com/v2/{API_KEY}

# BNB Smart Chain (BSC)
ALCHEMY_DEV_BSC_MAINNET_RPC=https://bnb-mainnet.g.alchemy.com/v2/{API_KEY}
ALCHEMY_PROD_BSC_MAINNET_RPC=https://bnb-mainnet.g.alchemy.com/v2/{API_KEY}

# Solana
ALCHEMY_DEV_SOLANA_MAINNET_RPC=https://solana-mainnet.g.alchemy.com/v2/{API_KEY}
ALCHEMY_PROD_SOLANA_MAINNET_RPC=https://solana-mainnet.g.alchemy.com/v2/{API_KEY}

# Tron
ALCHEMY_DEV_TRON_MAINNET_RPC=https://tron-mainnet.g.alchemy.com/v2/{API_KEY}
ALCHEMY_PROD_TRON_MAINNET_RPC=https://tron-mainnet.g.alchemy.com/v2/{API_KEY}
ALCHEMY_DEV_TRON_TESTNET_RPC=https://tron-testnet.g.alchemy.com/v2/{API_KEY}
ALCHEMY_PROD_TRON_TESTNET_RPC=https://tron-testnet.g.alchemy.com/v2/{API_KEY}
```

**Note:** Alchemy provides RPC endpoints for all chains including Tron.

### 4.3 Extend Network Registry Rows

**Token Contract/Mint Addresses:**

#### USDC Addresses:

- **Ethereum:** `0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48`
- **Polygon:** `0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359` (USDC native)
- **Arbitrum:** `0xaf88d065e77c8cC2239327C5EDb3A432268e5831` (USDC native)
- **Base:** `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`
- **BSC:** `0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d` (USDC - Binance-Peg)
- **Solana:** `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v` (USDC mint address)

#### USDT Addresses:

- **Ethereum:** `0xdAC17F958D2ee523a2206206994597C13D831ec7`
- **Polygon:** `0xc2132D05D31c914a87C6611C10748AEb04B58e8F` (bridged USDT)
- **Arbitrum:** `0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9`
- **Base:** `0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2`
- **BSC:** `0x55d398326f99059fF775485246999027B3197955` (USDT - Binance-Peg BSC-USD)
- **Solana:** `Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB` (USDT mint address)
- **Tron:** `TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t`

#### Decimals:

- **USDC:** 6 decimals (all chains)
- **USDT:** 6 decimals (all chains except Ethereum which has 6)
- **Solana tokens:** Use `getMint()` to verify decimals programmatically

**Database entries to add:**

⚠️ **IMPORTANT:** You need to **update your existing 12 records** first with the new `blockchainType` and `iconUrl` columns before adding new entries.

**Step 1: Update Existing Records (12 rows)**

```sql
-- Add blockchainType column (if not exists)
ALTER TABLE alchemy_network_config
ADD COLUMN blockchainType VARCHAR(20) DEFAULT 'EVM';

-- Add iconUrl column (if not exists)
ALTER TABLE alchemy_network_config
ADD COLUMN iconUrl VARCHAR(500);

-- Update existing Polygon records
UPDATE alchemy_network_config
SET blockchainType = 'EVM',
    iconUrl = 'https://res.cloudinary.com/{cloud}/blockchain/polygon-mainnet.svg'
WHERE blockchain = 'POLYGON' AND network = 'mainnet';

UPDATE alchemy_network_config
SET blockchainType = 'EVM',
    iconUrl = 'https://res.cloudinary.com/{cloud}/blockchain/polygon-testnet.svg'
WHERE blockchain = 'POLYGON' AND network = 'amoy';

-- Update existing Arbitrum records
UPDATE alchemy_network_config
SET blockchainType = 'EVM',
    iconUrl = 'https://res.cloudinary.com/{cloud}/blockchain/arb-mainnet.svg'
WHERE blockchain = 'ARBITRUM' AND network = 'mainnet';

UPDATE alchemy_network_config
SET blockchainType = 'EVM',
    iconUrl = 'https://res.cloudinary.com/{cloud}/blockchain/arb-testnet.svg'
WHERE blockchain = 'ARBITRUM' AND network = 'sepolia';

-- Update existing Base records
UPDATE alchemy_network_config
SET blockchainType = 'EVM',
    iconUrl = 'https://res.cloudinary.com/{cloud}/blockchain/base-mainnet.svg'
WHERE blockchain = 'BASE' AND network = 'mainnet';

UPDATE alchemy_network_config
SET blockchainType = 'EVM',
    iconUrl = 'https://res.cloudinary.com/{cloud}/blockchain/base-testnet.svg'
WHERE blockchain = 'BASE' AND network = 'sepolia';
```

**Step 2: Add New Network Entries (28 new rows)**

You'll need to add entries for **mainnet and testnet** networks. Total: **28 new rows** (14 tokens × 2 networks each)

```sql
-- USDC Mainnet entries (3 new networks: Ethereum, BSC, Solana)
INSERT INTO alchemy_network_config (
  tokenType, tokenName, tokenSymbol,
  blockchain, blockchainName,
  network, networkLabel,
  tokenAddress, decimals,
  blockchainType, iconUrl,
  isEnabled, isTestnet, displayOrder
) VALUES
  ('USDC', 'USD Coin', 'USDC',
   'ETHEREUM', 'Ethereum',
   'mainnet', 'Ethereum Mainnet',
   '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 6,
   'EVM', 'https://res.cloudinary.com/{cloud}/blockchain/eth-mainnet.svg',
   false, false, 13),

  ('USDC', 'USD Coin', 'USDC',
   'BSC', 'BNB Smart Chain',
   'mainnet', 'BSC Mainnet',
   '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', 6,
   'EVM', 'https://res.cloudinary.com/{cloud}/blockchain/bsc-mainnet.svg',
   false, false, 14),

  ('USDC', 'USD Coin', 'USDC',
   'SOLANA', 'Solana',
   'mainnet', 'Solana Mainnet',
   'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', 6,
   'SOLANA', 'https://res.cloudinary.com/{cloud}/blockchain/solana-mainnet.svg',
   false, false, 15);

-- USDC Testnet entries (3 new networks: Ethereum Sepolia, BSC Testnet, Solana Devnet)
INSERT INTO alchemy_network_config (
  tokenType, tokenName, tokenSymbol,
  blockchain, blockchainName,
  network, networkLabel,
  tokenAddress, decimals,
  blockchainType, iconUrl,
  isEnabled, isTestnet, displayOrder
) VALUES
  ('USDC', 'USD Coin', 'USDC',
   'ETHEREUM', 'Ethereum',
   'sepolia', 'Ethereum Sepolia',
   '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', 6,
   'EVM', 'https://res.cloudinary.com/{cloud}/blockchain/eth-testnet.svg',
   false, true, 16),

  ('USDC', 'USD Coin', 'USDC',
   'BSC', 'BNB Smart Chain',
   'testnet', 'BSC Testnet',
   '0x64544969ed7EBf5f083679233325356EbE738930', 18,
   'EVM', 'https://res.cloudinary.com/{cloud}/blockchain/bsc-testnet.svg',
   false, true, 17),

  ('USDC', 'USD Coin', 'USDC',
   'SOLANA', 'Solana',
   'devnet', 'Solana Devnet',
   '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU', 6,
   'SOLANA', 'https://res.cloudinary.com/{cloud}/blockchain/solana-testnet.svg',
   false, true, 18);

-- USDT Mainnet entries (4 new networks: Ethereum, BSC, Solana, Tron)
INSERT INTO alchemy_network_config (
  tokenType, tokenName, tokenSymbol,
  blockchain, blockchainName,
  network, networkLabel,
  tokenAddress, decimals,
  blockchainType, iconUrl,
  isEnabled, isTestnet, displayOrder
) VALUES
  ('USDT', 'Tether USD', 'USDT',
   'ETHEREUM', 'Ethereum',
   'mainnet', 'Ethereum Mainnet',
   '0xdAC17F958D2ee523a2206206994597C13D831ec7', 6,
   'EVM', 'https://res.cloudinary.com/{cloud}/blockchain/eth-mainnet.svg',
   false, false, 19),

  ('USDT', 'Tether USD', 'USDT',
   'BSC', 'BNB Smart Chain',
   'mainnet', 'BSC Mainnet',
   '0x55d398326f99059fF775485246999027B3197955', 18,
   'EVM', 'https://res.cloudinary.com/{cloud}/blockchain/bsc-mainnet.svg',
   false, false, 20),

  ('USDT', 'Tether USD', 'USDT',
   'SOLANA', 'Solana',
   'mainnet', 'Solana Mainnet',
   'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', 6,
   'SOLANA', 'https://res.cloudinary.com/{cloud}/blockchain/solana-mainnet.svg',
   false, false, 21),

  ('USDT', 'Tether USD', 'USDT',
   'TRON', 'Tron',
   'mainnet', 'Tron Mainnet',
   'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t', 6,
   'TRON', 'https://res.cloudinary.com/{cloud}/blockchain/tron-mainnet.svg',
   false, false, 22);

-- USDT Testnet entries (4 new networks: Ethereum Sepolia, BSC Testnet, Solana Devnet, Tron Shasta)
INSERT INTO alchemy_network_config (
  tokenType, tokenName, tokenSymbol,
  blockchain, blockchainName,
  network, networkLabel,
  tokenAddress, decimals,
  blockchainType, iconUrl,
  isEnabled, isTestnet, displayOrder
) VALUES
  ('USDT', 'Tether USD', 'USDT',
   'ETHEREUM', 'Ethereum',
   'sepolia', 'Ethereum Sepolia',
   '0x7169D38820dfd117C3FA1f22a697dBA58d90BA06', 6,
   'EVM', 'https://res.cloudinary.com/{cloud}/blockchain/eth-testnet.svg',
   false, true, 23),

  ('USDT', 'Tether USD', 'USDT',
   'BSC', 'BNB Smart Chain',
   'testnet', 'BSC Testnet',
   '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd', 18,
   'EVM', 'https://res.cloudinary.com/{cloud}/blockchain/bsc-testnet.svg',
   false, true, 24),

  ('USDT', 'Tether USD', 'USDT',
   'SOLANA', 'Solana',
   'devnet', 'Solana Devnet',
   'EJwZgeZrdC8TXTQbQBoL6bfuAnFUUy1PVCMB4DYPzVaS', 6,
   'SOLANA', 'https://res.cloudinary.com/{cloud}/blockchain/solana-testnet.svg',
   false, true, 25),

  ('USDT', 'Tether USD', 'USDT',
   'TRON', 'Tron',
   'shasta', 'Tron Shasta Testnet',
   'TG3XXyExBkPp9nzdajDZsozEu4BkaSJozs', 6,
   'TRON', 'https://res.cloudinary.com/{cloud}/blockchain/tron-testnet.svg',
   false, true, 26);
```

**Important Notes:**

- **BSC USDT uses 18 decimals** (not 6 like other chains)
- **BSC Testnet USDC also uses 18 decimals** (mainnet uses 6)
- Replace `{cloud}` with your actual Cloudinary cloud name
- `displayOrder` values continue from your existing 12 records
- All new entries have `isEnabled=false` by default (enable via admin dashboard after testing)

### Admin Dashboard Integration

Your admin dashboard at `https://myadmin.raverpay.com/dashboard/alchemy/network-config` already has the infrastructure to manage these networks. After adding the database entries:

**Configuration columns to verify/update:**

- `tokenType` - 'USDC' or 'USDT'
- `tokenName` - Display name (e.g., 'USD Coin', 'Tether USD')
- `tokenSymbol` - 'USDC' or 'USDT'
- `blockchain` - 'ETHEREUM', 'BSC', 'SOLANA', 'TRON', etc.
- `blockchainName` - Human-readable (e.g., 'Ethereum', 'BNB Smart Chain')
- `network` - 'mainnet', 'testnet', 'sepolia', 'devnet', 'shasta'
- `networkLabel` - Display name (e.g., 'Ethereum Mainnet', 'Solana Devnet')
- `tokenAddress` - Contract/mint address
- `decimals` - Token decimals (6 or 18)
- `blockchainType` - 'EVM', 'SOLANA', or 'TRON' (NEW COLUMN)
- `iconUrl` - Cloudinary URL for blockchain logo (NEW COLUMN)
- `isEnabled` - Boolean (can be toggled via dashboard)
- `isTestnet` - Boolean (true for testnet networks)
- `displayOrder` - Integer for sorting in UI

**Admin Dashboard Features to Ensure:**

1. ✅ Enable/disable toggle for each network (already working)
2. ✅ Show testnet networks with "Show Disabled" filter
3. ✅ Display blockchain icon from `iconUrl` field (NEW)
4. ✅ Display blockchain type badge (EVM/Solana/Tron)
5. ✅ Validate token addresses based on blockchain type:
   - EVM: starts with '0x', 42 chars
   - Solana: base58, ~44 chars
   - Tron: starts with 'T', base58check
6. ✅ Prevent editing critical fields (blockchain, network, decimals) after creation
7. ✅ Allow editing display order, labels, and iconUrl
8. ✅ Show network status indicator (mainnet vs testnet)
9. ✅ Preview blockchain icon in the list view (NEW)

**Admin Dashboard UI Updates Needed:**

```tsx
// Example: Display blockchain icon in network list
<img src={network.iconUrl} alt={network.blockchainName} className="w-8 h-8 rounded-full" />
```

**Mobile App Integration:**

- Fetch `iconUrl` from API along with network data
- Cache blockchain icons locally for performance
- Display icon next to blockchain name in deposit/receive screens
- Use same icon across iOS and Android apps

**Testing Workflow:**

1. Add all database entries (mainnets disabled initially for safety)
2. Verify entries appear in admin dashboard
3. Test enabling/disabling individual networks
4. Verify frontend displays correct networks based on `isEnabled` flag
5. Enable mainnet networks one by one after testing

### 4.4 Wallet Model Changes

**Recommended: Option A - Extend existing `alchemyWallet` table**

```sql
ALTER TABLE alchemyWallet ADD COLUMN blockchainType VARCHAR(20) DEFAULT 'EVM';
ALTER TABLE alchemyWallet ADD COLUMN blockchain VARCHAR(50); -- 'ETHEREUM', 'SOLANA', 'TRON', etc.
ALTER TABLE alchemyWallet ADD UNIQUE INDEX idx_user_blockchain (userId, blockchain);
```

**Wallet structure per user:**

```
User 123:
  - Wallet 1: blockchainType='EVM', blockchain=NULL (shared across all EVM chains)
    - address: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
    - Used for: Ethereum, Polygon, Arbitrum, Base, BSC
    - Same address receives tokens on all 5 EVM chains

  - Wallet 2: blockchainType='SOLANA', blockchain='SOLANA'
    - address: 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU (example)
    - Used for: Solana only

  - Wallet 3: blockchainType='TRON', blockchain='TRON'
    - address: TYASr5UV6HEcXatwdFQfmLVUqQQQMUxHLS (example)
    - Used for: Tron only
```

**Key generation approach:**

- **EVM:** Keep existing viem-based generation
- **Solana:** Use `@solana/web3.js` Keypair.generate() → store secret key (64 bytes)
- **Tron:** Use TronWeb.createAccount() → store private key (32 bytes hex)

**Security considerations:**

- All private keys must be encrypted at rest (use existing encryption method)
- Consider using KMS or HSM for production
- Implement key rotation strategy
- Never log or expose private keys in API responses

### 4.5 Balance Fetching

**EVM Balance Fetching (viem):**

```typescript
// Existing approach - extend to include Ethereum and BSC
import { createPublicClient, http } from 'viem';
import { mainnet, polygon, arbitrum, base, bsc } from 'viem/chains';

const chainConfigs = {
  ETHEREUM: { chain: mainnet, rpc: process.env.ALCHEMY_ETH_MAINNET_RPC },
  POLYGON: { chain: polygon, rpc: process.env.ALCHEMY_POLYGON_MAINNET_RPC },
  ARBITRUM: { chain: arbitrum, rpc: process.env.ALCHEMY_ARBITRUM_MAINNET_RPC },
  BASE: { chain: base, rpc: process.env.ALCHEMY_BASE_MAINNET_RPC },
  BSC: { chain: bsc, rpc: process.env.ALCHEMY_BSC_MAINNET_RPC },
};

async function getERC20Balance(blockchain, address, tokenAddress) {
  const config = chainConfigs[blockchain];
  const client = createPublicClient({
    chain: config.chain,
    transport: http(config.rpc),
  });

  const balance = await client.readContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [address],
  });

  return balance;
}
```

**Solana Balance Fetching:**

```typescript
import { Connection, PublicKey } from '@solana/web3.js';
import { getAccount, getAssociatedTokenAddress } from '@solana/spl-token';

async function getSolanaTokenBalance(walletAddress, mintAddress) {
  const connection = new Connection(process.env.ALCHEMY_SOLANA_MAINNET_RPC);
  const walletPubkey = new PublicKey(walletAddress);
  const mintPubkey = new PublicKey(mintAddress);

  try {
    // Get the associated token account address
    const tokenAccountAddress = await getAssociatedTokenAddress(mintPubkey, walletPubkey);

    // Fetch the token account
    const tokenAccount = await getAccount(connection, tokenAccountAddress);

    return tokenAccount.amount; // Returns as bigint
  } catch (error) {
    // Token account doesn't exist = 0 balance
    if (error.message.includes('could not find account')) {
      return 0n;
    }
    throw error;
  }
}
```

**Tron Balance Fetching:**

```typescript
import TronWeb from 'tronweb';

async function getTronTokenBalance(walletAddress, tokenAddress) {
  const tronWeb = new TronWeb({
    fullHost: process.env.ALCHEMY_TRON_MAINNET_RPC,
  });

  try {
    // TRC-20 uses similar ABI to ERC-20
    const contract = await tronWeb.contract().at(tokenAddress);
    const balance = await contract.balanceOf(walletAddress).call();

    return balance; // Returns as string or BigNumber
  } catch (error) {
    console.error('Tron balance fetch error:', error);
    return '0';
  }
}
```

**Unified balance service:**

```typescript
async function getTokenBalance(blockchain, walletAddress, tokenAddress) {
  const blockchainType = getBlockchainType(blockchain); // From config

  switch (blockchainType) {
    case 'EVM':
      return getERC20Balance(blockchain, walletAddress, tokenAddress);
    case 'SOLANA':
      return getSolanaTokenBalance(walletAddress, tokenAddress);
    case 'TRON':
      return getTronTokenBalance(walletAddress, tokenAddress);
    default:
      throw new Error(`Unsupported blockchain type: ${blockchainType}`);
  }
}
```

### 4.6 Receive Address Logic

**API Response Format:**

```typescript
interface WalletAddress {
  blockchain: string;
  blockchainType: 'EVM' | 'SOLANA' | 'TRON';
  network: string;
  tokenSymbol: string;
  address: string;
  qrCodeData?: string; // Optional: pre-generated QR code
}

// Example response for USDT on multiple chains:
{
  "addresses": [
    {
      "blockchain": "ETHEREUM",
      "blockchainType": "EVM",
      "network": "mainnet",
      "tokenSymbol": "USDT",
      "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
    },
    {
      "blockchain": "BSC",
      "blockchainType": "EVM",
      "network": "mainnet",
      "tokenSymbol": "USDT",
      "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb" // Same address (EVM)
    },
    {
      "blockchain": "TRON",
      "blockchainType": "TRON",
      "network": "mainnet",
      "tokenSymbol": "USDT",
      "address": "TYASr5UV6HEcXatwdFQfmLVUqQQQMUxHLS"
    },
    {
      "blockchain": "SOLANA",
      "blockchainType": "SOLANA",
      "network": "mainnet",
      "tokenSymbol": "USDT",
      "address": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU"
    }
  ]
}
```

**Service logic:**

```typescript
async function getReceiveAddress(userId, blockchain, tokenSymbol) {
  const blockchainType = getBlockchainType(blockchain);

  let wallet;
  if (blockchainType === 'EVM') {
    // Get or create shared EVM wallet
    wallet = await getOrCreateEVMWallet(userId);
  } else {
    // Get or create blockchain-specific wallet
    wallet = await getOrCreateWallet(userId, blockchain);
  }

  return {
    blockchain,
    blockchainType,
    tokenSymbol,
    address: wallet.address,
  };
}
```

### 4.7 Wallet Generation Implementation

**Install dependencies:**

```bash
pnpm install @solana/web3.js @solana/spl-token
pnpm install tronweb
```

**Solana wallet generation:**

```typescript
import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';

async function generateSolanaWallet() {
  const keypair = Keypair.generate();

  return {
    address: keypair.publicKey.toBase58(),
    privateKey: bs58.encode(keypair.secretKey), // 64 bytes encoded
    publicKey: keypair.publicKey.toBase58(),
  };
}
```

**Tron wallet generation:**

```typescript
import TronWeb from 'tronweb';

async function generateTronWallet() {
  const tronWeb = new TronWeb({
    fullHost: process.env.ALCHEMY_TRON_MAINNET_RPC,
  });

  const account = await tronWeb.createAccount();

  return {
    address: account.address.base58, // Starts with 'T'
    privateKey: account.privateKey,
    publicKey: account.publicKey,
  };
}
```

**Unified wallet creation:**

```typescript
async function createWalletForBlockchain(userId, blockchain) {
  const blockchainType = getBlockchainType(blockchain);
  let walletData;

  switch (blockchainType) {
    case 'EVM':
      walletData = await generateEVMWallet(); // Existing viem logic
      break;
    case 'SOLANA':
      walletData = await generateSolanaWallet();
      break;
    case 'TRON':
      walletData = await generateTronWallet();
      break;
  }

  // Encrypt private key before storing
  const encryptedPrivateKey = await encrypt(walletData.privateKey);

  // Store in database
  await db.alchemyWallet.create({
    userId,
    blockchain,
    blockchainType,
    address: walletData.address,
    encryptedPrivateKey,
    // ... other fields
  });

  return walletData.address;
}
```

### 4.8 Deposit Detection & Webhook Handling

**EVM chains (Alchemy):**

- Use Alchemy's Address Activity Webhooks
- Configure for each EVM chain separately
- Filter for token transfers to user addresses

**Solana:**

- Alchemy supports Solana webhooks via Address Activity
- Monitor token account changes for SPL tokens
- Alternative: Poll `getSignaturesForAddress` API

**Tron:**

- Alchemy supports Tron webhooks via Address Activity
- Configure webhooks in Alchemy dashboard for TRC-20 token transfers
- Alternative: Poll balance changes via Alchemy RPC

**Implementation approach:**

```typescript
// Webhook handler structure
async function handleDeposit(payload) {
  const { blockchain, address, tokenAddress, amount, txHash } = payload;

  // Find user by wallet address
  const wallet = await db.alchemyWallet.findOne({ address, blockchain });
  if (!wallet) return;

  // Verify token matches expected contract
  const config = await db.alchemyNetworkConfig.findOne({
    blockchain,
    tokenAddress,
  });
  if (!config) return;

  // Record deposit
  await db.deposit.create({
    userId: wallet.userId,
    blockchain,
    tokenSymbol: config.tokenSymbol,
    amount,
    txHash,
    status: 'pending', // Await confirmations
    // ...
  });

  // Notify user
  await notifyUserOfDeposit(wallet.userId, amount, config.tokenSymbol);
}
```

---

## 5) Testing Requirements

### 5.1 Test Networks (Already Supported in Your System)

Based on your admin dashboard, you already have testnet infrastructure:

- **Ethereum Sepolia:** For USDC/USDT testing
- **Polygon Amoy:** For USDC/USDT testing
- **Arbitrum Sepolia:** For USDC/USDT testing
- **Base Sepolia:** For USDC/USDT testing
- **BSC Testnet:** For USDC/USDT testing (need to add)
- **Solana Devnet:** SPL token testing (need to add)
- **Tron Shasta:** TRC-20 testing (need to add)

All testnet networks should be added to the database with `isTestnet=true` and `isEnabled=false` by default. Admins can enable them via the dashboard for testing.

### 5.2 Test Cases

**Wallet Generation:**

- [ ] Generate EVM wallet, verify address format (0x...)
- [ ] Generate Solana wallet, verify base58 format
- [ ] Generate Tron wallet, verify 'T' prefix
- [ ] Verify same EVM address works across all EVM chains
- [ ] Verify different addresses for Solana and Tron

**Balance Fetching:**

- [ ] Fetch USDC balance on Ethereum mainnet
- [ ] Fetch USDT balance on Tron mainnet
- [ ] Fetch USDC balance on Solana mainnet
- [ ] Handle 0 balance (no token account on Solana)
- [ ] Handle network errors gracefully

**Address Display:**

- [ ] API returns correct address per blockchain
- [ ] QR codes generate properly for each blockchain type
- [ ] UI displays network labels correctly

**Deposits:**

- [ ] Detect ERC-20 deposit on Ethereum
- [ ] Detect TRC-20 deposit on Tron
- [ ] Detect SPL token deposit on Solana
- [ ] Handle confirmation requirements per chain

---

## 6) Risks & Notes

### Security Risks

- **Private key storage:** Must use robust encryption (AES-256-GCM minimum)
- **Key derivation:** Consider HD wallets (BIP-39/44) for better key management
- **API key exposure:** Never commit RPC URLs with keys to version control
- **Phishing:** Educate users about correct deposit addresses per chain

### Operational Risks

- **RPC reliability:** Alchemy provides all RPC endpoints including Tron
- **Rate limiting:** Each RPC provider has different limits - verify Tron limits with Alchemy
- **Network outages:** Implement retry logic and fallback RPCs if needed
- **Gas fees:** EVM withdrawals will require ETH, Solana requires SOL, Tron requires TRX

### Technical Risks

- **Token account creation (Solana):** Users need ~0.002 SOL to create token accounts
- **Address reuse confusion:** Users might send Solana USDC to Ethereum address by mistake
- **Decimal handling:** Ensure consistent handling of 6 decimals across all chains
- **Transaction finality:** Different confirmation requirements (Ethereum: 12 blocks, Solana: ~30 seconds, Tron: ~1 minute)

### Additional Considerations

- **Minimum deposit amounts:** Set per-chain minimums to avoid dust
- **Withdrawal support:** Will require native token (ETH/SOL/TRX/BNB) for gas
- **Chain-specific features:**
  - Solana: Token account rent (~0.002 SOL per account)
  - Tron: Bandwidth and energy system
  - Ethereum: EIP-1559 fee market
  - **BSC: USDT uses 18 decimals (not 6 like other chains) - critical for balance calculations!**
- **Monitoring & alerting:** Track RPC health, failed deposits, unusual activity
- **Admin dashboard controls:** Use existing enable/disable toggles to control network availability without redeployments

---

## 7) Recommended Decision Points

### 7.1 Infrastructure Decisions

- [ ] **Wallet storage:** Single table vs separate tables for Solana/Tron? **Recommendation: Single table with blockchainType column**
- [ ] **Key management:** Current encryption vs KMS/HSM migration timeline?
- [ ] **Backup strategy:** How to backup and recover Solana/Tron wallets?
- [ ] **Rate limits:** Verify Alchemy rate limits for Tron RPC (may differ from EVM chains)

### 7.2 Product Decisions

- [ ] **Chain selection UX:** How do users choose which chain to deposit on?
- [ ] **Fee disclosure:** Clearly show network fees for withdrawals?
- [ ] **Minimum deposits:** Set minimum amounts per chain?
- [ ] **Cross-chain swaps:** Future feature or out of scope?

### 7.3 Development Decisions

- [x] **Testing strategy:** Support both testnet and mainnet (configurable via admin dashboard)
- [x] **Rollout plan:** Full rollout - all chains deployed together (existing chains already active)
- [ ] **Monitoring:** What metrics to track (success rates, avg deposit time, etc.)?
- [ ] **Error handling:** How to surface blockchain-specific errors to users?

**Note on Rollout:** Since you already have Polygon, Arbitrum, and Base active in production, the new networks (Ethereum, BSC, Solana, Tron) should be deployed together for consistency. Use your admin dashboard to:

1. Add all networks initially disabled
2. Enable testnet versions first for internal testing
3. Enable mainnet versions after validation
4. Monitor each network individually via dashboard

---

## 8) Implementation Phases

### Phase 1: Foundation (Week 1-2) - ✅ PARTIALLY COMPLETE

**✅ Completed:**

- [x] **Blockchain logos ready** - All 14 SVG files already existed in `assets/blockchain/` (no download needed)
- [x] **Images optimized** - All SVG files already optimized (sizes: 585B - 31KB)
- [x] **Uploaded all blockchain images to Cloudinary** in `/blockchain/` folder
  - 14/14 images uploaded successfully
  - Cloudinary URLs: `https://res.cloudinary.com/db9jqfl6u/image/upload/v1769763XXX/blockchain/*.svg`
- [x] **Update database schema** (added `blockchainType` VARCHAR(20) DEFAULT 'EVM', `iconUrl` TEXT columns)
  - Created migration: `phase1_add_blockchain_type_and_icon_url.sql`
  - Created index on `blockchainType`
  - Regenerated Prisma client
- [x] **Updated existing 12 records** with `blockchainType='EVM'` and Cloudinary `iconUrl` values
  - All Polygon, Arbitrum, Base networks updated
- [x] **Added 14 new network entries** (corrected from 28 - actual count needed)
  - ETHEREUM: 4 networks (2 USDC + 2 USDT, mainnet/sepolia)
  - BSC: 4 networks (2 USDC + 2 USDT, mainnet/testnet)
  - SOLANA: 4 networks (2 USDC + 2 USDT, mainnet/devnet)
  - TRON: 2 networks (2 USDT, mainnet/shasta)
  - All new networks disabled by default (`isEnabled=false`)
- [x] **Database verification** - 26 total networks, all with `blockchainType` and `iconUrl`

**⏳ Remaining Tasks:**

- [ ] Add environment variables for all RPC endpoints (Ethereum, BSC, Solana, Tron)
- [ ] Verify network icons appear correctly in admin dashboard UI
- [ ] Test admin dashboard network toggle functionality
- [ ] Install Solana and Tron SDKs (`@solana/web3.js`, `@solana/spl-token`, `tronweb`, `bs58`)
- [ ] Update API responses to include `blockchainType` and `iconUrl` fields
- [ ] Test API endpoints return new fields correctly

**Database Status:**

```
Total Networks: 26 (12 existing + 14 new)
- ARBITRUM (EVM):   4 networks
- BASE (EVM):       4 networks
- BSC (EVM):        4 networks ⭐ NEW
- ETHEREUM (EVM):   4 networks ⭐ NEW
- POLYGON (EVM):    4 networks
- SOLANA (SOLANA):  4 networks ⭐ NEW
- TRON (TRON):      2 networks ⭐ NEW

All networks have blockchainType: 26/26 ✅
All networks have iconUrl: 26/26 ✅
```

**Migration Files Created:**

- `prisma/migrations/phase1_add_blockchain_type_and_icon_url.sql`
- `prisma/migrations/phase1_update_existing_12_records.sql`
- `prisma/migrations/phase1_add_28_new_networks_v2.sql` (actually added 14)
- `scripts/upload-blockchain-images.ts` (Cloudinary upload script)

### Phase 2: Backend Configuration & RPC Setup (Week 2-3)

**Priority: Complete Phase 1 remaining tasks first**

- [ ] Add RPC environment variables for new chains
  - [ ] `ALCHEMY_ETH_MAINNET_RPC` and `ALCHEMY_ETH_SEPOLIA_RPC`
  - [ ] `ALCHEMY_BSC_MAINNET_RPC` and `ALCHEMY_BSC_TESTNET_RPC`
  - [ ] `ALCHEMY_SOLANA_MAINNET_RPC` and `ALCHEMY_SOLANA_DEVNET_RPC`
  - [ ] `A4: Balance & Deposits (Week 4-5)

- [ ] Implement Solana balance fetching
- [ ] Implement Tron balance fetching
- [ ] Extend EVM balance fetching to Ethereum and BSC
- [ ] Set up webhook handlers for all chains
- [ ] Test deposit detection end-to-end

### Phase 5: API & UI (Week 5-6or Ethereum (1), BSC (56)

- [ ] Update network validation logic to recognize new chains
- [ ] Update API DTOs to include `blockchainType` and `iconUrl`

### Phase 3: Wallet Generation (Week 3-4)

- [ ] Implement Solana wallet generation
- [ ] Implement Tron wallet generation
- [ ] Add wallet creation API endpoints
- [ ] Update existing EVM wallet logic to support blockchain discrimination
- [ ] Test wallet generation on all chains

### Phase 3: Balance & Deposits (Week 3-4)

6: Testing & Launch (Week 6-7)

- [ ] Integration testing on testnets
- [ ] Security audit of key management
- [ ] Load testing RPC endpoints
- [ ] User acceptance testing
- [ ] Gradual rollout to production
- [ ] Monitor and iterate

---

## 📊 Current Progress Summary

**Phase 1: Foundation** - 70% Complete ✅

- ✅ Database schema updated
- ✅ All 26 networks configured in database
- ✅ All blockchain images uploaded to Cloudinary
- ⏳ RPC configuration pending
- ⏳ SDK installation pending
- ⏳ UI/Admin dashboard verification pending

**Next Immediate Steps:**

1. Add RPC environment variables for all new chains
2. Install Solana and Tron SDKs
3. Test admin dashboard displays icons correctly
4. Update API responses to include new fields
5. Begin Phase 2/3: Wallet generation implementation

**Blockchain Coverage:**

- **EVM Chains (5)**: Ethereum ⭐, Polygon, Arbitrum, Base, BSC ⭐
- **Non-EVM Chains (2)**: Solana ⭐, Tron ⭐
- **Total Networks**: 26 (12 existing + 14 new)
- **All networks**: Have `blockchainType` and `iconUrl` ✅ek 4-5)

- [ ] Update receive address API to return blockchain-specific addresses
- [ ] Update balance API to support all chains
- [ ] Implement QR code generation for each blockchain type
- [ ] **Update UI to display blockchain icons from iconUrl**
- [ ] Update UI to display multiple addresses per token
- [ ] Add chain selector/filter in UI with icons
- [ ] **Update mobile app to fetch and cache blockchain icons**
- [ ] **Verify admin dashboard displays all networks correctly with icons**
- [ ] **Test enable/disable toggle for each network**
- [ ] **Ensure frontend respects isEnabled flag from database**

### Phase 5: Testing & Launch (Week 5-6)

- [ ] Integration testing on testnets
- [ ] Security audit of key management
- [ ] Load testing RPC endpoints
- [ ] User acceptance testing
- [ ] Gradual rollout to production
- [ ] Monitor and iterate

---

## 9) Summary

### Key Takeaways

- You can safely keep **one EOA wallet per user** for **Ethereum/Polygon/Arbitrum/Base/BSC** (all EVM chains share the same address).
- **Solana and Tron require separate wallet generation** with different cryptographic approaches.
- **Alchemy provides RPC endpoints for all chains** including Ethereum, BSC, Solana, and Tron.
- **BSC USDT uses 18 decimals** (not 6) - ensure proper handling in balance calculations.
- **Token addresses and decimals** are confirmed and documented above for all networks.
- **Security is paramount:** All private keys must be encrypted, consider KMS for production.
- **Admin dashboard integration:** Networks can be enabled/disabled without code deployments.
- **Full rollout approach:** Deploy all new networks together since existing chains are already active.

### Dependencies to Install

```json
{
  "dependencies": {
    "viem": "^2.x.x",
    "@solana/web3.js": "^1.95.0",
    "@solana/spl-token": "^0.4.0",
    "tronweb": "^5.3.0",
**✅ Completed (Phase 1):**
- [x] **All blockchain images uploaded to Cloudinary** (14/14 images)
- [x] **iconUrl column added and populated for all records** (26/26 networks)
- [x] **All 14 new database entries added** (corrected from 28 - actual count)
- [x] **All 12 existing records updated** with blockchainType='EVM' and iconUrl
- [x] **Database schema updated** with blockchainType and iconUrl columns
- [x] **Prisma client regenerated** with new schema
- [x] **TypeScript compilation passing** (no errors)

**⏳ In Progress / Pending:**
- [ ] Admin dashboard displays all networks correctly with icons (needs UI verification)
- [ ] Environment variables configured for all RPCs (Ethereum, BSC, Solana, Tron)
- [ ] SDKs installed (@solana/web3.js, tronweb)
- [ ] Wallet generation implemented for all blockchain types
- [ ] Balance fetching implemented for
# EVM Chains (Alchemy)
ALCHEMY_ETH_MAINNET_RPC=https://eth-mainnet.g.alchemy.com/v2/{API_KEY}
ALCHEMY_POLYGON_MAINNET_RPC=https://polygon-mainnet.g.alchemy.com/v2/{API_KEY}
ALCHEMY_ARBITRUM_MAINNET_RPC=https://arb-mainnet.g.alchemy.com/v2/{API_KEY}
ALCHEMY_BASE_MAINNET_RPC=https://base-mainnet.g.alchemy.com/v2/{API_KEY}
ALCHEMY_BSC_MAINNET_RPC=https://bnb-mainnet.g.alchemy.com/v2/{API_KEY}

# Solana (Alchemy)
ALCHEMY_SOLANA_MAINNET_RPC=https://solana-mainnet.g.alchemy.com/v2/{API_KEY}

# Tron (Alchemy)
ALCHEMY_TRON_MAINNET_RPC=https://tron-mainnet.g.alchemy.com/v2/{API_KEY}

# Testnet RPCs (if using testnets)
ALCHEMY_ETH_SEPOLIA_RPC=1
**Last Updated:** 2026-01-30
**Owner:** Engineering Team
**Status:** Phase 1 In Progress (70% Complete)

**Git Branch:** `feat/stablecoin-multi-network-support`

**Recent Changes:**
- ✅ Phase 1 database work completed (schema, data, images)
- ⏳ Phase 1 remaining: RPC config, SDK installation, UI verification
- 📝 Updated implementation phases to reflect actual progress
- 📝 Corrected network count: 14 new networks (not 28)e-sepolia.g.alchemy.com/v2/{API_KEY}
ALCHEMY_BSC_TESTNET_RPC=https://bnb-testnet.g.alchemy.com/v2/{API_KEY}
ALCHEMY_SOLANA_DEVNET_RPC=https://solana-devnet.g.alchemy.com/v2/{API_KEY}
ALCHEMY_TRON_TESTNET_RPC=https://tron-testnet.g.alchemy.com/v2/{API_KEY}
```

---

## 10) Next Steps

1. **Review and approve** this plan with tech lead and product owner
2. **Create detailed tickets** from Phase 1-5 breakdown
3. **Download/create blockchain logos** for new chains (Ethereum, BSC, Solana, Tron)
4. **Upload logos to Cloudinary** and get URLs
5. **Prepare admin dashboard** for new network entries
6. **Set up testnet environments** for testing (Alchemy provides all testnet RPCs)
7. **Begin Phase 1 implementation** - database updates and environment configuration

### Pre-Launch Checklist

- [ ] **All blockchain images uploaded to Cloudinary**
- [ ] **iconUrl column added and populated for all records**
- [ ] All 28 database entries added (14 mainnet + 14 testnet)
- [ ] All 12 existing records updated with blockchainType and iconUrl
- [ ] Admin dashboard displays all networks correctly with icons
- [ ] Environment variables configured for all RPCs
- [ ] Wallet generation tested for all blockchain types
- [ ] Balance fetching tested on all chains
- [ ] Enable/disable toggle working in admin dashboard
- [ ] Security audit of key management completed
- [ ] Monitoring and alerting configured
- [ ] User-facing documentation updated with new chains
- [ ] Mobile app displaying blockchain icons correctly

### Rollout Strategy

Since you already have active networks in production:

1. **Week 1-2:** Add all database entries, keep new networks disabled
2. **Week 3:** Enable testnet networks for internal testing
3. **Week 4:** Enable mainnet networks one by one:
   - Start with Ethereum (lowest risk, most established)
   - Then BSC (EVM-compatible, familiar flow)
   - Then Solana (new blockchain type)
   - Finally Tron (highest complexity with external RPC)
4. **Week 5-6:** Monitor all networks, address any issues, optimize

---

**Document Version:** 2.0  
**Last Updated:** 2026-01-30  
**Owner:** Engineering Team  
**Status:** Ready for Implementation
