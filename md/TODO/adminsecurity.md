Admin Authentication Security Enhancement - Implementation Requirements

## Overview

We need to significantly strengthen the security of our admin dashboard authentication system. Currently, we use access tokens and refresh tokens with email/password authentication for both regular users and admins. Users are differentiated by their `role` field (`USER`, `ADMIN`, `SUPPORT`, `SUPER_ADMIN`) in the `User` model. This is insufficient for admin accounts in a fintech application where admins have access to sensitive financial data and user information.

## Current Architecture Understanding

### Backend (NestJS API - `/apps/raverpay-api`)

- **Single User Model**: We use ONE `User` table/model for both regular users and admins (no separate admin table)
- **Role-based Access**: `role` field in User model with values: `USER`, `ADMIN`, `SUPPORT`, `SUPER_ADMIN`
- **Authentication Module**: Single `AuthModule` at `/src/auth/` handles ALL authentication (no separate admin auth module)
- **Auth Endpoints**: `/auth/login`, `/auth/register`, `/auth/refresh` - used by everyone
- **Protection**: Admin routes use `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)` decorators
- **Existing Security Features**:
  - Device tracking and fingerprinting (`Device` model already exists)
  - Account locking (`failedLoginAttempts`, `lockedUntil` fields exist)
  - Audit logging (`AuditLog` model exists with comprehensive tracking)
  - Rate limiting (CustomThrottlerGuard, AccountLockGuard)
  - Refresh token management (`RefreshToken` model)
  - Two-factor fields exist but unused: `twoFactorEnabled`, `twoFactorSecret` (currently false for everyone)

### Frontend (Next.js Admin Dashboard - `/apps/raverpay-admin`)

- **Login**: `/app/login/page.tsx` - uses same `/auth/login` endpoint as mobile users
- **Auth Store**: Zustand store at `/lib/auth-store.ts` manages tokens and user state
- **Auth API**: `/lib/api/auth.ts` - calls same auth endpoints as mobile app
- **No Admin-Specific Auth**: Currently no distinction between admin and regular user login flow

### Database (Prisma Schema)

- **User Model Fields Already Present**:
  - `twoFactorEnabled: Boolean` (currently unused, always false)
  - `twoFactorSecret: String?` (currently unused, null)
  - `failedLoginAttempts: Int`
  - `lockedUntil: DateTime?`
  - `lastFailedLoginAt: DateTime?`
  - `lastSuccessfulLoginIp: String?`
  - Account lock fields: `rateLimitLockCount`, `lastRateLimitLockAt`
- **Device Model**: Fully implemented with fingerprinting, trusted devices, verification
- **AuditLog Model**: Comprehensive audit logging with severity, status, metadata
- **RefreshToken Model**: Refresh token management with revocation

## Objective

Implement a multi-layered security approach specifically for admin authentication (users with `ADMIN`, `SUPPORT`, or `SUPER_ADMIN` roles) that includes:

1. Multi-Factor Authentication (MFA) using Time-Based One-Time Passwords (TOTP)
2. IP Whitelisting for admin access
3. Enhanced security measures leveraging existing device fingerprinting and audit logging

## Scope

- **Backend**: Extend existing `AuthModule` and `AuthService` (NOT create new admin auth module)
- **Frontend**: Update existing Next.js admin dashboard login flow
- **Database**: Add missing MFA fields to existing `User` model (leverage existing 2FA fields)
- **Infrastructure**: Configuration for IP whitelisting and monitoring

---

## 1. Multi-Factor Authentication (MFA) Implementation

### Requirements

#### Database Schema Changes

Add MFA-related fields to the existing `User` model in `/apps/raverpay-api/prisma/schema.prisma`:

````prisma
model User {
  // ... existing fields ...

  // UPDATE THESE EXISTING FIELDS - currently exist but unused
  twoFactorEnabled       Boolean                  @default(false)  // Change behavior for admins
  twoFactorSecret        String?                  // Will store encrypted TOTP secret

  // ADD THESE NEW FIELDS for MFA
  mfaBackupCodes         String[]                 @default([])  // Array of hashed backup codes
  mfaFailedAttempts      Int                      @default(0)   // Failed MFA attempts counter
  lastMfaFailure         DateTime?                // Last failed MFA attempt timestamp
  mfaEnabledAt           DateTime?                // When MFA was enabled
  lastMfaSuccess         DateTime?                // Last successful MFA verification

  // Existing lock fields - will be used for MFA lockout too
  failedLoginAttempts    Int                      @default(0)
  lockedUntil            DateTime?
  lastFailedLoginAt      DateTime?

  // ... rest of existing fields ...
}

### Backend Implementation (in existing `AuthModule`)

Location: `/apps/raverpay-api/src/auth/`

#### MFA Setup Flow (One-time per admin)

**Create endpoint POST `/auth/mfa/setup`** (in `AuthController`):
- **Access Control**: Requires `JwtAuthGuard` - any authenticated user can access
- **Admin Check**: Only allow users with role `ADMIN`, `SUPPORT`, or `SUPER_ADMIN` to proceed
- **Implementation** (in `AuthService.setupMfa()`):
  - Generates a unique secret key using `speakeasy` or `otplib` library
  - Encrypts the secret before storing (use existing encryption utility or add to `/src/utils/`)
  - Generates a QR code using `qrcode` npm package: `otpauth://totp/RaverPay:admin@email.com?secret=SECRETKEY&issuer=RaverPay`
  - Generates 10 backup codes (random strings), hash them with `argon2` (already used for passwords)
  - Returns QR code data URL and backup codes to frontend
  - **Does NOT** set `twoFactorEnabled = true` yet - waits for verification
  - Store temporary secret in cache/redis with expiry (30 minutes) or in user record as temp field

**Create endpoint POST `/auth/mfa/verify-setup`** (in `AuthController`):
- **Access Control**: Requires `JwtAuthGuard`
- **Implementation** (in `AuthService.verifyMfaSetup()`):
  - Accepts the 6-digit code from admin's authenticator app
  - Retrieves the temporary secret generated during setup
  - Verifies the code using `speakeasy.totp.verify()` with window of 1
  - If valid:
    - Sets `twoFactorEnabled = true`
    - Sets `twoFactorSecret = <encrypted_secret>`
    - Stores `mfaBackupCodes = [<hashed_codes>]`
    - Sets `mfaEnabledAt = now()`
    - Logs to `AuditLog`: `action: 'MFA_ENABLED'`
    - Sends notification email: "MFA has been enabled on your account"
  - If invalid: Return error, require retry

#### Modified Login Flow

**Update existing POST `/auth/login`** endpoint (in `AuthService.login()`):

Current flow already handles:
- Email/password validation with `argon2.verify()`
- Device fingerprinting via `DeviceService`
- Failed login tracking
- Account locking

**Add MFA check AFTER password validation**:

```typescript
// After password is verified successfully
if (user.twoFactorEnabled && user.twoFactorSecret) {
  // MFA is enabled for this user

  // Generate temporary token (short-lived)
  const tempToken = this.jwtService.sign(
    {
      sub: user.id,
      purpose: 'mfa-verification',
      email: user.email
    },
    { expiresIn: '5m' } // 5 minute expiry
  );

  // Log MFA required event to AuditLog
  await this.auditService.log({
    userId: user.id,
    action: 'MFA_REQUIRED',
    resource: 'AUTH',
    status: 'SUCCESS',
    metadata: { ipAddress, deviceId }
  });

  // Do NOT return access/refresh tokens yet
  return {
    mfaRequired: true,
    tempToken,
    message: 'MFA verification required'
  };
}

// If MFA not enabled, proceed with normal token generation
return {
  user: this.sanitizeUser(user),
  accessToken: this.generateAccessToken(user),
  refreshToken: await this.generateRefreshToken(user),
};
````

**Create new endpoint POST `/auth/mfa/verify`** (in `AuthController`):

**Create new endpoint POST `/auth/mfa/verify`** (in `AuthController`):

- **No guard needed initially** - validates using tempToken
- **Implementation** (in `AuthService.verifyMfaCode()`):

```typescript
async verifyMfaCode(tempToken: string, mfaCode: string, deviceInfo: DeviceInfo, ipAddress: string) {
  // Decode and validate tempToken
  let payload;
  try {
    payload = this.jwtService.verify(tempToken);
  } catch (error) {
    throw new UnauthorizedException('MFA verification session expired');
  }

  if (payload.purpose !== 'mfa-verification') {
    throw new UnauthorizedException('Invalid token purpose');
  }

  // Get user
  const user = await this.prisma.user.findUnique({
    where: { id: payload.sub }
  });

  if (!user || !user.twoFactorSecret) {
    throw new UnauthorizedException('MFA not configured');
  }

  // Decrypt the stored secret
  const secret = await this.decrypt(user.twoFactorSecret);

  // Verify the TOTP code
  const isValid = speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token: mfaCode,
    window: 1  // Allow 30 seconds clock drift
  });

  if (!isValid) {
    // Increment failed attempts
    const updatedUser = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        mfaFailedAttempts: { increment: 1 },
        lastMfaFailure: new Date(),
      }
    });

    // Log failed attempt
    await this.auditService.log({
      userId: user.id,
      action: 'MFA_VERIFICATION_FAILED',
      resource: 'AUTH',
      status: 'FAILED',
      severity: 'MEDIUM',
      metadata: { ipAddress, deviceId: deviceInfo.deviceId }
    });

    // Lock account after 5 failed attempts
    if (updatedUser.mfaFailedAttempts >= 5) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          lockedUntil: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
        }
      });

      // Send security alert email
      await this.notificationDispatcher.sendEmail({
        to: user.email,
        subject: 'Account Locked Due to Failed MFA Attempts',
        template: 'account-locked-mfa',
        data: { userName: user.firstName }
      });

      throw new UnauthorizedException('Account locked due to multiple failed MFA attempts');
    }

    throw new UnauthorizedException(
      `Invalid MFA code. ${5 - updatedUser.mfaFailedAttempts} attempts remaining.`
    );
  }

  // MFA verification successful!

  // Reset failed attempts
  await this.prisma.user.update({
    where: { id: user.id },
    data: {
      mfaFailedAttempts: 0,
      lastMfaSuccess: new Date(),
    }
  });

  // Log successful MFA
  await this.auditService.log({
    userId: user.id,
    action: 'MFA_VERIFICATION_SUCCESS',
    resource: 'AUTH',
    status: 'SUCCESS',
    metadata: { ipAddress, deviceId: deviceInfo.deviceId }
  });

  // Register/update device (using existing DeviceService)
  await this.deviceService.registerOrUpdateDevice(user.id, deviceInfo, ipAddress);

  // Generate actual access and refresh tokens
  const accessToken = this.generateAccessToken(user);
  const refreshToken = await this.generateRefreshToken(user);

  // Update last login
  await this.prisma.user.update({
    where: { id: user.id },
    data: {
      lastLoginAt: new Date(),
      lastSuccessfulLoginIp: ipAddress,
    }
  });

  return {
    user: this.sanitizeUser(user),
    accessToken,
    refreshToken,
  };
}
```

#### Backup Code Verification

**Create endpoint POST `/auth/mfa/verify-backup`** (in `AuthController`):

- Similar to MFA verification but accepts backup code
- **Implementation** (in `AuthService.verifyBackupCode()`):
  - Hash the provided backup code with `argon2`
  - Compare hash with stored `mfaBackupCodes` array
  - If match found:
    - Remove that code from the array (single-use only)
    - Proceed with token generation
    - Log usage: `action: 'MFA_BACKUP_CODE_USED'`
    - Send email alert: "A backup code was used to access your account"
    - If only 2 backup codes remain, warn user to regenerate
  - If no match: Increment `mfaFailedAttempts` and proceed as failed MFA attempt

#### MFA Management Endpoints

**POST `/auth/mfa/disable`** (requires `JwtAuthGuard` + password re-entry):

- Requires user to provide current password for security
- Sets `twoFactorEnabled = false`
- Clears `twoFactorSecret` and `mfaBackupCodes`
- Logs: `action: 'MFA_DISABLED'`
- Sends security alert email

**POST `/auth/mfa/regenerate-backup-codes`** (requires `JwtAuthGuard`):

- Generates new 10 backup codes
- Replaces existing `mfaBackupCodes` array
- Returns new codes to user
- Logs: `action: 'MFA_BACKUP_CODES_REGENERATED'`

**GET `/auth/mfa/status`** (requires `JwtAuthGuard`):

- Returns:
  ```json
  {
    "mfaEnabled": true,
    "mfaEnabledAt": "2025-01-10T12:00:00Z",
    "backupCodesRemaining": 8,
    "lastMfaSuccess": "2025-01-13T10:30:00Z"
  }
  ```

#### Rate Limiting (use existing `CustomThrottlerGuard`)

Apply to MFA endpoints:

- `/auth/mfa/verify`: Max 10 attempts per 15 minutes per IP
- `/auth/mfa/verify-backup`: Max 5 attempts per 15 minutes per IP
- `/auth/mfa/setup`: Max 3 attempts per hour per user

---

## 2. IP Whitelisting Implementation

### Requirements

#### Configuration Setup

Create a new model in `/apps/raverpay-api/prisma/schema.prisma`:

```prisma
model AdminIpWhitelist {
  id          String    @id @default(uuid())
  ipAddress   String    @unique  // Single IP: "203.0.113.45" or CIDR: "203.0.113.0/24"
  description String?              // e.g., "Office WiFi", "VPN Server"
  userId      String?              // Optional: specific to a user, null = global for all admins
  isActive    Boolean   @default(true)
  createdBy   String               // Admin who added this IP
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  lastUsedAt  DateTime?            // Track when this IP was last used
  usageCount  Int       @default(0)

  user        User?     @relation(fields: [userId], references: [id], onDelete: Cascade)
  creator     User      @relation("IpWhitelistCreator", fields: [createdBy], references: [id])

  @@index([ipAddress])
  @@index([userId])
  @@index([isActive])
  @@map("admin_ip_whitelist")
}

// Add to User model:
model User {
  // ... existing fields ...
  ipWhitelists         AdminIpWhitelist[]  @relation("IpWhitelistCreator")
  assignedIpWhitelists AdminIpWhitelist[]
  // ... existing fields ...
}
```

#### Backend Implementation

**Create IP Whitelist Guard** at `/apps/raverpay-api/src/common/guards/ip-whitelist.guard.ts`:

```typescript
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../services/audit.service';
import { UserRole } from '@prisma/client';
import { isIPv4, isIPv6 } from 'net';
import { Address4, Address6 } from 'ip-address'; // npm: ip-address

export const SKIP_IP_WHITELIST_KEY = 'skipIpWhitelist';
export const SkipIpWhitelist = () => SetMetadata(SKIP_IP_WHITELIST_KEY, true);

@Injectable()
export class IpWhitelistGuard implements CanActivate {
  private readonly logger = new Logger(IpWhitelistGuard.name);

  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if IP whitelisting should be skipped for this route
    const skipWhitelist = this.reflector.getAllAndOverride<boolean>(SKIP_IP_WHITELIST_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (skipWhitelist) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Only apply to admin users
    if (!user || ![UserRole.ADMIN, UserRole.SUPPORT, UserRole.SUPER_ADMIN].includes(user.role)) {
      return true; // Not an admin, skip whitelist check
    }

    // Extract client IP
    const clientIp = this.extractClientIp(request);

    // Check if IP is whitelisted
    const isWhitelisted = await this.isIpWhitelisted(clientIp, user.id);

    if (isWhitelisted) {
      // Update last used timestamp
      await this.updateLastUsed(clientIp);
      return true;
    }

    // IP not whitelisted - block and log
    this.logger.warn(
      `Blocked admin access from non-whitelisted IP: ${clientIp} for user: ${user.email}`,
    );

    await this.auditService.log(
      {
        userId: user.id,
        action: 'IP_BLOCKED',
        resource: 'AUTH',
        status: 'FAILED',
        severity: 'HIGH',
        metadata: {
          blockedIp: clientIp,
          attemptedRoute: request.url,
          userAgent: request.headers['user-agent'],
        },
      },
      request,
    );

    // Send real-time alert (integrate with existing notification system)
    // TODO: Add real-time alert to security team

    throw new ForbiddenException(
      'Access denied: Your IP address is not whitelisted for admin access. Please contact support.',
    );
  }

  private extractClientIp(request: any): string {
    // Consider proxy headers
    const xForwardedFor = request.headers['x-forwarded-for'];
    if (xForwardedFor) {
      // Take the first IP (original client)
      return xForwardedFor.split(',')[0].trim();
    }

    return (
      request.headers['x-real-ip'] || request.ip || request.connection?.remoteAddress || 'unknown'
    );
  }

  private async isIpWhitelisted(clientIp: string, userId: string): Promise<boolean> {
    // Get all active whitelist entries (global + user-specific)
    const whitelistEntries = await this.prisma.adminIpWhitelist.findMany({
      where: {
        isActive: true,
        OR: [
          { userId: null }, // Global whitelist
          { userId: userId }, // User-specific whitelist
        ],
      },
    });

    // Check each entry
    for (const entry of whitelistEntries) {
      if (this.matchesIpOrCidr(clientIp, entry.ipAddress)) {
        return true;
      }
    }

    return false;
  }

  private matchesIpOrCidr(clientIp: string, whitelistEntry: string): boolean {
    // Check if exact match
    if (clientIp === whitelistEntry) {
      return true;
    }

    // Check if CIDR notation
    if (whitelistEntry.includes('/')) {
      try {
        // IPv4 CIDR check
        if (isIPv4(clientIp)) {
          const address = new Address4(whitelistEntry);
          const clientAddress = new Address4(clientIp);
          return address.isInSubnet(clientAddress);
        }

        // IPv6 CIDR check
        if (isIPv6(clientIp)) {
          const address = new Address6(whitelistEntry);
          const clientAddress = new Address6(clientIp);
          return address.isInSubnet(clientAddress);
        }
      } catch (error) {
        this.logger.error(`Invalid CIDR notation: ${whitelistEntry}`, error);
        return false;
      }
    }

    return false;
  }

  private async updateLastUsed(clientIp: string): Promise<void> {
    try {
      await this.prisma.adminIpWhitelist.updateMany({
        where: { ipAddress: clientIp },
        data: {
          lastUsedAt: new Date(),
          usageCount: { increment: 1 },
        },
      });
    } catch (error) {
      // Non-critical, don't throw
      this.logger.error('Failed to update IP whitelist usage', error);
    }
  }
}
```

**Apply Guard Globally for Admin Routes**:

In `/apps/raverpay-api/src/app.module.ts`, add after existing guards:

```typescript
{
  provide: APP_GUARD,
  useClass: IpWhitelistGuard,
}
```

Or apply selectively to admin controllers using decorators.

#### IP Whitelist Management Endpoints

Create new controller `/apps/raverpay-api/src/admin/security/admin-security.controller.ts`:

**GET `/admin/security/ip-whitelist`** (requires `SUPER_ADMIN`):

- List all whitelisted IPs with pagination
- Filter by active/inactive, global/user-specific

**POST `/admin/security/ip-whitelist`** (requires `SUPER_ADMIN`):

- Add new IP or CIDR range
- Validate IP format before storing
- Log: `action: 'IP_WHITELIST_ADDED'`

**DELETE `/admin/security/ip-whitelist/:id`** (requires `SUPER_ADMIN`):

- Remove IP from whitelist
- Log: `action: 'IP_WHITELIST_REMOVED'`

**PATCH `/admin/security/ip-whitelist/:id`** (requires `SUPER_ADMIN`):

- Update IP entry (description, active status)

#### Emergency Access Procedure

Document in `/docs/SECURITY.md`:

1. If legitimate admin is locked out, contact SUPER_ADMIN
2. SUPER_ADMIN can temporarily add IP via direct database access (provide script)
3. Emergency bypass: Set environment variable `BYPASS_IP_WHITELIST=true` (logged extensively)

---

## 3. Additional Security Measures (Leverage Existing Features)

### Device Fingerprinting (Already Implemented!)

The `Device` model and `DeviceService` already exist. Enhance the admin login flow:

#### Update AuthService.login() to Check Device Trust for Admins

```typescript
// After password validation, before MFA
if ([UserRole.ADMIN, UserRole.SUPPORT, UserRole.SUPER_ADMIN].includes(user.role)) {
  const device = await this.deviceService.getDeviceByDeviceId(deviceInfo.deviceId);

  if (!device || !device.isTrusted) {
    // New or untrusted device for admin
    await this.notificationDispatcher.sendEmail({
      to: user.email,
      subject: '🔐 New Device Login Detected',
      template: 'new-device-alert',
      data: {
        userName: user.firstName,
        deviceName: deviceInfo.deviceName,
        location: await this.ipGeolocationService.getLocation(ipAddress),
        ipAddress,
        timestamp: new Date(),
        actionUrl: `${process.env.ADMIN_URL}/dashboard/security/devices`,
      },
    });

    // Log new device access
    await this.auditService.log({
      userId: user.id,
      action: 'NEW_DEVICE_LOGIN',
      resource: 'DEVICE',
      severity: 'MEDIUM',
      metadata: { deviceInfo, ipAddress },
    });
  }
}
```

#### Device Management Endpoints (extend existing)

**GET `/auth/devices`** (already exists, enhance for admins):

- Show device trust status
- Show last used timestamp

**POST `/auth/devices/:id/trust`** (new):

- Mark device as trusted
- Requires password re-entry or MFA verification

**DELETE `/auth/devices/:id`** (enhance existing):

- Remote device logout
- Revoke all refresh tokens for that device

### Session Monitoring (Leverage Existing RefreshToken Model)

The `RefreshToken` model already tracks active sessions. Enhance it:

#### Add Fields to RefreshToken Model

```prisma
model RefreshToken {
  id           String    @id @default(uuid())
  userId       String
  token        String    @unique
  isRevoked    Boolean   @default(false)
  expiresAt    DateTime
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  // ADD THESE FIELDS
  deviceId     String?
  ipAddress    String?
  location     String?
  userAgent    String?
  lastUsedAt   DateTime  @default(now())

  user         User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([token])
  @@index([deviceId])
  @@map("refresh_tokens")
}
```

#### Session Management Endpoints

**GET `/auth/sessions`** (new):

- Returns all active refresh tokens (sessions) for current user
- For each session: device info, location, last activity, created date

**DELETE `/auth/sessions/:id`** (new):

- Revoke specific refresh token
- Log: `action: 'SESSION_TERMINATED'`

**DELETE `/auth/sessions/all`** (new):

- Revoke all refresh tokens except current one
- Force re-login on all other devices

#### Concurrent Session Limits for Admins

In `AuthService.generateRefreshToken()`:

```typescript
if ([UserRole.ADMIN, UserRole.SUPPORT, UserRole.SUPER_ADMIN].includes(user.role)) {
  // Check active sessions count
  const activeSessions = await this.prisma.refreshToken.count({
    where: {
      userId: user.id,
      isRevoked: false,
      expiresAt: { gt: new Date() },
    },
  });

  if (activeSessions >= 3) {
    // Max 3 concurrent sessions for admins
    // Revoke oldest session
    const oldestSession = await this.prisma.refreshToken.findFirst({
      where: {
        userId: user.id,
        isRevoked: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'asc' },
    });

    if (oldestSession) {
      await this.prisma.refreshToken.update({
        where: { id: oldestSession.id },
        data: { isRevoked: true },
      });

      await this.auditService.log({
        userId: user.id,
        action: 'SESSION_LIMIT_EXCEEDED',
        resource: 'SESSION',
        metadata: { revokedSessionId: oldestSession.id },
      });
    }
  }
}
```

### Enhanced Audit Logging (Already Implemented!)

The `AuditLog` model and `AuditService` already exist with comprehensive fields. Simply ensure all admin actions are logged:

#### Automatic Logging Interceptor

Create `/apps/raverpay-api/src/common/interceptors/admin-audit.interceptor.ts`:

```typescript
@Injectable()
export class AdminAuditInterceptor implements NestInterceptor {
  constructor(
    private auditService: AuditService,
    private reflector: Reflector,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Only log admin actions
    if (!user || ![UserRole.ADMIN, UserRole.SUPPORT, UserRole.SUPER_ADMIN].includes(user.role)) {
      return next.handle();
    }

    const handler = context.getHandler();
    const controller = context.getClass();

    // Extract route info
    const route = request.route?.path || request.url;
    const method = request.method;

    const startTime = Date.now();

    return next.handle().pipe(
      tap(async (response) => {
        const executionTime = Date.now() - startTime;

        // Log successful admin action
        await this.auditService.log(
          {
            userId: user.id,
            action: this.extractActionFromRoute(route, method),
            resource: this.extractResourceFromRoute(route),
            resourceId: request.params?.id || request.params?.userId,
            status: 'SUCCESS',
            severity: this.determineSeverity(route, method),
            executionTime,
            metadata: {
              route,
              method,
              body: this.sanitizeBody(request.body),
              query: request.query,
              response: this.sanitizeResponse(response),
            },
          },
          request,
        );
      }),
      catchError(async (error) => {
        const executionTime = Date.now() - startTime;

        // Log failed admin action
        await this.auditService.log(
          {
            userId: user.id,
            action: this.extractActionFromRoute(route, method),
            resource: this.extractResourceFromRoute(route),
            status: 'FAILED',
            severity: 'HIGH',
            executionTime,
            errorMessage: error.message,
            metadata: {
              route,
              method,
              body: this.sanitizeBody(request.body),
              error: error.stack,
            },
          },
          request,
        );

        throw error;
      }),
    );
  }

  // Helper methods...
}
```

Apply this interceptor globally or to admin controllers.

### Re-authentication for Sensitive Operations

#### Create Guard for Sensitive Operations

`/apps/raverpay-api/src/common/guards/re-auth.guard.ts`:

```typescript
@Injectable()
export class ReAuthGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Not authenticated');
    }

    // Check if recently authenticated (within last 15 minutes)
    const recentAuth = request.headers['x-recent-auth-token'];

    if (!recentAuth) {
      throw new HttpException(
        {
          statusCode: 428,
          message: 'Re-authentication required for this sensitive operation',
          error: 'ReAuthenticationRequired',
        },
        428, // Precondition Required
      );
    }

    // Verify the re-auth token (short-lived JWT)
    try {
      const payload = this.jwtService.verify(recentAuth);

      if (payload.sub !== user.id || payload.purpose !== 'reauth') {
        throw new UnauthorizedException('Invalid re-authentication token');
      }

      // Check if token is recent (< 15 minutes old)
      const tokenAge = Date.now() - payload.iat * 1000;
      if (tokenAge > 15 * 60 * 1000) {
        throw new HttpException(
          {
            statusCode: 428,
            message: 'Re-authentication token expired',
            error: 'ReAuthenticationRequired',
          },
          428,
        );
      }

      return true;
    } catch (error) {
      throw new HttpException(
        {
          statusCode: 428,
          message: 'Re-authentication required',
          error: 'ReAuthenticationRequired',
        },
        428,
      );
    }
  }
}
```

**Create endpoint POST `/auth/verify-password-reauth`**:

- Accepts just password (user already authenticated)
- Verifies password with `argon2.verify()`
- Returns short-lived JWT (15 min expiry) with `purpose: 'reauth'`
- Frontend stores this and includes in `X-Recent-Auth-Token` header

**Apply to sensitive routes**:

```typescript
@UseGuards(JwtAuthGuard, RolesGuard, ReAuthGuard)
@Roles(UserRole.SUPER_ADMIN)
@Delete('admin/users/:id/permanent')
async permanentlyDeleteUser() { ... }
```

---

## 4. Frontend Changes (Next.js Admin Dashboard)

Location: `/apps/raverpay-admin`

### MFA Setup Flow

**Create new page**: `/app/dashboard/security/mfa/setup/page.tsx`

Components:

- QR code display (use `qrcode.react` npm package)
- Manual entry code display
- 6-digit verification input
- Backup codes display with download/copy buttons

**Add to User Settings/Security Page**:

- MFA status badge
- "Enable MFA" button → redirects to setup page
- "Disable MFA" button (requires password confirmation)

**Add to User Settings/Security Page**:

- MFA status badge
- "Enable MFA" button → redirects to setup page
- "Disable MFA" button (requires password confirmation)

### Modified Login Flow

Update `/app/login/page.tsx`:

1. **Step 1**: Email/Password form (existing) - calls `/auth/login`
2. **Handle MFA Response**:
   ```typescript
   const loginMutation = useMutation({
     mutationFn: ({ email, password }: LoginFormData) => authApi.login(email, password),
     onSuccess: (data) => {
       if (data.mfaRequired) {
         // Store temp token
         setTempToken(data.tempToken);
         setShowMfaStep(true); // Show MFA input UI
       } else {
         // Normal login - no MFA
         setAuth(data.user, data.accessToken, data.refreshToken);
         router.push('/dashboard');
       }
     },
   });
   ```
3. **Step 2**: MFA Code Input (conditional)
   - 6-digit input field (auto-focus, auto-submit on 6 digits)
   - "Use backup code instead" link
   - Show remaining attempts on error
   - Loading state during verification

**Create MFA verification handler**:

```typescript
const verifyMfaMutation = useMutation({
  mutationFn: (code: string) => authApi.verifyMfa(tempToken, code),
  onSuccess: (data) => {
    setAuth(data.user, data.accessToken, data.refreshToken);
    toast.success('Login successful!');
    router.push('/dashboard');
  },
  onError: (error) => {
    toast.error(error.response?.data?.message || 'Invalid MFA code');
  },
});
```

### Session Management UI

Create `/app/dashboard/security/sessions/page.tsx`:

- Table showing all active sessions:
  - Device name & type
  - IP address & location
  - Last activity timestamp
  - "Current session" badge
  - "Logout" button for each
- "Logout all other sessions" button at top

### Security Settings Page

Create `/app/dashboard/settings/security/page.tsx`:

**MFA Section**:

- Status badge (Enabled/Disabled)
- Enable button → navigate to setup
- Disable button → show password confirmation modal
- Regenerate backup codes button
- Backup codes remaining count

**Trusted Devices Section**:

- List of known devices
- Trust/untrust toggle
- Remove device button

**Login History**:

- Recent login attempts (last 10)
- Show: timestamp, device, location, status (success/failed)

**Password Section**:

- Change password form
- Last changed timestamp

### Notifications

Update existing notification system to handle:

- New device login alerts (toast + email)
- MFA setup/disabled alerts
- Account lockout warnings
- Unusual location alerts

---

## 5. Testing Requirements

### Unit Tests

Location: `/apps/raverpay-api/src/auth/auth.service.spec.ts`

- ✅ MFA secret generation and encryption
- ✅ TOTP code verification (valid/invalid/expired)
- ✅ Backup code generation and verification
- ✅ MFA lockout after failed attempts
- ✅ IP address extraction from headers
- ✅ IP whitelist matching (exact IP, CIDR ranges, IPv4/IPv6)
- ✅ Concurrent session limits for admins
- ✅ Re-authentication token generation and validation

### Integration Tests

Location: `/apps/raverpay-api/test/auth.e2e-spec.ts`

- ✅ Complete login flow with MFA (email/password → MFA code → tokens)
- ✅ IP blocking before authentication for non-whitelisted IPs
- ✅ Account lockout after 5 failed MFA attempts
- ✅ Session creation and tracking
- ✅ Device fingerprinting and trust status
- ✅ Re-authentication requirement for sensitive operations
- ✅ Backup code usage and removal

### Security Testing

- 🔒 Attempt to bypass MFA with invalid/expired tempToken
- 🔒 Test rate limiting on MFA endpoints
- 🔒 Verify encrypted MFA secrets cannot be decrypted without key
- 🔒 Test session hijacking prevention (refresh token binding)
- 🔒 Verify audit logs capture all required admin events
- 🔒 Test IP whitelist bypass attempts
- 🔒 Verify CIDR range calculations are accurate

### User Acceptance Testing (UAT)

- 👤 Have admins test MFA setup process end-to-end
- 👤 Verify backup code recovery works when phone is lost
- 👤 Test login from different devices (trusted vs. new)
- 👤 Confirm security notification emails are received
- 👤 Test session management (viewing & terminating sessions)
- 👤 Test re-authentication for sensitive operations

---

## 6. Deployment & Rollout Plan

### Phase 1: Infrastructure Setup (Week 1)

- [ ] Update Prisma schema with new MFA fields
- [ ] Create and run database migration: `npx prisma migrate dev --name add_mfa_fields`
- [ ] Create `AdminIpWhitelist` model and migration
- [ ] Add MFA-related fields to `RefreshToken` model
- [ ] Install new npm packages: `speakeasy`, `qrcode`, `ip-address`
- [ ] Deploy to staging environment
- [ ] Set up monitoring for new audit log events

### Phase 2: Backend Implementation (Week 2-3)

- [ ] Implement MFA endpoints in `AuthController` and `AuthService`
- [ ] Create `IpWhitelistGuard` and apply to admin routes
- [ ] Create `ReAuthGuard` for sensitive operations
- [ ] Enhance `DeviceService` for admin device tracking
- [ ] Implement session management endpoints
- [ ] Add audit logging for all new actions
- [ ] Write unit and integration tests (aim for 80%+ coverage)
- [ ] Code review and security audit
- [ ] Deploy to staging, test thoroughly

### Phase 3: Frontend Implementation (Week 3-4)

- [ ] Build MFA setup flow UI (`/dashboard/security/mfa/setup`)
- [ ] Update login page with MFA step handling
- [ ] Create session management page
- [ ] Create security settings page
- [ ] Add security notifications (toast + email)
- [ ] Implement re-authentication modal for sensitive actions
- [ ] Test on staging environment with backend

### Phase 4: Testing & Refinement (Week 4-5)

- [ ] Complete all test suites (unit, integration, e2e)
- [ ] Conduct security audit/penetration testing (internal or external)
- [ ] UAT with selected admins (SUPER_ADMIN first)
- [ ] Fix bugs and gather feedback
- [ ] Performance testing (ensure MFA doesn't slow down login significantly)
- [ ] Documentation review

### Phase 5: Gradual Rollout (Week 5-6)

**DO NOT force MFA immediately for all admins!**

- [ ] Deploy to production (MFA optional)
- [ ] Announce MFA availability to all admins via email
- [ ] Provide setup guide and support
- [ ] Make MFA **mandatory for SUPER_ADMIN** role first (1 week deadline)
- [ ] Monitor adoption rates
- [ ] Send reminders to ADMIN and SUPPORT roles
- [ ] Give 2-week notice before making mandatory for all admin roles
- [ ] Provide support channels (docs, video tutorial, help desk)

### Phase 6: Full Enforcement (Week 7+)

- [ ] Make MFA **mandatory** for all users with `ADMIN`, `SUPPORT`, `SUPER_ADMIN` roles
- [ ] Implement login blocker: If admin role and `twoFactorEnabled = false`, force MFA setup before access
- [ ] Enable IP whitelisting enforcement for all admin routes
- [ ] Monitor security logs daily for first 2 weeks
- [ ] Provide emergency support for locked-out admins
- [ ] Review and adjust session limits, rate limits based on usage patterns

---

## 7. Documentation Requirements

### Technical Documentation

Location: `/apps/raverpay-api/docs/`

**Create `MFA_IMPLEMENTATION.md`**:

- Architecture overview with diagrams
- MFA flow diagrams (setup, login, backup code usage)
- API endpoint documentation (request/response examples)
- Database schema changes
- Environment variables needed
- Encryption details (algorithm, key storage)

**Create `IP_WHITELISTING.md`**:

- How IP whitelisting works
- CIDR notation examples
- How to add/remove IPs
- Emergency bypass procedure
- Troubleshooting common issues

**Update `API_ENDPOINTS.md`**:

- Document all new auth endpoints
- Include curl examples
- Document error codes and responses

### Admin User Guide

Location: `/apps/raverpay-admin/docs/` or `/docs/`

**Create `ADMIN_SECURITY_GUIDE.md`**:

- How to set up MFA (with screenshots)
- Recommended authenticator apps (Google Authenticator, Authy, 1Password)
- How to safely store backup codes
- What to do if phone is lost/stolen (use backup code, then regenerate)
- How to manage active sessions
- How to trust new devices
- Understanding security notifications

**Create `SECURITY_FAQ.md`**:

- Why is MFA required for admins?
- Can I use SMS for MFA? (No, TOTP is more secure)
- How many backup codes do I get? (10, regenerate anytime)
- Can I have multiple devices logged in? (Yes, up to 3 concurrent sessions)
- What happens if I'm locked out? (Contact SUPER_ADMIN, use backup codes)

### Incident Response Playbook

Location: `/docs/SECURITY_INCIDENT_PLAYBOOK.md`

**Add sections**:

**Compromised Admin Account**:

1. Immediately revoke all refresh tokens for that user
2. Disable MFA and force re-setup
3. Lock account temporarily
4. Review audit logs for suspicious activities (use filters)
5. Notify affected users if data was accessed
6. Change all sensitive credentials the admin had access to
7. Conduct post-incident review

**Suspicious Activity Detection**:

1. Check audit logs for specific user and time period
2. Identify affected resources (users, transactions, settings)
3. Correlate with IP whitelist logs
4. Check device fingerprints - is it a new device?
5. Contact admin for verification
6. Take action based on severity

**Emergency Account Unlock**:

1. Verify identity of locked-out admin (email/phone verification)
2. SUPER_ADMIN can manually reset `lockedUntil` in database
3. Provide script: `npm run unlock-admin -- --email=admin@example.com`
4. Log all emergency unlocks in audit log

---

## 8. Monitoring & Alerts

### Metrics to Track

Use existing monitoring (PostHog, Sentry, Logtail):

**Authentication Metrics**:

- Total admin logins per day
- MFA verification success rate (should be >95%)
- Failed MFA attempts per day (alert if >50)
- Account lockouts per day (alert if >3)
- IP whitelist blocks per day (alert if >10 from same IP)
- New device logins per day

**Session Metrics**:

- Average admin session duration
- Concurrent sessions per admin (alert if consistently at limit)
- Session terminations (user-initiated vs. forced)

**Security Metrics**:

- MFA adoption rate (track percentage of admins with MFA enabled)
- Backup code usage frequency
- Re-authentication triggers per day
- Geographic distribution of admin logins (flag unusual countries)

### Alert Triggers

Configure in monitoring system:

**Critical Alerts** (immediate notification):

- ⚠️ More than 5 failed MFA attempts for same user in 10 minutes
- ⚠️ Admin account locked out
- ⚠️ More than 20 IP whitelist blocks in 1 hour (potential attack)
- ⚠️ Login from new country for admin user
- ⚠️ Multiple concurrent logins exceeding limit
- ⚠️ MFA disabled by admin user (security concern)

**Warning Alerts** (review within 1 hour):

- ⚠️ New device login for admin
- ⚠️ Login outside normal working hours (after 10 PM or before 6 AM)
- ⚠️ Backup code used (potential phone loss)
- ⚠️ Admin accessing large amounts of user data (>100 records in 10 min)
- ⚠️ Rapid succession of actions (>50 actions in 5 minutes)

**Info Alerts** (daily digest):

- ℹ️ MFA setup completed by admin
- ℹ️ Admin password changed
- ℹ️ New IP whitelisted
- ℹ️ Session limits reached

### Dashboards

Create Grafana/admin dashboard panel:

**Real-time Security Dashboard**:

- Active admin sessions (count + list)
- Failed MFA attempts (last 24 hours, grouped by user)
- IP whitelist blocks (last 24 hours, grouped by IP)
- Recent critical security events (last 10)
- Map showing admin login locations

**Trend Analysis Dashboard**:

- MFA adoption over time (line chart)
- Admin login patterns (heatmap by hour of day)
- Failed authentication attempts trend
- Session duration distribution
- Top 10 most active admins (by actions performed)

---

## 9. Success Criteria

**Mandatory Requirements** (must be met):

- ✅ 100% of SUPER_ADMIN accounts have MFA enabled
- ✅ 90%+ of ADMIN accounts have MFA enabled within 1 month
- ✅ Zero successful unauthorized admin logins after implementation
- ✅ All admin actions logged in audit system (100% coverage)
- ✅ IP whitelisting blocks all non-whitelisted access attempts
- ✅ MFA setup process takes < 3 minutes
- ✅ Login with MFA adds < 10 seconds to login time

**Performance Criteria**:

- ✅ Average admin login time: < 30 seconds (with MFA)
- ✅ MFA verification success rate: > 95%
- ✅ Zero false positives for trusted device detection
- ✅ Audit log writes complete in < 100ms (async)

**Security Criteria**:

- ✅ Zero successful MFA bypass attempts in security testing
- ✅ All security alerts reviewed within SLA (critical: 15 min, warning: 1 hour)
- ✅ No admin account lockouts due to system issues (only intentional)
- ✅ Compliance with fintech security requirements (PCI-DSS if applicable)

**User Experience Criteria**:

- ✅ Admin satisfaction rating > 4/5 for MFA setup process
- ✅ < 3 support tickets per week related to MFA issues after week 3
- ✅ Documentation completeness: Admins can self-serve 90% of questions

---

## 10. Future Enhancements (Post-MVP)

**Phase 2 Enhancements** (3-6 months):

- 🔮 Biometric authentication (WebAuthn API for fingerprint/Face ID)
- 🔮 Hardware security key support (YubiKey, Titan Security Key via WebAuthn)
- 🔮 SMS-based backup authentication (optional, for backup code emergencies)
- 🔮 Push notification MFA (Authy-style approve/deny on phone)
- 🔮 Risk-based authentication (reduce MFA friction for low-risk actions)
- 🔮 Adaptive authentication (more verification for high-risk scenarios)

**Advanced Security Features**:

- 🔮 Machine learning-based anomaly detection (behavioral analysis)
- 🔮 SIEM integration (Splunk, ELK Stack for advanced monitoring)
- 🔮 Automated threat response (auto-block IPs, auto-lock accounts)
- 🔮 Honeypot endpoints to detect automated attacks
- 🔮 Decoy data for insider threat detection
- 🔮 Admin activity heatmaps and pattern recognition

**Compliance & Reporting**:

- 🔮 Automated compliance reports (SOC 2, PCI-DSS)
- 🔮 Scheduled security audits (weekly reports)
- 🔮 GDPR-compliant audit log retention and deletion
- 🔮 Two-person rule for critical operations (require two admins to approve)

---

## 11. Questions for Clarification

Before starting implementation, please confirm:

### IP Whitelisting

- **Q**: Should IP whitelist be **global** (all admins) or **per-admin**?
  - **Recommendation**: Start with global whitelist, add per-admin override capability later
  - **Rationale**: Office IPs can be shared, VPN IPs can be global

- **Q**: Do admins work from **fixed locations** (office) or **remotely** (home, travel)?
  - **If remote**: Consider VPN requirement + VPN IP whitelisting
  - **If fixed**: Whitelist office IP ranges only

### MFA Enforcement

- **Q**: When should MFA become **mandatory**? Immediately or gradual?
  - **Recommendation**: Gradual rollout over 2 weeks with advance notice
  - **Phase 1**: SUPER_ADMIN only (week 1)
  - **Phase 2**: All admin roles (week 3)

- **Q**: Should we support **SMS MFA** as a backup option?
  - **Recommendation**: No, TOTP is more secure. Use backup codes instead.

### Session Management

- **Q**: Maximum **concurrent sessions** for admins?
  - **Recommendation**: 3 sessions (desktop + tablet + phone)
  - **Rationale**: Allows flexibility without excessive risk

- **Q**: Session **timeout** for inactive admins?
  - **Recommendation**: 30 minutes inactivity = require re-authentication (not logout)
  - **Full logout**: After 24 hours

### Notifications

- **Q**: Preferred **notification channels** for security alerts?
  - Options: Email, SMS, Push notifications, Slack/Discord webhook, In-app
  - **Recommendation**: Email (mandatory) + In-app notifications
  - **For critical**: Email + SMS to SUPER_ADMIN

### Backup Access

- **Q**: What's the process if a SUPER_ADMIN loses phone **and** backup codes?
  - **Recommendation**: Document an emergency recovery process:
    1. Contact another SUPER_ADMIN to verify identity
    2. Provide government-issued ID
    3. Video call verification
    4. Manual MFA reset by CTO/technical founder
    5. Extensive audit logging of the recovery

### Compliance

- **Q**: Specific **compliance standards** we need to meet?
  - PCI-DSS? (if handling card data)
  - SOC 2? (if serving enterprise customers)
  - GDPR? (if serving EU customers)
  - **Action**: Review and ensure audit log retention meets requirements

### Services

- **Q**: Should we use **third-party services** for SMS/email alerts?
  - Current: Using existing email service
  - SMS: Need to integrate Twilio/Africa's Talking for SMS alerts?
  - **Recommendation**: Start with email only, add SMS in Phase 2

### Audit Logs

- **Q**: How long should we **retain audit logs**?
  - **Recommendation**: 90 days in hot storage (database), 2+ years in cold storage (S3)
  - **Rationale**: Balance compliance needs with database performance
  - **Note**: Check legal requirements for Nigeria/fintech industry

---

## 12. Implementation Checklist

### Database

- [ ] Add MFA fields to User model (Prisma schema)
- [ ] Create AdminIpWhitelist model
- [ ] Enhance RefreshToken model with session info
- [ ] Run migrations on staging
- [ ] Test rollback procedures
- [ ] Run migrations on production

### Backend - Core MFA

- [ ] Install packages: `speakeasy`, `qrcode`, `ip-address`
- [ ] Implement MFA secret encryption/decryption utility
- [ ] Create POST `/auth/mfa/setup` endpoint
- [ ] Create POST `/auth/mfa/verify-setup` endpoint
- [ ] Update POST `/auth/login` to handle MFA check
- [ ] Create POST `/auth/mfa/verify` endpoint
- [ ] Create POST `/auth/mfa/verify-backup` endpoint
- [ ] Create POST `/auth/mfa/disable` endpoint
- [ ] Create POST `/auth/mfa/regenerate-backup-codes` endpoint
- [ ] Create GET `/auth/mfa/status` endpoint
- [ ] Add MFA rate limiting

### Backend - IP Whitelisting

- [ ] Create IpWhitelistGuard
- [ ] Apply guard globally or to admin routes
- [ ] Create AdminSecurityController
- [ ] Implement GET `/admin/security/ip-whitelist`
- [ ] Implement POST `/admin/security/ip-whitelist`
- [ ] Implement DELETE `/admin/security/ip-whitelist/:id`
- [ ] Implement PATCH `/admin/security/ip-whitelist/:id`
- [ ] Test CIDR range matching

### Backend - Enhanced Security

- [ ] Update DeviceService for admin device alerts
- [ ] Enhance RefreshToken creation with session info
- [ ] Create GET `/auth/sessions` endpoint
- [ ] Create DELETE `/auth/sessions/:id` endpoint
- [ ] Create DELETE `/auth/sessions/all` endpoint
- [ ] Implement concurrent session limits
- [ ] Create ReAuthGuard
- [ ] Create POST `/auth/verify-password-reauth` endpoint
- [ ] Apply ReAuthGuard to sensitive endpoints
- [ ] Create AdminAuditInterceptor
- [ ] Apply audit interceptor globally

### Frontend - MFA

- [ ] Create `/app/dashboard/security/mfa/setup/page.tsx`
- [ ] Install `qrcode.react` package
- [ ] Implement QR code display
- [ ] Implement 6-digit MFA input component
- [ ] Update `/app/login/page.tsx` with MFA step
- [ ] Add MFA verification logic
- [ ] Add backup code input option
- [ ] Create MFA status section in settings

### Frontend - Security Features

- [ ] Create `/app/dashboard/security/sessions/page.tsx`
- [ ] Create session management UI
- [ ] Create `/app/dashboard/settings/security/page.tsx`
- [ ] Implement device management UI
- [ ] Create re-authentication modal
- [ ] Add security notification toasts
- [ ] Update email notification templates

### Testing

- [ ] Write unit tests for MFA service
- [ ] Write integration tests for auth flow
- [ ] Write e2e tests for full MFA setup
- [ ] Conduct security testing (penetration testing)
- [ ] UAT with selected admins
- [ ] Performance testing

### Documentation

- [ ] Create MFA_IMPLEMENTATION.md
- [ ] Create IP_WHITELISTING.md
- [ ] Update API_ENDPOINTS.md
- [ ] Create ADMIN_SECURITY_GUIDE.md
- [ ] Create SECURITY_FAQ.md
- [ ] Update SECURITY_INCIDENT_PLAYBOOK.md
- [ ] Create setup video tutorial

### Deployment

- [ ] Deploy to staging
- [ ] Test all features on staging
- [ ] Deploy to production (MFA optional)
- [ ] Announce MFA to admins
- [ ] Monitor adoption
- [ ] Enforce MFA for SUPER_ADMIN
- [ ] Enforce MFA for all admin roles

---

## Summary

This implementation will significantly strengthen admin security by:

1. **Leveraging existing infrastructure** (User model, Device model, AuditLog, RefreshToken)
2. **Extending AuthModule** (not creating separate admin auth)
3. **Adding MFA** using TOTP with backup codes
4. **Implementing IP whitelisting** with CIDR support
5. **Enhancing device tracking** and session management
6. **Comprehensive audit logging** of all admin actions

The solution is **practical**, **scalable**, and **aligned with fintech best practices** while working within your existing codebase architecture.

Please review and confirm the questions in Section 11 before implementation begins.
