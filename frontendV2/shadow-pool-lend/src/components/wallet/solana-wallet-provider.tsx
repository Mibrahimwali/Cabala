import { useMemo, type ReactNode } from "react";
import { Buffer } from "buffer";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { SolflareWalletAdapter } from "@solana/wallet-adapter-solflare";
import { SOLANA_RPC_ENDPOINT } from "@/lib/solana-config";

import "@solana/wallet-adapter-react-ui/styles.css";

if (typeof globalThis !== "undefined") {
  globalThis.Buffer = globalThis.Buffer ?? Buffer;
}

/**
 * Client-only Solana wallet stack.
 * Only Phantom + Solflare — avoids the heavy @solana/wallet-adapter-wallets bundle.
 */
export function SolanaWalletProvider({ children }: { children: ReactNode }) {
  const endpoint = useMemo(() => SOLANA_RPC_ENDPOINT, []);

  const wallets = useMemo(() => [new PhantomWalletAdapter(), new SolflareWalletAdapter()], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
