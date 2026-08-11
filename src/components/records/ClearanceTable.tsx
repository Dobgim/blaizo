import { formatDate } from "@/lib/format";
import type { Clearance } from "@/lib/types";

/**
 * The clearances, as a real table.
 *
 * This is the most load-bearing content on the site — the thing an anxious
 * buyer came to read — so it gets table semantics rather than a grid of divs,
 * and the certificate link is a link, not a hover affordance.
 */
export function ClearanceTable({
  clearances,
  className,
}: {
  clearances: Clearance[];
  className?: string;
}) {
  if (clearances.length === 0) {
    return (
      <p className={["text-small text-canvas-deep", className].filter(Boolean).join(" ")}>
        Clearances for this dog are being added. Ask us and we will send the
        certificates directly.
      </p>
    );
  }

  return (
    <div className={["overflow-x-auto", className].filter(Boolean).join(" ")}>
      <table className="w-full border-collapse text-left">
        <caption className="sr-only">
          Health clearances, with the result and the date tested
        </caption>
        <thead>
          <tr className="border-b border-enamel">
            <th scope="col" className="eyebrow py-2 pr-4 text-canvas-deep">
              Test
            </th>
            <th scope="col" className="eyebrow py-2 pr-4 text-canvas-deep">
              Result
            </th>
            <th scope="col" className="eyebrow py-2 text-right text-canvas-deep">
              Tested
            </th>
          </tr>
        </thead>
        <tbody>
          {clearances.map((c) => (
            <tr key={c.type} className="border-b border-enamel">
              <th
                scope="row"
                className="py-2.5 pr-4 font-mono text-data font-normal text-canvas-deep"
              >
                {c.type}
              </th>
              <td className="py-2.5 pr-4 font-mono text-data text-spruce">
                {c.certificateUrl ? (
                  <a
                    href={c.certificateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline decoration-brass underline-offset-4 transition-colors duration-300 hover:text-foxred"
                  >
                    {c.result}
                    <span className="sr-only">
                      {" "}
                      — open the certificate in a new tab
                    </span>
                  </a>
                ) : (
                  c.result
                )}
              </td>
              <td className="py-2.5 text-right font-mono text-data text-canvas-deep">
                {formatDate(c.testedOn)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
