import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getOrderByRazorpayId, markOrderFailed, markOrderPaid } from "@/lib/orders";
import { isValidPaymentSignature } from "@/lib/razorpay";

/**
 * Called by the browser after Razorpay's widget reports success. The browser is
 * not trusted: the order is only marked paid if the signature Razorpay produced
 * with our key secret checks out, and if the order belongs to the caller.
 */
export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: "Not signed in." }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Malformed request body." }, { status: 400 });
  }

  const {
    razorpay_order_id: razorpayOrderId,
    razorpay_payment_id: razorpayPaymentId,
    razorpay_signature: signature,
  } = (body ?? {}) as Record<string, unknown>;

  if (
    typeof razorpayOrderId !== "string" ||
    typeof razorpayPaymentId !== "string" ||
    typeof signature !== "string"
  ) {
    return Response.json({ error: "Missing payment details." }, { status: 400 });
  }

  const order = await getOrderByRazorpayId(razorpayOrderId);
  if (!order) return Response.json({ error: "Unknown order." }, { status: 404 });

  // Don't leak whether someone else's order exists — same shape as "unknown".
  if (order.user_id !== session.user.id) {
    return Response.json({ error: "Unknown order." }, { status: 404 });
  }

  if (!isValidPaymentSignature({ razorpayOrderId, razorpayPaymentId, signature })) {
    await markOrderFailed(order.id);
    return Response.json({ error: "Payment could not be verified." }, { status: 400 });
  }

  // Already settled by an earlier call — treat as success so a double-submit or
  // a refresh doesn't show the customer an error for a payment that went through.
  const moved = await markOrderPaid(order.id, razorpayPaymentId);
  if (!moved && order.status !== "paid") {
    return Response.json({ error: "This order can no longer be paid." }, { status: 409 });
  }

  return Response.json({ orderId: order.id });
}
