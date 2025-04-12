# Multi-Chain Token Ecosystem

This repository contains implementations of tokens across multiple blockchains (Ethereum, Stellar, Solana, and Bitcoin) along with cross-chain bridges to enable interoperability between these networks.

> **Note**: This repository is created for **learning purposes**.

## Overview

This project aims to create a unified token ecosystem across multiple blockchains, allowing for seamless transfer of value between different networks.

## Bridge Architecture

The bridges directory contains implementations for cross-chain token transfers between the supported blockchains:

- **Ethereum-Stellar Bridge**: Allows for locking SOLA tokens and minting equivalent assets on Stellar
- **Ethereum-Solana Bridge**: Enables transfers between ERC20 tokens and SPL tokens
- **Stellar-Solana Bridge**: Direct bridge between Stellar assets and Solana tokens
- **Bitcoin Bridges**: Specialized bridges for Bitcoin integration with other chains

Each bridge implements a secure locking and minting mechanism to ensure tokens are properly represented across chains without increasing the total supply.
