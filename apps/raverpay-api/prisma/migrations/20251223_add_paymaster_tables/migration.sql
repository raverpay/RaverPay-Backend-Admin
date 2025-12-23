-- CreateTable
CREATE TABLE "PaymasterUserOperation" (
    "id" TEXT NOT NULL,
    "userOpHash" TEXT NOT NULL,
    "sender" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "blockchain" TEXT NOT NULL,
    "transactionHash" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "estimatedGasUsdc" TEXT NOT NULL,
    "actualGasUsdc" TEXT,
    "permitSignature" TEXT NOT NULL,
    "paymasterData" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymasterUserOperation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymasterEvent" (
    "id" TEXT NOT NULL,
    "userOpHash" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "sender" TEXT NOT NULL,
    "nativeTokenPrice" TEXT NOT NULL,
    "actualTokenNeeded" TEXT NOT NULL,
    "feeTokenAmount" TEXT NOT NULL,
    "transactionHash" TEXT NOT NULL,
    "blockNumber" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymasterEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PaymasterUserOperation_userOpHash_key" ON "PaymasterUserOperation"("userOpHash");

-- CreateIndex
CREATE INDEX "PaymasterUserOperation_walletId_idx" ON "PaymasterUserOperation"("walletId");

-- CreateIndex
CREATE INDEX "PaymasterUserOperation_status_idx" ON "PaymasterUserOperation"("status");

-- CreateIndex
CREATE INDEX "PaymasterEvent_userOpHash_idx" ON "PaymasterEvent"("userOpHash");

-- AddForeignKey
ALTER TABLE "PaymasterUserOperation" ADD CONSTRAINT "PaymasterUserOperation_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "CircleWallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymasterEvent" ADD CONSTRAINT "PaymasterEvent_userOpHash_fkey" FOREIGN KEY ("userOpHash") REFERENCES "PaymasterUserOperation"("userOpHash") ON DELETE RESTRICT ON UPDATE CASCADE;
