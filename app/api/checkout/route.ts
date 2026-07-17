import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getProduct } from "@/lib/catalog";
import { createOrder, type OrderItem, type ShippingAddress } from "@/lib/orders";
import { shippingFor, toPaise } from "@/lib/pricing";
import { getRazorpay, razorpayConfigured } from "@/lib/razorpay";

const MAX_QTY_PER_LINE = 10;

type IncomingLine = { slug: string; size: string; color: string; qty: number };

function badRequest(message: string) {
  return Response.json({ error: message }, { status: 400 });
}

function parseAddress(value: unknown): ShippingAddress | null {
  if (typeof value !== "object" || value === null) return null;
  const a = value as Record<string, unknown>;

  const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  const address = {
    name: str(a.name),
    phone: str(a.phone),
    line1: str(a.line1),
    line2: str(a.line2) || null,
    city: str(a.city),
    state: str(a.state),
    pincode: str(a.pincode),
  };

  if (
    !address.name ||
    !address.line1 ||
    !address.city ||
    !address.state ||
    !/^\d{10}$/.test(address.phone) ||
    !/^\d{6}$/.test(address.pincode)
  ) {
    return null;
  }
  return address;
}

function parseLines(value: unknown): IncomingLine[] | null {
  if (!Array.isArray(value) || value.length === 0) return null;

  const lines: IncomingLine[] = [];
  for (const raw of value) {
    if (typeof raw !== "object" || raw === null) return null;
    const l = raw as Record<string, unknown>;
    const qty = Number(l.qty);
    if (
      typeof l.slug !== "string" ||
      typeof l.size !== "string" ||
      typeof l.color !== "string" ||
      !Number.isInteger(qty) ||
      qty < 1 ||
      qty > MAX_QTY_PER_LINE
    ) {
      return null;
    }
    lines.push({ slug: l.slug, size: l.size, color: l.color, qty });
  }
  return lines;
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return Response.json({ error: "Please sign in to place an order." }, { status: 401 });
  }

  if (!razorpayConfigured()) {
    return Response.json(
      { error: "Payments aren't configured on this server yet." },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest("Malformed request body.");
  }

  const { lines: rawLines, address: rawAddress } = (body ?? {}) as Record<string, unknown>;

  const address = parseAddress(rawAddress);
  if (!address) return badRequest("That delivery address looks incomplete.");

  const lines = parseLines(rawLines);
  if (!lines) return badRequest("Your bag contains an invalid item.");

  // The cart lives in localStorage, so every price it reports is attacker-controlled.
  // Names and prices are re-read from the catalog and the client's are discarded.
  const items: OrderItem[] = [];
  for (const line of lines) {
    const product = getProduct(line.slug);
    if (!product) return badRequest(`We no longer stock "${line.slug}".`);
    if (!product.sizes.includes(line.size)) {
      return badRequest(`${product.name} doesn't come in size ${line.size}.`);
    }
    if (!product.colors.includes(line.color)) {
      return badRequest(`${product.name} doesn't come in ${line.color}.`);
    }

    items.push({
      slug: product.slug,
      name: product.name,
      brand: product.brand,
      size: line.size,
      color: line.color,
      unitPrice: product.price,
      qty: line.qty,
      image: product.images[0],
    });
  }

  const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.qty, 0);
  const shipping = shippingFor(subtotal);
  const total = subtotal + shipping;

  try {
    const razorpay = getRazorpay();
    const rzpOrder = await razorpay.orders.create({
      amount: toPaise(total),
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
      notes: { userId: session.user.id },
    });

    const orderId = await createOrder({
      userId: session.user.id,
      subtotal,
      shipping,
      total,
      address,
      items,
      razorpayOrderId: rzpOrder.id,
    });

    return Response.json({
      orderId,
      razorpayOrderId: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error("Checkout failed:", err);
    return Response.json(
      { error: "We couldn't start the payment. Please try again." },
      { status: 502 },
    );
  }
}
