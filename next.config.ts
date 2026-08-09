import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A lockfile exists further up the tree on this machine; pin the root so
  // build traces are collected from this project only.
  outputFileTracingRoot: __dirname,
  images: {
    remotePatterns: [
      // Placeholder photography until the client's shoot lands.
      // See IMAGES.md for the full shot list.
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    optimizePackageImports: ["gsap"],
  },
};

export default nextConfig;
