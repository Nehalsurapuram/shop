import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import Razorpay from "razorpay";

/**
 * The key id is public (the browser needs it to open the checkout widget); the
 * secret never leaves the server. Both are read lazily so a missing key surfaces
 * as a clear error at checkout rather than crashing the whole app at import.
 */
export function razorpayConfigured() {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}

export function getRazorpay() {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    throw new Error(
      "Razorpay is not configured — set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env.local",
    );
  }
  return new Razorpay({ key_id, key_secret });
}

/**
 * Razorpay signs `<order_id>|<payment_id>` with the key secret. Anyone can POST
 * to our verify endpoint claiming a payment succeeded, so this signature is the
 * only thing that proves it did — the browser's word is worth nothing here.
 */
export function isValidPaymentSignature(input: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  signature: string;
}) {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return false;

  const expected = createHmac("sha256", secret)
    .update(`${input.razorpayOrderId}|${input.razorpayPaymentId}`)
    .digest();

  let received: Buffer;
  try {
    received = Buffer.from(input.signature, "hex");
  } catch {
    return false;
  }

  // Compare in constant time, and only when the lengths match — timingSafeEqual
  // throws on a length mismatch rather than returning false.
  if (received.length !== expected.length) return false;
  return timingSafeEqual(received, expected);
}
