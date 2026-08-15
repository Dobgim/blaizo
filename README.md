# Golden Pup Kennel

Marketing and lead-generation site for a family kennel. It sells nothing. Its
job is to make an anxious visitor trust the breeder enough to order a puppy or
pick up the phone.

## Stack

| | |
|---|---|
| Framework | Next.js 15, App Router, React 19, TypeScript strict |
| Styling | Tailwind CSS v4 — all tokens in `src/app/globals.css` |
| Motion | GSAP 3 + ScrollTrigger, Lenis |
| Data | Supabase (Postgres, Storage, Auth) |
| Forms | react-hook-form + zod |
| Email | Web3Forms |
| Enquiries | WhatsApp, for questions |
| Deploy | Vercel |

## How money works, and why

The site takes **orders**. It does not take **payments**, and it cannot: the
four methods offered — Zelle, Cash App, Chime, Apple Pay — are all transfers
the buyer makes from their own app. No card number, account number or token
ever reaches this code.

The buyer orders, chooses a method, and sees *"thank you, we will get back to
you with the payment details."* The kennel is emailed, calls them, sends video
of that particular puppy, and gives the payment details on the call.

**No account handle appears anywhere in this repo, on the site, or in an
automated email — deliberately.** Payment details published on a page or sent
by an automated email are details an attacker can substitute, and that is
precisely how transfer-based sales get intercepted. Details given by a person,
on a call the buyer was told to expect, cannot be.

Two more properties worth preserving if you change this code:

- **The price is read from the database, never the form.** A price posted by
  the browser is a price the browser can change.
- **`paid` is a claim, not a fact.** Nothing here can see money arrive, so the
  status defaults to unpaid and only an admin can move it. The admin screen
  says why.

Payment is in full. There is no deposit or instalment option anywhere.

- `src/lib/actions/order.ts` — validates, records, notifies
- `src/lib/web3forms.ts` — email delivery
- `supabase/patch-04-orders.sql` — the table and its RLS

WhatsApp is for questions only (`src/lib/whatsapp.ts`). Before launch,
`siteConfig.contact.whatsappNumber` must be the real number in full
international format — digits only, no `+`, no spaces. `wa.me` fails silently
on anything else.

## Client-supplied values

Everything the client still owes is in `src/lib/site-config.ts`. Nothing on the
site asserts a fact that has not been supplied:

- `stats` — the home page count-up band does not render at all while any figure
  is `null`, so no invented statistics can ship
- The four sample placement letters on the home page carry a visible notice
  saying the families named are not real customers. **That notice comes off
  only when real letters replace them**, not before — fabricated testimonials
  are a civil-penalty matter under the FTC's 2024 rule.

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
| `NEXT_PUBLIC_SITE_URL` | Production only | Your custom domain, once you have one. Sets canonicals, Open Graph, the sitemap and JSON-LD. **Leave it unset on Preview** — previews then use their own deployment URL instead of claiming to be production. |
| `NEXT_PUBLIC_SUPABASE_URL` | Admin, live data | Without it the site serves the demonstration records and `/admin` shows a "not configured" screen. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Admin, live data | Safe to expose; RLS is what protects the data. |
| `WEB3FORMS_ACCESS_KEY` | Order and application emails | From web3forms.com, tied to the address that should receive them. Without it orders are still saved but nobody is told — the buyer sees a notice asking them to phone. Verify with `npm run test:email`. |

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
| `npm run test:email` | Sends one real test through Web3Forms and says whether it was delivered, blocked by Cloudflare, or rejected |
| `npm run sync:faqs` | Pushes `src/lib/content/faqs.ts` to the database, which is what the site reads |
| `npm run import:puppies` | Uploads `incoming-photos/` and creates dam, litter and puppies |
| `npm run photos` | Replaces the site's own placeholder imagery from `incoming-photos/` |

`a11y` and `responsive` both need the site running (`npm run build && npm start`)
and both exit non-zero on failure, so they can gate a deploy. The bars they
enforce are zero axe violations, zero horizontal overflow, and WCAG 2.2
Target Size (Minimum) at 24×24 CSS px — primary controls are built to 44px by
hand because it is better on a phone.
