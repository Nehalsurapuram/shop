"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { formatPrice } from "@/lib/format";
import { useCart } from "./cart-provider";
import { CloseIcon, MinusIcon, PlusIcon } from "./icons";

const FREE_SHIPPING_THRESHOLD = 1499;

export function CartDrawer() {
  const { lines, isOpen, closeCart, setQty, remove, subtotal, count } = useCart();

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, closeCart]);

  if (!isOpen) return null;

  const toFreeShipping = FREE_SHIPPING_THRESHOLD - subtotal;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Shopping bag">
      <div className="absolute inset-0 bg-black/40" onClick={closeCart} aria-hidden />
      <div className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-background">
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-line px-5">
          <h2 className="text-sm tracking-[0.16em] uppercase">
            Shopping bag ({count})
          </h2>
          <button type="button" onClick={closeCart} aria-label="Close bag" className="-mr-2 p-2">
            <CloseIcon className="size-5" />
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <p className="text-sm text-muted">Your bag is empty.</p>
            <button
              type="button"
              onClick={closeCart}
              className="bg-foreground px-8 py-3 text-xs tracking-[0.14em] text-white uppercase"
            >
              Continue shopping
            </button>
          </div>
        ) : (
          <>
            {toFreeShipping > 0 && (
              <p className="shrink-0 bg-neutral-50 px-5 py-3 text-center text-xs text-muted">
                Add {formatPrice(toFreeShipping)} more for free shipping
              </p>
            )}

            <ul className="flex-1 divide-y divide-line overflow-y-auto px-5">
              {lines.map((line) => (
                <li key={line.id} className="flex gap-4 py-5">
                  <Link
                    href={`/p/${line.slug}`}
                    onClick={closeCart}
                    className="relative aspect-4/5 w-20 shrink-0 overflow-hidden bg-neutral-100"
                  >
                    <Image
                      src={line.image}
                      alt={line.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </Link>

                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] tracking-[0.1em] text-muted uppercase">
                      {line.brand}
                    </p>
                    <h3 className="truncate text-sm">{line.name}</h3>
                    <p className="mt-0.5 text-xs text-muted">
                      {line.color} · Size {line.size}
                    </p>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center border border-line">
                        <button
                          type="button"
                          onClick={() => setQty(line.id, line.qty - 1)}
                          aria-label="Decrease quantity"
                          className="grid size-8 place-items-center"
                        >
                          <MinusIcon className="size-3.5" />
                        </button>
                        <span className="w-8 text-center text-sm tabular-nums">
                          {line.qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQty(line.id, line.qty + 1)}
                          aria-label="Increase quantity"
                          className="grid size-8 place-items-center"
                        >
                          <PlusIcon className="size-3.5" />
                        </button>
                      </div>
                      <span className="text-sm font-medium">
                        {formatPrice(line.price * line.qty)}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => remove(line.id)}
                      className="mt-2 text-xs text-muted underline underline-offset-4"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="shrink-0 border-t border-line px-5 py-5">
              <div className="flex items-baseline justify-between">
                <span className="text-sm">Subtotal</span>
                <span className="text-base font-medium">{formatPrice(subtotal)}</span>
              </div>
              <p className="mt-1 text-xs text-muted">
                Taxes and shipping calculated at checkout.
              </p>
              <Link
                href="/cart"
                onClick={closeCart}
                className="mt-4 block bg-foreground py-3.5 text-center text-xs tracking-[0.14em] text-white uppercase"
              >
                View bag & checkout
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
