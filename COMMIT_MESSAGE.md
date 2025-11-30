fix(virtual-accounts): fix DVA creation failures and add admin manual creation

## Problem
Users were experiencing failures when creating dedicated virtual accounts (DVA):
- "Customer phone number is required" error from Paystack
- Phone numbers not formatted correctly for Paystack API
- No retry mechanism for transient failures
- No way for admins to manually create DVAs for failed cases
- Users not notified when DVA creation fails or succeeds

## Solution

### API Backend (apps/mularpay-api)
- **Phone Number Formatting**: Added automatic formatting to international format (2348012345678) before Paystack API calls
- **Customer Update**: Added `updateCustomer()` method to update existing Paystack customers with phone numbers
- **Retry Mechanism**: Implemented 2 retry attempts with exponential backoff (1s, 2s delays) for transient errors
- **Status Tracking**: Added database fields (`creationStatus`, `retryCount`, `lastRetryAt`, `failureReason`) to track DVA creation status
- **Error Handling**: 
  - Gracefully handle "Customer already validated" error
  - Fixed BVN decryption error in logging
  - Better error messages distinguishing retryable vs non-retryable errors
- **Admin Endpoints**: 
  - `GET /admin/virtual-accounts/failed` - List users with failed DVA creation
  - `POST /admin/virtual-accounts/:userId/create` - Manually create DVA
  - `GET /admin/virtual-accounts/:userId/status` - Get creation status
- **Notifications**: 
  - `virtual_account_created` event sent on successful creation
  - `virtual_account_creation_failed` event sent on failure (non-retryable)

### Database
- Migration: Added `creationStatus`, `retryCount`, `lastRetryAt`, `failureReason` fields to `virtual_accounts` table
- Index: Added index on `creationStatus` for faster queries

### Admin Dashboard (apps/mularpay-admin)
- **Failed DVA Creations Page**: New page at `/dashboard/virtual-accounts/failed` showing users with customer code + BVN but no active DVA
- **Manual DVA Creation**: Dialog component to manually create DVAs with preferred bank selection
- **API Client**: Added methods for fetching failed creations and creating DVAs manually
- **UI Enhancements**: Added "Failed Creations" button on main virtual accounts page

### TypeScript Fixes
- Fixed `MessageMetadata` interface to include `emailSent` property
- Fixed `PaginatedResponse` property access in emails page

## Files Changed

### API
- `src/payments/paystack.service.ts` - Phone formatting, updateCustomer method
- `src/virtual-accounts/virtual-accounts.service.ts` - Retry logic, notifications, status tracking
- `src/admin/virtual-accounts/admin-virtual-accounts.service.ts` - Manual creation, failed creations list
- `src/admin/virtual-accounts/admin-virtual-accounts.controller.ts` - New endpoints
- `src/utils/bvn-encryption.service.ts` - Fixed logging error
- `src/virtual-accounts/virtual-accounts.module.ts` - Added NotificationsModule
- `src/admin/admin.module.ts` - Added PaymentsModule
- `prisma/schema.prisma` - Added status tracking fields
- `prisma/migrations/add_dva_status_tracking.sql` - Migration file

### Admin Dashboard
- `app/dashboard/virtual-accounts/failed/page.tsx` - New failed creations page
- `app/dashboard/virtual-accounts/page.tsx` - Added link to failed page
- `lib/api/virtual-accounts.ts` - Added new API methods
- `types/support.ts` - Fixed MessageMetadata interface
- `app/dashboard/support/emails/page.tsx` - Fixed pagination property

## Testing
- Database migration applied successfully
- Prisma client regenerated
- All TypeScript errors resolved
- Code compiles without errors

## Impact
- Users will no longer see "phone number required" errors
- Failed DVA creations can be manually resolved by admins
- Users receive notifications when DVA is created
- Better error handling and retry logic improves success rate

