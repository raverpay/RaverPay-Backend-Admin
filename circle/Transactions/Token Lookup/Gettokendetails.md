# Get token details

> Fetches details of a specific token given its unique identifier. Every token in your network of wallets has a UUID associated with it, regardless of whether it's already recognized or was added as a monitored token.

## OpenAPI

```yaml openapi/developer-controlled-wallets.yaml get /v1/w3s/tokens/{id}
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
  /v1/w3s/tokens/{id}:
    get:
      tags:
        - Token Lookup
      summary: Get token details
      description: >-
        Fetches details of a specific token given its unique identifier. Every
        token in your network of wallets has a UUID associated with it,
        regardless of whether it's already recognized or was added as a
        monitored token.
      operationId: getTokenId
      parameters:
        - $ref: '#/components/parameters/Id'
      responses:
        '200':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/TokenResponse'
          description: Token found
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
    Id:
      name: id
      description: The universally unique identifier of the resource.
      in: path
      required: true
      schema:
        type: string
        format: uuid
        example: b3d9d2d5-4c12-4946-a09d-953e82fae2b0
  schemas:
    TokenResponse:
      title: TokenResponse
      type: object
      properties:
        data:
          type: object
          properties:
            token:
              $ref: '#/components/schemas/Token'
    Token:
      title: Token
      type: object
      required:
        - id
        - blockchain
        - isNative
        - createDate
        - updateDate
      properties:
        id:
          $ref: '#/components/schemas/Id'
        name:
          type: string
          description: Blockchain name of the specified token.
        standard:
          $ref: '#/components/schemas/TokenStandard'
        blockchain:
          $ref: '#/components/schemas/Blockchain'
        decimals:
          type: integer
          description: Number of decimal places shown in the token amount.
        isNative:
          type: boolean
          description: >-
            Defines if the token is a native token of the specified blockchain.
            If TRUE, the token is a native token.
        symbol:
          type: string
          description: Blockchain symbol of the specified token.
        tokenAddress:
          $ref: '#/components/schemas/Address'
        updateDate:
          $ref: '#/components/schemas/UpdateDate'
        createDate:
          $ref: '#/components/schemas/CreateDate'
    XRequestId:
      type: string
      description: >-
        A unique identifier, which can be helpful for identifying a request when
        communicating with Circle support.
      example: 2adba88e-9d63-44bc-b975-9b6ae3440dde
    Id:
      type: string
      format: uuid
      description: System-generated unique identifier of the resource.
      example: c4d1da72-111e-4d52-bdbf-2e74a2d803d5
    TokenStandard:
      title: TokenStandard
      type: string
      enum:
        - ERC20
        - ERC721
        - ERC1155
        - Fungible
        - FungibleAsset
        - NonFungible
        - NonFungibleEdition
        - ProgrammableNonFungible
        - ProgrammableNonFungibleEdition
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
    Address:
      title: Address
      description: >
        Blockchain generated unique identifier, associated with wallet
        (account), smart contract or other blockchain objects.
      type: string
      example: '0xca9142d0b9804ef5e239d3bc1c7aa0d1c74e7350'
    UpdateDate:
      type: string
      format: date-time
      description: Date and time the resource was last updated, in ISO-8601 UTC format.
      example: '2023-01-01T12:04:05Z'
    CreateDate:
      type: string
      format: date-time
      description: Date and time the resource was created, in ISO-8601 UTC format.
      example: '2023-01-01T12:04:05Z'
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

curl --request GET \
 --url https://api.circle.com/v1/w3s/tokens/{id} \
 --header 'Authorization: Bearer <token>'

200
{
"data": {
"token": {
"id": "c4d1da72-111e-4d52-bdbf-2e74a2d803d5",
"blockchain": "MATIC-AMOY",
"isNative": true,
"updateDate": "2023-01-01T12:04:05Z",
"createDate": "2023-01-01T12:04:05Z",
"name": "<string>",
"standard": "ERC20",
"decimals": 123,
"symbol": "<string>",
"tokenAddress": "0xca9142d0b9804ef5e239d3bc1c7aa0d1c74e7350"
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
