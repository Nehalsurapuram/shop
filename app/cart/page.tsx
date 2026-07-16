"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/cart-provider";
import { MinusIcon, PlusIcon } from "@/components/icons";
import { formatPrice } from "@/lib/format";

const FREE_SHIPPING_THRESHOLD = 1499;
const SHIPPING_FEE = 99;

export default function CartPage() {
  const { lines, subtotal, setQty, remove, count } = useCart();

  if (lines.length === 0) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-28 text-center">
        <h1 className="text-xl tracking-[0.14em] uppercase">Your bag is empty</h1>
        <p className="mt-3 text-sm text-muted">
          Once you add something, it&apos;ll show up here.
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

  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-10 lg:px-8">
      <h1 className="text-xl tracking-[0.14em] uppercase">
        Shopping bag ({count})
      </h1>

      <div className="mt-8 gap-12 lg:flex">
        <ul className="flex-1 divide-y divide-line border-y border-line">
          {lines.map((line) => (
            <li key={line.id} className="flex gap-5 py-6">
              <Link
                href={`/p/${line.slug}`}
                className="relative aspect-4/5 w-24 shrink-0 overflow-hidden bg-neutral-100 sm:w-32"
              >
                <Image
                  src={line.image}
                  alt={line.name}
                  fill
                  sizes="128px"
                  className="object-cover"
                />
              </Link>

              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-[11px] tracking-[0.1em] text-muted uppercase">
                      {line.brand}
                    </p>
                    <h2 className="mt-1 truncate text-sm">
                      <Link href={`/p/${line.slug}`}>{line.name}</Link>
                    </h2>
                    <p className="mt-1 text-xs text-muted">
                      {line.color} · Size {line.size}
                    </p>
                  </div>
                  <span className="text-sm font-medium whitespace-nowrap">
                    {formatPrice(line.price * line.qty)}
                  </span>
                </div>

                <div className="mt-auto flex items-center justify-between pt-4">
                  <div className="flex items-center border border-line">
                    <button
                      type="button"
                      onClick={() => setQty(line.id, line.qty - 1)}
                      aria-label="Decrease quantity"
                      className="grid size-9 place-items-center"
                    >
                      <MinusIcon className="size-3.5" />
                    </button>
                    <span className="w-9 text-center text-sm tabular-nums">
                      {line.qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQty(line.id, line.qty + 1)}
                      aria-label="Increase quantity"
                      className="grid size-9 place-items-center"
                    >
                      <PlusIcon className="size-3.5" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(line.id)}
                    className="text-xs text-muted underline underline-offset-4 hover:text-foreground"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="mt-10 lg:mt-0 lg:w-80 lg:shrink-0">
          <div className="border border-line p-6">
            <h2 className="text-xs tracking-[0.16em] uppercase">Order summary</h2>

            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">Subtotal</dt>
                <dd>{formatPrice(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Shipping</dt>
                <dd>{shipping === 0 ? "Free" : formatPrice(shipping)}</dd>
              </div>
              <div className="flex justify-between border-t border-line pt-3 text-base font-medium">
                <dt>Total</dt>
                <dd>{formatPrice(subtotal + shipping)}</dd>
              </div>
            </dl>

            <button
              type="button"
              className="mt-6 w-full bg-foreground py-3.5 text-xs tracking-[0.14em] text-white uppercase"
            >
              Proceed to checkout
            </button>
            <p className="mt-3 text-center text-xs text-muted">
              Checkout isn&apos;t wired up in this demo.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
