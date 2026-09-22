export function toSlug(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function findAvailableSlug(
  value: string,
  isTaken: (slug: string) => Promise<boolean>,
): Promise<string> {
  const base = toSlug(value) || "item";
  let candidate = base;
  let suffix = 2;

  while (await isTaken(candidate)) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}

export function nextPropertyCode(codes: string[]): string {
  const highest = codes.reduce((current, code) => {
    const match = /^VAL-(\d+)$/.exec(code);
    return Math.max(current, match ? Number(match[1]) : 0);
  }, 0);

  return `VAL-${String(highest + 1).padStart(3, "0")}`;
}
