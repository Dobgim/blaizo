import type { NextConfig } from "next";

/**
 * Supabase Storage, derived from the project URL rather than hardcoded, so a
 * staging project works without editing this file. Absent env means no remote
 * pattern, which is correct — nothing remote is being served yet.
 */
function supabaseImageHost() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return [];
  try {
    return [
      {
        protocol: "https" as const,
        hostname: new URL(url).hostname,
        pathname: "/storage/v1/object/public/**",
      },
    ];
  } catch {
    return [];
  }
}

const nextConfig: NextConfig = {
  // A lockfile exists further up the tree on this machine; pin the root so
  // build traces are collected from this project only.
  outputFileTracingRoot: __dirname,
  images: {
    // Placeholder photography is vendored into /public/placeholders by
    // `npm run placeholders`, so nothing is hotlinked. The only remote origin
    // is the client's own Supabase Storage.
    remotePatterns: supabaseImageHost(),
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    optimizePackageImports: ["gsap"],
  },
};

export default nextConfig;
