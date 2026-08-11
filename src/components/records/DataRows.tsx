/**
 * Aligned mono record rows — the same device as the record card, at page
 * scale. Tabular figures keep the values in one column however long the
 * labels are.
 */
export function DataRows({
  rows,
  className,
}: {
  rows: { label: string; value: string }[];
  className?: string;
}) {
  return (
    <dl className={["hairline", className].filter(Boolean).join(" ")}>
      {rows.map((row) => (
        <div
          key={row.label}
          className="flex items-baseline justify-between gap-6 border-b border-enamel py-2.5"
        >
          <dt className="eyebrow text-canvas">{row.label}</dt>
          <dd className="text-right font-mono text-data text-spruce">
            {row.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
