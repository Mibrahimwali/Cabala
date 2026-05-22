import nft1 from "@/assets/nfts/nft1.png";
import nft2 from "@/assets/nfts/nft2.png";
import nft3 from "@/assets/nfts/nft3.png";
import nft4 from "@/assets/nfts/nft4.png";
import nft5 from "@/assets/nfts/nft5.png";
import nft6 from "@/assets/nfts/nft6.png";
import nft7 from "@/assets/nfts/nft7.png";
import nft8 from "@/assets/nfts/nft8.png";
import nft9 from "@/assets/nfts/nft9.png";

export type CabalNft = {
  id: string;
  name: string;
  src: string;
  floor: number;
  rarity: "Common" | "Rare" | "Mythic" | "Sovereign";
  maxBorrow: number;
};

const sources = [nft1, nft2, nft3, nft4, nft5, nft6, nft7, nft8, nft9];

export const userNfts: CabalNft[] = sources.map((src, i) => {
  const rarities: CabalNft["rarity"][] = [
    "Rare",
    "Common",
    "Common",
    "Mythic",
    "Common",
    "Sovereign",
    "Rare",
    "Common",
    "Mythic",
  ];
  const floor = 2;
  return {
    id: `0x${(1024 + i * 137).toString(16).toUpperCase()}`,
    name: `Cabal #${(1024 + i * 137).toString()}`,
    src,
    floor,
    rarity: rarities[i],
    maxBorrow: +(floor * 0.6).toFixed(2),
  };
});
