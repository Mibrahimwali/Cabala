import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { JitoCabalLending } from "../target/types/jito_cabal_lending";
import { expect } from "chai";

describe("jito_cabal_lending", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.JitoCabalLending as Program<JitoCabalLending>;
  const admin = provider.wallet;

  // Derive PDAs
  const [globalPoolPDA, poolBump] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("pool")],
    program.programId
  );

  it("Initializes the lending pool successfully", async () => {
    try {
      const tx = await program.methods
        .initializePool()
        .accountsStrict({
          globalPool: globalPoolPDA,
          admin: admin.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      console.log("Pool Initialization TX:", tx);

      // Fetch the created pool state
      const poolState = await program.account.globalPool.fetch(globalPoolPDA);
      expect(poolState.admin.toBase58()).to.equal(admin.publicKey.toBase58());
      expect(poolState.totalSol.toString()).to.equal("0");
      expect(poolState.totalShares.toString()).to.equal("0");
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
          lender: admin.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      console.log("Liquidity Deposit TX:", tx);

      // Verify the updated pool balance and state
      const poolState = await program.account.globalPool.fetch(globalPoolPDA);
      expect(poolState.totalSol.toString()).to.equal(depositAmount.toString());
      expect(poolState.totalShares.toString()).to.equal(depositAmount.toString());
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
          lender: admin.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      console.log("Liquidity Withdrawal TX:", tx);

      // Verify the updated pool balance and state
      const poolState = await program.account.globalPool.fetch(globalPoolPDA);
      expect(poolState.totalSol.toString()).to.equal("1000000000"); // 1 SOL left
      expect(poolState.totalShares.toString()).to.equal("1000000000"); // 1 share left
    } catch (err) {
      console.error("Withdrawal failed:", err);
      throw err;
    }
  });
});
