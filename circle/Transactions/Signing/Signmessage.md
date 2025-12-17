# Sign message

> Sign a message from a specified developer-controlled wallet. This endpoint supports message signing for Ethereum-based blockchains (using EIP-191), Solana and Aptos (using Ed25519 signatures). Note that Smart Contract Accounts (SCA) are specific to Ethereum and EVM-compatible chains. The difference between Ethereum's EOA and SCA can be found in the [account types guide](https://developers.circle.com/wallets/account-types). You can also check the list of Ethereum Dapps that support SCA: https://eip1271.io/."

You must provide either a `walletId` or a `walletAddress` and `blockchain` pair in the request body.

## OpenAPI

```yaml openapi/developer-controlled-wallets.yaml post /v1/w3s/developer/sign/message
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
  /v1/w3s/developer/sign/message:
    post:
      tags:
        - Signing
      summary: Sign message
      description: >
        Sign a message from a specified developer-controlled wallet. This
        endpoint supports message signing for Ethereum-based blockchains (using
        EIP-191), Solana and Aptos (using Ed25519 signatures). Note that Smart
        Contract Accounts (SCA) are specific to Ethereum and EVM-compatible
        chains. The difference between Ethereum's EOA and SCA can be found in
        the [account types
        guide](https://developers.circle.com/wallets/account-types). You can
        also check the list of Ethereum Dapps that support SCA:
        https://eip1271.io/."


        You must provide either a `walletId` or a `walletAddress` and
        `blockchain` pair in the request body.
      operationId: signMessage
      parameters:
        - $ref: '#/components/parameters/XRequestId'
      requestBody:
        $ref: '#/components/requestBodies/SignMessage'
      responses:
        '200':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SignatureResponse'
          description: Successfully signed a message.
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
    SignMessage:
      content:
        application/json:
          schema:
            type: object
            required:
              - message
              - entitySecretCiphertext
            properties:
              walletId:
                $ref: '#/components/schemas/Id'
              encodedByHex:
                $ref: '#/components/schemas/EncodedByHex'
              message:
                $ref: '#/components/schemas/Message'
              memo:
                $ref: '#/components/schemas/Memo'
              entitySecretCiphertext:
                $ref: '#/components/schemas/EntitySecretCiphertext'
              blockchain:
                $ref: '#/components/schemas/Blockchain'
              walletAddress:
                $ref: '#/components/schemas/Address'
      required: true
      description: Schema for the request payload to sign a message.
  schemas:
    SignatureResponse:
      title: SignatureResponse
      type: object
      required:
        - data
      properties:
        data:
          type: object
          required:
            - signature
          properties:
            signature:
              $ref: '#/components/schemas/Signature'
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
    EncodedByHex:
      type: boolean
      description: >-
        Indicator of whether the input message is encoded by hex. If TRUE, then
        the message should be a hex string. By default, it is False.
      example: false
    Message:
      type: string
      description: >-
        The user friendly message that needs to be signed. If it is a hex
        string, encodedByHex needs to be TRUE. The hex string should start with
        “0x” and have even length.
      example: I agree with this transfer
    Memo:
      type: string
      description: >-
        The human readable explanation for this sign action. Useful for
        presenting with extra information.
      example: Transfer USDC to Sam
    EntitySecretCiphertext:
      type: string
      description: >
        A base64 string expression of the entity secret ciphertext. The entity
        secret should be encrypted by the entity public key. Circle mandates
        that the entity secret ciphertext is unique for each API request.
      format: byte
      example: >-
        M8OAwbJ8rMsPd8+NT4xRDBDJSNqUKAvJeWPyuwZSlVXgRucogAlBxjvjIw4nsKeJ4hejjlpmyaaJrusHm6zsvy4BLuL1an3dYn3wORjYf3sU4QN9Rdk9OJxZvE5hDNPq7okucvb1eElxPVREZvr4ew7sh4ktmwDrwWFUYwKoly4fEzxYI9zvVpCY9xPSgkA5m3u1/P2vMYZ0QFtn8lRZxCuTyc4wRLpT9TOaK46CEXCakmAYaYWnLkl18QXOSY6FhCbGm+zQ2Uu4cUPU/bqjIyQIB80ut3drInDzysQLE/FJjcJW9+q+E75LKGKnrp2zCg/Xv3TEvru9a2A0vd7InZ9kNuxnPPFc1JSO7BT2TPP89YcLO0OmtRiGoXPlYzXuNIfUsVQ5/FW9FPp4qp+iMPrAidsjQrskHPxhW92GeezLpOSkUl7lAWQoioYED979mqGfzNIZTF5Ob6fJifboiwhOab6sAKnxmvWjgFnW/bZ5a8xkzgPc4RHpIejot1Q7fpT+67eA+DVxvUqakJI6t3iEaZTNITCSU2Cfj1oyCQfrZGf9tauW49rO1zYHKoV4z9ylymOWtCUk641iyxwFCNSW47CDsc0M8iI4J6JqsNMpQuR9sdWVhROi5yn9UR7ac7pizB3dFmc0/qjtTRoYStaaSEYg3L5woALv5kAA2j4=
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
    Signature:
      type: string
      description: >-
        Each chain encode signatures in a different way, please refer to
        [Signing APIs doc](https://learn.circle.com/w3s/signing-apis) and the
        blockchain's document.
      example: 3W6r38STvZuBSmk2bbbct132SjEsYSARo3CJi3JQvNUaFoYu...
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

curl --request POST \
 --url https://api.circle.com/v1/w3s/developer/sign/message \
 --header 'Authorization: Bearer <token>' \
 --header 'Content-Type: application/json' \
 --data '
{
"message": "I agree with this transfer",
"entitySecretCiphertext": "M8OAwbJ8rMsPd8+NT4xRDBDJSNqUKAvJeWPyuwZSlVXgRucogAlBxjvjIw4nsKeJ4hejjlpmyaaJrusHm6zsvy4BLuL1an3dYn3wORjYf3sU4QN9Rdk9OJxZvE5hDNPq7okucvb1eElxPVREZvr4ew7sh4ktmwDrwWFUYwKoly4fEzxYI9zvVpCY9xPSgkA5m3u1/P2vMYZ0QFtn8lRZxCuTyc4wRLpT9TOaK46CEXCakmAYaYWnLkl18QXOSY6FhCbGm+zQ2Uu4cUPU/bqjIyQIB80ut3drInDzysQLE/FJjcJW9+q+E75LKGKnrp2zCg/Xv3TEvru9a2A0vd7InZ9kNuxnPPFc1JSO7BT2TPP89YcLO0OmtRiGoXPlYzXuNIfUsVQ5/FW9FPp4qp+iMPrAidsjQrskHPxhW92GeezLpOSkUl7lAWQoioYED979mqGfzNIZTF5Ob6fJifboiwhOab6sAKnxmvWjgFnW/bZ5a8xkzgPc4RHpIejot1Q7fpT+67eA+DVxvUqakJI6t3iEaZTNITCSU2Cfj1oyCQfrZGf9tauW49rO1zYHKoV4z9ylymOWtCUk641iyxwFCNSW47CDsc0M8iI4J6JqsNMpQuR9sdWVhROi5yn9UR7ac7pizB3dFmc0/qjtTRoYStaaSEYg3L5woALv5kAA2j4=",
"walletId": "c4d1da72-111e-4d52-bdbf-2e74a2d803d5",
"encodedByHex": false,
"memo": "Transfer USDC to Sam",
"blockchain": "MATIC-AMOY",
"walletAddress": "0xca9142d0b9804ef5e239d3bc1c7aa0d1c74e7350"
}
'

    200
    {

"data": {
"signature": "3W6r38STvZuBSmk2bbbct132SjEsYSARo3CJi3JQvNUaFoYu..."
}
}

400
{
"code": 400,
"message": "Bad request."
}

{
"code": 401,
"message": "Malformed authorization."
}

{
"code": 404,
"message": "Not found."
}
