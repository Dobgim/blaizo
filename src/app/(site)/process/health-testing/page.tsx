import type { Metadata } from "next";
import Link from "next/link";
import { ProcessFoot } from "@/components/process/ProcessLayout";
import { Reveal } from "@/components/motion/Reveal";
import { allDogs } from "@/lib/content-source";
import { formatMonth } from "@/lib/format";
import { siteConfig } from "@/lib/site-config";
import type { Dog } from "@/lib/types";

export const metadata: Metadata = {
  title: "Health testing, explained",
  description:
    "Hips, elbows, eyes and the DNA panel in plain language: what each test is, who performs it, what a pass looks like, and what we do when a dog does not pass.",
};

/**
 * The most important page on the site.
 *
 * Structure is deliberately repetitive — four tests, each with the same four
 * questions answered in the same order — because somebody comparing breeders
 * needs to find the same fact in the same place each time. Novelty would be
 * working against the reader here.
 *
 * The results table under each test is live: it reads from the dogs' actual
 * clearance records, so it cannot drift out of date relative to the dog pages.
 */

type Test = {
  key: string;
  rail: string;
  heading: string;
  /** Matches `clearances.type` so the table below can be filtered. */
  clearanceType: string;
  body: React.ReactNode;
};

const DNA_PANELS: Record<typeof siteConfig.breedKey, string[]> = {
  labrador: [
    "EIC — exercise-induced collapse",
    "PRA-prcd — progressive retinal atrophy",
    "CNM — centronuclear myopathy",
    "DM — degenerative myelopathy",
    "HNPK — hereditary nasal parakeratosis",
  ],
  golden: [
    "PRA1 and PRA2 — progressive retinal atrophy",
    "prcd-PRA — progressive rod-cone degeneration",
    "ICT — Ichthyosis",
    "DM — degenerative myelopathy",
    "MD — muscular dystrophy",
  ],
};

const TESTS: Test[] = [
  {
    key: "hips",
    rail: "Hips",
    heading: "Hip dysplasia",
    clearanceType: "Hips",
    body: (
      <>
        <p>
          Hip dysplasia is a badly-fitting hip joint. The ball and socket do not
          sit together as they should, the joint wears, and the dog develops
          arthritis — sometimes at three, sometimes at ten. It is partly
          inherited, which is the only reason testing the parents helps.
        </p>
        <p>
          <strong>Who does it.</strong> The dog is x-rayed under sedation by a
          vet, and the plates go to the Orthopedic Foundation for Animals, where
          three independent radiologists grade them. We do not grade our own
          dogs and neither should anyone else.
        </p>
        <p>
          <strong>What a pass looks like.</strong> OFA grades Excellent, Good or
          Fair as passing, then Borderline, and then Mild, Moderate or Severe
          dysplasia. We breed from Excellent and Good. A Fair dog is not
          dysplastic and can live a completely sound life — we simply do not
          breed from one.
        </p>
        <p>
          <strong>The catch worth knowing.</strong> OFA will not issue a final
          grade before the dog is two years old, because a young joint can still
          look fine. If a breeder shows you a preliminary score on a
          fourteen-month-old dog and calls it a clearance, it is not one.
        </p>
      </>
    ),
  },
  {
    key: "elbows",
    rail: "Elbows",
    heading: "Elbow dysplasia",
    clearanceType: "Elbows",
    body: (
      <>
        <p>
          The same idea in a more complicated joint. The elbow is three bones
          meeting, and if they grow at slightly different rates the fit is
          wrong. It shows up as a front-leg limp, often after exercise, often in
          a young dog.
        </p>
        <p>
          <strong>Who does it.</strong> The same x-ray session as the hips, read
          by the same panel at the OFA.
        </p>
        <p>
          <strong>What a pass looks like.</strong> Elbows are simpler than hips:
          Normal, or Grade I, II or III dysplasia. There is no Good or Fair.
          Normal is the only result we will breed from.
        </p>
      </>
    ),
  },
  {
    key: "eyes",
    rail: "Eyes",
    heading: "The annual eye examination",
    clearanceType: "Eyes",
    body: (
      <>
        <p>
          A veterinary ophthalmologist examines the eye itself — retina, lens,
          eyelids — and looks for the inherited conditions that a DNA test
          cannot see, including cataracts that develop with age and eyelid
          defects that need surgery.
        </p>
        <p>
          <strong>Who does it.</strong> A board-certified veterinary
          ophthalmologist, and the result is registered with the OFA as a CAER
          examination.
        </p>
        <p>
          <strong>What a pass looks like.</strong> Clear, with any observations
          noted. The important part is the date: unlike hips, an eye
          examination expires. It is good for twelve months and then it is
          worthless. Every breeding dog here is examined every year, and the
          dates are in the table below so you can check them.
        </p>
      </>
    ),
  },
  {
    key: "dna",
    rail: "DNA",
    heading: "The DNA panel",
    clearanceType: "DNA",
    body: (
      <>
        <p>
          A cheek swab, read in a laboratory, returning a result for each
          inherited condition known in the breed. Each one comes back Clear,
          Carrier or Affected.
        </p>
        <p>
          <strong>What we test for in {siteConfig.breed}s:</strong>
        </p>
        <ul>
          {DNA_PANELS[siteConfig.breedKey].map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p>
          <strong>What a pass looks like — and why a carrier is fine.</strong>{" "}
          These conditions are recessive, which means a dog needs two copies of
          the gene to be affected. A carrier has one copy, will never develop
          the condition, and is a perfectly healthy dog. The danger is
          <em> only</em> breeding two carriers together, which can produce an
          affected puppy. So the rule is not &ldquo;never breed a
          carrier&rdquo; — it is &ldquo;never breed a carrier to a
          carrier&rdquo;, and it is a rule about the pairing rather than the
          dog. Any breeder who tells you a carrier is a defective animal has
          either misunderstood the genetics or is hoping you have.
        </p>
      </>
    ),
  },
];

function ResultsTable({ dogs, type }: { dogs: Dog[]; type: string }) {
  const rows = dogs
    .map((dog) => ({
      dog,
      clearance: dog.clearances.find((c) => c.type === type),
    }))
    .filter((r) => r.clearance);

  if (rows.length === 0) return null;

  return (
    <div className="mt-8 border border-enamel bg-ledger-bright p-5">
      <p className="eyebrow text-canvas-deep">Our dogs</p>
      <table className="mt-4 w-full border-collapse text-left">
        <caption className="sr-only">
          {type} results for each of our breeding dogs
        </caption>
        <tbody>
          {rows.map(({ dog, clearance }) => (
            <tr key={dog.id} className="border-t border-enamel">
              <th scope="row" className="py-2 pr-4 font-mono text-data font-normal">
                <Link
                  href={`/dogs/${dog.slug}`}
                  className="text-spruce underline decoration-brass underline-offset-4 transition-colors duration-300 hover:text-foxred"
                >
                  {(dog.callName ?? dog.name).toUpperCase()}
                </Link>
              </th>
              <td className="py-2 pr-4 font-mono text-data text-spruce">
                {clearance!.result}
              </td>
              <td className="py-2 text-right font-mono text-data text-canvas-deep">
                {formatMonth(clearance!.testedOn)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function HealthTestingPage() {
  const dogs = (await allDogs()).filter(
    (d) => d.role === "sire" || d.role === "dam",
  );

  return (
    <article>
      <header className="shell pb-14 pt-32 lg:pb-20 lg:pt-44">
        <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
          <div className="flex items-baseline gap-5 lg:col-span-2 lg:flex-col lg:items-start lg:gap-2">
            <p className="font-mono text-numeral text-foxred">02</p>
            <p className="eyebrow text-canvas-deep">Step 02 of 05</p>
          </div>

          <Reveal stagger className="lg:col-span-9 lg:col-start-3">
            <h1 className="text-display-l text-spruce">
              Every clearance, explained
            </h1>
            <p className="measure mt-6 text-body-l text-canvas-deep">
              Four tests. For each one: what it is, who performs it, what a pass
              actually looks like, and what we do when one of our dogs does not
              pass. Then the current results for every dog we breed from, with
              the dates, so you can check them against the certificates
              yourself.
            </p>
          </Reveal>
        </div>
      </header>

      {TESTS.map((test, i) => (
        <section
          key={test.key}
          aria-labelledby={`${test.key}-heading`}
          className={i % 2 === 1 ? "bg-ledger-deep py-14 lg:py-20" : "py-14 lg:py-20"}
        >
          <div className="shell grid gap-6 lg:grid-cols-12 lg:gap-8">
            {/* No counter here on purpose. The four tests are independent,
                not a sequence, so numbering them would be decoration — the
                rail label is the only true thing to say. */}
            <div className="lg:col-span-2">
              <p className="eyebrow text-brass-text">{test.rail}</p>
            </div>

            <Reveal className="lg:col-span-8 lg:col-start-3">
              <h2
                id={`${test.key}-heading`}
                className="text-h2 text-spruce"
              >
                {test.heading}
              </h2>
              <div className="longform mt-5 text-body text-spruce">
                {test.body}
              </div>
              <ResultsTable dogs={dogs} type={test.clearanceType} />
            </Reveal>
          </div>
        </section>
      ))}

      {/* --- The question nobody else answers. --- */}
      <section
        aria-labelledby="fails-heading"
        className="shell py-14 lg:py-20"
      >
        <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-2">
            <p className="eyebrow text-brass-text">If a dog fails</p>
          </div>
          <div className="longform text-body text-spruce lg:col-span-8 lg:col-start-3">
            <h2 id="fails-heading" className="text-h2">
              What happens when one of ours does not pass
            </h2>
            <p>
              They are spayed or neutered, and they stay here as a family dog.
              They are not bred from, they are not quietly sold on as breeding
              stock to somebody with lower standards, and they do not disappear
              from this website. If a dog you have seen on these pages stops
              appearing in litters, you are welcome to ask us why.
            </p>
            <p>
              It has cost us litters we wanted. That is the entire point of
              testing — a test you would ignore the result of is not a test, it
              is a receipt.
            </p>
          </div>
        </div>
      </section>

      <ProcessFoot slug="health-testing" />
    </article>
  );
}
