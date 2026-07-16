import { HNM_PRODUCTS } from "./hnm-products";
import { productImages } from "./images";
import { PRODUCT_IMAGES } from "./product-images";

export type Category = {
  slug: string;
  name: string;
  children?: Category[];
};

export type Product = {
  slug: string;
  name: string;
  brand: string;
  price: number;
  compareAt: number | null;
  category: string;
  department: string;
  colors: string[];
  sizes: string[];
  rating: number;
  reviews: number;
  images: string[];
  description: string;
};

/** Top-level nav tree. `slug` of a leaf maps to /c/[slug]. */
export const NAV: Category[] = [
  {
    slug: "sale",
    name: "Sale",
    children: [
      { slug: "sale-women", name: "Women" },
      { slug: "sale-men", name: "Men" },
      { slug: "sale-kids", name: "Kids" },
    ],
  },
  {
    slug: "women",
    name: "Woman",
    children: [
      { slug: "women-dresses", name: "Dresses & Jumpsuits" },
      { slug: "women-tops", name: "Tops & Shirts" },
      { slug: "women-ethnic", name: "Ethnic Wear" },
      { slug: "women-denim", name: "Jeans & Trousers" },
      { slug: "women-footwear", name: "Footwear" },
    ],
  },
  {
    slug: "men",
    name: "Man",
    children: [
      { slug: "men-shirts", name: "Shirts" },
      { slug: "men-tshirts", name: "T-Shirts & Polos" },
      { slug: "men-denim", name: "Jeans & Trousers" },
      { slug: "men-footwear", name: "Footwear" },
      { slug: "men-accessories", name: "Accessories" },
    ],
  },
  {
    slug: "kids",
    name: "Kids",
    children: [
      { slug: "kids-baby", name: "Baby (0–2 yrs)" },
      { slug: "kids-junior", name: "Junior (3–8 yrs)" },
      { slug: "kids-teen", name: "Teen (9–14 yrs)" },
    ],
  },
  {
    slug: "perfumes",
    name: "Perfumes",
    children: [
      { slug: "perfumes-women", name: "For Her" },
      { slug: "perfumes-men", name: "For Him" },
      { slug: "perfumes-unisex", name: "Unisex" },
      { slug: "perfumes-gift", name: "Gift Sets" },
    ],
  },
  {
    slug: "beauty",
    name: "Beauty",
    children: [
      { slug: "beauty-makeup", name: "Makeup" },
      { slug: "beauty-skincare", name: "Skincare" },
      { slug: "beauty-bath", name: "Bath & Body" },
    ],
  },
  {
    slug: "jewellery",
    name: "Fine Jewellery",
    children: [
      { slug: "jewellery-earrings", name: "Earrings" },
      { slug: "jewellery-necklaces", name: "Necklaces & Pendants" },
      { slug: "jewellery-rings", name: "Rings" },
      { slug: "jewellery-bracelets", name: "Bracelets & Bangles" },
    ],
  },
  {
    slug: "home",
    name: "Home",
    children: [
      { slug: "home-bed", name: "Bed & Bath" },
      { slug: "home-decor", name: "Decor" },
      { slug: "home-kitchen", name: "Kitchen & Dining" },
    ],
  },
];

/** Extra top-level nav links Westside shows that aren't shoppable departments. */
export const EXTRA_NAV = [
  { label: "Gift Shop", href: "/d/home" },
  { label: "Brand", href: "/d/women" },
  { label: "W-Style", href: "/d/women" },
] as const;

export const CATEGORY_INDEX: Record<string, { name: string; parent: string }> =
  Object.fromEntries(
    NAV.flatMap((top) =>
      (top.children ?? []).map((child) => [
        child.slug,
        { name: child.name, parent: top.name },
      ]),
    ),
  );

const BRANDS = ["Nuon", "Bombay Paisley", "Studiofit", "LOV", "Ascot", "Zuba"];
const COLORS = ["Black", "Ivory", "Olive", "Navy", "Rust", "Sand", "Teal"];
const APPAREL_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const SHOE_SIZES = ["6", "7", "8", "9", "10", "11"];
const ONE_SIZE = ["One Size"];

const NAMES: Record<string, string[]> = {
  "sale-women": ["Pleated Midi Dress", "Ribbed Knit Top", "Wide-Leg Trousers"],
  "sale-men": ["Oxford Shirt", "Slim Chinos", "Crew Neck Tee"],
  "sale-kids": ["Printed Romper", "Denim Dungarees", "Graphic Sweatshirt"],
  "women-dresses": [
    "Tiered Maxi Dress",
    "Belted Shirt Dress",
    "Linen Jumpsuit",
    "Floral Wrap Dress",
    "Satin Slip Dress",
    "Cotton Sundress",
  ],
  "women-tops": [
    "Puff Sleeve Blouse",
    "Ribbed Knit Top",
    "Oversized Poplin Shirt",
    "Cropped Cami",
    "Boxy Linen Shirt",
  ],
  "women-ethnic": [
    "Block Print Kurta",
    "Embroidered Anarkali",
    "Chikankari Set",
    "Silk Blend Saree",
    "Straight Kurta Set",
  ],
  "women-denim": [
    "High-Rise Straight Jeans",
    "Wide-Leg Trousers",
    "Mom Fit Jeans",
    "Pleated Culottes",
  ],
  "women-footwear": ["Block Heel Sandals", "Leather Loafers", "Canvas Sneakers"],
  "men-shirts": [
    "Oxford Button-Down",
    "Linen Camp Shirt",
    "Checked Flannel Shirt",
    "Textured Resort Shirt",
    "Slim Formal Shirt",
  ],
  "men-tshirts": [
    "Pima Cotton Tee",
    "Pique Polo",
    "Graphic Crew Tee",
    "Henley Long Sleeve",
  ],
  "men-denim": ["Slim Fit Jeans", "Tapered Chinos", "Relaxed Cargo Pants"],
  "men-footwear": ["Suede Derby", "Retro Runner", "Leather Sandals"],
  "men-accessories": ["Leather Belt", "Canvas Cap", "Woven Tie"],
  "kids-baby": ["Printed Romper", "Ribbed Bodysuit", "Soft Knit Cardigan"],
  "kids-junior": ["Denim Dungarees", "Graphic Sweatshirt", "Twill Shorts"],
  "kids-teen": ["Oversized Hoodie", "Cargo Joggers", "Colourblock Tee"],
  "perfumes-women": ["Rose Petal EDP", "Jasmine Bloom EDP", "Peony Blush EDT"],
  "perfumes-men": ["Amber Oud EDP", "Vetiver Musk EDP", "Cedar Noir EDT"],
  "perfumes-unisex": ["Citrus Neroli EDT", "White Tea EDP", "Sandalwood Haze EDP"],
  "perfumes-gift": ["Discovery Set of 5", "Travel Duo Set", "Signature Gift Box"],
  "beauty-makeup": ["Satin Matte Lipstick", "Gel Eyeliner", "Blurring Compact"],
  "beauty-skincare": ["Vitamin C Serum", "Ceramide Moisturiser", "Clay Cleanser"],
  "beauty-bath": ["Shea Body Butter", "Charcoal Body Wash", "Almond Hand Cream"],
  "jewellery-earrings": ["Pavé Stud Earrings", "Gold Hoop Earrings", "Pearl Drop Earrings"],
  "jewellery-necklaces": ["Layered Chain Necklace", "Pendant Locket", "Beaded Choker"],
  "jewellery-rings": ["Stacking Ring Set", "Solitaire Ring", "Signet Ring"],
  "jewellery-bracelets": ["Tennis Bracelet", "Cuff Bangle", "Charm Bracelet"],
  "home-bed": ["Cotton Percale Bedsheet", "Waffle Throw", "Linen Duvet Cover"],
  "home-decor": ["Ceramic Vase", "Woven Basket", "Terracotta Planter"],
  "home-kitchen": ["Stoneware Mug Set", "Acacia Serving Board", "Linen Napkins"],
};

type Family =
  | "dresses"
  | "tops"
  | "ethnic"
  | "denim"
  | "footwear"
  | "shirts"
  | "tshirts"
  | "accessories"
  | "kids"
  | "fragrance"
  | "makeup"
  | "skincare"
  | "bath"
  | "jewellery"
  | "home-bed"
  | "home-decor"
  | "home-kitchen"
  | "apparel";

function familyOf(category: string): Family {
  if (category.includes("footwear")) return "footwear";
  if (category.includes("ethnic")) return "ethnic";
  if (category.includes("denim")) return "denim";
  if (category.includes("tshirts")) return "tshirts";
  if (category.includes("tops")) return "tops";
  if (category.includes("dresses")) return "dresses";
  if (category.includes("shirts")) return "shirts";
  if (category.includes("accessories")) return "accessories";
  if (category.startsWith("kids")) return "kids";
  if (category.startsWith("perfumes")) return "fragrance";
  if (category.startsWith("jewellery")) return "jewellery";
  if (category === "beauty-makeup") return "makeup";
  if (category === "beauty-skincare") return "skincare";
  if (category === "beauty-bath") return "bath";
  if (category === "home-bed" || category === "home-decor" || category === "home-kitchen")
    return category;
  return "apparel";
}

/** Middle lines describe the actual product type so copy matches the photo. */
const FAMILY_COPY: Record<Family, string[]> = {
  dresses: [
    "Cut with a fluid drape that skims the body and moves with you.",
    "A flattering silhouette that layers easily under a jacket or wears on its own.",
  ],
  tops: [
    "An easy layering piece with a clean neckline and a relaxed, un-fussy fit.",
    "Lightweight enough for everyday, with a shape that tucks in or wears loose.",
  ],
  ethnic: [
    "Detailed with traditional motifs and finished for all-day comfort.",
    "A festive-ready piece that pairs with statement jewellery or keeps it minimal.",
  ],
  denim: [
    "Constructed with a touch of stretch so it holds its shape through the day.",
    "A wardrobe workhorse that dresses up with heels or down with sneakers.",
  ],
  footwear: [
    "Built on a cushioned footbed for comfort from morning to night.",
    "A versatile pair that carries a look from the office to the weekend.",
  ],
  shirts: [
    "Tailored with a considered collar and a clean, regular fit through the body.",
    "Crisp enough for work, relaxed enough to wear open over a tee.",
  ],
  tshirts: [
    "Knitted from a soft, breathable yarn that keeps its shape wash after wash.",
    "An everyday essential with a comfortable, easy-wearing fit.",
  ],
  accessories: [
    "A finishing detail crafted to sharpen up any outfit.",
    "Understated hardware and clean lines make it easy to pair.",
  ],
  kids: [
    "Made from gentle, skin-friendly fabric that stands up to play and washing.",
    "Easy on, easy off — with a comfortable fit that lets them move freely.",
  ],
  fragrance: [
    "A layered composition that opens bright and settles into a warm, lasting base.",
    "Long-wearing on skin, with a trail that carries through the day.",
  ],
  makeup: [
    "A blendable, buildable formula for a finish that lasts.",
    "Skin-friendly pigments that layer smoothly and stay put.",
  ],
  skincare: [
    "A lightweight formula that absorbs quickly without leaving residue.",
    "Formulated for daily use across most skin types.",
  ],
  bath: [
    "A nourishing formula that leaves skin soft, clean and lightly scented.",
    "Gentle enough for daily use, with a fragrance that lingers.",
  ],
  jewellery: [
    "Finished with a considered shine that dresses up any look.",
    "A versatile piece to layer up or wear on its own.",
  ],
  "home-bed": [
    "Woven for a soft handle that only gets better with every wash.",
    "Breathable and durable, made for everyday comfort.",
  ],
  "home-decor": [
    "A handcrafted accent that adds texture and warmth to any corner.",
    "Finished by hand, so each piece carries its own small variations.",
  ],
  "home-kitchen": [
    "Durable, easy to clean, and made for everyday use at the table.",
    "A practical piece that looks as good as it works.",
  ],
  apparel: [
    "Cut from a soft, breathable fabric with a relaxed, easy drape.",
    "A versatile piece that slots straight into your everyday rotation.",
  ],
};

const CLOSERS = [
  "Finished with clean seams and considered detailing throughout.",
  "Thoughtfully made to look good and last.",
  "An easy addition you'll reach for again and again.",
  "Designed to work as hard as your wardrobe does.",
];

function buildDescription(
  name: string,
  category: string,
  color: string,
  seed: number,
): string {
  const family = familyOf(category);
  const opener =
    family === "fragrance" ||
    family === "makeup" ||
    family === "skincare" ||
    family === "bath"
      ? `The ${name} — a considered addition to your everyday routine.`
      : family.startsWith("home")
        ? `The ${name}, made to bring a little more ease to your space.`
        : `Meet the ${name} in ${color.toLowerCase()}.`;
  const middle = pick(FAMILY_COPY[family], seed);
  const closer = pick(CLOSERS, seed, 1);
  return `${opener} ${middle} ${closer}`;
}

/** Small deterministic hash so prices/ratings stay stable between server and client renders. */
function hash(input: string) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function pick<T>(list: readonly T[], seed: number, offset = 0) {
  return list[(seed + offset) % list.length];
}

function sizesFor(category: string) {
  if (category.includes("footwear")) return SHOE_SIZES;
  if (
    category.startsWith("beauty") ||
    category.startsWith("home") ||
    category.startsWith("perfumes") ||
    category.startsWith("jewellery")
  )
    return ONE_SIZE;
  if (category === "men-accessories") return ONE_SIZE;
  return APPAREL_SIZES;
}

function toSlug(category: string, name: string) {
  return `${category}-${name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")}`;
}

/**
 * Imported H&M categories replace the placeholder names outright; categories the
 * dataset doesn't cover (ethnic wear, perfumes, beauty, jewellery, home) keep theirs.
 */
const CATALOG_NAMES: Record<string, string[]> = {
  ...NAMES,
  ...Object.fromEntries(
    Object.entries(HNM_PRODUCTS)
      .filter(([, products]) => products.length > 0)
      .map(([category, products]) => [category, products.map((p) => p.name)]),
  ),
};

/** slug -> real detail_desc, for products that came from the dataset. */
const HNM_DESCRIPTIONS = new Map<string, string>(
  Object.entries(HNM_PRODUCTS).flatMap(([category, products]) =>
    products.map((p) => [toSlug(category, p.name), p.description] as const),
  ),
);

function buildProduct(category: string, name: string): Product {
  const slug = toSlug(category, name);
  const seed = hash(slug);
  const onSale = category.startsWith("sale") || seed % 3 === 0;
  const compareAt = 999 + (seed % 40) * 100;
  const price = onSale ? Math.round((compareAt * (65 + (seed % 25))) / 100) : compareAt;
  const colors = [pick(COLORS, seed), pick(COLORS, seed, 3), pick(COLORS, seed, 5)];

  return {
    slug,
    name,
    brand: pick(BRANDS, seed),
    price,
    compareAt: onSale ? compareAt : null,
    category,
    department: CATEGORY_INDEX[category]?.parent ?? "Shop",
    colors,
    sizes: sizesFor(category),
    rating: 3.6 + (seed % 14) / 10,
    reviews: 12 + (seed % 380),
    images:
      (PRODUCT_IMAGES[slug]?.length ?? 0) > 0
        ? PRODUCT_IMAGES[slug]
        : productImages(category, seed),
    description:
      HNM_DESCRIPTIONS.get(slug) ?? buildDescription(name, category, colors[0], seed),
  };
}

export const PRODUCTS: Product[] = Object.entries(CATALOG_NAMES).flatMap(
  ([category, names]) => names.map((name) => buildProduct(category, name)),
);

export function productsIn(category: string) {
  return PRODUCTS.filter((p) => p.category === category);
}

export function productsInDepartment(topSlug: string) {
  const top = NAV.find((c) => c.slug === topSlug);
  if (!top) return [];
  const slugs = new Set((top.children ?? []).map((c) => c.slug));
  return PRODUCTS.filter((p) => slugs.has(p.category));
}

export function getProduct(slug: string) {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function relatedProducts(product: Product, limit = 6) {
  return PRODUCTS.filter(
    (p) => p.category === product.category && p.slug !== product.slug,
  ).slice(0, limit);
}

export function onSaleProducts(limit = 8, imageOffset = 0) {
  const sale = PRODUCTS.filter((p) => p.compareAt !== null).slice(0, limit);
  if (imageOffset === 0) return sale;
  // Re-pick each product's photos from its pool so the rail looks distinct.
  return sale.map((p) =>
    (PRODUCT_IMAGES[p.slug]?.length ?? 0) > 0
      ? p
      : { ...p, images: productImages(p.category, hash(p.slug), 4, imageOffset) },
  );
}

export function newArrivals(limit = 8) {
  return [...PRODUCTS]
    .sort((a, b) => hash(b.slug) - hash(a.slug))
    .slice(0, limit);
}

export function searchProducts(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return PRODUCTS.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.department.toLowerCase().includes(q) ||
      (CATEGORY_INDEX[p.category]?.name ?? "").toLowerCase().includes(q),
  );
}
