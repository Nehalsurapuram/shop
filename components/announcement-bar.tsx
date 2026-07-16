"use client";

import { useEffect, useState } from "react";
import { ANNOUNCEMENTS } from "@/lib/site";

export function AnnouncementBar() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setIndex((i) => (i + 1) % ANNOUNCEMENTS.length),
      4000,
    );
    return () => clearInterval(id);
  }, []);

  return (
    <div className="bg-foreground text-white">
      <div className="mx-auto flex h-9 max-w-[1400px] items-center justify-center px-4 text-center">
        <p
          key={index}
          className="animate-marquee-in text-[11px] tracking-[0.12em] uppercase"
        >
          {ANNOUNCEMENTS[index]}
        </p>
      </div>
    </div>
  );
}
