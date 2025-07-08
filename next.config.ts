import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      // Convex Dev
      {
        protocol: "https",
        hostname: "doting-salmon-37.convex.cloud",
      },
      // Convex Prod
      {
        protocol: "https",
        hostname: "outgoing-guanaco-622.convex.cloud",
      },
    ],
  },
};

export default nextConfig;
