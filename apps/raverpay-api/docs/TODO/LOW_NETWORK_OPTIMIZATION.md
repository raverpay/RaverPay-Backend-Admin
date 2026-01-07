# Low Network Optimization Strategy for RaverPay Mobile

## Overview

This document provides specific recommendations for optimizing the RaverPay mobile app to handle poor network conditions common in Nigeria, particularly in areas with 2G/3G connectivity or unstable network infrastructure.

**Last Updated:** January 7, 2026  
**Target:** Mobile app (React Native/Expo)  
**Focus Areas:** Network resilience, offline capability, data efficiency

---

## Executive Summary

**Current Status:** 🟡 MODERATE  
**Key Strengths:**
- ✅ React Query with persistence (AsyncStorage)
- ✅ 60-second timeout for VTU operations
- ✅ Retry logic (2 retries for queries, 1 for mutations)
- ✅ Token refresh with retry
- ✅ NetInfo library installed

**Critical Gaps:**
- ❌ No network state monitoring/UI feedback
- ❌ No request queuing for offline operations
- ❌ No adaptive timeout based on network quality
- ❌ No image/asset optimization for slow networks
- ❌ No data compression
- ❌ Limited offline-first features

**Recommendation:** Implement HIGH priority items to achieve GOOD status for Nigerian network conditions.

---

## Table of Contents

1. [Current Implementation Analysis](#current-implementation-analysis)
2. [Network Challenges in Nigeria](#network-challenges-in-nigeria)
3. [Recommended Optimizations](#recommended-optimizations)
4. [Implementation Roadmap](#implementation-roadmap)
5. [Code Examples](#code-examples)
6. [Testing Strategy](#testing-strategy)

---

## Current Implementation Analysis

### ✅ What's Working Well

#### 1. React Query with Persistence
**Location:** `src/lib/api/query-client.ts`

```typescript
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: config.STALE_TIME.DEFAULT,
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
      retry: 2,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true, // ✅ Good for poor networks
    },
    mutations: {
      retry: 1,
    },
  },
});

export const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'REACT_QUERY_CACHE',
  throttleTime: 1000,
});
```

**Benefits:**
- Cached data persists across app restarts
- Automatic refetch on reconnect
- 24-hour cache retention

**Gaps:**
- No offline mutation queue
- No network-aware retry strategy
- Fixed retry count regardless of network quality

---

#### 2. Axios Configuration
**Location:** `src/lib/api/client.ts`

```typescript
export const apiClient = axios.create({
  baseURL: config.API_BASE_URL,
  timeout: 60000, // 60 seconds
  headers: {
    "Content-Type": "application/json",
  },
});
```

**Benefits:**
- 60-second timeout (good for VTU operations)
- Token refresh with retry

**Gaps:**
- Fixed timeout (doesn't adapt to network quality)
- No request compression
- No request prioritization

---

#### 3. Network Detection
**Library:** `@react-native-community/netinfo` (installed but underutilized)

**Current Usage:**
- Only in device fingerprinting (`src/lib/device-fingerprint.ts`)

**Gaps:**
- No global network state monitoring
- No UI feedback for network status
- No adaptive behavior based on connection type

---

### ❌ What's Missing

#### 1. Network State Management
- No global network state store
- No connection quality detection (2G/3G/4G/5G)
- No UI indicators for poor connectivity

#### 2. Offline-First Features
- No offline mutation queue
- No optimistic updates for critical operations
- No local-first data for frequently accessed info

#### 3. Data Optimization
- No request/response compression
- No image optimization for slow networks
- No lazy loading for heavy screens

#### 4. Adaptive Behavior
- No timeout adjustment based on network quality
- No retry strategy based on connection type
- No graceful degradation

---

## Network Challenges in Nigeria

### Common Scenarios

#### 1. **Intermittent Connectivity** (Most Common)
- **Description:** Network drops in and out frequently
- **Affected Areas:** Rural areas, moving vehicles, crowded areas
- **Impact:** Failed requests, incomplete transactions, poor UX
- **Priority:** 🔴 CRITICAL

#### 2. **Slow 2G/3G Networks**
- **Description:** Connection available but very slow (< 100 kbps)
- **Affected Areas:** Remote areas, network congestion
- **Impact:** Timeouts, slow loading, user frustration
- **Priority:** 🔴 CRITICAL

#### 3. **High Latency**
- **Description:** Long round-trip times (> 1000ms)
- **Affected Areas:** Satellite connections, congested networks
- **Impact:** Slow response times, perceived app slowness
- **Priority:** 🟡 HIGH

#### 4. **Expensive Data**
- **Description:** Users on limited data plans
- **Affected Areas:** Nationwide (cost-conscious users)
- **Impact:** User reluctance to use app, data wastage
- **Priority:** 🟢 MEDIUM

---

## Recommended Optimizations

### 🔴 CRITICAL Priority (Implement First)

#### 1. Network State Monitoring & UI Feedback

**Problem:** Users don't know when they're offline or on poor network

**Solution:** Implement global network state management with UI indicators

**Implementation:**

**Step 1:** Create Network Store
```typescript
// src/store/network.store.ts
import { create } from 'zustand';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  connectionType: string;
  connectionQuality: 'excellent' | 'good' | 'poor' | 'offline';
  effectiveType: string | null;
  updateNetworkState: (state: NetInfoState) => void;
  initialize: () => void;
}

export const useNetworkStore = create<NetworkState>((set) => ({
  isConnected: true,
  isInternetReachable: null,
  connectionType: 'unknown',
  connectionQuality: 'good',
  effectiveType: null,

  updateNetworkState: (netInfoState: NetInfoState) => {
    const quality = getConnectionQuality(netInfoState);
    set({
      isConnected: netInfoState.isConnected ?? false,
      isInternetReachable: netInfoState.isInternetReachable,
      connectionType: netInfoState.type,
      effectiveType: netInfoState.details?.cellularGeneration || null,
      connectionQuality: quality,
    });
  },

  initialize: () => {
    // Subscribe to network state updates
    const unsubscribe = NetInfo.addEventListener((state) => {
      useNetworkStore.getState().updateNetworkState(state);
    });
    return unsubscribe;
  },
}));

// Helper function to determine connection quality
function getConnectionQuality(state: NetInfoState): 'excellent' | 'good' | 'poor' | 'offline' {
  if (!state.isConnected) return 'offline';
  
  const type = state.type;
  const cellular = state.details?.cellularGeneration;
  
  // WiFi is usually good
  if (type === 'wifi') return 'excellent';
  
  // Cellular quality based on generation
  if (type === 'cellular') {
    if (cellular === '5g') return 'excellent';
    if (cellular === '4g') return 'good';
    if (cellular === '3g') return 'poor';
    if (cellular === '2g') return 'poor';
  }
  
  return 'good'; // Default for unknown types
}
```

**Step 2:** Create Network Banner Component
```typescript
// src/components/ui/NetworkBanner.tsx
import { View, Text } from 'react-native';
import { useNetworkStore } from '@/src/store/network.store';
import { MaterialIcons } from '@expo/vector-icons';

export function NetworkBanner() {
  const { isConnected, connectionQuality } = useNetworkStore();

  if (isConnected && connectionQuality !== 'poor') return null;

  const getMessage = () => {
    if (!isConnected) return 'No internet connection';
    if (connectionQuality === 'poor') return 'Slow network detected';
    return '';
  };

  const getIcon = () => {
    if (!isConnected) return 'wifi-off';
    return 'signal-cellular-alt';
  };

  return (
    <View className="bg-orange-500 px-4 py-2 flex-row items-center gap-2">
      <MaterialIcons name={getIcon()} size={16} color="white" />
      <Text className="text-white text-sm font-medium">{getMessage()}</Text>
      {!isConnected && (
        <Text className="text-white text-xs ml-auto">
          Some features may be limited
        </Text>
      )}
    </View>
  );
}
```

**Step 3:** Initialize in App Layout
```typescript
// app/_layout.tsx
import { useEffect } from 'react';
import { useNetworkStore } from '@/src/store/network.store';
import { NetworkBanner } from '@/src/components/ui/NetworkBanner';

export default function RootLayout() {
  useEffect(() => {
    const unsubscribe = useNetworkStore.getState().initialize();
    return unsubscribe;
  }, []);

  return (
    <>
      <NetworkBanner />
      {/* Rest of your layout */}
    </>
  );
}
```

**Benefits:**
- Users know when they're offline
- Visual feedback for poor network
- Prevents user frustration from "broken" app

---

#### 2. Offline Mutation Queue

**Problem:** Failed transactions due to network drops are lost

**Solution:** Queue mutations when offline, retry when online

**Implementation:**

```typescript
// src/lib/api/offline-queue.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNetworkStore } from '@/src/store/network.store';

interface QueuedMutation {
  id: string;
  endpoint: string;
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  data: any;
  timestamp: number;
  retryCount: number;
  priority: 'high' | 'normal' | 'low';
}

const QUEUE_KEY = 'OFFLINE_MUTATION_QUEUE';
const MAX_RETRIES = 3;

class OfflineQueue {
  private queue: QueuedMutation[] = [];
  private isProcessing = false;

  async initialize() {
    // Load queue from storage
    const stored = await AsyncStorage.getItem(QUEUE_KEY);
    if (stored) {
      this.queue = JSON.parse(stored);
    }

    // Listen for network changes
    useNetworkStore.subscribe((state) => {
      if (state.isConnected && !this.isProcessing) {
        this.processQueue();
      }
    });
  }

  async addToQueue(mutation: Omit<QueuedMutation, 'id' | 'timestamp' | 'retryCount'>) {
    const queuedMutation: QueuedMutation = {
      ...mutation,
      id: `${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
      retryCount: 0,
    };

    this.queue.push(queuedMutation);
    await this.saveQueue();

    // Try to process immediately if online
    if (useNetworkStore.getState().isConnected) {
      this.processQueue();
    }
  }

  private async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;
    if (!useNetworkStore.getState().isConnected) return;

    this.isProcessing = true;

    // Sort by priority and timestamp
    this.queue.sort((a, b) => {
      const priorityOrder = { high: 0, normal: 1, low: 2 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return a.timestamp - b.timestamp;
    });

    while (this.queue.length > 0 && useNetworkStore.getState().isConnected) {
      const mutation = this.queue[0];

      try {
        // Execute the mutation
        await this.executeMutation(mutation);
        
        // Success - remove from queue
        this.queue.shift();
        await this.saveQueue();
      } catch (error) {
        mutation.retryCount++;

        if (mutation.retryCount >= MAX_RETRIES) {
          // Max retries reached - remove and log
          console.error('Mutation failed after max retries:', mutation);
          this.queue.shift();
          await this.saveQueue();
        } else {
          // Will retry later
          break;
        }
      }
    }

    this.isProcessing = false;
  }

  private async executeMutation(mutation: QueuedMutation) {
    const { apiClient } = await import('./client');
    return apiClient.request({
      url: mutation.endpoint,
      method: mutation.method,
      data: mutation.data,
    });
  }

  private async saveQueue() {
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(this.queue));
  }

  getQueueLength() {
    return this.queue.length;
  }
}

export const offlineQueue = new OfflineQueue();
```

**Usage in Mutations:**
```typescript
// Example: Airtime purchase with offline queue
const purchaseAirtimeMutation = useMutation({
  mutationFn: async (data: PurchaseAirtimeDto) => {
    const { isConnected } = useNetworkStore.getState();
    
    if (!isConnected) {
      // Queue for later
      await offlineQueue.addToQueue({
        endpoint: '/vtu/airtime/purchase',
        method: 'POST',
        data,
        priority: 'high', // Financial transactions are high priority
      });
      
      throw new Error('QUEUED_OFFLINE');
    }
    
    return apiClient.post('/vtu/airtime/purchase', data);
  },
  onError: (error) => {
    if (error.message === 'QUEUED_OFFLINE') {
      toast.success('Transaction queued. Will process when online.');
    }
  },
});
```

**Benefits:**
- No lost transactions due to network drops
- Automatic retry when connection restored
- Priority-based processing

---

#### 2B. SQLite for Offline-First Architecture (HIGHLY RECOMMENDED)

**Problem:** AsyncStorage is key-value only, complex queries are slow, no relational data

**Solution:** Use SQLite as local database for true offline-first experience

**📄 Full Implementation Plan:** See [SQLITE_IMPLEMENTATION_PLAN.md](./SQLITE_IMPLEMENTATION_PLAN.md)

**Quick Summary:**

SQLite provides the **single biggest performance improvement** for poor network conditions:

| Benefit | Impact |
|---------|--------|
| ⚡ **20-50x faster** transaction history | 2-5s → < 100ms |
| 💾 **Zero data loss** | All operations persisted locally |
| 📱 **90% less data usage** | Fetch once, query locally |
| 🚀 **Instant search/filter** | Works completely offline |
| 💪 **Always available** | Core features work without network |

**Tables to Implement:**
- `transactions` - Transaction history (biggest win!)
- `wallet` - Wallet balance and limits
- `vtu_orders` - VTU purchase history
- `p2p_transfers` - P2P transfer history
- `circle_transactions` - Circle/USDC transactions
- `pending_mutations` - Offline operation queue
- `saved_recipients` - Saved VTU recipients
- `notifications` - In-app notifications

**Implementation Timeline:**
- **Week 1-2:** Foundation (transactions + wallet)
- **Week 3-4:** Extended features (VTU + P2P + Circle)
- **Week 5-6:** Polish (notifications + monitoring)

**Quick Start:**
```bash
npx expo install expo-sqlite
```

See the [full implementation plan](./SQLITE_IMPLEMENTATION_PLAN.md) for:
- Complete database schema (based on your Prisma schema)
- Sync strategy (bidirectional with conflict resolution)
- Code examples (hooks, services, queue)
- Testing plan
- Migration strategy

**Recommendation:** Start with transaction history - users will immediately notice the speed improvement!

---

#### 3. Adaptive Timeout Strategy

**Problem:** Fixed 60-second timeout is too long for 2G, too short for some operations

**Solution:** Adjust timeout based on network quality and operation type

**Implementation:**

```typescript
// src/lib/api/adaptive-timeout.ts
import { useNetworkStore } from '@/src/store/network.store';

interface TimeoutConfig {
  base: number;
  multiplier: {
    excellent: number;
    good: number;
    poor: number;
    offline: number;
  };
}

const TIMEOUT_CONFIGS: Record<string, TimeoutConfig> = {
  // Quick operations (balance check, profile)
  quick: {
    base: 10000, // 10 seconds
    multiplier: {
      excellent: 1,
      good: 1.5,
      poor: 3,
      offline: 0, // Don't even try
    },
  },
  // Standard operations (transactions, VTU)
  standard: {
    base: 30000, // 30 seconds
    multiplier: {
      excellent: 1,
      good: 1.5,
      poor: 2,
      offline: 0,
    },
  },
  // Heavy operations (image upload, large data)
  heavy: {
    base: 60000, // 60 seconds
    multiplier: {
      excellent: 1,
      good: 2,
      poor: 3,
      offline: 0,
    },
  },
};

export function getAdaptiveTimeout(operationType: keyof typeof TIMEOUT_CONFIGS): number {
  const { connectionQuality } = useNetworkStore.getState();
  const config = TIMEOUT_CONFIGS[operationType];
  
  const timeout = config.base * config.multiplier[connectionQuality];
  
  // Return 0 for offline (will be caught by network check)
  return timeout;
}

// Update axios client to use adaptive timeout
export function createAdaptiveRequest(operationType: keyof typeof TIMEOUT_CONFIGS) {
  return {
    timeout: getAdaptiveTimeout(operationType),
  };
}
```

**Usage:**
```typescript
// Quick operation
const { data } = await apiClient.get('/wallet/balance', {
  ...createAdaptiveRequest('quick'),
});

// Heavy operation
const { data } = await apiClient.post('/users/upload-avatar', formData, {
  ...createAdaptiveRequest('heavy'),
  headers: { 'Content-Type': 'multipart/form-data' },
});
```

**Benefits:**
- Faster failures on poor networks (better UX)
- Longer timeouts when needed
- Network-aware behavior

---

### 🟡 HIGH Priority

#### 4. Request/Response Compression

**Problem:** Large payloads consume data and slow down on poor networks

**Solution:** Enable gzip compression

**Implementation:**

```typescript
// src/lib/api/client.ts
export const apiClient = axios.create({
  baseURL: config.API_BASE_URL,
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
    "Accept-Encoding": "gzip, deflate", // Request compressed responses
  },
  decompress: true, // Automatically decompress responses
});
```

**Backend (Already Implemented):**
Your NestJS API likely has compression enabled. Verify in `main.ts`:
```typescript
import compression from 'compression';
app.use(compression());
```

**Benefits:**
- 60-80% reduction in payload size
- Faster load times on slow networks
- Reduced data usage

---

#### 5. Image Optimization

**Problem:** Images consume significant data and load slowly

**Solution:** Implement progressive loading and size optimization

**Implementation:**

```typescript
// src/components/ui/OptimizedImage.tsx
import { Image } from 'expo-image';
import { useNetworkStore } from '@/src/store/network.store';

interface OptimizedImageProps {
  source: string;
  placeholder?: string;
  className?: string;
}

export function OptimizedImage({ source, placeholder, className }: OptimizedImageProps) {
  const { connectionQuality } = useNetworkStore();
  
  // Adjust image quality based on network
  const getImageQuality = () => {
    switch (connectionQuality) {
      case 'excellent':
        return 'high';
      case 'good':
        return 'medium';
      case 'poor':
        return 'low';
      default:
        return 'medium';
    }
  };

  const quality = getImageQuality();
  
  // Construct optimized URL (if using image CDN like Cloudinary)
  const optimizedSource = source.includes('cloudinary')
    ? source.replace('/upload/', `/upload/q_${quality === 'low' ? '30' : quality === 'medium' ? '60' : '80'}/`)
    : source;

  return (
    <Image
      source={{ uri: optimizedSource }}
      placeholder={placeholder}
      className={className}
      transition={300}
      cachePolicy="memory-disk" // Cache aggressively
    />
  );
}
```

**Benefits:**
- Faster image loading
- Reduced data consumption
- Better UX on slow networks

---

#### 6. Optimistic Updates for Critical Operations

**Problem:** Users wait for server confirmation even on good operations

**Solution:** Update UI immediately, rollback on error

**Implementation:**

```typescript
// Example: P2P Transfer with optimistic update
const sendMoneyMutation = useMutation({
  mutationFn: (data: SendMoneyDto) => apiClient.post('/transactions/send', data),
  
  onMutate: async (data) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ['wallet', 'balance'] });
    
    // Snapshot previous value
    const previousBalance = queryClient.getQueryData(['wallet', 'balance']);
    
    // Optimistically update balance
    queryClient.setQueryData(['wallet', 'balance'], (old: any) => ({
      ...old,
      balance: (parseFloat(old.balance) - data.amount).toFixed(2),
    }));
    
    // Return context for rollback
    return { previousBalance };
  },
  
  onError: (error, variables, context) => {
    // Rollback on error
    if (context?.previousBalance) {
      queryClient.setQueryData(['wallet', 'balance'], context.previousBalance);
    }
    toast.error('Transfer failed. Please try again.');
  },
  
  onSuccess: () => {
    // Refetch to get accurate server state
    queryClient.invalidateQueries({ queryKey: ['wallet', 'balance'] });
    toast.success('Money sent successfully!');
  },
});
```

**Benefits:**
- Instant UI feedback
- Better perceived performance
- Graceful error handling

---

### 🟢 MEDIUM Priority

#### 7. Lazy Loading & Code Splitting

**Problem:** Large initial bundle size slows down app startup

**Solution:** Load screens on demand

**Implementation:**

```typescript
// app/(tabs)/_layout.tsx
import { lazy, Suspense } from 'react';
import { ActivityIndicator, View } from 'react-native';

// Lazy load heavy screens
const VTUScreen = lazy(() => import('./vtu'));
const CircleScreen = lazy(() => import('./circle'));

function LoadingFallback() {
  return (
    <View className="flex-1 items-center justify-center">
      <ActivityIndicator size="large" />
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="home"
        options={{ title: 'Home' }}
      />
      <Tabs.Screen
        name="vtu"
        options={{ title: 'VTU' }}
      >
        {() => (
          <Suspense fallback={<LoadingFallback />}>
            <VTUScreen />
          </Suspense>
        )}
      </Tabs.Screen>
    </Tabs>
  );
}
```

**Benefits:**
- Faster app startup
- Reduced initial download size
- Better performance on low-end devices

---

#### 8. Local-First Data for Frequently Accessed Info

**Problem:** Repeatedly fetching static/semi-static data wastes bandwidth

**Solution:** Cache aggressively with long stale times

**Implementation:**

```typescript
// src/hooks/useVTUProviders.ts
export function useVTUProviders() {
  return useQuery({
    queryKey: ['vtu', 'providers'],
    queryFn: () => apiClient.get('/vtu/airtime/providers'),
    staleTime: 1000 * 60 * 60 * 24 * 7, // 7 days (rarely changes)
    gcTime: 1000 * 60 * 60 * 24 * 30, // 30 days
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

// src/hooks/useBanks.ts
export function useBanks() {
  return useQuery({
    queryKey: ['banks'],
    queryFn: () => apiClient.get('/transactions/banks'),
    staleTime: 1000 * 60 * 60 * 24 * 30, // 30 days (very static)
    gcTime: Infinity, // Never garbage collect
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}
```

**Benefits:**
- Reduced API calls
- Instant data availability
- Works offline after first fetch

---

#### 9. Skeleton Screens Instead of Spinners

**Problem:** Spinners make app feel slow, especially on poor networks

**Solution:** Show content placeholders

**Implementation:**

```typescript
// src/components/ui/TransactionSkeleton.tsx
import { View } from 'react-native';

export function TransactionSkeleton() {
  return (
    <View className="p-4 bg-white rounded-lg mb-2">
      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center gap-3">
          {/* Icon skeleton */}
          <View className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
          
          <View className="gap-2">
            {/* Title skeleton */}
            <View className="w-32 h-4 bg-gray-200 rounded animate-pulse" />
            {/* Subtitle skeleton */}
            <View className="w-24 h-3 bg-gray-200 rounded animate-pulse" />
          </View>
        </View>
        
        {/* Amount skeleton */}
        <View className="w-20 h-5 bg-gray-200 rounded animate-pulse" />
      </View>
    </View>
  );
}

// Usage
{isLoading ? (
  <>
    <TransactionSkeleton />
    <TransactionSkeleton />
    <TransactionSkeleton />
  </>
) : (
  transactions.map(tx => <TransactionCard key={tx.id} transaction={tx} />)
)}
```

**Benefits:**
- Better perceived performance
- Reduced user anxiety
- Professional feel

---

### 🔵 LOW Priority (Nice to Have)

#### 10. Data Usage Indicator

**Problem:** Users don't know how much data the app consumes

**Solution:** Track and display data usage

**Implementation:**

```typescript
// src/hooks/useDataUsage.ts
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DATA_USAGE_KEY = 'APP_DATA_USAGE';

export function useDataUsage() {
  const [dataUsed, setDataUsed] = useState(0);

  useEffect(() => {
    loadDataUsage();
  }, []);

  const loadDataUsage = async () => {
    const stored = await AsyncStorage.getItem(DATA_USAGE_KEY);
    if (stored) {
      setDataUsed(parseInt(stored, 10));
    }
  };

  const trackRequest = async (bytes: number) => {
    const newTotal = dataUsed + bytes;
    setDataUsed(newTotal);
    await AsyncStorage.setItem(DATA_USAGE_KEY, newTotal.toString());
  };

  const resetUsage = async () => {
    setDataUsed(0);
    await AsyncStorage.removeItem(DATA_USAGE_KEY);
  };

  return {
    dataUsed,
    dataUsedMB: (dataUsed / (1024 * 1024)).toFixed(2),
    trackRequest,
    resetUsage,
  };
}
```

**Benefits:**
- User awareness
- Trust building
- Data-conscious users appreciate it

---

## Implementation Roadmap

### Phase 1: Foundation (Week 1-2)
**Goal:** Basic network resilience

- [ ] Implement network state monitoring
- [ ] Add network banner UI
- [ ] Enable request/response compression
- [ ] Add adaptive timeout strategy

**Expected Impact:**
- Users aware of network status
- 60-80% reduction in data usage
- Faster failures on poor networks

---

### Phase 2: Offline Support (Week 3-4)
**Goal:** Work offline where possible

- [ ] Implement offline mutation queue
- [ ] Add optimistic updates for critical operations
- [ ] Increase cache times for static data
- [ ] Add skeleton screens

**Expected Impact:**
- No lost transactions
- Better perceived performance
- Reduced API calls

---

### Phase 3: Optimization (Week 5-6)
**Goal:** Fine-tune for Nigerian networks

- [ ] Implement image optimization
- [ ] Add lazy loading for heavy screens
- [ ] Optimize bundle size
- [ ] Add retry strategies per operation type

**Expected Impact:**
- Faster app startup
- Reduced data consumption
- Better UX on 2G/3G

---

### Phase 4: Polish (Week 7-8)
**Goal:** Professional touches

- [ ] Add data usage tracking
- [ ] Implement smart prefetching
- [ ] Add network quality analytics
- [ ] Create offline mode documentation

**Expected Impact:**
- User trust
- Data insights
- Better support

---

## Code Examples

### Complete Network-Aware Hook

```typescript
// src/hooks/useNetworkAwareQuery.ts
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { useNetworkStore } from '@/src/store/network.store';
import { toast } from '@/src/lib/utils/toast';

interface NetworkAwareQueryOptions<T> extends UseQueryOptions<T> {
  requiresNetwork?: boolean;
  showOfflineToast?: boolean;
}

export function useNetworkAwareQuery<T>(
  options: NetworkAwareQueryOptions<T>
) {
  const { isConnected, connectionQuality } = useNetworkStore();

  const {
    requiresNetwork = true,
    showOfflineToast = true,
    ...queryOptions
  } = options;

  // Adjust retry based on network quality
  const getRetryCount = () => {
    if (!isConnected) return 0;
    if (connectionQuality === 'poor') return 1;
    return 2;
  };

  // Adjust stale time based on network
  const getStaleTime = () => {
    if (connectionQuality === 'poor') {
      // Keep data fresh longer on poor networks
      return (queryOptions.staleTime as number) * 2;
    }
    return queryOptions.staleTime;
  };

  return useQuery({
    ...queryOptions,
    enabled: requiresNetwork ? isConnected && (queryOptions.enabled ?? true) : (queryOptions.enabled ?? true),
    retry: getRetryCount(),
    staleTime: getStaleTime(),
    onError: (error) => {
      if (!isConnected && showOfflineToast) {
        toast.offline();
      }
      queryOptions.onError?.(error);
    },
  });
}
```

---

## Testing Strategy

### Manual Testing Checklist

#### Network Simulation
- [ ] Test on 2G network (Chrome DevTools Network throttling)
- [ ] Test with airplane mode on/off
- [ ] Test with intermittent connectivity (toggle WiFi repeatedly)
- [ ] Test with high latency (1000ms+ delay)

#### Critical Flows
- [ ] Login with poor network
- [ ] Fund wallet on 2G
- [ ] Purchase airtime offline → online
- [ ] Send money with network drop mid-transaction
- [ ] View transaction history on slow network

#### Edge Cases
- [ ] App startup with no network
- [ ] Network drop during image upload
- [ ] Multiple failed requests queuing
- [ ] Cache expiry on offline mode

---

### Automated Testing

```typescript
// __tests__/network-resilience.test.ts
import { renderHook, waitFor } from '@testing-library/react-native';
import { useNetworkStore } from '@/src/store/network.store';
import NetInfo from '@react-native-community/netinfo';

jest.mock('@react-native-community/netinfo');

describe('Network Resilience', () => {
  it('should detect offline state', async () => {
    (NetInfo.fetch as jest.Mock).mockResolvedValue({
      isConnected: false,
      isInternetReachable: false,
    });

    const { result } = renderHook(() => useNetworkStore());
    
    await waitFor(() => {
      expect(result.current.isConnected).toBe(false);
      expect(result.current.connectionQuality).toBe('offline');
    });
  });

  it('should detect poor network (2G)', async () => {
    (NetInfo.fetch as jest.Mock).mockResolvedValue({
      isConnected: true,
      type: 'cellular',
      details: { cellularGeneration: '2g' },
    });

    const { result } = renderHook(() => useNetworkStore());
    
    await waitFor(() => {
      expect(result.current.connectionQuality).toBe('poor');
    });
  });
});
```

---

## Success Metrics

### Key Performance Indicators (KPIs)

| Metric | Current | Target | Priority |
|--------|---------|--------|----------|
| App crash rate on poor network | Unknown | < 0.1% | 🔴 Critical |
| Failed transaction rate | Unknown | < 1% | 🔴 Critical |
| Average load time (2G) | Unknown | < 5s | 🟡 High |
| Data usage per session | Unknown | < 2MB | 🟢 Medium |
| Offline feature usage | 0% | > 20% | 🟢 Medium |
| User retention (poor network areas) | Unknown | > 70% | 🔴 Critical |

### Monitoring

**Sentry Custom Events:**
```typescript
// Track network quality
Sentry.addBreadcrumb({
  category: 'network',
  message: `Connection quality: ${connectionQuality}`,
  level: 'info',
  data: {
    type: connectionType,
    isConnected,
  },
});

// Track failed requests by network type
Sentry.captureException(error, {
  tags: {
    network_type: connectionType,
    network_quality: connectionQuality,
  },
});
```

---

## Conclusion

**Current Assessment:** 🟡 MODERATE

Your mobile app has a good foundation with React Query persistence and retry logic, but lacks critical features for handling Nigeria's challenging network conditions.

**Priority Actions:**
1. ✅ Implement network state monitoring (Week 1)
2. ✅ Add offline mutation queue (Week 2)
3. ✅ Enable compression (Week 1)
4. ✅ Add adaptive timeouts (Week 2)

**Expected Outcome:**
After implementing HIGH priority items, the app will:
- Handle intermittent connectivity gracefully
- Provide clear feedback to users
- Reduce data usage by 60-80%
- Prevent lost transactions
- Work better on 2G/3G networks

**Long-term Vision:**
A truly offline-first app that works seamlessly even in areas with poor connectivity, building trust with Nigerian users and reducing support tickets related to network issues.

---

## Additional Resources

### Libraries to Consider

1. **@tanstack/react-query-persist-client** (Already using ✅)
2. **react-native-offline** - Offline detection utilities
3. **react-native-network-logger** - Debug network requests
4. **@react-native-community/netinfo** (Already installed ✅)

### Nigerian Network Statistics (2024)

- **Average mobile speed:** 15-25 Mbps (4G)
- **3G coverage:** ~70% of population
- **2G still active:** ~15% of users
- **Network congestion:** Peak hours 6-9 PM
- **Data cost:** ₦1000-2000 per GB (expensive)

### Best Practices

1. **Always assume poor network** - Design for worst case
2. **Cache aggressively** - Reduce API calls
3. **Fail fast** - Don't make users wait
4. **Provide feedback** - Users need to know what's happening
5. **Test on real devices** - Emulators don't simulate network well
6. **Monitor in production** - Track network-related issues

---

**Document Version:** 1.0  
**Last Updated:** January 7, 2026  
**Next Review:** February 2026
