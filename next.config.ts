import { setupDevPlatform } from "@cloudflare/next-on-pages/next-dev";
import type { NextConfig } from "next";

if (process.env.NODE_ENV === "development") {
  await setupDevPlatform();
}
const nextConfig: NextConfig = {
  // Edge runtime дээр ажиллахгүй байгаа Node модулиудыг Webpack-аар хаах
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

// Хөгжүүлэлтийн үед Cloudflare орчныг идэвхжүүлэх
if (process.env.NODE_ENV === "development") {
  (async () => {
    try {
      await setupDevPlatform();
      console.log("🚀 Cloudflare Dev Platform initialized");
    } catch (err) {
      console.error("❌ Failed to initialize Cloudflare Dev Platform:", err);
    }
  })();
}

export default nextConfig;
