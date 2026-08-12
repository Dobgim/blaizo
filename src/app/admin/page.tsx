import Link from "next/link";
import { PuppyStatusSwitch } from "@/components/admin/PuppyStatusSwitch";
import { createClient } from "@/lib/supabase/server";
import { resources } from "@/lib/admin/resources";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

/**
 * The dashboard.
 *
 * Built around the one job the brief names explicitly: flipping a puppy from
 * Available to Reserved on a Sunday evening without calling anyone. That is
 * the first thing on the page and it takes one click — no list, no form, no
 * save button.
 */
export default async function AdminDashboard() {
  const supabase = await createClient();
  if (!supabase) return null;

  const [puppies, newApplications, counts] = await Promise.all([
    supabase
      .from("puppies")
      .select("id, name, status, slug, is_published, litters (code)")
      .neq("status", "placed")
      .order("sort_order", { ascending: true }),
    supabase
      .from("applications")
      .select("id, name, created_at, status")
      .eq("status", "new")
      .order("created_at", { ascending: false })
      .limit(5),
    Promise.all(
      resources.map(async (r) => {
        const { count } = await supabase
          .from(r.table)
          .select("*", { count: "exact", head: true });
        return { resource: r, count: count ?? 0 };
      }),
    ),
  ]);

  /* Joined shape. The hand-written Database types declare no relationships,
     so embedded selects have to be asserted — same as in the read layer. */
  const rows = (puppies.data ?? []) as unknown as {
    id: string;
    name: string;
    status: "available" | "reserved" | "placed";
    slug: string;
    is_published: boolean;
    litters: { code: string } | null;
  }[];

  const pending = newApplications.data ?? [];

  return (
    <>
      <h1 className="text-h2 text-spruce">Dashboard</h1>

      {/* --- The Sunday-evening job. --- */}
      <section aria-labelledby="status-heading" className="mt-10">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h2 id="status-heading" className="text-h3 font-body font-semibold text-spruce">
            Puppy status
          </h2>
          <Link
            href="/admin/puppies"
            className="eyebrow text-canvas-deep transition-colors duration-200 hover:text-foxred"
          >
            All puppies →
          </Link>
        </div>
        <p className="measure mt-2 text-small text-canvas-deep">
          One click. The change is live on the website immediately.
        </p>

        {rows.length === 0 ? (
          <p className="hairline mt-6 pt-6 text-body text-canvas-deep">
            No puppies currently available or reserved.{" "}
            <Link
              href="/admin/puppies/new"
              className="border-b border-brass pb-0.5 text-spruce hover:border-foxred hover:text-foxred"
            >
              Add one
            </Link>
            .
          </p>
        ) : (
          <ul className="hairline mt-6">
            {rows.map((row) => (
              <li
                key={row.id}
                className="flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-enamel py-3.5"
              >
                <div className="min-w-[10rem] flex-1">
                  <Link
                    href={`/admin/puppies/${row.id}`}
                    className="text-body text-spruce underline decoration-brass underline-offset-4 transition-colors duration-200 hover:text-foxred"
                  >
                    {row.name}
                  </Link>
                  <span className="eyebrow ml-3 text-canvas">
                    {row.litters?.code ?? "—"}
                  </span>
                  {!row.is_published && (
                    <span className="eyebrow ml-3 text-foxred">Draft</span>
                  )}
                </div>

                <PuppyStatusSwitch id={row.id} status={row.status} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* --- Inbox summary. --- */}
      <section aria-labelledby="inbox-heading" className="mt-14">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h2 id="inbox-heading" className="text-h3 font-body font-semibold text-spruce">
            Unread applications
          </h2>
          <Link
            href="/admin/applications"
            className="eyebrow text-canvas-deep transition-colors duration-200 hover:text-foxred"
          >
            The inbox →
          </Link>
        </div>

        {pending.length === 0 ? (
          <p className="hairline mt-6 pt-6 text-body text-canvas-deep">
            Nothing new. Anything that arrives lands here and on WhatsApp.
          </p>
        ) : (
          <ul className="hairline mt-6">
            {pending.map((a) => (
              <li
                key={a.id}
                className="flex flex-wrap items-baseline justify-between gap-4 border-b border-enamel py-3"
              >
                <Link
                  href={`/admin/applications#${a.id}`}
                  className="text-body text-spruce underline decoration-brass underline-offset-4 hover:text-foxred"
                >
                  {a.name}
                </Link>
                <span className="font-mono text-data text-canvas-deep">
                  {formatDate(a.created_at.slice(0, 10))}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* --- Everything else. --- */}
      <section aria-labelledby="sections-heading" className="mt-14">
        <h2 id="sections-heading" className="text-h3 font-body font-semibold text-spruce">
          Everything else
        </h2>
        <ul className="hairline mt-6 grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
          {counts.map(({ resource, count }) => (
            <li key={resource.key} className="border-b border-enamel py-3.5">
              <Link
                href={`/admin/${resource.key}`}
                className="flex items-baseline justify-between gap-4 text-body text-spruce transition-colors duration-200 hover:text-foxred"
              >
                {resource.title}
                <span className="font-mono text-data text-canvas-deep">
                  {String(count).padStart(2, "0")}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
