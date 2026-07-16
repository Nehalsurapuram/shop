"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { GoogleIcon } from "./icons";

type Status =
  | { state: "idle" }
  | { state: "sending" }
  | { state: "sent" }
  | { state: "error"; message: string };

export function SignInForm({ callbackURL = "/account" }: { callbackURL?: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>({ state: "idle" });
  const [googlePending, setGooglePending] = useState(false);

  async function submitMagicLink(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus({ state: "sending" });
    const { error } = await authClient.signIn.magicLink({
      email: email.trim(),
      callbackURL,
    });

    setStatus(
      error
        ? { state: "error", message: error.message ?? "Something went wrong." }
        : { state: "sent" },
    );
  }

  async function signInWithGoogle() {
    setGooglePending(true);
    const { error } = await authClient.signIn.social({
      provider: "google",
      callbackURL,
    });
    // On success the browser is already navigating to Google, so only a
    // failure returns here and needs the button re-enabled.
    if (error) {
      setGooglePending(false);
      setStatus({ state: "error", message: error.message ?? "Something went wrong." });
    }
  }

  if (status.state === "sent") {
    return (
      <div className="text-center">
        <h1 className="font-serif text-2xl">Check your inbox</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          We sent a sign-in link to <span className="text-foreground">{email}</span>. It
          expires in 5 minutes.
        </p>
        <button
          type="button"
          onClick={() => setStatus({ state: "idle" })}
          className="mt-6 text-xs tracking-[0.14em] uppercase underline underline-offset-4"
        >
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-center font-serif text-2xl">Sign in</h1>
      <p className="mt-2 text-center text-sm text-muted">
        New here? Signing in creates your account.
      </p>

      <button
        type="button"
        onClick={signInWithGoogle}
        disabled={googlePending}
        className="mt-8 flex w-full items-center justify-center gap-3 border border-line py-3 text-xs tracking-[0.14em] uppercase transition-colors hover:border-foreground disabled:opacity-50"
      >
        <GoogleIcon className="size-4" />
        {googlePending ? "Redirecting…" : "Continue with Google"}
      </button>

      <div className="my-6 flex items-center gap-4">
        <span className="h-px flex-1 bg-line" />
        <span className="text-[10px] tracking-[0.14em] text-muted uppercase">or</span>
        <span className="h-px flex-1 bg-line" />
      </div>

      <form onSubmit={submitMagicLink}>
        <label
          htmlFor="email"
          className="text-[10px] tracking-[0.14em] text-muted uppercase"
        >
          Email address
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="mt-2 w-full border-b border-line bg-transparent py-2 text-sm outline-none placeholder:text-muted focus:border-foreground"
        />
        <button
          type="submit"
          disabled={status.state === "sending"}
          className="mt-6 w-full bg-foreground py-3 text-xs tracking-[0.14em] text-white uppercase disabled:opacity-50"
        >
          {status.state === "sending" ? "Sending…" : "Email me a sign-in link"}
        </button>
      </form>

      {status.state === "error" && (
        <p role="alert" className="mt-4 text-center text-sm text-sale">
          {status.message}
        </p>
      )}
    </div>
  );
}
