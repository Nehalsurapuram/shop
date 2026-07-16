"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "./icons";

export type Banner = {
  department: string;
  word: string;
  line2: string;
  subtitle: string;
  cta: string;
  href: string;
  /** Placeholder shown until a matching /public/hero file exists. */
  image: string;
  /** Your own photo, e.g. "/hero/women-1.jpg". Falls back to `image` if missing. */
  localSrc?: string;
  /** When the photo already contains its own headline, render it alone (no overlay text). */
  bare?: boolean;
  align: "left" | "right";
};

/** Tries the uploaded photo first; falls back to the placeholder if it fails to load. */
function BannerImage({
  banner,
  priority,
}: {
  banner: Banner;
  priority: boolean;
}) {
  const [src, setSrc] = useState(banner.localSrc ?? banner.image);
  return (
    <Image
      src={src}
      alt=""
      fill
      priority={priority}
      sizes="100vw"
      className="object-cover"
      onError={() => {
        if (src !== banner.image) setSrc(banner.image);
      }}
    />
  );
}

/** A full-bleed premium hero that auto-slides between banners, like a slideshow. */
export function HeroBanners({ banners }: { banners: Banner[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const go = useCallback(
    (delta: number) =>
      setIndex((i) => (i + delta + banners.length) % banners.length),
    [banners.length],
  );

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => go(1), 5500);
    return () => clearInterval(id);
  }, [go, paused]);

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured collections"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="relative h-[82vh] min-h-[540px] w-full overflow-hidden bg-neutral-900"
    >
      {/* Sliding track */}
      <div
        className="flex h-full transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {banners.map((banner, i) => {
          const alignRight = banner.align === "right";
          return (
            <div
              key={banner.word + banner.line2}
              className="relative h-full w-full shrink-0 basis-full"
              aria-hidden={i !== index}
            >
              <BannerImage banner={banner} priority={i === 0} />

              {banner.bare ? (
                <Link
                  href={banner.href}
                  tabIndex={i === index ? 0 : -1}
                  aria-label={`${banner.department} — ${banner.cta}`}
                  className="absolute inset-0"
                />
              ) : (
                <>
                  <div
                    className={`absolute inset-0 ${
                      alignRight
                        ? "bg-gradient-to-l from-black/60 via-black/15 to-transparent"
                        : "bg-gradient-to-r from-black/60 via-black/15 to-transparent"
                    }`}
                  />
                  <div className="absolute inset-0">
                    <div className="mx-auto flex h-full max-w-[1400px] items-center px-6 lg:px-12">
                      <div
                        className={`max-w-lg ${alignRight ? "ml-auto text-right" : ""}`}
                      >
                        <p className="text-[11px] tracking-[0.24em] text-white/85 uppercase">
                          {banner.department}
                        </p>
                        <h2 className="mt-4 leading-[0.88] text-white">
                          <span className="block font-serif text-5xl italic sm:text-6xl">
                            the
                          </span>
                          <span className="mt-1 block font-sans text-6xl font-black tracking-tight uppercase sm:text-7xl lg:text-8xl">
                            {banner.word}
                          </span>
                          <span className="block font-sans text-6xl font-black tracking-tight uppercase sm:text-7xl lg:text-8xl">
                            {banner.line2}
                          </span>
                        </h2>
                        <p className="mt-5 max-w-sm text-sm text-white/80">
                          {banner.subtitle}
                        </p>
                        <div className="mt-8">
                          <Link
                            href={banner.href}
                            tabIndex={i === index ? 0 : -1}
                            className="inline-block bg-white px-10 py-4 text-xs tracking-[0.2em] text-foreground uppercase transition-colors hover:bg-neutral-100"
                          >
                            {banner.cta}
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Arrows */}
      <button
        type="button"
        onClick={() => go(-1)}
        aria-label="Previous slide"
        className="absolute top-1/2 left-3 hidden -translate-y-1/2 grid-cols-1 place-items-center rounded-full bg-white/85 p-2.5 transition-colors hover:bg-white sm:grid lg:left-6"
      >
        <ChevronLeftIcon className="size-5" />
      </button>
      <button
        type="button"
        onClick={() => go(1)}
        aria-label="Next slide"
        className="absolute top-1/2 right-3 hidden -translate-y-1/2 grid-cols-1 place-items-center rounded-full bg-white/85 p-2.5 transition-colors hover:bg-white sm:grid lg:right-6"
      >
        <ChevronRightIcon className="size-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
        {banners.map((banner, i) => (
          <button
            key={banner.word + banner.line2}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === index}
            className={`h-0.5 w-8 transition-colors ${
              i === index ? "bg-white" : "bg-white/40"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
