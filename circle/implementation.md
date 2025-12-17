IMPORTANT: Make sure to check the existing code of what we already have with reusable components a cross our mobile app, admin dashboard and backend and follow the best practices. also create a branch for the codebase and let me know if any docs is missing is important for this implementation to work.

We are using pnpm on the backend and admin dashboard, while npm on mobile.

At the end of the checking and understanding our codebase and check the below information, you will now create a plan of what we need to do to achieve this.

**Project Context Prompt**

I’m working on **RaverPay**, check our readme for full for full details. We want to integrating Circle’s blockchain APIs as a separate system alongside our existing Venly integration.

Current Tech Stack

Our monorepo structure:

- **`apps/raverpaymobile`** - check our current codebase
- **`apps/raverpay-api`** - check our current codebase
- **`apps/raverpay-admin`** - check our current codebase
- **`circle`** - check our current codebase

**Authentication**: Check our codebase and add what we currently use for both mobile app and admin dashboard.

**Current Status**: Bills payment feature is live. We have Venly integration working but want to build a new, independent Circle-based system.

### **RaverPay Core Features**

1. **Daily Utilities**: Bills payment (Airtime, Data, Electricity, Cable)
1. **Global Access**: Virtual Dollar/Pound/Euro cards and International Bank Accounts for freelancers/creators
1. **Crypto & Borderless**: Stablecoin payments and instant money transfers across African countries

### **Circle Integration Scope**

We’re implementing these Circle products:

**1. Dev-Controlled Wallets**

- Create and manage USDC wallets for users via API
- Handle wallet balances and transfers
- Documentation: `circle/dev-controlled-wallets.md`

**2. CCTP (Cross-Chain Transfer Protocol)**

- Enable native USDC transfers across blockchains
- Documentation: `circle/cctp.md`

**3. Paymaster**

- Allow users to pay gas fees in USDC
- Documentation: `circle/paymaster.md`

### **Circle API Endpoints We’re Using**

I’ve organized the Circle API documentation in `circle/` by these categories:

**Core Setup:** circle/CoreSetup

- API Overview & Health (Ping)
- Developer Account (Entity configuration, public keys)
- Faucet (Testnet tokens)

**Wallet Management:** circle/WalletManagement

- Developer-Controlled Wallet Sets (Create, Get, Update)
- Wallets (Create, List, Retrieve, Update, Balances, Token lookup, NFTs)

**Transactions:** circle/Transactions

- Transactions (Create transfers, Contract execution, Fee estimation, Cancel, Accelerate)
- Signing (Sign messages, typed data, transactions)
- Token Lookup

**Monitoring & Compliance:** circle/Monitoring & Compliance

- Webhook Subscriptions (Notifications)
- Monitor Tokens (Configurations)
- Compliance Engine (Address Screening)

### **Key Documentation Files in `circle/`:**

**Entity:** circle/CoreSetup/Entity

**CCTP:**

- `cctp-overview.md`
- `migration-from-v1-to-v2.md`
- `technical-guide.md`

**Paymaster:** circle/Paymaster

- `paymaster-overview.md` circle/Paymaster/paymaster-overview.md
- `pay-gas-fees-usdc.md`
- `addresses-and-events.md` circle/Paymaster/Paymaster Addresses and Events.md

### **Architecture Goals**

1. **Separation of Concerns**: Build Circle integration as a separate module from Venly
1. **Gradual Migration**: Keep both systems running; start with new users on Circle
1. **Authentication Integration**: Use existing auth system for Circle endpoints
1. **Testnet First**: Implement and test on Circle’s testnet before production and create a markdown later if we need to go production.
1. **Webhook Support**: Implement webhook handlers for transaction notifications

### **What I Need Help With**

[Insert your specific request here, for example:]

- Implementing the NestJS Circle service module structure
- Creating the wallet creation flow with proper error handling
- Setting up webhook subscriptions for transaction monitoring
- Building the mobile app UI components for Circle wallet features
- Implementing CCTP cross-chain transfers
- Setting up Paymaster for gasless transactions
- etc.

### **Important Constraints**

- Must work with our existing authentication system
- Must maintain backward compatibility with existing Venly integration
- Should follow NestJS best practices (modules, services, controllers, guards)
- Mobile app must handle offline states gracefully
- All financial transactions need proper audit logging
- Must comply with Nigerian financial regulations

Also at the end of the day. Create another section for non technical person highlighting what a new user/existing will be able to do and the process

What the admin person will be able to do

This must follow the industry bear standards
