"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "./icons";

export type Slide = {
  eyebrow: string;
  title: string;
  cta: string;
  href: string;
  image: string;
};

export function HeroCarousel({ slides }: { slides: Slide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const go = useCallback(
    (delta: number) =>
      setIndex((i) => (i + delta + slides.length) % slides.length),
    [slides.length],
  );

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => go(1), 6000);
    return () => clearInterval(id);
  }, [go, paused]);

  return (
    <section
      className="relative"
      aria-roledescription="carousel"
      aria-label="Featured collections"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-neutral-100 sm:aspect-[16/9] lg:aspect-[21/9]">
        {slides.map((slide, i) => (
          <div
            key={slide.title}
            className={`absolute inset-0 transition-opacity duration-700 ${
              i === index ? "opacity-100" : "opacity-0"
            }`}
            aria-hidden={i !== index}
          >
            <Image
              src={slide.image}
              alt=""
              fill
              priority={i === 0}
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 mx-auto max-w-[1400px] px-6 pb-12 lg:px-8 lg:pb-16">
              <p className="text-[11px] tracking-[0.22em] text-white/85 uppercase">
                {slide.eyebrow}
              </p>
              <h2 className="mt-3 max-w-xl text-3xl leading-tight text-white lg:text-5xl">
                {slide.title}
              </h2>
              <Link
                href={slide.href}
                tabIndex={i === index ? 0 : -1}
                className="mt-6 inline-block bg-white px-9 py-3.5 text-xs tracking-[0.14em] text-foreground uppercase transition-colors hover:bg-neutral-100"
              >
                {slide.cta}
              </Link>
            </div>
          </div>
        ))}
      </div>

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

      <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2">
        {slides.map((slide, i) => (
          <button
            key={slide.title}
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
