# RaverPay Admin Mobile App - Comprehensive Implementation Plan

## Executive Summary

This document outlines the complete plan to convert the RaverPay Admin Dashboard (Next.js web app) into a native iOS mobile application using React Native and Expo, matching the technology stack of the existing RaverPay mobile app.

**Goal:** Enable admins to manage the entire RaverPay platform on-the-go from their iOS devices with 100% feature parity with the web dashboard.

**Approach:** Create a new standalone iOS app (`raverpay-admin-mobile`) that reuses all backend APIs and implements all admin dashboard features.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [App Architecture](#app-architecture)
4. [Feature Mapping](#feature-mapping)
5. [Database Schema](#database-schema)
6. [Implementation Phases](#implementation-phases)
7. [Security Considerations](#security-considerations)
8. [Testing Strategy](#testing-strategy)
9. [Deployment Strategy](#deployment-strategy)

---

## Project Overview

### **Why a Separate App?**

✅ **Separate Bundle ID** - `com.raverpay.admin` (iOS only)  
✅ **Different User Base** - Admins vs regular users  
✅ **Different Permissions** - Admin-level access  
✅ **Different App Store** - Internal distribution or TestFlight only  
✅ **Security Isolation** - Separate from customer-facing app  

### **Current Admin Dashboard Features**

Based on `/apps/raverpay-admin/app/dashboard/`:

1. **Dashboard** - Overview, stats, quick actions
2. **Users** - User management, KYC, status updates
3. **Transactions** - Transaction monitoring, details
4. **Wallets** - Wallet management, balances
5. **Virtual Accounts** - Virtual account management
6. **VTU** - Airtime/data/bills management
7. **Crypto** - Crypto orders and conversions
8. **Circle Wallets** - Circle wallet management (16 sub-features)
9. **Venly Wallets** - Venly wallet management
10. **Gift Cards** - Gift card orders
11. **Cashback** - Cashback management
12. **Support** - Support tickets (10 sub-features)
13. **Notifications** - Notification management
14. **Analytics** - Platform analytics
15. **Audit Logs** - Audit trail
16. **KYC** - KYC verification
17. **Deletions** - Account deletion requests
18. **Rate Limits** - Rate limit management
19. **Admins** - Admin user management
20. **Settings** - Platform settings
21. **Withdrawal Config** - Withdrawal configuration

**Total:** 21 major features with 50+ sub-features

---

## Technology Stack

### **Mobile App Stack (Match RaverPay Mobile)**

```json
{
  "framework": "React Native + Expo",
  "routing": "expo-router",
  "state": "Zustand",
  "api": "Axios + React Query",
  "ui": "React Native + Custom Components",
  "forms": "React Hook Form + Zod",
  "charts": "Victory Native (React Native charts)",
  "auth": "Expo Secure Store",
  "notifications": "Expo Notifications",
  "biometrics": "Expo Local Authentication",
  "monitoring": "Sentry",
  "storage": "Async Storage",
  "platform": "iOS only"
}
```

### **Key Dependencies**

```json
{
  "dependencies": {
    "expo": "~54.0.23",
    "expo-router": "~6.0.14",
    "react-native": "0.79.0",
    "@tanstack/react-query": "^5.90.7",
    "axios": "^1.13.2",
    "zustand": "^5.0.8",
    "react-hook-form": "^7.66.1",
    "zod": "^4.1.12",
    "@sentry/react-native": "^7.8.0",
    "expo-secure-store": "~15.0.7",
    "expo-local-authentication": "~17.0.7",
    "expo-notifications": "~0.32.13",
    "victory-native": "^37.0.2",
    "date-fns": "^4.1.0",
    "@shopify/flash-list": "2.0.2",
    "expo-image": "~3.0.10",
    "expo-blur": "~15.0.7",
    "expo-haptics": "~15.0.7"
  }
}
```

---

## App Architecture

### **Project Structure**

```
apps/
├── raverpay-admin-mobile/          (NEW - iOS Admin App)
│   ├── app/                        (Expo Router pages)
│   │   ├── (auth)/                 (Auth screens)
│   │   │   ├── login.tsx
│   │   │   └── _layout.tsx
│   │   ├── (tabs)/                 (Main app tabs)
│   │   │   ├── dashboard.tsx
│   │   │   ├── users.tsx
│   │   │   ├── transactions.tsx
│   │   │   ├── support.tsx
│   │   │   └── more.tsx
│   │   ├── users/
│   │   │   ├── [userId].tsx
│   │   │   └── index.tsx
│   │   ├── transactions/
│   │   │   ├── [transactionId].tsx
│   │   │   └── index.tsx
│   │   ├── wallets/
│   │   ├── vtu/
│   │   ├── crypto/
│   │   ├── circle-wallets/
│   │   ├── support/
│   │   ├── analytics/
│   │   ├── kyc/
│   │   ├── notifications/
│   │   ├── audit-logs/
│   │   ├── settings/
│   │   └── _layout.tsx
│   ├── components/                 (Reusable components)
│   │   ├── ui/                     (Base UI components)
│   │   ├── dashboard/              (Dashboard components)
│   │   ├── users/                  (User components)
│   │   ├── transactions/           (Transaction components)
│   │   └── charts/                 (Chart components)
│   ├── lib/                        (Utilities)
│   │   ├── api/                    (API clients - REUSE from web)
│   │   ├── hooks/                  (Custom hooks)
│   │   ├── stores/                 (Zustand stores)
│   │   └── utils/                  (Helper functions)
│   ├── constants/                  (App constants)
│   ├── assets/                     (Images, fonts)
│   ├── app.json                    (Expo config)
│   └── package.json
```

---

## Feature Mapping

### **Web Dashboard → Mobile App Mapping**

| Web Feature | Mobile Implementation | Complexity |
|-------------|----------------------|------------|
| **Dashboard** | Tab 1: Dashboard | Medium |
| - Overview stats | ScrollView with stat cards | Low |
| - Quick actions | Grid of action buttons | Low |
| - Charts | Victory Native charts | Medium |
| **Users** | Tab 2: Users + Detail screens | High |
| - User list | FlashList with search/filter | Medium |
| - User detail | Scrollable detail screen | Medium |
| - Status updates | Bottom sheet modals | Medium |
| - KYC management | Dedicated KYC screens | High |
| **Transactions** | Tab 3: Transactions + Details | High |
| - Transaction list | FlashList with filters | Medium |
| - Transaction detail | Scrollable detail screen | Medium |
| - Search/filter | Filter modal | Medium |
| **Support** | Tab 4: Support + Tickets | High |
| - Ticket list | FlashList | Medium |
| - Ticket detail | Chat-like interface | High |
| - Canned responses | Bottom sheet picker | Medium |
| - Ticket assignment | User picker modal | Medium |
| **More** | Tab 5: More (all other features) | Medium |
| - Wallets | List → Detail screens | Medium |
| - VTU | List → Detail screens | Medium |
| - Crypto | List → Detail screens | Medium |
| - Circle Wallets | List → Detail screens | High |
| - Analytics | Charts + stats screens | High |
| - Notifications | List → Send screen | Medium |
| - Audit Logs | List with filters | Medium |
| - Settings | Form screens | Medium |
| - Admin Management | List → Detail screens | Medium |

---

## Detailed Feature Implementation

### **1. Dashboard (Tab 1)**

**Screens:**
- `app/(tabs)/dashboard.tsx`

**Components:**
- `StatCard` - Reusable stat display
- `QuickActionButton` - Action button grid
- `MiniChart` - Small chart component
- `PendingItemCard` - Pending items display

**Features:**
- ✅ Total users, balance, transactions, revenue
- ✅ VTPass balance
- ✅ Pending KYC, failed transactions, deletion requests
- ✅ Notification queue stats
- ✅ Quick action buttons
- ✅ Pull-to-refresh
- ✅ Real-time updates (React Query refetch)

**API Endpoints:**
- `GET /admin/analytics/dashboard`
- `GET /admin/vtu/balance`
- `GET /admin/notifications/queue-stats`

---

### **2. Users Management (Tab 2)**

**Screens:**
- `app/(tabs)/users.tsx` - User list
- `app/users/[userId].tsx` - User detail
- `app/users/kyc/[userId].tsx` - KYC verification

**Components:**
- `UserListItem` - User row component
- `UserDetailCard` - User info card
- `KYCDocumentViewer` - Document viewer
- `StatusUpdateModal` - Status change modal
- `RoleUpdateModal` - Role change modal

**Features:**
- ✅ User list with search
- ✅ Filter by status, role, KYC tier
- ✅ User detail view
- ✅ Update user status (activate, suspend, ban)
- ✅ Update user role
- ✅ Update KYC tier
- ✅ Lock/unlock account
- ✅ View user audit logs
- ✅ View user devices
- ✅ View user transactions
- ✅ View user wallets

**API Endpoints:**
- `GET /admin/users`
- `GET /admin/users/:userId`
- `PATCH /admin/users/:userId/status`
- `PATCH /admin/users/:userId/role`
- `PATCH /admin/users/:userId/kyc-tier`
- `PATCH /admin/users/:userId/lock-account`
- `PATCH /admin/users/:userId/unlock-account`
- `GET /admin/users/:userId/audit-logs`

---

### **3. Transactions (Tab 3)**

**Screens:**
- `app/(tabs)/transactions.tsx` - Transaction list
- `app/transactions/[transactionId].tsx` - Transaction detail

**Components:**
- `TransactionListItem` - Transaction row
- `TransactionDetailCard` - Transaction info
- `TransactionFilterModal` - Filter modal
- `TransactionStatusBadge` - Status badge

**Features:**
- ✅ Transaction list with pagination
- ✅ Filter by type, status, date range
- ✅ Search by reference, user
- ✅ Transaction detail view
- ✅ View related transactions
- ✅ Export transaction data

**API Endpoints:**
- `GET /admin/transactions`
- `GET /admin/transactions/:transactionId`

---

### **4. Support (Tab 4)**

**Screens:**
- `app/(tabs)/support.tsx` - Ticket list
- `app/support/[ticketId].tsx` - Ticket detail
- `app/support/canned-responses.tsx` - Canned responses

**Components:**
- `TicketListItem` - Ticket row
- `TicketDetailCard` - Ticket info
- `MessageBubble` - Chat message
- `CannedResponsePicker` - Response picker
- `TicketAssignmentModal` - Assignment modal

**Features:**
- ✅ Ticket list with filters
- ✅ Filter by status, priority, category
- ✅ Ticket detail with messages
- ✅ Reply to tickets
- ✅ Use canned responses
- ✅ Assign tickets
- ✅ Update ticket status
- ✅ Upload attachments
- ✅ View ticket history

**API Endpoints:**
- `GET /admin/support/tickets`
- `GET /admin/support/tickets/:ticketId`
- `POST /admin/support/tickets/:ticketId/reply`
- `PATCH /admin/support/tickets/:ticketId/assign`
- `PATCH /admin/support/tickets/:ticketId/status`
- `GET /admin/support/canned-responses`

---

### **5. More (Tab 5)**

**Screens:**
- `app/(tabs)/more.tsx` - Menu list
- `app/wallets/index.tsx` - Wallet list
- `app/wallets/[walletId].tsx` - Wallet detail
- `app/vtu/index.tsx` - VTU orders
- `app/crypto/index.tsx` - Crypto orders
- `app/circle-wallets/index.tsx` - Circle wallets
- `app/analytics/index.tsx` - Analytics
- `app/notifications/index.tsx` - Notifications
- `app/audit-logs/index.tsx` - Audit logs
- `app/kyc/index.tsx` - KYC requests
- `app/deletions/index.tsx` - Deletion requests
- `app/settings/index.tsx` - Settings
- `app/admins/index.tsx` - Admin management

**Components:**
- `MenuListItem` - Menu row
- `SettingsSection` - Settings group
- `ChartCard` - Chart container
- `FilterSheet` - Filter bottom sheet

**Features:**
- ✅ All remaining admin features
- ✅ Organized in categories
- ✅ Quick access to common features
- ✅ Settings and configuration

---

## UI/UX Design Principles

### **Mobile-First Design**

1. **Bottom Tab Navigation**
   - Dashboard
   - Users
   - Transactions
   - Support
   - More

2. **Touch-Optimized**
   - Minimum touch target: 44x44 points
   - Swipe gestures for actions
   - Pull-to-refresh
   - Long-press for quick actions

3. **Responsive Layouts**
   - Adapt to different iPhone sizes
   - Support landscape orientation
   - Safe area insets

4. **Native Patterns**
   - iOS-style navigation
   - Native modals and sheets
   - Native alerts and action sheets
   - Haptic feedback

5. **Performance**
   - FlashList for long lists
   - Image optimization
   - Lazy loading
   - Optimistic updates

---

## Component Library

### **Base UI Components**

```typescript
// components/ui/

- Button.tsx              // Primary, secondary, destructive
- Card.tsx                // Container card
- Badge.tsx               // Status badges
- Input.tsx               // Text input
- Select.tsx              // Picker/select
- Switch.tsx              // Toggle switch
- Checkbox.tsx            // Checkbox
- Radio.tsx               // Radio button
- Modal.tsx               // Full-screen modal
- BottomSheet.tsx         // Bottom sheet modal
- ActionSheet.tsx         // Action sheet
- Alert.tsx               // Alert dialog
- Toast.tsx               // Toast notification
- Skeleton.tsx            // Loading skeleton
- EmptyState.tsx          // Empty state
- ErrorState.tsx          // Error state
- LoadingSpinner.tsx      // Loading indicator
- Avatar.tsx              // User avatar
- Divider.tsx             // Separator
- SearchBar.tsx           // Search input
- FilterButton.tsx        // Filter trigger
- RefreshControl.tsx      // Pull-to-refresh
```

### **Domain Components**

```typescript
// components/dashboard/
- StatCard.tsx
- QuickActionButton.tsx
- MiniChart.tsx
- PendingItemCard.tsx

// components/users/
- UserListItem.tsx
- UserDetailCard.tsx
- UserStatusBadge.tsx
- KYCBadge.tsx

// components/transactions/
- TransactionListItem.tsx
- TransactionDetailCard.tsx
- TransactionStatusBadge.tsx
- TransactionTypeIcon.tsx

// components/support/
- TicketListItem.tsx
- MessageBubble.tsx
- CannedResponsePicker.tsx
- TicketStatusBadge.tsx

// components/charts/
- LineChart.tsx
- BarChart.tsx
- PieChart.tsx
- AreaChart.tsx
```

---

## API Integration

### **Reuse Existing API Clients**

All API clients from `/apps/raverpay-admin/lib/api/` will be reused with minimal modifications:

```typescript
// lib/api/client.ts (adapted for React Native)

import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = 'https://api.raverpay.com';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// Request interceptor - add auth token
apiClient.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle token expiration
      await SecureStore.deleteItemAsync('admin_token');
      // Navigate to login
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

### **API Modules (Reuse from Web)**

```typescript
// lib/api/

- admins.ts               ✅ Reuse
- analytics.ts            ✅ Reuse
- audit-logs.ts           ✅ Reuse
- auth.ts                 ✅ Reuse (adapt storage)
- cashback.ts             ✅ Reuse
- circle.ts               ✅ Reuse
- crypto.ts               ✅ Reuse
- deletions.ts            ✅ Reuse
- fees.ts                 ✅ Reuse
- giftcards.ts            ✅ Reuse
- help.ts                 ✅ Reuse
- kyc.ts                  ✅ Reuse
- notifications.ts        ✅ Reuse
- support.ts              ✅ Reuse
- transactions.ts         ✅ Reuse
- users.ts                ✅ Reuse
- venly-wallets.ts        ✅ Reuse
- virtual-accounts.ts     ✅ Reuse
- vtu.ts                  ✅ Reuse
- wallets.ts              ✅ Reuse
- withdrawal.ts           ✅ Reuse
```

---

## State Management

### **Zustand Stores**

```typescript
// lib/stores/

// Auth store
interface AuthStore {
  user: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

// App store
interface AppStore {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  biometricsEnabled: boolean;
  setBiometricsEnabled: (enabled: boolean) => void;
}

// Filter stores (per feature)
interface UserFilterStore {
  status: string[];
  role: string[];
  kycTier: string[];
  search: string;
  setFilters: (filters: Partial<UserFilters>) => void;
  clearFilters: () => void;
}
```

---

## Security Considerations

### **1. Authentication**

- ✅ Admin-only login (separate from user app)
- ✅ JWT token storage in Expo Secure Store
- ✅ Biometric authentication (Face ID/Touch ID)
- ✅ Auto-logout on inactivity
- ✅ Token refresh mechanism

### **2. Authorization**

- ✅ Role-based access control (ADMIN, SUPER_ADMIN)
- ✅ Permission checks before API calls
- ✅ UI elements hidden based on permissions

### **3. Data Security**

- ✅ HTTPS only
- ✅ Certificate pinning
- ✅ No sensitive data in logs
- ✅ Secure token storage
- ✅ Data encryption at rest

### **4. App Security**

- ✅ Jailbreak detection
- ✅ Screenshot prevention for sensitive screens
- ✅ Obfuscation
- ✅ Code signing
- ✅ TestFlight-only distribution (not public App Store)

---

## Implementation Phases

### **Phase 1: Project Setup (Week 1)**

**Tasks:**
1. Create new Expo project `raverpay-admin-mobile`
2. Configure app.json with iOS bundle ID `com.raverpay.admin`
3. Set up project structure
4. Install dependencies
5. Configure TypeScript
6. Set up Sentry
7. Configure expo-router
8. Set up environment variables

**Deliverables:**
- ✅ Project initialized
- ✅ Dependencies installed
- ✅ Project structure created
- ✅ Basic navigation working

---

### **Phase 2: Authentication & Base UI (Week 2)**

**Tasks:**
1. Create login screen
2. Implement authentication flow
3. Set up Zustand stores
4. Create base UI components (Button, Card, Input, etc.)
5. Implement biometric authentication
6. Create app layout with bottom tabs
7. Implement theme support

**Deliverables:**
- ✅ Login working
- ✅ Biometric auth working
- ✅ Base UI components ready
- ✅ Bottom tab navigation working

---

### **Phase 3: Dashboard & Users (Week 3-4)**

**Tasks:**
1. Implement dashboard screen
2. Create stat cards
3. Implement quick actions
4. Create user list screen
5. Implement user search/filter
6. Create user detail screen
7. Implement user management actions
8. Create KYC verification screens

**Deliverables:**
- ✅ Dashboard fully functional
- ✅ User management complete
- ✅ KYC verification working

---

### **Phase 4: Transactions & Support (Week 5-6)**

**Tasks:**
1. Create transaction list screen
2. Implement transaction filters
3. Create transaction detail screen
4. Create support ticket list
5. Implement ticket detail/chat interface
6. Implement canned responses
7. Implement ticket assignment
8. Implement ticket status updates

**Deliverables:**
- ✅ Transaction management complete
- ✅ Support ticket system complete

---

### **Phase 5: Wallets & VTU (Week 7)**

**Tasks:**
1. Create wallet list screen
2. Create wallet detail screen
3. Create VTU orders screen
4. Create virtual accounts screen
5. Implement wallet actions

**Deliverables:**
- ✅ Wallet management complete
- ✅ VTU management complete

---

### **Phase 6: Crypto & Circle (Week 8)**

**Tasks:**
1. Create crypto orders screen
2. Create crypto conversions screen
3. Create Circle wallet list
4. Create Circle wallet detail
5. Implement Circle wallet actions

**Deliverables:**
- ✅ Crypto management complete
- ✅ Circle wallet management complete

---

### **Phase 7: Analytics & Notifications (Week 9)**

**Tasks:**
1. Create analytics screen with charts
2. Implement Victory Native charts
3. Create notifications screen
4. Implement notification sending
5. Create notification templates

**Deliverables:**
- ✅ Analytics complete
- ✅ Notification system complete

---

### **Phase 8: Admin Features (Week 10)**

**Tasks:**
1. Create audit logs screen
2. Create KYC requests screen
3. Create deletion requests screen
4. Create rate limits screen
5. Create admin management screen
6. Create settings screen
7. Create withdrawal config screen

**Deliverables:**
- ✅ All admin features complete

---

### **Phase 9: Testing & Polish (Week 11)**

**Tasks:**
1. Write unit tests
2. Write integration tests
3. Perform manual testing
4. Fix bugs
5. Optimize performance
6. Add loading states
7. Add error handling
8. Add empty states

**Deliverables:**
- ✅ All tests passing
- ✅ Bugs fixed
- ✅ Performance optimized

---

### **Phase 10: Deployment (Week 12)**

**Tasks:**
1. Configure EAS Build
2. Create iOS build
3. Set up TestFlight
4. Create internal testing group
5. Deploy to TestFlight
6. Gather feedback
7. Iterate

**Deliverables:**
- ✅ App deployed to TestFlight
- ✅ Internal testing complete

---

## Testing Strategy

### **Unit Tests**

```typescript
// __tests__/components/StatCard.test.tsx
// __tests__/lib/api/users.test.ts
// __tests__/lib/stores/auth.test.ts
```

### **Integration Tests**

```typescript
// __tests__/screens/Dashboard.test.tsx
// __tests__/screens/UserDetail.test.tsx
```

### **E2E Tests**

```typescript
// e2e/login.test.ts
// e2e/user-management.test.ts
// e2e/transaction-view.test.ts
```

---

## Deployment Strategy

### **Build Configuration**

```json
// app.json
{
  "expo": {
    "name": "RaverPay Admin",
    "slug": "raverpay-admin-mobile",
    "version": "1.0.0",
    "ios": {
      "bundleIdentifier": "com.raverpay.admin",
      "buildNumber": "1",
      "supportsTablet": true,
      "infoPlist": {
        "NSFaceIDUsageDescription": "Use Face ID to securely access admin dashboard"
      }
    },
    "plugins": [
      "@sentry/react-native/expo",
      "expo-secure-store",
      "expo-local-authentication"
    ]
  }
}
```

### **EAS Build**

```json
// eas.json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": false
      }
    },
    "production": {
      "distribution": "internal",
      "ios": {
        "simulator": false
      }
    }
  }
}
```

### **Distribution**

- ✅ **Internal Only** - Not published to public App Store
- ✅ **TestFlight** - For internal testing
- ✅ **Ad Hoc** - For specific devices
- ✅ **Enterprise** - If company has enterprise account

---

## Performance Optimization

### **1. List Performance**

- Use `FlashList` instead of `FlatList`
- Implement pagination
- Use `getItemType` for heterogeneous lists
- Memoize list items

### **2. Image Optimization**

- Use `expo-image` for caching
- Lazy load images
- Use appropriate image sizes
- Compress images

### **3. API Optimization**

- Use React Query caching
- Implement optimistic updates
- Debounce search inputs
- Use pagination

### **4. Bundle Size**

- Code splitting
- Remove unused dependencies
- Use Hermes engine
- Enable ProGuard (iOS)

---

## Monitoring & Analytics

### **Sentry Integration**

```typescript
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'YOUR_SENTRY_DSN',
  environment: __DEV__ ? 'development' : 'production',
  tracesSampleRate: 1.0,
});
```

### **Metrics to Track**

- App crashes
- API errors
- Screen load times
- User actions
- Authentication failures
- Network errors

---

## Future Enhancements

### **Phase 2 Features (Post-Launch)**

1. **Push Notifications**
   - New support tickets
   - Failed transactions
   - KYC submissions
   - System alerts

2. **Offline Support**
   - View cached data offline
   - Queue actions for later

3. **Advanced Analytics**
   - Custom date ranges
   - Export reports
   - More chart types

4. **Bulk Actions**
   - Bulk user updates
   - Bulk transaction exports

5. **iPad Optimization**
   - Split-view layouts
   - Keyboard shortcuts

---

## Summary

### **Project Scope**

- **New App:** `raverpay-admin-mobile` (iOS only)
- **Bundle ID:** `com.raverpay.admin`
- **Features:** 21 major features, 50+ sub-features
- **Timeline:** 12 weeks
- **Team:** 2-3 developers

### **Technology Stack**

- React Native + Expo
- expo-router for navigation
- Zustand for state
- React Query for API
- Victory Native for charts
- Expo Secure Store for auth

### **Key Benefits**

✅ **On-the-go management** - Manage platform from anywhere  
✅ **100% feature parity** - All web features available  
✅ **Native performance** - Fast and responsive  
✅ **Secure** - Biometric auth, secure storage  
✅ **Reusable code** - Share API clients with web  

---

**Document Version:** 1.0  
**Last Updated:** January 7, 2026  
**Status:** Ready for Implementation

---

## Next Steps

1. ✅ Review and approve this plan
2. ✅ Set up development environment
3. ✅ Create new Expo project
4. ✅ Start Phase 1: Project Setup
5. ✅ Begin implementation following the 12-week timeline

Let's build the RaverPay Admin Mobile App! 🚀📱
