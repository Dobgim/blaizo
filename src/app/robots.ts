import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      /* /admin is the owner's panel and /apply is a form — neither has
         anything for a crawler, and the first should never be indexed. */
      disallow: ["/admin", "/admin/", "/apply"],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
