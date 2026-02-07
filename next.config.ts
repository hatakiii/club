import type { NextConfig } from "next";
import { setupDevPlatform } from "@cloudflare/next-on-pages/next-dev";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: false,
        os: false,
        stream: false,
        fs: false,
        net: false,
        tls: false,
        zlib: false,
      };
    }
    return config;
  },
};

if (process.env.NODE_ENV === "development") {
  // IIFE (Immediately Invoked Function Expression) ашиглан ажиллуулах
  (async () => {
    await setupDevPlatform();
  })().catch((err) => {
    console.error("Cloudflare Dev Platform setup failed:", err);
  });
}

export default nextConfig;
