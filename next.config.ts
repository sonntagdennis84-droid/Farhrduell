import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    middlewareClientMaxBodySize: "60mb"
  }
};

export default nextConfig;
