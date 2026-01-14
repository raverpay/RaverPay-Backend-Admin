-- Migration: Add mustChangePassword and passwordChangedAt fields to users table
-- Date: 2024-01-XX
-- Description: Add fields to support mandatory password change on first login for admin users

-- Add mustChangePassword column (defaults to false)
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS "mustChangePassword" BOOLEAN NOT NULL DEFAULT false;

-- Add passwordChangedAt column (nullable)
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS "passwordChangedAt" TIMESTAMP(3);

-- Set mustChangePassword = true for existing admins without passwordChangedAt
-- This ensures existing admins will be prompted to change password on next login
UPDATE users
SET "mustChangePassword" = true
WHERE role IN ('ADMIN', 'SUPPORT', 'SUPER_ADMIN')
  AND "passwordChangedAt" IS NULL
  AND "mustChangePassword" = false;

-- Add comment to columns for documentation
COMMENT ON COLUMN users."mustChangePassword" IS 'Flag to indicate user must change password on next login';
COMMENT ON COLUMN users."passwordChangedAt" IS 'Timestamp when user last changed their password';

