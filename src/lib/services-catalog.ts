import { formatUsd } from "@/lib/money";

export type ServicePricing =
  | { kind: "fixed"; amount: number }
  | { kind: "range"; min: number; max: number };

export type ServiceItem = {
  id: string;
  category: string;
  name: string;
  description: string;
  /** Approximate chair time — helps clients plan */
  durationMins?: number;
  pricing: ServicePricing;
  /** Shown under price, e.g. removal policy */
  footnote?: string;
};

/** Shown in the services footer for transparency */
export const PRICE_BOOK_UPDATED = "March 2026";

/**
 * Single source of truth for menu + base pricing.
 * Add rows or categories here as offerings grow—no page structure changes required.
 */
export const SERVICES: ServiceItem[] = [
  {
    id: "classic-mani",
    category: "Manicure & maintenance",
    name: "Classic manicure",
    description: "Shape, cuticle care, buff, massage, polish or high-shine finish.",
    durationMins: 45,
    pricing: { kind: "fixed", amount: 35 },
  },
  {
    id: "gel-polish",
    category: "Manicure & maintenance",
    name: "Gel polish (overlay)",
    description: "Gel color on natural nails with structured prep; includes removal guidance.",
    durationMins: 60,
    pricing: { kind: "fixed", amount: 55 },
  },
  {
    id: "mens-grooming",
    category: "Manicure & maintenance",
    name: "Men’s grooming manicure",
    description: "Trim, file, cuticle tidy, buff—no polish unless requested.",
    durationMins: 35,
    pricing: { kind: "fixed", amount: 32 },
  },
  {
    id: "structured-gel",
    category: "Gel & structure",
    name: "Structured gel (natural overlay)",
    description: "Light structure for strength while keeping a natural profile.",
    durationMins: 75,
    pricing: { kind: "fixed", amount: 68 },
  },
  {
    id: "gel-rebalance",
    category: "Gel & structure",
    name: "Gel maintenance / rebalance",
    description: "Fill, reshape, and color refresh for existing gel clients.",
    durationMins: 70,
    pricing: { kind: "fixed", amount: 60 },
  },
  {
    id: "nail-art-tier1",
    category: "Nail art",
    name: "Nail art — accent & simple design",
    description: "French variation, minimal line work, micro accents on 1–2 nails.",
    durationMins: 75,
    pricing: { kind: "range", min: 15, max: 35 },
    footnote: "Added to base service; final price depends on complexity.",
  },
  {
    id: "nail-art-tier2",
    category: "Nail art",
    name: "Nail art — full design",
    description: "Custom art, layering, foils, or multi-nail composition.",
    durationMins: 90,
    pricing: { kind: "range", min: 40, max: 120 },
    footnote: "Quoted at appointment after reference photos and nail length.",
  },
  {
    id: "natural-art-session",
    category: "Nail art",
    name: "Natural-nail art session",
    description: "Design-forward work on natural nails without extensions.",
    durationMins: 85,
    pricing: { kind: "range", min: 35, max: 95 },
  },
  {
    id: "add-paraffin",
    category: "Add-ons",
    name: "Paraffin treatment",
    description: "Warm dip after prep for dry or cold-season hands.",
    durationMins: 15,
    pricing: { kind: "fixed", amount: 12 },
  },
  {
    id: "add-strengthener",
    category: "Add-ons",
    name: "Strengthening treatment",
    description: "Targeted product layer for weak or peeling nails.",
    durationMins: 10,
    pricing: { kind: "fixed", amount: 10 },
  },
];

export function servicesByCategory(): Map<string, ServiceItem[]> {
  const map = new Map<string, ServiceItem[]>();
  for (const s of SERVICES) {
    const list = map.get(s.category) ?? [];
    list.push(s);
    map.set(s.category, list);
  }
  return map;
}

export function formatServicePrice(p: ServicePricing): string {
  if (p.kind === "fixed") return formatUsd(p.amount);
  return `${formatUsd(p.min)}–${formatUsd(p.max)}`;
}

export function getServiceById(id: string): ServiceItem | undefined {
  return SERVICES.find((s) => s.id === id);
}

/** Services that can be booked (must include duration). */
export const BOOKABLE_SERVICE_IDS = SERVICES.filter((s) => s.durationMins && s.durationMins > 0).map(
  (s) => s.id,
);
