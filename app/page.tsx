import Image from "next/image";
import Link from "next/link";
import { HeroCarousel, type Slide } from "@/components/hero-carousel";
import { ProductRail } from "@/components/product-rail";
import { newArrivals, onSaleProducts, productsIn } from "@/lib/catalog";
import { apparelImage, DEPARTMENT_KEYWORDS } from "@/lib/images";

const SLIDES: Slide[] = [
  {
    eyebrow: "New Season",
    title: "Linen, light and easy",
    cta: "Shop Women",
    href: "/d/women",
    image: apparelImage("womenswear,fashion", 901, 1600, 720),
  },
  {
    eyebrow: "Just Landed",
    title: "Shirting, reimagined",
    cta: "Shop Men",
    href: "/d/men",
    image: apparelImage("menswear,shirt", 902, 1600, 720),
  },
  {
    eyebrow: "End of Season",
    title: "Up to 50% off everything",
    cta: "Shop Sale",
    href: "/d/sale",
    image: apparelImage("fashion,clothing", 903, 1600, 720),
  },
];

const CATEGORY_TILES = [
  { name: "Women", href: "/d/women", key: "women", lock: 11 },
  { name: "Men", href: "/d/men", key: "men", lock: 12 },
  { name: "Kids", href: "/d/kids", key: "kids", lock: 13 },
  { name: "Beauty", href: "/d/beauty", key: "beauty", lock: 14 },
  { name: "Home", href: "/d/home", key: "home", lock: 15 },
  { name: "Sale", href: "/d/sale", key: "sale", lock: 16 },
];

const PROMISES = [
  ["Free shipping", "On all orders above ₹1,499"],
  ["Easy returns", "30 days, no questions asked"],
  ["Secure payments", "UPI, cards, netbanking & COD"],
  ["1,000+ stores", "Shop online, return in store"],
];

export default function HomePage() {
  return (
    <>
      <HeroCarousel slides={SLIDES} />

      <section className="mx-auto max-w-[1400px] px-4 py-14 lg:px-8">
        <h2 className="mb-6 text-lg tracking-[0.16em] uppercase">
          Shop by category
        </h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {CATEGORY_TILES.map((tile) => (
            <Link key={tile.name} href={tile.href} className="group block">
              <div className="relative aspect-3/4 overflow-hidden bg-neutral-100">
                <Image
                  src={apparelImage(
                    DEPARTMENT_KEYWORDS[tile.key],
                    tile.lock,
                    600,
                    800,
                  )}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 16vw, (min-width: 768px) 33vw, 50vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/20" />
                <span className="absolute inset-x-0 bottom-4 text-center text-sm tracking-[0.16em] text-white uppercase">
                  {tile.name}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <ProductRail
        title="New arrivals"
        products={newArrivals(8)}
        href="/d/women"
      />

      <section className="mx-auto max-w-[1400px] px-4 py-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-2">
          <SplitBanner
            eyebrow="Nuon"
            title="Contemporary edit"
            href="/c/women-tops"
            image={apparelImage("blouse,fashion", 21, 1200, 675)}
          />
          <SplitBanner
            eyebrow="Bombay Paisley"
            title="Festive ethnic"
            href="/c/women-ethnic"
            image={apparelImage("saree,ethnic", 22, 1200, 675)}
          />
        </div>
      </section>

      <ProductRail title="On sale now" products={onSaleProducts(8)} href="/d/sale" />

      <ProductRail
        title="Dresses & jumpsuits"
        products={productsIn("women-dresses")}
        href="/c/women-dresses"
      />

      <section className="border-y border-line bg-neutral-50">
        <div className="mx-auto grid max-w-[1400px] grid-cols-2 gap-8 px-4 py-12 lg:grid-cols-4 lg:px-8">
          {PROMISES.map(([title, detail]) => (
            <div key={title} className="text-center">
              <h3 className="text-xs tracking-[0.14em] uppercase">{title}</h3>
              <p className="mt-2 text-xs text-muted">{detail}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function SplitBanner({
  eyebrow,
  title,
  href,
  image,
}: {
  eyebrow: string;
  title: string;
  href: string;
  image: string;
}) {
  return (
    <Link href={href} className="group relative block overflow-hidden">
      <div className="relative aspect-16/9 bg-neutral-100">
        <Image
          src={image}
          alt=""
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/25" />
        <div className="absolute bottom-6 left-6">
          <p className="text-[11px] tracking-[0.2em] text-white/85 uppercase">
            {eyebrow}
          </p>
          <h3 className="mt-2 text-2xl text-white">{title}</h3>
          <span className="mt-3 inline-block border-b border-white pb-0.5 text-xs tracking-[0.14em] text-white uppercase">
            Explore
          </span>
        </div>
      </div>
    </Link>
  );
}
