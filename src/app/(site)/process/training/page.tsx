import type { Metadata } from "next";
import { ProcessLayout } from "@/components/process/ProcessLayout";

export const metadata: Metadata = {
  title: "Early training",
  description:
    "What a Golden Pup puppy already knows at eight weeks: crate, car, stairs, noise, handling, and the beginnings of house training.",
};

export default function TrainingPage() {
  return (
    <ProcessLayout
      slug="training"
      title="What the puppy already knows"
      intro="Nobody is going to hand you a trained dog at eight weeks — anyone who says otherwise is selling something. What we can do is make sure the frightening things have already happened once, somewhere safe, before they happen at your house."
    >
      <h2>Weeks three to five</h2>
      <p>
        The floor starts changing under them: carpet, tile, gravel, a wobble
        board, a sheet of plastic. Each new surface is a small problem a puppy
        solves, and a puppy who has solved five of them approaches the sixth
        differently. This is the whole idea behind everything below.
      </p>
      <p>
        Handling starts here too. Every puppy is picked up, turned over, has its
        feet held and its ears looked in, every day, by more than one person.
        Your vet will thank us.
      </p>

      <h2>Weeks five to eight</h2>
      <ul>
        <li>
          <strong>Crate.</strong> Fed in an open crate from five weeks, then
          short shut periods. They do not arrive crate-trained, but they arrive
          without thinking a crate is a punishment.
        </li>
        <li>
          <strong>Car.</strong> Two or three short trips, ending somewhere good.
        </li>
        <li>
          <strong>Stairs.</strong> Three steps, up and down, supervised.
        </li>
        <li>
          <strong>Noise.</strong> Vacuum cleaner, dropped pans, a washing
          machine on spin, and — at a distance and only for the ones going to
          shooting homes — gunfire, always paired with dinner.
        </li>
        <li>
          <strong>People.</strong> Children, men in hats, someone with a stick,
          somebody in a wheelchair when we can arrange it.
        </li>
        <li>
          <strong>Alone.</strong> Ten minutes at a time, on their own, without
          the litter. It is the single most useful thing we do and the one most
          litters skip.
        </li>
      </ul>

      <h2>House training</h2>
      <p>
        Started, not finished. They use a litter area away from the sleeping
        area from about four weeks, which means the instinct is already there
        and you are building on it rather than starting from nothing. Expect
        three or four weeks of work at your end. Anyone who tells you their
        puppies go home house-trained is describing a puppy that will wet your
        floor on day two.
      </p>

      <h2>What we deliberately do not do</h2>
      <p>
        We do not start formal obedience. A puppy that has been drilled on sit
        and stay by somebody else arrives with a relationship already formed,
        and the first month at your house is worth more spent building that with
        you. Take them to a class in week two of owning them; you will get a
        better dog out of it than we could give you.
      </p>
    </ProcessLayout>
  );
}
