import "server-only";
import { randomUUID } from "node:crypto";
import { pool } from "@/lib/db";

export type OrderStatus = "pending" | "paid" | "failed";

export type ShippingAddress = {
  name: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  pincode: string;
};

export type OrderItem = {
  slug: string;
  name: string;
  brand: string;
  size: string;
  color: string;
  unitPrice: number;
  qty: number;
  image: string;
};

export type Order = {
  id: string;
  userId: string;
  status: OrderStatus;
  subtotal: number;
  shipping: number;
  total: number;
  currency: string;
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  address: ShippingAddress;
  createdAt: Date;
  paidAt: Date | null;
  items: OrderItem[];
};

type OrderRow = {
  id: string;
  user_id: string;
  status: OrderStatus;
  subtotal: number;
  shipping: number;
  total: number;
  currency: string;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  ship_name: string;
  ship_phone: string;
  ship_line1: string;
  ship_line2: string | null;
  ship_city: string;
  ship_state: string;
  ship_pincode: string;
  created_at: Date;
  paid_at: Date | null;
};

type ItemRow = {
  order_id: string;
  slug: string;
  name: string;
  brand: string;
  size: string;
  color: string;
  unit_price: number;
  qty: number;
  image: string;
};

function toOrder(row: OrderRow, items: ItemRow[]): Order {
  return {
    id: row.id,
    userId: row.user_id,
    status: row.status,
    subtotal: row.subtotal,
    shipping: row.shipping,
    total: row.total,
    currency: row.currency,
    razorpayOrderId: row.razorpay_order_id,
    razorpayPaymentId: row.razorpay_payment_id,
    address: {
      name: row.ship_name,
      phone: row.ship_phone,
      line1: row.ship_line1,
      line2: row.ship_line2,
      city: row.ship_city,
      state: row.ship_state,
      pincode: row.ship_pincode,
    },
    createdAt: row.created_at,
    paidAt: row.paid_at,
    items: items.map((i) => ({
      slug: i.slug,
      name: i.name,
      brand: i.brand,
      size: i.size,
      color: i.color,
      unitPrice: i.unit_price,
      qty: i.qty,
      image: i.image,
    })),
  };
}

/**
 * Writes the order and its lines in one transaction, so a failure halfway
 * through can't leave an order with no items attached to it.
 */
export async function createOrder(input: {
  userId: string;
  subtotal: number;
  shipping: number;
  total: number;
  address: ShippingAddress;
  items: OrderItem[];
  razorpayOrderId: string;
}): Promise<string> {
  const id = randomUUID();
  const client = await pool.connect();

  try {
    await client.query("begin");
    await client.query(
      `insert into orders (
         id, user_id, subtotal, shipping, total, razorpay_order_id,
         ship_name, ship_phone, ship_line1, ship_line2, ship_city, ship_state, ship_pincode
       ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
      [
        id,
        input.userId,
        input.subtotal,
        input.shipping,
        input.total,
        input.razorpayOrderId,
        input.address.name,
        input.address.phone,
        input.address.line1,
        input.address.line2,
        input.address.city,
        input.address.state,
        input.address.pincode,
      ],
    );

    for (const item of input.items) {
      await client.query(
        `insert into order_items (order_id, slug, name, brand, size, color, unit_price, qty, image)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [
          id,
          item.slug,
          item.name,
          item.brand,
          item.size,
          item.color,
          item.unitPrice,
          item.qty,
          item.image,
        ],
      );
    }

    await client.query("commit");
    return id;
  } catch (err) {
    await client.query("rollback");
    throw err;
  } finally {
    client.release();
  }
}

export async function getOrderByRazorpayId(razorpayOrderId: string) {
  const { rows } = await pool.query<OrderRow>(
    "select * from orders where razorpay_order_id = $1",
    [razorpayOrderId],
  );
  return rows[0] ?? null;
}

/**
 * Flips a pending order to paid. Scoped to `status = 'pending'` so a replayed
 * verify request can't overwrite an already-settled order, and returns whether
 * this call was the one that actually moved it.
 */
export async function markOrderPaid(orderId: string, razorpayPaymentId: string) {
  const { rowCount } = await pool.query(
    `update orders
        set status = 'paid', razorpay_payment_id = $2, paid_at = now()
      where id = $1 and status = 'pending'`,
    [orderId, razorpayPaymentId],
  );
  return (rowCount ?? 0) > 0;
}

export async function markOrderFailed(orderId: string) {
  await pool.query(
    "update orders set status = 'failed' where id = $1 and status = 'pending'",
    [orderId],
  );
}

/** Always scoped by user — an order id in the URL must not be enough to read someone else's order. */
export async function getOrder(id: string, userId: string): Promise<Order | null> {
  const { rows } = await pool.query<OrderRow>(
    "select * from orders where id = $1 and user_id = $2",
    [id, userId],
  );
  if (!rows[0]) return null;

  const { rows: items } = await pool.query<ItemRow>(
    "select * from order_items where order_id = $1 order by id",
    [id],
  );
  return toOrder(rows[0], items);
}

export async function listOrders(userId: string): Promise<Order[]> {
  const { rows } = await pool.query<OrderRow>(
    "select * from orders where user_id = $1 order by created_at desc",
    [userId],
  );
  if (rows.length === 0) return [];

  const { rows: items } = await pool.query<ItemRow>(
    "select * from order_items where order_id = any($1::text[]) order by id",
    [rows.map((r) => r.id)],
  );
  return rows.map((row) =>
    toOrder(
      row,
      items.filter((i) => i.order_id === row.id),
    ),
  );
}
