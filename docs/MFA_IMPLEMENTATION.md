# Multi-Factor Authentication (MFA) Implementation Guide

## Overview

This document describes the technical implementation of Multi-Factor Authentication (MFA) for admin users in the RaverPay platform. MFA uses Time-Based One-Time Passwords (TOTP) as specified in RFC 6238.

---

## Architecture

### Components

1. **Backend (NestJS)**
   - `AuthService`: Core MFA logic
   - `MfaEncryptionUtil`: Secret encryption/decryption
   - `AuthController`: MFA endpoints
   - Prisma models: User, RefreshToken

2. **Frontend (Next.js)**
   - MFA setup page
   - Login flow with MFA verification
   - MFA management in settings

3. **Database**
   - User model fields for MFA state
   - Encrypted TOTP secrets
   - Hashed backup codes

---

## Database Schema

### User Model Fields

```prisma
model User {
  // Existing fields
  twoFactorEnabled       Boolean                  @default(false)
  twoFactorSecret        String?                  // Encrypted TOTP secret

  // New MFA fields
  mfaBackupCodes         String[]                 @default([])  // Hashed backup codes
  mfaFailedAttempts      Int                      @default(0)
  lastMfaFailure         DateTime?
  mfaEnabledAt           DateTime?
  lastMfaSuccess         DateTime?
}
```

---

## Backend Implementation

### MFA Setup Flow

**Endpoint**: `POST /auth/mfa/setup`

**Process**:

1. User requests MFA setup
2. Generate TOTP secret using `speakeasy.generateSecret()`
3. Create QR code with `qrcode.toDataURL()`
4. Store encrypted secret temporarily (not enabled yet)
5. Return QR code, manual entry key, and backup codes

**Response**:

```typescript
{
  secret: string;           // Base32 secret (for manual entry)
  qrCode: string;           // Data URL for QR code
  manualEntryKey: string;   // Formatted secret for manual entry
  backupCodes: string[];     // 10 backup codes (plain text)
}
```

### MFA Verification Setup

**Endpoint**: `POST /auth/mfa/verify-setup`

**Process**:

1. User scans QR code and enters 6-digit code
2. Verify code using `speakeasy.totp.verify()`
3. If valid:
   - Encrypt secret using `MfaEncryptionUtil`
   - Hash backup codes using Argon2
   - Enable MFA (`twoFactorEnabled = true`)
   - Store encrypted secret and hashed backup codes
   - Log audit event
   - Send notification email

**Request**:

```typescript
{
  code: string; // 6-digit TOTP code
}
```

### Login with MFA

**Modified Endpoint**: `POST /auth/login`

**Process**:

1. Verify email/password (existing flow)
2. Check if user is admin (`ADMIN`, `SUPPORT`, `SUPER_ADMIN`)
3. Check if MFA is enabled (`twoFactorEnabled`)
4. If MFA enabled:
   - Generate temporary token (short-lived, 5 minutes)
   - Return `mfaRequired: true` with `tempToken`
5. If MFA not enabled:
   - Generate access/refresh tokens (normal flow)

**Response (MFA Required)**:

```typescript
{
  mfaRequired: true;
  tempToken: string; // Short-lived token for MFA verification
  message: 'MFA verification required';
}
```

### MFA Code Verification

**Endpoint**: `POST /auth/mfa/verify`

**Process**:

1. Verify `tempToken` (JWT validation)
2. Decrypt TOTP secret
3. Verify code using `speakeasy.totp.verify()`
4. If valid:
   - Reset failed attempts
   - Update `lastMfaSuccess`
   - Generate full access/refresh tokens
   - Register/update device
   - Log audit event
5. If invalid:
   - Increment `mfaFailedAttempts`
   - Update `lastMfaFailure`
   - Lock account after 5 failed attempts

**Request**:

```typescript
{
  tempToken: string; // From login response
  code: string; // 6-digit TOTP code
}
```

**Response**:

```typescript
{
  accessToken: string;
  refreshToken: string;
  user: User;
}
```

### Backup Code Verification

**Endpoint**: `POST /auth/mfa/verify-backup`

**Process**:

1. Verify `tempToken`
2. Hash provided backup code
3. Compare with stored hashed backup codes
4. If match:
   - Remove used backup code from array
   - Generate full access/refresh tokens
   - Log audit event
5. If no match:
   - Increment failed attempts
   - Lock account after 5 failed attempts

**Request**:

```typescript
{
  tempToken: string;
  backupCode: string; // 8-digit backup code
}
```

### Disable MFA

**Endpoint**: `POST /auth/mfa/disable`

**Process**:

1. Verify password (re-authentication)
2. Clear encrypted secret
3. Clear backup codes
4. Set `twoFactorEnabled = false`
5. Reset failed attempts
6. Log audit event
7. Send notification email

**Request**:

```typescript
{
  password: string; // User password for verification
}
```

### Regenerate Backup Codes

**Endpoint**: `POST /auth/mfa/regenerate-backup-codes`

**Process**:

1. Generate 10 new backup codes
2. Hash all codes using Argon2
3. Replace old backup codes
4. Return plain text codes (user must save)
5. Log audit event

**Response**:

```typescript
{
  backupCodes: string[];  // 10 new backup codes
}
```

---

## Security Considerations

### Secret Encryption

- **Algorithm**: AES-256-GCM
- **Key Derivation**: PBKDF2 with 100,000 iterations
- **Storage**: Encrypted secrets stored in database
- **Key Management**: Encryption key stored in environment variable

### Backup Codes

- **Format**: 8-digit numeric codes
- **Storage**: Hashed using Argon2
- **Usage**: Single-use only (removed after use)
- **Generation**: Cryptographically secure random

### Rate Limiting

- **Failed Attempts**: Lock account after 5 failed MFA attempts
- **Lock Duration**: 30 minutes
- **Reset**: Failed attempts reset on successful verification

### Token Security

- **Temp Token**: Short-lived (5 minutes) for MFA verification
- **Access Token**: Standard JWT with user claims
- **Refresh Token**: Stored in database with session info

---

## Frontend Implementation

### MFA Setup Page

**Location**: `/app/dashboard/security/mfa/setup/page.tsx`

**Flow**:

1. User clicks "Enable MFA"
2. Call `POST /auth/mfa/setup`
3. Display QR code using `qrcode.react`
4. Show manual entry key
5. User enters 6-digit code
6. Call `POST /auth/mfa/verify-setup`
7. Display backup codes (user must save)
8. Redirect to security settings

### Login Flow with MFA

**Location**: `/app/login/page.tsx`

**Flow**:

1. User enters email/password
2. Call `POST /auth/login`
3. If `mfaRequired: true`:
   - Show MFA code input
   - User enters 6-digit code
   - Call `POST /auth/mfa/verify`
   - Store tokens and redirect
4. If backup code needed:
   - Show backup code input
   - Call `POST /auth/mfa/verify-backup`

---

## Testing

### Unit Tests

**File**: `src/auth/auth.service.mfa.spec.ts`

**Coverage**:

- MFA setup generation
- TOTP code verification
- Backup code verification
- Failed attempt handling
- Account lockout
- MFA disable

### Integration Tests

**Scenarios**:

- Complete MFA setup flow
- Login with MFA
- Login with backup code
- Failed MFA attempts
- Account lockout recovery

---

## API Endpoints Summary

| Method | Endpoint                            | Description                               | Auth Required  |
| ------ | ----------------------------------- | ----------------------------------------- | -------------- |
| POST   | `/auth/mfa/setup`                   | Generate MFA secret and QR code           | Yes            |
| POST   | `/auth/mfa/verify-setup`            | Verify and enable MFA                     | Yes            |
| POST   | `/auth/mfa/verify`                  | Verify MFA code during login              | No (tempToken) |
| POST   | `/auth/mfa/verify-backup`           | Verify backup code during login           | No (tempToken) |
| POST   | `/auth/mfa/disable`                 | Disable MFA                               | Yes + Password |
| POST   | `/auth/mfa/regenerate-backup-codes` | Generate new backup codes                 | Yes            |
| GET    | `/auth/mfa/status`                  | Get MFA status and remaining backup codes | Yes            |

---

## Dependencies

### Backend

```json
{
  "speakeasy": "^2.0.0", // TOTP generation/verification
  "qrcode": "^1.5.3", // QR code generation
  "argon2": "^0.31.2" // Backup code hashing
}
```

### Frontend

```json
{
  "qrcode.react": "^3.1.0" // QR code display component
}
```

---

## Environment Variables

### Backend

```env
MFA_ENCRYPTION_KEY=your-encryption-key-here
MFA_ENCRYPTION_SALT=your-salt-here  # Optional, defaults to key
```

---

## Error Handling

### Common Errors

**Invalid TOTP Code**:

- Status: `400 Bad Request`
- Message: "Invalid MFA code"

**Account Locked**:

- Status: `423 Locked`
- Message: "Account locked due to too many failed MFA attempts"

**MFA Not Enabled**:

- Status: `400 Bad Request`
- Message: "MFA is not enabled for this account"

**Backup Code Already Used**:

- Status: `400 Bad Request`
- Message: "Backup code has already been used"

---

## Future Enhancements

- [ ] SMS MFA as backup option
- [ ] Hardware security keys (WebAuthn)
- [ ] Biometric authentication
- [ ] MFA recovery via email
- [ ] MFA enforcement policies per role

---

**Last Updated**: January 2025  
**Version**: 1.0
