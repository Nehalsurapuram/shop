import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/catalog";
import { discountPercent, formatPrice } from "@/lib/format";
import { HeartIcon } from "./icons";

export function ProductCard({
  product,
  priority = false,
}: {
  product: Product;
  priority?: boolean;
}) {
  return (
    <article className="group relative">
      <Link href={`/p/${product.slug}`} className="block">
        <div className="relative aspect-4/5 overflow-hidden bg-neutral-100">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            priority={priority}
            className="object-cover transition-opacity duration-300 group-hover:opacity-0"
          />
          <Image
            src={product.images[1]}
            alt=""
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          />
          {product.compareAt && (
            <span className="absolute top-3 left-3 bg-sale px-2 py-1 text-[10px] font-medium tracking-[0.1em] text-white uppercase">
              {discountPercent(product.price, product.compareAt)}% off
            </span>
          )}
        </div>

        <div className="pt-3">
          <p className="text-[11px] tracking-[0.1em] text-muted uppercase">
            {product.brand}
          </p>
          <h3 className="mt-1 truncate text-sm">{product.name}</h3>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-sm font-medium">
              {formatPrice(product.price)}
            </span>
            {product.compareAt && (
              <span className="text-xs text-muted line-through">
                {formatPrice(product.compareAt)}
              </span>
            )}
          </div>
        </div>
      </Link>

      <button
        type="button"
        aria-label={`Add ${product.name} to wishlist`}
        className="absolute top-2.5 right-2.5 grid size-8 place-items-center rounded-full bg-white/90 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
      >
        <HeartIcon className="size-4" />
      </button>
    </article>
  );
}
