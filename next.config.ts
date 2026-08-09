import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A lockfile exists further up the tree on this machine; pin the root so
  // build traces are collected from this project only.
  outputFileTracingRoot: __dirname,
  images: {
    // Placeholder photography is vendored into /public/placeholders by
    // `npm run placeholders`, so nothing is hotlinked. Supabase Storage is
    // added here in step 4, once the bucket exists.
    remotePatterns: [],
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    optimizePackageImports: ["gsap"],
  },
};

export default nextConfig;
