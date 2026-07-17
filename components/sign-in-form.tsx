"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { GoogleIcon } from "./icons";

type Step =
  | { name: "email" }
  | { name: "code"; email: string };

export function SignInForm({ callbackURL = "/account" }: { callbackURL?: string }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>({ name: "email" });
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [googlePending, setGooglePending] = useState(false);

  async function sendCode(target: string) {
    setPending(true);
    setError(null);
    const { error } = await authClient.emailOtp.sendVerificationOtp({
      email: target,
      type: "sign-in",
    });
    setPending(false);

    if (error) {
      setError(error.message ?? "Couldn't send the code. Try again.");
      return false;
    }
    return true;
  }

  async function submitEmail(e: React.FormEvent) {
    e.preventDefault();
    const target = email.trim();
    if (!target) return;

    if (await sendCode(target)) {
      setCode("");
      setStep({ name: "code", email: target });
    }
  }

  async function submitCode(e: React.FormEvent) {
    e.preventDefault();
    if (step.name !== "code") return;

    const otp = code.trim();
    if (otp.length !== 6) {
      setError("Enter the 6-digit code from your email.");
      return;
    }

    setPending(true);
    setError(null);
    const { error } = await authClient.signIn.emailOtp({ email: step.email, otp });
    setPending(false);

    if (error) {
      // Wrong or expired code — keep the user on this step to retry.
      setError(error.message ?? "That code didn't work. Check it and try again.");
      return;
    }

    // Session cookie is set; go where they were headed.
    router.push(callbackURL);
    router.refresh();
  }

  async function signInWithGoogle() {
    setGooglePending(true);
    const { error } = await authClient.signIn.social({ provider: "google", callbackURL });
    // On success the browser is already navigating to Google, so only a
    // failure returns here and needs the button re-enabled.
    if (error) {
      setGooglePending(false);
      setError(error.message ?? "Something went wrong.");
    }
  }

  if (step.name === "code") {
    return (
      <div>
        <h1 className="text-center font-serif text-2xl">Enter your code</h1>
        <p className="mt-3 text-center text-sm leading-relaxed text-muted">
          We sent a 6-digit code to <span className="text-foreground">{step.email}</span>.
          It expires in 5 minutes.
        </p>

        <form onSubmit={submitCode} className="mt-8">
          <label htmlFor="otp" className="sr-only">
            6-digit code
          </label>
          <input
            id="otp"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            required
            autoFocus
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            placeholder="000000"
            className="w-full border-b border-line bg-transparent py-2 text-center text-2xl tracking-[0.5em] outline-none placeholder:text-muted focus:border-foreground"
          />
          <button
            type="submit"
            disabled={pending}
            className="mt-6 w-full bg-foreground py-3 text-xs tracking-[0.14em] text-white uppercase disabled:opacity-50"
          >
            {pending ? "Verifying…" : "Verify & sign in"}
          </button>
        </form>

        {error && (
          <p role="alert" className="mt-4 text-center text-sm text-sale">
            {error}
          </p>
        )}

        <div className="mt-6 flex justify-center gap-6 text-xs tracking-[0.14em] uppercase">
          <button
            type="button"
            onClick={() => sendCode(step.email)}
            disabled={pending}
            className="underline underline-offset-4 disabled:opacity-50"
          >
            Resend code
          </button>
          <button
            type="button"
            onClick={() => {
              setStep({ name: "email" });
              setError(null);
            }}
            className="underline underline-offset-4"
          >
            Change email
          </button>
        </div>
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

      <form onSubmit={submitEmail}>
        <label htmlFor="email" className="text-[10px] tracking-[0.14em] text-muted uppercase">
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
          disabled={pending}
          className="mt-6 w-full bg-foreground py-3 text-xs tracking-[0.14em] text-white uppercase disabled:opacity-50"
        >
          {pending ? "Sending…" : "Email me a code"}
        </button>
      </form>

      {error && (
        <p role="alert" className="mt-4 text-center text-sm text-sale">
          {error}
        </p>
      )}
    </div>
  );
}
