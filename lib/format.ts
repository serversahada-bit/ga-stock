const dtf = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatDateTime(d: Date | null | undefined): string {
  if (!d) return "-";
  return dtf.format(d);
}

const nf = new Intl.NumberFormat("id-ID");
export function formatNumber(n: number): string {
  return nf.format(n);
}
