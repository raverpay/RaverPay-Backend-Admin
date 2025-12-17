# Get a wallet set

> Retrieve an existing wallet set.

## OpenAPI

```yaml openapi/developer-controlled-wallets.yaml get /v1/w3s/walletSets/{id}
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
  /v1/w3s/walletSets/{id}:
    get:
      tags:
        - Wallet Sets
      summary: Get a wallet set
      description: Retrieve an existing wallet set.
      operationId: getWalletSet
      parameters:
        - $ref: '#/components/parameters/Id'
        - $ref: '#/components/parameters/XRequestId'
      responses:
        '200':
          description: Successfully retrieved wallet set.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/WalletSetResponse'
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
  schemas:
    WalletSetResponse:
      title: WalletSetResponse
      type: object
      required:
        - data
      properties:
        data:
          type: object
          required:
            - walletSet
          properties:
            walletSet:
              oneOf:
                - $ref: '#/components/schemas/DeveloperWalletSet'
                - $ref: '#/components/schemas/EndUserWalletSet'
              discriminator:
                propertyName: custodyType
    XRequestId:
      type: string
      description: >-
        A unique identifier, which can be helpful for identifying a request when
        communicating with Circle support.
      example: 2adba88e-9d63-44bc-b975-9b6ae3440dde
    DeveloperWalletSet:
      allOf:
        - $ref: '#/components/schemas/WalletSet'
        - type: object
          required:
            - custodyType
          properties:
            custodyType:
              type: string
              enum:
                - DEVELOPER
    EndUserWalletSet:
      allOf:
        - $ref: '#/components/schemas/WalletSet'
        - type: object
          required:
            - custodyType
            - userId
          properties:
            custodyType:
              type: string
              enum:
                - ENDUSER
            userId:
              $ref: '#/components/schemas/ExternalUserId'
    WalletSet:
      type: object
      required:
        - id
        - custodyType
        - createDate
        - updateDate
      properties:
        id:
          $ref: '#/components/schemas/Id'
        createDate:
          $ref: '#/components/schemas/CreateDate'
        updateDate:
          $ref: '#/components/schemas/UpdateDate'
    ExternalUserId:
      type: string
      description: Unique system generated identifier for the user.
      example: ext_user_id_1
      maxLength: 50
      minLength: 5
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

> To find navigation and other pages in this documentation, fetch the llms.txt file at: https://developers.circle.com/llms.txt
