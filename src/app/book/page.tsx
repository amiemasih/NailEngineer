import type { Metadata } from "next";
import Link from "next/link";
import { BookingFlow } from "@/components/BookingFlow";
import { PAGE_TITLE_CLASS } from "@/lib/pageTitle";

export const metadata: Metadata = {
  title: "Book Online — Nail Engineer",
  description:
    "See Jayden’s live availability, pick a service and time, and confirm—slots respect buffers around classes and travel.",
};

export default function BookPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 sm:py-20">
      <h1 className={PAGE_TITLE_CLASS}>Book Online</h1>
      <p className="mt-4 text-lg text-mauve-600 leading-relaxed max-w-2xl">
        Choose a service, browse openings that already include Jayden’s travel and focus buffers, and
        lock a time. Availability refreshes whenever he updates his biweekly calendar—no DMs
        required.
      </p>
      <p className="mt-3 text-sm text-mauve-600 max-w-2xl">
        Looking for inspiration first?{" "}
        <Link href="/nail-archive" className="font-semibold text-rose-800 hover:underline">
          The Nail Archive
        </Link>{" "}
        ·{" "}
        <Link href="/services" className="font-semibold text-rose-800 hover:underline">
          Services &amp; Pricing
        </Link>
      </p>
      <div className="mt-12">
        <BookingFlow />
      </div>
    </div>
  );
}
