import type { Product } from "./catalog";

export type WishlistItem = {
  slug: string;
  name: string;
  brand: string;
  price: number;
  compareAt: number | null;
  image: string;
};

const STORAGE_KEY = "wishlist:v1";

/** Stable empty array — returned during SSR and hydration so the snapshot is referentially stable. */
const EMPTY: WishlistItem[] = [];

let items: WishlistItem[] = EMPTY;
const listeners = new Set<() => void>();

function isWishlistItem(value: unknown): value is WishlistItem {
  if (typeof value !== "object" || value === null) return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.slug === "string" &&
    typeof item.name === "string" &&
    typeof item.price === "number"
  );
}

// Runs once when this module is first evaluated in the browser. React hydrates using
// getServerSnapshot(), then re-reads getSnapshot(), so restoring here can't desync the markup.
if (typeof window !== "undefined") {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = saved ? JSON.parse(saved) : null;
    if (Array.isArray(parsed)) items = parsed.filter(isWishlistItem);
  } catch {
    // Unavailable or corrupt storage — fall back to an empty wishlist.
  }
}

function commit(next: WishlistItem[]) {
  items = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage full or blocked (e.g. private mode) — keep the in-memory wishlist working.
  }
  listeners.forEach((listener) => listener());
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getSnapshot() {
  return items;
}

export function getServerSnapshot() {
  return EMPTY;
}

/** Add the product if absent, remove it if already saved. Returns the new saved state. */
export function toggleItem(product: Product): boolean {
  const existing = items.some((i) => i.slug === product.slug);
  if (existing) {
    commit(items.filter((i) => i.slug !== product.slug));
    return false;
  }
  commit([
    ...items,
    {
      slug: product.slug,
      name: product.name,
      brand: product.brand,
      price: product.price,
      compareAt: product.compareAt,
      image: product.images[0],
    },
  ]);
  return true;
}

export function removeItem(slug: string) {
  commit(items.filter((i) => i.slug !== slug));
}

export function clearWishlist() {
  commit([]);
}
