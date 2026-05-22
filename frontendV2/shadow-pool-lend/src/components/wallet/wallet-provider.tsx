import { useEffect, useState, type ComponentType, type ReactNode } from "react";
import { WalletReadyProvider, defaultWalletReady } from "@/components/wallet/wallet-ready-context";

type SolanaProviderProps = { children: ReactNode };

/**
 * Loads Solana wallet adapters only in the browser (never during SSR).
 */
export function WalletProvider({ children }: { children: ReactNode }) {
  const [SolanaStack, setSolanaStack] = useState<{
    Provider: ComponentType<SolanaProviderProps>;
    Bridge: ComponentType<SolanaProviderProps>;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      import("@/components/wallet/solana-wallet-provider"),
      import("@/components/wallet/wallet-bridge"),
      import("@solana/wallet-adapter-react-ui/styles.css"),
    ]).then(([solana, bridge]) => {
      if (cancelled) return;
      setSolanaStack({
        Provider: solana.SolanaWalletProvider,
        Bridge: bridge.WalletBridge,
      });
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <WalletReadyProvider value={defaultWalletReady}>
      {SolanaStack ? (
        <SolanaStack.Provider>
          <SolanaStack.Bridge>{children}</SolanaStack.Bridge>
        </SolanaStack.Provider>
      ) : (
        children
      )}
    </WalletReadyProvider>
  );
}
