/**
 * Database types.
 *
 * Hand-maintained to match `supabase/migrations`. Regenerate with
 * `npx supabase gen types typescript --project-id <id>` once the project
 * exists; the shape below is what that command produces, so swapping the file
 * is a straight replacement.
 */

export type DogSex = "dog" | "bitch";
export type DogRole = "sire" | "dam" | "retired" | "companion";
export type PuppyStatus = "available" | "reserved" | "placed";
export type LitterStatus =
  | "planned"
  | "expected"
  | "born"
  | "weaning"
  | "placed";
export type OrderStatus =
  | "placed"
  | "paid"
  | "preparing"
  | "completed"
  | "cancelled"
  | "refunded";
export type PaymentMethodId = "zelle" | "cashapp" | "chime" | "applepay";

export type ApplicationStatus =
  | "new"
  | "reading"
  | "contacted"
  | "matched"
  | "declined"
  | "withdrawn";

type Timestamps = { created_at: string; updated_at: string };

export type DogRow = Timestamps & {
  id: string;
  slug: string;
  name: string;
  call_name: string | null;
  sex: DogSex;
  colour: string;
  dob: string;
  role: DogRole;
  weight_lbs: number | null;
  registry_number: string | null;
  bio: string;
  hero_image: string | null;
  hero_alt: string | null;
  gallery: string[];
  is_published: boolean;
  sort_order: number;
};

export type ClearanceRow = {
  id: string;
  dog_id: string;
  type: string;
  result: string;
  tested_on: string | null;
  certificate_url: string | null;
  sort_order: number;
  created_at: string;
};

export type LitterRow = Timestamps & {
  id: string;
  code: string;
  sire_id: string | null;
  dam_id: string | null;
  expected_on: string | null;
  born_on: string | null;
  ready_on: string | null;
  status: LitterStatus;
  notes: string;
  is_published: boolean;
};

export type PuppyRow = Timestamps & {
  id: string;
  /** Null on puppies added since the Litters screen was removed. */
  litter_id: string | null;
  slug: string;
  name: string;
  sex: DogSex;
  colour: string;
  /** Typed by hand — "8 weeks old". Not computed from a date. */
  age_label: string | null;
  collar_colour: string | null;
  price_cents: number | null;
  status: PuppyStatus;
  hero_image: string | null;
  hero_alt: string | null;
  gallery: string[];
  notes: string | null;
  is_published: boolean;
  sort_order: number;
};

export type ApplicationRow = Timestamps & {
  id: string;
  name: string;
  email: string;
  phone: string;
  puppy_id: string | null;
  litter_id: string | null;
  home_type: string | null;
  has_yard: boolean | null;
  yard_fenced: boolean | null;
  other_pets: string | null;
  children_ages: string | null;
  experience: string | null;
  time_alone: string | null;
  preferred_timing: string | null;
  message: string | null;
  status: ApplicationStatus;
  handoff_opened_at: string | null;
};

export type OrderRow = Timestamps & {
  id: string;
  reference: string;
  buyer_name: string;
  buyer_email: string;
  buyer_phone: string;
  /** Null on orders taken before the checkout asked for an address. */
  buyer_location: string | null;
  puppy_id: string | null;
  /** A summary on multi-puppy orders ("Truffle + Daisy") — the admin row label. */
  puppy_name: string | null;
  /** Only set when the order is for exactly one puppy. */
  puppy_slug: string | null;
  /** The order total: the sum of its `order_items`. */
  amount_cents: number;
  payment_method: PaymentMethodId;
  status: OrderStatus;
  paid_confirmed_at: string | null;
  notes: string | null;
};

/**
 * One puppy on an order. `orders.amount_cents` is the total of these.
 *
 * The names and the price are copied rather than joined, so a renamed or
 * deleted puppy cannot change what an existing invoice says was bought.
 */
export type OrderItemRow = {
  id: string;
  order_id: string;
  puppy_id: string | null;
  puppy_name: string;
  puppy_slug: string | null;
  age_label: string | null;
  amount_cents: number;
  sort_order: number;
  created_at: string;
};

export type PostRow = Timestamps & {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  cover_image: string | null;
  cover_alt: string | null;
  author: string | null;
  published_at: string | null;
};

export type TestimonialRow = Timestamps & {
  id: string;
  author_name: string;
  location: string | null;
  quote: string;
  photo: string | null;
  photo_alt: string | null;
  dog_name: string | null;
  placed_year: number | null;
  is_featured: boolean;
  is_published: boolean;
  sort_order: number;
};

export type FaqRow = Timestamps & {
  id: string;
  category: string;
  question: string;
  answer: string;
  sort_order: number;
  is_published: boolean;
};

/** `Relationships` is required by supabase-js's result-type inference; without
 *  it every `.select()` resolves to `never`. Joins are declared explicitly in
 *  the query layer, so an empty tuple is correct here. */
type Table<Row, Insert = Partial<Row>, Update = Partial<Row>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      dogs: Table<DogRow>;
      clearances: Table<ClearanceRow>;
      litters: Table<LitterRow>;
      puppies: Table<PuppyRow>;
      applications: Table<
        ApplicationRow,
        Omit<ApplicationRow, "id" | "created_at" | "updated_at" | "status"> & {
          status?: ApplicationStatus;
        }
      >;
      orders: Table<
        OrderRow,
        /* `id` is writable on insert, unlike everywhere else. The order is
           written by anon, which has no SELECT policy, so the id cannot be
           read back — the app chooses it up front and uses it for the line
           items. See placeOrder. */
        Omit<OrderRow, "id" | "created_at" | "updated_at" | "status"> & {
          id?: string;
          status?: OrderStatus;
        }
      >;
      order_items: Table<
        OrderItemRow,
        Omit<OrderItemRow, "id" | "created_at"> & { sort_order?: number }
      >;
      posts: Table<PostRow>;
      testimonials: Table<TestimonialRow>;
      faqs: Table<FaqRow>;
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: {
      dog_sex: DogSex;
      dog_role: DogRole;
      puppy_status: PuppyStatus;
      litter_status: LitterStatus;
      application_status: ApplicationStatus;
      order_status: OrderStatus;
      payment_method: PaymentMethodId;
    };
  };
};
