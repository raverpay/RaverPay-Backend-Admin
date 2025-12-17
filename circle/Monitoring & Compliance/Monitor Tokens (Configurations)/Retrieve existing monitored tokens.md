# Retrieve existing monitored tokens.

> Get monitored tokens

## OpenAPI

```yaml openapi/configurations_1.yaml get /v1/w3s/config/entity/monitoredTokens
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
  /v1/w3s/config/entity/monitoredTokens:
    get:
      tags:
        - Monitor Tokens
      summary: Retrieve existing monitored tokens.
      description: Get monitored tokens
      operationId: listMonitoredTokens
      parameters:
        - $ref: '#/components/parameters/Blockchain'
        - $ref: '#/components/parameters/TokenAddress'
        - $ref: '#/components/parameters/TokenSymbol'
        - $ref: '#/components/parameters/From'
        - $ref: '#/components/parameters/To'
        - $ref: '#/components/parameters/PageBefore'
        - $ref: '#/components/parameters/PageAfter'
        - $ref: '#/components/parameters/PageSize'
      responses:
        '200':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/MonitoredTokens'
          description: OK
          headers:
            X-Request-Id:
              $ref: '#/components/headers/XRequestId'
            Link:
              $ref: '#/components/headers/PaginationLink'
        '400':
          $ref: '#/components/responses/BadRequest'
      security:
        - BearerAuth: []
components:
  parameters:
    Blockchain:
      name: blockchain
      description: Filter by blockchain.
      in: query
      schema:
        $ref: '#/components/schemas/Blockchain'
    TokenAddress:
      name: tokenAddress
      description: Filter by token address.
      in: query
      schema:
        $ref: '#/components/schemas/Address'
    TokenSymbol:
      name: symbol
      description: Filter by token symbol.
      in: query
      schema:
        type: string
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
  schemas:
    MonitoredTokens:
      title: MonitoredTokensResponse
      type: object
      properties:
        data:
          type: object
          properties:
            scope:
              $ref: '#/components/schemas/TokenMonitorScope'
            tokens:
              type: array
              items:
                $ref: '#/components/schemas/Token'
              description: >-
                The list of tokens that have been added to the monitored tokens
                list. When fetching wallet balances, only these tokens will be
                shown by default.
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
    TokenMonitorScope:
      title: TokenMonitorScope
      type: string
      enum:
        - SELECTED
        - MONITOR_ALL
    Token:
      title: Token
      type: object
      required:
        - id
        - blockchain
        - isNative
        - createDate
        - updateDate
      properties:
        id:
          $ref: '#/components/schemas/Id'
        name:
          type: string
          description: Blockchain name of the specified token.
        standard:
          $ref: '#/components/schemas/TokenStandard'
        blockchain:
          $ref: '#/components/schemas/Blockchain'
        decimals:
          type: integer
          description: Number of decimal places shown in the token amount.
        isNative:
          type: boolean
          description: >-
            Defines if the token is a native token of the specified blockchain.
            If TRUE, the token is a native token.
        symbol:
          type: string
          description: Blockchain symbol of the specified token.
        tokenAddress:
          $ref: '#/components/schemas/Address'
        updateDate:
          $ref: '#/components/schemas/UpdateDate'
        createDate:
          $ref: '#/components/schemas/CreateDate'
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
    TokenStandard:
      title: TokenStandard
      type: string
      enum:
        - ERC20
        - ERC721
        - ERC1155
        - Fungible
        - FungibleAsset
        - NonFungible
        - NonFungibleEdition
        - ProgrammableNonFungible
        - ProgrammableNonFungibleEdition
    UpdateDate:
      type: string
      format: date-time
      description: Date and time the resource was last updated, in ISO-8601 UTC format.
      example: '2023-01-01T12:04:05Z'
    CreateDate:
      type: string
      format: date-time
      description: Date and time the resource was created, in ISO-8601 UTC format.
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

curl --request GET \
 --url 'https://api.circle.com/v1/w3s/config/entity/monitoredTokens?pageSize=10' \
 --header 'Authorization: Bearer <token>'

200
{
"data": {
"scope": "SELECTED",
"tokens": [
{
"id": "c4d1da72-111e-4d52-bdbf-2e74a2d803d5",
"blockchain": "MATIC-AMOY",
"isNative": true,
"updateDate": "2023-01-01T12:04:05Z",
"createDate": "2023-01-01T12:04:05Z",
"name": "<string>",
"standard": "ERC20",
"decimals": 123,
"symbol": "<string>",
"tokenAddress": "0xca9142d0b9804ef5e239d3bc1c7aa0d1c74e7350"
}
]
}
}

400
{
"code": 400,
"message": "Bad request."
}
