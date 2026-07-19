import { createHash } from "node:crypto";

/**
 * Stable identifiers for the persisted catalog mirror (products / product_variants).
 *
 * The ids are derived deterministically from the product slug and variant
 * attributes rather than auto-incremented, so:
 *   - re-running the seed is a no-op upsert (same id every time), and
 *   - order creation can resolve the same id the seed produced without a lookup.
 *
 * Node-only (uses node:crypto). Imported by server routes and the seed script,
 * never by client components.
 */

function shortHash(input: string) {
  return createHash("sha1").update(input).digest("hex").slice(0, 12);
}

export function productId(slug: string) {
  return `prod_${shortHash(slug)}`;
}

export function variantId(slug: string, size: string, color: string) {
  return `var_${shortHash(`${slug}::${size}::${color}`)}`;
}

/** Human-readable stock keeping unit. Unique because (slug, size, color) is. */
export function variantSku(slug: string, size: string, color: string) {
  const code = (value: string) =>
    value.toUpperCase().replace(/[^A-Z0-9]+/g, "").slice(0, 4) || "NA";
  return `SKU-${shortHash(slug).toUpperCase()}-${code(size)}-${code(color)}`;
}
