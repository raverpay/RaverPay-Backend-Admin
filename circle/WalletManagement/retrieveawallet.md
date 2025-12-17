# List wallets

> Retrieves a list of all wallets that fit the specified parameters.

## OpenAPI

```yaml openapi/developer-controlled-wallets.yaml get /v1/w3s/wallets
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
  /v1/w3s/wallets:
    get:
      tags:
        - Wallets
      summary: List wallets
      description: Retrieves a list of all wallets that fit the specified parameters.
      operationId: getWallets
      parameters:
        - $ref: '#/components/parameters/WalletAddress'
        - $ref: '#/components/parameters/Blockchain'
        - $ref: '#/components/parameters/ScaCore'
        - $ref: '#/components/parameters/WalletSetId'
        - $ref: '#/components/parameters/ReferenceId'
        - $ref: '#/components/parameters/From'
        - $ref: '#/components/parameters/To'
        - $ref: '#/components/parameters/PageBefore'
        - $ref: '#/components/parameters/PageAfter'
        - $ref: '#/components/parameters/PageSize'
        - $ref: '#/components/parameters/Order'
        - $ref: '#/components/parameters/XRequestId'
      responses:
        '200':
          description: Successfully retrieved wallets.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Wallets'
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
    WalletAddress:
      name: address
      description: Filter by the blockchain address of the wallet.
      in: query
      schema:
        $ref: '#/components/schemas/Address'
    Blockchain:
      name: blockchain
      description: Filter by blockchain.
      in: query
      schema:
        $ref: '#/components/schemas/Blockchain'
    ScaCore:
      name: scaCore
      description: Filters results by the SCA version.
      in: query
      schema:
        $ref: '#/components/schemas/ScaCore'
    WalletSetId:
      name: walletSetId
      description: Filter by the wallet set.
      in: query
      schema:
        $ref: '#/components/schemas/Id'
    ReferenceId:
      name: refId
      description: Filter by the reference identifier.
      in: query
      schema:
        $ref: '#/components/schemas/ReferenceId'
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
    XRequestId:
      name: X-Request-Id
      description: >-
        Developer-provided parameter used to identify this request. Useful when
        communicating with Circle Support.
      in: header
      schema:
        $ref: '#/components/schemas/XRequestId'
  schemas:
    Wallets:
      title: WalletsResponse
      type: object
      required:
        - data
      properties:
        data:
          type: object
          required:
            - wallets
          properties:
            wallets:
              type: array
              items:
                oneOf:
                  - $ref: '#/components/schemas/EOAWallet'
                  - $ref: '#/components/schemas/SCAWallet'
                discriminator:
                  propertyName: accountType
    Address:
      title: Address
      description: >
        Blockchain generated unique identifier, associated with wallet
        (account), smart contract or other blockchain objects.
      type: string
      example: '0xca9142d0b9804ef5e239d3bc1c7aa0d1c74e7350'
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
    ScaCore:
      type: string
      description: >-
        SCAs have different versions, each with unique functionality. `SCACore`
        displays the version of the SCA being created. For a list of supported
        versions, refer to the developer documentation.
      enum:
        - circle_4337_v1
        - circle_6900_singleowner_v1
        - circle_6900_singleowner_v2
        - circle_6900_singleowner_v3
      example: circle_6900_singleowner_v2
    Id:
      type: string
      format: uuid
      description: System-generated unique identifier of the resource.
      example: c4d1da72-111e-4d52-bdbf-2e74a2d803d5
    ReferenceId:
      type: string
      description: Reference or description used to identify the object.
      example: custom_ref_id
    XRequestId:
      type: string
      description: >-
        A unique identifier, which can be helpful for identifying a request when
        communicating with Circle support.
      example: 2adba88e-9d63-44bc-b975-9b6ae3440dde
    EOAWallet:
      title: EOAWallet
      allOf:
        - $ref: '#/components/schemas/Wallet'
        - type: object
          required:
            - accountType
          properties:
            accountType:
              type: string
              description: >
                An account can be a Smart Contract Account (SCA) or an
                Externally Owned Account (EOA). To learn more, see the [account
                types
                guide](https://developers.circle.com/wallets/account-types).


                If an account type is not specified during the creation of a
                wallet, it defaults to `EOA` (Externally Owned Account). Note
                that Solana and Aptos don't support Smart Contract Account
                (SCA).
              enum:
                - EOA
    SCAWallet:
      title: SCAWallet
      allOf:
        - $ref: '#/components/schemas/Wallet'
        - type: object
          required:
            - accountType
            - scaCore
          properties:
            accountType:
              type: string
              description: >
                An account can be a Smart Contract Account (SCA) or an
                Externally Owned Account (EOA). To learn more, see the [account
                types
                guide](https://developers.circle.com/wallets/account-types).


                If an account type is not specified during the creation of a
                wallet, it defaults to `EOA` (Externally Owned Account). Note
                that Solana and Aptos don't support Smart Contract Account
                (SCA).
              enum:
                - SCA
            scaCore:
              $ref: '#/components/schemas/ScaCore'
    Wallet:
      type: object
      required:
        - id
        - state
        - walletSetId
        - custodyType
        - address
        - blockchain
        - createDate
        - updateDate
      properties:
        id:
          $ref: '#/components/schemas/Id'
        address:
          $ref: '#/components/schemas/Address'
        blockchain:
          $ref: '#/components/schemas/Blockchain'
        createDate:
          $ref: '#/components/schemas/CreateDate'
        updateDate:
          $ref: '#/components/schemas/UpdateDate'
        custodyType:
          $ref: '#/components/schemas/CustodyType'
        name:
          $ref: '#/components/schemas/Name'
        refId:
          $ref: '#/components/schemas/ReferenceId'
        state:
          $ref: '#/components/schemas/WalletState'
        userId:
          $ref: '#/components/schemas/ExternalUserId'
        walletSetId:
          $ref: '#/components/schemas/Id'
        initialPublicKey:
          $ref: '#/components/schemas/InitialPublicKey'
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
    CustodyType:
      type: string
      description: >
        Describes who controls the digital assets in a wallet: either the
        end-user or the developer.
      enum:
        - DEVELOPER
        - ENDUSER
    Name:
      type: string
      description: Name or description associated with the wallet or walletSet.
    WalletState:
      type: string
      description: This enum describes the current state of the wallet.
      enum:
        - LIVE
        - FROZEN
      example: LIVE
    ExternalUserId:
      type: string
      description: Unique system generated identifier for the user.
      example: ext_user_id_1
      maxLength: 50
      minLength: 5
    InitialPublicKey:
      type: string
      description: >-
        For NEAR blockchains only, the originally assigned public key of a
        wallet at the time of its creation.
      example: 3eQoJ3ex6uWX3R8F1THF6Y6oBQwPYpF1X9HBM1gjqw7w
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

CURL

curl --request GET \
 --url https://api.circle.com/v1/w3s/wallets/{id} \
 --header 'Authorization: Bearer <token>'

200
{
"data": {
"wallet": {
"id": "c4d1da72-111e-4d52-bdbf-2e74a2d803d5",
"address": "0xca9142d0b9804ef5e239d3bc1c7aa0d1c74e7350",
"blockchain": "MATIC-AMOY",
"createDate": "2023-01-01T12:04:05Z",
"updateDate": "2023-01-01T12:04:05Z",
"custodyType": "DEVELOPER",
"state": "LIVE",
"walletSetId": "c4d1da72-111e-4d52-bdbf-2e74a2d803d5",
"accountType": "EOA",
"name": "<string>",
"refId": "custom_ref_id",
"userId": "ext_user_id_1",
"initialPublicKey": "3eQoJ3ex6uWX3R8F1THF6Y6oBQwPYpF1X9HBM1gjqw7w"
}
}
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
