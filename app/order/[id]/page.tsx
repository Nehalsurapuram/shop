import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { formatPrice } from "@/lib/format";
import { getOrder } from "@/lib/orders";

export const metadata: Metadata = {
  title: "Order confirmed",
};

const STATUS_COPY = {
  paid: {
    heading: "Order confirmed",
    detail: "Thank you — we've got your order and we're getting it ready.",
  },
  pending: {
    heading: "Payment not completed",
    detail:
      "We saved your order but the payment didn't go through. Nothing has been charged.",
  },
  failed: {
    heading: "Payment failed",
    detail: "We couldn't verify this payment. Nothing has been charged.",
  },
} as const;

export default async function OrderPage(props: PageProps<"/order/[id]">) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const { id } = await props.params;
  // Scoped to the signed-in user, so guessing an id gets you a 404, not a receipt.
  const order = await getOrder(id, session.user.id);
  if (!order) notFound();

  const copy = STATUS_COPY[order.status];

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-16">
      <p className="text-[11px] tracking-[0.2em] text-muted uppercase">
        {order.status === "paid" ? "Thank you" : "Order"}
      </p>
      <h1 className="mt-3 font-serif text-3xl">{copy.heading}</h1>
      <p className="mt-3 text-sm text-muted">{copy.detail}</p>

      <dl className="mt-10 divide-y divide-line border-y border-line text-sm">
        <div className="flex justify-between gap-8 py-4">
          <dt className="text-[10px] tracking-[0.14em] text-muted uppercase">Order</dt>
          <dd className="font-mono text-xs">{order.id}</dd>
        </div>
        {order.razorpayPaymentId && (
          <div className="flex justify-between gap-8 py-4">
            <dt className="text-[10px] tracking-[0.14em] text-muted uppercase">Payment</dt>
            <dd className="font-mono text-xs">{order.razorpayPaymentId}</dd>
          </div>
        )}
        <div className="flex justify-between gap-8 py-4">
          <dt className="text-[10px] tracking-[0.14em] text-muted uppercase">Deliver to</dt>
          <dd className="text-right">
            {order.address.name}
            <br />
            <span className="text-muted">
              {order.address.line1}
              {order.address.line2 ? `, ${order.address.line2}` : ""}
              <br />
              {order.address.city}, {order.address.state} {order.address.pincode}
              <br />
              {order.address.phone}
            </span>
          </dd>
        </div>
      </dl>

      <ul className="mt-8 space-y-4">
        {order.items.map((item) => (
          <li key={`${item.slug}-${item.size}-${item.color}`} className="flex gap-4">
            <div className="relative aspect-4/5 w-16 shrink-0 bg-neutral-100">
              <Image src={item.image} alt="" fill sizes="64px" className="object-cover" />
            </div>
            <div className="min-w-0 flex-1 text-sm">
              <Link href={`/p/${item.slug}`} className="hover:underline">
                {item.name}
              </Link>
              <p className="mt-1 text-xs text-muted">
                {item.brand} · {item.size} · {item.color} · Qty {item.qty}
              </p>
            </div>
            <span className="text-sm">{formatPrice(item.unitPrice * item.qty)}</span>
          </li>
        ))}
      </ul>

      <dl className="mt-8 space-y-3 border-t border-line pt-5 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted">Subtotal</dt>
          <dd>{formatPrice(order.subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted">Shipping</dt>
          <dd>{order.shipping === 0 ? "Free" : formatPrice(order.shipping)}</dd>
        </div>
        <div className="flex justify-between border-t border-line pt-3 text-base font-medium">
          <dt>Total</dt>
          <dd>{formatPrice(order.total)}</dd>
        </div>
      </dl>

      <div className="mt-12 flex gap-3">
        <Link
          href="/"
          className="bg-foreground px-8 py-3.5 text-xs tracking-[0.14em] text-white uppercase"
        >
          Continue shopping
        </Link>
        <Link
          href="/account"
          className="border border-line px-8 py-3.5 text-xs tracking-[0.14em] uppercase hover:border-foreground"
        >
          My orders
        </Link>
      </div>
    </div>
  );
}
