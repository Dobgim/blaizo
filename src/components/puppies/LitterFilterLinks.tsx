import type { Puppy } from "@/lib/types";

/**
 * Which litters are represented in the grid below.
 *
 * Not a filter control — with this many puppies a filter would be theatre.
 * It is the ledger telling you what you are looking at, which is the honest
 * version of the same information.
 */
export function LitterFilterLinks({ puppies }: { puppies: Puppy[] }) {
  const counts = new Map<string, number>();
  for (const p of puppies) {
    counts.set(p.litterId, (counts.get(p.litterId) ?? 0) + 1);
  }
  if (counts.size < 2) return null;

  return (
    <dl className="hairline flex flex-wrap gap-x-10 gap-y-3 pt-5">
      {[...counts].map(([code, count]) => (
        <div key={code} className="flex items-baseline gap-2.5">
          <dt className="eyebrow text-canvas-deep">Litter {code}</dt>
          <dd className="font-mono text-data text-spruce">
            {String(count).padStart(2, "0")}
          </dd>
        </div>
      ))}
    </dl>
  );
}
