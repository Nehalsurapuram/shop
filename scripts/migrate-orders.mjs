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

create table if not exists order_items (
  id bigserial primary key,
  order_id text not null references orders(id) on delete cascade,
  slug text not null,
  name text not null,
  brand text not null,
  size text not null,
  color text not null,
  unit_price integer not null check (unit_price >= 0),
  qty integer not null check (qty > 0),
  image text not null
);

create index if not exists orders_user_id_idx on orders (user_id, created_at desc);
create index if not exists order_items_order_id_idx on order_items (order_id);
`;

try {
  await pool.query(SQL);
  const { rows } = await pool.query(
    `select table_name from information_schema.tables
     where table_schema = 'public' and table_name in ('orders', 'order_items')
     order by table_name`,
  );
  console.log(`Ready: ${rows.map((r) => r.table_name).join(", ")}`);
} catch (err) {
  console.error(`Migration failed: ${err.message}`);
  process.exitCode = 1;
} finally {
  await pool.end();
}
