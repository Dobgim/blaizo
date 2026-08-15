import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { ApplicationForm } from "@/components/apply/ApplicationForm";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Apply for a puppy",
  description: `Apply for a ${siteConfig.breed} puppy from ${siteConfig.name}. About fifteen minutes, no charge, and it finishes as a WhatsApp message you send in one tap.`,
};

export default async function ApplyPage({
  searchParams,
}: {
  searchParams: Promise<{ puppy?: string }>;
}) {
  const { puppy } = await searchParams;

  return (
    <>
      <PageHeader
        eyebrow="Apply"
        railNote="03 steps"
        title="Apply for a puppy"
        intro="About fifteen minutes, and it costs nothing. When you finish, your answers are written into a WhatsApp message you send us in one tap. Applying is separate from ordering — it is how we get to know you before a puppy is agreed."
      />

      <section className="shell pb-24 lg:pb-32">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-7 lg:col-start-3">
            <ApplicationForm puppyName={puppy} />
          </div>

          <aside className="lg:col-span-3 lg:col-start-10">
            <h2 className="eyebrow text-canvas-deep">What happens next</h2>
            <ol className="mt-4">
              {[
                "You send the WhatsApp message. That is the whole submission — nothing to pay and nothing to sign.",
                "We read it. Every one, usually within two days.",
                "We call you. Always, before anything is agreed, including when the answer is no.",
                "If it is a yes, we agree a puppy and you order it on the site. Paid in full, never by gift card, and never to details that did not come on your receipt.",
              ].map((line, i) => (
                <li key={i} className="border-b border-enamel py-4">
                  <span className="font-mono text-data text-foxred">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="mt-1.5 text-small text-canvas-deep">{line}</p>
                </li>
              ))}
            </ol>

            <p className="mt-8 text-small text-canvas-deep">
              We say no fairly often, sometimes to people who would have been
              perfectly good owners. If that happens, ask us for two other
              breeders. We will have them.
            </p>
          </aside>
        </div>
      </section>
    </>
  );
}
