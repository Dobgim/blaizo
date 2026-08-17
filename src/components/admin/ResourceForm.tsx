"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ImageField } from "@/components/admin/ImageField";
import { MoneyField } from "@/components/admin/MoneyField";
import { deleteRow, saveRow } from "@/app/admin/actions";
import type { Field, Resource } from "@/lib/admin/resources";

type Row = Record<string, unknown>;
type RefOption = { id: string; label: string };

const inputClasses =
  "mt-2 w-full rounded-[2px] border border-enamel bg-ledger-bright px-3.5 py-2.5 text-body text-spruce transition-colors duration-200 hover:border-canvas";

function initial(field: Field, row: Row | null): string {
  const v = row?.[field.name];
  if (v === null || v === undefined) return "";
  if (Array.isArray(v)) return v.join("\n");
  if (field.type === "date" && typeof v === "string") return v.slice(0, 10);
  return String(v);
}

function Control({
  field,
  row,
  refs,
}: {
  field: Field;
  row: Row | null;
  refs: Record<string, RefOption[]>;
}) {
  const id = `f-${field.name}`;
  const defaultValue = initial(field, row);

  switch (field.type) {
    case "boolean": {
      const checked = row ? Boolean(row[field.name]) : field.name === "is_published" ? false : false;
      return (
        <input
          id={id}
          name={field.name}
          type="checkbox"
          defaultChecked={checked}
          className="mt-2 size-4 accent-[var(--color-spruce)]"
        />
      );
    }

    case "textarea":
      return (
        <textarea
          id={id}
          name={field.name}
          rows={field.name === "body" ? 14 : 4}
          defaultValue={defaultValue}
          className={inputClasses}
        />
      );

    case "image":
      return <ImageField name={field.name} defaultValue={defaultValue} />;

    case "gallery":
      return (
        <ImageField name={field.name} defaultValue={defaultValue} multiple />
      );

    case "money":
      return <MoneyField name={field.name} defaultCents={defaultValue} />;

    case "select":
      return (
        <select
          id={id}
          name={field.name}
          defaultValue={defaultValue}
          className={inputClasses}
        >
          <option value="">—</option>
          {field.options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      );

    case "reference":
      return (
        <select
          id={id}
          name={field.name}
          defaultValue={defaultValue}
          className={inputClasses}
        >
          <option value="">—</option>
          {(refs[field.refTable ?? ""] ?? []).map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}
            </option>
          ))}
        </select>
      );

    case "number":
      return (
        <input
          id={id}
          name={field.name}
          type="number"
          defaultValue={defaultValue}
          className={inputClasses}
        />
      );

    case "date":
      return (
        <input
          id={id}
          name={field.name}
          type="date"
          defaultValue={defaultValue}
          className={inputClasses}
        />
      );

    default:
      return (
        <input
          id={id}
          name={field.name}
          type="text"
          defaultValue={defaultValue}
          className={inputClasses}
        />
      );
  }
}

/**
 * One form for every table, built from the resource definition.
 *
 * Errors come back from the server action and are shown at the top with
 * role="alert" — the failures that actually happen here are unique-constraint
 * clashes, which no amount of client validation would have caught.
 */
export function ResourceForm({
  resource,
  row,
  refs,
}: {
  resource: Resource;
  row: Row | null;
  refs: Record<string, RefOption[]>;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const id = row ? String(row.id) : null;

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setError(null);

    startTransition(async () => {
      const result = await saveRow(resource.key, id, form);
      if (result.ok) router.push(`/admin/${resource.key}`);
      else setError(result.error);
    });
  }

  function onDelete() {
    if (!id) return;
    startTransition(async () => {
      const result = await deleteRow(resource.key, id);
      if (!result.ok) setError(result.error);
    });
  }

  return (
    <form onSubmit={onSubmit} className="max-w-[42rem]">
      {error && (
        <p
          role="alert"
          className="mb-6 border-l-2 border-foxred bg-ledger-bright px-4 py-3 text-small font-medium text-foxred"
        >
          {error}
        </p>
      )}

      {resource.fields.filter((f) => !f.hidden).map((field) => (
        <div key={field.name} className="mb-6">
          <label
            htmlFor={`f-${field.name}`}
            className="eyebrow block text-canvas-deep"
          >
            {field.label}
            {field.required && <span className="ml-1.5 text-foxred">*</span>}
          </label>
          {field.help && (
            <p className="mt-1 text-small text-canvas-deep">{field.help}</p>
          )}
          <Control field={field} row={row} refs={refs} />
        </div>
      ))}

      <div className="hairline flex flex-wrap items-center gap-4 pt-6">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "Saving…" : row ? "Save changes" : `Add ${resource.singular}`}
        </Button>

        <Link
          href={`/admin/${resource.key}`}
          className="eyebrow text-canvas-deep transition-colors duration-200 hover:text-spruce"
        >
          Cancel
        </Link>

        {id && (
          <span className="ml-auto flex items-center gap-3">
            {confirmingDelete ? (
              <>
                <span className="text-small text-foxred">
                  Delete this {resource.singular} for good?
                </span>
                <button
                  type="button"
                  onClick={onDelete}
                  disabled={pending}
                  className="eyebrow border-b-2 border-foxred pb-0.5 text-foxred disabled:opacity-50"
                >
                  Yes, delete
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmingDelete(false)}
                  className="eyebrow text-canvas-deep hover:text-spruce"
                >
                  Keep
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmingDelete(true)}
                className="eyebrow text-canvas-deep transition-colors duration-200 hover:text-foxred"
              >
                Delete
              </button>
            )}
          </span>
        )}
      </div>
    </form>
  );
}
