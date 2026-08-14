import type { Metadata } from "next";
import { ProcessLayout } from "@/components/process/ProcessLayout";

export const metadata: Metadata = {
  title: "The breeding program",
  description:
    "How we choose a pairing, why we skip seasons, and how many litters a dam has in her life at Golden Pup Kennel.",
};

export default function BreedingProgramPage() {
  return (
    <ProcessLayout
      slug="breeding-program"
      title="The breeding program"
      intro="We breed two or three litters a year from a small number of dogs we own and live with. That is not modesty, it is the constraint that makes everything else on this site possible."
    >
      <h2>Choosing a pairing</h2>
      <p>
        We start from the dam and ask what she needs. A bitch with a slightly
        light bone gets a sire with more of it. A bitch who is quick and busy
        gets a dog who settles. Nobody is bred to a stud because he won
        something, and nobody is bred because the timing was convenient.
      </p>
      <p>
        Before a mating is planned, both dogs have current clearances — hips,
        elbows, eyes and a full DNA panel. If the pairing would produce a dog
        that could be affected by a genetic condition either parent carries, the
        pairing does not happen. Carrier to carrier is a mating we will not do,
        even when the odds look survivable on paper.
      </p>

      <h2>The seasons we skip</h2>
      <p>
        A dam here has a litter no more often than every other season, and no
        more than four in her life. She is spayed and retired by six, and she
        stays here afterwards. Retirement is not a transfer to somebody else.
      </p>
      <blockquote>
        Most years there is at least one litter we had planned and did not
        breed. Usually it is an eye examination we did not like the look of, or
        a bitch who did not come back into condition after her last litter.
        Skipping is the whole job.
      </blockquote>

      <h2>Whelping</h2>
      <p>
        Puppies are born in the sitting room, in a box somebody is sleeping
        beside. The first ten nights are covered by a person, not a camera. The
        vet sees the litter within forty-eight hours and again at six weeks, and
        every puppy is weighed twice a day for the first fortnight — a puppy
        that stops gaining is the earliest warning you get of anything.
      </p>

      <h2>What we will not do</h2>
      <ul>
        <li>
          Breed a bitch on consecutive seasons, or before her second birthday.
        </li>
        <li>
          Use a stud whose hip and elbow scores we have not seen ourselves.
        </li>
        <li>
          Keep a dog in a run. Every dog here lives in the house, including the
          sires.
        </li>
        <li>
          Sell a puppy to anyone we have not spoken to properly, however good
          the application reads.
        </li>
      </ul>
    </ProcessLayout>
  );
}
