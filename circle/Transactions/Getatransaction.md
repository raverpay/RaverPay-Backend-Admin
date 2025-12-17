# Get a transaction

> Retrieves info for a single transaction using it's unique identifier.

## OpenAPI

```yaml openapi/developer-controlled-wallets.yaml get /v1/w3s/transactions/{id}
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
  /v1/w3s/transactions/{id}:
    get:
      tags:
        - Transactions
      summary: Get a transaction
      description: Retrieves info for a single transaction using it's unique identifier.
      operationId: getTransaction
      parameters:
        - $ref: '#/components/parameters/Id'
        - $ref: '#/components/parameters/TransactionType'
        - $ref: '#/components/parameters/XRequestId'
      responses:
        '200':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/TransactionResponse'
          description: Transaction retrieved
          headers:
            X-Request-Id:
              $ref: '#/components/headers/XRequestId'
        '400':
          $ref: '#/components/responses/DefaultError'
        '401':
          $ref: '#/components/responses/NotAuthorized'
        '404':
          $ref: '#/components/responses/NotFound'
      security:
        - BearerAuth: []
components:
  parameters:
    Id:
      name: id
      description: The universally unique identifier of the resource.
      in: path
      required: true
      schema:
        type: string
        format: uuid
        example: b3d9d2d5-4c12-4946-a09d-953e82fae2b0
    TransactionType:
      name: txType
      description: Filter by on the transaction type.
      in: query
      schema:
        $ref: '#/components/schemas/TransactionType'
    XRequestId:
      name: X-Request-Id
      description: >-
        Developer-provided parameter used to identify this request. Useful when
        communicating with Circle Support.
      in: header
      schema:
        $ref: '#/components/schemas/XRequestId'
  schemas:
    TransactionResponse:
      title: TransactionResponse
      type: object
      required:
        - data
      properties:
        data:
          type: object
          properties:
            transaction:
              $ref: '#/components/schemas/Transaction'
    TransactionType:
      title: TransactionType
      type: string
      enum:
        - INBOUND
        - OUTBOUND
    XRequestId:
      type: string
      description: >-
        A unique identifier, which can be helpful for identifying a request when
        communicating with Circle support.
      example: 2adba88e-9d63-44bc-b975-9b6ae3440dde
    Transaction:
      title: Transaction
      type: object
      required:
        - id
        - state
        - blockchain
        - transactionType
        - createDate
        - updateDate
      properties:
        id:
          $ref: '#/components/schemas/Id'
        abiFunctionSignature:
          $ref: '#/components/schemas/AbiFunctionSignature'
        abiParameters:
          $ref: '#/components/schemas/AbiParameters'
        amounts:
          $ref: '#/components/schemas/TransferAmounts'
        amountInUSD:
          type: string
          description: Transaction amount in USD decimal format.
        blockHash:
          type: string
          description: Identifier for the block that includes the transaction.
        blockHeight:
          type: integer
          description: >-
            Block height of the transaction, representing the number of
            blockchain confirmations.
        blockchain:
          $ref: '#/components/schemas/Blockchain'
        contractAddress:
          $ref: '#/components/schemas/ContractAddress'
        createDate:
          $ref: '#/components/schemas/CreateDate'
        custodyType:
          $ref: '#/components/schemas/CustodyType'
        destinationAddress:
          $ref: '#/components/schemas/Address'
        errorReason:
          type: string
          description: >-
            Description of the error. Only present for transactions in `FAILED`
            state.
        errorDetails:
          type: string
          description: >-
            Additional detail associated with the corresponding transaction's
            error reason
        estimatedFee:
          $ref: '#/components/schemas/TransactionFee'
          description: >
            The estimated fee for the transaction.

            For Get Transactions API, this will only be returned if transaction
            type is used in the request query parameters
        feeLevel:
          $ref: '#/components/schemas/FeeLevel'
          description: >-
            Defines the blockchain fee level which will be paid for the
            transaction e.g. LOW, MEDIUM, HIGH.

            For Get Transactions API, this will only be returned if transaction
            type is used in the request query parameters
        firstConfirmDate:
          type: string
          format: date-time
          description: >-
            Date the transaction was first confirmed in a block. ISO-8601 UTC
            date/time.
          example: '2021-05-18T00:00:00Z'
        networkFee:
          type: string
          description: Gas fee, in native token, paid to the network for the transaction.
        networkFeeInUSD:
          type: string
          description: Gas fee, in USD, paid to the network for the transaction.
        nfts:
          type: array
          description: >-
            List of Nfts, in JSON string format, associated with the
            transaction.
          example:
            - '[{"ntfTokenId":"12321"'
            - >-
              "metadata":"ipfs://QmZcH4YvBVVRJtdn4RdbaqgspFU8gH6P9vomDpBVpAL3u4/1"}
            - '{"ntfTokenId":"12322"'
            - >-
              "metadata":"ipfs://QmZcH4YvBVVRJtdn4RdbaqgspFU8gH6P9vomDpBVpAL3u4/2"}]
          items:
            type: string
        operation:
          $ref: '#/components/schemas/Operation'
        refId:
          $ref: '#/components/schemas/TransactionReferenceId'
        sourceAddress:
          $ref: '#/components/schemas/Address'
        state:
          $ref: '#/components/schemas/TransactionState'
        tokenId:
          $ref: '#/components/schemas/Id'
        transactionType:
          $ref: '#/components/schemas/TransactionType'
        txHash:
          $ref: '#/components/schemas/TransactionHash'
        updateDate:
          $ref: '#/components/schemas/UpdateDate'
        userId:
          $ref: '#/components/schemas/ExternalUserId'
        walletId:
          $ref: '#/components/schemas/Id'
        transactionScreeningEvaluation:
          $ref: '#/components/schemas/TransactionScreeningDecision'
          description: >-
            This field is optional and applicable to Compliance Engine customers
            only.
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
    Id:
      type: string
      format: uuid
      description: System-generated unique identifier of the resource.
      example: c4d1da72-111e-4d52-bdbf-2e74a2d803d5
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
    TransferAmounts:
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
    ContractAddress:
      title: ContractAddress
      description: The blockchain address of the contract to be executed.
      type: string
      example: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
    CreateDate:
      type: string
      format: date-time
      description: Date and time the resource was created, in ISO-8601 UTC format.
      example: '2023-01-01T12:04:05Z'
    CustodyType:
      type: string
      description: >
        Describes who controls the digital assets in a wallet: either the
        end-user or the developer.
      enum:
        - DEVELOPER
        - ENDUSER
    Address:
      title: Address
      description: >
        Blockchain generated unique identifier, associated with wallet
        (account), smart contract or other blockchain objects.
      type: string
      example: '0xca9142d0b9804ef5e239d3bc1c7aa0d1c74e7350'
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
    FeeLevel:
      type: string
      enum:
        - LOW
        - MEDIUM
        - HIGH
      example: MEDIUM
      description: >
        A dynamic blockchain fee level setting (`LOW`, `MEDIUM`, or `HIGH`) that
        will be used to pay gas for the transaction. Calculated based on network
        traffic, supply of validators, and demand for transaction verification.
        Cannot be used with `gasPrice`, `priorityFee`, or `maxFee`.

        Estimates for each fee level can be obtained through the [`POST
        /transactions/transfer/estimateFee`](/api-reference/w3s/developer-controlled-wallets/create-transfer-estimate-fee)
        API.
    Operation:
      title: Operation
      type: string
      enum:
        - TRANSFER
        - CONTRACT_EXECUTION
        - CONTRACT_DEPLOYMENT
      description: Operation type of the transaction.
    TransactionReferenceId:
      type: string
      example: grouptransaction123
      description: Optional reference or description used to identify the transaction.
    TransactionState:
      title: TransactionState
      type: string
      description: Current state of the transaction.
      enum:
        - CANCELLED
        - CONFIRMED
        - COMPLETE
        - DENIED
        - FAILED
        - INITIATED
        - CLEARED
        - QUEUED
        - SENT
        - STUCK
    TransactionHash:
      type: string
      description: Blockchain generated identifier of the transaction.
      example: '0x4a25cc5e661d8504b59c5f38ba93f010e8518966f00e2ceda7955c4b8621357d'
    UpdateDate:
      type: string
      format: date-time
      description: Date and time the resource was last updated, in ISO-8601 UTC format.
      example: '2023-01-01T12:04:05Z'
    ExternalUserId:
      type: string
      description: Unique system generated identifier for the user.
      example: ext_user_id_1
      maxLength: 50
      minLength: 5
    TransactionScreeningDecision:
      type: object
      description: >-
        Transaction decision detail about matched rule, actions to take, and all
        related risk signals.
      allOf:
        - $ref: '#/components/schemas/BaseScreeningDecision'
        - type: object
          properties:
            reasons:
              type: array
              description: >-
                Risk signals found include source, value, and type of the
                signal. It also contains risk score and risk category.
              items:
                $ref: '#/components/schemas/RiskSignal'
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
    BaseScreeningDecision:
      type: object
      description: >-
        Screening decision detail about matched rule, actions to take, and all
        related risk signals.
      required:
        - screeningDate
      properties:
        ruleName:
          type: string
          description: Name of the matched rule found in screening.
          example: Low Gambling Risk (Owner)
        actions:
          type: array
          description: Actions to take for the decision.
          items:
            $ref: '#/components/schemas/RiskAction'
          example:
            - REVIEW
        screeningDate:
          $ref: '#/components/schemas/CreateDate'
    RiskSignal:
      type: object
      description: >-
        Risk signal that includes source, value, and risk type, risk score and
        risk category.
      required:
        - source
        - sourceValue
        - riskScore
        - riskCategories
        - type
      properties:
        source:
          type: string
          description: Source of the risk signal.
          enum:
            - ADDRESS
            - BLOCKCHAIN
            - ASSET
          example: ADDRESS
        sourceValue:
          type: string
          description: >-
            Value of the source. For example, if source is “ADDRESS”. The source
            value would be an blockchain address.
          example: '0x1bf9ad0cc2ad298c69a2995aa806ee832788218c'
        riskScore:
          $ref: '#/components/schemas/RiskScore'
        riskCategories:
          type: array
          description: List of risk categories for the signal.
          items:
            $ref: '#/components/schemas/RiskCategory'
          example:
            - GAMBLING
        type:
          $ref: '#/components/schemas/RiskType'
    RiskAction:
      type: string
      description: An action to to take for the decision.
      enum:
        - APPROVE
        - REVIEW
        - FREEZE_WALLET
        - DENY
      example: REVIEW
    RiskScore:
      type: string
      description: Risk score of the signal.
      enum:
        - UNKNOWN
        - LOW
        - MEDIUM
        - HIGH
        - SEVERE
        - BLOCKLIST
      example: LOW
    RiskCategory:
      type: string
      description: The category of the associated risk of the blockchain address.
      enum:
        - SANCTIONS
        - CSAM
        - ILLICIT_BEHAVIOR
        - GAMBLING
        - TERRORIST_FINANCING
        - UNSUPPORTED
        - FROZEN
        - OTHER
        - HIGH_RISK_INDUSTRY
        - PEP
        - TRUSTED
        - HACKING
        - HUMAN_TRAFFICKING
        - SPECIAL_MEASURES
      example: GAMBLING
    RiskType:
      type: string
      description: Type of the signal.
      enum:
        - OWNERSHIP
        - COUNTERPARTY
        - INDIRECT
      example: OWNERSHIP
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
    NotAuthorized:
      content:
        application/json:
          schema:
            type: object
            title: NotAuthorizedResponse
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
              code: 401
              message: Malformed authorization.
      description: >-
        Request has not been applied because it lacks valid authentication
        credentials.
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

curl
curl --request GET \
 --url https://api.circle.com/v1/w3s/transactions/{id} \
 --header 'Authorization: Bearer <token>'

200
{
"data": {
"transaction": {
"id": "c4d1da72-111e-4d52-bdbf-2e74a2d803d5",
"blockchain": "MATIC-AMOY",
"createDate": "2023-01-01T12:04:05Z",
"state": "CANCELLED",
"transactionType": "INBOUND",
"updateDate": "2023-01-01T12:04:05Z",
"abiFunctionSignature": "burn(uint256)",
"abiParameters": [
"100",
"1"
],
"amounts": [
"6.62607015"
],
"amountInUSD": "<string>",
"blockHash": "<string>",
"blockHeight": 123,
"contractAddress": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
"custodyType": "DEVELOPER",
"destinationAddress": "0xca9142d0b9804ef5e239d3bc1c7aa0d1c74e7350",
"errorReason": "<string>",
"errorDetails": "<string>",
"estimatedFee": {
"gasLimit": "21000",
"gasPrice": "<string>",
"maxFee": "5.935224468",
"priorityFee": "1.022783914",
"baseFee": "1.022783914",
"networkFee": "0.0001246397138",
"networkFeeRaw": "0.0001246397138",
"l1Fee": "0.000000000000140021"
},
"feeLevel": "MEDIUM",
"firstConfirmDate": "2021-05-18T00:00:00Z",
"networkFee": "<string>",
"networkFeeInUSD": "<string>",
"nfts": [
"[{\"ntfTokenId\":\"12321\"",
"\"metadata\":\"ipfs://QmZcH4YvBVVRJtdn4RdbaqgspFU8gH6P9vomDpBVpAL3u4/1\"}",
"{\"ntfTokenId\":\"12322\"",
"\"metadata\":\"ipfs://QmZcH4YvBVVRJtdn4RdbaqgspFU8gH6P9vomDpBVpAL3u4/2\"}]"
],
"operation": "TRANSFER",
"refId": "grouptransaction123",
"sourceAddress": "0xca9142d0b9804ef5e239d3bc1c7aa0d1c74e7350",
"tokenId": "c4d1da72-111e-4d52-bdbf-2e74a2d803d5",
"txHash": "0x4a25cc5e661d8504b59c5f38ba93f010e8518966f00e2ceda7955c4b8621357d",
"userId": "ext_user_id_1",
"walletId": "c4d1da72-111e-4d52-bdbf-2e74a2d803d5",
"transactionScreeningEvaluation": {
"screeningDate": "2023-01-01T12:04:05Z",
"ruleName": "Low Gambling Risk (Owner)",
"actions": [
"REVIEW"
],
"reasons": [
{
"source": "ADDRESS",
"sourceValue": "0x1bf9ad0cc2ad298c69a2995aa806ee832788218c",
"riskScore": "LOW",
"riskCategories": [
"GAMBLING"
],
"type": "OWNERSHIP"
}
]
}
}
}
}

400
{
"code": 123,
"message": "<string>"
}

401
{
"code": 401,
"message": "Malformed authorization."
}

404
{
"code": 404,
"message": "Not found."
}
