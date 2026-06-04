export type ArchiveEntry = {
  id: string;
  /** 1–6 displayed as DESIGN 001 … DESIGN 006 */
  designNumber: number;
  /** Path under `public/`, add when assets exist */
  imageSrc?: string;
  imageAlt?: string;
  primaryLink?: { href: string };
};

export function formatDesignLabel(n: number): string {
  return `DESIGN ${String(n).padStart(3, "0")}`;
}

/**
 * Nail Archive portfolio. Featured images lead (7110, 8263, 7520, 5239, 1762,
 * 3644, 0519), then the rest. Photos live under `public/archive/`.
 */
export const ARCHIVE_ITEMS: ArchiveEntry[] = [
  { id: "d1", designNumber: 1, imageSrc: "/archive/img-7110.jpg" },
  { id: "d2", designNumber: 2, imageSrc: "/archive/img-8263.jpg" },
  { id: "d3", designNumber: 3, imageSrc: "/archive/img-7520.jpg" },
  { id: "d4", designNumber: 4, imageSrc: "/archive/img-5239.jpg" },
  { id: "d5", designNumber: 5, imageSrc: "/archive/img-1762.jpg" },
  { id: "d6", designNumber: 6, imageSrc: "/archive/img-3644.jpg" },
  { id: "d7", designNumber: 7, imageSrc: "/archive/img-0519.jpg" },
  { id: "d8", designNumber: 8, imageSrc: "/archive/img-0368.jpg" },
  { id: "d9", designNumber: 9, imageSrc: "/archive/img-0483.jpg" },
  { id: "d10", designNumber: 10, imageSrc: "/archive/img-1067.jpg" },
  { id: "d11", designNumber: 11, imageSrc: "/archive/img-1387.jpg" },
  { id: "d12", designNumber: 12, imageSrc: "/archive/img-3553.jpg" },
];
