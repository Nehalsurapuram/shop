import "server-only";
import { pool } from "./db";

/** A row of the persisted catalog mirror. Seeded by scripts/seed-products.mjs. */
export type ProductRow = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: string;
  department: string;
  price: number;
  compareAt: number | null;
  rating: number;
  reviews: number;
  description: string;
  image: string | null;
};

/** A buyable variety of a product — one size x colour combination. */
export type ProductVariant = {
  id: string;
  productId: string;
  sku: string;
  size: string;
  color: string;
  /** Override in whole rupees, or null to inherit the product's price. */
  price: number | null;
  stock: number;
};

/** A resolved link from a cart line to the catalog mirror, for order_items. */
export type VariantRef = { productId: string; variantId: string };

/**
 * Resolves a (slug, size, colour) selection to its product + variant ids.
 * Returns null when the catalog mirror hasn't been seeded, or the variant
 * doesn't exist — callers store null rather than failing the order.
 */
export async function getVariantRef(
  slug: string,
  size: string,
  color: string,
): Promise<VariantRef | null> {
  const { rows } = await pool.query<{ variant_id: string; product_id: string }>(
    `select v.id as variant_id, v.product_id
       from product_variants v
       join products p on p.id = v.product_id
      where p.slug = $1 and v.size = $2 and v.color = $3
      limit 1`,
    [slug, size, color],
  );
  const row = rows[0];
  return row ? { productId: row.product_id, variantId: row.variant_id } : null;
}

/** All variants of a product, ordered for stable display. */
export async function getProductVariants(slug: string): Promise<ProductVariant[]> {
  const { rows } = await pool.query<{
    id: string;
    product_id: string;
    sku: string;
    size: string;
    color: string;
    price: number | null;
    stock: number;
  }>(
    `select v.id, v.product_id, v.sku, v.size, v.color, v.price, v.stock
       from product_variants v
       join products p on p.id = v.product_id
      where p.slug = $1
      order by v.size, v.color`,
    [slug],
  );
  return rows.map((r) => ({
    id: r.id,
    productId: r.product_id,
    sku: r.sku,
    size: r.size,
    color: r.color,
    price: r.price,
    stock: r.stock,
  }));
}
