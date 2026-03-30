export type Promotion = {
  id: string;
  title: string;
  /** Short headline, e.g. "10% off" or "$10 off gel" */
  offerLabel: string;
  body: string;
  /** Who qualifies — student ID, org membership, etc. */
  eligibility: string;
  validFrom: string;
  validTo: string;
  /** Set false to hide without deleting */
  active: boolean;
  /** Optional: pin to top banner */
  featured?: boolean;
  /** For filtering / future user-specific rules */
  tags?: ("northwestern-student" | "d9-founders-day" | "general")[];
  /** Service IDs from services-catalog this applies to; omit = all services or see body text */
  applicableServiceIds?: string[];
};

/**
 * Time-bound and audience-specific offers.
 * Update dates, `active`, or copy here — the Services page reads this on every request
 * so windows and eligibility stay accurate without redeploying layout.
 */
export const PROMOTIONS: Promotion[] = [
  {
    id: "nw-student-2026",
    title: "Northwestern student pricing",
    offerLabel: "10% off select services",
    body: "Applies to classic manicure, gel polish overlay, and men’s grooming manicure when you show a valid Wildcard or current course schedule.",
    eligibility: "Northwestern University undergraduate or graduate students.",
    validFrom: "2026-01-01T06:00:00.000Z",
    validTo: "2027-08-31T23:59:59.999Z",
    active: true,
    featured: true,
    tags: ["northwestern-student"],
    applicableServiceIds: ["classic-mani", "gel-polish", "mens-grooming"],
  },
  {
    id: "d9-founders-2026",
    title: "D9 Founder’s Days",
    offerLabel: "Promotional menu pricing",
    body: "Limited window pricing on full-design nail art sessions and structured gel—see booking notes for the exact Founder’s Days menu.",
    eligibility: "Open to invited guests and D9 community during the published event window.",
    validFrom: "2026-09-01T05:00:00.000Z",
    validTo: "2026-09-07T23:59:59.999Z",
    active: true,
    tags: ["d9-founders-day"],
    applicableServiceIds: ["nail-art-tier2", "structured-gel"],
  },
  {
    id: "new-client-welcome",
    title: "First visit note",
    offerLabel: "$5 off first gel service",
    body: "One-time welcome for new booking clients when you mention this offer at checkout.",
    eligibility: "First-time Nail Engineer booking clients.",
    validFrom: "2026-01-01T06:00:00.000Z",
    validTo: "2026-12-31T23:59:59.999Z",
    active: true,
    tags: ["general"],
    applicableServiceIds: ["gel-polish"],
  },
];

export function isPromotionActive(p: Promotion, now = new Date()): boolean {
  if (!p.active) return false;
  const start = new Date(p.validFrom);
  const end = new Date(p.validTo);
  return now >= start && now <= end;
}

export function getActivePromotions(now = new Date()): Promotion[] {
  return PROMOTIONS.filter((p) => isPromotionActive(p, now));
}

export function getFeaturedPromotions(now = new Date()): Promotion[] {
  return getActivePromotions(now).filter((p) => p.featured);
}
