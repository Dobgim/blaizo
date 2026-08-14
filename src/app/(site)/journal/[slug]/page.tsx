import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostBySlug, getPosts } from "@/lib/queries";
import { formatDate } from "@/lib/format";
import { siteConfig } from "@/lib/site-config";

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Entry not found" };

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      type: "article",
      publishedTime: post.published_at ?? undefined,
      images: post.cover_image ? [{ url: post.cover_image }] : undefined,
    },
  };
}

export default async function JournalPostPage({ params }: Params) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.published_at,
    dateModified: post.updated_at,
    author: { "@type": "Organization", name: post.author ?? siteConfig.name },
    publisher: { "@type": "Organization", name: siteConfig.name },
    image: post.cover_image ? [post.cover_image] : undefined,
  };

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="shell pb-12 pt-32 lg:pt-44">
        <nav aria-label="Breadcrumb" className="mb-8">
          <Link
            href="/journal"
            className="eyebrow inline-flex min-h-11 items-center text-canvas-deep transition-colors duration-300 hover:text-foxred"
          >
            ← Journal
          </Link>
        </nav>

        <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-2">
            <time
              dateTime={post.published_at ?? undefined}
              className="eyebrow text-foxred"
            >
              {formatDate(post.published_at?.slice(0, 10) ?? null)}
            </time>
            {post.author && (
              <p className="eyebrow mt-2 text-canvas-deep">{post.author}</p>
            )}
          </div>

          <div className="lg:col-span-9 lg:col-start-3">
            <h1 className="text-display-l text-spruce">{post.title}</h1>
            {post.excerpt && (
              <p className="measure mt-6 text-body-l text-canvas-deep">
                {post.excerpt}
              </p>
            )}
          </div>
        </div>
      </header>

      {post.cover_image && (
        <div className="shell mb-12">
          <div className="relative aspect-[16/9] overflow-hidden bg-canvas">
            <Image
              src={post.cover_image}
              alt={post.cover_alt ?? ""}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          </div>
        </div>
      )}

      <div className="shell pb-24 lg:pb-32">
        <div className="grid lg:grid-cols-12">
          {/* Body is stored as plain text with blank-line paragraphs, which is
              what the admin editor produces. No HTML is ever injected. */}
          <div className="longform text-body text-spruce lg:col-span-8 lg:col-start-3">
            {post.body
              .split(/\n{2,}/)
              .filter(Boolean)
              .map((para, i) => (
                <p key={i}>{para.trim()}</p>
              ))}
          </div>
        </div>
      </div>
    </article>
  );
}
