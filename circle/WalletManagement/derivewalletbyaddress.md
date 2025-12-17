# Derive wallet by address

> Creates a wallet on the target blockchain using the same address as the source wallet identified by source blockchain and wallet address. If the target wallet already exists, its metadata is updated.

## OpenAPI

```yaml openapi/developer-controlled-wallets.yaml put /v1/w3s/developer/wallets/derive
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
  /v1/w3s/developer/wallets/derive:
    put:
      tags:
        - Wallets
      summary: Derive wallet by address
      description: >-
        Creates a wallet on the target blockchain using the same address as the
        source wallet identified by source blockchain and wallet address. If the
        target wallet already exists, its metadata is updated.
      operationId: deriveWalletByAddress
      parameters:
        - $ref: '#/components/parameters/XRequestId'
      requestBody:
        $ref: '#/components/requestBodies/DeriveWalletByAddress'
      responses:
        '200':
          description: Successfully updated the metadata for an existing wallet.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/WalletResponse'
          headers:
            X-Request-Id:
              $ref: '#/components/headers/XRequestId'
        '201':
          description: The derived wallet was successfully created.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/WalletResponse'
          headers:
            X-Request-Id:
              $ref: '#/components/headers/XRequestId'
        '400':
          $ref: '#/components/responses/BadRequest'
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
    DeriveWalletByAddress:
      content:
        application/json:
          schema:
            type: object
            required:
              - sourceBlockchain
              - walletAddress
              - targetBlockchain
            properties:
              sourceBlockchain:
                $ref: '#/components/schemas/EvmBlockchain'
              walletAddress:
                $ref: '#/components/schemas/Address'
              targetBlockchain:
                $ref: '#/components/schemas/EvmBlockchain'
              metadata:
                $ref: '#/components/schemas/WalletMetadata'
      description: >-
        Request payload to derive a wallet by source blockchain + address onto a
        target blockchain.
      required: true
  schemas:
    WalletResponse:
      title: WalletResponse
      type: object
      required:
        - data
      properties:
        data:
          type: object
          required:
            - wallet
          properties:
            wallet:
              oneOf:
                - $ref: '#/components/schemas/EOAWallet'
                - $ref: '#/components/schemas/SCAWallet'
              discriminator:
                propertyName: accountType
    XRequestId:
      type: string
      description: >-
        A unique identifier, which can be helpful for identifying a request when
        communicating with Circle support.
      example: 2adba88e-9d63-44bc-b975-9b6ae3440dde
    EvmBlockchain:
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
        - ARB
        - ARB-SEPOLIA
        - UNI
        - UNI-SEPOLIA
        - BASE
        - BASE-SEPOLIA
        - OP
        - OP-SEPOLIA
        - EVM
        - EVM-TESTNET
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
    WalletMetadata:
      type: object
      properties:
        name:
          $ref: '#/components/schemas/Name'
        refId:
          $ref: '#/components/schemas/ReferenceId'
    EOAWallet:
      title: EOAWallet
      allOf:
        - $ref: '#/components/schemas/Wallet'
        - type: object
          required:
            - accountType
          properties:
            accountType:
              type: string
              description: >
                An account can be a Smart Contract Account (SCA) or an
                Externally Owned Account (EOA). To learn more, see the [account
                types
                guide](https://developers.circle.com/wallets/account-types).


                If an account type is not specified during the creation of a
                wallet, it defaults to `EOA` (Externally Owned Account). Note
                that Solana and Aptos don't support Smart Contract Account
                (SCA).
              enum:
                - EOA
    SCAWallet:
      title: SCAWallet
      allOf:
        - $ref: '#/components/schemas/Wallet'
        - type: object
          required:
            - accountType
            - scaCore
          properties:
            accountType:
              type: string
              description: >
                An account can be a Smart Contract Account (SCA) or an
                Externally Owned Account (EOA). To learn more, see the [account
                types
                guide](https://developers.circle.com/wallets/account-types).


                If an account type is not specified during the creation of a
                wallet, it defaults to `EOA` (Externally Owned Account). Note
                that Solana and Aptos don't support Smart Contract Account
                (SCA).
              enum:
                - SCA
            scaCore:
              $ref: '#/components/schemas/ScaCore'
    Name:
      type: string
      description: Name or description associated with the wallet or walletSet.
    ReferenceId:
      type: string
      description: Reference or description used to identify the object.
      example: custom_ref_id
    Wallet:
      type: object
      required:
        - id
        - state
        - walletSetId
        - custodyType
        - address
        - blockchain
        - createDate
        - updateDate
      properties:
        id:
          $ref: '#/components/schemas/Id'
        address:
          $ref: '#/components/schemas/Address'
        blockchain:
          $ref: '#/components/schemas/Blockchain'
        createDate:
          $ref: '#/components/schemas/CreateDate'
        updateDate:
          $ref: '#/components/schemas/UpdateDate'
        custodyType:
          $ref: '#/components/schemas/CustodyType'
        name:
          $ref: '#/components/schemas/Name'
        refId:
          $ref: '#/components/schemas/ReferenceId'
        state:
          $ref: '#/components/schemas/WalletState'
        userId:
          $ref: '#/components/schemas/ExternalUserId'
        walletSetId:
          $ref: '#/components/schemas/Id'
        initialPublicKey:
          $ref: '#/components/schemas/InitialPublicKey'
    ScaCore:
      type: string
      description: >-
        SCAs have different versions, each with unique functionality. `SCACore`
        displays the version of the SCA being created. For a list of supported
        versions, refer to the developer documentation.
      enum:
        - circle_4337_v1
        - circle_6900_singleowner_v1
        - circle_6900_singleowner_v2
        - circle_6900_singleowner_v3
      example: circle_6900_singleowner_v2
    Id:
      type: string
      format: uuid
      description: System-generated unique identifier of the resource.
      example: c4d1da72-111e-4d52-bdbf-2e74a2d803d5
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
    CreateDate:
      type: string
      format: date-time
      description: Date and time the resource was created, in ISO-8601 UTC format.
      example: '2023-01-01T12:04:05Z'
    UpdateDate:
      type: string
      format: date-time
      description: Date and time the resource was last updated, in ISO-8601 UTC format.
      example: '2023-01-01T12:04:05Z'
    CustodyType:
      type: string
      description: >
        Describes who controls the digital assets in a wallet: either the
        end-user or the developer.
      enum:
        - DEVELOPER
        - ENDUSER
    WalletState:
      type: string
      description: This enum describes the current state of the wallet.
      enum:
        - LIVE
        - FROZEN
      example: LIVE
    ExternalUserId:
      type: string
      description: Unique system generated identifier for the user.
      example: ext_user_id_1
      maxLength: 50
      minLength: 5
    InitialPublicKey:
      type: string
      description: >-
        For NEAR blockchains only, the originally assigned public key of a
        wallet at the time of its creation.
      example: 3eQoJ3ex6uWX3R8F1THF6Y6oBQwPYpF1X9HBM1gjqw7w
  headers:
    XRequestId:
      description: >
        Developer-provided header parameter or Circle-generated universally
        unique identifier (UUID v4). Useful for identifying a specific request
        when communicating with Circle Support.
      schema:
        $ref: '#/components/schemas/XRequestId'
  responses:
    BadRequest:
      content:
        application/json:
          schema:
            type: object
            title: BadRequestResponse
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
              code: 400
              message: Bad request.
      description: Request cannot be processed due to a client error.
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

CURL
curl --request PUT \
 --url https://api.circle.com/v1/w3s/developer/wallets/derive \
 --header 'Authorization: Bearer <token>' \
 --header 'Content-Type: application/json' \
 --data '
{
"sourceBlockchain": "MATIC-AMOY",
"walletAddress": "0xca9142d0b9804ef5e239d3bc1c7aa0d1c74e7350",
"targetBlockchain": "MATIC-AMOY",
"metadata": {
"name": "<string>",
"refId": "custom_ref_id"
}
}
'

200
{
"data": {
"wallet": {
"id": "c4d1da72-111e-4d52-bdbf-2e74a2d803d5",
"address": "0xca9142d0b9804ef5e239d3bc1c7aa0d1c74e7350",
"blockchain": "MATIC-AMOY",
"createDate": "2023-01-01T12:04:05Z",
"updateDate": "2023-01-01T12:04:05Z",
"custodyType": "DEVELOPER",
"state": "LIVE",
"walletSetId": "c4d1da72-111e-4d52-bdbf-2e74a2d803d5",
"accountType": "EOA",
"name": "<string>",
"refId": "custom_ref_id",
"userId": "ext_user_id_1",
"initialPublicKey": "3eQoJ3ex6uWX3R8F1THF6Y6oBQwPYpF1X9HBM1gjqw7w"
}
}
}

201
{
"data": {
"wallet": {
"id": "c4d1da72-111e-4d52-bdbf-2e74a2d803d5",
"address": "0xca9142d0b9804ef5e239d3bc1c7aa0d1c74e7350",
"blockchain": "MATIC-AMOY",
"createDate": "2023-01-01T12:04:05Z",
"updateDate": "2023-01-01T12:04:05Z",
"custodyType": "DEVELOPER",
"state": "LIVE",
"walletSetId": "c4d1da72-111e-4d52-bdbf-2e74a2d803d5",
"accountType": "EOA",
"name": "<string>",
"refId": "custom_ref_id",
"userId": "ext_user_id_1",
"initialPublicKey": "3eQoJ3ex6uWX3R8F1THF6Y6oBQwPYpF1X9HBM1gjqw7w"
}
}
}

400
{
"code": 400,
"message": "Bad request."
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
