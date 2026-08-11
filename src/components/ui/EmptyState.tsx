import Link from "next/link";

/**
 * An empty state is an invitation, never an apology.
 *
 * "No puppies available right now — join the waiting list" beats "No results
 * found." Every use of this component has to offer the visitor a next move.
 */
export function EmptyState({
  title,
  body,
  actionLabel,
  actionHref,
}: {
  title: string;
  body: string;
  actionLabel: string;
  actionHref: string;
}) {
  return (
    <div className="hairline mt-4 grid gap-6 pt-10 lg:grid-cols-12">
      <div className="lg:col-span-7 lg:col-start-3">
        <h2 className="text-h2 text-spruce">{title}</h2>
        <p className="measure mt-4 text-body text-canvas-deep">{body}</p>
        <p className="mt-7">
          <Link
            href={actionHref}
            className="border-b border-brass pb-1 text-body-l text-spruce transition-colors duration-300 hover:border-foxred hover:text-foxred"
          >
            {actionLabel}
          </Link>
        </p>
      </div>
    </div>
  );
}
