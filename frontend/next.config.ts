import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Empty turbopack config to silence the turbopack/webpack conflict warning
  turbopack: {},
  // Allow images from any source (for NFT images)
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
