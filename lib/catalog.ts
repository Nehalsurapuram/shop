import { apparelImage, CATEGORY_KEYWORDS } from "./images";

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
    name: "Women",
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
    name: "Men",
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
    slug: "beauty",
    name: "Beauty",
    children: [
      { slug: "beauty-fragrance", name: "Perfumes" },
      { slug: "beauty-makeup", name: "Makeup" },
      { slug: "beauty-skincare", name: "Skincare" },
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
  "beauty-fragrance": ["Amber Oud EDP", "Citrus Neroli EDT", "Vetiver Musk EDP"],
  "beauty-makeup": ["Satin Matte Lipstick", "Gel Eyeliner", "Blurring Compact"],
  "beauty-skincare": ["Vitamin C Serum", "Ceramide Moisturiser", "Clay Cleanser"],
  "home-bed": ["Cotton Percale Bedsheet", "Waffle Throw", "Linen Duvet Cover"],
  "home-decor": ["Ceramic Vase", "Woven Basket", "Terracotta Planter"],
  "home-kitchen": ["Stoneware Mug Set", "Acacia Serving Board", "Linen Napkins"],
};

const DESCRIPTION =
  "Cut from a soft, breathable fabric with a relaxed drape that holds its shape wash after wash. Finished with clean seams and considered detailing — an easy piece to build a week of outfits around.";

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
  if (category.startsWith("beauty") || category.startsWith("home"))
    return ONE_SIZE;
  if (category === "men-accessories") return ONE_SIZE;
  return APPAREL_SIZES;
}

function buildProduct(category: string, name: string): Product {
  const slug = `${category}-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  const seed = hash(slug);
  const onSale = category.startsWith("sale") || seed % 3 === 0;
  const compareAt = 999 + (seed % 40) * 100;
  const price = onSale ? Math.round((compareAt * (65 + (seed % 25))) / 100) : compareAt;

  return {
    slug,
    name,
    brand: pick(BRANDS, seed),
    price,
    compareAt: onSale ? compareAt : null,
    category,
    department: CATEGORY_INDEX[category]?.parent ?? "Shop",
    colors: [pick(COLORS, seed), pick(COLORS, seed, 3), pick(COLORS, seed, 5)],
    sizes: sizesFor(category),
    rating: 3.6 + (seed % 14) / 10,
    reviews: 12 + (seed % 380),
    images: [0, 1, 2, 3].map((i) =>
      apparelImage(CATEGORY_KEYWORDS[category] ?? "fashion,clothing", seed + i),
    ),
    description: DESCRIPTION,
  };
}

export const PRODUCTS: Product[] = Object.entries(NAMES).flatMap(
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

export function onSaleProducts(limit = 8) {
  return PRODUCTS.filter((p) => p.compareAt !== null).slice(0, limit);
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
