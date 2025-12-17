# Sign delegate action

> Sign a delegate action from a specific developer-controlled wallet.

NOTE: This endpoint is only available for NEAR and NEAR-TESTNET.

## OpenAPI

```yaml openapi/developer-controlled-wallets.yaml post /v1/w3s/developer/sign/delegateAction
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
  /v1/w3s/developer/sign/delegateAction:
    post:
      tags:
        - Signing
      summary: Sign delegate action
      description: |-
        Sign a delegate action from a specific developer-controlled wallet.

        NOTE: This endpoint is only available for NEAR and NEAR-TESTNET.
      operationId: signDelegateAction
      parameters:
        - $ref: '#/components/parameters/XRequestId'
      requestBody:
        $ref: '#/components/requestBodies/SignDelegateAction'
      responses:
        '200':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SignDelegateActionResponse'
          description: Successfully signed a delegate action.
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
    SignDelegateAction:
      content:
        application/json:
          schema:
            type: object
            required:
              - unsignedDelegateAction
              - walletId
              - entitySecretCiphertext
            properties:
              walletId:
                $ref: '#/components/schemas/Id'
              unsignedDelegateAction:
                $ref: '#/components/schemas/UnsignedDelegateAction'
              entitySecretCiphertext:
                $ref: '#/components/schemas/EntitySecretCiphertext'
      required: true
      description: Schema for the request payload to sign a delegate action.
  schemas:
    SignDelegateActionResponse:
      title: SignedDelegateActionResponse
      type: object
      required:
        - data
      properties:
        data:
          type: object
          required:
            - signature
            - signedDelegateAction
          properties:
            signature:
              $ref: '#/components/schemas/Signature'
            signedDelegateAction:
              $ref: '#/components/schemas/SignedDelegateAction'
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
    UnsignedDelegateAction:
      type: string
      description: >-
        Unsigned delegate action string that needs to be signed. Must be base64
        encoded.
      example: >-
        AgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAIAAQROrEbiYfF3zCII9...
    EntitySecretCiphertext:
      type: string
      description: >
        A base64 string expression of the entity secret ciphertext. The entity
        secret should be encrypted by the entity public key. Circle mandates
        that the entity secret ciphertext is unique for each API request.
      format: byte
      example: >-
        M8OAwbJ8rMsPd8+NT4xRDBDJSNqUKAvJeWPyuwZSlVXgRucogAlBxjvjIw4nsKeJ4hejjlpmyaaJrusHm6zsvy4BLuL1an3dYn3wORjYf3sU4QN9Rdk9OJxZvE5hDNPq7okucvb1eElxPVREZvr4ew7sh4ktmwDrwWFUYwKoly4fEzxYI9zvVpCY9xPSgkA5m3u1/P2vMYZ0QFtn8lRZxCuTyc4wRLpT9TOaK46CEXCakmAYaYWnLkl18QXOSY6FhCbGm+zQ2Uu4cUPU/bqjIyQIB80ut3drInDzysQLE/FJjcJW9+q+E75LKGKnrp2zCg/Xv3TEvru9a2A0vd7InZ9kNuxnPPFc1JSO7BT2TPP89YcLO0OmtRiGoXPlYzXuNIfUsVQ5/FW9FPp4qp+iMPrAidsjQrskHPxhW92GeezLpOSkUl7lAWQoioYED979mqGfzNIZTF5Ob6fJifboiwhOab6sAKnxmvWjgFnW/bZ5a8xkzgPc4RHpIejot1Q7fpT+67eA+DVxvUqakJI6t3iEaZTNITCSU2Cfj1oyCQfrZGf9tauW49rO1zYHKoV4z9ylymOWtCUk641iyxwFCNSW47CDsc0M8iI4J6JqsNMpQuR9sdWVhROi5yn9UR7ac7pizB3dFmc0/qjtTRoYStaaSEYg3L5woALv5kAA2j4=
    Signature:
      type: string
      description: >-
        Each chain encode signatures in a different way, please refer to
        [Signing APIs doc](https://learn.circle.com/w3s/signing-apis) and the
        blockchain's document.
      example: 3W6r38STvZuBSmk2bbbct132SjEsYSARo3CJi3JQvNUaFoYu...
    SignedDelegateAction:
      type: string
      description: Signed delegate action is a base64 encoded string for NEAR.
      example: >-
        AgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABpzlAhqqen7eyTe0KQ3w+9NS4E+7sscb+Cr...
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

curl
curl --request POST \
 --url https://api.circle.com/v1/w3s/developer/sign/delegateAction \
 --header 'Authorization: Bearer <token>' \
 --header 'Content-Type: application/json' \
 --data '
{
"walletId": "c4d1da72-111e-4d52-bdbf-2e74a2d803d5",
"unsignedDelegateAction": "AgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAIAAQROrEbiYfF3zCII9...",
"entitySecretCiphertext": "M8OAwbJ8rMsPd8+NT4xRDBDJSNqUKAvJeWPyuwZSlVXgRucogAlBxjvjIw4nsKeJ4hejjlpmyaaJrusHm6zsvy4BLuL1an3dYn3wORjYf3sU4QN9Rdk9OJxZvE5hDNPq7okucvb1eElxPVREZvr4ew7sh4ktmwDrwWFUYwKoly4fEzxYI9zvVpCY9xPSgkA5m3u1/P2vMYZ0QFtn8lRZxCuTyc4wRLpT9TOaK46CEXCakmAYaYWnLkl18QXOSY6FhCbGm+zQ2Uu4cUPU/bqjIyQIB80ut3drInDzysQLE/FJjcJW9+q+E75LKGKnrp2zCg/Xv3TEvru9a2A0vd7InZ9kNuxnPPFc1JSO7BT2TPP89YcLO0OmtRiGoXPlYzXuNIfUsVQ5/FW9FPp4qp+iMPrAidsjQrskHPxhW92GeezLpOSkUl7lAWQoioYED979mqGfzNIZTF5Ob6fJifboiwhOab6sAKnxmvWjgFnW/bZ5a8xkzgPc4RHpIejot1Q7fpT+67eA+DVxvUqakJI6t3iEaZTNITCSU2Cfj1oyCQfrZGf9tauW49rO1zYHKoV4z9ylymOWtCUk641iyxwFCNSW47CDsc0M8iI4J6JqsNMpQuR9sdWVhROi5yn9UR7ac7pizB3dFmc0/qjtTRoYStaaSEYg3L5woALv5kAA2j4="
}
'

200
{
"data": {
"signature": "3W6r38STvZuBSmk2bbbct132SjEsYSARo3CJi3JQvNUaFoYu...",
"signedDelegateAction": "AgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABpzlAhqqen7eyTe0KQ3w+9NS4E+7sscb+Cr..."
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
