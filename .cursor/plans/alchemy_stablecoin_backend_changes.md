# Alchemy Stablecoin V1 - Backend Changes Required

## Overview

This document outlines the **critical backend changes** needed before implementing the Alchemy Stablecoin Receiving V1 plan, based on mobile app requirements and current codebase analysis.

---

## 🔴 Critical Changes Required

### 1. **Single Wallet Per User (Not Per Network)**

**Current Implementation Issue:**

- Current code creates **one wallet per user per blockchain/network** combination
- See: `apps/raverpay-api/src/alchemy/wallets/alchemy-wallet-generation.service.ts:82-96`
- Unique constraint: `@@unique([userId, blockchain, network])`

**Required Change:**

- **ONE wallet per user** that can receive **ALL ERC-20 tokens** on **ALL EVM networks**
- Same wallet address works across Ethereum, Polygon, Arbitrum, BSC, Base, etc.
- When user selects USDC Ethereum or USDT Polygon, they see the **same wallet address**
- Only create a new wallet if user doesn't have one yet

**Implementation:**

1. **Update Database Schema** (`prisma/schema.prisma`):

   ```prisma
   model AlchemyWallet {
     id                    String                 @id @default(uuid())
     userId                String
     address               String                 @unique  // Same address across all networks
     encryptedPrivateKey   String
     encryptedMnemonic     String?
     // Remove blockchain and network from unique constraint
     // Keep them for reference/tracking but allow multiple entries
     blockchain            String?                // Optional - for tracking
     network               String?                // Optional - for tracking
     accountType           AlchemyAccountType     @default(EOA)
     state                 AlchemyWalletState     @default(ACTIVE)
     name                  String?
     isGasSponsored        Boolean                @default(false)
     gasPolicyId           String?
     alchemyAppId          String?
     webhookId             String?
     lastKeyRotation       DateTime?
     keyRotationCount      Int                    @default(0)
     createdAt             DateTime               @default(now())
     updatedAt             DateTime               @updatedAt

     user                  User                   @relation(fields: [userId], references: [id], onDelete: Cascade)
     alchemyTransactions   AlchemyTransaction[]
     stablecoinWallets     StablecoinWallet[]     // NEW: Relation to stablecoin wallets

     @@unique([userId])  // ONE wallet per user
     @@index([userId])
     @@index([address])
   }
   ```

2. **Update Wallet Generation Service**:

   ```typescript
   // In alchemy-wallet-generation.service.ts
   async generateEOAWallet(params: {
     userId: string;
     blockchain?: string;  // Optional now
     network?: string;     // Optional now
     name?: string;
   }) {
     // Check if user already has ANY wallet
     const existingWallet = await this.prisma.alchemyWallet.findUnique({
       where: { userId },
     });

     if (existingWallet) {
       // Return existing wallet - same address for all networks
       return {
         id: existingWallet.id,
         address: existingWallet.address,
         blockchain: existingWallet.blockchain || 'ETHEREUM', // Default
         network: existingWallet.network || 'mainnet', // Default
         accountType: existingWallet.accountType,
         name: existingWallet.name,
         isGasSponsored: existingWallet.isGasSponsored,
         hasSeedPhrase: !!existingWallet.encryptedMnemonic,
         createdAt: existingWallet.createdAt,
       };
     }

     // Only create if user doesn't have a wallet
     // ... rest of creation logic
   }
   ```

3. **New Endpoint: Get or Create Stablecoin Wallet**:
   ```typescript
   // POST /alchemy/wallets/create-stablecoin-wallet
   // This endpoint should:
   // 1. Check if user has any AlchemyWallet
   // 2. If yes, return existing wallet address
   // 3. If no, create new wallet
   // 4. Create StablecoinWallet record linking to AlchemyWallet
   ```

---

### 2. **Audit Logging Implementation**

**Current Issue:**

- Alchemy services have **NO audit logging** implemented
- Only logger.warn comments exist (see `alchemy-wallet-generation.service.ts:310`)
- Other services (Circle, Paystack, VTU) properly use `AuditService`

**Required Changes:**

1. **Add AuditService to AlchemyModule**:

   ```typescript
   // In alchemy.module.ts
   import { CommonModule } from '../common/common.module'; // Or wherever AuditService is

   @Module({
     imports: [UsersModule, CommonModule], // Add CommonModule
     providers: [
       // ... existing providers
       AuditService, // Add AuditService
     ],
   })
   ```

2. **Add Audit Actions for Alchemy** (`apps/raverpay-api/src/common/types/audit-log.types.ts`):

   ```typescript
   export enum AuditAction {
     // ... existing actions

     // ALCHEMY ACTIONS
     ALCHEMY_WALLET_CREATED = 'ALCHEMY_WALLET_CREATED',
     ALCHEMY_WALLET_RETRIEVED = 'ALCHEMY_WALLET_RETRIEVED',
     ALCHEMY_PRIVATE_KEY_ACCESSED = 'ALCHEMY_PRIVATE_KEY_ACCESSED',
     ALCHEMY_SEED_PHRASE_EXPORTED = 'ALCHEMY_SEED_PHRASE_EXPORTED',
     ALCHEMY_TOKEN_SENT = 'ALCHEMY_TOKEN_SENT',
     ALCHEMY_TOKEN_RECEIVED = 'ALCHEMY_TOKEN_RECEIVED',
     ALCHEMY_BALANCE_CHECKED = 'ALCHEMY_BALANCE_CHECKED',
     ALCHEMY_TRANSACTION_HISTORY_VIEWED = 'ALCHEMY_TRANSACTION_HISTORY_VIEWED',
     ALCHEMY_WEBHOOK_RECEIVED = 'ALCHEMY_WEBHOOK_RECEIVED',
     ALCHEMY_WEBHOOK_PROCESSED = 'ALCHEMY_WEBHOOK_PROCESSED',
     ALCHEMY_WEBHOOK_FAILED = 'ALCHEMY_WEBHOOK_FAILED',
     STABLECOIN_WALLET_CREATED = 'STABLECOIN_WALLET_CREATED',
     STABLECOIN_DEPOSIT_RECEIVED = 'STABLECOIN_DEPOSIT_RECEIVED',
     STABLECOIN_DEPOSIT_CONFIRMED = 'STABLECOIN_DEPOSIT_CONFIRMED',
   }

   export enum AuditResource {
     // ... existing resources
     ALCHEMY = 'ALCHEMY',
     ALCHEMY_WALLET = 'ALCHEMY_WALLET',
     ALCHEMY_TRANSACTION = 'ALCHEMY_TRANSACTION',
     STABLECOIN_WALLET = 'STABLECOIN_WALLET',
     STABLECOIN_DEPOSIT = 'STABLECOIN_DEPOSIT',
   }
   ```

3. **Update Alchemy Services to Use Audit Logging**:

   **alchemy-wallet-generation.service.ts**:

   ```typescript
   constructor(
     private readonly encryptionService: AlchemyKeyEncryptionService,
     private readonly configService: AlchemyConfigService,
     private readonly prisma: PrismaService,
     private readonly auditService: AuditService, // ADD THIS
   ) {}

   async generateEOAWallet(...) {
     // ... wallet creation logic

     // Audit log: Wallet created
     await this.auditService.log({
       userId,
       action: AuditAction.ALCHEMY_WALLET_CREATED,
       resource: AuditResource.ALCHEMY_WALLET,
       resourceId: wallet.id,
       metadata: {
         address: wallet.address,
         blockchain: blockchain || 'MULTI_CHAIN',
         network: network || 'MULTI_NETWORK',
         accountType: 'EOA',
       },
       actorType: ActorType.USER,
       severity: AuditSeverity.MEDIUM,
       status: AuditStatus.SUCCESS,
     });
   }

   async getDecryptedPrivateKey(...) {
     // Audit log: Private key accessed
     await this.auditService.log({
       userId,
       action: AuditAction.ALCHEMY_PRIVATE_KEY_ACCESSED,
       resource: AuditResource.ALCHEMY_WALLET,
       resourceId: walletId,
       metadata: {
         walletAddress: wallet.address,
         reason: 'TRANSACTION_SIGNING', // or 'EXPORT'
       },
       actorType: ActorType.USER,
       severity: AuditSeverity.HIGH, // HIGH - sensitive operation
       status: AuditStatus.SUCCESS,
     });
   }

   async exportSeedPhrase(...) {
     // Audit log: Seed phrase exported
     await this.auditService.log({
       userId,
       action: AuditAction.ALCHEMY_SEED_PHRASE_EXPORTED,
       resource: AuditResource.ALCHEMY_WALLET,
       resourceId: walletId,
       metadata: {
         walletAddress: wallet.address,
       },
       actorType: ActorType.USER,
       severity: AuditSeverity.CRITICAL, // CRITICAL - highest security risk
       status: AuditStatus.SUCCESS,
     });
   }
   ```

   **alchemy-transaction.service.ts**:

   ```typescript
   constructor(
     // ... existing
     private readonly auditService: AuditService, // ADD THIS
   ) {}

   async sendToken(...) {
     // ... send logic

     // Audit log: Token sent
     await this.auditService.log({
       userId,
       action: AuditAction.ALCHEMY_TOKEN_SENT,
       resource: AuditResource.ALCHEMY_TRANSACTION,
       resourceId: transaction.id,
       metadata: {
         walletId,
         tokenType,
         amount,
         destinationAddress,
         transactionHash: txHash,
       },
       actorType: ActorType.USER,
       severity: AuditSeverity.HIGH,
       status: AuditStatus.SUCCESS,
     });
   }

   async getTokenBalance(...) {
     // Audit log: Balance checked
     await this.auditService.log({
       userId,
       action: AuditAction.ALCHEMY_BALANCE_CHECKED,
       resource: AuditResource.ALCHEMY_WALLET,
       resourceId: walletId,
       metadata: {
         tokenType,
         balance,
       },
       actorType: ActorType.USER,
       severity: AuditSeverity.LOW,
       status: AuditStatus.SUCCESS,
     });
   }
   ```

   **alchemy-webhook.service.ts**:

   ```typescript
   constructor(
     // ... existing
     private readonly auditService: AuditService, // ADD THIS
   ) {}

   async processAddressActivity(payload: any) {
     // Audit log: Webhook received
     await this.auditService.log({
       userId: null,
       action: AuditAction.ALCHEMY_WEBHOOK_RECEIVED,
       resource: AuditResource.ALCHEMY,
       resourceId: payload.id,
       metadata: {
         webhookType: payload.type,
         network: payload.event?.network,
       },
       actorType: ActorType.SYSTEM,
       severity: AuditSeverity.LOW,
       status: AuditStatus.SUCCESS,
     });

     // ... process logic

     // Audit log: Webhook processed
     await this.auditService.log({
       userId: null,
       action: AuditAction.ALCHEMY_WEBHOOK_PROCESSED,
       resource: AuditResource.ALCHEMY,
       resourceId: payload.id,
       metadata: {
         activitiesProcessed: event.activity?.length || 0,
       },
       actorType: ActorType.SYSTEM,
       severity: AuditSeverity.LOW,
       status: AuditStatus.SUCCESS,
     });
   }
   ```

---

### 3. **Stablecoin Wallet Endpoint Updates**

**New Endpoint Logic** (`POST /alchemy/wallets/create-stablecoin-wallet`):

```typescript
async createStablecoinWallet(dto: CreateStablecoinWalletDto, userId: string) {
  // 1. Check if user has ANY AlchemyWallet
  let alchemyWallet = await this.prisma.alchemyWallet.findUnique({
    where: { userId },
  });

  // 2. If no wallet exists, create one
  if (!alchemyWallet) {
    alchemyWallet = await this.walletService.generateEOAWallet({
      userId,
      // Don't specify blockchain/network - it's a universal wallet
      name: 'Stablecoin Wallet',
    });
  }

  // 3. Check if StablecoinWallet already exists for this token/network combo
  const existingStablecoinWallet = await this.prisma.stablecoinWallet.findUnique({
    where: {
      userId_tokenType_blockchain_network: {
        userId,
        tokenType: dto.tokenType,
        blockchain: dto.blockchain,
        network: dto.network,
      },
    },
  });

  if (existingStablecoinWallet) {
    // Return existing wallet - same address
    return {
      success: true,
      data: {
        id: existingStablecoinWallet.id,
        address: alchemyWallet.address, // Same address
        tokenType: dto.tokenType,
        blockchain: dto.blockchain,
        network: dto.network,
        qrCode: generateQRCode(alchemyWallet.address),
        createdAt: existingStablecoinWallet.createdAt,
      },
    };
  }

  // 4. Create StablecoinWallet record (links to existing AlchemyWallet)
  const stablecoinWallet = await this.prisma.stablecoinWallet.create({
    data: {
      userId,
      alchemyWalletId: alchemyWallet.id,
      tokenType: dto.tokenType,
      blockchain: dto.blockchain,
      network: dto.network,
      address: alchemyWallet.address, // Same address as AlchemyWallet
      monthlyIncomeRange: dto.monthlyIncomeRange,
      bankStatementUrl: dto.bankStatementUrl,
      termsAccepted: dto.termsAccepted,
      termsAcceptedAt: new Date(),
      status: 'ACTIVE',
    },
  });

  // 5. Audit log
  await this.auditService.log({
    userId,
    action: AuditAction.STABLECOIN_WALLET_CREATED,
    resource: AuditResource.STABLECOIN_WALLET,
    resourceId: stablecoinWallet.id,
    metadata: {
      tokenType: dto.tokenType,
      blockchain: dto.blockchain,
      network: dto.network,
      address: alchemyWallet.address,
    },
    actorType: ActorType.USER,
    severity: AuditSeverity.MEDIUM,
    status: AuditStatus.SUCCESS,
  });

  return {
    success: true,
    data: {
      id: stablecoinWallet.id,
      address: alchemyWallet.address,
      tokenType: dto.tokenType,
      blockchain: dto.blockchain,
      network: dto.network,
      qrCode: generateQRCode(alchemyWallet.address),
      createdAt: stablecoinWallet.createdAt,
    },
  };
}
```

**New Endpoint: Get Wallet by Token & Network**:

```typescript
// GET /alchemy/wallets/stablecoin/by-token/:tokenType/:blockchain/:network
// Returns the SAME wallet address regardless of token/network
// Shows which token and network to send
```

---

### 4. **Webhook Handler for Stablecoin Deposits**

**Update `alchemy-webhook.service.ts`**:

```typescript
private async processActivity(activity: any, network: string) {
  const { hash, blockNum, fromAddress, toAddress, category, value, asset } = activity;

  // Check if this is an ERC-20 token transfer (USDC/USDT)
  if (category === 'erc20' && asset) {
    const tokenAddress = asset.toLowerCase();

    // Check if destination address matches any StablecoinWallet
    const stablecoinWallet = await this.prisma.stablecoinWallet.findFirst({
      where: {
        address: toAddress.toLowerCase(),
        // Match token by contract address
        OR: [
          { tokenType: 'USDC' },
          { tokenType: 'USDT' },
        ],
      },
      include: {
        alchemyWallet: true,
      },
    });

    if (stablecoinWallet) {
      // Create StablecoinDeposit record
      const deposit = await this.prisma.stablecoinDeposit.create({
        data: {
          stablecoinWalletId: stablecoinWallet.id,
          transactionHash: hash,
          tokenType: stablecoinWallet.tokenType,
          amount: value, // Token amount
          blockchain: stablecoinWallet.blockchain,
          network: stablecoinWallet.network,
          blockNumber: blockNum?.toString(),
          status: 'PENDING',
        },
      });

      // Audit log
      await this.auditService.log({
        userId: stablecoinWallet.userId,
        action: AuditAction.STABLECOIN_DEPOSIT_RECEIVED,
        resource: AuditResource.STABLECOIN_DEPOSIT,
        resourceId: deposit.id,
        metadata: {
          transactionHash: hash,
          tokenType: stablecoinWallet.tokenType,
          amount: value,
          network,
        },
        actorType: ActorType.SYSTEM,
        severity: AuditSeverity.MEDIUM,
        status: AuditStatus.SUCCESS,
      });

      // Wait for confirmations, then update status to CONFIRMED
      // (Implement confirmation logic)
    }
  }
}
```

---

## ✅ Alchemy Free Tier Features - Implementation Status

### Must Have Features:

| Feature                                        | Status             | Implementation                                                 |
| ---------------------------------------------- | ------------------ | -------------------------------------------------------------- |
| **1. Node API** - Basic blockchain access      | ✅ **IMPLEMENTED** | Using `viem` with Alchemy RPC endpoints                        |
| **2. Token API** - Easy balance checking       | ✅ **IMPLEMENTED** | `getTokenBalance()` in `alchemy-transaction.service.ts`        |
| **3. Webhooks (5 included)** - Detect deposits | ✅ **IMPLEMENTED** | `alchemy-webhook.service.ts` handles address activity          |
| **4. Transfers API** - Transaction history     | ✅ **IMPLEMENTED** | `getTransactionHistory()` in `alchemy-transaction.service.ts`  |
| **5. Mainnet + Testnet** - Build and deploy    | ✅ **IMPLEMENTED** | Network config supports both (see `alchemy-config.service.ts`) |

### Nice to Have Features:

| Feature                          | Status                 | Notes                                        |
| -------------------------------- | ---------------------- | -------------------------------------------- |
| **Transaction Simulation**       | ❌ **NOT IMPLEMENTED** | Could be useful for gas estimation           |
| **Smart Websockets**             | ❌ **NOT IMPLEMENTED** | Currently using webhooks (sufficient for V1) |
| **Analytics & Request Explorer** | ❌ **NOT IMPLEMENTED** | Available in Alchemy dashboard               |

**Conclusion**: All **Must Have** features are implemented. Nice-to-have features are not critical for V1.

---

## 📋 Database Schema Updates Required

### 1. Update `AlchemyWallet` Model

```prisma
model AlchemyWallet {
  id                    String                 @id @default(uuid())
  userId                String
  address               String                 @unique  // Same address for all networks
  encryptedPrivateKey   String
  encryptedMnemonic     String?
  blockchain            String?                // Optional - for reference
  network               String?                // Optional - for reference
  accountType           AlchemyAccountType     @default(EOA)
  state                 AlchemyWalletState     @default(ACTIVE)
  name                  String?
  isGasSponsored        Boolean                @default(false)
  gasPolicyId           String?
  alchemyAppId          String?
  webhookId             String?
  lastKeyRotation       DateTime?
  keyRotationCount      Int                    @default(0)
  createdAt             DateTime               @default(now())
  updatedAt             DateTime               @updatedAt

  user                  User                   @relation(fields: [userId], references: [id], onDelete: Cascade)
  alchemyTransactions   AlchemyTransaction[]
  stablecoinWallets      StablecoinWallet[]    // NEW relation

  @@unique([userId])  // ONE wallet per user
  @@index([userId])
  @@index([address])
}
```

### 2. Add `StablecoinWallet` Model (from implementation plan)

```prisma
model StablecoinWallet {
  id                String   @id @default(cuid())
  userId            String
  alchemyWalletId  String   // Reference to AlchemyWallet.id
  tokenType         String   // 'USDT' | 'USDC'
  blockchain        String   // 'ETHEREUM' | 'POLYGON' | 'ARBITRUM' | 'BSC' | 'SOLANA'
  network           String   // 'mainnet' | 'sepolia' | 'mumbai' | etc.
  address           String   // Same as AlchemyWallet.address
  monthlyIncomeRange String?  // Income range selected
  bankStatementUrl  String?  // Cloudinary URL
  termsAccepted     Boolean  @default(false)
  termsAcceptedAt   DateTime?
  status            String   @default("ACTIVE") // 'ACTIVE' | 'SUSPENDED' | 'CLOSED'
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  alchemyWallet     AlchemyWallet @relation(fields: [alchemyWalletId], references: [id])
  deposits          StablecoinDeposit[]

  @@unique([userId, tokenType, blockchain, network])
  @@index([userId])
  @@index([address])
}
```

### 3. Add `StablecoinDeposit` Model (from implementation plan)

```prisma
model StablecoinDeposit {
  id                String   @id @default(cuid())
  stablecoinWalletId String
  transactionHash   String   @unique
  tokenType         String   // 'USDT' | 'USDC'
  amount            String   // Amount in token units (e.g., "100.50")
  amountUSD         Decimal? // Converted USD amount
  blockchain        String
  network           String
  blockNumber       String?
  status            String   @default("PENDING") // 'PENDING' | 'CONFIRMED' | 'CONVERTED' | 'FAILED'
  confirmedAt       DateTime?
  convertedAt       DateTime?
  nairaCredited     Boolean  @default(false) // V2: Whether Naira was credited
  nairaAmount       Decimal? // V2: Amount credited in Naira
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  stablecoinWallet StablecoinWallet @relation(fields: [stablecoinWalletId], references: [id])

  @@index([stablecoinWalletId])
  @@index([transactionHash])
  @@index([status])
}
```

---

## 🔧 Implementation Checklist

### Phase 1: Database & Schema (Priority: HIGH)

- [ ] Update `AlchemyWallet` model - remove blockchain/network from unique constraint
- [ ] Add `@@unique([userId])` to ensure one wallet per user
- [ ] Add `StablecoinWallet` model
- [ ] Add `StablecoinDeposit` model
- [ ] Create migration file
- [ ] Run migration

### Phase 2: Audit Logging (Priority: HIGH)

- [ ] Add `AuditService` to `AlchemyModule`
- [ ] Add Alchemy audit actions to `audit-log.types.ts`
- [ ] Add Alchemy audit resources to `audit-log.types.ts`
- [ ] Update `alchemy-wallet-generation.service.ts` with audit logs
- [ ] Update `alchemy-transaction.service.ts` with audit logs
- [ ] Update `alchemy-webhook.service.ts` with audit logs
- [ ] Test audit logging works correctly

### Phase 3: Wallet Creation Logic (Priority: CRITICAL)

- [ ] Update `generateEOAWallet()` to check for existing wallet first
- [ ] Return existing wallet if user already has one
- [ ] Create new wallet only if user doesn't have one
- [ ] Update `createStablecoinWallet()` endpoint logic
- [ ] Add endpoint: `GET /alchemy/wallets/stablecoin/by-token/:tokenType/:blockchain/:network`
- [ ] Test wallet creation flow

### Phase 4: Webhook Updates (Priority: HIGH)

- [ ] Update webhook handler to detect ERC-20 token transfers
- [ ] Match deposits to `StablecoinWallet` records
- [ ] Create `StablecoinDeposit` records
- [ ] Add audit logging for deposits
- [ ] Test webhook with testnet transactions

### Phase 5: Testing (Priority: HIGH)

- [ ] Test: User creates wallet for USDC Ethereum → gets address
- [ ] Test: Same user selects USDT Polygon → gets SAME address
- [ ] Test: Webhook receives deposit → creates deposit record
- [ ] Test: Audit logs are created for all operations
- [ ] Test: Admin can view deposits

---

## 📝 Updated API Endpoints

### Create Stablecoin Wallet

```
POST /alchemy/wallets/create-stablecoin-wallet
```

**Behavior:**

- If user has no wallet → Create new AlchemyWallet + StablecoinWallet
- If user has wallet → Return existing address, create StablecoinWallet record
- Always returns same address regardless of token/network

### Get Wallet by Token & Network

```
GET /alchemy/wallets/stablecoin/by-token/:tokenType/:blockchain/:network
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "stablecoin-wallet-id",
    "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "tokenType": "USDC",
    "blockchain": "ETHEREUM",
    "network": "mainnet",
    "qrCode": "base64...",
    "message": "Send USDC on Ethereum mainnet to this address"
  }
}
```

---

## 🎯 Summary

### Critical Changes:

1. ✅ **One wallet per user** (not per network) - **CRITICAL**
2. ✅ **Audit logging** for all Alchemy operations - **HIGH PRIORITY**
3. ✅ **Webhook handler** for stablecoin deposits - **HIGH PRIORITY**
4. ✅ **Database schema updates** - **CRITICAL**

### Alchemy Features Status:

- ✅ All **Must Have** features are implemented
- ❌ Nice-to-have features not implemented (not needed for V1)

### Next Steps:

1. Update database schema
2. Implement audit logging
3. Update wallet creation logic
4. Update webhook handler
5. Test end-to-end flow

---

## 📚 References

- Implementation Plan: `.cursor/plans/alchemy_stablecoin_v1_implementation_plan.md`
- Current Wallet Service: `apps/raverpay-api/src/alchemy/wallets/alchemy-wallet-generation.service.ts`
- Audit Service: `apps/raverpay-api/src/common/services/audit.service.ts`
- Webhook Service: `apps/raverpay-api/src/alchemy/webhooks/alchemy-webhook.service.ts`
