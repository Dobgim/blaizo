/**
 * The admin panel, declared rather than hand-built.
 *
 * Seven tables need the same four screens each. Describing the fields once and
 * generating the list and the form from that description means a new column is
 * one line here instead of edits in three files — and it keeps every screen
 * behaving identically, which matters more for the person using it every week
 * than any per-table cleverness would.
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
  // --- Dogs -----------------------------------------------------------------
  {
    key: "dogs",
    table: "dogs",
    title: "Dogs",
    singular: "dog",
    blurb:
      "The sires, dams and retired dogs. Clearances are edited on each dog's own page.",
    titleField: "call_name",
    orderBy: { column: "sort_order", ascending: true },
    fields: [
      {
        name: "call_name",
        label: "Call name",
        type: "text",
        required: true,
        inList: true,
        help: "What you actually call them. This is the name the website shows.",
      },
      {
        name: "name",
        label: "Registered name",
        type: "text",
        required: true,
        help: "The full name on the registration paperwork.",
      },
      {
        name: "slug",
        label: "Web address",
        type: "text",
        slugFrom: "call_name",
        help: "Leave blank and we will make one from the call name. Changing it breaks any link people have saved.",
      },
      {
        name: "role",
        label: "Role",
        type: "select",
        required: true,
        inList: true,
        options: [
          { value: "sire", label: "Sire" },
          { value: "dam", label: "Dam" },
          { value: "retired", label: "Retired" },
          { value: "companion", label: "Companion" },
        ],
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
      { name: "dob", label: "Date of birth", type: "date", required: true, inList: true },
      { name: "weight_lbs", label: "Weight (lb)", type: "number" },
      {
        name: "registry_number",
        label: "Registry number",
        type: "text",
        help: "Published so buyers can look the dog up on the OFA site themselves.",
      },
      {
        name: "bio",
        label: "About this dog",
        type: "textarea",
        help: "Two or three sentences. What they are like to live with beats a list of titles.",
      },
      { name: "hero_image", label: "Main photograph", type: "image" },
      {
        name: "hero_alt",
        label: "Photograph description",
        type: "text",
        help: "For people using a screen reader. Describe what is in the picture, plainly.",
      },
      { name: "gallery", label: "More photographs", type: "gallery" },
      SORT_ORDER,
      PUBLISHED,
    ],
  },

  // --- Litters --------------------------------------------------------------
  {
    key: "litters",
    table: "litters",
    title: "Litters",
    singular: "litter",
    blurb:
      "Unpublishing a litter hides its puppies too, so you can take a whole litter off the site in one move.",
    titleField: "code",
    orderBy: { column: "created_at", ascending: false },
    fields: [
      {
        name: "code",
        label: "Litter code",
        type: "text",
        required: true,
        inList: true,
        help: "Short, like A-2025. It appears on the brass tag of every puppy card.",
      },
      { name: "sire_id", label: "Sire", type: "reference", refTable: "dogs", inList: true },
      { name: "dam_id", label: "Dam", type: "reference", refTable: "dogs", inList: true },
      {
        name: "status",
        label: "Stage",
        type: "select",
        required: true,
        inList: true,
        options: [
          { value: "planned", label: "Planned" },
          { value: "expected", label: "Expected" },
          { value: "born", label: "Born" },
          { value: "weaning", label: "Weaning" },
          { value: "placed", label: "All placed" },
        ],
      },
      { name: "expected_on", label: "Expected", type: "date" },
      { name: "born_on", label: "Born", type: "date" },
      { name: "ready_on", label: "Ready to go home", type: "date" },
      { name: "notes", label: "Notes", type: "textarea" },
      PUBLISHED,
    ],
  },

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
        name: "litter_id",
        label: "Litter",
        type: "reference",
        refTable: "litters",
        required: true,
        inList: true,
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
      { name: "slug", label: "Web address", type: "text", slugFrom: "name" },
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
        name: "collar_colour",
        label: "Collar colour",
        type: "text",
        help: "How the family tells them apart before they have names.",
      },
      {
        name: "price_cents",
        label: "Price (in cents)",
        type: "number",
        help: "3200 dollars is 320000. Leave blank to show “Ask us” instead of a number.",
      },
      { name: "hero_image", label: "Main photograph", type: "image" },
      { name: "hero_alt", label: "Photograph description", type: "text" },
      { name: "gallery", label: "More photographs", type: "gallery" },
      { name: "notes", label: "Notes", type: "textarea" },
      SORT_ORDER,
      PUBLISHED,
    ],
  },

  // --- Posts ----------------------------------------------------------------
  {
    key: "posts",
    table: "posts",
    title: "Journal",
    singular: "entry",
    blurb:
      "An entry appears on the site once its published date has arrived, so you can write ahead.",
    titleField: "title",
    orderBy: { column: "published_at", ascending: false },
    fields: [
      { name: "title", label: "Title", type: "text", required: true, inList: true },
      { name: "slug", label: "Web address", type: "text", slugFrom: "title" },
      {
        name: "published_at",
        label: "Publish on",
        type: "date",
        inList: true,
        help: "Leave blank to keep it a draft. A future date publishes itself.",
      },
      {
        name: "excerpt",
        label: "Standfirst",
        type: "textarea",
        help: "One or two sentences, shown in the list and in search results.",
      },
      {
        name: "body",
        label: "The entry",
        type: "textarea",
        help: "Plain text. Leave a blank line between paragraphs.",
      },
      { name: "cover_image", label: "Cover photograph", type: "image" },
      { name: "cover_alt", label: "Photograph description", type: "text" },
      { name: "author", label: "Written by", type: "text", inList: true },
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
      { name: "photo", label: "Their photograph", type: "image" },
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

/** "Ridgeline's Second Wind" → "ridgelines-second-wind" */
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
