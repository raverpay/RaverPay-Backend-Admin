-- ============================================
-- OUTBOUND EMAILS TABLE MIGRATION
-- ============================================
-- This migration adds the outbound_emails table for tracking
-- all emails sent from the admin dashboard (both replies and fresh emails)
-- 
-- Date: 2025-12-22
-- Purpose: Enable tracking of sent emails with delivery status and threading
-- ============================================

-- Create outbound_emails table
CREATE TABLE IF NOT EXISTS outbound_emails (
    id TEXT NOT NULL,
    "resendEmailId" TEXT,
    "sentBy" TEXT NOT NULL,
    "fromEmail" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    cc TEXT[] DEFAULT ARRAY[]::TEXT[],
    bcc TEXT[] DEFAULT ARRAY[]::TEXT[],
    subject TEXT NOT NULL,
    content TEXT NOT NULL,
    attachments JSONB,
    "inReplyTo" TEXT,
    "inboundEmailId" TEXT,
    "conversationId" TEXT,
    "userId" TEXT,
    status TEXT NOT NULL DEFAULT 'SENT',
    "deliveredAt" TIMESTAMP(3),
    "openedAt" TIMESTAMP(3),
    "clickedAt" TIMESTAMP(3),
    "failureReason" TEXT,
    metadata JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT outbound_emails_pkey PRIMARY KEY (id)
);

-- Create unique constraint on resendEmailId
CREATE UNIQUE INDEX IF NOT EXISTS outbound_emails_resendEmailId_key 
ON outbound_emails("resendEmailId") 
WHERE "resendEmailId" IS NOT NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS outbound_emails_sentby_idx ON outbound_emails("sentBy");
CREATE INDEX IF NOT EXISTS outbound_emails_fromemail_idx ON outbound_emails("fromEmail");
CREATE INDEX IF NOT EXISTS outbound_emails_to_idx ON outbound_emails("to");
CREATE INDEX IF NOT EXISTS outbound_emails_inboundemailid_idx ON outbound_emails("inboundEmailId");
CREATE INDEX IF NOT EXISTS outbound_emails_conversationid_idx ON outbound_emails("conversationId");
CREATE INDEX IF NOT EXISTS outbound_emails_userid_idx ON outbound_emails("userId");
CREATE INDEX IF NOT EXISTS outbound_emails_status_idx ON outbound_emails(status);
CREATE INDEX IF NOT EXISTS outbound_emails_createdat_idx ON outbound_emails("createdAt");
CREATE INDEX IF NOT EXISTS outbound_emails_sentby_createdat_idx ON outbound_emails("sentBy", "createdAt");

-- Add foreign key constraints
-- Note: Using DO blocks to handle "already exists" errors gracefully
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'outbound_emails_sentby_fkey'
    ) THEN
        ALTER TABLE outbound_emails
        ADD CONSTRAINT outbound_emails_sentby_fkey
        FOREIGN KEY ("sentBy") REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'outbound_emails_userid_fkey'
    ) THEN
        ALTER TABLE outbound_emails
        ADD CONSTRAINT outbound_emails_userid_fkey
        FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'outbound_emails_inboundemailid_fkey'
    ) THEN
        ALTER TABLE outbound_emails
        ADD CONSTRAINT outbound_emails_inboundemailid_fkey
        FOREIGN KEY ("inboundEmailId") REFERENCES inbound_emails(id) ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'outbound_emails_conversationid_fkey'
    ) THEN
        ALTER TABLE outbound_emails
        ADD CONSTRAINT outbound_emails_conversationid_fkey
        FOREIGN KEY ("conversationId") REFERENCES conversations(id) ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- Verification query (commented out - uncomment to verify)
-- SELECT column_name, data_type, column_default, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'outbound_emails'
-- ORDER BY ordinal_position;
