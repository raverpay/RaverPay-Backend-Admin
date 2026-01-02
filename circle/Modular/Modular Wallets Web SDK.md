# Modular Wallets Web SDK

Welcome to Circle's modular wallets web SDK documentation. The SDK enables
developers to integrate modular wallets to build secure, scalable Web3
applications by leveraging tools for key management, smart account interactions,
gasless transactions, and blockchain communication.

## Installation

Follow the steps on the
[NPM package repository](https://www.npmjs.com/package/@circle-fin/modular-wallets-core)
to install and set up the modular wallets web SDK.

## API Documentation

The following sections detail the SDK's transport mechanisms, client
interactions, account management, providers, utilities, interfaces, and types.

<Note>
  **Note:** The Web SDK integrates with [Viem](https://viem.sh/)'s interfaces.
  Commonly used methods, interfaces, enums, etc., from Viem that are relevant to
  our SDK will be specifically noted in the sections below.
</Note>

### Transports

Transports handle communication between the SDK and blockchain networks or APIs.
They form the foundation for executing requests, such as JSON-RPC calls,
ensuring secure and efficient interactions.

#### Function: toModularTransport

* Description: Creates a custom transport instance with the given clientUrl and
  clientKey.
* Parameters:
  * clientUrl: string - The Client URL to use.
  * clientKey: string - The Client key to use.
* Returns: CustomTransport - The custom transport instance.

#### Function: toPasskeyTransport

* Description: Creates a custom transport instance with the given clientUrl and
  clientKey.
* Parameters:
  * clientUrl: string - The Client URL to use.
  * clientKey: string - The Client key to use.
* Returns: CustomTransport - The custom transport instance.

#### Understanding toModularTransport and toPasskeyTransport

##### Key Differences

| Aspect               | toModularTransport                                         | toPasskeyTransport                                               |
| -------------------- | ---------------------------------------------------------- | ---------------------------------------------------------------- |
| **Purpose**          | Handles modular wallet-related blockchain actions.         | Handles passkey-based user authentication.                       |
| **Service**          | Talks to Circle Modular Wallet API for wallet operations.  | Talks to Circle Relying Party (RP) API for authentication flows. |
| **Focus**            | Blockchain and wallet operations (transactions, balances). | WebAuthn-based secure login and registration.                    |
| **Interaction**      | Blockchain-focused (for example, Arbitrum Sepolia).        | Credential-focused (for example, verifying passkeys).            |
| **Example Use Case** | Sending gasless transactions                               | Registering or logging into a modular wallet.                    |

##### How They Work Together

* **User Authentication**:
  * Use toPasskeyTransport for registering a wallet or logging in with a
    passkey.
  * This verifies the WebAuthn credential with Circle's RP API.
* **Blockchain Operations**:
  * After authentication, use toModularTransport to interact with the wallet
    onchain (for example, sending transactions or fetching balances).

### Clients

#### Function: createBundlerClient (viem)

* Description: Creates a Bundler Client for interacting with ERC-4337 Bundlers,
  enabling the sending and retrieval of User Operations through Bundler Actions.
* Parameters:
  * config: BundlerClientConfig - The configuration object containing the
    following properties:
    * transport: Transport - The transport mechanism used for making RPC
      requests.
    * chain?: Chain - Specifies the blockchain chain to interact with.
    * Other optional properties can be found in the
      [Viem Bundler Client Documentation](https://viem.sh/account-abstraction/clients/bundler#parameters).
* Returns: BundlerClient - A Bundler Client.

##### **Bundler Actions**

The Bundler Client supports the following key actions:

* estimateUserOperationGas - Calculates the gas required for a User Operation.
* sendUserOperation - Submits a User Operation to the bundler for processing.
* getUserOperationReceipt - Retrieves the receipt for a User Operation.

For the full list of actions and detailed documentation, see the
[Viem Bundler Actions Documentation](https://viem.sh/account-abstraction/actions/bundler/estimateUserOperationGas).

<Note>
  **Limitations**

  The `eth_getUserOperationReceipt` and `eth_getUserOperationByHash` methods scan
  logs from recently mined blocks and are not designed for historical data.
  Requests for user operations outside the supported range may be rejected due to
  block range limitations.

  **Default range:** 150 blocks

  **Networks with unlimited range:** Arbitrum, Base, Polygon, and Optimism

  **Best practice:** Use this method soon after submitting the user operation to
  confirm inclusion, not for historical analysis.
</Note>

#### Function: createPublicClient (viem)

* Description: Creates a public client for interacting with blockchain nodes.
  This client is used for tasks such as querying blockchain data and sending
  transactions.
* Parameters:
  * config: PublicClientConfig - The configuration object containing the
    following properties:
    * transport: Transport - The transport mechanism used for making RPC
      requests.
    * chain?: Chain - Specifies the blockchain chain to interact with.
    * Other optional properties can be found in the
      [Viem Public Client Documentation](https://viem.sh/docs/clients/public#parameters).
* Returns: PublicClient - A Public Client.

##### **Public Client Actions**

The Public Client supports the following key actions:

* getBlock - Retrieves information about a block using its number, hash, or a
  specific tag
* getTransaction - Fetches details of a transaction using its hash.
* getBalance - Returns the balance of the specified address.
* call - Executes a "call" to a contract function and retrieves the result
  without modifying the blockchain state.
* sendTransaction - Submits a signed transaction to the blockchain network for
  processing.
* verifyMessage - Confirms whether a given message was signed by the specified
  address.

For the full list of actions and detailed documentation, see the
[Viem Public Actions Documentation](https://viem.sh/docs/actions/public/introduction).

#### Function: createRpClient

* Description: Creates an RP Client for interacting with the RP API
* Parameters:
  * config: RpClientConfig - The configuration object containing the following
    properties:
    * transport: Transport - The transport mechanism used for making RPC
      requests. (required)
    * cacheTime?: number (default: 4\_000) - Time (in milliseconds) that cached
      data will remain in memory.
    * key?: string - A key for the client.
    * name?: string - A name for the client.
    * pollingInterval?: number (default: 4\_000) - Frequency (in milliseconds)
      for polling enabled actions & events.
    * rpcSchema?: rpcSchema - Typed JSON-RPC schema for the client.
* Returns: RpClient\<transport, rpcSchema> - An RP Client.

### Accounts

#### Function: toCircleSmartAccount

* Description: Creates a Circle smart account.
* Parameters:
  * client: Client - The client instance.
  * owner: WebAuthnAccount | LocalAccount - The owner account associated with
    the Circle smart account.
  * address?: Address - The address.
  * name?: string (default: "passkey-\{timestamp}", e.g.
    2025-01-01T00:00:00.000Z) - The wallet name assigned to the newly registered
    account.
  * nonce?: bigint - The Nonce.
* Returns: Promise\<ToCircleSmartAccountReturnType>

#### Function: toWebAuthnCredential

* Description: Logs in or registers a user and returns a WebAuthnCredential.
* Parameters:
  * mode: WebAuthnMode - The mode of the WebAuthn credential (Login or
    Register).
  * transport: Transport - The transport used to communicate with the RP API.
  * credentialId?: string - The existing credential ID for passkey login.
  * username?: string - The username for passkey registration.
* Returns: Promise\<WebAuthnCredential>

### Providers

#### Class: ModularWalletsProvider

* Description: Provider for connecting to the modular wallets API and executing
  Web3 API requests.
* Parameters:
  * clientUrl: string - The Client URL to use.
  * clientKey: string - The Client key to use.

##### Methods

###### request

* Description: Sends a Web3 API request to the modular wallets API using the
  specified method and payload, with optional request configuration.
* Parameters:
  * payload: Web3APIPayload\<API, Method> - The payload for the Web3 API
    request, including the method name and its parameters.
  * requestOptions?: RequestInit - Optional configuration for the HTTP request,
    such as headers or request mode.
* Returns: Promise\<ResultType> - A promise resolving to the result of the API
  call.

#### Class: PaymasterProvider

* Description: Provider for connecting to the Paymaster API, enabling
  interaction with
  [ERC-7677 compliant Paymasters](https://eips.ethereum.org/EIPS/eip-7677) to
  sponsor User Operation gas fees.
* Parameters:
  * clientUrl: string - The Client URL to use.
  * clientKey: string - The Client key to use.

##### Methods

###### request

* Description: Sends a request to the Paymaster API using the specified method
  and payload, with optional request configuration.
* Parameters:
  * payload: Web3APIPayload\<API, Method> - The payload for the API request,
    including the method name and its parameters.
  * requestOptions?: RequestInit - Optional configuration for the HTTP request,
    such as headers or request mode.
* Returns: Promise\<ResultType> - A promise resolving to the result of the API
  call.

#### Class: RpProvider

* Description: Provider for connecting to the RP API and executing Web3 API
  requests.
* Parameters:
  * clientUrl: string - The Client URL to use.
  * clientKey: string - The Client key to use.

##### Methods

###### request

* Description: Sends a request to the RP API using the specified method and
  payload, with optional request configuration.
* Parameters:
  * payload: Web3APIPayload\<API, Method> - The payload for the API request,
    including the method name and its parameters.
  * requestOptions?: RequestInit - Optional configuration for the HTTP request,
    such as headers or request mode.
* Returns: Promise\<ResultType> - A promise resolving to the result of the API
  call.

#### Class: EIP1193Provider

* Description: An EIP-1193 wrapper provider for connecting to the Modular
  Wallets API and the public RPC endpoint and executing Web3 API requests via
  the passed-in bundler client instance.
* Parameters:
  * bundlerClient: BundlerClient - The bundler client instance.
  * publicClient: PublicClient - The public client instance.

##### Methods

###### request

* Description: Sends a request to the modular wallets API using the specified
  method and payload, with optional request configuration.
* Parameters:
  * payload: Web3APIPayload\<API, Method> - The payload for the API request,
    including the method name and its parameters.
  * requestOptions?: RequestInit - Optional configuration for the HTTP request,
    such as headers or request mode.
* Returns: Promise\<ResultType> - A promise resolving to the result of the API
  call.

### Utilities

#### Function: createAddressMapping

* Description: Creates an address mapping for recovery.
* Parameters:
  * client: Client\<Transport> - The Client to use.
  * params: CreateAddressMappingParameters - Parameters to use.
* Returns: Promise\<CreateAddressMappingReturnType> - The mapping result.

#### Function: encodeTransfer

* Description: Encodes the ERC20 transfer for user operations.
* Parameters:
  * to: `0x${string}` - The recipient address.
  * token: `0x${string}` - The token contract address. Supported tokens and
    their information are listed below.
  * amount: bigInt - The amount to transfer.
* Returns: EncodeTransferReturnType - The encoded transfer.
* Supported Tokens:

##### Mainnet USDC

| Blockchain Network | Enum                            | Contract Address                                                                                                                    |
| ------------------ | ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Arbitrum           | ContractAddress.Arbitrum\_USDC  | [`0xaf88d065e77c8cC2239327C5EDb3A432268e5831`](https://arbiscan.io/token/0xaf88d065e77c8cc2239327c5edb3a432268e5831)                |
| Avalanche          | ContractAddress.Avalanche\_USDC | [`0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E`](https://snowtrace.io/token/0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E?chainid=43114) |
| Base               | ContractAddress.Base\_USDC      | [`0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`](https://basescan.org/token/0x833589fcd6edb6e08f4c7c32d4f71b54bda02913)               |
| Monad              | ContractAddress.Monad\_USDC     | [`0x754704Bc059F8C67012fEd69BC8A327a5aafb603`](https://monadvision.com/token/0x754704Bc059F8C67012fEd69BC8A327a5aafb603)            |
| Optimism           | ContractAddress.Optimism\_USDC  | [`0x0b2c639c533813f4aa9d7837caf62653d097ff85`](https://optimism.blockscout.com/address/0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85)  |
| Polygon            | ContractAddress.Polygon\_USDC   | [`0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359`](https://polygonscan.com/token/0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359)            |
| Unichain           | ContractAddress.Unichain\_USDC  | [`0x078D782b760474a361dDA0AF3839290b0EF57AD6`](https://unichain.blockscout.com/address/0x078D782b760474a361dDA0AF3839290b0EF57AD6)  |

##### Mainnet Native Tokens

| Blockchain Network | Token Name (Symbol) | Enum                          | Contract Address                                                                                                                 |
| ------------------ | ------------------- | ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Arbitrum           | Arbitrum (ARB)      | ContractAddress.Arbitrum\_ARB | [`0x912CE59144191C1204E64559FE8253a0e49E6548`](https://arbiscan.io/token/0x912ce59144191c1204e64559fe8253a0e49e6548)             |
| Optimism           | Optimism (OP)       | ContractAddress.Optimism\_OP  | [`0x4200000000000000000000000000000000000042`](https://optimistic.etherscan.io/token/0x4200000000000000000000000000000000000042) |

##### Testnet USDC

| Blockchain Network | Enum                                  | Contract Address                                                                                                                            |
| ------------------ | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Arbitrum Sepolia   | ContractAddress.ArbitrumSepolia\_USDC | [`0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d`](https://sepolia.arbiscan.io/token/0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d)                |
| Arc Testnet        | ContractAddress.ArcTestnet\_USDC      | [`0x3600000000000000000000000000000000000000`](https://testnet.arcscan.app/address/0x3600000000000000000000000000000000000000)              |
| Avalanche Fuji     | ContractAddress.AvalancheFuji\_USDC   | [`0x5425890298aed601595a70AB815c96711a31Bc65`](https://testnet.snowtrace.io/token/0x5425890298aed601595a70AB815c96711a31Bc65?chainid=43113) |
| Base Sepolia       | ContractAddress.BaseSepolia\_USDC     | [`0x036CbD53842c5426634e7929541eC2318f3dCF7e`](https://sepolia.basescan.org/token/0x036CbD53842c5426634e7929541eC2318f3dCF7e)               |
| Monad Testnet      | ContractAddress.MonadTestnet\_USDC    | [`0x534b2f3A21130d7a60830c2Df862319e593943A3`](https://testnet.monadexplorer.com/token/0x534b2f3A21130d7a60830c2Df862319e593943A3)          |
| Optimism Sepolia   | ContractAddress.OptimismSepolia\_USDC | [`0x5fd84259d66Cd46123540766Be93DFE6D43130D7`](https://optimism-sepolia.blockscout.com/address/0x5fd84259d66Cd46123540766Be93DFE6D43130D7)  |
| Polygon Amoy       | ContractAddress.PolygonAmoy\_USDC     | [`0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582`](https://amoy.polygonscan.com/token/0x41e94eb019c0762f9bfcf9fb1e58725bfb0e7582)               |
| Unichain Sepolia   | ContractAddress.UnichainSepolia\_USDC | [`0x31d0220469e10c4E71834a79b1f276d740d3768F`](https://unichain-sepolia.blockscout.com/address/0x31d0220469e10c4E71834a79b1f276d740d3768F)  |

#### Function: estimateExecuteRecoveryGas

* Description: Estimates the gas required to execute and finalize the recovery
  process.
* Parameters:
  * client: Client\<Transport, Chain | undefined, SmartAccount | undefined> -
    The Client to use.
  * params: EstimateExecuteRecoveryGasParameters - Parameters to use.
* Returns: Promise\<EstimateUserOperationGasReturnType> - The mapping result.

#### Function: estimateRegisterRecoveryAddressGas

* Description: Estimates the gas required to register a recovery address during
  the recovery process.
* Parameters:
  * client: Client\<Transport, Chain | undefined, SmartAccount | undefined> -
    The Client to use.
  * params: EstimateRegisterRecoveryAddressGasParameters - Parameters to use.
* Returns: Promise\<EstimateUserOperationGasReturnType> - An estimate of gas
  values necessary to register a recovery address.

#### Function: executeRecovery

* Description: Executes and finalizes the recovery process.
* Parameters:
  * client: Client\<Transport, Chain | undefined, SmartAccount | undefined> -
    The Client to use.
  * params: ExecuteRecoveryParameters - Parameters to use.
* Returns: Promise\<`0x${string}`> - The user operation hash from executing
  recovery onchain.

#### Function: getAddress

* Description: Gets the Circle smart wallet address for the user.
* Parameters:
  * client: Client\<Transport> - The Client to use.
  * params: GetAddressParameters - Parameters to use.
* Returns: Promise\<ModularWallet> - Circle smart wallet creation response.

#### Function: getAddressMapping

* Description: Gets the address mapping for a given owner.
* Parameters:
  * client: Client\<Transport> - The Client to use.
  * params: GetAddressMappingParameters - Parameters to use.
* Returns: Promise\<GetAddressMappingReturnType> - The mapping result.

#### Function: getLoginOptions

* Description: Returns the login options, including a challenge for
  verification.
* Parameters:
  * client: Client\<Transport> - The Client to use.
  * params: GetLoginOptionsParameters - Parameters to use.
* Returns: Promise\<CustomPublicKeyCredentialRequestOptions> - Credential
  Request Options.

#### Function: getLoginVerification

* Description: Returns the login verification response to indicate if it's
  verified or not.
* Parameters:
  * client: Client\<Transport> - The Client to use.
  * params: GetLoginVerificationParameters - Parameters to use.
* Returns: Promise\<GetLoginVerificationReturnType> - WebAuthn Verification
  Response.

#### Function: getModularWalletAddress

* Description: Gets the Circle modular wallet address.
* Parameters:
  * parameters: GetCircleSmartAccountAddressParameters - The configuration
    object containing the following properties:
    * client: CircleModularWalletClient - The Circle modular wallet client
      instance.
    * owner: WebAuthnAccount - The owner.
    * name?: string - The Circle Smart Account wallet name.
* Returns: Promise\<GetAddressReturnType> - The Circle modular wallet address.

#### Function: getRegistrationOptions

* Description: Returns the registration options, including a challenge for
  verification.
* Parameters:
  * client: Client\<Transport> - The Client to use.
  * params: GetRegistrationOptionsParameters - Parameters to use.
* Returns: Promise\<CustomPublicKeyCredentialCreationOptions> - Credential
  Creation Options.

#### Function: getRegistrationVerification

* Description: Returns the registration verification response to indicate if
  it's verified or not.
* Parameters:
  * client: Client\<Transport> - The Client to use.
  * params: GetRegistrationVerificationParameters - Parameters to use.
* Returns: Promise\<GetRegistrationVerificationReturnType> - WebAuthn
  Verification Response.

### Function: getUserOperationGasPrice

* Description: Gets the user operation gas price.
* Parameters:
  * client: Client\<Transport> - The Client to use..
* Returns: Promise\<GetUserOperationGasPriceResponse> - The user operation gas
  price.

#### Function: modularWalletActions

* Description: Returns the modular wallets actions.
* Parameters:
  * client: Client\<Transport> - The Client to use.
* Returns: ModularWalletActions - modular wallets actions.

#### Function: parseEther (viem)

* Description: Converts a string representation of ether to numerical wei.
* Properties:
  * value: string - The string representation of ether.
* Returns: bigint - The numerical value in wei. For more information, see the
  [Viem documentation](https://viem.sh/docs/utilities/parseEther).

#### Function: parseGwei (viem)

* Description: Converts a string representation of gwei to numerical wei.
* Properties:
  * value: string - The string representation of gwei..
* Returns: bigint - The numerical value in wei. For more information, see the
  [Viem documentation](https://viem.sh/docs/utilities/parseGwei).

#### Function: recoveryActions

* Description: Returns the Recovery actions.
* Parameters:
  * client: Client\<Transport> - The Client to use.
* Returns: RecoveryActions - Recovery Actions.

#### Function: registerRecoveryAddress

* Description: Registers a recovery address during the recovery process.
* Parameters:
  * client: Client\<Transport, Chain | undefined, SmartAccount | undefined> -
    The Client to use.
  * params: RegisterRecoveryAddressParameters - Parameters to use.
* Returns: Promise\<`0x${string}`> - The user operation hash from registering
  the recovery address onchain.

#### Function: rpActions

* Description: Returns the RP actions.
* Parameters:
  * client: Client\<Transport> - The Client to use.
* Returns: RpActions - Rp Actions.

#### Function: toCircleModularWalletClient

* Description: Transforms a client into a Circle modular wallet client using
  decorators.
* Parameters:
  * client: Client - The client instance.
* Returns: CircleModularWalletClient - A decorated Circle modular wallet client.

#### Function: walletClientToLocalAccount

* Description: Creates a Local Account from a Wallet Client.
* Parameters:
  * walletClient: WalletClient - The Wallet Client to use.
* Returns: LocalAccount - A Local Account.

#### Function: webAuthnSign

* Description: Signs a hash and parses it to a ABI-encoded webauthn signature.
  The dynamic part of the secp256r1 signature.
* Parameters:
  * parameters: WebAuthnSignParameters - The configuration object containing the
    following properties:
    * hash: Hash - The hash to sign.
    * owner: WebAuthnAccount - The owner of the account.
* Returns: Promise\<`0x${string}`> - The ABI-encoded webauthn signature.

### Enums

#### AccountType

* Description: Enum class representing the different types of accounts.
* Members:
  * Local - An account that is stored locally and supports private key-based
    signing.
  * WebAuthn - An account that relies on WebAuthn for authentication and
    signing.

#### ContractAddress

* Description: Enum class representing the supported token contract addresses.
* Members:
  * Arbitrum\_ARB - The Arbitrum governance token contract address.
  * Arbitrum\_USDC - The USDC token contract address on Arbitrum.
  * ArbitrumSepolia\_USDC - The USDC token contract address on Arbitrum testnet.
  * ArcTestnet\_USDC - The USDC token contract address on Arc testnet.
  * AvalancheFuji\_USDC - The USDC token contract address on Avalanche testnet.
  * Base\_USDC - The USDC token contract address on Base.
  * BaseSepolia\_USDC - The USDC token contract address on Base testnet.
  * Monad\_USDC - The USDC token contract address on Monad mainnet.
  * MonadTestnet\_USDC - The USDC token contract address on Monad testnet.
  * Optimism\_OP - The Optimism governance token contract address.
  * Optimism\_USDC - The USDC token contract address on Optimism.
  * OptimismSepolia\_USDC - The USDC token contract address on Optimism testnet.
  * Polygon\_USDC - The USDC token contract address on Polygon.
  * PolygonAmoy\_USDC - The USDC token contract address on Polygon testnet.
  * Unichain\_USDC - The USDC token contract address on Unichain.
  * UnichainSepolia\_USDC - The USDC token contract address on Unichain testnet.

#### OwnerIdentifierType

* Description: Enum class representing the owner identifier types for address
  mapping.
* Members:
  * EOA - The Externally Owned Account (EOA) owner identifier.
  * WebAuthn - The WebAuthn owner identifier.

#### WebAuthnMode

* Description: Enum class representing the WebAuthn modes.
* Members:
  * Login - Mode for logging in with an existing credential.
  * Register - Mode for registering a new credential.

### Interfaces

#### AuthenticatorAssertionResponse

* Description: Represents a digital signature from a WebAuthn credential,
  allowing servers to verify and authenticate a user during actions like signing
  in.
* Properties:
  * userHandle: ArrayBuffer - A read-only property providing an opaque
    identifier for linking a user account to its credentials.
    [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/API/AuthenticatorAssertionResponse)

#### AuthenticatorAttestationResponse

* Description: Represents a digital signature from a WebAuthn credential,
  allowing servers to verify and authenticate a user during actions like signing
  in.
* Methods:
  * getPublicKey(): ArrayBuffer - Returns an ArrayBuffer containing the DER
    SubjectPublicKeyInfo of the new credential, or null if unavailable.
    [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/API/AuthenticatorAttestationResponse)

#### CreateCredentialParameters

* Description: Defines the parameters required to create a WebAuthn credential.
* Properties:
  * credential: PublicKeyCredential - The WebAuthn Credential.
  * rpId: string | undefined - The RP ID.

#### CustomPublicKeyCredentialCreationOptions

* Description: Defines the parameters required to create a WebAuthn credential
  with support for custom user entities and advanced authentication options.
* Properties:
  * challenge: string - A unique challenge generated by the server to prevent
    replay attacks.
  * pubKeyCredParams: PublicKeyCredentialParameters\[] - The list of acceptable
    credential types and cryptographic algorithms.
  * rp: PublicKeyCredentialRpEntity - The relying party (RP) entity initiating
    the credential creation.
  * user: CustomPublicKeyCredentialUserEntity - Information about the user for
    whom the credential is being created.
  * attestation?: AttestationConveyancePreference - Indicates the desired
    attestation type (e.g., none, indirect, or direct).
  * authenticatorSelection?: AuthenticatorSelectionCriteria - Specifies criteria
    for selecting the authenticator to use.
  * excludeCredentials?: PublicKeyCredentialDescriptor\[] - Credentials to
    exclude during the creation process to prevent duplication.
  * extensions?: AuthenticationExtensionsClientInputs - Additional extensions
    for client-side processing during credential creation.
  * timeout?: number - The time (in milliseconds) the operation is allowed to
    take before timing out.

#### CustomPublicKeyCredentialDescriptor

* Description: Represents a descriptor for a WebAuthn credential.
* Properties:
  * id: string - The unique identifier for the credential.
  * type: "public-key" - The type of credential, which is always "public-key"
    for WebAuthn.
  * transports?: AuthenticatorTransport\[] - The list of supported transport
    methods.

#### CustomPublicKeyCredentialRequestOptions

* Description: Defines the parameters for requesting a WebAuthn credential.
* Properties:
  * challenge: string - A unique challenge generated by the server to prevent
    replay attacks.
  * allowCredentials?: CustomPublicKeyCredentialDescriptor\[] - A list of
    credentials that are allowed to authenticate the user.
  * extensions?: AuthenticationExtensionsClientInputs - Additional extensions
    for client-side processing during the authentication process.
  * rpId?: string - The relying party (RP) ID associated with the authentication
    request.
  * timeout?: number - The time (in milliseconds) the operation is allowed to
    take before timing out.
  * userVerification?: UserVerificationRequirement - Specifies the user
    verification level required.

#### CustomPublicKeyCredentialUserEntity

* Description: Represents information about a user entity for creating or
  managing WebAuthn credentials.
* Properties:
  * displayName: string - The user's display name.
  * id: string - A unique identifier for the user.
  * name: string - The user's name (for example, username or email).

#### EstimateExecuteRecoveryGasParameters

* Description: Defines the parameters required to estimate gas to execute
  recovery.
* Properties:
  * credential: P256Credential - The newly registered passkey credential.

#### EstimateRegisterRecoveryAddressGasParameters

* Description: Defines the parameters required to estimate gas to register a
  recovery address.
* Properties:
  * recoveryAddress: `0x${string}` - The derived address of the recovery key.

#### ExecuteRecoveryParameters

* Description: Defines the parameters required to execute recovery.
* Properties:
  * credential: P256Credential - The newly registered passkey credential.

#### GetLoginVerificationReturnType

* Description: Represents the return type for a login verification request.
* Properties:
  * publicKey: string - The public key associated with the login verification
    process.

#### GetRegistrationVerificationReturnType

* Description: Represents the return type for a registration verification
  request.
* Properties:
  * verified?: null | boolean - The verification status, which can be true
    (verified), false (not verified), or null (no status available).

#### GetUserOperationGasPriceReturnType

* Description: Represents the return type for the
  circle\_getUserOperationGasPrice RPC method.
* Properties:
  * low: GasPriceLevel - The low gas price level.
  * medium: GasPriceLevel - The medium gas price level.
  * high: GasPriceLevel - The high gas price level.
  * deployed?: boolean - The deployed verification gas.
  * notDeployed?: boolean - The non-deployed verification gas.

#### RegisterRecoveryAddressParameters

* Description: Defines the parameters required to register a recovery address.
* Properties:
  * recoveryAddress: `0x${string}` - The recovery address.

#### ToCircleModularWalletClientParameters

* Description: Defines the parameters required to create a Circle Modular Wallet
  Client.
* Properties:
  * client: Client - The client instance used to interact with the Circle
    Modular Wallet.

#### ToWebAuthnAccountParameters

* Description: Defines the parameters required to convert an account to a
  WebAuthn-based account.
* Properties:
  * mode: WebAuthnMode - The WebAuthn mode to be used.
  * transport: Transport - The transport mechanism used for interacting with the
    WebAuthn API.
  * credentialId?: string - The ID of the WebAuthn credential.
  * username?: string - The username associated with the account.

#### WebAuthnCredential

* Description: Represents a WebAuthn credential.
* Properties:
  * id: string - The unique identifier for the WebAuthn credential.
  * publicKey: `0x${string}` - The public key associated with the credential, in
    hexadecimal format.
  * raw: PublicKeyCredential - The raw WebAuthn credential object.
  * rpId: undefined | string - The relying party (RP) ID linked to the
    credential.

### Types

#### CircleModularWalletClient

* Description: Represents a client for interacting with modular wallets.
* Type Definition:

```javascript JavaScript theme={null}
type CircleModularWalletClient: Client<
    Transport,
    Chain | undefined,
    Account | undefined,
    ExtendedRpcSchema<RpcSchema>,
    ModularWalletActions,
>
```

#### CircleSmartAccountImplementation

* Description: Extends the SmartAccountImplementation with additional factory
  arguments and signing capabilities specific to Circle's modular smart contract
  accounts.
* Type Definition:

```javascript JavaScript theme={null}
type CircleSmartAccountImplementation = Assign<
  SmartAccountImplementation<
    typeof entryPoint07Abi,
    "0.7",
    {
      abi: typeof entryPoint07Abi;
      factory: {
        abi: typeof CIRCLE_MSCA_6900_V1_EP07_FACTORY_ABI;
        address: Address;
      };
    }
<Note>
  >,
</Note>
  {
    getFactoryArgs: NonNullable<
      SmartAccountImplementation["getFactoryArgs"]
<Note>
    >;
</Note>
    sign: NonNullable<SmartAccountImplementation["sign"]>;
  }
>
```

#### CreateAddressMappingReturnType

* Description: The return type for adding an address mapping.
* Type Definition:

```javascript JavaScript theme={null}
CreateAddressMappingReturnType: AddressMappingResponse[]
```

#### CreateAddressMappingRpcSchema

* Description: The RPC schema for adding an address mapping.
* Type Definition:

```javascript JavaScript theme={null}
type CreateAddressMappingRpcSchema = {
  Method: "circle_createAddressMapping",
  Parameters: [CreateAddressMappingParameters],
  ReturnType: CreateAddressMappingReturnType,
};
```

#### CreateRpClientErrorType

* Description: Represents possible error types for creating an RP Client,
  combining standard client error types and additional error types.
* Type Definition:

```javascript JavaScript theme={null}
type CreateRpClientErrorType = CreateClientErrorType | ErrorType;
```

#### ExtendedRpcSchema\<rpcSchema>

* Description: Extends the base RPC schema by appending the Modular Wallet RPC
  schema. If rpcSchema is provided and extends RpcSchema, it combines both;
  otherwise, it defaults to the Modular Wallet RPC schema.
* Type Definition:

```javascript JavaScript theme={null}
type ExtendedRpcSchema = rpcSchema extends RpcSchema
  ? [...ModularWalletRpcSchema, ...rpcSchema]
  : ModularWalletRpcSchema
```

#### GetAddressMappingReturnType

* Description: The return type for getting an address mapping.
* Type Definition:

```javascript JavaScript theme={null}
GetAddressMappingReturnType: AddressMappingResponse[]
```

#### GetAddressMappingRpcSchema

* Description: Get the address mapping for the specified owner.
* Type Definition:

```javascript JavaScript theme={null}
type GetAddressMappingRpcSchema = {
  Method: "circle_getAddressMapping",
  Parameters: [GetAddressMappingParameters],
  ReturnType: GetAddressMappingReturnType,
};
```

#### GetAddressParameters

* Description: Defines the parameters required for retrieving an address.
* Type Definition:

```javascript JavaScript theme={null}
type GetAddressParameters = [
  {
    metadata?: { name?: string };
    scaConfiguration: {
      initialOwnershipConfiguration: Omit<
        InitialOwnershipConfiguration,
        "ownershipContractAddress"
<Note>
      >;
</Note>
      scaCore: string;
    };
  },
]
```

#### GetAddressReturnType

* Description: The Get Circle modular wallet address response.
* Type Definition:

```javascript JavaScript theme={null}
type GetAddressReturnType = ModularWallet;
```

#### GetAddressRpcSchema

* Description: Defines the RPC schema for the circle\_getAddress method
* Type Definition:

```javascript JavaScript theme={null}
type GetAddressRpcSchema = {
  Method: "circle_getAddress";
  Parameters?: [
    {
      scaConfiguration: {
        initialOwnershipConfiguration: Omit<
          InitialOwnershipConfiguration,
          "ownershipContractAddress"
<Note>
        >;
</Note>
        scaCore: string;
      };
    }
  ];
  ReturnType: GetAddressReturnType;
}
```

#### GetLoginOptionsParameters

* Description: Defines the parameters required to retrieve login options.
* Type Definition:

```javascript JavaScript theme={null}
type GetLoginOptionsParameters = {
  userId: string,
};
```

#### GetLoginOptionsReturnType

* Description: Defines the parameters required to retrieve login options.
* Type Definition:

```javascript JavaScript theme={null}
type GetLoginOptionsReturnType = CustomPublicKeyCredentialRequestOptions;
```

#### GetLoginOptionsRpcSchema

* Description: Defines the RPC schema for the rp\_getLoginOptions method.
* Type Definition:

```javascript JavaScript theme={null}
type GetLoginOptionsRpcSchema = {
  Method: "rp_getLoginOptions";
  Parameters?: [userId: string];
  ReturnType: GetLoginOptionsReturnType;
}
```

#### GetLoginVerificationParameters

* Description: Defines the parameters required to verify a login attempt.
* Type Definition:

```javascript JavaScript theme={null}
type GetLoginVerificationParameters = {
  credential: PublicKeyCredential,
};
```

#### GetLoginVerificationRpcSchema

* Description: Defines the RPC schema for the rp\_getLoginVerification method.
* Type Definition:

```javascript JavaScript theme={null}
type GetLoginVerificationRpcSchema = {
  Method: "rp_getLoginVerification";
  Parameters?: [authenticationCredential: PublicKeyCredential];
  ReturnType: GetLoginVerificationReturnType;
}
```

#### GetRegistrationOptionsParameters

* Description: Defines the parameters required to retrieve registration options.
* Type Definition:

```javascript JavaScript theme={null}
type GetRegistrationOptionsParameters = {
  username: string,
};
```

#### GetRegistrationOptionsReturnType

* Description: Represents the return type for retrieving registration options.
* Type Definition:

```javascript JavaScript theme={null}
type GetRegistrationOptionsReturnType =
  CustomPublicKeyCredentialCreationOptions;
```

#### GetRegistrationOptionsRpcSchema

* Description: Defines the RPC schema for the rp\_getRegistrationOptions method.
* Type Definition:

```javascript JavaScript theme={null}
type GetRegistrationOptionsRpcSchema = {
  Method: "rp_getRegistrationOptions";
  Parameters?: [username: string];
  ReturnType: GetRegistrationOptionsReturnType;
}
```

#### GetRegistrationVerificationParameters

* Description: Defines the parameters required to verify a registration attempt.
* Type Definition:

```javascript JavaScript theme={null}
type GetRegistrationVerificationParameters = {
  credential: PublicKeyCredential,
};
```

#### GetRegistrationVerificationRpcSchema

* Description: Defines the RPC schema for the rp\_getRegistrationVerification
  method.
* Type Definition:

```javascript JavaScript theme={null}
type GetRegistrationVerificationRpcSchema = {
  Method: "rp_getRegistrationVerification";
  Parameters?: [registrationCredential: PublicKeyCredential];
  ReturnType: GetRegistrationVerificationReturnType;
}
```

#### GetUserOperationGasPriceRpcSchema

* Description: Defines the RPC schema for the circle\_getUserOperationGasPrice
  method.
* Type Definition:

```javascript JavaScript theme={null}
type GetUserOperationGasPriceRpcSchema = {
  Method: "circle_getUserOperationGasPrice",
  Parameters?: [],
  ReturnType: GetUserOperationGasPriceReturnType,
};
```

#### ModularWalletActions

* Description: Represents the available actions for a modular wallet,
* Type Definition:

```javascript JavaScript theme={null}
type ModularWalletActions = {
  getAddress: (
    parameters: GetAddressParameters
  ) => Promise<GetAddressReturnType>,
};
```

#### ModularWalletRpcSchema

* Description: Represents the RPC schema for modular wallets.
* Type Definition:

```javascript JavaScript theme={null}
type ModularWalletRpcSchema = [GetAddressRpcSchema];
```

#### RecoveryActions

* Description: Represents the actions available for the passkey recovery
  process.
* Type Definition:

```javascript JavaScript theme={null}
type RecoveryActions = {
  estimateExecuteRecoveryGas: (
    parameters: EstimateExecuteRecoveryGasParameters
  ) => Promise<EstimateUserOperationGasReturnType>,
  estimateRegisterRecoveryAddressGas: (
    parameters: EstimateRegisterRecoveryAddressGasParameters
  ) => Promise<EstimateUserOperationGasReturnType>,
  executeRecovery: (
    parameters: ExecuteRecoveryParameters
  ) => Promise<SendUserOperationReturnType>,
  registerRecoveryAddress: (
    params: RegisterRecoveryAddressParameters
  ) => Promise<SendUserOperationReturnType>,
};
```

#### RpActions

* Description: Represents the actions available for the RP (Relying Party) API.
* Type Definition:

```javascript JavaScript theme={null}
type RpActions = {
  getLoginOptions: (
    parameters: GetLoginOptionsParameters
  ) => Promise<GetLoginOptionsReturnType>,
  getLoginVerification: (
    parameters: GetLoginVerificationParameters
  ) => Promise<GetLoginVerificationReturnType>,
  getRegistrationOptions: (
    parameters: GetRegistrationOptionsParameters
  ) => Promise<GetRegistrationOptionsReturnType>,
  getRegistrationVerification: (
    parameters: GetRegistrationVerificationParameters
  ) => Promise<GetRegistrationVerificationReturnType>,
};
```

#### RpClient\<transport, rpcSchema>

* Description: Represents a prettified RP (Relying Party) client.
* Type Definition:

```javascript JavaScript theme={null}
type RpClient = Prettify<
  Client<
    transport,
    undefined,
    undefined,
    rpcSchema extends RpcSchema
      ? [...RpRpcSchema, ...rpcSchema]
      : RpRpcSchema,
    RpActions
  >
>
```

#### RpClientConfig\<transport, rpcSchema>

* Description: Represents the configuration options for creating an RP (Relying
  Party) client.
* Type Definition:

```javascript JavaScript theme={null}
type RpClientConfig = Prettify<
  Pick<
    ClientConfig<transport, undefined, undefined, rpcSchema>,
    "cacheTime" | "key" | "name" | "pollingInterval" | "rpcSchema" | "transport"
  >
>;
```

#### RpRpcSchema

* Description: Represents the RPC schema for the RP (Relying Party) client.
* Type Definition:

```javascript JavaScript theme={null}
type RpRpcSchema = [
  GetLoginOptionsRpcSchema,
  GetLoginVerificationRpcSchema,
  GetRegistrationOptionsRpcSchema,
  GetRegistrationVerificationRpcSchema
];
```

#### ToCircleSmartAccountParameters

* Description: Defines the parameters required to create a Circle Smart Account.
* Type Definition:

```javascript JavaScript theme={null}
type ToCircleSmartAccountParameters = {
  address?: Address,
  client: Client,
  name?: string,
  nonce?: bigint,
  owner: WebAuthnAccount,
};
```

#### ToCircleSmartAccountReturnType

* Description: Represents the return type for creating a Circle Smart Account.
* Type Definition:

```javascript JavaScript theme={null}
type ToCircleSmartAccountReturnType = Prettify<
  SmartAccount<CircleSmartAccountImplementation>
>;
```


---

> To find navigation and other pages in this documentation, fetch the llms.txt file at: https://developers.circle.com/llms.txt