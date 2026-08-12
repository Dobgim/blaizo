import Link from "next/link";
import { notFound } from "next/navigation";
import { ButtonLink } from "@/components/ui/Button";
import { PublishToggle } from "@/components/admin/PublishToggle";
import { createClient } from "@/lib/supabase/server";
import { findResource, resources } from "@/lib/admin/resources";
import { formatDate } from "@/lib/format";
import type { Field } from "@/lib/admin/resources";

/* Always fresh. An admin list showing a cached copy of what the owner just
   changed is worse than useless. */
export const dynamic = "force-dynamic";

type Row = Record<string, unknown>;

/** Renders one cell according to the field's declared type. */
function cell(field: Field, row: Row, refLabels: Map<string, string>) {
  const value = row[field.name];

  if (field.type === "reference") {
    return typeof value === "string" ? (refLabels.get(value) ?? "—") : "—";
  }
  if (field.type === "date") {
    return formatDate(typeof value === "string" ? value.slice(0, 10) : null);
  }
  if (field.type === "select") {
    return field.options?.find((o) => o.value === value)?.label ?? "—";
  }
  if (value === null || value === undefined || value === "") return "—";
  return String(value);
}

export default async function ResourceListPage({
  params,
}: {
  params: Promise<{ resource: string }>;
}) {
  const { resource: key } = await params;
  const resource = findResource(key);
  if (!resource) notFound();

  const supabase = await createClient();
  if (!supabase) notFound();

  const { data, error } = await supabase
    .from(resource.table)
    .select("*")
    .order(resource.orderBy.column, {
      ascending: resource.orderBy.ascending,
      nullsFirst: false,
    });

  const rows = (data ?? []) as Row[];

  /* Reference columns show a name, not a UUID. One lookup covers both the
     dogs and litters references used across the resources. */
  const refLabels = new Map<string, string>();
  if (resource.fields.some((f) => f.type === "reference")) {
    const [dogs, litters] = await Promise.all([
      supabase.from("dogs").select("id, call_name, name"),
      supabase.from("litters").select("id, code"),
    ]);
    for (const d of dogs.data ?? []) {
      refLabels.set(d.id, d.call_name ?? d.name);
    }
    for (const l of litters.data ?? []) refLabels.set(l.id, l.code);
  }

  const columns = resource.fields.filter(
    (f) => f.inList && f.name !== "is_published",
  );
  const hasPublish = resource.fields.some((f) => f.name === "is_published");

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <h1 className="text-h2 text-spruce">{resource.title}</h1>
          <p className="measure mt-2 text-small text-canvas-deep">
            {resource.blurb}
          </p>
        </div>
        <ButtonLink href={`/admin/${resource.key}/new`}>
          Add {resource.singular}
        </ButtonLink>
      </div>

      {error && (
        <p role="alert" className="mt-8 text-small font-medium text-foxred">
          Could not load this list: {error.message}
        </p>
      )}

      {rows.length === 0 ? (
        <div className="hairline mt-8 pt-10">
          <p className="text-body text-spruce">
            Nothing here yet.{" "}
            <Link
              href={`/admin/${resource.key}/new`}
              className="border-b border-brass pb-0.5 hover:border-foxred hover:text-foxred"
            >
              Add the first {resource.singular}
            </Link>
            .
          </p>
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-enamel">
                {columns.map((f) => (
                  <th
                    key={f.name}
                    scope="col"
                    className="eyebrow py-2.5 pr-6 text-canvas-deep"
                  >
                    {f.label}
                  </th>
                ))}
                {hasPublish && (
                  <th scope="col" className="eyebrow py-2.5 pr-6 text-canvas-deep">
                    Visible
                  </th>
                )}
                <th scope="col" className="sr-only">
                  Edit
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={String(row.id)} className="border-b border-enamel">
                  {columns.map((f, i) => (
                    <td key={f.name} className="py-3 pr-6 align-top">
                      {i === 0 ? (
                        <Link
                          href={`/admin/${resource.key}/${row.id}`}
                          className="text-body text-spruce underline decoration-brass underline-offset-4 transition-colors duration-200 hover:text-foxred"
                        >
                          {cell(f, row, refLabels)}
                        </Link>
                      ) : (
                        <span className="font-mono text-data text-canvas-deep">
                          {cell(f, row, refLabels)}
                        </span>
                      )}
                    </td>
                  ))}

                  {hasPublish && (
                    <td className="py-3 pr-6 align-top">
                      <PublishToggle
                        resourceKey={resource.key}
                        id={String(row.id)}
                        published={Boolean(row.is_published)}
                      />
                    </td>
                  )}

                  <td className="py-3 text-right align-top">
                    <Link
                      href={`/admin/${resource.key}/${row.id}`}
                      className="eyebrow text-canvas-deep transition-colors duration-200 hover:text-foxred"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
