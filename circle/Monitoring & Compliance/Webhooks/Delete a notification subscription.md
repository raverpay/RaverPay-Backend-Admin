# Delete a notification subscription

> Delete an existing subscription.

## OpenAPI

```yaml openapi/configurations_2.yaml delete /v2/notifications/subscriptions/{id}
openapi: 3.0.3
info:
  version: '1.0'
  title: API Overview
  description: Common endpoints shared across all W3S APIs.
servers:
  - url: https://api.circle.com
security: []
tags:
  - name: Health
    description: Inspect the health of the API.
  - name: Webhook Subscriptions
    description: Manage subscriptions to notifications.
paths:
  /v2/notifications/subscriptions/{id}:
    delete:
      tags:
        - Webhook Subscriptions
      summary: Delete a notification subscription
      description: Delete an existing subscription.
      operationId: deleteSubscription
      parameters:
        - $ref: '#/components/parameters/Id'
        - $ref: '#/components/parameters/XRequestId'
      responses:
        '204':
          description: |
            Successfully deleted subscription.
            Note: Response body is returned empty.
          headers:
            X-Request-Id:
              $ref: '#/components/headers/XRequestId'
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
  headers:
    XRequestId:
      description: >
        Developer-provided header parameter or Circle-generated universally
        unique identifier (UUID v4). Useful for identifying a specific request
        when communicating with Circle Support.
      schema:
        $ref: '#/components/schemas/XRequestId'
  responses:
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
  schemas:
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

curl --request DELETE \
 --url https://api.circle.com/v2/notifications/subscriptions/{id} \
 --header 'Authorization: Bearer <token>'

401{
"code": 401,
"message": "Malformed authorization."
}

404
{
"code": 404,
"message": "Not found."
}
