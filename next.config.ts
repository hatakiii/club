// next.config.ts
import { setupDevPlatform } from "@cloudflare/next-on-pages/next-dev";
import type { NextConfig } from "next";

// Хөгжүүлэлтийн үед Cloudflare орчныг идэвхжүүлэх
if (process.env.NODE_ENV === "development") {
  // await-ийн оронд .catch() ашиглах эсвэл async IIFE ашиглана
  setupDevPlatform().catch((err) => console.error(err));
}

const nextConfig: NextConfig = {
  serverExternalPackages: ["@apollo/server"],

  webpack: (config, { isServer }) => {
    if (isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        zlib: false,
        stream: false,
        os: false,
        fs: false,
        path: false,
        crypto: false,
        http: false,
        https: false,
        net: false,
        tls: false,
        child_process: false,
        dns: false,
      };
    }
    return config;
  },
};

export default nextConfig;
