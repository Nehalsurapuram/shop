/**
 * Placeholder apparel photography.
 *
 * LoremFlickr serves keyword-matched Creative-Commons photos from Flickr; the `lock`
 * param pins a deterministic image so server and client render the same URL and it
 * stays stable between visits. These are generic stock shots for demo purposes —
 * swap this helper for your own product image CDN before going live.
 */
export function apparelImage(
  keywords: string,
  lock: number,
  w = 800,
  h = 1000,
) {
  const safeLock = Math.abs(lock) % 1_000_000;
  return `https://loremflickr.com/${w}/${h}/${encodeURIComponent(keywords)}?lock=${safeLock}`;
}

/** Search keywords per leaf category, so each grid shows the right kind of product. */
export const CATEGORY_KEYWORDS: Record<string, string> = {
  "sale-women": "womenswear,fashion",
  "sale-men": "menswear,fashion",
  "sale-kids": "kids,clothing",
  "women-dresses": "dress,fashion",
  "women-tops": "blouse,fashion",
  "women-ethnic": "saree,ethnic",
  "women-denim": "jeans,fashion",
  "women-footwear": "heels,shoes",
  "men-shirts": "shirt,menswear",
  "men-tshirts": "tshirt,menswear",
  "men-denim": "jeans,menswear",
  "men-footwear": "sneakers,shoes",
  "men-accessories": "belt,accessory",
  "kids-baby": "baby,clothes",
  "kids-junior": "kids,clothing",
  "kids-teen": "teen,fashion",
  "beauty-fragrance": "perfume,bottle",
  "beauty-makeup": "makeup,cosmetics",
  "beauty-skincare": "skincare,cosmetics",
  "home-bed": "bedding,bedroom",
  "home-decor": "home,decor",
  "home-kitchen": "kitchen,tableware",
};

/** Broader keywords per top-level department, used for banners and category tiles. */
export const DEPARTMENT_KEYWORDS: Record<string, string> = {
  women: "womenswear,fashion",
  men: "menswear,fashion",
  kids: "kids,clothing",
  beauty: "cosmetics,beauty",
  home: "home,decor",
  sale: "fashion,clothing",
};
