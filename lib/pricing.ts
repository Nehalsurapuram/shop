/**
 * Shipping rules, shared by the cart UI and the server-side order total. The
 * client's numbers are only ever a preview — checkout recomputes everything
 * from the catalog — so both sides have to read the rules from one place or a
 * customer sees one price and gets charged another.
 */
export const FREE_SHIPPING_THRESHOLD = 1499;
export const SHIPPING_FEE = 99;

export function shippingFor(subtotal: number) {
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
}

/** Razorpay bills in the currency's smallest unit; our catalog prices are whole rupees. */
export function toPaise(rupees: number) {
  return Math.round(rupees * 100);
}
