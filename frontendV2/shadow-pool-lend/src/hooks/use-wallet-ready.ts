import { useWalletReadyContext } from "@/components/wallet/wallet-ready-context";

/** SSR-safe wallet state (defaults to disconnected until client adapters load). */
export function useWalletReady() {
  return useWalletReadyContext();
}
