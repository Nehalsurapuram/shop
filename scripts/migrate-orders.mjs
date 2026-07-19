/**
 * Creates the order tables. Better Auth owns user/session/account/verification
 * and migrates those itself (`npx @better-auth/cli migrate`); this covers the
 * tables the store adds on top.
 *
 *   npm run db:migrate
 *
 * Safe to re-run — every statement is IF NOT EXISTS.
 */
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Money is stored as whole rupees, matching the catalog. Paise only exist at the
// Razorpay boundary, where the amount gets multiplied on the way out.
const SQL = `
-- Persisted mirror of the generated catalog (lib/catalog.ts). Seeded by
-- scripts/seed-products.mjs so orders can reference a real product + variant
-- by id. The app still renders from the generated catalog for now.
create table if not exists products (
  id text primary key,
  slug text unique not null,
  name text not null,
  brand text not null,
  category text not null,
  department text not null,
  price integer not null check (price >= 0),
  compare_at integer check (compare_at is null or compare_at >= 0),
  rating real not null default 0,
  reviews integer not null default 0,
  description text not null default '',
  image text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- One row per buyable variety of a product: a size x colour combination, each
-- with its own SKU, optional price override (null => inherit products.price)
-- and stock count.
create table if not exists product_variants (
  id text primary key,
  product_id text not null references products(id) on delete cascade,
  sku text unique not null,
  size text not null,
  color text not null,
  price integer check (price is null or price >= 0),
  stock integer not null default 0 check (stock >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, size, color)
);

create table if not exists orders (
  id text primary key,
  user_id text not null references "user"(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed')),
  subtotal integer not null check (subtotal >= 0),
  shipping integer not null check (shipping >= 0),
  total integer not null check (total >= 0),
  currency text not null default 'INR',
  razorpay_order_id text unique,
  razorpay_payment_id text,
  ship_name text not null,
  ship_phone text not null,
  ship_line1 text not null,
  ship_line2 text,
  ship_city text not null,
  ship_state text not null,
  ship_pincode text not null,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

-- The slug/name/brand/... columns stay as a denormalised snapshot so an order
-- always shows what was actually bought, even if the product or its price later
-- changes. product_id/variant_id add a live reference to the catalog mirror;
-- both are 'on delete set null' so pruning a product never deletes order history.
create table if not exists order_items (
  id bigserial primary key,
  order_id text not null references orders(id) on delete cascade,
  product_id text references products(id) on delete set null,
  variant_id text references product_variants(id) on delete set null,
  slug text not null,
  name text not null,
  brand text not null,
  size text not null,
  color text not null,
  unit_price integer not null check (unit_price >= 0),
  qty integer not null check (qty > 0),
  image text not null
);

-- Backfill the reference columns onto databases whose order_items predates them.
alter table order_items add column if not exists product_id text references products(id) on delete set null;
alter table order_items add column if not exists variant_id text references product_variants(id) on delete set null;

create index if not exists orders_user_id_idx on orders (user_id, created_at desc);
create index if not exists order_items_order_id_idx on order_items (order_id);
create index if not exists product_variants_product_id_idx on product_variants (product_id);
create index if not exists order_items_product_id_idx on order_items (product_id);
create index if not exists order_items_variant_id_idx on order_items (variant_id);
`;

try {
  await pool.query(SQL);
  const { rows } = await pool.query(
    `select table_name from information_schema.tables
     where table_schema = 'public'
       and table_name in ('products', 'product_variants', 'orders', 'order_items')
     order by table_name`,
  );
  console.log(`Ready: ${rows.map((r) => r.table_name).join(", ")}`);
} catch (err) {
  console.error(`Migration failed: ${err.message}`);
  process.exitCode = 1;
} finally {
  await pool.end();
}
