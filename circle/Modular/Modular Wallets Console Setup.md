# Modular Wallets Console Setup

This guide demonstrates how to create a client key and configure passkey
settings on the Circle Console.. This is needed to enable the basic
functionality provided by modular wallets. Once these steps are completed,
proceed to the
[Modular Wallets Quickstart](/wallets/modular/create-a-wallet-and-send-gasless-txn).

<Note>
  If you're building a web application, you need to ensure on the Circle Console
  that the Client Key's **Allowed Domain** input value matches exactly the
  Passkey's **Domain Name** configuration at the time of your product launch.
  These two settings must be consistent for your application to function
  correctly.
</Note>

## Create Client Key

Perform the steps below to create your client key.

1. Login to the [Circle Console](https://console.circle.com/), navigate to the
   **API & Client Keys** section, and click on `Create a key`.

<Frame>
  <img src="https://mintcdn.com/circle-167b8d39/ZkyJVjZm1cqURNjM/w3s/images/mw-setup-apiclientkeys01.png?fit=max&auto=format&n=ZkyJVjZm1cqURNjM&q=85&s=88b375eaadeaeb75cc92a401c1a9d2a0" data-og-width="1600" width="1600" data-og-height="1207" height="1207" data-path="w3s/images/mw-setup-apiclientkeys01.png" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/circle-167b8d39/ZkyJVjZm1cqURNjM/w3s/images/mw-setup-apiclientkeys01.png?w=280&fit=max&auto=format&n=ZkyJVjZm1cqURNjM&q=85&s=345d1a360b3ce76fb6daffb68307ebc3 280w, https://mintcdn.com/circle-167b8d39/ZkyJVjZm1cqURNjM/w3s/images/mw-setup-apiclientkeys01.png?w=560&fit=max&auto=format&n=ZkyJVjZm1cqURNjM&q=85&s=71c96264423c4d38effa3f039785e8b7 560w, https://mintcdn.com/circle-167b8d39/ZkyJVjZm1cqURNjM/w3s/images/mw-setup-apiclientkeys01.png?w=840&fit=max&auto=format&n=ZkyJVjZm1cqURNjM&q=85&s=703934243442515ec6683fc05130aba9 840w, https://mintcdn.com/circle-167b8d39/ZkyJVjZm1cqURNjM/w3s/images/mw-setup-apiclientkeys01.png?w=1100&fit=max&auto=format&n=ZkyJVjZm1cqURNjM&q=85&s=d138aa0d51d7839a2b4fe869d4dc6444 1100w, https://mintcdn.com/circle-167b8d39/ZkyJVjZm1cqURNjM/w3s/images/mw-setup-apiclientkeys01.png?w=1650&fit=max&auto=format&n=ZkyJVjZm1cqURNjM&q=85&s=f2e0e3af0b5c5c824469e59cce64d763 1650w, https://mintcdn.com/circle-167b8d39/ZkyJVjZm1cqURNjM/w3s/images/mw-setup-apiclientkeys01.png?w=2500&fit=max&auto=format&n=ZkyJVjZm1cqURNjM&q=85&s=6520c1b94946eb39f43ec7ebe5f9b7d8 2500w" />
</Frame>

2. Select the **Client Key** option and type your client **Key Name**.

Each client key is bound to your application for identification and
authorization. Therefore, depending on your application setup, you may be able
to customize the following fields:

- Web **Allowed Domain**; for example, `your.website.com`, `localhost`, or
  `chrome-extension://<extension-id>`
- iOS **Bundle ID**; for example, `com.yourcompany.yourapp`
- Android
  - Package Name; for example, `com.yourcompany.yourapp`
  - Signature (SHA256); for example, `XX:XX:…:XX` (where `X`: `[0-9A-F]`)

<Note>
  **Platform Settings**

1. If you run your web application locally, you can use `localhost` for the
   **Allowed Domain**. If you host your web application under a domain server,
   say `your.website.com`, you can use that domain server URL. For Chrome
   extensions, use the extension's URL in the format
   `chrome-extension://<extension-id>` as the **Allowed Domain**. You can find
   the extension ID on the Chrome Extensions page (`chrome://extensions`).

2. If your application runs on multiple platforms, you can either configure the
   settings for each platform under such **Client Key**, or create a new
   **Client Key** for enhanced security; the latter approach is recommended.
   </Note>

<Frame>
  <img src="https://mintcdn.com/circle-167b8d39/ZkyJVjZm1cqURNjM/w3s/images/mw-setup-createclientkey01.png?fit=max&auto=format&n=ZkyJVjZm1cqURNjM&q=85&s=e5238b997d558936b98c5dd4fb0b064b" data-og-width="1520" width="1520" data-og-height="1600" height="1600" data-path="w3s/images/mw-setup-createclientkey01.png" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/circle-167b8d39/ZkyJVjZm1cqURNjM/w3s/images/mw-setup-createclientkey01.png?w=280&fit=max&auto=format&n=ZkyJVjZm1cqURNjM&q=85&s=031bd76dd523b45c9b444e774516a4ee 280w, https://mintcdn.com/circle-167b8d39/ZkyJVjZm1cqURNjM/w3s/images/mw-setup-createclientkey01.png?w=560&fit=max&auto=format&n=ZkyJVjZm1cqURNjM&q=85&s=a2d78ba711043a32a840d6d0ca68699d 560w, https://mintcdn.com/circle-167b8d39/ZkyJVjZm1cqURNjM/w3s/images/mw-setup-createclientkey01.png?w=840&fit=max&auto=format&n=ZkyJVjZm1cqURNjM&q=85&s=b6e41c99930ad544b4178604fa9b742c 840w, https://mintcdn.com/circle-167b8d39/ZkyJVjZm1cqURNjM/w3s/images/mw-setup-createclientkey01.png?w=1100&fit=max&auto=format&n=ZkyJVjZm1cqURNjM&q=85&s=1ff1fd1b71ab33cb58947351b28eb1a8 1100w, https://mintcdn.com/circle-167b8d39/ZkyJVjZm1cqURNjM/w3s/images/mw-setup-createclientkey01.png?w=1650&fit=max&auto=format&n=ZkyJVjZm1cqURNjM&q=85&s=f0e3bf056400ac3125195c02e26b58ba 1650w, https://mintcdn.com/circle-167b8d39/ZkyJVjZm1cqURNjM/w3s/images/mw-setup-createclientkey01.png?w=2500&fit=max&auto=format&n=ZkyJVjZm1cqURNjM&q=85&s=276d3cc974478909baf11976778882c0 2500w" />
</Frame>

3. Verify that the **Client Key** was created.

Once the information provided in the previous steps is validated, the system
generates a client key. Please store it in a safe place, as it won't be
displayed on the Console again.

<Note>
  Circle provides a built-in indexing service, allowing you to access
  transaction data per wallet faster and easier. You can check the transaction
  and `userOps` details through the Circle Console, or if you'd like to retrieve
  data from Circle's Indexing Service directly, you'll need to create an API Key
  to authenticate the RESTful API requests from your backend. Check the Modular
  Wallets API reference [here](/api-reference/wallets/buidl/list-transfers).
</Note>

<Frame>
  <img src="https://mintcdn.com/circle-167b8d39/ZkyJVjZm1cqURNjM/w3s/images/mw-setup-clientkeycreated01.png?fit=max&auto=format&n=ZkyJVjZm1cqURNjM&q=85&s=71ddc241662d50eae71bd60fdb4e88dc" data-og-width="1440" width="1440" data-og-height="1024" height="1024" data-path="w3s/images/mw-setup-clientkeycreated01.png" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/circle-167b8d39/ZkyJVjZm1cqURNjM/w3s/images/mw-setup-clientkeycreated01.png?w=280&fit=max&auto=format&n=ZkyJVjZm1cqURNjM&q=85&s=4d4bc187cef9d1277827c31b93b86148 280w, https://mintcdn.com/circle-167b8d39/ZkyJVjZm1cqURNjM/w3s/images/mw-setup-clientkeycreated01.png?w=560&fit=max&auto=format&n=ZkyJVjZm1cqURNjM&q=85&s=f1c06db3da01a56b718af76a51edac06 560w, https://mintcdn.com/circle-167b8d39/ZkyJVjZm1cqURNjM/w3s/images/mw-setup-clientkeycreated01.png?w=840&fit=max&auto=format&n=ZkyJVjZm1cqURNjM&q=85&s=5f7430f1ee551941eda381f59ae70464 840w, https://mintcdn.com/circle-167b8d39/ZkyJVjZm1cqURNjM/w3s/images/mw-setup-clientkeycreated01.png?w=1100&fit=max&auto=format&n=ZkyJVjZm1cqURNjM&q=85&s=1259a521b999b7bea25b6b5c4393a58b 1100w, https://mintcdn.com/circle-167b8d39/ZkyJVjZm1cqURNjM/w3s/images/mw-setup-clientkeycreated01.png?w=1650&fit=max&auto=format&n=ZkyJVjZm1cqURNjM&q=85&s=602f681c0b223bb197e05e5475a02834 1650w, https://mintcdn.com/circle-167b8d39/ZkyJVjZm1cqURNjM/w3s/images/mw-setup-clientkeycreated01.png?w=2500&fit=max&auto=format&n=ZkyJVjZm1cqURNjM&q=85&s=bc33af35e344a627cc9fc485734c7b18 2500w" />
</Frame>

## Configure Passkey Domain

Perform the steps below to configure the **Domain Name** for your Passkey.

Enter the domain name of your application where users will be onboarded. Each
passkey created will be associated with this domain.

<Note>
  **Passkey for Mobile Apps**

To enable passkey support for your iOS or Android application, you'll have to
configure a web domain to associate your app with a website that your app owns,
as passkeys on mobile-native apps are also domain-bound, similar to web
applications.
</Note>

Configuration is required to enable Passkeys on mobile-native applications:

- **iOS**: A JSON file is required at the domain root:\
  `/.well-known /apple-app-site-association`. Refer to
  [this resource](https://developer.apple.com/documentation/xcode/configuring-an-associated-domain)
  for more details.
- **Android**: A JSON file is required at the domain root:\
  `/.well-known/assetlinks.json`. Refer to
  [this resource](https://developer.android.com/identity/sign-in/credential-manager#add-support-dal)
  for more details.

<Frame>
  <img src="https://mintcdn.com/circle-167b8d39/ZkyJVjZm1cqURNjM/w3s/images/mw-setup-passkey01.png?fit=max&auto=format&n=ZkyJVjZm1cqURNjM&q=85&s=a6bf9dffcfeb4b08a59db9c1f41f9c1c" data-og-width="1600" width="1600" data-og-height="971" height="971" data-path="w3s/images/mw-setup-passkey01.png" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/circle-167b8d39/ZkyJVjZm1cqURNjM/w3s/images/mw-setup-passkey01.png?w=280&fit=max&auto=format&n=ZkyJVjZm1cqURNjM&q=85&s=51315c02eabd432570aaffd2853713cf 280w, https://mintcdn.com/circle-167b8d39/ZkyJVjZm1cqURNjM/w3s/images/mw-setup-passkey01.png?w=560&fit=max&auto=format&n=ZkyJVjZm1cqURNjM&q=85&s=4a9253abb3f3e936ddff46f2cf34a18a 560w, https://mintcdn.com/circle-167b8d39/ZkyJVjZm1cqURNjM/w3s/images/mw-setup-passkey01.png?w=840&fit=max&auto=format&n=ZkyJVjZm1cqURNjM&q=85&s=8ed5fb95273e896e4455f48119fca63f 840w, https://mintcdn.com/circle-167b8d39/ZkyJVjZm1cqURNjM/w3s/images/mw-setup-passkey01.png?w=1100&fit=max&auto=format&n=ZkyJVjZm1cqURNjM&q=85&s=ea8f91dc68ab6dfa877ae72174813cef 1100w, https://mintcdn.com/circle-167b8d39/ZkyJVjZm1cqURNjM/w3s/images/mw-setup-passkey01.png?w=1650&fit=max&auto=format&n=ZkyJVjZm1cqURNjM&q=85&s=a236dfa7c124e35e32f0b6deae595405 1650w, https://mintcdn.com/circle-167b8d39/ZkyJVjZm1cqURNjM/w3s/images/mw-setup-passkey01.png?w=2500&fit=max&auto=format&n=ZkyJVjZm1cqURNjM&q=85&s=8043e19b65d4d989f73ad48bc9599b01 2500w" />
</Frame>

## Retrieve Client URL

Visit the Configurator page to retrieve the **Client URL**, or copy from here:
`https://modular-sdk.circle.com/v1/rpc/w3s/buidl`. This URL is required for the
following **modular wallets SDK** methods:

- `toPasskeyTransport()`
- `toModularTransport()`: When using this method, you must specify the
  blockchain network. For more details, refer to the
  [Modular Wallets Quickstart](/wallets/modular/create-a-wallet-and-send-gasless-txn).

<Frame>
  <img src="https://mintcdn.com/circle-167b8d39/ZkyJVjZm1cqURNjM/w3s/images/mw-setup-clienturl01.png?fit=max&auto=format&n=ZkyJVjZm1cqURNjM&q=85&s=ffe1d90cc25043607045a35ef9f3e182" data-og-width="1440" width="1440" data-og-height="1267" height="1267" data-path="w3s/images/mw-setup-clienturl01.png" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/circle-167b8d39/ZkyJVjZm1cqURNjM/w3s/images/mw-setup-clienturl01.png?w=280&fit=max&auto=format&n=ZkyJVjZm1cqURNjM&q=85&s=11378b5268d64392f6b319f7c14b215a 280w, https://mintcdn.com/circle-167b8d39/ZkyJVjZm1cqURNjM/w3s/images/mw-setup-clienturl01.png?w=560&fit=max&auto=format&n=ZkyJVjZm1cqURNjM&q=85&s=906728ad5cf3a0e54c88c89fa8689a12 560w, https://mintcdn.com/circle-167b8d39/ZkyJVjZm1cqURNjM/w3s/images/mw-setup-clienturl01.png?w=840&fit=max&auto=format&n=ZkyJVjZm1cqURNjM&q=85&s=3b676909de009b1fbc69faca5023f201 840w, https://mintcdn.com/circle-167b8d39/ZkyJVjZm1cqURNjM/w3s/images/mw-setup-clienturl01.png?w=1100&fit=max&auto=format&n=ZkyJVjZm1cqURNjM&q=85&s=e4981f1620c9867f7e9eaf2be9e66cc7 1100w, https://mintcdn.com/circle-167b8d39/ZkyJVjZm1cqURNjM/w3s/images/mw-setup-clienturl01.png?w=1650&fit=max&auto=format&n=ZkyJVjZm1cqURNjM&q=85&s=5e3ab104098892170a58bf54824f5b27 1650w, https://mintcdn.com/circle-167b8d39/ZkyJVjZm1cqURNjM/w3s/images/mw-setup-clienturl01.png?w=2500&fit=max&auto=format&n=ZkyJVjZm1cqURNjM&q=85&s=8435fc13eb969716336fa832da43c6bb 2500w" />
</Frame>

---

> To find navigation and other pages in this documentation, fetch the llms.txt file at: https://developers.circle.com/llms.txt
