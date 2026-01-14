-- Manual SQL migration: Add ipWhitelistGracePeriodUntil to User table
-- Run this script manually if prisma migrate fails
-- See: raverpay/md/CRITICAL/PRISMA_MIGRATION_WORKAROUND.md

-- Add ipWhitelistGracePeriodUntil field to User table
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS "ipWhitelistGracePeriodUntil" TIMESTAMP(3);

-- Note: This field is nullable and will be set when admin is created with skipIpWhitelist: true
-- Default grace period is 24 hours from account creation

