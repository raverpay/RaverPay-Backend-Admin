# Request testnet tokens

> Request testnet tokens for your wallet.

## OpenAPI

```yaml openapi/configurations_1.yaml post /v1/faucet/drips
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
  /v1/faucet/drips:
    post:
      tags:
        - Faucet
      summary: Request testnet tokens
      description: Request testnet tokens for your wallet.
      operationId: requestTestnetTokens
      parameters:
        - $ref: '#/components/parameters/XRequestId'
      requestBody:
        $ref: '#/components/requestBodies/FaucetRequest'
      responses:
        '204':
          headers:
            X-Request-Id:
              $ref: '#/components/headers/XRequestId'
          description: Successfully requested testnet tokens. No content in body.
        '400':
          $ref: '#/components/responses/DefaultError'
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
    FaucetRequest:
      content:
        application/json:
          schema:
            title: FaucetRequest
            type: object
            required:
              - address
              - blockchain
            properties:
              address:
                $ref: '#/components/schemas/Address'
              blockchain:
                $ref: '#/components/schemas/TestnetBlockchain'
              native:
                type: boolean
                description: Request native testnet tokens.
                default: false
                example: true
              usdc:
                type: boolean
                description: Request USDC testnet tokens.
                default: false
                example: true
              eurc:
                type: boolean
                description: Request EURC testnet tokens.
                default: false
                example: true
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
  schemas:
    XRequestId:
      type: string
      description: >-
        A unique identifier, which can be helpful for identifying a request when
        communicating with Circle support.
      example: 2adba88e-9d63-44bc-b975-9b6ae3440dde
    Address:
      title: Address
      description: >
        Blockchain generated unique identifier, associated with wallet
        (account), smart contract or other blockchain objects.
      type: string
      example: '0xca9142d0b9804ef5e239d3bc1c7aa0d1c74e7350'
    TestnetBlockchain:
      title: TestnetBlockchain
      type: string
      description: >-
        The testnet blockchain network the resource will be created on or is
        currently on.
      enum:
        - ETH-SEPOLIA
        - AVAX-FUJI
        - MATIC-AMOY
        - SOL-DEVNET
        - ARB-SEPOLIA
        - UNI-SEPOLIA
        - BASE-SEPOLIA
        - OP-SEPOLIA
        - APTOS-TESTNET
        - ARC-TESTNET
        - MONAD-TESTNET
      example: MATIC-AMOY
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
 --url https://api.circle.com/v1/faucet/drips \
 --header 'Authorization: Bearer <token>' \
 --header 'Content-Type: application/json' \
 --data '
{
"address": "0xca9142d0b9804ef5e239d3bc1c7aa0d1c74e7350",
"blockchain": "MATIC-AMOY",
"native": false,
"usdc": false,
"eurc": false
}
'
400
{
"code": 123,
"message": "<string>"
}
