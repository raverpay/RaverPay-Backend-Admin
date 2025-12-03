# Rate Limiting Implementation

## Overview

Comprehensive rate limiting has been implemented across all RaverPay API endpoints to protect against abuse, brute force attacks, and ensure fair usage.

## Implementation Details

### Technology Stack

- **Package**: `@nestjs/throttler` (NestJS official rate limiting)
- **Storage**: In-memory (default) - can be upgraded to Redis for distributed systems
- **Tracking**: User ID (authenticated) or IP address (public endpoints)

### Global Rate Limits

Applied to ALL endpoints by default:

```typescript
// Default limits
- 200 requests per minute per user/IP
- 20 requests per 10 seconds (burst protection)
```

### Endpoint-Specific Rate Limits

#### 🔐 Authentication Endpoints

| Endpoint                         | Limit | Window     | Reason                          |
| -------------------------------- | ----- | ---------- | ------------------------------- |
| `POST /api/auth/register`        | 3     | 1 hour     | Prevent bot registrations       |
| `POST /api/auth/login`           | 5     | 15 minutes | Brute force protection          |
| `POST /api/auth/forgot-password` | 3     | 1 hour     | Password reset abuse prevention |

#### 💰 Transaction Endpoints

| Endpoint                            | Limit | Window | Reason                  |
| ----------------------------------- | ----- | ------ | ----------------------- |
| `POST /api/transactions/fund/card`  | 10    | 1 hour | Prevent payment spam    |
| `POST /api/transactions/withdraw`   | 5     | 1 hour | High-security operation |
| `POST /api/transactions/send` (P2P) | 20    | 1 hour | Prevent transfer abuse  |

#### 📱 VTU (Bill Payment) Endpoints

| Endpoint                         | Limit | Window | Reason                        |
| -------------------------------- | ----- | ------ | ----------------------------- |
| `POST /api/vtu/airtime/purchase` | 30    | 1 hour | Prevent bulk abuse            |
| `POST /api/vtu/data/purchase`    | 30    | 1 hour | Prevent bulk abuse            |
| `POST /api/vtu/cable-tv/pay`     | 20    | 1 hour | Subscription abuse prevention |
| `POST /api/vtu/electricity/pay`  | 20    | 1 hour | Bill payment protection       |

#### 🛡️ Admin Endpoints

| Endpoint                         | Limit | Window   | Reason                     |
| -------------------------------- | ----- | -------- | -------------------------- |
| All admin endpoints              | 100   | 1 minute | Base admin protection      |
| `POST /admin/wallets/:id/lock`   | 20    | 1 hour   | Prevent mass locking       |
| `POST /admin/wallets/:id/unlock` | 20    | 1 hour   | Prevent mass unlocking     |
| `POST /admin/wallets/:id/adjust` | 10    | 1 hour   | Critical balance operation |

## Custom Throttler Guard

### User-Based vs IP-Based Tracking

The `CustomThrottlerGuard` intelligently tracks rate limits:

```typescript
// Authenticated requests: Tracked by userId
// Prevents users from bypassing limits by changing IPs

// Unauthenticated requests: Tracked by IP
// Prevents IP-based abuse on public endpoints
```

**Location**: `src/common/guards/custom-throttler.guard.ts`

### Error Messages

- **Authenticated**: "Too many requests from your account. Please try again later."
- **Unauthenticated**: "Too many requests from this IP address. Please try again later."

## Security Benefits

### 1. Brute Force Protection

- Login attempts limited to 5 per 15 minutes
- Account compromise prevention
- Password guessing protection

### 2. Payment Abuse Prevention

- Limits on deposit/withdrawal attempts
- Prevents payment system exploitation
- Reduces fraudulent transaction attempts

### 3. DDoS Mitigation

- Global rate limits prevent API flooding
- Burst protection (20 req/10 sec) stops rapid attacks
- Per-user tracking prevents distributed attacks

### 4. Cost Control

- Prevents excessive API calls to third-party services (Paystack, VTPASS)
- Reduces infrastructure costs
- Prevents abuse of free-tier services

### 5. Fair Usage

- Ensures equal access for all users
- Prevents single user from monopolizing resources
- Maintains API performance for everyone

## Monitoring & Logging

### Rate Limit Headers

All responses include rate limit information:

```
X-RateLimit-Limit: 200
X-RateLimit-Remaining: 195
X-RateLimit-Reset: 1638360000
```

### Logging

On application startup, all rate limits are logged:

```
✅ Global rate limiting enabled:
   - 200 requests/minute per user/IP (default)
   - 20 requests/10 seconds per user/IP (burst protection)
   - Login: 5 attempts/15 min
   - Register: 3 attempts/hour
   - Password reset: 3 attempts/hour
   - Card funding: 10 attempts/hour
   - Withdrawals: 5 attempts/hour
   - P2P transfers: 20 attempts/hour
   - Admin operations: 100 requests/minute
```

## Bypassing Rate Limits (Admin/System)

To bypass rate limits for specific routes, use `@SkipThrottle()` decorator:

```typescript
import { SkipThrottle } from '@nestjs/throttler';

@Controller('webhooks')
export class WebhooksController {
  // Webhooks need to bypass rate limits
  @SkipThrottle()
  @Post('paystack')
  async handlePaystackWebhook() {
    // ...
  }
}
```

## Future Enhancements

### 1. Redis-Based Storage (For Production Scale)

```typescript
ThrottlerModule.forRoot({
  storage: new ThrottlerStorageRedisService(redisClient),
  throttlers: [...]
});
```

**Benefits**:

- Distributed rate limiting across multiple servers
- Persistent rate limit counters
- Better performance at scale

### 2. Account Locking After Excessive Violations

```typescript
// After 3 rate limit violations in 1 hour
// -> Lock account for 24 hours
// -> Require email verification to unlock
```

### 3. CAPTCHA Integration

```typescript
// After hitting rate limit 2 times
// -> Require CAPTCHA for next attempt
// -> Prevents automated attacks
```

### 4. Dynamic Rate Limits by KYC Tier

```typescript
// TIER_0: 100 requests/min
// TIER_1: 200 requests/min
// TIER_2: 500 requests/min
// TIER_3: 1000 requests/min
```

### 5. Real-Time Alerts

```typescript
// Send notification to admins when:
// - User hits rate limit 5 times in 1 hour
// - IP hits rate limit on 10+ different accounts
// - Suspicious pattern detected
```

## Testing Rate Limits

### Manual Testing

```bash
# Test login rate limit (should block after 5 attempts)
for i in {1..6}; do
  curl -X POST http://localhost:3001/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}'
  echo "\nAttempt $i"
  sleep 1
done
```

### Expected Response (After Limit)

```json
{
  "statusCode": 429,
  "message": "Too many requests from this IP address. Please try again later."
}
```

## Configuration Files Modified

1. `src/app.module.ts` - ThrottlerModule configuration
2. `src/common/guards/custom-throttler.guard.ts` - Custom guard (new file)
3. `src/auth/auth.controller.ts` - Auth endpoint limits
4. `src/transactions/transactions.controller.ts` - Transaction endpoint limits
5. `src/vtu/vtu.controller.ts` - VTU endpoint limits
6. `src/admin/wallets/admin-wallets.controller.ts` - Admin endpoint limits
7. `src/main.ts` - Updated startup logging

## Compliance & Industry Standards

This implementation follows fintech industry standards:

- ✅ OWASP API Security Top 10 (2023)
- ✅ PCI DSS Requirement 8.1.8 (Login attempt limits)
- ✅ NIST SP 800-63B (Authentication security)
- ✅ Payment Card Industry standards
- ✅ Nigerian fintech regulatory guidelines

## Deployment Checklist

- [x] Install `@nestjs/throttler` package
- [x] Configure global rate limits
- [x] Add endpoint-specific limits
- [x] Create custom throttler guard
- [x] Update startup logging
- [x] Test rate limits locally
- [ ] Configure Redis storage for production
- [ ] Set up monitoring/alerts
- [ ] Document for API consumers
- [ ] Load test under rate limits

## Support & Maintenance

For issues or adjustments to rate limits:

1. Review application logs for rate limit violations
2. Monitor API performance metrics
3. Adjust limits based on legitimate usage patterns
4. Consider tiered limits for different user types

---

**Implementation Date**: December 3, 2025  
**Branch**: `feature/rate-limiting`  
**Status**: ✅ Complete and Ready for Testing
