"use client";

import Image from "next/image";
import Link from "next/link";
import { CloseIcon } from "@/components/icons";
import { useWishlist } from "@/components/wishlist-provider";
import { discountPercent, formatPrice } from "@/lib/format";

export default function WishlistPage() {
  const { items, count, remove, clear } = useWishlist();

  if (count === 0) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-28 text-center">
        <h1 className="text-xl tracking-[0.14em] uppercase">
          Your wishlist is empty
        </h1>
        <p className="mt-3 text-sm text-muted">
          Tap the heart on any product to save it here for later.
        </p>
        <Link
          href="/"
          className="mt-8 bg-foreground px-10 py-3.5 text-xs tracking-[0.14em] text-white uppercase"
        >
          Start shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-10 lg:px-8">
      <div className="flex items-baseline justify-between">
        <h1 className="text-xl tracking-[0.14em] uppercase">
          Wishlist ({count})
        </h1>
        <button
          type="button"
          onClick={clear}
          className="text-xs text-muted underline underline-offset-4 hover:text-foreground"
        >
          Clear all
        </button>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-9 md:grid-cols-3 xl:grid-cols-4">
        {items.map((item) => (
          <article key={item.slug} className="group relative">
            <Link href={`/p/${item.slug}`} className="block">
              <div className="relative aspect-4/5 overflow-hidden bg-neutral-100">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw"
                  className="object-cover"
                />
                {item.compareAt && (
                  <span className="absolute top-3 left-3 bg-sale px-2 py-1 text-[10px] font-medium tracking-[0.1em] text-white uppercase">
                    {discountPercent(item.price, item.compareAt)}% off
                  </span>
                )}
              </div>

              <div className="pt-3">
                <p className="text-[11px] tracking-[0.1em] text-muted uppercase">
                  {item.brand}
                </p>
                <h2 className="mt-1 truncate text-sm">{item.name}</h2>
                <div className="mt-1.5 flex items-baseline gap-2">
                  <span className="text-sm font-medium">
                    {formatPrice(item.price)}
                  </span>
                  {item.compareAt && (
                    <span className="text-xs text-muted line-through">
                      {formatPrice(item.compareAt)}
                    </span>
                  )}
                </div>
              </div>
            </Link>

            <button
              type="button"
              aria-label={`Remove ${item.name} from wishlist`}
              onClick={() => remove(item.slug)}
              className="absolute top-2.5 right-2.5 grid size-8 place-items-center rounded-full bg-white/90 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
            >
              <CloseIcon className="size-4" />
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
