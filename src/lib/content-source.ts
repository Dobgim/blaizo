import {
  getDogBySlug,
  getDogs,
  getLitters,
  getPuppies,
  getPuppyBySlug,
} from "@/lib/queries";
import {
  placeholderDogs,
  placeholderLitters,
  placeholderPuppies,
} from "@/lib/placeholder-data";
import type { Dog, Litter, Puppy } from "@/lib/types";

/**
 * One seam between the pages and the database.
 *
 * Until the client's Supabase project exists the site runs on the labelled
 * demonstration records in `placeholder-data.ts`. The moment the environment
 * variables are set and a row is published, the real data takes over and
 * nothing in any page component changes.
 *
 * The fallback is only used when the database returns *nothing*. A configured
 * project with zero published puppies is a real answer, and the page shows its
 * empty state rather than quietly resurrecting demo dogs.
 */

export const usingPlaceholderData = async () => {
  const [dogs, puppies] = await Promise.all([getDogs(), getPuppies()]);
  return dogs.length === 0 && puppies.length === 0;
};

export async function allPuppies(): Promise<Puppy[]> {
  const rows = await getPuppies();
  if (rows.length > 0) return rows;
  return (await usingPlaceholderData()) ? placeholderPuppies : [];
}

export async function puppiesByStatus(
  status: Puppy["status"] | Puppy["status"][],
): Promise<Puppy[]> {
  const wanted = Array.isArray(status) ? status : [status];
  const rows = await allPuppies();
  return rows.filter((p) => wanted.includes(p.status));
}

export async function puppyBySlug(slug: string): Promise<Puppy | null> {
  const row = await getPuppyBySlug(slug);
  if (row) return row;
  return (await usingPlaceholderData())
    ? (placeholderPuppies.find((p) => p.slug === slug) ?? null)
    : null;
}

export async function allDogs(role?: Dog["role"]): Promise<Dog[]> {
  const rows = await getDogs(role);
  if (rows.length > 0) return rows;
  if (!(await usingPlaceholderData())) return [];
  return role
    ? placeholderDogs.filter((d) => d.role === role)
    : placeholderDogs;
}

export async function dogBySlug(slug: string): Promise<Dog | null> {
  const row = await getDogBySlug(slug);
  if (row) return row;
  return (await usingPlaceholderData())
    ? (placeholderDogs.find((d) => d.slug === slug) ?? null)
    : null;
}

export async function allLitters(
  status?: Litter["status"] | Litter["status"][],
): Promise<Litter[]> {
  const rows = await getLitters(status);
  if (rows.length > 0) return rows;
  if (!(await usingPlaceholderData())) return [];
  if (!status) return placeholderLitters;
  const wanted = Array.isArray(status) ? status : [status];
  return placeholderLitters.filter((l) => wanted.includes(l.status));
}

/** Sire and dam for a puppy, matched by call name off the litter. */
export async function parentsOf(puppy: Puppy): Promise<{
  sire: Dog | null;
  dam: Dog | null;
}> {
  const dogs = await allDogs();
  const byLabel = (label: string) =>
    dogs.find((d) => (d.callName ?? d.name) === label) ?? null;
  return { sire: byLabel(puppy.sireName), dam: byLabel(puppy.damName) };
}
