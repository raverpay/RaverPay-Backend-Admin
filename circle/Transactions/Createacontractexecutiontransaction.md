# Create a contract execution transaction

> Creates a transaction which executes a smart contract. ABI parameters must be passed in the request.
> Related transactions may be submitted as a batch transaction in a single call.

You must provide either a `walletId` or a `walletAddress` and `blockchain` pair in the request body.

## OpenAPI

```yaml openapi/developer-controlled-wallets.yaml post /v1/w3s/developer/transactions/contractExecution
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
  /v1/w3s/developer/transactions/contractExecution:
    post:
      tags:
        - Transactions
      summary: Create a contract execution transaction
      description: >
        Creates a transaction which executes a smart contract. ABI parameters
        must be passed in the request.

        Related transactions may be submitted as a batch transaction in a single
        call.


        You must provide either a `walletId` or a `walletAddress` and
        `blockchain` pair in the request body.
      operationId: createDeveloperTransactionContractExecution
      parameters:
        - $ref: '#/components/parameters/XRequestId'
      requestBody:
        $ref: >-
          #/components/requestBodies/CreateContractExecutionTransactionForDeveloper
      responses:
        '200':
          description: >-
            Returns the existing transaction if the idempotency key matches a
            previous successful request.
          content:
            application/json:
              schema:
                $ref: >-
                  #/components/schemas/CreateContractExecutionTransactionForDeveloper
          headers:
            X-Request-Id:
              $ref: '#/components/headers/XRequestId'
        '201':
          description: A new transaction is created
          content:
            application/json:
              schema:
                $ref: >-
                  #/components/schemas/CreateContractExecutionTransactionForDeveloper
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
    XRequestId:
      name: X-Request-Id
      description: >-
        Developer-provided parameter used to identify this request. Useful when
        communicating with Circle Support.
      in: header
      schema:
        $ref: '#/components/schemas/XRequestId'
  requestBodies:
    CreateContractExecutionTransactionForDeveloper:
      required: true
      description: Create transaction for developer request
      content:
        application/json:
          schema:
            title: CreateContractExecutionTransactionForDeveloperRequest
            type: object
            required:
              - contractAddress
              - entitySecretCiphertext
              - idempotencyKey
            properties:
              idempotencyKey:
                $ref: '#/components/schemas/IdempotencyKey'
              abiFunctionSignature:
                $ref: '#/components/schemas/AbiFunctionSignature'
              abiParameters:
                $ref: '#/components/schemas/AbiParameters'
              callData:
                $ref: '#/components/schemas/CallData'
              amount:
                $ref: '#/components/schemas/Amount'
              contractAddress:
                $ref: '#/components/schemas/ContractAddress'
              entitySecretCiphertext:
                $ref: '#/components/schemas/EntitySecretCiphertext'
              feeLevel:
                $ref: '#/components/schemas/FeeLevel'
              gasLimit:
                $ref: '#/components/schemas/GasLimit'
              gasPrice:
                $ref: '#/components/schemas/GasPrice'
              maxFee:
                $ref: '#/components/schemas/MaxFee'
              priorityFee:
                $ref: '#/components/schemas/PriorityFee'
              refId:
                $ref: '#/components/schemas/TransactionReferenceId'
              walletId:
                $ref: '#/components/schemas/WalletId'
              blockchain:
                $ref: '#/components/schemas/ContractExecutionBlockchain'
              walletAddress:
                $ref: '#/components/schemas/Address'
  schemas:
    CreateContractExecutionTransactionForDeveloper:
      title: CreateContractExecutionTransactionForDeveloperResponse
      type: object
      required:
        - data
      properties:
        data:
          type: object
          required:
            - id
            - state
          properties:
            id:
              $ref: '#/components/schemas/Id'
            state:
              $ref: '#/components/schemas/TransactionState'
    XRequestId:
      type: string
      description: >-
        A unique identifier, which can be helpful for identifying a request when
        communicating with Circle support.
      example: 2adba88e-9d63-44bc-b975-9b6ae3440dde
    IdempotencyKey:
      type: string
      description: >-
        Universally unique identifier (UUID v4) idempotency key. This key is
        utilized to ensure exactly-once execution of mutating requests. To
        create a UUIDv4 go to
        [uuidgenerator.net](https://www.uuidgenerator.net). If the same key is
        reused, it will be treated as the same request and the original response
        will be returned.
      example: a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11
      format: uuid
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
    ContractAddress:
      title: ContractAddress
      description: The blockchain address of the contract to be executed.
      type: string
      example: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
    EntitySecretCiphertext:
      type: string
      description: >
        A base64 string expression of the entity secret ciphertext. The entity
        secret should be encrypted by the entity public key. Circle mandates
        that the entity secret ciphertext is unique for each API request.
      format: byte
      example: >-
        M8OAwbJ8rMsPd8+NT4xRDBDJSNqUKAvJeWPyuwZSlVXgRucogAlBxjvjIw4nsKeJ4hejjlpmyaaJrusHm6zsvy4BLuL1an3dYn3wORjYf3sU4QN9Rdk9OJxZvE5hDNPq7okucvb1eElxPVREZvr4ew7sh4ktmwDrwWFUYwKoly4fEzxYI9zvVpCY9xPSgkA5m3u1/P2vMYZ0QFtn8lRZxCuTyc4wRLpT9TOaK46CEXCakmAYaYWnLkl18QXOSY6FhCbGm+zQ2Uu4cUPU/bqjIyQIB80ut3drInDzysQLE/FJjcJW9+q+E75LKGKnrp2zCg/Xv3TEvru9a2A0vd7InZ9kNuxnPPFc1JSO7BT2TPP89YcLO0OmtRiGoXPlYzXuNIfUsVQ5/FW9FPp4qp+iMPrAidsjQrskHPxhW92GeezLpOSkUl7lAWQoioYED979mqGfzNIZTF5Ob6fJifboiwhOab6sAKnxmvWjgFnW/bZ5a8xkzgPc4RHpIejot1Q7fpT+67eA+DVxvUqakJI6t3iEaZTNITCSU2Cfj1oyCQfrZGf9tauW49rO1zYHKoV4z9ylymOWtCUk641iyxwFCNSW47CDsc0M8iI4J6JqsNMpQuR9sdWVhROi5yn9UR7ac7pizB3dFmc0/qjtTRoYStaaSEYg3L5woALv5kAA2j4=
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
    TransactionReferenceId:
      type: string
      example: grouptransaction123
      description: Optional reference or description used to identify the transaction.
    WalletId:
      title: WalletId
      type: string
      format: uuid
      description: |
        Unique system generated identifier of the wallet.
        For contract deploys this wallet ID will be used as the source.
      example: a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11
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
    Address:
      title: Address
      description: >
        Blockchain generated unique identifier, associated with wallet
        (account), smart contract or other blockchain objects.
      type: string
      example: '0xca9142d0b9804ef5e239d3bc1c7aa0d1c74e7350'
    Id:
      type: string
      format: uuid
      description: System-generated unique identifier of the resource.
      example: c4d1da72-111e-4d52-bdbf-2e74a2d803d5
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

curl --request POST \
 --url https://api.circle.com/v1/w3s/developer/transactions/contractExecution \
 --header 'Authorization: Bearer <token>' \
 --header 'Content-Type: application/json' \
 --data '
{
"idempotencyKey": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
"contractAddress": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
"entitySecretCiphertext": "M8OAwbJ8rMsPd8+NT4xRDBDJSNqUKAvJeWPyuwZSlVXgRucogAlBxjvjIw4nsKeJ4hejjlpmyaaJrusHm6zsvy4BLuL1an3dYn3wORjYf3sU4QN9Rdk9OJxZvE5hDNPq7okucvb1eElxPVREZvr4ew7sh4ktmwDrwWFUYwKoly4fEzxYI9zvVpCY9xPSgkA5m3u1/P2vMYZ0QFtn8lRZxCuTyc4wRLpT9TOaK46CEXCakmAYaYWnLkl18QXOSY6FhCbGm+zQ2Uu4cUPU/bqjIyQIB80ut3drInDzysQLE/FJjcJW9+q+E75LKGKnrp2zCg/Xv3TEvru9a2A0vd7InZ9kNuxnPPFc1JSO7BT2TPP89YcLO0OmtRiGoXPlYzXuNIfUsVQ5/FW9FPp4qp+iMPrAidsjQrskHPxhW92GeezLpOSkUl7lAWQoioYED979mqGfzNIZTF5Ob6fJifboiwhOab6sAKnxmvWjgFnW/bZ5a8xkzgPc4RHpIejot1Q7fpT+67eA+DVxvUqakJI6t3iEaZTNITCSU2Cfj1oyCQfrZGf9tauW49rO1zYHKoV4z9ylymOWtCUk641iyxwFCNSW47CDsc0M8iI4J6JqsNMpQuR9sdWVhROi5yn9UR7ac7pizB3dFmc0/qjtTRoYStaaSEYg3L5woALv5kAA2j4=",
"abiFunctionSignature": "burn(uint256)",
"abiParameters": [
"100",
"1"
],
"callData": "0xcdcd77c000000000000000000000000000000000000000000000000000000000000000450000000000000000000000000000000000000000000000000000000000000001",
"amount": "1.0",
"feeLevel": "MEDIUM",
"gasLimit": "21000",
"gasPrice": "<string>",
"maxFee": "5.935224468",
"priorityFee": "1.022783914",
"refId": "grouptransaction123",
"walletId": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
"blockchain": "MATIC-AMOY",
"walletAddress": "0xca9142d0b9804ef5e239d3bc1c7aa0d1c74e7350"
}
'

200
{
"data": {
"id": "c4d1da72-111e-4d52-bdbf-2e74a2d803d5",
"state": "CANCELLED"
}
}

201
{
"data": {
"id": "c4d1da72-111e-4d52-bdbf-2e74a2d803d5",
"state": "CANCELLED"
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
