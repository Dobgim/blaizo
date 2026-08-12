/**
 * Structured data, emitted as a script tag.
 *
 * One component so the serialisation is done the same way everywhere, and so
 * a search for "JsonLd" finds every place the site makes a machine-readable
 * claim about itself.
 */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // Data is built from typed helpers in lib/schema.ts, never from input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
