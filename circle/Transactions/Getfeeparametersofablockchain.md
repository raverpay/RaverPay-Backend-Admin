    # Get fee parameters of a blockchain

> Get latest fee parameters of a blockchain with an optional account type (default to 'EOA').

## OpenAPI

```yaml openapi/developer-controlled-wallets.yaml get /v1/w3s/developer/transactions/feeParameters
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
  /v1/w3s/developer/transactions/feeParameters:
    get:
      tags:
        - Transactions
      summary: Get fee parameters of a blockchain
      description: >-
        Get latest fee parameters of a blockchain with an optional account type
        (default to 'EOA').
      operationId: getFeeParameters
      parameters:
        - $ref: '#/components/parameters/Blockchain'
        - $ref: '#/components/parameters/AccountType'
      responses:
        '200':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/FeeParametersResponse'
          description: Fee parameters retrieved
          headers:
            X-Request-Id:
              $ref: '#/components/headers/XRequestId'
        '400':
          $ref: '#/components/responses/DefaultError'
      security:
        - BearerAuth: []
components:
  parameters:
    Blockchain:
      name: blockchain
      description: Filter by blockchain.
      in: query
      schema:
        $ref: '#/components/schemas/Blockchain'
    AccountType:
      name: accountType
      description: Query by the account type.
      in: query
      schema:
        $ref: '#/components/schemas/AccountType'
  schemas:
    FeeParametersResponse:
      title: FeeParametersResponse
      type: object
      required:
        - data
      properties:
        data:
          type: object
          properties:
            high:
              $ref: '#/components/schemas/FeeParameters'
            low:
              $ref: '#/components/schemas/FeeParameters'
            medium:
              $ref: '#/components/schemas/FeeParameters'
    Blockchain:
      type: string
      description: >-
        The blockchain network that the resource is to be created on or is
        currently on.
      enum:
        - ETH
        - ETH-SEPOLIA
        - AVAX
        - AVAX-FUJI
        - MATIC
        - MATIC-AMOY
        - SOL
        - SOL-DEVNET
        - ARB
        - ARB-SEPOLIA
        - NEAR
        - NEAR-TESTNET
        - EVM
        - EVM-TESTNET
        - UNI
        - UNI-SEPOLIA
        - BASE
        - BASE-SEPOLIA
        - OP
        - OP-SEPOLIA
        - APTOS
        - APTOS-TESTNET
        - ARC-TESTNET
        - MONAD
        - MONAD-TESTNET
      example: MATIC-AMOY
    AccountType:
      type: string
      description: >
        An account can be a Smart Contract Account (SCA) or an Externally Owned
        Account (EOA). To learn more, see the [account types
        guide](https://developers.circle.com/wallets/account-types).


        If an account type is not specified during the creation of a wallet, it
        defaults to `EOA` (Externally Owned Account). Note that Solana and Aptos
        don't support Smart Contract Account (SCA).
      enum:
        - SCA
        - EOA
    FeeParameters:
      type: object
      properties:
        gasPrice:
          $ref: '#/components/schemas/GasPrice'
        maxFee:
          $ref: '#/components/schemas/MaxFee'
        priorityFee:
          $ref: '#/components/schemas/PriorityFee'
        baseFee:
          $ref: '#/components/schemas/BaseFee'
    XRequestId:
      type: string
      description: >-
        A unique identifier, which can be helpful for identifying a request when
        communicating with Circle support.
      example: 2adba88e-9d63-44bc-b975-9b6ae3440dde
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

curl
curl --request GET \
 --url https://api.circle.com/v1/w3s/developer/transactions/feeParameters \
 --header 'Authorization: Bearer <token>'

200
{
"data": {
"high": {
"gasPrice": "<string>",
"maxFee": "5.935224468",
"priorityFee": "1.022783914",
"baseFee": "1.022783914"
},
"low": {
"gasPrice": "<string>",
"maxFee": "5.935224468",
"priorityFee": "1.022783914",
"baseFee": "1.022783914"
},
"medium": {
"gasPrice": "<string>",
"maxFee": "5.935224468",
"priorityFee": "1.022783914",
"baseFee": "1.022783914"
}
}
}

400
{
"code": 123,
"message": "<string>"
}
