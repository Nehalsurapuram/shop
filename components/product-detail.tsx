"use client";

import Image from "next/image";
import { useState } from "react";
import type { Product } from "@/lib/catalog";
import { discountPercent, formatPrice } from "@/lib/format";
import { useCart } from "./cart-provider";
import { HeartIcon, StarIcon } from "./icons";

const DETAILS = [
  ["Fit & fabric", "Regular fit. 100% cotton with a soft, breathable handle."],
  ["Care", "Machine wash cold with like colours. Do not bleach. Warm iron."],
  ["Shipping & returns", "Free shipping above ₹1,499. Free returns within 30 days."],
];

export function ProductDetail({ product }: { product: Product }) {
  const [size, setSize] = useState<string | null>(
    product.sizes.length === 1 ? product.sizes[0] : null,
  );
  const [color, setColor] = useState(product.colors[0]);
  const [activeImage, setActiveImage] = useState(0);
  const [sizeError, setSizeError] = useState(false);
  const [openDetail, setOpenDetail] = useState<string | null>(DETAILS[0][0]);
  const { add } = useCart();

  function addToBag() {
    if (!size) {
      setSizeError(true);
      return;
    }
    add(product, size, color);
  }

  return (
    <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
      {/* Gallery */}
      <div className="flex flex-col-reverse gap-4 sm:flex-row">
        <div className="no-scrollbar flex gap-3 overflow-x-auto sm:w-20 sm:flex-col sm:overflow-visible">
          {product.images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setActiveImage(i)}
              aria-label={`View image ${i + 1}`}
              aria-current={i === activeImage}
              className={`relative aspect-4/5 w-16 shrink-0 overflow-hidden border bg-neutral-100 sm:w-full ${
                i === activeImage ? "border-foreground" : "border-transparent"
              }`}
            >
              <Image src={src} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>

        <div className="relative aspect-4/5 flex-1 overflow-hidden bg-neutral-100">
          <Image
            src={product.images[activeImage]}
            alt={product.name}
            fill
            priority
            sizes="(min-width: 1024px) 45vw, 100vw"
            className="object-cover"
          />
        </div>
      </div>

      {/* Info */}
      <div className="lg:max-w-md">
        <p className="text-[11px] tracking-[0.16em] text-muted uppercase">
          {product.brand}
        </p>
        <h1 className="mt-2 text-2xl">{product.name}</h1>

        <div className="mt-3 flex items-center gap-2">
          <span className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((n) => (
              <StarIcon
                key={n}
                className={`size-3.5 ${
                  n <= Math.round(product.rating)
                    ? "text-foreground"
                    : "text-neutral-300"
                }`}
              />
            ))}
          </span>
          <span className="text-xs text-muted">
            {product.rating.toFixed(1)} ({product.reviews} reviews)
          </span>
        </div>

        <div className="mt-5 flex items-baseline gap-3">
          <span className="text-xl font-medium">{formatPrice(product.price)}</span>
          {product.compareAt && (
            <>
              <span className="text-sm text-muted line-through">
                {formatPrice(product.compareAt)}
              </span>
              <span className="text-sm font-medium text-sale">
                {discountPercent(product.price, product.compareAt)}% off
              </span>
            </>
          )}
        </div>
        <p className="mt-1 text-xs text-muted">Inclusive of all taxes</p>

        <div className="mt-8">
          <p className="text-xs tracking-[0.14em] uppercase">
            Colour: <span className="text-muted">{color}</span>
          </p>
          <div className="mt-3 flex gap-2">
            {product.colors.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                aria-pressed={c === color}
                className={`border px-4 py-2 text-xs transition-colors ${
                  c === color
                    ? "border-foreground"
                    : "border-line hover:border-neutral-400"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {product.sizes[0] !== "One Size" && (
          <div className="mt-7">
            <div className="flex items-baseline justify-between">
              <p className="text-xs tracking-[0.14em] uppercase">Size</p>
              <button
                type="button"
                className="text-xs text-muted underline underline-offset-4"
              >
                Size guide
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setSize(s);
                    setSizeError(false);
                  }}
                  aria-pressed={s === size}
                  className={`min-w-12 border py-2.5 text-xs transition-colors ${
                    s === size
                      ? "border-foreground bg-foreground text-white"
                      : "border-line hover:border-neutral-400"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            {sizeError && (
              <p className="mt-2 text-xs text-sale">Please select a size.</p>
            )}
          </div>
        )}

        <div className="mt-8 flex gap-3">
          <button
            type="button"
            onClick={addToBag}
            className="flex-1 bg-foreground py-4 text-xs tracking-[0.16em] text-white uppercase transition-opacity hover:opacity-90"
          >
            Add to bag
          </button>
          <button
            type="button"
            aria-label="Add to wishlist"
            className="grid w-14 place-items-center border border-line transition-colors hover:border-foreground"
          >
            <HeartIcon className="size-5" />
          </button>
        </div>

        <p className="mt-8 text-sm leading-relaxed text-muted">
          {product.description}
        </p>

        <div className="mt-8 border-t border-line">
          {DETAILS.map(([title, body]) => (
            <div key={title} className="border-b border-line">
              <button
                type="button"
                onClick={() => setOpenDetail((d) => (d === title ? null : title))}
                aria-expanded={openDetail === title}
                className="flex w-full items-center justify-between py-4 text-xs tracking-[0.14em] uppercase"
              >
                {title}
                <span className="text-muted">
                  {openDetail === title ? "−" : "+"}
                </span>
              </button>
              {openDetail === title && (
                <p className="pb-4 text-sm leading-relaxed text-muted">{body}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
