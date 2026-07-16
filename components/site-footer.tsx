import Link from "next/link";
import { NAV } from "@/lib/catalog";
import { SITE } from "@/lib/site";

const HELP_LINKS = [
  ["Contact Us", "/help/contact"],
  ["Shipping & Delivery", "/help/shipping"],
  ["Returns & Exchanges", "/help/returns"],
  ["Track Your Order", "/help/track"],
  ["Store Locator", "/help/stores"],
];

const ABOUT_LINKS = [
  ["About Us", "/about"],
  ["Careers", "/about/careers"],
  ["Press", "/about/press"],
  ["Gift Cards", "/gift-cards"],
];

const LEGAL_LINKS = [
  ["Terms of Use", "/legal/terms"],
  ["Privacy Policy", "/legal/privacy"],
  ["Cookie Policy", "/legal/cookies"],
];

const SOCIALS = ["Instagram", "Facebook", "YouTube", "X"];

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-line bg-neutral-50">
      <div className="mx-auto max-w-[1400px] px-4 py-14 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <FooterColumn title="Shop">
            {NAV.map((top) => (
              <FooterLink key={top.slug} href={`/d/${top.slug}`}>
                {top.name}
              </FooterLink>
            ))}
          </FooterColumn>

          <FooterColumn title="Help">
            {HELP_LINKS.map(([label, href]) => (
              <FooterLink key={href} href={href}>
                {label}
              </FooterLink>
            ))}
          </FooterColumn>

          <FooterColumn title="Company">
            {ABOUT_LINKS.map(([label, href]) => (
              <FooterLink key={href} href={href}>
                {label}
              </FooterLink>
            ))}
          </FooterColumn>

          <div>
            <h2 className="text-xs tracking-[0.16em] uppercase">Stay in the loop</h2>
            <p className="mt-4 text-sm text-muted">
              New arrivals, offers and styling notes — straight to your inbox.
            </p>
            <form className="mt-4 flex border-b border-neutral-300 focus-within:border-foreground">
              <input
                type="email"
                required
                placeholder="Email address"
                aria-label="Email address"
                className="w-full bg-transparent py-2 text-sm outline-none placeholder:text-muted"
              />
              <button
                type="submit"
                className="px-2 text-xs tracking-[0.14em] uppercase"
              >
                Join
              </button>
            </form>
            <div className="mt-8 flex gap-4">
              {SOCIALS.map((s) => (
                <Link
                  key={s}
                  href="/"
                  className="text-xs text-muted underline-offset-4 hover:text-foreground hover:underline"
                >
                  {s}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-line pt-6 text-xs text-muted md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} {SITE.name}. Demo store — not a real
            retailer.
          </p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {LEGAL_LINKS.map(([label, href]) => (
              <Link key={href} href={href} className="hover:text-foreground">
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="text-xs tracking-[0.16em] uppercase">{title}</h2>
      <ul className="mt-4 space-y-2.5">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="text-sm text-muted hover:text-foreground">
        {children}
      </Link>
    </li>
  );
}
