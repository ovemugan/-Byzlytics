export const fmt = {
  currency: (n) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(n),

  number: (n) => new Intl.NumberFormat("en-IN").format(Math.round(n)),

  percent: (n) => `${n.toFixed(1)}%`,

  short: (n) => {
    if (n >= 1_00_000) return `₹${(n / 1_00_000).toFixed(1)}L`
    if (n >= 1_000)   return `₹${(n / 1_000).toFixed(1)}K`
    return `₹${Math.round(n)}`
  },
}

export const stockStatusLabel = {
  good:         { label: "Good",         cls: "status-good" },
  medium:       { label: "Moderate",     cls: "status-medium" },
  low:          { label: "Low Stock",    cls: "status-low" },
  out_of_stock: { label: "Out of Stock", cls: "status-out" },
}
