import { IBM_Plex_Mono, Instrument_Sans, Young_Serif } from "next/font/google";

/**
 * Display — Young Serif.
 * Heavy wedge serifs, reads like an old field guide. Used large, sentence
 * case, and rarely. Single weight by design; if a headline needs emphasis it
 * gets more size, not more weight.
 */
export const youngSerif = Young_Serif({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-young-serif",
});

/**
 * Body — Instrument Sans.
 * Quiet and humanist. The health-testing page is long-form and gets read
 * twice; this face has to disappear.
 */
export const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-instrument-sans",
});

/**
 * Utility — IBM Plex Mono.
 * Pedigree rows, registry numbers, litter IDs, dates, eyebrow labels.
 * Institutional and form-like: the register of a record kept properly.
 */
export const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-plex-mono",
});

export const fontVariables = [
  youngSerif.variable,
  instrumentSans.variable,
  plexMono.variable,
].join(" ");
