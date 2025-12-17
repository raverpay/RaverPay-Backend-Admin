# Validate an address

> Confirms that a specified address is valid for a given token on a certain blockchain.

## OpenAPI

```yaml openapi/developer-controlled-wallets.yaml post /v1/w3s/transactions/validateAddress
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
  /v1/w3s/transactions/validateAddress:
    post:
      tags:
        - Transactions
      summary: Validate an address
      description: >-
        Confirms that a specified address is valid for a given token on a
        certain blockchain.
      operationId: createValidateAddress
      requestBody:
        $ref: '#/components/requestBodies/ValidateAddress'
      responses:
        '200':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ValidateAddress'
          description: Address validated
          headers:
            X-Request-Id:
              $ref: '#/components/headers/XRequestId'
        '400':
          $ref: '#/components/responses/DefaultError'
        '401':
          $ref: '#/components/responses/NotAuthorized'
      security:
        - BearerAuth: []
components:
  requestBodies:
    ValidateAddress:
      content:
        application/json:
          schema:
            title: ValidateAddressRequest
            type: object
            required:
              - address
              - blockchain
            properties:
              address:
                $ref: '#/components/schemas/Address'
              blockchain:
                $ref: '#/components/schemas/Blockchain'
      description: Validate address request
      required: true
  schemas:
    ValidateAddress:
      title: ValidateAddressResponse
      type: object
      required:
        - data
      properties:
        data:
          type: object
          required:
            - isValid
          properties:
            isValid:
              type: boolean
    Address:
      title: Address
      description: >
        Blockchain generated unique identifier, associated with wallet
        (account), smart contract or other blockchain objects.
      type: string
      example: '0xca9142d0b9804ef5e239d3bc1c7aa0d1c74e7350'
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
 --url https://api.circle.com/v1/w3s/transactions/validateAddress \
 --header 'Authorization: Bearer <token>' \
 --header 'Content-Type: application/json' \
 --data '
{
"address": "0xca9142d0b9804ef5e239d3bc1c7aa0d1c74e7350",
"blockchain": "MATIC-AMOY"
}
'

200
{
"data": {
"isValid": true
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
