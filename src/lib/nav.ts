export type NavLink = {
  label: string;
  href: string;
  /** Shown in the mobile drawer and the footer, not in the desktop bar. */
  children?: { label: string; href: string }[];
};

export const primaryNav: NavLink[] = [
  {
    label: "Puppies",
    href: "/puppies",
    children: [
      { label: "Available now", href: "/puppies" },
      { label: "Upcoming litters", href: "/puppies/upcoming" },
      { label: "Past litters", href: "/puppies/past" },
    ],
  },
  { label: "Our dogs", href: "/dogs" },
  {
    label: "Process",
    href: "/process",
    children: [
      { label: "Breeding program", href: "/process/breeding-program" },
      { label: "Health testing", href: "/process/health-testing" },
      { label: "Early training", href: "/process/training" },
      { label: "Health guarantee", href: "/process/guarantee" },
      { label: "Going home", href: "/process/going-home" },
    ],
  },
  {
    label: "About",
    href: "/about",
    children: [
      { label: "The family", href: "/about" },
      { label: "The facility", href: "/about/facility" },
      { label: "Placements", href: "/about/reviews" },
    ],
  },
  /* Journal is deliberately not in the primary nav. The route still exists and
     the footer links it, but a small kennel posting occasionally should not
     spend a top-level slot on it — a stale journal in the masthead costs more
     trust than it earns. */
  { label: "FAQs", href: "/faqs" },
  { label: "Contact", href: "/contact" },
];

export const footerNav: { heading: string; links: { label: string; href: string }[] }[] = [
  {
    heading: "Puppies",
    links: [
      { label: "Available now", href: "/puppies" },
      { label: "Upcoming litters", href: "/puppies/upcoming" },
      { label: "Past litters", href: "/puppies/past" },
      { label: "Apply for a puppy", href: "/apply" },
    ],
  },
  {
    heading: "The dogs",
    links: [
      { label: "All dogs", href: "/dogs" },
      { label: "Sires", href: "/dogs?role=sire" },
      { label: "Dams", href: "/dogs?role=dam" },
      { label: "Retired", href: "/dogs?role=retired" },
    ],
  },
  {
    heading: "How we do it",
    links: [
      { label: "Breeding program", href: "/process/breeding-program" },
      { label: "Health testing", href: "/process/health-testing" },
      { label: "Early training", href: "/process/training" },
      { label: "Health guarantee", href: "/process/guarantee" },
      { label: "Going home", href: "/process/going-home" },
    ],
  },
  {
    heading: "The kennel",
    links: [
      { label: "The family", href: "/about" },
      { label: "The facility", href: "/about/facility" },
      { label: "Placements", href: "/about/reviews" },
      { label: "Journal", href: "/journal" },
      { label: "FAQs", href: "/faqs" },
      { label: "Contact", href: "/contact" },
    ],
  },
];
