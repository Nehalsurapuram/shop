"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { useState } from "react";
import { useCart } from "@/components/cart-provider";
import { formatPrice } from "@/lib/format";
import { shippingFor } from "@/lib/pricing";
import { SITE } from "@/lib/site";

type RazorpayResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill: { name: string; email: string; contact: string };
  theme: { color: string };
  modal: { ondismiss: () => void };
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => { open: () => void };
  }
}

const FIELDS = [
  { name: "name", label: "Full name", autoComplete: "name", span: 2 },
  { name: "phone", label: "Phone (10 digits)", autoComplete: "tel", span: 2 },
  { name: "line1", label: "Address", autoComplete: "address-line1", span: 2 },
  { name: "line2", label: "Apartment, landmark (optional)", autoComplete: "address-line2", span: 2 },
  { name: "city", label: "City", autoComplete: "address-level2", span: 1 },
  { name: "state", label: "State", autoComplete: "address-level1", span: 1 },
  { name: "pincode", label: "PIN code", autoComplete: "postal-code", span: 1 },
] as const;

export function CheckoutForm({
  user,
}: {
  user: { name: string; email: string };
}) {
  const router = useRouter();
  const { lines, subtotal, clear } = useCart();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const shipping = shippingFor(subtotal);
  const total = subtotal + shipping;

  if (lines.length === 0) {
    return (
      <p className="py-20 text-center text-sm text-muted">
        Your bag is empty — nothing to check out.
      </p>
    );
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!window.Razorpay) {
      setError("The payment window is still loading. Give it a second and try again.");
      return;
    }

    setBusy(true);
    const form = new FormData(event.currentTarget);
    const address = Object.fromEntries(FIELDS.map((f) => [f.name, form.get(f.name)]));

    try {
      // Only identity + quantity go up. The server re-reads every price from the
      // catalog, so whatever localStorage claims a product costs is ignored.
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address,
          lines: lines.map((l) => ({
            slug: l.slug,
            size: l.size,
            color: l.color,
            qty: l.qty,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "We couldn't start the payment.");
        setBusy(false);
        return;
      }

      const razorpay = new window.Razorpay({
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: SITE.name,
        description: `Order of ${lines.length} item${lines.length > 1 ? "s" : ""}`,
        order_id: data.razorpayOrderId,
        prefill: {
          name: String(address.name ?? ""),
          email: user.email,
          contact: String(address.phone ?? ""),
        },
        theme: { color: "#111111" },
        modal: {
          // Closing the widget leaves the order 'pending' on purpose — it's a
          // real record of an abandoned attempt, not an error.
          ondismiss: () => {
            setBusy(false);
            setError("Payment cancelled. Your bag is still here when you're ready.");
          },
        },
        handler: async (response) => {
          try {
            const verify = await fetch("/api/checkout/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response),
            });
            const result = await verify.json();

            if (!verify.ok) {
              setError(result.error ?? "We couldn't confirm your payment.");
              setBusy(false);
              return;
            }

            clear();
            router.push(`/order/${result.orderId}`);
          } catch {
            // The money may well have left — never imply the order failed here.
            setError(
              "Your payment went through but we couldn't confirm it. Check your orders before paying again.",
            );
            setBusy(false);
          }
        },
      });

      razorpay.open();
    } catch {
      setError("Something went wrong reaching the server. Please try again.");
      setBusy(false);
    }
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />

      <form onSubmit={onSubmit} className="flex flex-col gap-10 lg:flex-row lg:gap-16">
        <div className="flex-1">
          <h2 className="text-xs tracking-[0.16em] uppercase">Delivery address</h2>

          <div className="mt-6 grid grid-cols-2 gap-4">
            {FIELDS.map((field) => (
              <label
                key={field.name}
                className={field.span === 2 ? "col-span-2" : "col-span-2 sm:col-span-1"}
              >
                <span className="text-[10px] tracking-[0.14em] text-muted uppercase">
                  {field.label}
                </span>
                <input
                  name={field.name}
                  autoComplete={field.autoComplete}
                  required={field.name !== "line2"}
                  defaultValue={field.name === "name" ? user.name : ""}
                  className="mt-1.5 w-full border border-line bg-transparent px-3 py-2.5 text-sm focus:border-foreground focus:outline-none"
                />
              </label>
            ))}
          </div>
        </div>

        <aside className="lg:w-80 lg:shrink-0">
          <div className="border border-line p-6">
            <h2 className="text-xs tracking-[0.16em] uppercase">Your order</h2>

            <ul className="mt-5 space-y-4">
              {lines.map((line) => (
                <li key={line.id} className="flex gap-3">
                  <div className="relative aspect-4/5 w-12 shrink-0 bg-neutral-100">
                    <Image
                      src={line.image}
                      alt=""
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1 text-xs">
                    <p className="truncate">{line.name}</p>
                    <p className="mt-0.5 text-muted">
                      {line.size} · {line.color} · Qty {line.qty}
                    </p>
                  </div>
                  <span className="text-xs">{formatPrice(line.price * line.qty)}</span>
                </li>
              ))}
            </ul>

            <dl className="mt-5 space-y-3 border-t border-line pt-5 text-sm">
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
                <dd>{formatPrice(total)}</dd>
              </div>
            </dl>

            {error && (
              <p role="alert" className="mt-5 border border-sale/40 bg-sale/5 p-3 text-xs text-sale">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="mt-6 w-full bg-foreground py-3.5 text-xs tracking-[0.14em] text-white uppercase disabled:opacity-50"
            >
              {busy ? "Opening payment…" : `Pay ${formatPrice(total)}`}
            </button>

            <p className="mt-3 text-center text-[11px] text-muted">
              Test mode — no real money moves. Card 4111 1111 1111 1111, any future
              expiry and CVV.
            </p>
          </div>
        </aside>
      </form>
    </>
  );
}
