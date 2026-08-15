"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { readInvoice, type Invoice as InvoiceData } from "@/lib/invoice";
import { formatPrice } from "@/lib/format";
import { siteConfig } from "@/lib/site-config";

/**
 * The invoice, shown the moment an order goes through.
 *
 * Laid out as a document rather than as a page of the website: a centred sheet
 * with a rule under the masthead, the two parties facing each other, one line
 * item, and a total set apart from it. That is the shape every invoice a buyer
 * has ever seen takes, and the familiarity is the point — someone who has just
 * committed to four figures for a puppy from a website they found last week
 * needs the paperwork to look like paperwork.
 *
 * It reads from sessionStorage, which means it is a client component and can
 * show nothing on the server. The loading state is deliberately silent rather
 * than a spinner: the read is synchronous and takes one tick.
 */
export function Invoice({ reference }: { reference: string }) {
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [looked, setLooked] = useState(false);

  useEffect(() => {
    setInvoice(readInvoice(reference));
    setLooked(true);
  }, [reference]);

  if (!looked) return <div className="min-h-[60vh]" aria-busy="true" />;

  /* Reached by reload in a new tab, by a shared link, or with storage
     unavailable. The order is safe either way, and saying so is the only
     useful thing this page can do. */
  if (!invoice) return <InvoiceUnavailable reference={reference} />;

  const issued = new Date(invoice.issuedAt);

  return (
    <div className="mx-auto w-full max-w-[46rem]">
      <article className="invoice-sheet border border-enamel bg-ledger-bright">
        {/* --- masthead ------------------------------------------------------ */}
        <header className="flex flex-wrap items-start justify-between gap-6 border-b border-spruce px-8 py-7 sm:px-10">
          <div>
            <p className="font-display text-h3 leading-none text-spruce">
              {siteConfig.name}
            </p>
            <p className="eyebrow mt-2 text-canvas-deep">
              Est. {siteConfig.establishedYear} · {siteConfig.contact.locality},{" "}
              {siteConfig.contact.region}
            </p>
          </div>
          <p className="font-display text-h3 leading-none text-brass-text">
            Invoice
          </p>
        </header>

        {/* --- the meta grid ------------------------------------------------- */}
        <dl className="grid grid-cols-2 gap-x-8 gap-y-5 px-8 py-7 sm:grid-cols-3 sm:px-10">
          <Meta label="Invoice no." value={invoice.reference} mono />
          <Meta
            label="Issued"
            value={issued.toLocaleDateString(undefined, {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          />
          <Meta label="Status" value="Awaiting payment" />
        </dl>

        {/* --- the two parties ----------------------------------------------- */}
        <div className="grid gap-8 border-t border-enamel px-8 py-7 sm:grid-cols-2 sm:px-10">
          <section>
            <h2 className="eyebrow text-canvas-deep">Billed to</h2>
            <p className="mt-3 text-body font-medium text-spruce">
              {invoice.buyerName}
            </p>
            {/* The address as typed, line breaks preserved — an address the
                buyer wrote over three lines should not collapse onto one. */}
            <p className="mt-1 whitespace-pre-line text-small leading-relaxed text-canvas-deep">
              {invoice.buyerLocation}
            </p>
            <p className="mt-3 text-small text-canvas-deep">
              {invoice.buyerEmail}
              <br />
              {invoice.buyerPhone}
            </p>
          </section>

          <section className="sm:text-right">
            <h2 className="eyebrow text-canvas-deep">From</h2>
            <p className="mt-3 text-body font-medium text-spruce">
              {siteConfig.name}
            </p>
            <p className="mt-1 text-small leading-relaxed text-canvas-deep">
              {siteConfig.contact.addressLine}
              <br />
              {siteConfig.contact.locality}, {siteConfig.contact.region}{" "}
              {siteConfig.contact.postalCode}
            </p>
            <p className="mt-3 text-small text-canvas-deep">
              {siteConfig.contact.email}
              <br />
              {siteConfig.contact.phone}
            </p>
          </section>
        </div>

        {/* --- the line item -------------------------------------------------- */}
        <div className="border-t border-enamel px-8 py-7 sm:px-10">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-enamel">
                <th scope="col" className="eyebrow pb-3 text-canvas-deep">
                  Description
                </th>
                <th
                  scope="col"
                  className="eyebrow pb-3 text-right text-canvas-deep"
                >
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-enamel">
                <td className="py-4 pr-6 align-top">
                  <span className="block text-body font-medium text-spruce">
                    {invoice.puppyName}
                  </span>
                  <span className="mt-1 block text-small text-canvas-deep">
                    {invoice.puppyDescription}
                  </span>
                </td>
                <td className="py-4 text-right align-top font-mono text-data text-spruce">
                  {formatPrice(invoice.amountCents)}
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <th
                  scope="row"
                  className="pt-5 text-right font-display text-h3 font-normal text-spruce"
                >
                  Total due
                </th>
                {/* pl-6: at 390px the label and the figure meet with nothing
                    between them and read as one word. */}
                <td className="pt-5 pl-6 text-right font-mono text-h3 text-foxred">
                  {formatPrice(invoice.amountCents)}
                </td>
              </tr>
            </tfoot>
          </table>

          <p className="mt-5 text-small text-canvas-deep">
            Paid in full, no deposit. Chosen payment method:{" "}
            <span className="font-medium text-spruce">
              {invoice.paymentMethodLabel}
            </span>
            .
          </p>

          {invoice.notes && (
            <div className="mt-6 border-t border-enamel pt-5">
              <h2 className="eyebrow text-canvas-deep">Your note</h2>
              <p className="mt-2 whitespace-pre-line text-small text-canvas-deep">
                {invoice.notes}
              </p>
            </div>
          )}
        </div>

        {/* --- what happens next ---------------------------------------------- */}
        <footer className="border-t border-spruce bg-ledger px-8 py-7 sm:px-10">
          <h2 className="eyebrow text-canvas-deep">What happens next</h2>
          <p className="mt-3 text-body text-canvas-deep">
            Nothing has been charged and there is nothing to pay yet. We will
            call you on the number above, usually the same day, to talk it
            through and send you video of your puppy. The payment details come
            from us on that call.
          </p>
          <p className="mt-4 border-l-2 border-brass pl-4 text-small text-canvas-deep">
            We will only ever give you payment details by phone, or in a message
            once we have spoken. If anything claiming to be us sends you payment
            details out of the blue, it is not us.
          </p>
        </footer>
      </article>

      {/* Not part of the document, so outside the sheet and hidden in print. */}
      <div className="no-print mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
        <button
          type="button"
          onClick={() => window.print()}
          className="border-b border-brass pb-1 text-body text-spruce transition-colors duration-300 hover:border-foxred hover:text-foxred"
        >
          Print or save as PDF
        </button>
        <Link
          href="/puppies"
          className="border-b border-brass pb-1 text-body text-spruce transition-colors duration-300 hover:border-foxred hover:text-foxred"
        >
          Back to the puppies
        </Link>
      </div>
    </div>
  );
}

function Meta({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <dt className="eyebrow text-canvas-deep">{label}</dt>
      <dd
        className={
          mono
            ? "mt-2 font-mono text-data text-spruce"
            : "mt-2 text-body text-spruce"
        }
      >
        {value}
      </dd>
    </div>
  );
}

/**
 * Shown when the invoice cannot be found — a reload in a fresh tab, a link
 * sent to someone else, or storage turned off. It must not read as an error:
 * the order went through, and this page failing to redisplay it changes
 * nothing about that.
 */
function InvoiceUnavailable({ reference }: { reference: string }) {
  return (
    <div className="mx-auto w-full max-w-[36rem] text-center">
      <div className="border border-enamel bg-ledger-bright px-8 py-10">
        <p className="eyebrow text-canvas-deep">Order received</p>
        {reference && (
          <p className="mt-3 font-mono text-h3 text-spruce">{reference}</p>
        )}
        <p className="mt-5 text-body text-canvas-deep">
          Your order is with us and nothing has been charged. This invoice is
          only held for the tab it was created in, so it cannot be shown again
          here — but we have your order, and we will call you.
        </p>
        <p className="mt-5 text-small text-canvas-deep">
          If you need a copy, call or text{" "}
          <a
            href={siteConfig.contact.phoneHref}
            className="text-spruce underline decoration-brass underline-offset-4 hover:text-foxred"
          >
            {siteConfig.contact.phone}
          </a>{" "}
          and quote your order number.
        </p>
      </div>
    </div>
  );
}
