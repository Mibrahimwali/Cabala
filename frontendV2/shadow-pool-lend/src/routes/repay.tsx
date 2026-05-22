import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowUpRight, KeyRound, Clock } from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import { ConnectPrompt } from "@/components/wallet/connect-prompt";
import { useWalletReady } from "@/hooks/use-wallet-ready";
import { userNfts } from "@/lib/nfts";

export const Route = createFileRoute("/repay")({
  head: () => ({
    meta: [
      { title: "Repay · VaultView" },
      {
        name: "description",
        content: "Repay your outstanding loan to release your Jito Cabal NFTs back from the vault.",
      },
      { property: "og:title", content: "Repay & reclaim your NFTs · VaultView" },
    ],
  }),
  component: RepayPage,
});

type ActiveLoan = {
  loanId: string;
  nftId: string;
  borrowed: number;
  apr: number;
  openedDays: number;
  termDays: number;
};

// Mocked active loans for the connected wallet
const activeLoans: ActiveLoan[] = [
  {
    loanId: "LN-0x91A",
    nftId: userNfts[3].id,
    borrowed: 1.92,
    apr: 0.142,
    openedDays: 6,
    termDays: 14,
  },
  {
    loanId: "LN-0x91B",
    nftId: userNfts[5].id,
    borrowed: 2.76,
    apr: 0.142,
    openedDays: 11,
    termDays: 30,
  },
  {
    loanId: "LN-0x91C",
    nftId: userNfts[8].id,
    borrowed: 2.22,
    apr: 0.142,
    openedDays: 2,
    termDays: 7,
  },
];

function computeOwed(loan: ActiveLoan) {
  const interest = loan.borrowed * loan.apr * (loan.openedDays / 365);
  return {
    interest: +interest.toFixed(4),
    total: +(loan.borrowed + interest).toFixed(4),
    remaining: loan.termDays - loan.openedDays,
  };
}

function RepayPage() {
  const { connected } = useWalletReady();
  const [selected, setSelected] = useState<string[]>([activeLoans[0].loanId]);
  const [customAmount, setCustomAmount] = useState<string>("");

  const totals = useMemo(() => {
    const items = activeLoans.filter((l) => selected.includes(l.loanId));
    const sum = items.reduce(
      (acc, l) => {
        const c = computeOwed(l);
        return {
          borrowed: acc.borrowed + l.borrowed,
          interest: acc.interest + c.interest,
          total: acc.total + c.total,
        };
      },
      { borrowed: 0, interest: 0, total: 0 },
    );
    return {
      count: items.length,
      borrowed: +sum.borrowed.toFixed(4),
      interest: +sum.interest.toFixed(4),
      total: +sum.total.toFixed(4),
    };
  }, [selected]);

  const payAmount = customAmount === "" ? totals.total : Number(customAmount) || 0;
  const fullClose = payAmount >= totals.total && totals.count > 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />

      <section className="relative pt-32 pb-12 bg-gradient-hero">
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="absolute top-0 left-0 w-[420px] h-[420px] bg-accent/20 rounded-full blur-[120px] animate-pulse-glow" />
        <div className="relative max-w-7xl mx-auto px-6">
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-accent mb-4">
            ◆ Vault / Repay
          </p>
          <h1 className="font-display text-5xl lg:text-7xl uppercase leading-[0.85]">
            Settle the debt.
            <br />
            <span className="text-accent">Reclaim the shadows.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-muted-foreground leading-relaxed">
            Pay the principal plus accrued interest for the time held. The instant the vault
            confirms, your collateral NFTs return to your wallet.
          </p>
        </div>
      </section>

      <section className="py-14">
        <div className="max-w-7xl mx-auto px-6">
          {!connected ? (
            <ConnectPrompt
              title="Connect to repay"
              description="Connect the wallet that holds your active loan to view positions and reclaim your NFTs."
            />
          ) : (
            <div className="grid lg:grid-cols-12 gap-10">
              {/* Active loans */}
              <div className="lg:col-span-7">
                <h2 className="font-display text-2xl uppercase mb-6">Active Loans</h2>
                <ul className="space-y-px bg-border">
                  {activeLoans.map((loan) => {
                    const nft = userNfts.find((n) => n.id === loan.nftId)!;
                    const owed = computeOwed(loan);
                    const isOn = selected.includes(loan.loanId);
                    const overdue = owed.remaining <= 0;
                    return (
                      <li
                        key={loan.loanId}
                        className={`bg-card p-5 flex items-center gap-5 transition ${
                          isOn ? "border-l-2 border-l-primary" : "border-l-2 border-l-transparent"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isOn}
                          onChange={() =>
                            setSelected((s) =>
                              s.includes(loan.loanId)
                                ? s.filter((x) => x !== loan.loanId)
                                : [...s, loan.loanId],
                            )
                          }
                          className="accent-primary w-4 h-4"
                        />
                        <div className="w-16 h-16 border border-border overflow-hidden bg-secondary/40 shrink-0">
                          <img
                            src={nft.src}
                            alt={nft.name}
                            className="w-full h-full object-cover"
                            style={{ imageRendering: "pixelated" }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                            <span>{loan.loanId}</span>
                            <span
                              className={`inline-flex items-center gap-1 ${
                                overdue ? "text-accent" : "text-primary"
                              }`}
                            >
                              <Clock className="w-3 h-3" />
                              {overdue ? "Overdue" : `${owed.remaining}d left`}
                            </span>
                          </div>
                          <p className="font-display text-lg mt-1 truncate">{nft.name}</p>
                          <div className="mt-2 grid grid-cols-3 gap-3 font-mono text-xs">
                            <Cell label="Borrowed" value={`${loan.borrowed} SOL`} />
                            <Cell label="Interest" value={`${owed.interest} SOL`} />
                            <Cell label="Owed" value={`${owed.total} SOL`} accent />
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Pay panel */}
              <aside className="lg:col-span-5 lg:sticky lg:top-24 self-start">
                <div className="border border-border bg-card scanlines">
                  <div className="p-5 border-b border-border flex items-center justify-between">
                    <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground">
                      repay_terminal.sol
                    </p>
                    <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                  </div>

                  <div className="p-5 space-y-5">
                    <dl className="space-y-3 font-mono text-sm">
                      <Row label="Loans selected" value={totals.count.toString()} />
                      <Row label="Principal" value={`${totals.borrowed} SOL`} />
                      <Row label="Accrued interest" value={`${totals.interest} SOL`} />
                    </dl>

                    <div className="border-t border-border pt-4">
                      <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                        Payment amount (SOL)
                      </label>
                      <div className="mt-2 flex items-stretch border border-border focus-within:border-accent">
                        <input
                          type="number"
                          step="0.0001"
                          min="0"
                          value={customAmount}
                          onChange={(e) => setCustomAmount(e.target.value)}
                          placeholder={totals.total.toString()}
                          className="flex-1 bg-transparent px-3 py-3 font-mono text-lg outline-none"
                        />
                        <button
                          onClick={() => setCustomAmount(totals.total.toString())}
                          className="px-3 text-[10px] font-mono uppercase tracking-widest text-accent border-l border-border hover:bg-accent hover:text-accent-foreground transition"
                        >
                          Max
                        </button>
                      </div>
                      <p className="mt-2 text-[10px] font-mono text-muted-foreground">
                        {fullClose
                          ? "→ Full repayment. NFTs will be released on confirmation."
                          : `→ Partial payment. Remaining: ${(totals.total - payAmount).toFixed(4)} SOL`}
                      </p>
                    </div>

                    <button
                      disabled={totals.count === 0 || payAmount <= 0}
                      className="w-full inline-flex items-center justify-center gap-2 bg-accent text-accent-foreground font-mono uppercase tracking-widest text-xs px-6 py-4 shadow-ember hover:bg-accent/90 transition disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <KeyRound className="w-4 h-4" />
                      {fullClose
                        ? `Repay ${payAmount.toFixed(4)} SOL & Reclaim ${totals.count} NFT${totals.count > 1 ? "s" : ""}`
                        : `Pay ${payAmount.toFixed(4)} SOL`}
                    </button>
                  </div>
                </div>
              </aside>
            </div>
          )}
        </div>
      </section>

      <section className="border-t border-border py-10 bg-card/30">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-between gap-4 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          <Link to="/borrow" className="hover:text-primary transition">
            ← Borrow more
          </Link>
          <Link to="/lend" className="hover:text-accent transition inline-flex items-center gap-1">
            Earn as a lender <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
      </section>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-foreground">{value}</dd>
    </div>
  );
}

function Cell({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <p className="text-[9px] uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className={`mt-0.5 ${accent ? "text-accent" : "text-foreground"}`}>{value}</p>
    </div>
  );
}
