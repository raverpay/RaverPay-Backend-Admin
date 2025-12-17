# Cancel a transaction

> Cancels a specified transaction from a developer-controlled wallet. Gas fees may still be incurred.
> This is a best-effort operation, it won't be effective if the original transaction has already been processed by the blockchain.

## OpenAPI

```yaml openapi/developer-controlled-wallets.yaml post /v1/w3s/developer/transactions/{id}/cancel
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
  /v1/w3s/developer/transactions/{id}/cancel:
    post:
      tags:
        - Transactions
      summary: Cancel a transaction
      description: >
        Cancels a specified transaction from a developer-controlled wallet. Gas
        fees may still be incurred. 

        This is a best-effort operation, it won't be effective if the original
        transaction has already been processed by the blockchain.
      operationId: createDeveloperTransactionCancel
      parameters:
        - $ref: '#/components/parameters/Id'
        - $ref: '#/components/parameters/XRequestId'
      requestBody:
        $ref: '#/components/requestBodies/CancelTransactionForDeveloper'
      responses:
        '200':
          description: Transaction canceled
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/CancelTransactionForDeveloper'
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
    XRequestId:
      name: X-Request-Id
      description: >-
        Developer-provided parameter used to identify this request. Useful when
        communicating with Circle Support.
      in: header
      schema:
        $ref: '#/components/schemas/XRequestId'
  requestBodies:
    CancelTransactionForDeveloper:
      required: true
      description: Cancel transaction for developer request
      content:
        application/json:
          schema:
            title: CancelTransactionForDeveloperRequest
            type: object
            required:
              - entitySecretCiphertext
              - idempotencyKey
            properties:
              idempotencyKey:
                $ref: '#/components/schemas/IdempotencyKey'
              entitySecretCiphertext:
                $ref: '#/components/schemas/EntitySecretCiphertext'
  schemas:
    CancelTransactionForDeveloper:
      title: CancelTransactionForDeveloperResponse
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
    EntitySecretCiphertext:
      type: string
      description: >
        A base64 string expression of the entity secret ciphertext. The entity
        secret should be encrypted by the entity public key. Circle mandates
        that the entity secret ciphertext is unique for each API request.
      format: byte
      example: >-
        M8OAwbJ8rMsPd8+NT4xRDBDJSNqUKAvJeWPyuwZSlVXgRucogAlBxjvjIw4nsKeJ4hejjlpmyaaJrusHm6zsvy4BLuL1an3dYn3wORjYf3sU4QN9Rdk9OJxZvE5hDNPq7okucvb1eElxPVREZvr4ew7sh4ktmwDrwWFUYwKoly4fEzxYI9zvVpCY9xPSgkA5m3u1/P2vMYZ0QFtn8lRZxCuTyc4wRLpT9TOaK46CEXCakmAYaYWnLkl18QXOSY6FhCbGm+zQ2Uu4cUPU/bqjIyQIB80ut3drInDzysQLE/FJjcJW9+q+E75LKGKnrp2zCg/Xv3TEvru9a2A0vd7InZ9kNuxnPPFc1JSO7BT2TPP89YcLO0OmtRiGoXPlYzXuNIfUsVQ5/FW9FPp4qp+iMPrAidsjQrskHPxhW92GeezLpOSkUl7lAWQoioYED979mqGfzNIZTF5Ob6fJifboiwhOab6sAKnxmvWjgFnW/bZ5a8xkzgPc4RHpIejot1Q7fpT+67eA+DVxvUqakJI6t3iEaZTNITCSU2Cfj1oyCQfrZGf9tauW49rO1zYHKoV4z9ylymOWtCUk641iyxwFCNSW47CDsc0M8iI4J6JqsNMpQuR9sdWVhROi5yn9UR7ac7pizB3dFmc0/qjtTRoYStaaSEYg3L5woALv5kAA2j4=
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
 --url https://api.circle.com/v1/w3s/developer/transactions/{id}/cancel \
 --header 'Authorization: Bearer <token>' \
 --header 'Content-Type: application/json' \
 --data '
{
"idempotencyKey": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
"entitySecretCiphertext": "M8OAwbJ8rMsPd8+NT4xRDBDJSNqUKAvJeWPyuwZSlVXgRucogAlBxjvjIw4nsKeJ4hejjlpmyaaJrusHm6zsvy4BLuL1an3dYn3wORjYf3sU4QN9Rdk9OJxZvE5hDNPq7okucvb1eElxPVREZvr4ew7sh4ktmwDrwWFUYwKoly4fEzxYI9zvVpCY9xPSgkA5m3u1/P2vMYZ0QFtn8lRZxCuTyc4wRLpT9TOaK46CEXCakmAYaYWnLkl18QXOSY6FhCbGm+zQ2Uu4cUPU/bqjIyQIB80ut3drInDzysQLE/FJjcJW9+q+E75LKGKnrp2zCg/Xv3TEvru9a2A0vd7InZ9kNuxnPPFc1JSO7BT2TPP89YcLO0OmtRiGoXPlYzXuNIfUsVQ5/FW9FPp4qp+iMPrAidsjQrskHPxhW92GeezLpOSkUl7lAWQoioYED979mqGfzNIZTF5Ob6fJifboiwhOab6sAKnxmvWjgFnW/bZ5a8xkzgPc4RHpIejot1Q7fpT+67eA+DVxvUqakJI6t3iEaZTNITCSU2Cfj1oyCQfrZGf9tauW49rO1zYHKoV4z9ylymOWtCUk641iyxwFCNSW47CDsc0M8iI4J6JqsNMpQuR9sdWVhROi5yn9UR7ac7pizB3dFmc0/qjtTRoYStaaSEYg3L5woALv5kAA2j4="
}
'

200
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
