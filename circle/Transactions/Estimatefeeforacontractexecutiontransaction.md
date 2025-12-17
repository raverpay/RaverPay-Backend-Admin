# Estimate fee for a contract execution transaction

> Estimates gas fees that will be incurred for a contract execution transaction, given its ABI parameters and blockchain.

## OpenAPI

```yaml openapi/developer-controlled-wallets.yaml post /v1/w3s/transactions/contractExecution/estimateFee
openapi: 3.0.3
info:
  version: '1.0'
  title: Developer-Controlled Wallets
  description: Developer-Controlled Wallets API documentation.
servers:
  - url: https://api.circle.com
security:
  - BearerAuth: []
tags:
  - name: Wallet Sets
  - name: Wallets
  - name: Signing
  - name: Transactions
  - name: Token Lookup
paths:
  /v1/w3s/transactions/contractExecution/estimateFee:
    post:
      tags:
        - Transactions
      summary: Estimate fee for a contract execution transaction
      description: >-
        Estimates gas fees that will be incurred for a contract execution
        transaction, given its ABI parameters and blockchain.
      operationId: createTransactionEstimateFee
      parameters:
        - $ref: '#/components/parameters/XRequestId'
      requestBody:
        $ref: '#/components/requestBodies/EstimateContractExecutionTransactionFee'
      responses:
        '200':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/EstimateTransactionFee'
          description: Transaction fee estimated
          headers:
            X-Request-Id:
              $ref: '#/components/headers/XRequestId'
        '400':
          $ref: '#/components/responses/DefaultError'
        '404':
          $ref: '#/components/responses/NotFound'
      security:
        - BearerAuth: []
components:
  parameters:
    XRequestId:
      name: X-Request-Id
      description: >-
        Developer-provided parameter used to identify this request. Useful when
        communicating with Circle Support.
      in: header
      schema:
        $ref: '#/components/schemas/XRequestId'
  requestBodies:
    EstimateContractExecutionTransactionFee:
      content:
        application/json:
          schema:
            title: EstimateContractExecutionTransactionFeeRequest
            type: object
            required:
              - contractAddress
            properties:
              abiFunctionSignature:
                $ref: '#/components/schemas/AbiFunctionSignature'
              abiParameters:
                $ref: '#/components/schemas/AbiParameters'
              callData:
                $ref: '#/components/schemas/CallData'
              amount:
                $ref: '#/components/schemas/Amount'
              blockchain:
                $ref: '#/components/schemas/ContractExecutionBlockchain'
              contractAddress:
                $ref: '#/components/schemas/ContractAddress'
              sourceAddress:
                $ref: '#/components/schemas/SourceAddress'
              walletId:
                $ref: '#/components/schemas/WalletId'
      description: Estimate transaction fee request
      required: true
  schemas:
    EstimateTransactionFee:
      title: EstimateTransactionFeeResponse
      type: object
      required:
        - data
      properties:
        data:
          type: object
          properties:
            high:
              $ref: '#/components/schemas/TransactionFee'
            low:
              $ref: '#/components/schemas/TransactionFee'
            medium:
              $ref: '#/components/schemas/TransactionFee'
            callGasLimit:
              $ref: '#/components/schemas/CallGasLimit'
            verificationGasLimit:
              $ref: '#/components/schemas/VerificationGasLimit'
            preVerificationGas:
              $ref: '#/components/schemas/PreVerificationGas'
    XRequestId:
      type: string
      description: >-
        A unique identifier, which can be helpful for identifying a request when
        communicating with Circle support.
      example: 2adba88e-9d63-44bc-b975-9b6ae3440dde
    AbiFunctionSignature:
      title: AbiFunctionSignature
      type: string
      description: "The contract ABI function signature or\_`callData`\_field is required for interacting with the smart contract. The ABI function signature cannot be used simultaneously with\_`callData`. e.g. burn(uint256)"
      example: burn(uint256)
    AbiParameters:
      title: AbiParameters
      type: array
      items:
        anyOf:
          - type: string
          - type: integer
          - type: boolean
          - type: array
            items: {}
      description: "The contract ABI function signature parameters for executing the contract interaction. Supported parameter types include string, integer, boolean, and array. These parameters should be used exclusively with the abiFunctionSignature and cannot be used with\_`callData`."
      example:
        - '100'
        - '1'
    CallData:
      title: CallData
      type: string
      description: "The raw transaction data, must be an even-length hexadecimal string with the\_`0x`\_prefix, to be executed. It is important to note that the usage of\_`callData`\_is mutually exclusive with the\_`abiFunctionSignature`\_and\_`abiParameters`. Therefore,\_`callData`\_cannot be utilized simultaneously with either\_`abiFunctionSignature`\_or\_`abiParameters`."
      example: >-
        0xcdcd77c000000000000000000000000000000000000000000000000000000000000000450000000000000000000000000000000000000000000000000000000000000001
    Amount:
      title: Amount
      type: string
      description: >-
        The amount of native token that will be sent to the contract abi
        execution. Optional field for payable api only, if not provided, no
        native token will be sent.
      example: '1.0'
    ContractExecutionBlockchain:
      title: ContractExecutionBlockchain
      type: string
      description: >
        Blockchain associated with the contract execution transaction. Required
        when either of `walletAddress` or `sourceAddress` is provided.

        The `blockchain` and `walletId` fields are mutually exclusive.
      enum:
        - ETH
        - ETH-SEPOLIA
        - AVAX
        - AVAX-FUJI
        - MATIC
        - MATIC-AMOY
        - ARB
        - ARB-SEPOLIA
        - UNI
        - UNI-SEPOLIA
        - BASE
        - BASE-SEPOLIA
        - OP
        - OP-SEPOLIA
        - ARC-TESTNET
        - MONAD
        - MONAD-TESTNET
      example: MATIC-AMOY
    ContractAddress:
      title: ContractAddress
      description: The blockchain address of the contract to be executed.
      type: string
      example: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
    SourceAddress:
      type: string
      description: >
        Source address of the transaction. Required along with `blockchain` if
        `walletId` is not provided. 

        The `sourceAddress` and `walletId` fields are mutually exclusive.
      example: '0x1bf9ad0cc2ad298c69a2995aa806ee832788218c'
    WalletId:
      title: WalletId
      type: string
      format: uuid
      description: |
        Unique system generated identifier of the wallet.
        For contract deploys this wallet ID will be used as the source.
      example: a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11
    TransactionFee:
      type: object
      properties:
        gasLimit:
          $ref: '#/components/schemas/GasLimit'
        gasPrice:
          $ref: '#/components/schemas/GasPrice'
        maxFee:
          $ref: '#/components/schemas/MaxFee'
        priorityFee:
          $ref: '#/components/schemas/PriorityFee'
        baseFee:
          $ref: '#/components/schemas/BaseFee'
        networkFee:
          $ref: '#/components/schemas/NetworkFee'
        networkFeeRaw:
          $ref: '#/components/schemas/NetworkFeeRaw'
        l1Fee:
          $ref: '#/components/schemas/L1Fee'
    CallGasLimit:
      title: CallGasLimit
      type: string
      description: >-
        One of ERC-4337 gas fields. The amount of gas to allocate for the main
        execution call. Only in smart contract account estimation response.
      example: '69222'
    VerificationGasLimit:
      title: VerificationGasLimit
      type: string
      description: >-
        One of ERC-4337 gas fields. The amount of gas to allocate for the
        verification step. Only in smart contract account estimation response.
      example: '56863'
    PreVerificationGas:
      title: PreVerificationGas
      type: string
      description: >-
        One of ERC-4337 gas fields. The amount of gas to pay to compensate the
        bundler for pre-verification execution and call data. Only in smart
        contract account estimation response.
      example: '44112'
    Error:
      title: Error
      type: object
      required:
        - code
        - message
      properties:
        code:
          type: integer
          description: Code that corresponds to the error.
        message:
          type: string
          description: Message that describes the error.
    GasLimit:
      type: string
      description: >
        The maximum units of gas to use for the transaction. Required if
        `feeLevel` is not provided.

        Estimates for this limit can be obtained through the [`POST
        /transactions/transfer/estimateFee`](/api-reference/w3s/developer-controlled-wallets/create-transfer-estimate-fee)
        API.

        GasLimit override (only supported for EOA wallets): Using `gasLimit`
        together with `feeLevel`, the provided `gasLimit` is required to be
        greater or equal to `feeLevel` estimation and will override the
        estimation's gasLimit.
      example: '21000'
    GasPrice:
      type: string
      description: >
        For blockchains without EIP-1559 support, the maximum price of gas, in
        gwei, to use per each unit of gas (see `gasLimit`). Requires `gasLimit`.
        Cannot be used with `feeLevel`, `priorityFee`, or `maxFee`.

        Estimates for this fee can be obtained through the [`POST
        /transactions/transfer/estimateFee`](/api-reference/w3s/developer-controlled-wallets/create-transfer-estimate-fee)
        API.
    MaxFee:
      type: string
      example: '5.935224468'
      description: >
        For blockchains with EIP-1559 support, the maximum price per unit of gas
        (see `gasLimit`), in gwei. Requires `priorityFee`, and `gasLimit` to be
        present. Cannot be used with `feeLevel` or `gasPrice`.

        Estimates for this fee can be obtained through the [`POST
        /transactions/transfer/estimateFee`](/api-reference/w3s/developer-controlled-wallets/create-transfer-estimate-fee)
        API.
    PriorityFee:
      type: string
      example: '1.022783914'
      description: >
        For blockchains with EIP-1559 support, the “tip”, in gwei, to add to the
        base fee as an incentive for validators.

        Please note that the `maxFee` and `gasLimit` parameters are required
        alongside the `priorityFee`. The `feeLevel` and `gasPrice` parameters
        cannot be used with the `priorityFee`. 

        Estimations for this fee can be obtained through the [`POST
        /transactions/transfer/estimateFee`](/api-reference/w3s/developer-controlled-wallets/create-transfer-estimate-fee)
        API.
    BaseFee:
      type: string
      example: '1.022783914'
      description: >
        For blockchains with EIP-1559 support, the estimated base fee represents
        the minimum fee required for a transaction to be included in a block on
        the blockchain. 

        It is measured in gwei and compensates for the computational resources
        validators consume to process the transaction. 

        The base fee is supplemented by a separate "tip" called the priority
        fee, which acts as an extra incentive for validators to prioritize the
        transaction. 

        The priority fee is added to the base fee to calculate the final
        transaction fee.
    NetworkFee:
      type: string
      example: '0.0001246397138'
      description: >
        The estimated network fee is the maximum amount of cryptocurrency (such
        as ETH, ARB, or SOL) that you will pay for your transaction. This fee
        depends on the parameters you set, including Gas Limit, Priority Fee,
        and Max Fee.

        It compensates for the computational resources that validators consume
        to process the transaction. It is measured in native token such as ETH,
        SOL.

        For blockchains with L1 data fees such as OP/BASE, the network fee is a
        combination of the Execution Gas Fee and the L1 Data Fee.

        Each blockchain might use different formula for network fee. Refer to
        each specific blockchain's documentation to understand how `networkFee`
        is calculated.
    NetworkFeeRaw:
      type: string
      example: '0.0001246397138'
      description: >
        Similar to `networkFee`, `networkFeeRaw` is an estimation with lower
        buffer and thus should be closer to the actual on-chain expense. 

        This field will only be returned in the estimation response.
    L1Fee:
      type: string
      example: '0.000000000000140021'
      description: >
        This fee represents the Layer 1 (L1) rollup charge associated with
        transactions on Layer 2 blockchains. The amount is expressed in the
        native currency, such as ETH. This field is relevant for Layer 2
        blockchains utilizing a rollup mechanism and for specific account types,
        such as externally owned accounts (EOAs) on the Optimism (OP)
        blockchain.
  headers:
    XRequestId:
      description: >
        Developer-provided header parameter or Circle-generated universally
        unique identifier (UUID v4). Useful for identifying a specific request
        when communicating with Circle Support.
      schema:
        $ref: '#/components/schemas/XRequestId'
  responses:
    DefaultError:
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
      description: Error response
      headers:
        X-Request-Id:
          $ref: '#/components/headers/XRequestId'
    NotFound:
      content:
        application/json:
          schema:
            type: object
            title: NotFoundResponse
            required:
              - code
              - message
            properties:
              code:
                type: integer
                description: Code that corresponds to the error.
              message:
                type: string
                description: Message that describes the error.
            example:
              code: 404
              message: Not found.
      description: Specified resource was not found.
      headers:
        X-Request-Id:
          $ref: '#/components/headers/XRequestId'
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: PREFIX:ID:SECRET
      description: >-
        Circle's API Keys are formatted in the following structure
        "PREFIX:ID:SECRET". All three parts are requred to make a successful
        request.
```

---

curl --request POST \
 --url https://api.circle.com/v1/w3s/transactions/contractExecution/estimateFee \
 --header 'Authorization: Bearer <token>' \
 --header 'Content-Type: application/json' \
 --data '
{
"contractAddress": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
"abiFunctionSignature": "burn(uint256)",
"abiParameters": [
"100",
"1"
],
"callData": "0xcdcd77c000000000000000000000000000000000000000000000000000000000000000450000000000000000000000000000000000000000000000000000000000000001",
"amount": "1.0",
"blockchain": "MATIC-AMOY",
"sourceAddress": "0x1bf9ad0cc2ad298c69a2995aa806ee832788218c",
"walletId": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"
}
'

200
{
"data": {
"high": {
"gasLimit": "21000",
"gasPrice": "<string>",
"maxFee": "5.935224468",
"priorityFee": "1.022783914",
"baseFee": "1.022783914",
"networkFee": "0.0001246397138",
"networkFeeRaw": "0.0001246397138",
"l1Fee": "0.000000000000140021"
},
"low": {
"gasLimit": "21000",
"gasPrice": "<string>",
"maxFee": "5.935224468",
"priorityFee": "1.022783914",
"baseFee": "1.022783914",
"networkFee": "0.0001246397138",
"networkFeeRaw": "0.0001246397138",
"l1Fee": "0.000000000000140021"
},
"medium": {
"gasLimit": "21000",
"gasPrice": "<string>",
"maxFee": "5.935224468",
"priorityFee": "1.022783914",
"baseFee": "1.022783914",
"networkFee": "0.0001246397138",
"networkFeeRaw": "0.0001246397138",
"l1Fee": "0.000000000000140021"
},
"callGasLimit": "69222",
"verificationGasLimit": "56863",
"preVerificationGas": "44112"
}
}

400
{
"code": 123,
"message": "<string>"
}

404
{
"code": 404,
"message": "Not found."
}
