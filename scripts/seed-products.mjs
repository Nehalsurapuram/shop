/**
 * Seeds the products / product_variants tables from the generated catalog
 * (lib/catalog.ts), so orders can reference a real product + variant by id.
 *
 *   npm run db:seed
 *
 * Run `npm run db:migrate` first to create the tables. Safe to re-run: every
 * row is upserted on its natural key, and existing variant stock is preserved.
 *
 * Rows are written in a few chunked multi-row upserts rather than one row at a
 * time inside a big transaction — a long-lived transaction over a remote
 * serverless Postgres endpoint gets dropped (ETIMEDOUT / connection terminated).
 * Each chunk autocommits; a re-run finishes anything a failed run left behind.
 *
 * This imports the app's TypeScript catalog directly. `scripts/ts-resolve.mjs`
 * (preloaded via --import in the npm script) teaches Node to follow the
 * extensionless relative imports the lib/ files use.
 */
import { createHash } from "node:crypto";
import { Pool } from "pg";
import { PRODUCTS } from "../lib/catalog.ts";
import { productId, variantId, variantSku } from "../lib/product-ids.ts";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 30_000,
  keepAlive: true,
});
// A transient client-side error must not crash the process with an unhandled event.
pool.on("error", (err) => console.error("pg pool error:", err.message));

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Runs a query with backoff retries. The serverless Postgres endpoint is slow to
 * wake from cold and intermittently drops connections mid-handshake (ETIMEDOUT,
 * "Authentication timed out", "Connection terminated"). Every statement here is
 * an idempotent upsert, so retrying one is always safe.
 */
async function queryWithRetry(sql, values, attempts = 6) {
  let lastErr;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await pool.query(sql, values);
    } catch (err) {
      lastErr = err;
      if (attempt < attempts) {
        console.error(`  attempt ${attempt}/${attempts} failed (${err.message}); retrying…`);
        await sleep(2_000 * attempt);
      }
    }
  }
  throw lastErr;
}

/** Deterministic starting inventory so re-seeds don't churn — 4..63 per variant. */
function seedStock(id) {
  const n = parseInt(createHash("sha1").update(id).digest("hex").slice(0, 6), 16);
  return 4 + (n % 60);
}

/**
 * Inserts `rows` (arrays of column values) in chunks small enough to stay well
 * under Postgres' 65535-parameter cap and quick enough to survive a remote link.
 */
async function upsertChunked({ table, columns, rows, chunkSize, conflict }) {
  const width = columns.length;
  let written = 0;

  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    const tuples = chunk.map((_, r) => {
      const base = r * width;
      return `(${columns.map((__, c) => `$${base + c + 1}`).join(",")})`;
    });
    const values = chunk.flat();

    await queryWithRetry(
      `insert into ${table} (${columns.join(",")}) values ${tuples.join(",")} ${conflict}`,
      values,
    );
    written += chunk.length;
    process.stdout.write(`  ${table}: ${written}/${rows.length}\r`);
  }
  process.stdout.write("\n");
  return written;
}

// Flatten the catalog into product and variant row tuples up front.
const productRows = [];
const variantRows = [];
for (const product of PRODUCTS) {
  productRows.push([
    productId(product.slug),
    product.slug,
    product.name,
    product.brand,
    product.category,
    product.department,
    product.price,
    product.compareAt,
    product.rating,
    product.reviews,
    product.description,
    product.images[0] ?? null,
  ]);

  // A product's varieties are every size x colour pairing. Colours can repeat in
  // the generated catalog, so dedupe to satisfy unique(product_id, size, color).
  const colors = [...new Set(product.colors)];
  for (const size of product.sizes) {
    for (const color of colors) {
      const id = variantId(product.slug, size, color);
      variantRows.push([
        id,
        productId(product.slug),
        variantSku(product.slug, size, color),
        size,
        color,
        seedStock(id),
      ]);
    }
  }
}

try {
  // Wake the (possibly cold) serverless compute before the real work starts.
  await queryWithRetry("select 1", []);

  const products = await upsertChunked({
    table: "products",
    columns: [
      "id", "slug", "name", "brand", "category", "department",
      "price", "compare_at", "rating", "reviews", "description", "image",
    ],
    rows: productRows,
    chunkSize: 500,
    conflict: `on conflict (slug) do update set
      name = excluded.name, brand = excluded.brand, category = excluded.category,
      department = excluded.department, price = excluded.price,
      compare_at = excluded.compare_at, rating = excluded.rating,
      reviews = excluded.reviews, description = excluded.description,
      image = excluded.image, updated_at = now()`,
  });

  // Variants land after products so their product_id foreign key resolves.
  // Stock is preserved on re-seed — only catalog-derived columns are refreshed.
  const variants = await upsertChunked({
    table: "product_variants",
    columns: ["id", "product_id", "sku", "size", "color", "stock"],
    rows: variantRows,
    chunkSize: 1000,
    conflict: `on conflict (product_id, size, color) do update set
      sku = excluded.sku, updated_at = now()`,
  });

  console.log(`Seeded ${products} product(s) and ${variants} variant(s).`);
} catch (err) {
  console.error(`Seed failed: ${err.message}`);
  process.exitCode = 1;
} finally {
  await pool.end();
}
