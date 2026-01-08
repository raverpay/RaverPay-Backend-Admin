# SQLite Offline-First Implementation Plan for RaverPay Mobile

## Overview

This document provides a complete implementation plan for integrating SQLite into the RaverPay mobile app to enable offline-first functionality, based on the actual backend Prisma schema.

**Target:** React Native/Expo mobile app  
**Database:** expo-sqlite  
**Backend:** PostgreSQL (via Prisma)  
**Sync Strategy:** Bidirectional sync with conflict resolution

---

## Table of Contents

1. [Why SQLite for RaverPay](#why-sqlite-for-raverpay)
2. [Database Schema Design](#database-schema-design)
3. [Implementation Phases](#implementation-phases)
4. [Code Implementation](#code-implementation)
5. [Sync Strategy](#sync-strategy)
6. [Testing Plan](#testing-plan)

---

## Why SQLite for RaverPay

### Current Pain Points (Poor Network Scenarios)

| Problem                                       | Impact                      | SQLite Solution                      |
| --------------------------------------------- | --------------------------- | ------------------------------------ |
| Transaction history loads slowly (2-5s on 3G) | User frustration            | Instant load from local DB (< 100ms) |
| Search/filter requires API calls              | Doesn't work offline        | Local SQL queries, instant results   |
| Failed transactions lost on network drop      | Lost money, support tickets | Persisted in pending_mutations table |
| VTU order status requires polling             | Battery drain, data usage   | Local tracking with background sync  |
| Wallet balance unavailable offline            | Can't check balance         | Cached locally, synced when online   |
| Repeated data fetches                         | Expensive data usage        | Fetch once, query locally forever    |

### Expected Benefits

- **⚡ 20-50x faster** transaction history loading
- **💾 Zero data loss** - all operations persisted locally
- **📱 90% less data usage** - only sync deltas
- **🚀 Instant search/filter** - works completely offline
- **💪 Always available** - core features work without network

---

## Database Schema Design

### Core Principles

1. **Mirror backend schema** - Keep structure similar for easy sync
2. **Add sync metadata** - Track sync status, timestamps
3. **Optimize for mobile** - Indexes for common queries
4. **Minimal storage** - Only essential data, no large blobs

### Tables to Implement

Based on your Prisma schema, we'll implement these tables in SQLite:

#### Phase 1: Essential Data (Week 1-2)

- ✅ `transactions` - Transaction history
- ✅ `wallet` - Wallet balance and limits
- ✅ `vtu_orders` - VTU purchase history
- ✅ `pending_mutations` - Offline operation queue

#### Phase 2: Extended Data (Week 3-4)

- ✅ `p2p_transfers` - P2P transfer history
- ✅ `circle_transactions` - Circle/USDC transactions
- ✅ `circle_wallets` - Circle wallet info
- ✅ `saved_recipients` - Saved VTU recipients

#### Phase 3: Supporting Data (Week 5-6)

- ✅ `notifications` - In-app notifications
- ✅ `bank_accounts` - Saved bank accounts
- ✅ `virtual_accounts` - Virtual account details

---

## Database Schema (SQLite)

### Installation

```bash
npx expo install expo-sqlite
```

### Schema Definition

```typescript
// src/lib/database/schema.ts
import * as SQLite from 'expo-sqlite';

export const db = SQLite.openDatabaseSync('raverpay.db');

export function initializeDatabase() {
  db.execSync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
    
    -- ============================================
    -- WALLET TABLE
    -- ============================================
    CREATE TABLE IF NOT EXISTS wallet (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      balance TEXT NOT NULL, -- Store as string to avoid precision issues
      ledgerBalance TEXT NOT NULL,
      currency TEXT DEFAULT 'NGN',
      dailySpent TEXT DEFAULT '0',
      monthlySpent TEXT DEFAULT '0',
      lastResetAt INTEGER NOT NULL,
      isLocked INTEGER DEFAULT 0,
      lockedReason TEXT,
      type TEXT DEFAULT 'NAIRA',
      lastSyncedAt INTEGER,
      updatedAt INTEGER NOT NULL
    );
    
    -- ============================================
    -- TRANSACTIONS TABLE (Naira)
    -- ============================================
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      reference TEXT UNIQUE NOT NULL,
      userId TEXT NOT NULL,
      type TEXT NOT NULL,
      status TEXT NOT NULL,
      amount TEXT NOT NULL,
      fee TEXT DEFAULT '0',
      totalAmount TEXT NOT NULL,
      balanceBefore TEXT NOT NULL,
      balanceAfter TEXT NOT NULL,
      currency TEXT DEFAULT 'NGN',
      metadata TEXT, -- JSON string
      relatedType TEXT,
      relatedId TEXT,
      provider TEXT,
      providerRef TEXT,
      description TEXT NOT NULL,
      narration TEXT,
      channel TEXT,
      completedAt INTEGER,
      failedAt INTEGER,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL,
      syncStatus TEXT DEFAULT 'synced' -- 'synced', 'pending', 'failed'
    );
    
    -- ============================================
    -- VTU ORDERS TABLE
    -- ============================================
    CREATE TABLE IF NOT EXISTS vtu_orders (
      id TEXT PRIMARY KEY,
      reference TEXT UNIQUE NOT NULL,
      userId TEXT NOT NULL,
      serviceType TEXT NOT NULL,
      provider TEXT NOT NULL,
      recipient TEXT NOT NULL,
      productCode TEXT NOT NULL,
      productName TEXT NOT NULL,
      amount TEXT NOT NULL,
      status TEXT DEFAULT 'PENDING',
      providerRef TEXT,
      providerToken TEXT,
      providerResponse TEXT, -- JSON string
      transactionId TEXT,
      cashbackEarned TEXT DEFAULT '0',
      cashbackRedeemed TEXT DEFAULT '0',
      cashbackPercentage TEXT DEFAULT '0',
      completedAt INTEGER,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL,
      syncStatus TEXT DEFAULT 'synced'
    );
    
    -- ============================================
    -- P2P TRANSFERS TABLE
    -- ============================================
    CREATE TABLE IF NOT EXISTS p2p_transfers (
      id TEXT PRIMARY KEY,
      reference TEXT UNIQUE NOT NULL,
      senderId TEXT NOT NULL,
      receiverId TEXT NOT NULL,
      receiverName TEXT, -- Denormalized for display
      receiverTag TEXT, -- Denormalized for display
      amount TEXT NOT NULL,
      fee TEXT DEFAULT '0',
      status TEXT DEFAULT 'COMPLETED',
      message TEXT,
      senderTransactionId TEXT NOT NULL,
      receiverTransactionId TEXT NOT NULL,
      createdAt INTEGER NOT NULL,
      syncStatus TEXT DEFAULT 'synced'
    );
    
    -- ============================================
    -- CIRCLE WALLETS TABLE
    -- ============================================
    CREATE TABLE IF NOT EXISTS circle_wallets (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      circleWalletId TEXT UNIQUE NOT NULL,
      walletSetId TEXT NOT NULL,
      address TEXT NOT NULL,
      blockchain TEXT NOT NULL,
      accountType TEXT DEFAULT 'SCA',
      state TEXT DEFAULT 'LIVE',
      name TEXT,
      custodyType TEXT DEFAULT 'DEVELOPER',
      circleUserId TEXT,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL,
      syncStatus TEXT DEFAULT 'synced'
    );
    
    -- ============================================
    -- CIRCLE TRANSACTIONS TABLE
    -- ============================================
    CREATE TABLE IF NOT EXISTS circle_transactions (
      id TEXT PRIMARY KEY,
      reference TEXT UNIQUE NOT NULL,
      circleTransactionId TEXT UNIQUE NOT NULL,
      userId TEXT NOT NULL,
      walletId TEXT NOT NULL,
      type TEXT NOT NULL,
      state TEXT DEFAULT 'INITIATED',
      sourceAddress TEXT,
      destinationAddress TEXT NOT NULL,
      blockchain TEXT NOT NULL,
      amounts TEXT NOT NULL, -- JSON array as string
      tokenId TEXT,
      transactionHash TEXT,
      blockNumber INTEGER,
      networkFee TEXT,
      networkFeeUsd TEXT,
      serviceFee TEXT,
      feeCollected INTEGER DEFAULT 0,
      totalAmount TEXT,
      errorCode TEXT,
      errorMessage TEXT,
      firstConfirmDate INTEGER,
      estimatedCompleteDate INTEGER,
      completedDate INTEGER,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL,
      syncStatus TEXT DEFAULT 'synced'
    );
    
    -- ============================================
    -- SAVED RECIPIENTS TABLE
    -- ============================================
    CREATE TABLE IF NOT EXISTS saved_recipients (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      serviceType TEXT NOT NULL,
      provider TEXT NOT NULL,
      recipient TEXT NOT NULL,
      recipientName TEXT,
      lastUsedAt INTEGER NOT NULL,
      usageCount INTEGER DEFAULT 1,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL,
      syncStatus TEXT DEFAULT 'synced'
    );
    
    -- ============================================
    -- NOTIFICATIONS TABLE
    -- ============================================
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      data TEXT, -- JSON string
      isRead INTEGER DEFAULT 0,
      readAt INTEGER,
      category TEXT DEFAULT 'SYSTEM',
      eventType TEXT,
      createdAt INTEGER NOT NULL,
      syncStatus TEXT DEFAULT 'synced'
    );
    
    -- ============================================
    -- BANK ACCOUNTS TABLE
    -- ============================================
    CREATE TABLE IF NOT EXISTS bank_accounts (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      bankName TEXT NOT NULL,
      bankCode TEXT NOT NULL,
      accountNumber TEXT NOT NULL,
      accountName TEXT NOT NULL,
      isVerified INTEGER DEFAULT 0,
      isPrimary INTEGER DEFAULT 0,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL,
      syncStatus TEXT DEFAULT 'synced'
    );
    
    -- ============================================
    -- VIRTUAL ACCOUNTS TABLE
    -- ============================================
    CREATE TABLE IF NOT EXISTS virtual_accounts (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      provider TEXT NOT NULL,
      bankName TEXT NOT NULL,
      bankCode TEXT NOT NULL,
      accountNumber TEXT UNIQUE NOT NULL,
      accountName TEXT NOT NULL,
      isActive INTEGER DEFAULT 1,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL,
      syncStatus TEXT DEFAULT 'synced'
    );
    
    -- ============================================
    -- PENDING MUTATIONS TABLE (Offline Queue)
    -- ============================================
    CREATE TABLE IF NOT EXISTS pending_mutations (
      id TEXT PRIMARY KEY,
      endpoint TEXT NOT NULL,
      method TEXT NOT NULL,
      payload TEXT NOT NULL, -- JSON string
      headers TEXT, -- JSON string for custom headers (e.g., idempotency key)
      priority INTEGER DEFAULT 1, -- 1=low, 2=normal, 3=high
      retryCount INTEGER DEFAULT 0,
      maxRetries INTEGER DEFAULT 3,
      lastError TEXT,
      lastRetryAt INTEGER,
      createdAt INTEGER NOT NULL
    );
    
    -- ============================================
    -- SYNC METADATA TABLE
    -- ============================================
    CREATE TABLE IF NOT EXISTS sync_metadata (
      id TEXT PRIMARY KEY,
      tableName TEXT UNIQUE NOT NULL,
      lastSyncedAt INTEGER,
      lastSyncStatus TEXT, -- 'success', 'failed', 'in_progress'
      lastSyncError TEXT,
      recordCount INTEGER DEFAULT 0,
      updatedAt INTEGER NOT NULL
    );
    
    -- ============================================
    -- INDEXES FOR PERFORMANCE
    -- ============================================
    
    -- Transactions indexes
    CREATE INDEX IF NOT EXISTS idx_transactions_userId ON transactions(userId);
    CREATE INDEX IF NOT EXISTS idx_transactions_createdAt ON transactions(createdAt DESC);
    CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
    CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
    CREATE INDEX IF NOT EXISTS idx_transactions_reference ON transactions(reference);
    CREATE INDEX IF NOT EXISTS idx_transactions_user_created ON transactions(userId, createdAt DESC);
    CREATE INDEX IF NOT EXISTS idx_transactions_user_status ON transactions(userId, status);
    CREATE INDEX IF NOT EXISTS idx_transactions_syncStatus ON transactions(syncStatus);
    
    -- VTU orders indexes
    CREATE INDEX IF NOT EXISTS idx_vtu_orders_userId ON vtu_orders(userId);
    CREATE INDEX IF NOT EXISTS idx_vtu_orders_createdAt ON vtu_orders(createdAt DESC);
    CREATE INDEX IF NOT EXISTS idx_vtu_orders_status ON vtu_orders(status);
    CREATE INDEX IF NOT EXISTS idx_vtu_orders_serviceType ON vtu_orders(serviceType);
    CREATE INDEX IF NOT EXISTS idx_vtu_orders_user_created ON vtu_orders(userId, createdAt DESC);
    CREATE INDEX IF NOT EXISTS idx_vtu_orders_syncStatus ON vtu_orders(syncStatus);
    
    -- P2P transfers indexes
    CREATE INDEX IF NOT EXISTS idx_p2p_senderId ON p2p_transfers(senderId);
    CREATE INDEX IF NOT EXISTS idx_p2p_receiverId ON p2p_transfers(receiverId);
    CREATE INDEX IF NOT EXISTS idx_p2p_createdAt ON p2p_transfers(createdAt DESC);
    CREATE INDEX IF NOT EXISTS idx_p2p_sender_created ON p2p_transfers(senderId, createdAt DESC);
    CREATE INDEX IF NOT EXISTS idx_p2p_receiver_created ON p2p_transfers(receiverId, createdAt DESC);
    
    -- Circle transactions indexes
    CREATE INDEX IF NOT EXISTS idx_circle_tx_userId ON circle_transactions(userId);
    CREATE INDEX IF NOT EXISTS idx_circle_tx_walletId ON circle_transactions(walletId);
    CREATE INDEX IF NOT EXISTS idx_circle_tx_state ON circle_transactions(state);
    CREATE INDEX IF NOT EXISTS idx_circle_tx_createdAt ON circle_transactions(createdAt DESC);
    CREATE INDEX IF NOT EXISTS idx_circle_tx_user_created ON circle_transactions(userId, createdAt DESC);
    
    -- Saved recipients indexes
    CREATE INDEX IF NOT EXISTS idx_saved_recipients_userId ON saved_recipients(userId);
    CREATE INDEX IF NOT EXISTS idx_saved_recipients_serviceType ON saved_recipients(serviceType);
    CREATE INDEX IF NOT EXISTS idx_saved_recipients_lastUsedAt ON saved_recipients(lastUsedAt DESC);
    
    -- Notifications indexes
    CREATE INDEX IF NOT EXISTS idx_notifications_userId ON notifications(userId);
    CREATE INDEX IF NOT EXISTS idx_notifications_isRead ON notifications(isRead);
    CREATE INDEX IF NOT EXISTS idx_notifications_createdAt ON notifications(createdAt DESC);
    CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON notifications(userId, createdAt DESC);
    
    -- Pending mutations indexes
    CREATE INDEX IF NOT EXISTS idx_pending_mutations_priority ON pending_mutations(priority DESC, createdAt ASC);
    CREATE INDEX IF NOT EXISTS idx_pending_mutations_retryCount ON pending_mutations(retryCount);
  `);

  console.log('✅ Database initialized successfully');
}
```

---

## Implementation Phases

### Phase 1: Foundation (Week 1-2)

**Goal:** Basic offline functionality for most-used features

#### Tasks:

1. ✅ Set up expo-sqlite
2. ✅ Create database schema
3. ✅ Implement transaction history sync
4. ✅ Implement wallet balance sync
5. ✅ Create pending mutations queue
6. ✅ Test basic offline→online flow

**Deliverables:**

- Transaction history loads instantly
- Wallet balance available offline
- Failed operations queued automatically

**Success Metrics:**

- Transaction history load time: < 100ms
- Search/filter works offline
- Zero lost transactions

---

### Phase 2: Extended Features (Week 3-4)

**Goal:** Full offline support for all transaction types

#### Tasks:

1. ✅ Add VTU orders sync
2. ✅ Add P2P transfers sync
3. ✅ Add Circle transactions sync
4. ✅ Implement background sync service
5. ✅ Add conflict resolution logic
6. ✅ Test sync with poor network

**Deliverables:**

- All transaction types available offline
- Background sync every 5 minutes
- Conflict resolution for concurrent edits

**Success Metrics:**

- 90% reduction in API calls
- Sync completes in < 5 seconds
- No data conflicts

---

### Phase 3: Polish & Optimization (Week 5-6)

**Goal:** Production-ready with monitoring

#### Tasks:

1. ✅ Add saved recipients sync
2. ✅ Add notifications sync
3. ✅ Implement database migration system
4. ✅ Add sync status UI
5. ✅ Add analytics/monitoring
6. ✅ Performance optimization

**Deliverables:**

- Complete offline experience
- Database migration system
- Sync status indicators
- Performance monitoring

**Success Metrics:**

- Database size < 50MB
- Sync success rate > 99%
- User satisfaction > 90%

---

## Code Implementation

### 1. Database Initialization

```typescript
// src/lib/database/index.ts
import { initializeDatabase, db } from './schema';

let isInitialized = false;

export async function initDB() {
  if (isInitialized) return;

  try {
    initializeDatabase();
    isInitialized = true;
    console.log('✅ Database ready');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

export { db };
```

**Usage in App:**

```typescript
// app/_layout.tsx
import { useEffect } from 'react';
import { initDB } from '@/src/lib/database';

export default function RootLayout() {
  useEffect(() => {
    initDB();
  }, []);

  return <Slot />;
}
```

---

### 2. Transaction History Hook (Offline-First)

```typescript
// src/hooks/useTransactionHistory.ts
import { useEffect, useState } from 'react';
import { db } from '@/src/lib/database';
import { useNetworkStore } from '@/src/store/network.store';
import { apiClient } from '@/src/lib/api/client';

interface Transaction {
  id: string;
  reference: string;
  type: string;
  amount: string;
  status: string;
  description: string;
  createdAt: number;
  balanceBefore: string;
  balanceAfter: string;
}

export function useTransactionHistory(userId: string) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const { isConnected } = useNetworkStore();

  useEffect(() => {
    loadTransactions();
  }, [userId]);

  const loadTransactions = async () => {
    try {
      // 1. Load from SQLite immediately (instant UI)
      const localTxs = db.getAllSync<Transaction>(
        `SELECT * FROM transactions 
         WHERE userId = ? 
         ORDER BY createdAt DESC 
         LIMIT 100`,
        [userId],
      );

      setTransactions(localTxs);
      setIsLoading(false);

      // 2. Sync with backend if online (background)
      if (isConnected) {
        syncWithBackend();
      }
    } catch (error) {
      console.error('Failed to load transactions:', error);
      setIsLoading(false);
    }
  };

  const syncWithBackend = async () => {
    if (isSyncing) return;
    setIsSyncing(true);

    try {
      // Get last sync timestamp
      const lastSync = db.getFirstSync<{ lastSyncedAt: number }>(
        `SELECT MAX(updatedAt) as lastSyncedAt 
         FROM transactions 
         WHERE userId = ? AND syncStatus = 'synced'`,
        [userId],
      );

      // Fetch only new/updated transactions
      const { data } = await apiClient.get('/wallet/transactions', {
        params: {
          since: lastSync?.lastSyncedAt || 0,
          limit: 100,
        },
      });

      // Upsert into SQLite
      db.runSync('BEGIN TRANSACTION');

      for (const tx of data.transactions) {
        db.runSync(
          `INSERT OR REPLACE INTO transactions 
           (id, reference, userId, type, status, amount, fee, totalAmount,
            balanceBefore, balanceAfter, currency, metadata, provider, 
            description, createdAt, updatedAt, syncStatus)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'synced')`,
          [
            tx.id,
            tx.reference,
            userId,
            tx.type,
            tx.status,
            tx.amount.toString(),
            tx.fee?.toString() || '0',
            tx.totalAmount.toString(),
            tx.balanceBefore.toString(),
            tx.balanceAfter.toString(),
            tx.currency,
            JSON.stringify(tx.metadata),
            tx.provider,
            tx.description,
            new Date(tx.createdAt).getTime(),
            Date.now(),
          ],
        );
      }

      db.runSync('COMMIT');

      // Update sync metadata
      db.runSync(
        `INSERT OR REPLACE INTO sync_metadata 
         (id, tableName, lastSyncedAt, lastSyncStatus, recordCount, updatedAt)
         VALUES (?, 'transactions', ?, 'success', ?, ?)`,
        ['transactions', Date.now(), data.transactions.length, Date.now()],
      );

      // Reload from DB
      loadTransactions();
    } catch (error) {
      console.error('Sync failed:', error);

      // Update sync metadata with error
      db.runSync(
        `INSERT OR REPLACE INTO sync_metadata 
         (id, tableName, lastSyncedAt, lastSyncStatus, lastSyncError, updatedAt)
         VALUES (?, 'transactions', ?, 'failed', ?, ?)`,
        ['transactions', Date.now(), error.message, Date.now()],
      );
    } finally {
      setIsSyncing(false);
    }
  };

  const searchTransactions = (query: string) => {
    const results = db.getAllSync<Transaction>(
      `SELECT * FROM transactions 
       WHERE userId = ? 
       AND (description LIKE ? OR reference LIKE ? OR provider LIKE ?)
       ORDER BY createdAt DESC
       LIMIT 100`,
      [userId, `%${query}%`, `%${query}%`, `%${query}%`],
    );
    setTransactions(results);
  };

  const filterByType = (type: string) => {
    const results = db.getAllSync<Transaction>(
      `SELECT * FROM transactions 
       WHERE userId = ? AND type = ?
       ORDER BY createdAt DESC
       LIMIT 100`,
      [userId, type],
    );
    setTransactions(results);
  };

  const filterByStatus = (status: string) => {
    const results = db.getAllSync<Transaction>(
      `SELECT * FROM transactions 
       WHERE userId = ? AND status = ?
       ORDER BY createdAt DESC
       LIMIT 100`,
      [userId, status],
    );
    setTransactions(results);
  };

  return {
    transactions,
    isLoading,
    isSyncing,
    searchTransactions,
    filterByType,
    filterByStatus,
    refresh: loadTransactions,
  };
}
```

**Usage:**

```typescript
// app/transaction-history.tsx
export default function TransactionHistoryScreen() {
  const { user } = useAuth();
  const {
    transactions,
    isLoading,
    isSyncing,
    searchTransactions,
    filterByType
  } = useTransactionHistory(user.id);

  return (
    <View>
      {isSyncing && <SyncIndicator />}
      <SearchBar onSearch={searchTransactions} />
      <FilterButtons onFilter={filterByType} />

      {isLoading ? (
        <TransactionSkeleton />
      ) : (
        <FlatList
          data={transactions}
          renderItem={({ item }) => <TransactionCard transaction={item} />}
          keyExtractor={(item) => item.id}
        />
      )}
    </View>
  );
}
```

---

### 3. Offline Mutation Queue

```typescript
// src/lib/database/offline-queue.ts
import { db } from './index';
import { useNetworkStore } from '@/src/store/network.store';
import { apiClient } from '../api/client';

interface PendingMutation {
  id: string;
  endpoint: string;
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  payload: any;
  headers?: Record<string, string>;
  priority: number;
  retryCount: number;
  maxRetries: number;
}

class OfflineQueue {
  private isProcessing = false;

  async addToQueue(
    endpoint: string,
    method: 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    payload: any,
    options: {
      priority?: 1 | 2 | 3;
      headers?: Record<string, string>;
      maxRetries?: number;
    } = {},
  ) {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    db.runSync(
      `INSERT INTO pending_mutations 
       (id, endpoint, method, payload, headers, priority, retryCount, maxRetries, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?)`,
      [
        id,
        endpoint,
        method,
        JSON.stringify(payload),
        JSON.stringify(options.headers || {}),
        options.priority || 2,
        options.maxRetries || 3,
        Date.now(),
      ],
    );

    console.log(`✅ Queued ${method} ${endpoint} for offline processing`);

    // Try to process immediately if online
    if (useNetworkStore.getState().isConnected) {
      this.processQueue();
    }

    return id;
  }

  async processQueue() {
    if (this.isProcessing) return;
    if (!useNetworkStore.getState().isConnected) return;

    this.isProcessing = true;

    try {
      // Get all pending mutations, ordered by priority and creation time
      const pending = db.getAllSync<PendingMutation>(
        `SELECT * FROM pending_mutations 
         ORDER BY priority DESC, createdAt ASC 
         LIMIT 10`,
      );

      for (const mutation of pending) {
        try {
          // Parse headers and payload
          const headers = JSON.parse(mutation.headers || '{}');
          const payload = JSON.parse(mutation.payload);

          // Execute the mutation
          await apiClient.request({
            url: mutation.endpoint,
            method: mutation.method,
            data: payload,
            headers,
          });

          // Success - remove from queue
          db.runSync(`DELETE FROM pending_mutations WHERE id = ?`, [
            mutation.id,
          ]);

          console.log(`✅ Processed ${mutation.method} ${mutation.endpoint}`);
        } catch (error) {
          // Update retry count
          const newRetryCount = mutation.retryCount + 1;

          if (newRetryCount >= mutation.maxRetries) {
            // Max retries reached - remove and log
            console.error(
              `❌ Max retries reached for ${mutation.method} ${mutation.endpoint}`,
              error,
            );

            db.runSync(`DELETE FROM pending_mutations WHERE id = ?`, [
              mutation.id,
            ]);
          } else {
            // Update retry count and error
            db.runSync(
              `UPDATE pending_mutations 
               SET retryCount = ?, lastError = ?, lastRetryAt = ?
               WHERE id = ?`,
              [newRetryCount, error.message, Date.now(), mutation.id],
            );
          }
        }
      }
    } finally {
      this.isProcessing = false;
    }
  }

  getQueueLength(): number {
    const result = db.getFirstSync<{ count: number }>(
      `SELECT COUNT(*) as count FROM pending_mutations`,
    );
    return result?.count || 0;
  }

  clearQueue() {
    db.runSync(`DELETE FROM pending_mutations`);
  }
}

export const offlineQueue = new OfflineQueue();
```

**Usage in Mutations:**

```typescript
// Example: Airtime purchase with offline support
const purchaseAirtimeMutation = useMutation({
  mutationFn: async (data: PurchaseAirtimeDto) => {
    const { isConnected } = useNetworkStore.getState();

    if (!isConnected) {
      // Queue for later with high priority (financial operation)
      await offlineQueue.addToQueue(
        '/vtu/airtime/purchase',
        'POST',
        data,
        { priority: 3 }, // High priority
      );

      throw new Error('QUEUED_OFFLINE');
    }

    return apiClient.post('/vtu/airtime/purchase', data);
  },
  onError: (error) => {
    if (error.message === 'QUEUED_OFFLINE') {
      toast.success('Purchase queued. Will process when online.');
    } else {
      toast.error(error.message);
    }
  },
});
```

---

### 4. Background Sync Service

```typescript
// src/lib/database/sync-service.ts
import { db } from './index';
import { apiClient } from '../api/client';
import { useNetworkStore } from '@/src/store/network.store';
import { offlineQueue } from './offline-queue';

class SyncService {
  private syncInterval: NodeJS.Timeout | null = null;
  private isSyncing = false;

  startAutoSync() {
    // Sync every 5 minutes when online
    this.syncInterval = setInterval(
      () => {
        const { isConnected } = useNetworkStore.getState();
        if (isConnected && !this.isSyncing) {
          this.syncAll();
        }
      },
      5 * 60 * 1000,
    );

    console.log('✅ Auto-sync started (every 5 minutes)');
  }

  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('🛑 Auto-sync stopped');
    }
  }

  async syncAll() {
    if (this.isSyncing) return;
    this.isSyncing = true;

    console.log('🔄 Starting full sync...');

    try {
      // 1. Push pending mutations first
      await offlineQueue.processQueue();

      // 2. Pull latest data from backend
      await Promise.all([
        this.syncTransactions(),
        this.syncWallet(),
        this.syncVTUOrders(),
        this.syncP2PTransfers(),
        this.syncCircleTransactions(),
        this.syncNotifications(),
      ]);

      console.log('✅ Full sync completed');
    } catch (error) {
      console.error('❌ Sync failed:', error);
    } finally {
      this.isSyncing = false;
    }
  }

  private async syncTransactions() {
    // Implementation similar to useTransactionHistory hook
    // ... (see above)
  }

  private async syncWallet() {
    try {
      const { data } = await apiClient.get('/wallet');

      db.runSync(
        `INSERT OR REPLACE INTO wallet 
         (id, userId, balance, ledgerBalance, currency, dailySpent, 
          monthlySpent, lastResetAt, isLocked, lockedReason, type, 
          lastSyncedAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          data.id,
          data.userId,
          data.balance.toString(),
          data.ledgerBalance.toString(),
          data.currency,
          data.dailySpent.toString(),
          data.monthlySpent.toString(),
          new Date(data.lastResetAt).getTime(),
          data.isLocked ? 1 : 0,
          data.lockedReason,
          data.type,
          Date.now(),
          Date.now(),
        ],
      );
    } catch (error) {
      console.error('Failed to sync wallet:', error);
    }
  }

  // Similar methods for other tables...
}

export const syncService = new SyncService();
```

**Initialize in App:**

```typescript
// app/_layout.tsx
import { syncService } from '@/src/lib/database/sync-service';

export default function RootLayout() {
  useEffect(() => {
    // Start auto-sync
    syncService.startAutoSync();

    return () => {
      syncService.stopAutoSync();
    };
  }, []);
}
```

---

## Sync Strategy

### Pull Sync (Backend → SQLite)

**Strategy:** Incremental sync using timestamps

```typescript
// Fetch only new/updated records since last sync
const lastSync = db.getFirstSync<{ lastSyncedAt: number }>(
  `SELECT MAX(updatedAt) as lastSyncedAt FROM transactions WHERE syncStatus = 'synced'`,
);

const { data } = await apiClient.get('/wallet/transactions', {
  params: {
    since: lastSync?.lastSyncedAt || 0,
  },
});
```

**Benefits:**

- Minimal data transfer
- Fast sync (< 5 seconds)
- Works on poor networks

---

### Push Sync (SQLite → Backend)

**Strategy:** Queue-based with priority

```typescript
// High priority: Financial operations
await offlineQueue.addToQueue('/transactions/send', 'POST', data, {
  priority: 3,
});

// Normal priority: Profile updates
await offlineQueue.addToQueue('/users/profile', 'PUT', data, {
  priority: 2,
});

// Low priority: Analytics
await offlineQueue.addToQueue('/analytics/track', 'POST', data, {
  priority: 1,
});
```

---

### Conflict Resolution

**Strategy:** Last-write-wins (server always wins)

```typescript
// When syncing, server data always overwrites local
db.runSync(`INSERT OR REPLACE INTO transactions (...) VALUES (...)`, [
  serverData,
]);
```

**Why:** Financial data must be authoritative from backend

---

## Offline Transaction Handling & Double-Spending Prevention

### Overview

**Critical Challenge:** How to prevent users from spending the same money multiple times when offline?

**Solution:** Optimistic local balance updates with strict validation

---

### The Problem

```
User has ₦1,000 balance (offline)
  ↓
Queues ₦500 airtime purchase
  ↓
Still shows ₦1,000 balance? ❌ DANGEROUS!
  ↓
User can queue another ₦1,000 transfer
  ↓
Total queued: ₦1,500 (but only has ₦1,000!)
  ↓
When online: One transaction FAILS
  ↓
Poor user experience + confusion
```

---

### The Solution: Optimistic Updates

**Principle:** Immediately deduct from local balance when queuing transactions

```
User has ₦1,000 balance (offline)
  ↓
Queues ₦500 airtime purchase
  ↓
Local balance: ₦1,000 → ₦500 ✅ (optimistic deduction)
  ↓
Tries to queue ₦1,000 transfer
  ↓
App checks: ₦500 < ₦1,000 ❌ REJECTED
  ↓
User sees: "Insufficient balance (₦500 available)"
  ↓
Prevents double-spending!
```

---

### Complete Scenario Walkthrough

#### **Initial State**

```
Backend Balance: ₦1,000
Local Balance:   ₦1,000 (synced)
Pending Queue:   Empty
```

#### **Step 1: User Buys ₦500 Airtime (Offline)**

```
1. User enters: ₦500
2. App checks local balance: ₦1,000 >= ₦500 ✅
3. App optimistically deducts: ₦1,000 - ₦500 = ₦500
4. App queues transaction in pending_mutations
5. User sees: "Queued! New balance: ₦500"

Result:
  Backend Balance: ₦1,000 (unchanged)
  Local Balance:   ₦500 (optimistic)
  Pending Queue:   [Airtime ₦500]
```

#### **Step 2: User Tries to Transfer ₦1,000 (Offline)**

```
1. User enters: ₦1,000
2. App checks local balance: ₦500 < ₦1,000 ❌
3. App REJECTS transaction
4. User sees: "Insufficient balance. Available: ₦500"

Result:
  Backend Balance: ₦1,000 (unchanged)
  Local Balance:   ₦500 (unchanged)
  Pending Queue:   [Airtime ₦500]

Transaction NOT queued!
```

#### **Step 3: User Transfers ₦300 Instead (Offline)**

```
1. User enters: ₦300
2. App checks local balance: ₦500 >= ₦300 ✅
3. App optimistically deducts: ₦500 - ₦300 = ₦200
4. App queues transaction in pending_mutations
5. User sees: "Queued! New balance: ₦200"

Result:
  Backend Balance: ₦1,000 (unchanged)
  Local Balance:   ₦200 (optimistic)
  Pending Queue:   [Airtime ₦500, Transfer ₦300]
```

#### **Step 4: Network Reconnects**

```
Auto-sync starts...

Processing Queue (Sequential):

1️⃣ Process Airtime ₦500:
   - Send to backend
   - Backend checks: ₦1,000 >= ₦500 ✅
   - Backend deducts: ₦1,000 - ₦500 = ₦500
   - Backend responds: Success, new balance ₦500
   - App updates local: ₦500 (matches optimistic!)
   - Remove from queue

2️⃣ Process Transfer ₦300:
   - Send to backend
   - Backend checks: ₦500 >= ₦300 ✅
   - Backend deducts: ₦500 - ₦300 = ₦200
   - Backend responds: Success, new balance ₦200
   - App updates local: ₦200 (matches optimistic!)
   - Remove from queue

Result:
  Backend Balance: ₦200 ✅
  Local Balance:   ₦200 ✅ (synced!)
  Pending Queue:   Empty ✅
```

---

### What If Backend Rejects?

#### **Scenario: Airtime Purchase Fails**

```
Processing Queue:

1️⃣ Process Airtime ₦500:
   - Send to backend
   - Backend responds: ❌ "VTPass service unavailable"
   - App REVERSES optimistic update:
     Local balance: ₦200 + ₦500 = ₦700
   - Remove from queue
   - Show error: "Airtime purchase failed. Balance restored."

2️⃣ Process Transfer ₦300:
   - Send to backend
   - Backend checks: ₦1,000 >= ₦300 ✅
   - Backend deducts: ₦1,000 - ₦300 = ₦700
   - Backend responds: Success, new balance ₦700
   - App updates local: ₦700 (matches!)
   - Remove from queue

Result:
  Backend Balance: ₦700 ✅
  Local Balance:   ₦700 ✅ (synced!)
  Pending Queue:   Empty ✅

Failed transaction was rolled back!
```

---

### Implementation Requirements

#### **1. Track Pending Deductions**

Store optimistic deductions in SQLite:

```
wallet table:
  - balance: "1000" (actual balance)
  - pendingDeductions: "800" (queued transactions)
  - availableBalance: "200" (balance - pendingDeductions)
```

#### **2. Validate Before Queuing**

Always check available balance:

```
Available Balance = Current Balance - Pending Deductions

If (transaction amount > available balance):
  REJECT transaction
Else:
  Queue transaction
  Update pending deductions
```

#### **3. Update on Queue/Process**

When queuing:

```
pendingDeductions += transaction amount
```

When processing (success):

```
balance = backend balance
pendingDeductions -= transaction amount
```

When processing (failure):

```
pendingDeductions -= transaction amount
(balance unchanged - never deducted)
```

---

### Timeline Visualization

```
TIME     EVENT                    LOCAL BALANCE    PENDING    BACKEND
────────────────────────────────────────────────────────────────────
09:00    Initial (online)         ₦1,000          ₦0         ₦1,000
09:05    Go offline               ₦1,000          ₦0         ₦1,000
09:10    Queue airtime ₦500       ₦500 ⬇️         ₦500       ₦1,000
09:15    Try transfer ₦1,000      ₦500            ₦500       ₦1,000
         ❌ REJECTED!
09:16    Queue transfer ₦300      ₦200 ⬇️         ₦800       ₦1,000
09:30    Go online                ₦200            ₦800       ₦1,000
09:30:05 Process airtime          ₦500            ₦300       ₦500 ⬇️
09:30:10 Process transfer         ₦200            ₦0         ₦200 ⬇️
09:30:15 Sync complete            ₦200 ✅         ₦0 ✅      ₦200 ✅
```

---

### Edge Cases Handled

| Scenario                           | Handling                                            |
| ---------------------------------- | --------------------------------------------------- |
| User queues ₦500, tries ₦1,000     | ❌ Rejected (insufficient available balance)        |
| User queues ₦500, backend has ₦400 | ❌ Backend rejects, ₦500 restored to local          |
| User queues 2 transactions offline | ✅ Both deducted from local, processed sequentially |
| User closes app with pending queue | ✅ Queue persisted in SQLite, processed on reopen   |
| Backend is down when online        | 🔄 Retries 3 times, then shows error                |
| User queues, then receives money   | ✅ Backend balance is authoritative                 |

---

### User Experience Flow

```
┌─────────────────────────────────────────────────────┐
│  User's Perspective (Offline)                      │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Balance: ₦1,000                                   │
│  🔴 Offline Mode                                    │
│                                                     │
│  [Buy ₦500 Airtime]                                │
│      ↓                                             │
│  ✅ "Queued! Will process when online"             │
│  💰 New balance: ₦500                              │
│  ⏳ Pending: 1 transaction                         │
│                                                     │
│  [Try Transfer ₦1,000]                             │
│      ↓                                             │
│  ❌ "Insufficient balance"                         │
│  💰 Available: ₦500                                │
│  ℹ️  "₦500 airtime purchase pending"               │
│                                                     │
│  [Transfer ₦300 Instead]                           │
│      ↓                                             │
│  ✅ "Queued! Will process when online"             │
│  💰 New balance: ₦200                              │
│  ⏳ Pending: 2 transactions                        │
│                                                     │
│  [Network Reconnects]                              │
│      ↓                                             │
│  🔄 "Processing pending transactions..."           │
│      ↓                                             │
│  ✅ "All transactions processed!"                  │
│  💰 Final balance: ₦200                            │
│  ⏳ Pending: 0 transactions                        │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

### Key Principles

1. **Optimistic Updates:** Immediately reflect transactions in local balance
2. **Strict Validation:** Check available balance before queuing
3. **Sequential Processing:** Process queue in order (FIFO)
4. **Rollback on Failure:** Restore balance if backend rejects
5. **Server is Authority:** Backend balance is always correct
6. **Transparent Status:** Show pending transactions to user
7. **Prevent Double-Spend:** Local validation prevents overspending

---

### Security Benefits

✅ **Prevents Double-Spending:** User can't queue more than they have  
✅ **Prevents Fraud:** Local validation catches overspending attempts  
✅ **Maintains Integrity:** Backend always validates against real balance  
✅ **User Trust:** Transparent pending status builds confidence  
✅ **Data Consistency:** Local and backend balances sync correctly

---

## Multi-Device Concurrent Transactions

### Overview

**Critical Scenario:** User logged in on multiple devices performing transactions simultaneously with different network states.

**Challenge:** How to handle when one device is offline (queuing transactions) while another device is online (processing immediately)?

---

### The Scenario

```
User has ₦1,000 balance
    ↓
Logged in on TWO devices:
    - Device A: iPhone (OFFLINE)
    - Device B: Android (ONLINE)
```

---

### Step-by-Step Walkthrough

#### **Initial State**

```
Device A (iPhone) - OFFLINE:
  Balance: ₦1,000 (cached)
  Pending Queue: Empty

Device B (Android) - ONLINE:
  Balance: ₦1,000 (synced)
  Pending Queue: Empty

Backend (Authoritative):
  Balance: ₦1,000
```

---

#### **Step 1: User Transfers ₦800 on Device A (Offline)**

```
Device A Action:
  1. User enters: ₦800 transfer
  2. App checks local: ₦1,000 >= ₦800 ✅
  3. Optimistic deduction: ₦1,000 - ₦800 = ₦200
  4. Queue in pending_mutations
  5. User sees: "Queued! Balance: ₦200"

Device A State:
  Balance: ₦200 (optimistic)
  Pending Queue: [Transfer ₦800]

Backend State:
  Balance: ₦1,000 (unchanged - doesn't know yet!)
```

**Critical:** Device A's transaction is **queued locally**, backend hasn't been updated!

---

#### **Step 2: User Transfers ₦1,000 on Device B (Online)**

```
Device B Action:
  1. User enters: ₦1,000 transfer
  2. App checks local: ₦1,000 >= ₦1,000 ✅
  3. Send to backend immediately (online!)
  4. Backend validates: ₦1,000 >= ₦1,000 ✅
  5. Backend processes: ₦1,000 - ₦1,000 = ₦0
  6. Backend responds: Success, new balance ₦0
  7. App updates local: ₦0
  8. User sees: "Success! Balance: ₦0"

Device B State:
  Balance: ₦0 ✅

Backend State:
  Balance: ₦0 ✅ (₦1,000 transferred)
```

**Critical:** Backend balance is now **₦0**, but Device A doesn't know yet!

---

#### **Current State (After Device B Transaction)**

```
Device A (iPhone) - OFFLINE:
  Balance: ₦200 (STALE!)
  Pending Queue: [Transfer ₦800]
  ⚠️  Doesn't know about Device B's transaction!

Device B (Android) - ONLINE:
  Balance: ₦0 ✅ (correct)
  Pending Queue: Empty

Backend (Authoritative):
  Balance: ₦0 ✅ (correct)
```

**Problem:** Device A has **stale data** and a **queued transaction** that will fail!

---

#### **Step 3: Device A Comes Online**

```
Device A Reconnects:
  🟢 Network detected!
  🔄 Auto-sync starts...

Sync Process (CRITICAL ORDER):

  1️⃣ PULL: Fetch latest balance from backend
     GET /wallet
     Backend responds: ₦0
     Update local: ₦200 → ₦0
     ⚠️  User sees balance drop!

  2️⃣ PUSH: Process pending queue
     Send queued ₦800 transfer to backend
     POST /transactions/send { amount: 800 }
```

**Why PULL before PUSH?**

- Ensures local balance is current
- Better UX (user knows balance changed)
- Backend will reject anyway, but clearer error

---

#### **Step 4: Backend Rejects Transaction**

```
Backend Processing:
  Receives: Transfer ₦800 request
  Checks balance: ₦0 < ₦800 ❌
  Responds: {
    success: false,
    error: "Insufficient balance",
    currentBalance: 0
  }
```

---

#### **Step 5: Device A Handles Rejection**

```
Device A Response:
  1. Receives rejection from backend
  2. Remove from pending queue
  3. Balance already synced to ₦0 (from PULL)
  4. Show error notification:
     "Transfer failed: Insufficient balance.
      Your balance was updated on another device.
      Current balance: ₦0"
  5. Log to Sentry:
     - Multi-device conflict detected
     - Transaction rejected due to stale balance

Device A Final State:
  Balance: ₦0 ✅ (synced)
  Pending Queue: Empty ✅
```

---

### Final State (All Devices Synced)

```
Device A (iPhone):
  Balance: ₦0 ✅
  Transaction History:
    - Transfer ₦1,000 (from Device B) ✅
    - Transfer ₦800 (FAILED) ❌

Device B (Android):
  Balance: ₦0 ✅
  Transaction History:
    - Transfer ₦1,000 (successful) ✅

Backend:
  Balance: ₦0 ✅
  Transaction History:
    - Transfer ₦1,000 (from Device B) ✅
    - Transfer ₦800 (from Device A) ❌ REJECTED
```

---

### Timeline Visualization

```
TIME     DEVICE A (OFFLINE)         DEVICE B (ONLINE)      BACKEND
───────────────────────────────────────────────────────────────────
09:00    Balance: ₦1,000            Balance: ₦1,000        ₦1,000

09:10    Transfer ₦800              -                      ₦1,000
         Queue: [₦800]
         Balance: ₦200 (optimistic)

09:15    -                          Transfer ₦1,000        ₦1,000
                                    Processing...

09:15:05 -                          ✅ Success             ₦0 ⬇️
                                    Balance: ₦0

09:30    🟢 Network reconnects!     -                      ₦0

09:30:05 PULL sync                  -                      ₦0
         Balance: ₦200 → ₦0 ⬇️
         ⚠️  User sees drop!

09:30:10 PUSH queue                 -                      ₦0
         Send: Transfer ₦800

09:30:15 ❌ REJECTED!               -                      ₦0
         "Insufficient balance"
         Balance: ₦0 ✅
         Queue: Empty ✅
```

---

### User Experience

#### **On Device A (User's Perspective):**

```
09:10 AM - Transfer ₦800 (offline)
           ✅ "Queued! Balance: ₦200"
           (Feels instant, good UX)

09:30 AM - Network reconnects
           🔄 "Syncing..."

09:30:05 - Balance updates
           ⚠️  "Balance updated: ₦0"
           (User sees balance drop)

09:30:10 - Transaction fails
           ❌ "Transfer failed: Insufficient balance.
               Your balance was updated on another device.

               Original balance: ₦1,000
               Current balance: ₦0
               Failed transfer: ₦800

               Tip: Check transaction history for
               recent activity on all devices."
```

**User understands:**

- Balance was spent on another device
- Queued transaction couldn't complete
- No money lost (transaction didn't go through)
- Clear explanation of what happened

---

### Multi-Device Sync Indicators

**Show user when balance changed on another device:**

```
┌─────────────────────────────────────────────────────┐
│  Home Screen (Device A)                            │
├─────────────────────────────────────────────────────┤
│                                                     │
│  💰 Balance: ₦0                                    │
│                                                     │
│  ⚠️  Balance updated on another device             │
│  Last activity: 5 minutes ago (Android)            │
│                                                     │
│  Recent Transactions:                              │
│  • Transfer ₦1,000 (Android) - 5 min ago ✅        │
│  • Transfer ₦800 (iPhone) - FAILED ❌              │
│                                                     │
│  [View Full History]                               │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

### Key Principles

#### **1. Sync Order: PULL → PUSH**

**Always fetch latest balance BEFORE processing queue**

```
✅ CORRECT Order:
  1. PULL: Get latest balance from backend
  2. PUSH: Process pending queue

❌ WRONG Order:
  1. PUSH: Process pending queue
  2. PULL: Get latest balance
  (Queue processes with stale balance!)
```

---

#### **2. Backend is Always Authority**

```
Device A thinks: ₦200 available
Device B knows: ₦0 available
Backend says: ₦0 available ✅ (correct)

Result: Backend rejects Device A's transaction
```

**Why this is safe:**

- Backend validates **every** transaction
- Local balance is for **UX only** (instant feedback)
- Backend balance is **authoritative**
- No money can be lost

---

#### **3. Clear Error Messages**

**Good Error Message:**

```
❌ Transfer failed: Insufficient balance

Your balance was updated on another device.

Original balance: ₦1,000
Current balance: ₦0
Failed transfer: ₦800

Recent activity:
• Transfer ₦1,000 (Android) - 5 min ago

Tip: Check your transaction history to see
recent activity on all your devices.
```

**Bad Error Message:**

```
❌ "Transfer failed: Insufficient balance"
(User thinks: "But I had ₦1,000!")
(Confusion, support tickets, lost trust)
```

---

### Security & Safety

#### **Why This is Safe:**

1. ✅ **Backend validates everything** - Can't spend more than you have
2. ✅ **No money lost** - Failed transaction doesn't deduct money
3. ✅ **Clear error messages** - User understands what happened
4. ✅ **Audit trail** - All attempts logged in backend
5. ✅ **Sentry monitoring** - Multi-device conflicts tracked
6. ✅ **Transaction history** - Shows which device did what

#### **What Could Go Wrong (If Not Handled Properly):**

1. ❌ **Silent failure** - User doesn't know transaction failed
2. ❌ **Confusing UX** - User thinks money was deducted
3. ❌ **Support tickets** - "Where's my money?"
4. ❌ **Lost trust** - User thinks app is buggy
5. ❌ **Negative reviews** - "App doesn't work offline"

---

### Implementation Requirements

#### **1. Sync Order Enforcement**

Always PULL before PUSH in sync logic

#### **2. Multi-Device Indicators**

Show when balance changed on another device:

- Device name/type
- Timestamp
- Transaction details

#### **3. Enhanced Error Messages**

Include:

- What happened
- Why it happened
- Current state
- Recent activity
- Helpful tips

#### **4. Sentry Monitoring**

Track:

- Multi-device conflicts
- Rejected transactions due to stale balance
- Sync failures
- User ID, device info, transaction details

#### **5. Transaction History Metadata**

Store:

- Device type (iPhone, Android, Web)
- Device name (user's device name)
- Timestamp
- Success/failure status

---

### Edge Cases

| Scenario                                 | Handling                                    |
| ---------------------------------------- | ------------------------------------------- |
| User on 3+ devices                       | ✅ Same logic applies, backend is authority |
| Both devices offline, both queue         | ✅ First to sync succeeds, second fails     |
| Device A queues, Device B receives money | ✅ Device A transaction may succeed         |
| Network drops during sync                | 🔄 Retry sync on reconnect                  |
| User deletes app on Device B             | ✅ Device A still syncs correctly           |

---

### Monitoring with Sentry

**Track multi-device conflicts:**

```
Sentry Event:
  Type: Multi-Device Conflict
  Level: Warning

  Context:
    - User ID: user-123
    - Device A: iPhone 14 (offline)
    - Device B: Samsung Galaxy (online)
    - Queued amount: ₦800
    - Backend balance: ₦0
    - Conflict reason: Stale balance

  Breadcrumbs:
    1. Device A queued ₦800 (offline)
    2. Device B transferred ₦1,000 (online)
    3. Device A synced (PULL: ₦0)
    4. Device A transaction rejected
```

**Dashboard Metrics:**

- Multi-device conflict rate
- Average time between queue and sync
- Rejection rate due to stale balance
- User devices per account

---

### Summary

**Scenario:** User with ₦1,000 on two devices:

- Device A (offline): Queues ₦800 transfer
- Device B (online): Completes ₦1,000 transfer (balance → ₦0)
- Device A comes online

**What Happens:**

1. ✅ Device A syncs balance (PULL: ₦200 → ₦0)
2. ✅ Device A tries to process ₦800 transfer (PUSH)
3. ❌ Backend rejects (insufficient balance: ₦0 < ₦800)
4. ✅ Device A shows clear error message
5. ✅ User understands what happened
6. ✅ No money lost

**Key Protection:**

- Backend **always validates** against real balance
- PULL before PUSH ensures current state
- Clear error messages prevent confusion
- Sentry monitoring tracks conflicts

**User Experience:**

- Transparent
- Clear
- No confusion
- Builds trust! 🔒

---

## Security & Abuse Prevention

### Overview

SQLite offline-first architecture introduces new security considerations. This section covers all security measures to prevent data breaches, tampering, and abuse.

---

### 1. Data Isolation & Access Control

**Rule:** Each user can ONLY access their own data

Always filter by userId in all queries. Never allow cross-user data access.

### 2. Data Encryption

Encrypt sensitive PII data (bank accounts, BVN, NIN) using device-specific encryption keys stored in SecureStore.

### 3. Clear Data on Logout

Always delete all SQLite data when user logs out to prevent unauthorized access on shared devices.

### 4. Prevent Data Tampering

- Server-side validation is primary defense (never trust client data)
- Add checksums to detect tampering
- Balance is read-only in SQLite (only updated from backend)

### 5. Rate Limiting Offline Operations

- Max 50 pending operations in queue
- Max 10 of same operation type
- Prevents spam/abuse when offline

### 6. Validate Data Before Storing

Use Zod schemas to validate all data from backend before storing in SQLite.

### 7. Prevent SQL Injection

Always use parameterized queries, never string concatenation.

### 8. Limit Data Retention

Auto-delete transactions older than 6 months to limit database size and sensitive data exposure.

### 9. Secure Database File

- iOS/Android: Database in app sandbox (encrypted at rest)
- Requires device unlock
- Deleted on app uninstall

### 10. Audit Logging

Log all critical operations to backend and Sentry for security monitoring.

---

## Sentry Integration & Monitoring

### Overview

Leverage existing Sentry integration for SQLite monitoring, error tracking, and performance analysis.

---

### 1. Track SQLite Errors

Capture all database errors with context (operation, table, userId) for debugging.

### 2. Track Sync Performance

Use Sentry transactions to monitor sync duration and identify bottlenecks.

### 3. Track Offline Queue Metrics

- Monitor queue size
- Alert if queue > 30 items
- Track success/failure rates

### 4. Track Database Size

- Monitor database growth
- Alert if size > 50MB
- Track per-user storage

### 5. Track User Journey (Offline → Online)

Monitor network transitions and sync behavior for UX insights.

### 6. Custom Sentry Dashboards

Create metrics for:

- Offline duration
- Queued operations count
- Sync duration
- Database size

### 7. Error Alerting Rules

Set up alerts for:

- **Critical:** Database corruption, sync failure > 10%, queue > 50
- **Performance:** Sync > 30s, DB > 100MB, query > 1s
- **Security:** Data integrity failures, unusual queue activity

---

## Data Cleanup & Storage Management

### Overview

**Problem:** SQLite database grows indefinitely, eventually causing:

- App crashes (out of storage)
- Slow queries (too much data)
- User device storage full

**Solution:** Automatic data cleanup with user controls

---

### Storage Limits

#### **Target Database Size**

```
Maximum Database Size: 50MB
Warning Threshold: 40MB
Critical Threshold: 45MB
```

**Why 50MB?**

- Typical user: ~1-2MB (1 year of data)
- Heavy user: ~10-20MB (3 years of data)
- 50MB = comfortable buffer for 5+ years

---

### Data Retention Policies

#### **Automatic Cleanup Rules**

| Data Type           | Retention Period | Cleanup Frequency |
| ------------------- | ---------------- | ----------------- |
| Transactions        | 12 months        | Monthly           |
| VTU Orders          | 12 months        | Monthly           |
| P2P Transfers       | 12 months        | Monthly           |
| Circle Transactions | 12 months        | Monthly           |
| Notifications       | 100 most recent  | Weekly            |
| Pending Mutations   | 7 days (failed)  | Daily             |
| Sync Metadata       | 30 days          | Weekly            |

---

### Implementation

#### **1. Auto-Cleanup on App Startup**

```
On App Launch:
  1. Check database size
  2. If size > 40MB:
     - Run cleanup
     - Delete old data
  3. If size > 45MB:
     - Show warning to user
     - Offer manual cleanup
  4. If size > 50MB:
     - Force cleanup
     - Show critical warning
```

---

#### **2. Cleanup Logic**

**Delete Old Transactions:**

```
Delete transactions older than 12 months:
  - Keep last 100 transactions (always)
  - Delete rest if > 12 months old

Example:
  User has 2000 transactions
  500 are > 12 months old
  Delete 500, keep 1500
```

**Delete Old Notifications:**

```
Keep only 100 most recent notifications:
  - Sort by createdAt DESC
  - Keep first 100
  - Delete rest
```

**Delete Failed Pending Mutations:**

```
Delete failed mutations > 7 days old:
  - If retryCount >= maxRetries
  - AND lastRetryAt > 7 days ago
  - Delete from queue
```

---

#### **3. User Settings**

**Give users control:**

```
Settings > Storage & Data:

  ┌─────────────────────────────────────────┐
  │ Database Size: 15.2 MB / 50 MB          │
  │ [████████░░░░░░░░░░░░░░░░░░░░] 30%     │
  │                                         │
  │ Data Retention:                         │
  │ • Transactions: [12 months ▼]           │
  │ • Notifications: [100 items ▼]          │
  │                                         │
  │ [Clean Up Old Data Now]                 │
  │                                         │
  │ Last cleanup: 2 days ago                │
  │ Next cleanup: in 28 days                │
  └─────────────────────────────────────────┘
```

---

#### **4. Export Before Cleanup**

**Offer data export:**

```
Before Cleanup Dialog:

  ⚠️  About to delete 500 old transactions

  Would you like to export them first?

  [Export as PDF]  [Export as CSV]  [Skip]

  Note: Exported data will be saved to your
  device and can be imported later.
```

---

### Database Size Monitoring

#### **Track Size with Sentry**

```
On App Launch:
  1. Get database size
  2. Send to Sentry:
     - Database size (MB)
     - Record count per table
     - Oldest record date
     - User ID

  3. Alert if:
     - Size > 40MB (warning)
     - Size > 50MB (critical)
     - Growth rate > 5MB/month
```

---

#### **Cleanup Metrics**

```
Track cleanup operations:
  - Records deleted
  - Space freed
  - Cleanup duration
  - User ID
  - Last cleanup date
```

---

### Edge Cases

| Scenario                                 | Handling                                        |
| ---------------------------------------- | ----------------------------------------------- |
| User has 100+ transactions in last month | Keep all recent, delete old only                |
| Database corrupted during cleanup        | Rollback, restore from backup                   |
| User wants to keep all data              | Increase limit to 100MB, warn about performance |
| Device low on storage                    | Force cleanup immediately                       |
| Cleanup fails                            | Retry on next launch, log to Sentry             |

---

### Backup Before Cleanup

**Always backup before major cleanup:**

```
Cleanup Process:
  1. Create backup:
     - Copy raverpay.db to raverpay.db.backup
  2. Run cleanup
  3. Verify database integrity
  4. If success:
     - Delete backup
  5. If failure:
     - Restore from backup
     - Log error to Sentry
```

---

## Schema Migrations & App Updates

### Overview

**Problem:** App updates may require SQLite schema changes:

- New columns
- New tables
- Changed data types
- Renamed fields

**Challenge:** Migrate existing user data without data loss

---

### Migration Strategy

#### **Version-Based Migrations**

```
Database Version History:
  v1: Initial schema (app v1.0.0)
  v2: Added 'channel' column to transactions (app v1.1.0)
  v3: Added 'saved_recipients' table (app v1.2.0)
  v4: Added 'pendingDeductions' to wallet (app v1.3.0)
```

---

### Implementation

#### **1. Migration System**

```
Migration Structure:

migrations = [
  {
    version: 1,
    description: "Initial schema",
    up: () => {
      // Create all tables
    },
    down: () => {
      // Rollback (drop tables)
    }
  },
  {
    version: 2,
    description: "Add channel column to transactions",
    up: () => {
      // ALTER TABLE transactions ADD COLUMN channel TEXT
    },
    down: () => {
      // ALTER TABLE transactions DROP COLUMN channel
    }
  },
  // ... more migrations
]
```

---

#### **2. Migration Execution**

```
On App Launch:
  1. Get current database version:
     PRAGMA user_version

  2. Get target version:
     Latest migration version

  3. If current < target:
     - Create backup
     - Run migrations (current+1 to target)
     - Update PRAGMA user_version
     - Verify integrity

  4. If migration fails:
     - Restore from backup
     - Log to Sentry
     - Show error to user
```

---

#### **3. Migration Examples**

**Add New Column:**

```
Migration v2:
  Description: "Add channel column"

  Up:
    ALTER TABLE transactions
    ADD COLUMN channel TEXT DEFAULT 'APP'

  Down:
    ALTER TABLE transactions
    DROP COLUMN channel
```

**Add New Table:**

```
Migration v3:
  Description: "Add saved_recipients table"

  Up:
    CREATE TABLE saved_recipients (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      ...
    )

  Down:
    DROP TABLE saved_recipients
```

**Migrate Data:**

```
Migration v4:
  Description: "Split name into firstName/lastName"

  Up:
    1. ALTER TABLE users ADD COLUMN firstName TEXT
    2. ALTER TABLE users ADD COLUMN lastName TEXT
    3. UPDATE users SET
       firstName = SUBSTR(name, 1, INSTR(name, ' ')-1),
       lastName = SUBSTR(name, INSTR(name, ' ')+1)
    4. ALTER TABLE users DROP COLUMN name

  Down:
    1. ALTER TABLE users ADD COLUMN name TEXT
    2. UPDATE users SET name = firstName || ' ' || lastName
    3. ALTER TABLE users DROP COLUMN firstName
    4. ALTER TABLE users DROP COLUMN lastName
```

---

### Backup Strategy

#### **Automatic Backup Before Migration**

```
Backup Process:
  1. Get database path:
     /path/to/raverpay.db

  2. Create backup:
     Copy to: /path/to/raverpay.db.backup.v{currentVersion}

  3. Verify backup:
     Check file exists and size > 0

  4. Run migration

  5. If success:
     - Keep backup for 7 days
     - Delete after 7 days

  6. If failure:
     - Restore from backup
     - Delete failed database
     - Rename backup to raverpay.db
```

---

### Migration Testing

#### **Pre-Release Testing Checklist**

```
Before releasing app update with migration:

  ✅ Test migration on fresh install
  ✅ Test migration on v1 database
  ✅ Test migration on v2 database
  ✅ Test migration on corrupted database
  ✅ Test rollback (down migration)
  ✅ Test backup/restore
  ✅ Verify data integrity after migration
  ✅ Test app functionality after migration
  ✅ Test performance after migration
  ✅ Monitor Sentry for migration errors
```

---

### Rollback Strategy

#### **If Migration Fails in Production**

```
Rollback Process:
  1. Detect migration failure
  2. Restore from backup
  3. Downgrade database version
  4. Log to Sentry
  5. Show user-friendly error:
     "Update failed. Restored previous version.
      Please try updating again later."
  6. Continue using old schema
```

---

### User Communication

#### **Migration Progress UI**

```
During Migration:

  ┌─────────────────────────────────────────┐
  │ Updating RaverPay...                    │
  │                                         │
  │ [████████████████░░░░░░░░] 75%         │
  │                                         │
  │ Migrating your data to new version...  │
  │ This may take a few moments.            │
  │                                         │
  │ Please don't close the app.             │
  └─────────────────────────────────────────┘
```

---

### Edge Cases

| Scenario                         | Handling                        |
| -------------------------------- | ------------------------------- |
| Migration takes > 30 seconds     | Show progress, don't timeout    |
| User closes app during migration | Resume on next launch           |
| Backup fails                     | Don't run migration, show error |
| Database corrupted               | Restore from backup or reset    |
| Multiple migrations pending      | Run sequentially, not parallel  |

---

## Partial Sync Recovery

### Overview

**Problem:** Network drops during sync, leaving database in inconsistent state:

- Some data synced, some not
- Pending queue partially processed
- Balance out of sync

**Solution:** Resumable sync with checkpoints

---

### Sync Failure Scenarios

#### **1. Network Drops During PULL**

```
Scenario:
  1. Start PULL sync (fetch transactions)
  2. Receive 50 of 100 transactions
  3. Network drops
  4. 50 transactions stored, 50 missing

Problem:
  - Incomplete transaction history
  - Missing recent transactions
  - User sees old data
```

---

#### **2. Network Drops During PUSH**

```
Scenario:
  1. Start PUSH sync (process queue)
  2. Process 2 of 5 pending transactions
  3. Network drops
  4. 2 transactions completed, 3 still pending

Problem:
  - Some transactions succeeded
  - Some still in queue
  - Balance partially updated
```

---

#### **3. Network Drops During Data Write**

```
Scenario:
  1. Fetching 100 transactions
  2. Writing to SQLite
  3. Network drops at transaction 75
  4. Database in inconsistent state

Problem:
  - Partial data written
  - No way to know where it stopped
  - May have duplicate data on retry
```

---

### Solution: Resumable Sync

#### **1. Sync Checkpoints**

```
Track sync progress:

sync_metadata table:
  - tableName: "transactions"
  - lastSyncedAt: 1704614400000
  - lastSyncCursor: "txn_500" (last synced record ID)
  - syncStatus: "in_progress"
  - recordsProcessed: 75
  - totalRecords: 100
```

---

#### **2. Resume Logic**

```
On Sync Start:
  1. Check sync_metadata
  2. If syncStatus = "in_progress":
     - Resume from lastSyncCursor
     - Don't start from beginning
  3. If syncStatus = "failed":
     - Retry from lastSyncCursor
     - Max 3 retries
  4. If syncStatus = "success":
     - Start fresh sync
```

---

#### **3. Atomic Transactions**

```
Use SQLite transactions for atomicity:

Sync Process:
  1. BEGIN TRANSACTION
  2. Fetch data from backend
  3. Write to SQLite
  4. Update sync_metadata
  5. COMMIT

If network drops:
  - ROLLBACK
  - No partial data written
  - Retry from checkpoint
```

---

### Implementation

#### **1. Checkpoint-Based PULL Sync**

```
PULL Sync with Checkpoints:

  1. Get last checkpoint:
     lastSyncedAt = sync_metadata.lastSyncedAt

  2. Fetch data since checkpoint:
     GET /wallet/transactions?since={lastSyncedAt}&limit=100

  3. Process in batches:
     For each batch of 10 transactions:
       - BEGIN TRANSACTION
       - Insert 10 transactions
       - Update checkpoint
       - COMMIT

  4. If network drops:
     - Last checkpoint saved
     - Resume from there on retry
```

---

#### **2. Checkpoint-Based PUSH Sync**

```
PUSH Sync with Checkpoints:

  1. Get pending queue:
     SELECT * FROM pending_mutations ORDER BY priority, createdAt

  2. Process one at a time:
     For each mutation:
       - Send to backend
       - If success:
         - Remove from queue
         - Update checkpoint
       - If failure:
         - Keep in queue
         - Update retry count
         - Move to next

  3. If network drops:
     - Processed mutations removed
     - Remaining mutations still in queue
     - Resume on next sync
```

---

### Corruption Detection

#### **1. Integrity Checks**

```
After Sync:
  1. Verify record counts:
     Local count vs expected count

  2. Verify checksums:
     Calculate checksum of synced data
     Compare with backend checksum

  3. Verify relationships:
     All transaction IDs exist
     All user IDs match

  4. If corruption detected:
     - Rollback sync
     - Clear corrupted data
     - Retry from last good checkpoint
```

---

#### **2. Corruption Recovery**

```
Recovery Process:
  1. Detect corruption:
     - Checksum mismatch
     - Missing records
     - Invalid data

  2. Identify scope:
     - Which table?
     - Which records?
     - When did it happen?

  3. Recovery options:
     a. Rollback to last checkpoint
     b. Delete corrupted records, re-sync
     c. Full database reset (last resort)

  4. Log to Sentry:
     - Corruption type
     - Affected records
     - Recovery action taken
```

---

### Retry Strategy

#### **Exponential Backoff**

```
Retry Logic:
  Attempt 1: Immediate
  Attempt 2: Wait 5 seconds
  Attempt 3: Wait 15 seconds
  Attempt 4: Wait 45 seconds
  Attempt 5: Wait 2 minutes

  After 5 attempts:
    - Give up
    - Show error to user
    - Log to Sentry
```

---

### User Experience

#### **Sync Progress Indicator**

```
During Sync:

  ┌─────────────────────────────────────────┐
  │ Syncing...                              │
  │                                         │
  │ Transactions: [████████░░] 75/100      │
  │ VTU Orders: [██████████] 50/50 ✅      │
  │ Notifications: [████░░░░░░] 25/50      │
  │                                         │
  │ Network: Slow (3G)                      │
  │ Estimated time: 30 seconds              │
  └─────────────────────────────────────────┘
```

---

#### **Sync Failure Notification**

```
If Sync Fails:

  ⚠️  Sync incomplete

  75 of 100 transactions synced.
  Network connection lost.

  Will retry automatically when online.

  [Retry Now]  [Dismiss]
```

---

### Monitoring with Sentry

```
Track sync failures:
  - Failure type (network, corruption, timeout)
  - Records processed before failure
  - Checkpoint position
  - Retry count
  - User ID
  - Network quality

Alert if:
  - Sync failure rate > 5%
  - Same user fails > 3 times
  - Corruption detected
```

---

### Edge Cases

| Scenario                       | Handling                               |
| ------------------------------ | -------------------------------------- |
| Sync interrupted 5 times       | Give up, show manual retry button      |
| Checkpoint corrupted           | Reset checkpoint, start from beginning |
| Backend returns duplicate data | Deduplicate using unique IDs           |
| Clock skew (device time wrong) | Use server timestamps, not device      |
| Database locked during sync    | Wait and retry, max 3 attempts         |

---

### Summary

**Key Principles:**

1. **Checkpoints:** Save progress frequently
2. **Atomic Transactions:** All-or-nothing writes
3. **Resumable:** Always resume from last checkpoint
4. **Corruption Detection:** Verify data integrity
5. **Exponential Backoff:** Don't spam retries
6. **User Feedback:** Show progress and errors clearly

**Benefits:**

- ✅ No data loss on network drops
- ✅ Fast recovery (resume, don't restart)
- ✅ Corruption detection and recovery
- ✅ Better user experience
- ✅ Reduced server load (no full re-syncs)

---

## Testing Plan

### Unit Tests

```typescript
// __tests__/database/offline-queue.test.ts
describe('OfflineQueue', () => {
  it('should queue mutations when offline', async () => {
    const id = await offlineQueue.addToQueue('/test', 'POST', { foo: 'bar' });
    expect(offlineQueue.getQueueLength()).toBe(1);
  });

  it('should process queue when online', async () => {
    // Mock network as online
    useNetworkStore.setState({ isConnected: true });

    await offlineQueue.processQueue();

    expect(offlineQueue.getQueueLength()).toBe(0);
  });
});
```

### Integration Tests

```typescript
// __tests__/integration/transaction-sync.test.ts
describe('Transaction Sync', () => {
  it('should load transactions from SQLite instantly', async () => {
    const start = Date.now();
    const { result } = renderHook(() => useTransactionHistory('user-123'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const duration = Date.now() - start;
    expect(duration).toBeLessThan(200); // < 200ms
  });

  it('should sync with backend when online', async () => {
    const { result } = renderHook(() => useTransactionHistory('user-123'));

    await waitFor(() => {
      expect(result.current.isSyncing).toBe(true);
    });

    await waitFor(() => {
      expect(result.current.isSyncing).toBe(false);
    });
  });
});
```

### Manual Testing Checklist

- [ ] Transaction history loads instantly offline
- [ ] Search works offline
- [ ] Filter works offline
- [ ] Airtime purchase queued when offline
- [ ] Queued purchase processes when online
- [ ] Wallet balance available offline
- [ ] Sync completes in < 5 seconds
- [ ] No data loss after app crash
- [ ] Database size < 50MB after 1000 transactions

---

## Success Metrics

| Metric                           | Before SQLite | After SQLite | Target                  |
| -------------------------------- | ------------- | ------------ | ----------------------- |
| Transaction history load time    | 2-5s (3G)     | < 100ms      | ✅ 20-50x faster        |
| Search response time             | 2-3s          | < 50ms       | ✅ 40-60x faster        |
| Failed transaction rate          | ~5%           | < 0.1%       | ✅ 50x reduction        |
| Data usage per session           | ~5MB          | < 500KB      | ✅ 90% reduction        |
| Offline feature availability     | 0%            | 80%+         | ✅ Full offline support |
| User satisfaction (poor network) | ~60%          | > 90%        | ✅ Improved UX          |

---

## Migration Strategy

### Database Versioning

```typescript
// src/lib/database/migrations.ts
const MIGRATIONS = [
  {
    version: 1,
    up: () => {
      // Initial schema (from schema.ts)
    },
  },
  {
    version: 2,
    up: () => {
      db.execSync(`
        ALTER TABLE transactions ADD COLUMN channel TEXT;
      `);
    },
  },
];

export function runMigrations() {
  const currentVersion =
    db.getFirstSync<{ version: number }>(`PRAGMA user_version`)?.version || 0;

  for (const migration of MIGRATIONS) {
    if (migration.version > currentVersion) {
      migration.up();
      db.execSync(`PRAGMA user_version = ${migration.version}`);
    }
  }
}
```

---

## Monitoring & Analytics

### Track Sync Performance

```typescript
// Track sync duration
const syncStart = Date.now();
await syncService.syncAll();
const syncDuration = Date.now() - syncStart;

analytics.track('database_sync_completed', {
  duration: syncDuration,
  recordCount: transactions.length,
  success: true,
});
```

### Track Database Size

```typescript
import * as FileSystem from 'expo-file-system';

const dbPath = `${FileSystem.documentDirectory}SQLite/raverpay.db`;
const info = await FileSystem.getInfoAsync(dbPath);

analytics.track('database_size', {
  sizeBytes: info.size,
  sizeMB: (info.size / (1024 * 1024)).toFixed(2),
});
```

---

## Next Steps

### Week 1-2: Foundation

1. Install expo-sqlite
2. Create schema
3. Implement transaction history
4. Test offline→online flow

### Week 3-4: Extended Features

1. Add VTU orders sync
2. Add P2P transfers sync
3. Implement background sync
4. Test with poor network

### Week 5-6: Production Ready

1. Add remaining tables
2. Implement migrations
3. Add monitoring
4. Performance optimization
5. User testing

---

**Document Version:** 1.0  
**Last Updated:** January 7, 2026  
**Status:** Ready for Implementation
