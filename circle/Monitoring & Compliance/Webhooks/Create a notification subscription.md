# Create a notification subscription

> Create a notification subscription by configuring an endpoint to receive notifications. For details, see the [Notification Flows](https://developers.circle.com/wallets/webhook-notification-flows) guide.

## OpenAPI

```yaml openapi/configurations_2.yaml post /v2/notifications/subscriptions
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
  /v2/notifications/subscriptions:
    post:
      tags:
        - Webhook Subscriptions
      summary: Create a notification subscription
      description: >
        Create a notification subscription by configuring an endpoint to receive
        notifications. For details, see the [Notification
        Flows](https://developers.circle.com/wallets/webhook-notification-flows)
        guide.
      operationId: createSubscription
      parameters:
        - $ref: '#/components/parameters/XRequestId'
      requestBody:
        $ref: '#/components/requestBodies/CreateSubscription'
      responses:
        '200':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SubscriptionResponse'
          description: Successfully created a notification subscription.
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
    CreateSubscription:
      content:
        application/json:
          schema:
            description: Required parameters to create a new subscription.
            type: object
            required:
              - endpoint
            properties:
              endpoint:
                type: string
                description: >-
                  URL of the endpoint to subscribe to notifications. Must be
                  publicly accessible, use HTTPS, and respond with a 2XX status
                  to a POST request.
                example: https://example.org/handler/for/notifications
              notificationTypes:
                type: array
                description: >-
                  The notification types to subscribe to. If not provided, the
                  webhook will be unrestricted, and a notification is sent for
                  every notification type. If the wildcard (`*`) or any
                  combination of the wildcard and a set of notification types is
                  provided, the webhook will also be unrestricted. If a set of
                  notification types are provided, the webhook will be
                  restricted. The restricted status of the webhook is returned
                  in the response object. Each category of notification types
                  also has a wildcard, which will restrict to all notification
                  types from that category.
                items:
                  $ref: '#/components/schemas/NotificationType'
                example:
                  - '*'
      required: true
      description: Schema for the request payload to create a new subscription.
  schemas:
    SubscriptionResponse:
      title: SubscriptionResponse
      type: object
      properties:
        data:
          $ref: '#/components/schemas/Subscription'
    XRequestId:
      type: string
      description: >-
        A unique identifier, which can be helpful for identifying a request when
        communicating with Circle support.
      example: 2adba88e-9d63-44bc-b975-9b6ae3440dde
    NotificationType:
      type: string
      enum:
        - '*'
        - transactions.*
        - transactions.inbound
        - transactions.outbound
        - challenges.*
        - challenges.accelerateTransaction
        - challenges.cancelTransaction
        - challenges.changePin
        - challenges.contractExecution
        - challenges.createTransaction
        - challenges.createWallet
        - challenges.initialize
        - challenges.restorePin
        - challenges.setPin
        - challenges.setSecurityQuestions
        - contracts.*
        - contracts.eventLog
        - modularWallet.*
        - modularWallet.userOperation
        - modularWallet.inboundTransfer
        - modularWallet.outboundTransfer
        - travelRule.*
        - travelRule.statusUpdate
        - travelRule.deny
        - travelRule.approve
        - rampSession.*
        - rampSession.completed
        - rampSession.depositReceived
        - rampSession.expired
        - rampSession.failed
        - rampSession.kycApproved
        - rampSession.kycRejected
        - rampSession.kycSubmitted
    Subscription:
      type: object
      title: Subscription
      description: Contains information about a webhook notification subscription.
      required:
        - id
        - name
        - endpoint
        - enabled
        - createDate
        - updateDate
      properties:
        id:
          $ref: '#/components/schemas/Id'
        name:
          type: string
          description: Name of the webhook notification subscription.
          example: Transactions Webhook
        endpoint:
          type: string
          description: >-
            URL of the endpoint subscribing to notifications. Must be enabled to
            receive notifications.
          example: https://example.org/handler/for/notifications
        enabled:
          type: boolean
          description: >-
            Whether the subscription is enabled. `true` indicates the
            subscription is enabled.
          example: true
        createDate:
          $ref: '#/components/schemas/CreateDate'
        updateDate:
          $ref: '#/components/schemas/UpdateDate'
        notificationTypes:
          type: array
          description: The notification types on which a notification will be sent.
          items:
            $ref: '#/components/schemas/NotificationType'
          example:
            - '*'
        restricted:
          type: boolean
          description: >-
            Whether the webhook is restricted to specific notification types. An
            unrestricted webhook will notify on all notification types. A
            restricted webhook will only notify on the notification types in the
            `notificationTypes` field.
          example: false
    Id:
      type: string
      format: uuid
      description: System-generated unique identifier of the resource.
      example: c4d1da72-111e-4d52-bdbf-2e74a2d803d5
    CreateDate:
      type: string
      format: date-time
      description: Date and time the resource was created, in ISO-8601 UTC format.
      example: '2023-01-01T12:04:05Z'
    UpdateDate:
      type: string
      format: date-time
      description: Date and time the resource was last updated, in ISO-8601 UTC format.
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
 --url https://api.circle.com/v2/notifications/subscriptions \
 --header 'Authorization: Bearer <token>' \
 --header 'Content-Type: application/json' \
 --data '
{
"endpoint": "https://example.org/handler/for/notifications",
"notificationTypes": [
"*"
]
}
'

200
{
"data": {
"id": "c4d1da72-111e-4d52-bdbf-2e74a2d803d5",
"name": "Transactions Webhook",
"endpoint": "https://example.org/handler/for/notifications",
"enabled": true,
"createDate": "2023-01-01T12:04:05Z",
"updateDate": "2023-01-01T12:04:05Z",
"notificationTypes": [
"*"
],
"restricted": false
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
