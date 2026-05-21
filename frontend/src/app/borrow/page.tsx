"use client";
import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useLending } from "@/hooks/useLending";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

const CABAL_COLLECTION = "F7YJeY3wPhgUCvV4EKEKWx7YgNENG21178BHMujz6BzU";
const DEMO_NFT = "7nE654bK8i4N8LzQfE4vFv4jNz51x9E8Tba3Ejg39";

const MOCK_NFTS = [
  { id: "1204", name: "Cabal #1204", floorSOL: "2.00", loanSOL: "1.20", rarity: "Archon", rank: 42, verified: true, image: "/nft-cabal-1204.png" },
  { id: "0087", name: "Cabal #0087", floorSOL: "2.00", loanSOL: "1.20", rarity: "Warlock", rank: 88, verified: true, image: "/nft-cabal-0087.png" },
  { id: "3310", name: "Cabal #3310", floorSOL: "2.00", loanSOL: "1.20", rarity: "Adept", rank: 312, verified: true, image: "/nft-cabal-3310.png" },
  { id: "0512", name: "Cabal #0512", floorSOL: "2.00", loanSOL: "1.20", rarity: "Elder", rank: 7, verified: true, image: "/nft-cabal-0512.png" },
];

const RARITY_COLORS: Record<string, string> = {
  Elder: "#D4AF77", Archon: "#9945FF", Warlock: "#00FF9F", Adept: "rgba(255,255,255,0.6)",
};

function NFTCard({ nft, selected, onSelect }: { nft: typeof MOCK_NFTS[0]; selected: boolean; onSelect: () => void }) {
  return (
    <motion.div whileHover={{ y: -4, scale: 1.01 }} transition={{ duration: 0.2 }}
      onClick={onSelect}
      className={`nft-card ${selected ? "selected" : ""}`}>
      {/* Image area */}
      <div className="relative aspect-square bg-gradient-to-br from-white/[0.03] to-black">
        <div className="absolute inset-0">
          <Image src={nft.image} alt={nft.name} fill className="object-cover opacity-80" />
        </div>
        {/* Verified MCC badge */}
        {nft.verified && (
          <div className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center"
            style={{ background: "#00FF9F", boxShadow: "0 0 10px rgba(0,255,159,0.6)" }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 6L5 9L10 3" stroke="#0A0A0A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        )}
        {/* Rarity badge */}
        <div className="absolute top-2 left-2">
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
            style={{ background: "rgba(10,10,10,0.8)", color: RARITY_COLORS[nft.rarity] || "#fff", border: `1px solid ${RARITY_COLORS[nft.rarity]}33` }}>
            {nft.rarity}
          </span>
        </div>
        {/* Hover select overlay */}
        <div className="absolute inset-0 flex items-end justify-center p-3 opacity-0 hover:opacity-100 transition-opacity"
          style={{ background: "linear-gradient(to top, rgba(0,255,159,0.15), transparent)" }}>
          <span className="text-xs font-bold text-neon-lime tracking-wider uppercase">Select</span>
        </div>
        {selected && (
          <div className="absolute inset-0 flex items-end justify-center p-3"
            style={{ background: "linear-gradient(to top, rgba(0,255,159,0.2), transparent)" }}>
            <span className="text-xs font-bold tracking-wider uppercase" style={{ color: "#00FF9F" }}>✓ Selected</span>
          </div>
        )}
      </div>
      {/* Card info */}
      <div className="p-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-bold text-white">{nft.name}</span>
          <span className="text-[10px] text-white/30 font-mono">Rank #{nft.rank}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-white/40 uppercase tracking-wider">Floor</span>
          <span className="font-mono text-xs text-white/70">{nft.floorSOL} SOL</span>
        </div>
        <div className="flex items-center justify-between mt-0.5">
          <span className="text-[10px] text-white/40 uppercase tracking-wider">Loan</span>
          <span className="font-mono text-xs font-bold" style={{ color: "#00FF9F" }}>{nft.loanSOL} SOL</span>
        </div>
      </div>
    </motion.div>
  );
}

export default function BorrowPage() {
  const { connected } = useWallet();
  const { borrow, loading } = useLending();
  const [selected, setSelected] = useState<string | null>(null);
  const [txSig, setTxSig] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedNft = MOCK_NFTS.find(n => n.id === selected);

  const handleBorrow = async () => {
    setError(null); setTxSig(null);
    try {
      const tx = await borrow(DEMO_NFT, CABAL_COLLECTION);
      if (tx) setTxSig(tx);
    } catch (e: any) { setError(e.message || "Transaction failed."); }
  };

  return (
    <div className="min-h-screen pt-24 pb-24 md:pb-8 px-6 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-8">
          <p className="badge badge-neon mb-3 w-fit">Holders Only · MCC Verified</p>
          <h1 className="display-text text-3xl md:text-4xl text-white mb-2">Borrow Against NFT</h1>
          <p className="text-white/40">Select your Jito Cabal NFT. Borrow 1.2 SOL instantly against verified collateral.</p>
        </div>

        <AnimatePresence>
          {txSig && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="mb-6 p-4 rounded-xl text-sm" style={{ background: "rgba(0,255,159,0.06)", border: "1px solid rgba(0,255,159,0.2)", color: "#00FF9F" }}>
              ✓ 1.2 SOL borrowed!{" "}
              <a href={`https://explorer.solana.com/tx/${txSig}?cluster=mainnet-beta`} target="_blank" rel="noreferrer"
                className="underline font-mono text-xs break-all">{txSig}</a>
            </motion.div>
          )}
          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="mb-6 p-4 rounded-xl text-sm" style={{ background: "rgba(200,16,46,0.06)", border: "1px solid rgba(200,16,46,0.2)", color: "#C8102E" }}>
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {!connected ? (
          <div className="glass-card rounded-2xl p-16 flex flex-col items-center justify-center gap-6 text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: "rgba(0,255,159,0.05)", border: "1px solid rgba(0,255,159,0.15)" }}>
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <rect x="4" y="11" width="20" height="14" rx="3" stroke="rgba(0,255,159,0.5)" strokeWidth="1.5"/>
                <path d="M9 11V8a5 5 0 0110 0v3" stroke="rgba(0,255,159,0.5)" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="14" cy="18" r="2" fill="rgba(0,255,159,0.5)"/>
              </svg>
            </div>
            <div>
              <p className="text-white text-lg font-bold mb-2">Connect to Enter the Vault</p>
              <p className="text-white/40 text-sm">Connect your wallet holding a verified Jito Cabal NFT to unlock borrowing.</p>
            </div>
            <WalletMultiButton />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* ── NFT Grid (left 2/3) ── */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <p className="text-white/40 text-xs font-semibold tracking-widest uppercase">
                  Your Jito Cabal NFTs · {MOCK_NFTS.length} detected
                </p>
                <div className="verified-badge text-xs">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M1.5 5L4 7.5L8.5 2.5" stroke="#00FF9F" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  MCC Verified Collection
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {MOCK_NFTS.map(nft => (
                  <NFTCard key={nft.id} nft={nft} selected={selected === nft.id} onSelect={() => setSelected(nft.id === selected ? null : nft.id)} />
                ))}
              </div>
            </div>

            {/* ── Preview + Loan Terms (right 1/3) ── */}
            <div className="flex flex-col gap-5">
              {/* Large NFT preview */}
              <div className="glass-card rounded-2xl overflow-hidden">
                <div className="aspect-square bg-gradient-to-br from-white/[0.02] to-black relative flex items-center justify-center"
                  style={{ minHeight: "200px" }}>
                  {selectedNft ? (
                    <>
                      <div className="absolute inset-0">
                        <Image src={selectedNft.image} alt={selectedNft.name} fill className="object-cover opacity-80" />
                      </div>
                      <div className="absolute top-3 right-3 verified-badge text-[9px]">
                        ✓ MCC Verified
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-4"
                        style={{ background: "linear-gradient(to top, rgba(10,10,10,0.95), transparent)" }}>
                        <p className="font-bold text-white text-sm">{selectedNft.name}</p>
                        <p className="text-[10px]" style={{ color: RARITY_COLORS[selectedNft.rarity] }}>{selectedNft.rarity} · Rank #{selectedNft.rank}</p>
                      </div>
                    </>
                  ) : (
                    <div className="text-center text-white/20">
                      <div className="text-4xl mb-2">○</div>
                      <p className="text-xs">Select an NFT</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Loan terms */}
              <div className="glass-card rounded-2xl p-6 flex flex-col gap-4">
                <p className="text-xs font-semibold tracking-widest uppercase text-white/35">Loan Terms</p>
                {[
                  { label: "Collateral Value", value: selectedNft ? "2.00 SOL" : "—" },
                  { label: "Loan Amount", value: selectedNft ? "1.20 SOL" : "—", accent: "#00FF9F" },
                  { label: "LTV Ratio", value: "60%", accent: "#D4AF77" },
                  { label: "Interest Rate", value: "10% max (7-day term)" },
                  { label: "Loan Duration", value: "7 days" },
                  { label: "Max Repay Amount", value: selectedNft ? "1.32 SOL" : "—" },
                ].map(item => (
                  <div key={item.label} className="flex justify-between text-sm">
                    <span className="text-white/40">{item.label}</span>
                    <span className="font-mono font-semibold" style={{ color: item.accent || "#E8E8E8" }}>{item.value}</span>
                  </div>
                ))}
                <hr className="neon-divider" />
                {/* Health factor preview */}
                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-white/40">Initial Health Factor</span>
                    <span className="font-mono font-bold" style={{ color: "#00FF9F" }}>166%</span>
                  </div>
                  <div className="health-bar-track">
                    <div className="health-bar-fill healthy" style={{ width: "80%" }} />
                  </div>
                </div>
                <button onClick={handleBorrow} disabled={!selectedNft || loading}
                  className="btn-neon w-full py-4 text-sm mt-2">
                  {loading ? "Approving..." : selectedNft ? `Borrow 1.2 SOL` : "Select an NFT"}
                </button>
              </div>

              {/* Warning */}
              <div className="rounded-xl p-4 text-xs text-white/40 leading-relaxed"
                style={{ background: "rgba(200,16,46,0.04)", border: "1px solid rgba(200,16,46,0.1)" }}>
                ⚠ If you do not repay within 7 days, your NFT will be seized and transferred to the protocol admin for liquidation. Interest accrues linearly up to 10% max.
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
