import Image from "next/image";
import Link from "next/link";
import { HeroBanners, type Banner } from "@/components/hero-banner";
import { categoryImage, departmentImage } from "@/lib/images";

const WOMEN_BANNERS: Banner[] = [
  {
    department: "Woman",
    word: "STYLE",
    line2: "EDIT",
    subtitle: "Dresses, tops and everyday edits.",
    cta: "Shop women",
    href: "/d/women",
    image: categoryImage("women-dresses", 1, 2000, 1100),
    localSrc: "/hero/women-1.png",
    bare: true,
    align: "left",
  },
  {
    department: "Woman",
    word: "ETHNIC",
    line2: "EDIT",
    subtitle: "Festive-ready kurtas and sarees.",
    cta: "Shop ethnic",
    href: "/c/women-ethnic",
    image: categoryImage("women-ethnic", 4, 2000, 1100),
    localSrc: "/hero/women-2.png",
    bare: true,
    align: "right",
  },
  {
    department: "Woman",
    word: "DENIM",
    line2: "EDIT",
    subtitle: "Jeans and trousers in every fit.",
    cta: "Shop denim",
    href: "/c/women-denim",
    image: categoryImage("women-denim", 8, 2000, 1100),
    localSrc: "/hero/women-3.png",
    bare: true,
    align: "left",
  },
];

const MEN_BANNERS: Banner[] = [
  {
    department: "Man",
    word: "ESSENTIALS",
    line2: "EDIT",
    subtitle: "Everyday staples, done right.",
    cta: "Shop men",
    href: "/d/men",
    image: categoryImage("men-tshirts", 1, 2000, 1100),
    localSrc: "/hero/men-1.png",
    bare: true,
    align: "left",
  },
  {
    department: "Man",
    word: "SHIRTING",
    line2: "EDIT",
    subtitle: "Crisp shirts for work and weekend.",
    cta: "Shop shirts",
    href: "/c/men-shirts",
    image: categoryImage("men-shirts", 4, 2000, 1100),
    localSrc: "/hero/men-2.png",
    bare: true,
    align: "right",
  },
  {
    department: "Man",
    word: "DENIM",
    line2: "EDIT",
    subtitle: "Jeans and chinos that just work.",
    cta: "Shop denim",
    href: "/c/men-denim",
    image: categoryImage("men-denim", 8, 2000, 1100),
    localSrc: "/hero/men-3.png",
    bare: true,
    align: "left",
  },
];

const KIDS_BANNERS: Banner[] = [
  {
    department: "Kids",
    word: "PLAY",
    line2: "EDIT",
    subtitle: "Soft, durable and ready for anything.",
    cta: "Shop kids",
    href: "/d/kids",
    image: categoryImage("kids-baby", 1, 2000, 1100),
    localSrc: "/hero/kids-1.jpg",
    align: "left",
  },
  {
    department: "Kids",
    word: "JUNIOR",
    line2: "EDIT",
    subtitle: "Everyday styles for ages 3–8.",
    cta: "Shop junior",
    href: "/c/kids-junior",
    image: categoryImage("kids-junior", 3, 2000, 1100),
    localSrc: "/hero/kids-2.jpg",
    align: "right",
  },
  {
    department: "Kids",
    word: "TEEN",
    line2: "EDIT",
    subtitle: "Cool, comfortable teen fits.",
    cta: "Shop teen",
    href: "/c/kids-teen",
    image: categoryImage("kids-teen", 5, 2000, 1100),
    localSrc: "/hero/kids-3.jpg",
    align: "left",
  },
];

const OTHER_BANNERS: Banner[] = [
  {
    department: "Perfumes",
    word: "SCENT",
    line2: "EDIT",
    subtitle: "Signature fragrances for every mood.",
    cta: "Shop perfumes",
    href: "/d/perfumes",
    image: departmentImage("perfumes", 2, 2000, 1100),
    localSrc: "/hero/other-1.jpg",
    align: "left",
  },
  {
    department: "Fine Jewellery",
    word: "SHINE",
    line2: "EDIT",
    subtitle: "Everyday pieces with a considered shine.",
    cta: "Shop jewellery",
    href: "/d/jewellery",
    image: categoryImage("jewellery-earrings", 3, 2000, 1100),
    localSrc: "/hero/other-2.jpg",
    align: "right",
  },
  {
    department: "Home",
    word: "HOME",
    line2: "EDIT",
    subtitle: "Easy updates for every corner.",
    cta: "Shop home",
    href: "/d/home",
    image: departmentImage("home", 5, 2000, 1100),
    localSrc: "/hero/other-3.jpg",
    align: "left",
  },
];

const ETHNIC_BANNERS: Banner[] = [
  {
    department: "Ethnic",
    word: "ETHNIC",
    line2: "EDIT",
    subtitle: "Prints, embroidery and festive edits.",
    cta: "Shop ethnic",
    href: "/c/women-ethnic",
    image: categoryImage("women-ethnic", 2, 2000, 1100),
    localSrc: "/hero/ethnic-1.png",
    bare: true,
    align: "left",
  },
  {
    department: "Ethnic",
    word: "ETHNIC",
    line2: "PREMIUM",
    subtitle: "Quietly ornate, everyday luxe.",
    cta: "Shop ethnic",
    href: "/c/women-ethnic",
    image: categoryImage("women-ethnic", 5, 2000, 1100),
    localSrc: "/hero/ethnic-2.png",
    bare: true,
    align: "right",
  },
  {
    department: "Ethnic",
    word: "ETHNIC",
    line2: "SUITS",
    subtitle: "Poetry in motion.",
    cta: "Shop ethnic",
    href: "/c/women-ethnic",
    image: categoryImage("women-ethnic", 9, 2000, 1100),
    localSrc: "/hero/ethnic-3.png",
    bare: true,
    align: "left",
  },
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
      <HeroBanners banners={WOMEN_BANNERS} />

      <HeroBanners banners={MEN_BANNERS} />

      <HeroBanners banners={KIDS_BANNERS} />

      <HeroBanners banners={OTHER_BANNERS} />

      <section className="mx-auto max-w-[1400px] px-4 py-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-2">
          <SplitBanner
            eyebrow="Perfumes"
            title="Signature scents"
            href="/d/perfumes"
            image={categoryImage("perfumes-women", 3, 1200, 675)}
          />
          <SplitBanner
            eyebrow="Fine Jewellery"
            title="Everyday shine"
            href="/d/jewellery"
            image={categoryImage("jewellery-earrings", 2, 1200, 675)}
          />
        </div>
      </section>

      <HeroBanners banners={ETHNIC_BANNERS} />

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
