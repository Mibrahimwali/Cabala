import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Wallet, TrendingUp, ArrowUpRight, Sparkles } from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import { ConnectPrompt } from "@/components/wallet/connect-prompt";
import { useWalletReady } from "@/hooks/use-wallet-ready";

export const Route = createFileRoute("/lend")({
  head: () => ({
    meta: [
      { title: "Lend · VaultView" },
      {
        name: "description",
        content:
          "Deposit SOL into the sovereign liquidity pool and earn 14.2% base APY from borrower interest and default spreads.",
      },
      { property: "og:title", content: "Participate in the SOL Vault · VaultView" },
    ],
  }),
  component: LendPage,
});

const POOL = {
  tvl: 1368.42,
  utilization: 0.71,
  baseApr: 0.142,
  defaultSpread: 0.022,
  lenders: 318,
  shareRate: 1.0427,
};

const userPosition = {
  shares: 12.4,
  depositedSol: 11.89,
};

const PRESETS = [1, 5, 10, 25];
const LOCKS = [
  { days: 0, label: "Flex", mult: 1 },
  { days: 30, label: "30d", mult: 1.08 },
  { days: 90, label: "90d", mult: 1.18 },
  { days: 180, label: "180d", mult: 1.32 },
];

function LendPage() {
  const { connected, shortAddress } = useWalletReady();
  const [amount, setAmount] = useState<string>("5");
  const [lockIdx, setLockIdx] = useState<number>(1);

  const calc = useMemo(() => {
    const sol = Number(amount) || 0;
    const lock = LOCKS[lockIdx];
    const apr = (POOL.baseApr + POOL.defaultSpread) * lock.mult;
    const yearly = sol * apr;
    const monthly = yearly / 12;
    const daily = yearly / 365;
    const projection = lock.days > 0 ? sol * apr * (lock.days / 365) : 0;
    const shares = +(sol / POOL.shareRate).toFixed(4);
    return {
      sol,
      apr: +(apr * 100).toFixed(2),
      yearly: +yearly.toFixed(3),
      monthly: +monthly.toFixed(3),
      daily: +daily.toFixed(4),
      projection: +projection.toFixed(3),
      shares,
      lockLabel: lock.label,
      lockDays: lock.days,
    };
  }, [amount, lockIdx]);

  const currentValue = +(userPosition.shares * POOL.shareRate).toFixed(3);
  const earned = +(currentValue - userPosition.depositedSol).toFixed(3);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />

      <section className="relative pt-32 pb-12 bg-gradient-hero">
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/20 rounded-full blur-[140px] animate-pulse-glow" />
        <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-primary/15 rounded-full blur-[120px]" />
        <div className="relative max-w-7xl mx-auto px-6">
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-accent mb-4">
            ◆ Vault / Lend
          </p>
          <h1 className="font-display text-5xl lg:text-7xl uppercase leading-[0.85]">
            Stake the shadow.
            <br />
            <span className="text-accent">Reap the light.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-muted-foreground leading-relaxed">
            Participate in the sovereign SOL Vault. Your liquidity is borrowed against verified Jito
            Cabal NFTs. You earn the spread on every loan, compounded into your jPoolShares.
          </p>
        </div>
      </section>

      {/* Pool meters */}
      <section className="border-y border-border bg-card/30">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4">
          <Meter label="Pool TVL" value={POOL.tvl.toString()} unit="SOL" />
          <Meter label="Utilization" value={(POOL.utilization * 100).toFixed(0)} unit="%" />
          <Meter
            label="Lender APY"
            value={((POOL.baseApr + POOL.defaultSpread) * 100).toFixed(1)}
            unit="%"
            accent
          />
          <Meter label="Active Lenders" value={POOL.lenders.toString()} unit="" />
        </div>
      </section>

      <section className="py-14">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-10">
          {/* Deposit terminal */}
          <div className="lg:col-span-7">
            {!connected ? (
              <ConnectPrompt
                title="Connect to deposit"
                description="Connect your Solana wallet to deposit SOL into the sovereign liquidity pool and earn yield."
              />
            ) : (
              <div className="border border-border bg-card scanlines">
                <div className="p-5 border-b border-border flex items-center justify-between">
                  <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground">
                    sol_vault.deposit()
                  </p>
                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                </div>

                <div className="p-6 space-y-7">
                  <div>
                    <div className="flex justify-between items-end mb-2">
                      <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                        Deposit Amount
                      </label>
                      <span className="text-[10px] font-mono text-primary">
                        {shortAddress ?? "Connected"}
                      </span>
                    </div>
                    <div className="flex items-stretch border border-border focus-within:border-accent">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="flex-1 bg-transparent px-4 py-4 font-display text-3xl outline-none"
                      />
                      <span className="px-4 self-center font-mono text-sm text-muted-foreground">
                        SOL
                      </span>
                    </div>
                    <div className="mt-2 grid grid-cols-4 gap-1">
                      {PRESETS.map((p) => (
                        <button
                          key={p}
                          onClick={() => setAmount(p.toString())}
                          className="py-2 text-[10px] font-mono uppercase tracking-widest border border-border text-muted-foreground hover:border-accent hover:text-accent transition"
                        >
                          {p} SOL
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">
                      Lock-up (boosts APY)
                    </p>
                    <div className="grid grid-cols-4 gap-1">
                      {LOCKS.map((l, i) => (
                        <button
                          key={l.label}
                          onClick={() => setLockIdx(i)}
                          className={`py-3 text-xs font-mono uppercase border transition ${
                            lockIdx === i
                              ? "border-accent text-accent bg-accent/10"
                              : "border-border text-muted-foreground hover:border-accent/40"
                          }`}
                        >
                          <div>{l.label}</div>
                          <div className="text-[9px] opacity-70">×{l.mult.toFixed(2)}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-border pt-5 grid grid-cols-2 gap-4 font-mono text-sm">
                    <Stat label="Effective APY" value={`${calc.apr}%`} accent />
                    <Stat label="jPoolShares" value={calc.shares.toString()} />
                    <Stat label="Daily yield" value={`${calc.daily} SOL`} />
                    <Stat label="Monthly yield" value={`${calc.monthly} SOL`} />
                    <Stat label="Annual yield" value={`${calc.yearly} SOL`} />
                    <Stat
                      label={calc.lockDays > 0 ? `Yield @ ${calc.lockLabel}` : "Withdraw"}
                      value={calc.lockDays > 0 ? `${calc.projection} SOL` : "Anytime"}
                    />
                  </div>

                  <button
                    disabled={calc.sol <= 0}
                    className="w-full inline-flex items-center justify-center gap-2 bg-accent text-accent-foreground font-mono uppercase tracking-widest text-xs px-6 py-5 shadow-ember hover:bg-accent/90 transition disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Wallet className="w-4 h-4" />
                    Deposit {calc.sol} SOL into Vault
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Your position */}
          <aside className="lg:col-span-5 space-y-6">
            <div className="border border-border bg-card p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground">
                  Your position
                </p>
                <Sparkles className="w-4 h-4 text-accent" />
              </div>
              <p className="font-display text-4xl">
                {currentValue}
                <span className="text-accent text-xl ml-1">SOL</span>
              </p>
              <p className="mt-1 font-mono text-xs text-muted-foreground">
                {userPosition.shares} jPoolShares · @ {POOL.shareRate} rate
              </p>

              <div className="mt-5 pt-5 border-t border-border grid grid-cols-2 gap-4 font-mono text-sm">
                <Stat label="Deposited" value={`${userPosition.depositedSol} SOL`} />
                <Stat label="Earned" value={`+${earned} SOL`} accent />
              </div>

              <button className="mt-5 w-full inline-flex items-center justify-center gap-2 border border-border text-foreground font-mono uppercase tracking-widest text-xs px-6 py-3 hover:border-accent hover:text-accent transition">
                <TrendingUp className="w-3.5 h-3.5" />
                Withdraw & burn shares
              </button>
            </div>

            <div className="border border-border bg-card p-6">
              <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground mb-4">
                How your yield is generated
              </p>
              <ol className="space-y-3 text-sm">
                {[
                  "Borrowers pledge Jito Cabal NFTs at fixed 60% LTV.",
                  "Your SOL funds the loan — interest accrues per block.",
                  "Defaults are auctioned; spread flows back into the pool.",
                  "jPoolShares appreciate as the vault grows.",
                ].map((step, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="font-display text-accent text-lg leading-none w-5">
                      {i + 1}
                    </span>
                    <span className="text-muted-foreground leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </aside>
        </div>
      </section>

      <section className="border-t border-border py-10 bg-card/30">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-between gap-4 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          <Link to="/" className="hover:text-primary transition">
            ← Protocol overview
          </Link>
          <Link
            to="/borrow"
            className="hover:text-primary transition inline-flex items-center gap-1"
          >
            Borrow against NFTs <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
      </section>
    </div>
  );
}

function Meter({
  label,
  value,
  unit,
  accent,
}: {
  label: string;
  value: string;
  unit: string;
  accent?: boolean;
}) {
  return (
    <div className="p-6 border-l border-border first:border-l-0">
      <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground mb-2">
        {label}
      </p>
      <p className="font-display text-3xl">
        {value}
        <span className={`text-lg ml-1 ${accent ? "text-accent" : "text-primary"}`}>{unit}</span>
      </p>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className={`mt-1 ${accent ? "text-accent" : "text-foreground"}`}>{value}</p>
    </div>
  );
}
