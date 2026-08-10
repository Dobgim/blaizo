import type { ReactNode } from "react";
import { whatsappUrl } from "@/lib/whatsapp";

/**
 * Hand-off to WhatsApp.
 *
 * No payment is taken on this site. Every "I want this puppy" path ends
 * here, with the message already written so the visitor sends it in one tap
 * and the breeder receives something they can act on.
 *
 * The mark is the WhatsApp logo, drawn inline in currentColor — a brand
 * glyph, not decoration, and the only icon on the site.
 */

function WhatsAppMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      fill="currentColor"
      className={className}
    >
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.87 9.87 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.15h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.11.82.83-3.04-.2-.31a8.16 8.16 0 0 1-1.25-4.38c0-4.53 3.7-8.22 8.23-8.22 2.2 0 4.26.86 5.81 2.42a8.16 8.16 0 0 1 2.41 5.81c0 4.54-3.69 8.23-8.23 8.23Zm4.52-6.16c-.25-.13-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.78.97-.15.16-.29.18-.54.06-.25-.13-1.05-.39-1.99-1.23-.74-.66-1.24-1.47-1.38-1.72-.15-.25-.02-.38.11-.51.11-.11.25-.29.37-.44.13-.15.17-.25.25-.41.09-.17.04-.31-.02-.44-.06-.12-.56-1.35-.77-1.85-.2-.48-.4-.42-.56-.43h-.47c-.16 0-.43.06-.65.31-.23.25-.86.84-.86 2.05s.88 2.38 1.01 2.54c.12.17 1.73 2.65 4.2 3.71.59.26 1.04.41 1.4.52.59.19 1.12.16 1.55.1.47-.07 1.46-.6 1.67-1.18.2-.58.2-1.07.14-1.18-.06-.1-.22-.16-.47-.29Z" />
    </svg>
  );
}

type Props = {
  /** The message the visitor will send. Build it with a helper in lib/whatsapp. */
  message: string;
  children: ReactNode;
  className?: string;
  /** Renders the WhatsApp mark before the label. */
  withMark?: boolean;
};

export function WhatsAppLink({
  message,
  children,
  className,
  withMark = true,
}: Props) {
  return (
    <a
      href={whatsappUrl(message)}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {withMark ? <WhatsAppMark className="size-[1.1em] shrink-0" /> : null}
      <span>{children}</span>
      <span className="sr-only"> (opens WhatsApp in a new tab)</span>
    </a>
  );
}
