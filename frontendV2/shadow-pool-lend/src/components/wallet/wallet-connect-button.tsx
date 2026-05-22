import { useEffect, useState, type ComponentType } from "react";

const btnClass = [
  "wallet-connect-btn",
  "!h-9 !min-h-9 !rounded-none !px-4 !py-2",
  "!font-mono !text-[10px] !uppercase !tracking-widest",
  "!bg-transparent !border !border-primary/40 !text-primary",
  "hover:!bg-primary hover:!text-primary-foreground",
  "!transition-colors !shadow-none",
].join(" ");

type WalletMultiButtonProps = { className?: string };

export function WalletConnectButton({ className }: { className?: string }) {
  const [WalletBtn, setWalletBtn] = useState<ComponentType<WalletMultiButtonProps> | null>(null);

  useEffect(() => {
    import("@solana/wallet-adapter-react-ui").then((m) => {
      setWalletBtn(() => m.WalletMultiButton);
    });
  }, []);

  if (!WalletBtn) {
    return (
      <button
        type="button"
        className={[btnClass, className ?? ""].join(" ")}
        aria-label="Connect wallet"
      >
        Connect
      </button>
    );
  }

  return <WalletBtn className={[btnClass, className ?? ""].join(" ")} />;
}
