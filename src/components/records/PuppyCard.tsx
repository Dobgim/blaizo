import { RecordCard } from "@/components/records/RecordCard";
import { formatDate } from "@/lib/format";
import type { Dog, Puppy } from "@/lib/types";

/**
 * Domain object to record card. One mapping, used by every listing, so a
 * puppy looks identical on the home strip, the grid and the archive.
 */

export function PuppyCard({
  puppy,
  onDark = false,
  sizes,
  priority = false,
}: {
  puppy: Puppy;
  onDark?: boolean;
  sizes?: string;
  priority?: boolean;
}) {
  return (
    <RecordCard
      href={`/puppies/${puppy.slug}`}
      name={puppy.name}
      tag={puppy.litterId}
      meta={`${puppy.sex === "dog" ? "Male" : "Female"} · ${puppy.colour}`}
      image={puppy.heroImage}
      imageAlt={puppy.heroAlt}
      status={puppy.status}
      onDark={onDark}
      sizes={sizes}
      priority={priority}
      saveItem={{
        id: puppy.id,
        slug: puppy.slug,
        name: puppy.name,
        kind: "puppy",
        tag: `Litter ${puppy.litterId}`,
        image: puppy.heroImage,
      }}
      rows={[
        { label: "Collar", value: puppy.collarColour },
        { label: "Sire", value: puppy.sireName },
        { label: "Dam", value: puppy.damName },
        { label: "Born", value: formatDate(puppy.bornOn) },
        { label: "Ready", value: formatDate(puppy.readyOn) },
      ]}
    />
  );
}

const ROLE_LABEL: Record<Dog["role"], string> = {
  sire: "Sire",
  dam: "Dam",
  retired: "Retired",
  companion: "Companion",
};

export function DogCard({
  dog,
  onDark = false,
  sizes,
}: {
  dog: Dog;
  onDark?: boolean;
  sizes?: string;
}) {
  /* Clearances are the reason anyone is on this page, so they are the rows.
     Four is the ceiling — a card that lists everything stops being scannable. */
  const rows = dog.clearances.slice(0, 4).map((c) => ({
    label: c.type,
    value: c.result,
  }));

  return (
    <RecordCard
      href={`/dogs/${dog.slug}`}
      name={dog.callName ?? dog.name}
      tag={ROLE_LABEL[dog.role]}
      meta={`${dog.colour} · ${formatDate(dog.dob)}`}
      image={dog.heroImage}
      imageAlt={dog.heroAlt}
      onDark={onDark}
      sizes={sizes}
      saveItem={{
        id: dog.id,
        slug: dog.slug,
        name: dog.callName ?? dog.name,
        kind: "dog",
        tag: ROLE_LABEL[dog.role],
        image: dog.heroImage,
      }}
      rows={
        rows.length > 0
          ? rows
          : [{ label: "Clearances", value: "To be added" }]
      }
    />
  );
}
