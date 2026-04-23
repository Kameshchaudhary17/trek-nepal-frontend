/* Single money formatter — use everywhere we show a price.
   Currency is NPR (Nepalese Rupee). Prefix "Rs." matches local convention. */

export function formatNPR(n, { decimals = 0 } = {}) {
  if (n === null || n === undefined || Number.isNaN(Number(n))) return "—";
  const num = Number(n);
  return `Rs. ${num.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

export function formatNPRRange(min, max) {
  if (min === max) return formatNPR(min);
  return `${formatNPR(min)} – ${formatNPR(max)}`;
}
