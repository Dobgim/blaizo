/**
 * The admin panel, declared rather than hand-built.
 *
 * Each table needs the same four screens. Describing the fields once and
 * generating the list and the form from that description means a new column is
 * one line here instead of edits in three files — and it keeps every screen
 * behaving identically, which matters more for the person using it every week
 * than any per-table cleverness would.
 *
 * Dogs, Litters and Journal used to be here and were removed at the owner's
 * request, to leave a panel with only the things they actually touch. The
 * tables and their data are untouched, and the public pages that read them
 * still work — but there is no longer any way to edit that content from here.
 * Restoring a screen means restoring its entry in this array and nothing else.
 */

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "date"
  | "boolean"
  | "select"
  | "image"
  | "gallery"
  | "money"
  | "reference";

export type Field = {
  name: string;
  label: string;
  type: FieldType;
  /** Shown under the label. Say why the field matters, not what it is. */
  help?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  /** For `reference`: the table to pick a row from. */
  refTable?: "dogs" | "litters";
  /** Show in the list table. Keep to four or fewer. */
  inList?: boolean;
  /** Generated from another field when left blank. */
  slugFrom?: string;
  /**
   * Kept out of the form, but still saved.
   *
   * For columns the database needs and the owner should never have to think
   * about — a slug being the case in point. Dropping the field from the
   * resource entirely would also drop the `slugFrom` generation that fills
   * it, and every new row would save without a web address.
   */
  hidden?: boolean;
};

/** Kept in step with `Database["public"]["Tables"]` so `supabase.from()`
 *  accepts `resource.table` without a cast. */
export type TableName =
  | "dogs"
  | "clearances"
  | "litters"
  | "puppies"
  | "applications"
  | "posts"
  | "testimonials"
  | "faqs";

export type Resource = {
  key: string;
  table: TableName;
  /** Plural, sentence case — this is a heading, not a label. */
  title: string;
  singular: string;
  /** One line under the page heading. */
  blurb: string;
  /** Column used as the row's name in lists and headings. */
  titleField: string;
  /** Default ordering for the list. */
  orderBy: { column: string; ascending: boolean };
  fields: Field[];
};

const PUBLISHED: Field = {
  name: "is_published",
  label: "Visible on the website",
  type: "boolean",
  help: "Off keeps it a draft. Nothing unpublished is readable by the public, not even by URL.",
  inList: true,
};

const SORT_ORDER: Field = {
  name: "sort_order",
  label: "Sort order",
  type: "number",
  help: "Lower numbers come first.",
};

export const resources: Resource[] = [
  // --- Puppies --------------------------------------------------------------
  {
    key: "puppies",
    table: "puppies",
    title: "Puppies",
    singular: "puppy",
    blurb:
      "Status is the thing you will change most. It is also on the dashboard, one click per puppy.",
    titleField: "name",
    orderBy: { column: "sort_order", ascending: true },
    fields: [
      { name: "name", label: "Name", type: "text", required: true, inList: true },
      {
        name: "age_label",
        label: "Age",
        type: "text",
        inList: true,
        help: 'Write it how you would say it — "8 weeks old", "3 months". It is shown on the website exactly as typed.',
      },
      {
        name: "status",
        label: "Status",
        type: "select",
        required: true,
        inList: true,
        options: [
          { value: "available", label: "Available" },
          { value: "reserved", label: "Reserved" },
          { value: "placed", label: "Placed" },
        ],
      },
      /* Hidden, not removed: it still has to be generated from the name, and
         a puppy with no web address has no page. */
      {
        name: "slug",
        label: "Web address",
        type: "text",
        slugFrom: "name",
        hidden: true,
      },
      {
        name: "sex",
        label: "Sex",
        type: "select",
        required: true,
        options: [
          { value: "dog", label: "Male" },
          { value: "bitch", label: "Female" },
        ],
      },
      { name: "colour", label: "Colour", type: "text", required: true },
      {
        name: "price_cents",
        label: "Price",
        type: "money",
        help: "Enter it in dollars. It is stored in cents so it can never drift by a rounding error.",
      },
      {
        name: "hero_image",
        label: "Main photograph",
        type: "image",
        help: "Take one on your phone or pick from your camera roll. Portrait crops best.",
      },
      { name: "hero_alt", label: "Photograph description", type: "text" },
      {
        name: "gallery",
        label: "More photographs",
        type: "gallery",
        help: "Add as many as you like. They upload as you choose them.",
      },
      { name: "notes", label: "Notes", type: "textarea" },
      SORT_ORDER,
      PUBLISHED,
    ],
  },

  // --- Testimonials ---------------------------------------------------------
  {
    key: "testimonials",
    table: "testimonials",
    title: "Placements",
    singular: "placement letter",
    blurb:
      "Only real words from real owners. Nothing here is invented, and an empty list shows a placeholder rather than a fake quote.",
    titleField: "author_name",
    orderBy: { column: "sort_order", ascending: true },
    fields: [
      { name: "author_name", label: "Owner's name", type: "text", required: true, inList: true },
      { name: "location", label: "Town and state", type: "text", inList: true },
      {
        name: "quote",
        label: "What they said",
        type: "textarea",
        required: true,
        help: "Their words, not tidied up. Around forty is the right number.",
      },
      { name: "dog_name", label: "Their dog", type: "text", inList: true },
      { name: "placed_year", label: "Year placed", type: "number" },
      {
        name: "photo",
        label: "Their photograph",
        type: "image",
      },
      { name: "photo_alt", label: "Photograph description", type: "text" },
      {
        name: "is_featured",
        label: "Show on the home page",
        type: "boolean",
        help: "The home page uses the first featured one.",
      },
      SORT_ORDER,
      PUBLISHED,
    ],
  },

  // --- FAQs -----------------------------------------------------------------
  {
    key: "faqs",
    table: "faqs",
    title: "FAQs",
    singular: "question",
    blurb:
      "Grouped by category on the site, in the order set here. These also feed the search-engine question markup.",
    titleField: "question",
    orderBy: { column: "sort_order", ascending: true },
    fields: [
      { name: "question", label: "Question", type: "text", required: true, inList: true },
      {
        name: "category",
        label: "Category",
        type: "text",
        required: true,
        inList: true,
        help: "Reuse an existing name exactly and it joins that group.",
      },
      { name: "answer", label: "Answer", type: "textarea", required: true },
      SORT_ORDER,
      PUBLISHED,
    ],
  },
];

export function findResource(key: string) {
  return resources.find((r) => r.key === key) ?? null;
}

/** "Golden Pup's Second Wind" → "golden-pups-second-wind" */
export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
