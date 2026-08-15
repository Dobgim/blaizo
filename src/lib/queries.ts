import { images } from "@/lib/images";
import { createStaticClient } from "@/lib/supabase/static";
import type {
  ClearanceRow,
  DogRow,
  FaqRow,
  LitterRow,
  PostRow,
  PuppyRow,
  TestimonialRow,
} from "@/lib/supabase/database.types";
import type { Clearance, Dog, Litter, Puppy, Testimonial } from "@/lib/types";

/**
 * The read layer.
 *
 * Every function returns the domain shapes in `lib/types.ts`, so components
 * never see a snake_case row. Every function also tolerates Supabase being
 * absent or a query failing: it returns an empty result and the page shows its
 * empty state, which is a designed invitation rather than a stack trace.
 */

function warn(context: string, error: { message: string }) {
  // Surfaces in Vercel logs without taking a visitor's page down with it.
  console.error(`[queries] ${context}: ${error.message}`);
}

// --- Mappers -----------------------------------------------------------------

function toClearance(row: ClearanceRow): Clearance {
  return {
    type: row.type,
    result: row.result,
    testedOn: row.tested_on,
    certificateUrl: row.certificate_url,
  };
}

function toDog(row: DogRow & { clearances?: ClearanceRow[] }): Dog {
  const fallback = row.sex === "dog" ? images["dog-sire"] : images["dog-dam-one"];
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    callName: row.call_name,
    sex: row.sex,
    colour: row.colour,
    dob: row.dob,
    role: row.role,
    weightLbs: row.weight_lbs,
    registryNumber: row.registry_number,
    bio: row.bio,
    heroImage: row.hero_image ?? fallback.src,
    heroAlt: row.hero_alt ?? fallback.alt,
    gallery: row.gallery ?? [],
    clearances: (row.clearances ?? [])
      .slice()
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(toClearance),
  };
}

type PuppyWithLitter = PuppyRow & {
  litters: (Pick<LitterRow, "code" | "born_on" | "ready_on"> & {
    sire: Pick<DogRow, "call_name" | "name"> | null;
    dam: Pick<DogRow, "call_name" | "name"> | null;
  }) | null;
};

function dogLabel(d: Pick<DogRow, "call_name" | "name"> | null | undefined) {
  return d?.call_name ?? d?.name ?? "—";
}

function toPuppy(row: PuppyWithLitter): Puppy {
  const fallback = images["default-puppy"];
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    sex: row.sex,
    colour: row.colour,
    collarColour: row.collar_colour ?? "—",
    priceCents: row.price_cents ?? 0,
    status: row.status,
    heroImage: row.hero_image ?? fallback.src,
    heroAlt: row.hero_alt ?? fallback.alt,
    gallery: row.gallery ?? [],
    notes: row.notes,
    litterId: row.litters?.code ?? "—",
    sireName: dogLabel(row.litters?.sire),
    damName: dogLabel(row.litters?.dam),
    bornOn: row.litters?.born_on ?? null,
    readyOn: row.litters?.ready_on ?? null,
  };
}

function toTestimonial(row: TestimonialRow): Testimonial {
  return {
    id: row.id,
    authorName: row.author_name,
    location: row.location ?? "",
    quote: row.quote,
    photo: row.photo,
    photoAlt: row.photo_alt,
    dogName: row.dog_name,
    placedYear: row.placed_year,
    isFeatured: row.is_featured,
  };
}

// --- Selects -----------------------------------------------------------------
// The join aliases have to match the foreign key names in 0001_schema.sql.

const PUPPY_SELECT = `
  *,
  litters!inner (
    code, born_on, ready_on,
    sire:dogs!litters_sire_id_fkey (name, call_name),
    dam:dogs!litters_dam_id_fkey (name, call_name)
  )
`;

const DOG_SELECT = `*, clearances (*)`;

// --- Puppies -----------------------------------------------------------------

export async function getPuppies(
  status?: Puppy["status"] | Puppy["status"][],
): Promise<Puppy[]> {
  const supabase = createStaticClient();
  if (!supabase) return [];

  let query = supabase
    .from("puppies")
    .select(PUPPY_SELECT)
    .order("sort_order", { ascending: true });

  if (status) {
    query = Array.isArray(status)
      ? query.in("status", status)
      : query.eq("status", status);
  }

  const { data, error } = await query;
  if (error) {
    warn("getPuppies", error);
    return [];
  }
  return (data as unknown as PuppyWithLitter[]).map(toPuppy);
}

export async function getAvailablePuppies(): Promise<Puppy[]> {
  return getPuppies(["available", "reserved"]);
}

export async function getPuppyBySlug(slug: string): Promise<Puppy | null> {
  const supabase = createStaticClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("puppies")
    .select(PUPPY_SELECT)
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    warn(`getPuppyBySlug(${slug})`, error);
    return null;
  }
  return data ? toPuppy(data as unknown as PuppyWithLitter) : null;
}

export async function getPuppySlugs(): Promise<string[]> {
  const supabase = createStaticClient();
  if (!supabase) return [];
  const { data, error } = await supabase.from("puppies").select("slug");
  if (error) {
    warn("getPuppySlugs", error);
    return [];
  }
  return data.map((r) => r.slug);
}

// --- Litters ------------------------------------------------------------------

type LitterWithParents = LitterRow & {
  sire: Pick<DogRow, "name" | "call_name"> | null;
  dam: Pick<DogRow, "name" | "call_name"> | null;
};

function toLitter(row: LitterWithParents): Litter {
  return {
    id: row.id,
    code: row.code,
    sireName: dogLabel(row.sire),
    damName: dogLabel(row.dam),
    expectedOn: row.expected_on,
    bornOn: row.born_on,
    readyOn: row.ready_on,
    status: row.status,
    notes: row.notes,
  };
}

export async function getLitters(
  status?: Litter["status"] | Litter["status"][],
): Promise<Litter[]> {
  const supabase = createStaticClient();
  if (!supabase) return [];

  let query = supabase
    .from("litters")
    .select(
      `*,
       sire:dogs!litters_sire_id_fkey (name, call_name),
       dam:dogs!litters_dam_id_fkey (name, call_name)`,
    )
    .order("expected_on", { ascending: true, nullsFirst: false });

  if (status) {
    query = Array.isArray(status)
      ? query.in("status", status)
      : query.eq("status", status);
  }

  const { data, error } = await query;
  if (error) {
    warn("getLitters", error);
    return [];
  }
  return (data as unknown as LitterWithParents[]).map(toLitter);
}

// --- Dogs --------------------------------------------------------------------

export async function getDogs(role?: Dog["role"]): Promise<Dog[]> {
  const supabase = createStaticClient();
  if (!supabase) return [];

  let query = supabase
    .from("dogs")
    .select(DOG_SELECT)
    .order("sort_order", { ascending: true });

  if (role) query = query.eq("role", role);

  const { data, error } = await query;
  if (error) {
    warn("getDogs", error);
    return [];
  }
  return (data as unknown as (DogRow & { clearances: ClearanceRow[] })[]).map(
    toDog,
  );
}

export async function getDogBySlug(slug: string): Promise<Dog | null> {
  const supabase = createStaticClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("dogs")
    .select(DOG_SELECT)
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    warn(`getDogBySlug(${slug})`, error);
    return null;
  }
  return data
    ? toDog(data as unknown as DogRow & { clearances: ClearanceRow[] })
    : null;
}

export async function getDogSlugs(): Promise<string[]> {
  const supabase = createStaticClient();
  if (!supabase) return [];
  const { data, error } = await supabase.from("dogs").select("slug");
  if (error) {
    warn("getDogSlugs", error);
    return [];
  }
  return data.map((r) => r.slug);
}

/** Puppies this dog has produced. Used on the dog detail page. */
export async function getOffspring(dogId: string): Promise<Puppy[]> {
  const supabase = createStaticClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("litters")
    .select("id")
    .or(`sire_id.eq.${dogId},dam_id.eq.${dogId}`);

  if (error || !data?.length) {
    if (error) warn("getOffspring", error);
    return [];
  }

  const { data: pups, error: pupError } = await supabase
    .from("puppies")
    .select(PUPPY_SELECT)
    .in(
      "litter_id",
      data.map((l) => l.id),
    )
    .order("sort_order", { ascending: true });

  if (pupError) {
    warn("getOffspring/puppies", pupError);
    return [];
  }
  return (pups as unknown as PuppyWithLitter[]).map(toPuppy);
}

// --- Testimonials, posts, FAQs ------------------------------------------------

export async function getTestimonials(featuredOnly = false) {
  const supabase = createStaticClient();
  if (!supabase) return [];

  let query = supabase
    .from("testimonials")
    .select("*")
    .order("sort_order", { ascending: true });
  if (featuredOnly) query = query.eq("is_featured", true);

  const { data, error } = await query;
  if (error) {
    warn("getTestimonials", error);
    return [];
  }
  return (data as TestimonialRow[]).map(toTestimonial);
}

export async function getFeaturedTestimonial(): Promise<Testimonial | null> {
  const [first] = await getTestimonials(true);
  return first ?? null;
}

export async function getPosts(limit?: number): Promise<PostRow[]> {
  const supabase = createStaticClient();
  if (!supabase) return [];

  let query = supabase
    .from("posts")
    .select("*")
    .order("published_at", { ascending: false });
  if (limit) query = query.limit(limit);

  const { data, error } = await query;
  if (error) {
    warn("getPosts", error);
    return [];
  }
  return data as PostRow[];
}

export async function getPostBySlug(slug: string): Promise<PostRow | null> {
  const supabase = createStaticClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) {
    warn(`getPostBySlug(${slug})`, error);
    return null;
  }
  return (data as PostRow | null) ?? null;
}

/** FAQs grouped by category, categories in first-appearance order. */
export async function getFaqsByCategory(): Promise<
  { category: string; items: FaqRow[] }[]
> {
  const supabase = createStaticClient();
  if (!supabase) return [];

  /* Ordered by sort_order alone, not by category name. Sorting by category
     first put them in alphabetical order, which buried "Paying for a puppy"
     at the bottom — the section this audience opens the page for. The sync
     script encodes the group's position in sort_order, and the grouping below
     preserves first-appearance order. */
  const { data, error } = await supabase
    .from("faqs")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    warn("getFaqsByCategory", error);
    return [];
  }

  const groups = new Map<string, FaqRow[]>();
  for (const row of data as FaqRow[]) {
    const bucket = groups.get(row.category);
    if (bucket) bucket.push(row);
    else groups.set(row.category, [row]);
  }
  return [...groups].map(([category, items]) => ({ category, items }));
}
