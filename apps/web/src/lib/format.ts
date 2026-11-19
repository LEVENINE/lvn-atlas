const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function formatCurrency(value: string | number) {
  const amount = typeof value === "string" ? Number(value) : value;

  if (!Number.isFinite(amount)) {
    return "—";
  }

  return currencyFormatter.format(amount);
}

export function formatDate(value: string | null) {
  if (!value) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function formatHousehold(size: number) {
  return size === 1 ? "1 person" : `${size} people`;
}

export function pluralize(count: number, singular: string, plural: string) {
  return count === 1 ? singular : plural;
}
