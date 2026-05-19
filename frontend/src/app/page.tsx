"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import { ArrowRightLeft, ShieldAlert, Zap, Lock, Search } from "lucide-react";

export default function Dashboard() {
  const { publicKey, connected } = useWallet();
  const [isScanning, setIsScanning] = useState(false);
  const [hasNft, setHasNft] = useState<boolean | null>(null);

  useEffect(() => {
    if (connected && publicKey) {
      setIsScanning(true);
      const timer = setTimeout(() => {
        setIsScanning(false);
        setHasNft(true); // Mock verification
      }, 1500);
      return () => clearTimeout(timer);
    } else {
      setHasNft(null);
    }
  }, [connected, publicKey]);

  return (
    <main className="min-h-screen p-8 max-w-6xl mx-auto flex flex-col gap-12">
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center glass-panel p-4 rounded-2xl"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center">
            <Zap className="w-4 h-4 text-cyan-400" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Jito Cabal <span className="text-zinc-500 font-normal">| Sovereign Lending</span></h1>
        </div>
        <WalletMultiButton className="!bg-zinc-800 hover:!bg-zinc-700 !rounded-xl !h-10 !px-4 !font-medium transition-colors border border-zinc-700" />
      </motion.header>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
        
        {/* Borrow Panel (Token Gated) */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-panel p-8 rounded-3xl flex flex-col gap-6 relative overflow-hidden group min-h-[420px]"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 transition-transform group-hover:scale-110" />
          
          <div className="flex flex-col gap-2 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 w-fit mb-2">
              {hasNft ? (
                <>
                  <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                  <span className="text-xs font-bold text-cyan-400 tracking-wider uppercase">Verified Member</span>
                </>
              ) : (
                <>
                  <Lock className="w-3 h-3 text-zinc-500" />
                  <span className="text-xs font-bold text-zinc-400 tracking-wider uppercase">Holders Only</span>
                </>
              )}
            </div>
            <h2 className="text-3xl font-bold">Borrow</h2>
            <p className="text-sm text-zinc-400">Borrow exactly 1.2 SOL instantly against your mathematically-backed Jito Cabal NFT. Zero price discovery risk.</p>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/50 relative z-10 mt-auto">
            <div className="flex flex-col">
              <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Collateral Value</span>
              <span className="text-lg font-mono text-zinc-200">2.00 SOL</span>
            </div>
            <ArrowRightLeft className="text-zinc-600 w-5 h-5" />
            <div className="flex flex-col text-right">
              <span className="text-xs text-cyan-500 font-medium uppercase tracking-wider">Available Loan</span>
              <span className="text-lg font-mono font-bold text-cyan-400">1.20 SOL</span>
            </div>
          </div>

          <button disabled={!hasNft} className="relative z-10 w-full h-14 rounded-xl bg-cyan-500 text-zinc-950 font-bold text-lg hover:bg-cyan-400 transition-all active:scale-[0.98] shadow-[0_0_20px_rgba(0,240,255,0.3)] disabled:opacity-50 disabled:shadow-none disabled:hover:bg-cyan-500 disabled:cursor-not-allowed">
            Borrow 1.2 SOL
          </button>

          {/* Access Overlay */}
          <AnimatePresence>
            {(!connected || isScanning || hasNft === false) && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-20 backdrop-blur-md bg-zinc-950/60 flex flex-col items-center justify-center p-8 text-center"
              >
                {!connected && (
                  <>
                    <Lock className="w-8 h-8 text-zinc-500 mb-4" />
                    <p className="text-lg font-bold text-zinc-200">Connect Wallet</p>
                    <p className="text-sm text-zinc-400 mt-2">Connect to verify your Cabal membership to unlock borrowing.</p>
                  </>
                )}
                {connected && isScanning && (
                  <>
                    <Search className="w-8 h-8 text-cyan-500 animate-pulse mb-4" />
                    <p className="text-lg font-bold text-cyan-400 animate-pulse">Scanning Vault...</p>
                  </>
                )}
                {connected && !isScanning && hasNft === false && (
                  <>
                    <ShieldAlert className="w-8 h-8 text-red-500 mb-4" />
                    <p className="text-lg font-bold text-zinc-200">Access Denied</p>
                    <p className="text-sm text-red-400/80 mt-2">No Jito Cabal NFT detected. This feature is strictly exclusive to members.</p>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Lend Panel (Public) */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-panel p-8 rounded-3xl flex flex-col gap-6 relative overflow-hidden group min-h-[420px]"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 transition-transform group-hover:scale-110" />
          
          <div className="flex flex-col gap-2 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 w-fit mb-2">
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-xs font-bold text-amber-400 tracking-wider uppercase">Public Pool</span>
            </div>
            <h2 className="text-3xl font-bold">Lend</h2>
            <p className="text-sm text-zinc-400">Deposit SOL to earn compounding APY generated from borrower interest and 0.8 SOL repo-default spreads.</p>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/50 relative z-10 mt-auto">
             <div className="flex flex-col">
              <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Total Value Locked</span>
              <span className="text-lg font-mono text-zinc-200">1,368.18 SOL</span>
            </div>
            <div className="flex flex-col text-right">
              <span className="text-xs text-amber-500 font-medium uppercase tracking-wider">Current APY</span>
              <span className="text-lg font-mono font-bold text-amber-400">14.2%</span>
            </div>
          </div>

          <div className="flex gap-3 relative z-10">
            <input 
              type="number" 
              placeholder="Amount in SOL" 
              className="flex-1 bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all"
            />
            <button className="w-32 h-14 rounded-xl bg-amber-500 text-zinc-950 font-bold hover:bg-amber-400 transition-all active:scale-[0.98]">
              Deposit
            </button>
          </div>
          
          {!connected && (
             <div className="absolute inset-0 z-20 backdrop-blur-md bg-zinc-950/60 flex flex-col items-center justify-center p-8 text-center rounded-3xl">
                <Lock className="w-8 h-8 text-zinc-500 mb-4" />
                <p className="text-lg font-bold text-zinc-200">Connect Wallet</p>
                <p className="text-sm text-zinc-400 mt-2">Connect your wallet to deposit SOL and earn APY.</p>
             </div>
          )}
        </motion.div>
      </div>
    </main>
  );
}
