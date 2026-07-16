import Link from "next/link";
import type { Product } from "@/lib/catalog";
import { ProductCard } from "./product-card";

export function ProductRail({
  title,
  products,
  href,
}: {
  title: string;
  products: Product[];
  href?: string;
}) {
  if (products.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1400px] px-4 py-12 lg:px-8">
      <div className="mb-6 flex items-baseline justify-between">
        <h2 className="text-lg tracking-[0.16em] uppercase">{title}</h2>
        {href && (
          <Link
            href={href}
            className="text-xs tracking-[0.14em] uppercase underline underline-offset-4"
          >
            View all
          </Link>
        )}
      </div>

      <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 lg:mx-0 lg:px-0">
        {products.map((product) => (
          <div
            key={product.slug}
            className="w-[45%] shrink-0 snap-start sm:w-[30%] lg:w-[23%]"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}
