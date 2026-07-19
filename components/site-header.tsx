"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSession } from "@/lib/auth-client";
import { EXTRA_NAV, NAV } from "@/lib/catalog";
import { departmentImage } from "@/lib/images";
import { SITE } from "@/lib/site";
import { useCart } from "./cart-provider";
import { useWishlist } from "./wishlist-provider";
import { Logo } from "./logo";
import {
  BagIcon,
  CloseIcon,
  HeartIcon,
  MenuIcon,
  SearchIcon,
  UserIcon,
} from "./icons";

export function SiteHeader() {
  const [openTop, setOpenTop] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { count, openCart } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { data: session } = useSession();
  const router = useRouter();

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <header
      className="sticky top-0 z-40 border-b border-line bg-background"
      onMouseLeave={() => setOpenTop(null)}
    >
      <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-4 px-4 lg:px-8">
        <button
          type="button"
          className="-ml-2 p-2 lg:hidden"
          aria-label="Open menu"
          onClick={() => setMobileOpen(true)}
        >
          <MenuIcon className="size-5" />
        </button>

        <Link href="/" className="shrink-0" aria-label={`${SITE.name} home`}>
          <Logo height={30} />
        </Link>

        <form
          onSubmit={submitSearch}
          className="ml-auto hidden max-w-md flex-1 items-center gap-2 border-b border-line py-1.5 focus-within:border-foreground lg:ml-8 lg:flex"
          role="search"
        >
          <SearchIcon className="size-4 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for products, brands and more"
            aria-label="Search"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
          />
        </form>

        <nav className="ml-auto flex items-center gap-1 lg:ml-4">
          <Link
            href={session ? "/account" : "/sign-in"}
            className="hidden items-center gap-2 px-3 py-2 text-xs tracking-wide uppercase sm:flex"
          >
            <UserIcon className="size-5" />
            {session ? session.user.name?.split(" ")[0] || "Account" : "Sign in"}
          </Link>
          <Link
            href="/wishlist"
            className="relative p-2"
            aria-label={`Wishlist, ${wishlistCount} items`}
          >
            <HeartIcon className="size-5" />
            {wishlistCount > 0 && (
              <span className="absolute top-0.5 right-0 grid size-4 place-items-center rounded-full bg-foreground text-[10px] font-medium text-white">
                {wishlistCount}
              </span>
            )}
          </Link>
          <button
            type="button"
            onClick={openCart}
            className="relative p-2"
            aria-label={`Cart, ${count} items`}
          >
            <BagIcon className="size-5" />
            {count > 0 && (
              <span className="absolute top-0.5 right-0 grid size-4 place-items-center rounded-full bg-foreground text-[10px] font-medium text-white">
                {count}
              </span>
            )}
          </button>
        </nav>
      </div>

      {/* Desktop category bar + mega menu */}
      <div className="hidden border-t border-line lg:block">
        <div className="mx-auto max-w-[1400px] px-8">
          <ul className="flex items-center justify-center gap-6">
            {NAV.map((top) => (
              <li key={top.slug} onMouseEnter={() => setOpenTop(top.slug)}>
                <Link
                  href={`/d/${top.slug}`}
                  className={`inline-block border-b-2 py-3 text-xs tracking-[0.12em] uppercase transition-colors ${
                    openTop === top.slug
                      ? "border-foreground"
                      : "border-transparent"
                  } ${top.slug === "sale" ? "text-sale" : ""}`}
                >
                  {top.name}
                </Link>
              </li>
            ))}
            {EXTRA_NAV.map((link) => (
              <li key={link.label} onMouseEnter={() => setOpenTop(null)}>
                <Link
                  href={link.href}
                  className="inline-block border-b-2 border-transparent py-3 text-xs tracking-[0.12em] uppercase transition-colors hover:border-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {openTop && (
          <div className="absolute inset-x-0 top-full border-t border-line bg-background shadow-[0_12px_24px_-12px_rgba(0,0,0,0.18)]">
            <div className="mx-auto grid max-w-[1400px] grid-cols-4 gap-8 px-8 py-8">
              <div className="col-span-3 grid grid-cols-3 gap-x-8 gap-y-3">
                {NAV.find((t) => t.slug === openTop)?.children?.map((child) => (
                  <Link
                    key={child.slug}
                    href={`/c/${child.slug}`}
                    className="text-sm text-muted transition-colors hover:text-foreground"
                    onClick={() => setOpenTop(null)}
                  >
                    {child.name}
                  </Link>
                ))}
              </div>
              <Link
                href={`/d/${openTop}`}
                className="group block"
                onClick={() => setOpenTop(null)}
              >
                <div className="relative aspect-4/3 overflow-hidden bg-neutral-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={departmentImage(openTop, 3, 600, 450)}
                    alt=""
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <p className="mt-3 text-xs tracking-[0.14em] uppercase underline underline-offset-4">
                  Shop all {NAV.find((t) => t.slug === openTop)?.name}
                </p>
              </Link>
            </div>
          </div>
        )}
      </div>

      {mobileOpen && (
        <MobileMenu onClose={() => setMobileOpen(false)} />
      )}
    </header>
  );
}

function MobileMenu({ onClose }: { onClose: () => void }) {
  const [expanded, setExpanded] = useState<string | null>(NAV[0].slug);

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden
      />
      <div className="absolute inset-y-0 left-0 flex w-[85%] max-w-sm flex-col bg-background">
        <div className="flex h-16 items-center justify-between border-b border-line px-4">
          <Logo height={26} />
          <button type="button" onClick={onClose} aria-label="Close menu" className="p-2">
            <CloseIcon className="size-5" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto px-4 py-2">
          {NAV.map((top) => (
            <div key={top.slug} className="border-b border-line">
              <button
                type="button"
                className={`flex w-full items-center justify-between py-3.5 text-sm tracking-[0.14em] uppercase ${
                  top.slug === "sale" ? "text-sale" : ""
                }`}
                onClick={() =>
                  setExpanded((s) => (s === top.slug ? null : top.slug))
                }
                aria-expanded={expanded === top.slug}
              >
                {top.name}
                <span className="text-muted">
                  {expanded === top.slug ? "−" : "+"}
                </span>
              </button>
              {expanded === top.slug && (
                <ul className="pb-3">
                  {top.children?.map((child) => (
                    <li key={child.slug}>
                      <Link
                        href={`/c/${child.slug}`}
                        onClick={onClose}
                        className="block py-2 text-sm text-muted"
                      >
                        {child.name}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link
                      href={`/d/${top.slug}`}
                      onClick={onClose}
                      className="block py-2 text-sm underline underline-offset-4"
                    >
                      Shop all {top.name}
                    </Link>
                  </li>
                </ul>
              )}
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
}
