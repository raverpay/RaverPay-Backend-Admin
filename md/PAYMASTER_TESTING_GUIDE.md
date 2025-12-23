# Circle Paymaster v0.8 Testing Guide

## Overview

This guide provides step-by-step instructions for testing the Circle Paymaster v0.8 integration across the backend API, admin dashboard, and mobile app.

---

## Prerequisites

### Backend Setup
1. Database migration applied (Paymaster tables created)
2. Environment variables configured:
   - `BUNDLER_RPC_URL_ETH_SEPOLIA` - Bundler RPC for Sepolia testnet
   - `BUNDLER_RPC_URL_ARB_SEPOLIA` - Bundler RPC for Arbitrum Sepolia
   - `BUNDLER_RPC_URL_BASE_SEPOLIA` - Bundler RPC for Base Sepolia
   - `BUNDLER_RPC_URL_OP_SEPOLIA` - Bundler RPC for Optimism Sepolia
   - `BUNDLER_RPC_URL_MATIC_AMOY` - Bundler RPC for Polygon Amoy
3. Backend API running on `http://localhost:3001`

### Test Wallet Requirements
- At least one SCA (Smart Contract Account) wallet created via Circle
- USDC balance in the wallet (testnet USDC)
- Wallet must be on a supported testnet (Sepolia, Arbitrum Sepolia, Base Sepolia, etc.)

---

## Part 1: Backend API Testing

### 1.1 Check Paymaster Compatibility

**Endpoint**: `GET /circle/paymaster/compatible/:walletId`

**Test Steps**:
1. Get a wallet ID from your database (must be SCA type)
2. Make GET request:
   ```bash
   curl http://localhost:3001/api/circle/paymaster/compatible/YOUR_WALLET_ID \
     -H "Authorization: Bearer YOUR_JWT_TOKEN"
   ```

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "isPaymasterCompatible": true,
    "walletType": "SCA",
    "blockchain": "ETH-SEPOLIA"
  }
}
```

**Pass Criteria**:
- ✅ Returns `isPaymasterCompatible: true` for SCA wallets
- ✅ Returns `isPaymasterCompatible: false` for EOA wallets

---

### 1.2 Generate Permit Data

**Endpoint**: `POST /circle/paymaster/generate-permit`

**Test Steps**:
1. Make POST request with wallet details:
   ```bash
   curl -X POST http://localhost:3001/api/circle/paymaster/generate-permit \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "walletId": "YOUR_WALLET_ID",
       "amount": "10000000",
       "blockchain": "ETH-SEPOLIA"
     }'
   ```

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "typedData": {
      "types": { ... },
      "primaryType": "Permit",
      "domain": { ... },
      "message": { ... }
    },
    "permitAmount": "20000000",
    "paymasterAddress": "0x3BA9A96eE3eFf3A69E2B18886AcF52027EFF8966",
    "usdcAddress": "0x..."
  }
}
```

**Pass Criteria**:
- ✅ Returns valid EIP-2612 typed data
- ✅ `permitAmount` includes buffer (10 USDC extra)
- ✅ Correct Paymaster address for testnet
- ✅ Correct USDC token address for blockchain

---

### 1.3 Submit UserOperation

**Endpoint**: `POST /circle/paymaster/submit-userop`

**Test Steps**:
1. Get permit signature (in production, this would come from mobile app)
2. Submit UserOperation:
   ```bash
   curl -X POST http://localhost:3001/api/circle/paymaster/submit-userop \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "walletId": "YOUR_WALLET_ID",
       "destinationAddress": "0xRecipientAddress",
       "amount": "10000000",
       "blockchain": "ETH-SEPOLIA",
       "permitSignature": "0x...",
       "feeLevel": "MEDIUM"
     }'
   ```

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "userOpHash": "0x...",
    "status": "PENDING",
    "estimatedGasUsdc": "3.500000",
    "paymasterAddress": "0x3BA9A96eE3eFf3A69E2B18886AcF52027EFF8966"
  }
}
```

**Pass Criteria**:
- ✅ Returns valid `userOpHash`
- ✅ Status is `PENDING`
- ✅ `estimatedGasUsdc` is reasonable (1-10 USDC)
- ✅ Record created in `paymaster_user_operations` table

---

### 1.4 Check UserOperation Status

**Endpoint**: `GET /circle/paymaster/userop/:hash`

**Test Steps**:
1. Use `userOpHash` from previous step
2. Poll for status:
   ```bash
   curl http://localhost:3001/api/circle/paymaster/userop/0xYOUR_USEROP_HASH \
     -H "Authorization: Bearer YOUR_JWT_TOKEN"
   ```

**Expected Response (Pending)**:
```json
{
  "success": true,
  "data": {
    "userOpHash": "0x...",
    "status": "PENDING",
    "sender": "0x...",
    "blockchain": "ETH-SEPOLIA",
    "estimatedGasUsdc": "3.500000",
    "actualGasUsdc": null,
    "transactionHash": null
  }
}
```

**Expected Response (Confirmed)**:
```json
{
  "success": true,
  "data": {
    "userOpHash": "0x...",
    "status": "CONFIRMED",
    "sender": "0x...",
    "blockchain": "ETH-SEPOLIA",
    "estimatedGasUsdc": "3.500000",
    "actualGasUsdc": "2.850000",
    "transactionHash": "0x..."
  }
}
```

**Pass Criteria**:
- ✅ Status updates from `PENDING` to `CONFIRMED`
- ✅ `transactionHash` populated when confirmed
- ✅ `actualGasUsdc` populated when confirmed
- ✅ `actualGasUsdc` is less than or equal to `estimatedGasUsdc`

---

### 1.5 Get Paymaster Statistics

**Endpoint**: `GET /circle/paymaster/stats`

**Test Steps**:
```bash
curl http://localhost:3001/api/circle/paymaster/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "totalUserOps": 5,
    "confirmedUserOps": 3,
    "pendingUserOps": 2,
    "totalGasSpentUsdc": "8.450000",
    "averageGasPerTxUsdc": "2.816667"
  }
}
```

**Pass Criteria**:
- ✅ Counts are accurate
- ✅ Math is correct (totalUserOps = confirmedUserOps + pendingUserOps)
- ✅ Gas amounts are reasonable

---

## Part 2: Admin Dashboard Testing

### 2.1 Paymaster Events Page

**URL**: `http://localhost:3000/dashboard/circle-wallets/paymaster-events`

**Test Steps**:
1. Log in to admin dashboard
2. Navigate to Circle Wallets → Paymaster Events
3. Verify table displays:
   - UserOp Hash
   - Sender address
   - Blockchain
   - Status badge (Pending/Confirmed/Failed)
   - Estimated Gas (USDC)
   - Actual Gas (USDC)
   - Difference (green if saved, red if overpaid)
   - Transaction Hash (clickable link)
   - Created timestamp

**Test Actions**:
- ✅ Search by UserOp hash
- ✅ Search by sender address
- ✅ Filter by status (All/Pending/Confirmed/Failed)
- ✅ Click "Export CSV" button
- ✅ Click "Refresh" button
- ✅ Click UserOp hash to view details
- ✅ Click transaction hash to open block explorer

**Pass Criteria**:
- ✅ All UserOperations display correctly
- ✅ Search filters work
- ✅ CSV export downloads with correct data
- ✅ Auto-refresh works (check network tab)
- ✅ Links open correctly

---

### 2.2 Paymaster Analytics Page

**URL**: `http://localhost:3000/dashboard/circle-wallets/paymaster-analytics`

**Test Steps**:
1. Navigate to Circle Wallets → Paymaster Analytics
2. Verify stat cards display:
   - Total UserOperations (with confirmed/pending breakdown)
   - Total Gas Spent (in USDC)
   - Average Gas Per TX (in USDC)
   - Success Rate (percentage)

**Pass Criteria**:
- ✅ All stat cards load
- ✅ Numbers match API response
- ✅ Success rate calculation is correct
- ✅ Loading states work
- ✅ Error states handled gracefully

---

## Part 3: Mobile App Testing

### 3.1 Paymaster Toggle Visibility

**Screen**: Send USDC screen

**Test Steps**:
1. Open mobile app
2. Navigate to Circle Wallet
3. Select a wallet
4. Tap "Send"
5. Check if "Pay Gas in USDC" toggle appears

**Pass Criteria**:
- ✅ Toggle appears ONLY for SCA wallets
- ✅ Toggle does NOT appear for EOA wallets
- ✅ Toggle is OFF by default

---

### 3.2 USDC Gas Fee Display

**Test Steps**:
1. On Send screen with SCA wallet
2. Enter destination address
3. Enter amount
4. Toggle "Pay Gas in USDC" ON
5. Observe gas fee display

**Pass Criteria**:
- ✅ Gas fee shows in USDC (e.g., "$3.50 USDC")
- ✅ Gas fee updates when amount changes
- ✅ Summary section shows "Network Fee (USDC)"
- ✅ Total includes USDC gas fee

---

### 3.3 Send Transaction with Paymaster

**Test Steps**:
1. Complete form with valid data
2. Toggle Paymaster ON
3. Tap "Review & Send"
4. Review transaction details
5. Tap "Confirm"
6. Enter PIN
7. Wait for transaction

**Expected Flow**:
1. Permit data generated
2. UserOperation submitted
3. Redirected to Paymaster Status screen
4. Status shows "Pending"
5. Auto-refreshes every 3 seconds
6. Status updates to "Confirmed"
7. Shows actual gas fee in USDC
8. Shows savings if any

**Pass Criteria**:
- ✅ Transaction submits successfully
- ✅ Redirects to correct status screen
- ✅ Status updates automatically
- ✅ Actual gas fee displays when confirmed
- ✅ Savings calculation is correct
- ✅ "Back to Wallet" button works

---

### 3.4 Paymaster Status Screen

**Screen**: `/circle/paymaster-status?userOpHash=0x...`

**Test Steps**:
1. After submitting Paymaster transaction
2. Verify status screen shows:
   - Status icon and color
   - Status title and description
   - Progress bar
   - UserOp Hash
   - From Address
   - Blockchain
   - Transaction Hash (when confirmed)
   - Estimated Gas Fee (USDC)
   - Actual Gas Fee (USDC, when confirmed)
   - Savings amount (if applicable)

**Pass Criteria**:
- ✅ All fields display correctly
- ✅ Auto-refresh works (every 3 seconds)
- ✅ Progress bar animates
- ✅ Status transitions: Pending → Confirmed
- ✅ Actual gas fee appears when confirmed
- ✅ Info card explains Paymaster
- ✅ "Back to Wallet" button works

---

## Part 4: End-to-End Integration Test

### Complete Flow Test

**Scenario**: User sends 10 USDC using Paymaster to pay gas fees

**Steps**:
1. **Setup**:
   - Create SCA wallet on ETH-SEPOLIA
   - Fund with 20 USDC (testnet)
   - Note initial balance

2. **Mobile App**:
   - Open Send screen
   - Select SCA wallet
   - Enter recipient address
   - Enter amount: 10 USDC
   - Toggle "Pay Gas in USDC" ON
   - Note estimated gas fee (e.g., $3.50)
   - Submit transaction
   - Wait for confirmation

3. **Verify Backend**:
   - Check `paymaster_user_operations` table
   - Verify record exists with correct data
   - Check `paymaster_events` table (after confirmation)
   - Verify event recorded with actual gas cost

4. **Verify Admin Dashboard**:
   - Open Paymaster Events page
   - Find the transaction
   - Verify all details match
   - Check Analytics page
   - Verify stats updated

5. **Verify Final State**:
   - Check wallet balance
   - Should be: Initial - 10 USDC - Actual Gas Fee
   - Recipient should have 10 USDC
   - Transaction visible in wallet history

**Pass Criteria**:
- ✅ Transaction completes successfully
- ✅ Gas paid in USDC (not ETH)
- ✅ All systems show consistent data
- ✅ Balances are correct
- ✅ Events tracked properly

---

## Part 5: Error Handling Tests

### 5.1 Insufficient USDC Balance

**Test**: Try to send with insufficient USDC for amount + gas

**Expected**:
- ✅ Error message: "Insufficient USDC balance"
- ✅ Transaction blocked before submission

### 5.2 Invalid Permit Signature

**Test**: Submit with malformed permit signature

**Expected**:
- ✅ Backend rejects with 400 error
- ✅ Error message: "Invalid permit signature"

### 5.3 Bundler Failure

**Test**: Submit when bundler is unavailable

**Expected**:
- ✅ Error message: "Failed to submit UserOperation"
- ✅ Transaction not saved to database
- ✅ User can retry

### 5.4 EOA Wallet Attempt

**Test**: Try to use Paymaster with EOA wallet

**Expected**:
- ✅ Toggle not visible
- ✅ If forced via API: Error "Only SCA wallets support Paymaster"

---

## Part 6: Performance Tests

### 6.1 Gas Estimation Speed

**Test**: Measure time to generate permit data

**Pass Criteria**:
- ✅ Response time < 2 seconds
- ✅ No timeout errors

### 6.2 Status Polling

**Test**: Monitor auto-refresh behavior

**Pass Criteria**:
- ✅ Polls every 3 seconds
- ✅ Stops when status is CONFIRMED or FAILED
- ✅ No memory leaks

### 6.3 Event Listener

**Test**: Submit multiple transactions quickly

**Pass Criteria**:
- ✅ All events captured
- ✅ No duplicate event processing
- ✅ Events processed in order

---

## Troubleshooting

### Issue: "No bundler configured"
**Solution**: Add `BUNDLER_RPC_URL_*` environment variables

### Issue: "USDC not supported on this chain"
**Solution**: Verify blockchain is in supported list

### Issue: "Wallet not found"
**Solution**: Check wallet ID is correct and belongs to user

### Issue: Events not tracking
**Solution**: 
1. Check event listener started (see logs)
2. Verify Paymaster address is correct
3. Check blockchain RPC connection

---

## Success Metrics

### Backend
- ✅ All API endpoints return 200 OK
- ✅ Database records created correctly
- ✅ Event listeners running
- ✅ No TypeScript errors
- ✅ No linting errors

### Admin Dashboard
- ✅ All pages load without errors
- ✅ Data displays correctly
- ✅ Search and filters work
- ✅ Export functions work

### Mobile App
- ✅ Toggle appears for SCA wallets
- ✅ Gas fees display in USDC
- ✅ Transactions submit successfully
- ✅ Status updates automatically
- ✅ No crashes or freezes

---

## Next Steps After Testing

1. **If all tests pass**:
   - Deploy to staging environment
   - Run tests again on staging
   - Prepare for production deployment

2. **If tests fail**:
   - Document failures
   - Create bug tickets
   - Fix issues
   - Re-run tests

3. **Production Checklist**:
   - [ ] Switch to mainnet Paymaster addresses
   - [ ] Configure mainnet bundler RPCs
   - [ ] Set up monitoring and alerts
   - [ ] Enable error tracking (Sentry)
   - [ ] Document for support team
   - [ ] Create user guide
