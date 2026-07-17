/**
 * Imports real product names, descriptions and photos from the Kaggle H&M
 * "Personalized Fashion Recommendations" dataset into the catalog.
 *
 *   node scripts/import-hnm.mjs --data <path-to-extracted-dataset>
 *
 * Expects the extracted dataset to look like:
 *   <data>/articles.csv
 *   <data>/images/010/0108775015.jpg
 *
 * Writes:
 *   lib/hnm-products.ts            real prod_name + detail_desc per category
 *   public/products/<slug>/NN.jpg  real photos, picked up by `npm run images`
 *
 * Only clothing categories are touched. Ethnic wear, perfumes, beauty, jewellery
 * and home have no H&M equivalent and keep their existing placeholder copy/photos.
 */

import { createReadStream, existsSync } from "node:fs";
import { copyFile, mkdir, readdir, rm, writeFile } from "node:fs/promises";
import { createInterface } from "node:readline";
import { join } from "node:path";

const ROOT = process.cwd();
const OUT_FILE = join(ROOT, "lib", "hnm-products.ts");
const PRODUCTS_DIR = join(ROOT, "public", "products");

/**
 * How many distinct products to import per category, and how many photos each.
 * Override the per-category count with `--per-category N`.
 */
const PER_CATEGORY = readCount("--per-category", 6);
const IMAGES_PER_PRODUCT = 3;

/** Sale is a curated slice, so it stays at half the depth of a full category. */
const SALE_PER_CATEGORY = Math.max(1, Math.round(PER_CATEGORY / 2));

function readCount(flag, fallback) {
  const i = process.argv.indexOf(flag);
  if (i === -1) return fallback;
  const n = Number(process.argv[i + 1]);
  if (!Number.isInteger(n) || n < 1) {
    console.error(`${flag} needs a positive integer, got: ${process.argv[i + 1]}`);
    process.exit(1);
  }
  return n;
}

/**
 * Maps our category slugs onto H&M's taxonomy. `group` matches index_group_name,
 * `types` matches product_type_name. Anything not listed here is left alone.
 */
const CATEGORY_RULES = {
  "women-dresses": {
    group: ["Ladieswear", "Divided"],
    types: ["Dress", "Jumpsuit/Playsuit"],
  },
  "women-tops": {
    group: ["Ladieswear", "Divided"],
    types: ["Blouse", "Top", "Vest top", "Sweater", "T-shirt"],
  },
  "women-denim": {
    group: ["Ladieswear", "Divided"],
    types: ["Trousers", "Jeans", "Skirt"],
  },
  "women-footwear": {
    group: ["Ladieswear", "Divided"],
    types: ["Sneakers", "Boots", "Heeled sandals", "Ballerinas", "Other shoe"],
  },
  "men-shirts": { group: ["Menswear"], types: ["Shirt"] },
  "men-tshirts": { group: ["Menswear"], types: ["T-shirt", "Polo shirt", "Sweater"] },
  "men-denim": { group: ["Menswear"], types: ["Trousers", "Jeans", "Shorts"] },
  "men-footwear": {
    group: ["Menswear"],
    types: ["Sneakers", "Boots", "Other shoe", "Sandals"],
  },
  "men-accessories": {
    group: ["Menswear"],
    types: ["Belt", "Cap/peaked", "Hat/beanie", "Tie", "Gloves", "Scarf"],
  },
  "kids-baby": { index: ["Baby Sizes 50-98"], types: null },
  "kids-junior": { index: ["Children Sizes 92-140"], types: null },
  "kids-teen": { index: ["Children Sizes 134-170"], types: null },
  "sale-women": {
    group: ["Ladieswear"],
    types: ["Dress", "Blouse", "Trousers"],
    limit: SALE_PER_CATEGORY,
  },
  "sale-men": {
    group: ["Menswear"],
    types: ["Shirt", "T-shirt", "Trousers"],
    limit: SALE_PER_CATEGORY,
  },
  "sale-kids": { index: ["Children Sizes 92-140"], types: null, limit: SALE_PER_CATEGORY },
};

function parseArgs() {
  const i = process.argv.indexOf("--data");
  if (i === -1 || !process.argv[i + 1]) {
    console.error(
      "Usage: node scripts/import-hnm.mjs --data <path-to-extracted-hnm-dataset>\n\n" +
        "Get the dataset from:\n" +
        "  https://www.kaggle.com/competitions/h-and-m-personalized-fashion-recommendations/data\n" +
        "You must accept the competition rules first. The folder should contain\n" +
        "articles.csv and an images/ directory.",
    );
    process.exit(1);
  }
  return process.argv[i + 1];
}

/**
 * Minimal RFC4180 line parser. detail_desc contains commas and quoted quotes,
 * so splitting on "," would corrupt every description.
 */
function parseCsvLine(line) {
  const out = [];
  let field = "";
  let quoted = false;

  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (quoted) {
      if (c === '"') {
        if (line[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          quoted = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      quoted = true;
    } else if (c === ",") {
      out.push(field);
      field = "";
    } else {
      field += c;
    }
  }
  out.push(field);
  return out;
}

/** article_id is numeric in the CSV but zero-padded to 10 digits on disk. */
function imagePathFor(dataDir, articleId) {
  const id = String(articleId).padStart(10, "0");
  return join(dataDir, "images", id.slice(0, 3), `${id}.jpg`);
}

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function matches(rule, row) {
  if (rule.index) return rule.index.includes(row.index_name);
  if (rule.group && !rule.group.includes(row.index_group_name)) return false;
  if (rule.types && !rule.types.includes(row.product_type_name)) return false;
  return true;
}

async function readArticles(dataDir) {
  const csvPath = join(dataDir, "articles.csv");
  if (!existsSync(csvPath)) {
    console.error(`articles.csv not found at ${csvPath}`);
    process.exit(1);
  }

  // articles.csv is ~105k rows; stream it rather than loading the whole file.
  const rl = createInterface({
    input: createReadStream(csvPath, "utf8"),
    crlfDelay: Infinity,
  });

  let header = null;
  // category -> product_code -> { name, description, articleIds[] }
  const buckets = Object.fromEntries(
    Object.keys(CATEGORY_RULES).map((c) => [c, new Map()]),
  );

  for await (const line of rl) {
    if (!line.trim()) continue;
    const cells = parseCsvLine(line);
    if (!header) {
      header = cells;
      continue;
    }
    const row = Object.fromEntries(header.map((h, i) => [h, cells[i] ?? ""]));
    if (!row.detail_desc || !row.prod_name) continue;

    for (const [category, rule] of Object.entries(CATEGORY_RULES)) {
      const bucket = buckets[category];
      const cap = rule.limit ?? PER_CATEGORY;
      if (!matches(rule, row)) continue;

      // Group by product_code: one product, several colourways = several photos.
      const existing = bucket.get(row.product_code);
      if (existing) {
        if (existing.articleIds.length < IMAGES_PER_PRODUCT) {
          existing.articleIds.push(row.article_id);
        }
        continue;
      }
      if (bucket.size >= cap) continue;
      bucket.set(row.product_code, {
        name: row.prod_name,
        description: row.detail_desc,
        articleIds: [row.article_id],
      });
    }
  }

  return buckets;
}

async function copyImages(dataDir, buckets) {
  let copied = 0;
  let missing = 0;
  let collided = 0;
  const kept = {};
  // H&M reuses product names within a category ("Arty shirt" twice) and varies
  // only by case ("PINE Regular" / "PINE regular"), both of which slugify to the
  // same value. Two products sharing a slug would share a URL and overwrite each
  // other's photo directory, so the first one wins.
  const usedSlugs = new Set();

  for (const [category, bucket] of Object.entries(buckets)) {
    kept[category] = [];

    for (const product of bucket.values()) {
      const slug = `${category}-${slugify(product.name)}`;
      if (usedSlugs.has(slug)) {
        collided++;
        continue;
      }
      usedSlugs.add(slug);
      const dir = join(PRODUCTS_DIR, slug);

      const sources = [];
      for (const id of product.articleIds) {
        const src = imagePathFor(dataDir, id);
        if (existsSync(src)) sources.push(src);
        else missing++;
      }

      // A product with no photo on disk would silently fall back to an Unsplash
      // placeholder, mixing real and stock imagery. Skip it instead.
      if (sources.length === 0) continue;

      await mkdir(dir, { recursive: true });
      // Clear stale files so re-runs don't leave orphans from a previous import.
      for (const f of await readdir(dir)) await rm(join(dir, f));

      for (const [i, src] of sources.entries()) {
        await copyFile(src, join(dir, `${String(i + 1).padStart(2, "0")}.jpg`));
        copied++;
      }
      kept[category].push({ name: product.name, description: product.description });
    }
  }

  return { kept, copied, missing, collided };
}

function render(kept) {
  const entries = Object.entries(kept)
    .filter(([, products]) => products.length > 0)
    .map(([category, products]) => {
      const body = products
        .map(
          (p) =>
            `    { name: ${JSON.stringify(p.name)}, description: ${JSON.stringify(
              p.description,
            )} },`,
        )
        .join("\n");
      return `  ${JSON.stringify(category)}: [\n${body}\n  ],`;
    })
    .join("\n");

  return `/**
 * AUTO-GENERATED by scripts/import-hnm.mjs — don't edit by hand.
 *
 * Real product names and descriptions from the Kaggle H&M "Personalized Fashion
 * Recommendations" dataset. Categories listed here replace the placeholder names
 * in lib/catalog.ts; everything else keeps its generated copy.
 */
export type HnmProduct = { name: string; description: string };

export const HNM_PRODUCTS: Record<string, HnmProduct[]> = {
${entries}
};
`;
}

const dataDir = parseArgs();
console.log(`Reading ${join(dataDir, "articles.csv")} …`);
const buckets = await readArticles(dataDir);

console.log("Copying photos …");
const { kept, copied, missing, collided } = await copyImages(dataDir, buckets);

await writeFile(OUT_FILE, render(kept), "utf8");

const total = Object.values(kept).reduce((n, a) => n + a.length, 0);
console.log(`\nWrote lib/hnm-products.ts — ${total} product(s) across ${
  Object.values(kept).filter((a) => a.length).length
} categories.`);
console.log(`Copied ${copied} image(s) into public/products/.`);
if (missing > 0) {
  console.log(`${missing} image(s) were listed in articles.csv but absent on disk.`);
}
if (collided > 0) {
  console.log(`${collided} product(s) skipped — their name slugifies to one already taken.`);
}
console.log("\nNext: npm run images");
