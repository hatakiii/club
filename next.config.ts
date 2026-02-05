// next.config.ts
import { setupDevPlatform } from "@cloudflare/next-on-pages/next-dev";
import type { NextConfig } from "next";

// Хөгжүүлэлтийн үед Cloudflare орчныг идэвхжүүлэх (Sync байдлаар)
if (process.env.NODE_ENV === "development") {
  setupDevPlatform().catch((err) => console.error(err));
}

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        os: false,
        zlib: false,
        fs: false,
        path: false,
        crypto: false,
        stream: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

export default nextConfig;
