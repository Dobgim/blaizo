"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { findResource, slugify } from "@/lib/admin/resources";
import type { Field } from "@/lib/admin/resources";

/**
 * Admin writes.
 *
 * Authorisation is not re-implemented here — RLS only grants write to the
 * `authenticated` role, and the client created below carries the signed-in
 * user's session. An unauthenticated caller reaching these actions gets a
 * database error rather than a silent success, which is the behaviour we want.
 */

type Result = { ok: true } | { ok: false; error: string };

async function client() {
  const supabase = await createClient();
  if (!supabase) throw new Error("Supabase is not configured.");
  return supabase;
}

type DbError = { message: string; code?: string };

/**
 * A writer for a table chosen at runtime.
 *
 * The payload is assembled from the resource field declarations, so its shape
 * is knowable at runtime but not to the compiler — supabase-js cannot type an
 * arbitrary object against a union of eight table types. The narrowing is
 * confined to this one type so the error handling below stays checked.
 *
 * Postgres is the real validation here: the column list, every NOT NULL, and
 * every enum are enforced by the database, and a mismatch comes back as an
 * error we surface to the owner rather than as corrupt data.
 */
type DynamicWriter = {
  update: (values: Record<string, unknown>) => {
    eq: (
      column: string,
      value: string,
    ) => PromiseLike<{ error: DbError | null }>;
  };
  insert: (
    values: Record<string, unknown>,
  ) => PromiseLike<{ error: DbError | null }>;
};

async function writer(table: string): Promise<DynamicWriter> {
  const supabase = await client();
  return supabase.from(table as never) as unknown as DynamicWriter;
}

/** Turns one FormData entry into the value its column expects. */
function coerce(field: Field, form: FormData): unknown {
  const raw = form.get(field.name);

  switch (field.type) {
    case "boolean":
      // An unchecked checkbox sends nothing at all.
      return raw === "on" || raw === "true";

    /* `money` arrives already converted to whole cents by MoneyField, so it is
       an integer column value like any other number — the dollars the owner
       typed never reach the server. */
    case "number":
    case "money": {
      const s = typeof raw === "string" ? raw.trim() : "";
      if (s === "") return null;
      const n = Number(s);
      return Number.isFinite(n) ? Math.round(n) : null;
    }

    case "date": {
      const s = typeof raw === "string" ? raw.trim() : "";
      return s === "" ? null : s;
    }

    case "gallery": {
      // One URL per line in the textarea.
      const s = typeof raw === "string" ? raw : "";
      return s
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);
    }

    case "reference": {
      const s = typeof raw === "string" ? raw.trim() : "";
      return s === "" ? null : s;
    }

    default: {
      const s = typeof raw === "string" ? raw.trim() : "";
      return s === "" ? null : s;
    }
  }
}

export async function saveRow(
  resourceKey: string,
  id: string | null,
  form: FormData,
): Promise<Result> {
  const resource = findResource(resourceKey);
  if (!resource) return { ok: false, error: "Unknown section." };

  const payload: Record<string, unknown> = {};

  for (const field of resource.fields) {
    let value = coerce(field, form);

    // Slugs fill themselves in from whatever they are derived from.
    if (field.slugFrom && (value === null || value === "")) {
      const source = form.get(field.slugFrom);
      if (typeof source === "string" && source.trim() !== "") {
        value = slugify(source);
      }
    }

    if (field.required && (value === null || value === "")) {
      return { ok: false, error: `${field.label} cannot be empty.` };
    }

    // Columns declared NOT NULL DEFAULT '' must not receive null.
    if (
      value === null &&
      (field.type === "textarea" || field.type === "text") &&
      ["bio", "notes", "excerpt", "body"].includes(field.name)
    ) {
      value = "";
    }

    payload[field.name] = value;
  }

  const db = await writer(resource.table);

  const { error } = id
    ? await db.update(payload).eq("id", id)
    : await db.insert(payload);

  if (error) {
    // Unique violations are the common case and deserve a real sentence.
    if (error.code === "23505" || error.message.includes("duplicate key")) {
      return {
        ok: false,
        error:
          "Something with that web address or code already exists. Give this one a different one.",
      };
    }
    return { ok: false, error: error.message };
  }

  revalidatePath(`/admin/${resource.key}`);
  revalidatePath("/admin");
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deleteRow(
  resourceKey: string,
  id: string,
): Promise<Result> {
  const resource = findResource(resourceKey);
  if (!resource) return { ok: false, error: "Unknown section." };

  const supabase = await client();
  const { error } = await supabase.from(resource.table).delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/admin/${resource.key}`);
  revalidatePath("/", "layout");
  redirect(`/admin/${resource.key}`);
}

/**
 * The Sunday-evening action: flip one puppy's status without opening a form.
 */
export async function setPuppyStatus(
  id: string,
  status: "available" | "reserved" | "placed",
): Promise<Result> {
  const supabase = await client();
  const { error } = await supabase
    .from("puppies")
    .update({ status })
    .eq("id", id);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin");
  revalidatePath("/admin/puppies");
  revalidatePath("/", "layout");
  return { ok: true };
}

/** Move an application along without leaving the inbox. */
export async function setApplicationStatus(
  id: string,
  status: "new" | "reading" | "contacted" | "matched" | "declined" | "withdrawn",
): Promise<Result> {
  const supabase = await client();
  const { error } = await supabase
    .from("applications")
    .update({ status })
    .eq("id", id);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/applications");
  revalidatePath("/admin");
  return { ok: true };
}

/**
 * Clearances.
 *
 * These take FormData directly and are wired to native <form action={...}>,
 * so adding and removing a certificate works with JavaScript switched off.
 * They are the most load-bearing records on the site; the editor for them
 * should be the least likely thing to break.
 */
export async function addClearance(formData: FormData): Promise<void> {
  const dogId = String(formData.get("dog_id") ?? "");
  const type = String(formData.get("type") ?? "").trim();
  const result = String(formData.get("result") ?? "").trim();
  const testedOn = String(formData.get("tested_on") ?? "").trim();
  const certificateUrl = String(formData.get("certificate_url") ?? "").trim();
  const sortOrder = Number(formData.get("sort_order") ?? 0);

  if (!dogId || !type || !result) return;

  const supabase = await client();
  await supabase.from("clearances").insert({
    dog_id: dogId,
    type,
    result,
    tested_on: testedOn === "" ? null : testedOn,
    certificate_url: certificateUrl === "" ? null : certificateUrl,
    sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
  });

  revalidatePath(`/admin/dogs/${dogId}`);
  revalidatePath("/", "layout");
}

export async function deleteClearance(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  const dogId = String(formData.get("dog_id") ?? "");
  if (!id) return;

  const supabase = await client();
  await supabase.from("clearances").delete().eq("id", id);

  revalidatePath(`/admin/dogs/${dogId}`);
  revalidatePath("/", "layout");
}

/** Toggle the publish flag straight from a list row. */
export async function togglePublished(
  resourceKey: string,
  id: string,
  next: boolean,
): Promise<Result> {
  const resource = findResource(resourceKey);
  if (!resource) return { ok: false, error: "Unknown section." };

  const db = await writer(resource.table);
  const { error } = await db.update({ is_published: next }).eq("id", id);

  if (error) return { ok: false, error: error.message };

  revalidatePath(`/admin/${resource.key}`);
  revalidatePath("/", "layout");
  return { ok: true };
}
