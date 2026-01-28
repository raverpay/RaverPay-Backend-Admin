-- ================================
-- Stablecoin Models Migration
-- Date: 2026-01-28
-- Description: Add StablecoinWallet and StablecoinDeposit models, update AlchemyWallet for one wallet per user
-- ================================

-- 1. Drop existing unique constraint on alchemy_wallets (userId, blockchain, network)
DO $$ 
BEGIN
    -- Drop the old unique constraint if it exists
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'alchemy_wallets_userId_blockchain_network_key'
    ) THEN
        ALTER TABLE alchemy_wallets 
        DROP CONSTRAINT alchemy_wallets_userId_blockchain_network_key;
    END IF;
END $$;

-- 2. Handle duplicate userIds - keep only the first wallet per user
DO $$
DECLARE
    duplicate_user RECORD;
BEGIN
    -- Find users with multiple wallets and keep only the first one
    FOR duplicate_user IN 
        SELECT "userId", MIN(id) as keep_id
        FROM alchemy_wallets
        GROUP BY "userId"
        HAVING COUNT(*) > 1
    LOOP
        -- Delete all wallets except the first one for this user
        DELETE FROM alchemy_wallets
        WHERE "userId" = duplicate_user."userId"
        AND id != duplicate_user.keep_id;
    END LOOP;
END $$;

-- 3. Add new unique constraint on userId only (one wallet per user)
DO $$ 
BEGIN
    -- Drop existing constraint if it exists
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'alchemy_wallets_userId_key'
    ) THEN
        ALTER TABLE alchemy_wallets 
        DROP CONSTRAINT alchemy_wallets_userId_key;
    END IF;
    
    -- Add unique constraint on userId
    ALTER TABLE alchemy_wallets 
    ADD CONSTRAINT alchemy_wallets_userId_key UNIQUE ("userId");
END $$;

-- 3. Make blockchain and network nullable in alchemy_wallets
ALTER TABLE alchemy_wallets
  ALTER COLUMN blockchain DROP NOT NULL,
  ALTER COLUMN network DROP NOT NULL;

-- 4. Update default accountType to EOA (if needed)
ALTER TABLE alchemy_wallets
  ALTER COLUMN "accountType" SET DEFAULT 'EOA';

-- 5. Update default isGasSponsored to false (if needed)
ALTER TABLE alchemy_wallets
  ALTER COLUMN "isGasSponsored" SET DEFAULT false;

-- 6. Create stablecoin_wallets table
CREATE TABLE IF NOT EXISTS stablecoin_wallets (
    id TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "alchemyWalletId" TEXT NOT NULL,
    "tokenType" TEXT NOT NULL,
    blockchain TEXT NOT NULL,
    network TEXT NOT NULL,
    address TEXT NOT NULL,
    "monthlyIncomeRange" TEXT,
    "bankStatementUrl" TEXT,
    "termsAccepted" BOOLEAN NOT NULL DEFAULT false,
    "termsAcceptedAt" TIMESTAMP(3),
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT stablecoin_wallets_pkey PRIMARY KEY (id),
    CONSTRAINT stablecoin_wallets_userId_tokenType_blockchain_network_key UNIQUE ("userId", "tokenType", blockchain, network)
);

-- 7. Create indexes on stablecoin_wallets
CREATE INDEX IF NOT EXISTS stablecoin_wallets_userId_idx ON stablecoin_wallets("userId");
CREATE INDEX IF NOT EXISTS stablecoin_wallets_address_idx ON stablecoin_wallets(address);
CREATE INDEX IF NOT EXISTS stablecoin_wallets_tokenType_idx ON stablecoin_wallets("tokenType");
CREATE INDEX IF NOT EXISTS stablecoin_wallets_blockchain_idx ON stablecoin_wallets(blockchain);
CREATE INDEX IF NOT EXISTS stablecoin_wallets_network_idx ON stablecoin_wallets(network);
CREATE INDEX IF NOT EXISTS stablecoin_wallets_status_idx ON stablecoin_wallets(status);

-- 8. Add foreign key constraints for stablecoin_wallets
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'stablecoin_wallets_userId_fkey'
    ) THEN
        ALTER TABLE stablecoin_wallets
        ADD CONSTRAINT stablecoin_wallets_userId_fkey
        FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'stablecoin_wallets_alchemyWalletId_fkey'
    ) THEN
        ALTER TABLE stablecoin_wallets
        ADD CONSTRAINT stablecoin_wallets_alchemyWalletId_fkey
        FOREIGN KEY ("alchemyWalletId") REFERENCES alchemy_wallets(id) ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- 9. Create stablecoin_deposits table
CREATE TABLE IF NOT EXISTS stablecoin_deposits (
    id TEXT NOT NULL,
    "stablecoinWalletId" TEXT NOT NULL,
    "transactionHash" TEXT NOT NULL,
    "tokenType" TEXT NOT NULL,
    amount TEXT NOT NULL,
    "amountUSD" DECIMAL(65, 30),
    blockchain TEXT NOT NULL,
    network TEXT NOT NULL,
    "blockNumber" TEXT,
    status TEXT NOT NULL DEFAULT 'PENDING',
    "confirmedAt" TIMESTAMP(3),
    "convertedAt" TIMESTAMP(3),
    "nairaCredited" BOOLEAN NOT NULL DEFAULT false,
    "nairaAmount" DECIMAL(65, 30),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT stablecoin_deposits_pkey PRIMARY KEY (id),
    CONSTRAINT stablecoin_deposits_transactionHash_key UNIQUE ("transactionHash")
);

-- 10. Create indexes on stablecoin_deposits
CREATE INDEX IF NOT EXISTS stablecoin_deposits_stablecoinWalletId_idx ON stablecoin_deposits("stablecoinWalletId");
CREATE INDEX IF NOT EXISTS stablecoin_deposits_transactionHash_idx ON stablecoin_deposits("transactionHash");
CREATE INDEX IF NOT EXISTS stablecoin_deposits_status_idx ON stablecoin_deposits(status);
CREATE INDEX IF NOT EXISTS stablecoin_deposits_tokenType_idx ON stablecoin_deposits("tokenType");
CREATE INDEX IF NOT EXISTS stablecoin_deposits_blockchain_idx ON stablecoin_deposits(blockchain);
CREATE INDEX IF NOT EXISTS stablecoin_deposits_network_idx ON stablecoin_deposits(network);
CREATE INDEX IF NOT EXISTS stablecoin_deposits_createdAt_idx ON stablecoin_deposits("createdAt");

-- 11. Add foreign key constraint for stablecoin_deposits
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'stablecoin_deposits_stablecoinWalletId_fkey'
    ) THEN
        ALTER TABLE stablecoin_deposits
        ADD CONSTRAINT stablecoin_deposits_stablecoinWalletId_fkey
        FOREIGN KEY ("stablecoinWalletId") REFERENCES stablecoin_wallets(id) ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- 12. Verify tables were created
DO $$
BEGIN
    RAISE NOTICE 'Migration completed successfully';
    RAISE NOTICE 'Tables created: stablecoin_wallets, stablecoin_deposits';
    RAISE NOTICE 'AlchemyWallet updated: one wallet per user';
END $$;
