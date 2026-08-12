import Link from "next/link";
import { notFound } from "next/navigation";
import { ResourceForm } from "@/components/admin/ResourceForm";
import { ClearanceEditor } from "@/components/admin/ClearanceEditor";
import { createClient } from "@/lib/supabase/server";
import { findResource } from "@/lib/admin/resources";

export const dynamic = "force-dynamic";

export default async function ResourceEditPage({
  params,
}: {
  params: Promise<{ resource: string; id: string }>;
}) {
  const { resource: key, id } = await params;
  const resource = findResource(key);
  if (!resource) notFound();

  const supabase = await createClient();
  if (!supabase) notFound();

  const isNew = id === "new";

  const row = isNew
    ? null
    : ((
        await supabase.from(resource.table).select("*").eq("id", id).maybeSingle()
      ).data as Record<string, unknown> | null);

  if (!isNew && !row) notFound();

  /* Reference pickers need their options. Fetched here rather than in the
     client component so the form stays a single round trip. */
  const refs: Record<string, { id: string; label: string }[]> = {};
  if (resource.fields.some((f) => f.refTable === "dogs")) {
    const { data } = await supabase
      .from("dogs")
      .select("id, call_name, name, role")
      .order("call_name");
    refs.dogs = (data ?? []).map((d) => ({
      id: d.id,
      label: `${d.call_name ?? d.name} (${d.role})`,
    }));
  }
  if (resource.fields.some((f) => f.refTable === "litters")) {
    const { data } = await supabase
      .from("litters")
      .select("id, code, status")
      .order("code", { ascending: false });
    refs.litters = (data ?? []).map((l) => ({
      id: l.id,
      label: `${l.code} — ${l.status}`,
    }));
  }

  const heading = isNew
    ? `Add a ${resource.singular}`
    : String(row?.[resource.titleField] ?? `Edit ${resource.singular}`);

  return (
    <>
      <nav aria-label="Breadcrumb" className="mb-7">
        <Link
          href={`/admin/${resource.key}`}
          className="eyebrow text-canvas-deep transition-colors duration-200 hover:text-foxred"
        >
          ← {resource.title}
        </Link>
      </nav>

      <h1 className="text-h2 text-spruce">{heading}</h1>

      {!isNew && resource.key === "dogs" && row?.slug ? (
        <p className="mt-2">
          <Link
            href={`/dogs/${row.slug}`}
            target="_blank"
            className="eyebrow text-canvas-deep transition-colors duration-200 hover:text-foxred"
          >
            View on the site ↗
          </Link>
        </p>
      ) : null}
      {!isNew && resource.key === "puppies" && row?.slug ? (
        <p className="mt-2">
          <Link
            href={`/puppies/${row.slug}`}
            target="_blank"
            className="eyebrow text-canvas-deep transition-colors duration-200 hover:text-foxred"
          >
            View on the site ↗
          </Link>
        </p>
      ) : null}

      <div className="mt-9">
        <ResourceForm resource={resource} row={row} refs={refs} />
      </div>

      {/* Clearances belong to a dog, so they are edited here rather than as a
          top-level section the owner would have to cross-reference by hand. */}
      {!isNew && resource.key === "dogs" && (
        <ClearanceEditor dogId={String(id)} />
      )}
    </>
  );
}
