import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Check, Lock, ArrowUpRight, Shield } from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import { ConnectPrompt } from "@/components/wallet/connect-prompt";
import { useWalletReady } from "@/hooks/use-wallet-ready";
import { userNfts } from "@/lib/nfts";

export const Route = createFileRoute("/borrow")({
  head: () => ({
    meta: [
      { title: "Borrow · VaultView" },
      {
        name: "description",
        content:
          "Select your Jito Cabal NFTs as collateral and borrow SOL instantly at a fixed 60% LTV.",
      },
      { property: "og:title", content: "Borrow against your Jito Cabal NFTs · VaultView" },
    ],
  }),
  component: BorrowPage,
});

const DURATIONS = [7, 14, 30, 60];

function BorrowPage() {
  const { connected } = useWalletReady();
  const [selected, setSelected] = useState<string[]>([]);
  const [duration, setDuration] = useState<number>(14);

  const toggle = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const summary = useMemo(() => {
    const items = userNfts.filter((n) => selected.includes(n.id));
    const totalCollateral = items.reduce((a, b) => a + b.floor, 0);
    const totalBorrow = items.reduce((a, b) => a + b.maxBorrow, 0);
    const apr = 0.142;
    const interest = totalBorrow * apr * (duration / 365);
    return {
      count: items.length,
      totalCollateral: +totalCollateral.toFixed(2),
      totalBorrow: +totalBorrow.toFixed(2),
      interest: +interest.toFixed(3),
      repay: +(totalBorrow + interest).toFixed(3),
    };
  }, [selected, duration]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />

      <section className="relative pt-32 pb-12 bg-gradient-hero">
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="absolute top-0 -right-20 w-[400px] h-[400px] bg-primary/20 rounded-full blur-[120px] animate-pulse-glow" />
        <div className="relative max-w-7xl mx-auto px-6">
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-primary mb-4">
            ◆ Vault / Borrow
          </p>
          <h1 className="font-display text-5xl lg:text-7xl uppercase leading-[0.85]">
            Your collateral.
            <br />
            <span className="text-gradient-glow">Your liquidity.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-muted-foreground leading-relaxed">
            Select one or more Jito Cabal NFTs from your wallet. We auto-verify floor on-chain and
            unlock SOL at a fixed 60% LTV. Repay within the window — your NFTs return.
          </p>
        </div>
      </section>

      <section className="border-y border-border bg-card/30">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4">
          {[
            { l: "In Wallet", v: userNfts.length, u: "NFTs" },
            { l: "Selected", v: summary.count, u: "" },
            { l: "Collateral", v: summary.totalCollateral, u: "SOL" },
            { l: "Max Borrow", v: summary.totalBorrow, u: "SOL" },
          ].map((s, i) => (
            <div
              key={s.l}
              className={`p-6 ${i !== 0 ? "lg:border-l border-border" : ""} ${
                i % 2 === 1 ? "border-l border-border" : ""
              } ${i >= 2 ? "border-t lg:border-t-0 border-border" : ""}`}
            >
              <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground mb-2">
                {s.l}
              </p>
              <p className="font-display text-3xl">
                {s.v}
                <span className="text-primary text-lg ml-1">{s.u}</span>
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          {!connected ? (
            <ConnectPrompt
              title="Connect to enter the vault"
              description="Connect your wallet holding a verified Jito Cabal NFT to select collateral and borrow SOL."
            />
          ) : (
            <div className="grid lg:grid-cols-12 gap-10">
              {/* Grid */}
              <div className="lg:col-span-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display text-2xl uppercase">Your Jito Cabal NFTs</h2>
                  <button
                    onClick={() =>
                      setSelected(
                        selected.length === userNfts.length ? [] : userNfts.map((n) => n.id),
                      )
                    }
                    className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground hover:text-primary transition"
                  >
                    {selected.length === userNfts.length ? "Clear all" : "Select all"}
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {userNfts.map((nft) => {
                    const isOn = selected.includes(nft.id);
                    const isMythic = nft.rarity === "Mythic" || nft.rarity === "Sovereign";
                    return (
                      <button
                        key={nft.id}
                        onClick={() => toggle(nft.id)}
                        className={`group relative text-left border bg-card overflow-hidden transition ${
                          isOn
                            ? "border-primary shadow-glow"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="relative aspect-square bg-secondary/40 overflow-hidden">
                          <img
                            src={nft.src}
                            alt={nft.name}
                            className="w-full h-full object-cover"
                            style={{ imageRendering: "pixelated" }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                          {isOn && (
                            <div className="absolute top-2 right-2 w-6 h-6 bg-primary text-primary-foreground flex items-center justify-center">
                              <Check className="w-3.5 h-3.5" />
                            </div>
                          )}
                          <span
                            className={`absolute top-2 left-2 text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5 ${
                              isMythic
                                ? "bg-accent/20 text-accent border border-accent/40"
                                : "bg-background/60 text-muted-foreground border border-border"
                            }`}
                          >
                            {nft.rarity}
                          </span>
                        </div>
                        <div className="p-3 font-mono text-xs">
                          <div className="flex justify-between text-muted-foreground">
                            <span>{nft.id}</span>
                            <span>{nft.floor} SOL</span>
                          </div>
                          <div className="mt-1 flex justify-between">
                            <span className="text-foreground">{nft.name}</span>
                            <span className="text-primary">↑ {nft.maxBorrow}</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Summary */}
              <aside className="lg:col-span-4 lg:sticky lg:top-24 self-start">
                <div className="border border-border bg-card scanlines">
                  <div className="p-5 border-b border-border flex items-center justify-between">
                    <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground">
                      borrow_summary.sol
                    </p>
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  </div>

                  <div className="p-5 space-y-5">
                    <div>
                      <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">
                        Loan Duration
                      </p>
                      <div className="grid grid-cols-4 gap-1">
                        {DURATIONS.map((d) => (
                          <button
                            key={d}
                            onClick={() => setDuration(d)}
                            className={`py-2 text-xs font-mono border transition ${
                              duration === d
                                ? "border-primary text-primary bg-primary/10"
                                : "border-border text-muted-foreground hover:border-primary/40"
                            }`}
                          >
                            {d}d
                          </button>
                        ))}
                      </div>
                    </div>

                    <dl className="space-y-3 font-mono text-sm">
                      <Row label="NFTs pledged" value={summary.count.toString()} />
                      <Row label="Collateral floor" value={`${summary.totalCollateral} SOL`} />
                      <Row label="Borrow (60% LTV)" value={`${summary.totalBorrow} SOL`} accent />
                      <Row label="Base APR" value="14.2%" />
                      <Row label="Interest" value={`${summary.interest} SOL`} />
                    </dl>

                    <div className="border-t border-border pt-4">
                      <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                        Repay at maturity
                      </p>
                      <p className="font-display text-3xl mt-1">
                        {summary.repay} <span className="text-primary text-lg">SOL</span>
                      </p>
                    </div>

                    <button
                      disabled={summary.count === 0}
                      className="w-full inline-flex items-center justify-center gap-2 bg-gradient-glow text-primary-foreground font-mono uppercase tracking-widest text-xs px-6 py-4 shadow-glow hover:scale-[1.01] transition disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      <Lock className="w-4 h-4" />
                      {summary.count === 0
                        ? "Select NFTs to borrow"
                        : `Borrow ${summary.totalBorrow} SOL`}
                    </button>

                    <Link
                      to="/repay"
                      className="block text-center text-[10px] font-mono uppercase tracking-widest text-muted-foreground hover:text-primary transition"
                    >
                      Already borrowed? Repay & reclaim →
                    </Link>
                  </div>
                </div>

                <p className="mt-4 flex items-start gap-2 text-[11px] font-mono text-muted-foreground leading-relaxed">
                  <Shield className="w-3.5 h-3.5 mt-0.5 text-primary shrink-0" />
                  Fixed LTV, no oracle manipulation. Liquidation triggers only on missed repayment.
                </p>
              </aside>
            </div>
          )}
        </div>
      </section>

      <section className="border-t border-border py-10 bg-card/30">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-between gap-4 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          <Link to="/" className="hover:text-primary transition inline-flex items-center gap-1">
            ← Protocol overview
          </Link>
          <Link to="/lend" className="hover:text-accent transition inline-flex items-center gap-1">
            Lend SOL instead <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
      </section>
    </div>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={accent ? "text-primary" : "text-foreground"}>{value}</dd>
    </div>
  );
}
