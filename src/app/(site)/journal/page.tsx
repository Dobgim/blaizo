import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Reveal } from "@/components/motion/Reveal";
import { getPosts } from "@/lib/queries";
import { formatDate } from "@/lib/format";

/* Re-read the database at most once a minute.

   Admin edits already call revalidatePath, so those appear instantly. This
   covers changes made outside the app — a row deleted in the Supabase SQL
   editor, say — which otherwise leave a prerendered page serving content that
   no longer exists. */
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Journal",
  description:
    "Notes from the kennel — litter updates, what we learned from a pairing, and the occasional argument about how dogs should be bred.",
};

export default async function JournalPage() {
  const posts = await getPosts();

  return (
    <>
      <PageHeader
        eyebrow="Journal"
        railNote={
          posts.length > 0
            ? `${String(posts.length).padStart(2, "0")} entries`
            : undefined
        }
        title="Notes from the kennel"
        intro="Litter updates, what a pairing taught us, and occasionally an argument about how dogs ought to be bred. Written when there is something to say rather than on a schedule."
      />

      <section className="shell pb-24 lg:pb-32">
        {posts.length > 0 ? (
          <Reveal stagger as="ul" className="hairline">
            {posts.map((post) => (
              <li key={post.id} className="border-b border-enamel">
                <Link
                  href={`/journal/${post.slug}`}
                  className="group grid items-start gap-4 py-8 lg:grid-cols-12 lg:gap-8"
                >
                  <time
                    dateTime={post.published_at ?? undefined}
                    className="eyebrow text-canvas-deep lg:col-span-2"
                  >
                    {formatDate(post.published_at?.slice(0, 10) ?? null)}
                  </time>

                  <div className="lg:col-span-6 lg:col-start-3">
                    <h2 className="font-display text-h3 text-spruce transition-colors duration-300 group-hover:text-foxred">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="measure mt-2 text-body text-canvas-deep">
                        {post.excerpt}
                      </p>
                    )}
                  </div>

                  {post.cover_image && (
                    <div className="relative aspect-[4/3] overflow-hidden bg-canvas lg:col-span-3 lg:col-start-10">
                      <Image
                        src={post.cover_image}
                        alt={post.cover_alt ?? ""}
                        fill
                        sizes="(max-width: 1024px) 100vw, 22vw"
                        className="object-cover transition-transform duration-[400ms] ease-out-quad group-hover:scale-[1.06] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                      />
                    </div>
                  )}
                </Link>
              </li>
            ))}
          </Reveal>
        ) : (
          <EmptyState
            title="The first entry is being written"
            body="We would rather start this properly than fill it with posts nobody needs. In the meantime, the health testing page is where most of our thinking has gone."
            actionLabel="Read how we test"
            actionHref="/process/health-testing"
          />
        )}
      </section>
    </>
  );
}
