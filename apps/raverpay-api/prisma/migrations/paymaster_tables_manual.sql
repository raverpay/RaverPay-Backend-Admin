-- Paymaster Tables Migration (Idempotent)
-- Add Paymaster UserOperation and Event tracking tables

-- CreateTable: paymaster_user_operations
CREATE TABLE IF NOT EXISTS paymaster_user_operations (
    id TEXT NOT NULL,
    "userOpHash" TEXT NOT NULL,
    sender TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    blockchain TEXT NOT NULL,
    "transactionHash" TEXT,
    status TEXT NOT NULL DEFAULT 'PENDING',
    "estimatedGasUsdc" TEXT NOT NULL,
    "actualGasUsdc" TEXT,
    "permitSignature" TEXT NOT NULL,
    "paymasterData" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT paymaster_user_operations_pkey PRIMARY KEY (id)
);

-- CreateTable: paymaster_events
CREATE TABLE IF NOT EXISTS paymaster_events (
    id TEXT NOT NULL,
    "userOpHash" TEXT NOT NULL,
    token TEXT NOT NULL,
    sender TEXT NOT NULL,
    "nativeTokenPrice" TEXT NOT NULL,
    "actualTokenNeeded" TEXT NOT NULL,
    "feeTokenAmount" TEXT NOT NULL,
    "transactionHash" TEXT NOT NULL,
    "blockNumber" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT paymaster_events_pkey PRIMARY KEY (id)
);

-- CreateIndex (idempotent)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'paymaster_user_operations_userOpHash_key') THEN
        CREATE UNIQUE INDEX paymaster_user_operations_userOpHash_key ON paymaster_user_operations("userOpHash");
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'paymaster_user_operations_walletId_idx') THEN
        CREATE INDEX paymaster_user_operations_walletId_idx ON paymaster_user_operations("walletId");
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'paymaster_user_operations_status_idx') THEN
        CREATE INDEX paymaster_user_operations_status_idx ON paymaster_user_operations(status);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'paymaster_user_operations_blockchain_idx') THEN
        CREATE INDEX paymaster_user_operations_blockchain_idx ON paymaster_user_operations(blockchain);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'paymaster_user_operations_sender_idx') THEN
        CREATE INDEX paymaster_user_operations_sender_idx ON paymaster_user_operations(sender);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'paymaster_user_operations_createdAt_idx') THEN
        CREATE INDEX paymaster_user_operations_createdAt_idx ON paymaster_user_operations("createdAt");
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'paymaster_events_userOpHash_idx') THEN
        CREATE INDEX paymaster_events_userOpHash_idx ON paymaster_events("userOpHash");
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'paymaster_events_sender_idx') THEN
        CREATE INDEX paymaster_events_sender_idx ON paymaster_events(sender);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'paymaster_events_transactionHash_idx') THEN
        CREATE INDEX paymaster_events_transactionHash_idx ON paymaster_events("transactionHash");
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'paymaster_events_createdAt_idx') THEN
        CREATE INDEX paymaster_events_createdAt_idx ON paymaster_events("createdAt");
    END IF;
END $$;

-- AddForeignKey (idempotent)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'paymaster_user_operations_walletId_fkey'
    ) THEN
        ALTER TABLE paymaster_user_operations 
        ADD CONSTRAINT paymaster_user_operations_walletId_fkey 
        FOREIGN KEY ("walletId") REFERENCES circle_wallets(id) ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'paymaster_events_userOpHash_fkey'
    ) THEN
        ALTER TABLE paymaster_events 
        ADD CONSTRAINT paymaster_events_userOpHash_fkey 
        FOREIGN KEY ("userOpHash") REFERENCES paymaster_user_operations("userOpHash") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;
