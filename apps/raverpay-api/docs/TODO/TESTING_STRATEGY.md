# Comprehensive Testing Strategy for RaverPay API

## Overview

This plan outlines a phased approach to implement a robust testing strategy for the RaverPay fintech API. The current state shows only **6 unit tests** for a production API handling real money transactions across 80+ endpoints. This plan prioritizes critical financial logic and gradually expands test coverage.

## Current State Analysis

**Existing Tests:**
- `src/app.controller.spec.ts` - Basic app controller test
- `src/wallet/wallet.controller.spec.ts` - Wallet controller test
- `src/wallet/wallet.service.spec.ts` - Wallet service test
- `src/queue/queue.service.spec.ts` - Queue service test
- `src/common/logging/logtail.service.spec.ts` - Logging service test
- `src/common/analytics/posthog.service.spec.ts` - Analytics service test
- `test/app.e2e-spec.ts` - Basic E2E test (health check)

**Testing Infrastructure:**
- Jest configured for unit tests
- Jest E2E configuration exists
- Pre-commit hooks run tests via `pnpm test`
- Smoke tests for production health checks

---

## User Review Required

> [!IMPORTANT]
> **Test Coverage Target**: This plan aims for **60-80% coverage** on business logic (not 100%). We'll focus on financial calculations, KYC logic, and transaction handling where bugs = money loss.

> [!WARNING]
> **Breaking Changes**: Adding integration tests will require test database setup. You'll need to configure a separate test database or use in-memory SQLite for Prisma tests.

> [!IMPORTANT]
> **Time Estimate**: 
> - Phase 1 (Unit Tests): ~2-3 weeks
> - Phase 2 (Integration Tests): ~1-2 weeks
> - Phase 3 (Contract & E2E): ~1 week
> - **Total: 4-6 weeks** for full implementation

---

## Proposed Changes

### Phase 1: Unit Tests (Priority: CRITICAL 🔴)

Expand unit test coverage from 6 to ~100-150 tests focusing on business logic.

---

#### Financial Logic & Calculations

##### [NEW] `src/wallet/wallet.service.spec.ts` (Enhanced)
**Current:** Basic tests exist  
**Add:**
- `calculateRemaining()` - Limit calculations for all KYC tiers
- Fee calculation logic (if exists in service)
- Balance validation edge cases (negative, zero, max values)
- Decimal precision handling (critical for money)
- Daily/monthly limit tracking accuracy

**Test Cases:**
```typescript
describe('calculateRemaining', () => {
  it('should return correct remaining for Tier 0 daily limit')
  it('should return 0 when spent exceeds limit')
  it('should handle decimal precision correctly')
  it('should handle unlimited tier correctly')
});
```

---

##### [NEW] `src/wallet/kyc-tier-limits.spec.ts`
**Purpose:** Test KYC tier limit constants and logic

**Test Cases:**
- Verify tier limit values match business requirements
- Test tier upgrade logic (TIER_0 → TIER_1 → TIER_2 → TIER_3)
- Validate single transaction limits per tier
- Test `getNextTier()` function

---

##### [NEW] `src/payments/withdrawal-fee.spec.ts`
**Purpose:** Test withdrawal fee calculation

**Test Cases:**
```typescript
describe('Withdrawal Fee Calculation', () => {
  it('should charge ₦25 for amounts < ₦5,000')
  it('should charge ₦50 for amounts ₦5,000 - ₦50,000')
  it('should charge ₦100 for amounts > ₦50,000')
  it('should handle edge cases (exactly ₦5,000, ₦50,000)')
});
```

---

#### KYC & Verification Logic

##### [NEW] `src/users/kyc-verification.spec.ts`
**Purpose:** Test KYC tier upgrade logic

**Test Cases:**
- Email + Phone verified → TIER_1
- BVN verified → TIER_2
- NIN verified → TIER_3
- BVN + NIN verified → TIER_3
- Verify tier doesn't downgrade
- Test verification state transitions

---

##### [NEW] `src/utils/bvn-encryption.service.spec.ts`
**Purpose:** Test BVN/NIN encryption (CRITICAL for security)

**Test Cases:**
```typescript
describe('BVNEncryptionService', () => {
  it('should encrypt BVN correctly')
  it('should decrypt BVN to original value')
  it('should mask BVN for logging (show only last 4 digits)')
  it('should handle empty/null values')
  it('should produce different ciphertext for same plaintext (IV randomization)')
});
```

---

#### Transaction Validation

##### [NEW] `src/transactions/transaction-validator.spec.ts`
**Purpose:** Test transaction validation rules

**Test Cases:**
- Validate sufficient balance before debit
- Validate daily limit not exceeded
- Validate monthly limit not exceeded
- Validate single transaction limit
- Validate wallet not locked
- Validate user KYC tier allows transaction
- Test concurrent transaction handling

---

##### [NEW] `src/wallet/double-entry-bookkeeping.spec.ts`
**Purpose:** Test transaction balance calculations

**Test Cases:**
```typescript
describe('Double Entry Bookkeeping', () => {
  it('should calculate balanceAfter = balanceBefore + amount (credit)')
  it('should calculate balanceAfter = balanceBefore - amount (debit)')
  it('should maintain balance integrity across transactions')
  it('should handle Decimal precision correctly')
});
```

---

#### VTU Service Logic

##### [NEW] `src/vtu/vtu-pricing.spec.ts`
**Purpose:** Test VTU product pricing and validation

**Test Cases:**
- Validate airtime amounts (min/max)
- Validate data bundle pricing
- Validate cable TV package pricing
- Validate electricity minimum amounts
- Test network-specific validations

---

##### [NEW] `src/vtu/order-status-handler.spec.ts`
**Purpose:** Test VTU order state transitions

**Test Cases:**
- PENDING → COMPLETED
- PENDING → FAILED → REFUNDED
- Test refund amount calculation
- Test retry logic for failed orders

---

#### Webhook Signature Verification

##### [NEW] `src/webhooks/paystack-webhook.spec.ts`
**Purpose:** Test webhook security (CRITICAL)

**Test Cases:**
```typescript
describe('Paystack Webhook Verification', () => {
  it('should accept valid signature')
  it('should reject invalid signature')
  it('should reject missing signature')
  it('should reject tampered payload')
  it('should handle signature header variations')
});
```

##### [NEW] `src/webhooks/vtpass-webhook.spec.ts`
**Purpose:** Test VTPass webhook verification

---

#### Notification Logic

##### [NEW] `src/notifications/notification-dispatcher.spec.ts`
**Purpose:** Test notification routing logic

**Test Cases:**
- Test channel selection (email, SMS, push, in-app)
- Test user preference filtering
- Test quiet hours logic
- Test notification batching
- Test retry logic for failed sends

---

#### Security & Rate Limiting

##### [NEW] `src/auth/password-validation.spec.ts`
**Purpose:** Test password security

**Test Cases:**
- Argon2 hashing works correctly
- Password verification works
- Password strength validation
- Prevent password reuse

##### [NEW] `src/users/otp-rate-limiting.spec.ts`
**Purpose:** Test OTP rate limiting

**Test Cases:**
- Max 3 sends per OTP lifecycle
- 2-minute cooldown between sends
- Max 5 verification attempts
- OTP expiry after 10 minutes

---

### Phase 2: Integration Tests (Priority: HIGH 🟡)

Test service + database interactions.

---

#### Database Integration Setup

##### [NEW] `test/setup/test-database.ts`
**Purpose:** Configure test database

**Implementation:**
- Use in-memory SQLite or separate PostgreSQL test DB
- Prisma test client setup
- Database seeding utilities
- Transaction rollback after each test

---

#### Wallet Integration Tests

##### [NEW] `test/integration/wallet/wallet-transactions.integration.spec.ts`
**Purpose:** Test wallet + database operations

**Test Cases:**
```typescript
describe('Wallet Transaction Integration', () => {
  it('should credit wallet and create transaction record')
  it('should debit wallet and update balance')
  it('should update dailySpent and monthlySpent')
  it('should maintain ledger balance correctly')
  it('should handle concurrent transactions safely')
  it('should rollback on transaction failure')
});
```

---

#### Payment Processing Integration

##### [NEW] `test/integration/payments/deposit-flow.integration.spec.ts`
**Purpose:** Test deposit flow end-to-end

**Test Cases:**
- Initiate card payment → Paystack
- Receive webhook → Verify signature
- Credit wallet → Create transaction
- Send notification → User notified
- Cache invalidation → Fresh balance

---

##### [NEW] `test/integration/payments/withdrawal-flow.integration.spec.ts`
**Purpose:** Test withdrawal flow

**Test Cases:**
- Validate balance → Debit wallet
- Create transfer → Paystack
- Handle success webhook → Complete
- Handle failure webhook → Refund
- Audit log creation

---

#### VTU Integration Tests

##### [NEW] `test/integration/vtu/airtime-purchase.integration.spec.ts`
**Purpose:** Test VTU purchase flow

**Test Cases:**
- Check balance → Debit wallet
- Call VTPass API → Purchase
- Handle success → Complete order
- Handle failure → Refund
- Notification dispatch

---

#### Notification Integration

##### [NEW] `test/integration/notifications/multi-channel-dispatch.integration.spec.ts`
**Purpose:** Test notification system

**Test Cases:**
- Dispatch to email service
- Dispatch to SMS service
- Dispatch to push notification service
- Create in-app notification record
- Respect user preferences
- Handle service failures gracefully

---

### Phase 3: Contract & E2E Tests (Priority: MEDIUM 🟢)

---

#### OpenAPI Contract Validation

##### [NEW] `test/contract/openapi-validation.spec.ts`
**Purpose:** Validate API matches OpenAPI spec

**Setup:**
```bash
npm install --save-dev @openapitools/openapi-generator-cli spectral
```

**Test Cases:**
- Validate `openapi.json` against OpenAPI 3.0 spec
- Ensure all endpoints documented
- Validate request/response schemas
- Check for breaking changes on updates

**Run Command:**
```bash
spectral lint apps/raverpay-api/openapi.json
```

---

#### Critical E2E User Journeys

##### [NEW] `test/e2e/user-registration-to-purchase.e2e-spec.ts`
**Purpose:** Test complete user journey

**Flow:**
1. Register user
2. Verify email
3. Verify phone → Upgrade to TIER_1
4. Fund wallet via card
5. Purchase airtime
6. Check transaction history

---

##### [NEW] `test/e2e/withdrawal-flow.e2e-spec.ts`
**Purpose:** Test withdrawal end-to-end

**Flow:**
1. User has funded wallet
2. Add bank account
3. Initiate withdrawal
4. Verify PIN
5. Process transfer
6. Receive webhook
7. Verify balance updated

---

##### [NEW] `test/e2e/kyc-upgrade-flow.e2e-spec.ts`
**Purpose:** Test KYC tier progression

**Flow:**
1. TIER_0 → Verify email + phone → TIER_1
2. TIER_1 → Verify BVN → TIER_2
3. TIER_2 → Verify NIN → TIER_3
4. Verify limits increase at each tier

---

##### [NEW] `test/e2e/failed-transaction-refund.e2e-spec.ts`
**Purpose:** Test refund mechanism

**Flow:**
1. Initiate VTU purchase
2. Simulate VTPass failure
3. Verify wallet refunded
4. Verify transaction marked FAILED
5. Verify refund transaction created

---

### Phase 4: Load & Performance Tests (Priority: LOW 🔵)

**Defer until production scaling needed**

##### [NEW] `test/load/concurrent-transactions.load.ts`
**Purpose:** Test concurrent wallet operations

**Tool:** k6 or Artillery

**Scenarios:**
- 100 concurrent deposits
- 100 concurrent withdrawals
- Mixed read/write operations
- Database connection pool stress test

---

## Verification Plan

### Automated Tests

**Unit Tests:**
```bash
# Run all unit tests
cd apps/raverpay-api
pnpm test

# Run with coverage
pnpm test:cov

# Watch mode during development
pnpm test:watch
```

**Integration Tests:**
```bash
# Run integration tests (after setup)
pnpm test:integration

# Run specific integration test
pnpm test test/integration/wallet/wallet-transactions.integration.spec.ts
```

**E2E Tests:**
```bash
# Run all E2E tests
pnpm test:e2e

# Run specific E2E test
pnpm test:e2e --testNamePattern="user-registration-to-purchase"
```

**Contract Tests:**
```bash
# Validate OpenAPI spec
spectral lint apps/raverpay-api/openapi.json

# Generate and validate API client
openapi-generator-cli validate -i apps/raverpay-api/openapi.json
```

**Pre-commit Checks:**
```bash
# This already runs unit tests
pnpm precommit

# Full check including smoke tests
pnpm check:all
```

---

### Manual Verification

**Phase 1 Completion Checklist:**
- [ ] Run `pnpm test:cov` and verify >60% coverage on `src/wallet`, `src/users`, `src/payments`
- [ ] All financial calculation tests pass
- [ ] All KYC logic tests pass
- [ ] All security tests (encryption, webhooks) pass

**Phase 2 Completion Checklist:**
- [ ] Test database setup works locally
- [ ] Integration tests run successfully in CI/CD
- [ ] No flaky tests (run 10 times, all pass)

**Phase 3 Completion Checklist:**
- [ ] OpenAPI validation passes
- [ ] E2E tests complete successfully
- [ ] E2E tests can run against staging environment

---

### CI/CD Integration

**Update `.github/workflows/test.yml` (if exists):**
```yaml
- name: Run Unit Tests
  run: pnpm test --coverage

- name: Run Integration Tests
  run: pnpm test:integration
  env:
    DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}

- name: Run E2E Tests
  run: pnpm test:e2e

- name: Validate OpenAPI
  run: spectral lint apps/raverpay-api/openapi.json
```

---

## Success Metrics

**Phase 1 (Unit Tests):**
- ✅ 100-150 unit tests written
- ✅ 60-80% code coverage on business logic
- ✅ All financial calculations tested
- ✅ All security functions tested

**Phase 2 (Integration Tests):**
- ✅ 20-30 integration tests
- ✅ All critical flows tested (deposit, withdrawal, VTU)
- ✅ Database interactions verified

**Phase 3 (Contract & E2E):**
- ✅ OpenAPI spec validated
- ✅ 5-10 E2E tests for critical journeys
- ✅ No breaking API changes

**Overall:**
- ✅ Pre-commit checks pass consistently
- ✅ CI/CD pipeline green
- ✅ Test execution time < 5 minutes for unit tests
- ✅ Zero production bugs related to tested logic

---

## Dependencies & Prerequisites

**Required Packages:**
```json
{
  "devDependencies": {
    "@nestjs/testing": "^11.0.1",  // ✅ Already installed
    "jest": "^30.0.0",              // ✅ Already installed
    "supertest": "^7.0.0",          // ✅ Already installed
    "spectral": "^6.11.0",          // ❌ Need to install
    "@openapitools/openapi-generator-cli": "^2.7.0"  // ❌ Need to install
  }
}
```

**Environment Setup:**
- Test database (PostgreSQL or SQLite)
- Test API keys for external services (Paystack, VTPass)
- CI/CD environment variables

---

## Risk Mitigation

**Risk:** Test database conflicts with production  
**Mitigation:** Use separate `DATABASE_URL` for tests, never point to production

**Risk:** External API calls in tests (slow, expensive)  
**Mitigation:** Mock external services (Paystack, VTPass) in unit/integration tests

**Risk:** Flaky tests due to timing issues  
**Mitigation:** Use proper async/await, increase timeouts where needed, avoid sleep()

**Risk:** Test maintenance burden  
**Mitigation:** Focus on business logic, not implementation details. Test behavior, not internals.

---

## Next Steps After Approval

1. **Install dependencies** (spectral, openapi-generator-cli)
2. **Set up test database** configuration
3. **Create test utilities** (factories, mocks, helpers)
4. **Start Phase 1** with highest priority tests (wallet, KYC, security)
5. **Iterate and expand** based on coverage reports
