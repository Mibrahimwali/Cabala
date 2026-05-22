import { useMemo, type ReactNode } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletReadyProvider } from "@/components/wallet/wallet-ready-context";

/** Syncs live wallet-adapter state into WalletReadyContext (client only). */
export function WalletBridge({ children }: { children: ReactNode }) {
  const wallet = useWallet();

  const value = useMemo(() => {
    const address = wallet.publicKey?.toBase58() ?? null;
    return {
      connected: wallet.connected,
      connecting: wallet.connecting,
      disconnecting: wallet.disconnecting,
      publicKey: wallet.publicKey,
      address,
      shortAddress: address ? `${address.slice(0, 4)}...${address.slice(-4)}` : null,
    };
  }, [wallet.connected, wallet.connecting, wallet.disconnecting, wallet.publicKey]);

  return <WalletReadyProvider value={value}>{children}</WalletReadyProvider>;
}
