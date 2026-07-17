import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { CheckoutForm } from "@/components/checkout-form";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Checkout",
};

export default async function CheckoutPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  // Orders belong to an account, so there's nothing to show a signed-out visitor.
  // Send them back here once they're in rather than dumping them on the homepage.
  if (!session) redirect("/sign-in?next=/checkout");

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-10 lg:px-8">
      <h1 className="text-xl tracking-[0.14em] uppercase">Checkout</h1>

      <div className="mt-10">
        <CheckoutForm
          user={{ name: session.user.name ?? "", email: session.user.email }}
        />
      </div>
    </div>
  );
}
