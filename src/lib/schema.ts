import { siteConfig } from "@/lib/site-config";

/**
 * JSON-LD.
 *
 * Only facts the site actually asserts elsewhere. No aggregateRating and no
 * review count — inventing those is both a Google violation and precisely the
 * dishonesty this site is built to be trusted against. They can be added the
 * day real testimonials exist.
 */

const { contact } = siteConfig;

export function localBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${siteConfig.url}/#kennel`,
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    telephone: contact.phone,
    email: contact.email,
    foundingDate: String(siteConfig.establishedYear),
    priceRange: "$$$",
    address: {
      "@type": "PostalAddress",
      streetAddress: contact.addressLine,
      addressLocality: contact.locality,
      addressRegion: contact.region,
      postalCode: contact.postalCode,
      addressCountry: contact.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: contact.lat,
      longitude: contact.lng,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
        ],
        opens: "08:00",
        closes: "18:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Saturday"],
        opens: "09:00",
        closes: "14:00",
      },
    ],
    image: `${siteConfig.url}/opengraph-image`,
    knowsAbout: [
      `${siteConfig.breed} breeding`,
      "OFA hip and elbow certification",
      "Canine health testing",
    ],
  };
}

/** Emitted on a dog page. A Dog is a real schema.org type. */
export function dogSchema(dog: {
  slug: string;
  name: string;
  callName: string | null;
  colour: string;
  dob: string;
  heroImage: string;
  bio: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Dog",
    name: dog.callName ?? dog.name,
    alternateName: dog.name,
    description: dog.bio,
    birthDate: dog.dob,
    color: dog.colour,
    animal: siteConfig.breed,
    image: dog.heroImage.startsWith("http")
      ? dog.heroImage
      : `${siteConfig.url}${dog.heroImage}`,
    url: `${siteConfig.url}/dogs/${dog.slug}`,
    owner: { "@type": "Organization", name: siteConfig.name },
  };
}

/** Breadcrumbs, so search results show the section rather than a bare URL. */
export function breadcrumbSchema(trail: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.name,
      item: `${siteConfig.url}${crumb.path}`,
    })),
  };
}
