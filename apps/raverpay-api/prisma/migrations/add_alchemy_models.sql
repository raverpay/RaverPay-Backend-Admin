-- ================================
-- Alchemy Models Migration
-- Date: 2026-01-25
-- Description: Add Alchemy integration tables and enums
-- ================================

-- 1. Create Alchemy Account Type Enum
DO $$ BEGIN
    CREATE TYPE "AlchemyAccountType" AS ENUM ('EOA', 'SMART_CONTRACT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create Alchemy Wallet State Enum
DO $$ BEGIN
    CREATE TYPE "AlchemyWalletState" AS ENUM ('ACTIVE', 'INACTIVE', 'LOCKED', 'COMPROMISED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Create Alchemy Transaction Type Enum
DO $$ BEGIN
    CREATE TYPE "AlchemyTransactionType" AS ENUM ('SEND', 'RECEIVE', 'INTERNAL', 'SWAP', 'BRIDGE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 4. Create Alchemy Transaction State Enum
DO $$ BEGIN
    CREATE TYPE "AlchemyTransactionState" AS ENUM ('PENDING', 'SUBMITTED', 'CONFIRMED', 'COMPLETED', 'FAILED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 5. Create alchemy_wallets table
CREATE TABLE IF NOT EXISTS alchemy_wallets (
    id TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    address TEXT NOT NULL,
    "encryptedPrivateKey" TEXT NOT NULL,
    blockchain TEXT NOT NULL,
    network TEXT NOT NULL,
    "accountType" "AlchemyAccountType" NOT NULL DEFAULT 'SMART_CONTRACT',
    state "AlchemyWalletState" NOT NULL DEFAULT 'ACTIVE',
    name TEXT,
    "isGasSponsored" BOOLEAN NOT NULL DEFAULT true,
    "gasPolicyId" TEXT,
    "alchemyAppId" TEXT,
    "webhookId" TEXT,
    "lastKeyRotation" TIMESTAMP(3),
    "keyRotationCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT alchemy_wallets_pkey PRIMARY KEY (id)
);

-- 6. Create alchemy_transactions table
CREATE TABLE IF NOT EXISTS alchemy_transactions (
    id TEXT NOT NULL,
    reference TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    type "AlchemyTransactionType" NOT NULL,
    state "AlchemyTransactionState" NOT NULL DEFAULT 'PENDING',
    "sourceAddress" TEXT,
    "destinationAddress" TEXT NOT NULL,
    "tokenAddress" TEXT,
    blockchain TEXT NOT NULL,
    network TEXT NOT NULL,
    amount TEXT NOT NULL,
    "amountFormatted" TEXT,
    "transactionHash" TEXT,
    "blockNumber" BIGINT,
    "blockHash" TEXT,
    "gasUsed" TEXT,
    "gasPrice" TEXT,
    "networkFee" TEXT,
    "networkFeeUsd" TEXT,
    "userOperationHash" TEXT,
    "serviceFee" TEXT,
    "feeCollected" BOOLEAN NOT NULL DEFAULT false,
    "errorCode" TEXT,
    "errorMessage" TEXT,
    confirmations INTEGER NOT NULL DEFAULT 0,
    "isInternal" BOOLEAN NOT NULL DEFAULT false,
    metadata JSONB,
    "completedAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT alchemy_transactions_pkey PRIMARY KEY (id)
);

-- 7. Create alchemy_user_operations table
CREATE TABLE IF NOT EXISTS alchemy_user_operations (
    id TEXT NOT NULL,
    "userOperationHash" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    sender TEXT NOT NULL,
    nonce TEXT NOT NULL,
    "callData" TEXT NOT NULL,
    "callGasLimit" TEXT NOT NULL,
    "verificationGasLimit" TEXT NOT NULL,
    "preVerificationGas" TEXT NOT NULL,
    "maxFeePerGas" TEXT NOT NULL,
    "maxPriorityFeePerGas" TEXT NOT NULL,
    "paymasterAndData" TEXT,
    signature TEXT NOT NULL,
    "bundlerUsed" BOOLEAN NOT NULL DEFAULT true,
    "gasPolicyId" TEXT,
    "gasSponsored" BOOLEAN NOT NULL DEFAULT false,
    "transactionHash" TEXT,
    "blockNumber" BIGINT,
    status TEXT NOT NULL DEFAULT 'PENDING',
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT alchemy_user_operations_pkey PRIMARY KEY (id)
);

-- 8. Create alchemy_gas_spending table
CREATE TABLE IF NOT EXISTS alchemy_gas_spending (
    id TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "walletAddress" TEXT NOT NULL,
    blockchain TEXT NOT NULL,
    network TEXT NOT NULL,
    "gasPolicyId" TEXT NOT NULL,
    date TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalGasUsed" TEXT NOT NULL,
    "totalGasUsd" TEXT NOT NULL,
    "transactionCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT alchemy_gas_spending_pkey PRIMARY KEY (id)
);

-- ================================
-- Unique Constraints
-- ================================

-- AlchemyWallet unique constraints
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'alchemy_wallets_address_key'
    ) THEN
        ALTER TABLE alchemy_wallets
            ADD CONSTRAINT alchemy_wallets_address_key UNIQUE (address);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'alchemy_wallets_userId_blockchain_network_key'
    ) THEN
        ALTER TABLE alchemy_wallets
            ADD CONSTRAINT alchemy_wallets_userId_blockchain_network_key 
            UNIQUE ("userId", blockchain, network);
    END IF;
END $$;

-- AlchemyTransaction unique constraints
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'alchemy_transactions_reference_key'
    ) THEN
        ALTER TABLE alchemy_transactions
            ADD CONSTRAINT alchemy_transactions_reference_key UNIQUE (reference);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'alchemy_transactions_transactionHash_key'
    ) THEN
        ALTER TABLE alchemy_transactions
            ADD CONSTRAINT alchemy_transactions_transactionHash_key UNIQUE ("transactionHash");
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'alchemy_transactions_userOperationHash_key'
    ) THEN
        ALTER TABLE alchemy_transactions
            ADD CONSTRAINT alchemy_transactions_userOperationHash_key UNIQUE ("userOperationHash");
    END IF;
END $$;

-- AlchemyUserOperation unique constraints
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'alchemy_user_operations_userOperationHash_key'
    ) THEN
        ALTER TABLE alchemy_user_operations
            ADD CONSTRAINT alchemy_user_operations_userOperationHash_key 
            UNIQUE ("userOperationHash");
    END IF;
END $$;

-- AlchemyGasSpending unique constraints
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'alchemy_gas_spending_userId_walletAddress_date_key'
    ) THEN
        ALTER TABLE alchemy_gas_spending
            ADD CONSTRAINT alchemy_gas_spending_userId_walletAddress_date_key 
            UNIQUE ("userId", "walletAddress", date);
    END IF;
END $$;

-- ================================
-- Indexes
-- ================================

-- AlchemyWallet indexes
CREATE INDEX IF NOT EXISTS alchemy_wallets_userId_idx ON alchemy_wallets("userId");
CREATE INDEX IF NOT EXISTS alchemy_wallets_address_idx ON alchemy_wallets(address);
CREATE INDEX IF NOT EXISTS alchemy_wallets_blockchain_idx ON alchemy_wallets(blockchain);
CREATE INDEX IF NOT EXISTS alchemy_wallets_network_idx ON alchemy_wallets(network);
CREATE INDEX IF NOT EXISTS alchemy_wallets_state_idx ON alchemy_wallets(state);

-- AlchemyTransaction indexes
CREATE INDEX IF NOT EXISTS alchemy_transactions_userId_idx ON alchemy_transactions("userId");
CREATE INDEX IF NOT EXISTS alchemy_transactions_walletId_idx ON alchemy_transactions("walletId");
CREATE INDEX IF NOT EXISTS alchemy_transactions_state_idx ON alchemy_transactions(state);
CREATE INDEX IF NOT EXISTS alchemy_transactions_type_idx ON alchemy_transactions(type);
CREATE INDEX IF NOT EXISTS alchemy_transactions_transactionHash_idx ON alchemy_transactions("transactionHash");
CREATE INDEX IF NOT EXISTS alchemy_transactions_userOperationHash_idx ON alchemy_transactions("userOperationHash");
CREATE INDEX IF NOT EXISTS alchemy_transactions_createdAt_idx ON alchemy_transactions("createdAt");
CREATE INDEX IF NOT EXISTS alchemy_transactions_userId_createdAt_idx ON alchemy_transactions("userId", "createdAt" DESC);

-- AlchemyUserOperation indexes
CREATE INDEX IF NOT EXISTS alchemy_user_operations_walletId_idx ON alchemy_user_operations("walletId");
CREATE INDEX IF NOT EXISTS alchemy_user_operations_userId_idx ON alchemy_user_operations("userId");
CREATE INDEX IF NOT EXISTS alchemy_user_operations_userOperationHash_idx ON alchemy_user_operations("userOperationHash");
CREATE INDEX IF NOT EXISTS alchemy_user_operations_status_idx ON alchemy_user_operations(status);
CREATE INDEX IF NOT EXISTS alchemy_user_operations_createdAt_idx ON alchemy_user_operations("createdAt");

-- AlchemyGasSpending indexes
CREATE INDEX IF NOT EXISTS alchemy_gas_spending_userId_idx ON alchemy_gas_spending("userId");
CREATE INDEX IF NOT EXISTS alchemy_gas_spending_date_idx ON alchemy_gas_spending(date);
CREATE INDEX IF NOT EXISTS alchemy_gas_spending_walletAddress_idx ON alchemy_gas_spending("walletAddress");

-- ================================
-- Foreign Key Constraints
-- ================================

-- AlchemyWallet foreign keys
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'alchemy_wallets_userId_fkey'
    ) THEN
        ALTER TABLE alchemy_wallets
            ADD CONSTRAINT alchemy_wallets_userId_fkey
            FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- AlchemyTransaction foreign keys
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'alchemy_transactions_userId_fkey'
    ) THEN
        ALTER TABLE alchemy_transactions
            ADD CONSTRAINT alchemy_transactions_userId_fkey
            FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'alchemy_transactions_walletId_fkey'
    ) THEN
        ALTER TABLE alchemy_transactions
            ADD CONSTRAINT alchemy_transactions_walletId_fkey
            FOREIGN KEY ("walletId") REFERENCES alchemy_wallets(id) ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- AlchemyUserOperation foreign keys
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'alchemy_user_operations_walletId_fkey'
    ) THEN
        ALTER TABLE alchemy_user_operations
            ADD CONSTRAINT alchemy_user_operations_walletId_fkey
            FOREIGN KEY ("walletId") REFERENCES alchemy_wallets(id) ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- ================================
-- Verification
-- ================================

-- List all Alchemy tables
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' AND tablename LIKE 'alchemy%' 
ORDER BY tablename;

-- Count rows (should all be 0 initially)
SELECT 
    'alchemy_wallets' as table_name, COUNT(*) as row_count FROM alchemy_wallets
UNION ALL
SELECT 'alchemy_transactions', COUNT(*) FROM alchemy_transactions
UNION ALL
SELECT 'alchemy_user_operations', COUNT(*) FROM alchemy_user_operations
UNION ALL
SELECT 'alchemy_gas_spending', COUNT(*) FROM alchemy_gas_spending;
