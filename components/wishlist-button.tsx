"use client";

import type { Product } from "@/lib/catalog";
import { useWishlist } from "./wishlist-provider";
import { HeartIcon } from "./icons";

/**
 * Toggles a product in the wishlist. Two visual treatments:
 *  - "card":   floating round button overlaid on a product tile
 *  - "detail": bordered square button beside "Add to bag"
 */
export function WishlistButton({
  product,
  variant,
}: {
  product: Product;
  variant: "card" | "detail";
}) {
  const { has, toggle } = useWishlist();
  const saved = has(product.slug);

  const label = saved
    ? `Remove ${product.name} from wishlist`
    : `Add ${product.name} to wishlist`;

  const className =
    variant === "card"
      ? "absolute top-2.5 right-2.5 grid size-8 place-items-center rounded-full bg-white/90 transition-opacity focus-visible:opacity-100" +
        (saved ? " opacity-100" : " opacity-0 group-hover:opacity-100")
      : "grid w-14 place-items-center border transition-colors " +
        (saved ? "border-foreground" : "border-line hover:border-foreground");

  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={saved}
      onClick={() => toggle(product)}
      className={className}
    >
      <HeartIcon
        className={
          (variant === "card" ? "size-4" : "size-5") +
          (saved ? " fill-sale text-sale" : "")
        }
      />
    </button>
  );
}
