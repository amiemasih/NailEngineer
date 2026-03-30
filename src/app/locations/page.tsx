import type { Metadata } from "next";
import Link from "next/link";
import { MarketingLayout } from "@/components/MarketingLayout";

export const metadata: Metadata = {
  title: "Locations — Nail Engineer",
  description: "Where to find Nail Engineer in person—studio and pop-up details as they are announced.",
};

export default function LocationsPage() {
  return (
    <MarketingLayout
      title="Locations"
      intro="In-person services and events will be listed here with clear address and hours as they go live."
    >
      <p>
        Nail Engineer pairs online education with real-world booking. Online courses are available
        anywhere; studio visits, mobile-friendly scheduling, and pop-ups will show exact locations
        on this page when they are confirmed.
      </p>
      <p>
        Longer term, we are designing an in-person salon concept—The Mani-Cave—to normalize male
        nail care and create room for community. Announcements will appear on this page and in{" "}
        <Link href="/for-the-guys" className="font-semibold text-rose-800 hover:underline">
          For the Guys
        </Link>
        .
      </p>
      <div className="rounded-2xl border border-dashed border-cream-300 bg-white p-8">
        <p className="font-display text-lg font-bold text-rose-900">Studio &amp; hours</p>
        <p className="mt-2 text-mauve-600">
          Address and hours will publish alongside the Book Online launch. For updates, reach out via{" "}
          <Link href="/contact" className="font-semibold text-rose-800 hover:underline">
            Contact
          </Link>
          .
        </p>
      </div>
    </MarketingLayout>
  );
}
