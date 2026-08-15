import type { Metadata } from "next";
import { Invoice } from "@/components/checkout/Invoice";

export const metadata: Metadata = {
  title: "Your invoice",
  robots: { index: false, follow: false },
};

/**
 * The buyer's invoice, served by us rather than by whoever handled the email.
 *
 * Only the reference travels in the URL. Everything printed on the document —
 * name, address, phone — is handed over in sessionStorage by the checkout, so
 * none of it lands in browser history, a referrer header or a server log. See
 * `src/lib/invoice.ts` for why that beats both a query string and a database
 * read.
 *
 * The page is therefore a thin shell: it cannot render the invoice on the
 * server, and does not try to.
 */
export default async function InvoicePage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;

  return (
    <section className="shell py-16 lg:py-24">
      <Invoice reference={ref ?? ""} />
    </section>
  );
}
