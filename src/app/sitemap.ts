import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";
import { processPages } from "@/lib/content/process";
import { getDogSlugs, getPosts, getPuppySlugs } from "@/lib/queries";

/**
 * The sitemap.
 *
 * Priorities are not guesses dressed as data — they follow the site's actual
 * job. Available puppies and health testing convert; the legal pages exist
 * because they must. /admin and /apply are excluded: one is private, the other
 * is a form with nothing for a crawler to index.
 */

const STATIC_ROUTES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "", priority: 1, changeFrequency: "weekly" },
  { path: "/puppies", priority: 0.9, changeFrequency: "daily" },
  { path: "/puppies/upcoming", priority: 0.7, changeFrequency: "weekly" },
  { path: "/puppies/past", priority: 0.5, changeFrequency: "monthly" },
  { path: "/dogs", priority: 0.8, changeFrequency: "monthly" },
  { path: "/process", priority: 0.7, changeFrequency: "yearly" },
  { path: "/faqs", priority: 0.7, changeFrequency: "monthly" },
  { path: "/about", priority: 0.6, changeFrequency: "yearly" },
  { path: "/about/facility", priority: 0.5, changeFrequency: "yearly" },
  { path: "/about/reviews", priority: 0.5, changeFrequency: "monthly" },
  { path: "/journal", priority: 0.5, changeFrequency: "weekly" },
  { path: "/contact", priority: 0.6, changeFrequency: "yearly" },
  { path: "/privacy", priority: 0.1, changeFrequency: "yearly" },
  { path: "/terms", priority: 0.1, changeFrequency: "yearly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url;
  const now = new Date();

  const [dogSlugs, puppySlugs, posts] = await Promise.all([
    getDogSlugs(),
    getPuppySlugs(),
    getPosts(),
  ]);

  return [
    ...STATIC_ROUTES.map((r) => ({
      url: `${base}${r.path}`,
      lastModified: now,
      changeFrequency: r.changeFrequency,
      priority: r.priority,
    })),

    // The process pages, in their real order.
    ...processPages.map((p) => ({
      url: `${base}/process/${p.slug}`,
      lastModified: now,
      changeFrequency: "yearly" as const,
      // Health testing is the page this site lives or dies on.
      priority: p.slug === "health-testing" ? 0.9 : 0.6,
    })),

    ...dogSlugs.map((slug) => ({
      url: `${base}/dogs/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),

    ...puppySlugs.map((slug) => ({
      url: `${base}/puppies/${slug}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),

    ...posts.map((post) => ({
      url: `${base}/journal/${post.slug}`,
      lastModified: new Date(post.updated_at),
      changeFrequency: "yearly" as const,
      priority: 0.4,
    })),
  ];
}
