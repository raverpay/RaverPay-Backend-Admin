-- Migration: Change circle_wallets unique constraint to include custodyType
-- This allows users to have both developer-controlled AND user-controlled wallets on the same blockchain

-- Step 1: Drop the existing unique constraint
ALTER TABLE circle_wallets DROP CONSTRAINT IF EXISTS circle_wallets_userId_blockchain_key;

-- Step 2: Create the new unique constraint with custodyType
ALTER TABLE circle_wallets ADD CONSTRAINT circle_wallets_userId_blockchain_custodyType_key 
UNIQUE ("userId", "blockchain", "custodyType");

-- Verify the change
SELECT conname, contype 
FROM pg_constraint 
WHERE conrelid = 'circle_wallets'::regclass 
AND contype = 'u';
