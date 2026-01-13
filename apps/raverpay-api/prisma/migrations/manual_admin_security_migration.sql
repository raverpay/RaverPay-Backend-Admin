-- Manual Migration: Admin Security Features (MFA, IP Whitelisting, Session Tracking)
-- Created: 2025-01-XX
-- Description: Adds MFA fields to users, creates admin_ip_whitelist table, and enhances refresh_tokens with session tracking

-- ============================================================================
-- PART 1: Add MFA fields to users table
-- ============================================================================

-- Add MFA backup codes array (TEXT[])
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS "mfaBackupCodes" TEXT[] DEFAULT '{}';

-- Add MFA failed attempts counter
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS "mfaFailedAttempts" INTEGER NOT NULL DEFAULT 0;

-- Add last MFA failure timestamp
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS "lastMfaFailure" TIMESTAMP(3);

-- Add MFA enabled timestamp
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS "mfaEnabledAt" TIMESTAMP(3);

-- Add last MFA success timestamp
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS "lastMfaSuccess" TIMESTAMP(3);

-- ============================================================================
-- PART 2: Create admin_ip_whitelist table
-- ============================================================================

CREATE TABLE IF NOT EXISTS admin_ip_whitelist (
    id TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL UNIQUE,
    description TEXT,
    "userId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastUsedAt" TIMESTAMP(3),
    "usageCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT admin_ip_whitelist_pkey PRIMARY KEY (id)
);

-- Create indexes for admin_ip_whitelist
CREATE INDEX IF NOT EXISTS admin_ip_whitelist_ipAddress_idx ON admin_ip_whitelist("ipAddress");
CREATE INDEX IF NOT EXISTS admin_ip_whitelist_userId_idx ON admin_ip_whitelist("userId");
CREATE INDEX IF NOT EXISTS admin_ip_whitelist_isActive_idx ON admin_ip_whitelist("isActive");

-- Add foreign key constraints for admin_ip_whitelist
-- Note: PostgreSQL doesn't support IF NOT EXISTS for ADD CONSTRAINT
-- We'll check if constraint exists before adding
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'admin_ip_whitelist_userId_fkey'
  ) THEN
    ALTER TABLE admin_ip_whitelist
      ADD CONSTRAINT admin_ip_whitelist_userId_fkey
      FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'admin_ip_whitelist_createdBy_fkey'
  ) THEN
    ALTER TABLE admin_ip_whitelist
      ADD CONSTRAINT admin_ip_whitelist_createdBy_fkey
      FOREIGN KEY ("createdBy") REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

-- ============================================================================
-- PART 3: Add session tracking fields to refresh_tokens table
-- ============================================================================

-- Add device ID
ALTER TABLE refresh_tokens
  ADD COLUMN IF NOT EXISTS "deviceId" TEXT;

-- Add IP address
ALTER TABLE refresh_tokens
  ADD COLUMN IF NOT EXISTS "ipAddress" TEXT;

-- Add location
ALTER TABLE refresh_tokens
  ADD COLUMN IF NOT EXISTS location TEXT;

-- Add user agent
ALTER TABLE refresh_tokens
  ADD COLUMN IF NOT EXISTS "userAgent" TEXT;

-- Add last used timestamp (with default)
ALTER TABLE refresh_tokens
  ADD COLUMN IF NOT EXISTS "lastUsedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Create index for deviceId
CREATE INDEX IF NOT EXISTS refresh_tokens_deviceId_idx ON refresh_tokens("deviceId");

-- ============================================================================
-- Verification queries (run these after migration to verify)
-- ============================================================================

-- Verify users table has MFA columns
-- SELECT column_name, data_type, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'users' 
-- AND column_name IN ('mfaBackupCodes', 'mfaFailedAttempts', 'lastMfaFailure', 'mfaEnabledAt', 'lastMfaSuccess')
-- ORDER BY ordinal_position;

-- Verify admin_ip_whitelist table exists
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename = 'admin_ip_whitelist';

-- Verify refresh_tokens has session tracking columns
-- SELECT column_name, data_type, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'refresh_tokens' 
-- AND column_name IN ('deviceId', 'ipAddress', 'location', 'userAgent', 'lastUsedAt')
-- ORDER BY ordinal_position;

