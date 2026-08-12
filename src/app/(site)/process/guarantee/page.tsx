import type { Metadata } from "next";
import { ProcessLayout } from "@/components/process/ProcessLayout";

export const metadata: Metadata = {
  title: "The health guarantee",
  description:
    "The Ridgeline Retrievers health warranty in full — what is covered, for how long, what we pay, and the return-to-breeder clause that has no time limit.",
};

/**
 * The warranty in full rather than summarised. A guarantee you have only read
 * a summary of is not much use, and the summary is where the unpleasant
 * clauses usually go missing.
 *
 * PLACEHOLDER: the client must have their attorney review this text and
 * confirm the periods and amounts before launch. The structure and the plain
 * language are the design; the specifics are theirs to set.
 */
export default function GuaranteePage() {
  return (
    <ProcessLayout
      slug="guarantee"
      title="The health guarantee, in full"
      intro="This is the whole thing, not a summary. Read it before you apply rather than after, and tell us about anything in it you do not like — we would rather have that conversation now."
    >
      <h2>The first seventy-two hours</h2>
      <p>
        Take the puppy to your own vet within seventy-two hours of collection.
        If that vet finds a existing health problem that makes the puppy unfit
        to keep, you may return the puppy and we refund the purchase price in
        full, including any deposit. We ask for the vet&rsquo;s written findings
        so we can learn something from it.
      </p>

      <h2>Two years, hips and elbows</h2>
      <p>
        If the dog is diagnosed with moderate or severe hip or elbow dysplasia
        before its second birthday, confirmed by an OFA reading of x-rays we may
        ask to see, we will either replace the puppy from a future litter at no
        cost, or refund the purchase price. You choose which. In neither case do
        we ask you to return the dog — asking a family to give back a dog they
        have had for eighteen months in order to claim a warranty is a way of
        making sure the warranty is never claimed.
      </p>

      <h2>Two years, genetic conditions on the panel</h2>
      <p>
        The same terms apply to any of the inherited conditions we test both
        parents for. Because we do not breed carrier to carrier, an affected
        puppy from one of our litters should be impossible; if it happens, it is
        our failure and it is covered.
      </p>

      <h2>What is not covered</h2>
      <p>
        We are telling you this plainly rather than burying it:
      </p>
      <ul>
        <li>
          Anything caused by injury, over-exercise while the dog is still
          growing, or letting the dog get fat. Weight is the single biggest
          thing you control about your dog&rsquo;s joints.
        </li>
        <li>
          Parasites, kennel cough, and the usual small infections a puppy picks
          up after leaving here.
        </li>
        <li>
          Conditions that are not inherited — anything where the cause is
          environmental or unknown.
        </li>
        <li>
          Any claim where the dog has not had routine veterinary care,
          vaccination and worming.
        </li>
      </ul>

      <h2>The clause that matters most</h2>
      <blockquote>
        We will take the dog back at any point in its life, for any reason, at
        no cost to you. At eight weeks or at eight years. You do not have to
        explain yourself, and we will not make you feel bad about it.
      </blockquote>
      <p>
        There is no time limit on that, it is not conditional on anything, and
        it is written into the contract you sign. It exists because no Ridgeline
        dog should ever end up in a shelter, and because circumstances change in
        ways nobody plans for. If you cannot keep the dog, call us before you do
        anything else.
      </p>

      <h2>Spay and neuter</h2>
      <p>
        Puppies are placed on a limited registration and a spay/neuter
        agreement, with the timing left to your vet — for a Labrador that is
        usually somewhere between twelve and eighteen months, and doing it too
        early has its own risks. Breeding rights are a separate conversation and
        a separate contract.
      </p>
    </ProcessLayout>
  );
}
