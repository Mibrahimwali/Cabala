"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLending } from "@/hooks/useLending";

const BASE_APY_LABEL = "Variable";

function calcEarnings(sol: number, days: number) {
  // Approximation based on 10% max interest per 7-day loan at full utilization
  const annualizedRate = 0.10 * (365 / 7); // ~521% theoretical max, but utilization-adjusted
  const effectiveRate = annualizedRate * 0.15; // ~78% at estimated 15% avg utilization
  return ((sol * effectiveRate * days) / 365).toFixed(4);
}

export default function LendPage() {
  const { depositLiquidity, withdrawLiquidity, loading } = useLending();
  const [tab, setTab] = useState<"deposit" | "withdraw">("deposit");
  const [amount, setAmount] = useState("");
  const [txSig, setTxSig] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const sol = parseFloat(amount) || 0;

  const handle = async () => {
    if (!sol) return;
    setError(null); setTxSig(null);
    try {
      const tx = tab === "deposit" ? await depositLiquidity(sol) : await withdrawLiquidity(sol);
      if (tx) { setTxSig(tx); setAmount(""); setShowConfirm(false); }
    } catch (e: any) { setError(e.message || "Transaction failed."); setShowConfirm(false); }
  };

  return (
    <div className="min-h-screen pt-24 pb-24 md:pb-8 px-6 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-8">
          <p className="badge badge-gold mb-3 w-fit">Public Pool · Open to All</p>
          <h1 className="display-text text-3xl md:text-4xl text-white mb-2">Lend Liquidity</h1>
          <p className="text-white/40">Deposit SOL. Earn yield from NFT-collateralized loan interest. Rate depends on pool utilization.</p>
        </div>

        {/* Notifications */}
        <AnimatePresence>
          {txSig && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mb-6 p-4 rounded-xl text-sm" style={{ background: "rgba(0,255,159,0.06)", border: "1px solid rgba(0,255,159,0.2)", color: "#00FF9F" }}>
              ✓ Transaction confirmed!{" "}
              <a href={`https://explorer.solana.com/tx/${txSig}?cluster=mainnet-beta`} target="_blank" rel="noreferrer"
                className="underline font-mono text-xs break-all">{txSig}</a>
            </motion.div>
          )}
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mb-6 p-4 rounded-xl text-sm" style={{ background: "rgba(200,16,46,0.06)", border: "1px solid rgba(200,16,46,0.2)", color: "#C8102E" }}>
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* ── Form Panel ── */}
          <div className="lg:col-span-3 glass-card rounded-2xl p-6 md:p-8 flex flex-col gap-6">
            {/* Tab switcher */}
            <div className="flex rounded-xl overflow-hidden border border-white/[0.06] bg-black/40 p-1 gap-1">
              {(["deposit", "withdraw"] as const).map(t => (
                <button key={t} onClick={() => { setTab(t); setAmount(""); setError(null); setTxSig(null); }}
                  className="flex-1 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wider transition-all"
                  style={tab === t
                    ? { background: "#00FF9F", color: "#0A0A0A", boxShadow: "0 0 20px rgba(0,255,159,0.3)" }
                    : { color: "rgba(255,255,255,0.35)" }}>
                  {t}
                </button>
              ))}
            </div>

            {/* Amount input */}
            <div>
              <label className="text-xs font-semibold tracking-widest uppercase text-white/35 mb-2 block">
                {tab === "deposit" ? "SOL Amount to Deposit" : "jPoolShares to Burn"}
              </label>
              <div className="relative">
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
                  placeholder="0.00" min="0" className="input-dark pr-20 font-mono text-lg" />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <button onClick={() => setAmount("1368.18")} className="text-[10px] font-bold tracking-wider uppercase px-2 py-1 rounded"
                    style={{ background: "rgba(0,255,159,0.08)", color: "#00FF9F", border: "1px solid rgba(0,255,159,0.2)" }}>MAX</button>
                </div>
              </div>
            </div>

            {/* Divider */}
            <hr className="neon-divider" />

            {/* Summary */}
            <div className="flex flex-col gap-3">
              {[
                { label: tab === "deposit" ? "You Deposit" : "You Burn", value: sol > 0 ? `${sol} SOL` : "—" },
                { label: tab === "deposit" ? "jPoolShares Received" : "SOL Received", value: sol > 0 ? `${(sol * 0.9992).toFixed(4)}` : "—" },
                { label: "Current APY", value: "Variable", accent: "#00FF9F" },
                { label: "Pool Share", value: sol > 0 ? `${((sol / 1368.18) * 100).toFixed(3)}%` : "—" },
              ].map(item => (
                <div key={item.label} className="flex justify-between items-center text-sm">
                  <span className="text-white/40">{item.label}</span>
                  <span className="font-mono font-semibold" style={{ color: item.accent || "#E8E8E8" }}>{item.value}</span>
                </div>
              ))}
            </div>

            <button onClick={() => sol > 0 && setShowConfirm(true)} disabled={!sol || loading}
              className="btn-neon w-full py-4 text-sm mt-auto">
              {loading ? "Processing..." : tab === "deposit" ? `Deposit ${sol || "0"} SOL` : `Withdraw ${sol || "0"} Shares`}
            </button>
          </div>

          {/* ── Stats + Calculator ── */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            {/* Pool stats */}
            <div className="glass-card rounded-2xl p-6 flex flex-col gap-4">
              <p className="text-xs font-semibold tracking-widest uppercase text-white/35">Pool Statistics</p>
              {[
                { label: "Total Value Locked", value: "1,368.18 SOL", accent: "#00FF9F" },
                { label: "Utilization Rate", value: "67%", bar: true, pct: 67 },
                { label: "Your Deposited", value: "0.00 SOL" },
                { label: "Earned So Far", value: "0.0000 SOL" },
                { label: "Your Pool Share", value: "0.000%" },
              ].map(item => (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-white/40">{item.label}</span>
                    <span className="font-mono font-semibold" style={{ color: item.accent || "#E8E8E8" }}>{item.value}</span>
                  </div>
                  {item.bar && (
                    <div className="health-bar-track">
                      <div className="health-bar-fill healthy" style={{ width: `${item.pct}%` }} />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* APY Calculator */}
            <div className="glass-card glass-card-gold rounded-2xl p-6 flex flex-col gap-4">
              <p className="text-xs font-semibold tracking-widest uppercase text-white/35">Projected Earnings</p>
              <p className="text-2xl font-mono font-bold" style={{ color: "#D4AF77" }}>
                {sol > 0 ? `${calcEarnings(sol, 30)} SOL` : "—"}
              </p>
              <p className="text-xs text-white/30">on {sol || "0"} SOL for 30 days (estimated)</p>
              <hr className="neon-divider" />
              <div className="flex flex-col gap-3">
                {[
                  { label: "7-day yield", days: 7 },
                  { label: "30-day yield", days: 30 },
                  { label: "90-day yield", days: 90 },
                  { label: "1-year yield", days: 365 },
                ].map(row => (
                  <div key={row.label} className="flex justify-between text-sm">
                    <span className="text-white/40">{row.label}</span>
                    <span className="font-mono font-semibold" style={{ color: "#D4AF77" }}>
                      +{sol > 0 ? calcEarnings(sol, row.days) : "0.0000"} SOL
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Confirm Modal ── */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(10px)" }}
            onClick={() => setShowConfirm(false)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
              className="glass-card rounded-2xl p-8 max-w-md w-full"
              style={{ borderColor: "rgba(0,255,159,0.2)" }}
              onClick={e => e.stopPropagation()}>
              <h3 className="display-text text-xl text-white mb-2">Confirm {tab === "deposit" ? "Deposit" : "Withdrawal"}</h3>
              <p className="text-white/50 text-sm mb-6">
                You are about to {tab === "deposit" ? `deposit ${sol} SOL` : `burn ${sol} shares`}. This action will be executed on-chain.
              </p>
              <div className="program-id-block mb-6 text-xs">
                Program: EazAH8Adyino7uConjZfYdjFqmjqfm7vBtTsba3Ejg39
              </div>
              <div className="flex gap-3">
                <button onClick={handle} disabled={loading} className="btn-neon flex-1 py-3.5 text-sm">
                  {loading ? "Confirming..." : "Confirm"}
                </button>
                <button onClick={() => setShowConfirm(false)} className="btn-ghost flex-1 py-3.5 text-sm">Cancel</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
