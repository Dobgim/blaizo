import type { Metadata } from "next";
import { ProcessLayout } from "@/components/process/ProcessLayout";

export const metadata: Metadata = {
  title: "Going home",
  description:
    "Collection, delivery within four hours, or a flight nanny in the cabin — plus everything in the folder that travels with every Golden Pup puppy.",
};

export default function GoingHomePage() {
  return (
    <ProcessLayout
      slug="going-home"
      title="Going home"
      intro="Eight weeks, and not a day earlier. The fortnight between six and eight is where a puppy learns to be a dog from its mother and its littermates, and shortening it costs the dog something it does not get back."
    >
      <h2>Three ways to get the puppy</h2>
      <h3>You collect</h3>
      <p>
        Most people do, and we would rather you did. Come in the morning, stay
        an hour or two, meet the dam again, ask the questions you have thought
        of since your application. It is also the last chance for us to show you
        things in person that are hard to explain over a phone.
      </p>

      <h3>We deliver</h3>
      <p>
        Within about four hours&rsquo; drive we will bring the puppy to you
        ourselves, for the cost of the fuel and the day. It has the advantage
        that we get to see where the dog is going to live, which we like.
      </p>

      <h3>Flight nanny</h3>
      <p>
        Further afield, we book a courier who carries the puppy in the cabin as
        their own carry-on and hands it to you at the airport. It costs more
        than the alternatives and it is worth every dollar. Golden Pup puppies do
        not travel as cargo, in any weather, for any price.
      </p>

      <h2>What comes with the puppy</h2>
      <ul>
        <li>Registration paperwork and the limited registration application</li>
        <li>Vaccination and worming record, signed by our vet</li>
        <li>Both parents&rsquo; clearance certificates, printed</li>
        <li>The microchip number and the transfer form, already filled in</li>
        <li>The signed health guarantee</li>
        <li>Four weeks of insurance, active from the day you collect</li>
        <li>A bag of the food they are already eating, so you can change it slowly</li>
        <li>A blanket that smells like the litter, which is worth more than all of the above on the first night</li>
      </ul>

      <h2>The first night</h2>
      <p>
        It will be worse than you expect and better than you fear. Put the crate
        beside your bed rather than in another room — a puppy that has never
        slept alone is not being manipulative, it is eight weeks old and
        everyone it has ever met has just vanished. Move the crate away over the
        following fortnight, a little at a time.
      </p>

      <h2>And afterwards</h2>
      <p>
        Send us photographs. We are genuinely not being polite: we keep a record
        of every dog we have bred, and knowing how they turned out at four and
        at nine is how we decide which pairings to repeat. It is the most useful
        thing an owner can give us back.
      </p>
    </ProcessLayout>
  );
}
