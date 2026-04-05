# DeFi — Decentralized Finance Complete Guide

**DeFi (Decentralized Finance)** is the ecosystem of financial applications built on public blockchains — primarily Ethereum — that replicate and extend traditional financial services (lending, trading, yield generation) without centralized intermediaries such as banks or brokerages.

## Core Components

| Component | Description | Examples |
|-----------|-------------|---------|
| DEX (Decentralized Exchange) | Peer-to-peer token swaps via AMM | Uniswap, Curve, Balancer |
| Lending Protocol | Algorithmic collateral-backed loans | Aave, Compound, MakerDAO |
| Yield Aggregator | Auto-compounding yield strategies | Yearn Finance, Convex |
| Stablecoin | Price-stable on-chain currency | USDC, DAI, USDT |
| Liquid Staking | Earn staking yield + stay liquid | Lido (stETH), Rocket Pool |
| Perpetual DEX | On-chain leveraged trading | GMX, dYdX, Hyperliquid |

## Key Mechanisms

### Automated Market Maker (AMM)

AMMs replace order books with liquidity pools. Traders swap against pooled reserves; the price is determined by the constant product formula `x * y = k`. Liquidity providers (LPs) deposit token pairs and earn trading fees.

**Uniswap V3 innovation**: Concentrated liquidity allows LPs to specify price ranges, achieving capital efficiency up to 4,000× over V2 while introducing impermanent loss risk in narrow ranges.

### Flash Loans

Flash loans allow borrowing any amount without collateral, provided the loan is repaid within a single transaction block. Used for: arbitrage, liquidations, and collateral swaps. Any failure reverts the entire transaction.

### MEV (Maximal Extractable Value)

MEV refers to value extractable by reordering, inserting, or censoring transactions within a block. Strategies include sandwich attacks (front-run + back-run a trade), arbitrage, and liquidations. Estimated at >$1B extracted annually.

## DeFi Risk Categories

| Risk Type | Description | Mitigation |
|-----------|-------------|-----------|
| Smart contract risk | Bugs, reentrancy, integer overflow | Audit + formal verification |
| Oracle manipulation | Price feed manipulation | Chainlink TWAP, multiple oracles |
| Liquidity risk | Insufficient depth for large trades | Monitor depth before execution |
| Impermanent loss | LP position value vs hold | Choose correlated pairs |
| Governance risk | Malicious DAO proposals | Timelock + multisig |
| Bridge risk | Cross-chain bridge exploits | Prefer battle-tested bridges |

## DeFi x AI Agents

AI agents are increasingly deployed in DeFi for:

- **Yield optimization**: Agents monitor APY across protocols and auto-rebalance positions
- **Liquidation bots**: Agents scan for under-collateralized positions and execute liquidations
- **MEV bots**: Agents scan the mempool and submit strategic transaction bundles
- **Risk monitoring**: Agents alert on abnormal protocol parameter changes or whale movements
- **Smart contract auditing**: Agents analyze Solidity code for common vulnerability patterns

### Agent-to-Agent DeFi Payments

A2A (Agent-to-Agent) payment protocols enable AI agents to pay each other for services using on-chain tokens — without human authorization for each transaction. This forms the foundation of autonomous AI economies running on public blockchains.

## Frequently Asked Questions

**Q: What is DeFi?**
A: DeFi (Decentralized Finance) is financial services — trading, lending, yield generation — implemented as smart contracts on public blockchains, operating without centralized intermediaries.

**Q: What is TVL in DeFi?**
A: TVL (Total Value Locked) measures the total value of assets deposited in DeFi protocols. As of 2026, total DeFi TVL exceeds $100B across all chains.

**Q: What is the difference between DeFi and CeFi?**
A: CeFi (Centralized Finance) platforms like Binance or Coinbase are custodial — they hold user funds and can be shut down or hacked. DeFi protocols are non-custodial; users retain control of their private keys.

**Q: Which blockchains support DeFi?**
A: Ethereum has the largest DeFi ecosystem. Other active chains include Base, Arbitrum, Solana, Polygon, and Optimism. Multi-chain bridges allow asset movement between networks.

**Q: What is impermanent loss?**
A: Impermanent loss occurs when the price ratio of tokens in an LP position changes from the deposit ratio. The LP ends up with fewer of the outperforming token compared to simply holding both.

**Q: What is a smart contract audit?**
A: A smart contract audit is a security review of Solidity/Vyper code to identify vulnerabilities — reentrancy, access control flaws, arithmetic errors — before deployment. Conducted by specialized firms (Trail of Bits, Certik, OpenZeppelin) or AI audit agents.

## Related

- [AI Agent](ai-agent.md)
- [RAG](rag.md)
- [Agent Economy](agent-economy.md)
