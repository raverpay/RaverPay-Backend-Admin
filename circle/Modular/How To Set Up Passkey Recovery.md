# How To Set Up Passkey Recovery

## Overview

Passkey recovery allows users to regain access to their smart accounts if they
lose their primary passkey. This mechanism enables users to register an
Externally Owned Account (EOA) as a recovery key. The recovery key can later be
used to generate a new passkey and restore access to the smart account—ensuring
users maintain full control in a non-custodial setup. For a complete code
sample, see the
[Passkey Recovery Example](https://github.com/circlefin/modularwallets-web-sdk/tree/master/examples/passkey-recovery)
in the modular wallets web SDK.

The recovery process includes two phases:

1. **Registration**: The user registers an EOA to act as a recovery key. This
   key is submitted to the network and added as a signer on the smart account.

<Note>
  > **Note:** Registration must be completed while the user still has access to
  > their original passkey. This ensures that the recovery key is securely >
  > authorized.
</Note>

2. **Recovery**: If the primary passkey is lost, the user can use the recovery
   key to register a new passkey and resume access.

## Prerequisites

Before you implement passkey backup and recovery, make sure you have the
following:

* An initialized **bundler client**
* An existing **Circle Smart Account** already configured with a passkey as the
  primary signer
* Required dependencies from a supported **wallet library** and the **modular
  wallets SDK**

<Note>
  **Note:** This guide uses [**viem**](https://viem.sh/) to generate mnemonics
  and create accounts. You can use any wallet library that supports mnemonic
  generation and EOA creation, such as [ethers.js](https://docs.ethers.org/) or
  [web3.js](https://web3js.readthedocs.io/).
</Note>

## Steps

To set up passkey backup and recovery, use the following functions from the
modular wallets SDK:

* `registerRecoveryAddress`: Registers an EOA as a recovery key.
* `executeRecovery`: Adds a new WebAuthn credential using the recovery key.
* `estimateRegisterRecoveryAddressGas`: Estimates gas for registering a recovery
  key.
* `estimateExecuteRecoveryGas`: Estimates gas for executing the recovery
  process.

<Note>
  These functions use **ERC-4337 user operations** to interact with the smart
  account.
</Note>

### 1. Register a Recovery Address

To allow your users to recover their passkeys, your application should prompt
them to associate a recovery address with their smart account while they still
have access to their original passkey. The following code sample shows how to
register a recovery address and generate a recovery mnemonic. This mnemonic can
then be used later to recover their passkey and associated smart account.

<Note>
  **Note:** The user must store the generated mnemonic securely. It serves as
  the only credential for recovery if the passkey is lost.
</Note>

```ts  theme={null}
import { english, generateMnemonic, mnemonicToAccount } from "viem/accounts";
import { recoveryActions } from "@circle-fin/modular-wallets-core";

// Extend bundler client with recovery actions
const recoveryClient = bundlerClient.extend(recoveryActions);

// Generate recovery mnemonic (make sure the user stores this securely)
const mnemonic = generateMnemonic(english);
const recoveryEoa = mnemonicToAccount(mnemonic);

// Register recovery address with the smart account
await recoveryClient.registerRecoveryAddress({
  account,
  recoveryAddress: recoveryEoa.address,
  paymaster: true, // Optional: use a paymaster to sponsor gas
});
```

This creates a mapping between the smart account and the recovery address.

### 2. Initiate the Recovery Process

If a user loses their passkey, they can use the mnemonic from the recovery
address to start the recovery flow.

```ts  theme={null}
// Recreate the recovery account from the saved mnemonic
const localAccount = mnemonicToAccount(savedMnemonic);

// Initialize a temporary smart account using the recovery EOA
const newAccount = await toCircleSmartAccount({
  client,
  owner: localAccount,
});

// Register a new WebAuthn passkey credential
const newCredential = await toWebAuthnCredential({
  transport: passkeyTransport,
  mode: WebAuthnMode.Register,
  username: "<RECOVERY_PASSKEY_USERNAME>",
});
```

This sets up a temporary account from the recovery key and prepares a new
passkey to replace the lost one.

### 3. Execute Recovery

After registering the new passkey, call `executeRecovery` to complete the
recovery and restore access to the smart account.

```ts  theme={null}
await recoveryClient.executeRecovery({
  account: newAccount, // Temporary account used for signing
  credential: newCredential, // New WebAuthn credential
  paymaster: true, // Optional: use a paymaster to sponsor gas
});
```

This associates the new `WebAuthn` credential with the smart account.

### 4. Use the Recovered Account

After a successful recovery, the user can access the smart account using their
new passkey.

```ts  theme={null}
const recoveredAccount = await toCircleSmartAccount({
  client,
  owner: toWebAuthnAccount({ credential: newCredential }) as WebAuthnAccount,
});

// The user can now sign transactions and use the wallet as normal
```

## Implementation tips

Use the following tips to improve the reliability and user experience of your
passkey recovery implementation.

### Gas fees

Recovery operations require network gas fees. To improve the user experience,
you can either sponsor the gas or estimate and display it to users in advance.
Circle recommends using the [Gas Station](/wallets/gas-station) to sponsor gas,
as it creates a smoother experience.

**Recommended approaches:**

1. **Sponsor gas fees** using Circle Gas Station.
2. **Estimate gas fees** and display them to users:

```ts  theme={null}
const registerGasEstimate =
  await recoveryClient.estimateRegisterRecoveryAddressGas({
    account,
    recoveryAddress: recoveryEoa.address,
  });

const costInEth = formatEther(
  registerGasEstimate.totalGas * registerGasEstimate.maxFeePerGas,
);

// Display cost to user
console.log(`Estimated cost: ${costInEth} ETH`);
```

### Error handling

The recovery implementation includes built-in validation and error handling for
common edge cases:

* Detects existing address mappings to support idempotent operations
* Validates that a smart account object is provided for signing
* Handles registration or credential issues gracefully

Each recovery function uses a user operation that requires a valid smart account
to sign the transaction. Validation occurs automatically, whether the account is
passed directly or
[hoisted into the context](https://viem.sh/account-abstraction/actions/bundler/sendUserOperation#account-hoisting).

<Tip>
  **Tip:** Always wrap recovery logic in `try/catch` blocks to handle errors
  cleanly and provide actionable feedback to users.
</Tip>

## Best practices

Follow these best practices to increase user trust, security, and recoverability
when implementing passkey backup and recovery.

### 1. Educate users

* Clearly explain that losing both the **passkey** and **recovery key** results
  in permanent loss of access.
* Use onboarding tips or modals to reinforce the importance of recovery setup.
* Encourage users to store their **recovery mnemonic** securely—preferably in a
  password manager, secure notes app, or hardware vault.
* For a conceptual walkthrough, refer to the
  [User flow examples](#user-flow-examples), which outlines how users might
  register a recovery key and recover their wallet.

### 2. Offer redundancy

* Allow users to register multiple recovery keys (EOAs) to improve account
  resilience.
* Encourage users to store each recovery key in a separate, secure location to
  avoid single points of failure.

### 3. Test thoroughly

* Test the recovery flow across supported devices and browsers before deploying
  to production.
* Simulate common edge cases (e.g., loss of passkey, malformed mnemonic) to
  verify that fallback logic and error handling behave as expected.
* Consider including recovery flow testing in your CI/CD process if you're using
  automated test wallets.

## User flow examples

The following user flows describe a possible implementation of the passkey
backup and recovery process in your app. The flows are divided into two parts:

* **Generate your recovery key**
* **Recover your smart account**

### Generate your recovery key

After the user signs in with their existing passkey, guide them to set up a
recovery key. We recommend offering this option post-onboarding, with access
placed under a **Settings** or **Security** section in your app.

The following steps outline a possible user flow for registering a recovery key:

1. Select **Generate recovery key** under **Settings** or **Security** section.
2. Click **Continue** to begin generating your recovery key.
3. Verify your identity by signing in with your passkey using your touch ID or
   your device password.
4. Click **Confirm** to register your recovery key on the selected blockchain
   network.\
   **Note:** The app displays an estimated gas fee for registering the recovery
   key before submission.
5. Sign with your passkey to authorize adding the recovery key (EOA) as a signer
   to your smart account.
6. Once registered, securely store the recovery key (mnemonic).

### Recover your smart account

After the user has securely stored a recovery key, they can use it to regain
access if their original passkey is lost. This flow should be accessible from
your app's sign-in screen or recovery page.

The following steps outline a possible user flow for recovering a smart account
using a registered recovery key:

1. Select **Recover your wallet** from the sign-in screen next to "Lost your
   passkey?"
2. Enter your recovery key, then click **Start recovery process**.
3. After the key is validated, click **Continue** to create a new passkey.
4. Sign with your recovery key to authorize the new passkey.
5. Click **Confirm** to register the new passkey on the blockchain network.
6. After successful registration, the app displays a confirmation message.
7. The app redirects to your wallet dashboard where you can resume normal
   operations.

## Summary

Passkey backup and recovery provides a secure, self-custodial way for users to
regain access to their smart accounts. By implementing this feature, you give
users a reliable recovery option if they lose access to their primary passkey.
This approach reduces the risk of permanent account loss and maintains the core
principle of user control. Circle recommends pairing recovery setup with strong
user education, redundant recovery methods, and thorough testing to ensure a
seamless experience in production.


---

> To find navigation and other pages in this documentation, fetch the llms.txt file at: https://developers.circle.com/llms.txt