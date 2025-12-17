# Cross-Chain Transfer Protocol

Move USDC securely across blockchains and simplify user experience

## Overview

[Cross-Chain Transfer Protocol (CCTP)](https://circle.com/cctp) is a
permissionless onchain utility that securely transfers USDC between supported
blockchains by burning tokens on the source chain and minting them on the
destination chain. Circle created CCTP to improve capital efficiency and reduce
trust assumptions when using USDC across blockchains. CCTP enables developers to
build multichain applications that allow users to perform secure 1:1 USDC
transfers across chains.

<Tip>
  **Tip**: Use Bridge Kit to simplify crosschain transfers with CCTP.

[Bridge Kit](/bridge-kit) is an SDK that leverages CCTP as its protocol
provider, letting you transfer USDC between blockchains in just a few lines of
code.
</Tip>

CCTP supports both **Fast Transfer** and **Standard Transfer**, and also
integrates **Hooks** for custom logic. Fast Transfer enables USDC transfers
between blockchains at faster-than-finality speeds, reducing transfer times from
over 15 minutes to under 30 seconds across most domains. Hooks enhance
crosschain composability by allowing you to trigger automated actions
post-transfer. For more details, see the
[Hooks](/cctp/technical-guide#cctp-hooks) section.

## Background and design

The following sections provide additional context on CCTP's evolution, the
challenges it addresses, and its architectural principles. Expand any to explore
these deeper technical details.

<AccordionGroup>
  <Accordion title="Understanding the Problem">
    Blockchains often operate in siloed environments and cannot natively communicate
    with one another. While some ecosystems, such as Cosmos, use built-in protocols
    like the Inter-Blockchain Communication (IBC) protocol to enable data
    transmission between their appchains, direct communication between isolated
    networks, such as Ethereum and Avalanche, remains infeasible.

    Traditional bridges exist to address this limitation by enabling the transfer of
    digital assets, such as USDC, across blockchains. However, these bridges come
    with significant drawbacks. Two common methods, lock-and-mint bridging and
    liquidity pool bridging, require depositing USDC liquidity into third-party
    smart contracts. This approach reduces capital efficiency, acts as a target for
    malicious attacks, and introduces additional trust assumptions.

  </Accordion>

  <Accordion title="Design Approach">
    As a low-level primitive, CCTP can be embedded in any app, wallet, or bridge to
    enhance and simplify the user experience for crosschain use cases. With USDC
    circulating across a large number of blockchain networks, CCTP connects and
    unifies liquidity across the disparate ecosystems where it's supported.

    CCTP is built on generalized message passing and designed for composability and
    flexible use cases. Developers can extend its capabilities beyond just moving
    USDC between blockchains. For example, you can create a flow where USDC is sent
    across chains and automatically deposited into a DeFi lending pool after the
    transfer, allowing it to generate yield in an automated manner. This experience
    can be designed to feel like a seamless, single transaction for the end user.

  </Accordion>
</AccordionGroup>

## How CCTP works

CCTP enables fast and secure transfers of USDC across blockchains through two
transfer methods: **Fast Transfer** and **Standard Transfer**. Both involve
burning USDC on the source chain and minting it on the destination chain, but
the steps and speed differ:

<Tabs>
  <Tab title="Fast Transfer">
    **Fast Transfer** is an advanced feature of CCTP designed for speed-sensitive
    use cases. It leverages Circle's Attestation Service and Fast Transfer Allowance
    to enable *faster-than-finality* (soft finality) transfers. The process involves
    the following steps:

    1. **Initiation**. A user accesses an app powered by CCTP and initiates a Fast
       Transfer of USDC, specifying the recipient's wallet address on the
       destination chain.
    2. **Burn Event**. The app facilitates a burn of the specified USDC amount on
       the source blockchain.
    3. **Instant Attestation**. Circle's Attestation Service attests to the burn
       event after soft finality (which varies per chain) and issues a signed
       attestation.
    4. **Fast Transfer Allowance Backing**. Until hard finality is reached, the
       burned USDC amount is backed by Circle's
       [Fast Transfer Allowance](/cctp/cctp-faq#what-is-the-fast-transfer-allowance-in-cctp-v2).
       The Fast Transfer Allowance is temporarily debited by the burn amount.
       <Info>
         Circle's Fast Transfer Allowance limits how much USDC can be minted through
         Fast Transfer before the related burns on source chains reach hard
         finality. It caps the total value of in-flight transfers to manage risk,
         and is restored once those burns finalize.
       </Info>
    5. **Mint event**. The app explicitly fetches the signed attestation from
       Circle's Attestation Service and uses it to mint USDC on the destination
       chain. A [fee](/cctp/technical-guide#cctp-fees) is collected onchain during
       this process.
    6. **Fast Transfer Allowance Replenishment**. Once the burn reaches finality on
       the source chain, the corresponding amount is credited back to Circle's Fast
       Transfer Allowance.
    7. **Completion**. The recipient wallet address receives the newly minted USDC
       on the destination blockchain, completing the transfer.

    **Fast Transfer** is ideal for low-latency use cases, enabling USDC transfers to
    complete in seconds while maintaining trust and security through Circle's Fast
    Transfer Allowance.

  </Tab>

  <Tab title="Standard Transfer">
    **Standard Transfer** is the default method for transferring USDC across
    blockchains. It relies on transaction finality on the source chain and uses
    Circle's Attestation Service to enable standard-finality (hard finality)
    transfers. The process includes the following steps:

    1. **Initiation**. A user accesses an app powered by CCTP V2 and initiates a
       Standard Transfer of USDC, specifying the recipient's wallet address on the
       destination chain.
    2. **Burn Event**. The app facilitates a burn of the specified USDC amount on
       the source blockchain.
    3. **Attestation**. Circle's Attestation Service observes the burn event and,
       after observing hard finality on the source chain, issues a signed
       attestation. Hard finality ensures the burn is irreversible (about 15 to 19
       minutes for Ethereum and L2 chains.)
    4. **Mint Event**. The app explicitly fetches the signed attestation from
       Circle's Attestation Service and uses it to mint USDC on the destination
       chain. There might be a fee collected onchain during this step. For details,
       see
       [Standard Transfer Fee Switch](/cctp/technical-guide#standard-transfer-fee-switch).
    5. **Completion**. The recipient wallet address receives the newly minted USDC
       on the destination blockchain, completing the transfer.

    **Standard Transfer** is suitable for scenarios where longer finality times are
    acceptable.

  </Tab>
</Tabs>

<Note>
  **CCTP White Paper**

Read the
[CCTP White Paper](https://github.com/circlefin/evm-cctp-contracts/blob/master/whitepaper/CCTPV2_White_Paper.pdf)
to learn about the motivation behind CCTP and how the Fast Transfer Allowance
balances speed, risk, and capital efficiency in crosschain USDC transfers.
</Note>

## Use cases

CCTP enables developers to build novel crosschain apps that integrate
functionalities like trading, lending, payments, NFTs, and gaming, while
simplifying the user experience. Below are some practical examples of how you
can leverage CCTP in your applications—expand any to learn more.

<AccordionGroup>
  <Accordion title="Fast and secure crosschain rebalancing">
    Market makers, fillers/solvers, exchanges, and bridges can use CCTP to manage
    liquidity more efficiently. By securely rebalancing USDC holdings across
    blockchains, you can reduce operational costs, meet demand, and take advantage
    of market opportunities with minimal latency.
  </Accordion>

  <Accordion title="Composable crosschain swaps">
    With CCTP, users can quickly swap between digital assets on different
    blockchains by routing through USDC. Users can also swap for USDC and
    automatically trigger subsequent actions on the destination chain, seamlessly
    enabling complex crosschain actions such as swaps and deposits.
  </Accordion>

  <Accordion title="Programmable crosschain purchases">
    Automate crosschain purchases with CCTP. For example, a user can use USDC on one
    chain to purchase an NFT on a decentralized exchange on another chain and list
    it for sale on an NFT marketplace. When the transaction is initiated, CCTP
    routes USDC across chains to buy the NFT and opens the listing on the
    marketplace—all in one streamlined flow.
  </Accordion>

  <Accordion title="Simplify crosschain complexities">
    Simplify the crosschain experience by using USDC as collateral on one chain to
    open a borrowing position on a lending protocol on another chain. With CCTP,
    USDC can move quickly between blockchains, allowing users to onboard to new
    applications without switching wallets or managing multichain complexities.
  </Accordion>
</AccordionGroup>

---

> To find navigation and other pages in this documentation, fetch the llms.txt file at: https://developers.circle.com/llms.txt
