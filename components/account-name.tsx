"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

/**
 * Inline editor for the display name. Covers everyone regardless of how they
 * signed up — OTP users who skipped the name field, or Google users who want
 * a different one — since the sign-up name field only fires on account creation.
 */
export function AccountName({ initialName }: { initialName: string }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(initialName);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const next = name.trim();
    if (!next) {
      setError("Name can't be empty.");
      return;
    }

    setPending(true);
    setError(null);
    const { error } = await authClient.updateUser({ name: next });
    setPending(false);

    if (error) {
      setError(error.message ?? "Couldn't save. Try again.");
      return;
    }
    setEditing(false);
    // Server components (this page, the header) read the session server-side,
    // so refresh to pull the new name through rather than only updating state.
    router.refresh();
  }

  if (!editing) {
    return (
      <div className="flex items-center justify-between gap-8 py-4">
        <dt className="text-[10px] tracking-[0.14em] text-muted uppercase">Name</dt>
        <dd className="flex items-center gap-3 text-sm">
          <span>{initialName || "—"}</span>
          <button
            type="button"
            onClick={() => {
              setName(initialName);
              setEditing(true);
              setError(null);
            }}
            className="text-[10px] tracking-[0.14em] text-muted uppercase underline underline-offset-4 hover:text-foreground"
          >
            {initialName ? "Edit" : "Add name"}
          </button>
        </dd>
      </div>
    );
  }

  return (
    <form onSubmit={save} className="py-4">
      <div className="flex items-center justify-between gap-8">
        <dt className="text-[10px] tracking-[0.14em] text-muted uppercase">Name</dt>
        <dd className="flex flex-1 items-center justify-end gap-2">
          <input
            type="text"
            autoComplete="name"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full max-w-56 border-b border-line bg-transparent py-1 text-right text-sm outline-none focus:border-foreground"
          />
          <button
            type="submit"
            disabled={pending}
            className="text-[10px] tracking-[0.14em] uppercase underline underline-offset-4 disabled:opacity-50"
          >
            {pending ? "Saving…" : "Save"}
          </button>
          <button
            type="button"
            onClick={() => {
              setEditing(false);
              setError(null);
            }}
            className="text-[10px] tracking-[0.14em] text-muted uppercase underline underline-offset-4"
          >
            Cancel
          </button>
        </dd>
      </div>
      {error && (
        <p role="alert" className="mt-2 text-right text-xs text-sale">
          {error}
        </p>
      )}
    </form>
  );
}
