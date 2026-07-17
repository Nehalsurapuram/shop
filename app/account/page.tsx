import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/sign-out-button";
import { auth } from "@/lib/auth";
import { formatPrice } from "@/lib/format";
import { listOrders } from "@/lib/orders";

const STATUS_LABEL = {
  paid: "Confirmed",
  pending: "Not paid",
  failed: "Failed",
} as const;

export const metadata: Metadata = {
  title: "My account",
};

export default async function AccountPage() {
  // proxy.ts only does an optimistic cookie check, so the real session
  // check has to happen here, next to the data.
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const { user } = session;
  const orders = await listOrders(user.id);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-16 lg:py-24">
      <h1 className="font-serif text-3xl">My account</h1>

      <dl className="mt-10 divide-y divide-line border-y border-line">
        <div className="flex justify-between gap-8 py-4">
          <dt className="text-[10px] tracking-[0.14em] text-muted uppercase">Name</dt>
          <dd className="text-sm">{user.name || "—"}</dd>
        </div>
        <div className="flex justify-between gap-8 py-4">
          <dt className="text-[10px] tracking-[0.14em] text-muted uppercase">Email</dt>
          <dd className="text-sm">{user.email}</dd>
        </div>
      </dl>

      <h2 className="mt-16 text-xs tracking-[0.16em] uppercase">Orders</h2>

      {orders.length === 0 ? (
        <p className="mt-4 text-sm text-muted">
          You haven&apos;t placed an order yet.{" "}
          <Link href="/" className="underline underline-offset-4">
            Start shopping
          </Link>
          .
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-line border-y border-line">
          {orders.map((order) => (
            <li key={order.id}>
              <Link href={`/order/${order.id}`} className="flex gap-4 py-4 hover:opacity-70">
                <div className="min-w-0 flex-1">
                  <p className="text-sm">
                    {order.items.length} item{order.items.length > 1 ? "s" : ""} ·{" "}
                    {formatPrice(order.total)}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    {order.createdAt.toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}{" "}
                    · {STATUS_LABEL[order.status]}
                  </p>
                </div>
                <span className="self-center text-xs text-muted">View</span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-10">
        <SignOutButton />
      </div>
    </div>
  );
}
