# Golden Pup Kennel

Marketing and lead-generation site for a family kennel. It sells nothing. Its
job is to make an anxious visitor trust the breeder enough to send an
application.

## Stack

| | |
|---|---|
| Framework | Next.js 15, App Router, React 19, TypeScript strict |
| Styling | Tailwind CSS v4 — all tokens in `src/app/globals.css` |
| Motion | GSAP 3 + ScrollTrigger, Lenis |
| Data | Supabase (Postgres, Storage, Auth) |
| Forms | react-hook-form + zod |
| Email | Resend |
| Enquiries | WhatsApp hand-off (see below) |
| Deploy | Vercel |

## No payment is taken on this site

There is no Stripe, no checkout, and no deposit collected in the browser. When
a visitor wants a puppy, the site opens WhatsApp with the whole enquiry already
written — puppy, litter, sire, dam, and every answer from the application form
— so they send it in one tap and the breeder receives something actionable.

Everything for that lives in two places:

- `src/lib/whatsapp.ts` — builds the `wa.me` links and formats the messages
- `src/components/ui/WhatsAppLink.tsx` — the anchor, with the brand mark

Applications are still written to the `applications` table so the owner has an
inbox in `/admin`; the WhatsApp message is the notification, not the record.
The table has no `deposit_status` or `stripe_session_id` column.

**Before launch:** `siteConfig.contact.whatsappNumber` must be the kennel's real
WhatsApp Business number in full international format — digits only, no `+`,
no spaces. `wa.me` silently fails on anything else.

## Client-supplied values

Everything the client still owes is in `src/lib/site-config.ts`, marked
`PLACEHOLDER`. Nothing on the site asserts a fact that has not been supplied:

- Phone, WhatsApp number, address and town
- Year established
- `stats` — the home page count-up band does not render at all while any figure
  is `null`, so no invented statistics can ship

Photography slots are listed in [IMAGES.md](IMAGES.md) so the client knows what
to shoot. Placeholders are Unsplash source URLs.

## Design system

Do not introduce arbitrary hex values or font sizes in JSX. Everything is a
token in `globals.css`:

- **Palette** — spruce, ledger, enamel, canvas, brass, fox red
- **Type** — Young Serif (display), Instrument Sans (body), IBM Plex Mono
  (pedigree data, IDs, dates, eyebrows)
- **Signature element** — the kennel record card
  (`src/components/records/RecordCard.tsx`). It is the one place the site
  spends boldness. Everything around it stays quiet: no shadows, no radius
  above 2px, one accent per section.

All motion is wrapped in a `prefers-reduced-motion` guard, and nothing is
hidden by default — reveal styles are applied by JS, so the page is fully
readable if scripts fail.

## Deploying to Vercel

Import the repo, keep every framework default, and set the environment
variables below. `next build` is the build command and there is no custom
output directory.

| Variable | Needed for | Notes |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Production only | `https://goldenpupkennel.com`. Sets canonicals, Open Graph, the sitemap and JSON-LD. **Leave it unset on Preview** — previews then use their own deployment URL instead of claiming to be production. |
| `NEXT_PUBLIC_SUPABASE_URL` | Admin, live data | Without it the site serves the demonstration records and `/admin` shows a "not configured" screen. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Admin, live data | Safe to expose; RLS is what protects the data. |
| `RESEND_API_KEY` | Application emails | Optional. Missing means the WhatsApp hand-off still works, no email is sent. |
| `RESEND_FROM` | Application emails | Must be a verified sender domain in Resend. |
| `OWNER_NOTIFICATION_EMAIL` | Application emails | Where the owner's copy goes. |

The origin resolves in this order: `NEXT_PUBLIC_SITE_URL`, then
`VERCEL_PROJECT_PRODUCTION_URL`, then `VERCEL_URL`, then localhost — so
canonicals stay correct on previews without any extra configuration.

After the first deploy: point the domain at the project, add the deployed
origin to Supabase's allowed redirect URLs, and create the owner's account in
Supabase Auth (there is no public sign-up).

## Running it

```bash
npm install
npm run dev
```

| Script | |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run placeholders` | Fetch and downscale local placeholder imagery |
| `npm run optimise:images` | Re-compress `public/placeholders` in place |
| `npm run a11y` | axe-core over every route at 390px and 1440px |
| `npm run responsive` | Horizontal overflow and tap-target check, 320px→1024px |
| `npm run shoot` | Playwright screenshots used for design critique |

`a11y` and `responsive` both need the site running (`npm run build && npm start`)
and both exit non-zero on failure, so they can gate a deploy. The bars they
enforce are zero axe violations, zero horizontal overflow, and WCAG 2.2
Target Size (Minimum) at 24×24 CSS px — primary controls are built to 44px by
hand because it is better on a phone.
