import Link from "next/link";
import { ApplicationStatusSwitch } from "@/components/admin/ApplicationStatusSwitch";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/format";
import type { ApplicationRow } from "@/lib/supabase/database.types";

export const dynamic = "force-dynamic";

/**
 * The inbox.
 *
 * Everything an application contains, on one page, in the order it was asked.
 * No detail view — opening a second screen to read a fifteen-minute form the
 * applicant already filled in once is a tax on the owner, not a feature.
 *
 * The reply button opens WhatsApp to *their* number, not the kennel's, which
 * is the only place in the codebase that happens.
 */

const FIELDS: { label: string; key: keyof ApplicationRow }[] = [
  { label: "Home", key: "home_type" },
  { label: "Other pets", key: "other_pets" },
  { label: "Children", key: "children_ages" },
  { label: "Hours alone", key: "time_alone" },
  { label: "Timing", key: "preferred_timing" },
];

function digitsOnly(phone: string) {
  return phone.replace(/\D/g, "");
}

export default async function ApplicationsPage() {
  const supabase = await createClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .order("created_at", { ascending: false });

  const applications = (data ?? []) as ApplicationRow[];

  return (
    <>
      <h1 className="text-h2 text-spruce">Applications</h1>
      <p className="measure mt-2 text-small text-canvas-deep">
        Every application, newest first. These arrive here and on WhatsApp at
        the same time — this is the copy you can search and mark off.
      </p>

      {error && (
        <p role="alert" className="mt-8 text-small font-medium text-foxred">
          Could not load the inbox: {error.message}
        </p>
      )}

      {applications.length === 0 ? (
        <div className="hairline mt-8 pt-10">
          <p className="text-body text-spruce">
            Nothing yet. When somebody finishes the form on{" "}
            <Link
              href="/apply"
              target="_blank"
              className="border-b border-brass pb-0.5 hover:border-foxred hover:text-foxred"
            >
              /apply
            </Link>
            , it lands here.
          </p>
        </div>
      ) : (
        <ul className="mt-9">
          {applications.map((a) => (
            <li
              key={a.id}
              id={a.id}
              className="hairline scroll-mt-24 py-8 first:border-t-0"
            >
              <div className="flex flex-wrap items-start justify-between gap-x-8 gap-y-4">
                <div>
                  <h2 className="text-h3 font-body font-semibold text-spruce">
                    {a.name}
                  </h2>
                  <p className="mt-1.5 flex flex-wrap gap-x-5 gap-y-1 font-mono text-data text-canvas-deep">
                    <a
                      href={`mailto:${a.email}`}
                      className="underline decoration-brass underline-offset-4 hover:text-foxred"
                    >
                      {a.email}
                    </a>
                    <a
                      href={`tel:${digitsOnly(a.phone)}`}
                      className="underline decoration-brass underline-offset-4 hover:text-foxred"
                    >
                      {a.phone}
                    </a>
                    <span>{formatDate(a.created_at.slice(0, 10))}</span>
                  </p>
                </div>

                <div className="flex flex-col items-start gap-3">
                  <ApplicationStatusSwitch id={a.id} status={a.status} />
                  {/* Their number, not ours — the one outbound link on the site. */}
                  <a
                    href={`https://wa.me/${digitsOnly(a.phone)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="eyebrow text-canvas-deep transition-colors duration-200 hover:text-foxred"
                  >
                    Reply on WhatsApp ↗
                  </a>
                </div>
              </div>

              <dl className="mt-6 grid gap-x-8 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
                <div className="flex items-baseline gap-3 border-t border-enamel py-1.5">
                  <dt className="eyebrow text-canvas">Yard</dt>
                  <dd className="font-mono text-data text-spruce">
                    {a.has_yard
                      ? a.yard_fenced
                        ? "Yes, fenced"
                        : "Yes, not fenced"
                      : "No yard"}
                  </dd>
                </div>
                {FIELDS.map((f) => (
                  <div
                    key={f.label}
                    className="flex items-baseline gap-3 border-t border-enamel py-1.5"
                  >
                    <dt className="eyebrow shrink-0 text-canvas">{f.label}</dt>
                    <dd className="font-mono text-data text-spruce">
                      {(a[f.key] as string | null) || "—"}
                    </dd>
                  </div>
                ))}
              </dl>

              {a.experience && (
                <div className="mt-5">
                  <p className="eyebrow text-canvas">Experience with the breed</p>
                  <p className="measure mt-1.5 text-body text-spruce">
                    {a.experience}
                  </p>
                </div>
              )}

              {a.message && (
                <div className="mt-5">
                  <p className="eyebrow text-canvas">Anything else</p>
                  <p className="measure mt-1.5 text-body text-spruce">
                    {a.message}
                  </p>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
