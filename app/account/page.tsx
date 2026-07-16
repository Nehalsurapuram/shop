import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/sign-out-button";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "My account",
};

export default async function AccountPage() {
  // proxy.ts only does an optimistic cookie check, so the real session
  // check has to happen here, next to the data.
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const { user } = session;

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

      <div className="mt-10">
        <SignOutButton />
      </div>
    </div>
  );
}
