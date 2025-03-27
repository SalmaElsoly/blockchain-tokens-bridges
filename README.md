# Multi-Chain Token Ecosystem

This repository contains implementations of tokens across multiple blockchains (Ethereum, Stellar, Solana, and Bitcoin) along with cross-chain bridges to enable interoperability between these networks.

## Overview

This project aims to create a unified token ecosystem across multiple blockchains, allowing for seamless transfer of value between different networks. Each blockchain implementation includes native tokens with specific features tailored to that blockchain's capabilities.

## Features

- **Multi-Chain Support**: Implementations for Ethereum, Stellar, Solana, and Bitcoin
- **Cross-Chain Bridges**: Facilitates token transfers between different blockchains
- **ERC20 Compliant Tokens**: Ethereum tokens follow the ERC20 standard with additional features
- **Transaction Fees**: Some tokens implement fee mechanisms that send to treasury addresses
- **Locking Mechanisms**: Support for locking tokens during cross-chain transfers

## Token Implementations

### Ethereum Tokens

#### SolyToken (SOLY)

- ERC20-compliant token with ERC20Permit support (EIP-2612)
- Implements transaction fees that are sent to a designated treasury address
- Owner-controlled minting capabilities

#### SolaETH (SOLA)

- ERC20-compliant token with ERC20Permit support
- Implements token locking mechanism for cross-chain transfers
- Authorized address management for unlocking tokens

### Stellar Tokens (Planned)

- Native Stellar asset implementation
- Integration with Stellar's built-in DEX
- Support for multi-signature accounts

### Solana Tokens (Planned)

- SPL Token implementation
- High throughput and low transaction costs
- Program-derived addresses for token management

### Bitcoin Integration (Planned)

- Wrapped BTC implementation
- Bitcoin script-based locking mechanisms
- Lightning Network integration for faster transfers

## Bridge Architecture

The bridges directory contains implementations for cross-chain token transfers between the supported blockchains:

- **Ethereum-Stellar Bridge**: Allows for locking SOLY/SOLA tokens and minting equivalent assets on Stellar
- **Ethereum-Solana Bridge**: Enables transfers between ERC20 tokens and SPL tokens
- **Stellar-Solana Bridge**: Direct bridge between Stellar assets and Solana tokens
- **Bitcoin Bridges**: Specialized bridges for Bitcoin integration with other chains

Each bridge implements a secure locking and minting mechanism to ensure tokens are properly represented across chains without increasing the total supply.

## Smart Contract Details

### SolyToken (Ethereum)

The SolyToken contract inherits from OpenZeppelin's ERC20, ERC20Permit, and Ownable contracts.

#### Key Functions

- **Constructor**: Initializes the token with a name, symbol, initial supply, treasury address, and transaction fee percentage
- **mint**: Allows the owner to create new tokens
- **transfer**: Overrides the standard ERC20 transfer function to implement the fee mechanism

### SolaETH (Ethereum)

The SolaETH contract is designed specifically for cross-chain transfers.

#### Key Functions

- **lockTokens**: Locks tokens for cross-chain transfers
- **unlockTokens**: Releases previously locked tokens (only callable by authorized addresses)
- **addAuthorisedAddress/removeAuthorisedAddress**: Manages addresses that can unlock tokens

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

- Node.js and npm
- Blockchain-specific development environments
  - Ethereum: Hardhat, Truffle, or Remix
  - Stellar: Stellar SDK
  - Solana: Solana CLI tools
  - Bitcoin: Bitcoin Core (for testing)

## Dependencies

- Ethereum: [@openzeppelin/contracts](https://github.com/OpenZeppelin/openzeppelin-contracts) v5.2.0
- Other dependencies will be added as implementations for other blockchains are developed
