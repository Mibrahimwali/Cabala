"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import { ArrowRightLeft, ShieldAlert, Zap, Lock, Search } from "lucide-react";

export default function Dashboard() {
  const { publicKey, connected } = useWallet();
  const [isScanning, setIsScanning] = useState(false);
  const [hasNft, setHasNft] = useState<boolean | null>(null);

  // Mock scan effect when wallet connects
  useEffect(() => {
    if (connected && publicKey) {
      setIsScanning(true);
      // Simulate RPC fetch for Metaplex Collection
      const timer = setTimeout(() => {
        setIsScanning(false);
        // For development UI testing, we assume they have the NFT
        setHasNft(true); 
      }, 1500);
      return () => clearTimeout(timer);
    } else {
      setHasNft(null);
    }
  }, [connected, publicKey]);

  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto flex flex-col gap-12">
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

      {/* Main Content Area */}
      <div className="flex flex-col items-center justify-center mt-12 w-full">
        
        {!connected && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel p-12 rounded-3xl flex flex-col items-center text-center gap-6 max-w-lg w-full"
          >
            <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
              <Lock className="w-8 h-8 text-zinc-500" />
            </div>
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-bold">Exclusive Access</h2>
              <p className="text-zinc-400">Connect your wallet to verify your Cabal membership. Only Jito Cabal NFT holders can access this liquidity.</p>
            </div>
            <WalletMultiButton className="!bg-cyan-500 hover:!bg-cyan-400 !text-zinc-950 !rounded-xl !h-12 !px-8 !font-bold transition-all shadow-[0_0_20px_rgba(0,240,255,0.2)]" />
          </motion.div>
        )}

        {connected && isScanning && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-4 text-zinc-400"
          >
            <Search className="w-8 h-8 animate-pulse text-cyan-500" />
            <p className="animate-pulse">Scanning wallet for Jito Cabal NFT...</p>
          </motion.div>
        )}

        {connected && !isScanning && hasNft === false && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel p-12 rounded-3xl flex flex-col items-center text-center gap-6 max-w-lg w-full border-red-500/20"
          >
            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
              <ShieldAlert className="w-8 h-8 text-red-500" />
            </div>
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-bold">Access Denied</h2>
              <p className="text-zinc-400">No Jito Cabal NFT detected in this wallet. This protocol is strictly exclusive to members.</p>
            </div>
          </motion.div>
        )}

        {connected && !isScanning && hasNft === true && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-lg"
          >
            {/* Borrow Panel (Exclusive) */}
            <div className="glass-panel p-8 rounded-3xl flex flex-col gap-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 transition-transform group-hover:scale-110" />
              
              <div className="flex flex-col gap-2 relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 w-fit mb-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                  <span className="text-xs font-bold text-cyan-400 tracking-wider uppercase">Cabal Member Verified</span>
                </div>
                <h2 className="text-3xl font-bold">Instant Liquidity</h2>
                <p className="text-sm text-zinc-400">Borrow exactly 1.2 SOL instantly against your backed Jito Cabal NFT. Zero price discovery risk.</p>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/50 relative z-10">
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

              <button className="relative z-10 w-full h-14 rounded-xl bg-cyan-500 text-zinc-950 font-bold text-lg hover:bg-cyan-400 transition-all active:scale-[0.98] shadow-[0_0_20px_rgba(0,240,255,0.3)]">
                Borrow 1.2 SOL
              </button>
              
              <div className="flex items-center justify-center gap-2 text-xs text-zinc-500 relative z-10">
                <ShieldAlert className="w-3 h-3" />
                <span>Dynamic True APY • Max 7 Day Duration</span>
              </div>
            </div>
          </motion.div>
        )}

      </div>
    </main>
  );
}
