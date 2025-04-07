# Multi-Chain Token Ecosystem

This repository contains implementations of tokens across multiple blockchains (Ethereum, Stellar, Solana, and Bitcoin) along with cross-chain bridges to enable interoperability between these networks.

## Overview

This project aims to create a unified token ecosystem across multiple blockchains, allowing for seamless transfer of value between different networks. Each blockchain implementation includes native tokens with specific features tailored to that blockchain's capabilities.

## Bridge Architecture

The bridges directory contains implementations for cross-chain token transfers between the supported blockchains:

- **Ethereum-Stellar Bridge**: Allows for locking SOLY/SOLA tokens and minting equivalent assets on Stellar
- **Ethereum-Solana Bridge**: Enables transfers between ERC20 tokens and SPL tokens
- **Stellar-Solana Bridge**: Direct bridge between Stellar assets and Solana tokens
- **Bitcoin Bridges**: Specialized bridges for Bitcoin integration with other chains

Each bridge implements a secure locking and minting mechanism to ensure tokens are properly represented across chains without increasing the total supply.

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd solidity

# Install dependencies for Ethereum tokens
cd tokens/ethereum
npm install
```

## Development

This project uses various blockchain-specific libraries:

- Ethereum: OpenZeppelin contracts v5.2.0
- Stellar: (TBD)
- Solana: (TBD)
- Bitcoin: (TBD)

### Prerequisites
