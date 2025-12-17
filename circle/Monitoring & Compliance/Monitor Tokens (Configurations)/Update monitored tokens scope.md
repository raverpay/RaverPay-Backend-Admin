# Update monitored tokens scope

> Select between monitoring all tokens or selected tokens added to the monitored tokens list.

## OpenAPI

```yaml openapi/configurations_1.yaml put /v1/w3s/config/entity/monitoredTokens/scope
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
  /v1/w3s/config/entity/monitoredTokens/scope:
    put:
      tags:
        - Monitor Tokens
      summary: Update monitored tokens scope
      description: >-
        Select between monitoring all tokens or selected tokens added to the
        monitored tokens list.
      operationId: updateMonitoredTokensScope
      requestBody:
        $ref: '#/components/requestBodies/UpdateMonitoredTokensScope'
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
    UpdateMonitoredTokensScope:
      content:
        application/json:
          schema:
            title: UpdateMonitoredTokensScopeRequest
            type: object
            required:
              - scope
            properties:
              scope:
                $ref: '#/components/schemas/TokenMonitorScope'
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
    TokenMonitorScope:
      title: TokenMonitorScope
      type: string
      enum:
        - SELECTED
        - MONITOR_ALL
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

curl --request PUT \
 --url https://api.circle.com/v1/w3s/config/entity/monitoredTokens/scope \
 --header 'Authorization: Bearer <token>' \
 --header 'Content-Type: application/json' \
 --data '
{
"scope": "SELECTED"
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
