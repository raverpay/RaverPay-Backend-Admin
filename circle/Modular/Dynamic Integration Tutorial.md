# Dynamic Integration Tutorial

This tutorial shows you how to integrate [Dynamic](https://www.dynamic.xyz/) as
an Externally Owned Account (EOA) signer for Circle Smart Accounts using the
modular wallets SDK. You'll learn how to connect Dynamic's authentication system
with Circle's Smart Accounts. You'll also send USDC as a user operation using
the `viem` account abstraction utilities, enabled by the modular wallets SDK.

## Prerequisites

Before you begin, make sure you have:

- A [Circle Developer Console](https://console.circle.com) account.
- A [Dynamic Dashboard](https://app.dynamic.xyz/) account.
- [Node.js](https://nodejs.org/) installed for local testing. Circle recommends
  Node 16 or higher.
- Testnet funds in your wallet:
  - **Testnet USDC**: Use the [Circle Faucet](https://faucet.circle.com) to mint
    USDC on supported testnets (for example, USDC on Polygon Amoy).
  - **Native testnet tokens**: Use a
    [Public Faucet](https://www.alchemy.com/dapps/best/crypto-faucets) to get
    native testnet tokens (for example, MATIC for Polygon Amoy). You'll need
    these to pay for transaction fees when gas sponsorship isn't available.

### Configure your Circle and Dynamic credentials

1. In the [Circle Developer Console](https://console.circle.com), complete the
   setup below by following the steps in the
   [Modular Wallets Console Setup](/wallets/modular/console-setup) section:
   - Create a **Client Key** for the modular wallets SDK.
   - Retrieve the **Client URL**.

2. In the [Dynamic Dashboard](https://app.dynamic.xyz/), do the following:
   - Obtain your **Environment ID** and store it in the project's `.env` file
     along with other credentials, to be accessed later using `import.meta.env`.
   - Set the default network to one of Circle's supported networks. In this
     example, we use **Polygon Amoy**.
   - Alternatively, configure a custom list of supported networks using
     [Dynamic's network overrides](https://docs.dynamic.xyz/chains/evmNetwork#example).

   <Frame>
     <img src="https://mintcdn.com/circle-167b8d39/ZkyJVjZm1cqURNjM/w3s/images/mw-wi-ddsh.png?fit=max&auto=format&n=ZkyJVjZm1cqURNjM&q=85&s=679d97bfb029783d19fee226f79f37ce" data-og-width="1600" width="1600" data-og-height="820" height="820" data-path="w3s/images/mw-wi-ddsh.png" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/circle-167b8d39/ZkyJVjZm1cqURNjM/w3s/images/mw-wi-ddsh.png?w=280&fit=max&auto=format&n=ZkyJVjZm1cqURNjM&q=85&s=1a9f4659b70c4764186df028f075dbcf 280w, https://mintcdn.com/circle-167b8d39/ZkyJVjZm1cqURNjM/w3s/images/mw-wi-ddsh.png?w=560&fit=max&auto=format&n=ZkyJVjZm1cqURNjM&q=85&s=dba5561029bc1512d858bc20af73188f 560w, https://mintcdn.com/circle-167b8d39/ZkyJVjZm1cqURNjM/w3s/images/mw-wi-ddsh.png?w=840&fit=max&auto=format&n=ZkyJVjZm1cqURNjM&q=85&s=6374dc2f514905e74abfeebb1fc68d10 840w, https://mintcdn.com/circle-167b8d39/ZkyJVjZm1cqURNjM/w3s/images/mw-wi-ddsh.png?w=1100&fit=max&auto=format&n=ZkyJVjZm1cqURNjM&q=85&s=cebf103b713701f59a045ea4d1e722dc 1100w, https://mintcdn.com/circle-167b8d39/ZkyJVjZm1cqURNjM/w3s/images/mw-wi-ddsh.png?w=1650&fit=max&auto=format&n=ZkyJVjZm1cqURNjM&q=85&s=1ec2fd79cd758a706ecff8fa6e9b1c67 1650w, https://mintcdn.com/circle-167b8d39/ZkyJVjZm1cqURNjM/w3s/images/mw-wi-ddsh.png?w=2500&fit=max&auto=format&n=ZkyJVjZm1cqURNjM&q=85&s=95a7287404755cb7bdba4433623339eb 2500w" />
   </Frame>

   Here's how to override the default EVM networks in Dynamic:

   ```tsx Web theme={null}
   const evmNetworks = [
     {
       chainId: polygonAmoy.id,
       networkId: polygonAmoy.id,
       name: polygonAmoy.name,
       nativeCurrency: polygonAmoy.nativeCurrency,
       rpcUrls: [...polygonAmoy.rpcUrls.default.http],
       iconUrls: [],
       blockExplorerUrls: [polygonAmoy.blockExplorers.default.url],
     },
   ];

   function App() {
     return (
       <DynamicContextProvider
         settings={{
           environmentId,
           walletConnectors: [EthereumWalletConnectors],
           overrides: { evmNetworks },
         }}
       >
         <DynamicWidget variant="modal" />
         <Example />
       </DynamicContextProvider>
     );
   }
   ```

## Tutorial Steps

Follow the steps below to integrate Dynamic as an EOA signer for Circle Smart
Accounts. You'll start by installing the necessary dependencies, then configure
your application to wrap Dynamic's context, create a Circle Smart Account, and
send a user operation.

### Step 1: Install dependencies

Install the required Dynamic SDK packages, depending on your package manager:

<CodeGroup>
  ```shell npm theme={null}
  npm install @dynamic-labs/ethereum @dynamic-labs/sdk-react-core
  ```

```shell yarn theme={null}
yarn add @dynamic-labs/ethereum @dynamic-labs/sdk-react-core
```

</CodeGroup>

### Step 2: Wrap your app in the Dynamic context provider

Wrap your app with `DynamicContextProvider` from the Dynamic SDK to enable
wallet authentication and connection.

```tsx Web theme={null}
import * as React from 'react';
import * as ReactDOM from 'react-dom/client';

import { EthereumWalletConnectors } from '@dynamic-labs/ethereum';
import { DynamicContextProvider, DynamicWidget } from '@dynamic-labs/sdk-react-core';

import { Example } from '.';

const environmentId = import.meta.env.VITE_DYNAMIC_ENV_ID as string;

function App() {
  return (
    <DynamicContextProvider
      settings={{
        environmentId,
        walletConnectors: [EthereumWalletConnectors],
      }}
    >
      <DynamicWidget variant="modal" />
      <Example />
    </DynamicContextProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(<App />);
```

### Step 3: Create a Circle Smart Account using Dynamic provider

Use the Dynamic context and Circle's modular wallets SDK to create a Smart
Account. Here's the full working example:

```tsx Web theme={null}
import React, { useEffect } from 'react';
import { createPublicClient, Hex, parseUnits } from 'viem';

import { isEthereumWallet } from '@dynamic-labs/ethereum';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';

import {
  toCircleSmartAccount,
  toModularTransport,
  walletClientToLocalAccount,
  encodeTransfer,
} from '@circle-fin/modular-wallets-core';

import { createBundlerClient, SmartAccount } from 'viem/account-abstraction';

import { polygonAmoy } from 'viem/chains';

const clientKey = import.meta.env.VITE_CLIENT_KEY as string;
const clientUrl = import.meta.env.VITE_CLIENT_URL as string;

// Create Circle transports
const modularTransport = toModularTransport(`${clientUrl}/polygonAmoy`, clientKey);

// Create a public client
const client = createPublicClient({
  chain: polygonAmoy,
  transport: modularTransport,
});

// Create a bundler client
const bundlerClient = createBundlerClient({
  chain: polygonAmoy,
  transport: modularTransport,
});

export const Example = () => {
  const { primaryWallet } = useDynamicContext(); // Get the wallet information from the Dynamic context provider
  const [account, setAccount] = React.useState<SmartAccount>();
  const [hash, setHash] = React.useState<Hex>();
  const [userOpHash, setUserOpHash] = React.useState<Hex>();

  useEffect(() => {
    async function setSigner() {
      if (!primaryWallet) {
        setAccount(undefined); // Reset the account if the wallet is not connected
        return;
      }

      if (!isEthereumWallet(primaryWallet)) {
        throw new Error('Wallet is not EVM-compatible.');
      }

      const walletClient = await primaryWallet.getWalletClient(); // Dynamic provider

      const smartAccount = await toCircleSmartAccount({
        client,
        owner: walletClientToLocalAccount(walletClient), // Transform the wallet client to a local account
      });

      setAccount(smartAccount);
    }

    setSigner();
  }, [primaryWallet]);

  const sendUserOperation = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!account) return;

    const formData = new FormData(event.currentTarget);
    const to = formData.get('to') as `0x${string}`;
    const value = formData.get('value') as string;

    const USDC_CONTRACT_ADDRESS = '0x41e94eb019c0762f9bfcf9fb1e58725bfb0e7582'; // Polygon Amoy testnet
    const USDC_DECIMALS = 6; // Used for parseUnits
    const callData = encodeTransfer(to, USDC_CONTRACT_ADDRESS, parseUnits(value, USDC_DECIMALS));

    const opHash = await bundlerClient.sendUserOperation({
      account,
      calls: [callData],
      paymaster: true, // Enable gas sponsorship if supported
    });

    setUserOpHash(opHash);

    const { receipt } = await bundlerClient.waitForUserOperationReceipt({
      hash: opHash,
    });
    setHash(receipt.transactionHash);
  };

  if (!primaryWallet) return null;

  return (
    <div>
      {!account ? (
        <p>Loading...</p>
      ) : (
        <>
          <p>
            <strong>Address:</strong> {account.address}
          </p>
          <h2>Send User Operation</h2>
          <form onSubmit={sendUserOperation}>
            <input name="to" placeholder="Address" required />
            <input name="value" placeholder="Amount (USDC)" required />
            <button type="submit">Send</button>
          </form>
          {userOpHash && (
            <p>
              <strong>User Operation Hash:</strong> {userOpHash}
            </p>
          )}
          {hash && (
            <p>
              <strong>Transaction Hash:</strong> {hash}
            </p>
          )}
        </>
      )}
    </div>
  );
};
```

<Note>
  To access the current wallet, use the `useDynamicContext()` hook provided by
  `DynamicContextProvider` and get the `primaryWallet`. You can then convert it
  to a local account and use it to generate a Circle Smart Account.
</Note>

```tsx Web theme={null}
const { primaryWallet } = useDynamicContext();

if (primaryWallet && isEthereumWallet(primaryWallet)) {
  const walletClient = await primaryWallet.getWalletClient();
  const smartAccount = await toCircleSmartAccount({
    client,
    owner: walletClientToLocalAccount(walletClient),
  });
}
```

In the above code, if the `primaryWallet` is not null or undefined, you can
transform it into a wallet client, convert it to a local account, and then pass
it to `toCircleSmartAccount()` to create a Circle Smart Account. This account
can then be used to send user operations.

## Step 4: Run the app

Start your app, click **Login** or **Sign Up** using Dynamic, and you'll be
connected to the blockchain through Circle's modular wallets SDK.

Once logged in, you'll see the UI for sending a user operation:

<Frame>
  <img src="https://mintcdn.com/circle-167b8d39/ZkyJVjZm1cqURNjM/w3s/images/mw-wi-dinteg-ui.png?fit=max&auto=format&n=ZkyJVjZm1cqURNjM&q=85&s=3bdf206f26296bc1a45caceb6a04be18" data-og-width="920" width="920" data-og-height="516" height="516" data-path="w3s/images/mw-wi-dinteg-ui.png" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/circle-167b8d39/ZkyJVjZm1cqURNjM/w3s/images/mw-wi-dinteg-ui.png?w=280&fit=max&auto=format&n=ZkyJVjZm1cqURNjM&q=85&s=efb79e142631ded636ba1d1c78663f34 280w, https://mintcdn.com/circle-167b8d39/ZkyJVjZm1cqURNjM/w3s/images/mw-wi-dinteg-ui.png?w=560&fit=max&auto=format&n=ZkyJVjZm1cqURNjM&q=85&s=202ae91de974a3cabe52d3ebab2f83b6 560w, https://mintcdn.com/circle-167b8d39/ZkyJVjZm1cqURNjM/w3s/images/mw-wi-dinteg-ui.png?w=840&fit=max&auto=format&n=ZkyJVjZm1cqURNjM&q=85&s=8abd69777f8e8f3714db4809a9b559ff 840w, https://mintcdn.com/circle-167b8d39/ZkyJVjZm1cqURNjM/w3s/images/mw-wi-dinteg-ui.png?w=1100&fit=max&auto=format&n=ZkyJVjZm1cqURNjM&q=85&s=d219114613960cdf565496c017ea601f 1100w, https://mintcdn.com/circle-167b8d39/ZkyJVjZm1cqURNjM/w3s/images/mw-wi-dinteg-ui.png?w=1650&fit=max&auto=format&n=ZkyJVjZm1cqURNjM&q=85&s=951c75b94ccb733ddb6b94bb92c5bfe8 1650w, https://mintcdn.com/circle-167b8d39/ZkyJVjZm1cqURNjM/w3s/images/mw-wi-dinteg-ui.png?w=2500&fit=max&auto=format&n=ZkyJVjZm1cqURNjM&q=85&s=3c89c2e36e89253aacb29ffea9217011 2500w" />
</Frame>

## Summary

In this tutorial, you integrated Dynamic as an EOA signer for Circle Smart
Accounts using the modular wallets SDK. You:

- Set up credentials in both Circle and Dynamic.
- Installed required dependencies.
- Wrapped your app with `DynamicContextProvider`.
- Created a smart account using `toCircleSmartAccount()`.
- Sent a user operation using `viem` bundler client.

This integration enables a seamless, passwordless Web3 onboarding experience and
allows you to build advanced features like gas sponsorship and session keys
using Circle's modular wallets framework.

---

> To find navigation and other pages in this documentation, fetch the llms.txt file at: https://developers.circle.com/llms.txt
