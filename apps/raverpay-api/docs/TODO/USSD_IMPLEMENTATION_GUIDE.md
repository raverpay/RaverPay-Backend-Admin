# USSD Implementation Guide for RaverPay

## Overview

This document provides a complete guide for implementing USSD functionality in RaverPay, enabling users to access financial services via feature phones without internet connectivity.

**Target:** Nigerian market (MTN, Glo, Airtel, 9mobile)  
**Use Case:** Offline transactions for users without smartphones/internet  
**Expected Impact:** 30-40% market expansion (feature phone users)

---

## Table of Contents

1. [Why USSD for RaverPay](#why-ussd-for-raverpay)
2. [USSD Service Providers](#ussd-service-providers)
3. [Recommended Provider](#recommended-provider)
4. [Implementation Architecture](#implementation-architecture)
5. [Code Implementation](#code-implementation)
6. [Pricing Analysis](#pricing-analysis)
7. [Go-to-Market Strategy](#go-to-market-strategy)

---

## Why USSD for RaverPay

### Market Opportunity

| Metric | Value | Source |
|--------|-------|--------|
| Feature phone users in Nigeria | ~30-40% | NCC 2024 |
| USSD transactions monthly | 1.5+ billion | Industry data |
| Users without smartphones | 40+ million | Market research |
| Rural population with 2G only | ~25% | Network coverage data |

### Competitive Advantage

**Current Leaders Using USSD:**
- ✅ **OPay:** `*955#` - 35M+ users
- ✅ **PalmPay:** `*861#` - 20M+ users
- ✅ **Moniepoint:** `*5573#` - Market leader in rural areas
- ❌ **Kuda:** No USSD (limited to urban markets)

**Your Position:**
- Without USSD: Compete only with Kuda (urban, smartphone users)
- With USSD: Compete with OPay, PalmPay, Moniepoint (entire market)

---

## USSD Service Providers in Nigeria

### Option 1: Africa's Talking (RECOMMENDED)

**Why Recommended:**
- ✅ **Easiest integration** - RESTful API, excellent docs
- ✅ **Pan-African** - Works in 20+ countries
- ✅ **Sandbox for testing** - Free USSD codes for development
- ✅ **Proven track record** - Used by 10,000+ businesses
- ✅ **Good support** - Active developer community

**Coverage:**
- MTN Nigeria ✅
- Airtel Nigeria ✅
- 9mobile ✅
- Glo Nigeria ❌ (not yet supported)

**Pricing (2024):**
- **Setup:** ₦20,000/month per USSD code
- **Per session:** ₦3 per session (180 seconds)
- **Sandbox:** Free for testing

**API Endpoint:**
```
https://ussd.africastalking.com/ussd
```

**Website:** https://africastalking.com

---

### Option 2: Hubtel (Ghana-based, expanding to Nigeria)

**Pros:**
- ✅ **No setup fees** - Pay-as-you-go only
- ✅ **Transparent pricing** - 1.95% per transaction
- ✅ **Good for payments** - Optimized for financial transactions

**Cons:**
- ⚠️ **Limited Nigeria coverage** - Primarily Ghana-focused
- ⚠️ **Less documentation** - Smaller developer community

**Pricing:**
- **Setup:** Free
- **Transaction fee:** 1.95% of transaction value (capped at 1%)
- **USSD sessions:** Pay-as-you-go from messaging credit

**Website:** https://hubtel.com

---

### Option 3: Flutterwave USSD (Payment-focused)

**Pros:**
- ✅ **Already integrated?** - You might be using Flutterwave for payments
- ✅ **Payment-specific** - Optimized for collections
- ✅ **All Nigerian banks** - Wide coverage

**Cons:**
- ❌ **Payment only** - Not for general USSD menus (balance check, etc.)
- ❌ **Higher cost** - Transaction fees apply

**Use Case:** USSD payments only (not full banking menu)

**Pricing:**
- **Transaction fee:** 1.4% (local cards)

**Website:** https://flutterwave.com

---

### Option 4: Direct Telco Integration (Advanced)

**Providers:**
- **Interconnect Clearinghouse Nigeria (ICN)** - Licensed VAS aggregator
- **CoralPay (C'Gate)** - Used by 25+ banks
- **Upperlink Telecoms** - NCC-licensed
- **InfoTek** - Dedicated & shared USSD

**Pros:**
- ✅ **Full control** - Direct connection to telcos
- ✅ **Lower per-session cost** - Negotiate rates

**Cons:**
- ❌ **Complex setup** - Requires legal agreements with each telco
- ❌ **High upfront cost** - ₦500k - ₦2M setup
- ❌ **Long timeline** - 3-6 months to go live
- ❌ **Maintenance overhead** - Manage multiple telco relationships

**Recommendation:** Only consider after 100k+ monthly USSD users

---

## Recommended Provider: Africa's Talking

### Why Africa's Talking?

1. **Fast time-to-market:** Live in 2-4 weeks
2. **Developer-friendly:** RESTful API, webhooks, SDKs
3. **Sandbox testing:** Free USSD codes for development
4. **Scalable:** Handles millions of sessions
5. **Reliable:** 99.9% uptime SLA

### Getting Started

**Step 1: Sign Up**
```
https://account.africastalking.com/auth/register
```

**Step 2: Apply for USSD Code**
- Shared code: `*384*YOUR_EXTENSION#` (faster, cheaper)
- Dedicated code: `*YOUR_CODE#` (premium, ₦20k/month)

**Step 3: Set Up Webhook**
- Africa's Talking will POST to your endpoint when users dial the code

---

## Implementation Architecture

### High-Level Flow

```
User dials *384*1234#
    ↓
Telco (MTN/Airtel/9mobile)
    ↓
Africa's Talking Gateway
    ↓
POST to your webhook: https://api.raverpay.com/ussd
    ↓
Your NestJS Backend
    ↓
Response with menu/action
    ↓
Africa's Talking Gateway
    ↓
Display to user
```

### Session Management

**USSD is stateless** - Each request is independent

**Solution:** Store session state in Redis

```typescript
// Session key format
const sessionKey = `ussd:session:${phoneNumber}:${sessionId}`;

// Store session data
await redis.set(sessionKey, JSON.stringify({
  step: 'SEND_MONEY_AMOUNT',
  recipient: '08012345678',
  amount: null,
}), 'EX', 180); // 180 seconds = 3 minutes
```

---

## Code Implementation

### 1. NestJS USSD Controller

```typescript
// src/ussd/ussd.controller.ts
import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { UssdService } from './ussd.service';
import { UssdRequestDto } from './dto/ussd-request.dto';

@Controller('ussd')
export class UssdController {
  constructor(private readonly ussdService: UssdService) {}

  @Post()
  @HttpCode(200)
  async handleUssd(@Body() ussdRequest: UssdRequestDto): Promise<string> {
    const { sessionId, phoneNumber, text } = ussdRequest;
    
    // Process USSD request
    const response = await this.ussdService.processRequest(
      sessionId,
      phoneNumber,
      text
    );
    
    // Return response (Africa's Talking format)
    return response;
  }
}
```

---

### 2. USSD Request DTO

```typescript
// src/ussd/dto/ussd-request.dto.ts
import { IsString, IsNotEmpty } from 'class-validator';

export class UssdRequestDto {
  @IsString()
  @IsNotEmpty()
  sessionId: string; // Unique session ID from Africa's Talking

  @IsString()
  @IsNotEmpty()
  phoneNumber: string; // User's phone number (e.g., +2348012345678)

  @IsString()
  text: string; // User input (empty on first request)

  @IsString()
  serviceCode: string; // USSD code dialed (e.g., *384*1234#)
}
```

---

### 3. USSD Service (Main Logic)

```typescript
// src/ussd/ussd.service.ts
import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { UsersService } from '../users/users.service';
import { WalletService } from '../wallet/wallet.service';
import { TransactionsService } from '../transactions/transactions.service';
import { VtuService } from '../vtu/vtu.service';

interface UssdSession {
  step: string;
  data: Record<string, any>;
}

@Injectable()
export class UssdService {
  constructor(
    private readonly redis: RedisService,
    private readonly usersService: UsersService,
    private readonly walletService: WalletService,
    private readonly transactionsService: TransactionsService,
    private readonly vtuService: VtuService,
  ) {}

  async processRequest(
    sessionId: string,
    phoneNumber: string,
    text: string,
  ): Promise<string> {
    // Get or create session
    const session = await this.getSession(sessionId, phoneNumber);
    
    // Parse user input
    const inputs = text.split('*');
    const currentInput = inputs[inputs.length - 1];
    
    // Route to appropriate handler based on session step
    let response: string;
    
    if (text === '') {
      // First request - show main menu
      response = await this.showMainMenu(phoneNumber);
    } else {
      response = await this.handleUserInput(
        session,
        currentInput,
        phoneNumber,
      );
    }
    
    // Save session
    await this.saveSession(sessionId, phoneNumber, session);
    
    return response;
  }

  private async showMainMenu(phoneNumber: string): Promise<string> {
    // Check if user exists
    const user = await this.usersService.findByPhone(phoneNumber);
    
    if (!user) {
      return 'END Welcome to RaverPay!\nPlease download our app to create an account.\nDial *384*1234# after registration.';
    }
    
    // Show main menu
    return `CON Welcome ${user.firstName}!
1. Send Money
2. Buy Airtime
3. Check Balance
4. Pay Bills
5. Transaction History`;
  }

  private async handleUserInput(
    session: UssdSession,
    input: string,
    phoneNumber: string,
  ): Promise<string> {
    switch (session.step) {
      case 'MAIN_MENU':
        return this.handleMainMenuSelection(session, input, phoneNumber);
      
      case 'SEND_MONEY_RECIPIENT':
        return this.handleSendMoneyRecipient(session, input);
      
      case 'SEND_MONEY_AMOUNT':
        return this.handleSendMoneyAmount(session, input);
      
      case 'SEND_MONEY_PIN':
        return this.handleSendMoneyPin(session, input, phoneNumber);
      
      case 'BUY_AIRTIME_AMOUNT':
        return this.handleBuyAirtimeAmount(session, input);
      
      case 'BUY_AIRTIME_PIN':
        return this.handleBuyAirtimePin(session, input, phoneNumber);
      
      default:
        return this.showMainMenu(phoneNumber);
    }
  }

  private async handleMainMenuSelection(
    session: UssdSession,
    input: string,
    phoneNumber: string,
  ): Promise<string> {
    switch (input) {
      case '1': // Send Money
        session.step = 'SEND_MONEY_RECIPIENT';
        return 'CON Enter recipient phone number:';
      
      case '2': // Buy Airtime
        session.step = 'BUY_AIRTIME_AMOUNT';
        return 'CON Enter amount (₦):';
      
      case '3': // Check Balance
        return this.handleCheckBalance(phoneNumber);
      
      case '4': // Pay Bills
        return 'CON Select bill type:\n1. Cable TV\n2. Electricity\n3. Data Bundle';
      
      case '5': // Transaction History
        return this.handleTransactionHistory(phoneNumber);
      
      default:
        return 'CON Invalid option. Please try again.\n' + await this.showMainMenu(phoneNumber);
    }
  }

  private async handleSendMoneyRecipient(
    session: UssdSession,
    input: string,
  ): Promise<string> {
    // Validate phone number
    const phoneRegex = /^0[789][01]\d{8}$/;
    if (!phoneRegex.test(input)) {
      return 'CON Invalid phone number.\nEnter recipient phone number:';
    }
    
    // Check if recipient exists
    const recipient = await this.usersService.findByPhone(input);
    if (!recipient) {
      return 'END Recipient not found.\nPlease ensure they have a RaverPay account.';
    }
    
    session.data.recipient = input;
    session.data.recipientName = `${recipient.firstName} ${recipient.lastName}`;
    session.step = 'SEND_MONEY_AMOUNT';
    
    return `CON Send money to ${session.data.recipientName}\nEnter amount (₦):`;
  }

  private async handleSendMoneyAmount(
    session: UssdSession,
    input: string,
  ): Promise<string> {
    const amount = parseFloat(input);
    
    if (isNaN(amount) || amount <= 0) {
      return 'CON Invalid amount.\nEnter amount (₦):';
    }
    
    if (amount < 100) {
      return 'CON Minimum amount is ₦100.\nEnter amount (₦):';
    }
    
    session.data.amount = amount;
    session.step = 'SEND_MONEY_PIN';
    
    return `CON Send ₦${amount.toLocaleString()} to ${session.data.recipientName}?\nEnter your PIN to confirm:`;
  }

  private async handleSendMoneyPin(
    session: UssdSession,
    input: string,
    phoneNumber: string,
  ): Promise<string> {
    const user = await this.usersService.findByPhone(phoneNumber);
    
    // Verify PIN
    const isPinValid = await this.usersService.verifyPin(user.id, input);
    if (!isPinValid) {
      return 'END Invalid PIN.\nTransaction cancelled.';
    }
    
    // Process P2P transfer
    try {
      const result = await this.transactionsService.sendMoney({
        senderId: user.id,
        recipientPhone: session.data.recipient,
        amount: session.data.amount,
        channel: 'USSD',
      });
      
      return `END ✅ Transfer successful!\n₦${session.data.amount.toLocaleString()} sent to ${session.data.recipientName}\nRef: ${result.reference}`;
    } catch (error) {
      return `END ❌ Transfer failed.\n${error.message}`;
    }
  }

  private async handleBuyAirtimeAmount(
    session: UssdSession,
    input: string,
  ): Promise<string> {
    const amount = parseFloat(input);
    
    if (isNaN(amount) || amount <= 0) {
      return 'CON Invalid amount.\nEnter amount (₦):';
    }
    
    if (amount < 50) {
      return 'CON Minimum amount is ₦50.\nEnter amount (₦):';
    }
    
    session.data.amount = amount;
    session.step = 'BUY_AIRTIME_PIN';
    
    return `CON Buy ₦${amount.toLocaleString()} airtime for your number?\nEnter your PIN to confirm:`;
  }

  private async handleBuyAirtimePin(
    session: UssdSession,
    input: string,
    phoneNumber: string,
  ): Promise<string> {
    const user = await this.usersService.findByPhone(phoneNumber);
    
    // Verify PIN
    const isPinValid = await this.usersService.verifyPin(user.id, input);
    if (!isPinValid) {
      return 'END Invalid PIN.\nTransaction cancelled.';
    }
    
    // Process airtime purchase
    try {
      const result = await this.vtuService.purchaseAirtime({
        userId: user.id,
        recipient: phoneNumber,
        amount: session.data.amount,
        provider: 'AUTO', // Auto-detect from phone number
        channel: 'USSD',
      });
      
      return `END ✅ Airtime purchase successful!\n₦${session.data.amount.toLocaleString()} airtime sent to ${phoneNumber}\nRef: ${result.reference}`;
    } catch (error) {
      return `END ❌ Purchase failed.\n${error.message}`;
    }
  }

  private async handleCheckBalance(phoneNumber: string): Promise<string> {
    const user = await this.usersService.findByPhone(phoneNumber);
    const wallet = await this.walletService.getWalletBalance(user.id);
    
    return `END Your RaverPay Balance:\n₦${parseFloat(wallet.balance).toLocaleString()}\n\nThank you for using RaverPay!`;
  }

  private async handleTransactionHistory(phoneNumber: string): Promise<string> {
    const user = await this.usersService.findByPhone(phoneNumber);
    const transactions = await this.transactionsService.getRecentTransactions(
      user.id,
      5, // Last 5 transactions
    );
    
    if (transactions.length === 0) {
      return 'END No recent transactions.';
    }
    
    let response = 'END Recent Transactions:\n';
    transactions.forEach((tx, index) => {
      const sign = tx.type === 'CREDIT' ? '+' : '-';
      response += `${index + 1}. ${sign}₦${parseFloat(tx.amount).toLocaleString()} - ${tx.description}\n`;
    });
    
    return response;
  }

  // Session management
  private async getSession(
    sessionId: string,
    phoneNumber: string,
  ): Promise<UssdSession> {
    const key = `ussd:session:${sessionId}`;
    const sessionData = await this.redis.get(key);
    
    if (sessionData) {
      return JSON.parse(sessionData);
    }
    
    // New session
    return {
      step: 'MAIN_MENU',
      data: {},
    };
  }

  private async saveSession(
    sessionId: string,
    phoneNumber: string,
    session: UssdSession,
  ): Promise<void> {
    const key = `ussd:session:${sessionId}`;
    await this.redis.set(
      key,
      JSON.stringify(session),
      'EX',
      180, // 3 minutes expiry
    );
  }
}
```

---

### 4. USSD Response Format

**Africa's Talking Response Format:**

```typescript
// Continue session (show menu/prompt)
return 'CON Your message here';

// End session (final message)
return 'END Your final message here';
```

**Examples:**

```typescript
// Show menu
'CON Welcome to RaverPay!\n1. Send Money\n2. Buy Airtime\n3. Check Balance'

// Request input
'CON Enter amount (₦):'

// Success message (end session)
'END ✅ Transfer successful!\n₦1,000 sent to John Doe'

// Error message (end session)
'END ❌ Insufficient balance.\nPlease fund your wallet.'
```

---

## Pricing Analysis

### Africa's Talking Cost Breakdown

**Scenario: 10,000 monthly active USSD users**

| Item | Calculation | Cost (₦) |
|------|-------------|----------|
| USSD Code (shared) | ₦20,000/month | 20,000 |
| Sessions (avg 3/user) | 10,000 users × 3 sessions × ₦3 | 90,000 |
| **Total Monthly** | | **₦110,000** |
| **Cost per user** | ₦110,000 ÷ 10,000 | **₦11** |

**Scenario: 100,000 monthly active USSD users**

| Item | Calculation | Cost (₦) |
|------|-------------|----------|
| USSD Code (dedicated) | ₦20,000/month | 20,000 |
| Sessions (avg 3/user) | 100,000 users × 3 sessions × ₦3 | 900,000 |
| **Total Monthly** | | **₦920,000** |
| **Cost per user** | ₦920,000 ÷ 100,000 | **₦9.20** |

**Revenue Impact:**

Assuming ₦50 average revenue per user per month:
- **10k users:** ₦500k revenue - ₦110k cost = **₦390k profit**
- **100k users:** ₦5M revenue - ₦920k cost = **₦4.08M profit**

**ROI:** 350%+ at scale

---

## Go-to-Market Strategy

### Phase 1: Soft Launch (Month 1-2)

**Goal:** Test with 1,000 users

**Actions:**
1. ✅ Set up Africa's Talking sandbox
2. ✅ Implement core features (send money, buy airtime, check balance)
3. ✅ Test with internal team
4. ✅ Beta test with 100 users
5. ✅ Go live with shared code: `*384*1234#`

**Budget:** ₦50,000 (setup + testing)

---

### Phase 2: Market Expansion (Month 3-6)

**Goal:** Reach 10,000 users

**Actions:**
1. ✅ Launch marketing campaign (rural areas)
2. ✅ Partner with agents in rural markets
3. ✅ Add more features (bill payments, data bundles)
4. ✅ Monitor usage and optimize flows

**Budget:** ₦500,000 (marketing + operations)

---

### Phase 3: Scale (Month 7-12)

**Goal:** Reach 100,000 users

**Actions:**
1. ✅ Apply for dedicated USSD code: `*YOUR_CODE#`
2. ✅ Expand to all states
3. ✅ Add advanced features (loans, savings)
4. ✅ Consider direct telco integration for cost optimization

**Budget:** ₦2,000,000 (marketing + infrastructure)

---

## Implementation Timeline

### Week 1-2: Setup & Development
- [ ] Sign up with Africa's Talking
- [ ] Apply for shared USSD code
- [ ] Set up webhook endpoint
- [ ] Implement USSD controller & service
- [ ] Add session management (Redis)

### Week 3-4: Testing
- [ ] Test in sandbox environment
- [ ] Internal team testing
- [ ] Fix bugs and optimize flows
- [ ] Security audit

### Week 5-6: Beta Launch
- [ ] Invite 100 beta users
- [ ] Collect feedback
- [ ] Iterate on UX
- [ ] Prepare for public launch

### Week 7-8: Public Launch
- [ ] Go live with shared code
- [ ] Launch marketing campaign
- [ ] Monitor usage and performance
- [ ] Provide customer support

---

## Security Considerations

### 1. PIN Verification
```typescript
// Always verify PIN for financial transactions
const isPinValid = await this.usersService.verifyPin(user.id, pin);
if (!isPinValid) {
  // Log failed attempt
  await this.auditService.logFailedPinAttempt(user.id, 'USSD');
  
  // Lock account after 3 failed attempts
  if (failedAttempts >= 3) {
    await this.usersService.lockAccount(user.id, 'Too many failed PIN attempts');
  }
  
  return 'END Invalid PIN. Transaction cancelled.';
}
```

### 2. Rate Limiting
```typescript
// Limit USSD sessions per user
const sessionCount = await this.redis.get(`ussd:rate:${phoneNumber}`);
if (sessionCount && parseInt(sessionCount) > 10) {
  return 'END Too many requests. Please try again in 1 hour.';
}

await this.redis.incr(`ussd:rate:${phoneNumber}`);
await this.redis.expire(`ussd:rate:${phoneNumber}`, 3600); // 1 hour
```

### 3. Transaction Limits
```typescript
// Enforce daily limits for USSD transactions
const dailyLimit = await this.walletService.getDailyLimit(user.id);
if (amount > dailyLimit.remaining) {
  return 'END Daily limit exceeded.\nPlease try again tomorrow.';
}
```

---

## Monitoring & Analytics

### Key Metrics to Track

1. **Usage Metrics:**
   - Total USSD sessions
   - Unique users
   - Sessions per user
   - Completion rate

2. **Transaction Metrics:**
   - Transaction volume via USSD
   - Success rate
   - Average transaction value
   - Failed transaction reasons

3. **Cost Metrics:**
   - Total USSD cost
   - Cost per user
   - Cost per transaction
   - ROI

### Implementation

```typescript
// Track USSD analytics
await this.analyticsService.track('ussd_session_started', {
  phoneNumber,
  sessionId,
  timestamp: new Date(),
});

await this.analyticsService.track('ussd_transaction_completed', {
  phoneNumber,
  type: 'SEND_MONEY',
  amount,
  success: true,
  timestamp: new Date(),
});
```

---

## Next Steps

### Immediate (This Week)
1. ✅ Sign up for Africa's Talking account
2. ✅ Review pricing and get approval
3. ✅ Set up development environment

### Short-term (This Month)
1. ✅ Implement USSD controller and service
2. ✅ Test in sandbox
3. ✅ Apply for shared USSD code

### Long-term (Next Quarter)
1. ✅ Launch beta with 100 users
2. ✅ Public launch
3. ✅ Scale to 10,000+ users
4. ✅ Consider dedicated USSD code

---

## Conclusion

**USSD implementation is a strategic move** that will:
- ✅ Expand your market by 30-40% (feature phone users)
- ✅ Compete with OPay, PalmPay, Moniepoint
- ✅ Serve rural and underserved markets
- ✅ Build brand trust (works everywhere)
- ✅ Generate additional revenue (₦50/user/month)

**Recommended Provider:** Africa's Talking  
**Timeline:** 6-8 weeks to launch  
**Budget:** ₦50k-100k for first month  
**Expected ROI:** 350%+ at scale

**Start with:** Shared USSD code (`*384*1234#`)  
**Upgrade to:** Dedicated code (`*YOUR_CODE#`) after 10k users

---

**Document Version:** 1.0  
**Last Updated:** January 7, 2026  
**Status:** Ready for Implementation
