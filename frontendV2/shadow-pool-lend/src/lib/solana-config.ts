/** Solana RPC — override with VITE_SOLANA_RPC_URL in .env */
export const SOLANA_RPC_ENDPOINT =
  import.meta.env.VITE_SOLANA_RPC_URL ?? "https://api.mainnet-beta.solana.com";

export const SOLANA_NETWORK = import.meta.env.VITE_SOLANA_NETWORK ?? "mainnet-beta";
