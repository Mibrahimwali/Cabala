import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { expect } from "chai";

describe("jito_cabal_lending", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.JitoCabalLending as Program<any>;
  const admin = provider.wallet;

  const TOKEN_PROGRAM_ID = new anchor.web3.PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
  const ASSOCIATED_TOKEN_PROGRAM_ID = new anchor.web3.PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL");

  // Derive PDAs
  const [globalPoolPDA, poolBump] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("pool")],
    program.programId
  );

  const [lpMintPDA] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("mint")],
    program.programId
  );

  const [lenderLpATA] = anchor.web3.PublicKey.findProgramAddressSync(
    [
      admin.publicKey.toBuffer(),
      TOKEN_PROGRAM_ID.toBuffer(),
      lpMintPDA.toBuffer(),
    ],
    ASSOCIATED_TOKEN_PROGRAM_ID
  );

  it("Initializes the lending pool successfully", async () => {
    try {
      const tx = await program.methods
        .initializePool()
        .accountsStrict({
          globalPool: globalPoolPDA,
          lpMint: lpMintPDA,
          admin: admin.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: anchor.web3.SystemProgram.programId,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        })
        .rpc();

      console.log("Pool Initialization TX:", tx);

      // Fetch the created pool state
      const poolState = await program.account.globalPool.fetch(globalPoolPDA);
      expect(poolState.admin.toBase58()).to.equal(admin.publicKey.toBase58());
      expect(poolState.totalSol.toString()).to.equal("0");
      expect(poolState.lpMint.toBase58()).to.equal(lpMintPDA.toBase58());
      expect(poolState.bump).to.equal(poolBump);
    } catch (err) {
      console.error("Initialization failed:", err);
      throw err;
    }
  });

  it("Allows a lender to deposit liquidity", async () => {
    const depositAmount = new anchor.BN(2_000_000_000); // 2 SOL

    try {
      const tx = await program.methods
        .depositLiquidity(depositAmount)
        .accountsStrict({
          globalPool: globalPoolPDA,
          lpMint: lpMintPDA,
          lenderLpAta: lenderLpATA,
          lender: admin.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      console.log("Liquidity Deposit TX:", tx);

      // Verify the updated pool balance and state
      const poolState = await program.account.globalPool.fetch(globalPoolPDA);
      expect(poolState.totalSol.toString()).to.equal(depositAmount.toString());

      // Fetch LP mint supply (it should equal depositAmount since it's the first deposit)
      const mintInfo = await provider.connection.getParsedAccountInfo(lpMintPDA);
      const supply = (mintInfo.value?.data as any).parsed.info.supply;
      expect(supply.toString()).to.equal(depositAmount.toString());

      // Fetch lender's ATA balance
      const ataInfo = await provider.connection.getParsedAccountInfo(lenderLpATA);
      const ataBalance = (ataInfo.value?.data as any).parsed.info.tokenAmount.amount;
      expect(ataBalance.toString()).to.equal(depositAmount.toString());
    } catch (err) {
      console.error("Deposit failed:", err);
      throw err;
    }
  });

  it("Allows a lender to withdraw liquidity", async () => {
    const withdrawShares = new anchor.BN(1_000_000_000); // 1 SOL worth of shares

    try {
      const tx = await program.methods
        .withdrawLiquidity(withdrawShares)
        .accountsStrict({
          globalPool: globalPoolPDA,
          lpMint: lpMintPDA,
          lenderLpAta: lenderLpATA,
          lender: admin.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      console.log("Liquidity Withdrawal TX:", tx);

      // Verify the updated pool balance and state
      const poolState = await program.account.globalPool.fetch(globalPoolPDA);
      expect(poolState.totalSol.toString()).to.equal("1000000000"); // 1 SOL left

      // Fetch LP mint supply (it should be 1 SOL now)
      const mintInfo = await provider.connection.getParsedAccountInfo(lpMintPDA);
      const supply = (mintInfo.value?.data as any).parsed.info.supply;
      expect(supply.toString()).to.equal("1000000000");

      // Fetch lender's ATA balance
      const ataInfo = await provider.connection.getParsedAccountInfo(lenderLpATA);
      const ataBalance = (ataInfo.value?.data as any).parsed.info.tokenAmount.amount;
      expect(ataBalance.toString()).to.equal("1000000000");
    } catch (err) {
      console.error("Withdrawal failed:", err);
      throw err;
    }
  });

  it("Rejects a zero-value deposit", async () => {
    const zeroAmount = new anchor.BN(0);
    try {
      await program.methods
        .depositLiquidity(zeroAmount)
        .accountsStrict({
          globalPool: globalPoolPDA,
          lpMint: lpMintPDA,
          lenderLpAta: lenderLpATA,
          lender: admin.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();
      throw new Error("Should have failed");
    } catch (err: any) {
      expect(err.toString()).to.include("ZeroAmount");
      console.log("✓ Zero-value deposit correctly rejected.");
    }
  });

  it("Rejects a zero-value withdrawal", async () => {
    const zeroShares = new anchor.BN(0);
    try {
      await program.methods
        .withdrawLiquidity(zeroShares)
        .accountsStrict({
          globalPool: globalPoolPDA,
          lpMint: lpMintPDA,
          lenderLpAta: lenderLpATA,
          lender: admin.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();
      throw new Error("Should have failed");
    } catch (err: any) {
      expect(err.toString()).to.include("ZeroShares");
      console.log("✓ Zero-value withdrawal correctly rejected.");
    }
  });

  it("Rejects withdrawing more shares than owned", async () => {
    const excessiveShares = new anchor.BN(999_000_000_000); // 999 SOL worth
    try {
      await program.methods
        .withdrawLiquidity(excessiveShares)
        .accountsStrict({
          globalPool: globalPoolPDA,
          lpMint: lpMintPDA,
          lenderLpAta: lenderLpATA,
          lender: admin.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();
      throw new Error("Should have failed");
    } catch (err: any) {
      expect(err.toString()).to.include("InsufficientShares");
      console.log("✓ Over-withdrawal correctly rejected.");
    }
  });
});
