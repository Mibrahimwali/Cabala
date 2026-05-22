import { createContext, useContext, type ReactNode } from "react";

export type WalletReadyState = {
  connected: boolean;
  connecting: boolean;
  disconnecting: boolean;
  publicKey: unknown | null;
  address: string | null;
  shortAddress: string | null;
};

export const defaultWalletReady: WalletReadyState = {
  connected: false,
  connecting: false,
  disconnecting: false,
  publicKey: null,
  address: null,
  shortAddress: null,
};

const WalletReadyContext = createContext<WalletReadyState>(defaultWalletReady);

export function WalletReadyProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: WalletReadyState;
}) {
  return <WalletReadyContext.Provider value={value}>{children}</WalletReadyContext.Provider>;
}

export function useWalletReadyContext() {
  return useContext(WalletReadyContext);
}
