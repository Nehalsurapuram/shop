import { SITE } from "./site";

const formatter = new Intl.NumberFormat(SITE.locale, {
  style: "currency",
  currency: SITE.currency,
  maximumFractionDigits: 0,
});

export function formatPrice(paise: number) {
  return formatter.format(paise);
}

export function discountPercent(price: number, compareAt: number) {
  return Math.round(((compareAt - price) / compareAt) * 100);
}
