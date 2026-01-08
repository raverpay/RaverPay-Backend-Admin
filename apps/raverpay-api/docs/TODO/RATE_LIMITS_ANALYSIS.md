# Rate Limiting Analysis & Recommendations

## Overview

This document provides a comprehensive analysis of all rate limits implemented in the RaverPay API, identifies gaps, and provides recommendations for improvements.

**Last Updated:** January 7, 2026  
**Analysis Method:** Direct codebase inspection via grep search  
**Total @Throttle Decorators Found:** 17

---

## Executive Summary

✅ **Current Status:** GOOD  
📊 **Explicit Rate Limits:** 17 endpoints with `@Throttle` decorators  
🌐 **Global Protection:** 200 req/min baseline + burst protection  
🔴 **Critical Gaps:** 3 identified (Virtual account requery, Paystack client-side, Read endpoints)  
🎯 **Recommendation:** Implement critical gaps to achieve EXCELLENT status

---

## Table of Contents

1. [Global Rate Limits](#global-rate-limits)
2. [Endpoint-Specific Rate Limits](#endpoint-specific-rate-limits)
3. [Application-Level Rate Limits](#application-level-rate-limits)
4. [External Service Rate Limits](#external-service-rate-limits)
5. [Gaps & Recommendations](#gaps--recommendations)
6. [Implementation Status](#implementation-status)

---

## Global Rate Limits

### Throttler Configuration

**Location:** `src/app.module.ts` (lines 55-78)  
**Verified:** ✅ Active in codebase

| Throttler Name | Time Window | Limit        | Purpose                 |
| -------------- | ----------- | ------------ | ----------------------- |
| `default`      | 60 seconds  | 200 requests | General API protection  |
| `short`        | 10 seconds  | 20 requests  | Burst protection        |
| `burst`        | 5 seconds   | 1 request    | Strict burst protection |

**Storage:** Redis-based distributed rate limiting via `RedisThrottlerStorage`  
**Tracking:** User ID (authenticated) or IP address (unauthenticated)  
**Fallback:** In-memory storage if Redis unavailable

**✅ Status:** Well-configured with multiple time windows

---

## Endpoint-Specific Rate Limits

### Summary of Implemented Rate Limits

**Total Endpoints with @Throttle:** 17  
**Controllers Affected:** 4 (Auth, Transactions, VTU, Admin Wallets)

| Category         | Count | Controllers                   |
| ---------------- | ----- | ----------------------------- |
| Authentication   | 3     | `auth.controller.ts`          |
| Transactions     | 3     | `transactions.controller.ts`  |
| VTU Services     | 7     | `vtu.controller.ts`           |
| Admin Operations | 4     | `admin-wallets.controller.ts` |

---

### Authentication Endpoints

#### 1. User Registration

**Endpoint:** `POST /auth/register`  
**Location:** `src/auth/auth.controller.ts` (line 53)

```typescript
@Throttle({ default: { limit: 3, ttl: 3600000 } })
```

- **Limit:** 3 registrations per hour per IP
- **Rationale:** Prevent automated account creation, spam
- **✅ Status:** Appropriate for preventing abuse

---

#### 2. User Login

**Endpoint:** `POST /auth/login`  
**Location:** `src/auth/auth.controller.ts` (line 97)

```typescript
@Throttle({ default: { limit: 5, ttl: 900000 } })
```

- **Limit:** 5 login attempts per 15 minutes per IP
- **Rationale:** Brute force protection
- **Additional Protection:** Account locking after failed attempts
- **✅ Status:** Good, combined with account locking mechanism

---

#### 3. Password Reset Request

**Endpoint:** `POST /auth/forgot-password`  
**Location:** `src/auth/auth.controller.ts` (line 237)

```typescript
@Throttle({ default: { limit: 3, ttl: 3600000 } })
```

- **Limit:** 3 password reset requests per hour per IP
- **Rationale:** Prevent email flooding, enumeration attacks
- **✅ Status:** Appropriate

---

### Transaction Endpoints

#### 4. Card Funding

**Endpoint:** `POST /transactions/fund/card`  
**Location:** `src/transactions/transactions.controller.ts` (lines 43-46)

```typescript
@Throttle({
  default: { limit: 10, ttl: 3600000 },
  burst: { limit: 1, ttl: 5000 },
})
```

- **Limit:** 10 card funding attempts per hour + 1 per 5 seconds burst
- **Rationale:** Prevent payment gateway abuse, reduce failed transaction costs
- **Idempotency:** ✅ Enabled via `@Idempotent()` decorator
- **✅ Status:** Excellent - dual rate limit with idempotency

---

#### 5. Withdrawals

**Endpoint:** `POST /transactions/withdraw`  
**Location:** `src/transactions/transactions.controller.ts` (lines 166-169)

```typescript
@Throttle({
  default: { limit: 5, ttl: 3600000 },
  burst: { limit: 1, ttl: 5000 },
})
```

- **Limit:** 5 withdrawals per hour + 1 per 5 seconds burst
- **Rationale:** Prevent rapid fund drainage, reduce transfer fees
- **Additional Protection:** PIN verification required
- **Idempotency:** ✅ Enabled
- **✅ Status:** Excellent - appropriate for financial operations

---

#### 6. P2P Transfers

**Endpoint:** `POST /transactions/send`  
**Location:** `src/transactions/transactions.controller.ts` (lines 259-262)

```typescript
@Throttle({
  default: { limit: 20, ttl: 3600000 },
  burst: { limit: 1, ttl: 5000 },
})
```

- **Limit:** 20 P2P transfers per hour + 1 per 5 seconds burst
- **Rationale:** Balance usability with fraud prevention
- **Idempotency:** ✅ Enabled
- **✅ Status:** Good - higher limit than withdrawals (less risky)

---

### VTU (Virtual Top-Up) Endpoints

#### 7. Airtime Purchase

**Endpoint:** `POST /vtu/airtime/purchase`  
**Location:** `src/vtu/vtu.controller.ts` (lines 214-217)

```typescript
@Throttle({
  default: { limit: 30, ttl: 3600000 },
  burst: { limit: 1, ttl: 5000 },
})
```

- **Limit:** 30 airtime purchases per hour + burst protection
- **Rationale:** High-frequency use case, balance convenience with fraud prevention
- **Idempotency:** ✅ Enabled
- **✅ Status:** Appropriate for high-volume service

---

#### 8. Data Bundle Purchase

**Endpoint:** `POST /vtu/data/purchase`  
**Location:** `src/vtu/vtu.controller.ts` (lines 234-237)

```typescript
@Throttle({
  default: { limit: 30, ttl: 3600000 },
  burst: { limit: 1, ttl: 5000 },
})
```

- **Limit:** 30 data purchases per hour + burst protection
- **Rationale:** Similar to airtime - high-frequency legitimate use
- **Idempotency:** ✅ Enabled
- **✅ Status:** Appropriate

---

#### 9. Cable TV Payment

**Endpoint:** `POST /vtu/cable-tv/pay`  
**Location:** `src/vtu/vtu.controller.ts` (lines 250-253)

```typescript
@Throttle({
  default: { limit: 20, ttl: 3600000 },
  burst: { limit: 1, ttl: 5000 },
})
```

- **Limit:** 20 cable TV payments per hour + burst protection
- **Rationale:** Lower frequency than airtime/data, monthly subscriptions
- **✅ Status:** Appropriate

---

#### 10. Electricity Payment

**Endpoint:** `POST /vtu/electricity/pay`  
**Location:** `src/vtu/vtu.controller.ts` (lines 290-293)

```typescript
@Throttle({
  default: { limit: 20, ttl: 3600000 },
  burst: { limit: 1, ttl: 5000 },
})
```

- **Limit:** 20 electricity payments per hour + burst protection
- **Rationale:** Similar to cable TV - periodic payments
- **✅ Status:** Appropriate

---

#### 11. JAMB PIN Purchase

**Endpoint:** `POST /vtu/education/jamb/purchase`  
**Location:** `src/vtu/vtu.controller.ts` (lines 369-372)

```typescript
@Throttle({
  default: { limit: 10, ttl: 3600000 },
  burst: { limit: 1, ttl: 5000 },
})
```

- **Limit:** 10 JAMB purchases per hour + burst protection
- **Rationale:** Lower frequency, seasonal use (exam registration)
- **✅ Status:** Appropriate

---

#### 12. WAEC PIN Purchase

**Endpoints:**

- `POST /vtu/education/waec-registration/purchase`
- `POST /vtu/education/waec-result/purchase`

**Location:** `src/vtu/vtu.controller.ts` (lines 387-390, 405-408)

```typescript
@Throttle({
  default: { limit: 10, ttl: 3600000 },
  burst: { limit: 1, ttl: 5000 },
})
```

- **Limit:** 10 WAEC purchases per hour + burst protection
- **Rationale:** Similar to JAMB - seasonal, low frequency
- **✅ Status:** Appropriate

---

### Admin Endpoints

#### 13. Admin Wallet Operations

**Controller:** `AdminWalletsController`  
**Location:** `src/admin/wallets/admin-wallets.controller.ts`

| Endpoint           | Limit          | Time Window | Purpose                      |
| ------------------ | -------------- | ----------- | ---------------------------- |
| Controller-wide    | 100 requests   | 1 minute    | General admin protection     |
| Lock Wallet        | 20 locks       | 1 hour      | Prevent abuse of locking     |
| Unlock Wallet      | 20 unlocks     | 1 hour      | Prevent abuse of unlocking   |
| Balance Adjustment | 10 adjustments | 1 hour      | Critical financial operation |

**✅ Status:** Well-protected with granular limits

---

## Application-Level Rate Limits

### OTP (One-Time Password) Rate Limiting

#### Email Verification OTP

**Location:** `src/users/users.service.ts` (lines 495-530)

**Rules:**

1. **Cooldown:** 120 seconds (2 minutes) between sends
2. **Max Resends:** 3 sends per OTP lifecycle (10-minute validity)
3. **Max Attempts:** 5 verification attempts before code expires
4. **Expiry:** 10 minutes

**Implementation:** Application logic (not decorator-based)  
**✅ Status:** Comprehensive OTP protection

---

#### Phone Verification OTP

**Location:** `src/users/users.service.ts` (lines 795-830)

**Rules:** Same as email verification

- 120 seconds cooldown
- 3 sends per lifecycle
- 5 verification attempts
- 10-minute expiry

**✅ Status:** Consistent with email OTP

---

### Virtual Account Requery

**Location:** `src/virtual-accounts/virtual-accounts.service.ts` (line 415)

**Limit:** Once every 10 minutes per account  
**Rationale:** Prevent excessive API calls to Paystack  
**Implementation:** Application logic (documented, not enforced in code)

**⚠️ Status:** MISSING - Documented but not implemented

---

### Account Locking (Security)

**Location:** `src/common/services/account-locking.service.ts`

**Triggers:**

- 3 rate limit violations in 1 hour
- 5 rate limit violations in 24 hours
- 10 rate limit violations in 7 days

**Action:** Automatic account lock  
**✅ Status:** Excellent security measure

---

## External Service Rate Limits

### Notification Services

#### Email (Resend)

**Location:** `src/notifications/notification-queue.processor.ts` (lines 27-40)

**Queue Configuration:**

- **Batch Size:** 2 emails per batch
- **Delay:** 600ms between emails
- **Effective Rate:** ~2 requests/second (Resend limit)
- **Processing:** Every 10 seconds via cron

**✅ Status:** Properly respects Resend API limits

---

#### SMS (Termii/VTPass)

**Queue Configuration:**

- **Batch Size:** 5 SMS per batch
- **Delay:** 200ms between SMS
- **Processing:** Every 10 seconds via cron

**✅ Status:** Conservative rate limiting

---

#### Push Notifications (Expo)

**Queue Configuration:**

- **Batch Size:** 50 push notifications per batch
- **Delay:** 50ms between notifications
- **Processing:** Every 10 seconds via cron

**✅ Status:** Appropriate for Expo's limits

---

#### In-App Notifications

**Queue Configuration:**

- **Batch Size:** 100 notifications per batch
- **Delay:** 10ms between notifications
- **Processing:** Every 10 seconds via cron

**✅ Status:** No external API limits, fast processing

---

### Payment Gateway (Paystack)

**No explicit rate limits configured**

**Paystack Limits (from documentation):**

- Transaction initialization: ~100 req/min
- Account verification: ~60 req/min
- Transfer creation: ~60 req/min

**⚠️ Status:** MISSING - Should implement client-side rate limiting

---

### VTU Provider (VTPass)

**No explicit rate limits configured**

**VTPass Limits (estimated):**

- Purchase requests: Unknown (should verify with provider)
- Balance check: Unknown

**⚠️ Status:** MISSING - Should verify and implement limits

---

## Gaps & Recommendations

### 🔴 CRITICAL Gaps

#### 1. Virtual Account Requery Not Enforced

**Issue:** Documented as "once every 10 minutes" but no code enforcement  
**Location:** `src/virtual-accounts/virtual-accounts.service.ts`

**Recommendation:**

```typescript
@Throttle({ default: { limit: 1, ttl: 600000 } }) // 1 per 10 minutes
async requeryVirtualAccount(userId: string) {
  // ... existing code
}
```

**Priority:** HIGH  
**Impact:** Excessive API calls to Paystack, potential rate limit violations

---

#### 2. Missing Paystack Client-Side Rate Limiting

**Issue:** No protection against hitting Paystack's rate limits  
**Affected Services:**

- Card payment initialization
- Transfer creation
- Account verification

**Recommendation:**

- Implement rate limiting wrapper for Paystack service
- Add retry logic with exponential backoff
- Queue requests during high traffic

**Priority:** HIGH  
**Impact:** API failures, degraded user experience

---

#### 3. Missing VTPass Rate Limit Protection

**Issue:** Unknown VTPass rate limits, no protection implemented

**Recommendation:**

- Contact VTPass to confirm rate limits
- Implement conservative rate limiting (e.g., 30 req/min)
- Add request queuing for high-volume periods

**Priority:** MEDIUM  
**Impact:** Potential service disruption during peak usage

---

### 🟡 MEDIUM Priority Gaps

#### 4. No Rate Limit on Wallet Balance Checks

**Endpoint:** `GET /wallet/balance`  
**Issue:** Unlimited balance checks could be abused

**Recommendation:**

```typescript
@Throttle({ default: { limit: 60, ttl: 60000 } }) // 60 per minute
```

**Priority:** MEDIUM  
**Impact:** Database load, potential DoS vector

---

#### 5. No Rate Limit on Transaction History

**Endpoint:** `GET /wallet/transactions`  
**Issue:** Expensive database queries, no rate limiting

**Recommendation:**

```typescript
@Throttle({ default: { limit: 30, ttl: 60000 } }) // 30 per minute
```

**Priority:** MEDIUM  
**Impact:** Database performance degradation

---

#### 6. No Rate Limit on VTU Product Catalog

**Endpoints:**

- `GET /vtu/data/plans/:network`
- `GET /vtu/cable-tv/plans/:provider`
- `GET /vtu/electricity/providers`

**Issue:** Catalog endpoints could be scraped

**Recommendation:**

```typescript
@Throttle({ default: { limit: 100, ttl: 60000 } }) // 100 per minute
```

**Priority:** LOW  
**Impact:** Minimal - mostly static data

---

### 🟢 LOW Priority Gaps

#### 7. No Rate Limit on User Profile Updates

**Endpoint:** `PUT /users/profile`  
**Issue:** Profile updates are one-time only, but endpoint not rate-limited

**Recommendation:**

```typescript
@Throttle({ default: { limit: 5, ttl: 3600000 } }) // 5 per hour
```

**Priority:** LOW  
**Impact:** Already protected by one-time edit enforcement

---

#### 8. No Rate Limit on Saved Recipients

**Endpoints:**

- `GET /vtu/saved-recipients`
- `POST /vtu/saved-recipients/:id`
- `DELETE /vtu/saved-recipients/:id`

**Recommendation:**

```typescript
@Throttle({ default: { limit: 20, ttl: 60000 } }) // 20 per minute
```

**Priority:** LOW  
**Impact:** Minimal risk

---

## Implementation Status

### ✅ Well-Implemented

1. **Authentication endpoints** - Comprehensive rate limiting
2. **Financial transactions** - Dual rate limits (hourly + burst)
3. **VTU purchases** - Appropriate limits per service type
4. **Admin operations** - Granular protection
5. **OTP system** - Multi-layered rate limiting
6. **Notification queue** - Respects external service limits
7. **Account locking** - Automatic security enforcement
8. **Idempotency** - Prevents duplicate transactions

---

### ⚠️ Needs Improvement

1. **Virtual account requery** - Add decorator-based rate limiting
2. **Paystack integration** - Implement client-side rate limiting
3. **VTPass integration** - Verify and implement limits
4. **Read-heavy endpoints** - Add rate limits to prevent abuse
5. **Catalog endpoints** - Protect against scraping

---

### 📊 Rate Limit Coverage

| Category       | Endpoints | Rate Limited    | Coverage |
| -------------- | --------- | --------------- | -------- |
| Authentication | 8         | 3               | 37.5%    |
| Transactions   | 15        | 3               | 20%      |
| VTU            | 25+       | 7               | ~28%     |
| Wallet         | 10        | 0               | 0%       |
| Admin          | 20+       | 4               | ~20%     |
| Notifications  | 10        | 0 (queue-based) | N/A      |
| **Overall**    | **~90**   | **~17**         | **~19%** |

**Note:** Many endpoints rely on global rate limits (200 req/min), which provides baseline protection.

---

## Recommended Actions

### Immediate (This Week)

1. ✅ Add rate limit to virtual account requery
2. ✅ Implement Paystack client-side rate limiting
3. ✅ Add rate limits to wallet balance and transaction history endpoints

### Short-term (This Month)

4. ✅ Verify VTPass rate limits and implement protection
5. ✅ Add rate limits to VTU catalog endpoints
6. ✅ Implement request queuing for high-traffic periods

### Long-term (This Quarter)

7. ✅ Monitor rate limit violations and adjust limits based on usage patterns
8. ✅ Implement dynamic rate limiting based on user KYC tier
9. ✅ Add rate limit analytics dashboard for admins
10. ✅ Document all rate limits in API documentation

---

## Monitoring Recommendations

### Metrics to Track

1. **Rate limit hits per endpoint** - Identify abuse patterns
2. **Account locks due to rate limits** - Monitor false positives
3. **External API rate limit violations** - Paystack, VTPass
4. **Queue depths** - Notification queue, payment queue
5. **Average response times** - Impact of rate limiting

### Alerting Thresholds

- **Critical:** Paystack/VTPass rate limit violations
- **Warning:** >10 account locks per hour
- **Info:** >100 rate limit hits per hour on any endpoint

---

## Conclusion

**Overall Assessment:** ✅ **GOOD**

The RaverPay API has **strong rate limiting** on critical financial endpoints (transactions, withdrawals, VTU purchases) with excellent dual-layer protection (hourly + burst limits). The OTP system and account locking mechanisms provide robust security.

**Key Strengths:**

- Comprehensive protection on financial operations
- Idempotency prevents duplicate transactions
- Multi-layered rate limiting (global + endpoint-specific)
- Automatic account locking for repeated violations
- Notification queue respects external service limits

**Key Weaknesses:**

- Missing rate limits on read-heavy endpoints (wallet balance, transaction history)
- No client-side rate limiting for external APIs (Paystack, VTPass)
- Virtual account requery limit not enforced

**Recommendation:** Implement the critical gaps (items 1-3) within the next sprint to achieve **EXCELLENT** status.
