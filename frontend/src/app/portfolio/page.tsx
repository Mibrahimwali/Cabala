"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

const LOANS = [
  { nft: "Cabal #1204", rarity: "Archon", collateral: "2.00 SOL", borrowed: "1.20 SOL", ltv: 60, health: 85, status: "healthy", due: "12d 4h", repayAmt: "1.2461 SOL", image: "/nft-cabal-1204.png" },
  { nft: "Cabal #0087", rarity: "Warlock", collateral: "2.00 SOL", borrowed: "1.20 SOL", ltv: 60, health: 52, status: "warning", due: "3d 7h", repayAmt: "1.2461 SOL", image: "/nft-cabal-0087.png" },
];

const LP_POSITIONS = [
  { deposited: "15.00 SOL", current: "15.214 SOL", earned: "+0.214 SOL", share: "1.095%", apy: "14.2%", duration: "22 days" },
];

const PORTFOLIO_STATS = [
  { label: "Total Borrowed", value: "2.40 SOL", accent: "#00FF9F" },
  { label: "Total Deposited", value: "15.00 SOL", accent: "#D4AF77" },
  { label: "Total Earned", value: "+0.214 SOL", accent: "#9945FF" },
  { label: "Risk Score", value: "LOW", accent: "#00FF9F" },
];

function HealthChip({ health, status }: { health: number; status: string }) {
  const color = status === "healthy" ? "#00FF9F" : status === "warning" ? "#D4AF77" : "#C8102E";
  return (
    <div className="flex flex-col gap-1.5">
      <div className="health-bar-track w-24">
        <div className={`health-bar-fill ${status}`} style={{ width: `${health}%` }} />
      </div>
      <span className="font-mono text-[10px]" style={{ color }}>{health}% {status === "warning" ? "⚠" : "●"}</span>
    </div>
  );
}

export default function PortfolioPage() {
  const { connected } = useWallet();

  return (
    <div className="min-h-screen pt-24 pb-24 md:pb-8 px-6 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-8">
          <p className="badge badge-purple mb-3 w-fit">My Positions</p>
          <h1 className="display-text text-3xl md:text-4xl text-white mb-2">Portfolio</h1>
          <p className="text-white/40">Track your active loans, liquidity positions, and earned yield.</p>
        </div>

        {!connected ? (
          <div className="glass-card rounded-2xl p-20 flex flex-col items-center gap-6 text-center">
            <p className="text-white text-lg font-bold">Connect wallet to view your portfolio</p>
            <WalletMultiButton />
          </div>
        ) : (
          <>
            {/* Stats pills */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {PORTFOLIO_STATS.map(s => (
                <div key={s.label} className="stat-pill glass-card rounded-xl">
                  <span className="stat-pill-label">{s.label}</span>
                  <span className="stat-pill-value" style={{ color: s.accent }}>{s.value}</span>
                </div>
              ))}
            </div>

            {/* Active Loans */}
            <div className="glass-card rounded-2xl mb-6 overflow-hidden">
              <div className="p-6 pb-0 flex items-center justify-between">
                <h2 className="display-text text-base text-white">Active Loans</h2>
                <span className="badge badge-danger">{LOANS.length} Open</span>
              </div>

              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto p-6 pt-4">
                <table className="data-table">
                  <thead>
                    <tr><th>NFT Collateral</th><th>Collateral Val.</th><th>Borrowed</th><th>LTV</th><th>Health Factor</th><th>Due</th><th>Repay Amount</th><th>Action</th></tr>
                  </thead>
                  <tbody>
                    {LOANS.map(loan => (
                      <tr key={loan.nft}>
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg overflow-hidden relative"
                              style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
                              <Image src={loan.image} alt={loan.nft} fill className="object-cover opacity-80" />
                            </div>
                            <div>
                              <div className="font-semibold text-white text-sm">{loan.nft}</div>
                              <div className="text-[10px] text-white/35">{loan.rarity}</div>
                            </div>
                          </div>
                        </td>
                        <td><span className="font-mono">{loan.collateral}</span></td>
                        <td><span className="font-mono text-neon-lime">{loan.borrowed}</span></td>
                        <td><span className="font-mono text-white/60">{loan.ltv}%</span></td>
                        <td><HealthChip health={loan.health} status={loan.status} /></td>
                        <td>
                          <span className="font-mono text-xs" style={{ color: loan.status === "warning" ? "#D4AF77" : "rgba(255,255,255,0.6)" }}>
                            {loan.due}
                          </span>
                        </td>
                        <td><span className="font-mono text-xs text-white/70">{loan.repayAmt}</span></td>
                        <td>
                          <button className="btn-ghost px-4 py-1.5 text-xs rounded-lg">Repay</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden p-4 flex flex-col gap-3">
                {LOANS.map(loan => (
                  <div key={loan.nft} className="rounded-xl p-4 flex flex-col gap-3"
                    style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg overflow-hidden relative"
                          style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
                          <Image src={loan.image} alt={loan.nft} fill className="object-cover opacity-80" />
                        </div>
                        <div>
                          <div className="font-semibold text-white text-sm">{loan.nft}</div>
                          <div className="text-[10px] text-white/35">{loan.rarity}</div>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-sm" style={{ color: "#00FF9F" }}>{loan.borrowed}</span>
                    </div>
                    <HealthChip health={loan.health} status={loan.status} />
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white/40">Due: {loan.due}</span>
                      <button className="btn-ghost px-4 py-1.5 text-xs rounded-lg">Repay</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Liquidity Positions */}
            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="p-6 pb-4 flex items-center justify-between">
                <h2 className="display-text text-base text-white">Liquidity Positions</h2>
                <span className="badge badge-gold">{LP_POSITIONS.length} Active</span>
              </div>
              <div className="p-6 pt-0 grid grid-cols-1 md:grid-cols-2 gap-4">
                {LP_POSITIONS.map((pos, i) => (
                  <div key={i} className="rounded-xl p-5 flex flex-col gap-4"
                    style={{ background: "rgba(212,175,119,0.04)", border: "1px solid rgba(212,175,119,0.1)" }}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold tracking-widest uppercase text-white/35">SOL Liquidity Position</span>
                      <span className="badge badge-gold">{pos.apy} APY</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: "Deposited", value: pos.deposited },
                        { label: "Current Value", value: pos.current },
                        { label: "Earned", value: pos.earned, accent: "#D4AF77" },
                        { label: "Pool Share", value: pos.share },
                        { label: "Duration", value: pos.duration },
                        { label: "Status", value: "Active", accent: "#00FF9F" },
                      ].map(m => (
                        <div key={m.label} className="flex flex-col gap-0.5">
                          <span className="text-[10px] text-white/30 uppercase tracking-wider">{m.label}</span>
                          <span className="font-mono text-sm font-semibold" style={{ color: m.accent || "#E8E8E8" }}>{m.value}</span>
                        </div>
                      ))}
                    </div>
                    <button className="btn-ghost py-2.5 text-xs w-full">Withdraw Liquidity</button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
