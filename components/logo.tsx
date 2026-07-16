"use client";

import Image from "next/image";
import { useState } from "react";
import { SITE } from "@/lib/site";

/**
 * Renders the brand badge from /public/logo.png. Until that file exists (or if it
 * fails to load), it falls back to the letter-spaced text wordmark so the header
 * is never broken.
 */
export function Logo({
  size = 40,
  withWordmark = false,
  className = "",
}: {
  size?: number;
  withWordmark?: boolean;
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
    <span className={`flex items-center gap-2.5 ${className}`}>
      <Image
        src="/logo.png"
        alt={SITE.name}
        width={size}
        height={size}
        priority
        onError={() => setFailed(true)}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
      />
      {withWordmark && (
        <span className="text-base font-semibold tracking-[0.2em] uppercase">
          {SITE.name}
        </span>
      )}
    </span>
  );
}
