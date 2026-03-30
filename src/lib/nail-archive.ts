export type ArchiveEntry = {
  id: string;
  /** 1–6 displayed as DESIGN 001 … DESIGN 006 */
  designNumber: number;
  /** Path under `public/` — add when assets exist */
  imageSrc?: string;
  imageAlt?: string;
  primaryLink?: { href: string };
};

export function formatDesignLabel(n: number): string {
  return `DESIGN ${String(n).padStart(3, "0")}`;
}

/**
 * Six sample slots — set `imageSrc` under `public/archive/` when photos are ready.
 */
export const ARCHIVE_ITEMS: ArchiveEntry[] = [
  { id: "d1", designNumber: 1, primaryLink: { href: "/book" } },
  { id: "d2", designNumber: 2, primaryLink: { href: "/book" } },
  { id: "d3", designNumber: 3, primaryLink: { href: "/book" } },
  { id: "d4", designNumber: 4, primaryLink: { href: "/book" } },
  { id: "d5", designNumber: 5, primaryLink: { href: "/book" } },
  { id: "d6", designNumber: 6, primaryLink: { href: "/book" } },
];
