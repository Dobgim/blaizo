"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";

/**
 * The shortlist — this site's version of a cart.
 *
 * It deliberately does not check out. Nothing here is bought: a visitor marks
 * the puppies and dogs they are interested in, and the list is handed to
 * WhatsApp as the opening of a conversation. A kennel that lets you buy a
 * living animal with a card is the exact thing our audience is trying to
 * avoid, and the whole site is built to read as the opposite of that.
 *
 * State lives in localStorage so a list survives a reload and a second visit —
 * people compare breeders over days, not minutes.
 */

export type ShortlistItem = {
  /** Stable id from the database, or the placeholder id. */
  id: string;
  slug: string;
  name: string;
  kind: "puppy" | "dog";
  /** "Litter A-2025" or "Dam" — whatever the card's brass tag says. */
  tag: string;
  image: string;
  /**
   * Set on puppies, so the cart can show a price and offer to order.
   *
   * Both optional because adult dogs have neither, and because a list saved
   * before these existed is still in someone's browser — anything reading
   * them has to cope with their absence rather than assume a shape.
   */
  priceCents?: number;
  /** False once a puppy is placed. Undefined on anything not orderable. */
  orderable?: boolean;
};

type ShortlistContext = {
  items: ShortlistItem[];
  has: (id: string) => boolean;
  toggle: (item: ShortlistItem) => void;
  remove: (id: string) => void;
  clear: () => void;
  /** Drawer visibility, kept here so any card can open it. */
  isOpen: boolean;
  open: () => void;
  close: () => void;
  /** False until the stored list has been read, to avoid a hydration mismatch. */
  ready: boolean;
};

const STORAGE_KEY = "goldenpup:shortlist";

const Context = createContext<ShortlistContext | null>(null);

export function ShortlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ShortlistItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [ready, setReady] = useState(false);

  // Read once on mount. Server render is always an empty list, so nothing
  // renders differently until this has run.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed)) setItems(parsed as ShortlistItem[]);
      }
    } catch {
      /* Corrupt or unavailable storage starts an empty list rather than
         taking the page down. */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* Private browsing. The list still works for this session. */
    }
  }, [items, ready]);

  const has = useCallback(
    (id: string) => items.some((i) => i.id === id),
    [items],
  );

  const toggle = useCallback((item: ShortlistItem) => {
    setItems((current) =>
      current.some((i) => i.id === item.id)
        ? current.filter((i) => i.id !== item.id)
        : [...current, item],
    );
  }, []);

  const remove = useCallback((id: string) => {
    setItems((current) => current.filter((i) => i.id !== id));
  }, []);

  const clear = useCallback(() => setItems([]), []);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const value = useMemo(
    () => ({ items, has, toggle, remove, clear, isOpen, open, close, ready }),
    [items, has, toggle, remove, clear, isOpen, open, close, ready],
  );

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useShortlist() {
  const ctx = useContext(Context);
  if (!ctx) {
    throw new Error("useShortlist must be used inside a ShortlistProvider.");
  }
  return ctx;
}
