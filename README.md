# SolyToken - ERC20 Token with Transaction Fees

This repository contains a Solidity implementation of an ERC20 token called SolyToken (SOLY) with built-in transaction fees that are sent to a treasury address.

## Overview

SolyToken is an ERC20-compliant token built on the Ethereum blockchain that implements a fee mechanism on transfers. Each transfer automatically deducts a configurable percentage fee that is sent to a designated treasury address.

## Features

- **ERC20 Compliant**: Implements the standard ERC20 interface for compatibility with wallets and exchanges
- **ERC20Permit Support**: Allows for gasless approvals using signatures (EIP-2612)
- **Transaction Fees**: Automatically deducts a configurable fee on each transfer
- **Treasury Management**: Fees are sent to a designated treasury address
- **Owner Controls**: Only the owner can mint new tokens

## Smart Contract

The main contract is `SolyToken.sol` which inherits from OpenZeppelin's ERC20, ERC20Permit, and Ownable contracts.

### Key Functions

- **Constructor**: Initializes the token with a name, symbol, initial supply, treasury address, and transaction fee percentage
- **mint**: Allows the owner to create new tokens
- **transfer**: Overrides the standard ERC20 transfer function to implement the fee mechanism

### Fee Mechanism

When a user transfers tokens, a percentage (defined at contract deployment) is automatically deducted and sent to the treasury address. The recipient receives the remaining amount after the fee deduction.

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd solidity

# Install dependencies
npm install
```

## Development

This project uses OpenZeppelin contracts version 5.2.0 for secure and standard implementations of ERC20 functionality.

### Prerequisites

- Node.js and npm
- A Solidity development environment (Hardhat, Truffle, or Remix)

### Deployment

To deploy the contract, you'll need to provide:

1. Initial supply (will be multiplied by 10^18 for decimals)
2. Treasury address (cannot be zero address)
3. Transaction fee percentage (0-10%)

## Usage Example

```solidity
// Deploy the token with:
// - 1,000,000 initial supply
// - Treasury at 0x123...abc
// - 2% transaction fee
SolyToken token = new SolyToken(1000000, 0x123...abc, 2);

// Transfer tokens (2% will go to treasury)
token.transfer(recipient, amount);

// Mint new tokens (only owner)
token.mint(recipient, amount);
```

## Dependencies

- [@openzeppelin/contracts](https://github.com/OpenZeppelin/openzeppelin-contracts) v5.2.0
