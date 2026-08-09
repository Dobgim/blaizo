import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import { processSteps } from "@/lib/placeholder-data";

/**
 * Numbered, because this genuinely is a sequence — a puppy cannot be at
 * week six before it is whelped. Nothing else on the site gets numbers.
 */
export function ProcessInBrief() {
  return (
    <section aria-labelledby="process-heading" className="shell py-20 lg:py-28">
      <div className="grid gap-8 lg:grid-cols-12">
        <p className="eyebrow text-canvas-deep lg:col-span-2">
          Pairing to pickup
        </p>
        <div className="lg:col-span-7 lg:col-start-3">
          <h2 id="process-heading" className="text-h2 text-spruce">
            How a Ridgeline puppy gets to you
          </h2>
        </div>
      </div>

      <Reveal stagger as="ol" className="mt-12 lg:mt-16">
        {processSteps.map((step) => (
          <li key={step.n} className="border-t border-enamel">
            <Link
              href={step.href}
              className="group grid gap-3 py-8 transition-colors duration-300 lg:grid-cols-12 lg:gap-8 lg:py-10"
            >
              <span className="eyebrow text-brass lg:col-span-2">{step.n}</span>
              <h3 className="font-display text-h3 text-spruce transition-colors duration-300 group-hover:text-foxred lg:col-span-3">
                {step.title}
              </h3>
              <p className="measure text-body text-canvas-deep lg:col-span-6 lg:col-start-6">
                {step.body}
              </p>
            </Link>
          </li>
        ))}
      </Reveal>

      <p className="mt-10">
        <Link
          href="/process"
          className="border-b border-brass pb-1 text-body text-spruce transition-colors duration-300 hover:border-foxred hover:text-foxred"
        >
          The process in full
        </Link>
      </p>
    </section>
  );
}
