# Delete monitored tokens

> Delete tokens from the monitored token list.

## OpenAPI

```yaml openapi/configurations_1.yaml post /v1/w3s/config/entity/monitoredTokens/delete
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
  /v1/w3s/config/entity/monitoredTokens/delete:
    post:
      tags:
        - Monitor Tokens
      summary: Delete monitored tokens
      description: Delete tokens from the monitored token list.
      operationId: deleteMonitoredTokens
      requestBody:
        $ref: '#/components/requestBodies/DeleteMonitoredTokens'
      responses:
        '200':
          content: {}
          description: Success response
          headers:
            X-Request-Id:
              $ref: '#/components/headers/XRequestId'
        '400':
          $ref: '#/components/responses/BadRequest'
        '401':
          $ref: '#/components/responses/NotAuthorized'
      security:
        - BearerAuth: []
components:
  requestBodies:
    DeleteMonitoredTokens:
      content:
        application/json:
          schema:
            title: DeleteMonitoredTokensRequest
            type: object
            required:
              - tokenIds
            properties:
              tokenIds:
                type: array
                items:
                  $ref: '#/components/schemas/Id'
                description: >-
                  Token ids to be removed from the monitored tokens list. Once
                  removed, these tokens will no longer be shown by default when
                  fetching wallet balances.
                example:
                  - a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11
                minItems: 1
      description: Request body
      required: true
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
  schemas:
    Id:
      type: string
      format: uuid
      description: System-generated unique identifier of the resource.
      example: c4d1da72-111e-4d52-bdbf-2e74a2d803d5
    XRequestId:
      type: string
      description: >-
        A unique identifier, which can be helpful for identifying a request when
        communicating with Circle support.
      example: 2adba88e-9d63-44bc-b975-9b6ae3440dde
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
 --url https://api.circle.com/v1/w3s/config/entity/monitoredTokens/delete \
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
This response has no body data.

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
