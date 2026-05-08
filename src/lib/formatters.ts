export const currencySymbols: Record<string, string> = {
  USD: "$",
  PKR: "Rs",
  EUR: "€",
  GBP: "£",
  CAD: "$",
  AUD: "$",
  AED: "د.إ",
};

export function formatPrice(price: string, currency?: string | null) {
  const activeCurrency = currency || "USD";
  const symbol = currencySymbols[activeCurrency] || activeCurrency;

  return `${symbol} ${price}`;
}

export function formatDateWithTimezone(
  dateTime: string | null,
  timezone?: string | null
) {
  if (!dateTime) return "No date";

  return new Date(dateTime).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: timezone || "Asia/Karachi",
  });
}

export function formatTimeWithTimezone(
  dateTime: string | null,
  timezone?: string | null
) {
  if (!dateTime) return "No time";

  return new Date(dateTime).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: timezone || "Asia/Karachi",
  });
}