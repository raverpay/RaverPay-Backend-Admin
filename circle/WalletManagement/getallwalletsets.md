# Get all wallet sets

> Retrieve an array of existing wallet sets.

## OpenAPI

```yaml openapi/developer-controlled-wallets.yaml get /v1/w3s/walletSets
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
  /v1/w3s/walletSets:
    get:
      tags:
        - Wallet Sets
      summary: Get all wallet sets
      description: Retrieve an array of existing wallet sets.
      operationId: getWalletSets
      parameters:
        - $ref: '#/components/parameters/XRequestId'
        - $ref: '#/components/parameters/From'
        - $ref: '#/components/parameters/To'
        - $ref: '#/components/parameters/PageBefore'
        - $ref: '#/components/parameters/PageAfter'
        - $ref: '#/components/parameters/PageSize'
        - $ref: '#/components/parameters/Order'
      responses:
        '200':
          description: Successfully retrieved wallet sets.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/WalletSets'
          headers:
            X-Request-Id:
              $ref: '#/components/headers/XRequestId'
            Link:
              $ref: '#/components/headers/PaginationLink'
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
    From:
      name: from
      description: >-
        Queries items created since the specified date-time (inclusive) in ISO
        8601 format.
      in: query
      schema:
        type: string
        format: date-time
        example: '2023-01-01T12:04:05Z'
    To:
      name: to
      description: >-
        Queries items created before the specified date-time (inclusive) in ISO
        8601 format.
      in: query
      schema:
        type: string
        format: date-time
        example: '2023-01-01T12:04:05Z'
    PageBefore:
      name: pageBefore
      description: >
        A collection ID value used for pagination.


        It marks the exclusive end of a page. When provided, the collection
        resource will return the next n items before

        the id, with n being specified by pageSize.


        The items will be returned in the natural order of the collection.


        The resource will return the first page if neither pageAfter nor
        pageBefore are specified. 


        SHOULD NOT be used in conjunction with pageAfter.
      in: query
      schema:
        type: string
        format: uuid
    PageAfter:
      name: pageAfter
      description: >
        A collection ID value used for pagination.


        It marks the exclusive begin of a page. When provided, the collection
        resource will return the next n items after

        the id, with n being specified by pageSize.


        The items will be returned in the natural order of the collection.


        The resource will return the first page if neither pageAfter nor
        pageBefore are specified.


        SHOULD NOT be used in conjunction with pageBefore.
      in: query
      schema:
        type: string
        format: uuid
    PageSize:
      name: pageSize
      description: >
        Limits the number of items to be returned.


        Some collections have a strict upper bound that will disregard this
        value. In case the specified value is higher

        than the allowed limit, the collection limit will be used.


        If avoided, the collection will determine the page size itself.
      in: query
      schema:
        type: integer
        default: 10
        maximum: 50
        minimum: 1
    Order:
      name: order
      description: |
        Specifies the sort order of the collection by `CreateDate`.

        Valid values:
        - `ASC` – Sort results in ascending order.
        - `DESC` – Sort results in descending order (default).
      in: query
      schema:
        type: string
        enum:
          - ASC
          - DESC
        default: DESC
  schemas:
    WalletSets:
      title: WalletSetsResponse
      type: object
      required:
        - data
      properties:
        data:
          type: object
          required:
            - walletSets
          properties:
            walletSets:
              type: array
              items:
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
    PaginationLink:
      description: >
        Pagination cursor information. Format includes the following link
        relations: - self: URL pointing to the current page. - first: URL
        pointing to the first page. - next: URL pointing to the next page
        (omitted on the last page). - prev: URL pointing to the previous page
        (omitted on the first page).

        It's important to form calls with Link header values instead of
        constructing your own URLs.
      schema:
        type: string
        example: >-
          <https://api.circle.com/v1/w3s/wallets?pageAfter=32d1b923-c30d-58de-a42e-157bf7148b85&pageSize=2>;
          rel="next"
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
