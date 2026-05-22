import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowUpRight, Activity, Wallet, Droplets, TrendingUp } from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import { ConnectPrompt } from "@/components/wallet/connect-prompt";
import { useWalletReady } from "@/hooks/use-wallet-ready";
import { userNfts } from "@/lib/nfts";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard · VaultView" },
      {
        name: "description",
        content:
          "Your VaultView command center. Monitor the sovereign liquidity pool, live protocol activity, and your active NFT-backed positions.",
      },
      { property: "og:title", content: "VaultView Dashboard" },
    ],
  }),
  component: DashboardPage,
});

const POOL = {
  tvl: 1368.18,
  baseApy: 14.2,
  activeLoans: 23,
  defaultRate: 0.0,
  capacity: 2048,
  lenders: 187,
  utilization: 67,
};

type Activity = {
  kind: "borrow" | "lend" | "repay";
  addr: string;
  amount: number;
  ago: string;
};

const seedActivity: Activity[] = [
  { kind: "borrow", addr: "7xKd...F3e2", amount: 1.2, ago: "2m ago" },
  { kind: "lend", addr: "4mQr...A9b1", amount: 15, ago: "5m ago" },
  { kind: "repay", addr: "9pLs...C7k4", amount: 1.2, ago: "11m ago" },
  { kind: "borrow", addr: "2nWt...E8x3", amount: 1.2, ago: "18m ago" },
  { kind: "lend", addr: "6rJu...B2m5", amount: 50, ago: "25m ago" },
  { kind: "repay", addr: "8sKv...D4n6", amount: 1.2, ago: "32m ago" },
  { kind: "borrow", addr: "3hYn...G1p7", amount: 2.4, ago: "41m ago" },
  { kind: "lend", addr: "5tBx...H6q8", amount: 8, ago: "55m ago" },
];

const positions = [
  {
    nft: userNfts[0],
    collateral: 2.0,
    borrowed: 1.2,
    ltv: 60,
    health: 85,
    due: "12d 4h",
  },
  {
    nft: userNfts[4],
    collateral: 2.0,
    borrowed: 1.2,
    ltv: 60,
    health: 55,
    due: "3d 7h",
  },
];

function DashboardPage() {
  const { connected, shortAddress } = useWalletReady();
  const [feed, setFeed] = useState<Activity[]>(seedActivity);

  // Subtle live feel — rotate top item every few seconds
  useEffect(() => {
    const t = setInterval(() => {
      setFeed((f) => {
        const kinds: Activity["kind"][] = ["borrow", "lend", "repay"];
        const next: Activity = {
          kind: kinds[Math.floor(Math.random() * 3)],
          addr: `${Math.random().toString(16).slice(2, 6)}...${Math.random()
            .toString(16)
            .slice(2, 6)}`,
          amount: +(Math.random() * 20 + 0.5).toFixed(2),
          ago: "just now",
        };
        return [next, ...f.slice(0, 9)];
      });
    }, 6000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />

      {/* Header */}
      <section className="relative pt-28 pb-10 bg-gradient-hero">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="absolute top-0 right-1/3 w-[500px] h-[500px] bg-accent/15 rounded-full blur-[140px] animate-pulse-glow" />
        <div className="relative max-w-7xl mx-auto px-6 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-accent mb-3">
              ◆ Vault / Dashboard
            </p>
            <h1 className="font-display text-4xl lg:text-6xl uppercase leading-[0.9]">
              Command the <span className="text-accent">shadows</span>.
            </h1>
          </div>
          <div className="flex items-center gap-3 border border-border bg-card/60 px-4 py-3 font-mono text-xs">
            <span
              className={`w-2 h-2 rounded-full ${connected ? "bg-primary animate-pulse" : "bg-muted-foreground"}`}
            />
            <span className="text-muted-foreground">Wallet</span>
            <span className="text-foreground">{connected ? shortAddress : "Not connected"}</span>
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-8">
          {/* Sovereign Liquidity Pool */}
          <div className="lg:col-span-8 space-y-8">
            <div className="border border-border bg-card scanlines">
              <div className="p-5 border-b border-border flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <Droplets className="w-4 h-4 text-accent" />
                  <p className="font-display text-xl uppercase">Sovereign Liquidity Pool</p>
                  <span className="text-[10px] font-mono uppercase tracking-widest border border-border px-2 py-0.5 text-muted-foreground">
                    Global Pool
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-widest border border-accent/40 px-2 py-0.5 text-accent">
                    JitoSOL-Backed
                  </span>
                </div>
                <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest">
                  <span className="text-accent">{POOL.utilization}%</span>
                  <span className="text-muted-foreground">utilized</span>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Utilization bar */}
                <div>
                  <div className="h-1.5 bg-secondary/60 relative overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-accent"
                      style={{ width: `${POOL.utilization}%` }}
                    />
                  </div>
                  <div className="mt-2 flex justify-between font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    <span>{POOL.tvl} SOL deployed</span>
                    <span>cap {POOL.capacity} SOL</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-border">
                  <Tile label="Total Value Locked" value={POOL.tvl.toString()} unit="SOL" />
                  <Tile label="Base APY" value={POOL.baseApy.toString()} unit="%" accent />
                  <Tile label="Active Loans" value={POOL.activeLoans.toString()} unit="" />
                  <Tile label="Default Rate" value={POOL.defaultRate.toFixed(1)} unit="%" />
                  <Tile label="Pool Capacity" value={POOL.capacity.toString()} unit="SOL" />
                  <Tile label="Lenders" value={POOL.lenders.toString()} unit="" />
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <Link
                    to="/lend"
                    className="inline-flex items-center gap-2 bg-accent text-accent-foreground font-mono uppercase tracking-widest text-xs px-5 py-3 shadow-ember hover:bg-accent/90 transition"
                  >
                    <Wallet className="w-3.5 h-3.5" />
                    Deposit SOL
                  </Link>
                  <Link
                    to="/borrow"
                    className="inline-flex items-center gap-2 border border-primary/60 text-primary font-mono uppercase tracking-widest text-xs px-5 py-3 hover:bg-primary hover:text-primary-foreground transition"
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    Borrow
                  </Link>
                </div>
              </div>
            </div>

            {/* My Active Positions */}
            <div className="border border-border bg-card">
              <div className="p-5 border-b border-border flex items-center justify-between">
                <p className="font-display text-xl uppercase">My Active Positions</p>
                <Link
                  to="/repay"
                  className="text-[10px] font-mono uppercase tracking-widest text-accent hover:text-accent/80 inline-flex items-center gap-1"
                >
                  View all <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>

              {!connected ? (
                <div className="p-6">
                  <ConnectPrompt
                    title="Connect to view positions"
                    description="Your active NFT-backed loans appear here once your wallet is connected."
                  />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground border-b border-border">
                        <th className="text-left p-4 font-normal">NFT</th>
                        <th className="text-left p-4 font-normal">Collateral</th>
                        <th className="text-left p-4 font-normal">Borrowed</th>
                        <th className="text-left p-4 font-normal">LTV</th>
                        <th className="text-left p-4 font-normal">Health</th>
                        <th className="text-left p-4 font-normal">Due</th>
                        <th className="text-right p-4 font-normal">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {positions.map((p) => (
                        <tr key={p.nft.id} className="border-b border-border last:border-0">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 border border-border overflow-hidden bg-secondary/40">
                                <img
                                  src={p.nft.src}
                                  alt={p.nft.name}
                                  className="w-full h-full object-cover"
                                  style={{ imageRendering: "pixelated" }}
                                />
                              </div>
                              <div>
                                <p className="font-display">{p.nft.name}</p>
                                <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                                  ◆ {p.nft.rarity}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 font-mono">{p.collateral.toFixed(2)} SOL</td>
                          <td className="p-4 font-mono">{p.borrowed.toFixed(2)} SOL</td>
                          <td className="p-4 font-mono">{p.ltv}%</td>
                          <td className="p-4">
                            <div className="flex items-center gap-2 min-w-[110px]">
                              <div className="flex-1 h-1.5 bg-secondary/60 overflow-hidden">
                                <div
                                  className={`h-full ${
                                    p.health > 70
                                      ? "bg-primary"
                                      : p.health > 40
                                        ? "bg-accent"
                                        : "bg-destructive"
                                  }`}
                                  style={{ width: `${p.health}%` }}
                                />
                              </div>
                              <span className="font-mono text-xs">{p.health}%</span>
                            </div>
                          </td>
                          <td className="p-4 font-mono">{p.due}</td>
                          <td className="p-4 text-right">
                            <Link
                              to="/repay"
                              className="inline-flex items-center gap-1 border border-accent/50 text-accent font-mono uppercase tracking-widest text-[10px] px-3 py-2 hover:bg-accent hover:text-accent-foreground transition"
                            >
                              Repay
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Live Activity */}
          <aside className="lg:col-span-4">
            <div className="border border-border bg-card lg:sticky lg:top-24">
              <div className="p-5 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-accent" />
                  <p className="font-display text-xl uppercase">Live Activity</p>
                </div>
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              </div>
              <ul className="max-h-[640px] overflow-y-auto">
                {feed.map((a, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-3 px-5 py-3 border-b border-border last:border-0 hover:bg-secondary/20 transition"
                  >
                    <span
                      className={`text-[10px] font-mono uppercase tracking-widest px-2 py-1 border ${
                        a.kind === "borrow"
                          ? "border-primary/50 text-primary"
                          : a.kind === "lend"
                            ? "border-accent/50 text-accent"
                            : "border-border text-muted-foreground"
                      }`}
                    >
                      {a.kind}
                    </span>
                    <span className="font-mono text-xs text-muted-foreground flex-1 truncate">
                      {a.addr}
                    </span>
                    <span className="font-mono text-sm">{a.amount} SOL</span>
                    <span className="font-mono text-[10px] text-muted-foreground w-16 text-right">
                      {a.ago}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}

function Tile({
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
    <div className="bg-card p-5">
      <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground mb-2">
        {label}
      </p>
      <p className="font-display text-2xl">
        {value}
        {unit && (
          <span className={`text-base ml-1 ${accent ? "text-accent" : "text-primary"}`}>
            {unit}
          </span>
        )}
      </p>
    </div>
  );
}
