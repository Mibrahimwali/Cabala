import { Lock } from "lucide-react";
import { WalletConnectButton } from "@/components/wallet/wallet-connect-button";

type Props = {
  title?: string;
  description?: string;
};

export function ConnectPrompt({
  title = "Connect your wallet",
  description = "Connect a Solana wallet to interact with the VaultView protocol.",
}: Props) {
  return (
    <div className="border border-border bg-card scanlines relative overflow-hidden">
      <div className="p-10 md:p-14 flex flex-col items-center text-center gap-6">
        <div className="w-14 h-14 border border-primary/30 bg-primary/10 flex items-center justify-center">
          <Lock className="w-6 h-6 text-primary" />
        </div>
        <div className="max-w-md space-y-2">
          <h2 className="font-display text-xl uppercase">{title}</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        </div>
        <WalletConnectButton />
        <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          Phantom · Solflare supported
        </p>
      </div>
    </div>
  );
}
