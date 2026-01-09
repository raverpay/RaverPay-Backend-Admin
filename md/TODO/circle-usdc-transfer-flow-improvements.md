# Circle USDC Transfer Flow - Implementation TODO

**Created:** 2025-01-09  
**Status:** Planning  
**Priority:** High  

This document outlines the missing implementations and improvements needed for the Circle USDC transfer flow with gas sponsorship.

---

## Table of Contents

1. [Critical: Company Treasury Wallets](#1-critical-company-treasury-wallets)
2. [Network Configuration Cleanup](#2-network-configuration-cleanup)
3. [Admin Dashboard Enhancements](#3-admin-dashboard-enhancements)
4. [Mobile App Fee Level Fix](#4-mobile-app-fee-level-fix)
5. [Analytics & Billing](#5-analytics--billing)
6. [Testing & Verification](#6-testing--verification)

---

## 1. Critical: Company Treasury Wallets

**Priority:** 🔴 CRITICAL  
**Status:** ⏳ Not Started  
**Impact:** Fee collection will fail without this

### Problem
Collection wallet addresses are empty strings in the default configuration. Without valid company wallet addresses, fee collection will fail.

### Current State
```typescript
// File: /apps/raverpay-api/src/circle/fees/fee-configuration.service.ts
collectionWallets: {
  'BASE-MAINNET': '',  // ❌ Empty
  'OP-MAINNET': '',
  'ARB-MAINNET': '',
  'MATIC-POLYGON': '',
  'BASE-SEPOLIA': '',
  'OP-SEPOLIA': '',
  'ARB-SEPOLIA': '',
  'MATIC-AMOY': '',
}
```

### Tasks

- [ ] **1.1** Create company treasury wallets on Circle Developer Console for each supported network
  - [ ] BASE-SEPOLIA (testnet)
  - [ ] OP-SEPOLIA (testnet)
  - [ ] ARB-SEPOLIA (testnet)
  - [ ] MATIC-AMOY (testnet)
  - [ ] BASE (mainnet)
  - [ ] OP (mainnet)
  - [ ] ARB (mainnet)
  - [ ] MATIC (mainnet)

- [ ] **1.2** Update the `CIRCLE_FEE_CONFIG` in the `system_config` database table with the actual wallet addresses

- [ ] **1.3** Add validation on app startup to warn if collection wallets are not configured

### Files to Modify
- `/apps/raverpay-api/src/circle/fees/fee-configuration.service.ts`
- Database: `system_config` table

---

## 2. Network Configuration Cleanup

**Priority:** 🟡 Medium  
**Status:** ⏳ Not Started  
**Impact:** Consistency, prevents user confusion

### Problem
ETH-SEPOLIA references still exist in DTOs and various configurations, but it's not in the supported networks list. This can cause confusion and potential failed wallet creation attempts.

### Current Inconsistency

| Location | Includes ETH-SEPOLIA? |
|----------|----------------------|
| `getSupportedBlockchains()` | ❌ No |
| `getChainMetadata()` | ❌ No |
| DTOs (`CreateCircleWalletDto`) | ✅ Yes (incorrect) |
| Paymaster Service | ✅ Yes (incorrect) |
| CCTP Service | ✅ Yes (incorrect) |

### Tasks

- [ ] **2.1** Remove ETH-SEPOLIA from DTOs
  - File: `/apps/raverpay-api/src/circle/dto/index.ts`
  - Update enum arrays in:
    - `CreateCircleWalletDto` (line 31)
    - `CCTPTransferDto` (line 207)
    - Other relevant DTOs

- [ ] **2.2** Remove ETH-SEPOLIA from Paymaster configurations
  - File: `/apps/raverpay-api/src/circle/paymaster/paymaster.service.ts`
  - File: `/apps/raverpay-api/src/circle/paymaster/paymaster-v2.service.ts`
  - File: `/apps/raverpay-api/src/circle/paymaster/bundler.service.ts`
  - File: `/apps/raverpay-api/src/circle/paymaster/paymaster-event.service.ts`

- [ ] **2.3** Remove ETH-SEPOLIA from CCTP service
  - File: `/apps/raverpay-api/src/circle/transactions/cctp.service.ts`

- [ ] **2.4** Update User-Controlled Wallet controller
  - File: `/apps/raverpay-api/src/circle/user-controlled/user-controlled-wallet.controller.ts`
  - Remove ETH-SEPOLIA token ID mapping (line 397)

- [ ] **2.5** Update email templates (optional, for display purposes)
  - File: `/apps/raverpay-api/src/services/email/templates/circle-usdc-transaction.template.ts`
  - File: `/apps/raverpay-api/src/services/email/templates/circle-wallet-created.template.ts`
  - File: `/apps/raverpay-api/src/services/email/templates/cctp-transfer.template.ts`

### Files to Modify
- `/apps/raverpay-api/src/circle/dto/index.ts`
- `/apps/raverpay-api/src/circle/paymaster/*.ts`
- `/apps/raverpay-api/src/circle/transactions/cctp.service.ts`
- `/apps/raverpay-api/src/circle/user-controlled/user-controlled-wallet.controller.ts`
- Email templates (optional)

---

## 3. Admin Dashboard Enhancements

**Priority:** 🟡 Medium  
**Status:** ⏳ Not Started  
**Impact:** Admin UX, operational control

### 3.1 Collection Wallet Address Editing

**Problem:** Admin can view collection wallets but cannot edit them in the UI.

**Current State:**
- Fee config page shows wallets as read-only
- API already supports updating `collectionWallets` via `PUT /circle/fees/config`

#### Tasks

- [ ] **3.1.1** Add editable input fields for each collection wallet address
  - File: `/apps/raverpay-admin/app/dashboard/circle-wallets/fee-config/page.tsx`
  
- [ ] **3.1.2** Add validation for wallet addresses (valid Ethereum address format)

- [ ] **3.1.3** Add confirmation modal before saving wallet address changes

### 3.2 Blockchain Activation/Deactivation

**Problem:** Supported blockchains are hardcoded. Admins cannot enable/disable networks.

**Current State:**
- Networks are defined in `getSupportedBlockchains()` method
- No database-backed configuration

#### Tasks

- [ ] **3.2.1** Create database model for blockchain configuration
  ```prisma
  model BlockchainConfig {
    id          String   @id @default(uuid())
    blockchain  String   @unique
    name        String
    symbol      String
    isEnabled   Boolean  @default(true)
    isTestnet   Boolean  @default(false)
    feeLabel    String?
    estimatedCost String?
    isRecommended Boolean @default(false)
    order       Int      @default(0)
    createdAt   DateTime @default(now())
    updatedAt   DateTime @updatedAt
  }
  ```

- [ ] **3.2.2** Create BlockchainConfigService to manage configurations

- [ ] **3.2.3** Migrate `getSupportedBlockchains()` to read from database

- [ ] **3.2.4** Add admin API endpoints:
  - `GET /admin/circle/blockchains` - List all blockchain configs
  - `PUT /admin/circle/blockchains/:blockchain` - Update config
  - `POST /admin/circle/blockchains/:blockchain/enable` - Enable
  - `POST /admin/circle/blockchains/:blockchain/disable` - Disable

- [ ] **3.2.5** Create admin UI page for blockchain management
  - File: `/apps/raverpay-admin/app/dashboard/circle-wallets/settings/blockchains/page.tsx`
  - Toggle switches for enable/disable
  - Reorder capability
  - Edit fee labels and descriptions

### Files to Create/Modify
- `/apps/raverpay-api/prisma/schema.prisma` - Add new model
- `/apps/raverpay-api/src/circle/config/blockchain-config.service.ts` - New service
- `/apps/raverpay-api/src/admin/circle/admin-circle.controller.ts` - Add endpoints
- `/apps/raverpay-admin/app/dashboard/circle-wallets/fee-config/page.tsx` - Add wallet inputs
- `/apps/raverpay-admin/app/dashboard/circle-wallets/settings/blockchains/page.tsx` - New page

---

## 4. Mobile App Fee Level Fix

**Priority:** 🟡 Medium  
**Status:** ⏳ Not Started  
**Impact:** UX, accurate fee estimation

### Problem
When user toggles fee level (LOW/MEDIUM/HIGH), the estimated gas fee is NOT recalculated.

### Current State
```typescript
// File: /apps/raverpay-mobile/app/circle/send.tsx (lines 167-202)
useEffect(() => {
  const estimate = async () => {
    // ... estimation logic
    const result = await estimateFee({
      walletId: selectedWallet.id,
      destinationAddress,
      amount,
      blockchain: selectedWallet.blockchain,
      // ❌ feeLevel is NOT passed!
    });
  };
  estimate();
}, [amount, destinationAddress, selectedWallet, addressValid, estimateFee, chainsData]);
// ❌ feeLevel is NOT in dependency array!
```

### Tasks

- [ ] **4.1** Add `feeLevel` to the estimation API call
  ```typescript
  const result = await estimateFee({
    walletId: selectedWallet.id,
    destinationAddress,
    amount,
    blockchain: selectedWallet.blockchain,
    feeLevel,  // Add this
  });
  ```

- [ ] **4.2** Add `feeLevel` to the `useEffect` dependency array
  ```typescript
  }, [amount, destinationAddress, selectedWallet, addressValid, estimateFee, chainsData, feeLevel]);
  ```

- [ ] **4.3** Update the `EstimateFeeDto` to accept `feeLevel` parameter (if not already)
  - File: `/apps/raverpay-api/src/circle/dto/index.ts`

- [ ] **4.4** Update `estimateFee` service method to use `feeLevel`
  - File: `/apps/raverpay-api/src/circle/transactions/circle-transaction.service.ts`

- [ ] **4.5** Update the mobile hook `useEstimateFee` to pass `feeLevel`
  - File: `/apps/raverpay-mobile/src/hooks/useCircleWallet.ts`

### Note
Since all chains are gas-sponsored (`feeLabel: 'Free (Sponsored)'`), this change may not have a visible effect on gas fees. However, it's still important for:
1. Future non-sponsored chains
2. Code correctness
3. Paymaster fee estimation (which does vary by fee level)

### Files to Modify
- `/apps/raverpay-mobile/app/circle/send.tsx`
- `/apps/raverpay-mobile/src/hooks/useCircleWallet.ts`
- `/apps/raverpay-api/src/circle/dto/index.ts` (if needed)
- `/apps/raverpay-api/src/circle/transactions/circle-transaction.service.ts` (if needed)

---

## 5. Analytics & Billing

**Priority:** 🟢 Low  
**Status:** ⏳ Not Started  
**Impact:** Business operations, reporting

### Problem
No comprehensive analytics for tracking fee collection, gas costs, and profit margins.

### Current State
- Basic retry queue stats available via `GET /circle/fees/stats`
- No aggregated analytics
- No Circle invoice reconciliation

### Tasks

- [ ] **5.1** Create fee analytics aggregation queries
  - Total fees collected per day/week/month
  - Fees by blockchain
  - Average fee per transaction
  - Fee collection success rate

- [ ] **5.2** Create analytics dashboard page
  - File: `/apps/raverpay-admin/app/dashboard/circle-wallets/analytics/page.tsx`
  - Charts for fee collection trends
  - Comparison by network

- [ ] **5.3** Add estimated vs actual gas tracking
  - Track `estimatedGasUsdc` vs `actualGasUsdc` in PaymasterUserOperation
  - Calculate profit margins

- [ ] **5.4** Create export functionality
  - Export fee collection data to CSV
  - Monthly reports for accounting

- [ ] **5.5** Add Circle invoice reconciliation (future)
  - Track Circle's monthly invoices
  - Compare with collected fees
  - Alert on discrepancies

### Files to Create
- `/apps/raverpay-api/src/admin/circle/circle-analytics.service.ts`
- `/apps/raverpay-admin/app/dashboard/circle-wallets/analytics/page.tsx`

---

## 6. Testing & Verification

**Priority:** 🟡 Medium  
**Status:** ⏳ Not Started  
**Impact:** Reliability, confidence before mainnet

### Tasks

- [ ] **6.1** Verify Gas Station policies are active in Circle Developer Console
  - [ ] BASE-SEPOLIA
  - [ ] OP-SEPOLIA
  - [ ] ARB-SEPOLIA
  - [ ] MATIC-AMOY

- [ ] **6.2** End-to-end test: Complete transfer flow on testnet
  - [ ] Create a transfer of X USDC
  - [ ] Verify two transactions are created (main + fee)
  - [ ] Verify gas is sponsored (no native token needed)
  - [ ] Verify webhooks are received and processed
  - [ ] Verify database is updated correctly
  - [ ] Verify user receives notification

- [ ] **6.3** Test fee collection failure scenarios
  - [ ] What happens if fee transfer fails but main transfer succeeds?
  - [ ] Verify retry mechanism works
  - [ ] Verify admin notification on final failure

- [ ] **6.4** Test balance validation
  - [ ] User with exact amount + fee can transfer
  - [ ] User with insufficient balance gets clear error

- [ ] **6.5** Create automated smoke tests for CI/CD
  - File: `/apps/raverpay-api/test/circle/transfer-flow.e2e-spec.ts`

---

## Implementation Order

### Phase 1: Critical (Before Any Mainnet Activity)
1. ✅ Company Treasury Wallets (Section 1)
2. ✅ Network Configuration Cleanup (Section 2)
3. ✅ Testing & Verification (Section 6)

### Phase 2: Admin Improvements
4. ✅ Collection Wallet Editing (Section 3.1)
5. ✅ Mobile App Fee Level Fix (Section 4)

### Phase 3: Future Enhancements
6. ⏳ Blockchain Activation/Deactivation (Section 3.2)
7. ⏳ Analytics & Billing (Section 5)

---

## Quick Reference: Key Files

### Backend (API)
| File | Purpose |
|------|---------|
| `src/circle/config/circle.config.service.ts` | Chain configuration |
| `src/circle/fees/fee-configuration.service.ts` | Fee config, collection wallets |
| `src/circle/fees/fee-retry.service.ts` | Failed fee retry logic |
| `src/circle/transactions/circle-transaction.service.ts` | Transfer flow (2 transactions) |
| `src/circle/webhooks/circle-webhook.service.ts` | Webhook processing |
| `src/circle/circle.controller.ts` | API endpoints |
| `src/admin/circle/admin-circle.service.ts` | Admin operations |
| `src/circle/dto/index.ts` | Request validation |

### Mobile App
| File | Purpose |
|------|---------|
| `app/circle/send.tsx` | Transfer UI, fee level selection |
| `src/hooks/useCircleWallet.ts` | API hooks |
| `src/services/paymaster.service.ts` | Paymaster integration |

### Admin Dashboard
| File | Purpose |
|------|---------|
| `app/dashboard/circle-wallets/fee-config/page.tsx` | Fee configuration UI |
| `app/dashboard/circle-wallets/fee-collection/page.tsx` | Fee collection stats |
| `app/dashboard/circle-wallets/fee-retries/page.tsx` | Failed fee retries |

---

## Notes

- All gas fees are currently sponsored ("Free") on all supported networks
- Service fee is a fixed 0.5% (configurable via admin)
- Minimum fee is 0.0625 USDC (~₦100 at ₦1,600/$)
- Fee collection uses TWO separate Circle API transactions
- Failed fee collections are automatically retried up to 3 times

---

**Last Updated:** 2025-01-09  
**Author:** System Review
