// All money math happens in integer cents to avoid floating-point drift.

export const toCents = (value) => Math.round(Number(value || 0) * 100);
export const fromCents = (cents) => cents / 100;

const formatters = {};

export function formatMoney(value, currency = "EUR", { sign = false } = {}) {
  if (!formatters[currency]) {
    formatters[currency] = new Intl.NumberFormat("en-IE", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
  const n = Number(value || 0);
  const text = formatters[currency].format(Math.abs(n));
  if (!sign) return n < 0 ? `-${text}` : text;
  if (Math.abs(n) < 0.005) return text;
  return `${n > 0 ? "+" : "-"}${text}`;
}

export const formatCents = (cents, currency, opts) =>
  formatMoney(fromCents(cents), currency, opts);

/**
 * Split an amount (in cents) equally between `ids`.
 * Leftover cents go to the first people in the list, so the parts
 * always add up exactly to the total.
 */
export function splitEqually(totalCents, ids) {
  if (!ids.length) return {};
  const base = Math.floor(totalCents / ids.length);
  let remainder = totalCents - base * ids.length;
  const result = {};
  ids.forEach((id) => {
    result[id] = base + (remainder > 0 ? 1 : 0);
    if (remainder > 0) remainder -= 1;
  });
  return result;
}

/** Parse a user-typed amount like "12,50" or "12.5". Returns NaN when invalid. */
export function parseAmount(input) {
  if (typeof input === "number") return input;
  const cleaned = String(input || "").trim().replace(/\s/g, "").replace(",", ".");
  if (!/^\d+(\.\d{0,2})?$/.test(cleaned)) return NaN;
  return Number(cleaned);
}
