"use client";

import Image from "next/image";
import { useState } from "react";
import { SITE } from "@/lib/site";

/** Intrinsic ratio of /public/logo.png — the wordmark is far wider than it is tall. */
const RATIO = 848 / 295;

/**
 * Renders the brand wordmark from /public/logo.png. The artwork already spells
 * out the name, so it stands alone — no text alongside it. If the file is
 * missing or fails to load, it falls back to a letter-spaced text wordmark so
 * the header is never left empty.
 */
export function Logo({
  height = 28,
  className = "",
}: {
  height?: number;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span
        className={`text-lg font-semibold tracking-[0.28em] uppercase ${className}`}
      >
        {SITE.name}
      </span>
    );
  }

  return (
    <Image
      src="/logo.png"
      alt={SITE.name}
      width={Math.round(height * RATIO)}
      height={height}
      priority
      onError={() => setFailed(true)}
      className={`w-auto object-contain ${className}`}
      style={{ height }}
    />
  );
}
