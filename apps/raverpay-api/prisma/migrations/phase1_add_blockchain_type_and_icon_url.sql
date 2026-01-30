-- Phase 1: Add blockchainType and iconUrl columns to alchemy_network_config
-- This migration adds support for multi-chain networks (EVM, Solana, Tron)

-- Step 1: Add new columns
ALTER TABLE alchemy_network_config
  ADD COLUMN IF NOT EXISTS "blockchainType" TEXT NOT NULL DEFAULT 'EVM',
  ADD COLUMN IF NOT EXISTS "iconUrl" TEXT;

-- Step 2: Create index for blockchainType
CREATE INDEX IF NOT EXISTS "alchemy_network_config_blockchainType_idx" ON alchemy_network_config("blockchainType");

-- Step 3: Add comment for documentation
COMMENT ON COLUMN alchemy_network_config."blockchainType" IS 'Blockchain category: EVM, SOLANA, or TRON';
COMMENT ON COLUMN alchemy_network_config."iconUrl" IS 'Cloudinary URL for blockchain logo';

-- Verification query (uncomment to run manually):
-- SELECT 
--   "tokenType", 
--   "blockchain", 
--   "network", 
--   "blockchainType",
--   "iconUrl",
--   "isEnabled"
-- FROM alchemy_network_config
-- ORDER BY "displayOrder";
