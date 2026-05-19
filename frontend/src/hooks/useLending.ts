"use client";

import { useState, useCallback, useMemo } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Program, AnchorProvider, BN, Idl } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync } from "@solana/spl-token";
import idl from "../idl.json";

export function useLending() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [loading, setLoading] = useState(false);

  const provider = useMemo(() => {
    if (!wallet.publicKey) return null;
    return new AnchorProvider(
      connection,
      wallet as any,
      AnchorProvider.defaultOptions()
    );
  }, [connection, wallet]);

  const program = useMemo(() => {
    if (!provider) return null;
    return new Program(idl as Idl, provider);
  }, [provider]);

  const depositLiquidity = useCallback(
    async (amountSol: number) => {
      if (!program || !wallet.publicKey) throw new Error("Wallet not connected");
      setLoading(true);
      try {
        const amountLamports = new BN(amountSol * 1_000_000_000);
        const [globalPool] = PublicKey.findProgramAddressSync(
          [Buffer.from("pool")],
          program.programId
        );

        const tx = await program.methods
          .depositLiquidity(amountLamports)
          .accountsStrict({
            globalPool,
            lender: wallet.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .rpc();

        return tx;
      } finally {
        setLoading(false);
      }
    },
    [program, wallet.publicKey]
  );

  const borrow = useCallback(
    async (nftMintStr: string) => {
      if (!program || !wallet.publicKey) throw new Error("Wallet not connected");
      setLoading(true);
      try {
        const nftMint = new PublicKey(nftMintStr);
        const [globalPool] = PublicKey.findProgramAddressSync(
          [Buffer.from("pool")],
          program.programId
        );

        const [loanReceipt] = PublicKey.findProgramAddressSync(
          [
            Buffer.from("receipt"),
            wallet.publicKey.toBuffer(),
            nftMint.toBuffer(),
          ],
          program.programId
        );

        const [escrowNftAccount] = PublicKey.findProgramAddressSync(
          [Buffer.from("escrow"), nftMint.toBuffer()],
          program.programId
        );

        const borrowerNftAccount = getAssociatedTokenAddressSync(
          nftMint,
          wallet.publicKey
        );

        // Derive Metaplex Metadata Account PDA
        const [nftMetadata] = PublicKey.findProgramAddressSync(
          [
            Buffer.from("metadata"),
            new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s").toBuffer(),
            nftMint.toBuffer(),
          ],
          new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s")
        );

        const tx = await program.methods
          .borrow()
          .accountsStrict({
            globalPool,
            loanReceipt,
            borrower: wallet.publicKey,
            nftMint,
            borrowerNftAccount,
            nftMetadata,
            escrowNftAccount,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
            rent: SYSVAR_RENT_PUBKEY,
          })
          .rpc();

        return tx;
      } finally {
        setLoading(false);
      }
    },
    [program, wallet.publicKey]
  );

  const repay = useCallback(
    async (nftMintStr: string) => {
      if (!program || !wallet.publicKey) throw new Error("Wallet not connected");
      setLoading(true);
      try {
        const nftMint = new PublicKey(nftMintStr);
        const [globalPool] = PublicKey.findProgramAddressSync(
          [Buffer.from("pool")],
          program.programId
        );

        const [loanReceipt] = PublicKey.findProgramAddressSync(
          [
            Buffer.from("receipt"),
            wallet.publicKey.toBuffer(),
            nftMint.toBuffer(),
          ],
          program.programId
        );

        const [escrowNftAccount] = PublicKey.findProgramAddressSync(
          [Buffer.from("escrow"), nftMint.toBuffer()],
          program.programId
        );

        const borrowerNftAccount = getAssociatedTokenAddressSync(
          nftMint,
          wallet.publicKey
        );

        const tx = await program.methods
          .repay()
          .accountsStrict({
            globalPool,
            loanReceipt,
            borrower: wallet.publicKey,
            escrowNftAccount,
            borrowerNftAccount,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
          })
          .rpc();

        return tx;
      } finally {
        setLoading(false);
      }
    },
    [program, wallet.publicKey]
  );

  const withdrawLiquidity = useCallback(
    async (amountShares: number) => {
      if (!program || !wallet.publicKey) throw new Error("Wallet not connected");
      setLoading(true);
      try {
        const shares = new BN(amountShares * 1_000_000_000);
        const [globalPool] = PublicKey.findProgramAddressSync(
          [Buffer.from("pool")],
          program.programId
        );

        const tx = await program.methods
          .withdrawLiquidity(shares)
          .accountsStrict({
            globalPool,
            lender: wallet.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .rpc();

        return tx;
      } finally {
        setLoading(false);
      }
    },
    [program, wallet.publicKey]
  );

  return {
    depositLiquidity,
    withdrawLiquidity,
    borrow,
    repay,
    loading,
  };
}
