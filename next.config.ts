import type { NextConfig } from "next";

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

export default nextConfig;
