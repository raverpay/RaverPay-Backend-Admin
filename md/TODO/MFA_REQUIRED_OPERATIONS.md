# MFA-Required Operations Implementation Plan

## Overview

This document identifies all sensitive admin operations that should require Multi-Factor Authentication (MFA) verification as an additional security layer. These operations involve critical actions that could impact user accounts, financial transactions, security settings, or system configuration.

---

## Current Implementation Status

### ✅ Already Implemented

1. **MFA Management**
   - ✅ Regenerate backup codes (`POST /auth/mfa/regenerate-backup-codes`)
   - ✅ Disable MFA (`POST /auth/mfa/disable`) - Uses password re-auth
   - ✅ Add IP to whitelist (`POST /admin/security/ip-whitelist`) - Requires MFA if enabled

---

## Priority Classification

### 🔴 **CRITICAL** - Financial & Account Operations

These operations directly affect user money or account access. **Highest priority for MFA protection.**

### 🟠 **HIGH** - Security & Access Control

These operations modify security settings or user permissions. **High priority for MFA protection.**

### 🟡 **MEDIUM** - Configuration & Data Management

These operations modify system configuration or user data. **Medium priority for MFA protection.**

### 🟢 **LOW** - Read-Only & Non-Critical

These operations are informational or low-risk. **May not require MFA, but should be logged.**

---

## Operations Requiring MFA Verification

### 1. Admin Management (`/admin/admins`)

#### 🔴 CRITICAL Operations

| Endpoint                                | Method | Description                  | Priority    | Risk Level                                  |
| --------------------------------------- | ------ | ---------------------------- | ----------- | ------------------------------------------- |
| `/admin/admins`                         | POST   | Create new admin user        | 🔴 CRITICAL | **HIGH** - Creates privileged access        |
| `/admin/admins/:adminId`                | PATCH  | Update admin user details    | 🟠 HIGH     | **MEDIUM** - Could modify permissions       |
| `/admin/admins/:adminId`                | DELETE | Delete/deactivate admin user | 🔴 CRITICAL | **HIGH** - Removes admin access             |
| `/admin/admins/:adminId/reset-password` | POST   | Reset admin password         | 🔴 CRITICAL | **CRITICAL** - Compromises account security |

**Implementation Notes:**

- Creating admins should require MFA + approval workflow
- Password resets should require MFA + email confirmation
- Deactivating admins should require MFA + reason logging

---

### 2. User Management (`/admin/users`)

#### 🔴 CRITICAL Operations

| Endpoint                              | Method | Description                               | Priority    | Risk Level                            |
| ------------------------------------- | ------ | ----------------------------------------- | ----------- | ------------------------------------- |
| `/admin/users/:userId/role`           | PATCH  | Update user role                          | 🔴 CRITICAL | **CRITICAL** - Changes access level   |
| `/admin/users/:userId/status`         | PATCH  | Update user status (suspend/ban/activate) | 🔴 CRITICAL | **HIGH** - Blocks/restores access     |
| `/admin/users/:userId/kyc-tier`       | PATCH  | Update KYC tier manually                  | 🔴 CRITICAL | **HIGH** - Changes transaction limits |
| `/admin/users/:userId/lock-account`   | PATCH  | Lock user account manually                | 🔴 CRITICAL | **HIGH** - Blocks account access      |
| `/admin/users/:userId/unlock-account` | PATCH  | Unlock user account                       | 🟠 HIGH     | **MEDIUM** - Restores access          |

**Implementation Notes:**

- Role changes should require MFA + audit trail
- Status changes should require MFA + reason
- KYC tier changes should require MFA + justification
- Account locks/unlocks should require MFA + incident reference

---

### 3. Wallet Operations (`/admin/wallets`)

#### 🔴 CRITICAL Operations

| Endpoint                              | Method | Description           | Priority    | Risk Level                                 |
| ------------------------------------- | ------ | --------------------- | ----------- | ------------------------------------------ |
| `/admin/wallets/:userId/adjust`       | POST   | Adjust wallet balance | 🔴 CRITICAL | **CRITICAL** - Directly affects user money |
| `/admin/wallets/:userId/lock`         | POST   | Lock wallet           | 🔴 CRITICAL | **HIGH** - Blocks all transactions         |
| `/admin/wallets/:userId/unlock`       | POST   | Unlock wallet         | 🟠 HIGH     | **MEDIUM** - Restores transactions         |
| `/admin/wallets/:userId/reset-limits` | POST   | Reset spending limits | 🟠 HIGH     | **MEDIUM** - Changes transaction capacity  |

**Implementation Notes:**

- Balance adjustments should require MFA + approval workflow (for amounts > threshold)
- Wallet locks should require MFA + reason + incident ID
- Reset limits should require MFA + justification

**Special Considerations:**

- Balance adjustments above a certain threshold (e.g., ₦100,000) should require **dual approval** (2 admins with MFA)
- All balance adjustments should create audit trail with before/after amounts

---

### 4. Transaction Operations (`/admin/transactions`)

#### 🔴 CRITICAL Operations

| Endpoint                                     | Method | Description                     | Priority    | Risk Level                                     |
| -------------------------------------------- | ------ | ------------------------------- | ----------- | ---------------------------------------------- |
| `/admin/transactions/:transactionId/reverse` | POST   | Reverse a transaction           | 🔴 CRITICAL | **CRITICAL** - Refunds money, affects balances |
| `/admin/transactions/withdrawal-configs`     | POST   | Create withdrawal configuration | 🟠 HIGH     | **HIGH** - Affects withdrawal processing       |
| `/admin/transactions/withdrawal-configs/:id` | PUT    | Update withdrawal configuration | 🟠 HIGH     | **HIGH** - Changes withdrawal rules            |
| `/admin/transactions/withdrawal-configs/:id` | DELETE | Delete withdrawal configuration | 🟠 HIGH     | **MEDIUM** - Removes withdrawal option         |

**Implementation Notes:**

- Transaction reversals should require MFA + reason + approval workflow
- Withdrawal config changes should require MFA + impact analysis
- Consider requiring dual approval for reversals above threshold

---

### 5. VTU Operations (`/admin/vtu`)

#### 🔴 CRITICAL Operations

| Endpoint                            | Method | Description      | Priority    | Risk Level                           |
| ----------------------------------- | ------ | ---------------- | ----------- | ------------------------------------ |
| `/admin/vtu/orders/:orderId/refund` | POST   | Refund VTU order | 🔴 CRITICAL | **CRITICAL** - Refunds money to user |

**Implementation Notes:**

- VTU refunds should require MFA + reason + order investigation
- Should verify order status before allowing refund

---

### 6. KYC Operations (`/admin/kyc`)

#### 🟠 HIGH Operations

| Endpoint                         | Method | Description              | Priority | Risk Level                                     |
| -------------------------------- | ------ | ------------------------ | -------- | ---------------------------------------------- |
| `/admin/kyc/:userId/approve-bvn` | POST   | Approve BVN verification | 🟠 HIGH  | **HIGH** - Upgrades KYC tier, increases limits |
| `/admin/kyc/:userId/reject-bvn`  | POST   | Reject BVN verification  | 🟠 HIGH  | **MEDIUM** - Blocks KYC upgrade                |
| `/admin/kyc/:userId/approve-nin` | POST   | Approve NIN verification | 🟠 HIGH  | **HIGH** - Upgrades KYC tier, increases limits |
| `/admin/kyc/:userId/reject-nin`  | POST   | Reject NIN verification  | 🟠 HIGH  | **MEDIUM** - Blocks KYC upgrade                |

**Implementation Notes:**

- KYC approvals should require MFA + verification notes
- KYC rejections should require MFA + rejection reason

---

### 7. Account Deletion Operations (`/admin/deletions`)

#### 🔴 CRITICAL Operations

| Endpoint                              | Method | Description                      | Priority    | Risk Level                                   |
| ------------------------------------- | ------ | -------------------------------- | ----------- | -------------------------------------------- |
| `/admin/deletions/:requestId/approve` | POST   | Approve account deletion request | 🔴 CRITICAL | **CRITICAL** - Permanently deletes user data |
| `/admin/deletions/:requestId/reject`  | POST   | Reject account deletion request  | 🟠 HIGH     | **MEDIUM** - Denies deletion request         |

**Implementation Notes:**

- Account deletion approvals should require MFA + dual approval
- Should verify user identity and deletion reason before approval
- Consider requiring SUPER_ADMIN only for deletions

---

### 8. Security Operations (`/admin/security`)

#### 🟠 HIGH Operations

| Endpoint                           | Method | Description               | Priority | Risk Level                        |
| ---------------------------------- | ------ | ------------------------- | -------- | --------------------------------- |
| `/admin/security/ip-whitelist`     | POST   | Add IP to whitelist       | 🟠 HIGH  | **HIGH** - ✅ Already implemented |
| `/admin/security/ip-whitelist/:id` | PATCH  | Update IP whitelist entry | 🟠 HIGH  | **MEDIUM** - Changes access rules |
| `/admin/security/ip-whitelist/:id` | DELETE | Remove IP from whitelist  | 🟠 HIGH  | **MEDIUM** - Removes access       |

**Implementation Notes:**

- Adding IPs already requires MFA (✅ implemented)
- Updating/deleting IPs should also require MFA
- Consider requiring MFA for removing your own IP (with safeguards)

---

### 9. Crypto Operations (`/admin/crypto`)

#### 🔴 CRITICAL Operations

| Endpoint                     | Method     | Description                 | Priority    | Risk Level                             |
| ---------------------------- | ---------- | --------------------------- | ----------- | -------------------------------------- |
| Any crypto wallet operations | POST/PATCH | Modify crypto wallets       | 🔴 CRITICAL | **CRITICAL** - Affects crypto assets   |
| Crypto transaction reversals | POST       | Reverse crypto transactions | 🔴 CRITICAL | **CRITICAL** - Affects crypto balances |

**Implementation Notes:**

- All crypto operations should require MFA
- Crypto reversals should require dual approval

---

### 10. Gift Card Operations (`/admin/giftcards`)

#### 🟠 HIGH Operations

| Endpoint          | Method | Description             | Priority | Risk Level               |
| ----------------- | ------ | ----------------------- | -------- | ------------------------ |
| Gift card refunds | POST   | Refund gift card orders | 🟠 HIGH  | **HIGH** - Refunds money |

**Implementation Notes:**

- Gift card refunds should require MFA + reason

---

### 11. Virtual Account Operations (`/admin/virtual-accounts`)

#### 🟠 HIGH Operations

| Endpoint                      | Method | Description            | Priority | Risk Level                           |
| ----------------------------- | ------ | ---------------------- | -------- | ------------------------------------ |
| Virtual account modifications | PATCH  | Modify virtual account | 🟠 HIGH  | **MEDIUM** - Changes account details |

**Implementation Notes:**

- Virtual account modifications should require MFA

---

### 12. System Configuration (`/app-config`)

#### 🟡 MEDIUM Operations

| Endpoint                          | Method | Description                 | Priority  | Risk Level                     |
| --------------------------------- | ------ | --------------------------- | --------- | ------------------------------ |
| `/app-config/admin/rating-prompt` | PATCH  | Update rating configuration | 🟡 MEDIUM | **LOW** - Changes app behavior |

**Implementation Notes:**

- Configuration changes should require MFA
- Consider requiring MFA for all config changes

---

### 13. Email Operations (`/admin/emails`)

#### 🟡 MEDIUM Operations

| Endpoint         | Method | Description      | Priority  | Risk Level                       |
| ---------------- | ------ | ---------------- | --------- | -------------------------------- |
| Bulk email sends | POST   | Send bulk emails | 🟡 MEDIUM | **LOW** - Could be used for spam |

**Implementation Notes:**

- Bulk email operations should require MFA to prevent abuse

---

## Implementation Strategy

### Phase 1: Critical Financial Operations (Week 1-2)

**Priority: 🔴 CRITICAL**

1. Wallet balance adjustments
2. Transaction reversals
3. VTU refunds
4. Account deletion approvals

**Implementation Steps:**

1. Create `@RequireMfa()` decorator
2. Apply decorator to critical endpoints
3. Update frontend to show MFA modal before operations
4. Add MFA verification to backend endpoints
5. Add audit logging for MFA-verified operations

---

### Phase 2: User & Account Management (Week 3-4)

**Priority: 🔴 CRITICAL**

1. Admin user creation/deletion
2. User role changes
3. User status changes (suspend/ban)
4. KYC tier manual updates
5. Account locks/unlocks

**Implementation Steps:**

1. Extend MFA decorator to user management endpoints
2. Add approval workflows for role changes
3. Add reason/justification fields
4. Update frontend modals

---

### Phase 3: Security & Configuration (Week 5-6)

**Priority: 🟠 HIGH**

1. IP whitelist updates/deletions (already partially done)
2. Security configuration changes
3. System configuration updates

**Implementation Steps:**

1. Complete IP whitelist MFA requirements
2. Add MFA to config endpoints
3. Add change tracking

---

### Phase 4: Other Operations (Week 7-8)

**Priority: 🟡 MEDIUM**

1. KYC approvals/rejections
2. Gift card refunds
3. Virtual account modifications
4. Bulk operations

**Implementation Steps:**

1. Apply MFA to remaining endpoints
2. Add audit trails
3. Update documentation

---

## Technical Implementation

### Backend: Create `@RequireMfa()` Decorator

```typescript
// src/common/decorators/require-mfa.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const REQUIRE_MFA_KEY = 'requireMfa';
export const RequireMfa = (options?: { skipIfMfaDisabled?: boolean }) =>
  SetMetadata(REQUIRE_MFA_KEY, options || {});
```

### Backend: Create `MfaRequiredGuard`

```typescript
// src/common/guards/mfa-required.guard.ts
@Injectable()
export class MfaRequiredGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const handler = context.getHandler();

    const requireMfa = Reflect.getMetadata(REQUIRE_MFA_KEY, handler);
    if (!requireMfa) return true;

    // Check if MFA code is provided in request
    const mfaCode = request.headers['x-mfa-code'];
    if (!mfaCode) {
      throw new UnauthorizedException('MFA verification required');
    }

    // Verify MFA code
    // ... verification logic

    return true;
  }
}
```

### Frontend: Reusable MFA Modal Hook

```typescript
// hooks/use-mfa-verification.ts
export function useMfaVerification() {
  const [showModal, setShowModal] = useState(false);
  const [onSuccess, setOnSuccess] = useState<((code: string) => void) | null>(null);

  const requireMfa = (callback: (code: string) => void) => {
    setOnSuccess(() => callback);
    setShowModal(true);
  };

  return {
    requireMfa,
    MfaModal: <MfaVerifyModal open={showModal} onOpenChange={setShowModal} onSuccess={onSuccess} />
  };
}
```

---

## Dual Approval Workflow

For **CRITICAL** operations, implement dual approval:

1. **First Admin**: Initiates operation + MFA verification
2. **System**: Creates pending approval request
3. **Second Admin**: Reviews request + MFA verification
4. **System**: Executes operation after dual approval

**Operations Requiring Dual Approval:**

- Balance adjustments > ₦100,000
- Transaction reversals > ₦50,000
- Account deletions
- Admin user creation/deletion
- User role changes to SUPER_ADMIN

---

## Audit Trail Requirements

All MFA-verified operations should log:

```typescript
{
  action: AuditAction.OPERATION_NAME,
  userId: adminId,
  resource: 'RESOURCE_TYPE',
  resourceId: resourceId,
  status: AuditStatus.SUCCESS,
  severity: AuditSeverity.HIGH,
  metadata: {
    mfaVerified: true,
    mfaVerifiedAt: timestamp,
    operationDetails: {...},
    reason: string,
    approvalWorkflowId?: string, // For dual approvals
  }
}
```

---

## Frontend Implementation Checklist

For each sensitive operation:

- [ ] Add MFA verification modal trigger
- [ ] Update API call to include MFA code in header
- [ ] Show loading state during MFA verification
- [ ] Handle MFA verification errors
- [ ] Add success/error notifications
- [ ] Update UI to indicate MFA requirement
- [ ] Add tooltip/help text explaining why MFA is required

---

## Testing Requirements

### Unit Tests

- [ ] MFA decorator application
- [ ] MFA guard verification logic
- [ ] MFA code validation
- [ ] Failed MFA attempt handling

### Integration Tests

- [ ] End-to-end MFA flow for each operation
- [ ] MFA verification failure scenarios
- [ ] Dual approval workflow
- [ ] Audit log creation

### E2E Tests

- [ ] Complete user journey with MFA verification
- [ ] MFA timeout scenarios
- [ ] Multiple operations requiring MFA

---

## Security Considerations

1. **MFA Code Expiry**: MFA codes should expire after 5 minutes
2. **Rate Limiting**: Limit MFA verification attempts (5 per 15 minutes)
3. **Session Token**: Generate short-lived session token after MFA verification (15 minutes)
4. **Audit Logging**: All MFA verifications must be logged
5. **Failed Attempts**: Track failed MFA attempts, lock account after 5 failures
6. **Dual Approval**: Critical operations require 2 admins with MFA

---

## Migration Strategy

1. **Phase 1**: Implement MFA decorator and guard (non-breaking)
2. **Phase 2**: Apply to new endpoints first
3. **Phase 3**: Gradually apply to existing endpoints
4. **Phase 4**: Make MFA mandatory for all admins
5. **Phase 5**: Enforce dual approval for critical operations

---

## Monitoring & Alerts

Set up alerts for:

- Multiple failed MFA attempts
- MFA-verified operations outside business hours
- Unusual patterns in MFA-verified operations
- Operations requiring dual approval that are pending > 24 hours

---

## Documentation Updates Required

- [ ] Update API documentation with MFA requirements
- [ ] Create admin guide for MFA-required operations
- [ ] Update security incident playbook
- [ ] Add MFA requirements to onboarding docs

---

## Estimated Implementation Time

- **Phase 1 (Critical)**: 2-3 weeks
- **Phase 2 (User Management)**: 2 weeks
- **Phase 3 (Security)**: 1-2 weeks
- **Phase 4 (Other)**: 1-2 weeks
- **Total**: 6-9 weeks

---

## Success Metrics

- ✅ 100% of critical operations require MFA
- ✅ Zero unauthorized operations on critical endpoints
- ✅ All MFA verifications logged in audit trail
- ✅ Dual approval workflow functional for critical operations
- ✅ Admin satisfaction with security measures

---

**Last Updated**: January 2025  
**Status**: Planning Phase  
**Next Review**: After Phase 1 completion
