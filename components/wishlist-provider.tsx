"use client";

import { createContext, useContext, useMemo, useSyncExternalStore } from "react";
import type { Product } from "@/lib/catalog";
import {
  clearWishlist,
  getServerSnapshot,
  getSnapshot,
  removeItem,
  subscribe,
  toggleItem,
  type WishlistItem,
} from "@/lib/wishlist-store";

export type { WishlistItem };

type WishlistContextValue = {
  items: WishlistItem[];
  count: number;
  has: (slug: string) => boolean;
  toggle: (product: Product) => boolean;
  remove: (slug: string) => void;
  clear: () => void;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const value = useMemo<WishlistContextValue>(
    () => ({
      items,
      count: items.length,
      has: (slug) => items.some((i) => i.slug === slug),
      toggle: toggleItem,
      remove: removeItem,
      clear: clearWishlist,
    }),
    [items],
  );

  return <WishlistContext value={value}>{children}</WishlistContext>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used inside <WishlistProvider>");
  return ctx;
}
