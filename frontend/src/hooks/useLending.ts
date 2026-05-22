"use client";

import { useState, useCallback, useMemo } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Program, AnchorProvider, BN, Idl } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
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
    return new Program(idl as any, provider);
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
        const [lpMint] = PublicKey.findProgramAddressSync(
          [Buffer.from("mint")],
          program.programId
        );
        const TOKEN_PROGRAM_ID = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
        const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL");
        const [lenderLpAta] = PublicKey.findProgramAddressSync(
          [
            wallet.publicKey.toBuffer(),
            TOKEN_PROGRAM_ID.toBuffer(),
            lpMint.toBuffer(),
          ],
          ASSOCIATED_TOKEN_PROGRAM_ID
        );

        const tx = await program.methods
          .depositLiquidity(amountLamports)
          .accountsStrict({
            globalPool,
            lpMint,
            lenderLpAta,
            lender: wallet.publicKey,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
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
    async (nftAssetStr: string, nftCollectionStr: string) => {
      if (!program || !wallet.publicKey) throw new Error("Wallet not connected");
      setLoading(true);
      try {
        const nftAsset = new PublicKey(nftAssetStr);
        const nftCollection = new PublicKey(nftCollectionStr);
        
        const [globalPool] = PublicKey.findProgramAddressSync(
          [Buffer.from("pool")],
          program.programId
        );

        const [loanReceipt] = PublicKey.findProgramAddressSync(
          [
            Buffer.from("receipt"),
            wallet.publicKey.toBuffer(),
            nftAsset.toBuffer(),
          ],
          program.programId
        );

        const tx = await program.methods
          .borrow()
          .accountsStrict({
            globalPool,
            loanReceipt,
            borrower: wallet.publicKey,
            nftAsset,
            nftCollection,
            mplCoreProgram: new PublicKey("Co1e111111111111111111111111111111111111111"),
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

  const repay = useCallback(
    async (nftAssetStr: string, nftCollectionStr: string) => {
      if (!program || !wallet.publicKey) throw new Error("Wallet not connected");
      setLoading(true);
      try {
        const nftAsset = new PublicKey(nftAssetStr);
        const nftCollection = new PublicKey(nftCollectionStr);

        const [globalPool] = PublicKey.findProgramAddressSync(
          [Buffer.from("pool")],
          program.programId
        );

        const [loanReceipt] = PublicKey.findProgramAddressSync(
          [
            Buffer.from("receipt"),
            wallet.publicKey.toBuffer(),
            nftAsset.toBuffer(),
          ],
          program.programId
        );

        const tx = await program.methods
          .repay()
          .accountsStrict({
            globalPool,
            loanReceipt,
            borrower: wallet.publicKey,
            nftAsset,
            nftCollection,
            mplCoreProgram: new PublicKey("Co1e111111111111111111111111111111111111111"),
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
        const [lpMint] = PublicKey.findProgramAddressSync(
          [Buffer.from("mint")],
          program.programId
        );
        const TOKEN_PROGRAM_ID = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
        const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL");
        const [lenderLpAta] = PublicKey.findProgramAddressSync(
          [
            wallet.publicKey.toBuffer(),
            TOKEN_PROGRAM_ID.toBuffer(),
            lpMint.toBuffer(),
          ],
          ASSOCIATED_TOKEN_PROGRAM_ID
        );

        const tx = await program.methods
          .withdrawLiquidity(shares)
          .accountsStrict({
            globalPool,
            lpMint,
            lenderLpAta,
            lender: wallet.publicKey,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
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
