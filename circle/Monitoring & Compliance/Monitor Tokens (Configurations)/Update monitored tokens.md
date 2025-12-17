# Update monitored tokens

> Upsert the monitored token list.

## OpenAPI

```yaml openapi/configurations_1.yaml put /v1/w3s/config/entity/monitoredTokens
openapi: 3.0.3
info:
  title: Configurations
  description: General Configuration APIs for Developer Services products.
  version: '1.0'
servers:
  - url: https://api.circle.com
security: []
tags:
  - name: Webhook Subscriptions
    description: Manage subscriptions to notifications.
  - name: Monitor Tokens
  - name: Developer Account
  - name: Faucet
paths:
  /v1/w3s/config/entity/monitoredTokens:
    put:
      tags:
        - Monitor Tokens
      summary: Update monitored tokens
      description: Upsert the monitored token list.
      operationId: updateMonitoredTokens
      requestBody:
        $ref: '#/components/requestBodies/UpdateMonitoredTokensRequest'
      responses:
        '200':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/MonitoredTokens'
          description: Success response
          headers:
            X-Request-Id:
              $ref: '#/components/headers/XRequestId'
        '400':
          $ref: '#/components/responses/BadRequest'
      security:
        - BearerAuth: []
components:
  requestBodies:
    UpdateMonitoredTokensRequest:
      content:
        application/json:
          schema:
            title: UpdateMonitoredTokensRequest
            type: object
            properties:
              tokenIds:
                type: array
                items:
                  $ref: '#/components/schemas/Id'
                description: >-
                  The list of tokens that will be added to the monitored tokens
                  list. When fetching wallet balances, these tokens will be
                  shown by default.
                example:
                  - a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11
      description: Request body
      required: true
  schemas:
    MonitoredTokens:
      title: MonitoredTokensResponse
      type: object
      properties:
        data:
          type: object
          properties:
            scope:
              $ref: '#/components/schemas/TokenMonitorScope'
            tokens:
              type: array
              items:
                $ref: '#/components/schemas/Token'
              description: >-
                The list of tokens that have been added to the monitored tokens
                list. When fetching wallet balances, only these tokens will be
                shown by default.
    Id:
      type: string
      format: uuid
      description: System-generated unique identifier of the resource.
      example: c4d1da72-111e-4d52-bdbf-2e74a2d803d5
    TokenMonitorScope:
      title: TokenMonitorScope
      type: string
      enum:
        - SELECTED
        - MONITOR_ALL
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

curl --request PUT \
 --url https://api.circle.com/v1/w3s/config/entity/monitoredTokens \
 --header 'Authorization: Bearer <token>' \
 --header 'Content-Type: application/json' \
 --data '
{
"tokenIds": [
"a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"
]
}
'

200
{
"data": {
"scope": "SELECTED",
"tokens": [
{
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
]
}
}

400
{
"code": 400,
"message": "Bad request."
}
