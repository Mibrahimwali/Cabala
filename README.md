# Jito Cabal Lending Protocol

A Solana-based lending protocol designed exclusively for Jito Cabal NFTs. 

## Overview
Jito Cabal NFTs are backed by vaulted JitoSOL with a guaranteed redemption value of 2 SOL. This protocol enables peer-to-pool lending against these assets.

*   **Loan-to-Value (LTV)**: Fixed at 1.2 SOL (60%).
*   **Interest Rate**: Dynamic APY up to 10% maximum over a 7-day period.
*   **Liquidation Mechanism**: Repossession model. Defaulted assets are moved to an admin vault for manual 2 SOL redemption with the Jito Cabal treasury. The 2 SOL is then deposited back into the liquidity pool.

## Architecture

This repository is structured as an Anchor workspace containing both the smart contract and the Next.js frontend.

### 1. Smart Contract (Anchor)
Written in Rust (`programs/jito_cabal_lending/src/lib.rs`).

**Core Instructions:**
*   `initialize_pool`: Creates the central liquidity PDA.
*   `deposit_liquidity`: Allows users to supply SOL to the pool in exchange for internal shares.
*   `withdraw_liquidity`: Allows LPs to burn their jPoolShares to instantly reclaim their deposited SOL plus accrued protocol interest and repo gains.
*   `borrow`: Escrows the Jito Cabal NFT and transfers 1.2 SOL to the borrower. Enforces strict Metaplex Certified Collection (MCC) verification to prevent counterfeit NFT exploits.
*   `repay`: Calculates time-based interest, processes the total repayment, and returns the NFT.
*   `seize_collateral`: Permissionless instruction that transfers a defaulted NFT to the admin vault.
*   `admin_withdraw_vault`: Allows the protocol admin to extract seized NFTs for manual 2 SOL redemption.
*   `resolve_default`: Allows the admin to deposit the redeemed 2 SOL back into the pool, finalizing the repossession.

### 2. Frontend (Next.js)
A React-based web interface (`frontend/`).
*   **Framework**: Next.js 15 (App Router).
*   **Styling**: Tailwind CSS v4.
*   **Blockchain Integration**: `@solana/wallet-adapter-react` and `@solana/web3.js`.

## Setup Instructions

### Prerequisites
*   Node.js (v18+)
*   Rust and Cargo
*   Solana CLI
*   Anchor CLI (v0.30.1)

### Building the Smart Contract
1. Navigate to the project root.
2. Build the Anchor program:
   ```bash
   anchor build
   ```
3. Run tests (requires a local validator):
   ```bash
   anchor test
   ```

### Running the Frontend
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open `http://localhost:3000` in your browser.

## Security
*   **Metaplex Verification**: The protocol explicitly checks that the provided NFT mint belongs to the verified Jito Cabal collection metadata.
*   **Rent Exemption**: State transitions actively monitor lamport balances to prevent the pool PDA from dropping below the Solana network rent exemption minimum.
*   **State Management**: Escrow token accounts are explicitly closed via CPI during `repay` and `seize_collateral` to refund rent and prevent state bloat.
