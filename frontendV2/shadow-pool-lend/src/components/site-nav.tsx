import { Link } from "@tanstack/react-router";
import { WalletConnectButton } from "@/components/wallet/wallet-connect-button";

export function SiteNav() {
  const linkBase =
    "text-muted-foreground hover:text-foreground transition data-[status=active]:text-primary";
  return (
    <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-xl bg-background/70 border-b border-border">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-glow rounded-sm shadow-glow" />
          <span className="font-display text-lg tracking-tight">VaultView</span>
          <span className="ml-3 text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground border-l border-border pl-3">
            A Jito Cabal Protocol
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm">
          <Link to="/" className={linkBase} activeOptions={{ exact: true }}>
            Protocol
          </Link>
          <Link to="/dashboard" className={linkBase}>
            Dashboard
          </Link>
          <Link to="/borrow" className={linkBase}>
            Borrow
          </Link>
          <Link to="/repay" className={linkBase}>
            Repay
          </Link>
          <Link to="/lend" className={linkBase}>
            Lend
          </Link>
        </nav>
        <WalletConnectButton />
      </div>
    </header>
  );
}
