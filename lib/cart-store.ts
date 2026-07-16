import type { Product } from "./catalog";

export type CartLine = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  price: number;
  image: string;
  size: string;
  color: string;
  qty: number;
};

const STORAGE_KEY = "cart:v1";

/** Stable empty array — returned during SSR and hydration so the snapshot is referentially stable. */
const EMPTY: CartLine[] = [];

let lines: CartLine[] = EMPTY;
const listeners = new Set<() => void>();

function isCartLine(value: unknown): value is CartLine {
  if (typeof value !== "object" || value === null) return false;
  const line = value as Record<string, unknown>;
  return (
    typeof line.id === "string" &&
    typeof line.slug === "string" &&
    typeof line.price === "number" &&
    typeof line.qty === "number" &&
    line.qty > 0
  );
}

// Runs once when this module is first evaluated in the browser. React hydrates using
// getServerSnapshot(), then re-reads getSnapshot(), so restoring here can't desync the markup.
if (typeof window !== "undefined") {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = saved ? JSON.parse(saved) : null;
    if (Array.isArray(parsed)) lines = parsed.filter(isCartLine);
  } catch {
    // Unavailable or corrupt storage — fall back to an empty cart.
  }
}

function commit(next: CartLine[]) {
  lines = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage full or blocked (e.g. private mode) — keep the in-memory cart working.
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
  return lines;
}

export function getServerSnapshot() {
  return EMPTY;
}

export function addLine(
  product: Product,
  size: string,
  color: string,
  qty = 1,
) {
  const id = `${product.slug}:${size}:${color}`;
  const existing = lines.find((l) => l.id === id);

  commit(
    existing
      ? lines.map((l) => (l.id === id ? { ...l, qty: l.qty + qty } : l))
      : [
          ...lines,
          {
            id,
            slug: product.slug,
            name: product.name,
            brand: product.brand,
            price: product.price,
            image: product.images[0],
            size,
            color,
            qty,
          },
        ],
  );
}

export function removeLine(id: string) {
  commit(lines.filter((l) => l.id !== id));
}

export function setLineQty(id: string, qty: number) {
  commit(
    qty <= 0
      ? lines.filter((l) => l.id !== id)
      : lines.map((l) => (l.id === id ? { ...l, qty } : l)),
  );
}

export function clearCart() {
  commit([]);
}
