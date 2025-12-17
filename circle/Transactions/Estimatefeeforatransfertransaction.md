# Estimate fee for a transfer transaction

> Estimates gas fees that will be incurred for a transfer transaction; given its amount, blockchain, and token.

## OpenAPI

```yaml openapi/developer-controlled-wallets.yaml post /v1/w3s/transactions/transfer/estimateFee
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
  /v1/w3s/transactions/transfer/estimateFee:
    post:
      tags:
        - Transactions
      summary: Estimate fee for a transfer transaction
      description: >-
        Estimates gas fees that will be incurred for a transfer transaction;
        given its amount, blockchain, and token.
      operationId: createTransferEstimateFee
      parameters:
        - $ref: '#/components/parameters/XRequestId'
      requestBody:
        $ref: '#/components/requestBodies/EstimateTransferTransactionFee'
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
    EstimateTransferTransactionFee:
      content:
        application/json:
          schema:
            title: EstimateTransferTransactionFeeRequest
            type: object
            required:
              - amounts
              - destinationAddress
            properties:
              amounts:
                $ref: '#/components/schemas/TransferAmounts-2'
              destinationAddress:
                $ref: '#/components/schemas/Address'
              nftTokenIds:
                $ref: '#/components/schemas/NftTokenIds'
              sourceAddress:
                $ref: '#/components/schemas/SourceAddress'
              tokenId:
                $ref: '#/components/schemas/TokenId'
              tokenAddress:
                $ref: '#/components/schemas/TokenAddress'
              blockchain:
                $ref: '#/components/schemas/TokenBlockchain'
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
    TransferAmounts-2:
      title: TransferAmounts
      type: array
      items:
        type: string
      description: >-
        Transfer amounts in decimal number format, at least one element is
        required for transfer. For ERC721 token transfer, the amounts field is
        required to be ["1"] (array with "1" as the only element).
      example:
        - '6.62607015'
      minItems: 1
    Address:
      title: Address
      description: >
        Blockchain generated unique identifier, associated with wallet
        (account), smart contract or other blockchain objects.
      type: string
      example: '0xca9142d0b9804ef5e239d3bc1c7aa0d1c74e7350'
    NftTokenIds:
      title: NftTokenIds
      type: array
      description: >-
        List of NFT token IDs corresponding with the NFTs to transfer. Batch
        transfers are supported only for ERC-1155 tokens. The length of NFT
        token IDs must match the length of amounts.
      items:
        $ref: '#/components/schemas/NftTokenId'
    SourceAddress:
      type: string
      description: >
        Source address of the transaction. Required along with `blockchain` if
        `walletId` is not provided. 

        The `sourceAddress` and `walletId` fields are mutually exclusive.
      example: '0x1bf9ad0cc2ad298c69a2995aa806ee832788218c'
    TokenId:
      title: TokenId
      type: string
      format: uuid
      description: >-
        System generated identifier of the token. Excluded with `tokenAddress`
        and `tokenBlockchain`.
    TokenAddress:
      title: TokenAddress
      type: string
      description: >-
        Blockchain address of the transferred token. Empty for native tokens.
        Excluded with `tokenId`.
    TokenBlockchain:
      title: TokenBlockchain
      type: string
      description: >
        Blockchain of the transferred token. Required if `tokenId` is not
        provided.

        The `blockchain` and `tokenId` fields are mutually exclusive.
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
    NftTokenId:
      title: NftTokenId
      type: string
      description: The NFT token ID.
      example: '2'
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
 --url https://api.circle.com/v1/w3s/transactions/transfer/estimateFee \
 --header 'Authorization: Bearer <token>' \
 --header 'Content-Type: application/json' \
 --data '
{
"amounts": [
"6.62607015"
],
"destinationAddress": "0xca9142d0b9804ef5e239d3bc1c7aa0d1c74e7350",
"nftTokenIds": [
"2"
],
"sourceAddress": "0x1bf9ad0cc2ad298c69a2995aa806ee832788218c",
"tokenId": "3c90c3cc-0d44-4b50-8888-8dd25736052a",
"tokenAddress": "<string>",
"blockchain": "MATIC-AMOY",
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
