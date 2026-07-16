import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SignInForm } from "@/components/sign-in-form";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Sign in",
};

export default async function SignInPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session) redirect("/account");

  return (
    <div className="mx-auto w-full max-w-sm px-4 py-16 lg:py-24">
      <SignInForm />
    </div>
  );
}
