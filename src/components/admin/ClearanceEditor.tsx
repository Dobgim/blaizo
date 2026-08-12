import { addClearance, deleteClearance } from "@/app/admin/actions";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/format";
import type { ClearanceRow } from "@/lib/supabase/database.types";

/**
 * Clearances for one dog.
 *
 * A server component with native form actions — no client JavaScript at all.
 * These rows are the single most important content on the website, and the
 * editor for them should be the last thing to break.
 */

const COMMON_TYPES = ["Hips", "Elbows", "Eyes", "DNA", "Heart", "Thyroid"];

const inputClasses =
  "w-full rounded-[2px] border border-enamel bg-ledger-bright px-3 py-2 text-body text-spruce";

export async function ClearanceEditor({ dogId }: { dogId: string }) {
  const supabase = await createClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from("clearances")
    .select("*")
    .eq("dog_id", dogId)
    .order("sort_order", { ascending: true });

  const clearances = (data ?? []) as ClearanceRow[];

  return (
    <section aria-labelledby="clearances-editor" className="hairline mt-16 max-w-[52rem] pt-10">
      <h2 id="clearances-editor" className="text-h3 font-body font-semibold text-spruce">
        Health clearances
      </h2>
      <p className="measure mt-2 text-small text-canvas-deep">
        Copy each result from the certificate exactly as it is written, and add
        the certificate link where you have one. These appear on the dog&rsquo;s
        page, on every puppy out of this dog, and in the results tables on the
        health testing page.
      </p>

      {clearances.length > 0 && (
        <table className="mt-7 w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-enamel">
              <th scope="col" className="eyebrow py-2 pr-4 text-canvas-deep">Test</th>
              <th scope="col" className="eyebrow py-2 pr-4 text-canvas-deep">Result</th>
              <th scope="col" className="eyebrow py-2 pr-4 text-canvas-deep">Tested</th>
              <th scope="col" className="eyebrow py-2 pr-4 text-canvas-deep">Certificate</th>
              <th scope="col" className="sr-only">Remove</th>
            </tr>
          </thead>
          <tbody>
            {clearances.map((c) => (
              <tr key={c.id} className="border-b border-enamel">
                <td className="py-2.5 pr-4 font-mono text-data text-spruce">{c.type}</td>
                <td className="py-2.5 pr-4 font-mono text-data text-spruce">{c.result}</td>
                <td className="py-2.5 pr-4 font-mono text-data text-canvas-deep">
                  {formatDate(c.tested_on)}
                </td>
                <td className="py-2.5 pr-4 font-mono text-data text-canvas-deep">
                  {c.certificate_url ? (
                    <a
                      href={c.certificate_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline decoration-brass underline-offset-4 hover:text-foxred"
                    >
                      Linked
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="py-2.5 text-right">
                  <form action={deleteClearance}>
                    <input type="hidden" name="id" value={c.id} />
                    <input type="hidden" name="dog_id" value={dogId} />
                    <button
                      type="submit"
                      className="eyebrow text-canvas-deep transition-colors duration-200 hover:text-foxred"
                    >
                      Remove
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <form action={addClearance} className="mt-8 border border-enamel p-5">
        <input type="hidden" name="dog_id" value={dogId} />
        <p className="eyebrow text-foxred">Add a clearance</p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="cl-type" className="eyebrow block text-canvas-deep">
              Test
            </label>
            <input
              id="cl-type"
              name="type"
              list="clearance-types"
              required
              className={`mt-2 ${inputClasses}`}
            />
            <datalist id="clearance-types">
              {COMMON_TYPES.map((t) => (
                <option key={t} value={t} />
              ))}
            </datalist>
          </div>

          <div>
            <label htmlFor="cl-result" className="eyebrow block text-canvas-deep">
              Result
            </label>
            <input
              id="cl-result"
              name="result"
              required
              placeholder="OFA Good"
              className={`mt-2 ${inputClasses}`}
            />
          </div>

          <div>
            <label htmlFor="cl-date" className="eyebrow block text-canvas-deep">
              Date tested
            </label>
            <input
              id="cl-date"
              name="tested_on"
              type="date"
              className={`mt-2 ${inputClasses}`}
            />
          </div>

          <div>
            <label htmlFor="cl-order" className="eyebrow block text-canvas-deep">
              Sort order
            </label>
            <input
              id="cl-order"
              name="sort_order"
              type="number"
              defaultValue={clearances.length + 1}
              className={`mt-2 ${inputClasses}`}
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="cl-cert" className="eyebrow block text-canvas-deep">
              Certificate link
            </label>
            <p className="mt-1 text-small text-canvas-deep">
              A link to the PDF. Buyers open these — it is the whole point.
            </p>
            <input
              id="cl-cert"
              name="certificate_url"
              type="url"
              className={`mt-2 ${inputClasses} font-mono text-data`}
            />
          </div>
        </div>

        <button
          type="submit"
          className="mt-6 inline-flex h-11 items-center rounded-[2px] bg-spruce px-6 text-small font-medium text-ledger transition-colors duration-200 hover:bg-foxred"
        >
          Add clearance
        </button>
      </form>
    </section>
  );
}
