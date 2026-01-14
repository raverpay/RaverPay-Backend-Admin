-- Manual SQL migration: Add personalEmail to User and expiresAt to AdminIpWhitelist
-- Run this script manually if prisma migrate fails
-- See: raverpay/md/CRITICAL/PRISMA_MIGRATION_WORKAROUND.md

-- Add personalEmail field to User table
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS "personalEmail" TEXT UNIQUE;

-- Add expiresAt field to AdminIpWhitelist table
ALTER TABLE admin_ip_whitelist
  ADD COLUMN IF NOT EXISTS "expiresAt" TIMESTAMP(3);

-- Create index on personalEmail for faster lookups
CREATE INDEX IF NOT EXISTS "users_personalEmail_idx" ON users("personalEmail");

-- Note: No default values needed as both fields are nullable

