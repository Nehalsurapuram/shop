import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SignInForm } from "@/components/sign-in-form";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Sign in",
};

/**
 * `next` ends up in a redirect after sign-in, so it has to stay on this site.
 * A protocol-relative value like `//evil.com` is a valid URL to the browser but
 * leaves the origin, so anything beyond a single leading slash is rejected.
 */
function safeNext(value: string | string[] | undefined) {
  if (typeof value !== "string") return undefined;
  if (!value.startsWith("/") || value.startsWith("//")) return undefined;
  return value;
}
export default async function SignInPage(props: PageProps<"/sign-in">) {
  const session = await auth.api.getSession({ headers: await headers() });
  const next = safeNext((await props.searchParams).next);
  if (session) redirect(next ?? "/account");
  return (
    <div className="mx-auto w-full max-w-sm px-4 py-16 lg:py-24">
      <SignInForm callbackURL={next ?? "/account"} />
    </div>
  );
}