import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Wallet, Coins, Trophy, Lock, Shield, Zap, TrendingUp } from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import nft1 from "@/assets/nfts/nft1.png";
import nft2 from "@/assets/nfts/nft2.png";
import nft3 from "@/assets/nfts/nft3.png";
import nft4 from "@/assets/nfts/nft4.png";
import nft5 from "@/assets/nfts/nft5.png";
import nft6 from "@/assets/nfts/nft6.png";
import nft7 from "@/assets/nfts/nft7.png";
import nft8 from "@/assets/nfts/nft8.png";
import nft9 from "@/assets/nfts/nft9.png";

const nftCollage = [
  { src: nft1, rot: -6, delay: 0, dur: 7, accent: false },
  { src: nft2, rot: 4, delay: 0.8, dur: 8, accent: true },
  { src: nft3, rot: -3, delay: 1.6, dur: 6.5, accent: false },
  { src: nft4, rot: 7, delay: 0.4, dur: 7.5, accent: false },
  { src: nft5, rot: -5, delay: 1.2, dur: 8.5, accent: true },
  { src: nft6, rot: 5, delay: 2, dur: 7, accent: false },
  { src: nft7, rot: -7, delay: 0.6, dur: 6.8, accent: false },
  { src: nft8, rot: 3, delay: 1.4, dur: 7.8, accent: true },
  { src: nft9, rot: -4, delay: 2.2, dur: 8.2, accent: false },
];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VaultView — Sovereign Lending for Jito Cabal" },
      {
        name: "description",
        content:
          "Peer-to-pool NFT-backed lending exclusively for Jito Cabal. Borrow instantly against your NFT. Earn compounding APY as a lender.",
      },
      { property: "og:title", content: "VaultView — Sovereign Lending for Jito Cabal" },
      {
        property: "og:description",
        content:
          "Lend in the Shadows. Borrow the Light. Premier NFT-backed lending protocol for Cabal holders.",
      },
    ],
  }),
  component: Index,
});

const stats = [
  { value: "1,368", unit: "SOL", label: "Total Value Locked" },
  { value: "23", unit: "", label: "Active Loans" },
  { value: "14.2", unit: "%", label: "Base APY" },
  { value: "4,200", unit: "", label: "Cabal Members" },
];

const protocolFeatures = [
  {
    icon: Zap,
    title: "Instant Borrow",
    body: "Use your verified Jito Cabal NFT as collateral. Borrow 1.2 SOL instantly — zero price discovery risk, mathematically fixed LTV.",
    cta: "Borrow Now",
    tone: "glow",
  },
  {
    icon: Coins,
    title: "Earn as Lender",
    body: "Deposit SOL into the sovereign pool. Earn compounding APY from borrower interest and 0.8 SOL default spreads.",
    cta: "Deposit SOL",
    tone: "ember",
  },
  {
    icon: Trophy,
    title: "Quest & Earn",
    body: "Complete Cabal quests, climb the leaderboard. The deeper in the shadows you go, the greater the rewards.",
    cta: "View Quests",
    tone: "glow",
  },
];

const borrowerSteps = [
  "Connect your wallet holding a verified Jito Cabal NFT",
  "Select your NFT as collateral — floor value auto-verified on-chain",
  "Borrow exactly 1.2 SOL at 60% LTV, instantly to your wallet",
  "Repay within the window. Your NFT returns. No price risk.",
];

const lenderSteps = [
  "Deposit SOL into the sovereign liquidity pool — open to all",
  "Receive jPoolShares representing your pro-rata ownership",
  "Earn 14.2% base APY from borrower interest + default spreads",
  "Withdraw at any time by burning jPoolShares for SOL + accrued yield",
];

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Nav */}
      <SiteNav />

      {/* HERO — asymmetric split */}
      <section className="relative pt-32 pb-20 bg-gradient-hero">
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="absolute top-1/3 -right-32 w-[500px] h-[500px] bg-accent/20 rounded-full blur-[120px] animate-pulse-glow" />
        <div className="absolute top-1/2 -left-32 w-[400px] h-[400px] bg-primary/20 rounded-full blur-[120px] animate-pulse-glow" />

        <div className="relative max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-12 items-end">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-border bg-card/40 backdrop-blur mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground">
                Protocol live · Mainnet
              </span>
            </div>
            <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl leading-[0.85] uppercase">
              Lend in the
              <br />
              <span className="text-gradient-glow">Shadows.</span>
              <br />
              Borrow the
              <br />
              <span className="text-accent">Light.</span>
            </h1>
            <p className="mt-8 max-w-xl text-base text-muted-foreground leading-relaxed">
              The premier peer-to-pool NFT-backed lending protocol. Exclusively for Jito Cabal
              holders. Borrow instantly. Earn compounding APY.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <a
                href="#dashboard"
                className="group inline-flex items-center gap-2 bg-gradient-glow text-primary-foreground font-mono uppercase tracking-widest text-xs px-6 py-4 shadow-glow hover:scale-[1.02] transition"
              >
                Enter the VaultView Dashboard
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
              </a>
              <a
                href="#protocol"
                className="text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground transition"
              >
                Read the protocol →
              </a>
            </div>
          </div>

          {/* Vault NFT collage */}
          <div className="lg:col-span-5 relative">
            <div className="relative bg-card border border-border p-5 overflow-hidden scanlines">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  <span className="text-[10px] font-mono text-muted-foreground tracking-widest uppercase">
                    vault.cabal.sol / collateral_grid
                  </span>
                </div>
                <span className="text-[10px] font-mono text-primary tracking-widest">LIVE</span>
              </div>

              <div className="relative grid grid-cols-3 gap-3">
                {nftCollage.map((n, i) => (
                  <div
                    key={i}
                    className={`relative aspect-square border ${n.accent ? "border-accent/60" : "border-primary/40"} bg-secondary/40 overflow-hidden group animate-float`}
                    style={{
                      transform: `rotate(${n.rot}deg)`,
                      animationDelay: `${n.delay}s`,
                      animationDuration: `${n.dur}s`,
                      boxShadow: n.accent
                        ? "0 0 24px -6px hsl(var(--accent) / 0.45)"
                        : "0 0 24px -6px hsl(var(--primary) / 0.35)",
                    }}
                  >
                    <img
                      src={n.src}
                      alt={`Jito Cabal NFT #${i + 1}`}
                      className="w-full h-full object-cover pixelated"
                      style={{ imageRendering: "pixelated" }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-60" />
                    <div className="absolute bottom-1 left-1.5 text-[8px] font-mono uppercase tracking-widest text-primary">
                      #{(1024 + i * 137).toString(16).toUpperCase()}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 pt-4 border-t border-border flex items-end justify-between font-mono text-xs">
                <div>
                  <p className="text-muted-foreground text-[10px] uppercase tracking-widest">
                    Total Locked
                  </p>
                  <p className="font-display text-2xl text-foreground mt-1">
                    1,368.42 <span className="text-primary text-sm">SOL</span>
                  </p>
                  <p className="text-muted-foreground text-[10px] mt-0.5">≈ $328,420 USD</p>
                </div>
                <p className="text-primary text-[10px]">▮ vault_synced</p>
              </div>
            </div>
            <div className="absolute -bottom-6 -right-6 -z-10 w-full h-full bg-accent/30 blur-3xl" />
            <div className="absolute -top-6 -left-6 -z-10 w-2/3 h-2/3 bg-primary/20 blur-3xl" />
          </div>
        </div>
      </section>

      {/* STATS TICKER */}
      <section
        id="dashboard"
        className="border-y border-border bg-card/30 relative overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className={`p-8 ${i !== 0 ? "lg:border-l border-border" : ""} ${i % 2 === 1 ? "border-l border-border lg:border-l" : ""} ${i >= 2 ? "border-t lg:border-t-0 border-border" : ""}`}
            >
              <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground mb-3">
                {s.label}
              </p>
              <p className="font-display text-4xl lg:text-5xl">
                {s.value}
                <span className="text-primary text-2xl ml-1">{s.unit}</span>
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* PROTOCOL */}
      <section id="protocol" className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-12 gap-12 mb-16">
            <div className="lg:col-span-5">
              <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-primary mb-4">
                ◆ The Protocol
              </p>
              <h2 className="font-display text-5xl lg:text-6xl uppercase leading-[0.9]">
                Built for the
                <br />
                <span className="text-gradient-glow">Inner Circle</span>
              </h2>
            </div>
            <p className="lg:col-span-6 lg:col-start-7 text-muted-foreground text-lg leading-relaxed self-end">
              Peer-to-pool architecture. Cryptographically verified NFT collateral. Sovereign
              liquidity for sovereign holders.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-px bg-border">
            {protocolFeatures.map((f) => {
              const Icon = f.icon;
              const isEmber = f.tone === "ember";
              return (
                <div
                  key={f.title}
                  className="group relative bg-card p-10 hover:bg-secondary/50 transition-colors"
                >
                  <div
                    className={`absolute top-0 left-0 right-0 h-px ${isEmber ? "bg-accent" : "bg-primary"} opacity-0 group-hover:opacity-100 transition`}
                  />
                  <div
                    className={`inline-flex items-center justify-center w-14 h-14 mb-8 border ${isEmber ? "border-accent text-accent" : "border-primary text-primary"}`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-display text-2xl uppercase mb-4">{f.title}</h3>
                  <p className="text-muted-foreground leading-relaxed mb-8">{f.body}</p>
                  <button
                    className={`inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest ${isEmber ? "text-accent" : "text-primary"} group-hover:gap-3 transition-all`}
                  >
                    {f.cta}
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* BORROWER FLOW */}
      <section id="borrow" className="py-32 border-t border-border relative overflow-hidden">
        <div className="absolute top-1/2 -translate-y-1/2 -left-40 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[140px]" />
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-16 items-start relative">
          <div className="lg:col-span-5 lg:sticky lg:top-32">
            <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-primary mb-4">
              ◆ Borrower Flow
            </p>
            <h2 className="font-display text-5xl lg:text-7xl uppercase leading-[0.85]">
              Your NFT.
              <br />
              <span className="text-gradient-glow">Your Liquidity.</span>
            </h2>
            <p className="mt-6 text-muted-foreground leading-relaxed">
              Fixed LTV. Fixed terms. No oracle manipulation. Your collateral is your sovereignty.
            </p>
            <Link
              to="/borrow"
              className="mt-10 inline-flex items-center gap-2 bg-primary text-primary-foreground font-mono uppercase tracking-widest text-xs px-6 py-4 shadow-glow hover:bg-primary/90 transition"
            >
              <Lock className="w-4 h-4" />
              Borrow Against NFT
            </Link>
          </div>

          <ol className="lg:col-span-7 space-y-px bg-border">
            {borrowerSteps.map((step, i) => (
              <li
                key={i}
                className="group bg-card hover:bg-secondary/60 transition-colors p-8 flex gap-8 items-start"
              >
                <span className="font-display text-5xl text-primary/50 group-hover:text-primary transition w-16">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="flex-1 pt-2">
                  <p className="text-lg leading-relaxed">{step}</p>
                </div>
                <ArrowUpRight className="w-5 h-5 text-muted-foreground group-hover:text-primary opacity-0 group-hover:opacity-100 transition mt-3" />
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* LENDER FLOW — mirrored */}
      <section id="lend" className="py-32 border-t border-border relative overflow-hidden">
        <div className="absolute top-1/2 -translate-y-1/2 -right-40 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[140px]" />
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-16 items-start relative">
          <ol className="lg:col-span-7 lg:order-1 space-y-px bg-border">
            {lenderSteps.map((step, i) => (
              <li
                key={i}
                className="group bg-card hover:bg-secondary/60 transition-colors p-8 flex gap-8 items-start"
              >
                <span className="font-display text-5xl text-accent/50 group-hover:text-accent transition w-16">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="flex-1 pt-2">
                  <p className="text-lg leading-relaxed">{step}</p>
                </div>
                <TrendingUp className="w-5 h-5 text-muted-foreground group-hover:text-accent opacity-0 group-hover:opacity-100 transition mt-3" />
              </li>
            ))}
          </ol>

          <div className="lg:col-span-5 lg:order-2 lg:sticky lg:top-32">
            <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-accent mb-4">
              ◆ Lender Flow
            </p>
            <h2 className="font-display text-5xl lg:text-7xl uppercase leading-[0.85]">
              Passive Yield.
              <br />
              <span className="text-accent">Secured by Rarity.</span>
            </h2>
            <p className="mt-6 text-muted-foreground leading-relaxed">
              Sovereign pool, sovereign yield. Withdraw any time. The shadows reward patience.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-px bg-border">
              <div className="bg-card p-5">
                <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                  Base APY
                </p>
                <p className="font-display text-3xl text-accent mt-2">14.2%</p>
              </div>
              <div className="bg-card p-5">
                <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                  Default Spread
                </p>
                <p className="font-display text-3xl mt-2">+0.8 SOL</p>
              </div>
            </div>
            <Link
              to="/lend"
              className="mt-8 inline-flex items-center gap-2 bg-accent text-accent-foreground font-mono uppercase tracking-widest text-xs px-6 py-4 shadow-ember hover:bg-accent/90 transition"
            >
              <Wallet className="w-4 h-4" />
              Deposit & Earn
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 border-t border-border relative">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="max-w-4xl mx-auto px-6 text-center relative">
          <Shield className="w-10 h-10 text-primary mx-auto mb-6" />
          <h2 className="font-display text-5xl lg:text-7xl uppercase leading-[0.9]">
            The vault is <span className="text-gradient-glow">open.</span>
          </h2>
          <p className="mt-6 text-muted-foreground text-lg max-w-xl mx-auto">
            Cabal members enter first. Bring your NFT or bring your SOL — the shadows accept both.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <a
              href="#"
              className="bg-gradient-glow text-primary-foreground font-mono uppercase tracking-widest text-xs px-8 py-4 shadow-glow hover:scale-[1.02] transition"
            >
              Enter Dashboard
            </a>
            <a
              href="#"
              className="border border-border font-mono uppercase tracking-widest text-xs px-8 py-4 hover:border-primary hover:text-primary transition"
            >
              View on-chain
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/40">
        <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-gradient-glow rounded-sm" />
              <span className="font-display text-lg">VaultView</span>
            </div>
            <p className="text-sm text-muted-foreground">
              A sovereign lending protocol of the Jito Cabal.
            </p>
          </div>
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3">
              Protocol
            </p>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#borrow" className="hover:text-primary transition">
                  Borrow
                </a>
              </li>
              <li>
                <a href="#lend" className="hover:text-primary transition">
                  Lend
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition">
                  Docs
                </a>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3">
              Connect
            </p>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-accent transition">
                  Twitter / X
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-accent transition">
                  Discord
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-accent transition">
                  Cabal HQ
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border">
          <div className="max-w-7xl mx-auto px-6 py-4 text-[10px] font-mono uppercase tracking-widest text-muted-foreground flex justify-between">
            <span>© 2112 Jito Cabal · All shadows reserved</span>
            <span>v1.0.0 · mainnet</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
